import mongoose, { Schema, Document } from 'mongoose';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'sent' | 'failed';
}

const contactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
  },
  { timestamps: true }
);

contactMessageSchema.index({ email: 1 });
contactMessageSchema.index({ createdAt: -1 });

export default mongoose.model<IContactMessage>('ContactMessage', contactMessageSchema);
