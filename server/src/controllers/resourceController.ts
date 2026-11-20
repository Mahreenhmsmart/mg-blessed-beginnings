import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { resourceService } from '../services/resourceService';

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export const resourceController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        category: req.query.category as string,
        type: req.query.type as string,
      };
      const resources = await resourceService.getAll(filters);
      res.json({ success: true, data: resources });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid resource ID format' });
        return;
      }

      const resource = await resourceService.getById(id);
      if (!resource) {
        res.status(404).json({ success: false, message: 'Resource not found' });
        return;
      }

      res.json({ success: true, data: resource });
    } catch (err) {
      next(err);
    }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const resource = await resourceService.getBySlug(slug);
      if (!resource) {
        res.status(404).json({ success: false, message: 'Resource not found' });
        return;
      }

      res.json({ success: true, data: resource });
    } catch (err) {
      next(err);
    }
  },

  async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await resourceService.getCategories();
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resource = await resourceService.create(req.body);
      res.status(201).json({ success: true, data: resource });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid resource ID format' });
        return;
      }

      const resource = await resourceService.update(id, req.body);
      if (!resource) {
        res.status(404).json({ success: false, message: 'Resource not found' });
        return;
      }

      res.json({ success: true, data: resource });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid resource ID format' });
        return;
      }

      const deleted = await resourceService.delete(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Resource not found' });
        return;
      }

      res.json({ success: true, message: 'Resource deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  async download(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid resource ID format' });
        return;
      }

      const resource = await resourceService.getById(id);
      if (!resource) {
        res.status(404).json({ success: false, message: 'Resource not found' });
        return;
      }

      // Increment download count
      await resourceService.incrementDownload(id);

      // Return the download URL
      res.json({ success: true, data: { downloadUrl: resource.downloadUrl } });
    } catch (err) {
      next(err);
    }
  },
};
