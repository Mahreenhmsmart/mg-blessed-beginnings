import mongoose, { Schema, Document } from 'mongoose';

export interface IGSCConnection extends Document {
  projectId: mongoose.Types.ObjectId;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  siteUrl: string;
  connectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const gscConnectionSchema = new Schema<IGSCConnection>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    siteUrl: { type: String, required: true, trim: true },
    connectedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

gscConnectionSchema.index({ projectId: 1 }, { unique: true });

export default mongoose.model<IGSCConnection>('GSCConnection', gscConnectionSchema);
