import mongoose, { Schema, Document } from 'mongoose';

export interface CompetitorPosition {
  url: string;
  position: number | null;
}

export type KeywordCategory = 'primary' | 'secondary' | 'long-tail' | 'question' | 'commercial' | 'informational' | 'local';
export type KeywordIntent = 'informational' | 'commercial' | 'transactional' | 'navigational';

export interface IKeywordGap extends Document {
  projectId: mongoose.Types.ObjectId;
  keyword: string;
  searchVolume: number | null;
  category: KeywordCategory;
  intent: KeywordIntent;
  difficulty: number;
  opportunity: number;
  recommendedPage: string | null;
  competitors: CompetitorPosition[];
  yourPosition: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const competitorPositionSchema = new Schema<CompetitorPosition>(
  {
    url: { type: String, required: true },
    position: { type: Number, default: null },
  },
  { _id: false },
);

const keywordGapSchema = new Schema<IKeywordGap>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    keyword: { type: String, required: true, trim: true },
    searchVolume: { type: Number, default: null },
    category: {
      type: String,
      enum: ['primary', 'secondary', 'long-tail', 'question', 'commercial', 'informational', 'local'],
      default: 'secondary',
    },
    intent: {
      type: String,
      enum: ['informational', 'commercial', 'transactional', 'navigational'],
      default: 'informational',
    },
    difficulty: { type: Number, default: 50, min: 0, max: 100 },
    opportunity: { type: Number, default: 50, min: 0, max: 100 },
    recommendedPage: { type: String, default: null },
    competitors: [competitorPositionSchema],
    yourPosition: { type: Number, default: null },
  },
  { timestamps: true },
);

export default mongoose.model<IKeywordGap>('KeywordGap', keywordGapSchema);
