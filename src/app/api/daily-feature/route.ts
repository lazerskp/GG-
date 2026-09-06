import { NextResponse } from 'next/server';
import { dailyFeatureEngine } from '@/server/dailyFeature/dailyFeatureEngine';
import { serverLogger } from '@/server/logger';

export async function GET() {
  const startTime = Date.now();

  try {
    const feature = await dailyFeatureEngine.getFeatureForDate();

    serverLogger.info('Daily feature served', {
      endpoint: '/api/daily-feature',
      date: feature.date,
      artist: feature.artist.name,
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(feature, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    serverLogger.error(`Daily feature generation error: ${message}`, {
      endpoint: '/api/daily-feature',
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: 'Unable to load daily feature at this moment.' },
      { status: 500 }
    );
  }
}
