import { NextRequest, NextResponse } from 'next/server';
import { pythonClient } from '@/server/music/pythonClient';
import { cacheService } from '@/server/cache/cacheService';
import { rateLimiter } from '@/server/rateLimiter';
import { serverLogger } from '@/server/logger';

interface RouteContext {
  params: Promise<{ videoId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const startTime = Date.now();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

  const rateCheck = await rateLimiter.check(`related:${ip}`, 120, 60000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      {
        status: 429,
        headers: { 'Retry-After': `${Math.ceil(rateCheck.resetMs / 1000)}` },
      }
    );
  }

  const { videoId } = await params;
  if (!videoId || videoId.length < 3) {
    return NextResponse.json({ error: 'Invalid videoId' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 50);
  const continuation = searchParams.get('continuation') || undefined;

  const cacheKey = `related:${videoId}:${limit}:${continuation || 'initial'}`;
  const cached = await cacheService.get(cacheKey);

  if (cached) {
    serverLogger.info('Related songs cache hit', {
      endpoint: `/api/related/${videoId}`,
      durationMs: Date.now() - startTime,
    });
    return NextResponse.json(cached, {
      headers: {
        'X-Cache': 'HIT',
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300',
      },
    });
  }

  const results = await pythonClient.getRelatedSongs(videoId, limit, continuation);

  if (results.tracks.length > 0) {
    await cacheService.set(cacheKey, results, 900); // 15 mins
  }

  serverLogger.info('Related songs cache miss', {
    endpoint: `/api/related/${videoId}`,
    durationMs: Date.now() - startTime,
  });

  return NextResponse.json(results, {
    headers: {
      'X-Cache': 'MISS',
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300',
    },
  });
}
