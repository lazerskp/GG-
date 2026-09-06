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
      {/* Artwork container */}
      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[#171717] border border-white/[0.06] mb-3 group-hover:border-white/20 transition-all duration-300">
        <Link
          href={`/album/${encodeURIComponent(album.id)}`}
          className="absolute inset-0 z-0"
          aria-label={`Open ${album.title} by ${album.artist} album page`}
        >
          <Image
            src={artworkSrc}
            alt=""
            fill
            sizes="(max-width: 640px) 160px, (max-width: 1024px) 200px, 240px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Floating Quick Play button on hover (positioned over artwork without nesting in <a>) */}
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
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 hover:scale-105 pointer-events-auto"
            >
              <Play className="w-5 h-5 fill-black text-black ml-0.5" />
            </button>
          </div>
        )}

        {/* Subtle format badge */}
        <div className="absolute top-2 left-2 z-10 pointer-events-none px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-semibold uppercase tracking-wider text-white border border-white/[0.1]">
          {album.type}
        </div>
      </div>

      {/* Album Info */}
      <div className="space-y-0.5">
        <Link
          href={`/album/${encodeURIComponent(album.id)}`}
          className="block"
        >
          <h3 className="text-sm font-semibold text-white tracking-tight truncate group-hover:underline transition-colors">
            {album.title}
          </h3>
        </Link>
        <div className="flex items-center space-x-1.5 text-xs text-[#A1A1A1]">
          <span className="truncate max-w-[120px] text-[#A1A1A1]">{album.artist}</span>
          {album.releaseYear > 0 && (
            <>
              <span aria-hidden="true">•</span>
              <span className="font-mono tabular-nums">{album.releaseYear}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
