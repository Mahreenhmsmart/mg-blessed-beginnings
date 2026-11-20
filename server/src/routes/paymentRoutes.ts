import { Router } from 'express';
import { protect } from '../middleware/auth';
import { createIntent, verifyPayment } from '../controllers/paymentController';

const router = Router();

// POST /api/payments/create-intent — requires authentication
router.post('/create-intent', protect, createIntent);

// POST /api/payments/verify — requires authentication
router.post('/verify', protect, verifyPayment);

export default router;
