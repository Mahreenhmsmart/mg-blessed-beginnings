import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  createCheckout,
  verifySessionHandler,
  getSubscriptionStatus,
  cancelSubscription,
} from '../controllers/subscriptionController';

const router = Router();

router.post('/create-checkout', protect, createCheckout);
router.post('/verify', protect, verifySessionHandler);
router.get('/status', protect, getSubscriptionStatus);
router.post('/cancel', protect, cancelSubscription);

export default router;
