import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { mockNotifications } from '@/lib/data';
import { z } from 'zod';

/**
 * GET /api/notifications
 * Get user notifications
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - Login required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Filter notifications for current user
    let notifications = mockNotifications.filter(
      (notification) => notification.userId === session.user.id
    );

    // Filter unread only if requested
    if (unreadOnly) {
      notifications = notifications.filter((n) => !n.read);
    }

    // Sort by creation date (newest first)
    notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Limit results
    notifications = notifications.slice(0, limit);

    // Count unread notifications
    const unreadCount = mockNotifications.filter(
      (n) => n.userId === session.user.id && !n.read
    ).length;

    return NextResponse.json({
      data: notifications,
      unreadCount,
      total: mockNotifications.filter((n) => n.userId === session.user.id).length,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: '알림을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

const markAsReadSchema = z.object({
  notificationId: z.string().optional(),
  markAllAsRead: z.boolean().optional(),
});

/**
 * PATCH /api/notifications
 * Mark notification(s) as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - Login required' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, markAllAsRead } = markAsReadSchema.parse(body);

    if (markAllAsRead) {
      // Mark all user's notifications as read
      mockNotifications.forEach((notification) => {
        if (notification.userId === session.user.id) {
          notification.read = true;
        }
      });

      return NextResponse.json({
        message: '모든 알림을 읽음 처리했습니다.',
        success: true,
      });
    } else if (notificationId) {
      // Mark specific notification as read
      const notification = mockNotifications.find(
        (n) => n.id === notificationId && n.userId === session.user.id
      );

      if (!notification) {
        return NextResponse.json(
          { error: '알림을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      notification.read = true;

      return NextResponse.json({
        message: '알림을 읽음 처리했습니다.',
        success: true,
      });
    } else {
      return NextResponse.json(
        { error: 'notificationId 또는 markAllAsRead가 필요합니다.' },
        { status: 400 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Mark notification as read error:', error);
    return NextResponse.json(
      { error: '알림 상태 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications?id=xxx
 * Delete notification
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - Login required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json(
        { error: '알림 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // Find notification index
    const index = mockNotifications.findIndex(
      (n) => n.id === notificationId && n.userId === session.user.id
    );

    if (index === -1) {
      return NextResponse.json(
        { error: '알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Remove notification
    mockNotifications.splice(index, 1);

    return NextResponse.json({
      message: '알림이 삭제되었습니다.',
      success: true,
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json(
      { error: '알림 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
