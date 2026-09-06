/**
 * Layered Caching Service
 * Tier 1: Fast in-memory storage (process lifetime)
 * Tier 2: InsForge database persistent cache
 */

import { insforgeRepo } from '@/server/insforge/repository';
import { serverConfig } from '@/server/config';
import { serverLogger } from '@/server/logger';

interface MemoryCacheEntry<T> {
  data: T;
  expiresAt: number;
}

export const CACHE_TTLS = {
  SEARCH: 15 * 60,               // 15 minutes
  ARTIST: 24 * 60 * 60,          // 24 hours
  ALBUM: 24 * 60 * 60,           // 24 hours
  SONG: 24 * 60 * 60,            // 24 hours
  CHARTS: 6 * 60 * 60,           // 6 hours
  DAILY_FEATURE: 24 * 60 * 60,   // 24 hours
} as const;

class CacheService {
  private memoryCache = new Map<string, MemoryCacheEntry<unknown>>();

  /**
   * Fetch from cache (checks Tier 1 memory, then Tier 2 InsForge)
   */
  public async get<T>(key: string): Promise<T | null> {
    if (!serverConfig.cacheEnabled) {
      return null;
    }

    const now = Date.now();

    // Tier 1: Check In-Memory Cache
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry) {
      if (now < memoryEntry.expiresAt) {
        return memoryEntry.data as T;
      }
      this.memoryCache.delete(key);
    }

    // Tier 2: Check InsForge Database Cache
    try {
      const dbCached = await insforgeRepo.getProviderCache<T>(key);
      if (dbCached) {
        // Hydrate memory cache for fast subsequent hits
        this.memoryCache.set(key, {
          data: dbCached,
          expiresAt: now + 60000, // keep in local memory for at least 1 min
        });
        return dbCached;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      serverLogger.warn(`Cache Tier 2 lookup error: ${msg}`, { key });
    }

    return null;
  }

  /**
   * Store into both Tier 1 memory and Tier 2 InsForge database cache
   */
  public async set<T>(key: string, data: T, ttlSeconds: number, provider = 'default'): Promise<void> {
    if (!serverConfig.cacheEnabled) {
      return;
    }

    const expiresAt = Date.now() + ttlSeconds * 1000;

    // Save to Tier 1
    this.memoryCache.set(key, { data, expiresAt });

    // Save to Tier 2
    try {
      await insforgeRepo.setProviderCache(key, provider, data, ttlSeconds);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      serverLogger.warn(`Failed to persist cache to InsForge: ${msg}`, { key });
    }
  }

  /**
   * Specific search cache wrapper
   */
  public async getSearch<T>(query: string): Promise<T | null> {
    const hash = this.hashQuery(query);
    const key = `search:${hash}`;
    return this.get<T>(key);
  }

  public async setSearch<T>(query: string, data: T): Promise<void> {
    const hash = this.hashQuery(query);
    const key = `search:${hash}`;
    await this.set<T>(key, data, CACHE_TTLS.SEARCH, 'search_engine');
  }

  private hashQuery(q: string): string {
    return q.trim().toLowerCase().replace(/\s+/g, '_');
  }
}

export const cacheService = new CacheService();
