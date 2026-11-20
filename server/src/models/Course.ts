import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson {
  title: string;
  content: string;
  videoUrl?: string;
  duration?: number; // in minutes
}

export interface IModule {
  title: string;
  lessons: ILesson[];
}

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  instructor: string;
  modules: IModule[];
  price: number;
  status: 'draft' | 'published';
  thumbnail: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  enrolledCount: number;
}

const lessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    videoUrl: { type: String, trim: true },
    duration: { type: Number, min: 0 },
  },
  { _id: false }
);

const moduleSchema = new Schema<IModule>(
  {
    title: { type: String, required: true, trim: true },
    lessons: [lessonSchema],
  },
  { _id: false }
);

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    instructor: { type: String, required: true, trim: true },
    modules: [moduleSchema],
    price: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    thumbnail: { type: String, default: '' },
    category: { type: String, required: true, trim: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    enrolledCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

courseSchema.index({ slug: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ status: 1 });

export default mongoose.model<ICourse>('Course', courseSchema);
