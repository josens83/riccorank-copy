'use client';

import { useThemeStore } from '@/lib/store';

// Base Skeleton
export function Skeleton({ className = '', width = 'w-full', height = 'h-4' }: {
  className?: string;
  width?: string;
  height?: string;
}) {
  const { isDarkMode } = useThemeStore();
  return (
    <div
      className={`${width} ${height} ${className} ${
        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
      } animate-pulse rounded`}
    />
  );
}

// Stock Card Skeleton
export function StockCardSkeleton() {
  const { isDarkMode } = useThemeStore();
  return (
    <div className={`p-4 rounded-lg border ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <Skeleton width="w-24" height="h-5" />
        <Skeleton width="w-16" height="h-5" />
      </div>
      <Skeleton width="w-20" height="h-4" className="mb-3" />
      <div className="flex items-center justify-between">
        <Skeleton width="w-24" height="h-6" />
        <Skeleton width="w-16" height="h-5" />
      </div>
    </div>
  );
}

// Post Card Skeleton
export function PostCardSkeleton() {
  const { isDarkMode } = useThemeStore();
  return (
    <div className={`p-4 rounded-lg border ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <Skeleton width="w-20" height="h-5" />
        <Skeleton width="w-16" height="h-4" />
      </div>
      <Skeleton width="w-full" height="h-6" className="mb-2" />
      <Skeleton width="w-full" height="h-4" className="mb-1" />
      <Skeleton width="w-3/4" height="h-4" className="mb-4" />
      <div className="flex items-center justify-between">
        <Skeleton width="w-24" height="h-4" />
        <div className="flex space-x-4">
          <Skeleton width="w-12" height="h-4" />
          <Skeleton width="w-12" height="h-4" />
          <Skeleton width="w-12" height="h-4" />
        </div>
      </div>
    </div>
  );
}

// News Card Skeleton
export function NewsCardSkeleton() {
  const { isDarkMode } = useThemeStore();
  return (
    <div className={`p-4 rounded-lg border ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <Skeleton width="w-16" height="h-5" />
        <Skeleton width="w-20" height="h-4" />
      </div>
      <Skeleton width="w-full" height="h-6" className="mb-3" />
      <Skeleton width="w-full" height="h-4" className="mb-1" />
      <Skeleton width="w-5/6" height="h-4" className="mb-3" />
      <div className="flex items-center justify-between">
        <Skeleton width="w-32" height="h-4" />
        <Skeleton width="w-16" height="h-4" />
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  const { isDarkMode } = useThemeStore();
  return (
    <tr className={isDarkMode ? 'border-gray-700' : 'border-gray-200'}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton width={i === 0 ? 'w-8' : 'w-full'} height="h-4" />
        </td>
      ))}
    </tr>
  );
}

// Comment Skeleton
export function CommentSkeleton() {
  const { isDarkMode } = useThemeStore();
  return (
    <div className={`border-l-2 pl-4 py-3 ${
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className="flex items-start space-x-3">
        <Skeleton width="w-8" height="h-8" className="rounded-full" />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Skeleton width="w-24" height="h-4" />
            <Skeleton width="w-32" height="h-3" />
          </div>
          <Skeleton width="w-full" height="h-4" className="mb-1" />
          <Skeleton width="w-3/4" height="h-4" className="mb-2" />
          <Skeleton width="w-16" height="h-3" />
        </div>
      </div>
    </div>
  );
}

// Profile Card Skeleton
export function ProfileCardSkeleton() {
  const { isDarkMode } = useThemeStore();
  return (
    <div className={`rounded-lg border p-6 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="text-center mb-6">
        <Skeleton width="w-24" height="h-24" className="rounded-full mx-auto mb-4" />
        <Skeleton width="w-32" height="h-6" className="mx-auto mb-2" />
        <Skeleton width="w-40" height="h-4" className="mx-auto" />
      </div>
      <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-700">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <Skeleton width="w-12" height="h-8" className="mx-auto mb-1" />
            <Skeleton width="w-16" height="h-3" className="mx-auto" />
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton width="w-5" height="h-5" />
            <Skeleton width="w-full" height="h-4" />
          </div>
        ))}
      </div>
      <Skeleton width="w-full" height="h-10" className="mt-6 rounded-md" />
    </div>
  );
}

// List Loading
export function ListLoading({ count = 5, type = 'post' }: {
  count?: number;
  type?: 'post' | 'news' | 'stock' | 'comment';
}) {
  const components = {
    post: PostCardSkeleton,
    news: NewsCardSkeleton,
    stock: StockCardSkeleton,
    comment: CommentSkeleton,
  };

  const Component = components[type];

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}

// Full Page Loading
export function PageLoading() {
  const { isDarkMode } = useThemeStore();
  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          로딩 중...
        </p>
      </div>
    </div>
  );
}

// Inline Spinner
export function Spinner({ size = 'md', className = '' }: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-b-2 border-blue-600 ${sizes[size]} ${className}`}
    />
  );
}
