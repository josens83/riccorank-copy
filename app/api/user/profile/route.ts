import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { mockUsers } from '@/lib/data';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const updateProfileSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.').optional(),
  email: z.string().email('유효한 이메일 주소를 입력해주세요.').optional(),
  image: z.string().url('유효한 이미지 URL을 입력해주세요.').optional(),
  bio: z.string().max(500, '자기소개는 최대 500자까지 가능합니다.').optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요.'),
  newPassword: z.string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .regex(/[A-Z]/, '비밀번호는 최소 1개의 대문자를 포함해야 합니다.')
    .regex(/[a-z]/, '비밀번호는 최소 1개의 소문자를 포함해야 합니다.')
    .regex(/[0-9]/, '비밀번호는 최소 1개의 숫자를 포함해야 합니다.'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['confirmPassword'],
});

/**
 * GET /api/user/profile
 * Get current user's profile
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      );
    }

    // Find user
    const user = mockUsers.find(u => u.id === session.user.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user profile (exclude sensitive data)
    const { ...profile } = user;
    return NextResponse.json({
      data: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        image: profile.image,
        role: profile.role,
        suspended: profile.suspended,
        provider: profile.provider,
        createdAt: profile.createdAt,
      },
    });

  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile
 * Update current user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const updates = updateProfileSchema.parse(body);

    // Find user
    const user = mockUsers.find(u => u.id === session.user.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it's already taken
    if (updates.email && updates.email !== user.email) {
      const emailExists = mockUsers.some(
        u => u.email === updates.email && u.id !== user.id
      );

      if (emailExists) {
        return NextResponse.json(
          { error: '이미 사용 중인 이메일입니다.' },
          { status: 400 }
        );
      }
    }

    // Update user
    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email;
    if (updates.image) user.image = updates.image;
    user.updatedAt = new Date();

    // In real app, also update session
    return NextResponse.json({
      message: '프로필이 성공적으로 업데이트되었습니다.',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message, details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to update profile:', error);
    return NextResponse.json(
      { error: '프로필 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/profile/change-password
 * Change user's password
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    // Find user
    const user = mockUsers.find(u => u.id === session.user.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // OAuth users cannot change password
    if (user.provider === 'google') {
      return NextResponse.json(
        { error: 'OAuth 계정은 비밀번호를 변경할 수 없습니다.' },
        { status: 400 }
      );
    }

    // In real app, verify current password
    // const isValid = await bcrypt.compare(currentPassword, user.password);
    // if (!isValid) { return error }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // In real app, update password in database
    console.log('Password changed for user:', user.email);
    console.log('New password hash:', hashedPassword.substring(0, 20) + '...');

    return NextResponse.json({
      message: '비밀번호가 성공적으로 변경되었습니다.',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message, details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to change password:', error);
    return NextResponse.json(
      { error: '비밀번호 변경에 실패했습니다.' },
      { status: 500 }
    );
  }
}
