import { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';

export interface HomepageJourneyStep {
  number: string;
  title: string;
  description: string;
  iconName: string;
}

export interface HomepageAdSlot {
  advertiserName: string;
  imageUrl: string;
  linkUrl: string;
  tagline: string;
}

export interface HomepageSettings {
  hero: { headline: string; subheadline: string; imageUrl: string };
  contentHook: { title: string; description: string; imageUrl: string };
  journeySteps: HomepageJourneyStep[];
  aiReadinessPreview: { sectionTitle: string; readinessTitle: string; description: string; readinessDescription: string };
  adSlots: HomepageAdSlot[];
}

const DEFAULT_SETTINGS: HomepageSettings = {
  hero: {
    headline: 'MG Blessed Beginnings — 14 Free AI Tools for Online Sellers',
    subheadline: 'Unlimited Use. No Sign-Up. No Credit Card.',
    imageUrl: 'https://drive.google.com/thumbnail?id=1JyOiHzGnglHR5woY1qwApIHM3PA6BxYa&sz=w1920',
  },
  contentHook: {
    title: 'Optimize your listing in 60 seconds ⬇️',
    description: 'MG AI Assistant can help you generate SEO titles, product descriptions, hashtags, and marketing content — try our free AI tools today.',
    imageUrl: '',
  },
  journeySteps: [
    { number: '01', title: 'Idea', description: 'Start with your business concept and vision.', iconName: 'Lightbulb' },
    { number: '02', title: 'Research', description: 'Validate your idea with AI-powered market analysis.', iconName: 'Search' },
    { number: '03', title: 'Brand', description: 'Build a memorable brand identity that stands out.', iconName: 'Palette' },
    { number: '04', title: 'Build', description: 'Create products, listings, and your online store.', iconName: 'Hammer' },
    { number: '05', title: 'Market', description: 'Generate content and strategies to attract customers.', iconName: 'Megaphone' },
    { number: '06', title: 'Grow', description: 'Scale with data-driven insights and optimization.', iconName: 'TrendingUp' },
  ],
  aiReadinessPreview: {
    sectionTitle: 'AI Business Toolkit',
    readinessTitle: 'See Your Business Potential Before You Launch',
    description: 'Free AI tools for content, marketing, SEO, eCommerce & online business.',
    readinessDescription: 'Get an AI-powered readiness preview that shows where your business idea stands — before you invest time or money.',
  },
  adSlots: [
    { advertiserName: 'Ad Slot 1', imageUrl: '', linkUrl: '', tagline: '' },
    { advertiserName: 'Ad Slot 2', imageUrl: '', linkUrl: '', tagline: '' },
    { advertiserName: 'Ad Slot 3', imageUrl: '', linkUrl: '', tagline: '' },
    { advertiserName: 'Ad Slot 4', imageUrl: '', linkUrl: '', tagline: '' },
    { advertiserName: 'Ad Slot 5', imageUrl: '', linkUrl: '', tagline: '' },
  ],
};

/**
 * Fetches homepage settings from the database with fallback to hardcoded defaults.
 * Uses a module-level cache so multiple components share a single fetch.
 */
let cachedSettings: HomepageSettings | null = null;
let fetchPromise: Promise<HomepageSettings> | null = null;

async function loadSettings(): Promise<HomepageSettings> {
  if (cachedSettings) return cachedSettings;
  if (!fetchPromise) {
    fetchPromise = apiClient
      .get('/admin-console/homepage-settings')
      .then((res) => {
        const data = res.data?.data;
        if (data && typeof data === 'object') {
          cachedSettings = data as HomepageSettings;
          return cachedSettings;
        }
        return DEFAULT_SETTINGS;
      })
      .catch(() => DEFAULT_SETTINGS);
  }
  return fetchPromise;
}

export function useHomepageSettings() {
  const [settings, setSettings] = useState<HomepageSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSettings().then((s) => {
      if (!cancelled) {
        setSettings(s);
        setLoaded(true);
      }
    });
    return () => { cancelled = true; };
  }, []);

  return { settings, loaded };
}
