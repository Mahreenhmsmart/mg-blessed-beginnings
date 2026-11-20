/**
 * Accessibility Analyzer — Deterministic checks for web accessibility from crawl data.
 * Checks image alt text, heading hierarchy, form labels, ARIA landmarks, language attribute,
 * link text quality, color contrast estimation, skip-nav presence, and viewport zoom restrictions.
 */

import type { CrawlResult } from './crawlerService';
import type { CheckResult, LayerResults } from '../models/Audit';

interface AccessibilityCheck {
  id: string;
  name: string;
  maxPoints: number;
  evaluate: (crawl: CrawlResult) => { status: 'pass' | 'warn' | 'fail'; points: number; details: string };
}

const accessibilityChecks: AccessibilityCheck[] = [
  {
    id: 'a11y-image-alt-text',
    name: 'Image Alt Text Coverage',
    maxPoints: 12,
    evaluate: (crawl) => {
      if (crawl.images.length === 0) return { status: 'pass', points: 12, details: 'No images found on the page.' };
      const withAlt = crawl.images.filter((i) => i.hasAlt).length;
      const total = crawl.images.length;
      const pct = Math.round((withAlt / total) * 100);
      if (pct >= 95) return { status: 'pass', points: 12, details: `${pct}% of images have alt text (${withAlt}/${total}). Excellent coverage.` };
      if (pct >= 70) return { status: 'warn', points: 6, details: `${pct}% of images have alt text (${withAlt}/${total}). Add descriptive alt text to remaining images.` };
      return { status: 'fail', points: 0, details: `Only ${pct}% of images have alt text (${withAlt}/${total}). Missing alt text makes images inaccessible to screen readers.` };
    },
  },
  {
    id: 'a11y-heading-hierarchy',
    name: 'Heading Hierarchy Structure',
    maxPoints: 10,
    evaluate: (crawl) => {
      if (crawl.headings.length === 0) return { status: 'fail', points: 0, details: 'No headings found. Headings provide essential document structure for screen readers.' };
      const h1s = crawl.headings.filter((h) => h.level === 1);
      if (h1s.length === 0) return { status: 'fail', points: 0, details: 'No H1 heading found. Every page must have exactly one H1 for proper document outline.' };
      if (h1s.length > 1) return { status: 'warn', points: 5, details: `${h1s.length} H1 headings found. Use exactly one H1 per page for clear document structure.` };

      // Check for skipped levels
      const levels = crawl.headings.map((h) => h.level);
      let skippedLevels = 0;
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] > levels[i - 1] + 1) skippedLevels++;
      }

      if (skippedLevels === 0) return { status: 'pass', points: 10, details: 'Heading hierarchy is logical with no skipped levels. Single H1 with proper nesting.' };
      return { status: 'warn', points: 5, details: `Heading hierarchy has ${skippedLevels} level skip(s) (e.g., H2 followed by H4). Maintain sequential order for screen reader navigation.` };
    },
  },
  {
    id: 'a11y-form-labels',
    name: 'Form Label Associations',
    maxPoints: 10,
    evaluate: (crawl) => {
      const html = crawl.html.toLowerCase();
      const inputCount = (html.match(/<input(?![^>]*type=["'](?:hidden|submit|button|image)["'])/gi) || []).length;
      const labelCount = (html.match(/<label/gi) || []).length;
      const ariaLabelCount = (html.match(/aria-label=/gi) || []).length;
      const placeholderOnly = (html.match(/placeholder=/gi) || []).length;

      if (inputCount === 0) return { status: 'pass', points: 10, details: 'No visible form inputs detected on this page.' };

      const labeledInputs = labelCount + ariaLabelCount;
      const ratio = labeledInputs / Math.max(inputCount, 1);

      if (ratio >= 0.8) return { status: 'pass', points: 10, details: `${labeledInputs} labels for ${inputCount} inputs. Good form label coverage.` };
      if (ratio >= 0.5) return { status: 'warn', points: 5, details: `${labeledInputs} labels for ${inputCount} inputs. Some form fields may lack associated labels.` };
      return { status: 'fail', points: 0, details: `Only ${labeledInputs} labels for ${inputCount} inputs. Form fields without labels are unusable by screen readers.` };
    },
  },
  {
    id: 'a11y-aria-landmarks',
    name: 'ARIA Landmark Roles',
    maxPoints: 8,
    evaluate: (crawl) => {
      const html = crawl.html.toLowerCase();
      const landmarks = [
        { role: 'banner', tag: '<header', pattern: /role=["']banner["']/i },
        { role: 'navigation', tag: '<nav', pattern: /role=["']navigation["']/i },
        { role: 'main', tag: '<main', pattern: /role=["']main["']/i },
        { role: 'contentinfo', tag: '<footer', pattern: /role=["']contentinfo["']/i },
      ];

      const found: string[] = [];
      for (const lm of landmarks) {
        if (html.includes(lm.tag) || lm.pattern.test(crawl.html)) {
          found.push(lm.role);
        }
      }

      if (found.length >= 3) return { status: 'pass', points: 8, details: `${found.length}/4 landmark regions detected (${found.join(', ')}). Good structural semantics.` };
      if (found.length >= 2) return { status: 'warn', points: 4, details: `${found.length}/4 landmark regions detected. Add semantic HTML elements (<header>, <nav>, <main>, <footer>) for better screen reader navigation.` };
      return { status: 'fail', points: 0, details: 'No ARIA landmark or semantic HTML regions detected. Screen reader users cannot navigate page sections efficiently.' };
    },
  },
  {
    id: 'a11y-language-attribute',
    name: 'HTML Language Attribute',
    maxPoints: 8,
    evaluate: (crawl) => {
      const langMatch = crawl.html.match(/<html[^>]+lang=["']([^"']+)["']/i);
      if (langMatch && langMatch[1] && langMatch[1].trim().length > 0) {
        return { status: 'pass', points: 8, details: `HTML lang attribute is set to "${langMatch[1]}". Screen readers use this to select the correct pronunciation.` };
      }
      return { status: 'fail', points: 0, details: 'Missing lang attribute on <html> element. Screen readers may use incorrect language pronunciation rules.' };
    },
  },
  {
    id: 'a11y-link-text-quality',
    name: 'Descriptive Link Text',
    maxPoints: 8,
    evaluate: (crawl) => {
      const html = crawl.html;
      // Extract link texts
      const linkRegex = /<a[^>]*>([\s\S]*?)<\/a>/gi;
      const links: string[] = [];
      let match: RegExpExecArray | null;
      while ((match = linkRegex.exec(html)) !== null) {
        const text = match[1].replace(/<[^>]+>/g, '').trim();
        if (text) links.push(text);
      }

      if (links.length === 0) return { status: 'pass', points: 8, details: 'No links found on this page.' };

      const vagueTexts = ['click here', 'read more', 'learn more', 'more', 'here', 'link', 'this'];
      const vagueLinks = links.filter((text) =>
        vagueTexts.some((vague) => text.toLowerCase() === vague),
      );

      if (vagueLinks.length === 0) return { status: 'pass', points: 8, details: 'All link texts appear descriptive. No generic "click here" or "read more" patterns found.' };
      if (vagueLinks.length <= 2) return { status: 'warn', points: 4, details: `${vagueLinks.length} link(s) use vague text ("${vagueLinks.slice(0, 3).join('", "')}"). Use descriptive link text that makes sense out of context.` };
      return { status: 'fail', points: 0, details: `${vagueLinks.length} links use vague/non-descriptive text. Screen reader users navigating by links cannot determine destinations.` };
    },
  },
  {
    id: 'a11y-color-contrast-inline',
    name: 'Color Contrast (Inline Styles)',
    maxPoints: 8,
    evaluate: (crawl) => {
      // Basic check for inline styles that might indicate low contrast
      const html = crawl.html;
      const inlineStyles = html.match(/style=["'][^"']*color:\s*#[0-9a-fA-F]{3,6}[^"']*background[^"']*["']/gi) || [];

      if (inlineStyles.length === 0) return { status: 'pass', points: 8, details: 'No inline color/background style conflicts detected. Note: full contrast analysis requires CSS parsing.' };

      // Simple heuristic: check for light-on-light or dark-on-dark
      const potentialIssues: string[] = [];
      for (const style of inlineStyles) {
        const colors = style.match(/#[0-9a-fA-F]{3,6}/g) || [];
        if (colors.length >= 2) {
          // Very basic luminance check
          const getLuminance = (hex: string): number => {
            const cleanHex = hex.replace('#', '');
            const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
            const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
            const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
            return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          };
          const l1 = getLuminance(colors[0]!);
          const l2 = getLuminance(colors[1]!);
          if (Math.abs(l1 - l2) < 0.3) {
            potentialIssues.push(`${colors[0]} on ${colors[1]}`);
          }
        }
      }

      if (potentialIssues.length === 0) return { status: 'pass', points: 8, details: 'Inline styles appear to have adequate contrast. Full analysis requires complete CSS evaluation.' };
      return { status: 'warn', points: 4, details: `${potentialIssues.length} potential low-contrast inline style(s) detected. Ensure WCAG AA contrast ratio (4.5:1 for normal text).` };
    },
  },
  {
    id: 'a11y-skip-navigation',
    name: 'Skip Navigation Link',
    maxPoints: 6,
    evaluate: (crawl) => {
      const html = crawl.html.toLowerCase();
      const hasSkipNav = html.includes('skip') && (
        html.includes('#main') ||
        html.includes('#content') ||
        html.includes('main-content') ||
        html.includes('skip-to') ||
        html.includes('skiptocontent')
      );

      if (hasSkipNav) return { status: 'pass', points: 6, details: 'Skip navigation link detected. Keyboard users can bypass repetitive navigation.' };
      return { status: 'warn', points: 0, details: 'No skip navigation link found. Add a "Skip to main content" link as the first focusable element for keyboard accessibility.' };
    },
  },
  {
    id: 'a11y-viewport-zoom',
    name: 'Viewport Zoom Restriction',
    maxPoints: 8,
    evaluate: (crawl) => {
      const td = crawl.technicalDetails;
      if (!td.viewportContent) {
        return { status: 'warn', points: 4, details: 'No viewport meta tag found. Add <meta name="viewport"> for mobile accessibility.' };
      }

      const viewport = td.viewportContent.toLowerCase();
      const hasUserScalableNo = viewport.includes('user-scalable=no') || viewport.includes('user-scalable=0');
      const hasMaxScale1 = viewport.includes('maximum-scale=1') || viewport.includes('maximum-scale=1.0');

      if (hasUserScalableNo || hasMaxScale1) {
        return { status: 'fail', points: 0, details: 'Viewport meta tag restricts zoom. Users must be able to zoom to at least 200% for readability. Remove user-scalable=no and maximum-scale=1.' };
      }

      return { status: 'pass', points: 8, details: 'Viewport does not restrict zoom. Users can pinch-to-zoom for accessibility.' };
    },
  },
  {
    id: 'a11y-focus-visible',
    name: 'Focus Indicators',
    maxPoints: 6,
    evaluate: (crawl) => {
      const html = crawl.html.toLowerCase();
      // Check for outline:none or outline:0 in styles which could remove focus indicators
      const removesOutline = (html.match(/outline\s*:\s*(?:none|0)/gi) || []).length;
      const hasFocusStyles = html.includes(':focus') || html.includes('focus-visible') || html.includes('focus-within');

      if (removesOutline > 3 && !hasFocusStyles) {
        return { status: 'fail', points: 0, details: `${removesOutline} instances of outline removal detected without custom focus styles. Keyboard users may lose track of focus position.` };
      }
      if (removesOutline > 0 && !hasFocusStyles) {
        return { status: 'warn', points: 3, details: `${removesOutline} outline removal(s) detected. Ensure custom :focus styles are provided as alternatives.` };
      }
      if (hasFocusStyles) {
        return { status: 'pass', points: 6, details: 'Custom focus styles detected. Keyboard navigation should be visually clear.' };
      }
      return { status: 'pass', points: 6, details: 'No obvious focus indicator removal detected. Browser default focus outlines should be visible.' };
    },
  },
];

export function analyzeAccessibility(crawl: CrawlResult): LayerResults {
  const checks: CheckResult[] = [];
  let totalPoints = 0;
  let maxScore = 0;

  for (const check of accessibilityChecks) {
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
