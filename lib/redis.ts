import { Redis } from '@upstash/redis';
import { log } from '@/lib/logger';

// Singleton Redis client
let redis: Redis | null = null;

/**
 * Get Redis client instance
 * Uses Upstash Redis for serverless compatibility
 */
export function getRedis(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      log.warn('Redis credentials not configured, using mock client');
      // Return a mock client for development
      return createMockRedis();
    }

    redis = new Redis({
      url,
      token,
    });

    log.info('Redis client initialized', { url: url.substring(0, 30) + '...' });
  }

  return redis;
}

/**
 * Cache wrapper with automatic serialization
 */
export class RedisCache {
  private redis: Redis;
  private prefix: string;

  constructor(prefix: string = 'cache') {
    this.redis = getRedis();
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get<T>(this.getKey(key));
      if (data) {
        log.debug('Cache hit', { key: this.getKey(key) });
      }
      return data;
    } catch (error) {
      log.error('Redis get error', error as Error, { key });
      return null;
    }
  }

  /**
   * Set cached value with optional TTL (in seconds)
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const fullKey = this.getKey(key);
      if (ttlSeconds) {
        await this.redis.set(fullKey, value, { ex: ttlSeconds });
      } else {
        await this.redis.set(fullKey, value);
      }
      log.debug('Cache set', { key: fullKey, ttl: ttlSeconds });
    } catch (error) {
      log.error('Redis set error', error as Error, { key });
    }
  }

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(this.getKey(key));
      log.debug('Cache delete', { key: this.getKey(key) });
    } catch (error) {
      log.error('Redis delete error', error as Error, { key });
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(this.getKey(pattern));
      if (keys.length > 0) {
        await this.redis.del(...keys);
        log.debug('Cache pattern delete', { pattern, count: keys.length });
      }
    } catch (error) {
      log.error('Redis pattern delete error', error as Error, { pattern });
    }
  }

  /**
   * Get or set cached value (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  /**
   * Increment counter
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.redis.incrby(this.getKey(key), amount);
    } catch (error) {
      log.error('Redis increment error', error as Error, { key });
      return 0;
    }
  }

  /**
   * Set expiration on existing key
   */
  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      await this.redis.expire(this.getKey(key), ttlSeconds);
    } catch (error) {
      log.error('Redis expire error', error as Error, { key });
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(this.getKey(key));
      return result === 1;
    } catch (error) {
      log.error('Redis exists error', error as Error, { key });
      return false;
    }
  }

  /**
   * Get TTL of key (in seconds)
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(this.getKey(key));
    } catch (error) {
      log.error('Redis ttl error', error as Error, { key });
      return -1;
    }
  }
}

/**
 * Create mock Redis client for development without Redis
 */
function createMockRedis(): Redis {
  const store = new Map<string, { value: unknown; expiry?: number }>();

  return {
    get: async <T>(key: string): Promise<T | null> => {
      const item = store.get(key);
      if (!item) return null;
      if (item.expiry && Date.now() > item.expiry) {
        store.delete(key);
        return null;
      }
      return item.value as T;
    },
    set: async (key: string, value: unknown, options?: { ex?: number }) => {
      const expiry = options?.ex ? Date.now() + options.ex * 1000 : undefined;
      store.set(key, { value, expiry });
      return 'OK';
    },
    del: async (...keys: string[]) => {
      let count = 0;
      for (const key of keys) {
        if (store.delete(key)) count++;
      }
      return count;
    },
    keys: async (pattern: string) => {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return Array.from(store.keys()).filter(k => regex.test(k));
    },
    exists: async (key: string) => (store.has(key) ? 1 : 0),
    expire: async (key: string, seconds: number) => {
      const item = store.get(key);
      if (item) {
        item.expiry = Date.now() + seconds * 1000;
        return 1;
      }
      return 0;
    },
    ttl: async (key: string) => {
      const item = store.get(key);
      if (!item) return -2;
      if (!item.expiry) return -1;
      return Math.ceil((item.expiry - Date.now()) / 1000);
    },
    incrby: async (key: string, amount: number) => {
      const item = store.get(key);
      const current = item ? Number(item.value) || 0 : 0;
      const newValue = current + amount;
      store.set(key, { value: newValue, expiry: item?.expiry });
      return newValue;
    },
  } as unknown as Redis;
}

// Pre-configured cache instances
export const stockCache = new RedisCache('stock');
export const newsCache = new RedisCache('news');
export const userCache = new RedisCache('user');
export const sessionCache = new RedisCache('session');
export const apiCache = new RedisCache('api');

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  STOCK_QUOTE: 60,          // 1 minute - real-time data
  STOCK_LIST: 300,          // 5 minutes
  MARKET_INDEX: 60,         // 1 minute
  NEWS_LIST: 300,           // 5 minutes
  NEWS_DETAIL: 3600,        // 1 hour
  USER_PROFILE: 600,        // 10 minutes
  USER_SESSION: 86400,      // 24 hours
  API_RESPONSE: 300,        // 5 minutes default
  SEARCH_RESULTS: 600,      // 10 minutes
} as const;
