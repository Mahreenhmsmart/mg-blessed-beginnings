import mongoose, { Schema, Document } from 'mongoose';

export interface IPortfolio extends Document {
  title: string;
  description: string;
  imageUrl: string;
  projectUrl: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const portfolioSchema = new Schema<IPortfolio>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    projectUrl: { type: String, default: '' },
    category: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

portfolioSchema.index({ category: 1 });

export default mongoose.model<IPortfolio>('Portfolio', portfolioSchema);
