import BlogPost, { IBlogPost } from '../models/BlogPost';

export interface BlogFilters {
  category?: string;
  tag?: string;
  search?: string;
  status?: 'draft' | 'published';
  page?: number;
  limit?: number;
}

export interface BlogResult {
  posts: IBlogPost[];
  total: number;
  page: number;
  totalPages: number;
}

export const blogService = {
  async getAll(filters: BlogFilters): Promise<BlogResult> {
    const { category, tag, search, status = 'published', page = 1, limit = 10 } = filters;

    const query: Record<string, unknown> = { status };

    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(query),
    ]);

    return {
      posts: posts as unknown as IBlogPost[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getBySlug(slug: string): Promise<IBlogPost | null> {
    return BlogPost.findOne({ slug, status: 'published' }).lean() as unknown as IBlogPost | null;
  },

  async getById(id: string): Promise<IBlogPost | null> {
    return BlogPost.findById(id).lean() as unknown as IBlogPost | null;
  },

  async create(data: Partial<IBlogPost>): Promise<IBlogPost> {
    const post = new BlogPost(data);
    await post.save();
    return post.toObject() as IBlogPost;
  },

  async update(id: string, data: Partial<IBlogPost>): Promise<IBlogPost | null> {
    const post = await BlogPost.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    return post ? (post.toObject() as IBlogPost) : null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await BlogPost.findByIdAndDelete(id);
    return !!result;
  },

  async getCategories(): Promise<string[]> {
    const categories = await BlogPost.distinct('category', { status: 'published' });
    return categories.sort();
  },

  async getRelatedPosts(slug: string, category: string, limit = 3): Promise<IBlogPost[]> {
    const posts = await BlogPost.find({
      category,
      slug: { $ne: slug },
      status: 'published',
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();
    return posts as unknown as IBlogPost[];
  },
};
