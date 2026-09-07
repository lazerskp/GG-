/**
 * Centralized music classification utilities.
 *
 * - Market (formerly region) — INDIAN, DESI, GLOBAL, UNKNOWN.
 * - Genre normalization — never silently default missing genres to a label.
 * - Artist label formatter — readable multi-artist display strings.
 *
 * These utilities are the single source of truth for classification
 * across the ingestion pipeline, the API layer, and the UI.
 */

export type Market = 'INDIAN' | 'DESI' | 'GLOBAL' | 'UNKNOWN';

export type LegacyRegion = 'india' | 'global';

export const KNOWN_MARKETS: Market[] = ['INDIAN', 'DESI', 'GLOBAL', 'UNKNOWN'];

const KNOWN_MARKET_VALUES = new Set<string>(KNOWN_MARKETS);

/**
 * Tokens that indicate the artist is rooted in the Indian subcontinent
 * or the broader Desi (South Asian) diaspora.
 */
const INDIAN_KEYWORDS = [
  'divine', 'seedhe maut', 'krsna', 'kr$na', 'hanumankind', 'mc stan',
  'emiway', 'emiway bantai', 'raftaar', 'badshah', 'ikka', 'fotty seven',
  'rawal', 'bharg', 'prabh deep', 'chaar diwaari', 'talha anjum', 'young stunners',
  'sambata', 'ahmer', 'faris shafi', 'naezy', 'brodha v', 'yashraj',
  'dino james', 'krsna', 'aastha gill', 'aastha', 'tony kakkar', 'badshah',
  'honey singh', 'yo yo honey singh', 'mankirt aulakh',
  'badshah', 'diljit', 'diljit dosanjh', 'ap dhillon', 'karan aujla',
  'shubh', 'sidhu moose wala', 'moosetape',
];

const DESI_KEYWORDS = [
  ...INDIAN_KEYWORDS,
  'desi', 'south asian', 'south-asia', 'punjabi', 'hindustani', 'hindustan',
  'mumbai', 'delhi', 'kolkata', 'bengaluru', 'bangalore', 'hyderabad',
  'chennai', 'jaipur', 'lucknow', 'pune', 'surat', 'karachi', 'lahore',
  'guwahati', 'kochi', 'bhubaneswar', 'cuttack', 'odia', 'odia rap',
];

const NON_HIPHOP_GENRE_TOKENS = [
  'pop', 'rock', 'country', 'folk', 'jazz', 'soul', 'r&b', 'rnb',
  'electronic', 'edm', 'house', 'techno', 'trance', 'reggae', 'classical',
  'carnatic', 'hindustani classical', 'ghazal', 'qawwali', 'sufi',
  'indie pop', 'indie rock', 'alternative rock', 'synth-pop', 'synthpop',
  'dance', 'bollywood', 'filmi', 'soundtrack', 'lofi', 'lo-fi',
];

/**
 * Conservative market classification.
 *
 * Returns:
 * - 'INDIAN' if the artist is explicitly Indian (matches an Indian artist token).
 * - 'DESI'   if the artist is from the broader South Asian diaspora but not India.
 * - 'GLOBAL' if the artist is clearly not Indian / Desi.
 * - 'UNKNOWN' if the input is empty or matches no signal. NEVER defaults to India or Global.
 *
 * Pass a hint string (e.g. the upstream provider's region/country field) to
 * bias the classification when present.
 */
export function classifyMarket(input: {
  name?: string | null;
  description?: string | null;
  providerRegion?: string | null;
  region?: string | null;
}): Market {
  const name = (input.name || '').trim();
  const description = (input.description || '').trim();
  const providerRegion = normalizeProviderRegion(input.providerRegion ?? input.region);

  // Provider region wins when it is unambiguous.
  if (providerRegion === 'INDIAN') return 'INDIAN';
  if (providerRegion === 'GLOBAL') return 'GLOBAL';

  const haystack = `${name} ${description}`.toLowerCase().trim();
  if (!haystack) return 'UNKNOWN';

  if (INDIAN_KEYWORDS.some((kw) => haystack.includes(kw))) return 'INDIAN';
  if (DESI_KEYWORDS.some((kw) => haystack.includes(kw))) return 'DESI';

  return 'UNKNOWN';
}

