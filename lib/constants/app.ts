/**
 * Application Constants
 *
 * Central location for all app-wide constants.
 */

// App Information
export const APP_NAME = 'RANKUP';
export const APP_DESCRIPTION = '스마트 주식 분석 플랫폼';
export const APP_VERSION = '2.0.0';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Pagination
export const ITEMS_PER_PAGE = 20;
export const DEFAULT_PAGE = 1;
export const MAX_PAGE_SIZE = 100;

// File Upload
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Cache TTL (in milliseconds)
export const CACHE_TTL = {
  STOCKS: 5 * 60 * 1000,          // 5 minutes
  NEWS: 15 * 60 * 1000,           // 15 minutes
  MARKET_INDICES: 2 * 60 * 1000,  // 2 minutes
  USER_PROFILE: 30 * 60 * 1000,   // 30 minutes
  STATIC_DATA: 60 * 60 * 1000,    // 1 hour
} as const;

// API Retry Configuration
export const API_RETRY = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000,      // 1 second
  MAX_DELAY: 10000,         // 10 seconds
  BACKOFF_MULTIPLIER: 2,
} as const;

// Session
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

// Rate Limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000,  // 15 minutes
  MAX_REQUESTS: 100,          // per window
} as const;

// Feature Flags
export const FEATURES = {
  ENABLE_PAYMENTS: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true',
  ENABLE_NOTIFICATIONS: true,
  ENABLE_DARK_MODE: true,
  ENABLE_ANALYTICS: process.env.NODE_ENV === 'production',
  ENABLE_SOCIAL_LOGIN: true,
} as const;

// Social OAuth Providers
export const OAUTH_PROVIDERS = ['google', 'github'] as const;

// Market Hours (KST)
export const MARKET_HOURS = {
  OPEN: { hour: 9, minute: 0 },
  CLOSE: { hour: 15, minute: 30 },
} as const;

// Notification Types
export const NOTIFICATION_TYPES = [
  'comment',
  'like',
  'reply',
  'mention',
  'system',
  'subscription',
  'report',
] as const;

// Post Categories
export const POST_CATEGORIES = [
  'stock',      // 종목 분석
  'market',     // 시장 전망
  'news',       // 뉴스
  'strategy',   // 투자 전략
  'free',       // 자유 게시판
] as const;

// Report Reasons
export const REPORT_REASONS = [
  'spam',
  'harassment',
  'inappropriate',
  'misinformation',
  'other',
] as const;

// User Roles
export const USER_ROLES = ['user', 'admin'] as const;

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    features: ['기본 주식 정보', '제한된 뉴스'],
  },
  BASIC: {
    name: 'Basic',
    price: 9900,
    features: ['모든 주식 정보', '실시간 뉴스', '알림 기능'],
  },
  PRO: {
    name: 'Pro',
    price: 29900,
    features: ['모든 Basic 기능', 'AI 분석', '프리미엄 리포트', '우선 지원'],
  },
} as const;

// Default Meta Tags
export const DEFAULT_META = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  keywords: '주식, 투자, 분석, 종목토론, 실시간뉴스',
  ogImage: '/images/og-image.png',
} as const;
