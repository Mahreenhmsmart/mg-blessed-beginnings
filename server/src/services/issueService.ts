/**
 * Issue Service — Transforms audit layer results into a unified Issue[] array.
 * Provides AI-assisted fix generation and prioritized action plans.
 */

import { generateCompletion } from './aiService';
import type { LayerResults, CheckResult } from '../models/Audit';

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low' | 'passed';
export type IssueStatus = 'open' | 'inProgress' | 'resolved' | 'ignored';

export interface Issue {
  id: string;
  checkId: string;
  severity: IssueSeverity;
  title: string;
  description: string;
  url: string;
  evidence: string;
  whyItMatters: string;
  recommendedSolution: string;
  implementationGuidance: string;
  priorityScore: number;
  status: IssueStatus;
  fixCode: string | null;
  category: string;
  layer: string;
  source: 'crawler' | 'ai' | 'estimated' | 'unavailable';
  confidence: 'high' | 'medium' | 'low';
  timestamp: Date;
}

interface ActionItem {
  rank: number;
  issueId: string;
  title: string;
  impact: number;
  urgency: number;
  difficulty: number;
  priorityScore: number;
  category: string;
}

const SEVERITY_MAP: Record<string, IssueSeverity> = {
  fail: 'critical',
  warn: 'medium',
  pass: 'passed',
};

const SEVERITY_WEIGHT: Record<IssueSeverity, number> = {
  critical: 10,
  high: 8,
  medium: 5,
  low: 2,
  passed: 0,
};

const CATEGORY_WHY_IT_MATTERS: Record<string, string> = {
  Security: 'Security vulnerabilities can lead to data breaches, loss of user trust, and search engine penalties.',
  Accessibility: 'Accessibility issues exclude users with disabilities and may violate legal requirements (ADA, WCAG).',
  'Social Media': 'Missing social metadata reduces click-through rates and brand visibility on social platforms.',
  'Technical SEO': 'Technical issues prevent search engines from properly crawling, indexing, and ranking your pages.',
  Performance: 'Slow page speed increases bounce rates, reduces conversions, and negatively impacts search rankings.',
  Mobile: 'Mobile usability is a confirmed ranking factor. Poor mobile experience drives users away.',
  Content: 'Content quality directly affects rankings, engagement, and conversion rates.',
  Headings: 'Proper heading structure helps both users and search engines understand content hierarchy.',
  Images: 'Image optimization affects page speed, accessibility, and image search visibility.',
  Linking: 'Internal linking distributes authority and helps crawlers discover important pages.',
  'Meta Tags': 'Title tags and meta descriptions are primary factors in search result click-through rates.',
  'Schema Markup': 'Structured data enables rich results in search, increasing visibility and click-through rates.',
};

function mapCheckToIssue(
  check: CheckResult,
  layer: string,
  url: string,
): Issue {
  const severity = SEVERITY_MAP[check.status] || 'medium';
  const category = getCategoryFromLayer(layer);

  // Calculate priority score: severity weight * point deficit ratio
  const pointDeficit = check.maxPoints - check.points;
  const maxPossible = check.maxPoints || 1;
  const priorityScore = Math.round(SEVERITY_WEIGHT[severity] * (pointDeficit / maxPossible) * 10);

  return {
    id: `${layer}-${check.id}`,
    checkId: check.id,
    severity,
    title: check.name,
    description: check.details,
    url,
    evidence: check.details,
    whyItMatters: CATEGORY_WHY_IT_MATTERS[category] || `This ${category.toLowerCase()} issue affects your website's overall performance and user experience.`,
    recommendedSolution: getSolutionForCheck(check.id),
    implementationGuidance: '',
    priorityScore,
    status: check.status === 'pass' ? 'resolved' : 'open',
    fixCode: null,
    category,
    layer,
    source: 'crawler',
    confidence: 'high',
    timestamp: new Date(),
  };
}

function getCategoryFromLayer(layer: string): string {
  const map: Record<string, string> = {
    seo: 'Technical SEO',
    aeo: 'AI Search',
    geo: 'AI Search',
    aio: 'AI Search',
    sxo: 'User Experience',
    cq: 'Content',
    schema: 'Schema Markup',
    performance: 'Performance',
    mobile: 'Mobile',
    localSeo: 'Local SEO',
    security: 'Security',
    accessibility: 'Accessibility',
    social: 'Social Media',
  };
  return map[layer] || layer.charAt(0).toUpperCase() + layer.slice(1);
}

function getSolutionForCheck(checkId: string): string {
  const solutions: Record<string, string> = {
    'sec-https-enforcement': 'Obtain an SSL certificate from a trusted CA (e.g., Let\'s Encrypt) and configure your server to serve all content over HTTPS.',
    'sec-hsts-header': 'Add the header: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
    'sec-x-frame-options': 'Add the header: X-Frame-Options: SAMEORIGIN',
    'sec-x-content-type-options': 'Add the header: X-Content-Type-Options: nosniff',
    'sec-content-security-policy': 'Implement a CSP header that whitelists trusted sources for scripts, styles, images, and fonts.',
    'sec-referrer-policy': 'Add the header: Referrer-Policy: strict-origin-when-cross-origin',
    'sec-permissions-policy': 'Add the header: Permissions-Policy: camera=(), microphone=(), geolocation=()',
    'sec-mixed-content': 'Update all resource URLs from http:// to https:// or use protocol-relative URLs (//).',
    'a11y-image-alt-text': 'Add descriptive alt attributes to every <img> element describing the image content or purpose.',
    'a11y-heading-hierarchy': 'Ensure exactly one H1 per page, followed by sequential H2, H3 levels without skipping.',
    'a11y-form-labels': 'Associate every form input with a <label for="inputId"> or add aria-label attribute.',
    'a11y-aria-landmarks': 'Use semantic HTML5 elements: <header>, <nav>, <main>, <footer>, <aside>.',
    'a11y-language-attribute': 'Add lang="en" (or appropriate code) to the <html> element.',
    'a11y-link-text-quality': 'Replace generic link text with descriptive text indicating the link destination.',
    'a11y-skip-navigation': 'Add <a href="#main" class="skip-link">Skip to main content</a> as first child of <body>.',
    'a11y-viewport-zoom': 'Change viewport meta to: <meta name="viewport" content="width=device-width, initial-scale=1">',
    'social-og-title': 'Add <meta property="og:title" content="Your Page Title"> in the <head>.',
    'social-og-description': 'Add <meta property="og:description" content="Your description"> in the <head>.',
    'social-og-image': 'Add <meta property="og:image" content="https://yoursite.com/image.jpg"> with 1200x630px image.',
    'social-twitter-card': 'Add <meta name="twitter:card" content="summary_large_image"> in the <head>.',
    'social-favicon': 'Add <link rel="icon" href="/favicon.ico" type="image/x-icon"> in the <head>.',
  };
  return solutions[checkId] || 'Review the check details and apply the recommended changes to your website.';
}

