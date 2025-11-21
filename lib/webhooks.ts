import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

// Webhook event types
export type WebhookEvent =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.cancelled'
  | 'payment.completed'
  | 'payment.failed'
  | 'post.created'
  | 'post.updated'
  | 'post.deleted'
  | 'comment.created'
  | 'stock.alert';

// Webhook payload structure
export interface WebhookPayload {
  id: string;
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

// Webhook endpoint configuration
export interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string;
  events: WebhookEvent[];
  active: boolean;
  createdAt: Date;
}

// Webhook service
class WebhookService {
  /**
   * Send webhook to all registered endpoints
   */
  async send(event: WebhookEvent, data: Record<string, unknown>): Promise<void> {
    try {
      const endpoints = await this.getActiveEndpoints(event);

      if (endpoints.length === 0) {
        log.debug('No webhook endpoints for event', { event });
        return;
      }

      const payload: WebhookPayload = {
        id: `whk_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
        event,
        timestamp: new Date().toISOString(),
        data,
      };

      // Send to all endpoints in parallel
      const results = await Promise.allSettled(
        endpoints.map((endpoint) => this.sendToEndpoint(endpoint, payload))
      );

      // Log results
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          log.error('Webhook delivery failed', result.reason as Error, {
            endpoint: endpoints[index].url,
            event,
          });
        }
      });

      log.info('Webhooks sent', {
        event,
        endpoints: endpoints.length,
        success: results.filter((r) => r.status === 'fulfilled').length,
      });
    } catch (error) {
      log.error('Webhook send error', error as Error, { event });
    }
  }

  /**
   * Send webhook to a specific endpoint
   */
  private async sendToEndpoint(
    endpoint: WebhookEndpoint,
    payload: WebhookPayload
  ): Promise<void> {
    const body = JSON.stringify(payload);
    const signature = this.generateSignature(body, endpoint.secret);

    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-ID': payload.id,
        'X-Webhook-Signature': signature,
        'X-Webhook-Timestamp': payload.timestamp,
        'User-Agent': 'RANKUP-Webhooks/1.0',
      },
      body,
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    log.debug('Webhook delivered', {
      endpoint: endpoint.url,
      event: payload.event,
      status: response.status,
    });
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  generateSignature(payload: string, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    return `sha256=${hmac.digest('hex')}`;
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expected = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  }

  /**
   * Get active endpoints for an event
   */
  private async getActiveEndpoints(event: WebhookEvent): Promise<WebhookEndpoint[]> {
    // In production, this would query the database
    // For now, return from environment or config
    const endpoints: WebhookEndpoint[] = [];

    // Example: Load from environment
    const webhookUrl = process.env.WEBHOOK_URL;
    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (webhookUrl && webhookSecret) {
      endpoints.push({
        id: 'default',
        url: webhookUrl,
        secret: webhookSecret,
        events: [
          'user.created',
          'subscription.created',
          'payment.completed',
          'payment.failed',
        ],
        active: true,
        createdAt: new Date(),
      });
    }

    return endpoints.filter(
      (ep) => ep.active && ep.events.includes(event)
    );
  }

  /**
   * Create a new webhook endpoint
   */
  async createEndpoint(
    url: string,
    events: WebhookEvent[]
  ): Promise<WebhookEndpoint> {
    const secret = crypto.randomBytes(32).toString('hex');
    const endpoint: WebhookEndpoint = {
      id: `we_${crypto.randomBytes(8).toString('hex')}`,
      url,
      secret,
      events,
      active: true,
      createdAt: new Date(),
    };

    // In production, save to database
    log.info('Webhook endpoint created', { url, events });

    return endpoint;
  }

  /**
   * Test webhook endpoint
   */
  async testEndpoint(endpoint: WebhookEndpoint): Promise<boolean> {
    try {
      const testPayload: WebhookPayload = {
        id: `whk_test_${Date.now()}`,
        event: 'user.created',
        timestamp: new Date().toISOString(),
        data: { test: true, message: 'Webhook test from RANKUP' },
      };

      await this.sendToEndpoint(endpoint, testPayload);
      return true;
    } catch (error) {
      log.error('Webhook test failed', error as Error, { url: endpoint.url });
      return false;
    }
  }
}

// Export singleton
export const webhooks = new WebhookService();

// Helper functions for common events
export async function sendUserCreatedWebhook(user: {
  id: string;
  email: string;
  name?: string;
}): Promise<void> {
  await webhooks.send('user.created', {
    userId: user.id,
    email: user.email,
    name: user.name,
  });
}

export async function sendPaymentWebhook(
  event: 'payment.completed' | 'payment.failed',
  payment: {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    planId: string;
  }
): Promise<void> {
  await webhooks.send(event, {
    paymentId: payment.id,
    userId: payment.userId,
    amount: payment.amount,
    currency: payment.currency,
    planId: payment.planId,
  });
}

export async function sendSubscriptionWebhook(
  event: 'subscription.created' | 'subscription.updated' | 'subscription.cancelled',
  subscription: {
    id: string;
    userId: string;
    planId: string;
    status: string;
  }
): Promise<void> {
  await webhooks.send(event, {
    subscriptionId: subscription.id,
    userId: subscription.userId,
    planId: subscription.planId,
    status: subscription.status,
  });
}
