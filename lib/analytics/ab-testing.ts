/**
 * A/B Testing Framework
 * 기능 및 디자인 실험을 위한 A/B 테스팅 시스템
 */

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABVariant[];
  startDate: Date;
  endDate?: Date;
  status: 'draft' | 'running' | 'paused' | 'completed';
  targetAudience?: {
    userRoles?: string[];
    userPlans?: string[];
    percentage?: number;
  };
}

export interface ABVariant {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-100, 총합 100
  config: Record<string, any>;
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  userId: string;
  timestamp: Date;
  metrics: {
    conversion?: boolean;
    clickThrough?: boolean;
    timeSpent?: number;
    customMetrics?: Record<string, number>;
  };
}

/**
 * A/B 테스트 매니저
 */
export class ABTestManager {
  private tests: Map<string, ABTest> = new Map();
  private userAssignments: Map<string, Map<string, string>> = new Map(); // userId -> testId -> variantId

  /**
   * 테스트 생성
   */
  createTest(test: ABTest): void {
    if (test.variants.reduce((sum, v) => sum + v.weight, 0) !== 100) {
      throw new Error('Variant weights must sum to 100');
    }

    this.tests.set(test.id, test);
  }

  /**
   * 사용자에게 변형 할당
   */
  assignVariant(testId: string, userId: string): string | null {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') {
      return null;
    }

    // 이미 할당된 변형이 있는지 확인
    const userTests = this.userAssignments.get(userId);
    if (userTests?.has(testId)) {
      return userTests.get(testId)!;
    }

    // 대상 사용자 필터링
    if (test.targetAudience) {
      const { percentage = 100 } = test.targetAudience;

      // 확률 기반 필터링
      if (Math.random() * 100 > percentage) {
        return null;
      }
    }

    // 가중치 기반 변형 선택
    const random = Math.random() * 100;
    let cumulative = 0;
    let selectedVariant: string | null = null;

    for (const variant of test.variants) {
      cumulative += variant.weight;
      if (random <= cumulative) {
        selectedVariant = variant.id;
        break;
      }
    }

    if (selectedVariant) {
      // 할당 저장
      if (!this.userAssignments.has(userId)) {
        this.userAssignments.set(userId, new Map());
      }
      this.userAssignments.get(userId)!.set(testId, selectedVariant);
    }

    return selectedVariant;
  }

  /**
   * 변형 설정 가져오기
   */
  getVariantConfig(testId: string, userId: string): Record<string, any> | null {
    const variantId = this.assignVariant(testId, userId);
    if (!variantId) return null;

    const test = this.tests.get(testId);
    const variant = test?.variants.find((v) => v.id === variantId);

    return variant?.config || null;
  }

  /**
   * 결과 기록
   */
  trackResult(result: ABTestResult): void {
    // 실제 구현에서는 데이터베이스나 분석 시스템에 저장
    console.log('[AB Test Result]', result);
  }

  /**
   * 테스트 통계 계산
   */
  calculateStatistics(testId: string, results: ABTestResult[]): ABTestStatistics {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    const variantStats = test.variants.map((variant) => {
      const variantResults = results.filter((r) => r.variantId === variant.id);
      const totalUsers = variantResults.length;
      const conversions = variantResults.filter((r) => r.metrics.conversion).length;
      const clicks = variantResults.filter((r) => r.metrics.clickThrough).length;
      const avgTimeSpent =
        variantResults.reduce((sum, r) => sum + (r.metrics.timeSpent || 0), 0) /
        totalUsers;

      return {
        variantId: variant.id,
        variantName: variant.name,
        totalUsers,
        conversions,
        conversionRate: totalUsers > 0 ? conversions / totalUsers : 0,
        clicks,
        clickThroughRate: totalUsers > 0 ? clicks / totalUsers : 0,
        avgTimeSpent,
      };
    });

    // 통계적 유의성 검정 (간단한 Z-test)
    const controlStats = variantStats[0];
    const treatmentStats = variantStats[1];

    let pValue: number | null = null;
    let isSignificant = false;

    if (controlStats && treatmentStats) {
      const p1 = controlStats.conversionRate;
      const p2 = treatmentStats.conversionRate;
      const n1 = controlStats.totalUsers;
      const n2 = treatmentStats.totalUsers;

      if (n1 > 0 && n2 > 0) {
        const pPool = (controlStats.conversions + treatmentStats.conversions) / (n1 + n2);
        const se = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2));
        const z = Math.abs(p1 - p2) / se;

        // Z-score를 P-value로 변환 (간단한 근사)
        pValue = 2 * (1 - this.normalCDF(Math.abs(z)));
        isSignificant = pValue < 0.05;
      }
    }

    return {
      testId,
      testName: test.name,
      variantStats,
      pValue,
      isSignificant,
      winner: isSignificant
        ? variantStats.reduce((max, v) =>
            v.conversionRate > max.conversionRate ? v : max
          ).variantId
        : null,
    };
  }

  /**
   * 정규분포 누적분포함수 (CDF) 근사
   */
  private normalCDF(x: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp((-x * x) / 2);
    const p =
      d *
      t *
      (0.3193815 +
        t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
  }

  /**
   * 테스트 종료
   */
  endTest(testId: string): void {
    const test = this.tests.get(testId);
    if (test) {
      test.status = 'completed';
      test.endDate = new Date();
    }
  }

  /**
   * 모든 활성 테스트 가져오기
   */
  getActiveTests(): ABTest[] {
    return Array.from(this.tests.values()).filter((test) => test.status === 'running');
  }
}

