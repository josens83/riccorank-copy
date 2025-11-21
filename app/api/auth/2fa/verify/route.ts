import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { verify2FAToken } from '@/lib/auth/2fa';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

/**
 * POST /api/auth/2fa/verify
 * Verify 2FA token and enable 2FA for user
 */
export async function POST(req: NextRequest) {
  try {
    const session = await await auth();

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

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: 'User not found or 2FA not set up' },
        { status: 404 }
      );
    }

    // Verify token
    const isValid = verify2FAToken(user.twoFactorSecret, token);

    if (!isValid) {
      log.warn('Invalid 2FA token attempt', {
        userId: user.id,
        email: user.email,
      });

      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
      },
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: '2fa_enabled',
        resource: 'user',
        resourceId: user.id,
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        userAgent: req.headers.get('user-agent'),
      },
    });

    log.info('2FA enabled successfully', {
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      message: '2FA enabled successfully',
    });
  } catch (error) {
    log.error('Failed to verify 2FA token', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA token' },
      { status: 500 }
    );
  }
}
