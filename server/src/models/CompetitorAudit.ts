import mongoose, { Schema, Document } from 'mongoose';

export interface CompetitorScores {
  seo: number;
  aeo: number;
  geo: number;
  aio: number;
  sxo: number;
  cq: number;
}

export interface ICompetitorAudit extends Document {
  projectId: mongoose.Types.ObjectId;
  competitorUrl: string;
  scores: CompetitorScores;
  status: 'queued' | 'running' | 'completed' | 'failed';
  errorMessage?: string;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const competitorAuditSchema = new Schema<ICompetitorAudit>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    competitorUrl: { type: String, required: true, trim: true },
    scores: {
      seo: { type: Number, default: 0, min: 0, max: 100 },
      aeo: { type: Number, default: 0, min: 0, max: 100 },
      geo: { type: Number, default: 0, min: 0, max: 100 },
      aio: { type: Number, default: 0, min: 0, max: 100 },
      sxo: { type: Number, default: 0, min: 0, max: 100 },
      cq: { type: Number, default: 0, min: 0, max: 100 },
    },
    status: {
      type: String,
      enum: ['queued', 'running', 'completed', 'failed'],
      default: 'queued',
    },
    errorMessage: { type: String },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Unique per project + URL
competitorAuditSchema.index({ projectId: 1, competitorUrl: 1 }, { unique: true });

export default mongoose.model<ICompetitorAudit>('CompetitorAudit', competitorAuditSchema);
