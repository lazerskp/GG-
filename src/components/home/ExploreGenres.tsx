'use client';

import React, { useState } from 'react';
import { SectionHeader } from '@/components/music/SectionHeader';
import { ArrowUpRight } from 'lucide-react';

const GENRES = [
  { name: 'Desi Hip-Hop', count: '1.4k Tracks', desc: 'The defining street sound of the Indian subcontinent.' },
  { name: 'Drill', count: '820 Tracks', desc: 'Sliding 808s, rapid hi-hats, raw storytelling from Delhi to Brixton.' },
  { name: 'Trap', count: '940 Tracks', desc: 'Heavy sub-bass, triplet flows, and late-night automotive energy.' },
  { name: 'Alternative Rap', count: '510 Tracks', desc: 'Boundary-breaking production blending electronic, jazz, and soul.' },
  { name: 'Underground', count: '630 Tracks', desc: 'Unfiltered, independent, and anti-commercial raw cyphers.' },
  { name: 'Boom Bap', count: '410 Tracks', desc: 'Classic drum breaks, chopped vinyl samples, and intricate lyricism.' },
];

export function ExploreGenres() {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  return (
    <section className="mb-14 sm:mb-20 content-auto" aria-label="Explore Genres">
      <SectionHeader
        eyebrow="SONIC LANDSCAPES"
        title="Explore Styles"
        description="Navigate through distinct subgenres shaping modern rap culture."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
        {GENRES.map((genre) => {
          const isSelected = selectedGenre === genre.name;
          return (
            <div
              key={genre.name}
              onClick={() => setSelectedGenre(isSelected ? null : genre.name)}
              className={`pt-4 pb-4 border-t transition-all duration-200 cursor-pointer select-none flex flex-col justify-between group ${
                isSelected
                  ? 'border-white text-white'
                  : 'border-white/[0.08] hover:border-white/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A1A1A1] group-hover:text-white transition-colors">
                  {genre.count}
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#A1A1A1] group-hover:text-white transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>

              <div className="mt-4 space-y-1.5">
                <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-white transition-colors">
                  {genre.name}
                </h3>
                <p className="text-xs text-[#A1A1A1] leading-relaxed group-hover:text-white transition-colors">
                  {genre.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
