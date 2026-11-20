import apiClient from './apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TestResult =
  | 'success'
  | 'failed'
  | 'quota_exhausted'
  | 'rate_limited'
  | 'unavailable'
  | 'network_error';

export interface ProviderStatus {
  _id: string;
  provider: string;
  modelName: string;
  isEnabled: boolean;
  isPrimary: boolean;
  fallbackOrder: number;
  lastTestResult?: TestResult;
  lastTestedAt?: string;
  lastTestError?: string;
  isConfigured: boolean;
  keyPreview: string;
}

export interface SaveProviderData {
  provider: 'anthropic' | 'openai' | 'google' | 'cohere' | 'openrouter' | 'groq' | 'luma';
  modelName: string;
  apiKey: string;
  isEnabled?: boolean;
  isPrimary?: boolean;
  fallbackOrder?: number;
}

export interface TestConnectionResult {
  lastTestResult: TestResult;
  lastTestedAt: string;
  lastTestError?: string;
}

// ─── Chatbot API (public, no auth) ──────────────────────────────────────────

export type ChatbotErrorCategory =
  | 'auth_failed'
  | 'rate_limited'
  | 'timeout'
  | 'network'
  | 'invalid_model'
  | 'not_configured'
  | 'all_unavailable'
  | 'unknown';

interface ChatbotResponse {
  success: boolean;
  answer?: string;
  error?: string;
  errorCategory?: ChatbotErrorCategory;
  requestId?: string;
  suggestions?: string[];
  isFallback?: boolean;
}

export interface ChatbotStatusResponse {
  provider: string | null;
  model: string | null;
  source: 'database' | 'environment' | 'none';
  configuredKeys?: string[];
}

export async function getChatbotStatus(): Promise<ChatbotStatusResponse> {
  try {
    const { data } = await apiClient.get<{ success: boolean; data: ChatbotStatusResponse }>('/chatbot/status');
    return data.data;
  } catch {
    return { provider: null, model: null, source: 'none' };
  }
}

export async function sendChatbotMessage(message: string): Promise<ChatbotResponse> {
  try {
    const { data } = await apiClient.post<ChatbotResponse>('/chatbot', { message });
    return data;
  } catch (err: unknown) {
    // Axios wraps HTTP errors in an object with response.data
    const axiosErr = err as { response?: { data?: ChatbotResponse; status?: number }; message?: string; code?: string };
    if (axiosErr.response?.data?.error) {
      return {
        success: false,
        error: axiosErr.response.data.error,
        errorCategory: axiosErr.response.data.errorCategory,
        requestId: axiosErr.response.data.requestId,
      };
    }
    // Specific network / timeout errors
    if (axiosErr.code === 'ECONNABORTED' || axiosErr.message?.includes('timeout')) {
      return { success: false, error: 'The AI took too long to respond. Please try again.', errorCategory: 'timeout' };
    }
    if (!axiosErr.response) {
      return { success: false, error: 'Unable to reach the AI service. Please check your connection.', errorCategory: 'network' };
    }
    // Network or unexpected errors
    if (err instanceof Error) {
      return { success: false, error: err.message, errorCategory: 'unknown' };
    }
    return { success: false, error: 'Unable to reach the AI service. Please check your connection.', errorCategory: 'network' };
  }
}

// ─── Chat API (existing) ─────────────────────────────────────────────────────

interface AIChatResponse {
  success: boolean;
  data: { response: string };
}

export const aiService = {
  async chat(prompt: string, system?: string): Promise<AIChatResponse> {
    const body: { prompt: string; system?: string } = { prompt };
    if (system) body.system = system;

    const { data } = await apiClient.post<AIChatResponse>('/ai/chat', body);
    return data;
  },

  // ─── Provider Settings API ───────────────────────────────────────────────

  async getProviderStatuses(): Promise<ProviderStatus[]> {
    // Cache-bust with timestamp to ensure fresh data on every call
    const { data } = await apiClient.get<{ success: boolean; data: ProviderStatus[] }>(
      `/ai/settings/providers?_t=${Date.now()}`,
    );
    return data.data;
  },

  async saveProvider(providerData: SaveProviderData, id?: string): Promise<ProviderStatus> {
    if (id) {
      const { data } = await apiClient.put<{ success: boolean; data: ProviderStatus }>(
        `/ai/settings/providers/${id}`,
        providerData,
      );
      return data.data;
    }
    const { data } = await apiClient.post<{ success: boolean; data: ProviderStatus }>(
      '/ai/settings/providers',
      providerData,
    );
    return data.data;
  },

  async deleteProvider(id: string): Promise<void> {
    await apiClient.delete(`/ai/settings/providers/${id}`);
  },

  async testConnection(id: string): Promise<TestConnectionResult> {
    const { data } = await apiClient.post<{ success: boolean; data: TestConnectionResult }>(
      `/ai/settings/providers/${id}/test`,
    );
    return data.data;
  },

  async setPrimary(id: string): Promise<void> {
    await apiClient.patch(`/ai/settings/providers/${id}/primary`);
  },

  /**
   * Validate the format of a stored OpenRouter key.
   * Server returns ONLY 'valid' or 'invalid/empty' — never any part of the actual key.
   */
  async validateKeyFormat(id: string): Promise<'valid' | 'invalid/empty'> {
    const { data } = await apiClient.get<{ success: boolean; data: { status: 'valid' | 'invalid/empty' } }>(
      `/ai/settings/providers/${id}/validate-key-format`,
    );
    return data.data.status;
  },
};

