'use client';

import { useThemeStore } from '@/lib/store';

/**
 * Global Loading Component
 *
 * Displays a loading state for all pages in the app
 */
export default function Loading() {
  const { isDarkMode } = useThemeStore();

  return (
    <main className={`min-h-screen flex items-center justify-center px-4 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-2xl w-full text-center">
        {/* Loading Spinner */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
          <h2 className={`text-2xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            로딩 중...
          </h2>
          <p className={`text-lg ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            잠시만 기다려주세요
          </p>
        </div>

        {/* Progress Bar */}
        <div className={`w-full max-w-md mx-auto h-2 rounded-full overflow-hidden ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
        }`}>
          <div className="h-full bg-blue-600 dark:bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </main>
  );
}
