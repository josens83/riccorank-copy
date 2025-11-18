/**
 * Unified API Client for Client-Side Usage
 *
 * Features:
 * - Automatic error handling
 * - Request/Response interceptors
 * - Loading state management
 * - Retry logic
 * - Request deduplication
 * - Type-safe responses
 */

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestConfig {
  method?: HTTPMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retry?: number;
  retryDelay?: number;
  signal?: AbortSignal;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  details?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API Client Class
 */
class ApiClient {
  private baseURL: string;
  private defaultTimeout: number = 30000; // 30 seconds
  private pendingRequests: Map<string, Promise<any>> = new Map();

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  /**
   * Create request key for deduplication
   */
  private getRequestKey(url: string, config: RequestConfig): string {
    const method = config.method || 'GET';
    const body = config.body ? JSON.stringify(config.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(
    url: string,
    config: RequestConfig,
    retryCount: number = 0
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retry = 0,
      retryDelay = 1000,
      signal,
    } = config;

    // Setup timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Merge signals if provided
    const mergedSignal = signal
      ? this.mergeAbortSignals([signal, controller.signal])
      : controller.signal;

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: mergedSignal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const data: ApiResponse<T> = await response.json();

      // Handle error responses
      if (!response.ok) {
        throw new ApiError(
          data.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          data.details
        );
      }

      // Return data (handle both { data } and direct responses)
      return (data.data !== undefined ? data.data : data) as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Retry logic
      if (retryCount < retry && !(error instanceof ApiError)) {
        await this.delay(retryDelay * Math.pow(2, retryCount)); // Exponential backoff
        return this.makeRequest<T>(url, config, retryCount + 1);
      }

      // Handle different error types
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408);
        }
        throw new ApiError(error.message);
      }

      throw new ApiError('Unknown error occurred');
    }
  }

  /**
   * Merge multiple AbortSignals
   */
  private mergeAbortSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();

    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort();
        break;
      }
      signal.addEventListener('abort', () => controller.abort());
    }

    return controller.signal;
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<T> {
    const key = this.getRequestKey(url, { ...config, method: 'GET' });

    // Check for pending identical request (deduplication)
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Make request
    const promise = this.makeRequest<T>(url, { ...config, method: 'GET' });

    // Store pending request
    this.pendingRequests.set(key, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      // Clean up
      this.pendingRequests.delete(key);
    }
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, body?: any, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<T> {
    return this.makeRequest<T>(url, { ...config, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, body?: any, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<T> {
    return this.makeRequest<T>(url, { ...config, method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<T> {
    return this.makeRequest<T>(url, { ...config, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, body?: any, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<T> {
    return this.makeRequest<T>(url, { ...config, method: 'PATCH', body });
  }
}

/**
 * Default API client instance
 */
export const apiClient = new ApiClient('/api');

/**
 * Helper hook for API calls with loading states
 *
 * Usage:
 * const { data, error, loading, execute } = useApi();
 *
 * // In component
 * const fetchData = async () => {
 *   await execute(() => apiClient.get('/stocks'));
 * };
 */
export function useApi<T = any>() {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const execute = async (apiCall: () => Promise<T>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return { data, error, loading, execute, reset };
}

// React import for useApi hook
import React from 'react';

// Export ApiError for error handling
export { ApiError };

/**
 * Convenience functions for common API calls
 */
export const api = {
  // Stocks
  stocks: {
    list: (params?: { market?: string; search?: string; page?: number; limit?: number }) =>
      apiClient.get('/stocks', {
        headers: params ? { 'X-Query-Params': JSON.stringify(params) } : {}
      }),
    get: (symbol: string) => apiClient.get(`/stocks/${symbol}`),
  },

  // News
  news: {
    list: (params?: { category?: string; search?: string; page?: number; limit?: number }) =>
      apiClient.get('/news', {
        headers: params ? { 'X-Query-Params': JSON.stringify(params) } : {}
      }),
    get: (id: string) => apiClient.get(`/news/${id}`),
  },

  // Posts
  posts: {
    list: (params?: { category?: string; search?: string; page?: number; limit?: number }) =>
      apiClient.get('/posts', {
        headers: params ? { 'X-Query-Params': JSON.stringify(params) } : {}
      }),
    get: (id: string) => apiClient.get(`/posts/${id}`),
    create: (data: any) => apiClient.post('/posts', data),
    update: (id: string, data: any) => apiClient.put(`/posts/${id}`, data),
    delete: (id: string) => apiClient.delete(`/posts/${id}`),
  },

  // Comments
  comments: {
    list: (postId: string) => apiClient.get(`/comments?postId=${postId}`),
    create: (data: any) => apiClient.post('/comments', data),
    delete: (id: string) => apiClient.delete(`/comments/${id}`),
  },

  // Likes
  likes: {
    toggle: (postId: string) => apiClient.post('/likes', { postId }),
  },

  // Bookmarks
  bookmarks: {
    list: () => apiClient.get('/bookmarks'),
    toggle: (stockId: string) => apiClient.post('/bookmarks', { stockId }),
  },

  // Notifications
  notifications: {
    list: () => apiClient.get('/notifications'),
    markAsRead: (id: string) => apiClient.put(`/notifications/${id}`, { read: true }),
    markAllAsRead: () => apiClient.put('/notifications/mark-all-read', {}),
    delete: (id: string) => apiClient.delete(`/notifications/${id}`),
  },

  // Admin
  admin: {
    users: {
      list: (params?: { page?: number; limit?: number }) =>
        apiClient.get('/admin/users', {
          headers: params ? { 'X-Query-Params': JSON.stringify(params) } : {}
        }),
      suspend: (id: string) => apiClient.put(`/admin/users/${id}/suspend`, {}),
      activate: (id: string) => apiClient.put(`/admin/users/${id}/activate`, {}),
    },
    stats: () => apiClient.get('/admin/stats'),
  },
};
