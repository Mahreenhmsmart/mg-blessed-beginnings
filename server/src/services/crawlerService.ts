/**
 * Crawler Service — Fetches a target URL's HTML and extracts structured data
 * for downstream analysis. Uses Node's built-in fetch (Node 18+).
 */

export interface HeadingInfo {
  level: number;
  text: string;
}

export interface ImageInfo {
  src: string;
  alt: string | null;
  hasAlt: boolean;
}

export interface StructuredDataItem {
  type: string;
  raw: Record<string, unknown>;
}

export interface SecurityHeaders {
  xFrameOptions: boolean;
  xContentTypeOptions: boolean;
  strictTransportSecurity: boolean;
  contentSecurityPolicy: boolean;
  referrerPolicy: boolean;
  permissionsPolicy: boolean;
}

export interface RobotsTxtDetails {
  present: boolean;
  disallowRules: string[];
  allowRules: string[];
  crawlDelay: number | null;
  sitemaps: string[];
}

export interface SitemapDetails {
  present: boolean;
  urlCount: number;
  isIndex: boolean;
}

export interface BrokenLink {
  url: string;
  statusCode: number;
}

export interface UrlAnalysis {
  length: number;
  hasSpecialChars: boolean;
  hasUppercase: boolean;
  hasDynamicParams: boolean;
  hasTrailingSlash: boolean;
  depth: number;
}

export interface TechnicalSEODetails {
  // HTTPS & security
  isHttps: boolean;
  hasMixedContent: boolean;
  hstsHeader: boolean;
  securityHeaders: SecurityHeaders;

  // Status & redirects
  finalStatusCode: number;
  redirectChain: string[];
  redirectChainLength: number;

  // robots.txt
  robotsTxt: RobotsTxtDetails;

  // XML sitemap
  sitemap: SitemapDetails;

  // Canonical
  canonicalUrl: string | null;
  isSelfReferencingCanonical: boolean;

  // Indexing directives
  hasNoindex: boolean;
  hasNofollow: boolean;

  // Mobile
  hasMobileViewport: boolean;
  viewportContent: string | null;

  // Images
  totalImages: number;
  imagesMissingAlt: number;
  imageAltCoveragePct: number;

  // Links
  brokenInternalLinks: BrokenLink[];
  internalLinkCount: number;
  externalLinkCount: number;

  // Hreflang
  hreflangTags: Array<{ lang: string; href: string }>;

  // URL structure
  urlAnalysis: UrlAnalysis;

  // JS rendering detection
  reliesOnClientRendering: boolean;

  // Pagination
  hasNextRel: boolean;
  hasPrevRel: boolean;
}

export interface CrawlResult {
  url: string;
  statusCode: number;
  html: string;
  title: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
  canonicalUrl: string | null;
  ogTags: Record<string, string>;
  headings: HeadingInfo[];
  internalLinks: string[];
  externalLinks: string[];
  images: ImageInfo[];
  structuredData: StructuredDataItem[];
  hasSitemap: boolean;
  hasRobotsTxt: boolean;
  hasViewportMeta: boolean;
  isHttps: boolean;
  loadTimeMs: number;
  visibleText: string;
  navLinks: string[];
  hasFaqSchema: boolean;
  hasBreadcrumbSchema: boolean;
  hasOrganizationSchema: boolean;
  hasPersonSchema: boolean;
  hasLogoSchema: boolean;
  hasPrivacyPolicyLink: boolean;
  hasAboutLink: boolean;
  hasContactLink: boolean;
  contentLength: number;
  paragraphCount: number;
  listCount: number;
  tableCount: number;
  definitionListCount: number;
  questionHeadings: HeadingInfo[];
  shortAnswerParagraphs: number;
  technicalDetails: TechnicalSEODetails;
}

function extractMetaContent(html: string, name: string): string | null {
  const regex = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`,
    'i',
  );
  const match = html.match(regex);
  if (!match) {
    // Try reversed attribute order
    const regex2 = new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${name}["']`,
      'i',
    );
    const match2 = html.match(regex2);
    return match2 ? match2[1] : null;
  }
  return match[1];
}

