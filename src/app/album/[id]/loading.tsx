import React from 'react';

export default function AlbumLoading() {
  return (
    <div className="space-y-10 sm:space-y-14 animate-pulse select-none">
      <div className="w-20 h-4 bg-white/[0.04] rounded" />

      <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-6 sm:space-y-0 sm:space-x-8">
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-white/[0.04] shrink-0" />
        <div className="space-y-3 w-full max-w-md">
          <div className="w-28 h-5 bg-white/[0.04] rounded-full" />
          <div className="w-3/4 h-10 bg-white/[0.06] rounded-lg" />
          <div className="w-40 h-4 bg-white/[0.04] rounded" />
        </div>
      </div>
    </div>
  );
}
