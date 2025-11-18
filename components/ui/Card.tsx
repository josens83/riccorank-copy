/**
 * Card Component
 *
 * Unified card component for consistent layout patterns.
 * Replaces scattered card patterns across the codebase.
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card variant */
  variant?: 'default' | 'glass' | 'bordered' | 'elevated';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Hoverable card with scale effect */
  hoverable?: boolean;
  /** Children content */
  children: React.ReactNode;
}

/**
 * Card Component
 *
 * @example
 * ```tsx
 * <Card variant="glass" padding="lg" hoverable>
 *   <h3>Card Title</h3>
 *   <p>Card content...</p>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className = '',
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    glass: 'glass-strong border border-white/10',
    bordered: 'bg-transparent border-2 border-gray-300 dark:border-gray-600',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClass = hoverable ? 'card-hover cursor-pointer' : '';

  return (
    <div
      className={`rounded-lg transition-all duration-200 ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Header Component
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`} {...props}>
      <div>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
};

/**
 * Card Body Component
 */
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardBody: React.FC<CardBodyProps> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Card Footer Component
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
