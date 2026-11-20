import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { serviceService } from '../services/serviceService';

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export const serviceController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const services = await serviceService.getAll();
      res.json({ success: true, data: services });
    } catch (err) {
      next(err);
    }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const service = await serviceService.getBySlug(slug);

      if (!service) {
        res.status(404).json({ success: false, message: 'Service not found' });
        return;
      }

      res.json({ success: true, data: service });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid service ID format' });
        return;
      }

      const service = await serviceService.getById(id);

      if (!service) {
        res.status(404).json({ success: false, message: 'Service not found' });
        return;
      }

      res.json({ success: true, data: service });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, features, price, duration, icon, order } = req.body;

      if (!title || !description || !price || !duration || !icon) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: title, description, price, duration, icon',
        });
        return;
      }

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const service = await serviceService.create({
        title,
        slug,
        description,
        features: features || [],
        price,
        duration,
        icon,
        order: order || 0,
      });

      res.status(201).json({ success: true, data: service });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid service ID format' });
        return;
      }

      const service = await serviceService.update(id, req.body);

      if (!service) {
        res.status(404).json({ success: false, message: 'Service not found' });
        return;
      }

      res.json({ success: true, data: service });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid service ID format' });
        return;
      }

      const deleted = await serviceService.delete(id);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Service not found' });
        return;
      }

      res.json({ success: true, message: 'Service deleted successfully' });
    } catch (err) {
      next(err);
    }
  },
};
