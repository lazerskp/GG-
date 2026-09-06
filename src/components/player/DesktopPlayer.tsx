'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Maximize2, AlertCircle } from 'lucide-react';
import { AppleLyricsIcon, AppleQueueIcon } from '@/components/icons/ApplePlayerIcons';
import { usePlayerStore } from '@/store/usePlayerStore';
import { PlayerControls } from './PlayerControls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function DesktopPlayer() {
  const {
    currentTrack,
    queue,
    isPlaying,
    playbackStatus,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffleEnabled,
    repeatMode,
    rightPanelMode,
    togglePlay,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    setIsFullscreenOpen,
    setRightPanelMode,
    closeRightPanel,
  } = usePlayerStore();

  if (!currentTrack) {
    return null;
  }

  const isStreamUnavailable = playbackStatus === 'unavailable';
  const isActualPlaying = isPlaying && playbackStatus === 'playing';

  const toggleLyricsPanel = () =>
    rightPanelMode === 'lyrics' ? closeRightPanel() : setRightPanelMode('lyrics');
  const toggleQueuePanel = () =>
    rightPanelMode === 'queue' ? closeRightPanel() : setRightPanelMode('queue');

  return (
    <footer
      aria-label="Audio Player"
      className="hidden md:flex fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100vw-32px)] max-w-[820px] xl:max-w-[860px] select-none pointer-events-none animate-player-enter"
    >
      {/* Compact Floating GULLYGANG Player Shell */}
      <div
        className="pointer-events-auto relative w-full h-[62px] rounded-[24px] bg-[#101012]/96 backdrop-blur-2xl border border-white/[0.09] px-3.5 sm:px-4 flex items-center justify-between gap-3 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.8)] transition-all duration-300"
      >
        {/* Subtle dynamic artwork ambient glow */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
            isActualPlaying ? 'opacity-20' : 'opacity-0'
          }`}
          style={{
            background:
              'radial-gradient(ellipse 40% 120% at 50% 50%, var(--artwork-dominant, rgba(255,255,255,0.12)), transparent 70%)',
          }}
        />

        {/* 1. LEFT: Transport Controls (Shuffle, Previous, Play/Pause, Next, Repeat) */}
        <div className="relative shrink-0 flex items-center gap-0.5 sm:gap-1">
          <PlayerControls
            isPlaying={isPlaying}
            playbackStatus={playbackStatus}
            isShuffleEnabled={isShuffleEnabled}
            repeatMode={repeatMode}
            onTogglePlay={togglePlay}
            onPrevious={previousTrack}
            onNext={nextTrack}
            onToggleShuffle={toggleShuffle}
            onCycleRepeat={cycleRepeatMode}
            size="compact"
          />
        </div>

        {/* 2. CENTER: Album Artwork + Track Metadata + Thin Progress Bar */}
        <div className="relative flex-1 min-w-0 flex items-center gap-2.5 sm:gap-3 px-1">
          {/* Artwork: 42px square, slightly rounded, not circular */}
          <div
            onClick={() => setIsFullscreenOpen(true)}
            className="relative w-[42px] h-[42px] rounded-lg overflow-hidden bg-[#18181A] shrink-0 border border-white/[0.08] cursor-pointer group shadow-sm"
            title="Open fullscreen player"
          >
            <Image
              src={
                currentTrack.artworkUrl?.trim() ||
                'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop'
              }
              alt={currentTrack.title}
              fill
              sizes="42px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Metadata & Progress Column */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
            <div className="flex items-baseline justify-between gap-2 min-w-0">
              {/* Title • Artist • Album */}
              <div className="flex items-baseline gap-1.5 min-w-0 truncate">
                <span
                  onClick={() => setIsFullscreenOpen(true)}
                  className="text-xs font-semibold text-white truncate leading-tight tracking-tight cursor-pointer hover:underline"
                  title={currentTrack.title}
                >
                  {currentTrack.title}
                </span>
                <span className="text-[#52525B] text-[10px] select-none shrink-0">•</span>
                {currentTrack.artistId ? (
                  <Link
                    href={`/artist/${encodeURIComponent(currentTrack.artistId)}`}
                    className="text-[11px] text-[#A1A1A6] hover:text-white transition-colors truncate"
                    title={currentTrack.artist}
                  >
                    {currentTrack.artist}
                  </Link>
                ) : (
                  <span className="text-[11px] text-[#A1A1A6] truncate" title={currentTrack.artist}>
                    {currentTrack.artist}
                  </span>
                )}
                {currentTrack.album && currentTrack.album !== currentTrack.title && (
                  <>
                    <span className="text-[#52525B] text-[10px] select-none shrink-0 hidden lg:inline">•</span>
                    <span className="text-[11px] text-[#71717A] truncate hidden lg:inline" title={currentTrack.album}>
                      {currentTrack.album}
                    </span>
                  </>
                )}
                {isStreamUnavailable && (
                  <span className="flex items-center gap-0.5 text-[9px] text-amber-400 font-medium shrink-0 ml-1">
                    <AlertCircle className="w-2.5 h-2.5" />
                    Unavailable
                  </span>
                )}
              </div>

              {/* Timestamps */}
              <div className="shrink-0 flex items-center gap-1 text-[10px] font-mono tabular-nums text-[#71717A] select-none">
                <span>{formatTime(currentTime)}</span>
                <span className="text-[#3F3F46]">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Thin Progress Bar (2.5px) */}
            <div className="w-full">
              <ProgressBar
                currentTime={currentTime}
                duration={duration}
                onSeek={seek}
                showTimestamps={false}
                compact
              />
            </div>
          </div>
        </div>

        {/* 3. RIGHT: Actions (Lyrics, Queue, Volume, Fullscreen) */}
        <div className="relative shrink-0 flex items-center gap-1 sm:gap-1.5">
          {/* Lyrics toggle (Priority hidden on smaller viewports) */}
          <button
            type="button"
            onClick={toggleLyricsPanel}
            className={`hidden xl:inline-flex p-1.5 rounded-full transition-colors ${
              rightPanelMode === 'lyrics'
                ? 'text-white bg-white/[0.14]'
                : 'text-[#A1A1A6] hover:text-white hover:bg-white/[0.06]'
            }`}
            aria-label="Toggle lyrics panel"
            title="Lyrics"
          >
            <AppleLyricsIcon className="w-3.5 h-3.5" />
          </button>

          {/* Queue toggle */}
          <button
            type="button"
            onClick={toggleQueuePanel}
            className={`relative p-1.5 rounded-full transition-colors ${
              rightPanelMode === 'queue'
                ? 'text-white bg-white/[0.14]'
                : 'text-[#A1A1A6] hover:text-white hover:bg-white/[0.06]'
            }`}
            aria-label="Toggle queue panel"
            title="Queue"
          >
            <AppleQueueIcon className="w-3.5 h-3.5" />
            {queue.length > 1 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </button>

          {/* Volume control */}
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={setVolume}
            onToggleMute={toggleMute}
          />

          {/* Fullscreen Expand */}
          <button
            type="button"
            onClick={() => setIsFullscreenOpen(true)}
            className="p-1.5 text-[#A1A1A6] hover:text-white hover:bg-white/[0.06] transition-colors rounded-full"
            aria-label="Open fullscreen player"
            title="Open Fullscreen Player"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
