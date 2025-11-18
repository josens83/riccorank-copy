/**
 * Table Component
 *
 * Unified table component with sorting, pagination, and responsive design.
 * Consolidates admin table patterns across the codebase.
 */

import React from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

export interface Column<T = any> {
  /** Column key */
  key: string;
  /** Column header label */
  label: string;
  /** Custom render function */
  render?: (row: T) => React.ReactNode;
  /** Sortable column */
  sortable?: boolean;
  /** Column width */
  width?: string;
  /** Align */
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = any> {
  /** Table columns */
  columns: Column<T>[];
  /** Table data */
  data: T[];
  /** Row key extractor */
  keyExtractor: (row: T) => string | number;
  /** Sort configuration */
  sort?: {
    key: string;
    direction: 'asc' | 'desc';
  };
  /** Sort change handler */
  onSortChange?: (key: string) => void;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Empty state */
  emptyState?: React.ReactNode;
  /** Loading state */
  isLoading?: boolean;
  /** Striped rows */
  striped?: boolean;
  /** Hoverable rows */
  hoverable?: boolean;
  /** Compact size */
  compact?: boolean;
}

/**
 * Table Component
 *
 * @example
 * ```tsx
 * const columns: Column<User>[] = [
 *   { key: 'name', label: 'Name', sortable: true },
 *   { key: 'email', label: 'Email' },
 *   {
 *     key: 'actions',
 *     label: 'Actions',
 *     render: (user) => <Button onClick={() => handleEdit(user)}>Edit</Button>
 *   },
 * ];
 *
 * <Table
 *   columns={columns}
 *   data={users}
 *   keyExtractor={(user) => user.id}
 *   sort={sort}
 *   onSortChange={handleSort}
 * />
 * ```
 */
export function Table<T = any>({
  columns,
  data,
  keyExtractor,
  sort,
  onSortChange,
  onRowClick,
  emptyState,
  isLoading = false,
  striped = false,
  hoverable = true,
  compact = false,
}: TableProps<T>) {
  const handleSort = (key: string, sortable?: boolean) => {
    if (sortable && onSortChange) {
      onSortChange(key);
    }
  };

  const getCellValue = (row: T, column: Column<T>) => {
    if (column.render) {
      return column.render(row);
    }
    return (row as any)[column.key];
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const paddingClass = compact ? 'px-4 py-2' : 'px-6 py-4';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        {emptyState || (
          <div className="text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium">No data found</p>
            <p className="text-sm mt-1">There are no items to display.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6">
      <div className="inline-block min-w-full align-middle px-6">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`${paddingClass} text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                    alignClasses[column.align || 'left']
                  } ${column.sortable ? 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700/50' : ''}`}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column.key, column.sortable)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && sort?.key === column.key && (
                      <span className="text-blue-600 dark:text-blue-400">
                        {sort.direction === 'asc' ? (
                          <FiChevronUp className="w-4 h-4" />
                        ) : (
                          <FiChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((row, rowIndex) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={`
                  ${striped && rowIndex % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
                  ${hoverable ? 'hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors' : ''}
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`${paddingClass} text-sm text-gray-900 dark:text-gray-100 ${
                      alignClasses[column.align || 'left']
                    }`}
                  >
                    {getCellValue(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Simple Pagination Component
 */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = true,
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter((page) => {
    if (totalPages <= 7) return true;
    if (page === 1 || page === totalPages) return true;
    if (page >= currentPage - 1 && page <= currentPage + 1) return true;
    return false;
  });

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
      {showInfo && (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Page <span className="font-medium">{currentPage}</span> of{' '}
          <span className="font-medium">{totalPages}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        {visiblePages.map((page, index) => {
          const prevPage = visiblePages[index - 1];
          const showEllipsis = prevPage && page - prevPage > 1;

          return (
            <React.Fragment key={page}>
              {showEllipsis && <span className="px-2 text-gray-500">...</span>}
              <button
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            </React.Fragment>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Table;
