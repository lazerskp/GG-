'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Pause } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';

export function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    playbackStatus,
    currentTime,
    duration,
    togglePlay,
    setMobileFullscreenOpen,
  } = usePlayerStore();

  if (!currentTrack) {
    return null;
  }

  const isStreamUnavailable = playbackStatus === 'unavailable';
  const isActualPlaying = isPlaying && playbackStatus === 'playing';
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      onClick={() => setMobileFullscreenOpen(true)}
      className="md:hidden fixed bottom-2 left-2 right-2 h-[52px] bg-[#0E0E0E]/95 border border-white/[0.08] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.9)] z-40 overflow-hidden cursor-pointer flex items-center justify-between px-3 select-none backdrop-blur-2xl transition-[box-shadow] duration-300"
      style={{
        boxShadow: isActualPlaying ? '0 4px 20px 0 var(--artwork-glow, rgba(0,0,0,0.5))' : undefined,
      }}
    >
      {/* Top thin progress line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/[0.06]">
        <div
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Track Artwork & Info */}
      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
        <div className="relative w-8 h-8 rounded overflow-hidden bg-[#1c1c1c] shrink-0 border border-white/[0.06]">
          <Image
            src={
              currentTrack.artworkUrl?.trim() ||
              'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop'
            }
            alt={currentTrack.title}
            fill
            sizes="32px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 truncate">
          <p className="text-xs font-semibold text-white truncate leading-tight tracking-tight">
            {currentTrack.title}
          </p>
          <div className="flex items-center space-x-1 mt-0.5">
            <span className="text-[10px] text-[#8F8F8F] truncate">
              {currentTrack.artist}
            </span>
            {isStreamUnavailable && (
              <span className="text-[9px] text-amber-400 shrink-0 font-medium">· Unavailable</span>
            )}
          </div>
        </div>
      </div>

      {/* Play/Pause control */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center transition-transform active:scale-90"
          aria-label={isActualPlaying ? 'Pause' : 'Play'}
        >
          {isActualPlaying ? (
            <Pause className="w-4 h-4 fill-black text-black" />
          ) : (
            <Play className="w-4 h-4 fill-black text-black ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}
