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
        const { insforgeRepo } = await import('@/server/insforge/repository');
        let rawArtists = await insforgeRepo.getArtists('india');
        if (!rawArtists || rawArtists.length === 0) {
          rawArtists = await insforgeRepo.getArtists();
        }
        const artists = deduplicateArtists(rawArtists);
        if (artists.length > 0) {
          // Find prominent artist (prefer KR$NA, DIVINE, Seedhe Maut, Hanumankind)
          const preferredSlugs = ['kr-na', 'krsna', 'divine', 'seedhe-maut', 'hanumankind'];
          const heroArtist =
            artists.find(
              (a) =>
                preferredSlugs.includes(a.id.toLowerCase()) ||
                preferredSlugs.some((slug) => a.name.toLowerCase().includes(slug))
            ) || artists[0];

          let songs = await insforgeRepo.getSongs({ artist_id: heroArtist.id });
          if (!songs || songs.length === 0) {
            songs = await insforgeRepo.getSongs();
          }

          const heroSong =
            songs && songs.length > 0
              ? songs[0]
              : {
                  id: 'fSwe7XoAi2g',
                  title: 'Makasam',
                  artist: heroArtist.name,
                  artistId: heroArtist.id,
                  artworkUrl: heroArtist.imageUrl || 'https://i.ytimg.com/vi/fSwe7XoAi2g/maxresdefault.jpg',
                  duration: 236,
                  releaseYear: 2020,
                  region: 'india' as const,
                  genre: heroArtist.genres[0] || 'Desi Hip-Hop',
                };
          return { artist: heroArtist, song: heroSong };
        }
      } catch {
        // Fall through
      }

      // Check development fixture toggle
      const { serverConfig } = await import('@/server/config');
      if (serverConfig.useDevFixtures) {
        const devArtists = getDevIndianArtists();
        const devTracks = getDevIndianTracks();
        if (devArtists.length > 0 && devTracks.length > 0) {
          return { artist: devArtists[0], song: devTracks[0] };
        }
      }
    }
    return null;
  }

  async getFeaturedIndianArtists(): Promise<Artist[]> {
    if (typeof window === 'undefined') {
      try {
        const { insforgeRepo } = await import('@/server/insforge/repository');
        const rawArtists = await insforgeRepo.getArtists('india');
        const artists = deduplicateArtists(rawArtists);
        if (artists.length > 0) return artists;
      } catch {
        // Fall through
      }

      const { serverConfig } = await import('@/server/config');
      if (serverConfig.useDevFixtures) {
        return deduplicateArtists(getDevIndianArtists());
      }
    } else {
      try {
        const res = await fetch('/api/artists?region=india');
        if (res.ok) {
          const raw = await res.json();
          return deduplicateArtists(raw);
        }
      } catch {
        // Fall through
      }
    }
    return [];
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
    if (typeof window === 'undefined') {
      try {
        const { insforgeRepo } = await import('@/server/insforge/repository');
        const rawArtists = await insforgeRepo.getArtists('global');
        const artists = deduplicateArtists(rawArtists);
        if (artists.length > 0) return artists;
      } catch {
        // Fall through
      }

      const { serverConfig } = await import('@/server/config');
      if (serverConfig.useDevFixtures) {
        return deduplicateArtists(getDevGlobalArtists());
      }
    } else {
      try {
        const res = await fetch('/api/artists?region=global');
        if (res.ok) {
          const raw = await res.json();
          return deduplicateArtists(raw);
        }
      } catch {
        // Fall through
      }
    }
    return [];
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

