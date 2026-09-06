'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Pause } from 'lucide-react';
import { AppleLyricsIcon, AppleQueueIcon } from '@/components/icons/ApplePlayerIcons';
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
    rightPanelMode,
    setRightPanelMode,
    closeRightPanel,
  } = usePlayerStore();

  if (!currentTrack) {
    return null;
  }

  const isStreamUnavailable = playbackStatus === 'unavailable';
  const isActualPlaying = isPlaying && playbackStatus === 'playing';
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const toggleLyricsPanel = () =>
    rightPanelMode === 'lyrics' ? closeRightPanel() : setRightPanelMode('lyrics');
  const toggleQueuePanel = () =>
    rightPanelMode === 'queue' ? closeRightPanel() : setRightPanelMode('queue');

  return (
    <div
      onClick={() => setMobileFullscreenOpen(true)}
      className="md:hidden fixed bottom-3 left-2 right-2 sm:left-4 sm:right-4 h-[60px] bg-[#0E0E0E]/90 border border-white/[0.08] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] z-40 overflow-hidden cursor-pointer flex items-center justify-between px-3.5 select-none backdrop-blur-2xl transition-[box-shadow] duration-300"
      style={{
        boxShadow: isActualPlaying ? '0 8px 32px 0 var(--artwork-glow, rgba(0,0,0,0.6))' : undefined,
      }}
    >
      {/* Top thin progress line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/[0.08]">
        <div
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Track Artwork & Info */}
      <div className="flex items-center space-x-3 min-w-0 pr-2">
        <div className="relative w-9 h-9 rounded-md overflow-hidden bg-[#222] shrink-0 border border-white/[0.08]">
          <Image
            src={currentTrack.artworkUrl?.trim() || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop'}
            alt={currentTrack.title}
            fill
            sizes="36px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 truncate">
          <p className="text-xs font-semibold text-white truncate leading-tight tracking-tight">
            {currentTrack.title}
          </p>
          <div className="flex items-center space-x-1 mt-0.5">
            <span className="text-[11px] text-[#A1A1A1] truncate">
              {currentTrack.artist}
            </span>
            {isStreamUnavailable && (
              <span className="text-[9px] text-amber-400 shrink-0 font-medium">· Unavailable</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions: Lyrics · Queue · Play/Pause */}
      <div className="flex items-center space-x-1 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLyricsPanel();
          }}
          className={`p-2 rounded-full transition-colors ${
            rightPanelMode === 'lyrics' ? 'text-white bg-white/[0.12]' : 'text-[#8F8F8F] hover:text-white'
          }`}
          aria-label="Lyrics"
        >
          <AppleLyricsIcon className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleQueuePanel();
          }}
          className={`p-2 rounded-full transition-colors ${
            rightPanelMode === 'queue' ? 'text-white bg-white/[0.12]' : 'text-[#8F8F8F] hover:text-white'
          }`}
          aria-label="Queue"
        >
          <AppleQueueIcon className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          disabled={isStreamUnavailable}
          className={`ml-1 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            isStreamUnavailable
              ? 'bg-white/20 text-white/50 cursor-not-allowed'
              : 'bg-white text-black hover:scale-105 active:scale-95'
          }`}
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
