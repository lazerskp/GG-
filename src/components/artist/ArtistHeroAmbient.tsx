'use client';

import React, { useEffect, useState } from 'react';
import {
  extractPaletteFromArtwork,
  DEFAULT_PALETTE,
  ArtworkPalette,
} from '@/utils/artworkColorEngine';

interface ArtistHeroAmbientProps {
  imageUrl: string;
  cacheKey?: string;
}

/**
 * Subtle artwork-derived ambient layer for the artist hero.
 * Extracts a live palette from the artist image via artworkColorEngine
 * and renders soft radial glows that blend into the #0A0A0A canvas.
 * Falls back silently to the default palette when extraction fails
 * (CORS restrictions, image errors, or extraction timeout).
 */
export function ArtistHeroAmbient({ imageUrl, cacheKey }: ArtistHeroAmbientProps) {
  const [palette, setPalette] = useState<ArtworkPalette>(DEFAULT_PALETTE);

  useEffect(() => {
    if (!imageUrl) return;
    let cancelled = false;

    extractPaletteFromArtwork(imageUrl, cacheKey).then((extracted) => {
      if (!cancelled && extracted) {
        setPalette(extracted);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [imageUrl, cacheKey]);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 70% 20%, ${palette.dominant}, transparent 70%),
          radial-gradient(ellipse 60% 50% at 20% 40%, ${palette.secondary}, transparent 70%),
          radial-gradient(ellipse 50% 40% at 50% 90%, ${palette.darkBase}, transparent 75%)
        `,
        opacity: 0.55,
      }}
    />
  );
}