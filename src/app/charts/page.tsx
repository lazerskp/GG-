import React from 'react';
import type { Metadata } from 'next';
import { ChartsView } from '@/components/charts/ChartsView';
import { WebPageJsonLd } from '@/components/seo/JsonLd';
import { pythonClient } from '@/server/music/pythonClient';
import { cache } from 'react';

export const revalidate = 600; // 10 minutes ISR

export const metadata: Metadata = {
  title: 'Charts',
  description:
    'Live trending hip-hop charts for India and Global — discover the hottest tracks in Indian rap, Desi Hip-Hop, and international hip-hop.',
  alternates: {
    canonical: '/charts',
  },
  openGraph: {
    title: 'Charts — GULLYGANG',
    description: 'Live trending hip-hop charts for India and Global.',
    type: 'website',
    url: '/charts',
  },
  twitter: {
    card: 'summary',
    title: 'Charts — GULLYGANG',
    description: 'Live trending hip-hop charts for India and Global.',
  },
};

/**
 * Server-rendered initial chart payload for the default region ('india').
 *
 * The same cached function is reused by /charts?region=global via the
 * searchParams-aware wrapper below. Caching is request-scoped to dedupe
 * within a single render and ISR-time across requests.
 */
const getInitialChart = cache(async (region: 'india' | 'global') => {
  try {
    const data = await pythonClient.getCharts(region);
    return {
      region: data.region,
      updatedAt: data.updatedAt || new Date().toISOString(),
      source: data.source || 'live',
      songs: data.tracks,
      artists: data.artists,
    };
  } catch {
    return {
      region,
      updatedAt: new Date().toISOString(),
      source: 'empty',
      songs: [],
      artists: [],
    };
  }
});

interface ChartsPageProps {
  searchParams: Promise<{ region?: string | string[]; genre?: string | string[] }>;
}

const ALLOWED_REGIONS = new Set(['india', 'global']);
const ALLOWED_GENRES = new Set(['drill', 'trap', 'underground', 'boom-bap']);

function normalizeParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) value = value[0];
  if (!value) return null;
  const trimmed = value.toString().trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

export default async function ChartsPage({ searchParams }: ChartsPageProps) {
  const params = await searchParams;
  const requestedRegion = normalizeParam(params.region);
  const requestedGenre = normalizeParam(params.genre);

  // Region: only the two real chart buckets are valid. Anything else
  // falls back to the default (india) to keep the canonical /charts URL
  // meaningful and avoid creating thin duplicate pages.
  const region: 'india' | 'global' = (requestedRegion && ALLOWED_REGIONS.has(requestedRegion))
    ? (requestedRegion as 'india' | 'global')
    : 'india';

  // Genre: only genres with a real chart bucket are accepted. Unknown
  // values are silently dropped so that URLs do not produce thin pages.
  const genre = (requestedGenre && ALLOWED_GENRES.has(requestedGenre)) ? requestedGenre : null;

  // SSR initial data. The client component receives this and skips its
  // own fetch for the active region on first render.
  const initialData = await getInitialChart(region);

  return (
    <>
      <WebPageJsonLd
        url="/charts"
        name="Charts — GULLYGANG"
        description="Live trending hip-hop charts for India and Global."
      />
      <ChartsView initialRegion={region} initialGenre={genre} initialData={initialData} />
    </>
  );
}
