import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  // Adjust this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Set profilesSampleRate to 1.0 to profile every transaction.
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  environment: process.env.NODE_ENV,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  beforeSend(event) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },

  // Ignore specific errors
  ignoreErrors: [
    'ENOENT',
    'ECONNREFUSED',
    'ETIMEDOUT',
    // Database connection errors (already logged elsewhere)
    'PrismaClientKnownRequestError',
    // NextAuth errors that are expected
    'NEXT_NOT_FOUND',
  ],
});
