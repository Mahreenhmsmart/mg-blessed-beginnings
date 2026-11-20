import mongoose, { Schema, Document } from 'mongoose';

export interface IWhatsAppEvent extends Document {
  timestamp: Date;
  type: 'message' | 'status';
  from: string;
  body: string;
  status: string;
  messageId: string;
  rawPayload: Record<string, unknown>;
}

const whatsAppEventSchema = new Schema<IWhatsAppEvent>(
  {
    timestamp: { type: Date, required: true, default: Date.now },
    type: { type: String, required: true, enum: ['message', 'status'] },
    from: { type: String, default: '' },
    body: { type: String, default: '' },
    status: { type: String, default: '' },
    messageId: { type: String, default: '' },
    rawPayload: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

whatsAppEventSchema.index({ type: 1 });
whatsAppEventSchema.index({ createdAt: -1 });
whatsAppEventSchema.index({ from: 1 });

export default mongoose.model<IWhatsAppEvent>('WhatsAppEvent', whatsAppEventSchema);
