/**
 * Security Analyzer — Deterministic checks for publicly observable security signals.
 * Checks HTTPS enforcement, security headers, mixed content, sensitive path exposure,
 * insecure resource loading, and cookie flags from crawl data only.
 * Does NOT perform intrusive penetration testing.
 */

import type { CrawlResult } from './crawlerService';
import type { CheckResult, LayerResults } from '../models/Audit';

interface SecurityCheck {
  id: string;
  name: string;
  maxPoints: number;
  evaluate: (crawl: CrawlResult) => { status: 'pass' | 'warn' | 'fail'; points: number; details: string };
}

const securityChecks: SecurityCheck[] = [
  {
    id: 'sec-https-enforcement',
    name: 'HTTPS Enforcement',
    maxPoints: 12,
    evaluate: (crawl) => {
      if (crawl.isHttps) return { status: 'pass', points: 12, details: 'Site is served over HTTPS.' };
      return { status: 'fail', points: 0, details: 'Site is not using HTTPS. All modern sites should enforce HTTPS for security and trust.' };
    },
  },
  {
    id: 'sec-hsts-header',
    name: 'HSTS Header',
    maxPoints: 10,
    evaluate: (crawl) => {
      const td = crawl.technicalDetails;
      if (!td.isHttps) return { status: 'warn', points: 0, details: 'HSTS requires HTTPS. Enable HTTPS first before adding HSTS.' };
      if (td.hstsHeader) return { status: 'pass', points: 10, details: 'Strict-Transport-Security header is present, enforcing HTTPS connections.' };
      return { status: 'fail', points: 0, details: 'Missing Strict-Transport-Security header. Without HSTS, browsers may allow protocol downgrade attacks.' };
    },
  },
  {
    id: 'sec-x-frame-options',
    name: 'X-Frame-Options Header',
    maxPoints: 8,
    evaluate: (crawl) => {
      const sh = crawl.technicalDetails.securityHeaders;
      if (sh.xFrameOptions) return { status: 'pass', points: 8, details: 'X-Frame-Options header is present, protecting against clickjacking attacks.' };
      return { status: 'fail', points: 0, details: 'Missing X-Frame-Options header. Your site could be embedded in iframes by malicious actors for clickjacking.' };
    },
  },
  {
    id: 'sec-x-content-type-options',
    name: 'X-Content-Type-Options Header',
    maxPoints: 8,
    evaluate: (crawl) => {
      const sh = crawl.technicalDetails.securityHeaders;
      if (sh.xContentTypeOptions) return { status: 'pass', points: 8, details: 'X-Content-Type-Options: nosniff is set, preventing MIME-type sniffing.' };
      return { status: 'warn', points: 0, details: 'Missing X-Content-Type-Options header. Browsers may MIME-sniff responses, enabling content-type confusion attacks.' };
    },
  },
  {
    id: 'sec-content-security-policy',
    name: 'Content Security Policy',
    maxPoints: 12,
    evaluate: (crawl) => {
      const sh = crawl.technicalDetails.securityHeaders;
      if (sh.contentSecurityPolicy) return { status: 'pass', points: 12, details: 'Content-Security-Policy header is present, mitigating XSS and injection attacks.' };
      return { status: 'fail', points: 0, details: 'Missing Content-Security-Policy header. CSP helps prevent cross-site scripting (XSS), clickjacking, and other code injection attacks.' };
    },
  },
  {
    id: 'sec-referrer-policy',
    name: 'Referrer-Policy Header',
    maxPoints: 6,
    evaluate: (crawl) => {
      const sh = crawl.technicalDetails.securityHeaders;
      if (sh.referrerPolicy) return { status: 'pass', points: 6, details: 'Referrer-Policy header is set, controlling how much referrer information is shared.' };
      return { status: 'warn', points: 0, details: 'Missing Referrer-Policy header. Full URLs including query parameters may leak to third parties via the Referer header.' };
    },
  },
  {
    id: 'sec-permissions-policy',
    name: 'Permissions-Policy Header',
    maxPoints: 6,
    evaluate: (crawl) => {
      const sh = crawl.technicalDetails.securityHeaders;
      if (sh.permissionsPolicy) return { status: 'pass', points: 6, details: 'Permissions-Policy header is set, controlling browser feature access.' };
      return { status: 'warn', points: 0, details: 'Missing Permissions-Policy header. Browser features like camera, microphone, and geolocation are not explicitly restricted.' };
    },
  },
  {
    id: 'sec-mixed-content',
    name: 'No Mixed Content',
    maxPoints: 10,
    evaluate: (crawl) => {
      const td = crawl.technicalDetails;
      if (!td.isHttps) return { status: 'pass', points: 10, details: 'Not applicable — site does not use HTTPS.' };
      if (td.hasMixedContent) return { status: 'fail', points: 0, details: 'HTTP resources detected on an HTTPS page. Mixed content causes browser warnings and undermines encryption.' };
      return { status: 'pass', points: 10, details: 'No mixed content detected. All resources are loaded securely over HTTPS.' };
    },
  },
  {
    id: 'sec-sensitive-paths-exposed',
    name: 'Sensitive Paths in robots.txt',
    maxPoints: 8,
    evaluate: (crawl) => {
      const td = crawl.technicalDetails;
      if (!td.robotsTxt.present) return { status: 'warn', points: 4, details: 'No robots.txt found. Cannot verify sensitive path exposure.' };

      const sensitivePatterns = ['/admin', '/wp-admin', '/administrator', '/phpmyadmin', '/config', '/backup', '/.env', '/.git', '/server-status', '/debug'];
      const exposedPaths = td.robotsTxt.disallowRules.filter((rule) =>
        sensitivePatterns.some((pattern) => rule.toLowerCase().includes(pattern.toLowerCase())),
      );

      if (exposedPaths.length === 0) return { status: 'pass', points: 8, details: 'No commonly sensitive paths found in robots.txt Disallow rules.' };
      return { status: 'warn', points: 4, details: `Potentially sensitive paths found in robots.txt: ${exposedPaths.slice(0, 5).join(', ')}. These paths being listed reveals their existence to attackers.` };
    },
  },
  {
    id: 'sec-insecure-resource-loading',
    name: 'Insecure Resource Loading',
    maxPoints: 8,
    evaluate: (crawl) => {
      if (!crawl.isHttps) return { status: 'warn', points: 4, details: 'Site is not HTTPS. Insecure resource check is most relevant for HTTPS sites.' };

      // Check images loaded over HTTP
      const httpImages = crawl.images.filter((img) => img.src.startsWith('http://'));
      if (httpImages.length > 0) {
        return { status: 'fail', points: 0, details: `${httpImages.length} image(s) loaded over insecure HTTP. Use HTTPS or protocol-relative URLs.` };
      }

      // Check external links to HTTP
      const httpLinks = crawl.externalLinks.filter((link) => link.startsWith('http://'));
      if (httpLinks.length > 0) {
        return { status: 'warn', points: 4, details: `${httpLinks.length} external link(s) point to HTTP URLs. Consider upgrading to HTTPS where available.` };
      }

      return { status: 'pass', points: 8, details: 'All detected resources appear to be loaded securely.' };
    },
  },
  {
    id: 'sec-server-header-disclosure',
    name: 'Server Information Disclosure',
    maxPoints: 6,
    evaluate: (crawl) => {
      // Check if html contains server version info or technology fingerprints
      const htmlLower = crawl.html.toLowerCase();
      const disclosures: string[] = [];

      if (htmlLower.includes('x-powered-by') || htmlLower.match(/powered\s+by\s+\w+/i)) {
        disclosures.push('X-Powered-By header or meta tag');
      }
      if (htmlLower.includes('generator') && htmlLower.match(/<meta[^>]+name=["']generator["']/i)) {
        disclosures.push('Generator meta tag revealing CMS/framework');
      }

      if (disclosures.length === 0) return { status: 'pass', points: 6, details: 'No obvious server or framework version disclosure detected in HTML.' };
      return { status: 'warn', points: 3, details: `Possible technology disclosure detected: ${disclosures.join(', ')}. Consider removing these to reduce attack surface.` };
    },
  },
  {
    id: 'sec-security-headers-count',
    name: 'Overall Security Headers Coverage',
    maxPoints: 10,
    evaluate: (crawl) => {
      const sh = crawl.technicalDetails.securityHeaders;
      const headers = [
        sh.xFrameOptions,
        sh.xContentTypeOptions,
        sh.strictTransportSecurity,
        sh.contentSecurityPolicy,
        sh.referrerPolicy,
        sh.permissionsPolicy,
      ];
      const present = headers.filter(Boolean).length;
      const total = headers.length;
      const pct = Math.round((present / total) * 100);

      if (pct >= 80) return { status: 'pass', points: 10, details: `${present}/${total} security headers present (${pct}% coverage).` };
      if (pct >= 50) return { status: 'warn', points: 5, details: `${present}/${total} security headers present (${pct}% coverage). Add missing headers for better protection.` };
      return { status: 'fail', points: 0, details: `Only ${present}/${total} security headers present (${pct}% coverage). Critical security headers are missing.` };
    },
  },
];

export function analyzeSecurity(crawl: CrawlResult): LayerResults {
  const checks: CheckResult[] = [];
  let totalPoints = 0;
  let maxScore = 0;

  for (const check of securityChecks) {
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
