'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X, Play, Pause, Radio, Disc, Mic2, RefreshCw, Sparkles, Video, Plus } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Song, Artist, Album } from '@/types/music';

interface SearchResults {
  query: string;
  topResult?: {
    type: 'artist' | 'song' | 'album';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item: any;
  } | null;
  artists: Artist[];
  songs: Song[];
  albums: Album[];
  videos?: Song[];
}

interface NavigableItem {
  id: string;
  type: 'topResult' | 'song' | 'artist' | 'album' | 'video';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any;
  category?: 'artist' | 'song' | 'album';
}

export function TopNavigation() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();

  // Compute a unified flat list of navigable search items
  const navigableItems = useMemo<NavigableItem[]>(() => {
    if (!results) return [];
    const items: NavigableItem[] = [];

    if (results.topResult && results.topResult.item) {
      items.push({
        id: 'top-result',
        type: 'topResult',
        item: results.topResult.item,
        category: results.topResult.type,
      });
    }

    results.songs.slice(0, 10).forEach((song) => {
      items.push({
        id: `song-${song.id}`,
        type: 'song',
        item: song,
      });
    });

    results.artists.slice(0, 6).forEach((artist) => {
      items.push({
        id: `artist-${artist.id}`,
        type: 'artist',
        item: artist,
      });
    });

    results.albums.slice(0, 4).forEach((album) => {
      items.push({
        id: `album-${album.id}`,
        type: 'album',
        item: album,
      });
    });

    (results.videos || []).slice(0, 4).forEach((video) => {
      items.push({
        id: `video-${video.id}`,
        type: 'video',
        item: video,
      });
    });

    return items;
  }, [results]);

  // Auto-scroll highlighted item into view
  useEffect(() => {
    if (selectedIndex >= 0 && navigableItems[selectedIndex]) {
      const activeEl = document.getElementById(`search-item-${navigableItems[selectedIndex].id}`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, navigableItems]);

  const activateItem = useCallback(
    (navItem: NavigableItem) => {
      if (navItem.type === 'song' || navItem.type === 'video' || (navItem.type === 'topResult' && navItem.category === 'song')) {
        const songToPlay: Song = navItem.item;
        playTrack(songToPlay, results?.songs);
        setIsFocused(false);
        searchInputRef.current?.blur();
      } else if (navItem.type === 'artist' || (navItem.type === 'topResult' && navItem.category === 'artist')) {
        router.push(`/artist/${encodeURIComponent(navItem.item.id)}`);
        setIsFocused(false);
        searchInputRef.current?.blur();
      } else if (navItem.type === 'album' || (navItem.type === 'topResult' && navItem.category === 'album')) {
        router.push(`/album/${encodeURIComponent(navItem.item.id)}`);
        setIsFocused(false);
        searchInputRef.current?.blur();
      }
    },
    [playTrack, results, router]
  );

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (navigableItems.length === 0) return;
      setSelectedIndex((prev) => (prev + 1 < navigableItems.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (navigableItems.length === 0) return;
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : navigableItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < navigableItems.length) {
        activateItem(navigableItems[selectedIndex]);
      } else if (navigableItems.length > 0) {
        activateItem(navigableItems[0]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsFocused(false);
      setSelectedIndex(-1);
      searchInputRef.current?.blur();
    }
  };

  // Perform debounced live search
  const performSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setResults(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
        signal: abortController.signal,
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        if (res.status === 503) {
          setError(errorBody?.error || 'Search service temporarily unavailable. Please try again in a moment.');
        } else if (res.status === 429) {
          setError('Too many search requests. Please wait a moment.');
        } else {
          setError(errorBody?.error || 'Search service error. Please try again.');
        }
        setResults(null);
        return;
      }

      const data: SearchResults = await res.json();
      setResults(data);
      setSelectedIndex(-1);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError('Network connection error. Please check your internet connection.');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setSelectedIndex(-1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults(null);
        setSelectedIndex(-1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsFocused(true);
      }
      if (e.key === 'Escape') {
        setIsFocused(false);
        setIsMobileSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle outside click to close search popup
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasResults =
    results &&
    (Boolean(results.topResult) ||
      results.artists.length > 0 ||
      results.songs.length > 0 ||
      results.albums.length > 0 ||
      Boolean(results.videos && results.videos.length > 0));

  const showDropdown = isFocused && query.trim().length > 0;
  const { addToQueue } = usePlayerStore();

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.06] transition-colors duration-300">
        <div className="w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* 1. Left: Minimal Wordmark Branding */}
          <div className="flex items-center gap-8 shrink-0">
            <Link href="/" className="flex items-baseline gap-2 group select-none">
              <span className="text-lg sm:text-xl font-black tracking-tighter text-white uppercase group-hover:opacity-80 transition-opacity">
                GULLYGANG
              </span>
              <span className="hidden sm:inline-block text-[9px] font-mono tracking-[0.25em] text-[#8F8F8F] uppercase">
                DISCOVERY
              </span>
            </Link>

            {/* Desktop Editorial Navigation Links */}
            <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-6 text-xs font-medium tracking-wide">
              <Link
                href="/"
                className="text-[#A1A1A6] hover:text-white transition-colors duration-200"
              >
                Discover
              </Link>
              <Link
                href="/#new-releases"
                className="text-[#A1A1A6] hover:text-white transition-colors duration-200"
              >
                New Releases
              </Link>
              <Link
                href="/#artists"
                className="text-[#A1A1A6] hover:text-white transition-colors duration-200"
              >
                Artists
              </Link>
              <Link
                href="/charts"
                className="text-white hover:text-white transition-colors duration-200 font-semibold"
              >
                Charts
              </Link>
            </nav>
          </div>

          {/* 2. Center/Right: Sleek Search Experience */}
          <div ref={containerRef} className="hidden md:block flex-1 max-w-md relative">
            <div
              className={`relative flex items-center w-full h-10 px-4 rounded-full transition-all duration-200 ${
                isFocused
                  ? 'bg-white/[0.08] border border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.6)]'
                  : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              <Search className="w-4 h-4 text-[#A1A1A1] shrink-0 mr-3" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onKeyDown={handleInputKeyDown}
                placeholder="Search songs, artists, albums (e.g. Arijit Singh, Seedhe Maut, Human Sagar...)"
                aria-label="Search songs, artists, and albums"
                className="w-full bg-transparent text-xs text-white placeholder-[#A1A1A1] focus:outline-none"
              />
              {isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 text-[#A1A1A1] animate-spin shrink-0" />
              ) : query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setResults(null);
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Clear search input"
                  className="p-1 text-[#A1A1A1] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono bg-white/[0.06] rounded text-[#8F8F8F] border border-white/[0.04] select-none">
                  ⌘K
                </kbd>
              )}
            </div>

            {/* Floating Live Search Dropdown Panel */}
            {showDropdown && (
              <div className="absolute top-full mt-2.5 left-0 right-0 bg-[#101010]/95 border border-white/[0.08] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.85)] overflow-hidden z-50 backdrop-blur-2xl max-h-[75vh] overflow-y-auto divide-y divide-white/[0.06]">
                {isLoading && !results && (
                  <div className="p-8 text-center text-xs font-mono tracking-wider text-[#8F8F8F] flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>SEARCHING LIVE CATALOG...</span>
                  </div>
                )}

                {error && (
                  <div className="p-6 text-center text-xs text-red-400 font-medium">
                    {error}
                  </div>
                )}

                {!isLoading && !error && !hasResults && (
                  <div className="p-8 text-center text-xs text-[#8F8F8F]">
                    No results found for <span className="text-white font-medium">&quot;{query}&quot;</span>
                  </div>
                )}

                {results && (
                  <>
                    {/* Top Result Section */}
                    {results.topResult && results.topResult.item && (
                      <div className="p-3 bg-white/[0.02]">
                        <div className="flex items-center space-x-2 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-[#A1A1A1]">
                          <Sparkles className="w-3 h-3 text-white" />
                          <span>TOP RESULT</span>
                        </div>
                        {results.topResult.type === 'artist' && (
                          <Link
                            id="search-item-top-result"
                            href={`/artist/${results.topResult.item.id}`}
                            onClick={() => setIsFocused(false)}
                            className={`flex items-center space-x-4 p-3 rounded-xl transition-all duration-150 group ${
                              navigableItems[selectedIndex]?.id === 'top-result'
                                ? 'bg-white/[0.12] ring-1 ring-white/20'
                                : 'hover:bg-white/[0.06]'
                            }`}
                          >
                            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#1C1C1C] shrink-0 border border-white/15">
                              <Image
                                src={results.topResult.item.imageUrl || results.topResult.item.image || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop'}
                                alt={results.topResult.item.name}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-white/10 text-white mb-1">
                                Artist
                              </span>
                              <p className="text-sm font-bold text-white group-hover:underline truncate">
                                {results.topResult.item.name}
                              </p>
                              <p className="text-xs text-[#8F8F8F] truncate">
                                {results.topResult.item.monthlyListeners || results.topResult.item.genres?.join(' • ') || 'Artist'}
                              </p>
                            </div>
                          </Link>
                        )}

                        {results.topResult.type === 'song' && (
                          <div
                            id="search-item-top-result"
                            onClick={() => {
                              playTrack(results.topResult!.item, results.songs);
                              setIsFocused(false);
                            }}
                            className={`flex items-center justify-between p-3 rounded-xl transition-all duration-150 cursor-pointer group ${
                              navigableItems[selectedIndex]?.id === 'top-result'
                                ? 'bg-white/[0.12] ring-1 ring-white/20'
                                : 'hover:bg-white/[0.06]'
                            }`}
                          >
                            <div className="flex items-center space-x-4 min-w-0">
                              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#1C1C1C] shrink-0 border border-white/15">
                                <Image
                                  src={results.topResult.item.artworkUrl || results.topResult.item.artwork || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop'}
                                  alt={results.topResult.item.title}
                                  fill
                                  className="object-cover"
                                  sizes="56px"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-white/10 text-white mb-1">
                                  Track
                                </span>
                                <p className="text-sm font-bold text-white group-hover:underline truncate">
                                  {results.topResult.item.title}
                                </p>
                                <p className="text-xs text-[#8F8F8F] truncate">
                                  {results.topResult.item.artist}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-mono text-[#8F8F8F] shrink-0 ml-2">
                              {Math.floor((results.topResult.item.duration || 180) / 60)}:
                              {((results.topResult.item.duration || 180) % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                        )}

                        {results.topResult.type === 'album' && (
                          <Link
                            id="search-item-top-result"
                            href={`/album/${results.topResult.item.id}`}
                            onClick={() => setIsFocused(false)}
                            className={`flex items-center space-x-4 p-3 rounded-xl transition-all duration-150 group ${
                              navigableItems[selectedIndex]?.id === 'top-result'
                                ? 'bg-white/[0.12] ring-1 ring-white/20'
                                : 'hover:bg-white/[0.06]'
                            }`}
                          >
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#1C1C1C] shrink-0 border border-white/15">
                              <Image
                                src={results.topResult.item.artworkUrl || results.topResult.item.artwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop'}
                                alt={results.topResult.item.title}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-white/10 text-white mb-1">
                                Album
                              </span>
                              <p className="text-sm font-bold text-white group-hover:underline truncate">
                                {results.topResult.item.title}
                              </p>
                              <p className="text-xs text-[#8F8F8F] truncate">
                                {results.topResult.item.artist} • {results.topResult.item.releaseYear || 2024}
                              </p>
                            </div>
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Songs Section */}
                    {results.songs.length > 0 && (
                      <div className="p-3">
                        <div className="flex items-center justify-between px-2 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#8F8F8F]">
                          <div className="flex items-center space-x-2">
                            <Radio className="w-3 h-3" />
                            <span>SONGS</span>
                          </div>
                          <span>{results.songs.length}</span>
                        </div>
                        <div className="space-y-1">
                          {results.songs.slice(0, 10).map((song) => {
                            const isCurrent = currentTrack?.id === song.id;
                            const isTrackPlaying = isCurrent && isPlaying;
                            const isNavSelected = navigableItems[selectedIndex]?.id === `song-${song.id}`;

                            return (
                              <div
                                key={song.id}
                                id={`search-item-song-${song.id}`}
                                onClick={() => {
                                  if (isCurrent) {
                                    togglePlay();
                                  } else {
                                    playTrack(song, results.songs);
                                  }
                                }}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-150 group ${
                                  isNavSelected
                                    ? 'bg-white/[0.12] ring-1 ring-white/20'
                                    : isCurrent
                                    ? 'bg-white/[0.08]'
                                    : 'hover:bg-white/[0.04]'
                                }`}
                              >
                                <div className="flex items-center space-x-3 min-w-0">
                                  <div className="relative w-9 h-9 rounded overflow-hidden bg-[#1C1C1C] shrink-0 border border-white/[0.06]">
                                    <Image
                                      src={song.artworkUrl || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop'}
                                      alt={song.title}
                                      fill
                                      className="object-cover"
                                      sizes="36px"
                                    />
                                    <div
                                      className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                                        isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                      }`}
                                    >
                                      {isTrackPlaying ? (
                                        <Pause className="w-3 h-3 text-white" />
                                      ) : (
                                        <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                                      )}
                                    </div>
                                  </div>
                                  <div className="min-w-0">
                                    <p
                                      className={`text-xs font-semibold truncate ${
                                        isCurrent ? 'text-white' : 'text-[#E5E5E5]'
                                      }`}
                                    >
                                      {song.title}
                                    </p>
                                    <Link
                                      href={`/artist/${encodeURIComponent(song.artistId || song.id)}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsFocused(false);
                                      }}
                                      className="text-[10px] text-[#8F8F8F] hover:text-white hover:underline truncate block"
                                    >
                                      {song.artist}
                                    </Link>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 shrink-0 ml-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToQueue(song);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-[#A1A1A1] hover:text-white transition-opacity"
                                    aria-label={`Add ${song.title} to queue`}
                                    title="Add to queue"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-[10px] font-mono text-[#8F8F8F]">
                                    {Math.floor((song.duration || 180) / 60)}:
                                    {((song.duration || 180) % 60).toString().padStart(2, '0')}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Artists Section */}
                    {results.artists.length > 0 && (
                      <div className="p-3">
                        <div className="flex items-center justify-between px-2 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#8F8F8F]">
                          <div className="flex items-center space-x-2">
                            <Mic2 className="w-3 h-3" />
                            <span>ARTISTS</span>
                          </div>
                          <span>{results.artists.length}</span>
                        </div>
                        <div className="space-y-1">
                          {results.artists.slice(0, 6).map((artist) => {
                            const isNavSelected = navigableItems[selectedIndex]?.id === `artist-${artist.id}`;
                            return (
                              <Link
                                key={artist.id}
                                id={`search-item-artist-${artist.id}`}
                                href={`/artist/${artist.id}`}
                                onClick={() => setIsFocused(false)}
                                className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-150 group ${
                                  isNavSelected
                                    ? 'bg-white/[0.12] ring-1 ring-white/20'
                                    : 'hover:bg-white/[0.04]'
                                }`}
                              >
                                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[#1C1C1C] shrink-0 border border-white/[0.08]">
                                  <Image
                                    src={artist.imageUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop'}
                                    alt={artist.name}
                                    fill
                                    className="object-cover"
                                    sizes="36px"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-white group-hover:underline truncate">
                                    {artist.name}
                                  </p>
                                  <p className="text-[10px] text-[#8F8F8F] truncate">
                                    {artist.genres?.join(' • ') || 'Artist'}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Albums Section */}
                    {results.albums.length > 0 && (
                      <div className="p-3">
                        <div className="flex items-center justify-between px-2 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#8F8F8F]">
                          <div className="flex items-center space-x-2">
                            <Disc className="w-3 h-3" />
                            <span>ALBUMS</span>
                          </div>
                          <span>{results.albums.length}</span>
                        </div>
                        <div className="space-y-1">
                          {results.albums.slice(0, 4).map((album) => {
                            const isNavSelected = navigableItems[selectedIndex]?.id === `album-${album.id}`;
                            return (
                              <Link
                                key={album.id}
                                id={`search-item-album-${album.id}`}
                                href={`/album/${album.id}`}
                                onClick={() => setIsFocused(false)}
                                className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-150 group ${
                                  isNavSelected
                                    ? 'bg-white/[0.12] ring-1 ring-white/20'
                                    : 'hover:bg-white/[0.04]'
                                }`}
                              >
                                <div className="relative w-9 h-9 rounded overflow-hidden bg-[#1C1C1C] shrink-0 border border-white/[0.06]">
                                  <Image
                                    src={album.artworkUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop'}
                                    alt={album.title}
                                    fill
                                    className="object-cover"
                                    sizes="36px"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-white group-hover:underline truncate">
                                    {album.title}
                                  </p>
                                  <p className="text-[10px] text-[#8F8F8F] truncate">
                                    {album.artist} • {album.releaseYear || 2024}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Videos / Other Music Results Section */}
                    {results.videos && results.videos.length > 0 && (
                      <div className="p-3">
                        <div className="flex items-center justify-between px-2 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#8F8F8F]">
                          <div className="flex items-center space-x-2">
                            <Video className="w-3 h-3" />
                            <span>VIDEOS & PERFORMANCES</span>
                          </div>
                          <span>{results.videos.length}</span>
                        </div>
                        <div className="space-y-1">
                          {results.videos.slice(0, 4).map((video) => {
                            const isNavSelected = navigableItems[selectedIndex]?.id === `video-${video.id}`;
                            return (
                              <div
                                key={video.id}
                                id={`search-item-video-${video.id}`}
                                onClick={() => {
                                  playTrack(video, results.videos);
                                  setIsFocused(false);
                                }}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-150 group ${
                                  isNavSelected
                                    ? 'bg-white/[0.12] ring-1 ring-white/20'
                                    : 'hover:bg-white/[0.04]'
                                }`}
                              >
                                <div className="flex items-center space-x-3 min-w-0">
                                  <div className="relative w-12 h-8 rounded overflow-hidden bg-[#1C1C1C] shrink-0 border border-white/[0.06]">
                                    <Image
                                      src={video.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop'}
                                      alt={video.title}
                                      fill
                                      className="object-cover"
                                      sizes="48px"
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-white truncate group-hover:underline">
                                      {video.title}
                                    </p>
                                    <p className="text-[10px] text-[#8F8F8F] truncate">
                                      {video.artist}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-mono text-[#8F8F8F] ml-2">
                                  {Math.floor((video.duration || 180) / 60)}:
                                  {((video.duration || 180) % 60).toString().padStart(2, '0')}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* 3. Right: Mobile Search Trigger & Mobile Charts */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Mobile Search Icon */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden p-2 rounded-lg text-[#A1A1A1] hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Open mobile search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Mobile Quick Charts Link */}
            <Link
              href="/charts"
              className="lg:hidden text-xs font-semibold text-white px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] transition-colors"
            >
              Charts
            </Link>
          </div>
        </div>

        {/* Mobile Search Expandable Tray */}
        {isMobileSearchOpen && (
          <div className="md:hidden px-4 pb-3 pt-1 border-t border-white/[0.06] bg-[#0A0A0A]/95 backdrop-blur-xl">
            <div className="relative flex items-center w-full h-10 px-3.5 rounded-full bg-white/[0.05] border border-white/[0.08] focus-within:border-white/20">
              <Search className="w-4 h-4 text-[#A1A1A1] mr-2.5 shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Search songs, artists, albums (e.g. Arijit Singh, Seedhe Maut...)"
                aria-label="Search songs, artists, and albums"
                className="w-full bg-transparent text-xs text-white placeholder-[#A1A1A1] focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search input"
                  className="p-1 text-[#A1A1A1] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Search Results list */}
            {query.trim().length > 0 && (
              <div className="mt-2 max-h-[60vh] overflow-y-auto rounded-xl bg-[#111111]/95 border border-white/[0.08] divide-y divide-white/[0.06] shadow-xl">
                {isLoading && !results && (
                  <div className="p-4 text-center text-xs text-[#8F8F8F]">
                    Searching live catalog...
                  </div>
                )}
                {error && (
                  <div className="p-4 text-center text-xs text-red-400 font-medium">
                    {error}
                  </div>
                )}
                {results && !hasResults && !isLoading && !error && (
                  <div className="p-4 text-center text-xs text-[#8F8F8F]">
                    No results found for &quot;{query}&quot;
                  </div>
                )}
                {/* Top Result */}
                {results?.topResult && results.topResult.item && (
                  <div className="p-2.5 bg-white/[0.04]">
                    <p className="text-[9px] font-mono text-[#A1A1A1] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>TOP RESULT</span>
                    </p>
                    {results.topResult.type === 'artist' && (
                      <Link
                        href={`/artist/${results.topResult.item.id}`}
                        onClick={() => setIsMobileSearchOpen(false)}
                        className="flex items-center space-x-2.5"
                      >
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#222] shrink-0">
                          <Image
                            src={results.topResult.item.imageUrl || results.topResult.item.image || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop'}
                            alt={results.topResult.item.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{results.topResult.item.name}</p>
                          <p className="text-[10px] text-[#8F8F8F]">Artist</p>
                        </div>
                      </Link>
                    )}
                    {results.topResult.type === 'song' && (
                      <div
                        onClick={() => {
                          playTrack(results.topResult!.item, results.songs);
                          setIsMobileSearchOpen(false);
                        }}
                        className="flex items-center space-x-2.5 cursor-pointer"
                      >
                        <div className="relative w-10 h-10 rounded-md overflow-hidden bg-[#222] shrink-0">
                          <Image
                            src={results.topResult.item.artworkUrl || results.topResult.item.artwork || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop'}
                            alt={results.topResult.item.title}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{results.topResult.item.title}</p>
                          <p className="text-[10px] text-[#8F8F8F] truncate">{results.topResult.item.artist}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Songs */}
                {results?.songs && results.songs.length > 0 && (
                  <div className="p-2">
                    <p className="text-[10px] font-mono text-[#8F8F8F] px-2 py-1 uppercase">
                      Songs ({results.songs.length})
                    </p>
                    {results.songs.slice(0, 8).map((song) => (
                      <div
                        key={song.id}
                        onClick={() => {
                          playTrack(song, results.songs);
                          setIsMobileSearchOpen(false);
                        }}
                        className="flex items-center space-x-2.5 p-2 rounded hover:bg-white/[0.04] cursor-pointer"
                      >
                        <div className="relative w-8 h-8 rounded overflow-hidden bg-[#222] shrink-0">
                          <Image
                            src={song.artworkUrl || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop'}
                            alt={song.title}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-white truncate">
                            {song.title}
                          </p>
                          <p className="text-[10px] text-[#8F8F8F] truncate">
                            {song.artist}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Artists */}
                {results?.artists && results.artists.length > 0 && (
                  <div className="p-2">
                    <p className="text-[10px] font-mono text-[#8F8F8F] px-2 py-1 uppercase">
                      Artists ({results.artists.length})
                    </p>
                    {results.artists.slice(0, 5).map((artist) => (
                      <Link
                        key={artist.id}
                        href={`/artist/${artist.id}`}
                        onClick={() => setIsMobileSearchOpen(false)}
                        className="flex items-center space-x-2.5 p-2 rounded-lg hover:bg-white/[0.04]"
                      >
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#222] shrink-0">
                          <Image
                            src={artist.imageUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop'}
                            alt={artist.name}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                        <span className="text-xs font-medium text-white truncate">
                          {artist.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Albums */}
                {results?.albums && results.albums.length > 0 && (
                  <div className="p-2">
                    <p className="text-[10px] font-mono text-[#8F8F8F] px-2 py-1 uppercase">
                      Albums ({results.albums.length})
                    </p>
                    {results.albums.slice(0, 4).map((album) => (
                      <Link
                        key={album.id}
                        href={`/album/${album.id}`}
                        onClick={() => setIsMobileSearchOpen(false)}
                        className="flex items-center space-x-2.5 p-2 rounded hover:bg-white/[0.04]"
                      >
                        <div className="relative w-8 h-8 rounded overflow-hidden bg-[#222] shrink-0">
                          <Image
                            src={album.artworkUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop'}
                            alt={album.title}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-white truncate">
                            {album.title}
                          </p>
                          <p className="text-[10px] text-[#8F8F8F] truncate">
                            {album.artist}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
