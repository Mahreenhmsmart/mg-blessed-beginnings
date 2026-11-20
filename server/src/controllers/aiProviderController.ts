import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth';
import * as aiProviderService from '../services/aiProviderService';
import { getEnvProviderStatuses, getRecommendedProvider } from '../services/aiService';

export const aiProviderController = {
  async getStatuses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const statuses = await aiProviderService.getProviderStatuses();
      res.json({ success: true, data: statuses });
    } catch (err) {
      next(err);
    }
  },

  async getHealth(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const health = await aiProviderService.getProviderHealth();
      res.json({ success: true, data: health });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Comprehensive diagnostic endpoint that checks all provider configurations.
   * Returns status of both DB-configured and env-configured providers without exposing API keys.
   */
  async runDiagnostic(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get DB-configured providers
      const dbHealth = await aiProviderService.getProviderHealth();
      
      // Get env-configured providers
      const envProviders = getEnvProviderStatuses();
      
      // Get recommended provider based on available keys
      const recommended = getRecommendedProvider();
      
      // Summarize configuration status
      const hasDbConfig = dbHealth.length > 0;
      const hasEnvConfig = envProviders.some(p => p.hasKey);
      const hasAnyConfig = hasDbConfig || hasEnvConfig;
      
      // Check for common issues
      const issues: string[] = [];
      
      if (!hasAnyConfig) {
        issues.push('No AI provider configured. Set up a provider in Settings or add API keys to environment variables.');
      }
      
      // Check if any configured provider has authentication issues
      const authFailedProviders = dbHealth.filter(h => h.errorCategory === 'auth_failed');
      if (authFailedProviders.length > 0) {
        issues.push(`Authentication failed for: ${authFailedProviders.map(p => p.provider).join(', ')}. Check your API keys.`);
      }
      
      // Check for model configuration issues
      const modelIssueProviders = dbHealth.filter(h => h.errorCategory === 'invalid_model' || h.errorCategory === 'unavailable');
      if (modelIssueProviders.length > 0) {
        issues.push(`Model configuration issues for: ${modelIssueProviders.map(p => p.provider).join(', ')}. Verify model names.`);
      }
      
      res.json({
        success: true,
        data: {
          configured: hasAnyConfig,
          dbProviders: dbHealth,
          envProviders: envProviders.map(p => ({
            provider: p.provider,
            hasKey: p.hasKey,
            keyEnvVar: p.keyEnvVar,
            defaultModel: p.defaultModel,
            isFreeTierFriendly: p.isFreeTierFriendly,
          })),
          recommended,
          issues,
          summary: {
            totalDbProviders: dbHealth.length,
            connectedDbProviders: dbHealth.filter(h => h.connected).length,
            totalEnvKeys: envProviders.filter(p => p.hasKey).length,
            hasPrimary: dbHealth.some(h => h.enabled),
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async saveConfig(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { provider, modelName, apiKey, isEnabled, isPrimary, fallbackOrder } = req.body;
      const id = req.params.id; // undefined for POST, defined for PUT

      const result = await aiProviderService.saveProviderConfig(
        { provider, modelName, apiKey, isEnabled, isPrimary, fallbackOrder },
        id,
      );

      res.json({
        success: true,
        data: result,
        message: id ? 'Provider updated successfully' : 'Provider added successfully',
      });
    } catch (err) {
      next(err);
    }
  },

  async removeConfig(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await aiProviderService.deleteProviderConfig(req.params.id);
      res.json({ success: true, message: 'Provider deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  async testConnection(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiProviderService.testConnection(req.params.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async setPrimary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await aiProviderService.setPrimaryProvider(req.params.id);
      res.json({ success: true, message: 'Primary provider updated' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Validate the format of a stored OpenRouter key.
   * Returns ONLY 'valid' or 'invalid/empty' — never exposes any part of the key.
   */
  async validateKeyFormat(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiProviderService.validateOpenRouterKeyFormat(req.params.id);
      res.json({ success: true, data: { status: result } });
    } catch (err) {
      next(err);
    }
  },
};
