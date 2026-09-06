import { useState, useEffect, useRef } from 'react';
import { Song } from '@/types/music';
import { LyricsPayload } from '@/types/lyrics';

const sessionLyricsCache = new Map<string, LyricsPayload>();

function buildTrackKey(track: Song): string {
  return [track.id, track.title, track.artist, track.album || '', track.duration || 0].join('|');
}

export function useLyrics(currentTrack: Song | null) {
  const [lyrics, setLyrics] = useState<LyricsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const timer = setTimeout(async () => {
      if (!currentTrack) {
        setLyrics(null);
        setIsLoading(false);
        setError(false);
        return;
      }

      const key = buildTrackKey(currentTrack);

      // 1. Check in-memory session cache
      const cached = sessionLyricsCache.get(key);
      if (cached) {
        setLyrics(cached);
        setIsLoading(false);
        setError(false);
        return;
      }

      // 2. Fetch from BFF
      abortRef.current?.abort();
      // If neither videoId nor (title and artist) exists, mark unavailable immediately
      if (!currentTrack.id?.trim() && (!currentTrack.title?.trim() || !currentTrack.artist?.trim())) {
        setLyrics({
          status: 'unavailable',
          provider: 'none',
          trackName: currentTrack.title || '',
          artistName: currentTrack.artist || '',
        });
        setIsLoading(false);
        setError(false);
        return;
      }

      setIsLoading(true);
      setError(false);
      setLyrics(null);

      const params = new URLSearchParams();
      if (currentTrack.id) params.set('videoId', currentTrack.id);
      if (currentTrack.title?.trim()) params.set('title', currentTrack.title.trim());
      if (currentTrack.artist?.trim()) params.set('artist', currentTrack.artist.trim());
      if (currentTrack.album) params.set('album', currentTrack.album);
      if (currentTrack.duration && currentTrack.duration > 0) {
        params.set('duration', String(Math.round(currentTrack.duration)));
      }

      try {
        const res = await fetch(`/api/lyrics?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Lyrics request failed');
        const data: LyricsPayload = await res.json();
        sessionLyricsCache.set(key, data);
        if (!cancelled) setLyrics(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [currentTrack]);

  return { lyrics, isLoading, error };
}
