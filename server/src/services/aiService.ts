import crypto from 'crypto';
import { getActiveProvider, getFallbackChain } from './aiProviderService';
import { safeParseResponse, extractTextContent, sanitizeOutput } from '../utils/safeParser';

// One-time startup log flag — logs the resolved provider on first call
let _startupLogEmitted = false;

// ─── Runtime Gemini model discovery ──────────────────────────────────────────

/** Cached best-available Flash model name, discovered at startup from the Gemini API. */
export let DISCOVERED_FLASH_MODEL = 'gemini-3.5-flash-lite';

/** Structured result of the last discoverBestFlashModel call, exported for diagnostics. */
export interface ModelDiscoveryResult {
  success: boolean;
  selectedModel: string;
  flashModelsFound: string[];
  totalModelsReturned: number;
  httpStatus?: number;
  errorMessage?: string;
  timestamp: string;
}

let _lastDiscoveryResult: ModelDiscoveryResult | null = null;

/** Returns the result of the last discoverBestFlashModel call (null if never called). */
export function getLastDiscoveryResult(): ModelDiscoveryResult | null {
  return _lastDiscoveryResult;
}

/**
 * Query the Gemini Models API to discover the best available Flash model.
 * Prefers gemini-3.5-flash-lite; otherwise picks the alphabetically-last flash model.
 * Falls back silently to 'gemini-3.5-flash-lite' if the key is absent or the fetch fails.
 * Must be called AFTER dotenv.config() has loaded AI_API_KEY.
 */
