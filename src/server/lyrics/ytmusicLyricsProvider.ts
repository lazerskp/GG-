import 'server-only';

/**
 * YouTube Music Lyrics Provider
 *
 * Resolves synchronized or plain lyrics directly using the currently playing
 * track's exact YouTube video ID via the internal Python metadata service (ytmusicapi).
 * Server-only: the browser never talks to unofficial YouTube endpoints.
 *
 * Provider responsibility:
 *   YTMusicLyricsProvider
 *       ↓
 *   Call internal Python music service (pythonClient.getLyrics)
 *       ↓
 *   Pass exact videoId
 *       ↓
 *   Receive validated source response (synced / plain / instrumental / unavailable)
 *       ↓
 *   Normalize into LyricsProviderResult
 */

import { LyricsProvider, LyricsProviderResult, LyricsQuery } from './lyricsProvider';
import { pythonClient } from '@/server/music/pythonClient';
import { extractCleanYouTubeId } from '@/utils/cleanYouTubeId';
import { LyricLine } from '@/types/lyrics';
import { serverLogger } from '@/server/logger';

export class YTMusicLyricsProvider implements LyricsProvider {
  public readonly name = 'ytmusic';

  public async getLyrics(query: LyricsQuery): Promise<LyricsProviderResult | null> {
    if (!query.videoId) {
      return null;
    }

    const cleanVideoId = extractCleanYouTubeId(query.videoId);
    if (!cleanVideoId || cleanVideoId.length < 5) {
      return null;
    }

    try {
      const resp = await pythonClient.getLyrics(cleanVideoId);
      if (!resp || resp.status === 'unavailable') {
        return null;
      }

      const trackName = query.title || '';
      const artistName = query.artist || '';

      if (resp.status === 'instrumental') {
        return {
          instrumental: true,
          trackName,
          artistName,
          provider: this.name,
        };
      }

      if (resp.status === 'synced' && resp.lines && resp.lines.length > 0) {
        const lines: LyricLine[] = resp.lines.map((l) => ({
          startTime: Number(l.startTime),
          endTime: l.endTime !== null && l.endTime !== undefined ? Number(l.endTime) : undefined,
          text: l.text,
        }));

        return {
          lines,
          trackName,
          artistName,
          provider: this.name,
        };
      }

      if (resp.status === 'plain' && resp.text && resp.text.length > 0) {
        return {
          text: resp.text,
          plainLyrics: resp.text.join('\n'),
          trackName,
          artistName,
          provider: this.name,
        };
      }

      return null;
    } catch (err) {
      serverLogger.warn('YTMusicLyricsProvider error for videoId', {
        videoId: cleanVideoId,
        error: String(err),
      });
      return null;
    }
  }
}
