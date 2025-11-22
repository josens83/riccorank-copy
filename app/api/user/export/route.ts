import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { exportUserData, toCSV } from '@/lib/data-export';
import { log } from '@/lib/logger';

/**
 * GET /api/user/export
 * Export all user data (GDPR Data Portability)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const format = req.nextUrl.searchParams.get('format') || 'json';
    const userId = session.user.id;

    const data = await exportUserData(userId);

    // Log for audit
    log.info('User data exported', {
      userId,
      format,
      timestamp: new Date().toISOString(),
    });

    if (format === 'csv') {
      // For CSV, we'll export a simplified version
      const csvData = {
        posts: toCSV(data.posts),
        comments: toCSV(data.comments),
      };

      return new NextResponse(
        JSON.stringify(csvData, null, 2),
        {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="rankup_data_${userId}_${Date.now()}.json"`,
          },
        }
      );
    }

    return new NextResponse(
      JSON.stringify(data, null, 2),
      {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="rankup_data_${userId}_${Date.now()}.json"`,
        },
      }
    );
  } catch (error) {
    log.error('Export user data error', error as Error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
