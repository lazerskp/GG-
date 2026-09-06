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
  artist: string;
  artistId: string;
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
