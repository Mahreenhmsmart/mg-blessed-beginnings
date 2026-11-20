/**
 * Express application setup — exported separately for testing.
 * The server bootstrap (DB connect, listen) lives in index.ts.
 */

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorMiddleware';
import { consoleLogger } from './middleware/consoleLogger';
import { seoMetaMiddleware } from './middleware/seoMetaMiddleware';
import { UPLOADS_DIR } from './paths';

// ─── Route Imports ────────────────────────────────────────────────────────────
import blogRoutes from './routes/blogRoutes';
import serviceRoutes from './routes/serviceRoutes';
import consultationRoutes from './routes/consultationRoutes';
import contactRoutes from './routes/contactRoutes';
import aiToolRoutes from './routes/aiToolRoutes';
import authRoutes from './routes/authRoutes';
import aiRoutes from './routes/aiRoutes';
import auditRoutes from './routes/auditRoutes';
import courseRoutes from './routes/courseRoutes';
import resourceRoutes from './routes/resourceRoutes';
import chatbotRoutes from './routes/chatbotRoutes';
import newsletterRoutes from './routes/newsletterRoutes';
import securityAuditRoutes from './routes/securityAuditRoutes';
import lumaRoutes from './routes/lumaRoutes';
import seoRoutes, { generateDynamicSitemap } from './routes/seoRoutes';
import diagnosticRoutes from './routes/diagnosticRoutes';
import websiteIntelRoutes from './routes/websiteIntelRoutes';
import referralRoutes from './routes/referralRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import adRoutes from './routes/adRoutes';
import paymentRoutes from './routes/paymentRoutes';
import adminConsoleRoutes from './routes/adminConsoleRoutes';
import clonerRoutes from './routes/clonerRoutes';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Trust one level of reverse proxy (required for express-rate-limit IP detection).
// Using `true` is permissive and allows IP spoofing; `1` trusts only the nearest proxy.
app.set('trust proxy', 1);

// ─── Console Logger Middleware ──────────────────────────────────────────────────
app.use(consoleLogger);

// ─── Security Headers (Helmet) ────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: ["'self'"],
        workerSrc: ["'self'"],
        frameSrc: ["'none'"],
        frameAncestors: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: isProduction ? [] : null,
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    xContentTypeOptions: true,
    frameguard: { action: 'sameorigin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  })
);

// ─── Permissions-Policy (restrict unnecessary browser features) ───────────────
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(self)'
  );
  next();
});

// ─── CORS ─────────────────────────────────────────────────────────────────────
const frontendOrigin = (process.env.VITE_API_URL || '').replace(/\/api\/?$/, '');

let allowedOrigins: (string | RegExp)[];

if (isProduction) {
  allowedOrigins = [];
  if (frontendOrigin) {
    allowedOrigins.push(frontendOrigin);
  }
} else {
  allowedOrigins = [/^https?:\/\/localhost:\d+$/, /^https?:\/\/127\.0\.0\.1:\d+$/];
  if (frontendOrigin) {
    allowedOrigins.push(frontendOrigin);
  }
}

app.use(cors({ origin: allowedOrigins, credentials: true }));

// ─── Cookie Parser ──────────────────────────────────────────────────────────────
app.use(cookieParser());

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Global rate limiter for general API protection.
// Chatbot routes are excluded — they have their own dedicated rate limiter
// in chatbotRoutes.ts that's tuned for conversational use patterns.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased from 100 to allow normal browsing + API usage
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  skip: (req) => req.path.startsWith('/api/chatbot'),
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many submissions. Please try again later.' },
});

app.use('/api/', globalLimiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));

// ─── Static Uploads ───────────────────────────────────────────────────────────
// Performance fix: Add cache headers for uploaded files (1 hour, revalidate)
app.use('/api/uploads', express.static(UPLOADS_DIR, {
  maxAge: '1h',
  etag: true,
  lastModified: true,
}));

// ─── Root OK Response ─────────────────────────────────────────────────────────
app.get('/', (_req: Request, res: Response) => {
  res.type('text/plain').send('OK');
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) =>
  res.json({ success: true, status: 'ok', timestamp: Date.now() })
);

// ─── SEO: Root-level sitemap.xml and robots.txt ──────────────────────────────
// Search engines expect these at the site root. Serve dynamic API-generated
// versions directly (they pull live data from MongoDB). Fall back to static
// files from the Vite build output only if the dynamic route fails.
const __appDirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.resolve(__appDirname, '../../client/dist');
const CLIENT_PUBLIC = path.resolve(__appDirname, '../../client/public');

