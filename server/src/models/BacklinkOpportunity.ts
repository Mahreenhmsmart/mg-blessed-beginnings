import mongoose, { Schema, Document } from 'mongoose';

export type RelAttribute = 'follow' | 'nofollow' | 'ugc' | 'sponsored';

export interface IBacklinkOpportunity extends Document {
  projectId: mongoose.Types.ObjectId;
  sourceUrl: string;
  targetUrl: string;
  type: 'competitor-referral' | 'broken-link' | 'unlinked-mention' | 'guest-post';
  status: 'discovered' | 'contacted' | 'acquired';
  domainAuthority: number | null;
  anchorText: string | null;
  relAttribute: RelAttribute;
  isBroken: boolean;
  spamSignal: boolean;
  referringDomain: string;
  createdAt: Date;
  updatedAt: Date;
}

const backlinkOpportunitySchema = new Schema<IBacklinkOpportunity>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    sourceUrl: { type: String, required: true, trim: true },
    targetUrl: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['competitor-referral', 'broken-link', 'unlinked-mention', 'guest-post'],
      required: true,
    },
    status: {
      type: String,
      enum: ['discovered', 'contacted', 'acquired'],
      default: 'discovered',
    },
    domainAuthority: { type: Number, default: null },
    anchorText: { type: String, default: null },
    relAttribute: {
      type: String,
      enum: ['follow', 'nofollow', 'ugc', 'sponsored'],
      default: 'follow',
    },
    isBroken: { type: Boolean, default: false },
    spamSignal: { type: Boolean, default: false },
    referringDomain: { type: String, default: '' },
  },
  { timestamps: true },
);

export default mongoose.model<IBacklinkOpportunity>('BacklinkOpportunity', backlinkOpportunitySchema);
