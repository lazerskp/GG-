'use client';

import React from 'react';
import { Artist, Song } from '@/types/music';
import { SectionHeader } from '@/components/music/SectionHeader';
import { ArtistCard } from '@/components/music/ArtistCard';
import { TrackRow } from '@/components/music/TrackRow';

interface GlobalRapSectionProps {
  artists: Artist[];
  tracks: Song[];
}

export function GlobalRapSection({ artists, tracks }: GlobalRapSectionProps) {
  if ((!artists || artists.length === 0) && (!tracks || tracks.length === 0)) {
    return null;
  }

  return (
    <section id="global-rap" className="mb-16 sm:mb-24 pt-4 content-auto" aria-label="Global Rap">
      {/* Chapter Marker */}
      <div className="flex items-center space-x-3 mb-6">
        <span className="h-px flex-1 bg-white/[0.06]" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1A1]">
          CHAPTER II • INTERNATIONAL SOUNDS
        </span>
        <span className="h-px flex-1 bg-white/[0.06]" />
      </div>

      <SectionHeader
        eyebrow="WORLDWIDE MOVEMENT"
        title="Global Rap"
        description="From Compton storytelling and Houston trap to West London drill. The global vanguard dominating streaming charts worldwide."
      />

      {/* 1. International Artists Scroll / Grid */}
      <div className="mb-12">
        <div className="flex md:grid md:grid-cols-4 lg:grid-cols-6 gap-5 sm:gap-6 overflow-x-auto no-scrollbar pb-2 md:pb-0 snap-x snap-mandatory">
          {artists.slice(0, 12).map((artist) => (
            <div key={artist.id} className="snap-start shrink-0 w-32 sm:w-36 md:w-auto">
              <ArtistCard artist={artist} />
            </div>
          ))}
        </div>
      </div>

      {/* 2. Global Trending Tracklist (Fluid unboxed) */}
      <div>
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#A1A1A1] mb-4 px-1">
          Global Trending Tracks
        </h3>
        <div className="space-y-0.5 divide-y divide-white/[0.04]">
          {tracks.slice(0, 10).map((track, idx) => (
            <TrackRow
              key={track.id}
              track={track}
              index={idx}
              playlistContext={tracks}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
