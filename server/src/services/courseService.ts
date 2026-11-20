import Course from '../models/Course';
import type { ICourse } from '../models/Course';

export const courseService = {
  async getAll(filters?: { category?: string; level?: string }) {
    const query: Record<string, unknown> = { status: 'published' };
    if (filters?.category) query.category = filters.category;
    if (filters?.level) query.level = filters.level;
    
    return Course.find(query).sort({ createdAt: -1 }).lean();
  },

  async getById(id: string) {
    return Course.findById(id).lean();
  },

  async getBySlug(slug: string) {
    return Course.findOne({ slug, status: 'published' }).lean();
  },

  async getCategories(): Promise<string[]> {
    const categories = await Course.distinct('category', { status: 'published' });
    return categories.sort();
  },

  async create(data: Partial<ICourse>): Promise<ICourse> {
    return Course.create(data);
  },

  async update(id: string, data: Partial<ICourse>) {
    return Course.findByIdAndUpdate(id, data, { new: true }).lean();
  },

  async delete(id: string): Promise<boolean> {
    const result = await Course.deleteOne({ _id: id });
    return result.deletedCount > 0;
  },

  async incrementEnrolled(id: string): Promise<void> {
    await Course.findByIdAndUpdate(id, { $inc: { enrolledCount: 1 } });
  },
};
