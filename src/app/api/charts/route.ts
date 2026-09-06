import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { pythonClient } from '@/server/music/pythonClient';
import { ChartPayload } from '@/server/music/providerTypes';
import { cacheService, CACHE_TTLS } from '@/server/cache/cacheService';
import { rateLimiter } from '@/server/rateLimiter';
import { insforgeRepo } from '@/server/insforge/repository';
import { serverLogger } from '@/server/logger';

const RegionSchema = z.enum(['india', 'global']).default('india');

export async function GET(request: NextRequest) {
  // 1. Rate Limiting Check
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const rateCheck = await rateLimiter.check(`charts:${ip}`, 60, 60000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      { status: 429, headers: { 'Retry-After': `${Math.ceil(rateCheck.resetMs / 1000)}` } }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const rawRegion = searchParams.get('region') || 'india';
    const parsed = RegionSchema.safeParse(rawRegion.toLowerCase());
    const region = parsed.success ? parsed.data : 'india';

    const cacheKey = `charts:v2:${region}`;

    // 2. Check Cache (6h TTL)
    const cached = await cacheService.get<ChartPayload>(cacheKey);
    if (cached) {
      return NextResponse.json(
        {
          region: cached.region,
          updatedAt: cached.updatedAt,
          source: cached.source,
          songs: cached.tracks,
          trendingArtists: cached.artists,
          tracks: cached.tracks,
          artists: cached.artists,
        },
        {
          headers: {
            'X-Cache': 'HIT',
            'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=3600',
          },
        }
      );
    }

    // 3. Fetch from live Python service
    const charts = await pythonClient.getCharts(region);

    // 4. Cache normalized result — only when tracks were returned, so a transient
    //    upstream timeout (empty fallback) is never cached for the full TTL.
    if (charts.tracks.length > 0) {
      await cacheService.set(cacheKey, charts, CACHE_TTLS.CHARTS, 'python_metadata');
    } else {
      serverLogger.warn('Empty charts payload — skipping cache write (possible upstream failure)', { region });
    }

    // 5. Asynchronous persistence to InsForge in background
    Promise.resolve().then(async () => {
      try {
        for (const artist of charts.artists) {
          await insforgeRepo.upsertArtist(artist);
        }
        for (const track of charts.tracks) {
          await insforgeRepo.upsertSong(track);
        }
      } catch (persistErr) {
        serverLogger.warn('Failed background chart persistence to InsForge', { error: String(persistErr) });
      }
    });

    return NextResponse.json(
      {
        region: charts.region,
        updatedAt: charts.updatedAt,
        source: charts.source,
        songs: charts.tracks,
        trendingArtists: charts.artists,
        tracks: charts.tracks,
        artists: charts.artists,
      },
      {
        headers: {
          'X-Cache': 'MISS',
          'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error) {
    serverLogger.error('API /api/charts failed', { error: String(error) });
    return NextResponse.json(
      { error: 'Unable to load charts right now. Please try again shortly.' },
      { status: 500 }
    );
  }
}
