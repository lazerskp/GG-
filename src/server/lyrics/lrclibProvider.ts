import 'server-only';

/**
 * LRCLIB Lyrics Provider
 *
 * Uses the public, community-run LRCLIB (https://lrclib.net) API for licensed
 * lyric discovery. No API keys required; strictly metadata-driven requests.
 * Server-only: the client never talks to LRCLIB directly.
 *
 * Resolution strategy:
 *   1. Exact match via /api/get (title + artist + album + duration)
 *   2. Best-effort match via /api/search (scored by duration proximity)
 */

import { LyricsProvider, LyricsProviderResult, LyricsQuery } from './lyricsProvider';

const LRCLIB_BASE = 'https://lrclib.net/api';
const REQUEST_TIMEOUT_MS = 8000;

interface LrclibRecord {
  id?: number;
  trackName?: string;
  artistName?: string;
  albumName?: string;
  duration?: number;
  instrumental?: boolean;
  plainLyrics?: string | null;
  syncedLyrics?: string | null;
}

function normalizeTitle(title: string): string {
  // Strip common noise that breaks catalog matching: (Official Video), [HD], feat., etc.
  return title
    .replace(/\((?:official\s*)?(?:music\s*)?(?:video|audio|lyric[s]?|visualizer)\)/gi, '')
    .replace(/\[(?:official\s*)?(?:music\s*)?(?:video|audio|lyric[s]?|visualizer)\]/gi, '')
    .replace(/\((?:feat|ft)\.?[^)]*\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function primaryArtist(artist: string): string {
  // LRCLIB matches better on a single primary artist credit
  return artist
    .split(/,|&|x|×|\bfeat\.?\b|\bft\.?\b|\bwith\b/i)[0]
    .trim();
}

function durationCloseness(a?: number, b?: number): number {
  if (!a || !b) return 0.5; // neutral when unknown
  const diff = Math.abs(a - b);
  if (diff <= 2) return 1;
  if (diff <= 5) return 0.75;
  if (diff <= 12) return 0.4;
  return 0;
}

export class LrclibProvider implements LyricsProvider {
  public readonly name = 'lrclib';

  private async requestJson(url: string): Promise<unknown | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          // LRCLIB asks clients to identify themselves (public value, not a secret)
          'User-Agent': 'GULLYGANG/1.0 (https://gullygang.app)',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      clearTimeout(timeout);
      return null;
    }
  }

  private toResult(record: LrclibRecord): LyricsProviderResult | null {
    const synced = typeof record.syncedLyrics === 'string' ? record.syncedLyrics : undefined;
    const plain = typeof record.plainLyrics === 'string' ? record.plainLyrics : undefined;

    if (!synced && !plain && !record.instrumental) return null;

    return {
      syncedLyrics: synced || undefined,
      plainLyrics: plain || undefined,
      instrumental: Boolean(record.instrumental),
      trackName: record.trackName || '',
      artistName: record.artistName || '',
    };
  }

  public async getLyrics(query: LyricsQuery): Promise<LyricsProviderResult | null> {
    const title = normalizeTitle(query.title);
    const artist = primaryArtist(query.artist);
    if (!title || !artist) return null;

    // 1. Exact-match endpoint (fast path)
    const getParams = new URLSearchParams({
      track_name: title,
      artist_name: artist,
    });
    if (query.album) getParams.set('album_name', query.album);
    if (query.duration && query.duration > 0) {
      getParams.set('duration', String(Math.round(query.duration)));
    }

    const exact = await this.requestJson(`${LRCLIB_BASE}/get?${getParams.toString()}`);
    if (exact && typeof exact === 'object') {
      const result = this.toResult(exact as LrclibRecord);
      if (result) return result;
    }

    // 2. Best-effort search fallback (scored by duration proximity + title match)
    const search = await this.requestJson(
      `${LRCLIB_BASE}/search?q=${encodeURIComponent(`${artist} ${title}`)}`
    );
    if (Array.isArray(search) && search.length > 0) {
      const wantedTitle = title.toLowerCase();
      let best: { record: LrclibRecord; score: number } | null = null;

      for (const raw of search) {
        if (!raw || typeof raw !== 'object') continue;
        const record = raw as LrclibRecord;
        const recordTitle = (record.trackName || '').toLowerCase();
        let score = durationCloseness(record.duration, query.duration);

        if (recordTitle === wantedTitle) score += 1.5;
        else if (recordTitle.includes(wantedTitle) || wantedTitle.includes(recordTitle)) score += 0.6;
        else continue; // title must at least loosely match — never return wrong-song lyrics

        if (!best || score > best.score) best = { record, score };
      }

      if (best) {
        const result = this.toResult(best.record);
        if (result) return result;
      }
    }

    return null;
  }
}
