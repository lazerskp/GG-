'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, AlertCircle } from 'lucide-react';
import { Artist, Song, Album } from '@/types/music';
import { TrackRow } from '@/components/music/TrackRow';
import { ArtistCard } from '@/components/music/ArtistCard';
import { EmptyState } from '@/components/ui/EmptyState';

export function QuickSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    artists: Artist[];
    songs: Song[];
    albums: Album[];
  }>({ artists: [], songs: [], albums: [] });
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        searchInput?.focus();
        searchInput?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setResults({ artists: [], songs: [], albums: [] });
      setHasSearched(false);
      setIsLoading(false);
      setError(null);
    }
  };

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    const timer = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: abortControllerRef.current.signal,
        });
        if (!res.ok) {
          const errorBody = await res.json().catch(() => null);
          if (res.status === 503) {
            setError(errorBody?.error || 'Search service temporarily unavailable. Please try again in a moment.');
          } else if (res.status === 429) {
            setError('Too many search requests. Please slow down.');
          } else {
            setError(errorBody?.error || 'Search service error. Please try again.');
          }
          setResults({ artists: [], songs: [], albums: [] });
          setHasSearched(false);
          return;
        }
        const data = await res.json();
        setResults(data);
        setHasSearched(true);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError('Network connection error. Please check your internet connection.');
          setResults({ artists: [], songs: [], albums: [] });
          setHasSearched(false);
        }
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query]);

  return (
    <section id="search" className="mb-14 sm:mb-20 pt-2" aria-label="Search">
      <div className="relative mb-6">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-[#A1A1A1]" />
          <input
            id="search-input"
            type="text"
            placeholder="Search music, artists, albums (e.g. Arijit Singh, Seedhe Maut, Human Sagar...)"
            aria-label="Search songs, artists, and albums"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-[#A1A1A1] hover:bg-white/[0.06] hover:border-white/[0.14] focus:outline-none focus:bg-white/[0.07] focus:border-white/25 transition-all"
          />

          <div className="absolute right-4 flex items-center space-x-2">
            {isLoading && (
              <Loader2 className="w-4 h-4 text-[#A1A1A1] animate-spin" />
            )}
            {query && !isLoading && (
              <button
                onClick={() => handleQueryChange('')}
                className="text-[#A1A1A1] hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs flex items-center space-x-2 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Rendering */}
      {hasSearched && !isLoading && !error && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {results.songs.length === 0 &&
          results.artists.length === 0 &&
          results.albums.length === 0 ? (
            <EmptyState
              title={`No matches found for "${query}"`}
              description="Try searching for another artist, track name, or genre keyword."
            />
          ) : (
            <>
              {/* Matching Tracks */}
              {results.songs.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#8F8F8F] mb-3">
                    Matching Tracks ({results.songs.length})
                  </h3>
                  <div className="space-y-0.5 divide-y divide-white/[0.04]">
                    {results.songs.map((track, idx) => (
                      <TrackRow
                        key={track.id}
                        track={track}
                        index={idx}
                        playlistContext={results.songs}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Artists */}
              {results.artists.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#8F8F8F] mb-3">
                    Matching Artists ({results.artists.length})
                  </h3>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {results.artists.map((artist) => (
                      <div key={artist.id} className="shrink-0 w-32 sm:w-36">
                        <ArtistCard artist={artist} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
