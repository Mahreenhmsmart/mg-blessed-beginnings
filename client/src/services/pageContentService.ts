/**
 * Page Content Service
 * Manages editable content for static pages via localStorage.
 * Pages read from this service to display admin-customized content,
 * falling back to hardcoded defaults when no override exists.
 */

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface PricingContent {
  pageTitle: string;
  pageDescription: string;
}

export interface PortfolioCaseStudy {
  id: string;
  title: string;
  category: string;
  description: string;
  metrics: string[];
}

export interface PortfolioContent {
  heroTitle: string;
  heroDescription: string;
  casesTitle: string;
  ctaTitle: string;
  ctaDescription: string;
  caseStudies: PortfolioCaseStudy[];
}

export interface AboutContent {
  founderName: string;
  founderTitle: string;
  heroDescription: string;
  websiteUrl: string;
  journeyParagraphs: string[];
  beliefs: { title: string; description: string }[];
  expertiseItems: string[];
  email: string;
  location: string;
  whatsappNumber: string;
  whatsappUrl: string;
  linkedinUrl: string;
  instagramPersonalUrl: string;
  instagramBrandUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  figmaUrl: string;
  behanceUrl: string;
}

export interface WebsiteClonerContent {
  heroTitle: string;
  heroDescription: string;
  heroSubDescription: string;
  aeoTitle: string;
  aeoDescription: string;
}

export interface ThirtyDayPlanContent {
  heroBadgeText: string;
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  heroDescription: string;
}

export interface ContactContent {
  heroTitle: string;
  heroDescription: string;
  emailLabel: string;
  emailAddress: string;
  locationLabel: string;
  locationValue: string;
  responseTimeLabel: string;
  responseTimeValue: string;
  whatsappNumber: string;
  whatsappUrl: string;
  whatsappDescription: string;
}

export interface PageContents {
  pricing: PricingContent;
  portfolio: PortfolioContent;
  about: AboutContent;
  websiteCloner: WebsiteClonerContent;
  thirtyDayPlan: ThirtyDayPlanContent;
  contact: ContactContent;
}

// ─── Defaults (extracted from current hardcoded page content) ───────────────────

const DEFAULT_CONTENTS: PageContents = {
  pricing: {
    pageTitle: 'Pricing',
    pageDescription: 'Everything is free forever.',
  },
  portfolio: {
    heroTitle: 'Real Results, Real Businesses',
    heroDescription: "See how I've helped entrepreneurs launch and grow their online businesses across Shopify, eBay, Etsy, and digital marketing channels.",
    casesTitle: 'Featured Projects',
    ctaTitle: 'Want Results Like These?',
    ctaDescription: "Every business is unique. Let's discuss your goals and create a custom strategy to help you succeed in e-commerce.",
    caseStudies: [
      {
        id: 'shopify-setup',
        title: 'Shopify Store Launch',
        category: 'E-commerce Setup',
        description: 'Complete Shopify store setup and optimization for a fashion boutique. From theme selection to final launch with integrated payment gateways.',
        metrics: ['Store setup completed', 'Payment gateway integration', 'Mobile-responsive design'],
      },
      {
        id: 'ebay-optimization',
        title: 'eBay Listing Optimization',
        category: 'Marketplace Optimization',
        description: 'Optimized product listings for an electronics seller on eBay. Improved titles, descriptions, and images to increase visibility and sales.',
        metrics: ['Improved search ranking', 'Enhanced listing quality', 'Better conversion potential'],
      },
      {
        id: 'etsy-launch',
        title: 'Etsy Shop Launch',
        category: 'Handmade & Crafts',
        description: 'Launched a handmade jewelry shop on Etsy with optimized listings, SEO-friendly tags, and professional product photography guidance.',
        metrics: ['Shop successfully launched', 'SEO-optimized listings', 'Professional presentation'],
      },
      {
        id: 'digital-marketing',
        title: 'Digital Marketing Campaign',
        category: 'Social Media & Ads',
        description: 'Multi-platform digital marketing campaign for a beauty brand. Combined Instagram ads, TikTok content strategy, and email marketing.',
        metrics: ['Multi-platform strategy', 'Content creation', 'Audience growth focus'],
      },
    ],
  },
  about: {
    founderName: 'Mahreen Yousaf',
    founderTitle: 'Founder & CEO at HMsmart | AI & Digital Marketing Mentor | eCommerce Specialist | AI Content Creator',
    heroDescription: 'I help beginners, entrepreneurs, students, freelancers, and small-business owners learn practical digital skills and build their online presence.',
    websiteUrl: 'https://hmsmart.pk/',
    journeyParagraphs: [
      "Hi, I'm Mahreen. I started my e-commerce journey by learning the hard way — selling on eBay and Etsy, figuring out what works through trial and error, late nights, and a lot of persistence. There was no shortcut, no one handed me a playbook. Every lesson came from real experience.",
      "Over time, I built expertise across Shopify store setup, eBay listing optimization, Etsy SEO, and digital marketing. I discovered how AI tools could dramatically speed up repetitive tasks — writing product descriptions, generating hashtags, analyzing competitors — and I started building free tools to share what I'd learned.",
      'MG Blessed Beginnings grew from a simple desire: help other people avoid the mistakes I made. Whether you\'re launching your first store or scaling an existing business, I want to be the mentor I wish I\'d had when I started.',
      "Today, I work with entrepreneurs around the world — from Pakistan to the US, UK, and beyond. I'm still learning every day, still testing new strategies, and still building tools that make the e-commerce journey easier for everyone.",
    ],
    beliefs: [
      { title: 'Practical Over Theoretical', description: 'I teach what actually works in the real world, not textbook theory. Every strategy I share has been tested.' },
      { title: 'Learning in Public', description: "I share my own wins and failures openly. If something didn't work for me, I'll tell you so you can skip it." },
      { title: 'Beginners Deserve Better', description: 'Everyone starts somewhere. I focus on making e-commerce accessible to people who are just getting started.' },
    ],
    expertiseItems: [
      'AI tools, generative AI, and automation',
      'AI-driven content creation',
      'Digital marketing and social media marketing',
      'Shopify store creation and management',
      'eBay virtual assistance, product listings, and SEO',
      'Branding, graphic design, and Canva',
      'Online business education and mentorship',
    ],
    email: 'hmsmart.official@gmail.com',
    location: 'Pakistan (Available Worldwide)',
    whatsappNumber: '+92 335 8380233',
    whatsappUrl: 'https://wa.me/923358380233',
    linkedinUrl: 'https://www.linkedin.com/in/mahreenyousafdigital/',
    instagramPersonalUrl: 'https://www.instagram.com/mahreenyousafdigi/',
    instagramBrandUrl: 'https://www.instagram.com/mgblessedbeginnings/',
    tiktokUrl: 'https://www.tiktok.com/@hmsmart.ceo',
    youtubeUrl: 'https://www.youtube.com/@blessedbeginnings8003',
    figmaUrl: 'https://www.figma.com/make/Xg8GjmaWh0jQAsQg3Uoabo/mahreen-yousaf--Community-?p=f&fullscreen=1',
    behanceUrl: 'https://www.behance.net/gallery/241251221/Portfolio',
  },
  websiteCloner: {
    heroTitle: 'Website Cloner',
    heroDescription: 'Create a single-file visual clone of any public website.',
    heroSubDescription: 'Styles are inlined, small images embedded as base64, and all scripts removed for security. The result is a self-contained HTML file you can open anywhere.',
    aeoTitle: 'What is a website cloner?',
    aeoDescription: 'A website cloner creates a single-file visual copy of any public webpage by fetching its HTML, inlining all CSS stylesheets, embedding small images as base64 data URIs, and stripping JavaScript for security. The result is a self-contained HTML file you can open locally for research, design inspiration, backup, or migration planning without needing an internet connection.',
  },
  thirtyDayPlan: {
    heroBadgeText: '30 Days to 500 Downloads',
    heroTitlePrefix: 'Your 30-Day',
    heroTitleHighlight: 'Growth Plan',
    heroDescription: '500 downloads in 30 days — one day at a time. Track your progress, check off daily tasks, and watch your app grow.',
  },
  contact: {
    heroTitle: 'Contact Us',
    heroDescription: "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
    emailLabel: 'Email',
    emailAddress: 'hmsmart.official@gmail.com',
    locationLabel: 'Location',
    locationValue: 'Pakistan (Available Worldwide)',
    responseTimeLabel: 'Response Time',
    responseTimeValue: 'Usually within 24 hours',
    whatsappNumber: '+92 335 8380233',
    whatsappUrl: 'https://wa.me/923358380233',
    whatsappDescription: 'Prefer instant messaging? Reach out directly on WhatsApp for a quick conversation.',
  },
};

