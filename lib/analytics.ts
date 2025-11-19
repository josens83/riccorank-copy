import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel
export function initMixpanel() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
    mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
      debug: process.env.NODE_ENV === 'development',
      track_pageview: true,
      persistence: 'localStorage',
    });
  }
}

// Analytics wrapper
export const analytics = {
  // Track an event
  track: (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
      mixpanel.track(eventName, properties);
    }
  },

  // Identify a user
  identify: (userId: string) => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
      mixpanel.identify(userId);
    }
  },

  // Set user properties
  setUserProperties: (properties: Record<string, any>) => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
      mixpanel.people.set(properties);
    }
  },

  // Track page view
  trackPageView: (pageName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
      mixpanel.track_pageview({
        page: pageName,
        ...properties,
      });
    }
  },

  // Reset user (on logout)
  reset: () => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
      mixpanel.reset();
    }
  },

  // Track link click
  trackLink: (element: HTMLElement, eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
      mixpanel.track_links(element, eventName, properties);
    }
  },
};

// Common event names
export const AnalyticsEvents = {
  // Authentication
  USER_SIGNED_UP: 'User Signed Up',
  USER_LOGGED_IN: 'User Logged In',
  USER_LOGGED_OUT: 'User Logged Out',

  // Subscription
  SUBSCRIPTION_STARTED: 'Subscription Started',
  SUBSCRIPTION_UPGRADED: 'Subscription Upgraded',
  SUBSCRIPTION_CANCELED: 'Subscription Canceled',
  PAYMENT_COMPLETED: 'Payment Completed',

  // Content
  POST_CREATED: 'Post Created',
  POST_VIEWED: 'Post Viewed',
  POST_LIKED: 'Post Liked',
  COMMENT_CREATED: 'Comment Created',

  // Stock
  STOCK_VIEWED: 'Stock Viewed',
  STOCK_BOOKMARKED: 'Stock Bookmarked',

  // News
  NEWS_VIEWED: 'News Viewed',
  NEWS_CLICKED: 'News Clicked',

  // Search
  SEARCH_PERFORMED: 'Search Performed',

  // Navigation
  PAGE_VIEWED: 'Page Viewed',
} as const;
