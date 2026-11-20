import { Router } from 'express';
import { body } from 'express-validator';
import { consultationController } from '../controllers/consultationController';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Public route - create a booking
const consultationValidation = [
  body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').isString().trim().isLength({ min: 1, max: 20 }).withMessage('Phone must be 1-20 characters'),
  body('service').isString().trim().isLength({ min: 1 }).withMessage('Service is required'),
  body('preferredDate').isISO8601().withMessage('Preferred date must be a valid ISO date'),
  body('preferredTime').isString().trim().isLength({ min: 1 }).withMessage('Preferred time is required'),
  body('message').optional().isString().trim().isLength({ min: 0, max: 2000 }).withMessage('Message must be at most 2000 characters'),
];

router.post('/', consultationValidation, validate, consultationController.create);

// Admin routes (protected)
router.get('/', protect, restrictTo('admin'), consultationController.getAll);
router.get('/:id', protect, restrictTo('admin'), consultationController.getById);
router.patch('/:id/status', protect, restrictTo('admin'), consultationController.updateStatus);
router.delete('/:id', protect, restrictTo('admin'), consultationController.delete);

export default router;
