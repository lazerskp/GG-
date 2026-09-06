import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getArtistDetailData } from '@/server/music/artistService';

const paramsSchema = z.object({
  id: z.string().min(1).max(64),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await context.params;
  const parseResult = paramsSchema.safeParse(resolvedParams);

  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid artist ID' }, { status: 400 });
  }

  const artistId = parseResult.data.id;
  const details = await getArtistDetailData(artistId);

  if (!details) {
    return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
  }

  return NextResponse.json(details, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
    },
  });
}
