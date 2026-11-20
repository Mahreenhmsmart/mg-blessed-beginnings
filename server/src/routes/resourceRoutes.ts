import { Router } from 'express';
import { resourceController } from '../controllers/resourceController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/categories', resourceController.getCategories);
router.get('/slug/:slug', resourceController.getBySlug);
router.get('/', resourceController.getAll);
router.get('/:id', resourceController.getById);
router.post('/:id/download', resourceController.download);

// Admin routes (protected)
router.post('/', protect, restrictTo('admin'), resourceController.create);
router.put('/:id', protect, restrictTo('admin'), resourceController.update);
router.delete('/:id', protect, restrictTo('admin'), resourceController.delete);

export default router;
