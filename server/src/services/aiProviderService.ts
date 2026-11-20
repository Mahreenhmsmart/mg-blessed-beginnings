import AIProviderConfig, { IAIProviderConfig, TestResult } from '../models/AIProviderConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProviderStatus {
  _id: string;
  provider: string;
  modelName: string;
  isEnabled: boolean;
  isPrimary: boolean;
  fallbackOrder: number;
  lastTestResult?: TestResult;
  lastTestedAt?: Date;
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

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Health check: tests each enabled provider with a minimal prompt.
 * Returns status per provider without exposing API keys.
 */
export async function getProviderHealth(): Promise<Array<{
  provider: string;
  enabled: boolean;
  configured: boolean;
  connected: boolean;
  model: string;
  errorCategory?: string;
}>> {
  const configs = await AIProviderConfig.find({ isEnabled: true }).sort({ fallbackOrder: 1 });
  const results: Array<{
    provider: string;
    enabled: boolean;
    configured: boolean;
    connected: boolean;
    model: string;
    errorCategory?: string;
  }> = [];

  for (const config of configs) {
    let configured = false;
    let connected = false;
    let errorCategory: string | undefined;

    try {
      const decryptedKey = config.decryptApiKey();
      configured = !!decryptedKey && decryptedKey.length > 5;

      if (configured) {
        const response = await sendTestPrompt(config.provider, config.modelName, decryptedKey);
        connected = response.ok;
        if (!response.ok) {
          const result = categorizeError(response.status, response.body);
          errorCategory = result === 'failed' ? 'auth_failed' : result;
        }
      } else {
        errorCategory = 'not_configured';
      }
    } catch {
      configured = false;
      errorCategory = 'network';
    }

    results.push({
      provider: config.provider,
      enabled: config.isEnabled,
      configured,
      connected,
      model: config.modelName,
      errorCategory,
    });
  }

  return results;
}

/**
 * Returns all providers with masked key previews. Never exposes actual keys.
 */
export async function getProviderStatuses(): Promise<ProviderStatus[]> {
  const configs = await AIProviderConfig.find().sort({ fallbackOrder: 1 });

  return configs.map((config) => {
    let keyPreview = '';
    try {
      const decrypted = config.decryptApiKey();
      if (decrypted && decrypted.length >= 4) {
        keyPreview = '\u2022\u2022\u2022\u2022' + decrypted.slice(-4);
      } else {
        keyPreview = '\u2022\u2022\u2022\u2022';
      }
    } catch {
      keyPreview = '\u2022\u2022\u2022\u2022';
    }

    return {
      _id: config._id.toString(),
      provider: config.provider,
      modelName: config.modelName,
      isEnabled: config.isEnabled,
      isPrimary: config.isPrimary,
      fallbackOrder: config.fallbackOrder,
      lastTestResult: config.lastTestResult,
      lastTestedAt: config.lastTestedAt,
      lastTestError: config.lastTestError,
      isConfigured: true,
      keyPreview,
    };
  });
}

/**
 * Upsert a provider configuration. Enforces single-primary constraint.
 */
