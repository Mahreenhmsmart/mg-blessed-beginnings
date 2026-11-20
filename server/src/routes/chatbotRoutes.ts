import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { chatbotController } from '../controllers/chatbotController';
import { validate } from '../middleware/validate';

const router = Router();

// Chatbot rate limiter — tuned for normal conversational use.
// Allows 50 messages per 5 minutes (avg 10/min) which supports natural back-and-forth
// conversation while still protecting against automated abuse (hundreds of req/min).
// The status endpoint is NOT rate-limited since it's called on page load.
const chatbotLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // ~10 messages/minute average, allows bursts during active conversation
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many messages. Please wait a moment before sending another.', errorCategory: 'rate_limited' },
});

const chatbotValidation = [
  body('message')
    .isString()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be 1-2000 characters'),
];

// GET /api/chatbot/status — public endpoint, returns active provider info
router.get('/status', chatbotController.status);

// POST /api/chatbot — public endpoint, no auth required
router.post('/', chatbotLimiter, chatbotValidation, validate, chatbotController.chat);

export default router;
