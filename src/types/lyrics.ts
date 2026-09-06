/**
 * Shared lyrics types (safe for client and server usage)
 */

export interface LyricLine {
  startTime: number; // seconds
  endTime?: number; // seconds (derived from the next line's start)
  text: string;
}

export type LyricsType = 'synced' | 'plain' | 'instrumental' | 'unavailable';

export interface LyricsPayload {
  status: LyricsType;
  /** Present when status === 'synced' — time-ordered lines */
  lines?: LyricLine[];
  /** Present when status === 'plain' — ordered plain-text lines */
  text?: string[];
  trackName: string;
  artistName: string;
  provider: string;
}
