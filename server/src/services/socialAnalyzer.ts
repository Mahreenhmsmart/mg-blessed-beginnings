/**
 * Social Analyzer — Deterministic checks for social media metadata and sharing optimization.
 * Checks Open Graph tags, Twitter Card tags, favicon presence, and social sharing completeness.
 */

import type { CrawlResult } from './crawlerService';
import type { CheckResult, LayerResults } from '../models/Audit';

interface SocialCheck {
  id: string;
  name: string;
  maxPoints: number;
  evaluate: (crawl: CrawlResult) => { status: 'pass' | 'warn' | 'fail'; points: number; details: string };
}

const socialChecks: SocialCheck[] = [
  {
    id: 'social-og-title',
    name: 'Open Graph Title',
    maxPoints: 8,
    evaluate: (crawl) => {
      const ogTitle = crawl.ogTags['title'];
      if (ogTitle && ogTitle.trim().length > 0) return { status: 'pass', points: 8, details: `OG title set: "${ogTitle.substring(0, 60)}${ogTitle.length > 60 ? '...' : ''}"` };
      return { status: 'fail', points: 0, details: 'Missing og:title tag. Social platforms will use a fallback title which may not be descriptive.' };
    },
  },
  {
    id: 'social-og-description',
    name: 'Open Graph Description',
    maxPoints: 8,
    evaluate: (crawl) => {
      const ogDesc = crawl.ogTags['description'];
      if (ogDesc && ogDesc.trim().length > 0) return { status: 'pass', points: 8, details: `OG description set (${ogDesc.length} chars).` };
      return { status: 'fail', points: 0, details: 'Missing og:description tag. Social shares will lack a compelling preview description.' };
    },
  },
  {
    id: 'social-og-image',
    name: 'Open Graph Image',
    maxPoints: 12,
    evaluate: (crawl) => {
      const ogImage = crawl.ogTags['image'];
      if (ogImage && ogImage.trim().length > 0) {
        // Check if image URL is absolute
        const isAbsolute = ogImage.startsWith('http://') || ogImage.startsWith('https://');
        if (isAbsolute) return { status: 'pass', points: 12, details: `OG image set with absolute URL. Recommended size: 1200x630px.` };
        return { status: 'warn', points: 6, details: `OG image uses relative URL ("${ogImage}"). Use an absolute URL for reliable cross-platform display.` };
      }
      return { status: 'fail', points: 0, details: 'Missing og:image tag. Social shares will have no preview image, reducing engagement significantly.' };
    },
  },
  {
    id: 'social-og-url',
    name: 'Open Graph URL',
    maxPoints: 6,
    evaluate: (crawl) => {
      const ogUrl = crawl.ogTags['url'];
      if (ogUrl && ogUrl.trim().length > 0) return { status: 'pass', points: 6, details: `OG URL set: ${ogUrl}` };
      return { status: 'warn', points: 0, details: 'Missing og:url tag. Set this to the canonical URL of the page for proper link attribution.' };
    },
  },
  {
    id: 'social-og-type',
    name: 'Open Graph Type',
    maxPoints: 4,
    evaluate: (crawl) => {
      const ogType = crawl.ogTags['type'];
      if (ogType && ogType.trim().length > 0) return { status: 'pass', points: 4, details: `OG type set: "${ogType}".` };
      return { status: 'warn', points: 0, details: 'Missing og:type tag. Specify content type (website, article, product) for proper categorization.' };
    },
  },
  {
    id: 'social-twitter-card',
    name: 'Twitter Card Type',
    maxPoints: 8,
    evaluate: (crawl) => {
      const html = crawl.html;
      const twitterCard = extractMetaContent(html, 'twitter:card');
      if (twitterCard) return { status: 'pass', points: 8, details: `Twitter card type set: "${twitterCard}".` };
      return { status: 'fail', points: 0, details: 'Missing twitter:card meta tag. Twitter/X will show a basic link preview instead of a rich card.' };
    },
  },
  {
    id: 'social-twitter-title',
    name: 'Twitter Card Title',
    maxPoints: 6,
    evaluate: (crawl) => {
      const html = crawl.html;
      const twitterTitle = extractMetaContent(html, 'twitter:title');
      if (twitterTitle && twitterTitle.trim().length > 0) return { status: 'pass', points: 6, details: `Twitter title set: "${twitterTitle.substring(0, 60)}"` };
      // Falls back to og:title
      if (crawl.ogTags['title']) return { status: 'warn', points: 3, details: 'No twitter:title, but og:title exists as fallback. Add twitter:title for optimal control.' };
      return { status: 'fail', points: 0, details: 'Missing twitter:title and og:title. Twitter cards will have no title.' };
    },
  },
  {
    id: 'social-twitter-description',
    name: 'Twitter Card Description',
    maxPoints: 6,
    evaluate: (crawl) => {
      const html = crawl.html;
      const twitterDesc = extractMetaContent(html, 'twitter:description');
      if (twitterDesc && twitterDesc.trim().length > 0) return { status: 'pass', points: 6, details: `Twitter description set (${twitterDesc.length} chars).` };
      if (crawl.ogTags['description']) return { status: 'warn', points: 3, details: 'No twitter:description, but og:description exists as fallback.' };
      return { status: 'fail', points: 0, details: 'Missing twitter:description and og:description. Twitter cards will have no description text.' };
    },
  },
  {
    id: 'social-twitter-image',
    name: 'Twitter Card Image',
    maxPoints: 8,
    evaluate: (crawl) => {
      const html = crawl.html;
      const twitterImage = extractMetaContent(html, 'twitter:image');
      if (twitterImage && twitterImage.trim().length > 0) return { status: 'pass', points: 8, details: 'Twitter image is set. Ensure it meets recommended dimensions (1200x628px).' };
      if (crawl.ogTags['image']) return { status: 'warn', points: 4, details: 'No twitter:image, but og:image exists as fallback. Add twitter:image for platform-specific optimization.' };
      return { status: 'fail', points: 0, details: 'Missing twitter:image and og:image. Twitter cards will have no preview image.' };
    },
  },
  {
    id: 'social-favicon',
    name: 'Favicon Presence',
    maxPoints: 8,
    evaluate: (crawl) => {
      const html = crawl.html.toLowerCase();
      const hasFavicon = html.includes('rel="icon"') ||
        html.includes("rel='icon'") ||
        html.includes('rel="shortcut icon"') ||
        html.includes("rel='shortcut icon'") ||
        html.includes('rel="apple-touch-icon"') ||
        html.includes("rel='apple-touch-icon'");

      if (hasFavicon) return { status: 'pass', points: 8, details: 'Favicon is configured. The site will display a branded icon in browser tabs and bookmarks.' };
      return { status: 'warn', points: 0, details: 'No favicon detected. Add a <link rel="icon"> tag for brand recognition in browser tabs and social previews.' };
    },
  },
  {
    id: 'social-metadata-completeness',
    name: 'Social Metadata Completeness',
    maxPoints: 10,
    evaluate: (crawl) => {
      const html = crawl.html;
      const requiredTags = [
        { name: 'og:title', present: !!crawl.ogTags['title'] },
        { name: 'og:description', present: !!crawl.ogTags['description'] },
        { name: 'og:image', present: !!crawl.ogTags['image'] },
        { name: 'og:url', present: !!crawl.ogTags['url'] },
        { name: 'og:type', present: !!crawl.ogTags['type'] },
        { name: 'twitter:card', present: !!extractMetaContent(html, 'twitter:card') },
        { name: 'twitter:title', present: !!extractMetaContent(html, 'twitter:title') },
        { name: 'twitter:description', present: !!extractMetaContent(html, 'twitter:description') },
        { name: 'twitter:image', present: !!extractMetaContent(html, 'twitter:image') },
      ];

      const presentCount = requiredTags.filter((t) => t.present).length;
      const total = requiredTags.length;
      const pct = Math.round((presentCount / total) * 100);
      const missing = requiredTags.filter((t) => !t.present).map((t) => t.name);

      if (pct >= 90) return { status: 'pass', points: 10, details: `${presentCount}/${total} social meta tags present (${pct}% complete). Excellent social readiness.` };
      if (pct >= 60) return { status: 'warn', points: 5, details: `${presentCount}/${total} social meta tags present. Missing: ${missing.slice(0, 4).join(', ')}.` };
      return { status: 'fail', points: 0, details: `Only ${presentCount}/${total} social meta tags present. Missing: ${missing.join(', ')}.` };
    },
  },
  {
    id: 'social-canonical-consistency',
    name: 'Canonical & OG URL Consistency',
    maxPoints: 6,
    evaluate: (crawl) => {
      const canonical = crawl.canonicalUrl;
      const ogUrl = crawl.ogTags['url'];

      if (!canonical && !ogUrl) return { status: 'warn', points: 0, details: 'Neither canonical nor og:url are set. Both should point to the same preferred URL.' };
      if (canonical && ogUrl) {
        if (canonical === ogUrl) return { status: 'pass', points: 6, details: 'Canonical URL and og:url are consistent.' };
        return { status: 'warn', points: 3, details: `Canonical (${canonical}) and og:url (${ogUrl}) differ. They should match for consistent link attribution.` };
      }
      return { status: 'warn', points: 3, details: 'Only one of canonical/og:url is set. Set both to the same URL for consistency.' };
    },
  },
];

/** Helper to extract meta content by name attribute */
function extractMetaContent(html: string, name: string): string | null {
  const regex = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`,
    'i',
  );
  const match = html.match(regex);
  if (match) return match[1];
  // Try reversed attribute order
  const regex2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${name}["']`,
    'i',
  );
  const match2 = html.match(regex2);
  return match2 ? match2[1] : null;
}

export function analyzeSocial(crawl: CrawlResult): LayerResults {
  const checks: CheckResult[] = [];
  let totalPoints = 0;
  let maxScore = 0;

  for (const check of socialChecks) {
    const result = check.evaluate(crawl);
    checks.push({
      id: check.id,
      name: check.name,
      status: result.status,
      points: result.points,
      maxPoints: check.maxPoints,
      details: result.details,
    });
    totalPoints += result.points;
    maxScore += check.maxPoints;
  }

  const score = maxScore > 0 ? Math.round((totalPoints / maxScore) * 100) : 0;

  return { checks, score, maxScore: 100 };
}
