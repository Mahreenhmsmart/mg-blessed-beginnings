import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditSchedule extends Document {
  projectId: mongoose.Types.ObjectId;
  frequency: 'weekly' | 'monthly';
  dayOfWeek: number | null; // 0-6 (Sunday-Saturday) for weekly
  dayOfMonth: number | null; // 1-28 for monthly
  isActive: boolean;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const auditScheduleSchema = new Schema<IAuditSchedule>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly'],
      required: true,
    },
    dayOfWeek: { type: Number, min: 0, max: 6, default: null },
    dayOfMonth: { type: Number, min: 1, max: 28, default: null },
    isActive: { type: Boolean, default: true },
    lastRunAt: { type: Date, default: null },
    nextRunAt: { type: Date, default: null },
  },
  { timestamps: true },
);

auditScheduleSchema.index({ projectId: 1 }, { unique: true });

export default mongoose.model<IAuditSchedule>('AuditSchedule', auditScheduleSchema);
