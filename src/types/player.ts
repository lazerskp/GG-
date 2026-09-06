import { Song } from './music';

export type RepeatMode = 'off' | 'all' | 'one';
export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'unavailable' | 'error';

/** Unified right-side player panel mode (Lyrics and Queue share one panel) */
export type RightPanelMode = 'lyrics' | 'queue' | null;

export interface PlayerState {
  currentTrack: Song | null;
  // Two-tier Queue: Manual User Queue vs. Related Recommendations
  queue: Song[];
  queueIndex: number;
  relatedQueue: Song[];
  isLoadingRelated: boolean;
  hasMoreRelated: boolean;
  relatedContinuation: string | null;

  isPlaying: boolean;
  playbackStatus: PlaybackStatus;
  playbackError: string | null;
  currentTime: number;
  duration: number;
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
  isShuffleEnabled: boolean;
  repeatMode: RepeatMode;
  isMobileFullscreenOpen: boolean;
  isFullscreenOpen: boolean;
  rightPanelMode: RightPanelMode;
  isReady: boolean;
  artworkPalette?: {
    dominant: string;
    secondary: string;
    accent: string;
    darkBase: string;
  };

  // Actions
  playTrack: (track: Song, queueContext?: Song[], preserveRelated?: boolean) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  setMobileFullscreenOpen: (open: boolean) => void;
  setIsFullscreenOpen: (open: boolean) => void;
  setRightPanelMode: (mode: RightPanelMode) => void;
  closeRightPanel: () => void;
  addToQueue: (track: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  fetchRelated: (videoId: string, append?: boolean) => Promise<void>;
  fetchMoreRelated: () => Promise<void>;
  removeFromRelatedQueue: (index: number) => void;
  clearRelatedQueue: () => void;
  updatePlaybackProgress: (currentTime: number, duration?: number) => void;
  setPlaybackStatus: (status: PlaybackStatus, error?: string | null) => void;
  setReady: (ready: boolean) => void;
  setArtworkPalette: (palette: { dominant: string; secondary: string; accent: string; darkBase: string }) => void;
}
