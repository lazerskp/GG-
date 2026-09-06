import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getLyrics } from '@/server/lyrics/lyricsService';
import { rateLimiter } from '@/server/rateLimiter';
import { serverLogger } from '@/server/logger';

/**
 * GET /api/lyrics
 *
 * Lyrics BFF endpoint. Accepts enough live track metadata to accurately match
 * a recording against LRCLIB. All lyric resolution happens server-side; no
 * secrets are involved (LRCLIB is a public, key-less API) and the client never
 * contacts LRCLIB directly.
 */
const LyricsQuerySchema = z
  .object({
    videoId: z.string().min(3).max(100).optional(),
    title: z.string().max(200).optional(),
    artist: z.string().max(200).optional(),
    album: z.string().max(200).optional(),
    duration: z.coerce.number().min(0).max(3600).optional(),
  })
  .refine(
    (data) => Boolean((data.videoId && data.videoId.trim().length >= 3) || (data.title?.trim() && data.artist?.trim())),
    { message: 'Either videoId or both title and artist are required' }
  );

export async function GET(request: NextRequest) {
  // 1. Rate limiting (lyrics resolution hits internal/external provider on miss)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const rateCheck = await rateLimiter.check(`lyrics:${ip}`, 60, 60000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Too many lyrics requests. Please slow down.' },
      { status: 429, headers: { 'Retry-After': `${Math.ceil(rateCheck.resetMs / 1000)}` } }
    );
  }

  // 2. Validate query metadata
  const { searchParams } = new URL(request.url);
  const parsed = LyricsQuerySchema.safeParse({
    videoId: searchParams.get('videoId') || undefined,
    title: searchParams.get('title') || undefined,
    artist: searchParams.get('artist') || undefined,
    album: searchParams.get('album') || undefined,
    duration: searchParams.get('duration') || undefined,
  });

  const title = (searchParams.get('title') || '').trim();
  const artist = (searchParams.get('artist') || '').trim();
  const videoId = (searchParams.get('videoId') || '').trim();

  if (!parsed.success) {
    return NextResponse.json(
      { status: 'unavailable', provider: 'none', trackName: title, artistName: artist },
      { status: 200 }
    );
  }

  try {
    // 3. Resolve via cache → YTMusic → LRCLIB (never fabricates; unavailable is an honest result)
    const lyrics = await getLyrics({
      videoId: parsed.data.videoId || (videoId || undefined),
      title: parsed.data.title || title,
      artist: parsed.data.artist || artist,
      album: parsed.data.album,
      duration: parsed.data.duration,
    });

    return NextResponse.json(lyrics, {
      headers: {
        // Immutable per recording — cache at the edge too
        'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    serverLogger.warn('API /api/lyrics failed', { error: String(error) });
    return NextResponse.json(
      { status: 'unavailable', provider: 'none', trackName: title, artistName: artist },
      { status: 200 }
    );
  }
}
