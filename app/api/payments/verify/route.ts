import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { verifyPayment } from '@/lib/payment';
import { z } from 'zod';

const verifyPaymentSchema = z.object({
  imp_uid: z.string(),
  merchant_uid: z.string(),
  amount: z.number(),
  planId: z.string(),
});

/**
 * POST /api/payments/verify
 * Verify payment and activate subscription
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
    const { imp_uid, merchant_uid, amount, planId } = verifyPaymentSchema.parse(body);

    // Verify payment with Iamport
    try {
      const paymentData = await verifyPayment(imp_uid);

      // Verify amount matches
      if (paymentData.amount !== amount) {
        return NextResponse.json(
          { error: '결제 금액이 일치하지 않습니다.' },
          { status: 400 }
        );
      }

      // Verify merchant_uid matches
      if (paymentData.merchant_uid !== merchant_uid) {
        return NextResponse.json(
          { error: '주문 번호가 일치하지 않습니다.' },
          { status: 400 }
        );
      }

      // Check payment status
      if (paymentData.status !== 'paid') {
        return NextResponse.json(
          { error: '결제가 완료되지 않았습니다.' },
          { status: 400 }
        );
      }

      // In real app, save to database:
      // - Create subscription record
      // - Update user's subscription status
      // - Set subscription end date
      // - Create payment transaction record

      console.log('='.repeat(80));
      console.log('PAYMENT VERIFIED (Development Mode)');
      console.log('='.repeat(80));
      console.log(`User ID: ${session.user.id}`);
      console.log(`Email: ${session.user.email}`);
      console.log(`Plan ID: ${planId}`);
      console.log(`Amount: ${amount}원`);
      console.log(`IMP UID: ${imp_uid}`);
      console.log(`Merchant UID: ${merchant_uid}`);
      console.log(`Payment Method: ${paymentData.pay_method}`);
      console.log(`Paid At: ${new Date(paymentData.paid_at * 1000).toLocaleString('ko-KR')}`);
      console.log('='.repeat(80));

      return NextResponse.json({
        message: '결제가 완료되었습니다.',
        data: {
          subscriptionId: `SUB_${Date.now()}`,
          planId,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        },
      });

    } catch (verifyError) {
      console.error('Payment verification failed:', verifyError);
      return NextResponse.json(
        { error: '결제 검증에 실패했습니다.' },
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

    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: '결제 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
