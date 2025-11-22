import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { webhooks, WebhookEvent } from '@/lib/webhooks';
import { log } from '@/lib/logger';

/**
 * POST /api/webhooks
 * Create a new webhook endpoint
 */
export async function POST(req: NextRequest) {
  try {
    const session = await await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { url, events } = await req.json();

    if (!url || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'url and events are required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }

    // Validate events
    const validEvents: WebhookEvent[] = [
      'user.created',
      'user.updated',
      'user.deleted',
      'subscription.created',
      'subscription.updated',
      'subscription.cancelled',
      'payment.completed',
      'payment.failed',
      'post.created',
      'post.updated',
      'post.deleted',
      'comment.created',
      'stock.alert',
    ];

    const invalidEvents = events.filter((e: string) => !validEvents.includes(e as WebhookEvent));
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: `Invalid events: ${invalidEvents.join(', ')}` },
        { status: 400 }
      );
    }

    const endpoint = await webhooks.createEndpoint(url, events as WebhookEvent[]);

    log.info('Webhook endpoint created', {
      userId: session.user.id,
      url,
      events,
    });

    return NextResponse.json({
      id: endpoint.id,
      url: endpoint.url,
      secret: endpoint.secret, // Only shown once!
      events: endpoint.events,
      active: endpoint.active,
      createdAt: endpoint.createdAt.toISOString(),
      message: 'Save the secret - it will not be shown again!',
    });
  } catch (error) {
    log.error('Create webhook error', error as Error);
    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks
 * Get available webhook events
 */
export async function GET(req: NextRequest) {
  try {
    const session = await await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const events = [
      {
        name: 'user.created',
        description: '새 사용자 생성',
        payload: { userId: 'string', email: 'string', name: 'string?' },
      },
      {
        name: 'user.updated',
        description: '사용자 정보 수정',
        payload: { userId: 'string', changes: 'object' },
      },
      {
        name: 'subscription.created',
        description: '구독 생성',
        payload: { subscriptionId: 'string', userId: 'string', planId: 'string' },
      },
      {
        name: 'subscription.cancelled',
        description: '구독 취소',
        payload: { subscriptionId: 'string', userId: 'string', reason: 'string?' },
      },
      {
        name: 'payment.completed',
        description: '결제 완료',
        payload: { paymentId: 'string', userId: 'string', amount: 'number' },
      },
      {
        name: 'payment.failed',
        description: '결제 실패',
        payload: { paymentId: 'string', userId: 'string', error: 'string' },
      },
      {
        name: 'stock.alert',
        description: '주식 알림',
        payload: { symbol: 'string', price: 'number', change: 'number' },
      },
    ];

    return NextResponse.json({ events });
  } catch (error) {
    log.error('Get webhook events error', error as Error);
    return NextResponse.json(
      { error: 'Failed to get webhook events' },
      { status: 500 }
    );
  }
}
