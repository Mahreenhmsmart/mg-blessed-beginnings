import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { aiController } from '../controllers/aiController';
import { aiProviderController } from '../controllers/aiProviderController';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Stricter rate limiter for AI endpoint — 10 requests per 15 minutes
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many AI requests. Please try again later.' },
});

const chatValidation = [
  body('prompt')
    .isString()
    .trim()
    .isLength({ min: 1, max: 4000 })
    .withMessage('Prompt must be 1-4000 characters'),
  body('system')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('System prompt must be at most 2000 characters'),
];

router.post('/chat', protect, aiLimiter, chatValidation, validate, aiController.chat);

// ─── Free AI Tokens Hub (public, no auth) ──────────────────────────────────────

const freeGenerateValidation = [
  body('prompt')
    .isString()
    .trim()
    .isLength({ min: 1, max: 4000 })
    .withMessage('Prompt must be 1-4000 characters'),
  body('system')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('System prompt must be at most 2000 characters'),
];

// Public endpoint — returns configured free providers with their status
router.get('/free-providers', aiController.getFreeProviders);

// Public endpoint — generate with free-tier providers and automatic failover
router.post('/free-generate', aiLimiter, freeGenerateValidation, validate, aiController.freeGenerate);

// ─── Provider Settings Routes (all protected) ────────────────────────────────

const providerValidation = [
  body('provider')
    .isIn(['anthropic', 'openai', 'google', 'cohere', 'openrouter', 'groq', 'luma'])
    .withMessage('Provider must be one of: anthropic, openai, google, cohere, openrouter, groq, luma'),
  body('modelName')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Model name is required'),
  body('apiKey')
    .isString()
    .isLength({ min: 10 })
    .withMessage('API key must be at least 10 characters'),
];

// For updates, apiKey is optional (leave blank to keep existing)
const providerUpdateValidation = [
  body('provider')
    .optional()
    .isIn(['anthropic', 'openai', 'google', 'cohere', 'openrouter', 'groq', 'luma'])
    .withMessage('Provider must be one of: anthropic, openai, google, cohere, openrouter, groq, luma'),
  body('modelName')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Model name cannot be empty'),
  body('apiKey')
    .optional()
    .isString()
    .isLength({ min: 10 })
    .withMessage('API key must be at least 10 characters'),
];

router.get('/settings/providers', protect, restrictTo('admin'), aiProviderController.getStatuses);
router.get('/settings/ai-health', protect, restrictTo('admin'), aiProviderController.getHealth);
router.get('/settings/diagnostic', protect, restrictTo('admin'), aiProviderController.runDiagnostic);
router.post('/settings/providers', protect, restrictTo('admin'), providerValidation, validate, aiProviderController.saveConfig);
router.put('/settings/providers/:id', protect, restrictTo('admin'), providerUpdateValidation, validate, aiProviderController.saveConfig);
router.delete('/settings/providers/:id', protect, restrictTo('admin'), aiProviderController.removeConfig);
router.post('/settings/providers/:id/test', protect, restrictTo('admin'), aiProviderController.testConnection);
router.patch('/settings/providers/:id/primary', protect, restrictTo('admin'), aiProviderController.setPrimary);
router.get('/settings/providers/:id/validate-key-format', protect, restrictTo('admin'), aiProviderController.validateKeyFormat);

export default router;
