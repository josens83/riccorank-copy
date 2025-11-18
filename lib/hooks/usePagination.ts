/**
 * Pagination Hook
 *
 * Reusable pagination logic
 */

import { useState, useMemo } from 'react';

export interface UsePaginationOptions {
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
}

export function usePagination({
  totalItems,
  itemsPerPage = 20,
  initialPage = 1,
}: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = useMemo(
    () => Math.ceil(totalItems / itemsPerPage),
    [totalItems, itemsPerPage]
  );

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const reset = () => {
    setCurrentPage(initialPage);
  };

  return {
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    goToPage,
    nextPage,
    prevPage,
    reset,
  };
}
