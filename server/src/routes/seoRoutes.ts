import { Router } from 'express';
import type { Request, Response } from 'express';
import BlogPost from '../models/BlogPost';
import AITool from '../models/AITool';
import Service from '../models/Service';
import Course from '../models/Course';
import Resource from '../models/Resource';

const router = Router();

const BASE_URL = (process.env.VITE_API_URL || '').replace(/\/api\/?$/, '');

// ─── Niche subpages for tool detail pages ──────────────────────────────────────
// Mirrors client/src/data/sitemap.ts nicheRoutes — kept in sync manually.
const NICHE_ROUTES: Record<string, string[]> = {
  'product-description-generator': [
    'fashion', 'supplements', 'gadgets', 'beauty', 'food', 'fitness', 'accessories', 'furniture',
  ],
  'seo-title-optimizer': [
    'kitchen-products', 'electronics', 'clothing', 'jewelry', 'toys', 'auto-parts', 'home-decor', 'sports',
  ],
  'hashtag-generator': [
    'jewelry', 'art-prints', 'candles', 'clothing', 'stickers', 'wedding', 'digital-downloads', 'pet-supplies',
  ],
};

// ─── Static pages that are always included (public, canonical only) ────────────
// Excludes: /dashboard/*, /login, /signup, /card-payment, /subscription/*,
// /ad-payment/*, /ad-dashboard, /admin/*, and any auth/payment result pages.
const STATIC_PAGES = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/services', priority: '0.8', changefreq: 'monthly' },
  { url: '/ai-tools', priority: '0.8', changefreq: 'weekly' },
  { url: '/blog', priority: '0.8', changefreq: 'weekly' },
  { url: '/about', priority: '0.8', changefreq: 'monthly' },
  { url: '/contact', priority: '0.8', changefreq: 'monthly' },
  { url: '/book-consultation', priority: '0.7', changefreq: 'monthly' },
  { url: '/portfolio', priority: '0.8', changefreq: 'monthly' },
  { url: '/pricing', priority: '0.8', changefreq: 'monthly' },
  { url: '/courses', priority: '0.8', changefreq: 'monthly' },
  { url: '/resources', priority: '0.8', changefreq: 'monthly' },
  { url: '/content-templates', priority: '0.8', changefreq: 'monthly' },
  { url: '/prompt-library', priority: '0.8', changefreq: 'monthly' },
  { url: '/website-audit', priority: '0.8', changefreq: 'monthly' },
  { url: '/video-generator', priority: '0.8', changefreq: 'monthly' },
  { url: '/website-intelligence', priority: '0.8', changefreq: 'monthly' },
  { url: '/website-cloner', priority: '0.8', changefreq: 'monthly' },
  { url: '/advertise', priority: '0.8', changefreq: 'monthly' },
  { url: '/advertisement', priority: '0.7', changefreq: 'monthly' },
  { url: '/referral', priority: '0.8', changefreq: 'monthly' },
  { url: '/30-day-plan', priority: '0.8', changefreq: 'monthly' },
  { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
  { url: '/terms-of-service', priority: '0.3', changefreq: 'yearly' },
  { url: '/cookie-policy', priority: '0.3', changefreq: 'yearly' },
  { url: '/sitemap', priority: '0.5', changefreq: 'monthly' },
];

/**
 * Generate dynamic XML sitemap content.
 * Exported so app.ts can serve it at /sitemap.xml without going through the router.
 */
export async function generateDynamicSitemap(): Promise<string> {
  const BASE = (process.env.VITE_API_URL || '').replace(/\/api\/?$/, '');

  const urls: { loc: string; lastmod?: string; changefreq: string; priority: string }[] = [];

  // Add static pages
  for (const page of STATIC_PAGES) {
    urls.push({
      loc: `${BASE}${page.url}`,
      changefreq: page.changefreq,
      priority: page.priority,
    });
  }

  // Add blog posts
  try {
    const posts = await BlogPost.find({ status: 'published' })
      .select('slug updatedAt publishedAt')
      .lean();
    for (const post of posts) {
      const p = post as Record<string, unknown>;
      urls.push({
        loc: `${BASE}/blog/${(p.slug as string) || String(p._id)}`,
        lastmod: ((p.updatedAt || p.publishedAt || new Date()) as Date).toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.8',
      });
    }
  } catch { /* skip if model unavailable */ }

  // Add AI tools
  try {
    const tools = await AITool.find({ isActive: true })
      .select('slug updatedAt')
      .lean();
    for (const tool of tools) {
      const t = tool as Record<string, unknown>;
      urls.push({
        loc: `${BASE}/tools/${t.slug as string}`,
        lastmod: ((t.updatedAt || new Date()) as Date).toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.7',
      });
    }
  } catch { /* skip */ }

  // Add services
  try {
    const services = await Service.find({ isActive: true })
      .select('slug updatedAt')
      .lean();
    for (const svc of services) {
      const s = svc as Record<string, unknown>;
      urls.push({
        loc: `${BASE}/services#${(s.slug as string) || String(s._id)}`,
        lastmod: ((s.updatedAt || new Date()) as Date).toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.7',
      });
    }
  } catch { /* skip */ }

  // Add courses
  try {
    const courses = await Course.find({ isActive: true })
      .select('slug updatedAt')
      .lean();
    for (const course of courses) {
      const c = course as Record<string, unknown>;
      urls.push({
        loc: `${BASE}/courses#${(c.slug as string) || String(c._id)}`,
        lastmod: ((c.updatedAt || new Date()) as Date).toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.6',
      });
    }
  } catch { /* skip */ }

  // Add resources
  try {
    const resources = await Resource.find({ isActive: true })
      .select('slug updatedAt')
      .lean();
    for (const resource of resources) {
      const r = resource as Record<string, unknown>;
      urls.push({
        loc: `${BASE}/resources#${(r.slug as string) || String(r._id)}`,
        lastmod: ((r.updatedAt || new Date()) as Date).toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.6',
      });
    }
  } catch { /* skip */ }

  // Build XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const entry of urls) {
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(entry.loc)}</loc>\n`;
    if (entry.lastmod) xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority}</priority>\n`;
    xml += '  </url>\n';
  }
  xml += '</urlset>';

  return xml;
}

/**
 * GET /api/sitemap.xml — Dynamic XML sitemap generation
 */
router.get('/sitemap.xml', async (_req: Request, res: Response) => {
  try {
    const xml = await generateDynamicSitemap();
    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    console.error('[SITEMAP] Error generating sitemap:', err);
    res.status(500).send('Error generating sitemap');
  }
});

/**
 * GET /api/robots.txt — Dynamic robots.txt
 */
router.get('/robots.txt', (_req: Request, res: Response) => {
  const content = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /dashboard',
    'Disallow: /login',
    'Disallow: /signup',
    'Disallow: /card-payment',
    'Disallow: /subscription-success',
    'Disallow: /subscription-cancel',
    'Disallow: /ad-payment-success',
    'Disallow: /ad-payment-cancel',
    'Disallow: /ad-dashboard',
    'Disallow: /api/',
    '',
    `Sitemap: ${BASE_URL}/sitemap.xml`,
    '',
  ].join('\n');

  res.set('Content-Type', 'text/plain');
  res.set('Cache-Control', 'public, max-age=86400');
  res.send(content);
});

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default router;
