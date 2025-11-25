// API Response Types

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
    timestamp?: string;
    path?: string;
  };
  timestamp?: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
    timestamp: string;
    path?: string;
  };
}

// Filter and Sort Types
export type SortOrder = 'asc' | 'desc';

export interface StockFilters {
  market?: 'KOSPI' | 'KOSDAQ';
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface NewsFilters {
  category?: string;
  search?: string;
  isHot?: boolean;
}

export interface PostFilters {
  category?: string;
  search?: string;
  userId?: string;
  sortBy?: 'createdAt' | 'views' | 'likes';
  sortOrder?: SortOrder;
}
