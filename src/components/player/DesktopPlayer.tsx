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
      className="hidden md:block fixed bottom-2.5 left-0 right-0 z-40 px-4 sm:px-6 max-w-[1180px] xl:max-w-[1280px] mx-auto select-none pointer-events-none animate-player-enter"
    >
      {/* Compact GULLYGANG floating player surface */}
      <div
        className="pointer-events-auto relative h-[56px] rounded-2xl bg-[#0A0A0A]/95 backdrop-blur-2xl border border-white/[0.08] px-4 flex items-center justify-between gap-4 overflow-hidden transition-[box-shadow] duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.85)]"
      >
        {/* Subtle ambient glow wash */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
            isActualPlaying ? 'opacity-20' : 'opacity-0'
          }`}
          style={{
            background:
              'radial-gradient(ellipse 40% 120% at 20% 50%, var(--artwork-dominant, rgba(255,255,255,0.15)), transparent 70%)',
          }}
        />

        {/* 1. LEFT: Artwork + Song Title + Artist (Aligned cleanly) */}
        <div className="relative flex items-center gap-3 w-[220px] lg:w-[260px] shrink-0 min-w-0">
          <div
            onClick={() => setIsFullscreenOpen(true)}
            className="relative w-9 h-9 rounded-md overflow-hidden bg-[#161616] shrink-0 border border-white/[0.08] cursor-pointer group"
            title="Open fullscreen player"
          >
            <Image
              src={
                currentTrack.artworkUrl?.trim() ||
                'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop'
              }
              alt={currentTrack.title}
              fill
              sizes="36px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p
              onClick={() => setIsFullscreenOpen(true)}
              className="text-xs font-semibold text-white truncate leading-tight tracking-tight cursor-pointer hover:underline"
            >
              {currentTrack.title}
            </p>

            <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
              {currentTrack.artistId ? (
                <Link
                  href={`/artist/${encodeURIComponent(currentTrack.artistId)}`}
                  aria-label={`Open ${currentTrack.artist} page`}
                  className="text-[11px] text-[#A1A1A6] hover:text-white transition-colors truncate"
                >
                  {currentTrack.artist}
                </Link>
              ) : (
                <span className="text-[11px] text-[#A1A1A6] truncate">
                  {currentTrack.artist}
                </span>
              )}

              {isStreamUnavailable && (
                <span className="flex items-center gap-0.5 text-[9px] text-amber-400 font-medium shrink-0">
                  <AlertCircle className="w-2.5 h-2.5" />
                  Unavailable
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2. CENTER: Playback Controls + Thin Scrubber */}
        <div className="relative flex-1 max-w-md flex flex-col items-center justify-center gap-1">
          {/* Transport buttons: Shuffle, Previous, Play/Pause, Next, Repeat */}
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

          {/* Thin progress line with monospace timestamps */}
          <div className="w-full flex items-center gap-2">
            <span className="text-[10px] font-mono tabular-nums text-[#8F8F8F] w-7 text-right shrink-0">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1">
              <ProgressBar
                currentTime={currentTime}
                duration={duration}
                onSeek={seek}
                showTimestamps={false}
                compact
              />
            </div>
            <span className="text-[10px] font-mono tabular-nums text-[#8F8F8F] w-7 text-left shrink-0">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* 3. RIGHT: Lyrics · Queue · Volume · Fullscreen */}
        <div className="relative flex items-center justify-end gap-1.5 w-[220px] lg:w-[260px] shrink-0">
          {/* Lyrics toggle */}
          <button
            type="button"
            onClick={toggleLyricsPanel}
            className={`p-1.5 rounded-full transition-colors ${
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

          {/* Compact volume */}
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
