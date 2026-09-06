const KNOWN_TRACK_MAP: Record<string, string> = {
  // Indian Rap Fixtures & Anthems
  'ind-01': 'HmW1wIhyCng', // 3:59 AM - DIVINE
  'ind-02': 'H7B0xI75LqM', // Nanchaku - Seedhe Maut
  'ind-03': 'sqw90xibWaE', // Big Dawgs - Hanumankind
  'ind-04': '1p_z4W9_VqA', // Prarthana - KR$NA
  'ind-05': '0c_Z2Xb2E6U', // Kohinoor - DIVINE
  'ind-06': '0uA6-z1C3R0', // Namastute - Seedhe Maut
  'ind-07': '_s87M-y1078', // Machayenge - Emiway Bantai
  'ind-08': 'fPZ2u3y3nK0', // Aaina - Chaar Diwaari
  'ind-09': 'uG0Uj8r8F2I', // Aathma Raama - Brodha V
  'ind-10': '1_gG7g4T-H4', // No Cap - KR$NA
  // Global Rap Fixtures
  'glb-01': 'T6eK-2OQtew', // Not Like Us - Kendrick Lamar
  'glb-02': 'B9synWjqBn8', // FE!N - Travis Scott
  'glb-03': 'uDY3x1Z9_V0', // Band4Band - Central Cee
  'glb-04': 'k3qR9_d1V2s', // redrum - 21 Savage
  'glb-05': 'wilRRtq8WPE', // Middle Child - J. Cole
  'glb-06': 'zI383HGqPh8', // N95 - Kendrick Lamar
  'glb-07': '6ONRf7h3Mdk', // SICKO MODE - Travis Scott
  'glb-08': '0bA3PzP9L6Y', // Doja - Central Cee
  'glb-09': 'low6CoQRw9Y', // No Role Modelz - J. Cole
  'glb-10': 'TGgcC539YGU', // SEE YOU AGAIN - Tyler, The Creator
  // Legacy / DB Seeds
  'mirchi': 'sX8O0b2Y-V4',
  'song-divine': 'HmW1wIhyCng',
  'song-seedhe-maut': 'H7B0xI75LqM',
  'song-krsna': '1p_z4W9_VqA',
  'song-hanumankind': 'sqw90xibWaE',
  'song-kendrick-lamar': 'T6eK-2OQtew',
  'song-travis-scott': 'B9synWjqBn8',
};

/**
 * Pure YouTube ID extraction and normalization utility.
 * Safe for both React Server Components / server-only modules and Client Components.
 */
export function extractCleanYouTubeId(rawId: string): string {
  if (!rawId || typeof rawId !== 'string') return '';
  let trimmed = rawId.trim();

  // 1. Direct match in known fixture / seed catalog
  if (KNOWN_TRACK_MAP[trimmed]) return KNOWN_TRACK_MAP[trimmed];

  // 2. Strip common database/provider prefixes like "yt-" or "youtube-"
  trimmed = trimmed.replace(/^(?:yt[-_]|youtube[-_])/, '');
  if (KNOWN_TRACK_MAP[trimmed]) return KNOWN_TRACK_MAP[trimmed];

  // 3. Fallback prefix check for dynamic song-[artist] slugs
  if (trimmed.startsWith('song-')) {
    const artistSlug = trimmed.replace(/^song-/, '');
    if (KNOWN_TRACK_MAP[`song-${artistSlug}`]) {
      return KNOWN_TRACK_MAP[`song-${artistSlug}`];
    }
  }

  // 4. YouTube URL matching (youtu.be, watch?v=, embed/)
  const urlMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([A-Za-z0-9_-]{11})/
  );
  if (urlMatch && urlMatch[1]) return urlMatch[1];

  // 5. Direct 11-char YouTube Video ID
  const directMatch = trimmed.match(/^[A-Za-z0-9_-]{11}$/);
  if (directMatch) return directMatch[0];

  return trimmed;
}
