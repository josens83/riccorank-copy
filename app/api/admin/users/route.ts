import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { mockUsers, mockPosts, mockComments } from '@/lib/mockData';
import { z } from 'zod';

const updateUserSchema = z.object({
  userId: z.string(),
  action: z.enum(['suspend', 'activate', 'delete', 'makeAdmin', 'removeAdmin']),
});

/**
 * GET /api/admin/users
 * Get all users with their activity stats (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all'; // all, active, suspended

    // Filter users
    let filteredUsers = [...mockUsers];

    if (search) {
      filteredUsers = filteredUsers.filter(
        u =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'all') {
      filteredUsers = filteredUsers.filter(u => {
        if (status === 'suspended') return u.suspended;
        if (status === 'active') return !u.suspended;
        return true;
      });
    }

    // Add activity stats
    const usersWithStats = filteredUsers.map(user => {
      const userPosts = mockPosts.filter(p => p.authorId === user.id);
      const userComments = mockComments.filter(c => c.authorId === user.id);

      return {
        ...user,
        postsCount: userPosts.length,
        commentsCount: userComments.length,
        lastActive: userPosts.length > 0 || userComments.length > 0
          ? new Date(Math.max(
              ...userPosts.map(p => new Date(p.createdAt).getTime()),
              ...userComments.map(c => new Date(c.createdAt).getTime())
            ))
          : user.createdAt,
      };
    });

    // Sort by creation date (newest first)
    usersWithStats.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = usersWithStats.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total: usersWithStats.length,
        totalPages: Math.ceil(usersWithStats.length / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users
 * Update user status or role (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, action } = updateUserSchema.parse(body);

    // Find user
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent self-modification
    if (user.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot modify your own account' },
        { status: 400 }
      );
    }

    // Apply action
    switch (action) {
      case 'suspend':
        user.suspended = true;
        break;
      case 'activate':
        user.suspended = false;
        break;
      case 'delete':
        // In real implementation, this would soft-delete the user
        const index = mockUsers.findIndex(u => u.id === userId);
        if (index > -1) {
          mockUsers.splice(index, 1);
        }
        break;
      case 'makeAdmin':
        user.role = 'admin';
        break;
      case 'removeAdmin':
        user.role = 'user';
        break;
    }

    return NextResponse.json({
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to update user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
