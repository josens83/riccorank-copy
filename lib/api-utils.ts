/**
 * API Utilities
 *
 * @deprecated This file is kept for backwards compatibility.
 * Please use @/lib/api/errors for new code.
 */

// Re-export from unified error handler
export {
  ApiError,
  ApiErrors,
  handleApiError,
  successResponse,
  paginateArray,
} from './api/errors';