export async function discoverBestFlashModel(): Promise<void> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    console.log('[AI MODELS.DISCOVER] No AI_API_KEY in env — using default flash model: gemini-3.5-flash-lite');
    _lastDiscoveryResult = {
      success: false,
      selectedModel: DISCOVERED_FLASH_MODEL,
      flashModelsFound: [],
      totalModelsReturned: 0,
      errorMessage: 'No AI_API_KEY in environment',
      timestamp: new Date().toISOString(),
    };
    return;
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { signal: AbortSignal.timeout(10000) },
    );

    if (!res.ok) {
      const errMsg = `Models API returned HTTP ${res.status}`;
      console.warn(`[AI MODELS.DISCOVER] ${errMsg} — using default flash model: gemini-3.5-flash-lite`);
      _lastDiscoveryResult = {
        success: false,
        selectedModel: DISCOVERED_FLASH_MODEL,
        flashModelsFound: [],
        totalModelsReturned: 0,
        httpStatus: res.status,
        errorMessage: errMsg,
        timestamp: new Date().toISOString(),
      };
      return;
    }

    const data = (await res.json()) as { models?: Array<{ name: string }> };
    if (!Array.isArray(data.models)) {
      const errMsg = 'Unexpected response shape from Models API (no models array)';
      console.warn(`[AI MODELS.DISCOVER] ${errMsg} — using default flash model: gemini-3.5-flash-lite`);
      _lastDiscoveryResult = {
        success: false,
        selectedModel: DISCOVERED_FLASH_MODEL,
        flashModelsFound: [],
        totalModelsReturned: 0,
        httpStatus: res.status,
        errorMessage: errMsg,
        timestamp: new Date().toISOString(),
      };
      return;
    }

    // Filter models whose name contains "flash" (case-insensitive)
    const flashModels = data.models
      .map((m) => m.name.replace(/^models\//, ''))
      .filter((name) => name.toLowerCase().includes('flash'));

    if (flashModels.length === 0) {
      console.log('[AI MODELS.DISCOVER] No flash models found via API — using default flash model: gemini-3.5-flash-lite');
      _lastDiscoveryResult = {
        success: true,
        selectedModel: DISCOVERED_FLASH_MODEL,
        flashModelsFound: [],
        totalModelsReturned: data.models.length,
        errorMessage: 'No flash models found in API response',
        timestamp: new Date().toISOString(),
      };
      return;
    }

    // Log all discovered flash models for diagnostics
    console.log(`[AI MODELS.DISCOVER] Discovered ${flashModels.length} flash model(s): ${flashModels.join(', ')}`);

    // Prefer gemini-3.5-flash-lite if available, then gemini-2.5-flash as secondary
    if (flashModels.includes('gemini-3.5-flash-lite')) {
      DISCOVERED_FLASH_MODEL = 'gemini-3.5-flash-lite';
    } else if (flashModels.includes('gemini-2.5-flash')) {
      DISCOVERED_FLASH_MODEL = 'gemini-2.5-flash';
    } else {
      // Pick the alphabetically last flash model (newest version sorts last)
      flashModels.sort();
      DISCOVERED_FLASH_MODEL = flashModels[flashModels.length - 1];
    }

    console.log(`[AI MODELS.DISCOVER] ✓ Selected flash model: ${DISCOVERED_FLASH_MODEL}`);

    _lastDiscoveryResult = {
      success: true,
      selectedModel: DISCOVERED_FLASH_MODEL,
      flashModelsFound: flashModels,
      totalModelsReturned: data.models.length,
      httpStatus: res.status,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn(
      `[AI MODELS.DISCOVER] Failed to query Models API: ${errMsg} — using default flash model: gemini-3.5-flash-lite`,
    );
    _lastDiscoveryResult = {
      success: false,
      selectedModel: DISCOVERED_FLASH_MODEL,
      flashModelsFound: [],
      totalModelsReturned: 0,
      errorMessage: `Fetch error: ${errMsg}`,
      timestamp: new Date().toISOString(),
    };
  }
}

export interface GenerateCompletionOptions {
  system?: string;
  maxTokens?: number;
}

// ─── Error categories for structured error handling ────────────────────────────

export type AIErrorCategory =
  | 'auth_failed'
  | 'rate_limited'
  | 'timeout'
  | 'network'
  | 'invalid_model'
  | 'not_configured'
  | 'all_unavailable'
  | 'unknown';

export class AIProviderError extends Error {
  category: AIErrorCategory;
  provider?: string;
  httpStatus?: number;

  constructor(message: string, category: AIErrorCategory, provider?: string, httpStatus?: number) {
    super(message);
    this.name = 'AIProviderError';
    this.category = category;
    this.provider = provider;
    this.httpStatus = httpStatus;
  }
}

// ─── Model validation helpers ──────────────────────────────────────────────────

/** Known-invalid model names mapped to their correct replacements */
const INVALID_MODEL_MAP: Record<string, string> = {
  // Deprecated Google/Gemini models → current valid equivalents
  'gemini-pro': 'gemini-3.5-flash-lite',             // deprecated alias
  'gemini-1.0-pro': 'gemini-3.5-flash-lite',         // deprecated, removed from API
  'models/gemini-1.0-pro': 'gemini-3.5-flash-lite',
  'models/gemini-pro': 'gemini-3.5-flash-lite',
  'models/gemini-2.0-flash': 'gemini-3.5-flash-lite',
  'models/gemini-2.5-flash': 'gemini-3.5-flash-lite', // strip models/ prefix
  'gemini-2.0-flash': 'gemini-3.5-flash-lite',        // deprecated June 2026
  'gemini-2.5-flash': 'gemini-3.5-flash-lite',        // returns HTTP 404 on generateContent
  'models/gemini-2.0-pro': 'gemini-2.5-pro',    // strip models/ prefix
  // Older Gemini 1.5 models — deprecated on direct Google API
  'gemini-1.5-flash': 'gemini-3.5-flash-lite',
  'gemini-1.5-pro': 'gemini-3.5-flash-lite',
  'gemini-1.5-flash-001': 'gemini-3.5-flash-lite',
  'gemini-1.5-pro-001': 'gemini-3.5-flash-lite',
  'gemini-1.5-flash-002': 'gemini-3.5-flash-lite',
  'gemini-1.5-pro-002': 'gemini-3.5-flash-lite',
  // Deprecated OpenRouter Google models → use stable paid model
  'google/gemini-pro': 'google/gemini-3.5-flash-lite',
  'google/gemini-1.0-pro': 'google/gemini-3.5-flash-lite',
  'google/gemini-1.5-flash': 'google/gemini-3.5-flash-lite',
  'google/gemini-1.5-pro': 'google/gemini-3.5-flash-lite',
  'google/gemini-1.5-flash-001': 'google/gemini-3.5-flash-lite',
  'google/gemini-1.5-pro-001': 'google/gemini-3.5-flash-lite',
  'google/gemini-2.0-flash': 'google/gemini-3.5-flash-lite', // deprecated June 2026
  'google/gemini-2.5-flash': 'google/gemini-3.5-flash-lite', // returns HTTP 404 on generateContent
  // Also map the :free variants to stable paid model for reliability
  'google/gemini-2.0-flash-exp:free': 'google/gemini-3.5-flash-lite',
  'google/gemini-2.0-flash:free': 'google/gemini-3.5-flash-lite',
  'google/gemini-2.5-flash-exp:free': 'google/gemini-3.5-flash-lite',
  // Deprecated Anthropic models
  'claude-sonnet-5': 'claude-sonnet-4-20250514',
  'claude-3-5-sonnet': 'claude-sonnet-4-20250514',
  'claude-3.5-sonnet': 'claude-sonnet-4-20250514',
  'claude-3-sonnet': 'claude-sonnet-4-20250514',
  'claude-3-haiku': 'claude-3-5-haiku-20241022',
};

/** Set of known-valid Google model identifiers (for positive validation) */
const VALID_GOOGLE_MODELS = new Set([
  // Current generation
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-2.5-pro',
  // Preview models
  'gemini-2.5-flash-preview-05-20',
  'gemini-2.5-pro-preview-05-06',
]);

/** Set of known-valid OpenRouter Google model identifiers */
const VALID_OPENROUTER_GOOGLE_MODELS = new Set([
  // Current generation (stable, recommended)
  'google/gemini-3.5-flash-lite',
  'google/gemini-3.8-flash',
  'google/gemini-2.5-pro',
  // Free tier (may have rate limits or be less reliable)
  'google/gemini-2.0-flash-exp:free',
  'google/gemini-2.0-flash:free',
  'google/gemini-2.5-flash-exp:free',
]);

/** Set of known-valid OpenRouter Anthropic model identifiers */
const VALID_OPENROUTER_ANTHROPIC_MODELS = new Set([
  'anthropic/claude-sonnet-4',
  'anthropic/claude-3.5-sonnet',
  'anthropic/claude-3.5-haiku',
  'anthropic/claude-3-opus',
  'anthropic/claude-3-sonnet',
  'anthropic/claude-3-haiku',
]);

/** Set of known-valid Anthropic model identifiers */
const VALID_ANTHROPIC_MODELS = new Set([
  'claude-sonnet-4-20250514',
  'claude-3-7-sonnet-20250219',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-haiku-20241022',
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307',
]);

/** Default valid model per provider */
const DEFAULT_MODELS: Record<string, string> = {
  openrouter: 'google/gemini-3.5-flash-lite',
  google: 'gemini-3.5-flash-lite',
  gemini: 'gemini-3.5-flash-lite',
  groq: 'llama-3.3-70b-versatile',
  openai: 'gpt-4o-mini',
  anthropic: 'claude-sonnet-4-20250514',
  cohere: 'command-r-plus',
};

/** Providers that support chat completions */
const CHAT_PROVIDERS = new Set(['google', 'gemini', 'openrouter', 'groq']);

/**
 * Strip provider prefix from a model name (e.g., "google/gemini-2.5-flash" → "gemini-2.5-flash").
 * Used when switching from OpenRouter format to direct provider API calls.
 */
function stripProviderPrefix(model: string): string {
  const slashIndex = model.indexOf('/');
  if (slashIndex > 0) {
    return model.slice(slashIndex + 1);
  }
  return model;
}

/**
 * Validate and correct a model name for a given provider.
 * Returns a corrected model name if the original is known-invalid,
 * or a default if the model is empty.
 * Also performs positive validation for Google/Gemini to catch unknown models.
 * 
 * IMPORTANT: When the model has a provider prefix (e.g., "google/gemini-2.5-flash")
 * but the target provider is the direct API (e.g., "google"), this function strips
 * the prefix to produce a valid direct-API model name.
 */
function validateModelName(provider: string, model: string): string {
  // First, check if we need to strip a provider prefix for direct API providers.
  // If the model has format "provider/model" but target is a direct API (not openrouter),
  // strip the prefix before further validation.
  if (model && model.includes('/') && provider !== 'openrouter') {
    const stripped = stripProviderPrefix(model);
    console.log(`[AI] Stripping provider prefix: "${model}" → "${stripped}" for direct ${provider} API`);
    model = stripped;
  }

  // Fix known-invalid models (check both original and stripped versions)
  if (model && INVALID_MODEL_MAP[model]) {
    const corrected = INVALID_MODEL_MAP[model];
    // If correcting to an OpenRouter format but target is direct API, strip again
    if (corrected.includes('/') && provider !== 'openrouter') {
      const finalModel = stripProviderPrefix(corrected);
      console.log(`[AI] Correcting invalid model "${model}" → "${finalModel}" for provider ${provider} (stripped from "${corrected}")`);
      return finalModel;
    }
    console.log(`[AI] Correcting invalid model "${model}" → "${corrected}" for provider ${provider}`);
    return corrected;
  }

  // Provide default if empty
  if (!model) {
    const defaultModel = DEFAULT_MODELS[provider];
    if (defaultModel) {
      console.log(`[AI] No model specified for ${provider}, using default: ${defaultModel}`);
      return defaultModel;
    }
  }

  // Positive validation for Google/Gemini — catch any model not in the known-valid set
  if (model && (provider === 'google' || provider === 'gemini')) {
    // Double-check no prefix slipped through
    if (model.includes('/')) {
      const stripped = stripProviderPrefix(model);
      console.warn(`[AI] Google model "${model}" still has prefix after processing — stripping to "${stripped}"`);
      model = stripped;
    }
    if (!VALID_GOOGLE_MODELS.has(model)) {
      console.warn(`[AI] Unknown Google model "${model}" — correcting to "gemini-3.5-flash-lite" (known-valid models: ${[...VALID_GOOGLE_MODELS].join(', ')})`);
      return 'gemini-3.5-flash-lite';
    }
  }

  // Positive validation for OpenRouter Google models
  if (model && provider === 'openrouter' && model.startsWith('google/')) {
    if (!VALID_OPENROUTER_GOOGLE_MODELS.has(model)) {
      console.warn(`[AI] Unknown OpenRouter Google model "${model}" — correcting to "google/gemini-3.5-flash-lite"`);
      return 'google/gemini-3.5-flash-lite';
    }
  }

  // Positive validation for OpenRouter Anthropic models
  if (model && provider === 'openrouter' && model.startsWith('anthropic/')) {
    if (!VALID_OPENROUTER_ANTHROPIC_MODELS.has(model)) {
      console.warn(`[AI] Unknown OpenRouter Anthropic model "${model}" — correcting to "anthropic/claude-3.5-sonnet"`);
      return 'anthropic/claude-3.5-sonnet';
    }
  }

  // For OpenRouter with non-Google/non-Anthropic models, be permissive —
  // OpenRouter supports hundreds of models and we can't maintain a complete list.
  // Only validate the format (provider/model).
  if (model && provider === 'openrouter' && !model.startsWith('google/') && !model.startsWith('anthropic/')) {
    if (!model.includes('/')) {
      console.warn(`[AI] OpenRouter model "${model}" missing provider prefix — correcting to default`);
      return DEFAULT_MODELS['openrouter'];
    }
    // Allow any well-formatted provider/model string through
  }

  // Positive validation for Anthropic models
  if (model && provider === 'anthropic') {
    // Strip any accidental prefix
    if (model.includes('/')) {
      const stripped = stripProviderPrefix(model);
      console.warn(`[AI] Anthropic model "${model}" has unexpected prefix — stripping to "${stripped}"`);
      model = stripped;
    }
    if (!VALID_ANTHROPIC_MODELS.has(model)) {
      console.warn(`[AI] Unknown Anthropic model "${model}" — correcting to "claude-sonnet-4-20250514" (known-valid models: ${[...VALID_ANTHROPIC_MODELS].join(', ')})`);
      return 'claude-sonnet-4-20250514';
    }
  }

  return model;
}

// ─── Env-based fallback config (backward compatibility) ──────────────────────

/**
 * Validates that an API key value starts with the expected prefix.
 * Returns true only when the value is non-empty AND matches the prefix.
 */
function isValidKeyFormat(value: string | undefined, requiredPrefix: string): boolean {
  return typeof value === 'string' && value.length > 0 && value.startsWith(requiredPrefix);
}

/**
 * Returns the environment variable name for a provider's API key (for log messages).
 */
function getKeyName(provider: string): string {
  // All providers now use the unified AI_API_KEY environment variable
  return 'AI_API_KEY';
}

function getEnvConfig() {
  let provider = (process.env.AI_PROVIDER || '').toLowerCase();
  let apiKey: string | undefined;

  console.log(`[AI] [ENV-CONFIG] AI_PROVIDER env var = "${process.env.AI_PROVIDER || '(not set)'}" → normalized to "${provider}"`);

  // Read the API key for the explicitly-set provider first
  if (provider) {
    console.log(`[AI] [ENV-CONFIG] Explicit provider branch: "${provider}"`);
    if (provider === 'openrouter') {
      const orKey = process.env.OPENROUTER_API_KEY;
      const aiKey = process.env.AI_API_KEY;
      console.log(`[AI] [ENV-CONFIG] OpenRouter key lookup: OPENROUTER_API_KEY=${orKey ? `"${orKey.slice(0, 8)}..." (${orKey.length} chars)` : '(not set)'}, AI_API_KEY=${aiKey ? `"${aiKey.slice(0, 8)}..." (${aiKey.length} chars)` : '(not set)'}`);
      apiKey = orKey || aiKey;
    } else if (provider === 'google' || provider === 'gemini') {
      // Try each Google key individually and pick the first one with a valid AIza prefix.
      // This prevents an invalid GEMINI_API_KEY from shadowing a valid GOOGLE_API_KEY.
      const googleCandidates = [
        process.env.GEMINI_API_KEY,
        process.env.GOOGLE_API_KEY,
        process.env.GOOGLE_AI_API_KEY,
        process.env.AI_API_KEY,
      ];
      console.log(`[AI] [ENV-CONFIG] Google candidates: ${googleCandidates.map((k, i) => k ? `[${i}]="${k.slice(0, 8)}...(${k.length})"` : `[${i}]=(not set)`).join(', ')}`);
      apiKey = googleCandidates.find((k) => k && isValidKeyFormat(k, 'AIza'))
        || googleCandidates.find((k) => !!k);  // fall back to first non-empty if none pass format check
    } else if (provider === 'groq') {
      apiKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY;
    } else if (provider === 'openai') {
      apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    } else if (provider === 'anthropic') {
      apiKey = process.env.ANTHROPIC_API_KEY || process.env.AI_API_KEY;
    } else if (provider === 'cohere') {
      apiKey = process.env.COHERE_API_KEY || process.env.AI_API_KEY;
    } else {
      apiKey = process.env.AI_API_KEY;
    }
    console.log(`[AI] [ENV-CONFIG] Selected key: ${apiKey ? `${apiKey.length} chars, prefix="${apiKey.slice(0, 8)}..."` : 'NOT FOUND'}`);
  }

  // Validate API key format for explicitly-set providers; fall back to auto-detect if invalid
  if (provider) {
    console.log(`[AI] [ENV-CONFIG] Validating key format for provider "${provider}"...`);
    let keyValid = false;
    if (provider === 'openrouter') {
      keyValid = isValidKeyFormat(apiKey, 'sk-or-v1-');
      console.log(`[AI] [ENV-CONFIG] OpenRouter format check (must start with "sk-or-v1-"): ${keyValid ? '✓ PASS' : '✗ FAIL'} (key prefix: "${apiKey ? apiKey.slice(0, 10) : 'N/A'}")`);
    } else if (provider === 'google' || provider === 'gemini') {
      keyValid = isValidKeyFormat(apiKey, 'AIza');
      console.log(`[AI] [ENV-CONFIG] Google format check (must start with "AIza"): ${keyValid ? '✓ PASS' : '✗ FAIL'} (key prefix: "${apiKey ? apiKey.slice(0, 8) : 'N/A'}")`);
    } else {
      // For other providers, just require a non-empty key
      keyValid = typeof apiKey === 'string' && apiKey.length > 0;
      console.log(`[AI] [ENV-CONFIG] Generic format check (non-empty): ${keyValid ? '✓ PASS' : '✗ FAIL'}`);
    }

    if (!keyValid) {
      console.warn(`[AI] [ENV-CONFIG] ✗ ${getKeyName(provider)} is MALFORMED — clearing provider and falling back to auto-detect`);
      provider = '';
      apiKey = undefined;
    } else {
      console.log(`[AI] [ENV-CONFIG] ✓ Explicit provider '${provider}' validated successfully`);
    }
  }

  // Auto-detect provider from available API keys if AI_PROVIDER was not set or failed validation
  if (!provider) {
    console.log('[AI] [ENV-CONFIG] 🔄 Auto-detecting provider from available API keys...');
    if (isValidKeyFormat(process.env.OPENROUTER_API_KEY, 'sk-or-v1-')) {
      provider = 'openrouter';
      console.log('[AI] [ENV-CONFIG] ✓ Auto-detected openrouter (valid sk-or-v1- key)');
    } else if (process.env.OPENROUTER_API_KEY) {
      console.warn(`[AI] [ENV-CONFIG] OPENROUTER_API_KEY exists but invalid format (prefix: "${process.env.OPENROUTER_API_KEY.slice(0, 10)}...") — skipping`);
    }

    if (!provider) {
      // Try each Google key individually — pick the first with valid AIza prefix.
      // This prevents an invalid GEMINI_API_KEY from blocking a valid GOOGLE_API_KEY.
      const googleCandidates = [
        process.env.GEMINI_API_KEY,
        process.env.GOOGLE_API_KEY,
        process.env.GOOGLE_AI_API_KEY,
      ];
      console.log(`[AI] [ENV-CONFIG] Auto-detect: checking Google candidates...`);
      const validGoogleKey = googleCandidates.find((k) => k && isValidKeyFormat(k, 'AIza'));
      if (validGoogleKey) {
        provider = 'google';
        apiKey = validGoogleKey;
        console.log(`[AI] [ENV-CONFIG] ✓ Auto-detected google (valid AIza key, prefix="${validGoogleKey.slice(0, 8)}...")`);
      } else if (googleCandidates.some((k) => !!k)) {
        console.warn(`[AI] [ENV-CONFIG] All Google/Gemini keys have invalid format — skipping. Keys found: ${googleCandidates.map((k, i) => k ? `[${i}]="${k.slice(0, 8)}..."(${k.length})` : `[${i}]=(none)`).join(', ')}`);
      }
    }

    if (!provider && process.env.ANTHROPIC_API_KEY) {
      provider = 'anthropic';
      console.log('[AI] [ENV-CONFIG] ✓ Auto-detected anthropic');
    } else if (!provider && process.env.OPENAI_API_KEY) {
      provider = 'openai';
      console.log('[AI] [ENV-CONFIG] ✓ Auto-detected openai');
    } else if (!provider && process.env.GROQ_API_KEY) {
      provider = 'groq';
      console.log('[AI] [ENV-CONFIG] ✓ Auto-detected groq');
    } else if (!provider && process.env.COHERE_API_KEY) {
      provider = 'cohere';
      console.log('[AI] [ENV-CONFIG] ✓ Auto-detected cohere');
    }

    if (provider) {
      console.log(`[AI] [ENV-CONFIG] Final auto-detected provider: "${provider}"`);
    } else {
      console.warn('[AI] [ENV-CONFIG] ✗ No valid provider found via auto-detect');
    }
  }

  // Re-read the API key after auto-detect (or if the explicit provider passed validation,
  // the key is already set above and this block is redundant but harmless)
  if (!apiKey && provider) {
    if (provider === 'openrouter') {
      apiKey = process.env.OPENROUTER_API_KEY || process.env.AI_API_KEY;
    } else if (provider === 'google' || provider === 'gemini') {
      // Pick the first Google key with a valid AIza prefix to avoid invalid keys shadowing valid ones
      const googleCandidates = [
        process.env.GEMINI_API_KEY,
        process.env.GOOGLE_API_KEY,
        process.env.GOOGLE_AI_API_KEY,
        process.env.AI_API_KEY,
      ];
      apiKey = googleCandidates.find((k) => k && isValidKeyFormat(k, 'AIza'))
        || googleCandidates.find((k) => !!k);
    } else if (provider === 'groq') {
      apiKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY;
    } else if (provider === 'openai') {
      apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    } else if (provider === 'anthropic') {
      apiKey = process.env.ANTHROPIC_API_KEY || process.env.AI_API_KEY;
    } else if (provider === 'cohere') {
      apiKey = process.env.COHERE_API_KEY || process.env.AI_API_KEY;
    } else {
      apiKey = process.env.AI_API_KEY;
    }
  }

  // Validate and correct the model name
  let model = validateModelName(provider, process.env.AI_MODEL || '');

  return {
    provider,
    model,
    apiKey,
  };
}

// ─── Provider resolution: DB-first, then env fallback ────────────────────────

interface ResolvedProvider {
  provider: string;
  model: string;
  apiKey: string;
}

/**
 * Emit a one-time startup log showing which provider was resolved.
 * This makes it immediately visible in server logs which provider is being used.
 */
function emitStartupLog(resolved: ResolvedProvider, source: 'db' | 'env'): void {
  if (_startupLogEmitted) return;
  _startupLogEmitted = true;
  const keyPrefix = resolved.apiKey ? resolved.apiKey.slice(0, 4) : 'N/A';
  console.log(`[AI] ★ Provider resolved: provider=${resolved.provider}, model=${resolved.model}, source=${source}, keyPrefix=${keyPrefix}...`);
  console.log(`[AI] ★ Discovered flash model from API: ${DISCOVERED_FLASH_MODEL}`);
}

async function resolveProvider(requestId?: string): Promise<ResolvedProvider> {
  const rid = requestId || 'no-rid';
  console.log(`[AI:${rid}] ─── resolveProvider START ───`);

  // Try DB-stored primary provider first
  try {
    console.log(`[AI:${rid}] [DB] Querying aiproviderconfigs for isPrimary=true, isEnabled=true...`);
    const dbProvider = await getActiveProvider();
    if (dbProvider) {
      console.log(`[AI:${rid}] [DB] ✓ Primary document FOUND: provider="${dbProvider.provider}", model="${dbProvider.model}", keyLength=${dbProvider.apiKey.length}, keyPrefix="${dbProvider.apiKey.slice(0, 8)}..."`);
      // Validate: skip non-chat providers (e.g., luma) that can't handle text completions
      if (!CHAT_PROVIDERS.has(dbProvider.provider)) {
        console.warn(`[AI:${rid}] [DB] ✗ Provider "${dbProvider.provider}" is NOT a chat provider (not in CHAT_PROVIDERS set) — skipping to env fallback`);
      } else {
        console.log(`[AI:${rid}] [DB] ✓ Provider "${dbProvider.provider}" IS a valid chat provider`);
        // Validate Google/Gemini API key format from DB before accepting it.
        // Google API keys must start with "AIza" and be at least 30 characters.
        // If malformed, log a warning and fall through to the env fallback chain
        // instead of sending a doomed HTTP request.
        const dbProv = dbProvider.provider.toLowerCase();
        if (dbProv === 'google' || dbProv === 'gemini') {
          // For Google/Gemini providers, ALWAYS prefer the fresh GEMINI_API_KEY from
          // environment over whatever is stored (possibly stale) in the DB.
          // This ensures the runtime uses the current secret even if the DB holds
          // an old encrypted value from a previous seed run.
          const freshEnvKey = process.env.GEMINI_API_KEY;
          console.log(`[AI:${rid}] [DB-Google] Checking fresh GEMINI_API_KEY from env: ${freshEnvKey ? `SET (${freshEnvKey.length} chars, prefix="${freshEnvKey.slice(0, 8)}...")` : 'NOT SET'}`);
          if (freshEnvKey && isValidKeyFormat(freshEnvKey, 'AIza')) {
            console.log(`[AI:${rid}] [DB-Google] ✓ Fresh env key passes AIza format validation — using it (overriding DB value)`);
            const correctedModel = validateModelName(dbProvider.provider, dbProvider.model);
            const resolved = {
              provider: dbProvider.provider,
              model: correctedModel,
              apiKey: freshEnvKey,
            };
            console.log(`[AI:${rid}] [RESULT] source=db+envOverride, provider=${resolved.provider}, model=${resolved.model}, keyPrefix="${resolved.apiKey.slice(0, 8)}..."`);
            emitStartupLog(resolved, 'db');
            return resolved;
          }

          // No valid env key — fall back to the DB key if it passes format validation
          console.log(`[AI:${rid}] [DB-Google] Validating DB decrypted key: length=${dbProvider.apiKey.length}, startsWithAIza=${dbProvider.apiKey.startsWith('AIza')}, prefix="${dbProvider.apiKey.slice(0, 8)}..."`);
          if (!dbProvider.apiKey.startsWith('AIza') || dbProvider.apiKey.length < 30) {
            console.warn(
              `[AI:${rid}] [DB-Google] ✗ DB key FAILED format validation (expected prefix "AIza", min 30 chars; got ${dbProvider.apiKey.length} chars, ` +
              `prefix "${dbProvider.apiKey.slice(0, 4)}"). No valid GEMINI_API_KEY in env either. Falling through to env fallback.`
            );
            // Fall through to env fallback below
          } else {
            // DB key is valid format and no fresh env override available — use DB key
            const correctedModel = validateModelName(dbProvider.provider, dbProvider.model);
            const resolved = {
              provider: dbProvider.provider,
              model: correctedModel,
              apiKey: dbProvider.apiKey,
            };
            console.log(`[AI:${rid}] [RESULT] source=db, provider=${resolved.provider}, model=${resolved.model}, keyPrefix="${resolved.apiKey.slice(0, 8)}..."`);
            emitStartupLog(resolved, 'db');
            return resolved;
          }
        } else if (dbProv === 'openrouter') {
          // For OpenRouter, ALWAYS prefer the fresh OPENROUTER_API_KEY from
          // environment over whatever is stored (possibly stale) in the DB.
          const freshEnvKey = process.env.OPENROUTER_API_KEY;
          console.log(`[AI:${rid}] [DB-OpenRouter] Checking fresh OPENROUTER_API_KEY from env: ${freshEnvKey ? `SET (${freshEnvKey.length} chars, prefix="${freshEnvKey.slice(0, 8)}...")` : 'NOT SET'}`);
          if (freshEnvKey && isValidKeyFormat(freshEnvKey, 'sk-or-v1-')) {
            console.log(`[AI:${rid}] [DB-OpenRouter] ✓ Fresh env key passes sk-or-v1- format validation — using it (overriding DB value)`);
            const correctedModel = validateModelName(dbProvider.provider, dbProvider.model);
            const resolved = {
              provider: dbProvider.provider,
              model: correctedModel,
              apiKey: freshEnvKey,
            };
            console.log(`[AI:${rid}] [RESULT] source=db+envOverride, provider=${resolved.provider}, model=${resolved.model}, keyPrefix="${resolved.apiKey.slice(0, 8)}..."`);
            emitStartupLog(resolved, 'db');
            return resolved;
          }

          // No valid env key — validate the DB key format
          console.log(`[AI:${rid}] [DB-OpenRouter] Validating DB decrypted key: length=${dbProvider.apiKey.length}, startsWithSkOrV1=${dbProvider.apiKey.startsWith('sk-or-v1-')}, prefix="${dbProvider.apiKey.slice(0, 8)}..."`);
          if (!dbProvider.apiKey.startsWith('sk-or-v1-') || dbProvider.apiKey.length < 20) {
            console.warn(
              `[AI:${rid}] [DB-OpenRouter] ✗ DB key FAILED format validation (expected prefix "sk-or-v1-", min 20 chars; got ${dbProvider.apiKey.length} chars, ` +
              `prefix "${dbProvider.apiKey.slice(0, 8)}"). No valid OPENROUTER_API_KEY in env either. Falling through to env fallback.`
            );
            // Fall through to env fallback below
          } else {
            const correctedModel = validateModelName(dbProvider.provider, dbProvider.model);
            const resolved = {
              provider: dbProvider.provider,
              model: correctedModel,
              apiKey: dbProvider.apiKey,
            };
            console.log(`[AI:${rid}] [RESULT] source=db, provider=${resolved.provider}, model=${resolved.model}, keyPrefix="${resolved.apiKey.slice(0, 8)}..."`);
            emitStartupLog(resolved, 'db');
            return resolved;
          }
        } else {
          // Other non-Google/non-OpenRouter provider — accept as-is
          // Validate and correct model name from DB
          const correctedModel = validateModelName(dbProvider.provider, dbProvider.model);
          const resolved = {
            provider: dbProvider.provider,
            model: correctedModel,
            apiKey: dbProvider.apiKey,
          };
          console.log(`[AI:${rid}] [RESULT] source=db, provider=${resolved.provider}, model=${resolved.model}, keyPrefix="${resolved.apiKey.slice(0, 8)}..."`);
          emitStartupLog(resolved, 'db');
          return resolved;
        }
      }
    } else {
      console.log(`[AI:${rid}] [DB] ✗ No active primary provider found in DB (query returned null) — falling back to env vars`);
    }
  } catch (err) {
    console.error(`[AI:${rid}] [DB] ✗ Query FAILED:`, err instanceof Error ? err.message : err);
    console.error(`[AI:${rid}] [DB] DB query failed — will attempt env var fallback`);
    // DB unavailable — fall through to env
  }

  // Fall back to environment variables
  console.log(`[AI:${rid}] [ENV] Calling getEnvConfig()...`);
  const env = getEnvConfig();
  console.log(`[AI:${rid}] [ENV] Result: provider="${env.provider}", model="${env.model}", apiKey=${env.apiKey ? 'SET (' + env.apiKey.length + ' chars, prefix="' + env.apiKey.slice(0, 8) + '...")' : 'NOT SET'}`);

  if (!env.apiKey) {
    console.error(`[AI:${rid}] [ENV] ✗ No AI provider configured. No DB primary provider found and no AI_API_KEY or provider-specific key in .env`);
    throw new AIProviderError(
      'AI service not configured. Please contact support to set up an AI provider.',
      'not_configured',
    );
  }

  // Validate provider name is supported before returning
  const supportedProviders = ['anthropic', 'openai', 'google', 'gemini', 'cohere', 'openrouter', 'groq'];
  const resolvedProviderName = env.provider || 'anthropic';
  if (!supportedProviders.includes(resolvedProviderName)) {
    console.error(`[AI:${rid}] [ENV] ✗ Unsupported provider "${resolvedProviderName}" from env — treating as not_configured`);
    throw new AIProviderError(
      'AI service not configured. Please contact support.',
      'not_configured',
      resolvedProviderName,
    );
  }

  const resolved = { provider: resolvedProviderName, model: env.model, apiKey: env.apiKey };
  console.log(`[AI:${rid}] [RESULT] source=env, provider=${resolved.provider}, model=${resolved.model}, keyPrefix="${resolved.apiKey.slice(0, 8)}..."`);
  emitStartupLog(resolved, 'env');
  return resolved;
}

// ─── Core generation with multi-provider support via REST ────────────────────

const REQUEST_TIMEOUT_MS = 38000; // 38 seconds per provider — below the 45s route timeout

/**
 * Classify an HTTP error from a provider into an AIErrorCategory.
 * Returns distinct categories so the frontend can show appropriate messages:
 * - 401/403 → "auth_failed" (invalid API key)
 * - 404 with model not found → "invalid_model" (configuration error)
 * - 429 → "rate_limited" (transient, retry may help)
 * - 500/502/503 → "server_error" (transient, retry may help)
 * - Other errors → "unknown"
 */
function classifyHttpError(status: number, body: string, provider: string): AIProviderError {
  const lowerBody = body.toLowerCase();

  // Authentication failures — configuration error, not transient
  if (status === 401 || status === 403) {
    console.error(`[AI] ${provider} authentication failed (HTTP ${status}): ${body.slice(0, 300)}`);
    return new AIProviderError(
      `${provider} authentication failed. Please check your API key or contact support.`,
      'auth_failed',
      provider,
      status,
    );
  }

  // Rate limiting — transient, retry may help
  if (status === 429) {
    const isQuota = lowerBody.includes('quota') || lowerBody.includes('exceeded');
    console.warn(`[AI] ${provider} rate limited (HTTP 429): ${isQuota ? 'quota exceeded' : 'rate limit hit'}. Body: ${body.slice(0, 200)}`);
    return new AIProviderError(
      `${provider} ${isQuota ? 'quota exceeded' : 'rate limited'}. Please wait a moment and try again.`,
      'rate_limited',
      provider,
      429,
    );
  }

  // Model not found — configuration error, not transient
  if (status === 404) {
    const isModelNotFound = lowerBody.includes('model') || lowerBody.includes('not found');
    console.error(`[AI] ${provider} returned 404 (model not found): ${body.slice(0, 300)}`);
    return new AIProviderError(
      `${provider} model not found. Please check your model configuration or contact support.`,
      'invalid_model',
      provider,
      404,
    );
  }

  // Server errors — transient, retry may help
  if (status >= 500) {
    console.warn(`[AI] ${provider} server error (HTTP ${status}): ${body.slice(0, 200)}`);
    return new AIProviderError(
      `${provider} is temporarily unavailable. Please try again later.`,
      'network', // Keep as network for fallback purposes, but message indicates server error
      provider,
      status,
    );
  }

  // Unknown errors
  console.error(`[AI] ${provider} unexpected error (HTTP ${status}): ${body.slice(0, 300)}`);
  return new AIProviderError(
    `${provider} returned an unexpected error (HTTP ${status}).`,
    'unknown',
    provider,
    status,
  );
}

async function generateWithProvider(
  resolved: ResolvedProvider,
  prompt: string,
  options?: GenerateCompletionOptions,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const requestId = crypto.randomUUID().slice(0, 8);
  const startTime = Date.now();

  try {
    const provider = resolved.provider.toLowerCase();
    console.log(`[AI:${requestId}] Calling ${provider} API (model: ${resolved.model})...`);

    // ── Anthropic ──────────────────────────────────────────────────────────
    if (provider === 'anthropic') {
      const body: Record<string, unknown> = {
        model: resolved.model,
        max_tokens: options?.maxTokens ?? 1024,
        messages: [{ role: 'user', content: prompt }],
      };
      if (options?.system) {
        body.system = options.system;
      }

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': resolved.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[AI:${requestId}] Anthropic error (${res.status}): ${errorText.slice(0, 200)}`);
        throw classifyHttpError(res.status, errorText, 'anthropic');
      }

      const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
      const textBlock = data.content?.find((block) => block.type === 'text');
      const rawContent = textBlock?.type === 'text' ? textBlock.text || '' : '';
      
      // Use safe parser to handle malformed responses
      const parsed = safeParseResponse(rawContent);
      if (parsed.isError) {
        console.error(`[AI:${requestId}] Anthropic returned error in response body: ${extractTextContent(parsed).slice(0, 200)}`);
        throw new AIProviderError(
          extractTextContent(parsed) || 'Anthropic returned an error response',
          'unknown',
          'anthropic',
        );
      }
      
      const result = sanitizeOutput(extractTextContent(parsed));
      if (!result) {
        console.warn(`[AI:${requestId}] Anthropic returned empty content after sanitization`);
      }
      console.log(`[AI:${requestId}] Anthropic OK (${Date.now() - startTime}ms, ${result.length} chars)`);
      return result;
    }

    // ── OpenAI ─────────────────────────────────────────────────────────────
    if (provider === 'openai') {
      const messages: Array<{ role: string; content: string }> = [];
      if (options?.system) {
        messages.push({ role: 'system', content: options.system });
      }
      messages.push({ role: 'user', content: prompt });

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resolved.apiKey}`,
        },
        body: JSON.stringify({
          model: resolved.model,
          max_tokens: options?.maxTokens ?? 1024,
          messages,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[AI:${requestId}] OpenAI error (${res.status}): ${errorText.slice(0, 200)}`);
        throw classifyHttpError(res.status, errorText, 'openai');
      }

      const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const rawContent = data.choices?.[0]?.message?.content || '';
      
      // Use safe parser to handle malformed responses
      const parsed = safeParseResponse(rawContent);
      if (parsed.isError) {
        console.error(`[AI:${requestId}] OpenAI returned error in response body: ${extractTextContent(parsed).slice(0, 200)}`);
        throw new AIProviderError(
          extractTextContent(parsed) || 'OpenAI returned an error response',
          'unknown',
          'openai',
        );
      }
      
      const result = sanitizeOutput(extractTextContent(parsed));
      if (!result) {
        console.warn(`[AI:${requestId}] OpenAI returned empty content after sanitization`);
      }
      console.log(`[AI:${requestId}] OpenAI OK (${Date.now() - startTime}ms, ${result.length} chars)`);
      return result;
    }

    // ── Google / Gemini ────────────────────────────────────────────────────
    if (provider === 'google' || provider === 'gemini') {
      // Validate API key format before sending the HTTP request.
      // Google API keys must start with "AIza" and be at least 30 characters.
      // Fail fast with a clear diagnostic instead of sending a doomed request.
      if (!resolved.apiKey.startsWith('AIza') || resolved.apiKey.length < 30) {
        console.error(
          `[AI:${requestId}] ✗ Google API key is missing or malformed ` +
          `(expected prefix "AIza", min 30 chars; got ${resolved.apiKey.length} chars, ` +
          `prefix "${resolved.apiKey.slice(0, 4)}"). Aborting request.`
        );
        throw new AIProviderError(
          'Google API key is missing or malformed (expected prefix AIza)',
          'auth_failed',
          provider,
        );
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${resolved.model}:generateContent?key=${resolved.apiKey}`;

      const contents = [{ parts: [{ text: prompt }] }];
      const body: Record<string, unknown> = {
        contents,
        generationConfig: {
          maxOutputTokens: options?.maxTokens ?? 1024,
        },
      };

      if (options?.system) {
        body.system_instruction = { parts: [{ text: options.system }] };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[AI:${requestId}] Google error (${res.status}): ${errorText.slice(0, 200)}`);
        throw classifyHttpError(res.status, errorText, 'google');
      }

      const data = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Use safe parser to handle malformed responses
      const parsed = safeParseResponse(rawContent);
      if (parsed.isError) {
        console.error(`[AI:${requestId}] Google returned error in response body: ${extractTextContent(parsed).slice(0, 200)}`);
        throw new AIProviderError(
          extractTextContent(parsed) || 'Google returned an error response',
          'unknown',
          'google',
        );
      }
      
      const result = sanitizeOutput(extractTextContent(parsed));
      if (!result) {
        console.warn(`[AI:${requestId}] Google returned empty content after sanitization`);
      }
      console.log(`[AI:${requestId}] Google OK (${Date.now() - startTime}ms, ${result.length} chars)`);
      return result;
    }

    // ── Cohere ─────────────────────────────────────────────────────────────
    if (provider === 'cohere') {
      const body: Record<string, unknown> = {
        model: resolved.model,
        message: prompt,
        max_tokens: options?.maxTokens ?? 1024,
      };

      if (options?.system) {
        body.preamble = options.system;
      }

      const res = await fetch('https://api.cohere.ai/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resolved.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[AI:${requestId}] Cohere error (${res.status}): ${errorText.slice(0, 200)}`);
        throw classifyHttpError(res.status, errorText, 'cohere');
      }

      const data = (await res.json()) as { text?: string };
      const rawContent = data.text || '';
      
      // Use safe parser to handle malformed responses
      const parsed = safeParseResponse(rawContent);
      if (parsed.isError) {
        console.error(`[AI:${requestId}] Cohere returned error in response body`);
        throw new AIProviderError(
          extractTextContent(parsed) || 'Cohere returned an error response',
          'unknown',
          'cohere',
        );
      }
      
      const result = sanitizeOutput(extractTextContent(parsed));
      console.log(`[AI:${requestId}] Cohere OK (${Date.now() - startTime}ms, ${result.length} chars)`);
      return result;
    }

    // ── OpenRouter (OpenAI-compatible REST API) ─────────────────────────────
    if (provider === 'openrouter') {
      const messages: Array<{ role: string; content: string }> = [];
      if (options?.system) {
        messages.push({ role: 'system', content: options.system });
      }
      messages.push({ role: 'user', content: prompt });

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resolved.apiKey}`,
          'HTTP-Referer': process.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'https://mgbusinessintelligence.com',
          'X-Title': 'MG Blessed Beginnings',
        },
        body: JSON.stringify({
          model: resolved.model,
          max_tokens: options?.maxTokens ?? 1024,
          messages,
          stream: false,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[AI:${requestId}] OpenRouter error (${res.status}): ${errorText.slice(0, 200)}`);
        throw classifyHttpError(res.status, errorText, 'openrouter');
      }

      const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const rawContent = data.choices?.[0]?.message?.content;
      
      // Use safe parser to handle malformed responses
      if (!rawContent) {
        throw new AIProviderError('OpenRouter returned empty response', 'unknown', 'openrouter');
      }
      
      const parsed = safeParseResponse(rawContent);
      if (parsed.isError) {
        console.error(`[AI:${requestId}] OpenRouter returned error in response body`);
        throw new AIProviderError(
          extractTextContent(parsed) || 'OpenRouter returned an error response',
          'unknown',
          'openrouter',
        );
      }
      
      const result = sanitizeOutput(extractTextContent(parsed));
      console.log(`[AI:${requestId}] OpenRouter OK (${Date.now() - startTime}ms, ${result.length} chars)`);
      return result;
    }

    // ── Groq (OpenAI-compatible REST API, free tier) ─────────────────────────
    if (provider === 'groq') {
      const messages: Array<{ role: string; content: string }> = [];
      if (options?.system) {
        messages.push({ role: 'system', content: options.system });
      }
      messages.push({ role: 'user', content: prompt });

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resolved.apiKey}`,
        },
        body: JSON.stringify({
          model: resolved.model,
          max_tokens: options?.maxTokens ?? 1024,
          messages,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[AI:${requestId}] Groq error (${res.status}): ${errorText.slice(0, 200)}`);
        throw classifyHttpError(res.status, errorText, 'groq');
      }

      const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const rawContent = data.choices?.[0]?.message?.content;
      
      // Use safe parser to handle malformed responses
      if (!rawContent) {
        throw new AIProviderError('Groq returned empty response', 'unknown', 'groq');
      }
      
      const parsed = safeParseResponse(rawContent);
      if (parsed.isError) {
        console.error(`[AI:${requestId}] Groq returned error in response body`);
        throw new AIProviderError(
          extractTextContent(parsed) || 'Groq returned an error response',
          'unknown',
          'groq',
        );
      }
      
      const result = sanitizeOutput(extractTextContent(parsed));
      console.log(`[AI:${requestId}] Groq OK (${Date.now() - startTime}ms, ${result.length} chars)`);
      return result;
    }

    // ── Luma (video generation — not a chat provider) ───────────────────────
    // Luma Dream Machine is a video generation API, not a text chat API.
    // If it reaches here, skip it gracefully rather than crashing the chain.
    if (provider === 'luma') {
      console.warn(`[AI:${requestId}] Luma is a video-generation provider, not a chat provider — skipping`);
      throw new AIProviderError(
        'Luma is a video-generation provider and cannot handle chat completions',
        'invalid_model', // Use invalid_model so fallback continues
        'luma',
      );
    }

    throw new AIProviderError(`Unsupported AI provider: "${resolved.provider}"`, 'not_configured', resolved.provider);
  } catch (err) {
    // If it's already our typed error, rethrow
    if (err instanceof AIProviderError) {
      throw err;
    }

    // Handle abort/timeout
    if (err instanceof Error && (err.name === 'AbortError' || err.message.includes('aborted'))) {
      throw new AIProviderError(
        `${resolved.provider} request timed out after ${REQUEST_TIMEOUT_MS}ms`,
        'timeout',
        resolved.provider,
      );
    }

    // Network errors
    if (err instanceof Error && (err.message.includes('fetch failed') || err.message.includes('ECONNREFUSED'))) {
      throw new AIProviderError(
        `Network error connecting to ${resolved.provider}`,
        'network',
        resolved.provider,
      );
    }

    // Unknown errors
    console.error(`[AI] Unexpected error from ${resolved.provider}:`, err instanceof Error ? err.message : err);
    throw new AIProviderError(
      err instanceof Error ? err.message : 'Unknown error',
      'unknown',
      resolved.provider,
    );
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Determines if an error should trigger fallback to another provider.
 * 
 * FALLBACK TRIGGERS (transient errors):
 * - rate_limited: 429 rate limits, quota exceeded
 * - timeout: Request timed out
 * - network: Network failures, DNS issues, connection refused
 * - auth_failed: Invalid API key (might work with different provider)
 * - not_configured: Unsupported provider type (e.g., luma for chat) — try other providers
 * - invalid_model: Model doesn't exist on this provider — try a different one
 * - unknown: Catch-all, try fallback as safety net
 * 
 * NO FALLBACK:
 * - Only when we've exhausted ALL providers (handled by generateCompletion)
 */
function shouldFallback(err: unknown): boolean {
  if (err instanceof AIProviderError) {
    // All error categories should trigger fallback to try other providers.
    // Even "permanent" errors like not_configured or invalid_model are only
    // permanent for THIS specific provider — other providers may work fine.
    console.log(`[AI] Error category "${err.category}" from provider "${err.provider || 'unknown'}" — will attempt fallback`);
    return true;
  }
  
  // Non-typed errors — try fallback
  return true;
}

/**
 * Build a fallback chain from environment variables.
 * Used as a safety net when DB-configured providers fail.
 * Tries each provider that has a valid API key in .env.
 */
function getEnvFallbackChain(primaryProvider: string): ResolvedProvider[] {
  const fallbacks: ResolvedProvider[] = [];

  // Define candidate providers in strict priority order:
  // 1. Google/Gemini — primary, generous free tier, runtime model discovery
  // 2. OpenRouter — broad model access, reliable fallback
  // 3. Groq — fast, free inference
  // 4. OpenAI — paid last resort
  const candidates: Array<{ provider: string; keyEnvVars: string[]; defaultModel: string }> = [
    { provider: 'google', keyEnvVars: ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'GOOGLE_AI_API_KEY'], defaultModel: 'gemini-3.5-flash-lite' },
    { provider: 'openrouter', keyEnvVars: ['OPENROUTER_API_KEY'], defaultModel: 'google/gemini-3.5-flash-lite' },
    { provider: 'groq', keyEnvVars: ['GROQ_API_KEY'], defaultModel: 'llama-3.3-70b-versatile' },
    { provider: 'openai', keyEnvVars: ['OPENAI_API_KEY'], defaultModel: 'gpt-4o-mini' },
  ];

  for (const candidate of candidates) {
    // Skip the primary provider we already tried
    if (candidate.provider === primaryProvider) continue;

    // Find a valid API key for this candidate
    let apiKey: string | undefined;
    for (const envVar of candidate.keyEnvVars) {
      const val = process.env[envVar];
      if (val && val.trim().length > 0) {
        apiKey = val;
        break;
      }
    }

    if (apiKey) {
      fallbacks.push({
        provider: candidate.provider,
        model: candidate.defaultModel,
        apiKey,
      });
    }
  }

  // Last resort: if AI_API_KEY exists but no specific provider key matched above,
  // try using it with Google (most common default for generic AI keys)
  if (fallbacks.length === 0 || !fallbacks.some(f => f.provider !== primaryProvider)) {
    const aiKey = process.env.AI_API_KEY;
    if (aiKey && aiKey.trim().length > 0 && primaryProvider !== 'google') {
      // Check if we haven't already added google via specific keys
      if (!fallbacks.some(f => f.provider === 'google')) {
        console.log('[AI] Adding AI_API_KEY as last-resort Google fallback');
        fallbacks.push({
          provider: 'google',
          model: 'gemini-3.5-flash-lite',
          apiKey: aiKey,
        });
      }
    }
  }

  return fallbacks;
}

