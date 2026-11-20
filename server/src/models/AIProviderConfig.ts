import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export type TestResult =
  | 'success'
  | 'failed'
  | 'quota_exhausted'
  | 'rate_limited'
  | 'unavailable'
  | 'network_error';

/** Sub-document storing per-provider diagnostic results from the latest diagnostic run */
export interface ILastDiagnostic {
  status: 'success' | 'failed' | 'unavailable' | 'not-tested';
  model?: string;
  duration?: number;
  error?: string;
  testedAt: Date;
  /** Only set for openrouter — never contains any part of the actual key value */
  keyValidation?: 'valid' | 'invalid/empty';
}

export interface IAIProviderConfig extends Document {
  provider: 'anthropic' | 'openai' | 'google' | 'cohere' | 'openrouter' | 'groq' | 'luma';
  modelName: string;
  apiKey: string;
  isEnabled: boolean;
  isPrimary: boolean;
  fallbackOrder: number;
  lastTestedAt?: Date;
  lastTestResult?: TestResult;
  lastTestError?: string;
  /** Persisted diagnostic result from the most recent full diagnostic run */
  lastDiagnostic?: ILastDiagnostic;
  createdAt: Date;
  updatedAt: Date;

  /** Decrypt the stored API key for use at runtime */
  decryptApiKey(): string;
}

// ─── Encryption helpers ──────────────────────────────────────────────────────
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT = 'ai-provider-config-salt-v1';

function deriveKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || '';
  return crypto.scryptSync(secret, SALT, 32);
}

function encrypt(plaintext: string): string {
  const key = deriveKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Store as base64: iv + tag + ciphertext
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

function decrypt(encoded: string): string {
  const key = deriveKey();
  const buf = Buffer.from(encoded, 'base64');
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(tag);
  return decipher.update(ciphertext).toString('utf8') + decipher.final('utf8');
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const aiProviderConfigSchema = new Schema<IAIProviderConfig>(
  {
    provider: {
      type: String,
      required: true,
      enum: ['anthropic', 'openai', 'google', 'cohere', 'openrouter', 'groq', 'luma'],
      trim: true,
    },
    modelName: {
      type: String,
      required: true,
      trim: true,
    },
    apiKey: {
      type: String,
      required: true,
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    fallbackOrder: {
      type: Number,
      default: 0,
    },
    lastTestedAt: {
      type: Date,
    },
    lastTestResult: {
      type: String,
      enum: ['success', 'failed', 'quota_exhausted', 'rate_limited', 'unavailable', 'network_error'],
    },
    lastTestError: {
      type: String,
    },
    lastDiagnostic: {
      status: { type: String, enum: ['success', 'failed', 'unavailable', 'not-tested'] },
      model: { type: String },
      duration: { type: Number },
      error: { type: String },
      testedAt: { type: Date },
      keyValidation: { type: String, enum: ['valid', 'invalid/empty'] },
    },
  },
  { timestamps: true },
);

// Encrypt apiKey before saving to database.
// Only encrypts when the field is modified AND the value looks like a plaintext key
// (not already encrypted). Encrypted values are base64 strings ≥ 48 bytes decoded.
aiProviderConfigSchema.pre('save', function (next) {
  if (!this.isModified('apiKey')) {
    return next();
  }

  const current = this.apiKey;

  // Detect already-encrypted values: they decode from base64 to exactly
  // IV_LENGTH + AUTH_TAG_LENGTH + ciphertext bytes (minimum 33 bytes).
  // A plaintext API key (e.g. "sk-ant-...") will never satisfy this.
  try {
    const buf = Buffer.from(current, 'base64');
    const reEncoded = buf.toString('base64');
    // Round-trip check ensures it's genuine base64, not plaintext that happens to be valid base64
    if (reEncoded === current && buf.length >= IV_LENGTH + AUTH_TAG_LENGTH + 1) {
      // Already encrypted — do not re-encrypt
      return next();
    }
  } catch {
    // Not valid base64 — definitely plaintext, encrypt below
  }

  this.apiKey = encrypt(current);
  next();
});

// Encrypt apiKey on findOneAndUpdate / updateOne / etc.
// Mongoose pre('save') hooks do NOT fire on update operations, so without this
// hook the seed's findOneAndUpdate writes plaintext keys to the DB. When
// decryptApiKey() later tries to AES-GCM-decrypt a plaintext string, it throws
// an authentication tag error and the provider resolution falls back to env vars.
aiProviderConfigSchema.pre('findOneAndUpdate', function (this: any, next: any) {
  const update = this.getUpdate() as Record<string, any>;
  if (!update || !update.$set?.apiKey) {
    return next();
  }

  const current = update.$set.apiKey;

  // Skip if already encrypted (same detection logic as pre('save'))
  try {
    const buf = Buffer.from(current, 'base64');
    const reEncoded = buf.toString('base64');
    if (reEncoded === current && buf.length >= IV_LENGTH + AUTH_TAG_LENGTH + 1) {
      return next();
    }
  } catch {
    // Not valid base64 — plaintext, encrypt below
  }

  update.$set.apiKey = encrypt(current);
  next();
});

// Instance method to decrypt the API key
aiProviderConfigSchema.methods.decryptApiKey = function (): string {
  return decrypt(this.apiKey);
};

// Indexes for efficient queries
aiProviderConfigSchema.index({ provider: 1 }, { unique: true }); // One config per provider
aiProviderConfigSchema.index({ isPrimary: 1, isEnabled: 1 }); // Fast lookup for active primary
aiProviderConfigSchema.index({ isEnabled: 1, fallbackOrder: 1 }); // Fallback chain ordering

export default mongoose.model<IAIProviderConfig>('AIProviderConfig', aiProviderConfigSchema);
