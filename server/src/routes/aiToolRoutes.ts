import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { aiToolController } from '../controllers/aiToolController';
import { protect, restrictTo } from '../middleware/auth';
import type { Request, Response, NextFunction } from 'express';
import { generateToolContent, type ToolSlug } from '../services/aiToolGenerationService';
import { AIProviderError, getLastGenerationDiagnostic } from '../services/aiService';

const router = Router();

// Rate limiter for AI tool generation (10 requests per minute per user)
const generationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many generation requests. Please wait a minute.' },
});

// Public routes
router.get('/categories', aiToolController.getCategories);
router.get('/', aiToolController.getAll);
router.get('/slug/:slug', aiToolController.getBySlug);
router.get('/:id', aiToolController.getById);

// Admin routes (protected)
router.post('/', protect, restrictTo('admin'), aiToolController.create);
router.put('/:id', protect, restrictTo('admin'), aiToolController.update);
router.delete('/:id', protect, restrictTo('admin'), aiToolController.delete);

// AI Tool Generation endpoint (public + rate limited)
// Note: Authentication is optional for free tools - removed 'protect' middleware
router.post('/generate/:toolSlug', generationLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { toolSlug } = req.params;
    
    // Live tools that are fully functional
    const liveSlugs: ToolSlug[] = [
      'product-description-generator',
      'seo-title-optimizer',
      'hashtag-generator',
      'profit-calculator',
      'competitor-analyzer',
      'review-response-writer',
      'listing-optimizer',
      'social-media-studio',
      'branding-assistant',
      'prompt-library',
      'listing-health-score',
      'keyword-research',
      'brand-campaign-studio',
      'seo-backlink-studio',
      'anchor-text-strategist',
      'seo-growth-plan',
      'seo-blog-article',
      'seo-competitor-snapshot',
      'meta-ads-campaign-plan',
      'whatsapp-business-generator',
    ];
    
    // Coming soon tools - disabled to prevent broken API requests
    const comingSoonSlugs: ToolSlug[] = [
      'store-audit',
      'bulk-listing-generator',
      'product-research-assistant',
    ];

    if (!liveSlugs.includes(toolSlug as ToolSlug) && !comingSoonSlugs.includes(toolSlug as ToolSlug)) {
      res.status(400).json({ success: false, error: `Invalid tool slug: ${toolSlug}` });
      return;
    }
    
    // Block requests to coming_soon tools
    if (comingSoonSlugs.includes(toolSlug as ToolSlug)) {
      res.status(400).json({ 
        success: false, 
        error: `This tool is coming soon and not yet available. Please check back later.` 
      });
      return;
    }

    // Hard timeout guard — prevents Express from holding the connection open
    // indefinitely when the upstream AI provider hangs. The route-level timeout
    // (55s) is longer than the per-provider AbortController timeout (38s) and
    // the overall fallback-chain deadline (52s), but shorter than the client-side
    // axios timeout (60s), so we always respond before the client gives up.
    const ROUTE_TIMEOUT_MS = 55_000;
    const generationPromise = generateToolContent({
      toolSlug: toolSlug as ToolSlug,
      input: req.body,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('AI_GENERATION_TIMEOUT')), ROUTE_TIMEOUT_MS);
    });

    let result: string;
    try {
      result = await Promise.race([generationPromise, timeoutPromise]);
    } catch (raceErr) {
      if (raceErr instanceof Error && raceErr.message === 'AI_GENERATION_TIMEOUT') {
        console.error(`[AI Generation] Route-level timeout (${ROUTE_TIMEOUT_MS}ms) for tool: ${toolSlug}`);
        res.status(504).json({
          success: false,
          error: 'AI generation timed out. Please try again.',
          statusCode: 504,
        });
        return;
      }
      throw raceErr; // re-throw non-timeout errors to the outer catch
    }

    // Validate that generation produced non-empty output — never return 200 with
    // null/empty result. An empty string means something went wrong silently and
    // the client would appear to hang with no feedback.
    if (!result || typeof result !== 'string' || result.trim().length === 0) {
      console.error(`[AI Generation] Tool "${toolSlug}" returned empty/null output`);
      res.status(500).json({
        success: false,
        error: 'Generation produced no output. Please try again with different inputs.',
        statusCode: 500,
      });
      return;
    }

    res.json({ success: true, data: { output: result } });
  } catch (err) {
    // Log full technical details server-side for debugging
    const slug = req.params.toolSlug;
    const timestamp = new Date().toISOString();
    
    console.error(`[AI Generation] ╔══════════════════════════════════════════╗`);
    console.error(`[AI Generation] ║   GENERATION FAILED                      ║`);
    console.error(`[AI Generation] ╚══════════════════════════════════════════╝`);
    console.error(`[AI Generation] Timestamp: ${timestamp}`);
    console.error(`[AI Generation] Tool slug: ${slug}`);
    console.error(`[AI Generation] Request body keys: ${Object.keys(req.body || {}).join(', ') || '(empty)'}`);
    
    if (err instanceof AIProviderError) {
      console.error(`[AI Generation] Error category: ${err.category}`);
      console.error(`[AI Generation] Error message: ${err.message}`);
      console.error(`[AI Generation] Provider: ${err.provider || 'N/A'}`);
      console.error(`[AI Generation] HTTP Status: ${err.httpStatus || 'N/A'}`);
      if (err.stack) console.error(`[AI Generation] Stack trace:\n${err.stack}`);
    } else {
      const error = err as Error;
      console.error(`[AI Generation] Error type: ${error.constructor?.name || 'Unknown'}`);
      console.error(`[AI Generation] Error message: ${error.message || String(err)}`);
      if (error.stack) console.error(`[AI Generation] Stack trace:\n${error.stack}`);
    }

    // Log the full generation diagnostic trace for post-mortem analysis.
    // This captures which providers were tried, what errors each returned,
    // and which provider/model/key-source was resolved — all without exposing keys.
    const lastGenDiag = getLastGenerationDiagnostic();
    if (lastGenDiag) {
      console.error(`[AI Generation] ── DIAGNOSTIC TRACE ──`);
      console.error(`[AI Generation]   Success: ${lastGenDiag.success}`);
      console.error(`[AI Generation]   Resolved Provider: ${lastGenDiag.resolvedProvider || 'N/A'}`);
      console.error(`[AI Generation]   Resolved Model: ${lastGenDiag.resolvedModel || 'N/A'}`);
      console.error(`[AI Generation]   Key Source: ${lastGenDiag.keySource || 'N/A'}`);
      console.error(`[AI Generation]   Key Prefix: ${lastGenDiag.keyPrefix || 'N/A'}...`);
      console.error(`[AI Generation]   Providers Tried: ${lastGenDiag.providersTried.join(', ') || 'none'}`);
      console.error(`[AI Generation]   Duration: ${lastGenDiag.durationMs}ms`);
      
      if (lastGenDiag.errorDetails.length > 0) {
        console.error(`[AI Generation]   Error Details:`);
        lastGenDiag.errorDetails.forEach((detail, idx) => {
          console.error(`[AI Generation]     ${idx + 1}. [${detail.provider}] ${detail.category} (HTTP ${detail.httpStatus || 'N/A'}): ${detail.message.slice(0, 200)}`);
        });
      }
    } else {
      console.error(`[AI Generation] ⚠ No diagnostic trace available — error may have occurred before generateCompletion was called`);
    }

    // Check environment variables for quick diagnosis
    console.error(`[AI Generation] ── ENV CHECK ──`);
    console.error(`[AI Generation]   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'SET (' + process.env.GEMINI_API_KEY.length + ' chars)' : 'NOT SET'}`);
    console.error(`[AI Generation]   GOOGLE_API_KEY: ${process.env.GOOGLE_API_KEY ? 'SET (' + process.env.GOOGLE_API_KEY.length + ' chars)' : 'NOT SET'}`);
    console.error(`[AI Generation]   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET'}`);
    console.error(`[AI Generation]   ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'SET' : 'NOT SET'}`);
    console.error(`[AI Generation]   OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? 'SET' : 'NOT SET'}`);
    console.error(`[AI Generation] ══════════════════════════════════════════`);

    // Return actionable error messages based on error type.
    // AIProviderError carries categorized messages that help users understand
    // what went wrong (auth failure, rate limit, timeout) instead of a generic fallback.
    let userMessage = 'Something went wrong generating this. Please try again in a moment.';
    let statusCode = 500;

    if (err instanceof AIProviderError) {
      switch (err.category) {
        case 'auth_failed':
          userMessage = 'AI provider authentication failed. Please contact support to verify your API key configuration.';
          statusCode = 502;
          break;
        case 'rate_limited':
          userMessage = 'AI services are currently busy. Please wait a few moments and try again.';
          statusCode = 429;
          break;
        case 'timeout':
          userMessage = 'AI generation timed out. Please try again.';
          statusCode = 504;
          break;
        case 'not_configured':
          userMessage = 'AI service is not configured. Please contact support.';
          statusCode = 503;
          break;
        case 'invalid_model':
          userMessage = 'AI model configuration error. Please contact support.';
          statusCode = 502;
          break;
        case 'all_unavailable':
          userMessage = 'AI generation failed after trying all available providers. Please try again in a few moments.';
          statusCode = 503;
          break;
        case 'network':
          userMessage = 'AI service temporarily unavailable. Please try again later.';
          statusCode = 503;
          break;
        default:
          // Use the AIProviderError message directly for uncategorized errors
          userMessage = err.message || userMessage;
          statusCode = 500;
          break;
      }
    } else if (err instanceof Error && err.message) {
      // Non-AIProviderError errors (validation, unknown tool, etc.)
      userMessage = err.message;
    }

    res.status(statusCode).json({
      success: false,
      error: userMessage,
      statusCode,
    });
  }
});

export default router;
