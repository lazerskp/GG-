import 'server-only';

import { pythonClient } from './pythonClient';
import { cacheService, CACHE_TTLS } from '@/server/cache/cacheService';
import { insforgeRepo } from '@/server/insforge/repository';
import { ArtistDetailPayload } from './providerTypes';

export async function getArtistDetailData(artistId: string): Promise<ArtistDetailPayload | null> {
  // v2 schema: honest field mapping (no fabricated listeners/genres/verification).
  // Version bump invalidates stale Tier-1/Tier-2 entries from the previous schema.
  const cacheKey = `artist_details:v2:${artistId}`;

  // 1. Check cache (24 hours TTL)
  const cached = await cacheService.get<ArtistDetailPayload>(cacheKey);
  if (cached && cached.artist) {
    return cached;
  }

  // 2. Fetch live data from Python microservice (ytmusicapi backend)
  const details = await pythonClient.getArtistDetails(artistId);
  if (!details) {
    return null;
  }

  // 3. Cache for 24 hours
  await cacheService.set(cacheKey, details, CACHE_TTLS.ARTIST, 'python_metadata');

  // 4. Background non-blocking persistence to InsForge
  (async () => {
    try {
      if (details.artist) {
        await insforgeRepo.upsertArtist(details.artist);
      }
      // Albums first so songs.album_id FK references resolve on insert.
      for (const album of details.topAlbums.slice(0, 5)) {
        await insforgeRepo.upsertAlbum(album);
      }
      for (const song of details.topSongs.slice(0, 5)) {
        await insforgeRepo.upsertSong(song);
      }
    } catch {
      // Ignore background persistence errors
    }
  })();

  return details;
}
