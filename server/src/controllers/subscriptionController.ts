import type { Response, NextFunction } from 'express';
import Subscription from '../models/Subscription';
import type { AuthRequest } from '../middleware/auth';

// Plan pricing map — kept for display purposes
const PLAN_PRICING: Record<string, { unitAmount: number; name: string }> = {
  starter: { unitAmount: 999, name: 'Starter Plan' },
  pro: { unitAmount: 1999, name: 'Pro Plan' },
  business: { unitAmount: 4999, name: 'Business Plan' },
};

export async function createCheckout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

export async function verifySessionHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

export async function getSubscriptionStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;

    const subscription = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'trialing', 'past_due'] },
    }).sort({ createdAt: -1 });

    if (!subscription) {
      res.json({
        success: true,
        data: {
          hasSubscription: false,
          status: 'free',
          plan: null,
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        hasSubscription: true,
        status: subscription.status,
        plan: subscription.planId,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function cancelSubscription(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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
