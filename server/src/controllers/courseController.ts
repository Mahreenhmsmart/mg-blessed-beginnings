import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { courseService } from '../services/courseService';

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export const courseController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        category: req.query.category as string,
        level: req.query.level as string,
      };
      const courses = await courseService.getAll(filters);
      res.json({ success: true, data: courses });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid course ID format' });
        return;
      }

      const course = await courseService.getById(id);
      if (!course) {
        res.status(404).json({ success: false, message: 'Course not found' });
        return;
      }

      res.json({ success: true, data: course });
    } catch (err) {
      next(err);
    }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const course = await courseService.getBySlug(slug);
      if (!course) {
        res.status(404).json({ success: false, message: 'Course not found' });
        return;
      }

      res.json({ success: true, data: course });
    } catch (err) {
      next(err);
    }
  },

  async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await courseService.getCategories();
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await courseService.create(req.body);
      res.status(201).json({ success: true, data: course });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid course ID format' });
        return;
      }

      const course = await courseService.update(id, req.body);
      if (!course) {
        res.status(404).json({ success: false, message: 'Course not found' });
        return;
      }

      res.json({ success: true, data: course });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid course ID format' });
        return;
      }

      const deleted = await courseService.delete(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Course not found' });
        return;
      }

      res.json({ success: true, message: 'Course deleted successfully' });
    } catch (err) {
      next(err);
    }
  },
};
