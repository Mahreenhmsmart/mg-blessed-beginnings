import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { blogService, BlogFilters } from '../services/blogService';

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export const blogController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: BlogFilters = {
        category: req.query.category as string,
        tag: req.query.tag as string,
        search: req.query.search as string,
        status: (req.query.status as 'draft' | 'published') || 'published',
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
      };

      const result = await blogService.getAll(filters);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const post = await blogService.getBySlug(slug);

      if (!post) {
        res.status(404).json({ success: false, message: 'Blog post not found' });
        return;
      }

      res.json({ success: true, data: post });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid blog post ID format' });
        return;
      }

      const post = await blogService.getById(id);

      if (!post) {
        res.status(404).json({ success: false, message: 'Blog post not found' });
        return;
      }

      res.json({ success: true, data: post });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, excerpt, content, author, category, tags, featuredImage, status } = req.body;

      if (!title || !excerpt || !content || !author || !category) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: title, excerpt, content, author, category',
        });
        return;
      }

      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const post = await blogService.create({
        title,
        slug,
        excerpt,
        content,
        author,
        category,
        tags: tags || [],
        featuredImage: featuredImage || '',
        status: status || 'published',
      });

      res.status(201).json({ success: true, data: post });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid blog post ID format' });
        return;
      }

      const post = await blogService.update(id, req.body);

      if (!post) {
        res.status(404).json({ success: false, message: 'Blog post not found' });
        return;
      }

      res.json({ success: true, data: post });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid blog post ID format' });
        return;
      }

      const deleted = await blogService.delete(id);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Blog post not found' });
        return;
      }

      res.json({ success: true, message: 'Blog post deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await blogService.getCategories();
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  },

  async getRelatedPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const category = req.query.category as string;

      if (!category) {
        res.status(400).json({
          success: false,
          message: 'Category query parameter is required',
        });
        return;
      }

      // The route param is :id — use it as the identifier for related posts lookup
      const posts = await blogService.getRelatedPosts(id, category);
      res.json({ success: true, data: posts });
    } catch (err) {
      next(err);
    }
  },
};
