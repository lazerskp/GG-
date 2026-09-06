'use client';

import React, { useState } from 'react';
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
  AlertCircle,
  Loader2,
  Sparkles,
  Music4,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useLyrics } from '@/hooks/useLyrics';
import { ProgressBar } from './ProgressBar';
import { getHighResArtwork, getMediumArtwork } from '@/utils/artworkQuality';
import { AppleViewTogglePill } from '@/components/icons/ApplePlayerIcons';

const SyncedLyrics = dynamic(
  () => import('./SyncedLyrics').then((m) => ({ default: m.SyncedLyrics })),
  { ssr: false, loading: () => null }
);
const DynamicAmbientBackground = dynamic(
  () => import('./DynamicAmbientBackground').then((m) => ({ default: m.DynamicAmbientBackground })),
  { ssr: false, loading: () => null }
);

type MobileView = 'now_playing' | 'lyrics' | 'queue';

export function FullscreenMobilePlayer() {
  const {
    currentTrack,
    queue,
    relatedQueue,
    isPlaying,
    playbackStatus,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffleEnabled,
    repeatMode,
    isMobileFullscreenOpen,
    togglePlay,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    setMobileFullscreenOpen,
    playTrack,
    clearQueue,
  } = usePlayerStore();

  const [activeView, setActiveView] = useState<MobileView>('now_playing');
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const volumeTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const resetVolumeTimer = React.useCallback(() => {
    if (volumeTimerRef.current) clearTimeout(volumeTimerRef.current);
    volumeTimerRef.current = setTimeout(() => {
      setIsVolumeOpen(false);
    }, 4000);
  }, []);

  const handleVolumeTap = React.useCallback(() => {
    if (!isVolumeOpen) {
      setIsVolumeOpen(true);
      resetVolumeTimer();
    } else {
      toggleMute();
      resetVolumeTimer();
    }
  }, [isVolumeOpen, resetVolumeTimer, toggleMute]);

  React.useEffect(() => {
    return () => {
      if (volumeTimerRef.current) clearTimeout(volumeTimerRef.current);
    };
  }, []);

  const { lyrics, isLoading: isLoadingLyrics, error: lyricsError } = useLyrics(currentTrack);

  if (!isMobileFullscreenOpen || !currentTrack) {
    return null;
  }

  const isStreamUnavailable = playbackStatus === 'unavailable';
  const isLoading = playbackStatus === 'loading';
  const isActualPlaying = isPlaying && playbackStatus === 'playing';
  const highResArtwork = getHighResArtwork(currentTrack.artworkUrl);

  return (
    <div
      role="dialog"
      aria-label="Mobile Fullscreen Player"
      className="md:hidden fixed inset-0 z-50 bg-[#060606] flex flex-col justify-between p-5 pb-7 sm:pb-6 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300 select-none font-apple-system text-white"
    >
      {/* 1. Dynamic Moving Ambient Background (Artwork-derived color fields, continuous GPU drift, seamless crossfade) */}
      <DynamicAmbientBackground
        artworkUrl={getMediumArtwork(currentTrack.artworkUrl) || highResArtwork}
        trackId={currentTrack.id}
        isPlaying={isActualPlaying}
      />

      {/* 2. Top Header: Dismiss on Left, Single Segmented View Switcher in Center, Volume on Right */}
      <header className="relative z-10 flex items-center justify-between pt-1 shrink-0 px-0.5">
        <button
          onClick={() => setMobileFullscreenOpen(false)}
          className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
          aria-label="Close player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* Apple Music Capsule Toggle Pill */}
        <AppleViewTogglePill
          activeTab={activeView === 'now_playing' ? 'none' : activeView}
          onToggle={(tab) => setActiveView(tab === 'none' ? 'now_playing' : tab)}
          size="compact"
        />

        {/* Premium Mobile Volume Control (tap to reveal smooth horizontal slider) */}
        <div className="relative flex items-center justify-end">
          <div
            className={`flex items-center transition-all duration-300 ease-out ${
              isVolumeOpen
                ? 'bg-black/60 backdrop-blur-md border border-white/15 rounded-full px-2.5 py-1 shadow-lg'
                : 'bg-transparent'
            }`}
          >
            {isVolumeOpen && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  resetVolumeTimer();
                }}
                onTouchStart={resetVolumeTimer}
                onTouchMove={resetVolumeTimer}
                className="w-20 sm:w-24 h-1 mr-2 bg-white/25 rounded-full appearance-none cursor-pointer accent-white hover:bg-white/40 transition-colors"
                aria-label="Mobile volume slider"
              />
            )}
            <button
              onClick={handleVolumeTap}
              className="p-1.5 text-white/70 hover:text-white transition-colors"
              aria-label={isMuted || volume === 0 ? 'Unmute' : 'Volume'}
              title="Volume"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-rose-400" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 3. Center Main View: Track Artwork OR Unboxed Lyrics OR Queue */}
      <div className="relative z-10 my-auto py-2 flex flex-col items-center justify-center w-full min-h-0 flex-1 overflow-hidden">
        {activeView === 'now_playing' && (
          /* --- Master Artwork View: Unboxed, pure visual element, 1:1, playback-dependent scale --- */
          <div className="w-full flex items-center justify-center my-auto animate-in fade-in duration-200 select-none">
            <div
              className="relative w-[78vw] max-w-[320px] aspect-square rounded-2xl overflow-hidden shadow-[0_20px_48px_rgba(0,0,0,0.65)] origin-center transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
              style={{
                transform: isActualPlaying ? 'scale(1)' : 'scale(0.82)',
              }}
            >
              <Image
                src={highResArtwork || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop'}
                alt={currentTrack.title}
                fill
                priority
                sizes="320px"
                className="object-cover"
              />
            </div>
          </div>
        )}

        {activeView === 'lyrics' && (
          /* --- Unboxed Lyrics View (No box, directly on ambient backdrop) --- */
          <div className="w-full h-full min-h-0 relative animate-in fade-in duration-200 flex flex-col">
            {isLoadingLyrics && (
              <div className="h-full flex flex-col justify-center px-6 space-y-4 animate-pulse select-none">
                {[70, 90, 60, 80, 50].map((w, i) => (
                  <div key={i} className="h-4 rounded-full bg-white/10" style={{ width: `${w}%` }} />
                ))}
              </div>
            )}

            {!isLoadingLyrics && lyricsError && (
              <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                <Music4 className="w-8 h-8 text-white/30 mb-2" />
                <p className="text-sm text-white/60">Lyrics could not be loaded</p>
              </div>
            )}

            {!isLoadingLyrics && !lyricsError && lyrics && (
              <div className="h-full">
                {lyrics.status === 'synced' && lyrics.lines && (
                  <SyncedLyrics
                    lines={lyrics.lines}
                    currentTime={currentTime}
                    onSeek={seek}
                    isMobileCard
                    className="px-4 py-[35%]"
                  />
                )}

                {lyrics.status === 'plain' && lyrics.text && (
                  <div className="h-full overflow-y-auto px-4 py-8 space-y-2 text-base text-white/80 leading-relaxed no-scrollbar">
                    {lyrics.text.map((l, i) => (
                      <p key={i}>{l || '\u00A0'}</p>
                    ))}
                  </div>
                )}

                {lyrics.status === 'instrumental' && (
                  <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                    <Music4 className="w-8 h-8 text-white/30 mb-2" />
                    <p className="text-sm text-white/70">Instrumental recording</p>
                  </div>
                )}

                {lyrics.status === 'unavailable' && (
                  <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                    <Music4 className="w-8 h-8 text-white/30 mb-2" />
                    <p className="text-sm text-white/60">Lyrics unavailable for this track</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeView === 'queue' && (
          /* --- Borderless Queue View --- */
          <div className="w-full h-full overflow-y-auto space-y-4 px-2 no-scrollbar animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-white/50">
                Up Next ({queue.length})
              </h4>
              {queue.length > 0 && (
                <button onClick={clearQueue} className="text-xs text-white/60 hover:text-rose-400">
                  Clear
                </button>
              )}
            </div>

            {queue.length === 0 ? (
              <p className="text-xs text-white/35 py-4 italic">No tracks in your manual queue</p>
            ) : (
              <div className="space-y-1 divide-y divide-white/[0.04]">
                {queue.map((t, idx) => {
                  const isCurrent = t.id === currentTrack.id;
                  return (
                    <div
                      key={`${t.id}-${idx}`}
                      onClick={() => playTrack(t, queue)}
                      className={`flex items-center space-x-3 py-2.5 px-2 rounded-xl cursor-pointer transition-colors ${
                        isCurrent ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/10">
                        <Image
                          src={t.artworkUrl || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=200&auto=format&fit=crop'}
                          alt={t.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{t.title}</p>
                        <p className="text-xs text-white/50 truncate">{t.artist}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Related Discovery Recommendations */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 pb-2 border-b border-white/10">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <h4 className="text-[11px] font-mono uppercase tracking-widest text-white/50">
                  Similar Discovery
                </h4>
              </div>

              <div className="space-y-1 divide-y divide-white/[0.04] mt-1">
                {relatedQueue.map((t, idx) => (
                  <div
                    key={`rel-${t.id}-${idx}`}
                    onClick={() => playTrack(t, [currentTrack, ...relatedQueue])}
                    className="flex items-center space-x-3 py-2.5 px-2 rounded-xl cursor-pointer text-white/60 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/10">
                      <Image
                        src={t.artworkUrl || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=200&auto=format&fit=crop'}
                        alt={t.title}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{t.title}</p>
                      <p className="text-xs text-white/50 truncate">{t.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Controls: Uninterrupted Real Playback */}
      <div className="relative z-10 space-y-3 pb-2 shrink-0">
        {isStreamUnavailable && (
          <div className="flex items-center justify-center space-x-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs text-center">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Playback unavailable for this track</span>
          </div>
        )}

        {/* Track Title & Artist */}
        <div className="min-w-0 pr-2">
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
            {currentTrack.title}
          </h3>
          <Link
            href={`/artist/${encodeURIComponent(currentTrack.artistId || currentTrack.id)}`}
            onClick={() => setMobileFullscreenOpen(false)}
            aria-label={`Open ${currentTrack.artist} artist page`}
            className="text-sm text-white/60 hover:text-white hover:underline truncate mt-0.5 inline-block"
          >
            {currentTrack.artist}
          </Link>
        </div>

        {/* Progress Scrubber */}
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={seek}
        />

        {/* Main Controls Row */}
        <div className="flex items-center justify-between px-2 pt-0.5">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-2 transition-colors ${
              isShuffleEnabled ? 'text-rose-400' : 'text-white/60 hover:text-white'
            }`}
            aria-label="Toggle shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Previous */}
          <button
            onClick={previousTrack}
            className="p-2 text-white/80 hover:text-white transition-transform active:scale-90"
            aria-label="Previous track"
          >
            <SkipBack className="w-7 h-7 fill-current" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            disabled={isLoading || isStreamUnavailable}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-lg ${
              isStreamUnavailable
                ? 'bg-white/20 text-white/60 cursor-not-allowed'
                : 'bg-white text-black hover:scale-105'
            }`}
            aria-label={isActualPlaying ? 'Pause' : 'Play'}
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
            className="p-2 text-white/80 hover:text-white transition-transform active:scale-90"
            aria-label="Next track"
          >
            <SkipForward className="w-7 h-7 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={cycleRepeatMode}
            className={`p-2 transition-colors ${
              repeatMode !== 'off' ? 'text-white' : 'text-white/60 hover:text-white'
            }`}
            aria-label={`Repeat mode: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
