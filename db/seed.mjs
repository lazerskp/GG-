import fs from 'fs';
import path from 'path';
import { createAdminClient } from '@insforge/sdk';

// Read .env.local if present
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch {
  // Ignore
}

const baseUrl = process.env.INSFORGE_URL || process.env.NEXT_PUBLIC_INSFORGE_URL;
const apiKey = process.env.INSFORGE_API_KEY;

if (!baseUrl || !apiKey) {
  console.error('Error: INSFORGE_URL and INSFORGE_API_KEY environment variables must be set.');
  process.exit(1);
}

const client = createAdminClient({
  baseUrl,
  apiKey,
});

const artists = [
  {
    id: 'divine',
    name: 'DIVINE',
    slug: 'divine',
    description: 'Pioneered the Mumbai gully rap revolution. From JB Nagar to international acclaim.',
    image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
    region: 'india',
    genres: ['Desi Hip-Hop', 'Gully Rap'],
    monthly_listeners: '5.4M',
    verified: true,
  },
  {
    id: 'seedhe-maut',
    name: 'Seedhe Maut',
    slug: 'seedhe-maut',
    description: 'The New Delhi duo of Encore ABJ and Calm. Known for lightning-fast flows and intricate internal rhyming.',
    image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
    region: 'india',
    genres: ['Delhi Hip-Hop', 'Drill'],
    monthly_listeners: '3.9M',
    verified: true,
  },
  {
    id: 'krsna',
    name: 'KR$NA',
    slug: 'krsna',
    description: 'Celebrated for complex schemes, double entendres, relentless punchlines, and supreme technical delivery.',
    image_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop',
    region: 'india',
    genres: ['Desi Hip-Hop', 'Lyrical'],
    monthly_listeners: '4.2M',
    verified: true,
  },
  {
    id: 'hanumankind',
    name: 'Hanumankind',
    slug: 'hanumankind',
    description: 'Blew past borders with relentless southern energy and international viral dominance with Big Dawgs.',
    image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    region: 'india',
    genres: ['Southern Rap', 'Hardcore Hip-Hop'],
    monthly_listeners: '14.8M',
    verified: true,
  },
  {
    id: 'kendrick-lamar',
    name: 'Kendrick Lamar',
    slug: 'kendrick-lamar',
    description: 'Pulitzer Prize-winning Compton titan renowned for intricate conceptual albums.',
    image_url: 'https://images.unsplash.com/photo-1549834185-bd9f078a5dfe?q=80&w=1200&auto=format&fit=crop',
    region: 'global',
    genres: ['West Coast', 'Conscious'],
    monthly_listeners: '68.4M',
    verified: true,
  },
  {
    id: 'travis-scott',
    name: 'Travis Scott',
    slug: 'travis-scott',
    description: 'Houston sonic architect known for psychedelic trap production and stadium anthems.',
    image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    region: 'global',
    genres: ['Psychedelic Trap', 'Southern'],
    monthly_listeners: '64.2M',
    verified: true,
  },
];

const songs = [
  {
    id: 'ind-01',
    title: '3:59 AM',
    slug: '3-59-am',
    artist_id: 'divine',
    artwork_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
    duration_seconds: 258,
    genre: 'Gully Rap',
    trending_rank: 1,
  },
  {
    id: 'ind-02',
    title: 'Nanchaku',
    slug: 'nanchaku',
    artist_id: 'seedhe-maut',
    artwork_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
    duration_seconds: 214,
    genre: 'Delhi Hip-Hop',
    trending_rank: 2,
  },
  {
    id: 'ind-03',
    title: 'Big Dawgs',
    slug: 'big-dawgs',
    artist_id: 'hanumankind',
    artwork_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
    duration_seconds: 232,
    genre: 'Southern Rap',
    trending_rank: 3,
  },
  {
    id: 'ind-04',
    title: 'Prarthana',
    slug: 'prarthana',
    artist_id: 'krsna',
    artwork_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop',
    duration_seconds: 188,
    genre: 'Desi Hip-Hop',
    trending_rank: 4,
  },
  {
    id: 'glb-01',
    title: 'Not Like Us',
    slug: 'not-like-us',
    artist_id: 'kendrick-lamar',
    artwork_url: 'https://images.unsplash.com/photo-1549834185-bd9f078a5dfe?q=80&w=800&auto=format&fit=crop',
    duration_seconds: 274,
    genre: 'West Coast',
    trending_rank: 1,
  },
  {
    id: 'glb-02',
    title: 'FE!N',
    slug: 'fein',
    artist_id: 'travis-scott',
    artwork_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
    duration_seconds: 191,
    genre: 'Trap',
    trending_rank: 2,
  },
];

console.log('Seeding artists...');
const resArtists = await client.database.from('artists').upsert(artists);
console.log('Artists response:', resArtists.status, resArtists.error ? resArtists.error.message : 'OK');

console.log('Seeding songs...');
const resSongs = await client.database.from('songs').upsert(songs);
console.log('Songs response:', resSongs.status, resSongs.error ? resSongs.error.message : 'OK');
