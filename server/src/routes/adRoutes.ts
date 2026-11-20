import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  createAdCheckout,
  getActiveAds,
  getMyAds,
  adminListAds,
  adminUpdateAdStatus,
  adminDeleteAd,
  verifyAdSession,
  trackImpression,
  trackClick,
  getMyAdStats,
} from '../controllers/adController';

const router = Router();

// Public endpoints
router.post('/checkout', createAdCheckout);
router.get('/checkout/session', verifyAdSession);
router.get('/active', getActiveAds);
router.post('/track', trackImpression);
router.post('/track-click', trackClick);

// Protected endpoints
router.get('/my-ads', protect, getMyAds);
router.get('/my-stats', protect, getMyAdStats);

// Admin endpoints
router.get('/admin', protect, restrictTo('admin'), adminListAds);
router.patch('/admin/:id', protect, restrictTo('admin'), adminUpdateAdStatus);
router.patch('/:id/status', protect, restrictTo('admin'), adminUpdateAdStatus);
router.delete('/admin/:id', protect, restrictTo('admin'), adminDeleteAd);
router.delete('/:id', protect, restrictTo('admin'), adminDeleteAd);

export default router;
