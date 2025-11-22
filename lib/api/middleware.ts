import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { apiRateLimiter, authRateLimiter, getClientIdentifier, SECURITY_HEADERS } from '../utils/security';
import { handleApiError, successResponse } from './errors';

/**
 * Middleware for API routes
 */

/**
 * Add security headers to response
 */
export function withSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Rate limiting middleware
 */
export function withRateLimit(
  request: NextRequest,
  limiter = apiRateLimiter
): { allowed: boolean; response?: NextResponse } {
  const identifier = getClientIdentifier(request);
  const { allowed, remaining, resetAt } = limiter.check(identifier);

  if (!allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(limiter['maxRequests']),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetAt.toISOString(),
            'Retry-After': String(Math.ceil((resetAt.getTime() - Date.now()) / 1000)),
          },
        }
      ),
    };
  }

  return { allowed: true };
}

/**
 * Authentication middleware
 */
export async function withAuth(
  request: NextRequest
): Promise<{ authenticated: boolean; session?: any; response?: NextResponse }> {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { error: 'Unauthorized. Please login.' },
          { status: 401 }
        ),
      };
    }

    return {
      authenticated: true,
      session,
    };
  } catch (error) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Authentication error.' },
        { status: 401 }
      ),
    };
  }
}

/**
 * CORS middleware
 */
export function withCors(
  request: NextRequest,
  response: NextResponse,
  allowedOrigins: string[] = ['*']
): NextResponse {
  const origin = request.headers.get('origin') || '';

  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
}

/**
 * Method validation middleware
 */
export function withMethodValidation(
  request: NextRequest,
  allowedMethods: string[]
): { valid: boolean; response?: NextResponse } {
  if (!allowedMethods.includes(request.method)) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: `Method ${request.method} not allowed` },
        {
          status: 405,
          headers: {
            'Allow': allowedMethods.join(', '),
          },
        }
      ),
    };
  }

  return { valid: true };
}

/**
 * Content-Type validation middleware
 */
export function withContentTypeValidation(
  request: NextRequest,
  requiredType: string = 'application/json'
): { valid: boolean; response?: NextResponse } {
  const contentType = request.headers.get('content-type');

  if (request.method !== 'GET' && request.method !== 'DELETE' && (!contentType || !contentType.includes(requiredType))) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: `Content-Type must be ${requiredType}` },
        { status: 415 }
      ),
    };
  }

  return { valid: true };
}

/**
 * Combined API middleware
 */
export async function apiMiddleware(
  request: NextRequest,
  options: {
    requireAuth?: boolean;
    allowedMethods?: string[];
    rateLimit?: boolean;
    rateLimiter?: any;
  } = {}
): Promise<{ success: boolean; response?: NextResponse; session?: any }> {
  const {
    requireAuth = false,
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'],
    rateLimit = true,
    rateLimiter = apiRateLimiter,
  } = options;

  // Method validation
  const methodCheck = withMethodValidation(request, allowedMethods);
  if (!methodCheck.valid) {
    return { success: false, response: methodCheck.response };
  }

  // Content-Type validation for POST/PUT requests
  if (request.method === 'POST' || request.method === 'PUT') {
    const contentTypeCheck = withContentTypeValidation(request);
    if (!contentTypeCheck.valid) {
      return { success: false, response: contentTypeCheck.response };
    }
  }

  // Rate limiting
  if (rateLimit) {
    const rateLimitCheck = withRateLimit(request, rateLimiter);
    if (!rateLimitCheck.allowed) {
      return { success: false, response: rateLimitCheck.response };
    }
  }

  // Authentication
  if (requireAuth) {
    const authCheck = await withAuth(request);
    if (!authCheck.authenticated) {
      return { success: false, response: authCheck.response };
    }
    return { success: true, session: authCheck.session };
  }

  return { success: true };
}

// Note: handleApiError and successResponse are now imported from ./api/errors
// to eliminate duplication and ensure consistency across the codebase.
