// Unified Error Handling for API Routes
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Custom API Error Class
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Common API Error Types
 */
export const ApiErrors = {
  Unauthorized: () => new ApiError(401, 'Unauthorized'),
  Forbidden: () => new ApiError(403, 'Forbidden'),
  NotFound: (resource?: string) => new ApiError(404, resource ? `${resource} not found` : 'Not found'),
  BadRequest: (message: string) => new ApiError(400, message),
  Conflict: (message: string) => new ApiError(409, message),
  TooManyRequests: () => new ApiError(429, 'Too many requests. Please try again later.'),
  InternalServerError: () => new ApiError(500, 'Internal server error'),
} as const;

/**
 * Standard Error Response Format
 */
interface ErrorResponse {
  error: string;
  details?: any;
  timestamp?: string;
  path?: string;
}

/**
 * Unified Error Handler for API Routes
 *
 * Features:
 * - Handles ApiError, ZodError, and generic errors
 * - Different messages for development vs production
 * - Structured error responses
 * - Proper HTTP status codes
 *
 * @param error - The error to handle
 * @param request - Optional NextRequest for logging
 * @returns NextResponse with error details
 */
export function handleApiError(error: unknown, request?: Request): NextResponse {
  console.error('[API Error]', {
    error,
    url: request?.url,
    method: request?.method,
    timestamp: new Date().toISOString(),
  });

  const isDevelopment = process.env.NODE_ENV === 'development';

  // Handle custom API errors
  if (error instanceof ApiError) {
    const response: ErrorResponse = {
      error: error.message,
      timestamp: new Date().toISOString(),
    };

    if (error.details) {
      response.details = error.details;
    }

    if (request?.url) {
      response.path = new URL(request.url).pathname;
    }

    return NextResponse.json(response, { status: error.statusCode });
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const response: ErrorResponse = {
      error: 'Validation failed',
      details: error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code,
      })),
      timestamp: new Date().toISOString(),
    };

    if (request?.url) {
      response.path = new URL(request.url).pathname;
    }

    return NextResponse.json(response, { status: 400 });
  }

  // Handle generic errors
  const message = error instanceof Error
    ? (isDevelopment ? error.message : 'Internal server error')
    : 'Internal server error';

  const response: ErrorResponse = {
    error: message,
    timestamp: new Date().toISOString(),
  };

  // Include stack trace in development
  if (isDevelopment && error instanceof Error && error.stack) {
    response.details = {
      stack: error.stack.split('\n').slice(0, 5), // First 5 lines of stack
    };
  }

  if (request?.url) {
    response.path = new URL(request.url).pathname;
  }

  return NextResponse.json(response, { status: 500 });
}

/**
 * Success Response Helper
 *
 * @param data - Data to return
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with data
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Pagination Helper
 *
 * @param array - Array to paginate
 * @param page - Current page (1-indexed)
 * @param limit - Items per page
 * @returns Paginated result with metadata
 */
export function paginateArray<T>(
  array: T[],
  page: number = 1,
  limit: number = 10
): {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
} {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const data = array.slice(startIndex, endIndex);
  const totalPages = Math.ceil(array.length / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total: array.length,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
