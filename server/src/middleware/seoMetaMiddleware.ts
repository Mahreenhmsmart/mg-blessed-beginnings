/**
 * Server-side SEO meta injection middleware.
 *
 * Intercepts GET requests for public HTML pages and injects route-specific
 * <title>, meta description, OG tags, Twitter cards, canonical URLs, and
 * JSON-LD structured data directly into the HTML response. This ensures
 * crawlers that don't execute JavaScript see correct metadata in the
 * initial HTML response.
 *
 * react-helmet-async continues to manage these tags client-side after
 * hydration — Helmet replaces matching tags by attribute (name, property),
 * so there are no duplicates once JS executes.
 */

import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import BlogPost from '../models/BlogPost';
import AITool from '../models/AITool';

// ─── Constants ────────────────────────────────────────────────────────────────

const SITE_URL = 'https://mgblessed.icod.ai';
const SITE_NAME = 'MG Blessed Beginnings';
const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/1792968956320_AI_Professional_in_a_Modern_Workspace-upload.webp`;
const LOGO_URL = `${SITE_URL}/assets/icon-512.png`;

// ─── Route-to-meta mapping ────────────────────────────────────────────────────
// Mirrors client/src/seo/pageMeta.ts — keep in sync when adding new routes.

interface RouteMeta {
  title: string;
  description: string;
  keywords?: string;
  canonical: string;
  /** Schema.org @type for JSON-LD — defaults to WebPage */
  schemaType?: string;
}

const ROUTE_META: Record<string, RouteMeta> = {
  '/': {
    title: 'MG Blessed Beginnings — AI-Powered Business Growth Platform',
    description:
      'Empower your small business with AI tools, website intelligence, SEO audits, and digital marketing strategies built for entrepreneurs.',
    keywords:
      'AI tools, AI marketing, AI content creator, SEO tools, social media tools, eCommerce tools, product description generator, hashtag generator, SEO title generator, AI business tools, Shopify tools, online business tools, free AI tools, content generator, marketing automation',
    canonical: SITE_URL,
    schemaType: 'WebSite',
  },
  '/ai-tools': {
    title: 'Free AI Tools — MG Blessed Beginnings',
    description:
      '11 free AI-powered tools: hashtag generator, product descriptions, SEO optimizer, competitor analyzer, and more.',
    keywords:
      'ai tools, product description generator, seo optimizer, ecommerce tools, free ai tools, ecommerce sellers',
    canonical: `${SITE_URL}/ai-tools`,
  },
  '/services': {
    title: 'Digital Marketing Services — MG Blessed Beginnings',
    description:
      'Professional SEO audits, website cloning, content strategy, and AI-powered business growth services for entrepreneurs.',
    keywords:
      'shopify setup, ebay optimization, etsy management, e-commerce consulting, digital marketing services, AI services',
    canonical: `${SITE_URL}/services`,
  },
  '/blog': {
    title: 'Blog — AI & Business Growth Insights — MG Blessed Beginnings',
    description:
      'Expert articles on AI tools, SEO strategies, e-commerce growth, and digital marketing for small businesses.',
    keywords:
      'ecommerce blog, shopify tips, ebay selling, etsy seo, online business tips, ecommerce guides, marketing strategies',
    canonical: `${SITE_URL}/blog`,
  },
  '/pricing': {
    title: 'Pricing Plans — MG Blessed Beginnings',
    description:
      'Affordable subscription plans for AI tools, SEO audits, and business intelligence. Start free, scale as you grow.',
    keywords: 'pricing, plans, subscription, AI tools, SEO, ecommerce, free tier',
    canonical: `${SITE_URL}/pricing`,
  },
  '/contact': {
    title: 'Contact — MG Blessed Beginnings',
    description:
      "Get in touch with Mahreen Yousaf for e-commerce consulting, AI tool inquiries, and business growth strategies. We're here to help you succeed online.",
    keywords: 'contact, ecommerce consultant, get in touch, inquiry, MG Blessed Beginnings',
    canonical: `${SITE_URL}/contact`,
  },
  '/about': {
    title: 'About — MG Blessed Beginnings',
    description:
      'Learn about Mahreen Yousaf, Founder & CEO of MG Blessed Beginnings. AI & digital marketing mentor specializing in Shopify, eBay, and Etsy guidance.',
    keywords:
      'mahreen yousaf, ecommerce consultant, pakistan, shopify expert, ebay seller, ai mentor, digital marketing',
    canonical: `${SITE_URL}/about`,
  },
  '/growth-plan': {
    title: '30-Day Business Growth Plan — MG Blessed Beginnings',
    description:
      'A step-by-step 30-day plan to grow your online business with AI tools, SEO, content marketing, and social media.',
    keywords:
      'app growth plan, 30 day marketing plan, user acquisition strategy, content marketing calendar, app download strategy, growth hacking plan',
    canonical: `${SITE_URL}/30-day-plan`,
  },
  '/30-day-plan': {
    title: '30-Day Business Growth Plan — MG Blessed Beginnings',
    description:
      'A step-by-step 30-day plan to grow your online business with AI tools, SEO, content marketing, and social media.',
    keywords:
      'app growth plan, 30 day marketing plan, user acquisition strategy, content marketing calendar, app download strategy, growth hacking plan',
    canonical: `${SITE_URL}/30-day-plan`,
  },
  '/resources': {
    title: 'Resources — MG Blessed Beginnings',
    description:
      'Download free e-commerce resources including SEO checklists, listing templates, shop setup guides, and keyword research worksheets.',
    keywords:
      'free ecommerce resources, seller checklist, listing template, shopify guide, ebay template',
    canonical: `${SITE_URL}/resources`,
  },
  '/courses': {
    title: 'Courses — MG Blessed Beginnings',
    description:
      'Learn AI, SEO, and digital marketing with structured courses for entrepreneurs and small business owners.',
    keywords:
      'e-commerce courses, shopify training, ebay course, etsy tutorial, digital marketing education',
    canonical: `${SITE_URL}/courses`,
  },
  '/portfolio': {
    title: 'Portfolio — MG Blessed Beginnings',
    description:
      'See real results from businesses that grew their online presence with our AI tools and digital marketing strategies.',
    keywords:
      'portfolio, case studies, ecommerce success stories, shopify expert, ebay optimization, etsy shop launch, digital marketing',
    canonical: `${SITE_URL}/portfolio`,
  },
  '/advertise': {
    title: 'Advertise With Us — MG Blessed Beginnings',
    description:
      'Reach engaged entrepreneurs and small business owners. Banner and sidebar ad placements across our platform.',
    keywords:
      'advertise, ad placement, banner ad, sidebar ad, e-commerce advertising, digital marketing, sponsored content',
    canonical: `${SITE_URL}/advertise`,
  },
  '/advertisement': {
    title: 'Create Your Ad',
    description:
      'Reach thousands of e-commerce entrepreneurs. Purchase a premium ad placement for just $50 and get your business in front of our engaged audience.',
    keywords:
      'advertise, ad placement, banner ad, e-commerce advertising, digital marketing',
    canonical: `${SITE_URL}/advertisement`,
  },
  '/cookie-policy': {
    title: 'Cookie Policy — MG Blessed Beginnings',
    description:
      'Learn how MG Blessed Beginnings uses cookies and tracking technologies to improve your experience.',
    keywords: 'cookie policy, cookies, privacy, tracking, MG Blessed Beginnings',
    canonical: `${SITE_URL}/cookie-policy`,
  },
  '/privacy-policy': {
    title: 'Privacy Policy — MG Blessed Beginnings',
    description:
      'How we collect, use, and protect your personal information at MG Blessed Beginnings.',
    keywords: 'privacy policy, GDPR, data protection, MG Blessed Beginnings',
    canonical: `${SITE_URL}/privacy-policy`,
  },
  '/terms-of-service': {
    title: 'Terms of Service — MG Blessed Beginnings',
    description:
      'Terms and conditions for using MG Blessed Beginnings platform, tools, and services.',
    keywords: 'terms of service, terms and conditions, legal, MG Blessed Beginnings',
    canonical: `${SITE_URL}/terms-of-service`,
  },
  '/sitemap': {
    title: 'HTML Sitemap — MG Blessed Beginnings',
    description:
      'Browse all pages on MG Blessed Beginnings. Find AI tools, services, blog posts, courses, and resources for e-commerce sellers.',
    canonical: `${SITE_URL}/sitemap`,
  },
  '/content-templates': {
    title: 'Content Templates — MG Blessed Beginnings',
    description:
      'Ready-to-use content templates for social media, email marketing, blog posts, and e-commerce listings.',
    keywords:
      'AI tool content ideas, social media templates for sellers, content hooks, reel scripts, TikTok templates, e-commerce marketing',
    canonical: `${SITE_URL}/content-templates`,
  },
  '/prompt-library': {
    title: 'AI Prompt Library — MG Blessed Beginnings',
    description:
      'Curated AI prompts for business, marketing, and content creation. Copy and use them with any AI tool.',
    keywords:
      'ai prompts, chatgpt prompts, ecommerce prompts, product description prompts',
    canonical: `${SITE_URL}/prompt-library`,
  },
  '/book-consultation': {
    title: 'Book a Free Consultation — MG Blessed Beginnings',
    description:
      'Schedule a free 1-on-1 consultation to discuss your business goals and get a personalized growth strategy.',
    keywords: 'book consultation, schedule, appointment, ecommerce consulting',
    canonical: `${SITE_URL}/book-consultation`,
  },
  '/book': {
    title: 'Book a Free Consultation — MG Blessed Beginnings',
    description:
      'Schedule a free 1-on-1 consultation to discuss your business goals and get a personalized growth strategy.',
    keywords: 'book consultation, schedule, appointment, ecommerce consulting',
    canonical: `${SITE_URL}/book-consultation`,
  },
  '/website-audit': {
    title: 'Free Website SEO Audit — MG Blessed Beginnings',
    description:
      'Run a comprehensive SEO audit on any website. Get scores, issues, and actionable recommendations in minutes.',
    keywords:
      'website audit, SEO audit, security audit, accessibility check, website analysis, free SEO tool',
    canonical: `${SITE_URL}/website-audit`,
  },
  '/website-intelligence': {
    title: 'Website Intelligence — MG Blessed Beginnings',
    description:
      "Deep-dive analytics into any website's SEO, performance, and competitive positioning with AI-powered insights.",
    keywords:
      'website intelligence, competitor analysis, SEO analytics, website audit, market research, site performance',
    canonical: `${SITE_URL}/website-intelligence`,
  },
  '/website-cloner': {
    title: 'Website Cloner — MG Blessed Beginnings',
    description:
      "Clone any website's structure for research and analysis. Study competitor designs and layouts legally.",
    keywords: 'website cloner, clone website, html clone, website copy, site mirror, visual clone',
    canonical: `${SITE_URL}/website-cloner`,
  },
  '/video-generator': {
    title: 'AI Video Generator — MG Blessed Beginnings',
    description:
      'Generate AI-powered marketing videos for social media, product showcases, and brand storytelling.',
    keywords:
      'ai video generator, luma ai, dream machine, text to video, ai video, free video generator',
    canonical: `${SITE_URL}/video-generator`,
  },
  '/referral': {
    title: 'Referral Program — MG Blessed Beginnings',
    description:
      'Earn rewards by referring friends and businesses to MG Blessed Beginnings AI tools and services.',
    keywords:
      'referral program, invite friends, AI credits, earn credits, MG Blessed Beginnings, partner program',
    canonical: `${SITE_URL}/referral`,
  },
};

// ─── Routes that must NOT be indexed ──────────────────────────────────────────

const NOINDEX_PREFIXES = [
  '/login',
  '/signup',
  '/dashboard',
  '/admin',
  '/subscription/',
  '/ad-payment/',
  '/card-payment',
  '/ad-dashboard',
];

// ─── Paths that should not receive SEO injection (API, static assets) ─────────

const SKIP_PREFIXES = [
  '/api/',
  '/assets/',
  '/manifest.json',
];

// ─── Index.html cache ─────────────────────────────────────────────────────────

let cachedHtml: string | null = null;

function getIndexHtml(): string | null {
  if (cachedHtml !== null) return cachedHtml;

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const clientDist = path.resolve(__dirname, '../../../client/dist');
  const indexPath = path.join(clientDist, 'index.html');

  try {
    cachedHtml = fs.readFileSync(indexPath, 'utf-8');
    return cachedHtml;
  } catch {
    // In development the dist folder may not exist yet
    return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Remove trailing slash for canonical consistency (except root /). */
function normalizePath(urlPath: string): string {
  if (urlPath === '/') return '/';
  return urlPath.replace(/\/+$/, '');
}

/** Check if a path should be noindexed. */
function isNoIndex(urlPath: string): boolean {
  return NOINDEX_PREFIXES.some((prefix) => urlPath.startsWith(prefix));
}

/** Check if this request should skip SEO injection entirely. */
function shouldSkip(urlPath: string): boolean {
  // Skip API routes and known static asset prefixes
  if (SKIP_PREFIXES.some((prefix) => urlPath.startsWith(prefix))) return true;
  // Skip any path with a file extension (JS, CSS, images, fonts, maps, manifests)
  const lastSegment = urlPath.split('/').pop() || '';
  if (lastSegment.includes('.') && !urlPath.endsWith('/')) return true;
  return false;
}

/** Strip existing meta/title tags from index.html so we can inject fresh ones. */
function stripExistingSeoTags(html: string): string {
  // Remove existing <title>...</title>
  let result = html.replace(/<title[^>]*>.*?<\/title>/is, '');

  // Remove existing meta tags we'll replace (description, keywords, robots, og:*, twitter:*)
  result = result.replace(
    /<meta\s+(?:name|property)\s*=\s*"(?:description|keywords|robots|og:title|og:description|og:type|og:url|og:image|og:site_name|og:locale|twitter:card|twitter:title|twitter:description|twitter:image)"[^>]*>/gi,
    ''
  );

  // Remove existing canonical link
  result = result.replace(/<link\s+rel="canonical"[^>]*>/gi, '');

  return result;
}

/** Build the meta tag block for injection. */
function buildMetaTags(meta: RouteMeta, urlPath: string, noindex: boolean): string {
  const tags: string[] = [];

  // Title
  tags.push(`<title>${escapeHtml(meta.title)}</title>`);

  // Core meta
  tags.push(`<meta name="description" content="${escapeHtml(meta.description)}">`);
  if (meta.keywords) {
    tags.push(`<meta name="keywords" content="${escapeHtml(meta.keywords)}">`);
  }
  tags.push(`<meta name="robots" content="${noindex ? 'noindex, nofollow' : 'index, follow'}">`);

  // Open Graph
  tags.push(`<meta property="og:title" content="${escapeHtml(meta.title)}">`);
  tags.push(`<meta property="og:description" content="${escapeHtml(meta.description)}">`);
  tags.push(`<meta property="og:type" content="website">`);
  tags.push(`<meta property="og:url" content="${escapeHtml(meta.canonical)}">`);
  tags.push(`<meta property="og:image" content="${escapeHtml(DEFAULT_OG_IMAGE)}">`);
  tags.push(`<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}">`);
  tags.push(`<meta property="og:locale" content="en_US">`);

  // Twitter Card
  tags.push(`<meta name="twitter:card" content="summary_large_image">`);
  tags.push(`<meta name="twitter:title" content="${escapeHtml(meta.title)}">`);
  tags.push(`<meta name="twitter:description" content="${escapeHtml(meta.description)}">`);
  tags.push(`<meta name="twitter:image" content="${escapeHtml(DEFAULT_OG_IMAGE)}">`);

  // Canonical
  tags.push(`<link rel="canonical" href="${escapeHtml(meta.canonical)}">`);

  return tags.join('\n    ');
}

