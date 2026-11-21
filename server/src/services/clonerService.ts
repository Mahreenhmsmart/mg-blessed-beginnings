import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { URL } from 'url';
import Clone from '../models/Clone';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLONE_DIR = path.join(process.cwd(), 'uploads', 'clones');

/**
 * Options for cloning a website.
 */
export interface CloneOptions {
  /** Whether to inject a promotional banner. Default: true */
  banner?: boolean;
  /** Maximum HTML size in bytes. Default: 3145728 (3 MB) */
  maxHtmlBytes?: number;
  /** Fetch timeout in milliseconds. Default: 30000 (30 s — headless browser needs more time) */
  timeoutMs?: number;
  /** Custom clones directory. Default: ./clones relative to server root */
  clonesDir?: string;
}

const DEFAULT_MAX_HTML_BYTES = 3145728; // 3 MB
const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds (headless browser needs more time than raw fetch)
const MAX_IMAGE_EMBED_BYTES = 51200; // 50 KB for base64 embedding

/**
 * Returns the default clones directory (uploads/clones relative to cwd).
 */
function getDefaultClonesDir(): string {
  return CLONE_DIR;
}

// Track ensured directories to avoid repeated mkdir calls
const ensuredDirs = new Set<string>();

function ensureClonesDir(dir: string): void {
  if (!ensuredDirs.has(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    ensuredDirs.add(dir);
  }
}

/**
 * Validates that a URL is a valid HTTP or HTTPS URL and blocks localhost/private IPs.
 */
function isValidHttpUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }

    // Block localhost and private IP addresses
    const hostname = url.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.2') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a URL points to a private/internal address.
 */
function isPrivateUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname.toLowerCase();
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.2') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    );
  } catch {
    return true;
  }
}

/**
 * Resolves a potentially relative URL against a base URL.
 * Returns null for data:, mailto:, tel:, #, javascript: URLs.
 */
