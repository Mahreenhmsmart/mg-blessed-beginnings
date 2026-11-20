import mongoose, { Schema, Document } from 'mongoose';

export interface LayerScore {
  seo: number;
  aeo: number;
  geo: number;
  aio: number;
  sxo: number;
  cq: number;
  schema?: number;
  performance?: number;
  mobile?: number;
  localSeo?: number;
  security?: number;
  accessibility?: number;
  social?: number;
}

export interface CheckResult {
  id: string;
  name: string;
  status: 'pass' | 'warn' | 'fail';
  points: number;
  maxPoints: number;
  details: string;
}

export interface LayerResults {
  checks: CheckResult[];
  score: number;
  maxScore: number;
}

export interface AuditResults {
  seo?: LayerResults;
  aeo?: LayerResults;
  geo?: LayerResults;
  aio?: LayerResults;
  sxo?: LayerResults;
  cq?: LayerResults;
  schema?: LayerResults;
  performance?: LayerResults;
  mobile?: LayerResults;
  localSeo?: LayerResults;
  security?: LayerResults;
  accessibility?: LayerResults;
  social?: LayerResults;
}

export interface Recommendation {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  effort: 'quick' | 'moderate' | 'extensive';
  layer: 'seo' | 'aeo' | 'geo' | 'aio' | 'sxo' | 'cq' | 'schema' | 'performance' | 'mobile' | 'localSeo' | 'security' | 'accessibility' | 'social';
  suggestedText?: string;
  currentPage?: string;
}

export interface IAudit extends Document {
  projectId: mongoose.Types.ObjectId;
  status: 'queued' | 'running' | 'completed' | 'failed';
  scores: LayerScore;
  results: AuditResults;
  recommendations: Recommendation[];
  startedAt: Date | null;
  completedAt: Date | null;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const checkResultSchema = new Schema<CheckResult>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    status: { type: String, enum: ['pass', 'warn', 'fail'], required: true },
    points: { type: Number, required: true, min: 0 },
    maxPoints: { type: Number, required: true, min: 0 },
    details: { type: String, default: '' },
  },
  { _id: false },
);

const layerResultsSchema = new Schema<LayerResults>(
  {
    checks: [checkResultSchema],
    score: { type: Number, required: true, min: 0, max: 100 },
    maxScore: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const recommendationSchema = new Schema<Recommendation>(
  {
    severity: { type: String, enum: ['critical', 'warning', 'info'], required: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    effort: { type: String, enum: ['quick', 'moderate', 'extensive'], required: true },
    layer: { type: String, enum: ['seo', 'aeo', 'geo', 'aio', 'sxo', 'cq', 'schema', 'performance', 'mobile', 'localSeo', 'security', 'accessibility', 'social'], required: true },
    suggestedText: { type: String },
    currentPage: { type: String },
  },
  { _id: false },
);

const auditSchema = new Schema<IAudit>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    status: {
      type: String,
      enum: ['queued', 'running', 'completed', 'failed'],
      default: 'queued',
    },
    scores: {
      seo: { type: Number, default: 0, min: 0, max: 100 },
      aeo: { type: Number, default: 0, min: 0, max: 100 },
      geo: { type: Number, default: 0, min: 0, max: 100 },
      aio: { type: Number, default: 0, min: 0, max: 100 },
      sxo: { type: Number, default: 0, min: 0, max: 100 },
      cq: { type: Number, default: 0, min: 0, max: 100 },
      schema: { type: Number, default: 0, min: 0, max: 100 },
      performance: { type: Number, default: 0, min: 0, max: 100 },
      mobile: { type: Number, default: 0, min: 0, max: 100 },
      localSeo: { type: Number, default: 0, min: 0, max: 100 },
      security: { type: Number, default: 0, min: 0, max: 100 },
      accessibility: { type: Number, default: 0, min: 0, max: 100 },
      social: { type: Number, default: 0, min: 0, max: 100 },
    },
    results: {
      seo: { type: layerResultsSchema },
      aeo: { type: layerResultsSchema },
      geo: { type: layerResultsSchema },
      aio: { type: layerResultsSchema },
      sxo: { type: layerResultsSchema },
      cq: { type: layerResultsSchema },
      schema: { type: layerResultsSchema },
      performance: { type: layerResultsSchema },
      mobile: { type: layerResultsSchema },
      localSeo: { type: layerResultsSchema },
      security: { type: layerResultsSchema },
      accessibility: { type: layerResultsSchema },
      social: { type: layerResultsSchema },
    },
    recommendations: [recommendationSchema],
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    errorMessage: { type: String },
  },
  { timestamps: true },
);

// Indexes for efficient queries
auditSchema.index({ projectId: 1, createdAt: -1 }); // Recent audits per project
auditSchema.index({ status: 1 }); // Filter by status
auditSchema.index({ completedAt: -1 }); // Sort by completion time

export default mongoose.model<IAudit>('Audit', auditSchema);
