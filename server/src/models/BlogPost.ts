import mongoose, { Schema, Document } from 'mongoose';

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  featuredImage: string;
  publishedAt: Date;
  status: 'draft' | 'published';
}

const blogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    featuredImage: { type: String, default: '' },
    publishedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
  },
  { timestamps: true }
);

// Index for faster queries
blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ status: 1, publishedAt: -1 });

export default mongoose.model<IBlogPost>('BlogPost', blogPostSchema);