function resolveUrl(urlStr: string, baseUrl: string): string | null {
  try {
    if (/^https?:\/\//i.test(urlStr)) return urlStr;
    if (urlStr.startsWith('//')) {
      const base = new URL(baseUrl);
      return `${base.protocol}${urlStr}`;
    }
    if (/^(data:|mailto:|tel:|#|javascript:)/i.test(urlStr)) return null;
    return new URL(urlStr, baseUrl).href;
  } catch {
    return null;
  }
}

/**
 * Strips all <script> tags from HTML.
 */
function stripScripts(html: string): string {
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

/**
 * Removes inline event handler attributes (onclick, onload, onerror, etc.).
 */
function stripEventHandlers(html: string): string {
  return html.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
}

/**
 * Injects a <base> tag into the <head> so relative asset URLs resolve
 * correctly when the cloned HTML is viewed from a different origin.
 */
function injectBaseTag(html: string, baseUrl: string): string {
  const baseTag = `<base href="${baseUrl}">`;
  // Try to inject after <head> tag
  const headMatch = html.match(/<head([^>]*)>/i);
  if (headMatch) {
    const insertPos = html.indexOf(headMatch[0]) + headMatch[0].length;
    return html.slice(0, insertPos) + baseTag + html.slice(insertPos);
  }
  // Fallback: prepend to document
  return baseTag + html;
}

/**
 * Generates a promotional banner HTML block to inject into cloned pages.
 */
function generateBannerHtml(): string {
  return `
<div id="cloner-banner" style="position:fixed;top:0;left:0;right:0;z-index:999999;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:10px 16px;font-family:system-ui,-apple-system,sans-serif;font-size:14px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.15);">
  <span>This page was cloned with <a href="/" target="_blank" style="color:#fff;text-decoration:underline;font-weight:600;">MG Website Cloner</a></span>
  <button id="cloner-banner-close" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:#fff;cursor:pointer;font-size:18px;line-height:1;padding:4px;" aria-label="Dismiss banner">&times;</button>
</div>
<style>#cloner-banner-close:hover{opacity:0.8}</style>
`;
}

/**
 * Injects the banner at the top of the body element.
 */
function injectBanner(html: string): string {
  const banner = generateBannerHtml();
  const bodyMatch = html.match(/<body([^>]*)>/i);
  if (bodyMatch) {
    const insertPos = html.indexOf(bodyMatch[0]) + bodyMatch[0].length;
    return html.slice(0, insertPos) + banner + html.slice(insertPos);
  }
  return banner + html;
}

/**
 * Adds a small script to handle banner dismiss functionality.
 */
function addBannerScript(html: string): string {
  const script = `<script>document.getElementById('cloner-banner-close')&&document.getElementById('cloner-banner-close').addEventListener('click',function(){document.getElementById('cloner-banner').remove()});</script>`;
  if (html.includes('</body>')) {
    return html.replace('</body>', `${script}</body>`);
  }
  return html + script;
}

/**
 * Checks if the captured HTML has meaningful visible content.
 * Returns true if the page appears to have real content beyond empty containers.
 */
function hasMeaningfulContent(html: string): boolean {
  // Strip scripts and styles to check only visible content
  const stripped = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ') // Remove all tags
    .replace(/\s+/g, ' ')     // Collapse whitespace
    .trim();

  // If there's less than 100 characters of visible text, it's likely empty/placeholder
  if (stripped.length < 100) {
    return false;
  }

  // Check for common "empty SPA" indicators
  const lowerHtml = html.toLowerCase();
  const hasAppRoot = lowerHtml.includes('id="app"') || lowerHtml.includes('id="root"') || lowerHtml.includes('id="__next"');
  const hasNoChildContent = /<(div|main|section)\s+(?:id|class)=["'](?:app|root|__next)["'][^>]*>\s*<\/(div|main|section)>/i.test(html);

  if (hasAppRoot && hasNoChildContent) {
    return false;
  }

  return true;
}

/**
 * Extracts stylesheet URLs from HTML link tags.
 */
function extractStylesheetUrls(html: string, baseUrl: string): { originalTag: string; resolvedUrl: string }[] {
  const results: { originalTag: string; resolvedUrl: string }[] = [];
  const linkRegex = /<link[^>]+rel\s*=\s*["']?stylesheet["']?[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(html)) !== null) {
    const tag = match[0];
    const hrefMatch = tag.match(/href\s*=\s*["']([^"']+)["']/i);
    if (hrefMatch) {
      const resolved = resolveUrl(hrefMatch[1], baseUrl);
      if (resolved) results.push({ originalTag: tag, resolvedUrl: resolved });
    }
  }
  return results;
}

/**
 * Rewrites relative CSS url() references to absolute URLs.
 */
function rewriteCssUrls(css: string, cssBaseUrl: string): string {
  return css.replace(
    /url\(\s*['"]?(?!https?:\/\/|data:)([^'")]+)['"]?\s*\)/gi,
    (_match, value: string) => {
      const resolved = resolveUrl(value.trim(), cssBaseUrl);
      return resolved ? `url('${resolved}')` : `url('${value}')`;
    }
  );
}

/**
 * Fetches a resource with timeout and size limits. Returns null on failure.
 */
async function fetchResource(url: string, timeoutMs: number, maxBytes: number): Promise<{ content: string; contentType: string } | null> {
  if (isPrivateUrl(url)) return null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MGWebsiteCloner/1.0)', Accept: '*/*' },
      redirect: 'follow',
    });
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type') || '';
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > maxBytes) return null;
    return { content: buffer.toString('utf-8'), contentType };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetches an image and converts it to a base64 data URI. Returns null on failure or if too large.
 */
async function fetchImageAsBase64(url: string, timeoutMs: number, maxBytes: number): Promise<string | null> {
  if (isPrivateUrl(url)) return null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MGWebsiteCloner/1.0)', Accept: 'image/*' },
      redirect: 'follow',
    });
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type') || 'image/png';
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > maxBytes) return null;
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Inlines external stylesheets into the HTML.
 */
async function inlineStylesheets(html: string, baseUrl: string, timeoutMs: number): Promise<string> {
  const stylesheets = extractStylesheetUrls(html, baseUrl);
  let processed = html;
  const cssResults = await Promise.all(
    stylesheets.map(async ({ originalTag, resolvedUrl }) => {
      const result = await fetchResource(resolvedUrl, timeoutMs, 1024 * 1024);
      return { originalTag, css: result?.content || null, url: resolvedUrl };
    })
  );
  for (const { originalTag, css, url } of cssResults) {
    if (css) {
      const rewrittenCss = rewriteCssUrls(css, url);
      processed = processed.replace(originalTag, `<style data-cloned-from="${url}">${rewrittenCss}</style>`);
    } else {
      processed = processed.replace(originalTag, '');
    }
  }
  return processed;
}

/**
 * Embeds small images as base64 data URIs.
 */
async function embedSmallImages(html: string, baseUrl: string, timeoutMs: number, maxImageBytes: number): Promise<string> {
  let processed = html;
  const imgRegex = /<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/gi;
  const matches: { originalTag: string; srcUrl: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = imgRegex.exec(html)) !== null) {
    const tag = match[0];
    const srcValue = match[1];
    if (srcValue.startsWith('data:')) continue;
    const resolved = resolveUrl(srcValue, baseUrl);
    if (resolved) matches.push({ originalTag: tag, srcUrl: resolved });
  }
  const batchSize = 10;
  for (let i = 0; i < matches.length; i += batchSize) {
    const batch = matches.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async ({ originalTag, srcUrl }) => {
        const dataUri = await fetchImageAsBase64(srcUrl, timeoutMs, maxImageBytes);
        return { originalTag, dataUri, srcUrl };
      })
    );
    for (const { originalTag, dataUri, srcUrl } of results) {
      if (dataUri) {
        processed = processed.replace(originalTag, originalTag.replace(/src\s*=\s*["'][^"']+["']/i, `src="${dataUri}"`));
      } else {
        processed = processed.replace(originalTag, originalTag.replace(/src\s*=\s*["'][^"']+["']/i, `src="${srcUrl}"`));
      }
    }
  }
  return processed;
}

/**
 * Rewrites remaining relative URLs to absolute.
 */
function rewriteRemainingUrls(html: string, baseUrl: string): string {
  let processed = html;
  const base = new URL(baseUrl);
  const origin = `${base.protocol}//${base.host}`;
  processed = processed.replace(
    /(\s(?:src|href|action|poster)\s*=\s*["'])(?!https?:\/\/|data:|mailto:|tel:|#|javascript:)([^"']+)(["'])/gi,
    (_match, prefix: string, value: string, suffix: string) => {
      if (value.startsWith('//')) return `${prefix}${base.protocol}${value}${suffix}`;
      if (value.startsWith('/')) return `${prefix}${origin}${value}${suffix}`;
      const basePath = base.pathname.substring(0, base.pathname.lastIndexOf('/') + 1);
      return `${prefix}${origin}${basePath}${value}${suffix}`;
    }
  );
  processed = processed.replace(
    /url\(\s*['"]?(?!https?:\/\/|data:)([^'")]+)['"]?\s*\)/gi,
    (_match, value: string) => {
      if (value.startsWith('//')) return `url('${base.protocol}${value}')`;
      if (value.startsWith('/')) return `url('${origin}${value}')`;
      const basePath = base.pathname.substring(0, base.pathname.lastIndexOf('/') + 1);
      return `url('${origin}${basePath}${value}')`;
    }
  );
  return processed;
}

/**
 * Post-processes HTML: inlines stylesheets, embeds small images, strips scripts,
 * rewrites URLs. This is applied to both Puppeteer-rendered and fetch-based HTML.
 */
async function postProcessHtml(html: string, url: string, timeoutMs: number, banner: boolean): Promise<string> {
  let processed = html;

  // Inline external stylesheets
  processed = await inlineStylesheets(processed, url, timeoutMs);

  // Embed small images as base64
  processed = await embedSmallImages(processed, url, timeoutMs, MAX_IMAGE_EMBED_BYTES);

  // Strip all <script> tags for security
  processed = stripScripts(processed);

  // Remove inline event handlers
  processed = stripEventHandlers(processed);

  // Rewrite remaining relative URLs to absolute
  processed = rewriteRemainingUrls(processed, url);

  // Inject banner if enabled
  if (banner) {
    processed = injectBanner(processed);
    processed = addBannerScript(processed);
  }

  return processed;
}

/**
 * Attempts to clone using Puppeteer (headless browser) for full JS rendering.
 * Returns the rendered HTML or throws on failure.
 */
async function cloneWithPuppeteer(url: string, timeoutMs: number): Promise<string> {
  let puppeteer: typeof import('puppeteer');
  try {
    puppeteer = await import('puppeteer');
  } catch {
    throw new Error('PUPPETEER_NOT_AVAILABLE');
  }

  let browser: import('puppeteer').Browser | null = null;

  try {
    browser = await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
      ],
    });

    const page = await browser.newPage();

    // Set a realistic viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Navigate to the URL and wait for network to be idle
    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: timeoutMs,
      });
    } catch {
      // If networkidle2 times out, try with domcontentloaded as fallback
      try {
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: timeoutMs,
        });
        // Give extra time for JS rendering
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch {
        throw new Error(`Failed to load the website within ${timeoutMs}ms. The site may be unreachable or blocking automated access.`);
      }
    }

    // Wait a bit more for any lazy-loaded content
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Capture the fully rendered DOM
    return await page.content();
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

