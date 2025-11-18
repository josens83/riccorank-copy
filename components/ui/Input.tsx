/**
 * Input Component
 *
 * Unified input component with label, error states, and icons.
 * Replaces scattered form input patterns across the codebase.
 */

import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Icon before input */
  leftIcon?: React.ReactNode;
  /** Icon after input */
  rightIcon?: React.ReactNode;
  /** Full width input */
  fullWidth?: boolean;
  /** Input variant */
  variant?: 'default' | 'glass';
}

/**
 * Input Component
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   leftIcon={<FiMail />}
 *   error="Email is required"
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      variant = 'default',
      className = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const wrapperClass = fullWidth ? 'w-full' : '';

    const inputBaseClasses = 'w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2';

    const variantClasses = {
      default: `border ${
        error
          ? 'border-red-500 focus:ring-red-500'
          : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
      } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`,
      glass: `glass-strong border border-white/10 focus:ring-blue-500 text-gray-900 dark:text-gray-100`,
    };

    const iconPadding = leftIcon ? 'pl-11' : rightIcon ? 'pr-11' : '';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

    return (
      <div className={wrapperClass}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            className={`${inputBaseClasses} ${variantClasses[variant]} ${iconPadding} ${disabledClass} ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea Component
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'glass';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      variant = 'default',
      className = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const wrapperClass = fullWidth ? 'w-full' : '';

    const textareaBaseClasses = 'w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 resize-none';

    const variantClasses = {
      default: `border ${
        error
          ? 'border-red-500 focus:ring-red-500'
          : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
      } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`,
      glass: `glass-strong border border-white/10 focus:ring-blue-500 text-gray-900 dark:text-gray-100`,
    };

    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

    return (
      <div className={wrapperClass}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          disabled={disabled}
          className={`${textareaBaseClasses} ${variantClasses[variant]} ${disabledClass} ${className}`}
          {...props}
        />

        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Input;
