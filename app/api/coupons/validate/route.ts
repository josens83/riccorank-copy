import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { validateCoupon } from '@/lib/promotions';
import { log } from '@/lib/logger';

/**
 * POST /api/coupons/validate
 * Validate a coupon code
 */
export async function POST(req: NextRequest) {
  try {
    const session = await await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { code, amount, planId } = await req.json();

    if (!code || !amount) {
      return NextResponse.json(
        { error: 'code and amount are required' },
        { status: 400 }
      );
    }

    const result = await validateCoupon(
      code,
      amount,
      planId,
      session.user.id
    );

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      discount: result.discount,
      finalPrice: result.finalPrice,
      message: `${result.discount?.toLocaleString()}원 할인이 적용됩니다.`,
    });
  } catch (error) {
    log.error('Validate coupon error', error as Error);
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
