import { Schema, model } from 'mongoose';

const processedEventSchema = new Schema({
  eventId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: '30d' },
});

export const ProcessedEvent = model('ProcessedEvent', processedEventSchema);
