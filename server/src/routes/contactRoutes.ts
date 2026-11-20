import { Router } from 'express';
import { body } from 'express-validator';
import { contactController } from '../controllers/contactController';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Public route - submit contact form
const contactValidation = [
  body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('subject').isString().trim().isLength({ min: 1, max: 200 }).withMessage('Subject must be 1-200 characters'),
  body('message').isString().trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be 10-2000 characters'),
];

router.post('/', contactValidation, validate, contactController.create);

// Admin routes (protected)
router.get('/', protect, restrictTo('admin'), contactController.getAll);
router.get('/:id', protect, restrictTo('admin'), contactController.getById);
router.delete('/:id', protect, restrictTo('admin'), contactController.delete);

export default router;
