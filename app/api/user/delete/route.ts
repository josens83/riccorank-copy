import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { deleteUserData } from '@/lib/data-export';
import { log } from '@/lib/logger';

/**
 * DELETE /api/user/delete
 * Delete all user data (GDPR Right to Erasure)
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { confirmation } = await req.json();

    // Require explicit confirmation
    if (confirmation !== 'DELETE_MY_ACCOUNT') {
      return NextResponse.json(
        {
          error: 'Confirmation required',
          message: 'Please send confirmation: "DELETE_MY_ACCOUNT"'
        },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Log before deletion
    log.warn('User account deletion requested', {
      userId,
      email: session.user.email,
      timestamp: new Date().toISOString(),
    });

    await deleteUserData(userId);

    log.info('User account deleted', { userId });

    return NextResponse.json({
      success: true,
      message: '계정이 삭제되었습니다.',
    });
  } catch (error) {
    log.error('Delete user data error', error as Error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
