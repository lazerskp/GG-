import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight } from 'lucide-react';
import { musicService } from '@/services/musicService';
import { AlbumCard } from '@/components/music/AlbumCard';
import { WebPageJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'New Releases | GULLYGANG',
  description:
    'Latest albums, EPs, and singles from Indian and global hip-hop, indexed live from the GULLYGANG catalog.',
  alternates: {
    canonical: 'https://gullygang.in/new-releases',
  },
  openGraph: {
    type: 'website',
    title: 'New Releases | GULLYGANG',
    description: 'Latest albums, EPs, and singles from Indian and global hip-hop.',
    url: 'https://gullygang.in/new-releases',
    siteName: 'GULLYGANG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'New Releases — GULLYGANG',
    description: 'Latest albums, EPs, and singles from Indian and global hip-hop.',
  },
};

async function ReleaseGrid() {
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

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {releases.map((album) => (
        <li key={album.id}>
          <AlbumCard album={album} />
        </li>
      ))}
    </ul>
  );
}

export default function NewReleasesPage() {
  return (
    <>
      <WebPageJsonLd
        url="/new-releases"
        name="New Releases — GULLYGANG"
        description="Latest albums, EPs, and singles from Indian and global hip-hop."
      />

      <div className="space-y-10 sm:space-y-14 py-6 sm:py-10">
        <header className="space-y-4 max-w-3xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#8F8F8F]">
            New Releases
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.05]">
            The freshest drops across the catalog.
          </h1>
          <p className="text-base sm:text-lg text-[#A1A1A1] leading-relaxed">
            Albums and EPs from across Indian and global hip-hop, ordered by
            release year. Live data, pulled from the same catalog that powers
            discovery on GULLYGANG.
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
              href="/albums"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-[#A1A1A1] hover:text-white hover:border-white/20 transition-colors"
            >
              <span>All Albums</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        <Suspense
          fallback={
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <li key={i}>
                  <div className="aspect-square w-full bg-white/[0.04] rounded-md animate-pulse" />
                </li>
              ))}
            </ul>
          }
        >
          <ReleaseGrid />
        </Suspense>
      </div>
    </>
  );
}
