'use client';

import React from 'react';
import { Album, Song } from '@/types/music';
import { SectionHeader } from '@/components/music/SectionHeader';
import { AlbumCard } from '@/components/music/AlbumCard';
import { usePlayerStore } from '@/store/usePlayerStore';

interface NewReleasesProps {
  albums: Album[];
}

export function NewReleases({ albums }: NewReleasesProps) {
  const { playTrack } = usePlayerStore();

  if (!albums || albums.length === 0) return null;

  const handlePlayAlbum = (album: Album) => {
    // Generate a placeholder lead track for album playback
    const leadTrack: Song = {
      id: `album-lead-${album.id}`,
      title: `${album.title} (Intro)`,
      artist: album.artist,
      artistId: album.artistId,
      album: album.title,
      albumId: album.id,
      artworkUrl: album.artworkUrl,
      duration: 210,
      releaseYear: album.releaseYear,
      region: album.region,
      genre: 'Hip-Hop',
    };
    playTrack(leadTrack, [leadTrack]);
  };

  return (
    <section id="new-releases" className="mb-14 sm:mb-20 content-auto" aria-label="New Releases">
      <SectionHeader
        eyebrow="FRESH DROPS"
        title="New Releases"
        description="The latest full-length albums, EPs, and seminal project tapes hitting the scene."
      />

      {/* Desktop: Grid | Mobile: Horizontal Scroll with Snap */}
      <div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-3 md:pb-0 snap-x snap-mandatory">
        {albums.slice(0, 12).map((album) => (
          <div key={album.id} className="snap-start shrink-0 w-40 sm:w-44 md:w-auto">
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
