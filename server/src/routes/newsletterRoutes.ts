import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import * as newsletterService from '../services/newsletterService';

const router = Router();

// POST /api/newsletter/subscribe
router.post(
  '/subscribe',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('source').optional().isString().trim(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const { email, source } = req.body;
      const { isNew } = await newsletterService.subscribe(email, source);

      res.json({
        success: true,
        message: isNew
          ? 'Thank you for subscribing!'
          : 'You are already subscribed.',
        isNew,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/newsletter/stats (admin only - could add auth middleware later)
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await newsletterService.getSubscriberCount();
    res.json({ success: true, data: { subscriberCount: count } });
  } catch (err) {
    next(err);
  }
});

export default router;
