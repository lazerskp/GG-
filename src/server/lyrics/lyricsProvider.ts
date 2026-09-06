import 'server-only';

/**
 * Lyrics Provider Layer
 *
 * ARCHITECTURAL PRINCIPLE:
 * Lyrics discovery is a separate, pluggable provider concern — exactly like
 * music metadata (ytmusicapi) and playback (YouTube IFrame API).
 *
 * A lyrics provider resolves a track's lyrics from public licensed sources
 * using only the metadata attached to the currently playing track.
 * Providers MUST NOT fabricate, generate, or substitute placeholder lyrics.
 */

import { LyricLine, LyricsType } from '@/types/lyrics';

export interface LyricsQuery {
  /** Real YouTube video ID of currently playing track (preferred for YTMusic lookup) */
  videoId?: string;
  /** Track title as shown by the live metadata provider */
  title: string;
  /** Primary artist name */
  artist: string;
  /** Album name when available (improves LRCLIB matching) */
  album?: string;
  /** Duration in seconds when known (improves LRCLIB matching) */
  duration?: number;
}

export interface LyricsProviderResult {
  syncedLyrics?: string; // raw LRC payload
  plainLyrics?: string; // raw plain-text payload
  lines?: LyricLine[]; // pre-parsed synced lines
  text?: string[]; // pre-parsed plain text lines
  instrumental?: boolean;
  trackName: string;
  artistName: string;
  provider?: string;
}

export interface LyricsProvider {
  readonly name: string;
  getLyrics(query: LyricsQuery): Promise<LyricsProviderResult | null>;
}

export interface NormalizedLyrics {
  status: LyricsType;
  lines?: LyricLine[];
  text?: string[];
  trackName: string;
  artistName: string;
  provider: string;
}
