'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { Album } from '@/types/music';
import { getThumbnailArtwork } from '@/utils/artworkQuality';

interface AlbumCardProps {
  album: Album;
  onPlay?: () => void;
}

export function AlbumCard({ album, onPlay }: AlbumCardProps) {
  const rawArtwork =
    album.artworkUrl?.trim() ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop';
  const artworkSrc = getThumbnailArtwork(rawArtwork, 320);

  return (
    <div className="group relative flex flex-col select-none">
      {/* Artwork container — borderless editorial presentation with subtle lift on hover */}
      <div className="relative aspect-square w-full rounded-md overflow-hidden bg-[#121212] border border-white/[0.06] mb-3 group-hover:border-white/20 transition-all duration-300">
        <Link
          href={`/album/${encodeURIComponent(album.id)}`}
          className="absolute inset-0 z-0"
          aria-label={`Open ${album.title} by ${album.artist}`}
        >
          <Image
            src={artworkSrc}
            alt={album.title}
            fill
            sizes="(max-width: 640px) 160px, (max-width: 1024px) 200px, 240px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Floating Quick Play button on hover */}
        {onPlay && (
          <div className="absolute inset-0 z-10 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPlay();
              }}
              aria-label={`Play ${album.title}`}
              className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transform translate-y-1 group-hover:translate-y-0 transition-all duration-200 hover:scale-105 pointer-events-auto"
            >
              <Play className="w-4 h-4 fill-black text-black ml-0.5" />
            </button>
          </div>
        )}

        {/* Minimal format badge */}
        {album.type && (
          <div className="absolute top-2 left-2 z-10 pointer-events-none px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-mono uppercase tracking-wider text-[#A1A1A6] border border-white/[0.08]">
            {album.type}
          </div>
        )}
      </div>

      {/* Album Info */}
      <div className="space-y-0.5">
        <Link
          href={`/album/${encodeURIComponent(album.id)}`}
          className="block"
        >
          <h3 className="text-xs sm:text-sm font-semibold text-white tracking-tight truncate group-hover:underline transition-colors">
            {album.title}
          </h3>
        </Link>
        <div className="flex items-center space-x-1.5 text-xs text-[#8F8F8F]">
          <span className="truncate max-w-[140px] text-[#A1A1A6]">{album.artist}</span>
          {Boolean(album.releaseYear && album.releaseYear > 0) && (
            <>
              <span aria-hidden="true" className="text-[#636366]">•</span>
              <span className="font-mono tabular-nums text-[11px] text-[#8F8F8F]">{album.releaseYear}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
