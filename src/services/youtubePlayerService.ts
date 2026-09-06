'use client';

/**
 * YouTube IFrame Playback Service for GULLYGANG
 * 
 * Migrated from reference GULLYGANG architecture (app.js).
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
  error: number | undefined;
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
  private apiPreloaded = false;

  constructor() {
    (['ready', 'play', 'pause', 'buffering', 'ended', 'timeupdate', 'error'] as PlayerEventType[]).forEach(
      (evt) => this.listeners.set(evt, new Set())
    );
  }

  /**
   * Performance: injects ONLY the YouTube IFrame API script — no YT.Player instance
   * is created. Intended to be called after a meaningful user interaction (never
   * during initial page render) so the first Play press starts faster without
   * making YouTube a blocking dependency of the initial page load.
   */
  public preloadApi() {
    if (typeof window === 'undefined' || this.apiPreloaded || this.player) return;
    if (window.YT && window.YT.Player) {
      this.apiPreloaded = true;
      return;
    }
    if (document.getElementById('gg-youtube-iframe-api')) {
      this.apiPreloaded = true;
      return;
    }
    this.apiPreloaded = true;
    const tag = document.createElement('script');
    tag.id = 'gg-youtube-iframe-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    document.head.appendChild(tag);
  }

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

  public init(containerElementId = 'gg-yt-player', initialVolume = 0.8, isMuted = false) {
    if (typeof window === 'undefined') return;
    this.containerId = containerElementId;
    this.initialVolume = initialVolume;
    this.initialMuted = isMuted;

    if (this.player) return;

    if (window.YT && window.YT.Player) {
      this.createPlayer();
    } else {
      // Reuse a preloaded script tag if present (see preloadApi), otherwise inject it now.
      this.preloadApi();

      const prevOnReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevOnReady) prevOnReady();
        this.createPlayer();
      };
    }
  }

  /**
   * Lazy initialization guarantee: the singleton player is ONLY created when
   * playback is actually requested (first Play press / first loadTrack call).
   * Nothing here runs during application mount or initial page render.
   */
  private ensureInitialized() {
    if (typeof window === 'undefined') return;
    if (this.player || this.isReady) return;
    const { volume, isMuted } = { volume: this.initialVolume, isMuted: this.initialMuted };
    this.init(this.containerId, volume, isMuted);
  }

  private createPlayer() {
    if (typeof window === 'undefined' || !window.YT || !window.YT.Player) return;
    const targetEl = document.getElementById(this.containerId);
    if (!targetEl) return;

    try {
      this.player = new window.YT.Player(this.containerId, {
        height: '180',
        width: '320',
        videoId: this.pendingVideoId || 'thS3-dmUvlg', // Default initial seed
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: 0,
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
          onReady: (e) => this.handlePlayerReady(e),
          onStateChange: (e) => this.handleStateChange(e),
          onError: (e) => this.handleError(e),
        },
      });
    } catch (err) {
      console.warn('[YTPlayerService] Failed to create YT.Player instance:', err);
    }
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

    if (this.pendingVideoId) {
      const vid = this.pendingVideoId;
      const shouldPlay = this.pendingPlay;
      this.pendingVideoId = null;
      this.pendingPlay = false;
      this.loadTrack(vid, shouldPlay);
    }
  }

  private handleStateChange(event: YTPlayerStateEvent) {
    const pState = event ? event.data : -1;

    if (pState === 1) {
      // PLAYING
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
      // Guard against stale ended events from rapid manual navigation
      const timeSinceManualNav = Date.now() - this.manualNavTimestamp;
      if (timeSinceManualNav < 1200) {
        return;
      }
      this.stopProgressTracker();
      this.emit('ended');
    }
  }

  private handleError(event: YTPlayerErrorEvent) {
    const errorCode = event ? event.data : -1;
    this.stopProgressTracker();
    this.emit('error', { code: errorCode });
  }

  public loadTrack(videoId: string, autoPlay = true) {
    const cleanId = extractCleanYouTubeId(videoId);
    if (!cleanId) return;

    this.manualNavTimestamp = Date.now();
    this.currentVideoId = cleanId;

    if (!this.isReady || !this.player) {
      this.pendingVideoId = cleanId;
      this.pendingPlay = autoPlay;
      // Lazy init: first user-initiated playback is what creates the player.
      this.ensureInitialized();
      return;
    }

    try {
      if (autoPlay) {
        if (typeof this.player.loadVideoById === 'function') {
          this.player.loadVideoById(cleanId, 0);
        } else if (typeof this.player.cueVideoById === 'function') {
          this.player.cueVideoById(cleanId, 0);
          this.player.playVideo();
        }
      } else {
        if (typeof this.player.cueVideoById === 'function') {
          this.player.cueVideoById(cleanId, 0);
        }
      }
    } catch (err) {
      console.warn('[YTPlayerService] Error loading video:', err);
    }
  }

  public play() {
    if (!this.isReady || !this.player) {
      this.pendingPlay = true;
      // Lazy init: safety net so a Play press always boots the singleton player.
      this.ensureInitialized();
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
    if (this.player && typeof this.player.destroy === 'function') {
      try {
        this.player.destroy();
      } catch {
        // Ignored
      }
    }
    this.player = null;
    this.isReady = false;
  }
}

export const youtubePlayerService = new YouTubePlayerService();
