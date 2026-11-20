import mongoose, { Schema, Document } from 'mongoose';

/**
 * Security Finding - Individual security issue discovered during scan.
 */
export interface ISecurityFinding extends Document {
  scanId: mongoose.Types.ObjectId;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
  target: string;
  evidence: string;
  impact: string;
  remediation: string;
  status: 'open' | 'resolved' | 'accepted' | 'ignored';
  createdAt: Date;
  updatedAt: Date;
}

const securityFindingSchema = new Schema<ISecurityFinding>(
  {
    scanId: { type: Schema.Types.ObjectId, ref: 'SecurityScan', required: true, index: true },
    title: { type: String, required: true, trim: true },
    severity: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low', 'Informational'],
      required: true,
    },
    target: { type: String, required: true, trim: true },
    evidence: { type: String, required: true },
    impact: { type: String, required: true },
    remediation: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'resolved', 'accepted', 'ignored'],
      default: 'open',
    },
  },
  { timestamps: true }
);

// Index for efficient queries by scan and severity
securityFindingSchema.index({ scanId: 1, severity: 1 });

export default mongoose.model<ISecurityFinding>('SecurityFinding', securityFindingSchema);
