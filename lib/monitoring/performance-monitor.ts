/**
 * Performance Monitoring Utilities
 * 웹 성능 지표 측정 및 모니터링
 */

export interface PerformanceMetrics {
  // Core Web Vitals
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte

  // Custom Metrics
  loadTime?: number;
  domReady?: number;
  apiResponseTime?: number;
  componentRenderTime?: number;
}

export interface PerformanceReport {
  timestamp: Date;
  url: string;
  userAgent: string;
  metrics: PerformanceMetrics;
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

/**
 * Web Vitals 측정 (클라이언트 사이드)
 */
export class WebVitalsMonitor {
  private metrics: PerformanceMetrics = {};

  /**
   * 모든 Web Vitals 측정 시작
   */
  measureAll(): void {
    if (typeof window === 'undefined') return;

    this.measureFCP();
    this.measureLCP();
    this.measureFID();
    this.measureCLS();
    this.measureTTFB();
    this.measureCustomMetrics();
  }

  /**
   * First Contentful Paint (FCP)
   */
  private measureFCP(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.metrics.FCP = fcpEntry.startTime;
        this.reportMetric('FCP', fcpEntry.startTime);
      }
    });

    observer.observe({ entryTypes: ['paint'] });
  }

  /**
   * Largest Contentful Paint (LCP)
   */
  private measureLCP(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        renderTime?: number;
        loadTime?: number;
      };

      this.metrics.LCP = lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime;
      this.reportMetric('LCP', this.metrics.LCP);
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  /**
   * First Input Delay (FID)
   */
  private measureFID(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.metrics.FID = entry.processingStart - entry.startTime;
        this.reportMetric('FID', this.metrics.FID);
      });
    });

    observer.observe({ entryTypes: ['first-input'] });
  }

  /**
   * Cumulative Layout Shift (CLS)
   */
  private measureCLS(): void {
    let clsValue = 0;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.metrics.CLS = clsValue;
          this.reportMetric('CLS', clsValue);
        }
      });
    });

    observer.observe({ entryTypes: ['layout-shift'] });
  }

  /**
   * Time to First Byte (TTFB)
   */
  private measureTTFB(): void {
    const navigationEntry = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;

    if (navigationEntry) {
      this.metrics.TTFB = navigationEntry.responseStart - navigationEntry.requestStart;
      this.reportMetric('TTFB', this.metrics.TTFB);
    }
  }

  /**
   * 커스텀 메트릭
   */
  private measureCustomMetrics(): void {
    window.addEventListener('load', () => {
      const navigationEntry = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      if (navigationEntry) {
        this.metrics.loadTime = navigationEntry.loadEventEnd - navigationEntry.fetchStart;
        this.metrics.domReady =
          navigationEntry.domContentLoadedEventEnd - navigationEntry.fetchStart;

        this.reportMetric('LoadTime', this.metrics.loadTime);
        this.reportMetric('DOMReady', this.metrics.domReady);
      }
    });
  }

  /**
   * 메트릭 보고
   */
  private reportMetric(name: string, value: number): void {
    // Mixpanel 또는 Analytics로 전송
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track('Performance Metric', {
        metric: name,
        value,
        url: window.location.pathname,
      });
    }

    // Console (개발 환경)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`);
    }
  }

  /**
   * 성능 점수 계산 (0-100)
   */
  calculateScore(): number {
    const weights = {
      FCP: 0.15,
      LCP: 0.25,
      FID: 0.25,
      CLS: 0.25,
      TTFB: 0.1,
    };

    let score = 100;

    // FCP (< 1.8s = good, > 3s = poor)
    if (this.metrics.FCP) {
      if (this.metrics.FCP > 3000) score -= weights.FCP * 100;
      else if (this.metrics.FCP > 1800) score -= weights.FCP * 50;
    }

    // LCP (< 2.5s = good, > 4s = poor)
    if (this.metrics.LCP) {
      if (this.metrics.LCP > 4000) score -= weights.LCP * 100;
      else if (this.metrics.LCP > 2500) score -= weights.LCP * 50;
    }

    // FID (< 100ms = good, > 300ms = poor)
    if (this.metrics.FID) {
      if (this.metrics.FID > 300) score -= weights.FID * 100;
      else if (this.metrics.FID > 100) score -= weights.FID * 50;
    }

    // CLS (< 0.1 = good, > 0.25 = poor)
    if (this.metrics.CLS) {
      if (this.metrics.CLS > 0.25) score -= weights.CLS * 100;
      else if (this.metrics.CLS > 0.1) score -= weights.CLS * 50;
    }

    // TTFB (< 800ms = good, > 1800ms = poor)
    if (this.metrics.TTFB) {
      if (this.metrics.TTFB > 1800) score -= weights.TTFB * 100;
      else if (this.metrics.TTFB > 800) score -= weights.TTFB * 50;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 성적 등급 계산
   */
  calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * 성능 보고서 생성
   */
  generateReport(): PerformanceReport {
    const score = this.calculateScore();

    return {
      timestamp: new Date(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      metrics: { ...this.metrics },
      score,
      grade: this.calculateGrade(score),
    };
  }

  /**
   * 메트릭 가져오기
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

/**
 * API 성능 모니터링
 */
export class APIPerformanceMonitor {
  private requestTimes: Map<string, number[]> = new Map();

  /**
   * API 요청 시작
   */
  startRequest(endpoint: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.recordRequest(endpoint, duration);
    };
  }

  /**
   * 요청 시간 기록
   */
  private recordRequest(endpoint: string, duration: number): void {
    if (!this.requestTimes.has(endpoint)) {
      this.requestTimes.set(endpoint, []);
    }

    const times = this.requestTimes.get(endpoint)!;
    times.push(duration);

    // 최근 100개만 유지
    if (times.length > 100) {
      times.shift();
    }

    // 느린 요청 경고
    if (duration > 1000) {
      console.warn(`[API Performance] Slow request to ${endpoint}: ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * 엔드포인트 통계
   */
  getStats(endpoint: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    p95: number;
  } | null {
    const times = this.requestTimes.get(endpoint);
    if (!times || times.length === 0) return null;

    const sorted = [...times].sort((a, b) => a - b);
    const count = sorted.length;
    const avg = sorted.reduce((sum, t) => sum + t, 0) / count;
    const min = sorted[0];
    const max = sorted[count - 1];
    const p95Index = Math.floor(count * 0.95);
    const p95 = sorted[p95Index];

    return { count, avg, min, max, p95 };
  }

  /**
   * 모든 엔드포인트 통계
   */
  getAllStats(): Record<string, ReturnType<APIPerformanceMonitor['getStats']>> {
    const stats: Record<string, ReturnType<APIPerformanceMonitor['getStats']>> = {};

    this.requestTimes.forEach((_, endpoint) => {
      stats[endpoint] = this.getStats(endpoint);
    });

    return stats;
  }
}

/**
 * 컴포넌트 렌더링 성능 측정
 */
export class ComponentPerformanceMonitor {
  /**
   * 컴포넌트 렌더링 시간 측정
   */
  measureRender(componentName: string, callback: () => void): void {
    const startTime = performance.now();

    callback();

    const duration = performance.now() - startTime;

    if (duration > 16) {
      // 16ms = 60fps
      console.warn(
        `[Component Performance] ${componentName} render took ${duration.toFixed(2)}ms (> 16ms)`
      );
    }

    // Mixpanel에 전송
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track('Component Render', {
        component: componentName,
        duration,
      });
    }
  }

  /**
   * React Profiler 콜백
   */
  onRenderCallback(
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ): void {
    if (actualDuration > 50) {
      console.warn(`[React Profiler] ${id} ${phase} took ${actualDuration.toFixed(2)}ms`);
    }

    // 분석 시스템에 전송
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track('React Profiler', {
        component: id,
        phase,
        actualDuration,
        baseDuration,
      });
    }
  }
}

/**
 * 메모리 사용량 모니터링
 */
export class MemoryMonitor {
  /**
   * 메모리 사용량 측정
   */
  measure(): {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    usagePercent: number;
  } | null {
    if (
      typeof window === 'undefined' ||
      !(performance as any).memory
    ) {
      return null;
    }

    const memory = (performance as any).memory;

    const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

    // 메모리 부족 경고
    if (usagePercent > 90) {
      console.error(`[Memory] High memory usage: ${usagePercent.toFixed(2)}%`);
    } else if (usagePercent > 75) {
      console.warn(`[Memory] Memory usage: ${usagePercent.toFixed(2)}%`);
    }

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercent,
    };
  }

  /**
   * 메모리 사용량 주기적 모니터링
   */
  startMonitoring(intervalMs = 30000): () => void {
    const interval = setInterval(() => {
      const stats = this.measure();
      if (stats) {
        console.log(
          `[Memory] Usage: ${(stats.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB / ${(stats.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB (${stats.usagePercent.toFixed(2)}%)`
        );
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }
}

/**
 * 번들 크기 분석
 */
export interface BundleStats {
  totalSize: number;
  gzipSize: number;
  chunks: Array<{
    name: string;
    size: number;
    gzipSize?: number;
  }>;
}

/**
 * 성능 모니터 통합 클래스
 */
export class PerformanceMonitor {
  private webVitals = new WebVitalsMonitor();
  private apiMonitor = new APIPerformanceMonitor();
  private componentMonitor = new ComponentPerformanceMonitor();
  private memoryMonitor = new MemoryMonitor();

  /**
   * 모든 모니터링 시작
   */
  startAll(): void {
    this.webVitals.measureAll();
  }

  /**
   * API 요청 모니터링
   */
  monitorAPI(endpoint: string): () => void {
    return this.apiMonitor.startRequest(endpoint);
  }

  /**
   * 컴포넌트 렌더링 모니터링
   */
  monitorComponent(name: string, callback: () => void): void {
    this.componentMonitor.measureRender(name, callback);
  }

  /**
   * React Profiler 콜백
   */
  onRenderCallback = this.componentMonitor.onRenderCallback;

  /**
   * 메모리 모니터링
   */
  monitorMemory(intervalMs?: number): () => void {
    return this.memoryMonitor.startMonitoring(intervalMs);
  }

  /**
   * 전체 성능 보고서
   */
  generateReport(): PerformanceReport {
    return this.webVitals.generateReport();
  }

  /**
   * API 통계
   */
  getAPIStats(): Record<string, ReturnType<APIPerformanceMonitor['getStats']>> {
    return this.apiMonitor.getAllStats();
  }

  /**
   * 메모리 통계
   */
  getMemoryStats() {
    return this.memoryMonitor.measure();
  }
}

/**
 * 글로벌 성능 모니터 인스턴스
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * 클라이언트 사이드 초기화
 */
if (typeof window !== 'undefined') {
  // 페이지 로드 시 자동 측정
  performanceMonitor.startAll();

  // 개발 환경에서만 메모리 모니터링
  if (process.env.NODE_ENV === 'development') {
    performanceMonitor.monitorMemory(60000); // 1분마다
  }

  // 성능 보고서를 전역에 노출 (디버깅용)
  (window as any).getPerformanceReport = () => {
    return {
      webVitals: performanceMonitor.generateReport(),
      api: performanceMonitor.getAPIStats(),
      memory: performanceMonitor.getMemoryStats(),
    };
  };
}
