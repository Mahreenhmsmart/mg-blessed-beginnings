import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  url: string;
  name: string;
  userId: string;
  competitors: string[];
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    url: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    userId: { type: String, required: true, index: true },
    competitors: [{ type: String, trim: true }],
  },
  { timestamps: true },
);

// Unique URL per user
projectSchema.index({ userId: 1, url: 1 }, { unique: true });

export default mongoose.model<IProject>('Project', projectSchema);
