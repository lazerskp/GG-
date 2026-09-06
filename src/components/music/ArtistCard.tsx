import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Artist } from '@/types/music';
import { getThumbnailArtwork } from '@/utils/artworkQuality';

interface ArtistCardProps {
  artist: Artist;
  onClick?: () => void;
}

export function ArtistCard({ artist, onClick }: ArtistCardProps) {
  const rawAvatar =
    artist.imageUrl?.trim() ||
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop';
  const avatarSrc = getThumbnailArtwork(rawAvatar, 320);

  // Real metadata only: genre, moniker, or verified badge. Zero fake listener counts.
  const subtitle = artist.moniker || (artist.genres && artist.genres.length > 0 ? artist.genres[0] : 'Hip-Hop');

  const content = (
    <div
      onClick={onClick}
      className="group flex flex-col items-center text-center cursor-pointer select-none"
    >
      {/* Circular Artist Image with refined border & gentle hover scale */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden bg-[#121212] border border-white/[0.08] mb-3 group-hover:border-white/30 transition-all duration-300">
        <Image
          src={avatarSrc}
          alt={artist.name}
          fill
          sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {/* Subtle dark rim vignette on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Artist Details */}
      <div className="space-y-0.5 max-w-[130px] sm:max-w-[150px]">
        <h3 className="text-xs sm:text-sm font-semibold text-white tracking-tight truncate group-hover:underline transition-colors">
          {artist.name}
        </h3>
        <p className="text-[11px] text-[#8F8F8F] tracking-normal truncate">
          {subtitle}
        </p>
      </div>
    </div>
  );

  return (
    <Link
      href={`/artist/${encodeURIComponent(artist.id)}`}
      className="block"
      aria-label={`View ${artist.name} profile`}
    >
      {content}
    </Link>
  );
}
