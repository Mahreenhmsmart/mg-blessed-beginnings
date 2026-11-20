/**
 * Sitemap data for SEO purposes.
 * Contains all static routes and dynamic patterns for tool and niche pages.
 */

export interface SitemapEntry {
  path: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

// Static routes — only public, canonical pages that should be indexed.
// Excludes: /dashboard/*, /login, /signup, /card-payment, /subscription/*,
// /ad-payment/*, /ad-dashboard, /admin/*, and any auth/payment result pages.
export const staticRoutes: SitemapEntry[] = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/services', priority: 0.8, changefreq: 'monthly' },
  { path: '/ai-tools', priority: 0.8, changefreq: 'weekly' },
  { path: '/blog', priority: 0.8, changefreq: 'weekly' },
  { path: '/about', priority: 0.8, changefreq: 'monthly' },
  { path: '/contact', priority: 0.8, changefreq: 'monthly' },
  { path: '/book-consultation', priority: 0.7, changefreq: 'monthly' },
  { path: '/portfolio', priority: 0.8, changefreq: 'monthly' },
  { path: '/courses', priority: 0.8, changefreq: 'monthly' },
  { path: '/resources', priority: 0.8, changefreq: 'monthly' },
  { path: '/content-templates', priority: 0.8, changefreq: 'monthly' },
  { path: '/prompt-library', priority: 0.8, changefreq: 'monthly' },
  { path: '/website-audit', priority: 0.8, changefreq: 'monthly' },
  { path: '/video-generator', priority: 0.8, changefreq: 'monthly' },
  { path: '/website-intelligence', priority: 0.8, changefreq: 'monthly' },
  { path: '/website-cloner', priority: 0.8, changefreq: 'monthly' },
  { path: '/advertise', priority: 0.8, changefreq: 'monthly' },
  { path: '/advertisement', priority: 0.7, changefreq: 'monthly' },
  { path: '/referral', priority: 0.8, changefreq: 'monthly' },
  { path: '/30-day-plan', priority: 0.8, changefreq: 'monthly' },
  { path: '/privacy-policy', priority: 0.3, changefreq: 'yearly' },
  { path: '/terms-of-service', priority: 0.3, changefreq: 'yearly' },
  { path: '/cookie-policy', priority: 0.3, changefreq: 'yearly' },
  { path: '/sitemap', priority: 0.5, changefreq: 'monthly' },
];

// Tool slugs for dynamic tool detail pages
export const toolSlugs = [
  'product-description-generator',
  'seo-title-optimizer',
  'hashtag-generator',
  'competitor-analyzer',
  'review-response-writer',
  'listing-optimizer',
  'social-media-studio',
  'product-research-assistant',
  'prompt-library',
  'store-audit',
  'branding-assistant',
  'bulk-listing-generator',
  'ai-video-generator',
  'listing-health-score',
  'keyword-research',
];

// Niche mappings for dynamic niche pages
export const nicheRoutes: Record<string, string[]> = {
  'product-description-generator': [
    'fashion',
    'supplements',
    'gadgets',
    'beauty',
    'food',
    'fitness',
    'accessories',
    'furniture',
  ],
  'seo-title-optimizer': [
    'kitchen-products',
    'electronics',
    'clothing',
    'jewelry',
    'toys',
    'auto-parts',
    'home-decor',
    'sports',
  ],
  'hashtag-generator': [
    'jewelry',
    'art-prints',
    'candles',
    'clothing',
    'stickers',
    'wedding',
    'digital-downloads',
    'pet-supplies',
  ],
};

/**
 * Generate all sitemap entries including dynamic routes.
 */
export function generateSitemap(): SitemapEntry[] {
  const entries: SitemapEntry[] = [...staticRoutes];

  // Add tool detail pages
  for (const slug of toolSlugs) {
    entries.push({
      path: `/tools/${slug}`,
      priority: 0.8,
      changefreq: 'weekly',
    });
  }

  // Add niche pages
  for (const [toolSlug, niches] of Object.entries(nicheRoutes)) {
    for (const niche of niches) {
      entries.push({
        path: `/tools/${toolSlug}/${niche}`,
        priority: 0.7,
        changefreq: 'monthly',
      });
    }
  }

  return entries;
}

/**
 * Get total count of all indexed pages.
 */
export function getSitemapPageCount(): number {
  return generateSitemap().length;
}
