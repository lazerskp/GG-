'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';

const GENRES = [
  { name: 'Desi Hip-Hop', tag: 'SUB-CONTINENT SOUND', desc: 'The defining street sound of the Indian subcontinent.' },
  { name: 'Drill', tag: 'SLIDING 808s', desc: 'Rapid hi-hats, gritty cadence, and unfiltered storytelling.' },
  { name: 'Trap', tag: 'LOW-END HEAVY', desc: 'Heavy sub-bass, triplet flows, and midnight automotive energy.' },
  { name: 'Alternative Rap', tag: 'CROSSOVER', desc: 'Boundary-breaking production blending electronic, jazz, and soul.' },
  { name: 'Underground', tag: 'RAW CYPHER', desc: 'Unfiltered, independent, and anti-commercial raw cyphers.' },
  { name: 'Boom Bap', tag: 'CHOPPED BREAKS', desc: 'Classic drum breaks, vinyl loops, and intricate internal rhymes.' },
];

export function ExploreGenres() {
  const router = useRouter();

  const handleSelectGenre = (genreName: string) => {
    // Navigate or focus search on the genre
    const searchInput = document.querySelector('input[aria-label*="Search"]') as HTMLInputElement | null;
    if (searchInput) {
      searchInput.focus();
      searchInput.value = genreName;
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(`/?q=${encodeURIComponent(genreName)}`);
    }
  };

  return (
    <section className="mb-14 sm:mb-20" aria-label="Explore Styles">
      <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/[0.06]">
        <div>
          <p className="text-[11px] font-mono tracking-[0.2em] text-[#8F8F8F] uppercase font-semibold mb-1">
            SONIC LANDSCAPES
          </p>
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
            Explore Styles
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
        {GENRES.map((genre) => (
          <div
            key={genre.name}
            onClick={() => handleSelectGenre(genre.name)}
            className="pt-4 pb-4 border-t border-white/[0.08] hover:border-white/40 transition-colors duration-200 cursor-pointer select-none flex flex-col justify-between group"
          >
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8F8F8F] group-hover:text-white transition-colors">
                {genre.tag}
              </span>
              <ArrowUpRight className="w-4 h-4 text-[#8F8F8F] group-hover:text-white transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>

            <div className="mt-4 space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:underline transition-colors">
                {genre.name}
              </h3>
              <p className="text-xs text-[#A1A1A6] leading-relaxed">
                {genre.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
