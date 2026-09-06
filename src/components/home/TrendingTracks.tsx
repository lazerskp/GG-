'use client';

import React from 'react';
import { Song } from '@/types/music';
import { SectionHeader } from '@/components/music/SectionHeader';
import { TrackRow } from '@/components/music/TrackRow';

interface TrendingTracksProps {
  tracks: Song[];
  title?: string;
  eyebrow?: string;
  description?: string;
}

export function TrendingTracks({
  tracks,
  title = 'Trending Indian Rap',
  eyebrow = 'TOP ROTATION',
  description = 'The most played records across the subcontinent right now.',
}: TrendingTracksProps) {
  if (!tracks || tracks.length === 0) return null;

  return (
    <section id="trending" className="mb-14 sm:mb-20" aria-label={title}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
      />

      {/* Fluid Continuous Library List (No nested boxed cards) */}
      <div className="space-y-0.5 divide-y divide-white/[0.04]">
        {tracks.map((track, idx) => (
          <TrackRow
            key={track.id}
            track={track}
            index={idx}
            playlistContext={tracks}
          />
        ))}
      </div>
    </section>
  );
}
