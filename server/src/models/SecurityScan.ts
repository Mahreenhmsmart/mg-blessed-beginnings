import mongoose, { Schema, Document } from 'mongoose';

/**
 * Security Scan - Stores metadata and results for authorized security assessments.
 */
export interface ISecurityScan extends Document {
  userId: mongoose.Types.ObjectId;
  scanId: string; // UUID for external reference
  target: string;
  normalizedTarget: string;
  authorizationConfirmed: boolean;
  authorizationTimestamp: Date;
  status: 'pending' | 'planning' | 'reconnaissance' | 'port_analysis' | 'web_security_audit' | 'generating_report' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  statusMessage: string;
  startTime: Date | null;
  completionTime: Date | null;
  score: number | null;
  findingsCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
  reportPath: string | null;
  reportContent: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const securityScanSchema = new Schema<ISecurityScan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scanId: { type: String, required: true, unique: true, index: true },
    target: { type: String, required: true, trim: true },
    normalizedTarget: { type: String, required: true, trim: true },
    authorizationConfirmed: { type: Boolean, required: true, default: false },
    authorizationTimestamp: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: [
        'pending',
        'planning',
        'reconnaissance',
        'port_analysis',
        'web_security_audit',
        'generating_report',
        'completed',
        'failed',
        'cancelled',
      ],
      default: 'pending',
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    statusMessage: { type: String, default: '' },
    startTime: { type: Date, default: null },
    completionTime: { type: Date, default: null },
    score: { type: Number, default: null, min: 0, max: 100 },
    findingsCount: {
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      informational: { type: Number, default: 0 },
    },
    reportPath: { type: String, default: null },
    reportContent: { type: String, default: null },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

// Indexes for efficient queries
securityScanSchema.index({ userId: 1, createdAt: -1 });
securityScanSchema.index({ status: 1 });

export default mongoose.model<ISecurityScan>('SecurityScan', securityScanSchema);