/** Structured result of the last generateCompletion call, exported for diagnostics. */
export interface GenerationDiagnostic {
  success: boolean;
  resolvedProvider?: string;
  resolvedModel?: string;
  keySource?: 'db' | 'env';
  keyPrefix?: string;
  providersTried: string[];
  errorDetails: Array<{ provider: string; category: string; httpStatus?: number; message: string }>;
  responseLength?: number;
  durationMs?: number;
  timestamp: string;
}

let _lastGenerationDiagnostic: GenerationDiagnostic | null = null;

/** Returns the diagnostic trace from the last generateCompletion call (null if never called). */
export function getLastGenerationDiagnostic(): GenerationDiagnostic | null {
  return _lastGenerationDiagnostic;
}

export async function generateCompletion(
  prompt: string,
  options?: GenerateCompletionOptions,
): Promise<string> {
  const requestId = crypto.randomUUID().slice(0, 8);
  let lastError: Error | undefined;
  const triedProviders: string[] = [];
  const errorDetails: Array<{ provider: string; category: string; httpStatus?: number; message: string }> = [];
  const genStartTime = Date.now();
  // Overall deadline for the entire fallback chain — must stay below the route-level
  // timeout (45s) so we always throw before Express cuts the connection.
  const OVERALL_DEADLINE_MS = 42_000;
  let resolvedProviderName = '';
  let resolvedModelName = '';
  let resolvedKeySource: 'db' | 'env' = 'env';
  let resolvedKeyPrefix = '';

  console.log(`[AI:${requestId}] ╔══════════════════════════════════════════╗`);
  console.log(`[AI:${requestId}] ║   generateCompletion START               ║`);
  console.log(`[AI:${requestId}] ╚══════════════════════════════════════════╝`);
  console.log(`[AI:${requestId}] Prompt length: ${prompt.length} chars, first 80: "${prompt.slice(0, 80)}..."`);
  console.log(`[AI:${requestId}] Options: ${JSON.stringify(options || {})}`);
  console.log(`[AI:${requestId}] ── ENV SNAPSHOT ──`);
  console.log(`[AI:${requestId}]   AI_PROVIDER="${process.env.AI_PROVIDER || '(not set)'}"`);
  console.log(`[AI:${requestId}]   AI_MODEL="${process.env.AI_MODEL || '(not set)'}"`);
  console.log(`[AI:${requestId}]   OPENROUTER_API_KEY=${process.env.OPENROUTER_API_KEY ? 'SET (' + process.env.OPENROUTER_API_KEY.length + ' chars, prefix="' + process.env.OPENROUTER_API_KEY.slice(0, 8) + '...")' : '(not set)'}`);
  console.log(`[AI:${requestId}]   GEMINI_API_KEY=${process.env.GEMINI_API_KEY ? 'SET (' + process.env.GEMINI_API_KEY.length + ' chars, prefix="' + process.env.GEMINI_API_KEY.slice(0, 8) + '...")' : '(not set)'}`);
  console.log(`[AI:${requestId}]   GOOGLE_API_KEY=${process.env.GOOGLE_API_KEY ? 'SET (' + process.env.GOOGLE_API_KEY.length + ' chars, prefix="' + process.env.GOOGLE_API_KEY.slice(0, 8) + '...")' : '(not set)'}`);
  console.log(`[AI:${requestId}]   AI_API_KEY=${process.env.AI_API_KEY ? 'SET (' + process.env.AI_API_KEY.length + ' chars, prefix="' + process.env.AI_API_KEY.slice(0, 8) + '...")' : '(not set)'}`);
  console.log(`[AI:${requestId}]   ANTHROPIC_API_KEY=${process.env.ANTHROPIC_API_KEY ? 'SET (prefix="' + process.env.ANTHROPIC_API_KEY.slice(0, 8) + '...")' : '(not set)'}`);

  // Try the primary/resolved provider first
  try {
    const primary = await resolveProvider(requestId);
    triedProviders.push(primary.provider);
    resolvedProviderName = primary.provider;
    resolvedModelName = primary.model;
    resolvedKeyPrefix = primary.apiKey ? primary.apiKey.slice(0, 4) : '';
    // Determine key source by checking if DB has a matching active provider
    try {
      const dbProvider = await getActiveProvider();
      resolvedKeySource = (dbProvider && dbProvider.provider === primary.provider) ? 'db' : 'env';
    } catch {
      resolvedKeySource = 'env';
    }
    console.log(`[AI:${requestId}] ── PRIMARY PROVIDER RESOLVED ──`);
    console.log(`[AI:${requestId}]   Provider: ${primary.provider}`);
    console.log(`[AI:${requestId}]   Model: ${primary.model}`);
    console.log(`[AI:${requestId}]   Key length: ${primary.apiKey.length} chars`);
    console.log(`[AI:${requestId}]   Key prefix: "${primary.apiKey.slice(0, 8)}..."`);
    console.log(`[AI:${requestId}] Calling generateWithProvider...`);
    const result = await generateWithProvider(primary, prompt, options);
    console.log(`[AI:${requestId}] ✓ Primary provider SUCCEEDED (${primary.provider}/${primary.model}, source=${resolvedKeySource}). Response length: ${result.length}`);

    // Store successful diagnostic
    _lastGenerationDiagnostic = {
      success: true,
      resolvedProvider: resolvedProviderName,
      resolvedModel: resolvedModelName,
      keySource: resolvedKeySource,
      keyPrefix: resolvedKeyPrefix,
      providersTried: [...triedProviders],
      errorDetails: [...errorDetails],
      responseLength: result.length,
      durationMs: Date.now() - genStartTime,
      timestamp: new Date().toISOString(),
    };

    return result;
  } catch (primaryError) {
    lastError = primaryError instanceof Error ? primaryError : new Error(String(primaryError));
    const category = primaryError instanceof AIProviderError ? primaryError.category : 'unknown';
    const provider = primaryError instanceof AIProviderError ? primaryError.provider : 'unknown';
    const httpStatus = primaryError instanceof AIProviderError ? primaryError.httpStatus : undefined;
    
    // Log detailed diagnostic information
    console.error(`[AI:${requestId}] ✗ PRIMARY PROVIDER FAILED:`);
    console.error(`[AI:${requestId}]   Provider: ${provider}`);
    console.error(`[AI:${requestId}]   Category: ${category}`);
    console.error(`[AI:${requestId}]   HTTP Status: ${httpStatus || 'N/A'}`);
    console.error(`[AI:${requestId}]   Message: ${lastError.message.slice(0, 200)}`);
    
    errorDetails.push({ provider: provider || 'unknown', category, httpStatus, message: lastError.message });

    // Always attempt fallback — even "permanent" errors for one provider may not apply to others.
    // The only case where we skip fallback is if no other providers exist at all.

    // If primary fails, try the DB fallback chain first
    try {
      const chain = await getFallbackChain();
      console.log(`[AI:${requestId}] DB fallback chain has ${chain.length} provider(s): ${chain.map(p => `${p.provider}/${p.model}`).join(', ') || '(none)'}`);

      let fallbackAttempts = 0;
      const MAX_FALLBACK_ATTEMPTS = 5; // increased to cover more providers

      for (const fallback of chain) {
        if (fallbackAttempts >= MAX_FALLBACK_ATTEMPTS) {
          console.log(`[AI:${requestId}] Max DB fallback attempts (${MAX_FALLBACK_ATTEMPTS}) reached — stopping DB chain`);
          break;
        }

        // Check overall deadline before attempting another provider
        const elapsed = Date.now() - genStartTime;
        if (elapsed > OVERALL_DEADLINE_MS) {
          console.warn(`[AI:${requestId}] Overall deadline exceeded (${elapsed}ms > ${OVERALL_DEADLINE_MS}ms) — stopping DB fallback chain`);
          lastError = new AIProviderError(
            `AI generation timed out after trying ${triedProviders.join(', ')}`,
            'timeout',
            undefined,
          );
          break;
        }

        // Skip if it's the same provider+model combo we already tried
        if (triedProviders.includes(fallback.provider)) {
          console.log(`[AI:${requestId}] Skipping DB fallback ${fallback.provider} — already tried`);
          continue;
        }

        fallbackAttempts++;
        triedProviders.push(fallback.provider);
        console.log(`[AI:${requestId}] Trying DB fallback ${fallbackAttempts}: ${fallback.provider}/${fallback.model}`);

        try {
          const result = await generateWithProvider(fallback, prompt, options);
          console.log(`[AI:${requestId}] ✓ DB fallback SUCCEEDED (${fallback.provider}/${fallback.model}, fallback #${fallbackAttempts}). Response length: ${result.length}`);
          return result;
        } catch (fallbackErr) {
          const fbCategory = fallbackErr instanceof AIProviderError ? fallbackErr.category : 'unknown';
          const fbStatus = fallbackErr instanceof AIProviderError ? fallbackErr.httpStatus : undefined;
          const fbMessage = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
          
          console.error(`[AI:${requestId}] DB FALLBACK FAILED:`);
          console.error(`[AI:${requestId}]   Provider: ${fallback.provider}`);
          console.error(`[AI:${requestId}]   Category: ${fbCategory}`);
          console.error(`[AI:${requestId}]   HTTP Status: ${fbStatus || 'N/A'}`);
          console.error(`[AI:${requestId}]   Message: ${fbMessage}`);
          
          errorDetails.push({ provider: fallback.provider, category: fbCategory, httpStatus: fbStatus, message: fbMessage });
          lastError = fallbackErr instanceof Error ? fallbackErr : new Error(String(fallbackErr));
          // Continue to next fallback regardless of error category
        }
      }
    } catch (chainErr) {
      console.error(`[AI:${requestId}] Failed to retrieve DB fallback chain:`, chainErr instanceof Error ? chainErr.message : chainErr);
    }

    // ALWAYS try env-based fallback providers after DB chain is exhausted.
    // This is the critical safety net — even if all DB-configured providers fail,
    // environment variables may have different/working API keys.
    try {
      const primaryProviderName = triedProviders[0] || '';
      const envFallbacks = getEnvFallbackChain(primaryProviderName);
      console.log(`[AI:${requestId}] Env fallback chain has ${envFallbacks.length} provider(s): ${envFallbacks.map(p => p.provider).join(', ') || '(none)'}`);

      for (const envFallback of envFallbacks) {
        // Check overall deadline before attempting another provider
        const elapsed = Date.now() - genStartTime;
        if (elapsed > OVERALL_DEADLINE_MS) {
          console.warn(`[AI:${requestId}] Overall deadline exceeded (${elapsed}ms > ${OVERALL_DEADLINE_MS}ms) — stopping env fallback chain`);
          lastError = new AIProviderError(
            `AI generation timed out after trying ${triedProviders.join(', ')}`,
            'timeout',
            undefined,
          );
          break;
        }

        // Skip if we already tried this provider (from DB chain or as primary)
        if (triedProviders.includes(envFallback.provider)) {
          console.log(`[AI:${requestId}] Skipping env fallback ${envFallback.provider} — already tried`);
          continue;
        }

        triedProviders.push(envFallback.provider);
        console.log(`[AI:${requestId}] Trying env fallback: ${envFallback.provider}/${envFallback.model}`);

        try {
          const result = await generateWithProvider(envFallback, prompt, options);
          console.log(`[AI:${requestId}] ✓ Env fallback SUCCEEDED (${envFallback.provider}/${envFallback.model}, fallback). Response length: ${result.length}`);
          return result;
        } catch (envFallbackErr) {
          const fbCategory = envFallbackErr instanceof AIProviderError ? envFallbackErr.category : 'unknown';
          const fbStatus = envFallbackErr instanceof AIProviderError ? envFallbackErr.httpStatus : undefined;
          const fbMessage = envFallbackErr instanceof Error ? envFallbackErr.message : String(envFallbackErr);
          
          console.error(`[AI:${requestId}] ENV FALLBACK FAILED:`);
          console.error(`[AI:${requestId}]   Provider: ${envFallback.provider}`);
          console.error(`[AI:${requestId}]   Category: ${fbCategory}`);
          console.error(`[AI:${requestId}]   HTTP Status: ${fbStatus || 'N/A'}`);
          console.error(`[AI:${requestId}]   Message: ${fbMessage}`);
          
          errorDetails.push({ provider: envFallback.provider, category: fbCategory, httpStatus: fbStatus, message: fbMessage });
          lastError = envFallbackErr instanceof Error ? envFallbackErr : new Error(String(envFallbackErr));
          // Continue to next env fallback
        }
      }
    } catch (envErr) {
      console.error(`[AI:${requestId}] Error building env fallback chain:`, envErr instanceof Error ? envErr.message : envErr);
    }

    // Log complete error summary before throwing
    console.error(`[AI:${requestId}] === ERROR SUMMARY ===`);
    console.error(`[AI:${requestId}] Providers tried: ${triedProviders.join(', ')}`);
    console.error(`[AI:${requestId}] Error details:`);
    errorDetails.forEach((detail, idx) => {
      console.error(`[AI:${requestId}]   ${idx + 1}. ${detail.provider}: ${detail.category} (HTTP ${detail.httpStatus || 'N/A'}) - ${detail.message.slice(0, 100)}`);
    });

    // All providers exhausted — log summary and throw with appropriate category
    console.error(`[AI:${requestId}] === ALL PROVIDERS EXHAUSTED === Tried: ${triedProviders.join(', ')}. Last error: ${lastError?.message}`);

    // Store failed generation diagnostic for all throw paths below
    _lastGenerationDiagnostic = {
      success: false,
      resolvedProvider: resolvedProviderName || 'unknown',
      resolvedModel: resolvedModelName || 'unknown',
      keySource: resolvedKeySource,
      keyPrefix: resolvedKeyPrefix,
      providersTried: [...triedProviders],
      errorDetails: [...errorDetails],
      durationMs: Date.now() - genStartTime,
      timestamp: new Date().toISOString(),
    };

    // Determine the most appropriate error message based on what actually failed
    if (lastError instanceof AIProviderError) {
      const lastCategory = lastError.category;
      
      // Authentication failures — configuration error, user cannot fix by retrying
      if (lastCategory === 'auth_failed') {
        console.error(`[AI:${requestId}] Final error: authentication_failed — all providers have invalid API keys`);
        throw new AIProviderError(
          'AI provider authentication failed. Please contact support to verify your API key configuration.',
          'auth_failed',
          undefined,
        );
      }

      // Model not found — configuration error
      if (lastCategory === 'invalid_model') {
        console.error(`[AI:${requestId}] Final error: invalid_model — model configuration issue`);
        throw new AIProviderError(
          'AI model configuration error. Please contact support to verify your model settings.',
          'invalid_model',
          undefined,
        );
      }

      // Not configured — no API keys available
      if (lastCategory === 'not_configured') {
        console.error(`[AI:${requestId}] Final error: not_configured — no AI provider is set up`);
        throw new AIProviderError(
          'AI service not configured. Please contact support to set up an AI provider.',
          'not_configured',
          undefined,
        );
      }

      // Rate limited — transient, but we've exhausted retries
      if (lastCategory === 'rate_limited') {
        console.warn(`[AI:${requestId}] Final error: rate_limited — all providers are rate-limited`);
        throw new AIProviderError(
          'AI services are currently busy. Please wait a few moments and try again.',
          'rate_limited',
          undefined,
        );
      }

      // Network/server errors — transient
      if (lastCategory === 'network' || lastCategory === 'timeout') {
        console.warn(`[AI:${requestId}] Final error: ${lastCategory} — server/network issues`);
        throw new AIProviderError(
          'AI service temporarily unavailable. Please try again later.',
          'all_unavailable',
          undefined,
        );
      }
    }

    // Fallback for unknown or other error types
    if (triedProviders.length > 1) {
      console.error(`[AI:${requestId}] Final error: multiple providers failed with unknown errors`);
      throw new AIProviderError(
        'AI generation failed after trying all available providers. Please try again in a few moments.',
        'all_unavailable',
        undefined,
      );
    }

    throw lastError;
  }
}

