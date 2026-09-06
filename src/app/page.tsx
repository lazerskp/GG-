import { Suspense } from 'react';
import { musicService } from '@/services/musicService';
import { getDailyFeature } from '@/services/dailyFeatureService';
import { IndianRapHero } from '@/components/home/IndianRapHero';
import { FeaturedArtists } from '@/components/home/FeaturedArtists';
import { TrendingTracks } from '@/components/home/TrendingTracks';
import { DailyFeature } from '@/components/home/DailyFeature';
import { GlobalRapSection } from '@/components/home/GlobalRapSection';
import { NewReleases } from '@/components/home/NewReleases';
import { ExploreGenres } from '@/components/home/ExploreGenres';
import { QuickSearch } from '@/components/home/QuickSearch';

export const metadata = {
  title: 'GULLYGANG — Music Discovery & Immersive Listening',
  description: 'A modern music discovery platform for Indian rap, Desi Hip-Hop, and global sounds. Daily curated drops, immersive fullscreen playback, and real-time synced lyrics.',
  openGraph: {
    title: 'GULLYGANG — Music Discovery & Immersive Listening',
    description: 'Discover trending music across Indian rap, Hindi, Odia, Bollywood, and global catalogs with immersive playback and real-time lyrics.',
    siteName: 'GULLYGANG',
    type: 'website' as const,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'GULLYGANG — Music Discovery & Immersive Listening',
    description: 'Discover trending music with immersive playback and real-time lyrics.',
  },
  alternates: {
    canonical: '/',
  },
};

async function DailyFeatureSection() {
  const dailyFeatureData = await getDailyFeature();
  return <DailyFeature data={dailyFeatureData} />;
}

async function GlobalRapSectionAsync() {
  const [globalArtists, globalTracks] = await Promise.all([
    musicService.getFeaturedGlobalArtists(),
    musicService.getTrendingGlobalTracks(),
  ]);
  return (
    <GlobalRapSection
      artists={globalArtists.slice(0, 12)}
      tracks={globalTracks.slice(0, 15)}
    />
  );
}

async function NewReleasesSection() {
  const newReleases = await musicService.getNewReleases();
  return <NewReleases albums={newReleases.slice(0, 12)} />;
}

export default async function HomePage() {
  // Fast initial viewport resolution: hero spotlight, originators, & primary rotation
  const [heroData, indianArtists, indianTracks] = await Promise.all([
    musicService.getHeroFeaturedTrack(),
    musicService.getFeaturedIndianArtists(),
    musicService.getTrendingIndianTracks(),
  ]);

  return (
    <div className="space-y-2">
      {/* 1. Indian Rap Hero — Flushed immediately for optimal FCP / LCP */}
      <IndianRapHero
        artist={heroData?.artist}
        track={heroData?.song}
        playlistContext={indianTracks}
      />

      {/* 2. Featured Indian Artists — Rendered synchronously with hero & rotation to prevent layout shifts */}
      <FeaturedArtists
        artists={indianArtists.slice(0, 12)}
        title="Featured Indian Artists"
        eyebrow="ORIGINATORS & LEADERS"
      />

      {/* 3. Trending Indian Rap */}
      <TrendingTracks
        tracks={indianTracks}
        title="Trending Indian Rap"
        eyebrow="CURRENT ROTATION"
        description="The heavyweight tracks capturing the sound of Mumbai, Delhi, Bengaluru, and beyond."
      />

      {/* 4. The Daily Feature (Automated Daily Rotation) — Streamed asynchronously */}
      <Suspense fallback={<div className="min-h-[280px]" aria-hidden="true" />}>
        <DailyFeatureSection />
      </Suspense>

      {/* 5. International Rap / Global Rap — Streamed asynchronously */}
      <Suspense fallback={<div className="min-h-[300px]" aria-hidden="true" />}>
        <GlobalRapSectionAsync />
      </Suspense>

      {/* 6. New Releases — Streamed asynchronously */}
      <Suspense fallback={<div className="min-h-[220px]" aria-hidden="true" />}>
        <NewReleasesSection />
      </Suspense>

      {/* 7. Explore Styles */}
      <ExploreGenres />

      {/* 8. Quick Search */}
      <QuickSearch />
    </div>
  );
}
