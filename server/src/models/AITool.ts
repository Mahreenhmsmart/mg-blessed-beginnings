import mongoose, { Schema, Document } from 'mongoose';

export interface IAITool extends Document {
  name: string;
  slug: string;
  description: string;
  category: string;
  features: string[];
  toolUrl: string;
  isFree: boolean;
  status: 'live' | 'beta' | 'demo' | 'coming_soon';
}

const aiToolSchema = new Schema<IAITool>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    features: [{ type: String, trim: true }],
    toolUrl: { type: String, required: true, trim: true },
    isFree: { type: Boolean, default: true },
    status: { type: String, enum: ['live', 'beta', 'demo', 'coming_soon'], default: 'live' },
  },
  { timestamps: true }
);

aiToolSchema.index({ slug: 1 });
aiToolSchema.index({ category: 1 });

export default mongoose.model<IAITool>('AITool', aiToolSchema);
