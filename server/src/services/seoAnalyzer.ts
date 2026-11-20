/**
 * SEO Analyzer — Deterministic checks for Search Engine Optimization.
 * Each check returns pass/warn/fail with a point value. Aggregated to 0-100.
 */

import type { CrawlResult } from './crawlerService';
import type { CheckResult, LayerResults } from '../models/Audit';

interface SeoCheck {
  id: string;
  name: string;
  maxPoints: number;
  evaluate: (crawl: CrawlResult) => { status: 'pass' | 'warn' | 'fail'; points: number; details: string };
}

const seoChecks: SeoCheck[] = [
  // ─── EXISTING CHECKS (preserved) ──────────────────────────────────────────
  {
    id: 'seo-title-presence',
    name: 'Title Tag Presence',
    maxPoints: 10,
    evaluate: (crawl) => {
      if (!crawl.title) return { status: 'fail', points: 0, details: 'No title tag found on the page.' };
      return { status: 'pass', points: 10, details: `Title: "${crawl.title}"` };
    },
  },
  {
    id: 'seo-title-length',
    name: 'Title Tag Length',
    maxPoints: 8,
    evaluate: (crawl) => {
      if (!crawl.title) return { status: 'fail', points: 0, details: 'No title tag to measure.' };
      const len = crawl.title.length;
      if (len >= 30 && len <= 60) return { status: 'pass', points: 8, details: `Title length is ${len} chars (optimal: 30-60).` };
      if (len < 30) return { status: 'warn', points: 4, details: `Title is too short (${len} chars). Aim for 30-60 characters.` };
      return { status: 'warn', points: 4, details: `Title is too long (${len} chars). May be truncated in search results.` };
    },
  },
  {
    id: 'seo-meta-description',
    name: 'Meta Description',
    maxPoints: 10,
    evaluate: (crawl) => {
      if (!crawl.metaDescription) return { status: 'fail', points: 0, details: 'No meta description found.' };
      const len = crawl.metaDescription.length;
      if (len >= 120 && len <= 160) return { status: 'pass', points: 10, details: `Meta description length is ${len} chars (optimal: 120-160).` };
      if (len < 120) return { status: 'warn', points: 5, details: `Meta description is short (${len} chars). Aim for 120-160 characters.` };
      return { status: 'warn', points: 5, details: `Meta description is long (${len} chars). May be truncated.` };
    },
  },
  {
    id: 'seo-h1-unique',
    name: 'H1 Uniqueness',
    maxPoints: 10,
    evaluate: (crawl) => {
      const h1s = crawl.headings.filter((h) => h.level === 1);
      if (h1s.length === 0) return { status: 'fail', points: 0, details: 'No H1 heading found on the page.' };
      if (h1s.length === 1) return { status: 'pass', points: 10, details: `Single H1 found: "${h1s[0].text}"` };
      return { status: 'warn', points: 5, details: `${h1s.length} H1 tags found. Use exactly one H1 per page.` };
    },
  },
  {
    id: 'seo-canonical',
    name: 'Canonical Tag',
    maxPoints: 8,
    evaluate: (crawl) => {
      if (crawl.canonicalUrl) return { status: 'pass', points: 8, details: `Canonical URL set: ${crawl.canonicalUrl}` };
      return { status: 'warn', points: 0, details: 'No canonical tag found. This may cause duplicate content issues.' };
    },
  },
  {
    id: 'seo-internal-links',
    name: 'Internal Linking',
    maxPoints: 8,
    evaluate: (crawl) => {
      const count = crawl.internalLinks.length;
      if (count >= 5) return { status: 'pass', points: 8, details: `${count} internal links found.` };
      if (count >= 2) return { status: 'warn', points: 4, details: `Only ${count} internal links. Aim for at least 5.` };
      return { status: 'fail', points: 0, details: `Only ${count} internal link(s). Internal linking helps crawlers discover pages.` };
    },
  },
  {
    id: 'seo-image-alt',
    name: 'Image Alt Coverage',
    maxPoints: 8,
    evaluate: (crawl) => {
      if (crawl.images.length === 0) return { status: 'pass', points: 8, details: 'No images to check.' };
      const withAlt = crawl.images.filter((i) => i.hasAlt).length;
      const pct = Math.round((withAlt / crawl.images.length) * 100);
      if (pct === 100) return { status: 'pass', points: 8, details: `All ${crawl.images.length} images have alt text.` };
      if (pct >= 70) return { status: 'warn', points: 4, details: `${pct}% of images have alt text (${withAlt}/${crawl.images.length}).` };
      return { status: 'fail', points: 0, details: `Only ${pct}% of images have alt text (${withAlt}/${crawl.images.length}).` };
    },
  },
  {
    id: 'seo-viewport',
    name: 'Mobile Viewport Meta',
    maxPoints: 8,
    evaluate: (crawl) => {
      if (crawl.hasViewportMeta) return { status: 'pass', points: 8, details: 'Viewport meta tag is present.' };
      return { status: 'fail', points: 0, details: 'Missing viewport meta tag. Page may not render correctly on mobile.' };
    },
  },
  {
    id: 'seo-https',
    name: 'HTTPS Usage',
    maxPoints: 8,
    evaluate: (crawl) => {
      if (crawl.isHttps) return { status: 'pass', points: 8, details: 'Site uses HTTPS.' };
      return { status: 'fail', points: 0, details: 'Site does not use HTTPS. This is a ranking factor and security concern.' };
    },
  },
  {
    id: 'seo-sitemap',
    name: 'Sitemap.xml Presence',
    maxPoints: 6,
    evaluate: (crawl) => {
      if (crawl.hasSitemap) return { status: 'pass', points: 6, details: 'sitemap.xml found at root.' };
      return { status: 'warn', points: 0, details: 'No sitemap.xml found at site root.' };
    },
  },
  {
    id: 'seo-robots',
    name: 'Robots.txt Presence',
    maxPoints: 6,
    evaluate: (crawl) => {
      if (crawl.hasRobotsTxt) return { status: 'pass', points: 6, details: 'robots.txt found at root.' };
      return { status: 'warn', points: 0, details: 'No robots.txt found at site root.' };
    },
  },
  {
    id: 'seo-heading-hierarchy',
    name: 'Heading Hierarchy',
    maxPoints: 8,
    evaluate: (crawl) => {
      if (crawl.headings.length === 0) return { status: 'fail', points: 0, details: 'No headings found on the page.' };
      const levels = crawl.headings.map((h) => h.level);
      let hasGaps = false;
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] > levels[i - 1] + 1) {
          hasGaps = true;
          break;
        }
      }
      const hasH1 = levels.includes(1);
      if (hasH1 && !hasGaps) return { status: 'pass', points: 8, details: 'Heading hierarchy is well-structured.' };
      if (hasH1 && hasGaps) return { status: 'warn', points: 4, details: 'Heading hierarchy has gaps (e.g., H2 followed by H4 without H3).' };
      return { status: 'warn', points: 2, details: 'Heading hierarchy starts without H1 or has structural issues.' };
    },
  },
  {
    id: 'seo-content-length',
    name: 'Content Length',
    maxPoints: 10,
    evaluate: (crawl) => {
      const wordCount = crawl.visibleText.split(/\s+/).filter(Boolean).length;
      if (wordCount >= 300) return { status: 'pass', points: 10, details: `Page has ${wordCount} words of visible content.` };
      if (wordCount >= 100) return { status: 'warn', points: 5, details: `Page has ${wordCount} words. Aim for at least 300 words.` };
      return { status: 'fail', points: 0, details: `Page has only ${wordCount} words. Thin content hurts rankings.` };
    },
  },

  // ─── NEW TECHNICAL SEO CHECKS ─────────────────────────────────────────────

  {
    id: 'seo-hsts-header',
    name: 'HSTS Header',
    maxPoints: 5,
    evaluate: (crawl) => {
      const td = crawl.technicalDetails;
      if (!td.isHttps) return { status: 'warn', points: 0, details: 'HSTS requires HTTPS. Enable HTTPS first.' };
      if (td.hstsHeader) return { status: 'pass', points: 5, details: 'Strict-Transport-Security header is present.' };
      return { status: 'warn', points: 0, details: 'Missing Strict-Transport-Security header. Add HSTS to prevent protocol downgrade attacks.' };
    },
  },
  {
    id: 'seo-redirect-chain',
    name: 'Redirect Chain',
    maxPoints: 5,
    evaluate: (crawl) => {
      const td = crawl.technicalDetails;
      if (td.redirectChainLength === 0) return { status: 'pass', points: 5, details: 'No redirect chain detected.' };
      if (td.redirectChainLength <= 3) return { status: 'warn', points: 3, details: `${td.redirectChainLength} redirect hop(s) detected. Minimize redirects for faster crawling.` };
      return { status: 'fail', points: 0, details: `${td.redirectChainLength} redirect hops detected (>3). Long chains waste crawl budget and slow loading.` };
    },
  },
  {
    id: 'seo-robots-wellformed',
    name: 'Robots.txt Well-Formed',
    maxPoints: 5,
    evaluate: (crawl) => {
      const td = crawl.technicalDetails;
      if (!td.robotsTxt.present) return { status: 'warn', points: 0, details: 'No robots.txt found.' };
      // Check if main page is blocked
      const pathname = (() => { try { return new URL(crawl.url).pathname; } catch { return '/'; } })();
      const isBlocked = td.robotsTxt.disallowRules.some((rule) => pathname.startsWith(rule));
      if (isBlocked) return { status: 'fail', points: 0, details: `Main page path (${pathname}) appears blocked by robots.txt Disallow rule.` };
      return { status: 'pass', points: 5, details: `robots.txt is present with ${td.robotsTxt.disallowRules.length} disallow and ${td.robotsTxt.allowRules.length} allow rules.` };
    },
  },
  {
    id: 'seo-sitemap-valid',
    name: 'XML Sitemap Validity',
    maxPoints: 5,
    evaluate: (crawl) => {
      const td = crawl.technicalDetails;
      if (!td.sitemap.present) return { status: 'warn', points: 0, details: 'No sitemap.xml found.' };
      if (td.sitemap.isIndex) return { status: 'pass', points: 5, details: `Sitemap index found. Contains references to sub-sitemaps.` };
      if (td.sitemap.urlCount > 0) return { status: 'pass', points: 5, details: `Sitemap contains ${td.sitemap.urlCount} URLs.` };
      return { status: 'warn', points: 2, details: 'Sitemap exists but appears empty.' };
    },
  },
  {
    id: 'seo-noindex-check',
    name: 'No Noindex on Important Pages',
    maxPoints: 5,
    evaluate: (crawl) => {
      const td = crawl.technicalDetails;
      if (td.hasNoindex) return { status: 'fail', points: 0, details: 'Page has noindex directive. Search engines will not index this page.' };
      if (td.hasNofollow) return { status: 'warn', points: 3, details: 'Page has nofollow directive. Links on this page won\'t pass link equity.' };
      return { status: 'pass', points: 5, details: 'No noindex or nofollow directives found.' };
    },
  },
  {
    id: 'seo-url-structure',
    name: 'URL Structure',
    maxPoints: 5,
    evaluate: (crawl) => {
      const td = crawl.technicalDetails;
      const ua = td.urlAnalysis;
      const issues: string[] = [];
      if (ua.length > 100) issues.push('too long (>100 chars)');
      if (ua.hasSpecialChars) issues.push('contains special characters');
      if (ua.hasUppercase) issues.push('contains uppercase letters');
      if (ua.hasDynamicParams) issues.push('has dynamic parameters');
      if (issues.length === 0) return { status: 'pass', points: 5, details: 'URL structure is clean and readable.' };
      if (issues.length === 1) return { status: 'warn', points: 3, details: `URL issue: ${issues[0]}.` };
      return { status: 'warn', points: 2, details: `URL issues: ${issues.join(', ')}. Clean URLs improve crawlability.` };
    },
  },
  {
    id: 'seo-broken-links',
    name: 'Broken Internal Links',
    maxPoints: 6,
    evaluate: (crawl) => {
      const td = crawl.technicalDetails;
      if (td.brokenInternalLinks.length === 0) return { status: 'pass', points: 6, details: 'No broken internal links found (sampled up to 20).' };
      if (td.brokenInternalLinks.length <= 3) return { status: 'warn', points: 3, details: `${td.brokenInternalLinks.length} broken internal link(s) found. Fix 404 errors to improve user experience.` };
      return { status: 'fail', points: 0, details: `${td.brokenInternalLinks.length} broken internal links found. These hurt UX and waste crawl budget.` };
    },
  },
  {
    id: 'seo-image-alt-coverage-90',
    name: 'Image Alt Coverage ≥ 90%',
    maxPoints: 5,
    evaluate: (crawl) => {
      const td = crawl.technicalDetails;
      if (td.totalImages === 0) return { status: 'pass', points: 5, details: 'No images to check.' };
      if (td.imageAltCoveragePct >= 90) return { status: 'pass', points: 5, details: `${td.imageAltCoveragePct}% image alt coverage (${td.totalImages - td.imagesMissingAlt}/${td.totalImages}).` };
      return { status: 'warn', points: 2, details: `${td.imageAltCoveragePct}% image alt coverage. ${td.imagesMissingAlt} of ${td.totalImages} images missing alt text.` };
    },
  },
  {
    id: 'seo-security-headers',
    name: 'Security Headers',
    maxPoints: 6,
    evaluate: (crawl) => {
      const sh = crawl.technicalDetails.securityHeaders;
      const present = [sh.xFrameOptions, sh.xContentTypeOptions, sh.strictTransportSecurity, sh.contentSecurityPolicy, sh.referrerPolicy, sh.permissionsPolicy];
      const count = present.filter(Boolean).length;
      const total = present.length;
      if (count >= 5) return { status: 'pass', points: 6, details: `${count}/${total} security headers present.` };
      if (count >= 3) return { status: 'warn', points: 3, details: `${count}/${total} security headers present. Consider adding more for better protection.` };
      return { status: 'fail', points: 0, details: `Only ${count}/${total} security headers present. Add X-Frame-Options, CSP, HSTS, etc.` };
    },
  },
  {
    id: 'seo-mixed-content',
    name: 'No Mixed Content',
    maxPoints: 5,
    evaluate: (crawl) => {
      const td = crawl.technicalDetails;
      if (!td.isHttps) return { status: 'pass', points: 5, details: 'Not applicable (site is not HTTPS).' };
      if (td.hasMixedContent) return { status: 'fail', points: 0, details: 'HTTP resources found on HTTPS page. This causes browser warnings and security issues.' };
      return { status: 'pass', points: 5, details: 'No mixed content detected.' };
    },
  },
  {
    id: 'seo-client-rendering',
    name: 'JavaScript Rendering Dependency',
    maxPoints: 5,
    evaluate: (crawl) => {
      const td = crawl.technicalDetails;
      if (td.reliesOnClientRendering) return { status: 'warn', points: 2, details: 'Page appears to rely heavily on client-side rendering. Search engines may not fully render JS content.' };
      return { status: 'pass', points: 5, details: 'Page content is server-rendered or pre-rendered.' };
    },
  },
  {
    id: 'seo-hreflang-consistency',
    name: 'Hreflang Consistency',
    maxPoints: 4,
    evaluate: (crawl) => {
      const td = crawl.technicalDetails;
      if (td.hreflangTags.length === 0) return { status: 'pass', points: 4, details: 'No hreflang tags (single-language site or not applicable).' };
      // Check for self-referencing hreflang
      const hasSelfRef = td.hreflangTags.some((t) => t.href === crawl.url);
      if (hasSelfRef) return { status: 'pass', points: 4, details: `${td.hreflangTags.length} hreflang tag(s) found with self-reference.` };
      return { status: 'warn', points: 2, details: `${td.hreflangTags.length} hreflang tag(s) found but missing self-reference.` };
    },
  },
  {
    id: 'seo-no-5xx-errors',
    name: 'No 5xx Errors on Sampled Links',
    maxPoints: 5,
    evaluate: (crawl) => {
      const td = crawl.technicalDetails;
      const serverErrors = td.brokenInternalLinks.filter((l) => l.statusCode >= 500);
      if (serverErrors.length === 0) return { status: 'pass', points: 5, details: 'No 5xx server errors found on sampled links.' };
      return { status: 'fail', points: 0, details: `${serverErrors.length} server error(s) (5xx) found on internal links.` };
    },
  },
];

export function analyzeSeo(crawl: CrawlResult): LayerResults {
  const checks: CheckResult[] = [];
  let totalPoints = 0;
  let maxScore = 0;

  for (const check of seoChecks) {
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
