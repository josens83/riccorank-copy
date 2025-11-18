'use client';

import React, { Component, ReactNode } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <FiAlertTriangle className="w-20 h-20 mx-auto text-red-500 mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                오류가 발생했습니다
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
              </p>
              {this.state.error && (
                <details className="text-left mb-4">
                  <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2">
                    오류 상세 정보
                  </summary>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-red-600 dark:text-red-400">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiRefreshCw className="w-5 h-5" />
                <span>다시 시도</span>
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <FiHome className="w-5 h-5" />
                <span>홈으로</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple error display component
export function ErrorDisplay({
  title = '오류가 발생했습니다',
  message = '요청을 처리하는 중 문제가 발생했습니다.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <FiAlertTriangle className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          <span>다시 시도</span>
        </button>
      )}
    </div>
  );
}

// Empty state component
export function EmptyState({
  icon: Icon = FiAlertTriangle,
  title = '데이터가 없습니다',
  message = '표시할 내용이 없습니다.',
  actionLabel,
  onAction,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Icon className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
