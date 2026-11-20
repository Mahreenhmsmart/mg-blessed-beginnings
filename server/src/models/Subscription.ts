import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  customerId: string;
  subscriptionId: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'paused';
  planId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerId: { type: String, required: true, index: true },
    subscriptionId: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'paused'],
      default: 'incomplete',
    },
    planId: { type: String, required: true },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true },
);

subscriptionSchema.index({ userId: 1, status: 1 });

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);
