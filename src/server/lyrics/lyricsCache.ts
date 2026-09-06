import 'server-only';

/**
 * Lyrics Cache
 *
 * Lyrics are immutable per recording, so they can be cached aggressively.
 * Uses the existing layered cache architecture (Tier 1 memory + Tier 2 InsForge DB).
 *
 * v2 Cache Keys:
 * - When videoId is present: `lyrics:v2:video:{videoId}`
 * - When falling back without videoId: `lyrics:v2:metadata:{title}__{artist}__{album}@{duration}`
 */

import { cacheService } from '@/server/cache/cacheService';
import { NormalizedLyrics, LyricsQuery } from './lyricsProvider';
import { extractCleanYouTubeId } from '@/utils/cleanYouTubeId';

const LYRICS_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export function buildCacheKey(query: LyricsQuery): string {
  if (query.videoId) {
    const cleanId = extractCleanYouTubeId(query.videoId);
    if (cleanId && cleanId.length >= 5) {
      return `lyrics:v2:video:${cleanId}`;
    }
  }

  const normalize = (value?: string) =>
    (value || '').trim().toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]/g, '');
  const durationPart = query.duration && query.duration > 0 ? `@${Math.round(query.duration)}` : '';
  return `lyrics:v2:metadata:${normalize(query.title)}__${normalize(query.artist)}__${normalize(query.album)}${durationPart}`;
}

export async function getLyricsFromCache<T extends NormalizedLyrics>(
  query: LyricsQuery
): Promise<T | null> {
  return cacheService.get<T>(buildCacheKey(query));
}

export async function setLyricsInCache<T extends NormalizedLyrics>(
  query: LyricsQuery,
  lyrics: T
): Promise<void> {
  const providerTag = lyrics.provider || 'none';
  await cacheService.set(buildCacheKey(query), lyrics, LYRICS_TTL_SECONDS, providerTag);
}
