'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ArtworkPalette,
  DEFAULT_PALETTE,
  extractPaletteFromArtwork,
  applyArtworkPalette,
} from '@/utils/artworkColorEngine';

interface DynamicAmbientBackgroundProps {
  artworkUrl?: string | null;
  trackId?: string | null;
  isPlaying?: boolean;
}

/**
 * Renders clearly visible, independently moving color fields derived from
 * the current track's artwork palette. Each blob has a unique position,
 * size, opacity, blur, animation path, and duration so they never merge
 * into a single static wash.
 */
function ArtworkColorFields({
  palette,
  artworkUrl,
  isPlaying,
}: {
  palette: ArtworkPalette;
  artworkUrl?: string | null;
  isPlaying?: boolean;
}) {
  return (
    <div
      className={`absolute -inset-[25%] w-[150%] h-[150%] pointer-events-none overflow-hidden select-none ${
        isPlaying ? 'ambient-motion-active' : 'ambient-motion-calm'
      }`}
    >
      {/* 1. Artwork wash: blurred album art panning independently behind the color blobs */}
      {artworkUrl && (
        <div
          className="absolute -inset-[20%] w-[140%] h-[140%] transition-opacity duration-1000 ease-out select-none pointer-events-none will-change-transform animate-artwork-wash"
          style={{
            backgroundImage: `url(${artworkUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(60px) saturate(2.2) brightness(0.85)',
            opacity: isPlaying ? 0.35 : 0.22,
          }}
        />
      )}

      {/* 2. Dominant: Large field starting from the left, drifting diagonally */}
      <div
        className="absolute top-[5%] left-[5%] w-[55vw] h-[55vw] max-w-[750px] max-h-[750px] rounded-full mix-blend-screen blur-[50px] sm:blur-[60px] animate-ambient-drift-1 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${palette.dominant} 0%, ${palette.secondary} 55%, transparent 78%)`,
        }}
      />

      {/* 3. Secondary: Counter-drift from bottom-right */}
      <div
        className="absolute bottom-[5%] right-[5%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full mix-blend-screen blur-[55px] sm:blur-[65px] animate-ambient-drift-2 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${palette.secondary} 0%, ${palette.dominant} 50%, transparent 75%)`,
        }}
      />

      {/* 4. Accent: Smaller, brighter, most noticeable moving glow */}
      <div
        className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] max-w-[550px] max-h-[550px] rounded-full mix-blend-screen blur-[40px] sm:blur-[50px] animate-ambient-drift-3 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${palette.accent} 0%, transparent 70%)`,
        }}
      />

      {/* 5. Deep Foundation: Slow vertical crossing layer */}
      <div
        className="absolute bottom-[15%] left-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full mix-blend-screen blur-[65px] sm:blur-[75px] animate-ambient-drift-4 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${palette.dominant} 0%, transparent 72%)`,
        }}
      />
    </div>
  );
}

export function DynamicAmbientBackground({
  artworkUrl,
  trackId,
  isPlaying = false,
}: DynamicAmbientBackgroundProps) {
  // Current active palette & artwork
  const [currentPalette, setCurrentPalette] = useState<ArtworkPalette>(DEFAULT_PALETTE);
  const [currentArtwork, setCurrentArtwork] = useState<string | null>(artworkUrl || null);

  const currentPaletteRef = useRef<ArtworkPalette>(DEFAULT_PALETTE);
  const currentArtworkRef = useRef<string | null>(artworkUrl || null);

  // Keep refs in sync
  useEffect(() => {
    currentPaletteRef.current = currentPalette;
  }, [currentPalette]);

  useEffect(() => {
    currentArtworkRef.current = currentArtwork;
  }, [currentArtwork]);

  // Previous palette & artwork for seamless crossfade
  const [previousPalette, setPreviousPalette] = useState<ArtworkPalette | null>(null);
  const [previousArtwork, setPreviousArtwork] = useState<string | null>(null);

  // Crossfade animation trigger state
  const [crossfadeFading, setCrossfadeFading] = useState(false);

  // Track ID reference to recognize actual track changes
  const lastProcessedTrackRef = useRef<string | null>(null);
  const crossfadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!artworkUrl) return;

    let isMounted = true;
    const currentTrackKey = trackId || artworkUrl;

    extractPaletteFromArtwork(artworkUrl, trackId || undefined).then((newPalette) => {
      if (!isMounted) return;

      // Update global CSS custom properties for site-wide consistency
      applyArtworkPalette(newPalette);

      const isTrackChange =
        lastProcessedTrackRef.current !== null &&
        lastProcessedTrackRef.current !== currentTrackKey;

      if (isTrackChange) {
        // Clear any ongoing crossfade timer
        if (crossfadeTimeoutRef.current) {
          clearTimeout(crossfadeTimeoutRef.current);
        }

        // Store current palette as previous for smooth crossfade
        setPreviousPalette(currentPaletteRef.current);
        setPreviousArtwork(currentArtworkRef.current);
        setCurrentPalette(newPalette);
        setCurrentArtwork(artworkUrl);
        setCrossfadeFading(false);

        // Next frame: start the crossfade transition
        requestAnimationFrame(() => {
          if (!isMounted) return;
          setCrossfadeFading(true);
        });

        // After crossfade completes (1200ms), cleanup previous palette layer
        crossfadeTimeoutRef.current = setTimeout(() => {
          if (!isMounted) return;
          setPreviousPalette(null);
          setPreviousArtwork(null);
          setCrossfadeFading(false);
        }, 1200);
      } else {
        // First track load or same track update
        setCurrentPalette(newPalette);
        setCurrentArtwork(artworkUrl);
      }

      lastProcessedTrackRef.current = currentTrackKey;
    });

    return () => {
      isMounted = false;
      if (crossfadeTimeoutRef.current) {
        clearTimeout(crossfadeTimeoutRef.current);
      }
    };
  }, [artworkUrl, trackId]);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Base Dark Layer */}
      <div
        className="absolute inset-0 transition-colors duration-1000 ease-out"
        style={{
          backgroundColor: currentPalette.darkBase || '#060709',
        }}
      />

      {/* 2. Previous Track Palette Layer (Crossfading out) */}
      {previousPalette && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-1200 ease-in-out will-change-[opacity]"
          style={{
            opacity: crossfadeFading ? 0 : 1,
          }}
        >
          <ArtworkColorFields
            palette={previousPalette}
            artworkUrl={previousArtwork}
            isPlaying={isPlaying}
          />
        </div>
      )}

      {/* 3. Current Track Palette Layer (Crossfading in) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1200 ease-in-out will-change-[opacity]"
        style={{
          opacity: previousPalette && !crossfadeFading ? 0 : 1,
        }}
      >
        <ArtworkColorFields
          palette={currentPalette}
          artworkUrl={currentArtwork}
          isPlaying={isPlaying}
        />
      </div>

      {/* 4. Soft Vignette: Frames edges while keeping center ambient glow clearly visible */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(6, 6, 6, 0.05) 0%, rgba(6, 6, 6, 0.30) 55%, rgba(6, 6, 6, 0.72) 100%)',
        }}
      />

      {/* 5. Light Readability Overlay: Ensures text contrast without killing color motion */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(6, 6, 6, 0.20) 0%, rgba(6, 6, 6, 0.08) 50%, rgba(6, 6, 6, 0.30) 100%)',
        }}
      />
    </div>
  );
}
