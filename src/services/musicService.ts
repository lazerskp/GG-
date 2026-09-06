import { Artist, Song, Album } from '@/types/music';
import {
  getDevIndianArtists,
  getDevIndianTracks,
  getDevIndianAlbums,
  getDevGlobalArtists,
  getDevGlobalTracks,
  getDevGlobalAlbums,
} from '@/data/fixtures';

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

class ProductionMusicService implements IMusicService {
  async getHeroFeaturedTrack(): Promise<{ artist: Artist; song: Song } | null> {
    if (typeof window === 'undefined') {
      try {
        const { insforgeRepo } = await import('@/server/insforge/repository');
        const artists = await insforgeRepo.getArtists('india');
        if (artists.length > 0) {
          const heroArtist = artists[0];
          const songs = await insforgeRepo.getSongs({ artist_id: heroArtist.id });
          const heroSong = songs.length > 0 ? songs[0] : {
            id: `song-${heroArtist.id}`,
            title: `${heroArtist.name} Anthem`,
            artist: heroArtist.name,
            artistId: heroArtist.id,
            artworkUrl: heroArtist.imageUrl,
            duration: 210,
            releaseYear: 2024,
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
        const artists = await insforgeRepo.getArtists('india');
        if (artists.length > 0) return artists;
      } catch {
        // Fall through
      }

      const { serverConfig } = await import('@/server/config');
      if (serverConfig.useDevFixtures) {
        return getDevIndianArtists();
      }
    } else {
      try {
        const res = await fetch('/api/artists?region=india');
        if (res.ok) return await res.json();
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
        const artists = await insforgeRepo.getArtists('global');
        if (artists.length > 0) return artists;
      } catch {
        // Fall through
      }

      const { serverConfig } = await import('@/server/config');
      if (serverConfig.useDevFixtures) {
        return getDevGlobalArtists();
      }
    } else {
      try {
        const res = await fetch('/api/artists?region=global');
        if (res.ok) return await res.json();
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
        const { insforgeRepo } = await import('@/server/insforge/repository');
        const albums = await insforgeRepo.getAlbums();
        if (albums.length > 0) {
          return albums.sort((a, b) => b.releaseYear - a.releaseYear);
        }
      } catch {
        // Fall through
      }

      const { serverConfig } = await import('@/server/config');
      if (serverConfig.useDevFixtures) {
        return [...getDevIndianAlbums(), ...getDevGlobalAlbums()].sort((a, b) => b.releaseYear - a.releaseYear);
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
          return await res.json();
        }
      } catch {
        // Return empty on network error
      }
    } else {
      try {
        const { pythonClient } = await import('@/server/music/pythonClient');
        return await pythonClient.search(q);
      } catch {
        // Return empty
      }
    }

    return { artists: [], songs: [], albums: [] };
  }
}

export const musicService = new ProductionMusicService();
