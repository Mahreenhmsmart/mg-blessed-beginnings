import mongoose, { Schema, Document } from 'mongoose';

// ─── Sub-document interfaces ──────────────────────────────────────────────────

export interface IProviderResultEntry {
  provider: string;
  label: string;
  status: 'success' | 'failed' | 'unavailable' | 'not-tested';
  lastTested: string;
  errorMessage?: string;
  modelName?: string;
  responseDurationMs?: number;
  /** Only present for openrouter — never includes any part of the key value */
  keyStatus?: 'valid' | 'invalid/empty';
}

export interface ITestResultEntry {
  component: string;
  status: 'PASS' | 'FAIL' | 'NOT_CONFIGURED';
  evidence: string;
  latency?: number;
}

export interface IDiagnosticSummary {
  passed: number;
  failed: number;
  notConfigured: number;
  total: number;
}

// ─── Document interface ───────────────────────────────────────────────────────

export interface IDiagnosticResult extends Document {
  runAt: Date;
  providerResults: IProviderResultEntry[];
  testResults: ITestResultEntry[];
  summary: IDiagnosticSummary;
  providerChain: { primary: string; fallback1: string; fallback2: string };
  databaseIssues: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const providerResultEntrySchema = new Schema<IProviderResultEntry>(
  {
    provider: { type: String, required: true },
    label: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['success', 'failed', 'unavailable', 'not-tested'],
    },
    lastTested: { type: String, required: true },
    errorMessage: { type: String },
    modelName: { type: String },
    responseDurationMs: { type: Number },
    keyStatus: { type: String, enum: ['valid', 'invalid/empty'] },
  },
  { _id: false },
);

const testResultEntrySchema = new Schema<ITestResultEntry>(
  {
    component: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['PASS', 'FAIL', 'NOT_CONFIGURED'],
    },
    evidence: { type: String, required: true },
    latency: { type: Number },
  },
  { _id: false },
);

const diagnosticSummarySchema = new Schema<IDiagnosticSummary>(
  {
    passed: { type: Number, required: true },
    failed: { type: Number, required: true },
    notConfigured: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false },
);

const diagnosticResultSchema = new Schema<IDiagnosticResult>(
  {
    runAt: { type: Date, required: true },
    providerResults: { type: [providerResultEntrySchema], default: [] },
    testResults: { type: [testResultEntrySchema], default: [] },
    summary: { type: diagnosticSummarySchema, required: true },
    providerChain: {
      primary: { type: String, default: 'None' },
      fallback1: { type: String, default: 'None' },
      fallback2: { type: String, default: 'None' },
    },
    databaseIssues: { type: [String], default: [] },
  },
  { timestamps: true },
);

// Index on runAt descending so the latest run is easy to fetch
diagnosticResultSchema.index({ runAt: -1 });

export default mongoose.model<IDiagnosticResult>('DiagnosticResult', diagnosticResultSchema);
