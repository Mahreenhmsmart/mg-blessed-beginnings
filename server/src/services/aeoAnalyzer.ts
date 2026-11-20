/**
 * AEO Analyzer — Answer Engine Optimization & AI Search Readiness checks.
 * Evaluates how well a page is structured for answer engines (featured snippets, voice search)
 * and AI search platforms (ChatGPT, Perplexity, Gemini, Google SGE).
 */

import type { CrawlResult } from './crawlerService';
import type { CheckResult, LayerResults } from '../models/Audit';

interface AeoCheck {
  id: string;
  name: string;
  maxPoints: number;
  evaluate: (crawl: CrawlResult) => { status: 'pass' | 'warn' | 'fail'; points: number; details: string };
}

const aeoChecks: AeoCheck[] = [
  // ── Original AEO checks ──────────────────────────────────────────────────
  {
    id: 'aeo-faq-schema',
    name: 'FAQ Schema Markup',
    maxPoints: 10,
    evaluate: (crawl) => {
      if (crawl.hasFaqSchema) return { status: 'pass', points: 10, details: 'FAQ schema markup detected.' };
      return { status: 'fail', points: 0, details: 'No FAQ schema found. Adding FAQPage schema helps appear in featured snippets.' };
    },
  },
  {
    id: 'aeo-question-headings',
    name: 'Question-Based Headings',
    maxPoints: 10,
    evaluate: (crawl) => {
      const count = crawl.questionHeadings.length;
      if (count >= 3) return { status: 'pass', points: 10, details: `${count} question-based headings found (H2/H3).` };
      if (count >= 1) return { status: 'warn', points: 5, details: `${count} question heading(s) found. Aim for 3+ to improve answer targeting.` };
      return { status: 'fail', points: 0, details: 'No question-based headings found. Use questions as H2/H3 to target answer boxes.' };
    },
  },
  {
    id: 'aeo-short-answers',
    name: 'Concise Answer Paragraphs',
    maxPoints: 10,
    evaluate: (crawl) => {
      const count = crawl.shortAnswerParagraphs;
      if (count >= 5) return { status: 'pass', points: 10, details: `${count} concise paragraphs (<20 words) found — good for featured snippets.` };
      if (count >= 2) return { status: 'warn', points: 5, details: `${count} concise paragraph(s) found. Add more short, direct answers near headings.` };
      return { status: 'fail', points: 0, details: 'Few or no concise answer paragraphs. Answer engines prefer short, direct responses.' };
    },
  },
  {
    id: 'aeo-definition-lists',
    name: 'Definition Lists',
    maxPoints: 5,
    evaluate: (crawl) => {
      if (crawl.definitionListCount >= 2) return { status: 'pass', points: 5, details: `${crawl.definitionListCount} definition lists found.` };
      if (crawl.definitionListCount === 1) return { status: 'warn', points: 3, details: 'Only 1 definition list found. Use <dl> for term definitions.' };
      return { status: 'warn', points: 0, details: 'No definition lists found. Use <dl>/<dt>/<dd> for definitions and glossaries.' };
    },
  },
  {
    id: 'aeo-tables',
    name: 'Table Usage',
    maxPoints: 5,
    evaluate: (crawl) => {
      if (crawl.tableCount >= 2) return { status: 'pass', points: 5, details: `${crawl.tableCount} tables found for structured data presentation.` };
      if (crawl.tableCount === 1) return { status: 'warn', points: 3, details: '1 table found. Tables help answer engines extract structured comparisons.' };
      return { status: 'warn', points: 0, details: 'No tables found. Use tables for comparisons, specs, and structured data.' };
    },
  },
  {
    id: 'aeo-lists',
    name: 'Ordered/Unordered Lists',
    maxPoints: 5,
    evaluate: (crawl) => {
      if (crawl.listCount >= 3) return { status: 'pass', points: 5, details: `${crawl.listCount} lists found for step-by-step or enumerated content.` };
      if (crawl.listCount >= 1) return { status: 'warn', points: 3, details: `${crawl.listCount} list(s) found. Lists are preferred for how-to and enumeration content.` };
      return { status: 'warn', points: 0, details: 'No lists found. Use <ol>/<ul> for steps, features, and enumerations.' };
    },
  },
  {
    id: 'aeo-content-depth',
    name: 'Content Depth for Answers',
    maxPoints: 5,
    evaluate: (crawl) => {
      const wordCount = crawl.visibleText.split(/\s+/).filter(Boolean).length;
      if (wordCount >= 600) return { status: 'pass', points: 5, details: `Substantial content (${wordCount} words) provides enough context for answer extraction.` };
      if (wordCount >= 300) return { status: 'warn', points: 3, details: `Moderate content (${wordCount} words). More depth improves answer engine coverage.` };
      return { status: 'fail', points: 0, details: `Thin content (${wordCount} words). Answer engines need sufficient context.` };
    },
  },
  {
    id: 'aeo-structured-data-richness',
    name: 'Structured Data Richness',
    maxPoints: 5,
    evaluate: (crawl) => {
      const count = crawl.structuredData.length;
      if (count >= 3) return { status: 'pass', points: 5, details: `${count} structured data items found — rich machine-readable context.` };
      if (count >= 1) return { status: 'warn', points: 3, details: `${count} structured data item(s). Add more schema types for better answer targeting.` };
      return { status: 'fail', points: 0, details: 'No structured data found. JSON-LD schema is critical for answer engines.' };
    },
  },
  // ── AI Search Readiness checks ───────────────────────────────────────────
  {
    id: 'aeo-clear-answers',
    name: 'Clear Direct Answers',
    maxPoints: 10,
    evaluate: (crawl) => {
      // Check for clear, declarative sentences following headings
      const text = crawl.visibleText;
      const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20 && s.trim().length < 200);
      const declarative = sentences.filter((s) => /^(is|are|was|were|has|have|can|could|should|will|the|this|these|a |an )/i.test(s.trim()));
      if (declarative.length >= 8) return { status: 'pass', points: 10, details: `${declarative.length} clear declarative statements found — AI engines can easily extract direct answers.` };
      if (declarative.length >= 3) return { status: 'warn', points: 5, details: `${declarative.length} declarative statement(s) found. Add more direct, factual sentences after headings for AI extraction.` };
      return { status: 'fail', points: 0, details: 'Few clear declarative statements. AI search engines favor pages with direct, factual answers.' };
    },
  },
  {
    id: 'aeo-entity-context',
    name: 'Entity Context & Disambiguation',
    maxPoints: 8,
    evaluate: (crawl) => {
      const hasOrgSchema = crawl.hasOrganizationSchema;
      const hasPersonSchema = crawl.hasPersonSchema;
      const sdTypes = crawl.structuredData.map((sd) => sd.type.toLowerCase());
      const entityTypes = sdTypes.filter((t) => ['organization', 'person', 'localbusiness', 'product', 'service', 'brand'].includes(t));
      if (entityTypes.length >= 2 || (hasOrgSchema && hasPersonSchema)) return { status: 'pass', points: 8, details: `Strong entity context with ${entityTypes.length} entity types defined in structured data.` };
      if (entityTypes.length === 1 || hasOrgSchema || hasPersonSchema) return { status: 'warn', points: 4, details: 'Basic entity context found. Add more entity types (Organization, Person, Product) for richer AI understanding.' };
      return { status: 'fail', points: 0, details: 'No entity context found. AI search engines need Organization/Person/Product schema to understand who you are.' };
    },
  },
  {
    id: 'aeo-author-info',
    name: 'Author Information',
    maxPoints: 8,
    evaluate: (crawl) => {
      const html = crawl.html.toLowerCase();
      const hasAuthorMeta = /meta[^>]*(?:name|property)=["'](?:author|article:author)["']/i.test(crawl.html);
      const hasAuthorLink = /rel=["']author["']/i.test(crawl.html);
      const hasByline = /\b(?:by|written by|author)[:\s]/i.test(crawl.visibleText);
      const hasPersonSchema = crawl.hasPersonSchema;
      const signals = [hasAuthorMeta, hasAuthorLink, hasByline, hasPersonSchema].filter(Boolean).length;
      if (signals >= 3) return { status: 'pass', points: 8, details: 'Strong author attribution with multiple signals (meta, byline, schema).' };
      if (signals >= 1) return { status: 'warn', points: 4, details: `${signals} author signal(s) found. Add author bylines, Person schema, and meta author tags for E-E-A-T.` };
      return { status: 'fail', points: 0, details: 'No author information found. AI search engines value clear author attribution for credibility.' };
    },
  },
  {
    id: 'aeo-trust-signals',
    name: 'Trust Signals',
    maxPoints: 8,
    evaluate: (crawl) => {
      const signals: string[] = [];
      if (crawl.hasPrivacyPolicyLink) signals.push('privacy policy');
      if (crawl.hasAboutLink) signals.push('about page');
      if (crawl.hasContactLink) signals.push('contact page');
      if (crawl.isHttps) signals.push('HTTPS');
      const htmlLower = crawl.html.toLowerCase();
      if (/review|rating|stars|testimonial/i.test(htmlLower)) signals.push('reviews/testimonials');
      if (/certif|award|member of|accredit/i.test(htmlLower)) signals.push('certifications');
      if (signals.length >= 4) return { status: 'pass', points: 8, details: `Strong trust signals: ${signals.join(', ')}.` };
      if (signals.length >= 2) return { status: 'warn', points: 4, details: `Some trust signals found (${signals.join(', ')}). Add missing trust pages for AI credibility.` };
      return { status: 'fail', points: 0, details: 'Weak trust signals. AI search engines look for privacy policies, about pages, contact info, and HTTPS.' };
    },
  },
  {
    id: 'aeo-citations',
    name: 'Citations & References',
    maxPoints: 7,
    evaluate: (crawl) => {
      const extLinks = crawl.externalLinks;
      const authoritativePatterns = /\.(gov|edu|org)(\/|$)/i;
      const industryPatterns = /(wikipedia|researchgate|scholar|pubmed|statista|gartner|forrester|hubspot|microsoft|google|amazon)/i;
      const authLinks = extLinks.filter((l) => authoritativePatterns.test(l) || industryPatterns.test(l));
      if (authLinks.length >= 3) return { status: 'pass', points: 7, details: `${authLinks.length} authoritative citations found (.gov, .edu, industry leaders).` };
      if (authLinks.length >= 1) return { status: 'warn', points: 4, details: `${authLinks.length} citation(s) to authoritative sources. Add more references to boost AI trust.` };
      return { status: 'warn', points: 0, details: 'No authoritative citations found. Linking to .gov, .edu, or industry sources helps AI engines verify claims.' };
    },
  },
  {
    id: 'aeo-org-info',
    name: 'Organization Information',
    maxPoints: 7,
    evaluate: (crawl) => {
      const hasOrgSchema = crawl.hasOrganizationSchema;
      const html = crawl.html;
      const hasAddress = /address|location|office|headquarters/i.test(crawl.visibleText);
      const hasPhone = /tel:|phone|call us|\(\d{3}\)|\+\d/i.test(html);
      const hasEmail = /mailto:|email|contact@/i.test(html);
      const signals = [hasOrgSchema, hasAddress, hasPhone, hasEmail].filter(Boolean).length;
      if (signals >= 3) return { status: 'pass', points: 7, details: 'Comprehensive organization information with schema, address, and contact details.' };
      if (signals >= 1) return { status: 'warn', points: 4, details: `${signals} organization signal(s) found. Add Organization schema with address, phone, and email.` };
      return { status: 'fail', points: 0, details: 'No organization information found. AI engines need clear business identity to cite your content.' };
    },
  },
];

export function analyzeAeo(crawl: CrawlResult): LayerResults {
  const checks: CheckResult[] = [];
  let totalPoints = 0;
  let maxScore = 0;

  for (const check of aeoChecks) {
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
