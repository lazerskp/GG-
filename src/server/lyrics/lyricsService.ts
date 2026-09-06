import 'server-only';

/**
 * Lyrics Service
 *
 * Orchestrates: cache → provider(s) → normalize → cache.
 * Provider Resolution Order:
 *   1. YTMusicLyricsProvider (exact videoId lookup via python metadata service)
 *   2. LRCLIBProvider (metadata search fallback)
 *
 * Honesty rules:
 *   - Synced lyrics when the provider returns valid synced timestamps.
 *   - Plain lyrics when only plain lyrics exist.
 *   - Explicit instrumental state when marked.
 *   - Clean unavailable state otherwise.
 *   - NEVER fabricates, generates, or substitutes lyrics.
 */

import { LyricsQuery, LyricsProvider, NormalizedLyrics } from './lyricsProvider';
import { YTMusicLyricsProvider } from './ytmusicLyricsProvider';
import { LrclibProvider } from './lrclibProvider';
import { parseLrc, splitPlainLyrics } from './lyricsParser';
import { getLyricsFromCache, setLyricsInCache } from './lyricsCache';
import { serverLogger } from '@/server/logger';

const providers: LyricsProvider[] = [
  new YTMusicLyricsProvider(),
  new LrclibProvider(),
];

export async function getLyrics(query: LyricsQuery): Promise<NormalizedLyrics> {
  const startTime = Date.now();
  const trackName = (query.title || '').trim();
  const artistName = (query.artist || '').trim();

  // 1. Cache first
  const cached = await getLyricsFromCache<NormalizedLyrics>(query);
  if (cached) {
    serverLogger.info('lyrics.resolve.cache_hit', {
      provider: cached.provider,
      videoId: query.videoId,
      status: cached.status,
      durationMs: Date.now() - startTime,
    });
    return { ...cached, trackName, artistName };
  }

  // 2. Try each provider in strict priority order (YTMusic -> LRCLIB)
  let result: NormalizedLyrics | null = null;

  for (const provider of providers) {
    try {
      const raw = await provider.getLyrics(query);
      if (!raw) {
        serverLogger.info(`lyrics.resolve.${provider.name}_unavailable`, {
          provider: provider.name,
          videoId: query.videoId,
          title: query.title,
          artist: query.artist,
        });
        continue;
      }

      if (raw.instrumental) {
        result = {
          status: 'instrumental',
          trackName,
          artistName,
          provider: provider.name,
        };
        serverLogger.info(`lyrics.resolve.${provider.name}_success`, {
          provider: provider.name,
          videoId: query.videoId,
          status: 'instrumental',
          fallbackUsed: provider.name !== 'ytmusic',
          durationMs: Date.now() - startTime,
        });
        break;
      }

      // Pre-parsed lines (e.g. from YTMusic)
      if (raw.lines && raw.lines.length > 0) {
        result = { status: 'synced', lines: raw.lines, trackName, artistName, provider: provider.name };
        serverLogger.info(`lyrics.resolve.${provider.name}_success`, {
          provider: provider.name,
          videoId: query.videoId,
          status: 'synced',
          lineCount: raw.lines.length,
          fallbackUsed: provider.name !== 'ytmusic',
          durationMs: Date.now() - startTime,
        });
        break;
      }

      // Raw LRC payload (e.g. from LRCLIB)
      if (raw.syncedLyrics) {
        const lines = parseLrc(raw.syncedLyrics);
        if (lines.length > 0) {
          result = { status: 'synced', lines, trackName, artistName, provider: provider.name };
          serverLogger.info(`lyrics.resolve.${provider.name}_success`, {
            provider: provider.name,
            videoId: query.videoId,
            status: 'synced',
            lineCount: lines.length,
            fallbackUsed: provider.name !== 'ytmusic',
            durationMs: Date.now() - startTime,
          });
          break;
        }
      }

      // Pre-split plain text lines (e.g. from YTMusic)
      if (raw.text && raw.text.length > 0) {
        result = { status: 'plain', text: raw.text, trackName, artistName, provider: provider.name };
        serverLogger.info(`lyrics.resolve.${provider.name}_success`, {
          provider: provider.name,
          videoId: query.videoId,
          status: 'plain',
          lineCount: raw.text.length,
          fallbackUsed: provider.name !== 'ytmusic',
          durationMs: Date.now() - startTime,
        });
        break;
      }

      // Raw plain lyrics string (e.g. from LRCLIB)
      if (raw.plainLyrics) {
        const text = splitPlainLyrics(raw.plainLyrics);
        if (text.length > 0) {
          result = { status: 'plain', text, trackName, artistName, provider: provider.name };
          serverLogger.info(`lyrics.resolve.${provider.name}_success`, {
            provider: provider.name,
            videoId: query.videoId,
            status: 'plain',
            lineCount: text.length,
            fallbackUsed: provider.name !== 'ytmusic',
            durationMs: Date.now() - startTime,
          });
          break;
        }
      }

      serverLogger.info(`lyrics.resolve.${provider.name}_unavailable`, {
        provider: provider.name,
        videoId: query.videoId,
        title: query.title,
        artist: query.artist,
      });
    } catch (err) {
      serverLogger.warn(`lyrics.resolve.${provider.name}_error`, {
        provider: provider.name,
        videoId: query.videoId,
        error: String(err),
      });
      continue;
    }
  }

  // 3. Honest unavailable state (cached to prevent provider hammering)
  if (!result) {
    serverLogger.info('lyrics.resolve.all_providers_failed', {
      videoId: query.videoId,
      title: query.title,
      artist: query.artist,
      durationMs: Date.now() - startTime,
    });
    result = { status: 'unavailable', trackName, artistName, provider: 'none' };
  }

  await setLyricsInCache(query, result);
  return result;
}
