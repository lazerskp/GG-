'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, BarChart3, RefreshCw } from 'lucide-react';
import { Song, Artist } from '@/types/music';
import { TrackRow } from '@/components/music/TrackRow';
import { ArtistCard } from '@/components/music/ArtistCard';
import { SectionHeader } from '@/components/music/SectionHeader';

interface ChartsResponse {
  region: 'india' | 'global';
  updatedAt?: string;
  source?: string;
  songs: Song[];
  trendingArtists: Artist[];
}

type Region = 'india' | 'global';

/**
 * Live charts view — powered exclusively by the existing ytmusicapi pipeline
 * (/api/charts → pythonClient). No mock data, no fabricated rankings.
 */
export function ChartsView() {
  const [activeRegion, setActiveRegion] = useState<Region>('india');
  const [cache, setCache] = useState<Partial<Record<Region, ChartsResponse>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    // Deferred so state updates don't fire synchronously during the effect
    const timer = setTimeout(() => fetchRegion(activeRegion, controller.signal), 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [activeRegion, cache, fetchRegion]);

  const currentData = cache[activeRegion];
  const songs = currentData?.songs || [];
  const artists = currentData?.trendingArtists || [];

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* Page Header */}
      <header className="pt-2">
        <div className="flex items-center gap-2.5 mb-2">
          <BarChart3 className="w-4 h-4 text-white" />
          <span className="text-[11px] font-mono tracking-widest text-[#8F8F8F] uppercase font-semibold">
            LIVE RAP DISCOVERY
          </span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">
          Charts
        </h1>
        <p className="text-sm text-[#A1A1A1] mt-3 max-w-xl">
          Top 10 trending hip-hop songs and artists, streamed live from the YouTube Music catalog.
        </p>
      </header>

      {/* Region Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4">
        {(['india', 'global'] as Region[]).map((region) => (
          <button
            key={region}
            onClick={() => setActiveRegion(region)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              activeRegion === region
                ? 'bg-white text-black shadow-lg'
                : 'text-[#A1A1A1] hover:text-white bg-white/[0.04]'
            }`}
            aria-pressed={activeRegion === region}
          >
            {region === 'india' ? 'India' : 'Global'}
          </button>
        ))}
        {currentData?.updatedAt && (
          <span className="ml-auto text-[10px] font-mono text-[#A1A1A1] hidden sm:block">
            Synced {new Date(currentData.updatedAt).toLocaleTimeString()} ·{' '}
            {currentData.source || 'ytmusic_live'}
          </span>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </span>
          <button
            onClick={() => fetchRegion(activeRegion)}
            className="p-1.5 rounded hover:bg-white/10 transition-colors shrink-0"
            aria-label="Retry"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !currentData && <ChartsSkeleton />}

      {/* Live Content */}
      {!isLoading && !error && currentData && (
        <>
          {songs.length > 0 ? (
            <section aria-label="Top 10 Songs" className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-white border-b border-white/[0.06] pb-3">
                Top 10 Songs
              </h2>
              <div className="space-y-0.5 divide-y divide-white/[0.04]">
                {songs.slice(0, 10).map((song, idx) => (
                  <TrackRow key={song.id} track={song} index={idx} playlistContext={songs} />
                ))}
              </div>
            </section>
          ) : (
            <p className="text-sm text-[#8F8F8F] py-8 text-center">
              No live chart data available for this region right now.
            </p>
          )}

          {artists.length > 0 && (
            <section aria-label="Trending Artists" className="space-y-4 pt-2">
              <SectionHeader
                eyebrow="DISCOVERY"
                title="Trending Artists"
                description="The artists currently defining the sound across the region."
              />
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 sm:gap-6">
                {artists.slice(0, 10).map((artist, idx) => (
                  <ArtistCard key={artist.id || idx} artist={artist} />
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
    <div className="space-y-10 animate-pulse select-none">
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-5 h-4 bg-white/[0.04] rounded" />
              <div className="w-11 h-11 bg-white/[0.05] rounded-md" />
              <div className="space-y-1.5">
                <div className="w-36 h-3.5 bg-white/[0.05] rounded" />
                <div className="w-24 h-3 bg-white/[0.03] rounded" />
              </div>
            </div>
            <div className="w-10 h-3 bg-white/[0.04] rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-2.5">
            <div className="aspect-square w-full rounded-full bg-white/[0.04]" />
            <div className="w-3/4 h-3.5 bg-white/[0.05] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
