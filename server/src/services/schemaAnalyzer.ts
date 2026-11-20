/**
 * Schema Analyzer — Detects and validates structured data (JSON-LD) on a page.
 * Checks for Organization, WebSite, Breadcrumb, Article, Product, FAQ,
 * LocalBusiness, Person, and Service schemas. Reports Found/Missing/Invalid.
 */

import type { CrawlResult } from './crawlerService';
import type { CheckResult, LayerResults } from '../models/Audit';

interface SchemaCheck {
  id: string;
  name: string;
  schemaType: string;
  maxPoints: number;
  /** Returns 'found', 'missing', or 'invalid' plus details */
  evaluate: (crawl: CrawlResult) => { status: 'pass' | 'warn' | 'fail'; points: number; details: string };
}

function findSchemaByType(crawl: CrawlResult, type: string): Record<string, unknown> | null {
  const lower = type.toLowerCase();
  for (const sd of crawl.structuredData) {
    if (sd.type.toLowerCase() === lower) return sd.raw;
  }
  // Check @graph items
  for (const sd of crawl.structuredData) {
    if (sd.type.toLowerCase() === '@graph') {
      const graph = sd.raw['@graph'];
      if (Array.isArray(graph)) {
        for (const item of graph) {
          if (typeof item === 'object' && item !== null && (item as Record<string, unknown>)['@type']) {
            const itemType = String((item as Record<string, unknown>)['@type']).toLowerCase();
            if (itemType === lower) return item as Record<string, unknown>;
          }
        }
      }
    }
  }
  return null;
}

function hasRequiredField(raw: Record<string, unknown>, field: string): boolean {
  const val = raw[field];
  if (!val) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === 'object') return Object.keys(val).length > 0;
  return true;
}

