import mongoose, { Schema, Document } from 'mongoose';

export interface IClone extends Document {
  id: string;
  source: string;
  bytes: number;
  filePath: string;
  createdAt: Date;
}

const cloneSchema = new Schema<IClone>(
  {
    id: { type: String, required: true, unique: true, index: true },
    source: { type: String, required: true, trim: true },
    bytes: { type: Number, default: 0 },
    filePath: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '7d' },
  },
  { timestamps: false }
);

export default mongoose.model<IClone>('Clone', cloneSchema);
