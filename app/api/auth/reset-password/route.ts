import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Mock storage (same as forgot-password)
// In real app, this would be in database
const mockResetTokens: Map<string, { email: string; token: string; expiresAt: Date }> = new Map();

const resetPasswordSchema = z.object({
  token: z.string().min(1, '토큰이 필요합니다.'),
  password: z.string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .regex(/[A-Z]/, '비밀번호는 최소 1개의 대문자를 포함해야 합니다.')
    .regex(/[a-z]/, '비밀번호는 최소 1개의 소문자를 포함해야 합니다.')
    .regex(/[0-9]/, '비밀번호는 최소 1개의 숫자를 포함해야 합니다.'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['confirmPassword'],
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    // Hash the token to find it
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

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // In real app, update user's password in database
    // For now, we'll just log it
    console.log('='.repeat(80));
    console.log('PASSWORD RESET SUCCESS (Development Mode)');
    console.log('='.repeat(80));
    console.log(`Email: ${resetData.email}`);
    console.log(`New password hash: ${hashedPassword.substring(0, 20)}...`);
    console.log('='.repeat(80));

    // Delete the used token
    mockResetTokens.delete(tokenHash);

    return NextResponse.json({
      message: '비밀번호가 성공적으로 재설정되었습니다. 새 비밀번호로 로그인해주세요.',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message, details: error.issues },
        { status: 400 }
      );
    }

    console.error('Password reset failed:', error);
    return NextResponse.json(
      { error: '비밀번호 재설정에 실패했습니다.' },
      { status: 500 }
    );
  }
}
