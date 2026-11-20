import mongoose, { Schema, Document } from 'mongoose';

export interface IAIVisibilityRecord extends Document {
  projectId: mongoose.Types.ObjectId;
  platform: 'ChatGPT' | 'Perplexity' | 'Gemini' | 'Google-SGE';
  brandMentioned: boolean;
  mentionContext: string;
  confidence: number;
  checkedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const aiVisibilityRecordSchema = new Schema<IAIVisibilityRecord>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    platform: {
      type: String,
      enum: ['ChatGPT', 'Perplexity', 'Gemini', 'Google-SGE'],
      required: true,
    },
    brandMentioned: { type: Boolean, default: false },
    mentionContext: { type: String, default: '' },
    confidence: { type: Number, min: 0, max: 100, default: 0 },
    checkedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

aiVisibilityRecordSchema.index({ projectId: 1, platform: 1, checkedAt: -1 });

export default mongoose.model<IAIVisibilityRecord>('AIVisibilityRecord', aiVisibilityRecordSchema);