/**
 * Falls back to a simple fetch-based clone when Puppeteer is unavailable or fails.
 * This captures the raw server-rendered HTML — SPAs will produce empty shells.
 */
async function cloneWithFetch(url: string, timeoutMs: number): Promise<{ html: string; usedFallback: boolean }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: HTTP ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    return { html, usedFallback: true };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms.`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export interface CloneResult {
  id: string;
  source: string;
  bytes: number;
  createdAt: Date;
  warning?: string;
}

/**
 * Clones a website using a headless browser to capture the fully rendered DOM.
 * Falls back to fetch-based cloning if Puppeteer is unavailable or fails.
 * The fetched/rendered HTML is then post-processed: stylesheets inlined,
 * small images embedded, scripts stripped, and URLs made absolute.
 */
export async function cloneWebsite(url: string, options: CloneOptions = {}): Promise<CloneResult> {
  const {
    banner = true,
    maxHtmlBytes = DEFAULT_MAX_HTML_BYTES,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    clonesDir = getDefaultClonesDir(),
  } = options;

  if (!isValidHttpUrl(url)) {
    throw new Error('Invalid URL. Only public HTTP and HTTPS URLs are allowed.');
  }

  ensureClonesDir(clonesDir);

  const id = crypto.randomUUID();
  const cloneDir = path.join(clonesDir, id);
  fs.mkdirSync(cloneDir, { recursive: true });

  let rawHtml: string;
  let usedFallback = false;

  // Strategy 1: Try Puppeteer for full JS rendering
  try {
    rawHtml = await cloneWithPuppeteer(url, timeoutMs);
  } catch (puppeteerErr) {
    const errMsg = puppeteerErr instanceof Error ? puppeteerErr.message : String(puppeteerErr);

    // If Puppeteer is not installed or fails to launch, fall back to fetch
    if (errMsg === 'PUPPETEER_NOT_AVAILABLE' || errMsg.includes('Failed to launch') || errMsg.includes('executable')) {
      console.log('[cloner] Puppeteer unavailable, falling back to fetch-based clone');
      try {
        const fetchResult = await cloneWithFetch(url, timeoutMs);
        rawHtml = fetchResult.html;
        usedFallback = fetchResult.usedFallback;
      } catch (fetchErr) {
        fs.rmSync(cloneDir, { recursive: true, force: true });
        throw fetchErr;
      }
    } else {
      // Puppeteer loaded but navigation failed — try fetch as last resort
      console.log('[cloner] Puppeteer navigation failed, falling back to fetch:', errMsg);
      try {
        const fetchResult = await cloneWithFetch(url, Math.min(timeoutMs, 15000));
        rawHtml = fetchResult.html;
        usedFallback = fetchResult.usedFallback;
      } catch {
        // Both methods failed — throw the original Puppeteer error
        fs.rmSync(cloneDir, { recursive: true, force: true });
        throw puppeteerErr;
      }
    }
  }

  const rawBytes = Buffer.byteLength(rawHtml, 'utf-8');

  // Enforce max HTML size limit
  if (rawBytes > maxHtmlBytes) {
    fs.rmSync(cloneDir, { recursive: true, force: true });
    throw new Error(
      `Website exceeds size limit. Received ${(rawBytes / 1024 / 1024).toFixed(2)} MB, maximum is ${(maxHtmlBytes / 1024 / 1024).toFixed(2)} MB.`
    );
  }

  // Check if we captured meaningful content BEFORE post-processing
  let warning: string | undefined;
  if (!hasMeaningfulContent(rawHtml)) {
    if (usedFallback) {
      warning = 'This site requires JavaScript rendering that could not be captured. The clone contains the raw server HTML which may appear incomplete for single-page applications.';
    } else {
      warning = 'The cloned page appears to have very little visible content. The site may require authentication, use heavy client-side rendering that could not be captured, or block automated access.';
    }
  }

  // Post-process: inline styles, embed images, strip scripts, rewrite URLs, inject banner
  const processedHtml = await postProcessHtml(rawHtml, url, timeoutMs, banner);

  const filePath = path.join(cloneDir, 'index.html');
  fs.writeFileSync(filePath, processedHtml, 'utf-8');

  // Verify file exists on disk before saving to database
  if (!fs.existsSync(filePath)) {
    fs.rmSync(cloneDir, { recursive: true, force: true });
    throw new Error('Clone could not be saved, please try again.');
  }

  const bytes = Buffer.byteLength(processedHtml, 'utf-8');
  // Store relative path from clones directory for retrieval
  const relativePath = path.relative(getDefaultClonesDir(), filePath);

  // Normalize URL for dedup: trim, strip trailing slash, lowercase
  const normalizedUrl = url.trim().replace(/\/$/, '').toLowerCase();

  // Also check for the variant WITH trailing slash to catch legacy rows
  // that were stored before normalization was added.
  const withTrailingSlash = normalizedUrl + '/';

  // Upsert by normalized source URL — re-save updates existing, never duplicates.
  // Use $or to match both normalized and with-trailing-slash variants so we
  // catch any legacy rows stored before normalization was applied.
  const cloneDoc = await Clone.findOneAndUpdate(
    { $or: [{ source: normalizedUrl }, { source: withTrailingSlash }] },
    { $set: { id, source: normalizedUrl, bytes, filePath: relativePath, status: 'SAVED', createdAt: new Date() } },
    { upsert: true, new: true },
  );

  return { id: cloneDoc.id, source: cloneDoc.source, bytes: cloneDoc.bytes, createdAt: cloneDoc.createdAt, warning };
}

/**
 * Returns all clones sorted by creation date descending.
 */
export async function listClones(): Promise<{ id: string; source: string; bytes: number; createdAt: Date; status: string }[]> {
  const clones = await Clone.find().sort({ createdAt: -1 }).lean();
  return clones.map((c) => ({
    id: c.id,
    source: c.source,
    bytes: c.bytes,
    createdAt: c.createdAt,
    status: c.status || 'SAVED',
  }));
}

/**
 * Retrieves a clone record by its ID.
 */
export async function getCloneById(id: string): Promise<{ filePath: string; source: string } | null> {
  const clone = await Clone.findOne({ id }).lean();
  if (!clone) return null;
  return { filePath: clone.filePath, source: clone.source };
}

/**
 * Returns the absolute path for a clone's file.
 * Resolves relative paths against the default clones directory.
 */
export function getCloneFilePath(relativePath: string): string {
  return path.resolve(getDefaultClonesDir(), relativePath);
}
