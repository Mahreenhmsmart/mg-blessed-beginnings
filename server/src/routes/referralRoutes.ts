import { Router } from 'express';
import { protect } from '../middleware/auth';
import * as referralController from '../controllers/referralController';

const router = Router();

// GET /api/referrals/stats — current user's referral dashboard data (protected)
router.get('/stats', protect, referralController.getStats);

// POST /api/referrals/apply — apply a referral code to the authenticated user (protected)
router.post('/apply', protect, referralController.applyCode);

// GET /api/referrals/leaderboard — top 10 referrers (public)
router.get('/leaderboard', referralController.getLeaderboard);

export default router;
