'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const uniqueArtists = deduplicateArtists(artists);

  if (!uniqueArtists || uniqueArtists.length === 0) return null;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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

        <div className="flex items-center gap-4">
          <Link
            href="/charts"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-[#A1A1A6] hover:text-white transition-colors uppercase tracking-wider mr-2"
          >
            <span>Trending Charts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Carousel Arrow Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              aria-label="Scroll artists left"
              className="w-8 h-8 rounded-full border border-white/[0.1] hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-[#A1A1A6] hover:text-white transition-all active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              aria-label="Scroll artists right"
              className="w-8 h-8 rounded-full border border-white/[0.1] hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-[#A1A1A6] hover:text-white transition-all active:scale-95"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Editorial Layout — Circular imagery, minimal secondary info */}
      <div
        ref={scrollRef}
        className="flex md:grid md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8 overflow-x-auto no-scrollbar pb-3 md:pb-0 snap-x snap-mandatory"
      >
        {uniqueArtists.slice(0, 12).map((artist) => (
          <div key={artist.id} className="snap-start shrink-0 w-28 sm:w-32 md:w-auto">
            <ArtistCard artist={artist} />
          </div>
        ))}
      </div>
    </section>
  );
}
