import apiClient from './apiClient';
import type { AITool } from '@/types';

/**
 * Extracts the data payload from an API response envelope.
 * Handles both wrapped ({ success, data }) and unwrapped (direct array/object) shapes
 * to prevent silent failures when the backend response format changes.
 */
function extractData<T>(response: { data: unknown }): T {
  const body = response.data as Record<string, unknown>;
  // If the response has the standard envelope shape with a `data` field, unwrap it
  if (body && typeof body === 'object' && 'data' in body) {
    return body.data as T;
  }
  // Fallback: treat the entire response body as the data (direct array/object)
  return body as unknown as T;
}

export const aiToolApiService = {
  async getAll(category?: string): Promise<AITool[]> {
    const params = category ? `?category=${encodeURIComponent(category)}` : '';
    const response = await apiClient.get(`/ai-tools${params}`);
    const tools = extractData<AITool[]>(response);
    return Array.isArray(tools) ? tools : [];
  },

  async getCategories(): Promise<string[]> {
    const response = await apiClient.get('/ai-tools/categories');
    const categories = extractData<string[]>(response);
    return Array.isArray(categories) ? categories : [];
  },

  async getBySlug(slug: string): Promise<AITool | null> {
    const response = await apiClient.get(`/ai-tools/slug/${slug}`);
    return extractData<AITool>(response) ?? null;
  },

  async generateContent(toolSlug: string, input: Record<string, unknown>): Promise<string> {
    // Server route-level timeout is 55 s. Set client timeout slightly above that
    // (60 s) so the server always responds first with its own error message
    // before the client gives up. This ensures we get structured JSON errors
    // from the server rather than a raw axios ECONNABORTED.
    const CLIENT_TIMEOUT_MS = 60_000;

    try {
      const response = await apiClient.post(`/ai-tools/generate/${toolSlug}`, input, {
        timeout: CLIENT_TIMEOUT_MS,
        // Signal the apiClient retry interceptor to skip retries for this request.
        // AI generation is a long-running operation — retrying on timeout would
        // multiply the total wait time and produce a silent-hang experience.
        __skipRetry: true,
      } as Parameters<typeof apiClient.post>[2]);

      // Validate the response shape — the server should return { success: true, data: { output: "..." } }.
      // If it returns something unexpected (e.g., empty data, missing output field), treat it as an error
      // rather than silently returning an empty string that makes the UI appear to hang.
      const body = response.data as Record<string, unknown> | undefined;
      if (!body) {
        throw new Error('Server returned an empty response. Please try again.');
      }

      // Unwrap the standard envelope: { success, data: { output } }
      const data = body.data as Record<string, unknown> | undefined;
      if (data && typeof data === 'object' && 'output' in data) {
        const output = data.output;
        if (typeof output === 'string' && output.length > 0) {
          return output;
        }
        // Server returned { output: "" } or { output: null } — this is a silent failure
        throw new Error('Generation produced no output. Please try again with different inputs.');
      }

      // Fallback: check if the response has a top-level 'output' field (non-standard but possible)
      if ('output' in body && typeof body.output === 'string' && body.output.length > 0) {
        return body.output;
      }

      // Response doesn't contain any recognizable output — surface an error instead of returning ""
      throw new Error('Unexpected response format from server. Please try again.');
    } catch (err: unknown) {
      // Axios timeout errors have code ECONNABORTED
      const axiosErr = err as { code?: string; message?: string; isApiError?: boolean; statusCode?: number };

      if (axiosErr.code === 'ECONNABORTED' || axiosErr.message?.includes('timeout')) {
        throw new Error('Generation timed out. Please try again.');
      }

      // If the apiClient interceptor already enriched the error, re-throw as-is
      // so components can display the user-friendly message from the interceptor.
      if (axiosErr.isApiError) {
        throw err;
      }

      // Re-throw any other error (including our own validation errors above)
      throw err;
    }
  },
};
