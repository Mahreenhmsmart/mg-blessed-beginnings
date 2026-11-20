import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth';

export async function createIntent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    res.status(503).json({
      success: false,
      error: 'Payment processing is not currently configured. Please contact support.',
      statusCode: 503,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    res.status(503).json({
      success: false,
      error: 'Payment processing is not currently configured. Please contact support.',
      statusCode: 503,
    });
  } catch (err) {
    next(err);
  }
}
