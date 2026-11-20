import mongoose, { Schema, Document } from 'mongoose';

export interface INewsletterSubscriber extends Document {
  email: string;
  source?: string; // Where they subscribed (home, courses, footer, etc.)
  isActive: boolean;
}

const newsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    source: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

newsletterSubscriberSchema.index({ email: 1 });
newsletterSubscriberSchema.index({ createdAt: -1 });

export default mongoose.model<INewsletterSubscriber>('NewsletterSubscriber', newsletterSubscriberSchema);
