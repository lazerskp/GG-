import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ArrowLeft, Disc3 } from 'lucide-react';
import { pythonClient } from '@/server/music/pythonClient';
import { cacheService, CACHE_TTLS } from '@/server/cache/cacheService';
import { Album } from '@/types/music';
import { TrackRow } from '@/components/music/TrackRow';
import { AlbumJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { RelatedEditorial } from '@/components/editorial/RelatedEditorial';
import { getArticlesByArtist } from '@/data/editorial/articles';

interface AlbumPageProps {
  params: Promise<{ id: string }>;
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://gullygang.in').replace(/\/$/, '');

export async function generateMetadata({ params }: AlbumPageProps): Promise<Metadata> {
  const { id } = await params;
  const album = await pythonClient.getAlbum(id);

  if (!album) {
    return {
      title: 'Album Not Found | GULLYGANG',
      description: 'The requested album could not be found on GULLYGANG.',
      robots: {
        index: false,
        follow: true,
        googleBot: { index: false, follow: true },
      },
    };
  }

  const title = `${album.title} by ${album.artist} | GULLYGANG`;
  const canonicalUrl = `${SITE_URL}/album/${encodeURIComponent(id)}`;
  const description = `Listen to ${album.title} by ${album.artist} on GULLYGANG. Explore the full release and tracklist.`;
  const albumImage = album.artworkUrl || null;

  return {
    title: {
      absolute: title,
    },
    description,
    openGraph: {
      title: `${album.title} by ${album.artist}`,
      description,
      type: 'music.album',
      url: canonicalUrl,
      ...(albumImage ? { images: [{ url: albumImage, alt: `${album.title} album artwork` }] } : {}),
    },
    twitter: {
      card: albumImage ? 'summary_large_image' : 'summary',
      title: `${album.title} by ${album.artist} | GULLYGANG`,
      description,
      ...(albumImage ? { images: [albumImage] } : {}),
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { id } = await params;
  // v2 schema: honest field mapping — invalidates stale cache from previous schema
  const cacheKey = `album:v2:${id}`;

  let album = await cacheService.get<Album>(cacheKey);
  if (!album) {
    album = await pythonClient.getAlbum(id);
    if (album) {
      await cacheService.set(cacheKey, album, CACHE_TTLS.ALBUM, 'python_metadata');
    }
  }

  if (!album) {
    notFound();
  }

  const relatedArticles = album.artistId ? getArticlesByArtist(album.artistId, album.artist) : [];

  return (
    <>
      <AlbumJsonLd album={album} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Albums', url: '/albums' },
          { name: album.title, url: `/album/${album.id}` },
        ]}
      />

      <div className="space-y-10 sm:space-y-14">
        {/* Back button */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#A1A1A1] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Catalog</span>
          </Link>
        </div>

        {/* Album Header Surface */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-6 sm:space-y-0 sm:space-x-8">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden bg-[#171717] shadow-2xl border border-white/[0.08] shrink-0">
            <Image
              src={album.artworkUrl}
              alt={album.title}
              fill
              priority
              sizes="224px"
              className="object-cover"
            />
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1]">
              {album.type}
              {album.releaseYear > 0 ? ` • ${album.releaseYear}` : ''}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              {album.title}
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 font-medium">
              By{' '}
              {album.artistId ? (
                <Link
                  href={`/artist/${encodeURIComponent(album.artistId)}`}
                  className="text-white hover:underline"
                >
                  {album.artist}
                </Link>
              ) : (
                <span className="text-white">{album.artist}</span>
              )}
            </p>
            {album.trackCount > 0 && (
              <p className="text-xs font-mono text-[#8F8F8F]">
                {album.trackCount} {album.trackCount === 1 ? 'Track' : 'Tracks'} • Stream metadata verified
              </p>
            )}
          </div>
        </div>

        {/* Live Tracklist (global player integration via TrackRow) */}
        {album.tracks && album.tracks.length > 0 && (
          <section aria-label="Album Tracklist" className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
              <Disc3 className="w-4 h-4 text-white" />
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-white">
                Tracklist
              </h2>
            </div>
            <div className="space-y-0.5 divide-y divide-white/[0.04]">
              {album.tracks.map((track, idx) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={idx}
                  playlistContext={album.tracks}
                />
              ))}
            </div>
          </section>
        )}

        {/* Album Information Note */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] max-w-2xl">
          <div className="flex items-center space-x-2.5 text-white mb-2">
            <Disc3 className="w-4 h-4 text-white" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider">Release Context</h3>
          </div>
          <p className="text-sm text-[#A1A1A1] leading-relaxed">
            This release is indexed from official discography metadata.
            {album.artistId ? (
              <>
                {' '}Visit{' '}
                <Link
                  href={`/artist/${encodeURIComponent(album.artistId)}`}
                  className="text-white hover:underline font-medium"
                >
                  {album.artist}&apos;s profile
                </Link>{' '}
                to explore top streaming anthems and related releases.
              </>
            ) : (
              ' Artist profile linking is unavailable for this release.'
            )}
          </p>
        </div>

        {/* Related Editorial */}
        {relatedArticles.length > 0 && (
          <RelatedEditorial
            articles={relatedArticles}
            heading="Editorial Featuring This Artist"
            variant="compact"
          />
        )}
      </div>
    </>
  );
}
