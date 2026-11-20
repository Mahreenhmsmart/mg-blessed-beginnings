import { Router } from 'express';
import { courseController } from '../controllers/courseController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/categories', courseController.getCategories);
router.get('/slug/:slug', courseController.getBySlug);
router.get('/', courseController.getAll);
router.get('/:id', courseController.getById);

// Admin routes (protected)
router.post('/', protect, restrictTo('admin'), courseController.create);
router.put('/:id', protect, restrictTo('admin'), courseController.update);
router.delete('/:id', protect, restrictTo('admin'), courseController.delete);

export default router;
