import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'viewer' | 'user';
  isActive: boolean;
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId;
  credits: number;
  totalReferrals: number;
  customerId?: string;
  subscriptionStatus: string;
  subscriptionPlan?: string;
  subscriptionEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'manager', 'viewer', 'user'],
      default: 'viewer',
    },
    isActive: { type: Boolean, default: true },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User', default: undefined },
    credits: { type: Number, default: 0 },
    totalReferrals: { type: Number, default: 0 },
    subscriptionStatus: { type: String, default: 'free' },
    subscriptionPlan: { type: String },
    subscriptionEndsAt: { type: Date },
  },
  { timestamps: true },
);

// Hash password before saving if modified + auto-generate referral code
userSchema.pre('save', async function (next) {
  // Auto-generate referral code if missing
  if (!this.referralCode) {
    this.referralCode = generateReferralCode();
  }

  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

userSchema.index({ email: 1 });
userSchema.index({ referralCode: 1 });

export default mongoose.model<IUser>('User', userSchema);
