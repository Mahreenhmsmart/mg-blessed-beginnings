import mongoose, { Schema, Document } from 'mongoose';

export interface IReferral extends Document {
  referrer: mongoose.Types.ObjectId;
  referred: mongoose.Types.ObjectId;
  status: 'pending' | 'completed';
  creditsAwarded: number;
  createdAt: Date;
}

const referralSchema = new Schema<IReferral>(
  {
    referrer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    referred: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'completed',
    },
    creditsAwarded: { type: Number, default: 5 },
  },
  { timestamps: true },
);

referralSchema.index({ referrer: 1, createdAt: -1 });
referralSchema.index({ referred: 1 }, { unique: true });

export default mongoose.model<IReferral>('Referral', referralSchema);
