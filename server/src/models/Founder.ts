import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialLink {
  platform: string;
  url: string;
}

export interface IFounder extends Document {
  name: string;
  photo: string;
  bio: string;
  title: string;
  socialLinks: ISocialLink[];
  createdAt: Date;
  updatedAt: Date;
}

const socialLinkSchema = new Schema<ISocialLink>(
  {
    platform: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const founderSchema = new Schema<IFounder>(
  {
    name: { type: String, required: true, trim: true },
    photo: { type: String, default: '' },
    bio: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    socialLinks: [socialLinkSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IFounder>('Founder', founderSchema);
