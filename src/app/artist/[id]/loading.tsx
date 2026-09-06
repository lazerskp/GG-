import React from 'react';

export default function ArtistLoading() {
  return (
    <div className="space-y-12 sm:space-y-16 animate-pulse select-none">
      {/* Back button skeleton */}
      <div className="w-20 h-4 bg-white/[0.04] rounded" />

      {/* Hero skeleton */}
      <div className="relative -mt-6 rounded-2xl overflow-hidden min-h-[380px] sm:min-h-[460px] bg-white/[0.02] p-6 sm:p-10 lg:p-14 flex flex-col justify-end space-y-4">
        {/* Badges skeleton */}
        <div className="flex space-x-2">
          <div className="w-24 h-5 bg-white/[0.06] rounded-full" />
          <div className="w-20 h-5 bg-white/[0.04] rounded-full" />
        </div>

        {/* Title skeleton */}
        <div className="w-3/4 max-w-md h-12 sm:h-16 bg-white/[0.06] rounded-lg" />

        {/* Listeners & Bio skeleton */}
        <div className="w-40 h-4 bg-white/[0.04] rounded" />
        <div className="space-y-2 max-w-2xl">
          <div className="w-full h-3.5 bg-white/[0.03] rounded" />
          <div className="w-5/6 h-3.5 bg-white/[0.03] rounded" />
        </div>

        {/* Button skeleton */}
        <div className="flex space-x-3 pt-2">
          <div className="w-28 h-10 bg-white/[0.08] rounded-full" />
          <div className="w-10 h-10 bg-white/[0.04] rounded-full" />
        </div>
      </div>

      {/* Top Songs skeleton */}
      <div className="space-y-4">
        <div className="w-32 h-5 bg-white/[0.06] rounded" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/[0.02]"
            >
              <div className="flex items-center space-x-4">
                <div className="w-5 h-4 bg-white/[0.04] rounded" />
                <div className="w-11 h-11 bg-white/[0.05] rounded-md shrink-0" />
                <div className="space-y-1.5">
                  <div className="w-36 h-3.5 bg-white/[0.05] rounded" />
                  <div className="w-24 h-3 bg-white/[0.03] rounded" />
                </div>
              </div>
              <div className="w-12 h-3 bg-white/[0.04] rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Albums skeleton */}
      <div className="space-y-4">
        <div className="w-40 h-5 bg-white/[0.06] rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2.5">
              <div className="aspect-square w-full rounded-lg bg-white/[0.04]" />
              <div className="w-3/4 h-3.5 bg-white/[0.05] rounded" />
              <div className="w-1/2 h-3 bg-white/[0.03] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
