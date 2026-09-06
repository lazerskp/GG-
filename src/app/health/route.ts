import { NextResponse } from 'next/server';
import { serverConfig } from '@/server/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const timestamp = new Date().toISOString();
  let musicServiceStatus = 'unavailable';
  let musicServiceDetails: Record<string, unknown> | null = null;
  let dbStatus = 'unavailable';
  let dbSongCount = 0;

  // 1. Check Python Music Service
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const msRes = await fetch(`${serverConfig.musicServiceUrl}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (msRes.ok) {
      musicServiceStatus = 'healthy';
      musicServiceDetails = await msRes.json().catch(() => null);
    } else {
      musicServiceStatus = `http_${msRes.status}`;
    }
  } catch (err: unknown) {
    musicServiceStatus = err instanceof Error ? err.message : 'timeout_or_network_error';
  }

  // 2. Check InsForge Database
  try {
    const { insforgeRepo } = await import('@/server/insforge/repository');
    const songs = await insforgeRepo.getSongs();
    dbStatus = 'healthy';
    dbSongCount = songs.length;
  } catch (err: unknown) {
    dbStatus = err instanceof Error ? err.message : 'database_error';
  }

  const isHealthy = musicServiceStatus === 'healthy' && dbStatus === 'healthy';

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp,
      app: {
        name: 'GULLYGANG',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'production',
      },
      services: {
        pythonMusicService: {
          status: musicServiceStatus,
          endpoint: serverConfig.musicServiceUrl,
          details: musicServiceDetails,
        },
        insforgeDatabase: {
          status: dbStatus,
          songCount: dbSongCount,
        },
      },
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
