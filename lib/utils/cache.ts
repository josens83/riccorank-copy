// Simple in-memory cache with TTL
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * 캐시에서 데이터 조회
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // TTL 만료 확인
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * 캐시에 데이터 저장
   */
  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * 캐시 삭제
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 모든 캐시 삭제
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 만료된 캐시 항목 정리
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// 글로벌 캐시 인스턴스
const globalCache = new SimpleCache();

// 주기적으로 만료된 캐시 정리 (10분마다)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    globalCache.cleanup();
  }, 10 * 60 * 1000);
}

/**
 * 캐시된 데이터 가져오기 (없으면 fetcher 실행)
 */
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 5 * 60 * 1000 // 기본 5분
): Promise<T> {
  // 캐시 확인
  const cached = globalCache.get<T>(key);
  if (cached !== null) {
    console.log(`Cache HIT: ${key}`);
    return cached;
  }

  // 캐시 미스 - fetcher 실행
  console.log(`Cache MISS: ${key}`);
  const data = await fetcher();

  // 캐시 저장
  globalCache.set(key, data, ttlMs);

  return data;
}

/**
 * 캐시 삭제
 */
export function invalidateCache(key: string): void {
  globalCache.delete(key);
}

/**
 * 모든 캐시 삭제
 */
export function clearAllCache(): void {
  globalCache.clear();
}

/**
 * 캐시 키 생성 헬퍼
 */
export function createCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return `${prefix}:${sortedParams}`;
}

export default globalCache;
