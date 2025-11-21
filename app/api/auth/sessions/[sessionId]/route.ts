import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { revokeSession } from '@/lib/auth/session-manager';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

/**
 * DELETE /api/auth/sessions/[sessionId]
 * Revoke a specific session
 */
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth();

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

    const params = await props.params;
    const { sessionId } = params;

    const success = await revokeSession(sessionId, user.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Session not found or already revoked' },
        { status: 404 }
      );
    }

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'session_revoked',
        resourceId: sessionId,
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        userAgent: req.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      message: 'Session revoked successfully',
    });
  } catch (error) {
    log.error('Failed to revoke session', error);
    return NextResponse.json(
      { error: 'Failed to revoke session' },
      { status: 500 }
    );
  }
}
