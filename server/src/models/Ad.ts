import mongoose, { Schema, Document } from 'mongoose';

export interface IAd extends Document {
  advertiserName: string;
  advertiserEmail: string;
  title: string;
  description?: string;
  imageUrl?: string;
  targetUrl?: string;
  brandColorPrimary?: string;
  brandColorSecondary?: string;
  status: 'pending' | 'active' | 'expired' | 'rejected';
  paymentStatus: 'unpaid' | 'paid';
  currency: string;
  amountPaid?: number;
  /** Original currency selected by the advertiser at checkout time (e.g., 'pkr', 'gbp'). Immutable after creation. */
  originalCurrency?: string;
  /** Original amount in the advertiser's selected currency (display units, not cents). Immutable after creation. */
  originalAmount?: number;
  /** Exchange rate applied at checkout time (relative to USD base). Immutable after creation. */
  appliedRate?: number;
  /** Base USD equivalent amount at checkout time. Immutable after creation. */
  baseAmountUsd?: number;
  paymentSessionId?: string;
  purchasedAt?: Date;
  expiresAt?: Date;
  impressions: number;
  clicks: number;
  pageViews: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const adSchema = new Schema<IAd>(
  {
    advertiserName: { type: String, required: true, trim: true },
    advertiserEmail: { type: String, required: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    targetUrl: { type: String, trim: true },
    brandColorPrimary: { type: String, default: '#6C3CE1', trim: true },
    brandColorSecondary: { type: String, default: '#A855F7', trim: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'rejected'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
    },
    paymentSessionId: { type: String, unique: true, sparse: true },
    currency: { type: String, default: 'usd', lowercase: true },
    amountPaid: { type: Number },
    originalCurrency: { type: String, lowercase: true },
    originalAmount: { type: Number },
    appliedRate: { type: Number },
    baseAmountUsd: { type: Number },
    purchasedAt: { type: Date },
    expiresAt: { type: Date },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    pageViews: { type: Map, of: Number, default: {} },
  },
  { timestamps: true },
);

// Index for efficient active-ad queries
adSchema.index({ status: 1, expiresAt: 1 });

export default mongoose.model<IAd>('Ad', adSchema);
