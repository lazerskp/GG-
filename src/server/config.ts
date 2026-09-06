import 'server-only';

/**
 * Server Configuration & Environment Variables
 * Server-side ONLY. Never import into client components.
 */

export const serverConfig = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // InsForge database / REST API
  insforgeUrl: process.env.INSFORGE_URL || '',
  insforgeApiKey: process.env.INSFORGE_API_KEY || '',
  
  // Internal Python Music Metadata Service
  musicServiceUrl: process.env.MUSIC_SERVICE_URL || 'https://gg-music-service-a51fd016-26f8-4189-8c54-717380b039f1.fly.dev',
  musicServiceApiKey: process.env.MUSIC_SERVICE_API_KEY || 'gg_internal_secret_key_2026',
  
  // Cache & Rate Limiting flags
  cacheEnabled: process.env.CACHE_ENABLED !== 'false',
  rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== 'false',
  
  // Development Fixtures Toggle (strict false in production)
  useDevFixtures: process.env.USE_DEV_FIXTURES === 'true',
  
  // Timeouts
  requestTimeoutMs: 12000,
};
