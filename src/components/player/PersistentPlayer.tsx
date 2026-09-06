'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { usePlayerStore } from '@/store/usePlayerStore';
import { youtubePlayerService } from '@/services/youtubePlayerService';

// Desktop and Mini players are code-split so they never inflate the initial
// homepage JavaScript bundle. Loaded strictly on demand when a track begins playback.
const DesktopPlayer = dynamic(
  () => import('./DesktopPlayer').then((m) => ({ default: m.DesktopPlayer })),
  { ssr: false, loading: () => null }
);
const MiniPlayer = dynamic(
  () => import('./MiniPlayer').then((m) => ({ default: m.MiniPlayer })),
  { ssr: false, loading: () => null }
);

/**
 * Playback-only heavy surfaces are code-split so they never inflate the initial
 * homepage JavaScript bundle. They are loaded on demand (first track play / first
 * panel or fullscreen open). LyricsPanel, QueuePanel, SyncedLyrics and
 * DynamicAmbientBackground are all reached exclusively through these chunks.
 */
const FullscreenMobilePlayer = dynamic(
  () => import('./FullscreenMobilePlayer').then((m) => ({ default: m.FullscreenMobilePlayer })),
  { ssr: false, loading: () => null }
);
const FullscreenPlayer = dynamic(
  () => import('./FullscreenPlayer').then((m) => ({ default: m.FullscreenPlayer })),
  { ssr: false, loading: () => null }
);
const PlayerRightPanel = dynamic(
  () => import('./PlayerRightPanel').then((m) => ({ default: m.PlayerRightPanel })),
  { ssr: false, loading: () => null }
);

export function PersistentPlayer() {
  const {
    currentTrack,
    isFullscreenOpen,
    isMobileFullscreenOpen,
    rightPanelMode,
    setReady,
    setPlaybackStatus,
    updatePlaybackProgress,
    nextTrack,
  } = usePlayerStore();

  const isInitializedRef = useRef(false);

  // Sync persisted volume/mute preferences into the service WITHOUT initializing
  // the YouTube player. The singleton player is only created on the first
  // user-initiated Play (lazy initialization — never during initial page load).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      const { volume, isMuted } = usePlayerStore.getState();
      youtubePlayerService.setVolume(volume);
      youtubePlayerService.setMuted(isMuted);
    }
  }, []);

  // Subscribe to YouTube Player Events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const unsubReady = youtubePlayerService.on('ready', () => {
      setReady(true);
    });

    const unsubPlay = youtubePlayerService.on('play', () => {
      setPlaybackStatus('playing', null);
    });

    const unsubPause = youtubePlayerService.on('pause', () => {
      setPlaybackStatus('paused', null);
    });

    const unsubBuffering = youtubePlayerService.on('buffering', () => {
      setPlaybackStatus('loading', null);
    });

    const unsubEnded = youtubePlayerService.on('ended', () => {
      nextTrack();
    });

    const unsubTimeUpdate = youtubePlayerService.on('timeupdate', (data) => {
      updatePlaybackProgress(data.currentTime, data.duration);
    });

    const unsubError = youtubePlayerService.on('error', (err) => {
      const msg =
        typeof err === 'object' && err && 'message' in err && err.message
          ? String(err.message)
          : 'Playback unavailable for this track';
      setPlaybackStatus('error', msg);
    });

    return () => {
      unsubReady();
      unsubPlay();
      unsubPause();
      unsubBuffering();
      unsubEnded();
      unsubTimeUpdate();
      unsubError();
    };
  }, [setReady, setPlaybackStatus, updatePlaybackProgress, nextTrack]);

  return (
    <>
      {/* Non-intrusive compliant YouTube Embedded IFrame Player Container */}
      {/* Retains valid viewport dimensions (>= 200x200) and minimal opacity to comply with Chrome & WebKit media autoplay policies */}
      <div
        id="gg-yt-player-wrapper"
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 200,
          height: 200,
          opacity: 0.001,
          pointerEvents: 'none',
          zIndex: -9999,
          overflow: 'hidden',
        }}
      >
        <div id="gg-yt-player" />
      </div>

      {currentTrack && (
        <>
          <DesktopPlayer />
          <MiniPlayer />
          {isMobileFullscreenOpen && <FullscreenMobilePlayer />}
          {isFullscreenOpen && <FullscreenPlayer />}
          {/* Unified right-side panel (Lyrics / Queue) — mounted on demand */}
          {Boolean(rightPanelMode) && <PlayerRightPanel />}
        </>
      )}
    </>
  );
}
