import { stockCache, newsCache, apiCache, CACHE_TTL } from '@/lib/redis';
import { log } from '@/lib/logger';

/**
 * Stock data caching utilities
 */
export const StockCacheService = {
  /**
   * Get cached stock quote
   */
  async getQuote(symbol: string) {
    return stockCache.get(`quote:${symbol}`);
  },

  /**
   * Set stock quote in cache
   */
  async setQuote(symbol: string, data: unknown) {
    await stockCache.set(`quote:${symbol}`, data, CACHE_TTL.STOCK_QUOTE);
  },

  /**
   * Get cached stock list
   */
  async getList(market: string, page: number = 1) {
    return stockCache.get(`list:${market}:${page}`);
  },

  /**
   * Set stock list in cache
   */
  async setList(market: string, page: number, data: unknown) {
    await stockCache.set(`list:${market}:${page}`, data, CACHE_TTL.STOCK_LIST);
  },

  /**
   * Get cached market indices
   */
  async getIndices() {
    return stockCache.get('indices');
  },

  /**
   * Set market indices in cache
   */
  async setIndices(data: unknown) {
    await stockCache.set('indices', data, CACHE_TTL.MARKET_INDEX);
  },

  /**
   * Invalidate all stock cache
   */
  async invalidateAll() {
    await stockCache.deletePattern('*');
    log.info('Stock cache invalidated');
  },

  /**
   * Invalidate specific stock
   */
  async invalidateStock(symbol: string) {
    await stockCache.delete(`quote:${symbol}`);
    log.debug('Stock quote cache invalidated', { symbol });
  },
};

/**
 * News data caching utilities
 */
export const NewsCacheService = {
  /**
   * Get cached news list
   */
  async getList(category: string = 'all', page: number = 1) {
    return newsCache.get(`list:${category}:${page}`);
  },

  /**
   * Set news list in cache
   */
  async setList(category: string, page: number, data: unknown) {
    await newsCache.set(`list:${category}:${page}`, data, CACHE_TTL.NEWS_LIST);
  },

  /**
   * Get cached news detail
   */
  async getDetail(id: string) {
    return newsCache.get(`detail:${id}`);
  },

  /**
   * Set news detail in cache
   */
  async setDetail(id: string, data: unknown) {
    await newsCache.set(`detail:${id}`, data, CACHE_TTL.NEWS_DETAIL);
  },

  /**
   * Get cached search results
   */
  async getSearch(query: string) {
    const cacheKey = `search:${Buffer.from(query).toString('base64')}`;
    return newsCache.get(cacheKey);
  },

  /**
   * Set search results in cache
   */
  async setSearch(query: string, data: unknown) {
    const cacheKey = `search:${Buffer.from(query).toString('base64')}`;
    await newsCache.set(cacheKey, data, CACHE_TTL.SEARCH_RESULTS);
  },

  /**
   * Invalidate all news cache
   */
  async invalidateAll() {
    await newsCache.deletePattern('*');
    log.info('News cache invalidated');
  },
};

/**
 * Generic API response caching
 */
export const ApiCacheService = {
  /**
   * Get cached API response
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T | null> {
    const cacheKey = generateCacheKey(endpoint, params);
    return apiCache.get<T>(cacheKey);
  },

  /**
   * Set API response in cache
   */
  async set(
    endpoint: string,
    data: unknown,
    params?: Record<string, string>,
    ttl: number = CACHE_TTL.API_RESPONSE
  ) {
    const cacheKey = generateCacheKey(endpoint, params);
    await apiCache.set(cacheKey, data, ttl);
  },

  /**
   * Get or fetch API response with caching
   */
  async getOrFetch<T>(
    endpoint: string,
    fetcher: () => Promise<T>,
    params?: Record<string, string>,
    ttl: number = CACHE_TTL.API_RESPONSE
  ): Promise<T> {
    const cacheKey = generateCacheKey(endpoint, params);
    return apiCache.getOrSet(cacheKey, fetcher, ttl);
  },

  /**
   * Invalidate specific endpoint cache
   */
  async invalidate(endpoint: string, params?: Record<string, string>) {
    const cacheKey = generateCacheKey(endpoint, params);
    await apiCache.delete(cacheKey);
    log.debug('API cache invalidated', { endpoint });
  },

  /**
   * Invalidate all cache for endpoint pattern
   */
  async invalidatePattern(pattern: string) {
    await apiCache.deletePattern(pattern);
    log.info('API cache pattern invalidated', { pattern });
  },
};

/**
 * Generate cache key from endpoint and params
 */
function generateCacheKey(endpoint: string, params?: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) {
    return endpoint;
  }

  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return `${endpoint}?${sortedParams}`;
}

/**
 * Cache decorator for async functions
 */
export function cached<T>(
  cacheKey: string,
  ttlSeconds: number = CACHE_TTL.API_RESPONSE
) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      // Generate key with args
      const key = `${cacheKey}:${JSON.stringify(args)}`;

      // Try to get from cache
      const cached = await apiCache.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Store in cache
      await apiCache.set(key, result, ttlSeconds);

      return result;
    };

    return descriptor;
  };
}

/**
 * Batch cache operations
 */
export const BatchCache = {
  /**
   * Get multiple values at once
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    return Promise.all(keys.map(key => apiCache.get<T>(key)));
  },

  /**
   * Set multiple values at once
   */
  async mset(entries: Array<{ key: string; value: unknown; ttl?: number }>) {
    await Promise.all(
      entries.map(({ key, value, ttl }) =>
        apiCache.set(key, value, ttl || CACHE_TTL.API_RESPONSE)
      )
    );
  },

  /**
   * Delete multiple keys at once
   */
  async mdel(keys: string[]) {
    await Promise.all(keys.map(key => apiCache.delete(key)));
  },
};