// ─── Diagnostic API ─────────────────────────────────────────────────────────────

export interface FreeProviderStatus {
  provider: string;
  modelName: string;
  status: 'Working' | 'Not configured' | 'Failed';
  lastTestedAt?: string;
  lastTestError?: string;
}

export interface FreeGenerateResponse {
  response: string;
  provider: string;
  model: string;
}

/**
 * Fetch the list of configured free-tier providers with their real status.
 */
export async function getFreeProviders(): Promise<FreeProviderStatus[]> {
  const { data } = await apiClient.get<{ success: boolean; data: FreeProviderStatus[] }>(
    '/ai/free-providers',
  );
  return data.data;
}

/**
 * Generate a completion using only free-tier providers with automatic failover.
 * Returns which provider and model actually answered.
 */
export async function freeGenerate(prompt: string, system?: string): Promise<FreeGenerateResponse> {
  const body: { prompt: string; system?: string } = { prompt };
  if (system) body.system = system;

  const { data } = await apiClient.post<{ success: boolean; data: FreeGenerateResponse }>(
    '/ai/free-generate',
    body,
    { timeout: 60000 },
  );
  return data.data;
}

// ─── Diagnostic API ─────────────────────────────────────────────────────────────

export interface DiagnosticResult {
  component: string;
  status: 'PASS' | 'FAIL' | 'NOT_CONFIGURED';
  evidence: string;
  latency?: number;
}

export interface EnvProviderHealth {
  provider: string;
  hasKey: boolean;
  keyEnvVar: string;
  defaultModel: string;
  isFreeTierFriendly: boolean;
}

export interface ProviderRecommendation {
  provider: string;
  model: string;
  reason: string;
}

/** Per-provider fresh test result returned by the diagnostic endpoint */
export interface ProviderDiagnosticEntry {
  provider: string;
  label: string;
  status: 'success' | 'failed' | 'unavailable' | 'not-tested';
  lastTested: string;
  errorMessage?: string;
  modelName?: string;
  responseDurationMs?: number;
  /** Only present for openrouter — never includes any part of the key value */
  keyStatus?: 'valid' | 'invalid/empty';
}

export interface DiagnosticResponse {
  timestamp: string;
  results: DiagnosticResult[];
  providerChain: { primary: string; fallback1: string; fallback2: string };
  databaseIssues: string[];
  envProviders: EnvProviderHealth[];
  recommendation: ProviderRecommendation | null;
  summary: { passed: number; failed: number; notConfigured: number; total: number };
  /** Fresh per-provider test results — used to update provider cards immediately */
  providers: ProviderDiagnosticEntry[];
}

export async function runDiagnostic(): Promise<DiagnosticResponse> {
  // Cache-bust with timestamp to ensure fresh results on every call
  const { data } = await apiClient.post<{ success: boolean; data: DiagnosticResponse }>(
    `/diagnostic/run?_t=${Date.now()}`,
    {},
    { timeout: 120000 }, // 2 minute timeout for full diagnostic
  );
  return data.data;
}

// ─── AI Provider Diagnostic API ─────────────────────────────────────────────────

export interface DbProviderHealth {
  provider: string;
  enabled: boolean;
  configured: boolean;
  connected: boolean;
  model: string;
  errorCategory?: string;
}

export interface AiDiagnosticSummary {
  totalDbProviders: number;
  connectedDbProviders: number;
  totalEnvKeys: number;
  hasPrimary: boolean;
}

export interface AiDiagnosticResponse {
  configured: boolean;
  dbProviders: DbProviderHealth[];
  envProviders: EnvProviderHealth[];
  recommended: ProviderRecommendation | null;
  issues: string[];
  summary: AiDiagnosticSummary;
}

/**
 * Run AI provider diagnostic to check configuration status.
 * Returns detailed information about both DB and env-configured providers.
 */
export async function runAiDiagnostic(): Promise<AiDiagnosticResponse> {
  const { data } = await apiClient.get<{ success: boolean; data: AiDiagnosticResponse }>(
    '/ai/settings/diagnostic',
    { timeout: 30000 },
  );
  return data.data;
}

/**
 * Fetch the latest saved diagnostic run from the database.
 * Returns null if no diagnostic has ever been persisted.
 */
export async function getLatestDiagnosticResults(): Promise<DiagnosticResponse | null> {
  try {
    const { data } = await apiClient.get<{ success: boolean; data: DiagnosticResponse | null }>(
      '/diagnostic/latest',
      { timeout: 15000 },
    );
    return data.data ?? null;
  } catch {
    return null;
  }
}
