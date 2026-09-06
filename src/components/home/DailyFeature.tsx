'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, Sparkles, Calendar } from 'lucide-react';
import { DailyFeatureData, Song } from '@/types/music';
import { formatEditorialDate } from '@/utils/dateFormat';
import { usePlayerStore } from '@/store/usePlayerStore';
import { getMediumArtwork, getThumbnailArtwork } from '@/utils/artworkQuality';

interface DailyFeatureProps {
  data?: DailyFeatureData | null;
}

export function DailyFeature({ data }: DailyFeatureProps) {
  const { currentTrack, isPlaying, playbackStatus, playTrack, togglePlay } = usePlayerStore();

  if (!data || !data.artist || !data.song) {
    return (
      <section
        id="daily-feature"
        aria-label="The Daily Feature"
        className="mb-16 sm:mb-24 py-12 text-center border-t border-white/[0.04]"
      >
        <span className="text-xs font-mono uppercase tracking-widest text-[#A1A1A1] mb-2 inline-block">DAILY FEATURE</span>
        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">Today&apos;s Feature Selected Overnight</h2>
        <p className="text-sm text-[#A1A1A1] mt-2 max-w-sm mx-auto">The daily spotlight is being curated. Check back shortly for today&apos;s featured rapper.</p>
      </section>
    );
  }

  const isCurrentTrack = currentTrack?.id === data.song.id;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying && playbackStatus === 'playing';

  const handlePlayDailyTrack = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else {
      const songToPlay: Song = {
        id: data.song.id,
        title: data.song.title,
        artist: data.song.artist,
        artistId: data.song.artistId,
        artworkUrl: data.song.artwork,
        duration: data.song.duration,
        audioUrl: data.song.audioUrl,
        releaseYear: 0,
        region: data.artist.region,
        genre: data.song.genre,
      };
      playTrack(songToPlay, [songToPlay]);
    }
  };

  const artistImageSrc = getMediumArtwork(data.artist.image?.trim() || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop');
  const trackArtworkSrc = getThumbnailArtwork(data.song.artwork?.trim() || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop', 160);

  return (
    <section
      id="daily-feature"
      aria-label="The Daily Feature"
      className="mb-16 sm:mb-24 relative overflow-hidden pt-6 border-t border-white/[0.04]"
    >
      {/* Editorial Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 gap-3">
        <div className="flex items-center space-x-2.5">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-white">
            THE DAILY FEATURE
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#A1A1A1]">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatEditorialDate(data.date)}</span>
        </div>
      </div>

      {/* Magazine-Style 2-Column Editorial Spread (Fluid unboxed) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        {/* Left Column: Spotlight Artist Portrait with Editorial Overlay */}
        <div className="lg:col-span-6 relative aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden bg-[#141414] group">
          <Link
            href={`/artist/${encodeURIComponent(data.artist.id)}`}
            className="relative block w-full h-full"
          >
            <Image
              src={artistImageSrc}
              alt=""
              fill
              quality={75}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
              className="object-cover object-top filter contrast-105 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <span className="inline-block px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono uppercase tracking-widest text-white/90 border border-white/[0.1] mb-1.5">
                RAPPER OF THE DAY
              </span>
              <h3 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight group-hover:underline">
                {data.artist.name}
              </h3>
            </div>
          </Link>
        </div>

        {/* Right Column: Editorial Biography & Today's Track */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <p className="text-base sm:text-lg text-neutral-200 font-medium leading-relaxed">
              {data.artist.description}
            </p>

            {data.artist.quote && (
              <blockquote className="border-l-2 border-white/30 pl-4 text-sm italic text-[#A1A1A1] leading-normal font-serif">
                &ldquo;{data.artist.quote}&rdquo;
              </blockquote>
            )}

            {data.artist.monthlyListeners && (
              <p className="text-xs font-mono text-[#A1A1A1] uppercase tracking-wider">
                Monthly Reach: <span className="text-white font-medium">{data.artist.monthlyListeners}</span>
              </p>
            )}
          </div>

          {/* Today's Track Bar (Clean inline, unboxed) */}
          <div className="pt-5 border-t border-white/[0.08] flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4 min-w-0">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#171717] shrink-0 border border-white/[0.08] shadow-lg group">
                <Image
                  src={trackArtworkSrc}
                  alt={data.song.title}
                  fill
                  sizes="56px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1A1]">
                  TODAY&apos;S ESSENTIAL TRACK
                </span>
                <p className="text-base font-bold text-white truncate leading-tight mt-0.5">
                  {data.song.title}
                </p>
                <p className="text-xs text-[#A1A1A1] truncate mt-0.5">
                  <Link
                    href={`/artist/${encodeURIComponent(data.artist.id)}`}
                    className="hover:text-white hover:underline transition-colors"
                  >
                    {data.song.artist}
                  </Link>
                  {' '}• {data.song.genre}
                </p>
              </div>
            </div>

            <button
              onClick={handlePlayDailyTrack}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_4px_24px_rgba(255,255,255,0.2)] shrink-0"
              aria-label={isCurrentlyPlaying ? 'Pause featured track' : 'Play featured track'}
            >
              {isCurrentlyPlaying ? (
                <Pause className="w-5 h-5 fill-black text-black" />
              ) : (
                <Play className="w-5 h-5 fill-black text-black ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
