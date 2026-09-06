import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[#1A1A1A] ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonArtistCard() {
  return (
    <div className="flex flex-col items-center space-y-3">
      <Skeleton className="w-28 h-28 sm:w-36 sm:h-36 rounded-full" />
      <Skeleton className="w-20 h-4" />
      <Skeleton className="w-14 h-3 bg-[#171717]" />
    </div>
  );
}

export function SkeletonTrackRow() {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-white/[0.04] bg-[#111111]/40">
      <div className="flex items-center space-x-3.5">
        <Skeleton className="w-5 h-4" />
        <Skeleton className="w-12 h-12 rounded" />
        <div className="space-y-1.5">
          <Skeleton className="w-32 sm:w-48 h-4" />
          <Skeleton className="w-20 sm:w-28 h-3" />
        </div>
      </div>
      <Skeleton className="w-10 h-3" />
    </div>
  );
}

export function SkeletonAlbumCard() {
  return (
    <div className="space-y-2.5">
      <Skeleton className="w-full aspect-square rounded-lg" />
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-1/2 h-3" />
    </div>
  );
}
