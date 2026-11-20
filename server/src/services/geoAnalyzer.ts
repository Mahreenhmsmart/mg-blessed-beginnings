/**
 * GEO Analyzer — Generative Engine Optimization checks.
 * Evaluates trust signals, citation patterns, and entity consistency for generative AI engines.
 */

import type { CrawlResult } from './crawlerService';
import type { CheckResult, LayerResults } from '../models/Audit';

const AUTHORITATIVE_DOMAINS = [
  'wikipedia.org', 'gov', 'edu', 'scholar.google', 'pubmed', 'nih.gov',
  'who.int', 'un.org', 'worldbank.org', 'nature.com', 'sciencedirect.com',
  'forbes.com', 'reuters.com', 'bloomberg.com', 'nytimes.com', 'bbc.com',
];

interface GeoCheck {
  id: string;
  name: string;
  maxPoints: number;
  evaluate: (crawl: CrawlResult) => { status: 'pass' | 'warn' | 'fail'; points: number; details: string };
}

const geoChecks: GeoCheck[] = [
  {
    id: 'geo-author-schema',
    name: 'Author/Person Schema',
    maxPoints: 15,
    evaluate: (crawl) => {
      if (crawl.hasPersonSchema) return { status: 'pass', points: 15, details: 'Person schema markup found — establishes author identity.' };
      return { status: 'fail', points: 0, details: 'No Person schema found. Add author markup to build E-E-A-T signals.' };
    },
  },
  {
    id: 'geo-organization-schema',
    name: 'Organization Schema',
    maxPoints: 15,
    evaluate: (crawl) => {
      if (crawl.hasOrganizationSchema) return { status: 'pass', points: 15, details: 'Organization/LocalBusiness schema found.' };
      return { status: 'fail', points: 0, details: 'No Organization schema found. This helps AI engines identify your brand entity.' };
    },
  },
  {
    id: 'geo-citation-patterns',
    name: 'Citation Patterns (External Links)',
    maxPoints: 15,
    evaluate: (crawl) => {
      const authoritativeLinks = crawl.externalLinks.filter((link) => {
        try {
          const domain = new URL(link).hostname.toLowerCase();
          return AUTHORITATIVE_DOMAINS.some((ad) => domain.includes(ad));
        } catch {
          return false;
        }
      });
      if (authoritativeLinks.length >= 3) {
        return { status: 'pass', points: 15, details: `${authoritativeLinks.length} links to authoritative sources found.` };
      }
      if (authoritativeLinks.length >= 1) {
        return { status: 'warn', points: 8, details: `${authoritativeLinks.length} authoritative citation(s). Add more references to trusted sources.` };
      }
      return { status: 'fail', points: 0, details: 'No citations to authoritative domains. Linking to trusted sources boosts credibility with AI engines.' };
    },
  },
  {
    id: 'geo-trust-privacy',
    name: 'Privacy Policy Link',
    maxPoints: 10,
    evaluate: (crawl) => {
      if (crawl.hasPrivacyPolicyLink) return { status: 'pass', points: 10, details: 'Privacy policy link found.' };
      return { status: 'fail', points: 0, details: 'No privacy policy link found. This is a key trust signal for AI engines.' };
    },
  },
  {
    id: 'geo-trust-about',
    name: 'About Page Link',
    maxPoints: 10,
    evaluate: (crawl) => {
      if (crawl.hasAboutLink) return { status: 'pass', points: 10, details: 'About page link found.' };
      return { status: 'fail', points: 0, details: 'No about page link found. AI engines look for transparency signals.' };
    },
  },
  {
    id: 'geo-trust-contact',
    name: 'Contact Page Link',
    maxPoints: 10,
    evaluate: (crawl) => {
      if (crawl.hasContactLink) return { status: 'pass', points: 10, details: 'Contact page link found.' };
      return { status: 'warn', points: 0, details: 'No contact page link found. Contact info builds trust with generative engines.' };
    },
  },
  {
    id: 'geo-structured-data-richness',
    name: 'Structured Data Completeness',
    maxPoints: 15,
    evaluate: (crawl) => {
      const types = crawl.structuredData.map((s) => s.type);
      const count = types.length;
      if (count >= 3) return { status: 'pass', points: 15, details: `${count} schema types found (${types.join(', ')}).` };
      if (count >= 1) return { status: 'warn', points: 8, details: `${count} schema type(s): ${types.join(', ')}. Add more for richer entity context.` };
      return { status: 'fail', points: 0, details: 'No structured data. Generative engines rely heavily on schema markup.' };
    },
  },
  {
    id: 'geo-content-substance',
    name: 'Content Substance',
    maxPoints: 10,
    evaluate: (crawl) => {
      const wordCount = crawl.visibleText.split(/\s+/).filter(Boolean).length;
      if (wordCount >= 500) return { status: 'pass', points: 10, details: `Substantial content (${wordCount} words) for generative engine extraction.` };
      if (wordCount >= 200) return { status: 'warn', points: 5, details: `Moderate content (${wordCount} words). More substance improves AI citation chances.` };
      return { status: 'fail', points: 0, details: `Thin content (${wordCount} words). Generative engines need rich source material.` };
    },
  },
];

export function analyzeGeo(crawl: CrawlResult): LayerResults {
  const checks: CheckResult[] = [];
  let totalPoints = 0;
  let maxScore = 0;

  for (const check of geoChecks) {
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
