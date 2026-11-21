import mongoose, { Schema, Document } from 'mongoose';

export interface JourneyStep {
  number: string;
  title: string;
  description: string;
  iconName: string;
}

export interface AdSlot {
  advertiserName: string;
  imageUrl: string;
  linkUrl: string;
  tagline: string;
}

export interface IHomepageSettings extends Document {
  hero: {
    headline: string;
    subheadline: string;
    imageUrl: string;
  };
  contentHook: {
    title: string;
    description: string;
    imageUrl: string;
  };
  journeySteps: JourneyStep[];
  aiReadinessPreview: {
    sectionTitle: string;
    readinessTitle: string;
    description: string;
    readinessDescription: string;
  };
  adSlots: AdSlot[];
  createdAt: Date;
  updatedAt: Date;
}

const journeyStepSchema = new Schema<JourneyStep>(
  {
    number: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    iconName: { type: String, required: true },
  },
  { _id: false },
);

const adSlotSchema = new Schema<AdSlot>(
  {
    advertiserName: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    linkUrl: { type: String, default: '' },
    tagline: { type: String, default: '' },
  },
  { _id: false },
);

const homepageSettingsSchema = new Schema<IHomepageSettings>(
  {
    hero: {
      headline: { type: String, default: 'Your AI-Powered Business Toolkit' },
      subheadline: { type: String, default: 'Free AI tools for content, marketing, SEO, eCommerce & online business.' },
      imageUrl: { type: String, default: 'https://drive.google.com/thumbnail?id=1JyOiHzGnglHR5woY1qwApIHM3PA6BxYa&sz=w1920' },
    },
    contentHook: {
      title: { type: String, default: 'Optimize your listing in 60 seconds ⬇️' },
      description: { type: String, default: 'MG AI Assistant can help you generate SEO titles, product descriptions, hashtags, and marketing content — try our free AI tools today.' },
      imageUrl: { type: String, default: '' },
    },
    journeySteps: {
      type: [journeyStepSchema],
      default: [
        { number: '01', title: 'Idea', description: 'Start with your business concept and vision.', iconName: 'Lightbulb' },
        { number: '02', title: 'Research', description: 'Validate your idea with AI-powered market analysis.', iconName: 'Search' },
        { number: '03', title: 'Brand', description: 'Build a memorable brand identity that stands out.', iconName: 'Palette' },
        { number: '04', title: 'Build', description: 'Create products, listings, and your online store.', iconName: 'Hammer' },
        { number: '05', title: 'Market', description: 'Generate content and strategies to attract customers.', iconName: 'Megaphone' },
        { number: '06', title: 'Grow', description: 'Scale with data-driven insights and optimization.', iconName: 'TrendingUp' },
      ],
    },
    aiReadinessPreview: {
      sectionTitle: { type: String, default: 'AI Business Toolkit' },
      readinessTitle: { type: String, default: 'See Your Business Potential Before You Launch' },
      description: { type: String, default: 'Free AI tools for content, marketing, SEO, eCommerce & online business.' },
      readinessDescription: { type: String, default: 'Get an AI-powered readiness preview that shows where your business idea stands — before you invest time or money.' },
    },
    adSlots: {
      type: [adSlotSchema],
      default: [
        { advertiserName: 'Ad Slot 1', imageUrl: '', linkUrl: '', tagline: '' },
        { advertiserName: 'Ad Slot 2', imageUrl: '', linkUrl: '', tagline: '' },
        { advertiserName: 'Ad Slot 3', imageUrl: '', linkUrl: '', tagline: '' },
        { advertiserName: 'Ad Slot 4', imageUrl: '', linkUrl: '', tagline: '' },
        { advertiserName: 'Ad Slot 5', imageUrl: '', linkUrl: '', tagline: '' },
      ],
    },
  },
  { timestamps: true },
);

export default mongoose.model<IHomepageSettings>('HomepageSettings', homepageSettingsSchema);
