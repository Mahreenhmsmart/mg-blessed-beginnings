import AITool, { IAITool } from '../models/AITool';

export const aiToolService = {
  async getAll(category?: string): Promise<IAITool[]> {
    const query: Record<string, unknown> = {};
    if (category) query.category = category;

    const tools = await AITool.find(query).sort({ name: 1 }).lean();
    // Ensure we always return an array, even if Mongoose returns unexpected shape
    return Array.isArray(tools) ? (tools as unknown as IAITool[]) : [];
  },

  async getBySlug(slug: string): Promise<IAITool | null> {
    if (!slug || typeof slug !== 'string') return null;
    const tool = await AITool.findOne({ slug: slug.trim() }).lean();
    return tool ? (tool as unknown as IAITool) : null;
  },

  async getById(id: string): Promise<IAITool | null> {
    return AITool.findById(id).lean() as unknown as IAITool | null;
  },

  async create(data: Partial<IAITool>): Promise<IAITool> {
    const tool = new AITool(data);
    await tool.save();
    return tool.toObject() as IAITool;
  },

  async update(id: string, data: Partial<IAITool>): Promise<IAITool | null> {
    const tool = await AITool.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    return tool ? (tool.toObject() as IAITool) : null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await AITool.findByIdAndDelete(id);
    return !!result;
  },

  async getCategories(): Promise<string[]> {
    const categories = await AITool.distinct('category');
    return Array.isArray(categories) ? categories.sort() : [];
  },

  /** Returns the total number of AI tools in the database. */
  async count(): Promise<number> {
    return AITool.countDocuments();
  },
};
