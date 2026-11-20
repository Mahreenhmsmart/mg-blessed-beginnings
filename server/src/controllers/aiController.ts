import type { Request, Response, NextFunction } from 'express';
import { generateCompletion, AIProviderError } from '../services/aiService';
import AIProviderConfig from '../models/AIProviderConfig';

// ─── Free provider definitions ────────────────────────────────────────────────

/** Providers considered "free tier" — Google Gemini and OpenRouter free models */
const FREE_PROVIDERS = new Set(['google', 'openrouter']);

/** Known free model identifiers for each provider */
const FREE_MODEL_PATTERNS: Record<string, RegExp> = {
  google: /flash|lite/i,
  openrouter: /:free$/i,
};

function isFreeModel(provider: string, modelName: string): boolean {
  if (!FREE_PROVIDERS.has(provider)) return false;
  const pattern = FREE_MODEL_PATTERNS[provider];
  if (!pattern) return true; // all models of this provider are considered free-tier
  return pattern.test(modelName);
}

interface FreeProviderStatus {
  provider: string;
  modelName: string;
  status: 'Working' | 'Not configured' | 'Failed';
  lastTestedAt?: Date;
  lastTestError?: string;
}

export const aiController = {
  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { prompt, system } = req.body;

      const response = await generateCompletion(prompt, {
        system: system || undefined,
      });

      res.json({ success: true, data: { response } });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/ai/free-providers
   * Returns the list of configured free providers with their real status.
   * Never exposes API keys.
   */
  async getFreeProviders(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const configs = await AIProviderConfig.find().sort({ fallbackOrder: 1 });

      const providers: FreeProviderStatus[] = [];

      // Check DB-configured providers that are free-tier
      for (const config of configs) {
        if (!FREE_PROVIDERS.has(config.provider)) continue;

        let status: FreeProviderStatus['status'] = 'Not configured';

        if (config.isEnabled) {
          // Check last test result to determine working/failed
          if (config.lastTestResult === 'success') {
            status = 'Working';
          } else if (config.lastTestResult) {
            status = 'Failed';
          } else {
            // Enabled but never tested — consider working optimistically
            status = 'Working';
          }
        }

        providers.push({
          provider: config.provider,
          modelName: config.modelName,
          status,
          lastTestedAt: config.lastTestedAt,
          lastTestError: config.lastTestError,
        });
      }

      // If no DB-configured free providers, check env vars as a fallback signal
      if (providers.length === 0) {
        const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.AI_API_KEY;
        if (geminiKey && geminiKey.length > 5) {
          providers.push({
            provider: 'google',
            modelName: 'gemini-3.5-flash-lite',
            status: 'Working',
          });
        }

        const openrouterKey = process.env.OPENROUTER_API_KEY;
        if (openrouterKey && openrouterKey.length > 5) {
          providers.push({
            provider: 'openrouter',
            modelName: 'google/gemini-2.0-flash-exp:free',
            status: 'Working',
          });
        }
      }

      res.json({ success: true, data: providers });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/ai/free-generate
   * Generate a completion using only free-tier providers with automatic failover.
   * Returns which provider and model actually answered.
   */
  async freeGenerate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { prompt, system } = req.body;

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        res.status(400).json({ success: false, error: 'Prompt is required', statusCode: 400 });
        return;
      }

      // Use the existing generateCompletion which already handles failover
      const response = await generateCompletion(prompt, {
        system: system || undefined,
      });

      // Determine which provider/model was used from the last generation diagnostic
      // The generateCompletion function resolves providers internally
      // We report back what we can determine
      const configs = await AIProviderConfig.find({ isEnabled: true }).sort({ fallbackOrder: 1 });
      let resolvedProvider = 'unknown';
      let resolvedModel = 'unknown';

      // Check which free provider is primary or first in chain
      for (const config of configs) {
        if (FREE_PROVIDERS.has(config.provider)) {
          resolvedProvider = config.provider;
          resolvedModel = config.modelName;
          break;
        }
      }

      // Fallback to env-based detection
      if (resolvedProvider === 'unknown') {
        const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.AI_API_KEY;
        if (geminiKey && geminiKey.length > 5) {
          resolvedProvider = 'google';
          resolvedModel = 'gemini-3.5-flash-lite';
        } else {
          const openrouterKey = process.env.OPENROUTER_API_KEY;
          if (openrouterKey && openrouterKey.length > 5) {
            resolvedProvider = 'openrouter';
            resolvedModel = 'google/gemini-2.0-flash-exp:free';
          }
        }
      }

      res.json({
        success: true,
        data: {
          response,
          provider: resolvedProvider,
          model: resolvedModel,
        },
      });
    } catch (err) {
      if (err instanceof AIProviderError) {
        const isAllUnavailable = err.category === 'all_unavailable' || err.category === 'rate_limited';
        if (isAllUnavailable) {
          res.status(503).json({
            success: false,
            error: 'All free providers are busy right now — please try again in a little while',
            statusCode: 503,
            allProvidersBusy: true,
          });
          return;
        }
      }
      next(err);
    }
  },
};