export interface ABTestStatistics {
  testId: string;
  testName: string;
  variantStats: Array<{
    variantId: string;
    variantName: string;
    totalUsers: number;
    conversions: number;
    conversionRate: number;
    clicks: number;
    clickThroughRate: number;
    avgTimeSpent: number;
  }>;
  pValue: number | null;
  isSignificant: boolean;
  winner: string | null;
}

/**
 * React Hook: useABTest
 * 컴포넌트에서 A/B 테스트 사용
 */
export function useABTestVariant(testId: string, userId: string): string | null {
  // 실제 구현에서는 React Hook으로 변환
  return abTestManager.assignVariant(testId, userId);
}

/**
 * A/B 테스트 매니저 싱글톤
 */
export const abTestManager = new ABTestManager();

/**
 * 사전 정의된 테스트 예시
 */

// 예시 1: 홈페이지 레이아웃 테스트
abTestManager.createTest({
  id: 'homepage-layout-test',
  name: '홈페이지 레이아웃 A/B 테스트',
  description: '새로운 카드 레이아웃 vs 기존 리스트 레이아웃',
  variants: [
    {
      id: 'control',
      name: '기존 레이아웃 (리스트)',
      description: '기존 리스트 형태 레이아웃',
      weight: 50,
      config: { layout: 'list' },
    },
    {
      id: 'treatment',
      name: '새 레이아웃 (카드)',
      description: '새로운 카드 형태 레이아웃',
      weight: 50,
      config: { layout: 'card' },
    },
  ],
  startDate: new Date(),
  status: 'running',
  targetAudience: {
    percentage: 100,
  },
});

// 예시 2: CTA 버튼 색상 테스트
abTestManager.createTest({
  id: 'cta-button-color-test',
  name: 'CTA 버튼 색상 테스트',
  description: '파란색 vs 녹색 vs 빨간색 버튼',
  variants: [
    {
      id: 'blue',
      name: '파란색 버튼',
      description: '기존 파란색 버튼',
      weight: 34,
      config: { buttonColor: 'blue' },
    },
    {
      id: 'green',
      name: '녹색 버튼',
      description: '새로운 녹색 버튼',
      weight: 33,
      config: { buttonColor: 'green' },
    },
    {
      id: 'red',
      name: '빨간색 버튼',
      description: '새로운 빨간색 버튼',
      weight: 33,
      config: { buttonColor: 'red' },
    },
  ],
  startDate: new Date(),
  status: 'running',
  targetAudience: {
    userPlans: ['free', 'premium'],
    percentage: 50,
  },
});

// 예시 3: 추천 알고리즘 테스트
abTestManager.createTest({
  id: 'recommendation-algorithm-test',
  name: '추천 알고리즘 테스트',
  description: '콘텐츠 기반 vs 협업 필터링 vs 하이브리드',
  variants: [
    {
      id: 'content-based',
      name: '콘텐츠 기반',
      description: '콘텐츠 기반 필터링만 사용',
      weight: 33,
      config: { algorithm: 'content-based', weights: { content: 1.0, collaborative: 0.0 } },
    },
    {
      id: 'collaborative',
      name: '협업 필터링',
      description: '협업 필터링만 사용',
      weight: 33,
      config: {
        algorithm: 'collaborative',
        weights: { content: 0.0, collaborative: 1.0 },
      },
    },
    {
      id: 'hybrid',
      name: '하이브리드',
      description: '콘텐츠 기반 + 협업 필터링',
      weight: 34,
      config: { algorithm: 'hybrid', weights: { content: 0.4, collaborative: 0.6 } },
    },
  ],
  startDate: new Date(),
  status: 'running',
  targetAudience: {
    percentage: 100,
  },
});
