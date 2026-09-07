import { Artist, Song, Album } from '@/types/music';
import {
  getDevIndianArtists,
  getDevIndianTracks,
  getDevIndianAlbums,
  getDevGlobalArtists,
  getDevGlobalTracks,
  getDevGlobalAlbums,
} from '@/data/fixtures';
import { deduplicateArtists } from '@/utils/artistDeduplication';
import {
  dedupeAndClassifyGlobal,
  dedupeAndClassifyIndian,
} from '@/utils/marketFilter';

export interface IMusicService {
  getHeroFeaturedTrack(): Promise<{ artist: Artist; song: Song } | null>;
  getFeaturedIndianArtists(): Promise<Artist[]>;
  getTrendingIndianTracks(): Promise<Song[]>;
  getFeaturedGlobalArtists(): Promise<Artist[]>;
  getTrendingGlobalTracks(): Promise<Song[]>;
  getNewReleases(): Promise<Album[]>;
  getArtistById(id: string): Promise<Artist | null>;
  search(query: string): Promise<{ artists: Artist[]; songs: Song[]; albums: Album[] }>;
}

const DISCOVERY_RELEASE_QUERIES = [
  'Seedhe Maut',
  'Krsna rap',
  'DIVINE rap',
  'Rawal rap',
  'Talha Anjum',
  'Raftaar rap',
  'Encore ABJ',
  'Calm rap',
];

class ProductionMusicService implements IMusicService {
  async getHeroFeaturedTrack(): Promise<{ artist: Artist; song: Song } | null> {
    if (typeof window === 'undefined') {
      try {
        const { INDIAN_ARTISTS, INDIAN_TRACKS } = await import('@/data/fixtures/indianRap');
        const divineArtist = INDIAN_ARTISTS.find((a) => a.id === 'divine') || INDIAN_ARTISTS[0];
        const divineTrack = INDIAN_TRACKS.find((t) => t.title.toLowerCase().includes('3:59')) || INDIAN_TRACKS[0];
        if (divineArtist && divineTrack) {
          return { artist: divineArtist, song: divineTrack };
        }
      } catch {
        // Fall through
      }
    }
    return null;
  }

  async getFeaturedIndianArtists(): Promise<Artist[]> {
    let rawArtists: Artist[] = [];
    if (typeof window === 'undefined') {
      try {
        const { insforgeRepo } = await import('@/server/insforge/repository');
        rawArtists = await insforgeRepo.getArtists('india');
      } catch {
        // Fall through
      }

      if (rawArtists.length === 0) {
        const { serverConfig } = await import('@/server/config');
        if (serverConfig.useDevFixtures) {
          rawArtists = getDevIndianArtists();
        }
      }
    } else {
      try {
        const res = await fetch('/api/artists?region=india');
        if (res.ok) {
          rawArtists = await res.json();
        }
      } catch {
        // Fall through
      }
    }

    // Re-classify by market so that artists whose stored region is
    // ambiguous (or mistakenly set to "india") are correctly gated.
    // Unknown-market artists are excluded from the curated Indian section.
    return dedupeAndClassifyIndian(deduplicateArtists(rawArtists));
  }

  async getTrendingIndianTracks(): Promise<Song[]> {
    if (typeof window === 'undefined') {
      try {
        const { pythonClient } = await import('@/server/music/pythonClient');
        const chart = await pythonClient.getCharts('india');
        if (chart && chart.tracks.length > 0) {
          return chart.tracks;
        }
      } catch {
        // Fall through
      }

      try {
        const { insforgeRepo } = await import('@/server/insforge/repository');
        const dbSongs = await insforgeRepo.getSongs();
        if (dbSongs.length > 0) {
          return dbSongs.slice(0, 10);
        }
      } catch {
        // Fall through
      }

      const { serverConfig } = await import('@/server/config');
      if (serverConfig.useDevFixtures) {
        return getDevIndianTracks();
      }
    } else {
      try {
        const res = await fetch('/api/charts?region=india');
        if (res.ok) {
          const data = await res.json();
          return data.tracks || [];
        }
      } catch {
        // Fall through
      }
    }
    return [];
  }

  async getFeaturedGlobalArtists(): Promise<Artist[]> {
    let rawArtists: Artist[] = [];
    if (typeof window === 'undefined') {
      try {
        const { insforgeRepo } = await import('@/server/insforge/repository');
        rawArtists = await insforgeRepo.getArtists('global');
      } catch {
        // Fall through
      }

      if (rawArtists.length === 0) {
        const { serverConfig } = await import('@/server/config');
        if (serverConfig.useDevFixtures) {
          rawArtists = getDevGlobalArtists();
        }
      }
    } else {
      try {
        const res = await fetch('/api/artists?region=global');
        if (res.ok) {
          rawArtists = await res.json();
        }
      } catch {
        // Fall through
      }
    }

    // The Global section is conservative: include explicit GLOBAL artists
    // and artists with UNKNOWN market (since we cannot prove they are
    // Indian). Re-classify using the market utility to avoid drift.
    return dedupeAndClassifyGlobal(deduplicateArtists(rawArtists));
  }

