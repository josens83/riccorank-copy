import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { featureFlags, isFeatureEnabled } from '@/lib/feature-flags';
import { log } from '@/lib/logger';

/**
 * GET /api/feature-flags
 * Get all feature flags for current user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const context = session?.user
      ? {
          userId: session.user.id,
          userRole: session.user.role || 'user',
          userPlan: 'basic', // TODO: Get from subscription
        }
      : undefined;

    const allFlags = await featureFlags.getAllFlags();
    const result: Record<string, boolean> = {};

    // Check each flag for the current user
    for (const [name] of Object.entries(allFlags)) {
      result[name] = await isFeatureEnabled(name, context);
    }

    return NextResponse.json({
      flags: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log.error('Get feature flags error', error as Error);
    return NextResponse.json(
      { error: 'Failed to get feature flags' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/feature-flags
 * Check specific feature flag
 */
export async function POST(req: NextRequest) {
  try {
    const { flagName } = await req.json();

    if (!flagName) {
      return NextResponse.json(
        { error: 'flagName is required' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const context = session?.user
      ? {
          userId: session.user.id,
          userRole: session.user.role || 'user',
          userPlan: 'basic',
        }
      : undefined;

    const enabled = await isFeatureEnabled(flagName, context);

    return NextResponse.json({
      flagName,
      enabled,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log.error('Check feature flag error', error as Error);
    return NextResponse.json(
      { error: 'Failed to check feature flag' },
      { status: 500 }
    );
  }
}
