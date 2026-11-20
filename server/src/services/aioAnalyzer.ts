/**
 * AIO Analyzer — AI Optimization checks.
 * Evaluates entity markup, machine-readable patterns, and brand identity for AI systems.
 */

import type { CrawlResult } from './crawlerService';
import type { CheckResult, LayerResults } from '../models/Audit';

interface AioCheck {
  id: string;
  name: string;
  maxPoints: number;
  evaluate: (crawl: CrawlResult) => { status: 'pass' | 'warn' | 'fail'; points: number; details: string };
}

const aioChecks: AioCheck[] = [
  {
    id: 'aio-entity-markup',
    name: 'Entity Markup Consistency',
    maxPoints: 15,
    evaluate: (crawl) => {
      const types = crawl.structuredData.map((s) => s.type.toLowerCase());
      const hasOrg = types.some((t) => t.includes('organization') || t.includes('localbusiness'));
      const hasPerson = types.some((t) => t.includes('person'));
      const hasProduct = types.some((t) => t.includes('product') || t.includes('service'));
      const count = [hasOrg, hasPerson, hasProduct].filter(Boolean).length;
      if (count >= 2) return { status: 'pass', points: 15, details: `${count} entity types defined in structured data.` };
      if (count === 1) return { status: 'warn', points: 8, details: 'Only 1 entity type in schema. Add more entity types for richer AI understanding.' };
      return { status: 'fail', points: 0, details: 'No entity markup found. AI systems need clear entity definitions.' };
    },
  },
  {
    id: 'aio-schema-completeness',
    name: 'Structured Data Completeness',
    maxPoints: 15,
    evaluate: (crawl) => {
      const items = crawl.structuredData;
      if (items.length === 0) return { status: 'fail', points: 0, details: 'No structured data found. AI systems rely on schema for entity understanding.' };
      // Check for key properties in first item
      const first = items[0];
      const hasName = !!first.raw.name;
      const hasDescription = !!first.raw.description;
      const hasUrl = !!first.raw.url || !!first.raw['@id'];
      const propsCount = [hasName, hasDescription, hasUrl].filter(Boolean).length;
      if (propsCount >= 3 && items.length >= 2) {
        return { status: 'pass', points: 15, details: `${items.length} schema items with complete properties.` };
      }
      if (propsCount >= 2) {
        return { status: 'warn', points: 8, details: 'Schema exists but missing some key properties (name, description, url).' };
      }
      return { status: 'warn', points: 4, details: 'Schema found but lacks essential properties for AI consumption.' };
    },
  },
  {
    id: 'aio-machine-readable',
    name: 'Machine-Readable Content Patterns',
    maxPoints: 15,
    evaluate: (crawl) => {
      const signals = [
        crawl.tableCount > 0,
        crawl.listCount > 0,
        crawl.definitionListCount > 0,
        crawl.hasFaqSchema,
        crawl.structuredData.length > 0,
      ];
      const active = signals.filter(Boolean).length;
      if (active >= 4) return { status: 'pass', points: 15, details: `${active}/5 machine-readable patterns detected.` };
      if (active >= 2) return { status: 'warn', points: 8, details: `${active}/5 machine-readable patterns. Add tables, lists, or schema.` };
      return { status: 'fail', points: 0, details: 'Few machine-readable patterns. AI prefers structured over unstructured content.' };
    },
  },
  {
    id: 'aio-factual-claims',
    name: 'Factual Claim Patterns',
    maxPoints: 15,
    evaluate: (crawl) => {
      // Check for numbers, dates, statistics in content
      const text = crawl.visibleText;
      const hasNumbers = /\d+[\.,]?\d*\s*(%|percent|million|billion|thousand)/i.test(text);
      const hasDates = /\b(20\d{2}|january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(text);
      const hasCitations = crawl.externalLinks.length > 0;
      const count = [hasNumbers, hasDates, hasCitations].filter(Boolean).length;
      if (count >= 3) return { status: 'pass', points: 15, details: 'Content includes factual claims with numbers, dates, and citations.' };
      if (count >= 1) return { status: 'warn', points: 8, details: 'Some factual patterns detected. Add more data points and citations.' };
      return { status: 'warn', points: 0, details: 'No clear factual claims detected. AI engines prefer verifiable, data-backed content.' };
    },
  },
  {
    id: 'aio-brand-identity',
    name: 'Brand Identity Signals',
    maxPoints: 15,
    evaluate: (crawl) => {
      const signals = [
        crawl.hasOrganizationSchema,
        crawl.hasLogoSchema,
        crawl.title !== null,
        Object.keys(crawl.ogTags).length > 0,
      ];
      const active = signals.filter(Boolean).length;
      if (active >= 3) return { status: 'pass', points: 15, details: `${active}/4 brand identity signals present.` };
      if (active >= 2) return { status: 'warn', points: 8, details: `${active}/4 brand signals. Add organization schema, logo, or OG tags.` };
      return { status: 'fail', points: 0, details: 'Weak brand identity signals. AI needs clear brand entity recognition.' };
    },
  },
  {
    id: 'aio-topic-coherence',
    name: 'Topic Coherence',
    maxPoints: 15,
    evaluate: (crawl) => {
      const headingCount = crawl.headings.length;
      const paragraphCount = crawl.paragraphCount;
      const wordCount = crawl.visibleText.split(/\s+/).filter(Boolean).length;
      if (headingCount >= 3 && paragraphCount >= 3 && wordCount >= 300) {
        return { status: 'pass', points: 15, details: `Well-structured content: ${headingCount} headings, ${paragraphCount} paragraphs, ${wordCount} words.` };
      }
      if (headingCount >= 2 && wordCount >= 150) {
        return { status: 'warn', points: 8, details: 'Moderate structure. Add more headings and content depth for topic authority.' };
      }
      return { status: 'fail', points: 0, details: 'Poor topic coherence. Insufficient headings or content to establish topical relevance.' };
    },
  },
  {
    id: 'aio-og-tags',
    name: 'Open Graph Tags',
    maxPoints: 10,
    evaluate: (crawl) => {
      const keys = Object.keys(crawl.ogTags);
      if (keys.length >= 4) return { status: 'pass', points: 10, details: `${keys.length} OG tags found (${keys.join(', ')}).` };
      if (keys.length >= 1) return { status: 'warn', points: 5, details: `${keys.length} OG tag(s). Add og:title, og:description, og:image, og:type.` };
      return { status: 'fail', points: 0, details: 'No Open Graph tags found. OG tags help AI systems understand page context.' };
    },
  },
];

export function analyzeAio(crawl: CrawlResult): LayerResults {
  const checks: CheckResult[] = [];
  let totalPoints = 0;
  let maxScore = 0;

  for (const check of aioChecks) {
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
