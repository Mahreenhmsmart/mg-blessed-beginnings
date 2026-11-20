/**
 * Performance Analyzer — Evaluates page performance including Core Web Vitals proxies,
 * resource sizes, caching, compression, and mobile performance indicators.
 */

import type { CrawlResult } from './crawlerService';
import type { CheckResult, LayerResults } from '../models/Audit';

interface PerfCheck {
  id: string;
  name: string;
  maxPoints: number;
  evaluate: (crawl: CrawlResult) => { status: 'pass' | 'warn' | 'fail'; points: number; details: string };
}

const perfChecks: PerfCheck[] = [
  {
    id: 'perf-load-time',
    name: 'Page Load Time (LCP proxy)',
    maxPoints: 15,
    evaluate: (crawl) => {
      const ms = crawl.loadTimeMs;
      if (ms <= 2500) return { status: 'pass', points: 15, details: `Performance: Good. Load time ${ms}ms is within the 2.5s LCP threshold.` };
      if (ms <= 4000) return { status: 'warn', points: 8, details: `Performance: Needs improvement. Load time ${ms}ms exceeds the 2.5s LCP target. Fix recommendation: Optimize hero images, reduce render-blocking resources.` };
      return { status: 'fail', points: 0, details: `🔴 Largest issue: slow page load at ${ms}ms. Fix recommendation: Convert PNG → WebP, reduce image dimensions, enable compression, defer non-critical JS.` };
    },
  },
  {
    id: 'perf-page-size',
    name: 'Page Size',
    maxPoints: 12,
    evaluate: (crawl) => {
      // Estimate page size from HTML + images
      const htmlSize = Buffer.byteLength(crawl.html, 'utf-8');
      const imageCount = crawl.images.length;
      const estimatedSizeKB = Math.round(htmlSize / 1024) + (imageCount * 150); // rough estimate
      if (estimatedSizeKB <= 500) return { status: 'pass', points: 12, details: `Page size ~${estimatedSizeKB}KB — lightweight and fast.` };
      if (estimatedSizeKB <= 1500) return { status: 'warn', points: 6, details: `Page size ~${estimatedSizeKB}KB. Fix recommendation: Compress images, minify CSS/JS, remove unused code.` };
      return { status: 'fail', points: 0, details: `🔴 Largest issue: oversized page at ~${estimatedSizeKB}KB. Fix recommendation: Convert PNG → WebP and reduce image dimensions, implement lazy loading.` };
    },
  },
  {
    id: 'perf-images',
    name: 'Image Optimization',
    maxPoints: 12,
    evaluate: (crawl) => {
      const totalImages = crawl.images.length;
      if (totalImages === 0) return { status: 'pass', points: 12, details: 'No images to optimize.' };
      const missingAlt = crawl.images.filter((img) => !img.hasAlt).length;
      const hasLazyLoading = /loading=["']lazy["']/i.test(crawl.html);
      const hasModernFormats = /\.(webp|avif)/i.test(crawl.html);
      const issues: string[] = [];
      if (missingAlt > 0) issues.push(`${missingAlt}/${totalImages} images missing alt text`);
      if (!hasLazyLoading) issues.push('no lazy loading detected');
      if (!hasModernFormats) issues.push('no modern formats (WebP/AVIF) detected');
      if (issues.length === 0) return { status: 'pass', points: 12, details: `${totalImages} images properly optimized with alt text and lazy loading.` };
      if (issues.length <= 1) return { status: 'warn', points: 6, details: `Fix recommendation: ${issues.join(', ')}.` };
      return { status: 'fail', points: 0, details: `🔴 Largest issue: ${issues.join('; ')}. Fix recommendation: Convert PNG → WebP and reduce image dimensions, add lazy loading.` };
    },
  },
  {
    id: 'perf-js-resources',
    name: 'JavaScript Resources',
    maxPoints: 10,
    evaluate: (crawl) => {
      const scriptTags = (crawl.html.match(/<script[^>]*src=/gi) || []).length;
      const inlineScripts = (crawl.html.match(/<script(?![^>]*src=)[^>]*>/gi) || []).length;
      const hasDefer = /defer/i.test(crawl.html);
      const hasAsync = /async/i.test(crawl.html);
      if (scriptTags <= 5 && (hasDefer || hasAsync)) return { status: 'pass', points: 10, details: `${scriptTags} external scripts with defer/async loading.` };
      if (scriptTags <= 10) return { status: 'warn', points: 5, details: `${scriptTags} external scripts found. Fix recommendation: Add defer/async attributes, bundle and minify JS files.` };
      return { status: 'fail', points: 0, details: `🔴 Largest issue: ${scriptTags} external scripts. Fix recommendation: Bundle JS, tree-shake unused code, use dynamic imports.` };
    },
  },
  {
    id: 'perf-css-resources',
    name: 'CSS Resources',
    maxPoints: 8,
    evaluate: (crawl) => {
      const linkStylesheets = (crawl.html.match(/<link[^>]*rel=["']stylesheet["']/gi) || []).length;
      const styleTags = (crawl.html.match(/<style[^>]*>/gi) || []).length;
      const total = linkStylesheets + styleTags;
      if (total <= 3) return { status: 'pass', points: 8, details: `${total} stylesheet(s) — minimal CSS overhead.` };
      if (total <= 6) return { status: 'warn', points: 4, details: `${total} stylesheets found. Fix recommendation: Combine and minify CSS, inline critical CSS.` };
      return { status: 'fail', points: 0, details: `🔴 Largest issue: ${total} stylesheets causing render blocking. Fix recommendation: Inline critical CSS, defer non-critical styles.` };
    },
  },
  {
    id: 'perf-fonts',
    name: 'Font Loading',
    maxPoints: 8,
    evaluate: (crawl) => {
      const fontLinks = (crawl.html.match(/fonts\.(googleapis|gstatic)/gi) || []).length;
      const fontFaceRules = (crawl.html.match(/@font-face/gi) || []).length;
      const hasFontDisplay = /font-display:\s*(swap|optional|fallback)/i.test(crawl.html);
      const hasPreload = /<link[^>]*rel=["']preload["'][^>]*as=["']font["']/i.test(crawl.html);
      if ((fontLinks === 0 && fontFaceRules === 0) || hasFontDisplay || hasPreload) return { status: 'pass', points: 8, details: 'Fonts properly configured with font-display or preload.' };
      if (fontLinks > 0 || fontFaceRules > 0) return { status: 'warn', points: 4, details: `${fontLinks + fontFaceRules} font source(s) without font-display. Fix recommendation: Add font-display: swap to prevent invisible text during load.` };
      return { status: 'pass', points: 8, details: 'No custom fonts detected.' };
    },
  },
  {
    id: 'perf-render-blocking',
    name: 'Render-Blocking Resources',
    maxPoints: 10,
    evaluate: (crawl) => {
      const renderBlockingScripts = (crawl.html.match(/<script[^>]*src=[^>]*(?<!defer)(?<!async)>/gi) || []).length;
      const renderBlockingCSS = (crawl.html.match(/<link[^>]*rel=["']stylesheet["'][^>]*(?!media=["']print["'])/gi) || []).length;
      const total = renderBlockingScripts + renderBlockingCSS;
      if (total <= 2) return { status: 'pass', points: 10, details: `${total} potential render-blocking resource(s) — minimal impact on FCP.` };
      if (total <= 5) return { status: 'warn', points: 5, details: `${total} render-blocking resources. Fix recommendation: Defer non-critical JS, inline critical CSS, use media queries for print styles.` };
      return { status: 'fail', points: 0, details: `🔴 Largest issue: ${total} render-blocking resources. Fix recommendation: Move scripts to bottom, use async/defer, inline above-the-fold CSS.` };
    },
  },
  {
    id: 'perf-caching',
    name: 'Caching Headers',
    maxPoints: 8,
    evaluate: (crawl) => {
      const html = crawl.html.toLowerCase();
      const hasCacheMeta = /cache-control|max-age|expires/i.test(html);
      const hasServiceWorker = /service.?worker|navigator\.serviceWorker/i.test(html);
      const hasPreloadHints = /<link[^>]*rel=["']prefetch|preload|preconnect["']/i.test(crawl.html);
      const signals = [hasCacheMeta, hasServiceWorker, hasPreloadHints].filter(Boolean).length;
      if (signals >= 2) return { status: 'pass', points: 8, details: 'Caching strategy detected (meta headers, service worker, or preload hints).' };
      if (signals === 1) return { status: 'warn', points: 4, details: 'Basic caching signal found. Fix recommendation: Add Cache-Control headers, implement service worker for offline support.' };
      return { status: 'fail', points: 0, details: 'No caching strategy detected. Fix recommendation: Set Cache-Control headers on static assets, add service worker.' };
    },
  },
  {
    id: 'perf-compression',
    name: 'Compression',
    maxPoints: 7,
    evaluate: (crawl) => {
      const hasGzip = /gzip|deflate|br\b/i.test(crawl.html);
      const hasMinifiedJS = /\.min\.js/i.test(crawl.html);
      const hasMinifiedCSS = /\.min\.css/i.test(crawl.html);
      const signals = [hasGzip, hasMinifiedJS, hasMinifiedCSS].filter(Boolean).length;
      if (signals >= 2) return { status: 'pass', points: 7, details: 'Compression and minification detected.' };
      if (signals === 1) return { status: 'warn', points: 4, details: 'Partial compression/minification. Fix recommendation: Enable gzip/brotli on server, minify all JS/CSS files.' };
      return { status: 'warn', points: 0, details: 'No compression signals detected. Fix recommendation: Enable gzip/brotli compression on your web server.' };
    },
  },
  {
    id: 'perf-mobile-performance',
    name: 'Mobile Performance',
    maxPoints: 10,
    evaluate: (crawl) => {
      const hasViewport = crawl.hasViewportMeta;
      const hasResponsiveImages = /srcset|sizes=|picture>|responsive/i.test(crawl.html);
      const hasTouchOptimization = /touch-action|-webkit-tap-highlight|pointer:\s*coarse/i.test(crawl.html);
      const signals = [hasViewport, hasResponsiveImages, hasTouchOptimization].filter(Boolean).length;
      if (signals >= 3) return { status: 'pass', points: 10, details: 'Strong mobile performance signals: viewport, responsive images, touch optimization.' };
      if (signals >= 1) return { status: 'warn', points: 5, details: `${signals}/3 mobile signals found. Fix recommendation: Add responsive images with srcset, optimize touch targets.` };
      return { status: 'fail', points: 0, details: '🔴 Largest issue: no mobile optimization detected. Fix recommendation: Add viewport meta tag, implement responsive images.' };
    },
  },
];

export function analyzePerformance(crawl: CrawlResult): LayerResults {
  const checks: CheckResult[] = [];
  let totalPoints = 0;
  let maxScore = 0;

  for (const check of perfChecks) {
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
