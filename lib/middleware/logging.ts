import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/logger';

/**
 * Logging middleware for API routes
 * Logs request/response details with structured data
 */
export async function withLogging(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  // Log incoming request
  log.info('Incoming request', {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.headers.get('user-agent'),
    ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
  });

  try {
    // Execute handler
    const response = await handler(req);

    // Calculate duration
    const duration = Date.now() - startTime;

    // Log successful response
    log.info('Request completed', {
      requestId,
      method: req.method,
      url: req.url,
      status: response.status,
      duration,
    });

    // Add request ID to response headers
    response.headers.set('x-request-id', requestId);

    return response;
  } catch (error) {
    // Calculate duration
    const duration = Date.now() - startTime;

    // Log error
    log.error('Request failed', error, {
      requestId,
      method: req.method,
      url: req.url,
      duration,
    });

    // Re-throw error to be handled by error boundary
    throw error;
  }
}

/**
 * Log database queries (for debugging)
 */
export function logDatabaseQuery(
  query: string,
  params?: any[],
  duration?: number
) {
  if (process.env.LOG_LEVEL === 'debug') {
    log.debug('Database query', {
      query,
      params,
      duration,
    });
  }
}

/**
 * Log external API calls
 */
export function logExternalApiCall(
  service: string,
  endpoint: string,
  method: string,
  duration: number,
  status?: number
) {
  log.info('External API call', {
    service,
    endpoint,
    method,
    duration,
    status,
  });
}

/**
 * Log user actions for audit trail
 */
export function logUserAction(
  userId: string,
  action: string,
  resource?: string,
  metadata?: object
) {
  log.info('User action', {
    userId,
    action,
    resource,
    ...metadata,
  });
}

/**
 * Log authentication events
 */
export function logAuthEvent(
  event: 'login' | 'logout' | 'signup' | 'failed_login' | 'password_reset',
  userId?: string,
  email?: string,
  metadata?: object
) {
  log.info(`Auth: ${event}`, {
    event,
    userId,
    email,
    ...metadata,
  });
}

/**
 * Log payment events
 */
export function logPaymentEvent(
  event: 'payment_initiated' | 'payment_completed' | 'payment_failed' | 'refund',
  userId: string,
  amount: number,
  currency: string,
  metadata?: object
) {
  log.info(`Payment: ${event}`, {
    event,
    userId,
    amount,
    currency,
    ...metadata,
  });
}

/**
 * Log security events
 */
export function logSecurityEvent(
  event: 'rate_limit_exceeded' | 'suspicious_activity' | 'blocked_ip' | 'csrf_validation_failed',
  metadata?: object
) {
  log.warn(`Security: ${event}`, {
    event,
    ...metadata,
  });
}
