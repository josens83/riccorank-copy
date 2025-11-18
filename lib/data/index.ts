/**
 * Data Layer - Environment-Aware Mock Data
 *
 * This module provides mock data for development and testing.
 * In production builds, mock data is excluded or provides safe defaults.
 */

import type {
  Stock,
  MarketIndex,
  News,
  Post,
  PopularSearch,
  ThemeStock,
  StockSentiment,
  User,
  Comment,
  Notification,
} from '../types';

// Type-only imports to maintain type safety without bundling dev code in production
type MockDataModule = {
  mockUsers: User[];
  mockPopularSearches: PopularSearch[];
  mockMarketIndices: MarketIndex[];
  mockThemeStocks: ThemeStock[];
  mockUpLimitStocks: any[];
  mockStocks: Stock[];
  mockNews: News[];
  mockStockSentiment: StockSentiment[];
  mockComments: Comment[];
  mockPosts: Post[];
  mockNotifications: Notification[];
};

/**
 * Get mock data module (development only)
 *
 * @returns Mock data module or null in production
 */
function getMockDataModule(): MockDataModule | null {
  // Only load mock data in development or test environments
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    try {
      // Dynamic import to prevent bundling in production
      // Note: Next.js will tree-shake this in production builds
      const mockData = require('./__dev__/mockData');
      return mockData;
    } catch (error) {
      console.error('[Mock Data] Failed to load development mock data:', error);
      return null;
    }
  }

  // Production: no mock data
  return null;
}

// Cache the mock data module
let cachedMockData: MockDataModule | null | undefined = undefined;

function getMockData(): MockDataModule | null {
  if (cachedMockData === undefined) {
    cachedMockData = getMockDataModule();
  }
  return cachedMockData;
}

/**
 * Create empty fallback arrays for production
 */
const EMPTY_ARRAY: any[] = [];

/**
 * Export mock data with environment-aware fallbacks
 *
 * Development: Returns actual mock data
 * Production: Returns empty arrays
 */
export const mockUsers: User[] = getMockData()?.mockUsers ?? EMPTY_ARRAY;
export const mockPopularSearches: PopularSearch[] = getMockData()?.mockPopularSearches ?? EMPTY_ARRAY;
export const mockMarketIndices: MarketIndex[] = getMockData()?.mockMarketIndices ?? EMPTY_ARRAY;
export const mockThemeStocks: ThemeStock[] = getMockData()?.mockThemeStocks ?? EMPTY_ARRAY;
export const mockUpLimitStocks: any[] = getMockData()?.mockUpLimitStocks ?? EMPTY_ARRAY;
export const mockStocks: Stock[] = getMockData()?.mockStocks ?? EMPTY_ARRAY;
export const mockNews: News[] = getMockData()?.mockNews ?? EMPTY_ARRAY;
export const mockStockSentiment: StockSentiment[] = getMockData()?.mockStockSentiment ?? EMPTY_ARRAY;
export const mockComments: Comment[] = getMockData()?.mockComments ?? EMPTY_ARRAY;
export const mockPosts: Post[] = getMockData()?.mockPosts ?? EMPTY_ARRAY;
export const mockNotifications: Notification[] = getMockData()?.mockNotifications ?? EMPTY_ARRAY;

/**
 * Check if mock data is available (useful for conditional logic)
 */
export const isMockDataAvailable = (): boolean => {
  return getMockData() !== null;
};

/**
 * Get mock data with warning in production
 *
 * @param dataName - Name of the data being accessed (for logging)
 * @returns Whether mock data is being used
 */
export const warnIfProduction = (dataName: string): boolean => {
  const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

  if (!isDevelopment && getMockData() !== null) {
    console.warn(`[Mock Data] ${dataName} is being accessed in production. This should not happen.`);
    return true;
  }

  return false;
};
