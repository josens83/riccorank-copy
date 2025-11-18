import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { verify2FAToken } from '@/lib/auth/2fa';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

/**
 * POST /api/auth/2fa/disable
 * Disable 2FA for user (requires token verification)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
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

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA is not enabled' },
        { status: 400 }
      );
    }

    // Verify token before disabling
    const isValid = verify2FAToken(user.twoFactorSecret, token);

    if (!isValid) {
      log.warn('Invalid 2FA token attempt when disabling', {
        userId: user.id,
        email: user.email,
      });

      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    // Disable 2FA and clear secret
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: null,
      },
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: '2fa_disabled',
        resource: 'user',
        resourceId: user.id,
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        userAgent: req.headers.get('user-agent'),
      },
    });

    log.info('2FA disabled successfully', {
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      message: '2FA disabled successfully',
    });
  } catch (error) {
    log.error('Failed to disable 2FA', error);
    return NextResponse.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}
