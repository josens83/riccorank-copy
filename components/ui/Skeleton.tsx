/**
 * Skeleton Component
 *
 * Skeleton loading placeholders for better UX.
 * Provides consistent loading states across the codebase.
 */

import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Skeleton variant */
  variant?: 'text' | 'circular' | 'rectangular';
  /** Width */
  width?: string | number;
  /** Height */
  height?: string | number;
  /** Animation */
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Skeleton Component
 *
 * @example
 * ```tsx
 * <Skeleton variant="text" width="100%" />
 * <Skeleton variant="circular" width={40} height={40} />
 * <Skeleton variant="rectangular" width="100%" height={200} />
 * ```
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width = '100%',
  height,
  animation = 'pulse',
  className = '',
  ...props
}) => {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-wave',
    none: '',
  };

  const defaultHeight = {
    text: '1em',
    circular: width,
    rectangular: '200px',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height || defaultHeight[variant],
  };

  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      {...props}
    />
  );
};

/**
 * Skeleton Group for common patterns
 */
export const SkeletonCard: React.FC = () => {
  return (
    <div className="p-6 space-y-4">
      <Skeleton variant="rectangular" width="100%" height={200} />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="60%" />
    </div>
  );
};

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="70%" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex-1">
            <Skeleton variant="text" width="100%" height={24} />
          </div>
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1">
              <Skeleton variant="text" width="100%" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
