'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, AlertCircle, RefreshCw } from 'lucide-react';
import { Song, Artist } from '@/types/music';
import { ArtistCard } from '@/components/music/ArtistCard';
import { deduplicateArtists } from '@/utils/artistDeduplication';
import { usePlayerStore } from '@/store/usePlayerStore';
import { getThumbnailArtwork } from '@/utils/artworkQuality';

interface ChartsResponse {
  region: 'india' | 'global';
  updatedAt?: string;
  source?: string;
  songs: Song[];
  trendingArtists: Artist[];
}

type Region = 'india' | 'global';

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function ChartsView() {
  const [activeRegion, setActiveRegion] = useState<Region>('india');
  const [cache, setCache] = useState<Partial<Record<Region, ChartsResponse>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { currentTrack, isPlaying, playbackStatus, playTrack, togglePlay } = usePlayerStore();

  const fetchRegion = useCallback(async (region: Region, signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/charts?region=${region}`, { signal });
      if (!res.ok) throw new Error('Charts request failed');
      const data: ChartsResponse = await res.json();
      setCache((prev) => ({ ...prev, [region]: data }));
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError('Unable to load live charts right now. Please try again shortly.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (cache[activeRegion]) return;
    const controller = new AbortController();
    const timer = setTimeout(() => fetchRegion(activeRegion, controller.signal), 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [activeRegion, cache, fetchRegion]);

  const currentData = cache[activeRegion];
  const songs = currentData?.songs || [];
  const artists = deduplicateArtists(currentData?.trendingArtists || []);

  const handleTrackClick = (song: Song) => {
    if (currentTrack?.id === song.id) {
      togglePlay();
    } else {
      playTrack(song, songs);
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 pt-4 pb-12 max-w-6xl mx-auto select-none">
      {/* Editorial Destination Header */}
      <header className="border-b border-white/[0.06] pb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-white" />
          <span className="text-[11px] font-mono tracking-[0.25em] text-[#8F8F8F] uppercase font-semibold">
            LIVE PLATFORM CHARTS
          </span>
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tight text-white leading-none mb-4">
          CHARTS
        </h1>

        <p className="text-sm sm:text-base text-[#A1A1A6] max-w-2xl leading-relaxed">
          The defining rotation of Indian Hip-Hop and global movements. Live rankings streamed from verified YouTube Music signals.
        </p>

        {/* Region / Category Controls */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-white/[0.04]">
          <div className="flex items-center gap-2">
            {(['india', 'global'] as Region[]).map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => setActiveRegion(region)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeRegion === region
                    ? 'bg-white text-black'
                    : 'text-[#A1A1A6] hover:text-white bg-white/[0.04] hover:bg-white/[0.08]'
                }`}
                aria-pressed={activeRegion === region}
              >
                {region === 'india' ? 'Indian Hip-Hop' : 'Global Rap'}
              </button>
            ))}
          </div>

          {currentData?.updatedAt && (
            <span className="text-[10px] font-mono text-[#636366] hidden sm:block uppercase tracking-wider">
              Updated Live · {currentData.source || 'ytmusic'}
            </span>
          )}
        </div>
      </header>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </span>
          <button
            type="button"
            onClick={() => fetchRegion(activeRegion)}
            className="p-1.5 rounded hover:bg-white/10 transition-colors shrink-0"
            aria-label="Retry"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && !currentData && <ChartsSkeleton />}

      {/* Content: Ranked Songs */}
      {!isLoading && !error && currentData && (
        <>
          <section aria-label="Trending Now" className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white">
                Trending Now
              </h2>
              <span className="text-xs font-mono text-[#8F8F8F]">
                {songs.length} Tracks
              </span>
            </div>

            {songs.length > 0 ? (
              <div className="divide-y divide-white/[0.04]">
                {songs.slice(0, 15).map((song, idx) => {
                  const isCurrent = currentTrack?.id === song.id;
                  const isCurrentPlaying = isCurrent && isPlaying && playbackStatus === 'playing';
                  const rankNumber = String(idx + 1).padStart(2, '0');
                  const thumbnailSrc = getThumbnailArtwork(song.artworkUrl, 160) || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop';

                  return (
                    <div
                      key={song.id}
                      onClick={() => handleTrackClick(song)}
                      className={`group flex items-center justify-between py-3.5 px-2 sm:px-3 rounded-md transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-white/[0.08] text-white'
                          : 'hover:bg-white/[0.04] text-[#A1A1A6]'
                      }`}
                    >
                      {/* Left: Rank, Play Button, Artwork, Title & Artist */}
                      <div className="flex items-center gap-4 sm:gap-6 min-w-0 pr-4">
                        {/* Numerical Rank */}
                        <div className="w-7 sm:w-8 text-center shrink-0 flex items-center justify-center">
                          {isCurrentPlaying ? (
                            <Pause className="w-4 h-4 fill-white text-white" />
                          ) : (
                            <>
                              <span className="font-mono text-sm sm:text-base font-semibold text-[#8F8F8F] group-hover:hidden">
                                {rankNumber}
                              </span>
                              <Play className="w-4 h-4 fill-white text-white hidden group-hover:block" />
                            </>
                          )}
                        </div>

                        {/* Artwork */}
                        <div className="relative w-12 h-12 rounded overflow-hidden bg-[#141414] shrink-0 border border-white/[0.06]">
                          <Image
                            src={thumbnailSrc}
                            alt={song.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>

                        {/* Title & Artist Link */}
                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-semibold text-white truncate leading-tight tracking-tight">
                            {song.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[#8F8F8F]">
                            {song.artistId ? (
                              <Link
                                href={`/artist/${encodeURIComponent(song.artistId)}`}
                                onClick={(e) => e.stopPropagation()}
                                className="hover:text-white hover:underline truncate"
                              >
                                {song.artist}
                              </Link>
                            ) : (
                              <span className="truncate">{song.artist}</span>
                            )}
                            {song.album && (
                              <>
                                <span className="text-[#636366]">•</span>
                                <span className="truncate hidden sm:inline">{song.album}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Duration & Play Trigger */}
                      <div className="flex items-center gap-4 shrink-0">
                        {/* Real View Signal from YouTube Music if available */}
                        {song.plays && (
                          <span className="hidden md:inline-block text-[11px] font-mono text-[#636366] tabular-nums">
                            {song.plays} views
                          </span>
                        )}

                        <span className="font-mono text-xs text-[#8F8F8F] tabular-nums">
                          {formatDuration(song.duration)}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTrackClick(song);
                          }}
                          aria-label={isCurrentPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
                          className="w-8 h-8 rounded-full bg-white/[0.06] group-hover:bg-white text-white group-hover:text-black flex items-center justify-center transition-all"
                        >
                          {isCurrentPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[#8F8F8F] py-8 text-center">
                No live chart data available for this category.
              </p>
            )}
          </section>

          {/* Trending Artists Section */}
          {artists.length > 0 && (
            <section aria-label="Trending Artists" className="pt-8 border-t border-white/[0.06]">
              <div className="flex items-center justify-between pb-6">
                <div>
                  <p className="text-[11px] font-mono tracking-[0.2em] text-[#8F8F8F] uppercase font-semibold mb-1">
                    LEADERS & BREAKTHROUGHS
                  </p>
                  <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white">
                    Trending Artists
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
                {artists.slice(0, 12).map((artist) => (
                  <div key={artist.id}>
                    <ArtistCard artist={artist} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function ChartsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse select-none">
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-6 h-5 bg-white/[0.05] rounded" />
              <div className="w-12 h-12 bg-white/[0.05] rounded" />
              <div className="space-y-2">
                <div className="w-44 h-4 bg-white/[0.05] rounded" />
                <div className="w-28 h-3 bg-white/[0.03] rounded" />
              </div>
            </div>
            <div className="w-12 h-4 bg-white/[0.04] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
