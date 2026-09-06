'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Album } from '@/types/music';
import { AlbumCard } from '@/components/music/AlbumCard';

interface NewReleasesProps {
  albums: Album[];
}

export function NewReleases({ albums }: NewReleasesProps) {
  const router = useRouter();

  if (!albums || albums.length === 0) return null;

  const handlePlayAlbum = (album: Album) => {
    // Navigate to the album page to stream the official full tracklist
    router.push(`/album/${encodeURIComponent(album.id)}`);
  };

  return (
    <section id="new-releases" className="mb-14 sm:mb-20" aria-label="New Releases">
      {/* Editorial Header Bar */}
      <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/[0.06]">
        <div>
          <p className="text-[11px] font-mono tracking-[0.2em] text-[#8F8F8F] uppercase font-semibold mb-1">
            FRESH DROPS
          </p>
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
            New Releases
          </h2>
        </div>
      </div>

      {/* Grid: 2 cols on mobile, 3 on tablet, 6 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 sm:gap-6">
        {albums.slice(0, 12).map((album) => (
          <div key={album.id}>
            <AlbumCard
              album={album}
              onPlay={() => handlePlayAlbum(album)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
