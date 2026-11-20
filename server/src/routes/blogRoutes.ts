import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';
import { blogController } from '../controllers/blogController';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { upload, MAX_FILE_SIZE } from '../middleware/upload';

const router = Router();

// Public routes
router.get('/categories', blogController.getCategories);
router.get('/slug/:slug', blogController.getBySlug);
router.get('/:id/related', blogController.getRelatedPosts);
router.get('/', blogController.getAll);
router.get('/:id', blogController.getById);

// Admin routes (protected)
const blogValidation = [
  body('title').isString().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('content').isString().trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('excerpt').isString().trim().isLength({ min: 1, max: 500 }).withMessage('Excerpt must be 1-500 characters'),
  body('category').isString().trim().isLength({ min: 1 }).withMessage('Category is required'),
];

router.post('/', protect, restrictTo('admin'), blogValidation, validate, blogController.create);
router.put('/:id', protect, restrictTo('admin'), blogController.update);
router.delete('/:id', protect, restrictTo('admin'), blogController.delete);

// Image upload endpoint
router.post('/upload', protect, restrictTo('admin'), (req: Request, res: Response, next: NextFunction) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ 
          success: false, 
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.` 
        });
      }
      return res.status(400).json({ success: false, error: err.message });
    }
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }
    
    // Return the relative URL path for the uploaded file
    const url = `/api/uploads/${req.file.filename}`;
    res.json({ success: true, data: { url, filename: req.file.filename } });
  });
});

export default router;
