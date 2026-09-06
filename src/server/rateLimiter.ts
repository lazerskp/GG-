import 'server-only';

/**
 * Rate Limiting Abstraction & In-Memory Implementation
 * Protects backend and provider APIs from excessive traffic.
 *
 * ARCHITECTURAL NOTICE:
 * This in-memory implementation is designed for single-node / local development.
 * In multi-instance or serverless container environments (e.g. AWS Lambda, Vercel,
 * Kubernetes replicas), memory is isolated per node/isolate, meaning rate limits
 * apply per instance rather than globally.
 *
 * For distributed production deployments, swap this implementation with a Redis-backed
 * or Upstash-backed rate limiter implementing the `IRateLimiter` interface.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

export interface IRateLimiter {
  check(key: string, limit?: number, windowMs?: number): Promise<RateLimitResult> | RateLimitResult;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class SlidingWindowRateLimiter implements IRateLimiter {
  private records = new Map<string, RateLimitRecord>();

  /**
   * Check whether an identifier (e.g. IP address or client ID) is allowed.
   * @param key Identifier string
   * @param limit Max requests allowed in the window
   * @param windowMs Window duration in milliseconds (default 60s)
   */
  public check(key: string, limit = 60, windowMs = 60000): RateLimitResult {
    const now = Date.now();
    const existing = this.records.get(key);

    if (!existing || now > existing.resetTime) {
      this.records.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return { allowed: true, remaining: limit - 1, resetMs: windowMs };
    }

    if (existing.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetMs: Math.max(0, existing.resetTime - now),
      };
    }

    existing.count += 1;
    return {
      allowed: true,
      remaining: limit - existing.count,
      resetMs: Math.max(0, existing.resetTime - now),
    };
  }

  /**
   * Periodically purge expired bucket records to prevent memory leak
   */
  public purgeExpired(): void {
    const now = Date.now();
    for (const [key, record] of this.records.entries()) {
      if (now > record.resetTime) {
        this.records.delete(key);
      }
    }
  }
}

export const rateLimiter: IRateLimiter = new SlidingWindowRateLimiter();

// Clean up every 5 minutes in persistent environments
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    if (rateLimiter instanceof SlidingWindowRateLimiter) {
      rateLimiter.purgeExpired();
    }
  }, 300000);
}
