import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { pythonClient } from '@/server/music/pythonClient';
import { cacheService, CACHE_TTLS } from '@/server/cache/cacheService';
import { Album } from '@/types/music';

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
    return NextResponse.json({ error: 'Invalid album ID' }, { status: 400 });
  }

  const albumId = parseResult.data.id;
  // v2 schema: honest field mapping — invalidates stale cache from previous schema
  const cacheKey = `album:v2:${albumId}`;

  // Check Cache
  const cached = await cacheService.get<Album>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'X-Cache': 'HIT' },
    });
  }

  const album = await pythonClient.getAlbum(albumId);
  if (!album) {
    return NextResponse.json({ error: 'Album not found' }, { status: 404 });
  }

  // Cache for 24 hours
  await cacheService.set(cacheKey, album, CACHE_TTLS.ALBUM, 'python_metadata');

  return NextResponse.json(album, {
    headers: { 'X-Cache': 'MISS' },
  });
}
