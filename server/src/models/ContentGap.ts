import mongoose, { Schema, Document } from 'mongoose';

export interface ContentPlan {
  topic: string;
  searchIntent: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  suggestedTitle: string;
  outline: string[];
  internalLinks: string[];
  cta: string;
}

export interface IContentGap extends Document {
  projectId: mongoose.Types.ObjectId;
  topic: string;
  questions: string[];
  competitorUrls: string[];
  priority: 'high' | 'medium' | 'low';
  searchIntent: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  suggestedTitle: string;
  contentPlan: ContentPlan | null;
  createdAt: Date;
  updatedAt: Date;
}

const contentPlanSchema = new Schema<ContentPlan>(
  {
    topic: { type: String, required: true },
    searchIntent: { type: String, default: 'informational' },
    primaryKeyword: { type: String, default: '' },
    secondaryKeywords: [{ type: String }],
    suggestedTitle: { type: String, default: '' },
    outline: [{ type: String }],
    internalLinks: [{ type: String }],
    cta: { type: String, default: '' },
  },
  { _id: false },
);

const contentGapSchema = new Schema<IContentGap>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    topic: { type: String, required: true, trim: true },
    questions: [{ type: String, trim: true }],
    competitorUrls: [{ type: String, trim: true }],
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    searchIntent: { type: String, default: 'informational' },
    primaryKeyword: { type: String, default: '' },
    secondaryKeywords: [{ type: String }],
    suggestedTitle: { type: String, default: '' },
    contentPlan: { type: contentPlanSchema, default: null },
  },
  { timestamps: true },
);

export default mongoose.model<IContentGap>('ContentGap', contentGapSchema);
