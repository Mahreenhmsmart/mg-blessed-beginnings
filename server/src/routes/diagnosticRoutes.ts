import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { diagnosticController } from '../controllers/diagnosticController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// Diagnostic endpoint — admin only, rate limited (1 request per minute to prevent abuse)
const diagnosticLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Diagnostic can only be run once per minute.' },
});

router.post(
  '/run',
  protect,
  restrictTo('admin'),
  diagnosticLimiter,
  diagnosticController.runDiagnostic,
);

// Internal-only Gemini key test — admin only, tests both env and DB keys independently
router.post(
  '/gemini-key-test',
  protect,
  restrictTo('admin'),
  diagnosticLimiter,
  diagnosticController.geminiKeyTest,
);

// Live AI generation test — GET endpoint accessible from browser preview.
// Performs model discovery + test generation and returns full diagnostic trace as JSON.
router.get(
  '/ai-test',
  protect,
  restrictTo('admin'),
  diagnosticLimiter,
  diagnosticController.aiTest,
);

// Temporary endpoint to update Google provider model to gemini-3.5-flash-lite
// This is a one-off operation to fix the HTTP 404 issue with gemini-2.5-flash
router.post(
  '/update-google-model',
  protect,
  restrictTo('admin'),
  diagnosticController.updateGoogleModel,
);

// Get latest saved diagnostic run — admin only
router.get(
  '/latest',
  protect,
  restrictTo('admin'),
  diagnosticController.getLatestDiagnostic,
);

export default router;
