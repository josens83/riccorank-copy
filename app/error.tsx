'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/store';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <main className={`min-h-screen flex items-center justify-center px-4 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
            <FiAlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            문제가 발생했습니다
          </h1>
          <p className={`text-lg mb-6 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            요청을 처리하는 중 예기치 않은 오류가 발생했습니다.
          </p>
        </div>

        {/* Error Details */}
        {process.env.NODE_ENV === 'development' && (
          <details className={`mb-8 text-left p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border`}>
            <summary className={`cursor-pointer font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              오류 상세 정보 (개발 모드)
            </summary>
            <div className={`mt-2 p-3 rounded ${
              isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
              <p className={`text-sm font-medium mb-2 ${
                isDarkMode ? 'text-red-400' : 'text-red-600'
              }`}>
                {error.name || 'Error'}
              </p>
              <pre className={`text-xs overflow-auto ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {error.message}
              </pre>
              {error.digest && (
                <p className={`text-xs mt-2 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  Error Digest: {error.digest}
                </p>
              )}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <FiRefreshCw className="w-5 h-5" />
            <span>다시 시도</span>
          </button>
          <Link
            href="/"
            className={`inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isDarkMode
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            <FiHome className="w-5 h-5" />
            <span>홈으로</span>
          </Link>
        </div>

        {/* Help Text */}
        <div className={`pt-8 border-t ${
          isDarkMode ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            문제가 계속되면 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
          </p>
        </div>
      </div>
    </main>
  );
}
