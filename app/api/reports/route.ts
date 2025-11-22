import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// Mock reports storage (in real app, use database)
const mockReports: any[] = [];

const createReportSchema = z.object({
  type: z.enum(['post', 'comment']),
  targetId: z.string(),
  reason: z.enum(['spam', 'harassment', 'inappropriate', 'misinformation', 'other']),
  description: z.string().max(500).optional(),
});

/**
 * POST /api/reports
 * Create a new report
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

    const body = await request.json();
    const { type, targetId, reason, description } = createReportSchema.parse(body);

    // Check if user already reported this content
    const existingReport = mockReports.find(
      r => r.reporterId === session.user.id && r.targetId === targetId && r.type === type
    );

    if (existingReport) {
      return NextResponse.json(
        { error: '이미 신고한 콘텐츠입니다.' },
        { status: 400 }
      );
    }

    // Create report
    const newReport = {
      id: `report-${Date.now()}`,
      type,
      targetId,
      reporterId: session.user.id,
      reason,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockReports.push(newReport);

    return NextResponse.json({
      message: '신고가 접수되었습니다. 검토 후 조치하겠습니다.',
      data: newReport,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Failed to create report:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reports
 * Get user's reports (for logged-in users)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      );
    }

    // Get reports by this user
    const userReports = mockReports.filter(r => r.reporterId === session.user.id);

    // Sort by creation date (newest first)
    userReports.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      data: userReports,
    });

  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
