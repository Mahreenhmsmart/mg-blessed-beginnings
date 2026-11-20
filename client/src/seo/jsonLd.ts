/**
 * JSON-LD schema helpers for structured data injection.
 * Each function returns a plain object ready to be serialized into a <script type="application/ld+json"> tag.
 *
 * IMPORTANT: The server-side buildJsonLd in seoMetaMiddleware.ts must produce
 * semantically equivalent output for the same route. Keep both in sync.
 */

import { ORGANIZATION_SCHEMA, WEBSITE_SCHEMA, SITE_URL, SITE_NAME, LOGO_URL } from './constants';

/** Organization schema — singleton from constants. Homepage only. */
export function organizationSchema() {
  return ORGANIZATION_SCHEMA;
}

/** WebSite schema — singleton from constants. Homepage only. */
export function websiteSchema() {
  return WEBSITE_SCHEMA;
}

/** WebPage schema (schema.org/WebPage) for generic pages (about, contact, services, etc.). */
export function webPageSchema(page: {
  title: string;
  description: string;
  url: string;
  lastReviewed?: string | Date;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: page.url.startsWith('http') ? page.url : `${SITE_URL}${page.url}`,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
      },
    },
    ...(page.lastReviewed
      ? { lastReviewed: new Date(page.lastReviewed).toISOString() }
      : {}),
  };
}

/** FAQPage schema (schema.org/FAQPage). */
export function faqPageSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/** BreadcrumbList schema (schema.org/BreadcrumbList). */
export function breadcrumbListSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/** SoftwareApplication schema (schema.org/SoftwareApplication) for AI tool pages. */
export function softwareApplicationSchema(tool: {
  name: string;
  slug: string;
  description: string;
  category: string;
  features?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    url: `${SITE_URL}/tools/${tool.slug}`,
    description: tool.description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    ...(tool.features && tool.features.length > 0
      ? { featureList: tool.features.join(', ') }
      : {}),
  };
}

/** BlogPosting schema (schema.org/BlogPosting).
 *  Optional fields are omitted entirely when data is not available —
 *  empty strings in JSON-LD are worse than absent fields. */
export function blogPostingSchema(post: {
  title: string;
  excerpt?: string;
  featuredImage?: string;
  publishedAt?: string | Date;
  updatedAt?: string | Date;
  author?: string;
  category?: string;
  tags?: string[];
  slug?: string;
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
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
      '@id': `${SITE_URL}/blog/${post.slug || ''}`,
    },
  };

  // Only include optional fields when they have real values
  if (post.excerpt) {
    schema.description = post.excerpt;
  }
  if (post.featuredImage) {
    schema.image = post.featuredImage.startsWith('http')
      ? post.featuredImage
      : `${SITE_URL}${post.featuredImage}`;
  }
  if (post.publishedAt) {
    schema.datePublished = new Date(post.publishedAt).toISOString();
  }
  if (post.updatedAt) {
    schema.dateModified = new Date(post.updatedAt).toISOString();
  }
  if (post.author) {
    schema.author = {
      '@type': 'Person',
      name: post.author,
    };
  }
  if (post.category) {
    schema.articleSection = post.category;
  }
  if (post.tags && post.tags.length > 0) {
    schema.keywords = post.tags.join(', ');
  }

  return schema;
}
