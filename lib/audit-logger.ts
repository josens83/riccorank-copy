/**
 * Audit Logging System
 * 
 * Track all important user actions for security and compliance
 */

import { prisma } from './prisma';

export type AuditAction =
  | 'user.login'
  | 'user.logout'
  | 'user.register'
  | 'user.delete'
  | 'user.update'
  | 'post.create'
  | 'post.update'
  | 'post.delete'
  | 'comment.create'
  | 'comment.delete'
  | 'payment.create'
  | 'payment.cancel'
  | 'subscription.create'
  | 'subscription.cancel'
  | 'admin.action'
  | 'security.violation';

export interface AuditLogData {
  userId?: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
}

/**
 * Create audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    // In production, you would save to database
    // For now, we'll use console logging with structured format
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId: data.userId || 'anonymous',
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      details: data.details,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      status: data.status,
      errorMessage: data.errorMessage,
    };

    // Log to console (in production, save to database or external service)
    console.log('[AUDIT]', JSON.stringify(logEntry));

    // Optionally save to database
    // await prisma.auditLog.create({ data: logEntry });

    // For critical actions, you might want to send alerts
    if (data.action === 'security.violation' || data.status === 'failure') {
      await sendSecurityAlert(logEntry);
    }
  } catch (error) {
    // Never let audit logging break the main flow
    console.error('[AUDIT ERROR]', error);
  }
}

/**
 * Send security alert for critical actions
 */
async function sendSecurityAlert(logEntry: any): Promise<void> {
  // In production: send to security monitoring system (Sentry, DataDog, etc.)
  console.error('[SECURITY ALERT]', logEntry);
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    action?: AuditAction;
  } = {}
): Promise<any[]> {
  const { limit = 50, offset = 0, action } = options;

  // In production, query from database
  // return await prisma.auditLog.findMany({
  //   where: { userId, ...(action && { action }) },
  //   take: limit,
  //   skip: offset,
  //   orderBy: { createdAt: 'desc' },
  // });

  return [];
}

/**
 * Detect suspicious activity
 */
export async function detectSuspiciousActivity(userId: string): Promise<{
  suspicious: boolean;
  reason?: string;
}> {
  try {
    // Check for rapid repeated actions
    const recentLogs = await getUserAuditLogs(userId, { limit: 10 });
    
    // Example: Check for more than 5 failed login attempts in 5 minutes
    const failedLogins = recentLogs.filter(
      log => log.action === 'user.login' && log.status === 'failure'
    );

    if (failedLogins.length >= 5) {
      return {
        suspicious: true,
        reason: 'Multiple failed login attempts detected',
      };
    }

    return { suspicious: false };
  } catch (error) {
    console.error('[AUDIT] Error detecting suspicious activity:', error);
    return { suspicious: false };
  }
}

/**
 * Middleware to extract request metadata
 */
export function getRequestMetadata(request: Request): {
  ipAddress: string;
  userAgent: string;
} {
  return {
    ipAddress: request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  };
}
