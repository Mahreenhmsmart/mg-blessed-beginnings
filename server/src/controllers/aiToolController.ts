import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { aiToolService } from '../services/aiToolService';

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export const aiToolController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.query.category as string;
      const tools = await aiToolService.getAll(category);
      res.json({ success: true, data: tools });
    } catch (err) {
      console.error('[aiToolController] getAll failed:', err instanceof Error ? err.message : err);
      next(err);
    }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      if (!slug) {
        res.status(400).json({ success: false, error: 'Slug parameter is required', statusCode: 400 });
        return;
      }
      const tool = await aiToolService.getBySlug(slug);

      if (!tool) {
        res.status(404).json({ success: false, error: 'AI tool not found', statusCode: 404 });
        return;
      }

      res.json({ success: true, data: tool });
    } catch (err) {
      console.error('[aiToolController] getBySlug failed:', err instanceof Error ? err.message : err);
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid AI tool ID format' });
        return;
      }

      const tool = await aiToolService.getById(id);

      if (!tool) {
        res.status(404).json({ success: false, message: 'AI tool not found' });
        return;
      }

      res.json({ success: true, data: tool });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, category, features, toolUrl, isFree } = req.body;

      if (!name || !description || !category || !toolUrl) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: name, description, category, toolUrl',
        });
        return;
      }

      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const tool = await aiToolService.create({
        name,
        slug,
        description,
        category,
        features: features || [],
        toolUrl,
        isFree: isFree !== undefined ? isFree : true,
      });

      res.status(201).json({ success: true, data: tool });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid AI tool ID format' });
        return;
      }

      const tool = await aiToolService.update(id, req.body);

      if (!tool) {
        res.status(404).json({ success: false, message: 'AI tool not found' });
        return;
      }

      res.json({ success: true, data: tool });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid AI tool ID format' });
        return;
      }

      const deleted = await aiToolService.delete(id);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'AI tool not found' });
        return;
      }

      res.json({ success: true, message: 'AI tool deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await aiToolService.getCategories();
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  },
};
