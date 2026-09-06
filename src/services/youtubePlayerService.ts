'use client';

/**
 * YouTube IFrame Playback Service for GULLYGANG
 * 
 * Migrated from reference GULLYGANG architecture.
 * Compliant YouTube embedded player API integration.
 * Strictly browser-compliant streaming without audio scraping or DRM bypass.
 */

export interface YTPlayerInstance {
  loadVideoById: (id: string, startSeconds?: number) => void;
  cueVideoById: (id: string, startSeconds?: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

export interface YTPlayerReadyEvent {
  target: YTPlayerInstance;
}

export interface YTPlayerStateEvent {
  data: number;
}

export interface YTPlayerErrorEvent {
  data: number;
}

export interface YTNamespace {
  Player: new (
    elementId: string,
    options: {
      height: string;
      width: string;
      videoId: string;
      host: string;
      playerVars: Record<string, unknown>;
      events: {
        onReady?: (e: YTPlayerReadyEvent) => void;
        onStateChange?: (e: YTPlayerStateEvent) => void;
        onError?: (e: YTPlayerErrorEvent) => void;
      };
    }
  ) => YTPlayerInstance;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

import { extractCleanYouTubeId } from '@/utils/cleanYouTubeId';
export { extractCleanYouTubeId };

export interface PlayerProgressData {
  currentTime: number;
  duration: number;
}

export type PlayerEventDataMap = {
  ready: void;
  play: void;
  pause: void;
  buffering: void;
  ended: void;
  timeupdate: PlayerProgressData;
  error: { code?: number; message?: string } | undefined;
};

export type PlayerEventType = keyof PlayerEventDataMap;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PlayerEventCallback<T = any> = (data: T) => void;

class YouTubePlayerService {
  private player: YTPlayerInstance | null = null;
  private isReady = false;
  private containerId = 'gg-yt-player';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners: Map<PlayerEventType, Set<PlayerEventCallback<any>>> = new Map();
  private progressTimer: NodeJS.Timeout | null = null;
  private currentVideoId: string | null = null;
  private pendingVideoId: string | null = null;
  private pendingPlay = false;
  private initialVolume = 0.8;
  private initialMuted = false;
  private manualNavTimestamp = 0;

  // Race condition & sequence tracking
  private playbackRequestId = 0;
  private apiPromise: Promise<void> | null = null;
  private playerReadyPromise: Promise<YTPlayerInstance> | null = null;
  private retryTimer: NodeJS.Timeout | null = null;
  private retryAttempted = false;

  constructor() {
    (['ready', 'play', 'pause', 'buffering', 'ended', 'timeupdate', 'error'] as PlayerEventType[]).forEach(
      (evt) => this.listeners.set(evt, new Set())
    );
  }

  /**
   * Event subscription
   */
  public on<K extends PlayerEventType>(event: K, callback: (data: PlayerEventDataMap[K]) => void): () => void {
    const set = this.listeners.get(event);
    if (set) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set.add(callback as PlayerEventCallback<any>);
    }
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set?.delete(callback as PlayerEventCallback<any>);
    };
  }

  private emit(event: PlayerEventType, data?: unknown) {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`[YTPlayerService] Error in ${event} listener:`, e);
        }
      });
    }
  }

  /**
   * Promise-based YouTube IFrame API script loader.
   * Ensures the <script> is injected at most once and resolves reliably.
   */
  public loadApi(): Promise<void> {
    if (typeof window === 'undefined') return Promise.reject(new Error('Window undefined'));
    if (window.YT && window.YT.Player) {
      return Promise.resolve();
    }
    if (this.apiPromise) {
      return this.apiPromise;
    }

    this.apiPromise = new Promise<void>((resolve, reject) => {
      // 10s load timeout safeguard
      const timeoutId = setTimeout(() => {
        reject(new Error('YouTube IFrame API script load timeout'));
      }, 10000);

      const onApiReady = () => {
        clearTimeout(timeoutId);
        resolve();
      };

      if (window.YT && window.YT.Player) {
        clearTimeout(timeoutId);
        resolve();
        return;
      }

      const prevOnReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevOnReady === 'function') {
          try {
            prevOnReady();
          } catch {}
        }
        onApiReady();
      };

      const existingScript = document.getElementById('gg-youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'gg-youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        tag.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error('Failed to load YouTube IFrame API script'));
        };
        document.head.appendChild(tag);
      }
    });

    return this.apiPromise;
  }

  /**
   * Initializes player preferences and starts player creation if ready.
   */
  public init(containerElementId = 'gg-yt-player', initialVolume = 0.8, isMuted = false) {
    if (typeof window === 'undefined') return;
    this.containerId = containerElementId;
    this.initialVolume = initialVolume;
    this.initialMuted = isMuted;

    if (this.player && this.isReady) return;
    this.ensurePlayerReady().catch(() => {});
  }

  /**
   * Ensures the singleton YT.Player instance is instantiated and reaches the onReady state.
   */
  private ensurePlayerReady(): Promise<YTPlayerInstance> {
    if (typeof window === 'undefined') return Promise.reject(new Error('Window undefined'));
    if (this.isReady && this.player) {
      return Promise.resolve(this.player);
    }
    if (this.playerReadyPromise) {
      return this.playerReadyPromise;
    }

    this.playerReadyPromise = new Promise<YTPlayerInstance>((resolve, reject) => {
      const readyTimeout = setTimeout(() => {
        if (this.player) {
          this.isReady = true;
          resolve(this.player);
        } else {
          this.playerReadyPromise = null;
          reject(new Error('YouTube player ready timeout'));
        }
      }, 10000);

      this.loadApi()
        .then(() => {
          const targetEl = document.getElementById(this.containerId);
          if (!targetEl) {
            clearTimeout(readyTimeout);
            this.playerReadyPromise = null;
            reject(new Error(`Container #${this.containerId} not found in DOM`));
            return;
          }

          if (this.player) {
            clearTimeout(readyTimeout);
            resolve(this.player);
            return;
          }

          const initialVideoId =
            this.pendingVideoId && /^[A-Za-z0-9_-]{11}$/.test(this.pendingVideoId)
              ? this.pendingVideoId
              : 'HmW1wIhyCng';

          try {
            this.player = new window.YT!.Player(this.containerId, {
              height: '200',
              width: '200',
              videoId: initialVideoId,
              host: 'https://www.youtube.com',
              playerVars: {
                autoplay: 1,
                controls: 0,
                disablekb: 1,
                enablejsapi: 1,
                fs: 0,
                modestbranding: 1,
                playsinline: 1,
                rel: 0,
                origin: window.location.origin,
              },
              events: {
                onReady: (e) => {
                  clearTimeout(readyTimeout);
                  this.handlePlayerReady(e);
                  resolve(e.target);
                },
                onStateChange: (e) => this.handleStateChange(e),
                onError: (e) => {
                  this.handleError(e);
                },
              },
            });
          } catch (err) {
            clearTimeout(readyTimeout);
            this.playerReadyPromise = null;
            reject(err);
          }
        })
        .catch((err) => {
          clearTimeout(readyTimeout);
          this.playerReadyPromise = null;
          reject(err);
        });
    });

    return this.playerReadyPromise;
  }

  private handlePlayerReady(event: YTPlayerReadyEvent) {
    this.isReady = true;
    try {
      if (this.initialMuted) {
        event.target.mute();
      } else {
        event.target.unMute();
        event.target.setVolume(Math.round(this.initialVolume * 100));
      }
    } catch {
      // Ignore initial setup exceptions
    }

    this.emit('ready');
  }

  private handleStateChange(event: YTPlayerStateEvent) {
    const pState = event ? event.data : -1;

    if (pState === 1) {
      // PLAYING
      this.clearRetryTimer();
      this.emit('play');
      this.startProgressTracker();
    } else if (pState === 2) {
      // PAUSED
      this.emit('pause');
      this.stopProgressTracker();
      this.emitTimeUpdate();
    } else if (pState === 3) {
      // BUFFERING
      this.emit('buffering');
    } else if (pState === 0) {
      // ENDED
      const timeSinceManualNav = Date.now() - this.manualNavTimestamp;
      if (timeSinceManualNav < 1200) {
        return;
      }
      this.stopProgressTracker();
      this.emit('ended');
    } else if (pState === 5 || pState === -1) {
      // CUED (5) or UNSTARTED (-1):
      // If playback was requested, start playback immediately
      if (this.pendingPlay && this.player && typeof this.player.playVideo === 'function') {
        try {
          this.player.playVideo();
        } catch {}
      }
    }
  }

  private handleError(event: YTPlayerErrorEvent) {
    const errorCode = event ? event.data : -1;
    this.stopProgressTracker();
    this.clearRetryTimer();

    let message = 'Playback unavailable for this track';
    if (errorCode === 101 || errorCode === 150) {
      message = 'Playback restricted by content owner for this track';
    } else if (errorCode === 100) {
      message = 'Track not found on YouTube';
    } else if (errorCode === 2) {
      message = 'Invalid video ID';
    }

    this.emit('error', { code: errorCode, message });
  }

  /**
   * Watchdog timer: If playback fails to start within 1500ms after load,
   * safely retry playVideo() once to overcome transient browser autoplay blocks.
   */
  private schedulePlaybackWatchdog(videoId: string, requestId: number) {
    this.clearRetryTimer();
    this.retryTimer = setTimeout(() => {
      if (this.playbackRequestId !== requestId) return;
      if (this.currentVideoId !== videoId) return;

      const isCurrentlyPlaying =
        this.player && typeof this.player.getPlayerState === 'function' && this.player.getPlayerState() === 1;

      if (!isCurrentlyPlaying && !this.retryAttempted && this.player) {
        this.retryAttempted = true;
        try {
          if (typeof this.player.unMute === 'function' && !this.initialMuted) {
            this.player.unMute();
          }
          if (typeof this.player.playVideo === 'function') {
            this.player.playVideo();
          }
        } catch {}
      }
    }, 1500);
  }

  private clearRetryTimer() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  /**
   * Main track loader:
   * 1. Sets sequence request ID to guard against rapid song switching.
   * 2. Asynchronously ensures the singleton YouTube player is created and ready.
   * 3. Loads the video ID and explicitly calls playVideo().
   * 4. Schedules a watchdog to retry if autoplay was stalled.
   */
  public async loadTrack(videoId: string, autoPlay = true): Promise<void> {
    const cleanId = extractCleanYouTubeId(videoId);
    if (!cleanId) return;

    const requestId = ++this.playbackRequestId;
    this.manualNavTimestamp = Date.now();
    this.currentVideoId = cleanId;
    this.pendingVideoId = cleanId;
    this.pendingPlay = autoPlay;
    this.retryAttempted = false;
    this.clearRetryTimer();

    try {
      const player = await this.ensurePlayerReady();

      // Check if a newer track request superseded this one while player was initializing
      if (this.playbackRequestId !== requestId) {
        return;
      }

      if (autoPlay) {
        if (typeof player.loadVideoById === 'function') {
          player.loadVideoById(cleanId, 0);
        } else if (typeof player.cueVideoById === 'function') {
          player.cueVideoById(cleanId, 0);
        }

        // Explicitly trigger playVideo after loading
        if (typeof player.playVideo === 'function') {
          player.playVideo();
        }

        // Arm the playback watchdog
        this.schedulePlaybackWatchdog(cleanId, requestId);
      } else {
        if (typeof player.cueVideoById === 'function') {
          player.cueVideoById(cleanId, 0);
        }
      }
    } catch (err) {
      if (this.playbackRequestId === requestId) {
        console.warn('[YTPlayerService] Failed to load track:', err);
        const errorMsg = err instanceof Error ? err.message : 'Failed to initialize player';
        this.emit('error', { code: -1, message: errorMsg });
      }
    }
  }

  public play() {
    this.pendingPlay = true;
    if (!this.isReady || !this.player) {
      if (this.currentVideoId) {
        this.loadTrack(this.currentVideoId, true);
      } else {
        this.ensurePlayerReady()
          .then((player) => {
            if (typeof player.playVideo === 'function') {
              player.playVideo();
            }
          })
          .catch(() => {});
      }
      return;
    }
    try {
      if (typeof this.player.playVideo === 'function') {
        this.player.playVideo();
      }
    } catch (err) {
      console.warn('[YTPlayerService] playVideo error:', err);
    }
  }

  public pause() {
    this.pendingPlay = false;
    this.clearRetryTimer();
    if (!this.isReady || !this.player) return;
    try {
      if (typeof this.player.pauseVideo === 'function') {
        this.player.pauseVideo();
      }
    } catch (err) {
      console.warn('[YTPlayerService] pauseVideo error:', err);
    }
  }

  public seekTo(seconds: number) {
    if (!this.isReady || !this.player) return;
    try {
      const dur = this.getDuration();
      const safe = Math.max(0, Math.min(dur > 0 ? dur : seconds, seconds));
      if (typeof this.player.seekTo === 'function') {
        this.player.seekTo(safe, true);
        this.emitTimeUpdate();
      }
    } catch (err) {
      console.warn('[YTPlayerService] seekTo error:', err);
    }
  }

  public setVolume(volume: number) {
    this.initialVolume = volume;
    if (!this.isReady || !this.player) return;
    try {
      const vol = Math.max(0, Math.min(100, Math.round(volume * 100)));
      if (typeof this.player.setVolume === 'function') {
        this.player.setVolume(vol);
      }
    } catch (err) {
      console.warn('[YTPlayerService] setVolume error:', err);
    }
  }

  public setMuted(muted: boolean) {
    this.initialMuted = muted;
    if (!this.isReady || !this.player) return;
    try {
      if (typeof this.player.mute === 'function' && typeof this.player.unMute === 'function') {
        if (muted) {
          this.player.mute();
        } else {
          this.player.unMute();
          this.setVolume(this.initialVolume);
        }
      }
    } catch (err) {
      console.warn('[YTPlayerService] setMuted error:', err);
    }
  }

  public getCurrentTime(): number {
    if (!this.isReady || !this.player) return 0;
    try {
      if (typeof this.player.getCurrentTime === 'function') {
        return this.player.getCurrentTime() || 0;
      }
    } catch {
      // Ignored
    }
    return 0;
  }

  public getDuration(): number {
    if (!this.isReady || !this.player) return 0;
    try {
      if (typeof this.player.getDuration === 'function') {
        return this.player.getDuration() || 0;
      }
    } catch {
      // Ignored
    }
    return 0;
  }

  private emitTimeUpdate() {
    const cur = this.getCurrentTime();
    const dur = this.getDuration();
    this.emit('timeupdate', { currentTime: cur, duration: dur });
  }

  private startProgressTracker() {
    this.stopProgressTracker();
    if (typeof document !== 'undefined' && document.hidden) return;

    this.emitTimeUpdate();

    const isMobile =
      typeof window !== 'undefined' &&
      (window.innerWidth < 768 || (navigator.maxTouchPoints && navigator.maxTouchPoints > 1));
    const intervalMs = isMobile ? 350 : 250;

    this.progressTimer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      this.emitTimeUpdate();
    }, intervalMs);
  }

  private stopProgressTracker() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  public destroy() {
    this.stopProgressTracker();
    this.clearRetryTimer();
    if (this.player && typeof this.player.destroy === 'function') {
      try {
        this.player.destroy();
      } catch {
        // Ignored
      }
    }
    this.player = null;
    this.isReady = false;
    this.apiPromise = null;
    this.playerReadyPromise = null;
  }
}

export const youtubePlayerService = new YouTubePlayerService();
