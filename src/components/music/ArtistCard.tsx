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

  const content = (
    <div
      onClick={onClick}
      className="group flex flex-col items-center text-center cursor-pointer select-none transition-transform duration-300"
    >
      {/* Circular Artist Image with subtle ambient glow on hover */}
      <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden bg-[#171717] border border-white/[0.08] mb-3 group-hover:border-white/30 transition-all duration-300 shadow-md">
        <Image
          src={avatarSrc}
          alt=""
          fill
          sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 160px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-108"
        />
        {/* Subtle dark rim lighting */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Artist Details */}
      <div className="space-y-0.5 max-w-[140px] sm:max-w-[160px]">
        <h3 className="text-sm font-semibold text-white tracking-tight truncate group-hover:text-white group-hover:underline transition-colors">
          {artist.name}
        </h3>
        <p className="text-xs text-[#A1A1A1] tracking-normal truncate">
          {artist.monthlyListeners ? `${artist.monthlyListeners} monthly` : 'Artist'}
        </p>
      </div>
    </div>
  );

  return (
    <Link
      href={`/artist/${encodeURIComponent(artist.id)}`}
      className="block"
    >
      {content}
    </Link>
  );
}