/** Build JSON-LD structured data for a page.
 *  Must produce semantically equivalent output to the client-side
 *  SchemaInjector + jsonLd.ts helpers. Keep in sync when modifying either. */
function buildJsonLd(meta: RouteMeta, urlPath: string): string {
  const schemaType = meta.schemaType || 'WebPage';
  const schemas: Record<string, unknown>[] = [];

  // Homepage gets Organization + WebSite schemas (matches client constants.ts)
  if (urlPath === '/') {
    schemas.push({
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: LOGO_URL,
      sameAs: [
        'https://www.linkedin.com/in/mahreenyousafdigital/',
        'https://www.instagram.com/mahreenyousafdigi/',
        'https://www.instagram.com/mgblessedbeginnings/',
        'https://www.tiktok.com/@hmsmart.ceo',
        'https://www.youtube.com/@blessedbeginnings8003',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: 'English',
      },
    });
    schemas.push({
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/ai-tools?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    });
  }

  // Always add WebPage schema for every public page (matches client webPageSchema)
  schemas.push({
    '@type': 'WebPage',
    name: meta.title,
    description: meta.description,
    url: meta.canonical,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
      },
    },
  });

  // Page-specific schema
  if (schemaType === 'SoftwareApplication') {
    schemas.push({
      '@type': 'SoftwareApplication',
      name: meta.title.replace(/ — .*$/, ''),
      url: meta.canonical,
      description: meta.description,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    });
  } else if (schemaType === 'BlogPosting') {
    // BlogPosting — only include fields with real values (no empty strings)
    const blogSchema: Record<string, unknown> = {
      '@type': 'BlogPosting',
      headline: meta.title.replace(/ — .*$/, ''),
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: LOGO_URL,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': meta.canonical,
      },
    };
    if (meta.description) {
      blogSchema.description = meta.description;
    }
    schemas.push(blogSchema);
  }

  // Use @graph when multiple schemas, single object otherwise
  const jsonLd =
    schemas.length > 1
      ? { '@context': 'https://schema.org', '@graph': schemas }
      : { '@context': 'https://schema.org', ...schemas[0] };

  return `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
}

/** Convert a slug like "listing-optimizer" to "Listing Optimizer". */
function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function seoMetaMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Only intercept GET requests for HTML pages
  if (req.method !== 'GET') return next();

  const urlPath = normalizePath(req.path);

  // Skip API routes, static assets, and non-HTML requests
  if (shouldSkip(urlPath)) return next();

  // Check Accept header — only inject for HTML requests (browsers, crawlers)
  const accept = req.headers.accept || '';
  if (!accept.includes('text/html') && !accept.includes('*/*') && accept !== '') {
    return next();
  }

  // Resolve metadata for this route
  let meta: RouteMeta | undefined = ROUTE_META[urlPath];

  // Dynamic routes: /tools/:slug
  if (!meta && urlPath.startsWith('/tools/')) {
    const segments = urlPath.split('/').filter(Boolean);
    if (segments.length === 2 && segments[0] === 'tools') {
      const slug = segments[1];
      const readableName = slugToTitle(slug);
      meta = {
        title: `${readableName} — Free AI Tool — MG Blessed Beginnings`,
        description: `Use our free ${readableName} AI tool to boost your e-commerce business. Generate optimized content in seconds.`,
        keywords: `${slug.replace(/-/g, ' ')}, ai tool, free ai tool, ecommerce tool`,
        canonical: `${SITE_URL}/tools/${slug}`,
        schemaType: 'SoftwareApplication',
      };

      // Try to enrich from database (non-blocking — fall back to generic)
      // We do an async lookup but the middleware itself stays synchronous-ish
      // by doing the DB call inline since Express supports async middleware.
    } else if (segments.length === 3 && segments[0] === 'tools') {
      // Niche pages: /tools/:toolSlug/:niche
      const toolSlug = segments[1];
      const niche = segments[2];
      const toolName = slugToTitle(toolSlug);
      const nicheName = slugToTitle(niche);
      meta = {
        title: `${nicheName} ${toolName} — MG Blessed Beginnings`,
        description: `Free ${nicheName} ${toolName} AI tool. Optimize your ${niche} listings and content with AI.`,
        keywords: `${niche.replace(/-/g, ' ')}, ${toolSlug.replace(/-/g, ' ')}, ai tool`,
        canonical: `${SITE_URL}${urlPath}`,
        schemaType: 'SoftwareApplication',
      };
    }
  }

  // Dynamic routes: /blog/:id (could be slug or ObjectId)
  if (!meta && urlPath.startsWith('/blog/')) {
    const blogId = urlPath.replace('/blog/', '');
    meta = {
      title: `Blog Post — MG Blessed Beginnings`,
      description: 'Read expert articles on AI tools, SEO strategies, and e-commerce growth.',
      canonical: `${SITE_URL}/blog/${blogId}`,
      schemaType: 'BlogPosting',
    };
  }

  // If no meta found and it's a noindex route, serve with noindex meta injected
  if (!meta) {
    if (isNoIndex(urlPath)) {
      // Inject noindex,nofollow meta so crawlers don't index private pages
      // even before JavaScript executes
      const baseHtml = getIndexHtml();
      if (baseHtml) {
        const noindexMeta: RouteMeta = {
          title: 'MG Blessed Beginnings',
          description: 'MG Blessed Beginnings — AI-Powered Business Growth Platform',
          canonical: `${SITE_URL}${urlPath}`,
        };
        const metaTags = buildMetaTags(noindexMeta, urlPath, true);
        const cleanHtml = stripExistingSeoTags(baseHtml);
        const injectedHtml = cleanHtml.replace(
          '<meta charset="UTF-8" />',
          `<meta charset="UTF-8" />\n    ${metaTags}`
        );
        res.set('Content-Type', 'text/html; charset=utf-8');
        res.send(injectedHtml);
        return;
      }
      return next();
    }
    // Unknown public route — let SPA handle it (404 page will render)
    return next();
  }

  // Load the base HTML
  const baseHtml = getIndexHtml();
  if (!baseHtml) {
    // No built index.html available (development mode) — pass through
    return next();
  }

  // For dynamic routes, try async enrichment from the database
  const needsDbEnrichment =
    (urlPath.startsWith('/tools/') && urlPath.split('/').filter(Boolean).length === 2) ||
    urlPath.startsWith('/blog/');

  if (needsDbEnrichment) {
    enrichAndServe(res, urlPath, meta, baseHtml);
    return;
  }

  // Static route — inject and send immediately
  const noindex = isNoIndex(urlPath);
  const metaTags = buildMetaTags(meta, urlPath, noindex);
  const jsonLd = buildJsonLd(meta, urlPath);

  const cleanHtml = stripExistingSeoTags(baseHtml);
  const injectedHtml = cleanHtml.replace(
    '<meta charset="UTF-8" />',
    `<meta charset="UTF-8" />\n    ${metaTags}\n    ${jsonLd}`
  );

  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(injectedHtml);
}

/** Async handler for routes that need database enrichment. */
async function enrichAndServe(
  res: Response,
  urlPath: string,
  meta: RouteMeta,
  baseHtml: string
): Promise<void> {
  try {
    // Enrich tool pages from database
    if (urlPath.startsWith('/tools/') && urlPath.split('/').filter(Boolean).length === 2) {
      const slug = urlPath.split('/').filter(Boolean)[1];
      try {
        const tool = await AITool.findOne({ slug, isActive: true })
          .select('name description category features')
          .lean();
        if (tool) {
          const t = tool as Record<string, unknown>;
          meta.title = `${t.name as string} — Free AI Tool — MG Blessed Beginnings`;
          meta.description =
            (t.description as string) ||
            `Use our free ${(t.name as string)} AI tool to boost your e-commerce business.`;
          if (t.category) {
            meta.keywords = `${(t.category as string)}, ${(t.name as string)}, ai tool, free ai tool`;
          }
        }
      } catch {
        // DB unavailable — use generic meta
      }
    }

    // Enrich blog posts from database
    if (urlPath.startsWith('/blog/')) {
      const blogId = urlPath.replace('/blog/', '');
      try {
        const post = await BlogPost.findOne({
          $or: [{ slug: blogId }, { _id: blogId }],
          status: 'published',
        })
          .select('title excerpt featuredImage publishedAt updatedAt createdAt author')
          .lean();
        if (post) {
          const p = post as Record<string, unknown>;
          meta.title = `${p.title as string} — MG Blessed Beginnings`;
          meta.description =
            (p.excerpt as string) ||
            `Read "${p.title as string}" on MG Blessed Beginnings blog.`;
        }
      } catch {
        // DB unavailable — use generic meta
      }
    }
  } catch {
    // Any error — fall through with generic meta
  }

  const noindex = isNoIndex(urlPath);
  const metaTags = buildMetaTags(meta, urlPath, noindex);
  const jsonLd = buildJsonLd(meta, urlPath);

  const cleanHtml = stripExistingSeoTags(baseHtml);
  const injectedHtml = cleanHtml.replace(
    '<meta charset="UTF-8" />',
    `<meta charset="UTF-8" />\n    ${metaTags}\n    ${jsonLd}`
  );

  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(injectedHtml);
}