export async function saveProviderConfig(
  data: SaveProviderData,
  id?: string,
): Promise<ProviderStatus> {
  // If setting as primary, unset all other primaries first
  if (data.isPrimary) {
    await AIProviderConfig.updateMany(
      { isPrimary: true, ...(id ? { _id: { $ne: id } } : {}) },
      { $set: { isPrimary: false } },
    );
  }

  let config: IAIProviderConfig;

  if (id) {
    const found = await AIProviderConfig.findById(id);
    if (!found) {
      throw new Error('Provider configuration not found');
    }
    config = found;
    config.provider = data.provider;
    config.modelName = data.modelName;
    if (data.apiKey) {
      config.apiKey = data.apiKey;
    }
    if (data.isEnabled !== undefined) config.isEnabled = data.isEnabled;
    if (data.isPrimary !== undefined) config.isPrimary = data.isPrimary;
    if (data.fallbackOrder !== undefined) config.fallbackOrder = data.fallbackOrder;
    await config.save();
  } else {
    config = await AIProviderConfig.create({
      provider: data.provider,
      modelName: data.modelName,
      apiKey: data.apiKey,
      isEnabled: data.isEnabled ?? false,
      isPrimary: data.isPrimary ?? false,
      fallbackOrder: data.fallbackOrder ?? 0,
    });
  }

  // Reload to get fresh state
  const refreshed = await AIProviderConfig.findById(config._id);
  if (!refreshed) throw new Error('Failed to reload saved config');

  let keyPreview = '';
  try {
    const decrypted = refreshed.decryptApiKey();
    keyPreview = decrypted.length >= 4 ? '\u2022\u2022\u2022\u2022' + decrypted.slice(-4) : '\u2022\u2022\u2022\u2022';
  } catch {
    keyPreview = '\u2022\u2022\u2022\u2022';
  }

  return {
    _id: refreshed._id.toString(),
    provider: refreshed.provider,
    modelName: refreshed.modelName,
    isEnabled: refreshed.isEnabled,
    isPrimary: refreshed.isPrimary,
    fallbackOrder: refreshed.fallbackOrder,
    lastTestResult: refreshed.lastTestResult,
    lastTestedAt: refreshed.lastTestedAt,
    lastTestError: refreshed.lastTestError,
    isConfigured: true,
    keyPreview,
  };
}

/**
 * Validate the format of a stored OpenRouter API key without exposing any part of it.
 * Returns only 'valid' or 'invalid/empty' — never returns the key or any substring.
 */
export async function validateOpenRouterKeyFormat(providerId: string): Promise<'valid' | 'invalid/empty'> {
  const config = await AIProviderConfig.findById(providerId);
  if (!config) {
    return 'invalid/empty';
  }

  if (config.provider !== 'openrouter') {
    return 'invalid/empty';
  }

  try {
    const decryptedKey = config.decryptApiKey();
    if (!decryptedKey || typeof decryptedKey !== 'string') {
      return 'invalid/empty';
    }

    const hasCorrectPrefix = decryptedKey.startsWith('sk-or-v1-');
    const hasMinLength = decryptedKey.length >= 20;

    if (hasCorrectPrefix && hasMinLength) {
      return 'valid';
    }

    return 'invalid/empty';
  } catch {
    return 'invalid/empty';
  }
}

/**
 * Delete a provider configuration by ID.
 */
export async function deleteProviderConfig(id: string): Promise<void> {
  const result = await AIProviderConfig.findByIdAndDelete(id);
  if (!result) {
    throw new Error('Provider configuration not found');
  }
}

/**
 * Test a provider connection by sending a minimal prompt.
 * Categorizes errors into standardized result types.
 */
export async function testConnection(providerId: string): Promise<{
  lastTestResult: TestResult;
  lastTestedAt: Date;
  lastTestError?: string;
}> {
  const config = await AIProviderConfig.findById(providerId);
  if (!config) {
    throw new Error('Provider configuration not found');
  }

  const decryptedKey = config.decryptApiKey();
  const now = new Date();

  let result: TestResult = 'failed';
  let errorMessage: string | undefined;

  try {
    const response = await sendTestPrompt(config.provider, config.modelName, decryptedKey);
    if (response.ok) {
      result = 'success';
    } else {
      result = categorizeError(response.status, response.body);
      errorMessage = sanitizeErrorMessage(result);
    }
  } catch (err) {
    result = 'network_error';
    errorMessage = 'Network error — check your connection and try again';
  }

  // Update the document
  config.lastTestedAt = now;
  config.lastTestResult = result;
  config.lastTestError = errorMessage;
  await config.save({ validateBeforeSave: false }); // Skip pre-save re-encryption of unchanged key

  return {
    lastTestResult: result,
    lastTestedAt: now,
    lastTestError: errorMessage,
  };
}

