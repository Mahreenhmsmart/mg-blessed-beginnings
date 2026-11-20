import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  title: string;
  slug: string;
  description: string;
  features: string[];
  price: string;
  duration: string;
  icon: string;
  order: number;
}

const serviceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    features: [{ type: String, trim: true }],
    price: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    icon: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

serviceSchema.index({ slug: 1 });
serviceSchema.index({ order: 1 });

export default mongoose.model<IService>('Service', serviceSchema);
