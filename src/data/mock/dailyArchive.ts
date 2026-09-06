import { DailyFeatureData } from '@/types/music';

export const mockDailyArchive: DailyFeatureData[] = [
  {
    date: '2026-09-05',
    artist: {
      id: 'divine',
      name: 'DIVINE',
      image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
      description: 'Gully Gang pioneer representing the streets of Mumbai.',
      region: 'india',
      monthlyListeners: '4.2M',
      quote: 'Apna time aayega nahi, apna time aagaya.',
    },
    song: {
      id: 'mirchi',
      title: 'Mirchi',
      artist: 'DIVINE',
      artistId: 'divine',
      artwork: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
      duration: 198,
      genre: 'Desi Hip-Hop',
    },
  },
];
