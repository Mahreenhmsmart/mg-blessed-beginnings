import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  price: number;
  currency: string;
  description: string;
  image: string;
  category: string;
  buyUrl: string;
  salesCount: number;
}

const productSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'USD', trim: true },
    description: { type: String, default: '', trim: true },
    image: { type: String, default: '', trim: true },
    category: { type: String, default: '', trim: true },
    buyUrl: { type: String, required: true, trim: true },
    salesCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

productSchema.index({ title: 1 });

export default mongoose.model<IProduct>('Product', productSchema);
