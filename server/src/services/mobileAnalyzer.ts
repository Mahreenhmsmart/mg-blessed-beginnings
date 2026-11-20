/**
 * Mobile Analyzer — Evaluates mobile-friendliness including responsive design,
 * text size, buttons, navigation, touch targets, viewport, and image scaling.
 */

import type { CrawlResult } from './crawlerService';
import type { CheckResult, LayerResults } from '../models/Audit';

interface MobileCheck {
  id: string;
  name: string;
  maxPoints: number;
  evaluate: (crawl: CrawlResult) => { status: 'pass' | 'warn' | 'fail'; points: number; details: string };
}

const mobileChecks: MobileCheck[] = [
  {
    id: 'mobile-viewport',
    name: 'Viewport Meta Tag',
    maxPoints: 15,
    evaluate: (crawl) => {
      if (crawl.hasViewportMeta && crawl.technicalDetails.viewportContent) {
        const content = crawl.technicalDetails.viewportContent;
        if (/width\s*=\s*device-width/i.test(content)) {
          return { status: 'pass', points: 15, details: `Viewport properly set: "${content}".` };
        }
        return { status: 'warn', points: 8, details: `Viewport meta tag found but may not use width=device-width: "${content}".` };
      }
      return { status: 'fail', points: 0, details: 'No viewport meta tag found. Add <meta name="viewport" content="width=device-width, initial-scale=1"> for proper mobile rendering.' };
    },
  },
  {
    id: 'mobile-responsive-design',
    name: 'Responsive Design',
    maxPoints: 15,
    evaluate: (crawl) => {
      const hasMediaQueries = /@media\s*(only\s+)?screen/i.test(crawl.html);
      const hasFlexbox = /display:\s*flex|display:\s*grid/i.test(crawl.html);
      const hasResponsiveUnits = /\b(vw|vh|rem|em|%)\b/i.test(crawl.html);
      const hasContainerQueries = /@container|container-type/i.test(crawl.html);
      const signals = [hasMediaQueries, hasFlexbox || hasResponsiveUnits, hasContainerQueries].filter(Boolean).length;
      if (signals >= 2) return { status: 'pass', points: 15, details: 'Strong responsive design signals: media queries, flexible layouts detected.' };
      if (signals === 1) return { status: 'warn', points: 8, details: 'Basic responsive signal found. Ensure CSS uses fluid layouts and breakpoints for all screen sizes.' };
      return { status: 'fail', points: 0, details: 'No responsive design signals detected. Use CSS media queries and flexible layouts for mobile compatibility.' };
    },
  },
  {
    id: 'mobile-text-size',
    name: 'Text Readability',
    maxPoints: 12,
    evaluate: (crawl) => {
      // Check for base font size declarations
      const hasBaseFontSize = /font-size:\s*(1[4-9]|2\d)px|font-size:\s*(1\.?[0-9])rem/i.test(crawl.html);
      const hasRelativeUnits = /font-size:\s*(rem|em|%)/i.test(crawl.html);
      const hasSmallFixed = /font-size:\s*([89]|1[0-2])px/i.test(crawl.html);
      if (hasSmallFixed) return { status: 'warn', points: 6, details: 'Small fixed font sizes (≤12px) detected. Use minimum 16px or relative units for mobile readability.' };
      if (hasBaseFontSize || hasRelativeUnits) return { status: 'pass', points: 12, details: 'Font sizes appear readable on mobile with appropriate base sizes.' };
      return { status: 'warn', points: 6, details: 'No explicit font sizing detected. Ensure body text is at least 16px on mobile devices.' };
    },
  },
  {
    id: 'mobile-touch-targets',
    name: 'Touch Target Size',
    maxPoints: 12,
    evaluate: (crawl) => {
      // Look for button/link sizing patterns
      const hasMinPadding = /padding:\s*(8|9|[1-9]\d)px/i.test(crawl.html);
      const hasMinWidth = /min-(width|height):\s*(4[4-9]|[5-9]\d)px/i.test(crawl.html);
      const hasTouchAction = /touch-action/i.test(crawl.html);
      const btnCount = (crawl.html.match(/<button|<a[^>]*class=/gi) || []).length;
      const signals = [hasMinPadding, hasMinWidth, hasTouchAction].filter(Boolean).length;
      if (signals >= 2) return { status: 'pass', points: 12, details: 'Touch target optimization detected: adequate padding/sizing and touch-action properties.' };
      if (signals === 1) return { status: 'warn', points: 6, details: `${btnCount} interactive elements found. Ensure all buttons/links have minimum 44x44px touch targets.` };
      return { status: 'warn', points: 4, details: `${btnCount} interactive elements found. Verify touch targets meet the 44x44px minimum recommended size.` };
    },
  },
  {
    id: 'mobile-navigation',
    name: 'Mobile Navigation',
    maxPoints: 12,
    evaluate: (crawl) => {
      const hasNavElement = /<nav[\s>]/i.test(crawl.html);
      const hasHamburger = /hamburger|menu-toggle|mobile-menu|nav-toggle|burger/i.test(crawl.html);
      const hasHiddenNav = /display:\s*none.*nav|nav.*display:\s*none|hidden.*menu/i.test(crawl.html);
      const navLinks = crawl.navLinks.length;
      if (hasNavElement && (hasHamburger || hasHiddenNav)) return { status: 'pass', points: 12, details: `Mobile navigation pattern detected with ${navLinks} nav links.` };
      if (hasNavElement && navLinks > 0) return { status: 'warn', points: 6, details: `${navLinks} navigation links found. Consider adding a mobile hamburger menu for smaller screens.` };
      return { status: 'fail', points: 0, details: 'No navigation structure detected. Add semantic <nav> element with mobile-friendly menu pattern.' };
    },
  },
  {
    id: 'mobile-horizontal-overflow',
    name: 'Horizontal Overflow Prevention',
    maxPoints: 10,
    evaluate: (crawl) => {
      const hasOverflowX = /overflow-x:\s*(hidden|auto|scroll)/i.test(crawl.html);
      const hasMaxWidth = /max-width:\s*(100%|100vw)/i.test(crawl.html);
      const hasBoxSizing = /box-sizing:\s*border-box/i.test(crawl.html);
      const hasFixedWidth = /width:\s*\d{3,}px/i.test(crawl.html);
      if (hasFixedWidth && !hasOverflowX && !hasMaxWidth) return { status: 'fail', points: 0, details: 'Fixed-width elements without overflow handling detected. This causes horizontal scrolling on mobile.' };
      if ((hasOverflowX || hasMaxWidth) && hasBoxSizing) return { status: 'pass', points: 10, details: 'Good overflow prevention: max-width constraints and border-box sizing detected.' };
      if (hasOverflowX || hasMaxWidth) return { status: 'warn', points: 5, details: 'Basic overflow prevention found. Add box-sizing: border-box globally to prevent layout issues.' };
      return { status: 'warn', points: 5, details: 'No explicit overflow prevention detected. Use max-width: 100% and overflow-x: hidden on body.' };
    },
  },
  {
    id: 'mobile-image-scaling',
    name: 'Image Scaling',
    maxPoints: 12,
    evaluate: (crawl) => {
      const totalImages = crawl.images.length;
      if (totalImages === 0) return { status: 'pass', points: 12, details: 'No images to scale.' };
      const hasSrcset = /srcset=/i.test(crawl.html);
      const hasSizesAttr = /sizes=/i.test(crawl.html);
      const hasPictureElement = /<picture/i.test(crawl.html);
      const hasMaxWidthImg = /img[^{]*max-width:\s*100%/i.test(crawl.html) || /\.img.*max-width|img\s*\{[^}]*max-width/i.test(crawl.html);
      const hasResponsiveClass = /img-fluid|img-responsive|w-full|object-cover/i.test(crawl.html);
      const signals = [hasSrcset, hasSizesAttr || hasPictureElement, hasMaxWidthImg || hasResponsiveClass].filter(Boolean).length;
      if (signals >= 2) return { status: 'pass', points: 12, details: `${totalImages} images with responsive scaling (srcset, max-width, or responsive classes).` };
      if (signals === 1) return { status: 'warn', points: 6, details: `${totalImages} images with basic responsive handling. Add srcset for different screen densities.` };
      return { status: 'fail', points: 0, details: `${totalImages} images without responsive scaling. Fix recommendation: Add max-width: 100% and srcset attributes.` };
    },
  },
  {
    id: 'mobile-performance',
    name: 'Mobile Performance Score',
    maxPoints: 12,
    evaluate: (crawl) => {
      const loadTime = crawl.loadTimeMs;
      const imageCount = crawl.images.length;
      const scriptCount = (crawl.html.match(/<script[^>]*src=/gi) || []).length;
      // Mobile penalty: slower connections mean resources matter more
      let score = 12;
      const issues: string[] = [];
      if (loadTime > 4000) { score -= 4; issues.push(`slow load (${loadTime}ms)`); }
      else if (loadTime > 2500) { score -= 2; issues.push(`moderate load (${loadTime}ms)`); }
      if (imageCount > 10) { score -= 2; issues.push(`${imageCount} images`); }
      if (scriptCount > 8) { score -= 2; issues.push(`${scriptCount} scripts`); }
      score = Math.max(0, score);
      if (score >= 10) return { status: 'pass', points: score, details: 'Good mobile performance indicators.' };
      if (score >= 6) return { status: 'warn', points: score, details: `Mobile performance concerns: ${issues.join(', ')}. Optimize for slower mobile connections.` };
      return { status: 'fail', points: score, details: `🔴 Largest issue: poor mobile performance — ${issues.join(', ')}. Prioritize critical rendering path for mobile.` };
    },
  },
];

export function analyzeMobile(crawl: CrawlResult): LayerResults {
  const checks: CheckResult[] = [];
  let totalPoints = 0;
  let maxScore = 0;

  for (const check of mobileChecks) {
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