const schemaChecks: SchemaCheck[] = [
  {
    id: 'schema-organization',
    name: 'Organization Schema',
    schemaType: 'Organization',
    maxPoints: 15,
    evaluate: (crawl) => {
      const raw = findSchemaByType(crawl, 'Organization');
      if (!raw) return { status: 'fail', points: 0, details: 'Status: Missing. Add Organization JSON-LD with name, url, and logo.' };
      const hasName = hasRequiredField(raw, 'name');
      const hasUrl = hasRequiredField(raw, 'url');
      if (hasName && hasUrl) return { status: 'pass', points: 15, details: `Status: Found. Organization "${String(raw.name)}" with URL defined.` };
      return { status: 'warn', points: 5, details: 'Status: Invalid. Organization schema is missing required fields (name, url).' };
    },
  },
  {
    id: 'schema-website',
    name: 'WebSite Schema',
    schemaType: 'WebSite',
    maxPoints: 10,
    evaluate: (crawl) => {
      const raw = findSchemaByType(crawl, 'WebSite');
      if (!raw) return { status: 'fail', points: 0, details: 'Status: Missing. Add WebSite JSON-LD with name and url for sitelinks search box.' };
      const hasName = hasRequiredField(raw, 'name');
      const hasUrl = hasRequiredField(raw, 'url');
      if (hasName && hasUrl) return { status: 'pass', points: 10, details: `Status: Found. WebSite "${String(raw.name)}" properly configured.` };
      return { status: 'warn', points: 4, details: 'Status: Invalid. WebSite schema is missing name or url.' };
    },
  },
  {
    id: 'schema-breadcrumb',
    name: 'Breadcrumb Schema',
    schemaType: 'BreadcrumbList',
    maxPoints: 10,
    evaluate: (crawl) => {
      const raw = findSchemaByType(crawl, 'BreadcrumbList');
      if (!raw) return { status: 'fail', points: 0, details: 'Status: Missing. Add BreadcrumbList JSON-LD for better navigation understanding.' };
      const items = raw.itemListElement;
      if (Array.isArray(items) && items.length >= 2) return { status: 'pass', points: 10, details: `Status: Found. ${items.length} breadcrumb items detected.` };
      return { status: 'warn', points: 4, details: 'Status: Invalid. BreadcrumbList needs at least 2 itemListElement entries.' };
    },
  },
  {
    id: 'schema-article',
    name: 'Article Schema',
    schemaType: 'Article',
    maxPoints: 12,
    evaluate: (crawl) => {
      // Also check BlogPosting and NewsArticle subtypes
      let raw = findSchemaByType(crawl, 'Article');
      if (!raw) raw = findSchemaByType(crawl, 'BlogPosting');
      if (!raw) raw = findSchemaByType(crawl, 'NewsArticle');
      if (!raw) return { status: 'fail', points: 0, details: 'Status: Missing. Add Article/BlogPosting JSON-LD for content pages.' };
      const hasHeadline = hasRequiredField(raw, 'headline');
      const hasAuthor = hasRequiredField(raw, 'author');
      if (hasHeadline && hasAuthor) return { status: 'pass', points: 12, details: `Status: Found. Article schema with headline and author defined.` };
      if (hasHeadline || hasAuthor) return { status: 'warn', points: 6, details: 'Status: Invalid. Article schema is missing headline or author.' };
      return { status: 'warn', points: 3, details: 'Status: Invalid. Article schema exists but is incomplete.' };
    },
  },
  {
    id: 'schema-product',
    name: 'Product Schema',
    schemaType: 'Product',
    maxPoints: 12,
    evaluate: (crawl) => {
      const raw = findSchemaByType(crawl, 'Product');
      if (!raw) return { status: 'fail', points: 0, details: 'Status: Missing. Add Product JSON-LD if this page features a product/service.' };
      const hasName = hasRequiredField(raw, 'name');
      const hasPrice = hasRequiredField(raw, 'offers') || hasRequiredField(raw, 'price');
      if (hasName && hasPrice) return { status: 'pass', points: 12, details: `Status: Found. Product "${String(raw.name)}" with pricing info.` };
      if (hasName) return { status: 'warn', points: 6, details: 'Status: Invalid. Product schema is missing offers/price information.' };
      return { status: 'warn', points: 3, details: 'Status: Invalid. Product schema exists but is incomplete.' };
    },
  },
  {
    id: 'schema-faq',
    name: 'FAQ Schema',
    schemaType: 'FAQPage',
    maxPoints: 12,
    evaluate: (crawl) => {
      const raw = findSchemaByType(crawl, 'FAQPage');
      if (!raw) return { status: 'fail', points: 0, details: 'Status: Missing. Add FAQPage JSON-LD for pages with Q&A content.' };
      const entities = raw.mainEntity;
      if (Array.isArray(entities) && entities.length >= 2) return { status: 'pass', points: 12, details: `Status: Found. ${entities.length} FAQ entries detected.` };
      if (Array.isArray(entities) && entities.length === 1) return { status: 'warn', points: 6, details: 'Status: Found. Only 1 FAQ entry — add more for better coverage.' };
      return { status: 'warn', points: 3, details: 'Status: Invalid. FAQPage schema exists but has no mainEntity entries.' };
    },
  },
  {
    id: 'schema-localbusiness',
    name: 'LocalBusiness Schema',
    schemaType: 'LocalBusiness',
    maxPoints: 10,
    evaluate: (crawl) => {
      const raw = findSchemaByType(crawl, 'LocalBusiness');
      if (!raw) return { status: 'fail', points: 0, details: 'Status: Missing. Add LocalBusiness JSON-LD if you have a physical location.' };
      const hasName = hasRequiredField(raw, 'name');
      const hasAddress = hasRequiredField(raw, 'address');
      if (hasName && hasAddress) return { status: 'pass', points: 10, details: `Status: Found. LocalBusiness "${String(raw.name)}" with address.` };
      return { status: 'warn', points: 4, details: 'Status: Invalid. LocalBusiness schema is missing name or address.' };
    },
  },
  {
    id: 'schema-person',
    name: 'Person Schema',
    schemaType: 'Person',
    maxPoints: 9,
    evaluate: (crawl) => {
      const raw = findSchemaByType(crawl, 'Person');
      if (!raw) return { status: 'fail', points: 0, details: 'Status: Missing. Add Person JSON-LD for author/team pages.' };
      const hasName = hasRequiredField(raw, 'name');
      if (hasName) return { status: 'pass', points: 9, details: `Status: Found. Person "${String(raw.name)}" defined.` };
      return { status: 'warn', points: 3, details: 'Status: Invalid. Person schema exists but is missing name.' };
    },
  },
  {
    id: 'schema-service',
    name: 'Service Schema',
    schemaType: 'Service',
    maxPoints: 10,
    evaluate: (crawl) => {
      const raw = findSchemaByType(crawl, 'Service');
      if (!raw) return { status: 'fail', points: 0, details: 'Status: Missing. Add Service JSON-LD for service-oriented pages.' };
      const hasName = hasRequiredField(raw, 'name');
      const hasProvider = hasRequiredField(raw, 'provider');
      if (hasName && hasProvider) return { status: 'pass', points: 10, details: `Status: Found. Service "${String(raw.name)}" with provider info.` };
      if (hasName) return { status: 'warn', points: 5, details: 'Status: Invalid. Service schema is missing provider information.' };
      return { status: 'warn', points: 3, details: 'Status: Invalid. Service schema exists but is incomplete.' };
    },
  },
];

export function analyzeSchema(crawl: CrawlResult): LayerResults {
  const checks: CheckResult[] = [];
  let totalPoints = 0;
  let maxScore = 0;

  for (const check of schemaChecks) {
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
