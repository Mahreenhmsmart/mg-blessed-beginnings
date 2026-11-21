import mongoose, { Schema, Document } from 'mongoose';

export type CloneStatus = 'SAVED' | 'FILE_MISSING';

export interface IClone extends Document {
  id: string;
  source: string;
  bytes: number;
  filePath: string;
  status: CloneStatus;
  createdAt: Date;
}

const cloneSchema = new Schema<IClone>(
  {
    id: { type: String, required: true, unique: true, index: true },
    source: { type: String, required: true, trim: true },
    bytes: { type: Number, default: 0 },
    filePath: { type: String, required: true },
    status: { type: String, enum: ['SAVED', 'FILE_MISSING'], default: 'SAVED' },
    createdAt: { type: Date, default: Date.now, expires: '7d' },
  },
  { timestamps: false }
);

cloneSchema.index({ source: 1 }, { unique: true });

export default mongoose.model<IClone>('Clone', cloneSchema);
