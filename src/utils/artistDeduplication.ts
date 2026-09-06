import { Artist } from '@/types/music';

/**
 * Normalizes an artist name into a canonical deduplication key.
 * Strips punctuation, spaces, case differences, and common prefixes/suffixes.
 * E.g. "KR$NA" -> "krsna", "Seedhe Maut" -> "seedhemaut", "DiVine" -> "divine"
 */
export function normalizeArtistName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[$]/g, 's')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Deduplicates a list of artists across:
 * 1. Stable Artist ID
 * 2. Normalized Name (catches cases where an artist has multiple provider IDs,
 *    such as custom slug 'seedhe-maut' vs YouTube channel ID 'UC1GgYq_r8A9l_3Z0q8Qe8_A')
 *
 * Prefers the record with:
 * - A verified flag
 * - A richer avatar / bio
 * - A canonical slug ID if available
 */
export function deduplicateArtists(artists: Artist[]): Artist[] {
  if (!Array.isArray(artists) || artists.length === 0) return [];

  const seenIds = new Set<string>();
  const nameMap = new Map<string, Artist>();

  for (const artist of artists) {
    if (!artist || !artist.name) continue;

    // Check if ID is already seen
    if (artist.id && seenIds.has(artist.id)) continue;

    const normName = normalizeArtistName(artist.name);
    if (!normName) continue;

    const existing = nameMap.get(normName);
    if (!existing) {
      nameMap.set(normName, artist);
      if (artist.id) seenIds.add(artist.id);
    } else {
      // Score which record to retain: prefer verified, valid images, or canonical slugs
      const existingScore = (existing.verified ? 2 : 0) + (existing.bio ? 1 : 0) + (!existing.id.startsWith('UC') ? 1 : 0);
      const currentScore = (artist.verified ? 2 : 0) + (artist.bio ? 1 : 0) + (!artist.id.startsWith('UC') ? 1 : 0);

      if (currentScore > existingScore) {
        if (existing.id) seenIds.delete(existing.id);
        nameMap.set(normName, artist);
        if (artist.id) seenIds.add(artist.id);
      }
    }
  }

  return Array.from(nameMap.values());
}
