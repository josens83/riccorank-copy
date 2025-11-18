/**
 * Performance monitoring utilities
 */

/**
 * Measure page load performance
 */
export function measurePageLoad() {
  if (typeof window === 'undefined') return null;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  if (!navigation) return null;

  return {
    // DNS lookup time
    dnsTime: navigation.domainLookupEnd - navigation.domainLookupStart,

    // TCP connection time
    tcpTime: navigation.connectEnd - navigation.connectStart,

    // Time to First Byte (TTFB)
    ttfb: navigation.responseStart - navigation.requestStart,

    // Download time
    downloadTime: navigation.responseEnd - navigation.responseStart,

    // DOM processing time
    domProcessingTime: navigation.domComplete - navigation.domInteractive,

    // Page load time
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,

    // Total time
    totalTime: navigation.loadEventEnd - navigation.fetchStart,
  };
}

/**
 * Measure component render time
 */
export function measureRender(componentName: string, callback: () => void) {
  if (typeof window === 'undefined') {
    callback();
    return;
  }

  const startTime = performance.now();
  callback();
  const endTime = performance.now();

  const renderTime = endTime - startTime;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
  }

  return renderTime;
}

/**
 * Report Web Vitals
 */
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
    });
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // Example: Send to Google Analytics
    // window.gtag?.('event', metric.name, {
    //   value: Math.round(metric.value),
    //   event_label: metric.id,
    //   non_interaction: true,
    // });
  }
}

/**
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImage(img: HTMLImageElement) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target as HTMLImageElement;
          if (lazyImage.dataset.src) {
            lazyImage.src = lazyImage.dataset.src;
            lazyImage.classList.remove('lazy');
            observer.unobserve(lazyImage);
          }
        }
      });
    });

    observer.observe(img);
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    if (img.dataset.src) {
      img.src = img.dataset.src;
    }
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Prefetch data for better performance
 */
export function prefetchData(url: string) {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Preload critical resources
 */
export function preloadResource(url: string, as: 'script' | 'style' | 'font' | 'image') {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = as;

  if (as === 'font') {
    link.crossOrigin = 'anonymous';
  }

  document.head.appendChild(link);
}

/**
 * Cache manager for API responses
 */
class CacheManager {
  private cache: Map<string, { data: any; timestamp: number }>;
  private ttl: number;

  constructor(ttl: number = 5 * 60 * 1000) { // Default 5 minutes
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);

    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }
}

export const apiCache = new CacheManager();

/**
 * Monitor bundle size
 */
export function logBundleSize() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  let totalSize = 0;
  const resourcesByType: Record<string, number> = {};

  resources.forEach((resource) => {
    const size = resource.transferSize || 0;
    totalSize += size;

    const type = resource.initiatorType || 'other';
    resourcesByType[type] = (resourcesByType[type] || 0) + size;
  });

  console.group('[Bundle Size Analysis]');
  console.log('Total:', (totalSize / 1024).toFixed(2), 'KB');
  console.log('By Type:',
    Object.entries(resourcesByType)
      .map(([type, size]) => `${type}: ${(size / 1024).toFixed(2)}KB`)
      .join(', ')
  );
  console.groupEnd();
}
