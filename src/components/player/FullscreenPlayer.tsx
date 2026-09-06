'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Loader2,
  Music4,
  Sparkles,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useLyrics } from '@/hooks/useLyrics';
import { ProgressBar } from './ProgressBar';
import { getHighResArtwork, getMediumArtwork } from '@/utils/artworkQuality';
import { extractCleanYouTubeId } from '@/utils/cleanYouTubeId';
import { AppleViewTogglePill, FullscreenViewTab } from '@/components/icons/ApplePlayerIcons';

const SyncedLyrics = dynamic(
  () => import('./SyncedLyrics').then((m) => ({ default: m.SyncedLyrics })),
  { ssr: false, loading: () => null }
);
const DynamicAmbientBackground = dynamic(
  () => import('./DynamicAmbientBackground').then((m) => ({ default: m.DynamicAmbientBackground })),
  { ssr: false, loading: () => null }
);

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function FullscreenPlayer() {
  const {
    currentTrack,
    queue,
    queueIndex,
    relatedQueue,
    isLoadingRelated,
    hasMoreRelated,
    isPlaying,
    playbackStatus,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffleEnabled,
    repeatMode,
    isFullscreenOpen,
    togglePlay,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    setIsFullscreenOpen,
    playTrack,
    clearQueue,
    fetchMoreRelated,
  } = usePlayerStore();

  // View mode: 'lyrics' | 'queue' | 'none' (centered music card)
  const [viewTab, setViewTab] = useState<FullscreenViewTab>('lyrics');

  // Live lyrics hook
  const { lyrics, isLoading: isLoadingLyrics, error: lyricsError } = useLyrics(currentTrack);



  // Keyboard navigation inside fullscreen mode
  useEffect(() => {
    if (!isFullscreenOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setIsFullscreenOpen(false);
          break;
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(Math.max(0, currentTime - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(Math.min(duration, currentTime + 5));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.05));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.05));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenOpen, setIsFullscreenOpen, togglePlay, seek, setVolume, currentTime, duration, volume]);

  // Infinite scroll trigger for queue in fullscreen
  const queueScrollRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  const rafScrollRef = useRef<number | null>(null);

  const handleQueueScroll = useCallback(() => {
    if (rafScrollRef.current) return;
    rafScrollRef.current = requestAnimationFrame(() => {
      rafScrollRef.current = null;
      const el = queueScrollRef.current;
      if (!el) return;

      const scrollBottom = el.scrollTop + el.clientHeight;
      const threshold = el.scrollHeight * 0.75;

      if (scrollBottom >= threshold && !isLoadingRelated && hasMoreRelated && !isFetchingRef.current) {
        isFetchingRef.current = true;
        fetchMoreRelated().finally(() => {
          isFetchingRef.current = false;
        });
      }
    });
  }, [isLoadingRelated, hasMoreRelated, fetchMoreRelated]);

  useEffect(() => {
    const el = queueScrollRef.current;
    if (!el || viewTab !== 'queue') return;
    el.addEventListener('scroll', handleQueueScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleQueueScroll);
      if (rafScrollRef.current) {
        cancelAnimationFrame(rafScrollRef.current);
        rafScrollRef.current = null;
      }
    };
  }, [handleQueueScroll, viewTab]);

  // Duplicate prevention in related queue
  const uniqueRelated = useMemo(() => {
    const seen = new Set<string>();
    if (currentTrack?.id) {
      const cId = extractCleanYouTubeId(currentTrack.id);
      if (cId) seen.add(cId);
    }
    queue.forEach((t) => {
      const qId = extractCleanYouTubeId(t.id);
      if (qId) seen.add(qId);
    });

    return relatedQueue.filter((track) => {
      const rId = extractCleanYouTubeId(track.id);
      if (!rId || seen.has(rId)) return false;
      seen.add(rId);
      return true;
    });
  }, [relatedQueue, currentTrack, queue]);

  if (!isFullscreenOpen || !currentTrack) {
    return null;
  }

  const isActualPlaying = isPlaying && playbackStatus === 'playing';
  const isLoading = playbackStatus === 'loading';
  const isStreamUnavailable = playbackStatus === 'unavailable';
  const upNext = queue.slice(queueIndex + 1);
  const remainingTime = Math.max(0, duration - currentTime);
  const highResArtwork = getHighResArtwork(currentTrack.artworkUrl);
  // Ambient wash uses a 600px derivative — a 1200px master is wasteful for a blurred backdrop.
  const ambientArtwork = getMediumArtwork(currentTrack.artworkUrl) || highResArtwork;

  return (
    <div
      role="dialog"
      aria-label="Fullscreen Player"
      className="hidden md:flex fixed inset-0 z-50 flex-col overflow-hidden bg-[#060606] text-white select-none animate-in fade-in duration-300 font-apple-system"
    >
      {/* 1. Dynamic Moving Ambient Background (Artwork-derived color fields, continuous GPU drift, seamless crossfade) */}
      <DynamicAmbientBackground
        artworkUrl={ambientArtwork}
        trackId={currentTrack.id}
        isPlaying={isActualPlaying}
      />

      {/* 2. Top Header Bar: Clean Collapse on Left, Apple Volume Slider on Right (matching screenshot) */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-8 md:px-10 lg:px-14 pt-5 pb-2 shrink-0 max-w-7xl mx-auto w-full">
        <button
          onClick={() => setIsFullscreenOpen(false)}
          className="p-2 -ml-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-md"
          aria-label="Collapse fullscreen player"
          title="Collapse (Esc)"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* Apple Music Header Volume Control (top-right, matches reference screenshot) */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-md">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 lg:w-28 h-1 bg-white/25 rounded-full appearance-none cursor-pointer accent-white hover:bg-white/40 transition-colors"
            aria-label="Volume slider"
          />
          <button
            onClick={toggleMute}
            className="text-white/60 hover:text-white transition-colors"
            aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
            title={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* 3. Main Layout: Centered Card when 'none', or Two-Column when 'lyrics' / 'queue' */}
      <main
        className={`relative z-10 flex-1 min-h-0 max-w-7xl mx-auto w-full px-6 sm:px-8 md:px-10 lg:px-14 py-2 flex items-center ${
          viewTab === 'none' ? 'justify-center' : 'justify-between gap-8 md:gap-12 lg:gap-16 xl:gap-20'
        } overflow-hidden transition-all duration-500 ease-out`}
      >
        {/* ================= MUSIC CARD: Center when 'none', Left Column when 'lyrics'/'queue' ================= */}
        <section
          aria-label="Current Track & Controls"
          className={`w-full ${
            viewTab === 'none'
              ? 'max-w-[420px] sm:max-w-[440px] lg:max-w-[460px] mx-auto'
              : 'md:w-[42%] lg:w-[44%] max-w-[400px] lg:max-w-[420px] shrink-0'
          } flex flex-col justify-center min-w-0 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform`}
          style={{
            transform: isActualPlaying ? 'scale(1)' : 'scale(0.97)',
          }}
        >
          {/* Master Resolution Square Album Artwork: Unboxed visual container, 1:1, playback-dependent scale */}
          <div className="w-full flex items-center justify-center select-none">
            <div
              className={`relative aspect-square w-full ${
                viewTab === 'none'
                  ? 'max-w-[340px] sm:max-w-[380px] lg:max-w-[420px]'
                  : 'max-w-[320px] sm:max-w-[360px] lg:max-w-[390px]'
              } rounded-2xl lg:rounded-3xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.65)] origin-bottom transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform`}
              style={{
                transform: isActualPlaying ? 'scale(1)' : 'scale(0.82)',
              }}
            >
              <Image
                src={highResArtwork || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop'}
                alt={currentTrack.title}
                fill
                priority
                sizes="(max-width: 1200px) 400px, 440px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Track Details Row (Clean, connected directly to artwork above) */}
          <div className="w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[390px] mx-auto mt-3.5 sm:mt-4 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-white tracking-tight leading-tight truncate">
              {currentTrack.title}
            </h1>

            <div className="mt-1 flex items-center gap-2 text-sm sm:text-base text-white/70">
              {currentTrack.artistId ? (
                <Link
                  href={`/artist/${encodeURIComponent(currentTrack.artistId)}`}
                  onClick={() => setIsFullscreenOpen(false)}
                  aria-label={`Open ${currentTrack.artist} artist page`}
                  className="hover:text-white hover:underline transition-colors truncate"
                >
                  {currentTrack.artist}
                </Link>
              ) : (
                <span className="truncate">{currentTrack.artist}</span>
              )}

              {currentTrack.album && (
                <>
                  <span className="text-white/60">·</span>
                  <span className="text-white/50 truncate max-w-[180px]">
                    {currentTrack.album}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Large Scrubber (Unified width with artwork and title) */}
          <div className="w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[390px] mx-auto mt-3 space-y-1">
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={seek}
              showTimestamps={false}
              className="w-full"
            />

            {/* Time Readout: Current & Remaining */}
            <div className="flex items-center justify-between text-xs font-mono tabular-nums text-white/50 pt-0.5 select-none">
              <span>{formatTime(currentTime)}</span>
              <span>-{formatTime(remainingTime)}</span>
            </div>
          </div>

          {/* Transport Controls Row (Unified width with artwork) */}
          <div className="w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[390px] mx-auto mt-4 sm:mt-5 flex items-center justify-between px-1">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`p-2.5 rounded-full transition-all ${
                isShuffleEnabled
                  ? 'text-rose-400 bg-rose-500/20 shadow-[0_0_16px_rgba(244,63,94,0.3)]'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Toggle shuffle"
              title={isShuffleEnabled ? 'Shuffle enabled' : 'Shuffle disabled'}
            >
              <Shuffle className="w-5 h-5" />
            </button>

            {/* Previous */}
            <button
              onClick={previousTrack}
              className="p-3 text-white/80 hover:text-white hover:scale-110 active:scale-95 transition-all"
              aria-label="Previous track"
              title="Previous"
            >
              <SkipBack className="w-7 h-7 fill-current" />
            </button>

            {/* Play / Pause Primary Button */}
            <button
              onClick={togglePlay}
              disabled={isStreamUnavailable}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-[0_4px_24px_rgba(255,255,255,0.25)] ${
                isStreamUnavailable
                  ? 'bg-white/20 text-white/60 cursor-not-allowed'
                  : 'bg-white text-black hover:scale-105'
              }`}
              aria-label={isActualPlaying ? 'Pause' : 'Play'}
              title={isStreamUnavailable ? 'Playback unavailable' : isActualPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-black" />
              ) : isActualPlaying ? (
                <Pause className="w-6 h-6 fill-black text-black" />
              ) : (
                <Play className="w-6 h-6 fill-black text-black ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={nextTrack}
              className="p-3 text-white/80 hover:text-white hover:scale-110 active:scale-95 transition-all"
              aria-label="Next track"
              title="Next"
            >
              <SkipForward className="w-7 h-7 fill-current" />
            </button>

            {/* Repeat */}
            <button
              onClick={cycleRepeatMode}
              className={`p-2.5 rounded-full transition-all ${
                repeatMode !== 'off'
                  ? 'text-white bg-white/20'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              aria-label={`Repeat mode: ${repeatMode}`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-5 h-5" />
              ) : (
                <Repeat className="w-5 h-5" />
              )}
            </button>
          </div>
        </section>

        {/* ================= RIGHT COLUMN: Unboxed Lyrics OR Continue Playing (Only when active) ================= */}
        {viewTab !== 'none' && (
          <section
            aria-label={viewTab === 'lyrics' ? 'Synchronized Lyrics' : 'Continue Playing Queue'}
            className="flex-1 h-full max-w-[560px] lg:max-w-[620px] xl:max-w-[680px] min-w-0 flex flex-col justify-between overflow-hidden animate-in fade-in duration-300 transition-all"
          >
            {/* Header: Only for Queue view, completely removed for lyrics */}
            {viewTab === 'queue' && (
              <div className="flex items-center justify-between pb-3 shrink-0 border-b border-white/[0.08]">
                <p className="text-xs font-mono uppercase tracking-widest text-white/50">
                  CONTINUE PLAYING {upNext.length > 0 ? `(${upNext.length})` : ''}
                </p>
              </div>
            )}

            {/* Main Unboxed Content Window (Directly on ambient canvas, zero boxes/cards) */}
            <div className={`flex-1 min-h-0 relative overflow-hidden ${viewTab === 'queue' ? 'mt-3' : 'mt-0'}`}>
              {viewTab === 'lyrics' ? (
              /* --- Unboxed Synced Lyrics Mode --- */
              <div className="h-full flex flex-col">
                {isLoadingLyrics && (
                  <div className="h-full flex flex-col justify-center px-8 space-y-6 animate-pulse select-none">
                    {[65, 85, 50, 75, 40, 60, 80].map((w, i) => (
                      <div
                        key={i}
                        className="h-6 rounded-full bg-white/10"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>
                )}

                {!isLoadingLyrics && lyricsError && (
                  <div className="h-full flex flex-col items-center justify-center px-8 text-center gap-3">
                    <Music4 className="w-8 h-8 text-white/30" />
                    <p className="text-base text-white/60">
                      Lyrics could not be loaded right now.
                    </p>
                  </div>
                )}

                {!isLoadingLyrics && !lyricsError && lyrics && (
                  <div key={lyrics.status} className="h-full">
                    {lyrics.status === 'synced' && lyrics.lines && (
                      <SyncedLyrics
                        lines={lyrics.lines}
                        currentTime={currentTime}
                        onSeek={seek}
                        className="px-4 lg:px-8 py-[38%]"
                      />
                    )}

                    {lyrics.status === 'plain' && lyrics.text && (
                      <div className="h-full overflow-y-auto px-6 lg:px-10 py-10 space-y-2.5 no-scrollbar">
                        {lyrics.text.map((line, idx) => (
                          <p
                            key={idx}
                            className="text-lg lg:text-xl font-medium text-white/80 leading-relaxed"
                          >
                            {line || '\u00A0'}
                          </p>
                        ))}
                      </div>
                    )}

                    {lyrics.status === 'instrumental' && (
                      <div className="h-full flex flex-col items-center justify-center px-8 text-center gap-3">
                        <Music4 className="w-8 h-8 text-white/60" />
                        <p className="text-lg text-white font-medium">Instrumental recording</p>
                        <p className="text-sm text-white/50">This track has no lyrics.</p>
                      </div>
                    )}

                    {lyrics.status === 'unavailable' && (
                      <div className="h-full flex flex-col items-center justify-center px-8 text-center gap-3">
                        <Music4 className="w-8 h-8 text-white/30" />
                        <p className="text-base text-white/60 font-medium">
                          Lyrics unavailable for this track
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* --- Unboxed Continue Playing / Queue Mode --- */
              <div
                ref={queueScrollRef}
                className="h-full overflow-y-auto px-4 lg:px-6 py-2 space-y-6 no-scrollbar"
              >
                {/* UP NEXT SECTION */}
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                    <p className="text-xs font-mono uppercase tracking-widest text-white/50">
                      CONTINUE PLAYING {upNext.length > 0 && `(${upNext.length})`}
                    </p>
                    {upNext.length > 0 && (
                      <button
                        onClick={clearQueue}
                        className="text-xs text-white/60 hover:text-rose-400 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {upNext.length === 0 ? (
                    <p className="text-xs text-white/35 py-4 italic">No manually queued tracks.</p>
                  ) : (
                    <div className="divide-y divide-white/[0.04]">
                      {upNext.map((track, i) => (
                        <div
                          key={`queue-${track.id}-${i}`}
                          onClick={() => playTrack(track, queue)}
                          className="group flex items-center justify-between py-2.5 px-2 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/10 shrink-0 border border-white/10">
                              <Image
                                src={track.artworkUrl || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=200&auto=format&fit=crop'}
                                alt={track.title}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate group-hover:text-white">
                                {track.title}
                              </p>
                              <p className="text-xs text-white/50 truncate mt-0.5">
                                {track.artist} {track.album ? `— ${track.album}` : ''}
                              </p>
                            </div>
                          </div>
                          {track.duration ? (
                            <span className="text-xs font-mono text-white/60 shrink-0 ml-3">
                              {formatTime(track.duration)}
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* RELATED / AUTO RECOMMENDATIONS SECTION */}
                <div>
                  <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <p className="text-xs font-mono uppercase tracking-widest text-white/50">
                      SIMILAR DISCOVERY
                    </p>
                  </div>

                  <div className="divide-y divide-white/[0.04]">
                    {uniqueRelated.map((track, i) => (
                      <div
                        key={`rel-${track.id}-${i}`}
                        onClick={() => playTrack(track, [currentTrack, ...uniqueRelated])}
                        className="group flex items-center justify-between py-2.5 px-2 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/10 shrink-0 border border-white/10">
                            <Image
                              src={track.artworkUrl || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=200&auto=format&fit=crop'}
                              alt={track.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate group-hover:text-white">
                              {track.title}
                            </p>
                            <p className="text-xs text-white/50 truncate mt-0.5">
                              {track.artist} {track.album ? `— ${track.album}` : ''}
                            </p>
                          </div>
                        </div>
                        {track.duration ? (
                          <span className="text-xs font-mono text-white/60 shrink-0 ml-3">
                            {formatTime(track.duration)}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  {isLoadingRelated && (
                    <div className="flex items-center justify-center py-6 text-white/50 gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs font-mono">Loading more recommendations...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
      </main>

      {/* Bottom Right Apple Music Capsule Toggle Pill (Docked bottom-right, not upper) */}
      <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 md:bottom-8 md:right-10 z-30 pointer-events-auto">
        <AppleViewTogglePill activeTab={viewTab} onToggle={setViewTab} />
      </div>
    </div>
  );
}
