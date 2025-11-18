/**
 * Unified Session Utilities for API Routes
 *
 * Provides centralized user session management to replace
 * scattered mock user IDs and inconsistent auth checks.
 */

import { getServerSession } from 'next-auth';
import { authConfig } from '../auth.config';
import { ApiErrors } from './errors';

/**
 * User session type
 */
export interface UserSession {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: string;
}

/**
 * Get current user session from API route
 *
 * @param required - Whether auth is required (throws if not authenticated)
 * @returns User session or null
 * @throws ApiError if required and not authenticated
 */
export async function getCurrentUser(required: boolean = false): Promise<UserSession | null> {
  try {
    const session = await getServerSession(authConfig);

    // No session found
    if (!session || !session.user) {
      if (required) {
        throw ApiErrors.Unauthorized();
      }
      return null;
    }

    // Map session to UserSession
    const user: UserSession = {
      id: session.user.id || '',
      email: session.user.email || '',
      name: session.user.name,
      image: session.user.image,
      role: (session.user as any).role || 'user',
    };

    return user;
  } catch (error) {
    // If it's already an ApiError, rethrow
    if (error instanceof Error && error.name === 'ApiError') {
      throw error;
    }

    // Otherwise, throw internal server error
    console.error('[Session Error]', error);
    if (required) {
      throw ApiErrors.Unauthorized();
    }
    return null;
  }
}

/**
 * Get user ID from session (for quick access)
 *
 * @param required - Whether auth is required
 * @returns User ID or null
 * @throws ApiError if required and not authenticated
 */
export async function getCurrentUserId(required: boolean = false): Promise<string | null> {
  const user = await getCurrentUser(required);
  return user?.id || null;
}

/**
 * Check if user is admin
 *
 * @returns true if user is admin
 * @throws ApiError if not authenticated or not admin
 */
export async function requireAdmin(): Promise<UserSession> {
  const user = await getCurrentUser(true);

  if (!user) {
    throw ApiErrors.Unauthorized();
  }

  if (user.role !== 'admin') {
    throw ApiErrors.Forbidden();
  }

  return user;
}

/**
 * Check if user owns a resource
 *
 * @param resourceUserId - User ID of the resource owner
 * @returns true if user owns the resource or is admin
 * @throws ApiError if not authenticated
 */
export async function requireOwnership(resourceUserId: string): Promise<UserSession> {
  const user = await getCurrentUser(true);

  if (!user) {
    throw ApiErrors.Unauthorized();
  }

  // Admin can access any resource
  if (user.role === 'admin') {
    return user;
  }

  // Check ownership
  if (user.id !== resourceUserId) {
    throw ApiErrors.Forbidden();
  }

  return user;
}

/**
 * Mock user for development (ONLY use in development!)
 *
 * @deprecated Use real authentication in production
 */
export function getMockUser(): UserSession {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Mock user is not allowed in production');
  }

  return {
    id: '1',
    email: 'dev@example.com',
    name: 'Development User',
    role: 'user',
  };
}

/**
 * Get user for API route (with development fallback)
 *
 * In development: Falls back to mock user if no session
 * In production: Requires real session
 *
 * @param required - Whether auth is required
 * @returns User session
 * @throws ApiError if required and not authenticated (production)
 */
export async function getUserOrMock(required: boolean = false): Promise<UserSession | null> {
  const user = await getCurrentUser(false);

  // If we have a real user, return it
  if (user) {
    return user;
  }

  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    console.warn('[Session] Using mock user for development');
    return getMockUser();
  }

  // Production requires real auth
  if (required) {
    throw ApiErrors.Unauthorized();
  }

  return null;
}
