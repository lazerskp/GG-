export type Region = 'india' | 'global';

export interface Artist {
  id: string;
  name: string;
  moniker?: string;
  bio: string;
  imageUrl: string;
  region: Region;
  monthlyListeners: string;
  genres: string[];
  verified?: boolean;
}

export interface Song {
  id: string;
  title: string;
  /**
   * The display artist string. For single-artist tracks this is the
   * artist's name; for compilation/remix/soundtrack tracks where the
   * primary credit is not meaningful, this may be "Various Artists".
   */
  artist: string;
  artistId: string;
  /**
   * The full ordered list of credited artists as returned by the source.
   * `artist` and `artistId` are the primary (first) credit and remain
   * the canonical link target. The full credit list is preserved here so
   * detail pages and tooltips can show every contributor without losing
   * data.
   */
  artistCredits?: string[];
  /**
   * True when the source explicitly reports a "Various Artists" credit
   * (e.g. compilations, soundtracks, label samplers). The UI may use this
   * to suppress primary-artist links and surface "Various Artists"
   * instead.
   */
  isVariousArtists?: boolean;
  album?: string;
  albumId?: string;
  artworkUrl: string;
  duration: number; // in seconds
  audioUrl?: string;
  releaseYear: number;
  region: Region;
  trendingRank?: number;
  genre: string;
  plays?: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  artworkUrl: string;
  releaseYear: number; // 0 when the source does not expose a year
  trackCount: number; // 0 when the source does not expose a count
  type: 'album' | 'ep' | 'single';
  region: Region;
  tracks?: Song[]; // populated for album detail payloads when the provider returns a tracklist
  /**
   * Display label for the credited primary artist. When this is true
   * the album is a compilation / soundtrack / label sampler whose
   * primary credit is not meaningful, and the UI should render
   * "Various Artists" instead of a specific name.
   */
  isVariousArtists?: boolean;
}

export interface DailyFeatureData {
  date: string;
  artist: {
    id: string;
    name: string;
    image: string;
    description: string;
    region: Region;
    monthlyListeners?: string;
    quote?: string;
  };
  song: {
    id: string;
    title: string;
    artist: string;
    artistId: string;
    artwork: string;
    duration: number;
    genre: string;
    audioUrl?: string;
  };
}
