import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { musicService } from '@/services/musicService';
import { ArtistCard } from '@/components/music/ArtistCard';
import { deduplicateArtists } from '@/utils/artistDeduplication';
import { WebPageJsonLd, ItemListJsonLd } from '@/components/seo/JsonLd';
import { getAllTagSummaries, isTagIndexable } from '@/data/editorial/articles';

export const metadata: Metadata = {
  title: 'Artists',
  description:
    'Browse Indian and global hip-hop artists on GULLYGANG. Profiles, top tracks, releases, and editorial picks from across the scene.',
  alternates: {
    canonical: '/artists',
  },
  openGraph: {
    type: 'website',
    title: 'Artists — GULLYGANG',
    description:
      'Browse Indian and global hip-hop artists — profiles, top tracks, releases, and editorial picks.',
    url: '/artists',
    siteName: 'GULLYGANG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artists — GULLYGANG',
    description: 'Browse Indian and global hip-hop artists.',
  },
};

async function ArtistGrid() {
  let indian: Awaited<ReturnType<typeof musicService.getFeaturedIndianArtists>> = [];
  let global: Awaited<ReturnType<typeof musicService.getFeaturedGlobalArtists>> = [];

  try {
    [indian, global] = await Promise.all([
      musicService.getFeaturedIndianArtists(),
      musicService.getFeaturedGlobalArtists(),
    ]);
  } catch {
    indian = [];
    global = [];
  }

  const indianArtists = deduplicateArtists(indian);
  const globalArtists = deduplicateArtists(global);

  if (indianArtists.length === 0 && globalArtists.length === 0) {
    return (
      <p className="text-sm text-[#A1A1A1]">
        The artist catalog is being indexed. Check back shortly.
      </p>
    );
  }

  return (
    <div className="space-y-12">
      {indianArtists.length > 0 && (
        <section aria-label="Indian Hip-Hop Artists" className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-white">
              Indian Hip-Hop
            </h2>
            <span className="text-[11px] font-mono text-[#8F8F8F]">{indianArtists.length} artists</span>
          </div>
          <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 sm:gap-6">
            {indianArtists.slice(0, 18).map((artist) => (
              <li key={artist.id}>
                <ArtistCard artist={artist} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {globalArtists.length > 0 && (
        <section aria-label="Global Hip-Hop Artists" className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-white">
              Global Hip-Hop
            </h2>
            <span className="text-[11px] font-mono text-[#8F8F8F]">{globalArtists.length} artists</span>
          </div>
          <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 sm:gap-6">
            {globalArtists.slice(0, 12).map((artist) => (
              <li key={artist.id}>
                <ArtistCard artist={artist} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function TopicLinks() {
  const indexableTags = getAllTagSummaries().filter(isTagIndexable);
  if (indexableTags.length === 0) return null;

  return (
    <section aria-label="Topics" className="space-y-4">
      <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
        <BookOpen className="w-4 h-4 text-white" />
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white">
          Topics
        </span>
      </div>
      <ul className="flex flex-wrap gap-2">
        {indexableTags.map((tag) => (
          <li key={tag.slug}>
            <Link
              href={`/blog/tag/${tag.slug}`}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-xs font-medium text-[#A1A1A1] hover:text-white hover:border-white/20 transition-colors"
            >
              <span>{tag.slug}</span>
              <span className="text-[#8F8F8F] font-mono">· {tag.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ArtistsIndexPage() {
  const itemList = [
    { name: 'Indian Hip-Hop', url: '/artists#indian', position: 1 },
    { name: 'Global Hip-Hop', url: '/artists#global', position: 2 },
    { name: 'Editorial Hub', url: '/blog', position: 3 },
  ];

  return (
    <>
      <WebPageJsonLd
        url="/artists"
        name="Artists — GULLYGANG"
        description="Browse Indian and global hip-hop artists on GULLYGANG."
      />
      <ItemListJsonLd
        url="/artists"
        name="Artists navigation"
        items={itemList}
      />

      <div className="space-y-10 sm:space-y-14 py-6 sm:py-10">
        <header className="space-y-4 max-w-3xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#8F8F8F]">
            Artists
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.05]">
            Every artist indexed on GULLYGANG.
          </h1>
          <p className="text-base sm:text-lg text-[#A1A1A1] leading-relaxed">
            Profiles, top tracks, releases, and editorial links for the MCs
            shaping Indian and global hip-hop right now.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
            <Link
              href="/charts"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-[#A1A1A1] hover:text-white hover:border-white/20 transition-colors"
            >
              <span>Charts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/albums"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-[#A1A1A1] hover:text-white hover:border-white/20 transition-colors"
            >
              <span>Albums</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-[#A1A1A1] hover:text-white hover:border-white/20 transition-colors"
            >
              <span>Editorial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="h-6 w-48 bg-white/[0.04] rounded animate-pulse" />
              <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 sm:gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <li key={i}>
                    <div className="w-full aspect-square rounded-full bg-white/[0.04] animate-pulse" />
                  </li>
                ))}
              </ul>
            </div>
          }
        >
          <ArtistGrid />
        </Suspense>

        <TopicLinks />
      </div>
    </>
  );
}
