'use client';

import React, { useRef } from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  className?: string;
  showTimestamps?: boolean;
  /** Tighter variant for embedded player surfaces */
  compact?: boolean;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function ProgressBar({
  currentTime,
  duration,
  onSeek,
  className = '',
  showTimestamps = true,
  compact = false,
}: ProgressBarProps) {
  const progressBarRef = useRef<HTMLDivElement>(null);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const { left, width } = rect;
    if (width <= 0) return;

    const pos = Math.max(0, Math.min(e.clientX - left, width));
    const newTime = (pos / width) * duration;
    onSeek(newTime);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const movePos = Math.max(0, Math.min(moveEvent.clientX - left, width));
      const moveTime = (movePos / width) * duration;
      onSeek(moveTime);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
  };

  return (
    <div className={`flex items-center space-x-2.5 w-full select-none ${className}`}>
      {showTimestamps && (
        <span className="font-mono text-[11px] tabular-nums text-[#8F8F8F] w-9 text-right shrink-0">
          {formatTime(currentTime)}
        </span>
      )}

      {/* Progress Track Container */}
      <div
        ref={progressBarRef}
        onPointerDown={handlePointerDown}
        className={`group relative flex-1 flex items-center cursor-pointer touch-none ${compact ? 'h-4' : 'h-6'}`}
      >
        {/* Track Rail */}
        <div
          className={`relative w-full bg-[#262626] rounded-full overflow-hidden transition-all duration-150 ${
            compact ? 'h-[3px] group-hover:h-1' : 'h-1 group-hover:h-1.5'
          }`}
        >
          {/* Filled Bar */}
          <div
            className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Thumb (reveals on hover/drag) */}
        <div
          className={`absolute rounded-full bg-white shadow-lg pointer-events-none transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${
            compact ? 'w-2.5 h-2.5' : 'w-3 h-3'
          }`}
          style={{ left: `${progressPercent}%` }}
        />
      </div>

      {showTimestamps && (
        <span className="font-mono text-[11px] tabular-nums text-[#8F8F8F] w-9 text-left shrink-0">
          {formatTime(duration)}
        </span>
      )}
    </div>
  );
}
