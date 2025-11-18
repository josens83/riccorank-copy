/**
 * LoadingSpinner Component
 *
 * Unified loading spinner component.
 * Replaces scattered loading indicators across the codebase.
 */

import React from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'default' | 'primary' | 'white';

export interface LoadingSpinnerProps {
  /** Spinner size */
  size?: SpinnerSize;
  /** Color variant */
  variant?: SpinnerVariant;
  /** Center in container */
  center?: boolean;
  /** Loading text */
  text?: string;
  /** Full screen overlay */
  fullScreen?: boolean;
}

/**
 * LoadingSpinner Component
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="md" text="Loading..." />
 * <LoadingSpinner size="lg" center />
 * <LoadingSpinner fullScreen text="Processing..." />
 * ```
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  center = false,
  text,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const variantClasses = {
    default: 'text-gray-600 dark:text-gray-400',
    primary: 'text-blue-600 dark:text-blue-400',
    white: 'text-white',
  };

  const spinner = (
    <div className={`inline-flex flex-col items-center gap-3 ${center ? 'justify-center' : ''}`}>
      <svg
        className={`animate-spin ${sizeClasses[size]} ${variantClasses[variant]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <p className={`text-sm font-medium ${variantClasses[variant]}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  if (center) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[200px]">
        {spinner}
      </div>
    );
  }

  return spinner;
};

/**
 * Dots Spinner (alternative style)
 */
export const DotsSpinner: React.FC<{ size?: SpinnerSize; variant?: SpinnerVariant }> = ({
  size = 'md',
  variant = 'default',
}) => {
  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
  };

  const variantClasses = {
    default: 'bg-gray-600 dark:bg-gray-400',
    primary: 'bg-blue-600 dark:bg-blue-400',
    white: 'bg-white',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${dotSizes[size]} ${variantClasses[variant]} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
      <div className={`${dotSizes[size]} ${variantClasses[variant]} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
      <div className={`${dotSizes[size]} ${variantClasses[variant]} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
    </div>
  );
};

export default LoadingSpinner;