function extractOgTags(html: string): Record<string, string> {
  const tags: Record<string, string> = {};
  const regex = /<meta[^>]+property=["']og:([^"']+)["'][^>]+content=["']([^"']*)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    tags[match[1]] = match[2];
  }
  // Also try reversed attribute order
  const regex2 = /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:([^"']+)["']/gi;
  while ((match = regex2.exec(html)) !== null) {
    tags[match[2]] = match[1];
  }
  return tags;
}

function extractHeadings(html: string): HeadingInfo[] {
  const headings: HeadingInfo[] = [];
  const regex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    if (text) {
      headings.push({ level: parseInt(match[1], 10), text });
    }
  }
  return headings;
}

function extractLinks(html: string, baseUrl: string): { internal: string[]; external: string[] } {
  const internal: string[] = [];
  const external: string[] = [];
  const regex = /<a[^>]+href=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;

  let baseOrigin: string;
  try {
    baseOrigin = new URL(baseUrl).origin;
  } catch {
    baseOrigin = '';
  }

  while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      continue;
    }
    try {
      const linkUrl = new URL(href, baseUrl);
      if (linkUrl.origin === baseOrigin) {
        internal.push(linkUrl.href);
      } else {
        external.push(linkUrl.href);
      }
    } catch {
      // Relative or malformed — treat as internal if starts with /
      if (href.startsWith('/')) {
        internal.push(href);
      }
    }
  }

  return {
    internal: [...new Set(internal)],
    external: [...new Set(external)],
  };
}

function extractImages(html: string): ImageInfo[] {
  const images: ImageInfo[] = [];
  const regex = /<img[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const tag = match[0];
    const srcMatch = tag.match(/src=["']([^"']+)["']/i);
    const altMatch = tag.match(/alt=["']([^"']*)["']/i);
    const src = srcMatch ? srcMatch[1] : '';
    const alt = altMatch ? altMatch[1] : null;
    if (src) {
      images.push({ src, alt, hasAlt: altMatch !== null && alt !== null });
    }
  }
  return images;
}

function extractStructuredData(html: string): StructuredDataItem[] {
  const items: StructuredDataItem[] = [];
  const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      // Handle @graph arrays
      if (data['@graph'] && Array.isArray(data['@graph'])) {
        for (const item of data['@graph']) {
          if (item['@type']) {
            items.push({ type: String(item['@type']), raw: item });
          }
        }
      } else if (data['@type']) {
        items.push({ type: String(data['@type']), raw: data });
      }
    } catch {
      // Invalid JSON-LD, skip
    }
  }
  return items;
}

function stripHtmlTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function checkUrlExists(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

/** Fetch a URL following redirects manually to capture the redirect chain */
async function fetchWithRedirectChain(
  url: string,
  maxRedirects = 10,
): Promise<{ response: Response; chain: string[] }> {
  const chain: string[] = [];
  let currentUrl = url;

  for (let i = 0; i < maxRedirects; i++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(currentUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'MGVisibilityBot/1.0 (Website Analysis)',
          Accept: 'text/html,application/xhtml+xml',
        },
        redirect: 'manual',
      });
      clearTimeout(timeout);

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location');
        if (!location) break;
        chain.push(`${res.status} → ${location}`);
        // Resolve relative redirects
        try {
          currentUrl = new URL(location, currentUrl).href;
        } catch {
          currentUrl = location;
        }
        continue;
      }

      return { response: res, chain };
    } catch {
      clearTimeout(timeout);
      throw new Error(`Failed to fetch ${currentUrl} during redirect tracking`);
    }
  }

  // Too many redirects — fetch the last URL with follow
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  const res = await fetch(currentUrl, {
    signal: controller.signal,
    headers: {
      'User-Agent': 'MGVisibilityBot/1.0 (Website Analysis)',
      Accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
  });
  clearTimeout(timeout);
  return { response: res, chain };
}

/** Parse robots.txt content into structured directives */
function parseRobotsTxt(content: string): RobotsTxtDetails {
  const disallowRules: string[] = [];
  const allowRules: string[] = [];
  const sitemaps: string[] = [];
  let crawlDelay: number | null = null;

  const lines = content.split('\n');
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const lowerLine = line.toLowerCase();
    if (lowerLine.startsWith('disallow:')) {
      const value = line.substring(9).trim();
      if (value) disallowRules.push(value);
    } else if (lowerLine.startsWith('allow:')) {
      const value = line.substring(6).trim();
      if (value) allowRules.push(value);
    } else if (lowerLine.startsWith('crawl-delay:')) {
      const value = line.substring(12).trim();
      const num = parseFloat(value);
      if (!isNaN(num)) crawlDelay = num;
    } else if (lowerLine.startsWith('sitemap:')) {
      const value = line.substring(8).trim();
      if (value) sitemaps.push(value);
    }
  }

  return { present: true, disallowRules, allowRules, crawlDelay, sitemaps };
}

