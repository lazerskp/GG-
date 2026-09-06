import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { CheckCircle2, ArrowLeft, Disc3, Music2, Users } from 'lucide-react';
import { getArtistDetailData } from '@/server/music/artistService';
import { TrackRow } from '@/components/music/TrackRow';
import { AlbumCard } from '@/components/music/AlbumCard';
import { ArtistCard } from '@/components/music/ArtistCard';
import { ArtistHeroControls } from '@/components/artist/ArtistHeroControls';
import { ArtistHeroAmbient } from '@/components/artist/ArtistHeroAmbient';

interface ArtistPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getArtistDetailData(id);

  if (!data?.artist) {
    return {
      title: 'Artist Not Found',
      description: 'The requested artist could not be found on GULLYGANG.',
    };
  }

  const title = `${data.artist.name}`;
  const description = data.artist.bio
    ? data.artist.bio.slice(0, 160)
    : `Listen to ${data.artist.name} on GULLYGANG. Explore top tracks, albums, and discography.`;
  const artistImage = data.artist.imageUrl || null;

  return {
    title,
    description,
    openGraph: {
      title: `${data.artist.name} on GULLYGANG`,
      description,
      type: 'profile',
      url: `/artist/${id}`,
      ...(artistImage ? { images: [{ url: artistImage, alt: data.artist.name }] } : {}),
    },
    twitter: {
      card: artistImage ? 'summary_large_image' : 'summary',
      title: `${data.artist.name} on GULLYGANG`,
      description,
      ...(artistImage ? { images: [artistImage] } : {}),
    },
    alternates: {
      canonical: `/artist/${id}`,
    },
  };
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { id } = await params;
  const data = await getArtistDetailData(id);

  if (!data || !data.artist) {
    notFound();
  }

  const { artist, topSongs, newReleases, topAlbums, relatedArtists } = data;

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Back Navigation Bar */}
      <div className="flex items-center space-x-2">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#A1A1A1] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Catalog</span>
        </Link>
      </div>

      {/* 1. Immersive Editorial Hero (No heavy cards, edge-blending depth) */}
      <header className="relative -mt-6 rounded-2xl overflow-hidden min-h-[380px] sm:min-h-[460px] flex flex-col justify-end p-6 sm:p-10 lg:p-14">
        {/* Ambient Artwork Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Artwork-derived ambient palette (extracted client-side via artworkColorEngine) */}
          <ArtistHeroAmbient imageUrl={artist.imageUrl} cacheKey={`artist-hero:${artist.id}`} />
          <Image
            src={artist.imageUrl?.trim() || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop'}
            alt={artist.name}
            fill
            priority
            sizes="100vw"
            className="object-cover object-top opacity-35 filter contrast-110 saturate-90 scale-100 hover:scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Continuous Blending Vignettes */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
        </div>

        {/* Hero Content Surface */}
        <div className="relative z-10 space-y-4 max-w-4xl">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {artist.verified && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-medium text-white border border-white/15">
                <CheckCircle2 className="w-3.5 h-3.5 text-white fill-white/20" />
                <span>Verified Artist</span>
              </span>
            )}
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1]">
              {artist.region === 'india' ? 'Desi Hip-Hop' : 'Global Rap'}
            </span>
            {artist.genres?.map((genre) => (
              <span
                key={genre}
                className="inline-block px-2.5 py-0.5 rounded-full bg-white/[0.04] text-[11px] text-[#8F8F8F]"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Artist Name */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-none">
            {artist.name}
          </h1>

          {/* Audience and Bio Excerpt */}
          <div className="space-y-2">
            {artist.monthlyListeners && (
              <p className="text-xs sm:text-sm font-mono text-[#A1A1A1]">
                {artist.monthlyListeners} monthly listeners
              </p>
            )}
            {artist.bio && (
              <p className="text-sm sm:text-base text-neutral-300 max-w-2xl leading-relaxed line-clamp-3">
                {artist.bio}
              </p>
            )}
          </div>

          {/* Action Controls (Play & Shuffle) */}
          <ArtistHeroControls songs={topSongs} artistName={artist.name} />
        </div>
      </header>

      {/* 2. TOP SONGS */}
      {topSongs && topSongs.length > 0 && (
        <section aria-label="Top Songs" className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center space-x-2">
              <Music2 className="w-4 h-4 text-white" />
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-white">
                Top Songs
              </h2>
            </div>
            <Link
              href={`/artist/${encodeURIComponent(artist.id)}/songs`}
              className="text-xs font-mono uppercase tracking-wider text-[#A1A1A1] hover:text-white transition-colors flex items-center space-x-1.5 group"
            >
              <span>Browse All Songs</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="space-y-0.5 divide-y divide-white/[0.04]">
            {topSongs.slice(0, 5).map((song, idx) => (
              <TrackRow
                key={song.id}
                track={song}
                index={idx}
                playlistContext={topSongs}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. RELEASES */}
      {newReleases && newReleases.length > 0 && (
        <section aria-label="Releases" className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
            <Disc3 className="w-4 h-4 text-white" />
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-white">
              Releases
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {newReleases.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {/* 4. ALBUMS — Desktop: multi-column grid | Mobile: horizontal snap scrolling */}
      {topAlbums && topAlbums.length > 0 && (
        <section aria-label="Albums" className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
            <Disc3 className="w-4 h-4 text-white" />
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-white">
              Albums
            </h2>
          </div>

          <div className="flex md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-2 md:pb-0 snap-x snap-mandatory">
            {topAlbums.map((album) => (
              <div key={album.id} className="snap-start shrink-0 w-40 sm:w-48 md:w-auto">
                <AlbumCard album={album} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. RELATED ARTISTS */}
      {relatedArtists && relatedArtists.length > 0 && (
        <section aria-label="Related Artists" className="space-y-4 pt-4">
          <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
            <Users className="w-4 h-4 text-white" />
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-white">
              Related Artists
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 sm:gap-6 pt-2">
            {relatedArtists.map((rel) => (
              <ArtistCard key={rel.id} artist={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
