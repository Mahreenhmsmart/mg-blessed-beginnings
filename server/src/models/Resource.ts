import mongoose, { Schema, Document } from 'mongoose';

export interface IResource extends Document {
  title: string;
  slug: string;
  description: string;
  type: 'guide' | 'template' | 'checklist' | 'ebook' | 'worksheet';
  downloadUrl: string;
  category: string;
  thumbnail: string;
  fileSize?: string;
  format?: string;
  downloadCount: number;
  status: 'draft' | 'published';
}

const resourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['guide', 'template', 'checklist', 'ebook', 'worksheet'], 
      required: true 
    },
    downloadUrl: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    thumbnail: { type: String, default: '' },
    fileSize: { type: String },
    format: { type: String },
    downloadCount: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
  },
  { timestamps: true }
);

resourceSchema.index({ slug: 1 });
resourceSchema.index({ category: 1 });
resourceSchema.index({ type: 1 });
resourceSchema.index({ status: 1 });

export default mongoose.model<IResource>('Resource', resourceSchema);
