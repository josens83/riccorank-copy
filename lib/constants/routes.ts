/**
 * Route Constants
 *
 * Centralized route definitions to prevent magic strings and enable type-safe navigation.
 */

export const ROUTES = {
  // Public Routes
  HOME: '/',
  STOCKS: '/stocklist',
  NEWS: '/news',
  SEARCH: '/search',
  STOCKBOARD: '/stockboard',
  STOCKBOARD_DETAIL: (id: string) => `/stockboard/${id}`,

  // Auth Routes
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',

  // User Dashboard
  MYPAGE: '/mypage',
  MYPAGE_EDIT: '/mypage/edit',
  SUBSCRIBE: '/subscribe',

  // Admin
  ADMIN: '/admin',

  // Content Creation
  STOCKBOARD_WRITE: '/stockboard/write',

  // Legal
  TERMS: '/terms',
  PRIVACY: '/privacy',

  // API Routes
  API: {
    // Auth
    AUTH: '/api/auth',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',

    // Stocks
    STOCKS: '/api/stocks',
    STOCK_DETAIL: (symbol: string) => `/api/stocks/${symbol}`,
    MARKET_INDICES: '/api/market-indices',

    // News
    NEWS: '/api/news',
    NEWS_DETAIL: (id: string) => `/api/news/${id}`,

    // Posts
    POSTS: '/api/posts',
    POST_DETAIL: (id: string) => `/api/posts/${id}`,

    // Comments
    COMMENTS: '/api/comments',
    COMMENT_DETAIL: (id: string) => `/api/comments/${id}`,

    // Social
    LIKES: '/api/likes',
    BOOKMARKS: '/api/bookmarks',
    REPORTS: '/api/reports',

    // Notifications
    NOTIFICATIONS: '/api/notifications',

    // User
    USER_PROFILE: '/api/user/profile',

    // Payments
    PAYMENTS: '/api/payments',
    PAYMENTS_VERIFY: '/api/payments/verify',
    PAYMENTS_CANCEL: '/api/payments/cancel',

    // Admin
    ADMIN: {
      USERS: '/api/admin/users',
      POSTS: '/api/admin/posts',
      COMMENTS: '/api/admin/comments',
      REPORTS: '/api/admin/reports',
      STATS: '/api/admin/stats',
    },
  },
} as const;

// Route Groups (for middleware and layout organization)
export const ROUTE_GROUPS = {
  PUBLIC: [
    ROUTES.HOME,
    ROUTES.STOCKS,
    ROUTES.NEWS,
    ROUTES.SEARCH,
    ROUTES.STOCKBOARD,
    ROUTES.TERMS,
    ROUTES.PRIVACY,
  ],
  AUTH: [
    ROUTES.LOGIN,
    ROUTES.SIGNUP,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.RESET_PASSWORD,
    ROUTES.VERIFY_EMAIL,
  ],
  PROTECTED: [
    ROUTES.MYPAGE,
    ROUTES.MYPAGE_EDIT,
    ROUTES.SUBSCRIBE,
    ROUTES.STOCKBOARD_WRITE,
  ],
  ADMIN: [
    ROUTES.ADMIN,
  ],
} as const;

// Helper function to check if a route is protected
export function isProtectedRoute(pathname: string): boolean {
  return ROUTE_GROUPS.PROTECTED.some(route => pathname.startsWith(route)) ||
         ROUTE_GROUPS.ADMIN.some(route => pathname.startsWith(route));
}

// Helper function to check if a route is admin-only
export function isAdminRoute(pathname: string): boolean {
  return ROUTE_GROUPS.ADMIN.some(route => pathname.startsWith(route));
}

// Helper function to check if a route is auth page
export function isAuthRoute(pathname: string): boolean {
  return ROUTE_GROUPS.AUTH.some(route => pathname.startsWith(route));
}
