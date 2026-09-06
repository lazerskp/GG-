'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Play, Shuffle, Music2, Loader2 } from 'lucide-react';
import { Artist, Song } from '@/types/music';
import { TrackRow } from '@/components/music/TrackRow';
import { usePlayerStore } from '@/store/usePlayerStore';

interface ArtistSongsCatalogProps {
  artist: Artist;
  initialTracks: Song[];
  totalCount: number;
  initialHasMore: boolean;
}

export function ArtistSongsCatalog({
  artist,
  initialTracks,
  totalCount: initialTotal,
  initialHasMore,
}: ArtistSongsCatalogProps) {
  const [tracks, setTracks] = useState<Song[]>(initialTracks);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(initialTotal);
  const offsetRef = useRef(initialTracks.length);

  const { playTrack, toggleShuffle } = usePlayerStore();

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const res = await fetch(
        `/api/artists/${encodeURIComponent(artist.id)}/songs?limit=25&offset=${offsetRef.current}`
      );
      if (!res.ok) throw new Error('Failed to fetch more tracks');
      const data = await res.json();

      if (data.tracks && data.tracks.length > 0) {
        setTracks((prev) => {
          const existingIds = new Set(prev.map((t) => t.id));
          const uniqueNew = data.tracks.filter((t: Song) => !existingIds.has(t.id));
          return [...prev, ...uniqueNew];
        });
        offsetRef.current += data.tracks.length;
        setHasMore(data.hasMore);
        if (data.totalCount) setTotalCount(data.totalCount);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [artist.id, hasMore, isLoadingMore]);

  // Infinite scroll trigger via IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore]);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  const handleShuffleAll = () => {
    if (tracks.length > 0) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      toggleShuffle();
      playTrack(shuffled[0], shuffled);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12 pb-24">
      {/* 1. Back Navigation & Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/artist/${encodeURIComponent(artist.id)}`}
          className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#A1A1A1] hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to {artist.name}</span>
        </Link>
        <span className="text-[11px] font-mono uppercase text-[#8F8F8F] tracking-widest">
          Catalog · {tracks.length}{totalCount > tracks.length ? ` / ${totalCount}` : ''} Tracks
        </span>
      </div>

      {/* 2. Editorial Header Hero */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div className="flex items-center space-x-5">
          <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-[#171717] shrink-0 shadow-2xl border border-white/10">
            <Image
              src={artist.imageUrl}
              alt={artist.name}
              fill
              className="object-cover"
              sizes="112px"
              priority
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-mono uppercase tracking-widest text-[#A1A1A1]">Complete Songs</p>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              {artist.name}
            </h1>
            <p className="text-xs font-mono text-[#8F8F8F]">
              All available releases, singles & features
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handlePlayAll}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-neutral-200 transition-colors shadow-lg active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Play All</span>
          </button>
          <button
            onClick={handleShuffleAll}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-xs tracking-wider uppercase transition-colors border border-white/10 active:scale-95"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>
        </div>
      </div>

      {/* 3. Infinite Track List */}
      <section aria-label="All Songs" className="space-y-4">
        <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#8F8F8F] pb-2">
          <Music2 className="w-3.5 h-3.5 text-white" />
          <span>Tracklist</span>
        </div>

        <div className="space-y-0.5 divide-y divide-white/[0.04]">
          {tracks.map((song, idx) => (
            <TrackRow
              key={`${song.id}-${idx}`}
              track={song}
              index={idx}
              playlistContext={tracks}
            />
          ))}
        </div>

        {/* Loading / Sentinel element */}
        <div ref={sentinelRef} className="py-8 flex flex-col items-center justify-center">
          {isLoadingMore && (
            <div className="flex items-center space-x-2 text-sm text-[#A1A1A1]">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span className="font-mono text-xs uppercase tracking-wider">Loading more tracks...</span>
            </div>
          )}
          {!hasMore && tracks.length > 0 && (
            <p className="text-xs font-mono uppercase tracking-widest text-[#8C8C8C]">
              — End of catalog ({tracks.length} tracks) —
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
