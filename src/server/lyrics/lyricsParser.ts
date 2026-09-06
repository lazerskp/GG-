import 'server-only';

/**
 * LRC Timestamp Parser
 *
 * Converts LRCLIB synced LRC payloads into normalized LyricLine structures.
 * Pure functions only — safe to import types from client components.
 */

import { LyricLine } from '@/types/lyrics';

/** Metadata tags that should never render as lyric lines (e.g. [ti:], [ar:], [by:]) */
const METADATA_TAG_PATTERN = /^\[(?:ti|ar|al|by|offset|length|re|ve|au|tooling):.*\]$/i;

export function isSyncedLrc(payload: string | null | undefined): boolean {
  if (!payload) return false;
  return /\[\d{1,3}:\d{1,2}(?:[.:]\d{1,3})?\]/.test(payload);
}

function parseTimestampToSeconds(mins: string, secs: string, frac: string | undefined): number {
  // Fraction may be centiseconds (2 digits) or milliseconds (3 digits)
  const fracMs = frac ? parseInt(frac.padEnd(3, '0').slice(0, 3), 10) : 0;
  return parseInt(mins, 10) * 60 + parseInt(secs, 10) + fracMs / 1000;
}

/**
 * Parses a raw LRC payload into normalized, time-ordered LyricLines.
 * Supports multiple timestamps per line (e.g. "[00:12.00][01:20.00] text")
 * and computes each line's endTime from the next line's startTime.
 */
export function parseLrc(rawLrc: string): LyricLine[] {
  if (!rawLrc) return [];

  const rawLines = rawLrc.split(/\r?\n/);
  const collected: Array<{ startTime: number; text: string }> = [];

  for (const rawLine of rawLines) {
    const trimmedLine = rawLine.trim();
    if (!trimmedLine) continue;

    // Skip pure metadata tags like [ar:], [ti:], [offset:...]
    if (METADATA_TAG_PATTERN.test(trimmedLine)) continue;

    const timestamps: number[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    do {
      match = /\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]/.exec(trimmedLine.slice(lastIndex));
      if (!match) break;
      timestamps.push(parseTimestampToSeconds(match[1], match[2], match[3]));
      lastIndex += match.index + match[0].length;
    } while (match);

    if (timestamps.length === 0) continue;

    const text = trimmedLine
      .slice(lastIndex)
      .replace(/\[[^\]]*\]/g, '') // strip any trailing inline tags
      .trim();

    for (const ts of timestamps) {
      collected.push({ startTime: ts, text });
    }
  }

  collected.sort((a, b) => a.startTime - b.startTime);

  // Compute endTime from the next line; deduplicate identical timestamps
  const lines: LyricLine[] = [];
  for (let i = 0; i < collected.length; i++) {
    const current = collected[i];
    if (lines.length > 0 && lines[lines.length - 1].startTime === current.startTime) continue;
    const next = collected[i + 1];
    lines.push({
      startTime: current.startTime,
      endTime: next ? next.startTime : undefined,
      text: current.text,
    });
  }

  return lines;
}

/**
 * Splits plain lyrics into display lines, preserving stanza breaks.
 */
export function splitPlainLyrics(rawPlain: string | null | undefined): string[] {
  if (!rawPlain) return [];
  return rawPlain
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
