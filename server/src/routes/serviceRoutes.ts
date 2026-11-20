import { Router } from 'express';
import { serviceController } from '../controllers/serviceController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', serviceController.getAll);
router.get('/slug/:slug', serviceController.getBySlug);
router.get('/:id', serviceController.getById);

// Admin routes (protected)
router.post('/', protect, restrictTo('admin'), serviceController.create);
router.put('/:id', protect, restrictTo('admin'), serviceController.update);
router.delete('/:id', protect, restrictTo('admin'), serviceController.delete);

export default router;
