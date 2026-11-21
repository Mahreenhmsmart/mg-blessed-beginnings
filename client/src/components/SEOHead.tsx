import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/seo/constants';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonicalUrl?: string;
  noindex?: boolean;
  structuredData?: unknown;
  breadcrumbs?: { name: string; url: string }[];
}

/**
 * SEOHead — DISABLED.
 *
 * This component previously managed <title>, meta tags, OG/Twitter cards, and
 * canonical URL via react-helmet-async. It has been disabled to prevent meta
 * tag overwrites, duplicate <meta name="description"> tags, and homepage tab
 * title reversion caused by competing with the useSeo() imperative hook.
 *
 * All runtime SEO tag management is now handled exclusively by useSeo() in
 * Seo.tsx. Static tags for the homepage remain in index.html.
 *
 * JSON-LD structured data was never rendered here — use SchemaInjector from
 * @/seo for all JSON-LD output.
 */
export default function SEOHead(_props: SEOHeadProps) {
  // Intentionally returns null — SEO tags are managed by useSeo() and
  // static index.html to prevent duplicate/overwritten meta tags.
  return null;
}
