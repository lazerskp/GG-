import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { pythonClient } from '@/server/music/pythonClient';
import { SearchResultPayload } from '@/server/music/providerTypes';
import { cacheService } from '@/server/cache/cacheService';
import { rateLimiter } from '@/server/rateLimiter';
import { serverLogger } from '@/server/logger';

const searchSchema = z.object({
  q: z.string().min(1, 'Search query must not be empty').max(100),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

  // 1. Rate Limiting Check
  const rateCheck = await rateLimiter.check(`search:${ip}`, 60, 60000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Too many search requests. Please slow down.', code: 'RATE_LIMITED' },
      {
        status: 429,
        headers: {
          ...corsHeaders,
          'Retry-After': `${Math.ceil(rateCheck.resetMs / 1000)}`,
        },
      }
    );
  }

  // 2. Validate Query
  const { searchParams } = new URL(request.url);
  const parseResult = searchSchema.safeParse({ q: searchParams.get('q') });

  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message || 'Invalid search query', code: 'INVALID_QUERY' },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  const query = parseResult.data.q;

  // 3. Check Cache
  const cached = await cacheService.getSearch<SearchResultPayload>(query);
  if (cached) {
    serverLogger.info('Search cache hit', {
      endpoint: '/api/search',
      cacheStatus: 'HIT',
      durationMs: Date.now() - startTime,
    });
    return NextResponse.json(cached, {
      headers: {
        ...corsHeaders,
        'X-Cache': 'HIT',
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300',
      },
    });
  }

  // 4. Fetch from live Python ytmusicapi service
  const results = await pythonClient.search(query);

  // If the upstream service failed or timed out, report 503 instead of false empty
  if (results.serviceStatus === 'upstream_error' || results.serviceStatus === 'timeout' || results.serviceStatus === 'network_error') {
    serverLogger.error('Search upstream failure', {
      endpoint: '/api/search',
      query,
      serviceStatus: results.serviceStatus,
      errorMessage: results.errorMessage,
      durationMs: Date.now() - startTime,
    });
    return NextResponse.json(
      {
        error: 'Search service is temporarily unavailable. Please try again in a moment.',
        code: results.serviceStatus === 'timeout' ? 'UPSTREAM_TIMEOUT' : 'SERVICE_UNAVAILABLE',
        query,
        artists: [],
        songs: [],
        albums: [],
      },
      {
        status: 503,
        headers: {
          ...corsHeaders,
          'Retry-After': '5',
        },
      }
    );
  }

  // 5. Store in Cache (15m TTL) — only when the payload has content
  if (results.artists.length > 0 || results.songs.length > 0 || results.albums.length > 0 || (results.videos?.length ?? 0) > 0) {
    await cacheService.setSearch(query, results);
  } else {
    serverLogger.info('Search completed with 0 results', {
      endpoint: '/api/search',
      query,
      durationMs: Date.now() - startTime,
    });
  }

  // 6. Controlled persistence into InsForge for discovered entities
  if (results.artists.length > 0) {
    const { insforgeRepo } = await import('@/server/insforge/repository');
    for (const a of results.artists.slice(0, 2)) {
      insforgeRepo.upsertArtist(a).catch(() => {});
    }
  }

  serverLogger.info('Search cache miss', {
    endpoint: '/api/search',
    cacheStatus: 'MISS',
    durationMs: Date.now() - startTime,
  });

  return NextResponse.json(results, {
    headers: {
      ...corsHeaders,
      'X-Cache': 'MISS',
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300',
    },
  });
}

