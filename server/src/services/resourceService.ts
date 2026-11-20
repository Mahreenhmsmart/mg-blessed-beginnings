import Resource from '../models/Resource';
import type { IResource } from '../models/Resource';

export const resourceService = {
  async getAll(filters?: { category?: string; type?: string }) {
    const query: Record<string, unknown> = { status: 'published' };
    if (filters?.category) query.category = filters.category;
    if (filters?.type) query.type = filters.type;
    
    return Resource.find(query).sort({ createdAt: -1 }).lean();
  },

  async getById(id: string) {
    return Resource.findById(id).lean();
  },

  async getBySlug(slug: string) {
    return Resource.findOne({ slug, status: 'published' }).lean();
  },

  async getCategories(): Promise<string[]> {
    const categories = await Resource.distinct('category', { status: 'published' });
    return categories.sort();
  },

  async create(data: Partial<IResource>): Promise<IResource> {
    return Resource.create(data);
  },

  async update(id: string, data: Partial<IResource>) {
    return Resource.findByIdAndUpdate(id, data, { new: true }).lean();
  },

  async delete(id: string): Promise<boolean> {
    const result = await Resource.deleteOne({ _id: id });
    return result.deletedCount > 0;
  },

  async incrementDownload(id: string): Promise<void> {
    await Resource.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } });
  },
};
