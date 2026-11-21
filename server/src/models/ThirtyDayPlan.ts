import mongoose, { Schema, Document } from 'mongoose';

export interface IThirtyDayPlan extends Document {
  dayNumber: number;
  title: string;
  description: string;
  tasks: string[];
  resources: string[];
  phase: string;
  icon: string;
  tip: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const thirtyDayPlanSchema = new Schema<IThirtyDayPlan>(
  {
    dayNumber: { type: Number, required: true, min: 1, max: 30, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    tasks: [{ type: String, trim: true }],
    resources: [{ type: String, trim: true }],
    phase: { type: String, default: '' },
    icon: { type: String, default: '' },
    tip: { type: String, default: '' },
    category: { type: String, default: '' },
  },
  { timestamps: true }
);

thirtyDayPlanSchema.index({ dayNumber: 1 });

export default mongoose.model<IThirtyDayPlan>('ThirtyDayPlan', thirtyDayPlanSchema);