/**
 * Transform all audit layer results into a unified Issue[] array.
 */
export function transformResultsToIssues(
  results: Record<string, LayerResults>,
  url: string,
): Issue[] {
  const issues: Issue[] = [];

  for (const [layer, layerResults] of Object.entries(results)) {
    if (!layerResults || !layerResults.checks) continue;

    for (const check of layerResults.checks) {
      issues.push(mapCheckToIssue(check, layer, url));
    }
  }

  // Sort by priority score descending (most critical first)
  issues.sort((a, b) => b.priorityScore - a.priorityScore);

  return issues;
}

/**
 * Generate AI-assisted fix code for a specific issue.
 */
export async function generateFixForIssue(issue: Issue): Promise<string> {
  const prompt = `You are a web development expert. Generate a specific, actionable code snippet or implementation guide for fixing this website issue:

Issue: ${issue.title}
Category: ${issue.category}
Current Evidence: ${issue.evidence}
Recommended Solution: ${issue.recommendedSolution}

Requirements:
- Provide actual HTML/CSS/JS/server-config code where applicable
- Include comments explaining each change
- Keep the fix minimal and non-destructive
- If it's a server configuration issue, provide the relevant config syntax (nginx/apache/express)
- Format as a clean code block

Return ONLY the fix code/snippet with brief explanation, no preamble.`;

  try {
    const result = await generateCompletion(prompt, { maxTokens: 1024 });
    return result.trim();
  } catch (err) {
    console.error('[issue-service] AI fix generation failed:', err instanceof Error ? err.message : err);
    return issue.recommendedSolution;
  }
}

/**
 * Generate fixes for all safe (non-destructive) open issues.
 * Safe issues are those with quick/moderate effort that don't require destructive changes.
 */
export async function generateFixesForAllSafeIssues(issues: Issue[]): Promise<Issue[]> {
  const safeIssues = issues.filter(
    (i) => i.status === 'open' && i.severity !== 'passed' && i.fixCode === null,
  );

  // Process in batches of 5 to avoid overwhelming the AI
  const batchSize = 5;
  const updated = [...issues];

  for (let i = 0; i < safeIssues.length; i += batchSize) {
    const batch = safeIssues.slice(i, i + batchSize);
    const fixes = await Promise.allSettled(
      batch.map((issue) => generateFixForIssue(issue)),
    );

    for (let j = 0; j < batch.length; j++) {
      const fixResult = fixes[j];
      if (fixResult.status === 'fulfilled') {
        const idx = updated.findIndex((u) => u.id === batch[j]!.id);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx]!, fixCode: fixResult.value };
        }
      }
    }
  }

  return updated;
}

/**
 * Generate a prioritized top-10 action list sorted by impact x urgency / difficulty.
 */
export function generateActionPlan(issues: Issue[]): ActionItem[] {
  const openIssues = issues.filter((i) => i.status === 'open' && i.severity !== 'passed');

  const scored = openIssues.map((issue) => {
    const impact = SEVERITY_WEIGHT[issue.severity] || 0;
    const urgency = issue.severity === 'critical' ? 10 : issue.severity === 'high' ? 7 : issue.severity === 'medium' ? 4 : 2;
    const difficulty = getDifficultyForCheck(issue.checkId);
    const priorityScore = Math.round((impact * urgency) / Math.max(difficulty, 1));

    return {
      rank: 0,
      issueId: issue.id,
      title: issue.title,
      impact,
      urgency,
      difficulty,
      priorityScore,
      category: issue.category,
    };
  });

  scored.sort((a, b) => b.priorityScore - a.priorityScore);

  return scored.slice(0, 10).map((item, index) => ({ ...item, rank: index + 1 }));
}

function getDifficultyForCheck(checkId: string): number {
  // Quick fixes = 1, moderate = 3, extensive = 5
  const quickChecks = [
    'sec-hsts-header', 'sec-x-frame-options', 'sec-x-content-type-options',
    'sec-referrer-policy', 'sec-permissions-policy',
    'a11y-language-attribute', 'a11y-skip-navigation', 'a11y-viewport-zoom',
    'social-og-title', 'social-og-description', 'social-og-url', 'social-og-type',
    'social-twitter-card', 'social-twitter-title', 'social-twitter-description',
    'social-favicon',
  ];
  const extensiveChecks = [
    'sec-https-enforcement', 'sec-content-security-policy',
    'a11y-form-labels', 'a11y-color-contrast-inline',
  ];

  if (quickChecks.includes(checkId)) return 1;
  if (extensiveChecks.includes(checkId)) return 5;
  return 3;
}
