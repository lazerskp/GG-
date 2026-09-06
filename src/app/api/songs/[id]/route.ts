import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { pythonClient } from '@/server/music/pythonClient';
import { cacheService, CACHE_TTLS } from '@/server/cache/cacheService';
import { Song } from '@/types/music';

const paramsSchema = z.object({
  id: z.string().min(1).max(64),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await context.params;
  const parseResult = paramsSchema.safeParse(resolvedParams);

  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid song ID' }, { status: 400 });
  }

  const songId = parseResult.data.id;
  // v2 schema: honest field mapping — invalidates stale cache from previous schema
  const cacheKey = `song:v2:${songId}`;

  // Check Cache
  const cached = await cacheService.get<Song>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'X-Cache': 'HIT' },
    });
  }

  const song = await pythonClient.getSong(songId);
  if (!song) {
    return NextResponse.json({ error: 'Song not found' }, { status: 404 });
  }

  // Cache for 24 hours
  await cacheService.set(cacheKey, song, CACHE_TTLS.SONG, 'python_metadata');

  return NextResponse.json(song, {
    headers: { 'X-Cache': 'MISS' },
  });
}
