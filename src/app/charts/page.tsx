import React from 'react';
import type { Metadata } from 'next';
import { ChartsView } from '@/components/charts/ChartsView';

export const metadata: Metadata = {
  title: 'Charts',
  description:
    'Live trending hip-hop charts for India and Global — discover the hottest tracks in Indian rap, Desi Hip-Hop, and international hip-hop.',
  openGraph: {
    title: 'Charts — GULLYGANG',
    description: 'Live trending hip-hop charts for India and Global.',
    type: 'website',
    url: '/charts',
  },
  twitter: {
    card: 'summary',
    title: 'Charts — GULLYGANG',
    description: 'Live trending hip-hop charts for India and Global.',
  },
  alternates: {
    canonical: '/charts',
  },
};

export default function ChartsPage() {
  return <ChartsView />;
}
