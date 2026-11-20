import type { Request, Response, NextFunction } from 'express';
import AIProviderConfig from '../models/AIProviderConfig';
import DiagnosticResultModel from '../models/DiagnosticResult';
import {
  generateCompletion,
  getEnvProviderStatuses,
  getRecommendedProvider,
  discoverBestFlashModel,
  getLastDiscoveryResult,
  getLastGenerationDiagnostic,
  DISCOVERED_FLASH_MODEL,
} from '../services/aiService';
import { generateToolContent } from '../services/aiToolGenerationService';
import { safeParseResponse, extractTextContent, hasValidContent } from '../utils/safeParser';
import { parseAIResponse } from '../utils/parseAIResponse';

// ─── Types ──────────────────────────────────────────────────────────────────────

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

// ─── Per-provider fresh test result (for provider cards refresh) ──────────────

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
  /** Fresh per-provider test results — used by the client to update provider cards */
  providers: ProviderDiagnosticEntry[];
}

// ─── Chatbot system prompt (duplicated here to avoid circular imports) ─────────

const CHATBOT_SYSTEM_PROMPT = `You are the MG AI Assistant for MG Blessed Beginnings, an integrated AI, SEO, E-commerce, Business Intelligence, Security, and Marketing platform. Your role is to help website visitors with questions about:

- AI marketing tools and automation
- SEO services and optimization
- Digital marketing strategies
- E-commerce solutions (Shopify, eBay, Etsy)
- Online courses and training
- Consultation bookings and pricing

Guidelines:
- Keep responses concise, professional, and friendly (2-4 sentences max unless asked for detail).
- If asked about pricing, mention that custom quotes are available and suggest booking a free consultation.
- If asked about booking, direct them to the /book-consultation page.
- Always maintain a helpful, knowledgeable tone that reflects the brand's premium positioning.
- Do not make up specific prices or statistics you don't know — suggest they contact the team instead.
- Use emojis sparingly and only when it adds warmth (e.g., in greetings).`;

// ─── Helper: Timed API call ─────────────────────────────────────────────────────

async function timedApiCall<T>(fn: () => Promise<T>): Promise<{ result: T; latency: number }> {
  const start = Date.now();
  const result = await fn();
  return { result, latency: Date.now() - start };
}

// ─── Step 1: Database Provider Verification ─────────────────────────────────────

async function stepDatabaseVerification(): Promise<{
  results: DiagnosticResult[];
  providerChain: { primary: string; fallback1: string; fallback2: string };
  databaseIssues: string[];
}> {
  const results: DiagnosticResult[] = [];
  const databaseIssues: string[] = [];
  let providerChain = { primary: 'None', fallback1: 'None', fallback2: 'None' };

  try {
    const configs = await AIProviderConfig.find({ isEnabled: true }).sort({ fallbackOrder: 1 });

    // Check for invalid/deprecated model names that need migration
    // Note: gemini-2.5-flash returns HTTP 404 on generateContent despite being listed in Models API
    const allConfigs = await AIProviderConfig.find();
    const KNOWN_INVALID_PATTERNS = [
      'gemini-pro',           // deprecated alias
      'gemini-1.0-pro',       // deprecated, removed from API
      'gemini-1.5-flash',     // deprecated on direct Google API
      'gemini-1.5-pro',       // deprecated on direct Google API
      'gemini-2.0-flash',     // deprecated June 2026, replaced by gemini-2.5-flash
      'gemini-2.5-flash',     // HTTP 404 on generateContent, use gemini-3.5-flash-lite instead
      'claude-sonnet-5',      // not a valid Anthropic model
      'claude-3-5-sonnet',    // deprecated format
    ];
    const invalidModels = allConfigs.filter((c) =>
      KNOWN_INVALID_PATTERNS.some((pattern) => c.modelName.includes(pattern)),
    );

    if (invalidModels.length > 0) {
      databaseIssues.push(`Found ${invalidModels.length} record(s) with deprecated model names that should be migrated`);
    }

    // Find primary
    const primary = configs.find((c) => c.isPrimary);
    if (!primary) {
      databaseIssues.push('No primary provider found');
      results.push({
        component: 'DB: Primary Provider',
        status: 'FAIL',
        evidence: 'No primary provider configured',
      });
    } else {
      providerChain.primary = `${primary.provider}/${primary.modelName}`;
      results.push({
        component: 'DB: Primary Provider',
        status: 'PASS',
        evidence: `${primary.provider}/${primary.modelName} is primary`,
      });
    }

    // Find fallbacks
    const fallbacks = configs.filter((c) => !c.isPrimary);
    if (fallbacks.length === 0) {
      databaseIssues.push('No fallback providers configured');
    } else {
      providerChain.fallback1 = fallbacks[0] ? `${fallbacks[0].provider}/${fallbacks[0].modelName}` : 'None';
      providerChain.fallback2 = fallbacks[1] ? `${fallbacks[1].provider}/${fallbacks[1].modelName}` : 'None';
    }

    results.push({
      component: 'DB: Fallback Chain',
      status: fallbacks.length > 0 ? 'PASS' : 'FAIL',
      evidence: `${fallbacks.length} fallback provider(s) configured`,
    });

    results.push({
      component: 'DB: Model Validation',
      status: invalidModels.length === 0 ? 'PASS' : 'FAIL',
      evidence: invalidModels.length === 0 ? 'All models valid' : `${invalidModels.length} invalid model(s) found`,
    });
  } catch (err) {
    results.push({
      component: 'DB: Provider Verification',
      status: 'FAIL',
      evidence: `Database error: ${err instanceof Error ? err.message : String(err)}`,
    });
    databaseIssues.push('Failed to query AIProviderConfig collection');
  }

  return { results, providerChain, databaseIssues };
}

// ─── Step 2: Provider API Tests ─────────────────────────────────────────────────

