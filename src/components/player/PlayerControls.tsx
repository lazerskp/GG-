'use client';

import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Loader2,
} from 'lucide-react';

interface PlayerControlsProps {
  isPlaying: boolean;
  playbackStatus: string;
  isShuffleEnabled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  size?: 'compact' | 'sm' | 'lg';
}

/**
 * Shared transport controls (shuffle / previous / play / next / repeat).
 * Pure presentation — all behaviour comes from the existing player store.
 */
export function PlayerControls({
  isPlaying,
  playbackStatus,
  isShuffleEnabled,
  repeatMode,
  onTogglePlay,
  onPrevious,
  onNext,
  onToggleShuffle,
  onCycleRepeat,
  size = 'sm',
}: PlayerControlsProps) {
  const isStreamUnavailable = playbackStatus === 'unavailable';
  const isLoading = playbackStatus === 'loading';
  const isActualPlaying = isPlaying && playbackStatus === 'playing';

  const isCompact = size === 'compact';
  const isLarge = size === 'lg';
  const iconClass = isLarge ? 'w-5 h-5' : isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const playButtonClass = isLarge ? 'w-12 h-12' : isCompact ? 'w-9 h-9 sm:w-10 sm:h-10' : 'w-11 h-11';
  const playIconClass = isLarge ? 'w-5 h-5' : isCompact ? 'w-4 h-4' : 'w-4 h-4';

  return (
    <div className={`flex items-center justify-center select-none shrink-0 ${isCompact ? 'gap-0.5 sm:gap-1' : 'gap-1 sm:gap-1.5'}`}>
      {/* 1. Shuffle (hidden on smaller viewports to prioritize core playback) */}
      <button
        onClick={onToggleShuffle}
        className={`hidden xl:inline-flex w-8 h-8 items-center justify-center rounded-full transition-all ${
          isShuffleEnabled
            ? 'text-rose-400 bg-rose-500/15 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
            : 'text-[#8F8F8F] hover:text-white hover:bg-white/[0.06]'
        }`}
        aria-label="Toggle shuffle"
        title={isShuffleEnabled ? 'Shuffle enabled' : 'Shuffle disabled'}
      >
        <Shuffle className={iconClass} />
      </button>

      {/* 2. Previous */}
      <button
        onClick={onPrevious}
        className="w-8 h-8 flex items-center justify-center rounded-full text-[#D4D4D4] hover:text-white hover:bg-white/[0.06] transition-colors active:scale-90"
        aria-label="Previous track"
        title="Previous"
      >
        <SkipBack className={`${iconClass} fill-current`} />
      </button>

      {/* 3. Play / Pause (Primary visual control) */}
      <button
        onClick={onTogglePlay}
        disabled={isStreamUnavailable}
        className={`${playButtonClass} rounded-full flex items-center justify-center transition-all active:scale-95 ${
          isStreamUnavailable
            ? 'bg-white/15 text-white/60 cursor-not-allowed'
            : 'bg-white text-black hover:scale-[1.05] shadow-[0_2px_12px_rgba(255,255,255,0.2)]'
        }`}
        aria-label={isActualPlaying ? 'Pause' : 'Play'}
        title={isStreamUnavailable ? 'Playback unavailable' : isActualPlaying ? 'Pause' : 'Play'}
      >
        {isLoading ? (
          <Loader2 className={`${playIconClass} animate-spin text-black`} />
        ) : isActualPlaying ? (
          <Pause className={`${playIconClass} fill-black text-black`} />
        ) : (
          <Play className={`${playIconClass} fill-black text-black ml-[2px]`} />
        )}
      </button>

      {/* 4. Next */}
      <button
        onClick={onNext}
        className="w-8 h-8 flex items-center justify-center rounded-full text-[#D4D4D4] hover:text-white hover:bg-white/[0.06] transition-colors active:scale-90"
        aria-label="Next track"
        title="Next"
      >
        <SkipForward className={`${iconClass} fill-current`} />
      </button>

      {/* 5. Repeat (hidden on smaller viewports to prioritize core playback) */}
      <button
        onClick={onCycleRepeat}
        className={`hidden xl:inline-flex w-8 h-8 items-center justify-center rounded-full transition-all ${
          repeatMode !== 'off'
            ? 'text-white bg-white/15'
            : 'text-[#8F8F8F] hover:text-white hover:bg-white/[0.06]'
        }`}
        aria-label={`Repeat mode: ${repeatMode}`}
        title={`Repeat: ${repeatMode}`}
      >
        {repeatMode === 'one' ? (
          <Repeat1 className={iconClass} />
        ) : (
          <Repeat className={iconClass} />
        )}
      </button>
    </div>
  );
}