// ─── Provider health & recommendation exports ────────────────────────────────

export interface EnvProviderStatus {
  provider: string;
  hasKey: boolean;
  keyEnvVar: string;
  defaultModel: string;
  isFreeTierFriendly: boolean;
}

/**
 * Check which providers have valid API keys in environment variables.
 * Used by diagnostic endpoints and admin UI to show real-time provider health.
 */
export function getEnvProviderStatuses(): EnvProviderStatus[] {
  const providers: Array<{ provider: string; keyEnvVars: string[]; defaultModel: string; freeTier: boolean }> = [
    { provider: 'google', keyEnvVars: ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'GOOGLE_AI_API_KEY'], defaultModel: 'gemini-3.5-flash-lite', freeTier: true },
    { provider: 'openrouter', keyEnvVars: ['OPENROUTER_API_KEY'], defaultModel: 'google/gemini-3.5-flash-lite', freeTier: true },
    { provider: 'groq', keyEnvVars: ['GROQ_API_KEY'], defaultModel: 'llama-3.3-70b-versatile', freeTier: true },
    { provider: 'openai', keyEnvVars: ['OPENAI_API_KEY'], defaultModel: 'gpt-4o-mini', freeTier: false },
  ];

  return providers.map((p) => {
    let hasKey = false;
    let keyEnvVar = '';
    for (const envVar of p.keyEnvVars) {
      const val = process.env[envVar];
      if (val && val.trim().length > 0) {
        hasKey = true;
        keyEnvVar = envVar;
        break;
      }
    }
    return {
      provider: p.provider,
      hasKey,
      keyEnvVar,
      defaultModel: p.defaultModel,
      isFreeTierFriendly: p.freeTier,
    };
  });
}

