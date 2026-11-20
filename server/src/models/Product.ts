import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  price: string;
  purchaseLink: string;
  salesCount: number;
}

const productSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    price: { type: String, required: true, trim: true },
    purchaseLink: { type: String, required: true, trim: true },
    salesCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

productSchema.index({ title: 1 });

export default mongoose.model<IProduct>('Product', productSchema);