/** Parse XML sitemap content */
async function parseSitemap(origin: string): Promise<SitemapDetails> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${origin}/sitemap.xml`, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return { present: false, urlCount: 0, isIndex: false };

    const xml = await res.text();
    const isIndex = /<sitemapindex[\s>]/i.test(xml);
    // Count <url> or <loc> entries
    const urlMatches = xml.match(/<url[\s>]/gi) || [];
    const locMatches = xml.match(/<loc>/gi) || [];
    const urlCount = Math.max(urlMatches.length, locMatches.length);

    return { present: true, urlCount, isIndex };
  } catch {
    return { present: false, urlCount: 0, isIndex: false };
  }
}

/** Check internal links for broken responses (sample up to maxLinks) */
async function sampleBrokenLinks(
  internalLinks: string[],
  maxLinks = 20,
): Promise<BrokenLink[]> {
  const broken: BrokenLink[] = [];
  const sampled = [...new Set(internalLinks)].slice(0, maxLinks);

  const checks = sampled.map(async (linkUrl) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(linkUrl, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeout);
      if (res.status >= 400) {
        broken.push({ url: linkUrl, statusCode: res.status });
      }
    } catch {
      // Timeout or network error — skip silently
    }
  });

  await Promise.all(checks);
  return broken;
}

/** Analyze URL structure */
function analyzeUrlStructure(url: string): UrlAnalysis {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const hasSpecialChars = /[!@#$%^&*()+=\[\]{}|\\<>?,;:'"]/.test(pathname);
    const hasUppercase = /[A-Z]/.test(pathname);
    const hasDynamicParams = parsed.search.length > 1;
    const hasTrailingSlash = pathname.length > 1 && pathname.endsWith('/');
    const depth = pathname.split('/').filter(Boolean).length;

    return {
      length: url.length,
      hasSpecialChars,
      hasUppercase,
      hasDynamicParams,
      hasTrailingSlash,
      depth,
    };
  } catch {
    return {
      length: url.length,
      hasSpecialChars: false,
      hasUppercase: false,
      hasDynamicParams: false,
      hasTrailingSlash: false,
      depth: 0,
    };
  }
}

/** Detect if page relies heavily on client-side rendering */
function detectClientRendering(html: string): boolean {
  // Check for empty body with only script tags
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) return false;
  const bodyContent = bodyMatch[1];

  // Remove scripts and styles
  const withoutScripts = bodyContent
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .trim();

  // If very little visible content remains, likely CSR
  const textContent = withoutScripts.replace(/<[^>]+>/g, '').trim();
  if (textContent.length < 100) {
    // Check for framework root divs
    const hasFrameworkRoot =
      /id=["'](?:app|root|__next|__nuxt)["']/i.test(bodyContent) ||
      /class=["'][^"']*(?:react-app|vue-app|ng-app)[^"']*["']/i.test(bodyContent);
    if (hasFrameworkRoot) return true;
  }

  return false;
}

/** Extract hreflang tags from HTML */
function extractHreflangTags(html: string): Array<{ lang: string; href: string }> {
  const tags: Array<{ lang: string; href: string }> = [];
  const regex = /<link[^>]+rel=["']alternate["'][^>]+hreflang=["']([^"']+)["'][^>]+href=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    tags.push({ lang: match[1], href: match[2] });
  }
  // Also try reversed attribute order
  const regex2 = /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']alternate["'][^>]+hreflang=["']([^"']+)["']/gi;
  while ((match = regex2.exec(html)) !== null) {
    tags.push({ lang: match[2], href: match[1] });
  }
  return tags;
}

/** Check for mixed content (HTTP resources on HTTPS page) */
function detectMixedContent(html: string, isHttps: boolean): boolean {
  if (!isHttps) return false;
  // Look for HTTP src/href in img, script, link, iframe tags
  const httpResourceRegex = /(?:src|href)=["']http:\/\/[^"']+["']/gi;
  return httpResourceRegex.test(html);
}

export async function crawlUrl(url: string): Promise<CrawlResult> {
  const startTime = Date.now();

  // Fetch with redirect tracking
  let res: Response;
  let redirectChain: string[] = [];
  try {
    const result = await fetchWithRedirectChain(url);
    res = result.response;
    redirectChain = result.chain;
  } catch (err) {
    // Fallback to simple fetch if redirect tracking fails
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'MGVisibilityBot/1.0 (Website Analysis)',
          Accept: 'text/html,application/xhtml+xml',
        },
        redirect: 'follow',
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  const loadTimeMs = Date.now() - startTime;

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
  }

  const html = await res.text();
  const isHttps = url.startsWith('https://');
  const finalStatusCode = res.status;

  // Extract security headers
  const securityHeaders: SecurityHeaders = {
    xFrameOptions: res.headers.has('x-frame-options'),
    xContentTypeOptions: res.headers.has('x-content-type-options'),
    strictTransportSecurity: res.headers.has('strict-transport-security'),
    contentSecurityPolicy: res.headers.has('content-security-policy'),
    referrerPolicy: res.headers.has('referrer-policy'),
    permissionsPolicy: res.headers.has('permissions-policy'),
  };

  // Extract metadata
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;
  const metaDescription = extractMetaContent(html, 'description');
  const metaKeywordsRaw = extractMetaContent(html, 'keywords');
  const metaKeywords = metaKeywordsRaw
    ? metaKeywordsRaw.split(',').map((k) => k.trim()).filter(Boolean)
    : [];
  const canonicalUrl = (() => {
    // Check <link rel="canonical"> first
    const linkMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
    if (linkMatch) return linkMatch[1];
    // Fallback to meta tag
    return extractMetaContent(html, 'canonical');
  })();

  const ogTags = extractOgTags(html);
  const headings = extractHeadings(html);
  const { internal: internalLinks, external: externalLinks } = extractLinks(html, url);
  const images = extractImages(html);
  const structuredData = extractStructuredData(html);

  // Viewport meta
  const viewportMatch = html.match(/<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']*)["']/i);
  const hasViewportMeta = viewportMatch !== null || /<meta[^>]+name=["']viewport["']/i.test(html);
  const viewportContent = viewportMatch ? viewportMatch[1] : null;

  const visibleText = stripHtmlTags(html);

  // Check sitemap and robots.txt
  let baseOrigin: string;
  try {
    baseOrigin = new URL(url).origin;
  } catch {
    baseOrigin = url;
  }

  // Parallel fetches for robots.txt and sitemap parsing
  const [robotsTxtResult, sitemapDetails, brokenLinks] = await Promise.all([
    // robots.txt
    (async (): Promise<RobotsTxtDetails> => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const robotsRes = await fetch(`${baseOrigin}/robots.txt`, { signal: controller.signal });
        clearTimeout(timeout);
        if (robotsRes.ok) {
          const content = await robotsRes.text();
          return parseRobotsTxt(content);
        }
        return { present: false, disallowRules: [], allowRules: [], crawlDelay: null, sitemaps: [] };
      } catch {
        return { present: false, disallowRules: [], allowRules: [], crawlDelay: null, sitemaps: [] };
      }
    })(),
    // Sitemap
    parseSitemap(baseOrigin),
    // Broken links sampling
    sampleBrokenLinks(internalLinks, 20),
  ]);

  const hasSitemap = sitemapDetails.present;
  const hasRobotsTxt = robotsTxtResult.present;

  // Navigation links (links inside <nav> elements)
  const navMatches = html.match(/<nav[\s\S]*?<\/nav>/gi) || [];
  const navLinks: string[] = [];
  for (const navHtml of navMatches) {
    const linkRegex = /<a[^>]+href=["']([^"']+)["']/gi;
    let m: RegExpExecArray | null;
    while ((m = linkRegex.exec(navHtml)) !== null) {
      navLinks.push(m[1]);
    }
  }

  // Schema type checks
  const schemaTypes = structuredData.map((s) => s.type.toLowerCase());
  const hasFaqSchema = schemaTypes.some((t) => t.includes('faqpage') || t.includes('faq'));
  const hasBreadcrumbSchema = schemaTypes.some((t) => t.includes('breadcrumblist'));
  const hasOrganizationSchema = schemaTypes.some((t) => t.includes('organization') || t.includes('localbusiness'));
  const hasPersonSchema = schemaTypes.some((t) => t.includes('person'));
  const hasLogoSchema = structuredData.some(
    (s) => s.raw.logo !== undefined || schemaTypes.some((t) => t.includes('imageobject')),
  );

  // Trust signal links
  const allLinksLower = [...internalLinks, ...externalLinks].map((l) => l.toLowerCase());
  const hasPrivacyPolicyLink = allLinksLower.some((l) => l.includes('privacy'));
  const hasAboutLink = allLinksLower.some((l) => l.includes('about'));
  const hasContactLink = allLinksLower.some((l) => l.includes('contact'));

  // Content structure analysis
  const paragraphCount = (html.match(/<p[\s>]/gi) || []).length;
  const listCount = (html.match(/<[uo]l[\s>]/gi) || []).length;
  const tableCount = (html.match(/<table[\s>]/gi) || []).length;
  const definitionListCount = (html.match(/<dl[\s>]/gi) || []).length;

  // Question headings (h2/h3 that end with ? or start with What/How/Why/etc.)
  const questionWords = /^(what|how|why|when|where|who|which|can|should|does|do|is|are|will|could)/i;
  const questionHeadings = headings.filter(
    (h) => h.level >= 2 && h.level <= 3 && (h.text.endsWith('?') || questionWords.test(h.text)),
  );

  // Short answer paragraphs (< 20 words, near headings)
  const paragraphs = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  let shortAnswerParagraphs = 0;
  for (const p of paragraphs) {
    const text = p.replace(/<[^>]+>/g, '').trim();
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount > 0 && wordCount <= 20) {
      shortAnswerParagraphs++;
    }
  }

  // Noindex/nofollow detection
  const robotsMetaContent = extractMetaContent(html, 'robots') || '';
  const hasNoindex = robotsMetaContent.toLowerCase().includes('noindex');
  const hasNofollow = robotsMetaContent.toLowerCase().includes('nofollow');

  // Self-referencing canonical check
  const isSelfReferencingCanonical = canonicalUrl !== null && canonicalUrl === url;

  // Image alt coverage
  const totalImages = images.length;
  const imagesMissingAlt = images.filter((i) => !i.hasAlt).length;
  const imageAltCoveragePct = totalImages > 0 ? Math.round(((totalImages - imagesMissingAlt) / totalImages) * 100) : 100;

  // Mixed content
  const hasMixedContent = detectMixedContent(html, isHttps);

  // Hreflang
  const hreflangTags = extractHreflangTags(html);

  // URL analysis
  const urlAnalysis = analyzeUrlStructure(url);

  // Client rendering detection
  const reliesOnClientRendering = detectClientRendering(html);

  // Pagination
  const hasNextRel = /<link[^>]+rel=["']next["']/i.test(html);
  const hasPrevRel = /<link[^>]+rel=["']prev["']/i.test(html);

  // Build technical details
  const technicalDetails: TechnicalSEODetails = {
    isHttps,
    hasMixedContent,
    hstsHeader: securityHeaders.strictTransportSecurity,
    securityHeaders,
    finalStatusCode,
    redirectChain,
    redirectChainLength: redirectChain.length,
    robotsTxt: robotsTxtResult,
    sitemap: sitemapDetails,
    canonicalUrl,
    isSelfReferencingCanonical,
    hasNoindex,
    hasNofollow,
    hasMobileViewport: hasViewportMeta,
    viewportContent,
    totalImages,
    imagesMissingAlt,
    imageAltCoveragePct,
    brokenInternalLinks: brokenLinks,
    internalLinkCount: internalLinks.length,
    externalLinkCount: externalLinks.length,
    hreflangTags,
    urlAnalysis,
    reliesOnClientRendering,
    hasNextRel,
    hasPrevRel,
  };

  return {
    url,
    statusCode: finalStatusCode,
    html,
    title,
    metaDescription,
    metaKeywords,
    canonicalUrl,
    ogTags,
    headings,
    internalLinks,
    externalLinks,
    images,
    structuredData,
    hasSitemap,
    hasRobotsTxt,
    hasViewportMeta,
    isHttps,
    loadTimeMs,
    visibleText,
    navLinks,
    hasFaqSchema,
    hasBreadcrumbSchema,
    hasOrganizationSchema,
    hasPersonSchema,
    hasLogoSchema,
    hasPrivacyPolicyLink,
    hasAboutLink,
    hasContactLink,
    contentLength: visibleText.length,
    paragraphCount,
    listCount,
    tableCount,
    definitionListCount,
    questionHeadings,
    shortAnswerParagraphs,
    technicalDetails,
  };
}