/**
 * Get the primary enabled provider for use by aiService.ts.
 * Falls back to null if no primary is configured or decryption fails.
 * Validates model name to prevent 404 errors from invalid models.
 */
export async function getActiveProvider(): Promise<{
  provider: string;
  model: string;
  apiKey: string;
} | null> {
  console.log('[AI Provider] [DB-QUERY] Searching for isPrimary=true, isEnabled=true...');
  const config = await AIProviderConfig.findOne({ isPrimary: true, isEnabled: true });
  if (!config) {
    console.log('[AI Provider] [DB-QUERY] ✗ No document matched isPrimary=true AND isEnabled=true');
    return null;
  }

  console.log(`[AI Provider] [DB-QUERY] ✓ Found primary doc: id=${config._id}, provider="${config.provider}", modelName="${config.modelName}", isEnabled=${config.isEnabled}, isPrimary=${config.isPrimary}`);

  try {
    const decryptedKey = config.decryptApiKey();
    if (!decryptedKey) {
      console.error('[AI Provider] [DECRYPT] ✗ Decryption returned empty/null key for primary provider');
      return null;
    }

    console.log(`[AI Provider] [DECRYPT] ✓ Key decrypted: length=${decryptedKey.length}, prefix="${decryptedKey.slice(0, 8)}..."`);

    // Validate Google/Gemini API key format after decryption.
    // Google API keys must start with "AIza" and be at least 30 characters.
    // If the key is malformed, return null so the system falls back to env-based resolution
    // instead of sending a doomed HTTP request that returns 401/403.
    if (config.provider === 'google') {
      const startsWithAIza = decryptedKey.startsWith('AIza');
      const hasMinLength = decryptedKey.length >= 30;
      console.log(`[AI Provider] [VALIDATE] Google key check: startsWithAIza=${startsWithAIza}, length=${decryptedKey.length} (min 30), prefix="${decryptedKey.slice(0, 8)}..."`);
      if (!startsWithAIza || !hasMinLength) {
        console.warn(
          `[AI Provider] [VALIDATE] ✗ Primary provider "${config.provider}" FAILED format validation after decryption ` +
          `(expected prefix "AIza", min 30 chars; got ${decryptedKey.length} chars, ` +
          `prefix "${decryptedKey.slice(0, 4)}"). Returning null to trigger env fallback.`
        );
        return null;
      }
      console.log(`[AI Provider] [VALIDATE] ✓ Google key passed format validation`);
    }

    // Validate OpenRouter API key format after decryption.
    // OpenRouter API keys must start with "sk-or-v1-" and be at least 20 characters.
    if (config.provider === 'openrouter') {
      const startsWithSkOrV1 = decryptedKey.startsWith('sk-or-v1-');
      const hasMinLength = decryptedKey.length >= 20;
      console.log(`[AI Provider] [VALIDATE] OpenRouter key check: startsWithSkOrV1=${startsWithSkOrV1}, length=${decryptedKey.length} (min 20), prefix="${decryptedKey.slice(0, 8)}..."`);
      if (!startsWithSkOrV1 || !hasMinLength) {
        console.warn(
          `[AI Provider] [VALIDATE] ✗ Primary provider "${config.provider}" FAILED format validation after decryption ` +
          `(expected prefix "sk-or-v1-", min 20 chars; got ${decryptedKey.length} chars, ` +
          `prefix "${decryptedKey.slice(0, 8)}"). Returning null to trigger env fallback.`
        );
        return null;
      }
      console.log(`[AI Provider] [VALIDATE] ✓ OpenRouter key passed format validation`);
    }

    // Validate model name — correct invalid models before returning
    const validatedModel = validateModelName(config.provider, config.modelName);
    console.log(`[AI Provider] [RESULT] Returning: provider="${config.provider}", model="${validatedModel}" (original: "${config.modelName}"), keyPrefix="${decryptedKey.slice(0, 8)}..."`);
    return {
      provider: config.provider,
      model: validatedModel,
      apiKey: decryptedKey,
    };
  } catch (err) {
    console.error(`[AI Provider] [DECRYPT] ✗ Exception during decryption for "${config.provider}":`, err instanceof Error ? err.message : err);
    return null;
  }
}

