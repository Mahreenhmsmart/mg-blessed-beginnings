import mongoose, { Schema, Document } from 'mongoose';

export interface IConsultation extends Document {
  name: string;
  email: string;
  phone: string;
  service: string;
  preferredDate: Date;
  preferredTime: string;
  message: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
}

const consultationSchema = new Schema<IConsultation>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    phone: { type: String, required: true, trim: true },
    service: { type: String, required: true, trim: true },
    preferredDate: { type: Date, required: true },
    preferredTime: { type: String, required: true, trim: true },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

consultationSchema.index({ email: 1 });
consultationSchema.index({ status: 1 });
consultationSchema.index({ preferredDate: 1 });

export default mongoose.model<IConsultation>('Consultation', consultationSchema);
