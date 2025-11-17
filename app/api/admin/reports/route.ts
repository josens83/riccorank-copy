import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { mockUsers, mockPosts, mockComments } from '@/lib/mockData';
import { z } from 'zod';

// Mock reports storage (shared with /api/reports)
// In real app, this would be imported from a shared database module
const mockReports: any[] = [];

const updateReportSchema = z.object({
  reportId: z.string(),
  action: z.enum(['review', 'resolve', 'dismiss']),
  notes: z.string().optional(),
});

/**
 * GET /api/admin/reports
 * Get all reports for admin review
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
    const status = searchParams.get('status') || 'all'; // all, pending, reviewed, resolved, dismissed
    const type = searchParams.get('type') || 'all'; // all, post, comment

    // Filter reports
    let filteredReports = [...mockReports];

    if (status !== 'all') {
      filteredReports = filteredReports.filter(r => r.status === status);
    }

    if (type !== 'all') {
      filteredReports = filteredReports.filter(r => r.type === type);
    }

    // Add detailed information
    const reportsWithDetails = filteredReports.map(report => {
      const reporter = mockUsers.find(u => u.id === report.reporterId);

      let target = null;
      if (report.type === 'post') {
        const post = mockPosts.find(p => p.id === report.targetId);
        if (post) {
          const author = mockUsers.find(u => u.id === post.authorId);
          target = {
            id: post.id,
            title: post.title,
            content: post.content.substring(0, 200),
            author: author ? { id: author.id, name: author.name } : null,
          };
        }
      } else if (report.type === 'comment') {
        const comment = mockComments.find(c => c.id === report.targetId);
        if (comment) {
          const author = mockUsers.find(u => u.id === comment.authorId);
          const post = mockPosts.find(p => p.id === comment.postId);
          target = {
            id: comment.id,
            content: comment.content,
            author: author ? { id: author.id, name: author.name } : null,
            post: post ? { id: post.id, title: post.title } : null,
          };
        }
      }

      return {
        ...report,
        reporter: reporter ? { id: reporter.id, name: reporter.name, email: reporter.email } : null,
        target,
      };
    });

    // Sort by creation date (newest first)
    reportsWithDetails.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReports = reportsWithDetails.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedReports,
      pagination: {
        page,
        limit,
        total: reportsWithDetails.length,
        totalPages: Math.ceil(reportsWithDetails.length / limit),
      },
    });

  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/reports
 * Update report status (admin only)
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
    const { reportId, action, notes } = updateReportSchema.parse(body);

    // Find report
    const report = mockReports.find(r => r.id === reportId);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Update status based on action
    switch (action) {
      case 'review':
        report.status = 'reviewed';
        break;
      case 'resolve':
        report.status = 'resolved';
        break;
      case 'dismiss':
        report.status = 'dismissed';
        break;
    }

    report.reviewedBy = session.user.id;
    report.reviewedAt = new Date().toISOString();
    report.updatedAt = new Date().toISOString();

    if (notes) {
      report.adminNotes = notes;
    }

    return NextResponse.json({
      message: '신고 상태가 업데이트되었습니다.',
      data: report,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to update report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reports
 * Delete a report (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID required' },
        { status: 400 }
      );
    }

    // Find and delete report
    const reportIndex = mockReports.findIndex(r => r.id === reportId);
    if (reportIndex === -1) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const deletedReport = mockReports.splice(reportIndex, 1)[0];

    return NextResponse.json({
      message: '신고가 삭제되었습니다.',
      data: deletedReport,
    });

  } catch (error) {
    console.error('Failed to delete report:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}
