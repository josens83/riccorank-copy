import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserSessions, revokeAllSessionsExcept } from '@/lib/auth/session-manager';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

/**
 * GET /api/auth/sessions
 * Get all active sessions for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const sessions = await getUserSessions(user.id);

    return NextResponse.json({ sessions });
  } catch (error) {
    log.error('Failed to get user sessions', error);
    return NextResponse.json(
      { error: 'Failed to get sessions' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/sessions
 * Revoke all sessions except the current one
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get current session token (this would need to be passed from the client)
    const currentToken = req.headers.get('x-session-token') || '';

    const count = await revokeAllSessionsExcept(user.id, currentToken);

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'sessions_revoked_all',
        metadata: JSON.stringify({ count }),
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        userAgent: req.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      message: `${count} session(s) revoked successfully`,
      count,
    });
  } catch (error) {
    log.error('Failed to revoke sessions', error);
    return NextResponse.json(
      { error: 'Failed to revoke sessions' },
      { status: 500 }
    );
  }
}
