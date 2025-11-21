import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { authConfig } from '@/lib/auth.config';
import { cancelPayment } from '@/lib/external/payment';
import { z } from 'zod';

const cancelPaymentSchema = z.object({
  imp_uid: z.string(),
  reason: z.string(),
  amount: z.number().optional(),
});

/**
 * POST /api/payments/cancel
 * Cancel/Refund payment
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { imp_uid, reason, amount } = cancelPaymentSchema.parse(body);

    // In real app, verify that this payment belongs to the user

    // Cancel payment with Iamport
    try {
      const cancelData = await cancelPayment(imp_uid, reason, amount);

      // In real app, update database:
      // - Update subscription status
      // - Create refund transaction record
      // - Update user's subscription end date

      console.log('='.repeat(80));
      console.log('PAYMENT CANCELLED (Development Mode)');
      console.log('='.repeat(80));
      console.log(`User ID: ${session.user.id}`);
      console.log(`Email: ${session.user.email}`);
      console.log(`IMP UID: ${imp_uid}`);
      console.log(`Reason: ${reason}`);
      console.log(`Refund Amount: ${amount || 'Full refund'}원`);
      console.log('='.repeat(80));

      return NextResponse.json({
        message: '결제가 취소되었습니다.',
        data: cancelData,
      });

    } catch (cancelError: any) {
      console.error('Payment cancellation failed:', cancelError);
      return NextResponse.json(
        { error: cancelError.message || '결제 취소에 실패했습니다.' },
        { status: 400 }
      );
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Payment cancellation error:', error);
    return NextResponse.json(
      { error: '결제 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
