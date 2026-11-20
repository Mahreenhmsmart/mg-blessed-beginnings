import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth';
import * as referralService from '../services/referralService';

export async function getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }
    const stats = await referralService.getReferralStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

export async function applyCode(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }
    const { code } = req.body;
    if (!code || typeof code !== 'string' || !code.trim()) {
      res.status(400).json({ success: false, message: 'Referral code is required.' });
      return;
    }
    const result = await referralService.applyReferralCode(req.user.id, code);
    if (!result.success) {
      res.status(400).json({ success: false, message: result.message });
      return;
    }
    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
}

export async function getLeaderboard(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const leaderboard = await referralService.getLeaderboard(10);
    res.json({ success: true, data: leaderboard });
  } catch (err) {
    next(err);
  }
}
