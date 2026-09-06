'use client';

import React from 'react';
import { Artist } from '@/types/music';
import { SectionHeader } from '@/components/music/SectionHeader';
import { ArtistCard } from '@/components/music/ArtistCard';

interface FeaturedArtistsProps {
  artists: Artist[];
  title?: string;
  eyebrow?: string;
}

export function FeaturedArtists({
  artists,
  title = 'Featured Indian Artists',
  eyebrow = 'PIONEERS & VANGUARDS',
}: FeaturedArtistsProps) {
  if (!artists || artists.length === 0) return null;
  return (
    <section className="mb-14 sm:mb-16" aria-label={title}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description="The vocalists, lyricists, and producers pushing Desi Hip-Hop into uncharted sonic territories."
      />

      {/* Desktop: Responsive Grid | Mobile: Horizontal Scroll with Snap */}
      <div className="flex md:grid md:grid-cols-4 lg:grid-cols-6 gap-5 sm:gap-6 overflow-x-auto no-scrollbar pb-2 md:pb-0 snap-x snap-mandatory">
        {artists.slice(0, 12).map((artist) => (
          <div key={artist.id} className="snap-start shrink-0 w-32 sm:w-36 md:w-auto">
            <ArtistCard artist={artist} />
          </div>
        ))}
      </div>
    </section>
  );
}