  async getTrendingGlobalTracks(): Promise<Song[]> {
    if (typeof window === 'undefined') {
      try {
        const { pythonClient } = await import('@/server/music/pythonClient');
        const chart = await pythonClient.getCharts('global');
        if (chart && chart.tracks.length > 0) {
          return chart.tracks;
        }
      } catch {
        // Fall through
      }

      const { serverConfig } = await import('@/server/config');
      if (serverConfig.useDevFixtures) {
        return getDevGlobalTracks();
      }
    } else {
      try {
        const res = await fetch('/api/charts?region=global');
        if (res.ok) {
          const data = await res.json();
          return data.tracks || [];
        }
      } catch {
        // Fall through
      }
    }
    return [];
  }

  async getNewReleases(): Promise<Album[]> {
    if (typeof window === 'undefined') {
      try {
        const { cacheService, CACHE_TTLS } = await import('@/server/cache/cacheService');
        const cacheKey = 'albums:new-releases:v3';
        const cached = await cacheService.get<Album[]>(cacheKey);
        if (cached && cached.length > 0) {
          return cached;
        }

        const { pythonClient } = await import('@/server/music/pythonClient');
        const searchPromises = DISCOVERY_RELEASE_QUERIES.map((q) =>
          pythonClient.search(q).then((res) => res.albums || []).catch(() => [] as Album[])
        );
        const results = await Promise.all(searchPromises);
        const allAlbums: Album[] = [];
        for (const list of results) {
          allAlbums.push(...list);
        }

        const seenIds = new Set<string>();
        const seenTitles = new Set<string>();
        const cleanAlbums: Album[] = [];

        for (const al of allAlbums) {
          if (!al || !al.title || !al.id) continue;
          if (seenIds.has(al.id)) continue;
          const titleKey = al.title.toLowerCase().trim();
          if (seenTitles.has(titleKey)) continue;

          if (al.artist === 'Various Artists') continue;
          if (/bollywood|non stop|dj jitesh|remix|funny|soundtrack/i.test(al.title)) continue;

          seenIds.add(al.id);
          seenTitles.add(titleKey);
          cleanAlbums.push(al);
        }

        cleanAlbums.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));

        if (cleanAlbums.length > 0) {
          await cacheService.set(cacheKey, cleanAlbums, CACHE_TTLS.ALBUM, 'live_discovery');
          return cleanAlbums;
        }

        // Database fallback
        const { insforgeRepo } = await import('@/server/insforge/repository');
        const dbAlbums = await insforgeRepo.getAlbums();
        const filteredDb = dbAlbums.filter(
          (a) => a.artist !== 'Various Artists' && !/bollywood/i.test(a.title)
        );
        if (filteredDb.length > 0) {
          filteredDb.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
          return filteredDb;
        }
      } catch {
        // Fall through
      }

      const { serverConfig } = await import('@/server/config');
      if (serverConfig.useDevFixtures) {
        return [...getDevIndianAlbums(), ...getDevGlobalAlbums()].sort((a, b) => b.releaseYear - a.releaseYear);
      }
    } else {
      try {
        const res = await fetch('/api/albums');
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fall through
      }
    }
    return [];
  }

  async getArtistById(id: string): Promise<Artist | null> {
    if (typeof window === 'undefined') {
      try {
        const { pythonClient } = await import('@/server/music/pythonClient');
        const artist = await pythonClient.getArtist(id);
        if (artist) return artist;
      } catch {
        // Fall through
      }
    } else {
      try {
        const res = await fetch(`/api/artists/${id}`);
        if (res.ok) {
          return (await res.json()) as Artist;
        }
      } catch {
        // Fall through
      }
    }
    return null;
  }

  async search(query: string): Promise<{ artists: Artist[]; songs: Song[]; albums: Album[] }> {
    const q = query.trim();
    if (!q) {
      return { artists: [], songs: [], albums: [] };
    }

    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.artists)) {
            data.artists = deduplicateArtists(data.artists);
          }
          return data;
        }
      } catch {
        // Return empty on network error
      }
    } else {
      try {
        const { pythonClient } = await import('@/server/music/pythonClient');
        const res = await pythonClient.search(q);
        if (res && Array.isArray(res.artists)) {
          res.artists = deduplicateArtists(res.artists);
        }
        return res;
      } catch {
        // Return empty
      }
    }

    return { artists: [], songs: [], albums: [] };
  }
}

export const musicService = new ProductionMusicService();
