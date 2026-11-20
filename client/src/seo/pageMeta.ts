/**
 * Centralized per-page SEO metadata.
 * Canonical URLs are relative paths — SEOHead converts them to absolute URLs.
 * Titles include the brand suffix where applicable.
 */

export interface PageMeta {
  title: string;
  description: string;
  keywords?: string;
  canonical: string;
  noindex?: boolean;
}

/** Keyed by route path (must match React Router paths in App.tsx). */
export const PAGE_META: Record<string, PageMeta> = {
  '/': {
    title: 'MG Blessed Beginnings — AI-Powered Business Growth Platform',
    description:
      'Empower your small business with AI tools, website intelligence, SEO audits, and digital marketing strategies built for entrepreneurs.',
    keywords:
      'AI tools, AI marketing, AI content creator, SEO tools, social media tools, eCommerce tools, product description generator, hashtag generator, SEO title generator, AI business tools, Shopify tools, online business tools, free AI tools, content generator, marketing automation',
    canonical: '/',
  },

  '/ai-tools': {
    title: 'Free AI Tools — MG Blessed Beginnings',
    description:
      '15 free AI-powered tools: hashtag generator, product descriptions, SEO optimizer, competitor analyzer, and more.',
    keywords:
      'ai tools, product description generator, seo optimizer, ecommerce tools, free ai tools, ecommerce sellers',
    canonical: '/ai-tools',
  },

  '/services': {
    title: 'Digital Marketing Services — MG Blessed Beginnings',
    description:
      'Professional SEO audits, website cloning, content strategy, and AI-powered business growth services for entrepreneurs.',
    keywords:
      'shopify setup, ebay optimization, etsy management, e-commerce consulting, digital marketing services, AI services',
    canonical: '/services',
  },

  '/blog': {
    title: 'Blog — AI & Business Growth Insights — MG Blessed Beginnings',
    description:
      'Expert articles on AI tools, SEO strategies, e-commerce growth, and digital marketing for small businesses.',
    keywords:
      'ecommerce blog, shopify tips, ebay selling, etsy seo, online business tips, ecommerce guides, marketing strategies',
    canonical: '/blog',
  },

  '/contact': {
    title: 'Contact — MG Blessed Beginnings',
    description:
      "Get in touch with Mahreen Yousaf for e-commerce consulting, AI tool inquiries, and business growth strategies. We're here to help you succeed online.",
    keywords: 'contact, ecommerce consultant, get in touch, inquiry, MG Blessed Beginnings',
    canonical: '/contact',
  },

  '/about': {
    title: 'About — MG Blessed Beginnings',
    description:
      'Learn about Mahreen Yousaf, Founder & CEO of MG Blessed Beginnings. AI & digital marketing mentor specializing in Shopify, eBay, and Etsy guidance.',
    keywords:
      'mahreen yousaf, ecommerce consultant, pakistan, shopify expert, ebay seller, ai mentor, digital marketing',
    canonical: '/about',
  },

  '/growth-plan': {
    title: '30-Day Business Growth Plan — MG Blessed Beginnings',
    description:
      'A step-by-step 30-day plan to grow your online business with AI tools, SEO, content marketing, and social media.',
    keywords:
      'app growth plan, 30 day marketing plan, user acquisition strategy, content marketing calendar, app download strategy, growth hacking plan',
    canonical: '/30-day-plan',
  },

  // /thirty-day-plan redirects to /30-day-plan in App.tsx — this covers the canonical route
  '/30-day-plan': {
    title: '30-Day Business Growth Plan — MG Blessed Beginnings',
    description:
      'A step-by-step 30-day plan to grow your online business with AI tools, SEO, content marketing, and social media.',
    keywords:
      'app growth plan, 30 day marketing plan, user acquisition strategy, content marketing calendar, app download strategy, growth hacking plan',
    canonical: '/30-day-plan',
  },

  '/resources': {
    title: 'Resources — MG Blessed Beginnings',
    description:
      'Download free e-commerce resources including SEO checklists, listing templates, shop setup guides, and keyword research worksheets.',
    keywords:
      'free ecommerce resources, seller checklist, listing template, shopify guide, ebay template',
    canonical: '/resources',
  },

  '/courses': {
    title: 'Courses — MG Blessed Beginnings',
    description:
      'Learn AI, SEO, and digital marketing with structured courses for entrepreneurs and small business owners.',
    keywords:
      'e-commerce courses, shopify training, ebay course, etsy tutorial, digital marketing education',
    canonical: '/courses',
  },

  '/portfolio': {
    title: 'Portfolio — MG Blessed Beginnings',
    description:
      'See real results from businesses that grew their online presence with our AI tools and digital marketing strategies.',
    keywords:
      'portfolio, case studies, ecommerce success stories, shopify expert, ebay optimization, etsy shop launch, digital marketing',
    canonical: '/portfolio',
  },

  '/advertise': {
    title: 'Advertise With Us — MG Blessed Beginnings',
    description:
      'Reach engaged entrepreneurs and small business owners. Banner and sidebar ad placements across our platform.',
    keywords:
      'advertise, ad placement, banner ad, sidebar ad, e-commerce advertising, digital marketing, sponsored content',
    canonical: '/advertise',
  },

  '/advertisement': {
    title: 'Create Your Ad — MG Blessed Beginnings',
    description:
      'Reach thousands of e-commerce entrepreneurs. Purchase a premium ad placement for just $50 and get your business in front of our engaged audience.',
    keywords:
      'advertise, ad placement, banner ad, e-commerce advertising, digital marketing',
    canonical: '/advertisement',
  },

  '/cookie-policy': {
    title: 'Cookie Policy — MG Blessed Beginnings',
    description:
      'Learn how MG Blessed Beginnings uses cookies and tracking technologies to improve your experience.',
    keywords: 'cookie policy, cookies, privacy, tracking, MG Blessed Beginnings',
    canonical: '/cookie-policy',
  },

  '/privacy-policy': {
    title: 'Privacy Policy — MG Blessed Beginnings',
    description:
      'How we collect, use, and protect your personal information at MG Blessed Beginnings.',
    keywords: 'privacy policy, GDPR, data protection, MG Blessed Beginnings',
    canonical: '/privacy-policy',
  },

  '/terms-of-service': {
    title: 'Terms of Service — MG Blessed Beginnings',
    description:
      'Terms and conditions for using MG Blessed Beginnings platform, tools, and services.',
    keywords: 'terms of service, terms and conditions, legal, MG Blessed Beginnings',
    canonical: '/terms-of-service',
  },

  '/sitemap': {
    title: 'HTML Sitemap — MG Blessed Beginnings',
    description:
      'Browse all pages on MG Blessed Beginnings. Find AI tools, services, blog posts, courses, and resources for e-commerce sellers.',
    canonical: '/sitemap',
  },

  '/content-templates': {
    title: 'Content Templates — MG Blessed Beginnings',
    description:
      'Ready-to-use content templates for social media, email marketing, blog posts, and e-commerce listings.',
    keywords:
      'AI tool content ideas, social media templates for sellers, content hooks, reel scripts, TikTok templates, e-commerce marketing',
    canonical: '/content-templates',
  },

  '/prompt-library': {
    title: 'AI Prompt Library — MG Blessed Beginnings',
    description:
      'Curated AI prompts for business, marketing, and content creation. Copy and use them with any AI tool.',
    keywords:
      'ai prompts, chatgpt prompts, ecommerce prompts, product description prompts',
    canonical: '/prompt-library',
  },

  '/book-consultation': {
    title: 'Book a Free Consultation — MG Blessed Beginnings',
    description:
      'Schedule a free 1-on-1 consultation to discuss your business goals and get a personalized growth strategy.',
    keywords: 'book consultation, schedule, appointment, ecommerce consulting',
    canonical: '/book-consultation',
  },

  // /book is an alias for /book-consultation in App.tsx
  '/book': {
    title: 'Book a Free Consultation — MG Blessed Beginnings',
    description:
      'Schedule a free 1-on-1 consultation to discuss your business goals and get a personalized growth strategy.',
    keywords: 'book consultation, schedule, appointment, ecommerce consulting',
    canonical: '/book-consultation',
  },

  '/website-audit': {
    title: 'Free Website SEO Audit — MG Blessed Beginnings',
    description:
      'Run a comprehensive SEO audit on any website. Get scores, issues, and actionable recommendations in minutes.',
    keywords:
      'website audit, SEO audit, security audit, accessibility check, website analysis, free SEO tool',
    canonical: '/website-audit',
  },

  '/website-intelligence': {
    title: 'Website Intelligence — MG Blessed Beginnings',
    description:
      "Deep-dive analytics into any website's SEO, performance, and competitive positioning with AI-powered insights.",
    keywords:
      'website intelligence, competitor analysis, SEO analytics, website audit, market research, site performance',
    canonical: '/website-intelligence',
  },

  '/website-cloner': {
    title: 'Website Cloner — MG Blessed Beginnings',
    description:
      "Clone any website's structure for research and analysis. Study competitor designs and layouts legally.",
    keywords: 'website cloner, clone website, html clone, website copy, site mirror, visual clone',
    canonical: '/website-cloner',
  },

  '/video-generator': {
    title: 'AI Video Generator — MG Blessed Beginnings',
    description:
      'Generate AI-powered marketing videos for social media, product showcases, and brand storytelling.',
    keywords:
      'ai video generator, luma ai, dream machine, text to video, ai video, free video generator',
    canonical: '/video-generator',
  },

  '/referral': {
    title: 'Referral Program — MG Blessed Beginnings',
    description:
      'Earn rewards by referring friends and businesses to MG Blessed Beginnings AI tools and services.',
    keywords:
      'referral program, invite friends, AI credits, earn credits, MG Blessed Beginnings, partner program',
    canonical: '/referral',
  },

  // ── Auth pages (noindex) ────────────────────────────────────────────────────
  '/login': {
    title: 'Sign In — MG Blessed Beginnings',
    description:
      'Sign in to your MG Blessed Beginnings dashboard to access AI tools, SEO audits, and business intelligence features.',
    canonical: '/login',
    noindex: true,
  },

  '/signup': {
    title: 'Create Account — MG Blessed Beginnings',
    description:
      'Sign up for MG Blessed Beginnings to access AI tools, SEO audits, and business intelligence features.',
    canonical: '/signup',
    noindex: true,
  },

  // ── Payment / subscription result pages (noindex) ───────────────────────────
  '/subscription/success': {
    title: 'Subscription Status — MG Blessed Beginnings',
    description: 'Subscription information page.',
    canonical: '/subscription/success',
    noindex: true,
  },

  '/subscription/cancel': {
    title: 'Subscription Cancelled — MG Blessed Beginnings',
    description:
      "Your subscription was not completed. Try again whenever you're ready.",
    canonical: '/subscription/cancel',
    noindex: true,
  },

  '/ad-payment/success': {
    title: 'Ad Payment Status — MG Blessed Beginnings',
    description: 'Ad payment information page.',
    canonical: '/ad-payment/success',
    noindex: true,
  },

  '/ad-payment/cancel': {
    title: 'Ad Payment Cancelled — MG Blessed Beginnings',
    description:
      "Your ad purchase was not completed. Try again whenever you're ready.",
    canonical: '/ad-payment/cancel',
    noindex: true,
  },

  '/card-payment': {
    title: 'Card Payment — MG Blessed Beginnings',
    description: 'Online card payment page.',
    canonical: '/card-payment',
    noindex: true,
  },

  '/ad-dashboard': {
    title: 'Advertiser Dashboard — MG Blessed Beginnings',
    description:
      'Manage your ad campaigns, track impressions, and monitor performance from your advertiser dashboard.',
    canonical: '/ad-dashboard',
    noindex: true,
  },

  // ── 404 (noindex) ───────────────────────────────────────────────────────────
  '/404': {
    title: 'Page Not Found — MG Blessed Beginnings',
    description:
      "The page you're looking for doesn't exist. Browse our tools, services, and resources.",
    canonical: '/404',
    noindex: true,
  },
};
