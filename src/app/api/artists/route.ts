import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { insforgeClient } from '@/server/insforge/client';
import { cacheService, CACHE_TTLS } from '@/server/cache/cacheService';
import { serverConfig } from '@/server/config';
import { getDevIndianArtists, getDevGlobalArtists } from '@/data/fixtures';
import { Artist } from '@/types/music';

const querySchema = z.object({
  region: z.enum(['india', 'global']).optional(),
});

interface InsForgeArtistRow extends Record<string, unknown> {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image_url: string;
  region: 'india' | 'global';
  monthly_listeners?: string;
  genres?: string[];
  verified?: boolean;
  metadata?: {
    moniker?: string;
    [key: string]: unknown;
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parseResult = querySchema.safeParse({
    region: searchParams.get('region') || undefined,
  });

  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
  }

  const region = parseResult.data.region;
  const cacheKey = `artists:list:${region || 'all'}`;

  const cached = await cacheService.get<Artist[]>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'X-Cache': 'HIT' },
    });
  }

  // Fetch from InsForge database
  let artists: Artist[] = [];
  try {
    const filters: Record<string, string> = {};
    if (region) filters.region = region;
    const records = await insforgeClient.select<InsForgeArtistRow>('artists', filters);
    if (records && records.length > 0) {
      artists = records.map((item) => ({
        id: item.id,
        name: item.name,
        moniker: item.metadata?.moniker || '',
        bio: item.description || '',
        imageUrl: item.image_url,
        region: item.region,
        monthlyListeners: item.monthly_listeners || '',
        genres: item.genres || [],
        verified: item.verified ?? true,
      }));
    }
  } catch (err) {
    console.warn('[API Artists] InsForge query failed:', err);
  }

  // Development fixtures fallback ONLY if explicitly toggled on
  if (artists.length === 0 && serverConfig.useDevFixtures) {
    const all = [
      ...getDevIndianArtists(),
      ...getDevGlobalArtists(),
    ];
    const seen = new Set<string>();
    artists = all.filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      if (region && a.region !== region) return false;
      return true;
    });
  }

  if (artists.length > 0) {
    await cacheService.set(cacheKey, artists, CACHE_TTLS.ARTIST, 'insforge');
  }

  return NextResponse.json(artists, {
    headers: { 'X-Cache': 'MISS' },
  });
}
