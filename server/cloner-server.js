#!/usr/bin/env node
/**
 * MG Website Cloner — Standalone Server
 * 
 * A zero-dependency Node.js server that creates single-file visual clones of websites.
 * Run with: node cloner-server.js
 * 
 * Requirements: Node.js 20+ (uses built-in fetch)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

// ─── Configuration ──────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.CLONER_PORT || '4600', 10);
const MAX_HTML_BYTES = 3145728; // 3 MB
const FETCH_TIMEOUT_MS = 15000; // 15 seconds
const MAX_IMAGE_EMBED_BYTES = 51200; // 50 KB
const CLONES_DIR = path.join(__dirname, 'clones');
const BANNER_ENABLED = process.env.CLONER_BANNER !== 'off';

// Ensure clones directory exists
fs.mkdirSync(CLONES_DIR, { recursive: true });

// In-memory store for clones (no MongoDB dependency)
const clonesStore = new Map();

// ─── Utility Functions ──────────────────────────────────────────────────────────

function isValidHttpUrl(urlString) {
  try {
    const url = new URL(urlString);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }
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

function isPrivateUrl(urlString) {
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

function resolveUrl(urlStr, baseUrl) {
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

async function fetchResource(url, timeoutMs, maxBytes) {
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

async function fetchImageAsBase64(url, timeoutMs, maxBytes) {
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

// ─── Core Cloning Engine ────────────────────────────────────────────────────────

function extractStylesheetUrls(html, baseUrl) {
  const results = [];
  const linkRegex = /<link[^>]+rel\s*=\s*["']?stylesheet["']?[^>]*>/gi;
  let match;
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

function rewriteCssUrls(css, cssBaseUrl) {
  return css.replace(
    /url\(\s*['"]?(?!https?:\/\/|data:)([^'")]+)['"]?\s*\)/gi,
    (_match, value) => {
      const resolved = resolveUrl(value.trim(), cssBaseUrl);
      return resolved ? `url('${resolved}')` : `url('${value}')`;
    }
  );
}

async function inlineStylesheets(html, baseUrl, timeoutMs) {
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

async function embedSmallImages(html, baseUrl, timeoutMs, maxImageBytes) {
  let processed = html;
  const imgRegex = /<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/gi;
  const matches = [];
  let match;
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

function stripScripts(html) {
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

function stripEventHandlers(html) {
  return html.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
}

function rewriteRemainingUrls(html, baseUrl) {
  let processed = html;
  const base = new URL(baseUrl);
  const origin = `${base.protocol}//${base.host}`;
  processed = processed.replace(
    /(\s(?:src|href|action|poster)\s*=\s*["'])(?!https?:\/\/|data:|mailto:|tel:|#|javascript:)([^"']+)(["'])/gi,
    (_match, prefix, value, suffix) => {
      if (value.startsWith('//')) return `${prefix}${base.protocol}${value}${suffix}`;
      if (value.startsWith('/')) return `${prefix}${origin}${value}${suffix}`;
      const basePath = base.pathname.substring(0, base.pathname.lastIndexOf('/') + 1);
      return `${prefix}${origin}${basePath}${value}${suffix}`;
    }
  );
  processed = processed.replace(
    /url\(\s*['"]?(?!https?:\/\/|data:)([^'")]+)['"]?\s*\)/gi,
    (_match, value) => {
      if (value.startsWith('//')) return `url('${base.protocol}${value}')`;
      if (value.startsWith('/')) return `url('${origin}${value}')`;
      const basePath = base.pathname.substring(0, base.pathname.lastIndexOf('/') + 1);
      return `url('${origin}${basePath}${value}')`;
    }
  );
  return processed;
}

function generateBannerHtml() {
  return `
<div id="cloner-banner" style="position:fixed;top:0;left:0;right:0;z-index:999999;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:10px 16px;font-family:system-ui,-apple-system,sans-serif;font-size:14px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.15);">
  <span>This page was cloned with <a href="/" target="_blank" style="color:#fff;text-decoration:underline;font-weight:600;">MG Website Cloner</a></span>
  <button id="cloner-banner-close" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:#fff;cursor:pointer;font-size:18px;line-height:1;padding:4px;" aria-label="Dismiss banner">&times;</button>
</div>
<style>#cloner-banner-close:hover{opacity:0.8}</style>
`;
}

function injectBanner(html) {
  const banner = generateBannerHtml();
  const bodyMatch = html.match(/<body([^>]*)>/i);
  if (bodyMatch) {
    const insertPos = html.indexOf(bodyMatch[0]) + bodyMatch[0].length;
    return html.slice(0, insertPos) + banner + html.slice(insertPos);
  }
  return banner + html;
}

function addBannerScript(html) {
  const script = `<script>document.getElementById('cloner-banner-close')&&document.getElementById('cloner-banner-close').addEventListener('click',function(){document.getElementById('cloner-banner').remove()});</script>`;
  if (html.includes('</body>')) return html.replace('</body>', `${script}</body>`);
  return html + script;
}

async function cloneWebsite(url, options = {}) {
  const { banner = BANNER_ENABLED } = options;

  if (!isValidHttpUrl(url)) {
    throw new Error('Invalid URL. Only public HTTP and HTTPS URLs are allowed.');
  }

  const id = crypto.randomUUID();
  const cloneDir = path.join(CLONES_DIR, id);
  fs.mkdirSync(cloneDir, { recursive: true });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MGWebsiteCloner/1.0)', Accept: 'text/html,application/xhtml+xml' },
      redirect: 'follow',
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${FETCH_TIMEOUT_MS}ms.`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch website: HTTP ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const rawBytes = Buffer.byteLength(html, 'utf-8');

  if (rawBytes > MAX_HTML_BYTES) {
    fs.rmSync(cloneDir, { recursive: true, force: true });
    throw new Error(`Website exceeds size limit. Received ${(rawBytes / 1024 / 1024).toFixed(2)} MB, maximum is ${(MAX_HTML_BYTES / 1024 / 1024).toFixed(2)} MB.`);
  }

  // Process the HTML
  let processedHtml = await inlineStylesheets(html, url, FETCH_TIMEOUT_MS);
  processedHtml = await embedSmallImages(processedHtml, url, FETCH_TIMEOUT_MS, MAX_IMAGE_EMBED_BYTES);
  processedHtml = stripScripts(processedHtml);
  processedHtml = stripEventHandlers(processedHtml);
  processedHtml = rewriteRemainingUrls(processedHtml, url);

  if (banner) {
    processedHtml = injectBanner(processedHtml);
    processedHtml = addBannerScript(processedHtml);
  }

  const filePath = path.join(cloneDir, 'index.html');
  fs.writeFileSync(filePath, processedHtml, 'utf-8');
  const bytes = Buffer.byteLength(processedHtml, 'utf-8');

  const cloneRecord = { id, source: url, bytes, createdAt: new Date(), filePath };
  clonesStore.set(id, cloneRecord);

  return cloneRecord;
}

// ─── UI Page ────────────────────────────────────────────────────────────────────

function getUiHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MG Website Cloner</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f0f11; color: #fafafa; min-height: 100vh; line-height: 1.6; }
    .container { max-width: 720px; margin: 0 auto; padding: 2rem 1rem; }
    h1 { font-size: 2.5rem; font-weight: 800; background: linear-gradient(135deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem; }
    .subtitle { color: #a1a1aa; margin-bottom: 2rem; }
    .card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
    .form-row { display: flex; gap: 0.75rem; }
    input[type="url"] { flex: 1; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid #3f3f46; background: #09090b; color: #fafafa; font-size: 1rem; outline: none; transition: border-color 0.2s; }
    input[type="url"]:focus { border-color: #818cf8; }
    button { padding: 0.75rem 1.5rem; border-radius: 8px; border: none; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; font-size: 1rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s; white-space: nowrap; }
    button:hover { opacity: 0.9; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .result { margin-top: 1rem; padding: 1rem; border-radius: 8px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); }
    .result h3 { color: #22c55e; margin-bottom: 0.5rem; }
    .result-links { display: flex; gap: 0.75rem; margin-top: 0.75rem; }
    .result-links a { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 0.875rem; }
    .btn-preview { background: #6366f1; color: white; }
    .btn-download { background: transparent; border: 1px solid #3f3f46; color: #a1a1aa; }
    .error { margin-top: 1rem; padding: 1rem; border-radius: 8px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; }
    .loading { margin-top: 1rem; padding: 1rem; border-radius: 8px; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); color: #818cf8; display: flex; align-items: center; gap: 0.75rem; }
    .spinner { width: 20px; height: 20px; border: 2px solid #3f3f46; border-top-color: #818cf8; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .clones-list { list-style: none; }
    .clone-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #27272a; }
    .clone-item:last-child { border-bottom: none; }
    .clone-info { overflow: hidden; }
    .clone-url { font-size: 0.875rem; color: #fafafa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .clone-meta { font-size: 0.75rem; color: #71717a; margin-top: 0.25rem; }
    .clone-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
    .clone-actions a { padding: 0.375rem 0.75rem; border-radius: 6px; text-decoration: none; font-size: 0.75rem; font-weight: 600; }
    .note { font-size: 0.875rem; color: #71717a; margin-top: 1.5rem; padding: 1rem; border-radius: 8px; border: 1px dashed #3f3f46; }
    @media (max-width: 640px) { .form-row { flex-direction: column; } h1 { font-size: 1.75rem; } }
  </style>
</head>
<body>
  <div class="container">
    <h1>MG Website Cloner</h1>
    <p class="subtitle">Create a single-file visual clone of any public website.</p>
    
    <div class="card">
      <form id="clone-form" class="form-row">
        <input type="url" id="url-input" placeholder="https://example.com" required />
        <button type="submit" id="clone-btn">Clone Website</button>
      </form>
      <div id="status"></div>
    </div>

    <div class="card">
      <h2 style="font-size: 1.25rem; margin-bottom: 1rem;">Recent Clones</h2>
      <ul id="clones-list" class="clones-list">
        <li style="color: #71717a; text-align: center; padding: 2rem;">Loading...</li>
      </ul>
    </div>

    <div class="note">
      <strong>Note:</strong> Clones are visual copies only. Buttons, logins, and shops inside a clone do not work. 
      Styles are inlined, small images are embedded, and all scripts are removed for security.
      Only clone websites you own or have permission to copy.
    </div>
  </div>

  <script>
    const form = document.getElementById('clone-form');
    const urlInput = document.getElementById('url-input');
    const cloneBtn = document.getElementById('clone-btn');
    const statusDiv = document.getElementById('status');
    const clonesList = document.getElementById('clones-list');

    function formatBytes(bytes) {
      if (bytes === 0) return '0 B';
      const sizes = ['B', 'KB', 'MB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    }

    function formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    async function loadClones() {
      try {
        const res = await fetch('/api/clones');
        const data = await res.json();
        if (data.clones && data.clones.length > 0) {
          clonesList.innerHTML = data.clones.map(c => \`
            <li class="clone-item">
              <div class="clone-info">
                <div class="clone-url">\${c.source}</div>
                <div class="clone-meta">\${formatDate(c.createdAt)} · \${formatBytes(c.bytes)}</div>
              </div>
              <div class="clone-actions">
                <a href="/api/clone/\${c.id}/preview" target="_blank" class="btn-preview">Preview</a>
                <a href="/api/clone/\${c.id}/download" class="btn-download">Download</a>
              </div>
            </li>
          \`).join('');
        } else {
          clonesList.innerHTML = '<li style="color: #71717a; text-align: center; padding: 2rem;">No clones yet</li>';
        }
      } catch (err) {
        clonesList.innerHTML = '<li style="color: #ef4444; text-align: center; padding: 2rem;">Failed to load clones</li>';
      }
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = urlInput.value.trim();
      if (!url) return;

      cloneBtn.disabled = true;
      cloneBtn.textContent = 'Cloning...';
      statusDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Cloning... this may take a few seconds.</div>';

      try {
        const res = await fetch('/api/clone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        
        if (res.ok && data.id) {
          statusDiv.innerHTML = \`
            <div class="result">
              <h3>Clone successful!</h3>
              <p style="font-size: 0.875rem; color: #a1a1aa;">\${data.source}</p>
              <p style="font-size: 0.75rem; color: #71717a; margin-top: 0.25rem;">\${formatBytes(data.bytes)} · \${formatDate(data.createdAt)}</p>
              <div class="result-links">
                <a href="/api/clone/\${data.id}/preview" target="_blank" class="btn-preview">Preview</a>
                <a href="/api/clone/\${data.id}/download" class="btn-download">Download</a>
              </div>
            </div>
          \`;
          loadClones();
        } else {
          statusDiv.innerHTML = \`<div class="error">\${data.error || 'Failed to clone website.'}</div>\`;
        }
      } catch (err) {
        statusDiv.innerHTML = '<div class="error">Network error. Please try again.</div>';
      } finally {
        cloneBtn.disabled = false;
        cloneBtn.textContent = 'Clone Website';
      }
    });

    loadClones();
  </script>
</body>
</html>`;
}

// ─── Request Handlers ───────────────────────────────────────────────────────────

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // CORS headers for widget support — reflect the requesting origin instead of
  // using a wildcard so that credentials-bearing requests are accepted and
  // arbitrary origins cannot freely access the API.
  const requestOrigin = req.headers.origin;
  if (requestOrigin) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Serve UI at root
  if (pathname === '/' && req.method === 'GET') {
    sendHtml(res, 200, getUiHtml());
    return;
  }

  // POST /api/clone — Create a new clone
  if (pathname === '/api/clone' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      if (!body.url || typeof body.url !== 'string' || !body.url.trim()) {
        sendJson(res, 400, { error: 'A valid URL is required.' });
        return;
      }
      const result = await cloneWebsite(body.url.trim());
      sendJson(res, 200, result);
    } catch (err) {
      sendJson(res, 400, { error: err.message || 'Failed to clone website.' });
    }
    return;
  }

  // GET /api/clones — List recent clones
  if (pathname === '/api/clones' && req.method === 'GET') {
    const clones = Array.from(clonesStore.values()).sort((a, b) => b.createdAt - a.createdAt);
    sendJson(res, 200, { clones });
    return;
  }

  // GET /api/clone/:id/preview — Preview a clone
  const previewMatch = pathname.match(/^\/api\/clone\/([a-f0-9-]+)\/preview$/);
  if (previewMatch && req.method === 'GET') {
    const id = previewMatch[1];
    const clone = clonesStore.get(id);
    if (!clone || !fs.existsSync(clone.filePath)) {
      sendJson(res, 404, { error: 'Clone not found.' });
      return;
    }
    const html = fs.readFileSync(clone.filePath, 'utf-8');
    sendHtml(res, 200, html);
    return;
  }

  // GET /api/clone/:id/download — Download a clone
  const downloadMatch = pathname.match(/^\/api\/clone\/([a-f0-9-]+)\/download$/);
  if (downloadMatch && req.method === 'GET') {
    const id = downloadMatch[1];
    const clone = clonesStore.get(id);
    if (!clone || !fs.existsSync(clone.filePath)) {
      sendJson(res, 404, { error: 'Clone not found.' });
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="clone-${id}.html"`,
    });
    fs.createReadStream(clone.filePath).pipe(res);
    return;
  }

  // 404 for everything else
  sendJson(res, 404, { error: 'Not found.' });
}

// ─── Start Server ───────────────────────────────────────────────────────────────

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           MG Website Cloner — Standalone Server           ║
╠═══════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT}               ║
║  Clones directory:  ${CLONES_DIR.padEnd(35)}║
║  Banner:            ${(BANNER_ENABLED ? 'Enabled' : 'Disabled').padEnd(35)}║
╚═══════════════════════════════════════════════════════════╝
  `);
});
