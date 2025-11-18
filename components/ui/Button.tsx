/**
 * Button Component
 *
 * Unified button component with multiple variants and sizes.
 * Replaces 100+ inline button styles across the codebase.
 */

import React from 'react';
import { forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Full width button */
  fullWidth?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Icon before text */
  leftIcon?: React.ReactNode;
  /** Icon after text */
  rightIcon?: React.ReactNode;
  /** Children content */
  children?: React.ReactNode;
}

/**
 * Get button classes based on variant, size, and state
 */
const getButtonClasses = (
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  disabled: boolean,
  isLoading: boolean
): string => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Variant styles using CSS variables (dark mode compatible)
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500',
    secondary: 'glass-strong hover:bg-opacity-80 active:scale-95 focus:ring-blue-500',
    outline: 'border-2 border-current hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:ring-blue-500',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus:ring-green-500',
  };

  // Size classes
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
    xl: 'px-8 py-4 text-xl gap-3',
  };

  // Width class
  const widthClass = fullWidth ? 'w-full' : '';

  // Disabled/loading state
  const stateClass = (disabled || isLoading) ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer';

  return [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClass,
    stateClass,
  ].filter(Boolean).join(' ');
};

/**
 * Button Component
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md">Click me</Button>
 * <Button variant="outline" leftIcon={<FiSearch />}>Search</Button>
 * <Button variant="danger" isLoading>Deleting...</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const buttonClasses = getButtonClasses(variant, size, fullWidth, disabled, isLoading);

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${buttonClasses} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
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
        )}
        {!isLoading && leftIcon && <span className="button-icon">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="button-icon">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
