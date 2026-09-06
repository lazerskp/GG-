'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Artist } from '@/types/music';
import { ArtistCard } from '@/components/music/ArtistCard';
import { deduplicateArtists } from '@/utils/artistDeduplication';

interface FeaturedArtistsProps {
  artists: Artist[];
  title?: string;
  eyebrow?: string;
}

export function FeaturedArtists({
  artists,
  title = 'Featured Artists',
  eyebrow = 'ORIGINATORS & LEADERS',
}: FeaturedArtistsProps) {
  // Enforce robust multi-pass deduplication (no repeated Seedhe Maut, Hanumankind, etc.)
  const uniqueArtists = deduplicateArtists(artists);

  if (!uniqueArtists || uniqueArtists.length === 0) return null;

  return (
    <section id="artists" className="mb-14 sm:mb-20" aria-label={title}>
      {/* Editorial Header Bar */}
      <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/[0.06]">
        <div>
          <p className="text-[11px] font-mono tracking-[0.2em] text-[#8F8F8F] uppercase font-semibold mb-1">
            {eyebrow}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
            {title}
          </h2>
        </div>

        <Link
          href="/charts"
          className="group inline-flex items-center gap-1.5 text-xs font-mono text-[#A1A1A6] hover:text-white transition-colors uppercase tracking-wider"
        >
          <span>Trending Charts</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Horizontal Editorial Layout — Circular imagery, minimal secondary info */}
      <div className="flex md:grid md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8 overflow-x-auto no-scrollbar pb-3 md:pb-0 snap-x snap-mandatory">
        {uniqueArtists.slice(0, 12).map((artist) => (
          <div key={artist.id} className="snap-start shrink-0 w-28 sm:w-32 md:w-auto">
            <ArtistCard artist={artist} />
          </div>
        ))}
      </div>
    </section>
  );
}