function normalizeProviderRegion(value: string | null | undefined): Market | null {
  if (!value) return null;
  const lower = String(value).toLowerCase().trim();
  if (!lower) return null;

  if (
    lower === 'india' ||
    lower === 'in' ||
    lower === 'indian' ||
    lower === 'desi'
  ) {
    // Provider reports 'desi' for diaspora artists; preserve that nuance.
    return lower === 'desi' ? 'DESI' : 'INDIAN';
  }

  if (
    lower === 'global' ||
    lower === 'worldwide' ||
    lower === 'us' ||
    lower === 'uk' ||
    lower === 'eu'
  ) {
    return 'GLOBAL';
  }

  // Unknown provider value — return null to fall through to keyword classification.
  return null;
}

export function marketToLegacyRegion(market: Market): LegacyRegion {
  return market === 'INDIAN' || market === 'DESI' ? 'india' : 'global';
}

export function legacyRegionToMarket(region: LegacyRegion | string | null | undefined): Market {
  if (!region) return 'UNKNOWN';
  const lower = String(region).toLowerCase();
  if (lower === 'india') return 'INDIAN';
  if (lower === 'global') return 'GLOBAL';
  if (lower === 'desi') return 'DESI';
  return 'UNKNOWN';
}

export function isIndianOrDesi(market: Market | string | null | undefined): boolean {
  return market === 'INDIAN' || market === 'DESI' || legacyRegionToMarket(market as LegacyRegion) === 'INDIAN';
}

export function isCuratedIndianMarket(market: Market | string | null | undefined): boolean {
  const m = typeof market === 'string' && KNOWN_MARKET_VALUES.has(market)
    ? (market as Market)
    : legacyRegionToMarket(market as LegacyRegion);
  return m === 'INDIAN';
}

/**
 * Genre normalization.
 *
 * Rules:
 * 1. Never invent a genre when the source returns nothing.
 * 2. Normalize obviously equivalent terms (e.g. "Hip Hop" → "Hip-Hop").
 * 3. Drop empty / whitespace entries.
 * 4. If a genre token clearly signals a non-Hip-Hop genre, still preserve it
 *    (do NOT mutate it into "Hip-Hop").
 */
const GENRE_EQUIVALENTS: Record<string, string> = {
  'hip hop': 'Hip-Hop',
  'hiphop': 'Hip-Hop',
  'hip-hop': 'Hip-Hop',
  'desi rap': 'Desi Hip-Hop',
  'desi hip hop': 'Desi Hip-Hop',
  'desi-hip-hop': 'Desi Hip-Hop',
  'hi-hop': 'Hip-Hop',
  'r&b': 'R&B',
  'rnb': 'R&B',
  'lofi': 'Lo-Fi',
  'lo-fi': 'Lo-Fi',
};

function normalizeOneGenre(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (GENRE_EQUIVALENTS[lower]) return GENRE_EQUIVALENTS[lower];
  return trimmed;
}

export function normalizeGenres(input: unknown): string[] {
  if (input == null) return [];
  if (Array.isArray(input)) {
    const out: string[] = [];
    const seen = new Set<string>();
    for (const g of input) {
      const norm = normalizeOneGenre(String(g));
      if (norm && !seen.has(norm.toLowerCase())) {
        seen.add(norm.toLowerCase());
        out.push(norm);
      }
    }
    return out;
  }
  if (typeof input === 'string') {
    const norm = normalizeOneGenre(input);
    return norm ? [norm] : [];
  }
  return [];
}

/**
 * UI-friendly primary genre label.
 * Returns null when no real genre exists. The UI must NEVER silently
 * substitute a fabricated label here.
 */
export function primaryGenreLabel(artist: { genres?: unknown } | null | undefined): string | null {
  if (!artist) return null;
  const normalized = normalizeGenres(artist.genres);
  return normalized.length > 0 ? normalized[0] : null;
}

