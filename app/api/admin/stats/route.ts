import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { mockUsers, mockPosts, mockComments } from '@/lib/mockData';

/**
 * GET /api/admin/stats
 * Get dashboard statistics (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    // Check admin role
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Calculate stats
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const totalUsers = mockUsers.length;
    const totalPosts = mockPosts.length;
    const totalComments = mockComments.length;
    const totalReports = 23; // Mock value - will be replaced with actual reports

    // Active users (users who posted or commented today)
    const postsToday = mockPosts.filter(p => {
      const postDate = new Date(p.createdAt);
      return postDate >= today;
    }).length;

    const activeUserIds = new Set([
      ...mockPosts.filter(p => new Date(p.createdAt) >= today).map(p => p.authorId),
      ...mockComments.filter(c => new Date(c.createdAt) >= today).map(c => c.authorId),
    ]);

    const stats = {
      totalUsers,
      totalPosts,
      totalComments,
      totalReports,
      activeUsers: activeUserIds.size,
      postsToday,
      // Additional metrics
      newUsersToday: mockUsers.filter(u => new Date(u.createdAt) >= today).length,
      commentsToday: mockComments.filter(c => new Date(c.createdAt) >= today).length,
      // Growth trends (mock percentages)
      userGrowth: 12,
      postGrowth: 8,
      commentGrowth: 15,
      reportChange: -3,
    };

    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
