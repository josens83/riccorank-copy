import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { abTestManager } from '@/lib/analytics/ab-testing';

/**
 * GET /api/ab-test?testId=xxx
 * A/B 테스트 변형 할당
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || `guest-${Date.now()}`;

    const searchParams = request.nextUrl.searchParams;
    const testId = searchParams.get('testId');

    if (!testId) {
      // 모든 활성 테스트 반환
      const activeTests = abTestManager.getActiveTests();
      return NextResponse.json({
        success: true,
        data: activeTests.map((test) => ({
          id: test.id,
          name: test.name,
          description: test.description,
        })),
      });
    }

    // 변형 할당
    const variantId = abTestManager.assignVariant(testId, userId);
    if (!variantId) {
      return NextResponse.json(
        { error: 'Test not found or not active' },
        { status: 404 }
      );
    }

    const config = abTestManager.getVariantConfig(testId, userId);

    return NextResponse.json({
      success: true,
      data: {
        testId,
        variantId,
        config,
      },
    });
  } catch (error) {
    console.error('AB test error:', error);
    return NextResponse.json({ error: 'Failed to assign variant' }, { status: 500 });
  }
}

/**
 * POST /api/ab-test/track
 * A/B 테스트 결과 기록
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || `guest-${Date.now()}`;

    const body = await request.json();
    const { testId, variantId, metrics } = body;

    if (!testId || !variantId) {
      return NextResponse.json(
        { error: 'Missing required fields: testId, variantId' },
        { status: 400 }
      );
    }

    abTestManager.trackResult({
      testId,
      variantId,
      userId,
      timestamp: new Date(),
      metrics: metrics || {},
    });

    return NextResponse.json({
      success: true,
      message: 'Result tracked successfully',
    });
  } catch (error) {
    console.error('AB test tracking error:', error);
    return NextResponse.json({ error: 'Failed to track result' }, { status: 500 });
  }
}
