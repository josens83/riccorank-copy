/**
 * UI Components Library
 *
 * Centralized export for all reusable UI components.
 * Import from '@/components/ui' instead of individual files.
 *
 * @example
 * ```tsx
 * import { Button, Input, Card, Badge } from '@/components/ui';
 * ```
 */

export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { Input, Textarea } from './Input';
export type { InputProps, TextareaProps } from './Input';

export { Card, CardHeader, CardBody, CardFooter } from './Card';
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps } from './Card';

export { Badge } from './Badge';
export type { BadgeProps, BadgeVariant, BadgeSize } from './Badge';

export { LoadingSpinner, DotsSpinner } from './LoadingSpinner';
export type { LoadingSpinnerProps, SpinnerSize, SpinnerVariant } from './LoadingSpinner';

export { Skeleton, SkeletonCard, SkeletonList, SkeletonTable } from './Skeleton';
export type { SkeletonProps } from './Skeleton';

export { Modal, ConfirmModal } from './Modal';
export type { ModalProps, ConfirmModalProps } from './Modal';

export { Table, Pagination } from './Table';
export type { TableProps, Column, PaginationProps } from './Table';
