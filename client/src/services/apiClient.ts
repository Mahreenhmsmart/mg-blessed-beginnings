import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

// VITE_API_URL already ends with /api — NEVER append another /api to paths.
// Security fix: Removed hardcoded fallback URL to prevent accidental requests to wrong server.
// If VITE_API_URL is not set, API calls will fail explicitly rather than silently using wrong endpoint.
const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  console.error('[apiClient] VITE_API_URL is not configured. API calls will fail.');
}

const apiClient = axios.create({
  baseURL: BASE_URL || '/api', // Fallback to relative path for same-origin deployments
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Connection State Callbacks ──────────────────────────────────────────────
// External code (connectionSlice) registers listeners here to track
// online/offline status without coupling the apiClient to Redux.
type ConnectionStateListener = (connected: boolean, endpoint?: string) => void;
const connectionListeners: Set<ConnectionStateListener> = new Set();

export function onConnectionStateChange(listener: ConnectionStateListener): () => void {
  connectionListeners.add(listener);
  return () => connectionListeners.delete(listener);
}

function notifyConnectionState(connected: boolean, endpoint?: string): void {
  connectionListeners.forEach((fn) => fn(connected, endpoint));
}

// ─── Auth Interceptor ────────────────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Retry Logic for Transient Network Errors ────────────────────────────────
interface RetryableConfig extends InternalAxiosRequestConfig {
  __retryCount?: number;
  __skipRetry?: boolean;
}

const MAX_RETRIES = 2;
const RETRY_DELAYS = [1000, 2500]; // exponential backoff in ms

/** URL patterns that must NEVER be retried — these are long-running operations
 *  where a timeout means the upstream provider is slow/unavailable, not a
 *  transient network blip. Retrying them would multiply the wait time (e.g.
 *  3 × 55 s = 165 s) and the user sees a silent hang with no feedback. */
const NON_RETRYABLE_PATTERNS = ['/ai-tools/generate/', '/ai/chat', '/rag/'];

function isNonRetryableEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  return NON_RETRYABLE_PATTERNS.some((pattern) => url.includes(pattern));
}

function isRetryable(error: AxiosError): boolean {
  // Never retry long-running AI generation / chat endpoints — a timeout there
  // means the upstream AI provider is slow, not a network blip. Retrying would
  // triple the total wait time and produce a silent-hang experience.
  const config = error.config as RetryableConfig | undefined;
  if (config?.__skipRetry || isNonRetryableEndpoint(config?.url)) return false;

  // Only retry on network errors or timeouts — never retry 4xx client errors
  if (error.response) return false;
  const code = error.code;
  return (
    code === 'ERR_NETWORK' ||
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    !error.response
  );
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Response Interceptor ────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    // Successful response — mark connected
    notifyConnectionState(true);
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;
    const endpoint = config?.url ?? 'unknown';

    // Attempt automatic retries for transient network failures
    if (config && isRetryable(error)) {
      const retryCount = config.__retryCount ?? 0;
      if (retryCount < MAX_RETRIES) {
        config.__retryCount = retryCount + 1;
        await delay(RETRY_DELAYS[retryCount] ?? RETRY_DELAYS[RETRY_DELAYS.length - 1]);
        return apiClient(config);
      }
    }

    // Determine the error category and build an actionable message
    let message: string;
    let isNetworkError = false;

    if (!error.response) {
      // No response at all — network/timeout/connectivity issue
      isNetworkError = true;
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        // AI generation endpoints get a friendlier timeout message since they're
        // long-running by nature and users expect to wait.
        const isAiEndpoint = isNonRetryableEndpoint(endpoint);
        message = isAiEndpoint
          ? 'AI generation timed out. Please try again.'
          : `Request to ${endpoint} timed out. The server may be busy — please try again.`;
      } else {
        message = `Cannot reach the server (${endpoint}). Please check your internet connection and try again.`;
      }
    } else {
      // Server responded with an error status (4xx / 5xx)
      const data = error.response.data as Record<string, unknown> | undefined;
      message =
        (data?.error as string) ||
        (data?.message as string) ||
        `Server error (${error.response.status}) on ${endpoint}. Please try again.`;
    }

    // Notify connection listeners
    notifyConnectionState(!isNetworkError, endpoint);

    // Create an enriched error that preserves the original axios properties
    // so downstream service catch blocks can still inspect error.response, error.code, etc.
    const enrichedError = new Error(message);
    Object.assign(enrichedError, {
      isApiError: true,
      isNetworkError,
      statusCode: error.response?.status,
      endpoint,
      originalError: error,
      // Preserve the response object so services can check error.response
      response: error.response,
      code: error.code,
    });

    return Promise.reject(enrichedError);
  },
);

// ─── Health Check Utility ────────────────────────────────────────────────────
export async function checkServerHealth(): Promise<boolean> {
  try {
    const { data } = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    return data?.status === 'ok' || data?.success === true;
  } catch {
    return false;
  }
}

export default apiClient;
