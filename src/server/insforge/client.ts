import 'server-only';

/**
 * InsForge Official SDK Client Integration
 * Uses @insforge/sdk for database queries, RLS, and storage.
 * Strictly SERVER-ONLY. Never expose or bundle into client components.
 */

import { createAdminClient } from '@insforge/sdk';
import { serverConfig } from '@/server/config';
import { serverLogger } from '@/server/logger';

export class InsForgeClient {
  private inMemoryStorage = new Map<string, Map<string, Record<string, unknown>>>();
  private sdkClient: ReturnType<typeof createAdminClient> | null = null;

  constructor() {
    if (serverConfig.insforgeUrl && serverConfig.insforgeApiKey) {
      try {
        this.sdkClient = createAdminClient({
          baseUrl: serverConfig.insforgeUrl,
          apiKey: serverConfig.insforgeApiKey,
        });
        serverLogger.info('[InsForge] Official SDK Admin Client initialized', {
          baseUrl: serverConfig.insforgeUrl,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        serverLogger.warn(`[InsForge] SDK initialization failed, using in-memory store: ${msg}`);
      }
    }
  }

  private getTableStorage(table: string): Map<string, Record<string, unknown>> {
    if (!this.inMemoryStorage.has(table)) {
      this.inMemoryStorage.set(table, new Map<string, Record<string, unknown>>());
    }
    return this.inMemoryStorage.get(table)!;
  }

  /**
   * Execute select query via @insforge/sdk or fallback
   */
  public async select<T extends Record<string, unknown> = Record<string, unknown>>(
    table: string,
    filters: Record<string, unknown> = {}
  ): Promise<T[]> {
    if (this.sdkClient) {
      try {
        let query = this.sdkClient.database.from(table).select();
        for (const [key, val] of Object.entries(filters)) {
          if (val !== undefined && val !== null) {
            query = query.eq(key, val);
          }
        }
        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          return data as T[];
        }
        if (error) {
          serverLogger.warn(`[InsForge] SDK SELECT error: ${error.message}`, { table, filters });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        serverLogger.warn(`[InsForge] SDK SELECT query exception: ${msg}`, { table });
      }
    }

    // In-memory fallback
    const store = this.getTableStorage(table);
    const rows = Array.from(store.values());

    return rows.filter((row) => {
      for (const [key, val] of Object.entries(filters)) {
        if (row[key] !== val) return false;
      }
      return true;
    }) as unknown as T[];
  }

  /**
   * Insert record via @insforge/sdk (accepts array pattern) or fallback
   */
  public async insert<T extends Record<string, unknown> = Record<string, unknown>>(
    table: string,
    record: Record<string, unknown>
  ): Promise<T> {
    const store = this.getTableStorage(table);
    const key = record.id || record.cache_key || record.feature_date || `${Date.now()}`;
    store.set(String(key), { ...record });

    if (this.sdkClient) {
      try {
        const { data, error } = await this.sdkClient.database.from(table).insert([record]);
        if (!error && data) {
          return (Array.isArray(data) ? data[0] : data) as T;
        }
        if (error) {
          serverLogger.warn(`[InsForge] SDK INSERT error: ${error.message}`, { table });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        serverLogger.warn(`[InsForge] SDK INSERT exception: ${msg}`, { table });
      }
    }

    return record as unknown as T;
  }

  /**
   * Upsert record via @insforge/sdk or fallback
   */
  public async upsert<T extends Record<string, unknown> = Record<string, unknown>>(
    table: string,
    record: Record<string, unknown>
  ): Promise<T> {
    const store = this.getTableStorage(table);
    const key = record.id || record.cache_key || record.feature_date || `${Date.now()}`;
    store.set(String(key), { ...record });

    if (this.sdkClient) {
      try {
        const { data, error } = await this.sdkClient.database.from(table).upsert([record]);
        if (!error && data) {
          return (Array.isArray(data) ? data[0] : data) as T;
        }
        if (error) {
          serverLogger.warn(`[InsForge] SDK UPSERT error: ${error.message}`, { table });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        serverLogger.warn(`[InsForge] SDK UPSERT exception: ${msg}`, { table });
      }
    }

    return record as unknown as T;
  }
}

export const insforgeClient = new InsForgeClient();
