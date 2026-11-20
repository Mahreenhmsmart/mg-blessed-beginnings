/**
 * Error extraction utilities for consistent error handling across the app.
 * Works with enriched errors from apiClient interceptor.
 */

interface EnrichedError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
      category?: string;
    };
  };
  message?: string;
  code?: string;
  statusCode?: number;
}

/**
 * Maps AI error categories to user-friendly messages.
 * Configuration errors (auth_failed, invalid_model, not_configured) tell users to contact support.
 * Transient errors (rate_limited, all_unavailable) tell users to retry.
 */
const ERROR_CATEGORY_MESSAGES: Record<string, string> = {
  // Configuration errors — user cannot fix by retrying
  auth_failed: 'AI provider authentication failed. Please contact support.',
  invalid_model: 'AI model configuration error. Please contact support.',
  not_configured: 'AI service not configured. Please contact support.',
  
  // Transient errors — retry may help
  rate_limited: 'AI service temporarily busy. Please try again in a few moments.',
  all_unavailable: 'AI service temporarily unavailable. Please try again later.',
  timeout: 'The request timed out. Please try again.',
  network: 'AI service temporarily unavailable. Please try again later.',
};

/**
 * Extracts a user-friendly error message from an enriched error object.
 * The apiClient interceptor enriches errors with response, code, statusCode etc.
 */
export function extractErrorMessage(err: unknown, fallbackMessage = 'An unexpected error occurred. Please try again.'): string {
  const error = err as EnrichedError;

  // Check for server response with specific message first
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Check for server response with error field (alternative format)
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  // Check error category from response data — this is the primary source for AI errors
  const category = error.response?.data?.category;
  if (category && ERROR_CATEGORY_MESSAGES[category]) {
    return ERROR_CATEGORY_MESSAGES[category];
  }

  // HTTP status-specific messages (fallback if no category)
  const status = error.response?.status || error.statusCode;

  if (status === 429) {
    return 'AI service temporarily busy. Please try again in a few moments.';
  }

  if (status === 401 || status === 403) {
    return 'Authentication required. Please log in and try again.';
  }

  if (status === 503) {
    return 'Service temporarily unavailable. Please try again in a few moments.';
  }

  if (status === 504) {
    return 'The request timed out. Please try again.';
  }

  // Axios error codes
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'The request timed out. Please try again.';
  }

  if (error.code === 'ERR_NETWORK' || !error.response) {
    return 'Unable to connect to the server. Please check your connection.';
  }

  // Fall back to the error message or provided fallback
  return error.message || fallbackMessage;
}
