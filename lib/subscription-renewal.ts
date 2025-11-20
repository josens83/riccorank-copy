import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { sendAutomatedEmail } from '@/lib/email-automation';
import { sendPaymentWebhook, sendSubscriptionWebhook } from '@/lib/webhooks';

// Subscription renewal service
export interface SubscriptionInfo {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'expired';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  paymentMethodId?: string;
}

/**
 * Process subscription renewals (to be called daily by cron)
 */
export async function processSubscriptionRenewals(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  log.info('Processing subscription renewals');

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // In production, query actual subscription database
  // For now, simulate
  const subscriptions: SubscriptionInfo[] = [];

  let succeeded = 0;
  let failed = 0;

  for (const subscription of subscriptions) {
    try {
      // Skip if cancelled
      if (subscription.cancelAtPeriodEnd) {
        log.info('Subscription set to cancel', { subscriptionId: subscription.id });
        continue;
      }

      // Check if renewal is due
      const daysUntilRenewal = Math.floor(
        (subscription.currentPeriodEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilRenewal > 1) {
        continue; // Not yet due
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: subscription.userId },
        select: { id: true, email: true, name: true },
      });

      if (!user) {
        log.error('User not found for subscription', null, { subscriptionId: subscription.id });
        failed++;
        continue;
      }

      // Calculate new billing period
      const newPeriodStart = new Date(subscription.currentPeriodEnd);
      const newPeriodEnd = new Date(subscription.currentPeriodEnd);

      if (subscription.planId.includes('yearly')) {
        newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
      } else {
        newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
      }

      // Get plan details
      const planAmount = getPlanAmount(subscription.planId);

      try {
        // Process payment (in production, call payment gateway)
        await processPayment({
          userId: subscription.userId,
          amount: planAmount,
          planId: subscription.planId,
          subscriptionId: subscription.id,
        });

        // Update subscription (in production, update database)
        log.info('Subscription renewed', {
          subscriptionId: subscription.id,
          userId: subscription.userId,
          newPeriodEnd,
        });

        // Send renewal email
        await sendAutomatedEmail('subscription_renewed', user.email, {
          name: user.name || '',
          planName: getPlanName(subscription.planId),
          amount: planAmount.toLocaleString(),
          nextBillingDate: newPeriodEnd.toLocaleDateString('ko-KR'),
        });

        // Send webhook
        await sendSubscriptionWebhook('subscription.updated', {
          id: subscription.id,
          userId: subscription.userId,
          planId: subscription.planId,
          status: 'active',
        });

        succeeded++;
      } catch (paymentError) {
        log.error('Payment failed for renewal', paymentError as Error, {
          subscriptionId: subscription.id,
        });

        // Send payment failed email
        await sendAutomatedEmail('payment_failed', user.email, {
          name: user.name || '',
          error: (paymentError as Error).message,
        });

        // Update subscription status to past_due
        // In production, update database

        failed++;
      }
    } catch (error) {
      log.error('Renewal processing error', error as Error);
      failed++;
    }
  }

  log.info('Subscription renewals processed', {
    total: subscriptions.length,
    succeeded,
    failed,
  });

  return {
    processed: subscriptions.length,
    succeeded,
    failed,
  };
}

/**
 * Send renewal reminders (3 days before)
 */
export async function sendRenewalReminders(): Promise<number> {
  log.info('Sending renewal reminders');

  const today = new Date();
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  // In production, query subscriptions expiring in 3 days
  const subscriptions: SubscriptionInfo[] = [];

  let sent = 0;

  for (const subscription of subscriptions) {
    if (subscription.cancelAtPeriodEnd) {
      continue; // Skip cancelled subscriptions
    }

    const daysUntilRenewal = Math.floor(
      (subscription.currentPeriodEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilRenewal !== 3) {
      continue;
    }

    const user = await prisma.user.findUnique({
      where: { id: subscription.userId },
      select: { email: true, name: true },
    });

    if (user) {
      await sendAutomatedEmail('subscription_renewed', user.email, {
        name: user.name || '',
        planName: getPlanName(subscription.planId),
        amount: getPlanAmount(subscription.planId).toLocaleString(),
        nextBillingDate: subscription.currentPeriodEnd.toLocaleDateString('ko-KR'),
      });

      sent++;
    }
  }

  log.info('Renewal reminders sent', { count: sent });
  return sent;
}

/**
 * Process payment (mock implementation)
 */
async function processPayment(data: {
  userId: string;
  amount: number;
  planId: string;
  subscriptionId: string;
}): Promise<void> {
  // In production, call actual payment gateway
  // For now, simulate success

  log.info('Processing payment', data);

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));

  // Send payment webhook
  await sendPaymentWebhook('payment.completed', {
    id: `pay_${Date.now()}`,
    userId: data.userId,
    amount: data.amount,
    currency: 'KRW',
    planId: data.planId,
  });
}

/**
 * Get plan amount by ID
 */
function getPlanAmount(planId: string): number {
  const amounts: Record<string, number> = {
    basic: 9900,
    pro: 29900,
    premium: 99900,
    yearly_pro: 299000,
  };

  return amounts[planId] || 0;
}

/**
 * Get plan name by ID
 */
function getPlanName(planId: string): string {
  const names: Record<string, string> = {
    basic: '베이직',
    pro: '프로',
    premium: '프리미엄',
    yearly_pro: '프로 연간',
  };

  return names[planId] || planId;
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(
  subscriptionId: string,
  userId: string
): Promise<void> {
  log.info('Cancelling subscription', { subscriptionId, userId });

  // In production, update database
  // subscription.cancelAtPeriodEnd = true

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (user) {
    await sendAutomatedEmail('subscription_cancelled', user.email, {
      name: user.name || '',
      endDate: new Date().toLocaleDateString('ko-KR'), // Should be actual end date
    });
  }

  await sendSubscriptionWebhook('subscription.cancelled', {
    id: subscriptionId,
    userId,
    planId: 'unknown', // Should be actual plan
    status: 'cancelled',
  });
}
