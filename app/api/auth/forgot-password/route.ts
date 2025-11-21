import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/external/email';
import { mockUsers } from '@/lib/data';

// Mock storage for password reset tokens (in real app, use database)
const mockResetTokens: Map<string, { email: string; token: string; expiresAt: Date }> = new Map();

const forgotPasswordSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists (for internal use, don't reveal in response)
    const user = mockUsers.find((u) => u.email === normalizedEmail);

    // Generate reset token regardless of whether user exists
    // This prevents email enumeration attacks
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store token with 1 hour expiration
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    mockResetTokens.set(tokenHash, {
      email: normalizedEmail,
      token: tokenHash,
      expiresAt,
    });

    // Send email only if user exists
    if (user) {
      const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

      // Send password reset email
      await sendPasswordResetEmail(user.email, user.name, resetUrl);

      console.log('✅ Password reset email sent to:', user.email);
    } else {
      console.log('⚠️  User not found, but returning success to prevent enumeration');
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: '비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '유효한 이메일 주소를 입력해주세요.', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Password reset request failed:', error);
    return NextResponse.json(
      { error: '비밀번호 재설정 요청에 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/forgot-password?token=xxx
 * Verify reset token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: '토큰이 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // Hash the token to compare
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetData = mockResetTokens.get(tokenHash);

    if (!resetData) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date() > resetData.expiresAt) {
      mockResetTokens.delete(tokenHash);
      return NextResponse.json(
        { error: '토큰이 만료되었습니다. 비밀번호 재설정을 다시 요청해주세요.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: resetData.email,
    });

  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.json(
      { error: '토큰 검증에 실패했습니다.' },
      { status: 500 }
    );
  }
}
