import { getRedis } from '@/lib/redis';
import { log } from '@/lib/logger';

// Feature flag types
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  percentage?: number; // For gradual rollout (0-100)
  userIds?: string[]; // Specific users
  rules?: FeatureFlagRule[];
}

export interface FeatureFlagRule {
  type: 'user' | 'role' | 'plan' | 'percentage';
  value: string | number;
  enabled: boolean;
}

// Default feature flags
const DEFAULT_FLAGS: Record<string, FeatureFlag> = {
  // Core features
  'two-factor-auth': {
    name: 'two-factor-auth',
    enabled: true,
    description: '2단계 인증 활성화',
  },
  'real-time-stocks': {
    name: 'real-time-stocks',
    enabled: true,
    description: '실시간 주식 데이터',
  },
  'push-notifications': {
    name: 'push-notifications',
    enabled: false,
    description: '푸시 알림',
  },

  // New features (gradual rollout)
  'new-dashboard': {
    name: 'new-dashboard',
    enabled: false,
    description: '새로운 대시보드 UI',
    percentage: 0,
  },
  'ai-analysis': {
    name: 'ai-analysis',
    enabled: false,
    description: 'AI 기반 주식 분석',
    percentage: 0,
  },
  'advanced-charts': {
    name: 'advanced-charts',
    enabled: false,
    description: '고급 차트 기능',
    percentage: 0,
  },

  // Beta features
  'beta-features': {
    name: 'beta-features',
    enabled: false,
    description: '베타 기능 활성화',
    userIds: [],
  },

  // Premium features
  'premium-api-access': {
    name: 'premium-api-access',
    enabled: true,
    description: 'API 접근 (프리미엄 플랜)',
    rules: [
      { type: 'plan', value: 'premium', enabled: true },
    ],
  },
  'unlimited-exports': {
    name: 'unlimited-exports',
    enabled: true,
    description: '무제한 데이터 내보내기',
    rules: [
      { type: 'plan', value: 'pro', enabled: true },
      { type: 'plan', value: 'premium', enabled: true },
    ],
  },
};

// Feature flag service
class FeatureFlagService {
  private cachePrefix = 'feature-flag';
  private cacheTTL = 300; // 5 minutes

  /**
   * Check if a feature is enabled for a user
   */
  async isEnabled(
    flagName: string,
    context?: {
      userId?: string;
      userRole?: string;
      userPlan?: string;
    }
  ): Promise<boolean> {
    try {
      const flag = await this.getFlag(flagName);

      if (!flag) {
        log.warn('Feature flag not found', { flagName });
        return false;
      }

      // Check if globally disabled
      if (!flag.enabled) {
        return false;
      }

      // Check specific user IDs
      if (flag.userIds && context?.userId) {
        if (flag.userIds.includes(context.userId)) {
          return true;
        }
      }

      // Check rules
      if (flag.rules && flag.rules.length > 0) {
        for (const rule of flag.rules) {
          if (this.evaluateRule(rule, context)) {
            return rule.enabled;
          }
        }
        // If rules exist but none matched, return false
        return false;
      }

      // Check percentage rollout
      if (flag.percentage !== undefined && context?.userId) {
        return this.isInPercentage(context.userId, flag.percentage);
      }

      return flag.enabled;
    } catch (error) {
      log.error('Feature flag check error', error as Error, { flagName });
      return false;
    }
  }

  /**
   * Get a feature flag
   */
  async getFlag(flagName: string): Promise<FeatureFlag | null> {
    try {
      const redis = getRedis();
      const cacheKey = `${this.cachePrefix}:${flagName}`;

      // Try cache first
      const cached = await redis.get<FeatureFlag>(cacheKey);
      if (cached) {
        return cached;
      }

      // Get from default flags
      const flag = DEFAULT_FLAGS[flagName] || null;

      if (flag) {
        // Cache it
        await redis.set(cacheKey, flag, { ex: this.cacheTTL });
      }

      return flag;
    } catch (error) {
      log.error('Get feature flag error', error as Error, { flagName });
      return DEFAULT_FLAGS[flagName] || null;
    }
  }

  /**
   * Get all feature flags
   */
  async getAllFlags(): Promise<Record<string, FeatureFlag>> {
    return DEFAULT_FLAGS;
  }

  /**
   * Update a feature flag
   */
  async updateFlag(flagName: string, updates: Partial<FeatureFlag>): Promise<void> {
    try {
      const redis = getRedis();
      const cacheKey = `${this.cachePrefix}:${flagName}`;

      const existing = DEFAULT_FLAGS[flagName];
      if (!existing) {
        throw new Error(`Feature flag ${flagName} not found`);
      }

      const updated = { ...existing, ...updates };
      await redis.set(cacheKey, updated, { ex: this.cacheTTL });

      log.info('Feature flag updated', { flagName, updates });
    } catch (error) {
      log.error('Update feature flag error', error as Error, { flagName });
      throw error;
    }
  }

  /**
   * Evaluate a feature flag rule
   */
  private evaluateRule(
    rule: FeatureFlagRule,
    context?: { userId?: string; userRole?: string; userPlan?: string }
  ): boolean {
    if (!context) return false;

    switch (rule.type) {
      case 'user':
        return context.userId === rule.value;
      case 'role':
        return context.userRole === rule.value;
      case 'plan':
        return context.userPlan === rule.value;
      case 'percentage':
        return context.userId
          ? this.isInPercentage(context.userId, rule.value as number)
          : false;
      default:
        return false;
    }
  }

  /**
   * Check if user is in percentage rollout
   * Uses consistent hashing so same user always gets same result
   */
  private isInPercentage(userId: string, percentage: number): boolean {
    if (percentage <= 0) return false;
    if (percentage >= 100) return true;

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    // Get value between 0-99
    const bucket = Math.abs(hash) % 100;
    return bucket < percentage;
  }
}

// Export singleton
export const featureFlags = new FeatureFlagService();

// Helper function for easy checking
export async function isFeatureEnabled(
  flagName: string,
  context?: {
    userId?: string;
    userRole?: string;
    userPlan?: string;
  }
): Promise<boolean> {
  return featureFlags.isEnabled(flagName, context);
}

// React hook for feature flags (client-side)
export function useFeatureFlag(flagName: string, defaultValue: boolean = false): boolean {
  // This would be implemented with React state and API call
  // For now, return default value
  return defaultValue;
}
