/**
 * Environment Validation — Validates required environment variables at startup.
 * Throws clear errors with specific variable names if required env vars are missing.
 */

interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

const REQUIRED_VARS = [
  { name: 'NODE_ENV', description: 'Application environment (development, production, test)' },
  { name: 'MONGO_URI', description: 'MongoDB connection string' },
  { name: 'JWT_SECRET', description: 'Secret key for JWT token signing' },
];

const OPTIONAL_VARS_WITH_WARNINGS = [
  { name: 'PORT', warning: 'PORT not set, defaulting to 3000' },
  { name: 'VITE_API_URL', warning: 'CORS may not work correctly without VITE_API_URL' },
  { name: 'SMTP_HOST', warning: 'Email notifications disabled (SMTP_HOST not set)' },
  { name: 'SMTP_PORT', warning: 'Email notifications disabled (SMTP_PORT not set)' },
  { name: 'SMTP_EMAIL', warning: 'Email notifications disabled (SMTP_EMAIL not set)' },
  { name: 'SMTP_PASSWORD', warning: 'Email notifications disabled (SMTP_PASSWORD not set)' },
  { name: 'AI_PROVIDER', warning: 'AI features disabled (AI_PROVIDER not set)' },
  { name: 'AI_MODEL', warning: 'AI features disabled (AI_MODEL not set)' },
  { name: 'AI_API_KEY', warning: 'AI features disabled (AI_API_KEY not set)' },
  { name: 'OPENROUTER_API_KEY', warning: 'OpenRouter provider unavailable (OPENROUTER_API_KEY not set)' },
  { name: 'OPENAI_API_KEY', warning: 'OpenAI provider unavailable (OPENAI_API_KEY not set)' },
  { name: 'ANTHROPIC_API_KEY', warning: 'Anthropic provider unavailable (ANTHROPIC_API_KEY not set)' },
  { name: 'COHERE_API_KEY', warning: 'Cohere provider unavailable (COHERE_API_KEY not set)' },
  { name: 'GEMINI_API_KEY', warning: 'Google Gemini provider unavailable (GEMINI_API_KEY not set)' },
  { name: 'GOOGLE_API_KEY', warning: 'Google AI provider unavailable (GOOGLE_API_KEY not set)' },
  { name: 'GOOGLE_AI_API_KEY', warning: 'Google AI provider unavailable (GOOGLE_AI_API_KEY not set)' },
  { name: 'GROQ_API_KEY', warning: 'Groq provider unavailable (GROQ_API_KEY not set)' },
  { name: 'LUMA_API_KEY', warning: 'Luma AI video generation unavailable (LUMA_API_KEY not set)' },
  { name: 'GOOGLE_CLIENT_ID', warning: 'Google Search Console integration disabled' },
  { name: 'GOOGLE_CLIENT_SECRET', warning: 'Google Search Console integration disabled' },
];

/**
 * Known AI provider API key environment variables.
 * Used to log a summary of which providers are configured at startup.
 */
const AI_PROVIDER_KEYS = [
  { name: 'OPENAI_API_KEY', provider: 'OpenAI' },
  { name: 'ANTHROPIC_API_KEY', provider: 'Anthropic' },
  { name: 'GEMINI_API_KEY', provider: 'Google Gemini' },
  { name: 'GOOGLE_API_KEY', provider: 'Google AI' },
  { name: 'GOOGLE_AI_API_KEY', provider: 'Google AI (alt)' },
  { name: 'COHERE_API_KEY', provider: 'Cohere' },
  { name: 'OPENROUTER_API_KEY', provider: 'OpenRouter' },
  { name: 'GROQ_API_KEY', provider: 'Groq' },
  { name: 'AI_API_KEY', provider: 'Default (AI_API_KEY)' },
];

export function validateEnvironment(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const { name, description } of REQUIRED_VARS) {
    if (!process.env[name]) {
      missing.push(`${name} (${description})`);
    }
  }

  // Check optional variables and add warnings
  for (const { name, warning } of OPTIONAL_VARS_WITH_WARNINGS) {
    if (!process.env[name]) {
      warnings.push(warning);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Log which AI providers are configured vs missing at startup.
 * Never reveals actual key values — only presence/absence.
 */
function logProviderStatus(): void {
  const configured: string[] = [];
  const notConfigured: string[] = [];

  for (const { name, provider } of AI_PROVIDER_KEYS) {
    const value = process.env[name];
    if (value && value.trim().length > 0) {
      configured.push(provider);
    } else {
      notConfigured.push(provider);
    }
  }

  if (configured.length > 0) {
    console.log(`[ENV] ✅ AI providers configured: ${configured.join(', ')}`);
  }
  if (notConfigured.length > 0) {
    console.warn(`[ENV] ⚠️  AI providers not configured: ${notConfigured.join(', ')}`);
  }
  if (configured.length === 0) {
    console.warn('[ENV] ⚠️  No AI provider keys found — AI features will use DB-configured providers or be unavailable');
  }
}

/**
 * Run validation and log results. Throws if required vars are missing.
 */
export function validateAndLogEnvironment(): void {
  const result = validateEnvironment();

  // Log warnings (non-fatal)
  for (const warning of result.warnings) {
    console.warn(`[ENV] ⚠️  ${warning}`);
  }

  // Log AI provider status summary
  logProviderStatus();

  // Fail fast if required vars are missing
  if (!result.valid) {
    console.error('[ENV] ❌ Missing required environment variables:');
    for (const varName of result.missing) {
      console.error(`   - ${varName}`);
    }
    console.error('\nPlease set these variables in your .env file.');
    process.exit(1);
  }

  console.log('[ENV] ✅ All required environment variables are set');
}
