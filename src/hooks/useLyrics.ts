import { useState, useEffect } from 'react';
import { Song } from '@/types/music';
import { LyricsPayload } from '@/types/lyrics';

export const lyricsCache = new Map<string, LyricsPayload>();
const inFlightRequests = new Map<string, Promise<LyricsPayload | null>>();

export function getTrackLyricsKey(track: Song): string {
  if (track.id?.trim()) return track.id.trim();
  return `${track.title?.trim() || ''}-${track.artist?.trim() || ''}`;
}

/**
 * Prefetches lyrics in the background without blocking UI, caching by track ID.
 */
export async function prefetchLyrics(track: Song | null): Promise<LyricsPayload | null> {
  if (!track) return null;
  const key = getTrackLyricsKey(track);
  if (!key) return null;

  // 1. Check in-memory cache
  const cached = lyricsCache.get(key);
  if (cached) return cached;

  // 2. Check in-flight deduplicated promise
  const existingPromise = inFlightRequests.get(key);
  if (existingPromise) return existingPromise;

  // Fast reject if missing identifiers
  if (!track.id?.trim() && (!track.title?.trim() || !track.artist?.trim())) {
    const unavailable: LyricsPayload = {
      status: 'unavailable',
      provider: 'none',
      trackName: track.title || '',
      artistName: track.artist || '',
    };
    lyricsCache.set(key, unavailable);
    return unavailable;
  }

  const params = new URLSearchParams();
  if (track.id) params.set('videoId', track.id);
  if (track.title?.trim()) params.set('title', track.title.trim());
  if (track.artist?.trim()) params.set('artist', track.artist.trim());
  if (track.album) params.set('album', track.album);
  if (track.duration && track.duration > 0) {
    params.set('duration', String(Math.round(track.duration)));
  }

  const promise = (async () => {
    try {
      const res = await fetch(`/api/lyrics?${params.toString()}`);
      if (!res.ok) throw new Error('Lyrics fetch failed');
      const data: LyricsPayload = await res.json();
      lyricsCache.set(key, data);
      return data;
    } catch {
      return null;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, promise);
  return promise;
}

export function useLyrics(currentTrack: Song | null) {
  const trackKey = currentTrack ? getTrackLyricsKey(currentTrack) : '';
  const cached = trackKey ? lyricsCache.get(trackKey) || null : null;

  const [asyncData, setAsyncData] = useState<{
    key: string;
    lyrics: LyricsPayload | null;
    isLoading: boolean;
    error: boolean;
  }>({
    key: '',
    lyrics: null,
    isLoading: false,
    error: false,
  });

  const isMatch = asyncData.key === trackKey;
  const lyrics = cached || (isMatch ? asyncData.lyrics : null);
  const isLoading = Boolean(currentTrack && !cached && (!isMatch || asyncData.isLoading));
  const error = isMatch ? asyncData.error : false;

  useEffect(() => {
    if (!currentTrack || cached) return;

    let cancelled = false;
    const controller = new AbortController();

    prefetchLyrics(currentTrack).then((data) => {
      if (cancelled) return;
      setAsyncData({
        key: trackKey,
        lyrics: data,
        isLoading: false,
        error: !data,
      });
    });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [currentTrack, trackKey, cached]);

  return { lyrics, isLoading, error };
}