/**
 * Determine whether the artist is actually a Hip-Hop artist based on
 * available genre tags. Used to gate the "Hip-Hop" UI label and to
 * decide if an artist belongs in curated hip-hop sections.
 */
export function isHipHopArtist(artist: { genres?: unknown } | null | undefined): boolean {
  const labels = normalizeGenres(artist?.genres);
  return labels.some((g) => /hip[- ]hop|rap|drill|trap|boom bap/i.test(g));
}

/**
 * Multi-artist display formatter.
 *
 * 0 artists  → ''
 * 1 artist   → 'Artist A'
 * 2 artists  → 'Artist A & Artist B'
 * 3+ artists → 'Artist A, Artist B + N more'
 *
 * For compilation/soundtrack/remix tracks where the underlying source
 * indicates the primary artist is not meaningful, callers should pass
 * { primaryIsVarious: true } and the result becomes 'Various Artists'.
 *
 * The full underlying credit list is always preserved — callers can use
 * the helper to read `formatArtistFullCredit` for tooltips / detail pages.
 */
export interface ArtistLabelInput {
  artists: Array<string | null | undefined>;
  primaryIsVarious?: boolean;
  separator?: string;
  lastSeparator?: string;
  moreText?: (n: number) => string;
}

const DEFAULT_OPTIONS = {
  separator: ', ',
  lastSeparator: ' & ',
  moreText: (n: number) => `+ ${n} more`,
};

export function formatArtistLabel(input: ArtistLabelInput): string {
  const opts = { ...DEFAULT_OPTIONS, ...input };
  const clean = (input.artists || [])
    .map((a) => (a == null ? '' : String(a).trim()))
    .filter((s) => s.length > 0);

  if (clean.length === 0) {
    if (opts.primaryIsVarious) return 'Various Artists';
    return '';
  }

  if (opts.primaryIsVarious && clean.length === 1 && /^various\s*artists?$/i.test(clean[0])) {
    return 'Various Artists';
  }

  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]}${opts.lastSeparator}${clean[1]}`;

  const head = clean.slice(0, 2).join(opts.separator);
  const rest = clean.length - 2;
  return `${head} ${opts.moreText(rest)}`;
}

/**
 * Full credit string for tooltips and detail views.
 * Always preserves every distinct artist in the source order.
 */
export function formatArtistFullCredit(input: ArtistLabelInput): string {
  const opts = { ...DEFAULT_OPTIONS, separator: ', ', lastSeparator: ', ', moreText: (n: number) => `+ ${n} more`, ...input };
  const clean = (input.artists || [])
    .map((a) => (a == null ? '' : String(a).trim()))
    .filter((s) => s.length > 0);
  if (clean.length === 0) return opts.primaryIsVarious ? 'Various Artists' : '';
  if (clean.length === 1) return clean[0];
  return clean.join(opts.separator);
}

/**
 * Indicates that a track was authored by a "Various Artists" entry in the
 * upstream catalog. Used by the formatter and detail pages.
 */
export function detectVariousArtists(input: {
  primary?: string | null;
  artists?: Array<string | null | undefined>;
}): boolean {
  if (!input) return false;
  if (/^various\s*artists?$/i.test(String(input.primary || '').trim())) return true;
  if (Array.isArray(input.artists) && input.artists.length === 1 &&
      /^various\s*artists?$/i.test(String(input.artists[0] || '').trim())) {
    return true;
  }
  return false;
}

/**
 * Conservative freshness formatter.
 * Returns null when no timestamp is available; the UI must NOT fabricate one.
 */
export function formatFreshnessRelative(iso: string | null | undefined, now: Date = new Date()): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;

  const diffMs = now.getTime() - t;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'Updated just now';
  if (minutes < 60) return `Updated ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Updated ${days} day${days === 1 ? '' : 's'} ago`;
  return null;
}

export const __testing = {
  INDIAN_KEYWORDS,
  DESI_KEYWORDS,
  NON_HIPHOP_GENRE_TOKENS,
  classifyMarket,
  normalizeGenres,
  isHipHopArtist,
};