// ─── Favicon ──────────────────────────────────────────────────────────────────
// Browsers always request /favicon.ico regardless of <link> tags. Serve the
// MG logo SVG so this returns 200 instead of falling through to the SPA
// catch-all (which would return HTML) or the dev 404 handler.
// Read the SVG into memory at startup so we never depend on runtime file paths.
let faviconSvg: Buffer | null = null;
const faviconCandidates = [
  path.join(CLIENT_PUBLIC, 'favicon.svg'),
  path.join(CLIENT_DIST, 'favicon.svg'),
];
for (const candidate of faviconCandidates) {
  try {
    faviconSvg = fs.readFileSync(candidate);
    console.log(`[favicon] Loaded from ${candidate}`);
    break;
  } catch {
    // try next candidate
  }
}
if (!faviconSvg) {
  console.warn('[favicon] favicon.svg not found in client/public or client/dist');
}

app.get('/favicon.ico', (_req: Request, res: Response) => {
  if (faviconSvg) {
    res.type('image/svg+xml').send(faviconSvg);
  } else {
    res.status(404).end();
  }
});

app.get('/favicon.svg', (_req: Request, res: Response) => {
  if (faviconSvg) {
    res.type('image/svg+xml').send(faviconSvg);
  } else {
    res.status(404).end();
  }
});

// Dynamic sitemap at root — uses the shared generator from seoRoutes
app.get('/sitemap.xml', async (_req: Request, res: Response) => {
  try {
    const xml = await generateDynamicSitemap();
    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch {
    // Fallback to static file from Vite build output
    res.sendFile(path.join(CLIENT_DIST, 'sitemap.xml'), (err) => {
      if (err) {
        res.redirect(301, '/api/sitemap.xml');
      }
    });
  }
});
app.get('/robots.txt', (_req: Request, res: Response) => {
  res.sendFile(path.join(CLIENT_DIST, 'robots.txt'), (err) => {
    if (err) {
      res.redirect(301, '/api/robots.txt');
    }
  });
});

// ─── GEO/AEO: /llms.txt for AI crawlers ──────────────────────────────────────
// NOTE: This dynamic route has been DISABLED in favor of serving a static
// client/public/llms.txt file. The static file is served by Vite's build output
// (client/dist/) via express.static, avoiding SPA catch-all interception issues.
// The code below is kept as reference but no longer active.
//
// import AITool from './models/AITool';
// const LLMS_TXT_SITE_DOMAIN = 'https://mgblessed.icod.ai';
// app.get('/llms.txt', async (_req: Request, res: Response, next: NextFunction) => { ... });

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/consultations', strictLimiter, consultationRoutes);
app.use('/api/contact', strictLimiter, contactRoutes);
app.use('/api/ai-tools', aiToolRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', auditRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/security-audit', securityAuditRoutes);
app.use('/api/luma', lumaRoutes);
app.use('/api', seoRoutes);
app.use('/api/diagnostic', diagnosticRoutes);
app.use('/api/website-intelligence', websiteIntelRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin-console', adminConsoleRoutes);
app.use('/api/cloner', clonerRoutes);

// ─── Server-Side SEO Meta Injection ──────────────────────────────────────────
// Injects route-specific <title>, meta, OG, Twitter, canonical, and JSON-LD
// tags into the HTML response BEFORE sending to crawlers. This ensures
// non-JS-executing crawlers see correct metadata for each route.
// Must be registered AFTER all /api/* routes but BEFORE the SPA catch-all.
if (isProduction) {
  app.use(seoMetaMiddleware);
}

// ─── SPA Static Assets & Catch-All ────────────────────────────────────────────
// Serve the Vite build output for production. The catch-all sends index.html
// for any unmatched GET so React Router can handle client-side navigation.
// IMPORTANT: /llms.txt, /sitemap.xml, /robots.txt, all /api/* routes, and
// the seoMetaMiddleware are registered ABOVE this block so they are never
// swallowed by the SPA fallback.
if (isProduction) {
  // Performance fix: Cache versioned assets aggressively (they have content hashes)
  // but NEVER cache HTML files — they reference chunk hashes that change on deploy
  app.use(express.static(CLIENT_DIST, {
    maxAge: '1y',
    immutable: true,
    etag: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    },
  }));

  // SPA catch-all: serve index.html with strict no-cache headers so browsers
  // always fetch fresh HTML referencing current chunk hashes
  app.get('*', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
} else {
  // Development: return JSON 404 for unmatched routes (Vite dev server handles SPA).
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });
}

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
