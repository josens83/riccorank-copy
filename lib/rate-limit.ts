import { Ratelimit } from '@upstash/ratelimit';
import { getRedis } from '@/lib/redis';
import { log } from '@/lib/logger';

// Rate limiter types
type RateLimiterType = 'api' | 'auth' | 'strict' | 'search' | 'payment';

// Rate limit configurations
const RATE_LIMIT_CONFIG: Record<RateLimiterType, { requests: number; window: string }> = {
  api: { requests: 100, window: '1 m' },      // 100 requests per minute
  auth: { requests: 5, window: '15 m' },      // 5 auth attempts per 15 minutes
  strict: { requests: 10, window: '1 m' },    // 10 requests per minute
  search: { requests: 30, window: '1 m' },    // 30 searches per minute
  payment: { requests: 3, window: '1 h' },    // 3 payment attempts per hour
};

// Cache for rate limiters
const rateLimiters = new Map<RateLimiterType, Ratelimit>();

/**
 * Get or create rate limiter instance
 */
function getRateLimiter(type: RateLimiterType): Ratelimit {
  if (!rateLimiters.has(type)) {
    const config = RATE_LIMIT_CONFIG[type];
    const redis = getRedis();

    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.requests, config.window),
      analytics: true,
      prefix: `ratelimit:${type}`,
    });

    rateLimiters.set(type, limiter);
  }

  return rateLimiters.get(type)!;
}

/**
 * Check rate limit for identifier
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimiterType = 'api'
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  try {
    const limiter = getRateLimiter(type);
    const result = await limiter.limit(identifier);

    if (!result.success) {
      log.warn('Rate limit exceeded', {
        identifier,
        type,
        limit: result.limit,
        remaining: result.remaining,
      });
    }

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    log.error('Rate limit check error', error as Error, { identifier, type });
    // Fail open - allow request if rate limiting fails
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now(),
    };
  }
}

/**
 * Rate limit middleware for API routes
 */
export async function withRateLimit(
  request: Request,
  type: RateLimiterType = 'api'
): Promise<Response | null> {
  // Get identifier (IP or user ID)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             'unknown';

  const result = await checkRateLimit(ip, type);

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return null; // No rate limit hit, continue
}

/**
 * Rate limit decorator for API handlers
 */
export function rateLimited(type: RateLimiterType = 'api') {
  return function (
    handler: (request: Request) => Promise<Response>
  ): (request: Request) => Promise<Response> {
    return async function (request: Request): Promise<Response> {
      const rateLimitResponse = await withRateLimit(request, type);
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
      return handler(request);
    };
  };
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: {
  limit: number;
  remaining: number;
  reset: number;
}): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };
}

/**
 * Reset rate limit for identifier (admin use)
 */
export async function resetRateLimit(
  identifier: string,
  type: RateLimiterType = 'api'
): Promise<void> {
  try {
    const redis = getRedis();
    const pattern = `ratelimit:${type}:${identifier}*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      log.info('Rate limit reset', { identifier, type, keysDeleted: keys.length });
    }
  } catch (error) {
    log.error('Rate limit reset error', error as Error, { identifier, type });
  }
}

/**
 * Block identifier completely (for security)
 */
export async function blockIdentifier(
  identifier: string,
  durationSeconds: number = 3600
): Promise<void> {
  try {
    const redis = getRedis();
    await redis.set(`blocked:${identifier}`, 'true', { ex: durationSeconds });
    log.warn('Identifier blocked', { identifier, duration: durationSeconds });
  } catch (error) {
    log.error('Block identifier error', error as Error, { identifier });
  }
}

/**
 * Check if identifier is blocked
 */
export async function isBlocked(identifier: string): Promise<boolean> {
  try {
    const redis = getRedis();
    const blocked = await redis.get(`blocked:${identifier}`);
    return blocked === 'true';
  } catch (error) {
    log.error('Check blocked error', error as Error, { identifier });
    return false;
  }
}

/**
 * Unblock identifier (admin use)
 */
export async function unblockIdentifier(identifier: string): Promise<void> {
  try {
    const redis = getRedis();
    await redis.del(`blocked:${identifier}`);
    log.info('Identifier unblocked', { identifier });
  } catch (error) {
    log.error('Unblock identifier error', error as Error, { identifier });
  }
}
