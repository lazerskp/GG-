import { NextResponse } from 'next/server';
import { pythonClient } from '@/server/music/pythonClient';
import { insforgeRepo } from '@/server/insforge/repository';
import { cacheService, CACHE_TTLS } from '@/server/cache/cacheService';
import { serverLogger } from '@/server/logger';
import { Album } from '@/types/music';

const DISCOVERY_QUERIES = [
  'Seedhe Maut',
  'Krsna rap',
  'DIVINE rap',
  'Rawal rap',
  'Talha Anjum',
  'Raftaar rap',
  'Encore ABJ',
  'Calm rap',
];

export async function GET() {
  const cacheKey = 'albums:new-releases:v3';

  // 1. Check Cache
  const cached = await cacheService.get<Album[]>(cacheKey);
  if (cached && cached.length > 0) {
    return NextResponse.json(cached, {
      headers: {
        'X-Cache': 'HIT',
        'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=3600',
      },
    });
  }

  // 2. Query live albums from Python service
  const allAlbums: Album[] = [];
  try {
    const searchPromises = DISCOVERY_QUERIES.map((q) =>
      pythonClient.search(q).then((res) => res.albums || []).catch(() => [] as Album[])
    );
    const results = await Promise.all(searchPromises);
    for (const albumList of results) {
      allAlbums.push(...albumList);
    }
  } catch (err) {
    serverLogger.warn('[API Albums] Error querying live Python service', { error: String(err) });
  }

  // Deduplicate and filter out non-rap or noisy compilations
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const cleanAlbums: Album[] = [];

  for (const album of allAlbums) {
    if (!album || !album.title || !album.id) continue;
    if (seenIds.has(album.id)) continue;

    const titleKey = album.title.toLowerCase().trim();
    if (seenTitles.has(titleKey)) continue;

    // Filter out "Various Artists" and non-hip-hop noise
    if (album.artist === 'Various Artists') continue;
    if (/bollywood|non stop|dj jitesh|remix|funny|soundtrack/i.test(album.title)) continue;

    seenIds.add(album.id);
    seenTitles.add(titleKey);
    cleanAlbums.push(album);
  }

  // Sort descending by actual release year (newest first: 2026, 2025, 2024...)
  cleanAlbums.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));

  // Fallback to InsForge DB if live discovery returned empty
  if (cleanAlbums.length === 0) {
    try {
      const dbAlbums = await insforgeRepo.getAlbums();
      const filteredDb = dbAlbums.filter(
        (a) => a.artist !== 'Various Artists' && !/bollywood/i.test(a.title)
      );
      filteredDb.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
      cleanAlbums.push(...filteredDb);
    } catch {
      // Ignore
    }
  }

  if (cleanAlbums.length > 0) {
    await cacheService.set(cacheKey, cleanAlbums, CACHE_TTLS.ALBUM, 'live_discovery');

    // Asynchronous background persistence to InsForge
    Promise.resolve().then(async () => {
      try {
        for (const al of cleanAlbums.slice(0, 15)) {
          await insforgeRepo.upsertAlbum(al);
        }
      } catch {
        // Ignore background persistence errors
      }
    });
  }

  return NextResponse.json(cleanAlbums, {
    headers: {
      'X-Cache': 'MISS',
      'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=3600',
    },
  });
}
