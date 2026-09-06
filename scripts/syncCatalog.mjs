import fs from 'fs';
import path from 'path';
import { createAdminClient } from '@insforge/sdk';

// Load environment variables from .env.local
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
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
const pythonServiceUrl = (process.env.MUSIC_SERVICE_URL || 'http://localhost:8001').replace(/\/$/, '');
const pythonServiceApiKey = process.env.MUSIC_SERVICE_API_KEY || '';

if (!baseUrl || !apiKey) {
  console.error('Error: Missing INSFORGE_URL or INSFORGE_API_KEY.');
  process.exit(1);
}

const dbClient = createAdminClient({ baseUrl, apiKey });

const CURATED_DISCOVERY_TARGETS = [
  { name: 'DIVINE', query: 'DIVINE gully rap', region: 'india' },
  { name: 'Seedhe Maut', query: 'Seedhe Maut TBSM', region: 'india' },
  { name: 'KR$NA', query: 'KR$NA kalamkaar', region: 'india' },
  { name: 'Hanumankind', query: 'Hanumankind Big Dawgs', region: 'india' },
  { name: 'Kendrick Lamar', query: 'Kendrick Lamar pgLang', region: 'global' },
  { name: 'Travis Scott', query: 'Travis Scott Cactus Jack', region: 'global' },
];

async function syncArtist(target) {
  console.log(`[Sync] Discovering live metadata for: ${target.name}...`);
  try {
    const headers = { 'Accept': 'application/json' };
    if (pythonServiceApiKey) {
      headers['X-API-Key'] = pythonServiceApiKey;
    }

    const res = await fetch(`${pythonServiceUrl}/api/v1/metadata/search?q=${encodeURIComponent(target.query)}`, {
      headers,
    });

    if (!res.ok) {
      console.warn(`[Sync] Python service returned HTTP ${res.status} for ${target.name}`);
      return;
    }

    const searchData = await res.json();
    const artist = searchData.artists?.[0];
    const topSongs = searchData.songs?.slice(0, 5) || [];

    if (!artist) {
      console.warn(`[Sync] No artist profile found in search results for ${target.name}`);
      return;
    }

    // Upsert artist into InsForge
    const artistId = target.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const artistRecord = {
      id: artistId,
      provider: 'ytmusic',
      provider_id: artist.id,
      name: artist.name,
      slug: artistId,
      description: artist.description || `${target.name} - Premier ${target.region === 'india' ? 'Desi' : 'Global'} Rap Artist`,
      image_url: artist.image,
      region: target.region,
      genres: artist.genres?.length ? artist.genres : ['Hip-Hop', 'Rap'],
      monthly_listeners: artist.monthly_listeners || '1M+ listeners',
      verified: true,
      metadata: { liveSynced: true, providerBrowseId: artist.id },
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const artistUpsertRes = await dbClient.database.from('artists').upsert([artistRecord]);
    if (artistUpsertRes.error) {
      console.warn(`[Sync] Artist upsert warning: ${artistUpsertRes.error.message}`);
    } else {
      console.log(`[Sync] ✓ Synced artist profile: ${target.name}`);
    }

    // Upsert songs for this artist
    for (let i = 0; i < topSongs.length; i++) {
      const song = topSongs[i];
      const songId = `yt-${song.id}`;
      const songSlug = song.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
      const songRecord = {
        id: songId,
        provider: 'ytmusic',
        provider_id: song.id,
        title: song.title,
        slug: songSlug,
        artist_id: artistId,
        artwork_url: song.artwork,
        duration_seconds: song.durationSeconds || song.duration || 180,
        genre: 'Rap',
        trending_rank: i + 1,
        metadata: {
          artist_name: target.name,
          album_name: song.album || '',
          plays: song.plays || '1M+',
        },
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await dbClient.database.from('songs').upsert([songRecord]);
    }
    console.log(`[Sync] ✓ Synced ${topSongs.length} tracks for: ${target.name}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Sync] Failed syncing ${target.name}: ${msg}`);
  }
}

async function run() {
  console.log('Starting GULLYGANG live catalog synchronization...');
  for (const target of CURATED_DISCOVERY_TARGETS) {
    await syncArtist(target);
  }
  console.log('Catalog synchronization completed.');
}

run();
