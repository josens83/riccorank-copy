import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { generate2FASecret, hashBackupCode } from '@/lib/auth/2fa';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

/**
 * POST /api/auth/2fa/setup
 * Generate 2FA secret and QR code for user
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is already enabled' },
        { status: 400 }
      );
    }

    // Generate 2FA secret
    const { secret, qrCodeDataUrl, backupCodes } = await generate2FASecret(
      user.id,
      user.email
    );

    // Hash backup codes for storage
    const hashedBackupCodes = await Promise.all(
      backupCodes.map((code) => hashBackupCode(code))
    );

    // Store secret (but don't enable 2FA yet - user needs to verify first)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: secret,
        backupCodes: JSON.stringify(hashedBackupCodes),
      },
    });

    log.info('2FA setup initiated', {
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      qrCodeDataUrl,
      backupCodes, // Return plain codes to user (only shown once)
      message: '2FA setup initiated. Please verify with your authenticator app.',
    });
  } catch (error) {
    log.error('Failed to setup 2FA', error);
    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}
