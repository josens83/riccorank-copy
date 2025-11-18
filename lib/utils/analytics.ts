/**
 * Google Analytics integration
 */

// Google Analytics Measurement ID
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Check if GA is enabled
export const isGAEnabled = () => {
  return GA_MEASUREMENT_ID && process.env.NODE_ENV === 'production';
};

// Initialize Google Analytics
export const initGA = () => {
  if (!isGAEnabled()) return;

  // Load gtag.js script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  // Initialize gtag
  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}', {
      page_path: window.location.pathname,
    });
  `;
  document.head.appendChild(script2);
};

// Page view tracking
export const pageview = (url: string) => {
  if (!isGAEnabled()) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// Event tracking
export const event = (action: string, params?: Record<string, any>) => {
  if (!isGAEnabled()) return;

  window.gtag('event', action, params);
};

// Custom events
export const trackSignup = (method: 'email' | 'google') => {
  event('sign_up', {
    method,
  });
};

export const trackLogin = (method: 'email' | 'google') => {
  event('login', {
    method,
  });
};

export const trackSearch = (searchTerm: string) => {
  event('search', {
    search_term: searchTerm,
  });
};

export const trackShare = (contentType: string, contentId: string) => {
  event('share', {
    content_type: contentType,
    content_id: contentId,
  });
};

export const trackPostCreate = (category: string) => {
  event('post_create', {
    category,
  });
};

export const trackCommentCreate = (postId: string) => {
  event('comment_create', {
    post_id: postId,
  });
};

export const trackLike = (contentType: string, contentId: string) => {
  event('like', {
    content_type: contentType,
    content_id: contentId,
  });
};

export const trackBookmark = (postId: string) => {
  event('bookmark', {
    post_id: postId,
  });
};

// E-commerce events (for future paid features)
export const trackPurchase = (transactionId: string, value: number, currency: string = 'KRW') => {
  event('purchase', {
    transaction_id: transactionId,
    value,
    currency,
  });
};

export const trackBeginCheckout = (value: number, currency: string = 'KRW') => {
  event('begin_checkout', {
    value,
    currency,
  });
};

// Exception tracking
export const trackException = (description: string, fatal: boolean = false) => {
  event('exception', {
    description,
    fatal,
  });
};

// Timing tracking
export const trackTiming = (category: string, variable: string, value: number, label?: string) => {
  event('timing_complete', {
    name: variable,
    value,
    event_category: category,
    event_label: label,
  });
};

// Declare gtag type
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}