/** Known-valid Google model identifiers */
const VALID_GOOGLE_MODELS = new Set([
  // Current generation
  'gemini-3.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-2.5-pro',
  // Preview models
  'gemini-2.5-flash-preview-05-20',
  'gemini-2.5-pro-preview-05-06',
]);

/** Known-valid OpenRouter Google model identifiers */
const VALID_OPENROUTER_GOOGLE_MODELS = new Set([
  // Current generation (stable, recommended)
  'google/gemini-3.5-flash-lite',
  'google/gemini-2.0-flash-lite',
  'google/gemini-2.5-pro',
  // Free tier (may have rate limits or be less reliable)
  'google/gemini-2.0-flash-exp:free',
  'google/gemini-2.0-flash:free',
  'google/gemini-2.5-flash-exp:free',
]);

/** Known-valid Anthropic model identifiers */
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
  google: 'gemini-3.5-flash-lite',
  gemini: 'gemini-3.5-flash-lite',
  openrouter: 'google/gemini-3.5-flash-lite',
  anthropic: 'claude-sonnet-4-20250514',
  openai: 'gpt-4o-mini',
  groq: 'llama-3.3-70b-versatile',
  cohere: 'command-r-plus',
};

/** Known-invalid model names mapped to their correct replacements */
const INVALID_MODEL_MAP: Record<string, string> = {
  // Deprecated Google/Gemini models
  'gemini-pro': 'gemini-3.5-flash-lite',
  'gemini-1.0-pro': 'gemini-3.5-flash-lite',
  'models/gemini-1.0-pro': 'gemini-3.5-flash-lite',
  'models/gemini-pro': 'gemini-3.5-flash-lite',
  'models/gemini-2.0-flash': 'gemini-3.5-flash-lite',
  'models/gemini-2.5-flash': 'gemini-3.5-flash-lite', // strip models/ prefix
  'gemini-2.0-flash': 'gemini-3.5-flash-lite',        // deprecated June 2026
  'gemini-2.5-flash': 'gemini-3.5-flash-lite',        // returns HTTP 404 on generateContent
  'models/gemini-2.0-pro': 'gemini-2.5-pro',
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
 * Returns a safe, known-valid model name.
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
    console.log(`[AI Provider] Stripping provider prefix: "${model}" → "${stripped}" for direct ${provider} API`);
    model = stripped;
  }

  // Fix known-invalid models first (check both original and stripped versions)
  if (model && INVALID_MODEL_MAP[model]) {
    const corrected = INVALID_MODEL_MAP[model];
    // If correcting to an OpenRouter format but target is direct API, strip again
    if (corrected.includes('/') && provider !== 'openrouter') {
      const finalModel = stripProviderPrefix(corrected);
      console.log(`[AI Provider] Correcting invalid model "${model}" → "${finalModel}" for provider ${provider} (stripped from "${corrected}")`);
      return finalModel;
    }
    console.log(`[AI Provider] Correcting invalid model "${model}" → "${corrected}" for provider ${provider}`);
    return corrected;
  }

  if (!model) {
    return DEFAULT_MODELS[provider] || model;
  }

  // Positive validation for Google/Gemini
  if (provider === 'google' || provider === 'gemini') {
    // Double-check no prefix slipped through
    if (model.includes('/')) {
      const stripped = stripProviderPrefix(model);
      console.warn(`[AI Provider] Google model "${model}" still has prefix after processing — stripping to "${stripped}"`);
      model = stripped;
    }
    if (!VALID_GOOGLE_MODELS.has(model)) {
      console.warn(`[AI Provider] Invalid Google model "${model}" in DB config — correcting to "gemini-3.5-flash-lite"`);
      return 'gemini-3.5-flash-lite';
    }
  }

  // Positive validation for OpenRouter Google models
  if (provider === 'openrouter' && model.startsWith('google/')) {
    if (!VALID_OPENROUTER_GOOGLE_MODELS.has(model)) {
      console.warn(`[AI Provider] Invalid OpenRouter Google model "${model}" in DB config — correcting to "google/gemini-3.5-flash-lite"`);
      return 'google/gemini-3.5-flash-lite';
    }
  }

  // For OpenRouter with non-Google models, be permissive —
  // OpenRouter supports hundreds of models and we can't maintain a complete list.
  // Only validate the format (provider/model).
  if (provider === 'openrouter' && !model.startsWith('google/')) {
    if (!model.includes('/')) {
      console.warn(`[AI Provider] OpenRouter model "${model}" missing provider prefix — correcting to default`);
      return DEFAULT_MODELS['openrouter'];
    }
    // Allow any well-formatted provider/model string through
  }

  // Positive validation for Anthropic models
  if (provider === 'anthropic') {
    // Strip any accidental prefix
    if (model.includes('/')) {
      const stripped = stripProviderPrefix(model);
      console.warn(`[AI Provider] Anthropic model "${model}" has unexpected prefix — stripping to "${stripped}"`);
      model = stripped;
    }
    if (!VALID_ANTHROPIC_MODELS.has(model)) {
      console.warn(`[AI Provider] Invalid Anthropic model "${model}" in DB config — correcting to "claude-sonnet-4-20250514"`);
      return 'claude-sonnet-4-20250514';
    }
  }

  return model;
}

