import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { log } from '@/lib/logger';

// Session duration: 30 days
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Create a new session for a user
 */
export async function createSession(
  userId: string,
  deviceInfo?: string,
  ipAddress?: string
): Promise<string> {
  // Generate secure random token
  const token = crypto.randomBytes(32).toString('hex');

  // Calculate expiration date
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  // Create session in database
  await prisma.session.create({
    data: {
      userId,
      token,
      deviceInfo,
      ipAddress,
      expiresAt,
      lastActive: new Date(),
    },
  });

  log.info('Session created', {
    userId,
    deviceInfo,
    ipAddress,
  });

  return token;
}

/**
 * Validate a session token
 */
export async function validateSession(token: string): Promise<{
  valid: boolean;
  userId?: string;
  session?: any;
}> {
  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) {
      return { valid: false };
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      // Delete expired session
      await prisma.session.delete({
        where: { id: session.id },
      });

      log.info('Expired session deleted', {
        sessionId: session.id,
        userId: session.userId,
      });

      return { valid: false };
    }

    // Update last active time
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActive: new Date() },
    });

    return {
      valid: true,
      userId: session.userId,
      session,
    };
  } catch (error) {
    log.error('Session validation failed', error);
    return { valid: false };
  }
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string) {
  const sessions = await prisma.session.findMany({
    where: {
      userId,
      expiresAt: {
        gte: new Date(),
      },
    },
    orderBy: {
      lastActive: 'desc',
    },
  });

  return sessions.map((session: any) => ({
    id: session.id,
    deviceInfo: session.deviceInfo,
    ipAddress: session.ipAddress,
    lastActive: session.lastActive,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    isCurrent: false, // This should be set by the caller
  }));
}

/**
 * Revoke a specific session
 */
export async function revokeSession(sessionId: string, userId: string): Promise<boolean> {
  try {
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId, // Ensure user owns this session
      },
    });

    if (!session) {
      return false;
    }

    await prisma.session.delete({
      where: { id: sessionId },
    });

    log.info('Session revoked', {
      sessionId,
      userId,
    });

    return true;
  } catch (error) {
    log.error('Failed to revoke session', error);
    return false;
  }
}

/**
 * Revoke all sessions for a user except the current one
 */
export async function revokeAllSessionsExcept(
  userId: string,
  currentToken: string
): Promise<number> {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        userId,
        token: {
          not: currentToken,
        },
      },
    });

    log.info('All sessions revoked except current', {
      userId,
      count: result.count,
    });

    return result.count;
  } catch (error) {
    log.error('Failed to revoke all sessions', error);
    return 0;
  }
}

/**
 * Clean up expired sessions
 * This should be run periodically (e.g., via cron job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    log.info('Expired sessions cleaned up', {
      count: result.count,
    });

    return result.count;
  } catch (error) {
    log.error('Failed to cleanup expired sessions', error);
    return 0;
  }
}

/**
 * Get session statistics for a user
 */
export async function getSessionStats(userId: string) {
  const sessions = await prisma.session.findMany({
    where: { userId },
  });

  const activeSessions = sessions.filter((s: any) => s.expiresAt >= new Date());
  const expiredSessions = sessions.filter((s: any) => s.expiresAt < new Date());

  return {
    total: sessions.length,
    active: activeSessions.length,
    expired: expiredSessions.length,
    devices: [...new Set(sessions.map((s: any) => s.deviceInfo).filter(Boolean))],
  };
}

/**
 * Parse device info from user agent
 */
export function parseDeviceInfo(userAgent: string | null): string {
  if (!userAgent) return 'Unknown Device';

  // Simple device detection
  if (userAgent.includes('Mobile')) return 'Mobile Device';
  if (userAgent.includes('Tablet')) return 'Tablet';
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Macintosh')) return 'Mac';
  if (userAgent.includes('Linux')) return 'Linux PC';

  return 'Unknown Device';
}
