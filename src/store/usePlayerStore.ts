import { create } from 'zustand';
import { Song } from '@/types/music';
import { PlayerState, RepeatMode, PlaybackStatus, RightPanelMode } from '@/types/player';
import { youtubePlayerService, extractCleanYouTubeId } from '@/services/youtubePlayerService';
import { extractPaletteFromArtwork, applyArtworkPalette } from '@/utils/artworkColorEngine';

const STORAGE_KEYS = {
  VOLUME: 'gullygang_player_volume',
  SHUFFLE: 'gullygang_shuffle',
  REPEAT: 'gullygang_repeat',
  QUEUE: 'gullygang_queue',
  CURRENT_INDEX: 'gullygang_current_index',
};

function getStoredNumber(key: string, defaultVal: number): number {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const val = parseFloat(localStorage.getItem(key) || '');
    return !isNaN(val) && val >= 0 && val <= 1 ? val : defaultVal;
  } catch {
    return defaultVal;
  }
}

function getStoredBoolean(key: string, defaultVal: boolean): boolean {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val === 'true' : defaultVal;
  } catch {
    return defaultVal;
  }
}

function getStoredRepeatMode(key: string, defaultVal: RepeatMode): RepeatMode {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const val = localStorage.getItem(key);
    if (val === 'off' || val === 'all' || val === 'one') return val;
    return defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStorageItem(key: string, value: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {}
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  relatedQueue: [],
  isLoadingRelated: false,
  hasMoreRelated: true,
  relatedContinuation: null,
  isPlaying: false,
  isReady: false,
  playbackStatus: 'idle',
  playbackError: null,
  currentTime: 0,
  duration: 0,
  volume: getStoredNumber(STORAGE_KEYS.VOLUME, 0.8),
  isMuted: false,
  isShuffleEnabled: getStoredBoolean(STORAGE_KEYS.SHUFFLE, false),
  repeatMode: getStoredRepeatMode(STORAGE_KEYS.REPEAT, 'all'),
  isMobileFullscreenOpen: false,
  isFullscreenOpen: false,
  rightPanelMode: null,
  artworkPalette: undefined,

  playTrack: (track: Song, queueContext?: Song[], preserveRelated: boolean = false) => {
    let newQueue = get().queue;
    let newIndex = 0;

    if (queueContext && queueContext.length > 0) {
      newQueue = queueContext;
      const idx = queueContext.findIndex((t) => t.id === track.id);
      newIndex = idx !== -1 ? idx : 0;
    } else if (newQueue.length === 0 || !newQueue.some((t) => t.id === track.id)) {
      newQueue = [track];
      newIndex = 0;
    } else {
      newIndex = newQueue.findIndex((t) => t.id === track.id);
    }

    const cleanId = extractCleanYouTubeId(track.id);
    const isPlayable = Boolean(cleanId && cleanId.length >= 8);

    // Persist track index
    setStorageItem(STORAGE_KEYS.CURRENT_INDEX, String(newIndex));

    if (!isPlayable) {
      set({
        currentTrack: track,
        queue: newQueue,
        queueIndex: newIndex,
        isPlaying: false,
        playbackStatus: 'unavailable',
        playbackError: 'Playback unavailable for this track',
        currentTime: 0,
        duration: track.duration,
      });
      return;
    }

    // Load track into YouTube Playback Provider
    youtubePlayerService.loadTrack(cleanId, true);

    // Extract dynamic artwork palette asynchronously
    if (track.artworkUrl) {
      extractPaletteFromArtwork(track.artworkUrl, track.id).then((palette) => {
        applyArtworkPalette(palette);
        set({ artworkPalette: palette });
      });
    }

    set({
      currentTrack: track,
      queue: newQueue,
      queueIndex: newIndex,
      isPlaying: true,
      playbackStatus: 'loading',
      playbackError: null,
      currentTime: 0,
      duration: track.duration,
    });

    // Auto-fetch related recommendations for newly played context (unless advancing through relatedQueue)
    if (!preserveRelated) {
      set({ relatedQueue: [], relatedContinuation: null, hasMoreRelated: true });
      get().fetchRelated(cleanId, false);
    }
  },

  togglePlay: () => {
    const { currentTrack, isPlaying, playbackStatus } = get();
    if (!currentTrack) return;

    if (playbackStatus === 'unavailable') {
      return;
    }

    if (isPlaying) {
      youtubePlayerService.pause();
      set({ isPlaying: false, playbackStatus: 'paused' });
    } else {
      youtubePlayerService.play();
      set({ isPlaying: true, playbackStatus: 'playing' });
    }
  },

  pause: () => {
    youtubePlayerService.pause();
    set({ isPlaying: false, playbackStatus: 'paused' });
  },

  resume: () => {
    const { currentTrack, playbackStatus } = get();
    if (currentTrack && playbackStatus !== 'unavailable') {
      youtubePlayerService.play();
      set({ isPlaying: true, playbackStatus: 'playing' });
    }
  },

  nextTrack: () => {
    const { queue, queueIndex, relatedQueue, isShuffleEnabled, repeatMode } = get();
    if (queue.length === 0 && relatedQueue.length === 0) return;

    if (repeatMode === 'one') {
      youtubePlayerService.seekTo(0);
      youtubePlayerService.play();
      set({ currentTime: 0, isPlaying: true, playbackStatus: 'playing' });
      return;
    }

    // 1. User queue has more tracks
    if (queueIndex + 1 < queue.length) {
      let nextIdx: number;
      if (isShuffleEnabled && queue.length > 1) {
        do {
          nextIdx = Math.floor(Math.random() * queue.length);
        } while (nextIdx === queueIndex && queue.length > 1);
      } else {
        nextIdx = queueIndex + 1;
      }
      const nextSong = queue[nextIdx];
      if (nextSong) {
        get().playTrack(nextSong, queue, true);
      }
      return;
    }

    // 2. User queue is finished -> Advance seamlessly into Related Queue
    if (relatedQueue.length > 0) {
      const nextSong = relatedQueue[0];
      const remainingRelated = relatedQueue.slice(1);
      set({ relatedQueue: remainingRelated });
      get().playTrack(nextSong, undefined, true);

      // Auto-replenish if running low
      if (remainingRelated.length <= 5) {
        get().fetchMoreRelated();
      }
      return;
    }

    // 3. Queue & Related finished -> check repeat mode
    if (repeatMode === 'all' && queue.length > 0) {
      const firstSong = queue[0];
      if (firstSong) {
        get().playTrack(firstSong, queue, true);
      }
      return;
    }

    // End of queue with repeat off
    youtubePlayerService.pause();
    set({ isPlaying: false, playbackStatus: 'idle', currentTime: 0 });
  },

  previousTrack: () => {
    const { queue, queueIndex, currentTime } = get();
    if (queue.length === 0) return;

    // If more than 3 seconds in, restart current track
    if (currentTime > 3) {
      youtubePlayerService.seekTo(0);
      set({ currentTime: 0 });
      return;
    }

    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }

    const prevSong = queue[prevIdx];
    if (prevSong) {
      get().playTrack(prevSong, queue, true);
    }
  },

  seek: (time: number) => {
    const { duration } = get();
    const clamped = Math.max(0, Math.min(time, duration || 0));
    youtubePlayerService.seekTo(clamped);
    set({ currentTime: clamped });
  },

  setVolume: (vol: number) => {
    const clamped = Math.max(0, Math.min(vol, 1));
    youtubePlayerService.setVolume(clamped);
    setStorageItem(STORAGE_KEYS.VOLUME, String(clamped));
    set({ volume: clamped, isMuted: clamped === 0 });
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    const newMuted = !isMuted;
    youtubePlayerService.setMuted(newMuted);
    if (!newMuted && volume === 0) {
      youtubePlayerService.setVolume(0.8);
      set({ isMuted: false, volume: 0.8 });
    } else {
      set({ isMuted: newMuted });
    }
  },

  toggleShuffle: () => {
    const nextShuffle = !get().isShuffleEnabled;
    setStorageItem(STORAGE_KEYS.SHUFFLE, String(nextShuffle));
    set({ isShuffleEnabled: nextShuffle });
  },

  cycleRepeatMode: () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const current = get().repeatMode;
    const nextIdx = (modes.indexOf(current) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setStorageItem(STORAGE_KEYS.REPEAT, nextMode);
    set({ repeatMode: nextMode });
  },

  setMobileFullscreenOpen: (open: boolean) => {
    set({ isMobileFullscreenOpen: open, isFullscreenOpen: open });
  },

  setIsFullscreenOpen: (open: boolean) => {
    set({ isFullscreenOpen: open, isMobileFullscreenOpen: open });
  },

  setRightPanelMode: (mode: RightPanelMode) => {
    set({ rightPanelMode: mode });
  },

  closeRightPanel: () => {
    set({ rightPanelMode: null });
  },

  addToQueue: (track: Song) => {
    set((state) => ({
      queue: [...state.queue, track],
      // Remove from relatedQueue if present to avoid duplicate
      relatedQueue: state.relatedQueue.filter((t) => t.id !== track.id),
    }));
  },

  removeFromQueue: (index: number) => {
    set((state) => ({
      queue: state.queue.filter((_, idx) => idx !== index),
    }));
  },

  clearQueue: () => {
    set({ queue: [], queueIndex: 0 });
  },

  removeFromRelatedQueue: (index: number) => {
    set((state) => ({
      relatedQueue: state.relatedQueue.filter((_, idx) => idx !== index),
    }));
  },

  clearRelatedQueue: () => {
    set({ relatedQueue: [] });
  },

  fetchRelated: async (videoId: string, append: boolean = false) => {
    const cleanId = extractCleanYouTubeId(videoId);
    if (!cleanId || cleanId.length < 5) return;

    const { isLoadingRelated, relatedContinuation, currentTrack, queue, relatedQueue } = get();
    if (isLoadingRelated) return;

    set({ isLoadingRelated: true });

    try {
      const params = new URLSearchParams({ limit: '20' });
      if (append && relatedContinuation) {
        params.set('continuation', relatedContinuation);
      }

      const res = await fetch(`/api/related/${encodeURIComponent(cleanId)}?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch related tracks');

      const data = await res.json();
      const rawTracks: Song[] = Array.isArray(data.tracks) ? data.tracks : [];

      // Deduplicate with videoId Set across current track, manual queue, and existing related queue
      const seenIds = new Set<string>();
      if (currentTrack) {
        const curClean = extractCleanYouTubeId(currentTrack.id);
        if (curClean) seenIds.add(curClean);
      }
      queue.forEach((t) => {
        const qClean = extractCleanYouTubeId(t.id);
        if (qClean) seenIds.add(qClean);
      });
      if (append) {
        relatedQueue.forEach((t) => {
          const rClean = extractCleanYouTubeId(t.id);
          if (rClean) seenIds.add(rClean);
        });
      }

      const freshTracks = rawTracks.filter((t) => {
        const tClean = extractCleanYouTubeId(t.id);
        if (!tClean || seenIds.has(tClean)) return false;
        seenIds.add(tClean);
        return true;
      });

      set((state) => ({
        relatedQueue: append ? [...state.relatedQueue, ...freshTracks] : freshTracks,
        isLoadingRelated: false,
        hasMoreRelated: Boolean(data.continuation && (freshTracks.length > 0 || rawTracks.length > 0)),
        relatedContinuation: data.continuation || null,
      }));
    } catch (err) {
      console.warn('[usePlayerStore] Error fetching related songs:', err);
      set({ isLoadingRelated: false });
    }
  },

  fetchMoreRelated: async () => {
    const { relatedQueue, currentTrack, isLoadingRelated, hasMoreRelated, relatedContinuation } = get();
    if (isLoadingRelated || !hasMoreRelated) return;

    // When continuation token is present, YouTube Music requires the original videoId
    // to which the token was issued. If no token, fall back to seeding from last related track.
    const seedId =
      relatedContinuation && currentTrack?.id
        ? currentTrack.id
        : relatedQueue.length > 0
        ? relatedQueue[relatedQueue.length - 1].id
        : currentTrack?.id;

    if (seedId) {
      await get().fetchRelated(seedId, true);
    }
  },

  updatePlaybackProgress: (currentTime: number, duration?: number) => {
    set((state) => ({
      currentTime,
      duration: duration !== undefined && duration > 0 ? duration : state.duration,
    }));
  },

  setPlaybackStatus: (status: PlaybackStatus, error?: string | null) => {
    set({
      playbackStatus: status,
      playbackError: error !== undefined ? error : null,
      isPlaying: status === 'playing',
    });
  },

  setReady: (ready: boolean) => {
    set({ isReady: ready });
  },

  setArtworkPalette: (palette: { dominant: string; secondary: string; accent: string; darkBase: string }) => {
    set({ artworkPalette: palette });
  },
}));
