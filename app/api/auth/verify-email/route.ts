import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import crypto from 'crypto';
import { sendVerificationEmail, sendWelcomeEmail } from '@/lib/external/email';
import { mockUsers } from '@/lib/data';

// Mock storage for email verification tokens (in real app, use database)
const mockVerificationTokens: Map<
  string,
  { email: string; userId: string; token: string; expiresAt: Date }
> = new Map();

/**
 * POST /api/auth/verify-email
 * Send verification email to user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      );
    }

    // Get user from mock data
    const user = mockUsers.find((u) => u.email === session.user.email);

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: '이미 이메일이 인증되었습니다.' },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

    // Store token with 24 hour expiration
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    mockVerificationTokens.set(tokenHash, {
      email: user.email,
      userId: user.id,
      token: tokenHash,
      expiresAt,
    });

    // Send verification email
    const verificationUrl = `${
      process.env.NEXTAUTH_URL || 'http://localhost:3000'
    }/verify-email?token=${verificationToken}`;

    await sendVerificationEmail(user.email, user.name, verificationUrl);

    console.log('✅ Verification email sent to:', user.email);

    return NextResponse.json({
      message: '인증 이메일이 전송되었습니다. 이메일을 확인해주세요.',
    });
  } catch (error) {
    console.error('Verification email send failed:', error);
    return NextResponse.json(
      { error: '인증 이메일 전송에 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/verify-email?token=xxx
 * Verify email with token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: '토큰이 제공되지 않았습니다.' }, { status: 400 });
    }

    // Hash the token to compare
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const verificationData = mockVerificationTokens.get(tokenHash);

    if (!verificationData) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 400 });
    }

    // Check if token is expired
    if (new Date() > verificationData.expiresAt) {
      mockVerificationTokens.delete(tokenHash);
      return NextResponse.json(
        { error: '토큰이 만료되었습니다. 인증 이메일을 다시 요청해주세요.' },
        { status: 400 }
      );
    }

    // Get user from mock data
    const user = mockUsers.find((u) => u.id === verificationData.userId);

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // Mark email as verified
    // In real app, update database
    user.emailVerified = true;
    user.updatedAt = new Date();

    // Delete used token
    mockVerificationTokens.delete(tokenHash);

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    console.log('✅ Email verified for user:', user.email);

    return NextResponse.json({
      message: '이메일 인증이 완료되었습니다!',
      verified: true,
    });
  } catch (error) {
    console.error('Email verification failed:', error);
    return NextResponse.json(
      { error: '이메일 인증에 실패했습니다.' },
      { status: 500 }
    );
  }
}
