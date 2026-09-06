/**
 * Artwork Quality Utility
 * 
 * Sourced directly from YouTube Music / Google usercontent CDN and Unsplash.
 * Upgrades thumbnail parameters to request the appropriate resolution
 * based on whether the image is rendered as a small thumbnail, medium card,
 * or high-resolution fullscreen master.
 */

export function getHighResArtwork(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  let cleaned = url.trim();
  if (!cleaned) return '';

  // Google User Content (YouTube Music album artwork master)
  if (cleaned.includes('googleusercontent.com')) {
    // Replace =w...-h... or =s... with =w1200-h1200-l90-rj
    cleaned = cleaned.replace(/=[ws]\d+.*$/, '=w1200-h1200-l90-rj');
  } else if (cleaned.includes('ytimg.com/vi/')) {
    // YouTube video thumbnail masters
    cleaned = cleaned.replace(/\/(?:default|mqdefault|hqdefault|sddefault)\.jpg/, '/maxresdefault.jpg');
  } else if (cleaned.includes('images.unsplash.com')) {
    cleaned = cleaned.replace(/[?&]w=\d+/, '?w=1200');
  }

  return cleaned;
}

/**
 * Medium-resolution artwork (600px) for large-but-not-fullscreen surfaces such as
 * the hero background, daily feature portrait, and ambient wash, where a 1200px master is wasteful.
 */
export function getMediumArtwork(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  let cleaned = url.trim();
  if (!cleaned) return '';

  if (cleaned.includes('googleusercontent.com')) {
    cleaned = cleaned.replace(/=[ws]\d+.*$/, '=w600-h600-l90-rj');
  } else if (cleaned.includes('ytimg.com/vi/')) {
    cleaned = cleaned.replace(/\/(?:default|mqdefault|hqdefault|maxresdefault)\.jpg/, '/sddefault.jpg');
  } else if (cleaned.includes('images.unsplash.com')) {
    cleaned = cleaned.replace(/[?&]w=\d+/, '?w=600').replace(/[?&]q=\d+/, '?q=80');
  }

  return cleaned;
}

/**
 * Lightweight thumbnail resolution (160–320px) for cards, track rows, and catalog grids.
 * Prevents mobile devices from downloading oversized 1200px masters on initial load.
 */
export function getThumbnailArtwork(url?: string | null, size = 320): string {
  if (!url || typeof url !== 'string') return '';
  let cleaned = url.trim();
  if (!cleaned) return '';

  if (cleaned.includes('googleusercontent.com')) {
    cleaned = cleaned.replace(/=[ws]\d+.*$/, `=w${size}-h${size}-l90-rj`);
  } else if (cleaned.includes('ytimg.com/vi/')) {
    cleaned = cleaned.replace(/\/(?:default|maxresdefault|sddefault|hqdefault)\.jpg/, '/mqdefault.jpg');
  } else if (cleaned.includes('images.unsplash.com')) {
    cleaned = cleaned.replace(/[?&]w=\d+/, `?w=${size}`).replace(/[?&]q=\d+/, '?q=75');
  }

  return cleaned;
}
