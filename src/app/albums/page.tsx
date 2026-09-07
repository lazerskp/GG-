import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight } from 'lucide-react';
import { musicService } from '@/services/musicService';
import { AlbumCard } from '@/components/music/AlbumCard';
import { WebPageJsonLd, ItemListJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Albums',
  description:
    'Browse the latest albums and EPs from Indian and global hip-hop on GULLYGANG. New releases, fresh drops, and curated picks.',
  alternates: {
    canonical: '/albums',
  },
  openGraph: {
    type: 'website',
    title: 'Albums — GULLYGANG',
    description:
      'Browse the latest albums and EPs from Indian and global hip-hop on GULLYGANG.',
    url: '/albums',
    siteName: 'GULLYGANG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Albums — GULLYGANG',
    description: 'Browse the latest albums and EPs from Indian and global hip-hop.',
  },
};

async function AlbumGrid() {
  let releases: Awaited<ReturnType<typeof musicService.getNewReleases>> = [];
  try {
    releases = await musicService.getNewReleases();
  } catch {
    releases = [];
  }

  if (releases.length === 0) {
    return (
      <p className="text-sm text-[#A1A1A1]">
        New releases are being indexed. Check back shortly.
      </p>
    );
  }

  const sorted = [...releases].sort((a, b) => (b.releaseYear ?? 0) - (a.releaseYear ?? 0));

  return (
    <section aria-label="New Releases" className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-white">
          New Releases
        </h2>
        <span className="text-[11px] font-mono text-[#8F8F8F]">{sorted.length} albums</span>
      </div>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {sorted.map((album) => (
          <li key={album.id}>
            <AlbumCard album={album} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function AlbumsIndexPage() {
  return (
    <>
      <WebPageJsonLd
        url="/albums"
        name="Albums — GULLYGANG"
        description="Browse the latest albums and EPs from Indian and global hip-hop on GULLYGANG."
      />
      <ItemListJsonLd
        url="/albums"
        name="Albums navigation"
        items={[
          { name: 'Charts', url: '/charts', position: 1 },
          { name: 'Artists', url: '/artists', position: 2 },
          { name: 'Editorial', url: '/blog', position: 3 },
        ]}
      />

      <div className="space-y-10 sm:space-y-14 py-6 sm:py-10">
        <header className="space-y-4 max-w-3xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#8F8F8F]">
            Albums
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.05]">
            New releases, straight from the catalog.
          </h1>
          <p className="text-base sm:text-lg text-[#A1A1A1] leading-relaxed">
            Albums and EPs from across Indian and global hip-hop. Live data,
            pulled from the same catalog that powers discovery on GULLYGANG.
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
              href="/artists"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-[#A1A1A1] hover:text-white hover:border-white/20 transition-colors"
            >
              <span>Artists</span>
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
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <li key={i}>
                    <div className="aspect-square w-full bg-white/[0.04] rounded-md animate-pulse" />
                  </li>
                ))}
              </ul>
            </div>
          }
        >
          <AlbumGrid />
        </Suspense>
      </div>
    </>
  );
}
