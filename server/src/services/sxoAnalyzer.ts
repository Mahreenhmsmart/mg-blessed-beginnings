/**
 * SXO Analyzer — Search Experience Optimization checks.
 * Evaluates page performance signals, readability, navigation, and UX patterns.
 */

import type { CrawlResult } from './crawlerService';
import type { CheckResult, LayerResults } from '../models/Audit';

interface SxoCheck {
  id: string;
  name: string;
  maxPoints: number;
  evaluate: (crawl: CrawlResult) => { status: 'pass' | 'warn' | 'fail'; points: number; details: string };
}

const sxoChecks: SxoCheck[] = [
  {
    id: 'sxo-load-time',
    name: 'Page Load Performance',
    maxPoints: 15,
    evaluate: (crawl) => {
      const ms = crawl.loadTimeMs;
      if (ms <= 2000) return { status: 'pass', points: 15, details: `Page loaded in ${ms}ms (< 2s target).` };
      if (ms <= 4000) return { status: 'warn', points: 8, details: `Page loaded in ${ms}ms. Target under 2 seconds for optimal UX.` };
      return { status: 'fail', points: 0, details: `Page loaded in ${ms}ms. Slow load times hurt both rankings and user experience.` };
    },
  },
  {
    id: 'sxo-image-optimization',
    name: 'Image Optimization Signals',
    maxPoints: 10,
    evaluate: (crawl) => {
      if (crawl.images.length === 0) return { status: 'pass', points: 10, details: 'No images to optimize.' };
      // Check for common unoptimized patterns (large file extensions, no lazy loading indicators)
      const hasAltCoverage = crawl.images.filter((i) => i.hasAlt).length / crawl.images.length;
      const svgCount = crawl.images.filter((i) => i.src.endsWith('.svg')).length;
      if (hasAltCoverage >= 0.9 && svgCount > 0) {
        return { status: 'pass', points: 10, details: 'Images have good alt coverage and include SVG formats.' };
      }
      if (hasAltCoverage >= 0.7) {
        return { status: 'warn', points: 5, details: `${Math.round(hasAltCoverage * 100)}% image alt coverage. Optimize remaining images.` };
      }
      return { status: 'warn', points: 3, details: 'Low image optimization signals. Ensure all images have alt text and modern formats.' };
    },
  },
  {
    id: 'sxo-readability-sentence',
    name: 'Content Readability (Sentence Length)',
    maxPoints: 10,
    evaluate: (crawl) => {
      const sentences = crawl.visibleText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
      if (sentences.length === 0) return { status: 'fail', points: 0, details: 'No readable text found.' };
      const avgWordsPerSentence = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).filter(Boolean).length, 0) / sentences.length;
      if (avgWordsPerSentence <= 20) return { status: 'pass', points: 10, details: `Average sentence length: ${Math.round(avgWordsPerSentence)} words (good readability).` };
      if (avgWordsPerSentence <= 25) return { status: 'warn', points: 5, details: `Average sentence length: ${Math.round(avgWordsPerSentence)} words. Shorter sentences improve readability.` };
      return { status: 'fail', points: 0, details: `Average sentence length: ${Math.round(avgWordsPerSentence)} words. Long sentences reduce readability.` };
    },
  },
  {
    id: 'sxo-paragraph-length',
    name: 'Paragraph Length',
    maxPoints: 10,
    evaluate: (crawl) => {
      const paragraphs = crawl.html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
      if (paragraphs.length === 0) return { status: 'warn', points: 0, details: 'No paragraphs found.' };
      let longParagraphs = 0;
      for (const p of paragraphs) {
        const text = p.replace(/<[^>]+>/g, '').trim();
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        if (wordCount > 60) longParagraphs++;
      }
      const pct = Math.round((longParagraphs / paragraphs.length) * 100);
      if (pct <= 20) return { status: 'pass', points: 10, details: `${pct}% of paragraphs are over 60 words (good scannability).` };
      if (pct <= 50) return { status: 'warn', points: 5, details: `${pct}% of paragraphs exceed 60 words. Break up long paragraphs.` };
      return { status: 'fail', points: 0, details: `${pct}% of paragraphs are too long (>60 words). This hurts readability.` };
    },
  },
  {
    id: 'sxo-list-usage',
    name: 'List Usage for Scannability',
    maxPoints: 10,
    evaluate: (crawl) => {
      if (crawl.listCount >= 3) return { status: 'pass', points: 10, details: `${crawl.listCount} lists found — content is well structured for scanning.` };
      if (crawl.listCount >= 1) return { status: 'warn', points: 5, details: `${crawl.listCount} list(s) found. More lists improve content scannability.` };
      return { status: 'warn', points: 0, details: 'No lists found. Use bullet points and numbered lists for better UX.' };
    },
  },
  {
    id: 'sxo-navigation',
    name: 'Navigation Structure',
    maxPoints: 10,
    evaluate: (crawl) => {
      if (crawl.navLinks.length >= 3) return { status: 'pass', points: 10, details: `${crawl.navLinks.length} navigation links found in <nav> elements.` };
      if (crawl.navLinks.length >= 1) return { status: 'warn', points: 5, details: `Only ${crawl.navLinks.length} nav link(s). Clear navigation improves UX and crawlability.` };
      return { status: 'fail', points: 0, details: 'No <nav> element found. Proper navigation structure is essential for UX.' };
    },
  },
  {
    id: 'sxo-breadcrumb-schema',
    name: 'Breadcrumb Schema',
    maxPoints: 10,
    evaluate: (crawl) => {
      if (crawl.hasBreadcrumbSchema) return { status: 'pass', points: 10, details: 'BreadcrumbList schema found — helps users understand site hierarchy.' };
      return { status: 'warn', points: 0, details: 'No breadcrumb schema found. Breadcrumbs improve navigation UX and search appearance.' };
    },
  },
  {
    id: 'sxo-mobile-viewport',
    name: 'Mobile Responsiveness',
    maxPoints: 10,
    evaluate: (crawl) => {
      if (crawl.hasViewportMeta) return { status: 'pass', points: 10, details: 'Viewport meta tag present — mobile responsive.' };
      return { status: 'fail', points: 0, details: 'Missing viewport meta tag. Page may not render correctly on mobile devices.' };
    },
  },
  {
    id: 'sxo-internal-linking-depth',
    name: 'Content Interlinking',
    maxPoints: 10,
    evaluate: (crawl) => {
      const count = crawl.internalLinks.length;
      if (count >= 10) return { status: 'pass', points: 10, details: `${count} internal links — strong content interlinking.` };
      if (count >= 5) return { status: 'warn', points: 5, details: `${count} internal links. More cross-linking improves discoverability.` };
      return { status: 'fail', points: 0, details: `Only ${count} internal link(s). Users need clear paths to related content.` };
    },
  },
  {
    id: 'sxo-trust-signals',
    name: 'Trust & Credibility Signals',
    maxPoints: 15,
    evaluate: (crawl) => {
      const signals = [
        crawl.hasPrivacyPolicyLink,
        crawl.hasAboutLink,
        crawl.hasContactLink,
        crawl.isHttps,
      ];
      const active = signals.filter(Boolean).length;
      if (active >= 4) return { status: 'pass', points: 15, details: 'All trust signals present (privacy, about, contact, HTTPS).' };
      if (active >= 2) return { status: 'warn', points: 8, details: `${active}/4 trust signals. Add missing privacy, about, or contact pages.` };
      return { status: 'fail', points: 0, details: 'Few trust signals. Users and search engines look for credibility indicators.' };
    },
  },
];

export function analyzeSxo(crawl: CrawlResult): LayerResults {
  const checks: CheckResult[] = [];
  let totalPoints = 0;
  let maxScore = 0;

  for (const check of sxoChecks) {
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
