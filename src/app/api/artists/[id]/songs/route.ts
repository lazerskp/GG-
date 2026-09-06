import { NextRequest, NextResponse } from 'next/server';
import { pythonClient } from '@/server/music/pythonClient';
import { cacheService } from '@/server/cache/cacheService';
import { rateLimiter } from '@/server/rateLimiter';
import { serverLogger } from '@/server/logger';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const startTime = Date.now();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

  const rateCheck = await rateLimiter.check(`artist-songs:${ip}`, 60, 60000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      {
        status: 429,
        headers: { 'Retry-After': `${Math.ceil(rateCheck.resetMs / 1000)}` },
      }
    );
  }

  const { id } = await params;
  if (!id || id.length < 2) {
    return NextResponse.json({ error: 'Invalid artist id' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 100);
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

  const cacheKey = `artist-songs:${id}:${limit}:${offset}`;
  const cached = await cacheService.get(cacheKey);

  if (cached) {
    serverLogger.info('Artist songs cache hit', {
      endpoint: `/api/artists/${id}/songs`,
      durationMs: Date.now() - startTime,
    });
    return NextResponse.json(cached, {
      headers: {
        'X-Cache': 'HIT',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      },
    });
  }

  const results = await pythonClient.getArtistSongs(id, limit, offset);

  if (results.tracks.length > 0) {
    await cacheService.set(cacheKey, results, 3600); // 1 hour
  }

  serverLogger.info('Artist songs cache miss', {
    endpoint: `/api/artists/${id}/songs`,
    durationMs: Date.now() - startTime,
  });

  return NextResponse.json(results, {
    headers: {
      'X-Cache': 'MISS',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}
