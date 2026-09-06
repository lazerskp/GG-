'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Pause, AlertCircle } from 'lucide-react';
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
      className="md:hidden fixed bottom-3 left-3 right-3 h-[58px] bg-[#101012]/96 border border-white/[0.09] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.85)] z-40 overflow-hidden cursor-pointer flex items-center justify-between px-3 select-none backdrop-blur-2xl transition-[box-shadow] duration-300"
      style={{
        boxShadow: isActualPlaying ? '0 4px 24px 0 var(--artwork-glow, rgba(0,0,0,0.6))' : undefined,
      }}
    >
      {/* Top thin progress line (2px) */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/[0.06]">
        <div
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Track Artwork & Info */}
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#18181A] shrink-0 border border-white/[0.08] shadow-sm">
          <Image
            src={
              currentTrack.artworkUrl?.trim() ||
              'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop'
            }
            alt={currentTrack.title}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 truncate">
          <p className="text-xs font-semibold text-white truncate leading-tight tracking-tight">
            {currentTrack.title}
          </p>
          <div className="flex items-center gap-1 mt-0.5 min-w-0">
            <span className="text-[11px] text-[#A1A1A6] truncate">
              {currentTrack.artist}
            </span>
            {currentTrack.album && currentTrack.album !== currentTrack.title && (
              <>
                <span className="text-[#52525B] text-[10px] select-none">•</span>
                <span className="text-[11px] text-[#71717A] truncate">
                  {currentTrack.album}
                </span>
              </>
            )}
            {isStreamUnavailable && (
              <span className="flex items-center gap-0.5 text-[9px] text-amber-400 shrink-0 font-medium ml-0.5">
                <AlertCircle className="w-2.5 h-2.5" />
                Unavailable
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Play/Pause control (38px touch target) */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          disabled={isStreamUnavailable}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-black flex items-center justify-center transition-transform active:scale-90 shadow-sm disabled:bg-white/15 disabled:text-white/60"
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