/**
 * Get the fallback chain: enabled providers sorted by fallbackOrder.
 * Skips providers whose API keys cannot be decrypted.
 * Filters out non-chat providers (e.g., luma) that cannot handle text completions.
 * Filters out providers not in the ACTIVE_CHAIN (anthropic, openai, luma are
 * kept in the DB for configuration purposes but are not attempted during generation).
 * Validates model names to prevent 404 errors from invalid models.
 * Google AI is always tried first (lowest fallbackOrder).
 */
export async function getFallbackChain(): Promise<
  { provider: string; model: string; apiKey: string }[]
> {
  // Only these providers are in the active generation chain.
  // Anthropic, OpenAI, and Luma are excluded — their config stays in the DB
  // but they are never attempted during tool generation.
  const ACTIVE_CHAIN_PROVIDERS = new Set(['google', 'gemini', 'openrouter', 'groq']);

  const configs = await AIProviderConfig.find({ isEnabled: true }).sort({ fallbackOrder: 1 });
  const results: { provider: string; model: string; apiKey: string }[] = [];
  for (const c of configs) {
    // Skip providers not in the active chain
    if (!ACTIVE_CHAIN_PROVIDERS.has(c.provider)) {
      console.log(`[AI Provider] Skipping inactive-chain provider "${c.provider}" from fallback chain`);
      continue;
    }
    try {
      const key = c.decryptApiKey();
      if (key) {
        // Validate model name — correct invalid models before adding to chain
        const validatedModel = validateModelName(c.provider, c.modelName);
        results.push({ provider: c.provider, model: validatedModel, apiKey: key });
      }
    } catch {
      console.error(`[AI Provider] Skipping fallback provider "${c.provider}" — decryption failed`);
    }
  }
  return results;
}

/**
 * Set a provider as primary (unset all others).
 */
