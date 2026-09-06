import { Artist, Song, Album } from '@/types/music';

export const mockIndianArtists: Artist[] = [
  {
    id: 'divine',
    name: 'DIVINE',
    moniker: 'Voice of the Streets',
    bio: 'Pioneering Mumbai street rap icon.',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
    region: 'india',
    monthlyListeners: '4.2M',
    genres: ['Desi Hip-Hop', 'Gully Rap'],
    verified: true,
  },
];

export const mockIndianSongs: Song[] = [
  {
    id: 'mirchi',
    title: 'Mirchi',
    artist: 'DIVINE',
    artistId: 'divine',
    artworkUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
    duration: 198,
    releaseYear: 2020,
    region: 'india',
    genre: 'Gully Rap',
  },
];

export const mockIndianAlbums: Album[] = [
  {
    id: 'punyapaap',
    title: 'Punya Paap',
    artist: 'DIVINE',
    artistId: 'divine',
    artworkUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
    releaseYear: 2020,
    trackCount: 11,
    type: 'album',
    region: 'india',
  },
];
