import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getArtistDetailData } from '@/server/music/artistService';
import { pythonClient } from '@/server/music/pythonClient';
import { ArtistSongsCatalog } from '@/components/artist/ArtistSongsCatalog';

interface ArtistSongsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ArtistSongsPageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getArtistDetailData(id);

  if (!data?.artist) {
    return {
      title: 'Artist Not Found | GULLYGANG',
      description: 'The requested artist catalog could not be found.',
    };
  }

  return {
    title: `All Songs — ${data.artist.name} | GULLYGANG Catalog`,
    description: `Browse all tracks, singles, and discography for ${data.artist.name} on GULLYGANG.`,
    alternates: {
      canonical: `/artist/${id}/songs`,
    },
  };
}

export default async function ArtistSongsPage({ params }: ArtistSongsPageProps) {
  const { id } = await params;
  const data = await getArtistDetailData(id);

  if (!data || !data.artist) {
    notFound();
  }

  // Fetch initial batch of catalog songs
  let catalogSongs = data.topSongs;
  let totalCount = catalogSongs.length;
  let hasMore = false;

  try {
    const fullCatalog = await pythonClient.getArtistSongs(id, 25, 0);
    if (fullCatalog.tracks && fullCatalog.tracks.length > 0) {
      catalogSongs = fullCatalog.tracks;
      totalCount = fullCatalog.totalCount || catalogSongs.length;
      hasMore = Boolean(fullCatalog.hasMore);
    }
  } catch {
    // Fall back to topSongs if catalog endpoint experiences an issue
  }

  return (
    <ArtistSongsCatalog
      artist={data.artist}
      initialTracks={catalogSongs}
      totalCount={totalCount}
      initialHasMore={hasMore}
    />
  );
}
