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
      className="hidden md:block fixed bottom-3 left-0 right-0 z-40 px-4 sm:px-6 md:px-8 max-w-[1240px] xl:max-w-[1360px] 2xl:max-w-[1440px] mx-auto select-none pointer-events-none animate-player-enter"
    >
      {/* Apple Music-inspired compact floating capsule surface */}
      <div
        className="pointer-events-auto relative h-[64px] rounded-full bg-[#0D0D0D]/90 backdrop-blur-3xl border border-white/[0.08] px-4 sm:px-5 flex items-center justify-between gap-3 sm:gap-4 overflow-hidden transition-[box-shadow] duration-500"
        style={{
          boxShadow: isActualPlaying
            ? '0 12px 36px -8px var(--artwork-glow, rgba(255,255,255,0.06)), 0 6px 24px rgba(0,0,0,0.8)'
            : '0 8px 24px rgba(0,0,0,0.7)',
        }}
      >
        {/* Ambient artwork glow wash (smoothly blends dominant colors from active track) */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
            isActualPlaying ? 'opacity-25' : 'opacity-0'
          }`}
          style={{
            background:
              'radial-gradient(ellipse 45% 120% at 20% 50%, var(--artwork-dominant, transparent), transparent 70%), radial-gradient(ellipse 45% 120% at 80% 50%, var(--artwork-glow, transparent), transparent 75%)',
          }}
        />

        {/* 1. LEFT: Transport Controls */}
        <div className="relative shrink-0 flex items-center">
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

        {/* 2. CENTER: Artwork + Track Info + Real Progress (The visual priority) */}
        <div className="relative flex-1 min-w-0 flex items-center gap-3">
          <div
            onClick={() => setIsFullscreenOpen(true)}
            className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#171717] shrink-0 border border-white/10 group cursor-pointer"
            title="Open fullscreen player"
          >
            <Image
              src={currentTrack.artworkUrl?.trim() || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop'}
              alt={currentTrack.title}
              fill
              sizes="40px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1">
            {/* Track identity row with intelligent truncation */}
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-xs sm:text-[13px] font-semibold text-white truncate max-w-[160px] md:max-w-[220px] lg:max-w-[300px] xl:max-w-[380px] leading-tight tracking-tight">
                {currentTrack.title}
              </p>

              <span className="text-[#8C8C8C] text-xs shrink-0">·</span>

              {currentTrack.artistId ? (
                <Link
                  href={`/artist/${encodeURIComponent(currentTrack.artistId)}`}
                  aria-label={`Open ${currentTrack.artist} artist page`}
                  className="text-xs text-[#A1A1A1] hover:text-white hover:underline transition-colors truncate max-w-[120px] lg:max-w-[180px]"
                >
                  {currentTrack.artist}
                </Link>
              ) : (
                <span className="text-xs text-[#A1A1A1] truncate max-w-[120px] lg:max-w-[180px]">
                  {currentTrack.artist}
                </span>
              )}

              {currentTrack.album && (
                <>
                  <span className="text-[#8C8C8C] text-xs shrink-0 hidden xl:inline">·</span>
                  <span className="text-xs text-[#8F8F8F] truncate max-w-[150px] hidden xl:inline">
                    {currentTrack.album}
                  </span>
                </>
              )}

              {/* Subtle live visualizer equalizer */}
              <div className="hidden 2xl:flex items-end gap-[2px] h-3 w-4 justify-center ml-1" aria-hidden="true">
                <span
                  className={`w-[2px] bg-white/60 rounded-full ${
                    isActualPlaying ? 'animate-eq-1' : 'h-1 opacity-25'
                  }`}
                />
                <span
                  className={`w-[2px] bg-white/60 rounded-full ${
                    isActualPlaying ? 'animate-eq-2' : 'h-2 opacity-25'
                  }`}
                />
                <span
                  className={`w-[2px] bg-white/60 rounded-full ${
                    isActualPlaying ? 'animate-eq-3' : 'h-1.5 opacity-25'
                  }`}
                />
              </div>

              {isStreamUnavailable && (
                <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium shrink-0">
                  <AlertCircle className="w-3 h-3" />
                  Unavailable
                </span>
              )}
            </div>

            {/* Thin compact scrubber with real YouTube playback time */}
            <div className="flex items-center gap-2.5 max-w-xl">
              <div className="flex-1">
                <ProgressBar
                  currentTime={currentTime}
                  duration={duration}
                  onSeek={seek}
                  showTimestamps={false}
                  compact
                />
              </div>
              <span className="text-[10px] font-mono tabular-nums text-[#8F8F8F] shrink-0 select-none">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>

        {/* 3. RIGHT: Lyrics · Queue · Volume · Fullscreen */}
        <div className="relative flex items-center gap-0.5 sm:gap-1 shrink-0">
          {/* Lyrics */}
          <button
            onClick={toggleLyricsPanel}
            className={`p-2 rounded-full transition-colors ${
              rightPanelMode === 'lyrics'
                ? 'text-white bg-white/[0.12]'
                : 'text-[#A1A1A1] hover:text-white hover:bg-white/[0.06]'
            }`}
            aria-label="Toggle lyrics panel"
            title="Lyrics"
          >
            <AppleLyricsIcon className="w-4 h-4" />
          </button>

          {/* Queue */}
          <button
            onClick={toggleQueuePanel}
            className={`relative p-2 rounded-full transition-colors ${
              rightPanelMode === 'queue'
                ? 'text-white bg-white/[0.12]'
                : 'text-[#A1A1A1] hover:text-white hover:bg-white/[0.06]'
            }`}
            aria-label="Toggle queue panel"
            title="Queue"
          >
            <AppleQueueIcon className="w-4 h-4" />
            {queue.length > 1 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </button>

          {/* Volume */}
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={setVolume}
            onToggleMute={toggleMute}
          />

          {/* Fullscreen Expand button */}
          <button
            onClick={() => setIsFullscreenOpen(true)}
            className="p-2 text-[#A1A1A1] hover:text-white hover:bg-white/[0.06] transition-colors rounded-full"
            aria-label="Open fullscreen player"
            title="Open Fullscreen Player"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
