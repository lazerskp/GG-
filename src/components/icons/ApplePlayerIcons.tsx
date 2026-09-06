import React from 'react';

/**
 * Apple Music-style Lyrics Icon:
 * A rounded speech bubble with quotation marks inside.
 */
export function AppleLyricsIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.75 4C3.23 4 2 5.23 2 6.75v8.5C2 16.77 3.23 18 4.75 18H6v3.25c0 .67.81 1.01 1.28.53L10.8 18h8.45c1.52 0 2.75-1.23 2.75-2.75v-8.5C22 5.23 20.77 4 19.25 4H4.75zm3.85 5.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5c0 .55.3.98.68 1.25l-.58 1.63c-.11.31.14.62.47.54.42-.1 1.09-.37 1.53-.87.38-.43.6-.97.6-1.55zm5.5 0c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5c0 .55.3.98.68 1.25l-.58 1.63c-.11.31.14.62.47.54.42-.1 1.09-.37 1.53-.87.38-.43.6-.97.6-1.55z"
      />
    </svg>
  );
}

/**
 * Apple Music-style Queue / Playing Next Icon:
 * 3 bullet dots on the left paired with 3 rounded horizontal bars on the right.
 */
export function AppleQueueIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* 3 bullet dots */}
      <circle cx="5" cy="7" r="1.6" />
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="5" cy="17" r="1.6" />

      {/* 3 horizontal rounded bars */}
      <rect x="8.75" y="5.75" width="10.5" height="2.5" rx="1.25" />
      <rect x="8.75" y="10.75" width="10.5" height="2.5" rx="1.25" />
      <rect x="8.75" y="15.75" width="10.5" height="2.5" rx="1.25" />
    </svg>
  );
}

export type FullscreenViewTab = 'lyrics' | 'queue' | 'none';

interface AppleViewTogglePillProps {
  activeTab: FullscreenViewTab;
  onToggle: (tab: FullscreenViewTab) => void;
  className?: string;
  size?: 'normal' | 'compact';
}

/**
 * Apple Music-inspired capsule toggle pill:
 * - If lyrics clicked when inactive -> switch to lyrics
 * - If lyrics clicked when active -> toggle off to 'none' (center music card)
 * - If queue clicked when inactive -> switch to queue
 * - If queue clicked when active -> toggle off to 'none' (center music card)
 * - Highlights active view with an Apple Music solid circular pill disc
 */
export function AppleViewTogglePill({
  activeTab,
  onToggle,
  className = '',
  size = 'normal',
}: AppleViewTogglePillProps) {
  const isCompact = size === 'compact';
  const pillClasses = isCompact
    ? 'h-8 p-0.5 gap-0.5 rounded-full bg-white/[0.08] backdrop-blur-2xl border border-white/[0.12] shadow-sm inline-flex items-center select-none'
    : 'h-10 p-1 gap-1 rounded-full bg-white/[0.08] backdrop-blur-2xl border border-white/[0.15] shadow-md inline-flex items-center select-none';

  const btnClasses = isCompact ? 'w-7 h-7' : 'w-8 h-8';
  const iconSize = isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4';

  const handleLyricsClick = () => {
    if (activeTab === 'lyrics') {
      onToggle('none');
    } else {
      onToggle('lyrics');
    }
  };

  const handleQueueClick = () => {
    if (activeTab === 'queue') {
      onToggle('none');
    } else {
      onToggle('queue');
    }
  };

  return (
    <div className={`${pillClasses} ${className}`} role="tablist" aria-label="View switcher">
      {/* Lyrics Toggle Button */}
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'lyrics'}
        aria-label="Toggle Lyrics (click again to center artwork)"
        title={activeTab === 'lyrics' ? 'Hide Lyrics (Center Artwork)' : 'Show Lyrics'}
        onClick={handleLyricsClick}
        className={`${btnClasses} rounded-full flex items-center justify-center transition-all duration-200 ${
          activeTab === 'lyrics'
            ? 'bg-[#EFECE8] text-[#1E1713] shadow-sm scale-100'
            : 'text-white/60 hover:text-white hover:bg-white/[0.06] active:scale-95'
        }`}
      >
        <AppleLyricsIcon className={iconSize} />
      </button>

      {/* Queue Toggle Button */}
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'queue'}
        aria-label="Toggle Queue (click again to center artwork)"
        title={activeTab === 'queue' ? 'Hide Queue (Center Artwork)' : 'Show Queue'}
        onClick={handleQueueClick}
        className={`${btnClasses} rounded-full flex items-center justify-center transition-all duration-200 ${
          activeTab === 'queue'
            ? 'bg-[#EFECE8] text-[#1E1713] shadow-sm scale-100'
            : 'text-white/60 hover:text-white hover:bg-white/[0.06] active:scale-95'
        }`}
      >
        <AppleQueueIcon className={iconSize} />
      </button>
    </div>
  );
}