// ─── Startup Health Check ──────────────────────────────────────────────────────

/**
 * Runs once at server startup to verify AI provider configuration.
 * Logs a prominent warning if no valid AI provider is available, making
 * production issues immediately visible in logs.
 */
export async function runAIStartupHealthCheck(): Promise<void> {
  console.log('[AI] ╔══════════════════════════════════════════╗');
  console.log('[AI] ║   AI PROVIDER STARTUP HEALTH CHECK     ║');
  console.log('[AI] ╚══════════════════════════════════════════╝');

  // Check env vars first
  const envStatuses = getEnvProviderStatuses();
  const availableProviders = envStatuses.filter(s => s.hasKey);

  console.log('[AI] Environment variable check:');
  for (const status of envStatuses) {
    const icon = status.hasKey ? '✓' : '✗';
    console.log(`[AI]   ${icon} ${status.provider}: ${status.hasKey ? `SET via ${status.keyEnvVar}` : 'NOT SET'}`);
  }

  // Check DB config
  try {
    const dbPrimary = await getActiveProvider();
    if (dbPrimary) {
      console.log(`[AI] DB primary provider: ${dbPrimary.provider}/${dbPrimary.model} (keyLength=${dbPrimary.apiKey.length})`);
    } else {
      console.log('[AI] DB primary provider: NONE FOUND (no document with isPrimary=true, isEnabled=true)');
    }
  } catch (err) {
    console.error('[AI] DB query failed:', err instanceof Error ? err.message : err);
  }

  // Try to resolve a provider
  try {
    const resolved = await resolveProvider('startup-check');
    console.log(`[AI] ✓ RESOLVED PROVIDER: ${resolved.provider}/${resolved.model} (keyPrefix="${resolved.apiKey.slice(0, 8)}...")`);
    console.log('[AI] AI generation should work correctly.');
  } catch (err) {
    console.error('[AI] ✗ NO VALID AI PROVIDER AVAILABLE!');
    console.error('[AI]   Error:', err instanceof Error ? err.message : String(err));
    console.error('[AI]   This means ALL AI tool generations will fail until a provider is configured.');
    console.error('[AI]   To fix: Set GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, or OPENROUTER_API_KEY in .env');
  }

  console.log('[AI] ══════════════════════════════════════════');
}

/**
 * Recommend the best provider + model based on available env keys.
 * Prioritizes free-tier-friendly options.
 */
export function getRecommendedProvider(): { provider: string; model: string; reason: string } | null {
  const statuses = getEnvProviderStatuses();
  const available = statuses.filter((s) => s.hasKey);

  if (available.length === 0) return null;

  // Prefer free-tier providers first
  const freeProviders = available.filter((s) => s.isFreeTierFriendly);
  const recommended = freeProviders.length > 0 ? freeProviders[0] : available[0];

  const reasons: Record<string, string> = {
    google: 'Google Gemini has a generous free tier and fast responses',
    groq: 'Groq offers free, ultra-fast inference with Llama models',
    openrouter: 'OpenRouter provides access to multiple models with free credits',
    openai: 'OpenAI GPT models are widely supported',
  };

  return {
    provider: recommended.provider,
    model: recommended.defaultModel,
    reason: reasons[recommended.provider] || 'Available provider',
  };
}
