import { NextRequest } from 'next/server';

/**
 * Security utilities for the application
 */

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  // Remove control characters
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length
  sanitized = sanitized.substring(0, 10000);

  return sanitized;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): {
  isStrong: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('비밀번호는 최소 8자 이상이어야 합니다');
  } else {
    score += 1;
  }

  if (password.length >= 12) {
    score += 1;
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('소문자를 포함해야 합니다');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('대문자를 포함해야 합니다');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('숫자를 포함해야 합니다');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('특수문자를 포함해야 합니다');
  }

  const isStrong = score >= 4 && password.length >= 8;

  return {
    isStrong,
    score,
    feedback,
  };
}

/**
 * Rate limiter using in-memory storage
 */
class RateLimiter {
  private requests: Map<string, number[]>;
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
    this.requests = new Map();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetAt: Date } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this identifier
    let userRequests = this.requests.get(identifier) || [];

    // Filter out old requests
    userRequests = userRequests.filter((timestamp) => timestamp > windowStart);

    // Check if limit exceeded
    const allowed = userRequests.length < this.maxRequests;

    if (allowed) {
      userRequests.push(now);
      this.requests.set(identifier, userRequests);
    }

    const remaining = Math.max(0, this.maxRequests - userRequests.length);
    const resetAt = new Date(now + this.windowMs);

    return { allowed, remaining, resetAt };
  }

  reset(identifier: string) {
    this.requests.delete(identifier);
  }

  clear() {
    this.requests.clear();
  }
}

// Create rate limiters for different endpoints
export const apiRateLimiter = new RateLimiter(100, 15 * 60 * 1000); // 100 requests per 15 minutes
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 requests per 15 minutes
export const strictRateLimiter = new RateLimiter(10, 60 * 1000); // 10 requests per minute

/**
 * Get client identifier for rate limiting
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers (for proxy/CDN support)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';

  return ip;
}

/**
 * CSRF Token Management
 */
class CSRFTokenManager {
  private tokens: Map<string, { token: string; expiresAt: number }>;
  private tokenLifetime: number;

  constructor(tokenLifetime: number = 60 * 60 * 1000) { // 1 hour
    this.tokens = new Map();
    this.tokenLifetime = tokenLifetime;
  }

  generate(sessionId: string): string {
    const token = this.generateRandomToken();
    const expiresAt = Date.now() + this.tokenLifetime;

    this.tokens.set(sessionId, { token, expiresAt });

    return token;
  }

  verify(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);

    if (!stored) return false;

    if (Date.now() > stored.expiresAt) {
      this.tokens.delete(sessionId);
      return false;
    }

    return stored.token === token;
  }

  private generateRandomToken(): string {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Node.js environment
      const crypto = require('crypto');
      crypto.randomFillSync(array);
    }
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  clear() {
    this.tokens.clear();
  }
}

export const csrfTokenManager = new CSRFTokenManager();

/**
 * SQL Injection prevention
 */
export function escapeSqlString(input: string): string {
  return input.replace(/'/g, "''");
}

/**
 * Path traversal prevention
 */
export function isPathSafe(path: string): boolean {
  // Check for path traversal patterns
  const dangerousPatterns = [
    /\.\./,
    /\.\\/,
    /\.\//,
    /~\//,
    /\0/,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(path));
}

/**
 * Content Security Policy (CSP) header value
 */
export const CSP_HEADER = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' https://accounts.google.com",
  "frame-src 'self' https://accounts.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ');

/**
 * Security headers for HTTP responses
 */
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': CSP_HEADER,
};

/**
 * Validate JWT token format (basic check)
 */
export function isValidJwtFormat(token: string): boolean {
  const parts = token.split('.');
  return parts.length === 3;
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.includes(origin) || allowedOrigins.includes('*');
}

/**
 * Generate secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Node.js environment
    const crypto = require('crypto');
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
  }

  return result;
}