// ─── Storage Key ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'mgbb-page-contents';

// ─── Public API ─────────────────────────────────────────────────────────────────

/** Load saved content merged with defaults (saved overrides win). */
export function getPageContents(): PageContents {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_CONTENTS);
    const saved = JSON.parse(raw) as Partial<PageContents>;
    // Deep merge: use saved value if present, else default
    return {
      pricing: { ...DEFAULT_CONTENTS.pricing, ...(saved.pricing || {}) },
      portfolio: {
        ...DEFAULT_CONTENTS.portfolio,
        ...(saved.portfolio || {}),
        caseStudies: saved.portfolio?.caseStudies ?? DEFAULT_CONTENTS.portfolio.caseStudies,
      },
      about: {
        ...DEFAULT_CONTENTS.about,
        ...(saved.about || {}),
        journeyParagraphs: saved.about?.journeyParagraphs ?? DEFAULT_CONTENTS.about.journeyParagraphs,
        beliefs: saved.about?.beliefs ?? DEFAULT_CONTENTS.about.beliefs,
        expertiseItems: saved.about?.expertiseItems ?? DEFAULT_CONTENTS.about.expertiseItems,
      },
      websiteCloner: { ...DEFAULT_CONTENTS.websiteCloner, ...(saved.websiteCloner || {}) },
      thirtyDayPlan: { ...DEFAULT_CONTENTS.thirtyDayPlan, ...(saved.thirtyDayPlan || {}) },
      contact: { ...DEFAULT_CONTENTS.contact, ...(saved.contact || {}) },
    };
  } catch {
    return structuredClone(DEFAULT_CONTENTS);
  }
}

/** Save full page contents to localStorage. */
export function savePageContents(contents: PageContents): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contents));
}

/** Get defaults (for reset functionality). */
export function getDefaultContents(): PageContents {
  return structuredClone(DEFAULT_CONTENTS);
}

/** Convenience getters for individual pages. */
export function getPricingContent(): PricingContent {
  return getPageContents().pricing;
}

export function getPortfolioContent(): PortfolioContent {
  return getPageContents().portfolio;
}

export function getAboutContent(): AboutContent {
  return getPageContents().about;
}

export function getWebsiteClonerContent(): WebsiteClonerContent {
  return getPageContents().websiteCloner;
}

export function getThirtyDayPlanContent(): ThirtyDayPlanContent {
  return getPageContents().thirtyDayPlan;
}

export function getContactContent(): ContactContent {
  return getPageContents().contact;
}