async function stepProviderAPITests(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  const configs = await AIProviderConfig.find({ isEnabled: true });

  // Test each enabled provider
  for (const config of configs) {
    const providerName = config.provider.charAt(0).toUpperCase() + config.provider.slice(1);
    const label = config.provider === 'google' ? 'Gemini (Google)' : providerName;

    try {
      const decryptedKey = config.decryptApiKey();
      if (!decryptedKey) {
        results.push({
          component: label,
          status: 'FAIL',
          evidence: 'API key decryption failed',
        });
        continue;
      }

      // ── Key format validation (before API call) ────────────────────────────
      // Validate the stored key format per provider to surface clear errors
      // when the key is empty, truncated, or has the wrong prefix.
      // NEVER log or return the actual key value — only validity status.
      if (config.provider === 'openrouter') {
        const isValidFormat =
          typeof decryptedKey === 'string' &&
          decryptedKey.length >= 20 &&
          decryptedKey.startsWith('sk-or-');
        if (!isValidFormat) {
          results.push({
            component: label,
            status: 'FAIL',
            evidence:
              decryptedKey.length === 0
                ? 'Stored key is empty — please re-paste it'
                : `Stored key is invalid or empty — please re-paste it (format check failed: expected prefix "sk-or-", min 20 chars)`,
          });
          continue;
        }
      } else if (config.provider === 'google') {
        const isValidFormat =
          typeof decryptedKey === 'string' &&
          decryptedKey.length >= 30 &&
          decryptedKey.startsWith('AIza');
        if (!isValidFormat) {
          results.push({
            component: label,
            status: 'FAIL',
            evidence:
              decryptedKey.length === 0
                ? 'Stored key is empty — please re-paste it'
                : `Stored key is invalid or empty — please re-paste it (format check failed: expected prefix "AIza", min 30 chars)`,
          });
          continue;
        }
      } else if (config.provider === 'anthropic') {
        const isValidFormat =
          typeof decryptedKey === 'string' &&
          decryptedKey.length >= 10 &&
          decryptedKey.startsWith('sk-ant-');
        if (!isValidFormat) {
          results.push({
            component: label,
            status: 'FAIL',
            evidence:
              decryptedKey.length === 0
                ? 'Stored key is empty — please re-paste it'
                : `Stored key is invalid or empty — please re-paste it (format check failed: expected prefix "sk-ant-")`,
          });
          continue;
        }
      } else if (config.provider === 'openai') {
        const isValidFormat =
          typeof decryptedKey === 'string' &&
          decryptedKey.length >= 20 &&
          decryptedKey.startsWith('sk-');
        if (!isValidFormat) {
          results.push({
            component: label,
            status: 'FAIL',
            evidence:
              decryptedKey.length === 0
                ? 'Stored key is empty — please re-paste it'
                : `Stored key is invalid or empty — please re-paste it (format check failed: expected prefix "sk-", min 20 chars)`,
          });
          continue;
        }
      }

      const { latency } = await timedApiCall(async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        try {
          let res: globalThis.Response;

          if (config.provider === 'openrouter') {
            res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${decryptedKey}`,
                'HTTP-Referer': process.env.VITE_API_URL?.replace(/\/api\/?$/, '') || '',
                'X-Title': 'MG Blessed Beginnings',
              },
              body: JSON.stringify({
                model: config.modelName,
                max_tokens: 20,
                messages: [{ role: 'user', content: 'Reply with exactly: OpenRouter connection successful.' }],
                stream: false,
              }),
              signal: controller.signal,
            });
          } else if (config.provider === 'google') {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.modelName}:generateContent?key=${decryptedKey}`;
            res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: 'Reply with exactly: Gemini connection successful.' }] }],
                generationConfig: { maxOutputTokens: 20 },
              }),
              signal: controller.signal,
            });
          } else if (config.provider === 'anthropic') {
            res = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': decryptedKey,
                'anthropic-version': '2023-06-01',
              },
              body: JSON.stringify({
                model: config.modelName,
                max_tokens: 20,
                messages: [{ role: 'user', content: 'Reply with exactly: Anthropic connection successful.' }],
              }),
              signal: controller.signal,
            });
          } else if (config.provider === 'luma') {
            // Luma doesn't have a chat endpoint, test with list generations
            res = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations?limit=1', {
              method: 'GET',
              headers: { Authorization: `Bearer ${decryptedKey}` },
              signal: controller.signal,
            });
          } else {
            throw new Error(`Unsupported provider: ${config.provider}`);
          }

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP ${res.status}: ${errorText.slice(0, 100)}`);
          }

          return await res.json();
        } finally {
          clearTimeout(timeout);
        }
      });

      results.push({
        component: label,
        status: 'PASS',
        evidence: `Received response in ${(latency / 1000).toFixed(1)}s`,
        latency,
      });
    } catch (err) {
      results.push({
        component: label,
        status: 'FAIL',
        evidence: err instanceof Error ? err.message.slice(0, 100) : 'Unknown error',
      });
    }
  }

  // Check for OpenAI and Groq (may not be in DB)
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // Google/Gemini test (env-only if not in DB)
  if (geminiKey) {
    const existingGoogle = configs.find((c) => c.provider === 'google');
    if (!existingGoogle) {
      try {
        const { latency } = await timedApiCall(async () => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`;
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: 'Reply with exactly: Gemini connection successful.' }] }],
                generationConfig: { maxOutputTokens: 20 },
              }),
              signal: controller.signal,
            });
            if (!res.ok) {
              const errorText = await res.text();
              throw new Error(`HTTP ${res.status}: ${errorText.slice(0, 100)}`);
            }
            return await res.json();
          } finally {
            clearTimeout(timeout);
          }
        });
        results.push({
          component: 'Gemini (Google)',
          status: 'PASS',
          evidence: `ENV key works, received response in ${(latency / 1000).toFixed(1)}s (not in DB)`,
          latency,
        });
      } catch (err) {
        results.push({
          component: 'Gemini (Google)',
          status: 'FAIL',
          evidence: `ENV key exists but API failed: ${err instanceof Error ? err.message.slice(0, 80) : 'Unknown'}`,
        });
      }
    }
  } else {
    const existingGoogle = configs.find((c) => c.provider === 'google');
    if (!existingGoogle) {
      results.push({
        component: 'Gemini (Google)',
        status: 'NOT_CONFIGURED',
        evidence: 'No GEMINI_API_KEY or GOOGLE_API_KEY in environment and no DB record',
      });
    }
  }

  // OpenRouter test (env-only if not in DB)
  if (openrouterKey) {
    const existingOpenRouter = configs.find((c) => c.provider === 'openrouter');
    if (!existingOpenRouter) {
      try {
        const { latency } = await timedApiCall(async () => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);
          try {
            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${openrouterKey}`,
                'HTTP-Referer': process.env.VITE_API_URL?.replace(/\/api\/?$/, '') || '',
                'X-Title': 'MG Blessed Beginnings',
              },
              body: JSON.stringify({
                model: 'google/gemini-3.5-flash-lite',
                max_tokens: 20,
                messages: [{ role: 'user', content: 'Reply with exactly: OpenRouter connection successful.' }],
                stream: false,
              }),
              signal: controller.signal,
            });
            if (!res.ok) {
              const errorText = await res.text();
              throw new Error(`HTTP ${res.status}: ${errorText.slice(0, 100)}`);
            }
            return await res.json();
          } finally {
            clearTimeout(timeout);
          }
        });
        results.push({
          component: 'OpenRouter',
          status: 'PASS',
          evidence: `ENV key works, received response in ${(latency / 1000).toFixed(1)}s (not in DB)`,
          latency,
        });
      } catch (err) {
        results.push({
          component: 'OpenRouter',
          status: 'FAIL',
          evidence: `ENV key exists but API failed: ${err instanceof Error ? err.message.slice(0, 80) : 'Unknown'}`,
        });
      }
    }
  } else {
    const existingOpenRouter = configs.find((c) => c.provider === 'openrouter');
    if (!existingOpenRouter) {
      results.push({
        component: 'OpenRouter',
        status: 'NOT_CONFIGURED',
        evidence: 'No OPENROUTER_API_KEY in environment and no DB record',
      });
    }
  }

  // Anthropic test (env-only if not in DB)
  if (anthropicKey) {
    const existingAnthropic = configs.find((c) => c.provider === 'anthropic');
    if (!existingAnthropic) {
      try {
        const { latency } = await timedApiCall(async () => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);
          try {
            const res = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicKey,
                'anthropic-version': '2023-06-01',
              },
              body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 20,
                messages: [{ role: 'user', content: 'Reply with exactly: Anthropic connection successful.' }],
              }),
              signal: controller.signal,
            });
            if (!res.ok) {
              const errorText = await res.text();
              throw new Error(`HTTP ${res.status}: ${errorText.slice(0, 100)}`);
            }
            return await res.json();
          } finally {
            clearTimeout(timeout);
          }
        });
        results.push({
          component: 'Anthropic',
          status: 'PASS',
          evidence: `ENV key works, received response in ${(latency / 1000).toFixed(1)}s (not in DB)`,
          latency,
        });
      } catch (err) {
        results.push({
          component: 'Anthropic',
          status: 'FAIL',
          evidence: `ENV key exists but API failed: ${err instanceof Error ? err.message.slice(0, 80) : 'Unknown'}`,
        });
      }
    }
  } else {
    const existingAnthropic = configs.find((c) => c.provider === 'anthropic');
    if (!existingAnthropic) {
      results.push({
        component: 'Anthropic',
        status: 'NOT_CONFIGURED',
        evidence: 'No ANTHROPIC_API_KEY in environment and no DB record',
      });
    }
  }

  // OpenAI test
  if (openaiKey) {
    const existingOpenAI = configs.find((c) => c.provider === 'openai');
    if (!existingOpenAI) {
      // Try to test with env key directly
      try {
        const { latency } = await timedApiCall(async () => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);
          try {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${openaiKey}`,
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                max_tokens: 20,
                messages: [{ role: 'user', content: 'Reply with exactly: OpenAI connection successful.' }],
              }),
              signal: controller.signal,
            });
            if (!res.ok) {
              const errorText = await res.text();
              throw new Error(`HTTP ${res.status}: ${errorText.slice(0, 100)}`);
            }
            return await res.json();
          } finally {
            clearTimeout(timeout);
          }
        });
        results.push({
          component: 'OpenAI',
          status: 'PASS',
          evidence: `ENV key works, received response in ${(latency / 1000).toFixed(1)}s (not in DB)`,
          latency,
        });
      } catch (err) {
        results.push({
          component: 'OpenAI',
          status: 'FAIL',
          evidence: `ENV key exists but API failed: ${err instanceof Error ? err.message.slice(0, 80) : 'Unknown'}`,
        });
      }
    }
  } else {
    const existingOpenAI = configs.find((c) => c.provider === 'openai');
    if (!existingOpenAI) {
      results.push({
        component: 'OpenAI',
        status: 'NOT_CONFIGURED',
        evidence: 'No OPENAI_API_KEY in environment and no DB record',
      });
    }
  }

  // Groq test
  if (groqKey) {
    const existingGroq = configs.find((c) => c.provider === 'groq');
    if (!existingGroq) {
      try {
        const { latency } = await timedApiCall(async () => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);
          try {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${groqKey}`,
              },
              body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                max_tokens: 20,
                messages: [{ role: 'user', content: 'Reply with exactly: Groq connection successful.' }],
              }),
              signal: controller.signal,
            });
            if (!res.ok) {
              const errorText = await res.text();
              throw new Error(`HTTP ${res.status}: ${errorText.slice(0, 100)}`);
            }
            return await res.json();
          } finally {
            clearTimeout(timeout);
          }
        });
        results.push({
          component: 'Groq',
          status: 'PASS',
          evidence: `ENV key works, received response in ${(latency / 1000).toFixed(1)}s (not in DB)`,
          latency,
        });
      } catch (err) {
        results.push({
          component: 'Groq',
          status: 'FAIL',
          evidence: `ENV key exists but API failed: ${err instanceof Error ? err.message.slice(0, 80) : 'Unknown'}`,
        });
      }
    }
  } else {
    const existingGroq = configs.find((c) => c.provider === 'groq');
    if (!existingGroq) {
      results.push({
        component: 'Groq',
        status: 'NOT_CONFIGURED',
        evidence: 'No GROQ_API_KEY in environment and no DB record',
      });
    }
  }

  return results;
}

// ─── Step 3: Chatbot End-to-End Test ────────────────────────────────────────────

async function stepChatbotE2ETest(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];

  // Test 1: Simple greeting
  try {
    const { result: response1, latency: latency1 } = await timedApiCall(() =>
      generateCompletion('Hello', { system: CHATBOT_SYSTEM_PROMPT, maxTokens: 256 }),
    );

    if (!response1 || response1.trim().length === 0) {
      results.push({
        component: 'Chatbot (Hello)',
        status: 'FAIL',
        evidence: 'Empty response received',
        latency: latency1,
      });
    } else {
      // Verify parsing works
      const parsed = parseAIResponse(response1);
      results.push({
        component: 'Chatbot (Hello)',
        status: 'PASS',
        evidence: `Response: ${parsed.answer.slice(0, 60)}... (${(latency1 / 1000).toFixed(1)}s)`,
        latency: latency1,
      });
    }
  } catch (err) {
    results.push({
      component: 'Chatbot (Hello)',
      status: 'FAIL',
      evidence: err instanceof Error ? err.message.slice(0, 100) : 'Unknown error',
    });
  }

  // Test 2: Domain-specific question
  try {
    const { result: response2, latency: latency2 } = await timedApiCall(() =>
      generateCompletion('What services does MG Blessed Beginnings offer?', {
        system: CHATBOT_SYSTEM_PROMPT,
        maxTokens: 512,
      }),
    );

    if (!response2 || response2.trim().length === 0) {
      results.push({
        component: 'Chatbot (Services)',
        status: 'FAIL',
        evidence: 'Empty response received',
        latency: latency2,
      });
    } else {
      const parsed = parseAIResponse(response2);
      results.push({
        component: 'Chatbot (Services)',
        status: 'PASS',
        evidence: `Response: ${parsed.answer.slice(0, 60)}... (${(latency2 / 1000).toFixed(1)}s)`,
        latency: latency2,
      });
    }
  } catch (err) {
    results.push({
      component: 'Chatbot (Services)',
      status: 'FAIL',
      evidence: err instanceof Error ? err.message.slice(0, 100) : 'Unknown error',
    });
  }

  return results;
}

// ─── Step 4: JSON Parser Verification ───────────────────────────────────────────

function stepJSONParserTest(): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];
  const tests: Array<{ name: string; input: unknown; expectValid: boolean }> = [
    { name: 'Valid JSON object', input: '{"answer": "test"}', expectValid: true },
    { name: 'Plain text', input: 'Hello world', expectValid: true },
    { name: 'Malformed JSON', input: '{broken', expectValid: true }, // Should handle gracefully, not crash
    { name: 'Markdown code block', input: '```json\n{"key":"val"}\n```', expectValid: true },
    { name: 'Empty string', input: '', expectValid: false },
    { name: 'Null input', input: null, expectValid: false },
  ];

  let passCount = 0;
  let failCount = 0;
  const failures: string[] = [];

  for (const test of tests) {
    try {
      const parsed = safeParseResponse(test.input);
      const hasContent = hasValidContent(parsed);
      const extracted = extractTextContent(parsed);

      if (test.expectValid) {
        // For non-empty inputs, we expect graceful handling (not crash)
        if (test.input === '{broken') {
          // Malformed JSON should be treated as plain text, not crash
          passCount++;
        } else if (typeof test.input === 'string' && test.input.trim().length > 0) {
          if (hasContent || extracted.length > 0) {
            passCount++;
          } else {
            failCount++;
            failures.push(`${test.name}: no content extracted`);
          }
        } else {
          passCount++;
        }
      } else {
        // For empty/null, we expect no valid content
        if (!hasContent) {
          passCount++;
        } else {
          failCount++;
          failures.push(`${test.name}: expected no content but got some`);
        }
      }
    } catch (err) {
      failCount++;
      failures.push(`${test.name}: threw error — ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  results.push({
    component: 'JSON Parser',
    status: failCount === 0 ? 'PASS' : 'FAIL',
    evidence: failCount === 0 ? `${passCount}/${tests.length} tests passed` : `${failures.join('; ')}`,
  });

  return results;
}

// ─── Step 5: Fallback Chain Test ────────────────────────────────────────────────

async function stepFallbackChainTest(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];

  try {
    // Get the current primary provider
    const primary = await AIProviderConfig.findOne({ isPrimary: true, isEnabled: true });
    const fallbacks = await AIProviderConfig.find({ isEnabled: true, isPrimary: false }).sort({ fallbackOrder: 1 });

    if (!primary && fallbacks.length === 0) {
      results.push({
        component: 'Fallback Chain',
        status: 'FAIL',
        evidence: 'No providers configured to test fallback',
      });
      return results;
    }

    // Test that generateCompletion works (it uses the fallback chain internally)
    const { latency } = await timedApiCall(() =>
      generateCompletion('Say "fallback test ok"', { maxTokens: 20 }),
    );

    results.push({
      component: 'Fallback Chain',
      status: 'PASS',
      evidence: `Completion succeeded via provider chain in ${(latency / 1000).toFixed(1)}s`,
      latency,
    });
  } catch (err) {
    results.push({
      component: 'Fallback Chain',
      status: 'FAIL',
      evidence: err instanceof Error ? err.message.slice(0, 100) : 'Unknown error',
    });
  }

  return results;
}

// ─── Step 6: AI Tool Tests ──────────────────────────────────────────────────────

async function stepAIToolTests(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];

  const toolTests: Array<{
    name: string;
    slug: string;
    input: Record<string, unknown>;
  }> = [
    {
      name: 'Tool: Product Description',
      slug: 'product-description-generator',
      input: { product: 'Test Widget', tone: 'professional', length: 'short' },
    },
    {
      name: 'Tool: SEO Title',
      slug: 'seo-title-optimizer',
      input: { topic: 'Blue Widget', keywords: ['widget', 'blue'], platform: 'eBay' },
    },
    {
      name: 'Tool: Hashtag',
      slug: 'hashtag-generator',
      input: { topic: 'online business', platform: 'Instagram', count: 10 },
    },
    {
      name: 'Tool: Profit Calculator',
      slug: 'profit-calculator',
      input: {
        productCost: 10,
        sellingPrice: 25,
        shippingCost: 3,
        marketplaceFeePercent: 8,
      },
    },
    {
      name: 'Tool: Competitor Analyzer',
      slug: 'competitor-analyzer',
      input: { url: 'https://example-competitor.com', focusAreas: ['pricing', 'seo'] },
    },
    {
      name: 'Tool: Review Response',
      slug: 'review-response-writer',
      input: { review: 'Great product! Fast shipping and excellent quality.', rating: 5, tone: 'grateful' },
    },
    {
      name: 'Tool: Listing Optimizer',
      slug: 'listing-optimizer',
      input: {
        productTitle: 'Blue Widget',
        description: 'A blue widget for everyday use',
        platform: 'eBay',
      },
    },
    {
      name: 'Tool: Social Media Studio',
      slug: 'social-media-studio',
      input: { platform: 'Instagram', topic: 'New product launch', contentType: 'post', tone: 'casual' },
    },
  ];

  for (const test of toolTests) {
    try {
      const { result, latency } = await timedApiCall(() =>
        generateToolContent({ toolSlug: test.slug as Parameters<typeof generateToolContent>[0]['toolSlug'], input: test.input }),
      );

      if (!result || result.trim().length === 0) {
        results.push({
          component: test.name,
          status: 'FAIL',
          evidence: 'Empty result returned',
          latency,
        });
      } else {
        results.push({
          component: test.name,
          status: 'PASS',
          evidence: `Generated ${result.length} chars in ${(latency / 1000).toFixed(1)}s`,
          latency,
        });
      }
    } catch (err) {
      results.push({
        component: test.name,
        status: 'FAIL',
        evidence: err instanceof Error ? err.message.slice(0, 100) : 'Unknown error',
      });
    }
  }

  return results;
}

// ─── Build fresh per-provider results for client-side card refresh ──────────

const ALL_PROVIDER_KEYS = ['google', 'openrouter', 'groq', 'anthropic', 'openai', 'luma'] as const;

const PROVIDER_LABEL_MAP: Record<string, string> = {
  google: 'Google AI',
  openrouter: 'OpenRouter',
  groq: 'Groq',
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  luma: 'Luma',
};

/**
 * Validates the stored/decrypted OpenRouter API key format without exposing any part of it.
 * Returns only 'valid' or 'invalid/empty'.
 */
async function validateOpenRouterKeyForDiagnostic(): Promise<'valid' | 'invalid/empty'> {
  try {
    // Check DB-stored key first
    const dbConfig = await AIProviderConfig.findOne({ provider: 'openrouter' });
    if (dbConfig) {
      try {
        const decryptedKey = dbConfig.decryptApiKey();
        if (!decryptedKey || typeof decryptedKey !== 'string') {
          return 'invalid/empty';
        }
        const trimmed = decryptedKey.trim();
        if (trimmed.length === 0) {
          return 'invalid/empty';
        }
        // Must start with sk-or- prefix and be at least 20 chars
        if (trimmed.startsWith('sk-or-') && trimmed.length >= 20) {
          return 'valid';
        }
        return 'invalid/empty';
      } catch {
        return 'invalid/empty';
      }
    }

    // Fall back to env var
    const envKey = process.env.OPENROUTER_API_KEY;
    if (!envKey || typeof envKey !== 'string') {
      return 'invalid/empty';
    }
    const trimmed = envKey.trim();
    if (trimmed.length === 0) {
      return 'invalid/empty';
    }
    if (trimmed.startsWith('sk-or-') && trimmed.length >= 20) {
      return 'valid';
    }
    return 'invalid/empty';
  } catch {
    return 'invalid/empty';
  }
}

/**
 * Extracts per-provider test results from the flat DiagnosticResult[] array
 * produced by stepProviderAPITests(), then fills in missing providers as "not-tested".
 */
async function buildProviderDiagnosticEntries(
  providerResults: DiagnosticResult[],
): Promise<ProviderDiagnosticEntry[]> {
  const now = new Date().toISOString();
  const entries: ProviderDiagnosticEntry[] = [];

  // Map each known provider key to its matching result entry
  for (const key of ALL_PROVIDER_KEYS) {
    const label = PROVIDER_LABEL_MAP[key];
    // Find the matching result — component names use labels like "Gemini (Google)", "OpenRouter", etc.
    const match = providerResults.find((r) => {
      const compLower = r.component.toLowerCase();
      if (key === 'google') return compLower.includes('gemini') || compLower.includes('google');
      return compLower.includes(key);
    });

    if (match) {
      let status: ProviderDiagnosticEntry['status'];
      if (match.status === 'PASS') {
        status = 'success';
      } else if (match.status === 'FAIL') {
        status = 'failed';
      } else if (match.status === 'NOT_CONFIGURED') {
        status = 'unavailable';
      } else {
        status = 'not-tested';
      }

      const entry: ProviderDiagnosticEntry = {
        provider: key,
        label,
        status,
        lastTested: now,
        errorMessage: status === 'failed' ? match.evidence : undefined,
        responseDurationMs: match.latency,
      };

      // Attach model name from evidence if available
      if (match.evidence) {
        // Try to extract model info from evidence strings like "ENV key works..." or latency messages
        const modelMatch = match.evidence.match(/model[:\s]+([^\s,]+)/i);
        if (modelMatch) {
          entry.modelName = modelMatch[1];
        }
      }

      // OpenRouter key format validation
      if (key === 'openrouter') {
        entry.keyStatus = await validateOpenRouterKeyForDiagnostic();
      }

      entries.push(entry);
    } else {
      // No matching result — mark as not-tested
      const entry: ProviderDiagnosticEntry = {
        provider: key,
        label,
        status: 'not-tested',
        lastTested: now,
      };

      if (key === 'openrouter') {
        entry.keyStatus = await validateOpenRouterKeyForDiagnostic();
      }

      entries.push(entry);
    }
  }

  return entries;
}

// ─── Main Diagnostic Controller ─────────────────────────────────────────────────

export const diagnosticController = {
  async runDiagnostic(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[DIAGNOSTIC] Starting comprehensive AI diagnostic...');
      const startTime = Date.now();

      const allResults: DiagnosticResult[] = [];

      // Step 1: Database verification
      console.log('[DIAGNOSTIC] Step 1: Database verification...');
      const dbResult = await stepDatabaseVerification();
      allResults.push(...dbResult.results);

      // Step 2: Provider API tests
      console.log('[DIAGNOSTIC] Step 2: Provider API tests...');
      const providerResults = await stepProviderAPITests();
      allResults.push(...providerResults);

      // Step 3: Chatbot E2E test
      console.log('[DIAGNOSTIC] Step 3: Chatbot E2E test...');
      const chatbotResults = await stepChatbotE2ETest();
      allResults.push(...chatbotResults);

      // Step 4: JSON parser verification
      console.log('[DIAGNOSTIC] Step 4: JSON parser verification...');
      const parserResults = stepJSONParserTest();
      allResults.push(...parserResults);

      // Step 5: Fallback chain test
      console.log('[DIAGNOSTIC] Step 5: Fallback chain test...');
      const fallbackResults = await stepFallbackChainTest();
      allResults.push(...fallbackResults);

      // Step 6: AI tool tests
      console.log('[DIAGNOSTIC] Step 6: AI tool tests...');
      const toolResults = await stepAIToolTests();
      allResults.push(...toolResults);

      // Calculate summary
      const passed = allResults.filter((r) => r.status === 'PASS').length;
      const failed = allResults.filter((r) => r.status === 'FAIL').length;
      const notConfigured = allResults.filter((r) => r.status === 'NOT_CONFIGURED').length;

      const totalTime = Date.now() - startTime;
      console.log(`[DIAGNOSTIC] Complete in ${(totalTime / 1000).toFixed(1)}s — ${passed} passed, ${failed} failed, ${notConfigured} not configured`);

      // Get env provider statuses and recommendation
      const envProviders = getEnvProviderStatuses();
      const recommendation = getRecommendedProvider();

      // Build fresh per-provider results for client-side card refresh
      console.log('[DIAGNOSTIC] Building per-provider diagnostic entries...');
      const providerEntries = await buildProviderDiagnosticEntries(providerResults);

      const response: DiagnosticResponse = {
        timestamp: new Date().toISOString(),
        results: allResults,
        providerChain: dbResult.providerChain,
        databaseIssues: dbResult.databaseIssues,
        envProviders,
        recommendation,
        summary: {
          passed,
          failed,
          notConfigured,
          total: allResults.length,
        },
        providers: providerEntries,
      };

      // ── Persist diagnostic results to the database ────────────────────────
      // Save the full run so the client can restore it on page reload.
      try {
        await DiagnosticResultModel.create({
          runAt: new Date(response.timestamp),
          providerResults: providerEntries.map((p) => ({
            provider: p.provider,
            label: p.label,
            status: p.status,
            lastTested: p.lastTested,
            errorMessage: p.errorMessage,
            modelName: p.modelName,
            responseDurationMs: p.responseDurationMs,
            keyStatus: p.keyStatus,
          })),
          testResults: allResults.map((r) => ({
            component: r.component,
            status: r.status,
            evidence: r.evidence,
            latency: r.latency,
          })),
          summary: {
            passed,
            failed,
            notConfigured,
            total: allResults.length,
          },
          providerChain: dbResult.providerChain,
          databaseIssues: dbResult.databaseIssues,
        });
        console.log('[DIAGNOSTIC] Results persisted to database');
      } catch (persistErr) {
        // Log but do not fail the request — the live response is still valid
        console.error('[DIAGNOSTIC] Failed to persist results:', persistErr);
      }

      res.json({ success: true, data: response });
    } catch (err) {
      console.error('[DIAGNOSTIC] Fatal error:', err);
      next(err);
    }
  },

  /**
   * POST /api/diagnostic/gemini-key-test
   * Internal-only endpoint that tests the Gemini API key from BOTH sources:
   *   1. GEMINI_API_KEY environment variable
   *   2. The "google" provider document in the AIProviderConfig database collection
   * Returns SUCCESS or the exact Google error code/message for each source.
   * Never logs or reveals any key values.
   */
  async geminiKeyTest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const results: Record<string, unknown> = {};

      // ── Test 1: Environment variable key ────────────────────────────────
      const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!envKey) {
        results.envKey = {
          source: 'GEMINI_API_KEY / GOOGLE_API_KEY env var',
          present: false,
          result: 'NOT_CONFIGURED',
        };
      } else {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${envKey}`;
          const apiRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Reply OK' }] }],
              generationConfig: { maxOutputTokens: 5 },
            }),
            signal: controller.signal,
          });
          clearTimeout(timeout);

          if (apiRes.ok) {
            results.envKey = {
              source: 'GEMINI_API_KEY / GOOGLE_API_KEY env var',
              present: true,
              keyLength: envKey.length,
              keyPrefix: envKey.slice(0, 4),
              result: 'SUCCESS',
              httpStatus: apiRes.status,
            };
          } else {
            const errorBody = await apiRes.text();
            let errorCode = '';
            let errorMessage = '';
            try {
              const parsed = JSON.parse(errorBody);
              errorCode = parsed?.error?.code?.toString() || '';
              errorMessage = parsed?.error?.message || '';
            } catch {
              errorMessage = errorBody.slice(0, 200);
            }
            results.envKey = {
              source: 'GEMINI_API_KEY / GOOGLE_API_KEY env var',
              present: true,
              keyLength: envKey.length,
              keyPrefix: envKey.slice(0, 4),
              result: 'FAILED',
              httpStatus: apiRes.status,
              googleErrorCode: errorCode,
              googleErrorMessage: errorMessage,
            };
          }
        } catch (fetchErr) {
          results.envKey = {
            source: 'GEMINI_API_KEY / GOOGLE_API_KEY env var',
            present: true,
            result: 'FETCH_ERROR',
            error: fetchErr instanceof Error ? fetchErr.message : String(fetchErr),
          };
        }
      }

      // ── Test 2: Database-stored key (decrypted) ─────────────────────────
      try {
        const dbConfig = await AIProviderConfig.findOne({ provider: 'google' });
        if (!dbConfig) {
          results.dbKey = {
            source: 'AIProviderConfig DB (provider=google)',
            present: false,
            result: 'NOT_FOUND_IN_DB',
          };
        } else {
          let decryptedKey: string;
          try {
            decryptedKey = dbConfig.decryptApiKey();
          } catch (decryptErr) {
            results.dbKey = {
              source: 'AIProviderConfig DB (provider=google)',
              present: true,
              isPrimary: dbConfig.isPrimary,
              isEnabled: dbConfig.isEnabled,
              modelName: dbConfig.modelName,
              result: 'DECRYPTION_FAILED',
              error: decryptErr instanceof Error ? decryptErr.message : String(decryptErr),
            };
            // Skip API test if decryption failed
            decryptedKey = '';
          }

          if (decryptedKey) {
            try {
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 15000);
              const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${decryptedKey}`;
              const apiRes = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: 'Reply OK' }] }],
                  generationConfig: { maxOutputTokens: 5 },
                }),
                signal: controller.signal,
              });
              clearTimeout(timeout);

              if (apiRes.ok) {
                results.dbKey = {
                  source: 'AIProviderConfig DB (provider=google)',
                  present: true,
                  isPrimary: dbConfig.isPrimary,
                  isEnabled: dbConfig.isEnabled,
                  modelName: dbConfig.modelName,
                  keyLength: decryptedKey.length,
                  keyPrefix: decryptedKey.slice(0, 4),
                  result: 'SUCCESS',
                  httpStatus: apiRes.status,
                };
              } else {
                const errorBody = await apiRes.text();
                let errorCode = '';
                let errorMessage = '';
                try {
                  const parsed = JSON.parse(errorBody);
                  errorCode = parsed?.error?.code?.toString() || '';
                  errorMessage = parsed?.error?.message || '';
                } catch {
                  errorMessage = errorBody.slice(0, 200);
                }
                results.dbKey = {
                  source: 'AIProviderConfig DB (provider=google)',
                  present: true,
                  isPrimary: dbConfig.isPrimary,
                  isEnabled: dbConfig.isEnabled,
                  modelName: dbConfig.modelName,
                  keyLength: decryptedKey.length,
                  keyPrefix: decryptedKey.slice(0, 4),
                  result: 'FAILED',
                  httpStatus: apiRes.status,
                  googleErrorCode: errorCode,
                  googleErrorMessage: errorMessage,
                };
              }
            } catch (fetchErr) {
              results.dbKey = {
                source: 'AIProviderConfig DB (provider=google)',
                present: true,
                isPrimary: dbConfig.isPrimary,
                isEnabled: dbConfig.isEnabled,
                modelName: dbConfig.modelName,
                result: 'FETCH_ERROR',
                error: fetchErr instanceof Error ? fetchErr.message : String(fetchErr),
              };
            }
          }
        }
      } catch (dbErr) {
        results.dbKey = {
          source: 'AIProviderConfig DB (provider=google)',
          result: 'DB_QUERY_ERROR',
          error: dbErr instanceof Error ? dbErr.message : String(dbErr),
        };
      }

      // ── Determine which key resolveProvider() would actually use ────────
      results.resolutionOrder = 'DB-first (getActiveProvider → resolveProvider), then env fallback';

      res.json({ success: true, data: results });
    } catch (err) {
      console.error('[DIAGNOSTIC:geminiKeyTest] Error:', err);
      next(err);
    }
  },

  /**
   * GET /api/diagnostic/ai-test
   * Live AI generation test that returns full diagnostic trace in the HTTP response.
   * Performs model discovery + a test generation and returns structured results
   * so the user can see the exact error from the browser preview.
   */
  async aiTest(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const startTime = Date.now();
      const result: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
      };

      // ── Step 1: Model Discovery ───────────────────────────────────────────
      console.log('[DIAGNOSTIC:aiTest] Running discoverBestFlashModel...');
      await discoverBestFlashModel();
      const discoveryResult = getLastDiscoveryResult();

      result.modelDiscovery = {
        success: discoveryResult?.success ?? false,
        selectedModel: discoveryResult?.selectedModel ?? DISCOVERED_FLASH_MODEL,
        flashModelsFound: discoveryResult?.flashModelsFound ?? [],
        totalModelsReturned: discoveryResult?.totalModelsReturned ?? 0,
        httpStatus: discoveryResult?.httpStatus ?? null,
        errorMessage: discoveryResult?.errorMessage ?? null,
        timestamp: discoveryResult?.timestamp ?? null,
      };

      // ── Step 2: Provider Resolution Info ──────────────────────────────────
      // Read env vars for key availability (never expose full keys)
      const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      const openrouterKey = process.env.OPENROUTER_API_KEY;
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      const openaiKey = process.env.OPENAI_API_KEY;
      const groqKey = process.env.GROQ_API_KEY;

      result.keyAvailability = {
        GEMINI_API_KEY: geminiKey ? { present: true, length: geminiKey.length, prefix: geminiKey.slice(0, 4) } : { present: false },
        OPENROUTER_API_KEY: openrouterKey ? { present: true, length: openrouterKey.length, prefix: openrouterKey.slice(0, 4) } : { present: false },
        ANTHROPIC_API_KEY: anthropicKey ? { present: true, length: anthropicKey.length, prefix: anthropicKey.slice(0, 4) } : { present: false },
        OPENAI_API_KEY: openaiKey ? { present: true, length: openaiKey.length, prefix: openaiKey.slice(0, 4) } : { present: false },
        GROQ_API_KEY: groqKey ? { present: true, length: groqKey.length, prefix: groqKey.slice(0, 4) } : { present: false },
      };

      // Check DB provider config
      try {
        const dbPrimary = await AIProviderConfig.findOne({ isPrimary: true, isEnabled: true });
        result.dbPrimaryProvider = dbPrimary
          ? {
              provider: dbPrimary.provider,
              modelName: dbPrimary.modelName,
              isPrimary: dbPrimary.isPrimary,
              isEnabled: dbPrimary.isEnabled,
            }
          : null;
      } catch (dbErr) {
        result.dbPrimaryProvider = {
          error: dbErr instanceof Error ? dbErr.message : 'DB query failed',
        };
      }

      // ── Step 3: Test Generation ───────────────────────────────────────────
      console.log('[DIAGNOSTIC:aiTest] Running test generation...');
      let generationResult: Record<string, unknown>;

      try {
        const genStart = Date.now();
        const output = await generateCompletion('Respond with just the word: hello', { maxTokens: 20 });
        const genDuration = Date.now() - genStart;

        generationResult = {
          success: true,
          responseLength: output.length,
          responsePreview: output.slice(0, 100),
          durationMs: genDuration,
        };
      } catch (genErr) {
        // Capture the full structured error
        const lastGenDiag = getLastGenerationDiagnostic();

        generationResult = {
          success: false,
          errorMessage: genErr instanceof Error ? genErr.message : String(genErr),
          errorName: genErr instanceof Error ? genErr.name : 'Error',
          ...(genErr && typeof genErr === 'object' && 'category' in genErr
            ? { category: (genErr as Record<string, unknown>).category }
            : {}),
          ...(genErr && typeof genErr === 'object' && 'provider' in genErr
            ? { provider: (genErr as Record<string, unknown>).provider }
            : {}),
          ...(genErr && typeof genErr === 'object' && 'httpStatus' in genErr
            ? { httpStatus: (genErr as Record<string, unknown>).httpStatus }
            : {}),
          // Include the full diagnostic trace from the last generation attempt
          lastGenerationDiagnostic: lastGenDiag
            ? {
                resolvedProvider: lastGenDiag.resolvedProvider,
                resolvedModel: lastGenDiag.resolvedModel,
                keySource: lastGenDiag.keySource,
                keyPrefix: lastGenDiag.keyPrefix,
                providersTried: lastGenDiag.providersTried,
                errorDetails: lastGenDiag.errorDetails,
                durationMs: lastGenDiag.durationMs,
              }
            : null,
        };
      }

      result.generation = generationResult;
      result.totalDurationMs = Date.now() - startTime;

      res.json({ success: true, data: result });
    } catch (err) {
      console.error('[DIAGNOSTIC:aiTest] Fatal error:', err);
      next(err);
    }
  },

  // Temporary endpoint to update Google provider model to gemini-3.5-flash-lite
  updateGoogleModel: async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('[DIAGNOSTIC:updateGoogleModel] Updating Google provider model...');
      
      // Find all Google providers
      const googleProviders = await AIProviderConfig.find({ provider: 'google' });
      
      if (googleProviders.length === 0) {
        return res.json({ 
          success: false, 
          message: 'No Google providers found in database' 
        });
      }

      const updates = [];
      
      // Update each Google provider to use gemini-3.5-flash-lite
      for (const provider of googleProviders) {
        const oldModel = provider.modelName;
        
        // Only update if currently using gemini-2.5-flash or similar deprecated models
        if (oldModel.includes('gemini-2.5-flash') || oldModel.includes('gemini-2.0-flash')) {
          console.log(`[DIAGNOSTIC:updateGoogleModel] Updating provider ${provider._id}: ${oldModel} → gemini-3.5-flash-lite`);
          
          await AIProviderConfig.findByIdAndUpdate(provider._id, {
            $set: { modelName: 'gemini-3.5-flash-lite' }
          });
          
          updates.push({
            id: provider._id.toString(),
            oldModel,
            newModel: 'gemini-3.5-flash-lite',
            isPrimary: provider.isPrimary
          });
        }
      }

      // Verify the update
      const updatedProviders = await AIProviderConfig.find({ 
        provider: 'google',
        modelName: 'gemini-3.5-flash-lite'
      });

      console.log(`[DIAGNOSTIC:updateGoogleModel] Updated ${updates.length} provider(s)`);

      res.json({ 
        success: true, 
        message: `Updated ${updates.length} Google provider(s) to gemini-3.5-flash-lite`,
        updates,
        verification: {
          totalGoogleProviders: googleProviders.length,
          providersNowUsingFlashLite: updatedProviders.length
        }
      });
    } catch (err) {
      console.error('[DIAGNOSTIC:updateGoogleModel] Error:', err);
      next(err);
    }
  },

  /**
   * GET /api/diagnostic/latest
   * Returns the most recent saved diagnostic run from the database.
   * Used by the client on page load to restore diagnostic state without re-running.
   */
  async getLatestDiagnostic(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const latest = await DiagnosticResultModel.findOne().sort({ runAt: -1 }).lean();

      if (!latest) {
        res.json({ success: true, data: null });
        return;
      }

      // Map the stored document back into the DiagnosticResponse shape the client expects
      const response: DiagnosticResponse = {
        timestamp: latest.runAt instanceof Date ? latest.runAt.toISOString() : String(latest.runAt),
        results: latest.testResults.map((t) => ({
          component: t.component,
          status: t.status,
          evidence: t.evidence,
          latency: t.latency,
        })),
        providerChain: {
          primary: latest.providerChain?.primary ?? 'None',
          fallback1: latest.providerChain?.fallback1 ?? 'None',
          fallback2: latest.providerChain?.fallback2 ?? 'None',
        },
        databaseIssues: latest.databaseIssues ?? [],
        envProviders: [], // not persisted — only relevant during a live run
        recommendation: null, // not persisted — only relevant during a live run
        summary: {
          passed: latest.summary?.passed ?? 0,
          failed: latest.summary?.failed ?? 0,
          notConfigured: latest.summary?.notConfigured ?? 0,
          total: latest.summary?.total ?? 0,
        },
        providers: latest.providerResults.map((p) => ({
          provider: p.provider,
          label: p.label,
          status: p.status,
          lastTested: p.lastTested,
          errorMessage: p.errorMessage,
          modelName: p.modelName,
          responseDurationMs: p.responseDurationMs,
          keyStatus: p.keyStatus,
        })),
      };

      res.json({ success: true, data: response });
    } catch (err) {
      console.error('[DIAGNOSTIC:getLatest] Error:', err);
      next(err);
    }
  },
};