export async function setPrimaryProvider(id: string): Promise<void> {
  const config = await AIProviderConfig.findById(id);
  if (!config) {
    throw new Error('Provider configuration not found');
  }

  // Unset all other primaries
  await AIProviderConfig.updateMany(
    { isPrimary: true, _id: { $ne: id } },
    { $set: { isPrimary: false } },
  );

  config.isPrimary = true;
  await config.save({ validateBeforeSave: false });
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function sendTestPrompt(
  provider: string,
  model: string,
  apiKey: string,
): Promise<{ ok: boolean; status: number; body: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 10,
          messages: [{ role: 'user', content: "Respond with 'ok'" }],
        }),
        signal: controller.signal,
      });
      const body = await res.text();
      return { ok: res.ok, status: res.status, body };
    }

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 10,
          messages: [{ role: 'user', content: "Respond with 'ok'" }],
        }),
        signal: controller.signal,
      });
      const body = await res.text();
      return { ok: res.ok, status: res.status, body };
    }

    if (provider === 'google' || provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Respond with 'ok'" }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
        signal: controller.signal,
      });
      const body = await res.text();
      return { ok: res.ok, status: res.status, body };
    }

    if (provider === 'cohere') {
      const res = await fetch('https://api.cohere.ai/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          message: "Respond with 'ok'",
          max_tokens: 10,
        }),
        signal: controller.signal,
      });
      const body = await res.text();
      return { ok: res.ok, status: res.status, body };
    }

    if (provider === 'openrouter') {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': process.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'https://mgbusinessintelligence.com',
            'X-Title': 'MG Blessed Beginnings',
          },
          body: JSON.stringify({
            model,
            max_tokens: 10,
            messages: [{ role: 'user', content: "Respond with 'ok'" }],
            stream: false,
          }),
          signal: controller.signal,
        });
        const body = await res.text();
        return { ok: res.ok, status: res.status, body };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const statusMatch = message.match(/\b(4\d{2}|5\d{2})\b/);
        const status = statusMatch ? parseInt(statusMatch[0], 10) : 500;
        return { ok: false, status, body: message };
      }
    }

    if (provider === 'groq') {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            max_tokens: 10,
            messages: [{ role: 'user', content: "Respond with 'ok'" }],
          }),
          signal: controller.signal,
        });
        const body = await res.text();
        return { ok: res.ok, status: res.status, body };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const statusMatch = message.match(/\b(4\d{2}|5\d{2})\b/);
        const status = statusMatch ? parseInt(statusMatch[0], 10) : 500;
        return { ok: false, status, body: message };
      }
    }

    if (provider === 'luma') {
      // Test Luma API key by listing generations (lightweight endpoint)
      try {
        const res = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations?limit=1', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          signal: controller.signal,
        });
        const body = await res.text();
        return { ok: res.ok, status: res.status, body };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const statusMatch = message.match(/\b(4\d{2}|5\d{2})\b/);
        const status = statusMatch ? parseInt(statusMatch[0], 10) : 500;
        return { ok: false, status, body: message };
      }
    }

    return { ok: false, status: 400, body: 'Unsupported provider' };
  } finally {
    clearTimeout(timeout);
  }
}

function categorizeError(status: number, body: string): TestResult {
  if (status === 401 || status === 403) {
    return 'failed'; // invalid_credentials mapped to 'failed' per schema enum
  }
  if (status === 429) {
    const lowerBody = body.toLowerCase();
    if (lowerBody.includes('quota') || lowerBody.includes('exceeded')) {
      return 'quota_exhausted';
    }
    return 'rate_limited';
  }
  if (status === 404) {
    return 'unavailable';
  }
  return 'failed';
}

function sanitizeErrorMessage(result: TestResult): string {
  switch (result) {
    case 'failed':
      return 'Invalid API key — please check your credentials and try again';
    case 'quota_exhausted':
      return 'Quota exhausted — upgrade your plan or reduce usage';
    case 'rate_limited':
      return 'Rate limited — wait before retrying';
    case 'unavailable':
      return 'Model unavailable — select a different model';
    case 'network_error':
      return 'Network error — check your connection and try again';
    default:
      return 'Connection failed';
  }
}
