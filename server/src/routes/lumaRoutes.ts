import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { lumaController } from '../controllers/lumaController';
import { validate } from '../middleware/validate';

const router = Router();

// Stricter rate limiter for video generation — expensive API calls
const videoGenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 generations per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Video generation limit reached. Please wait before generating another video.',
  },
});

// Lighter rate limiter for status polling
const statusLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // generous for polling
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many status requests. Please slow down polling.',
  },
});

const generateValidation = [
  body('prompt')
    .isString()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Prompt must be 1-2000 characters'),
  body('aspectRatio')
    .optional()
    .isIn(['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'])
    .withMessage('Invalid aspect ratio'),
  body('loop')
    .optional()
    .isBoolean()
    .withMessage('Loop must be a boolean'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
];

// ─── Public Routes ─────────────────────────────────────────────────────────────
// These routes are intentionally PUBLIC (no auth required) to allow unauthenticated
// users to try the video generator tool, similar to other AI tools on the platform.
// Rate limiting is applied to prevent abuse.
router.post('/generate', videoGenLimiter, generateValidation, validate, lumaController.generate);
router.get('/status/:generationId', statusLimiter, lumaController.getStatus);
router.get('/result/:generationId', statusLimiter, lumaController.getResult);
router.get('/configured', lumaController.checkConfigured);

export default router;
