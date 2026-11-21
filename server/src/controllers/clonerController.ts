import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { cloneWebsite, listClones, getCloneById, getCloneFilePath, type CloneOptions } from '../services/clonerService';

const CLONE_DIR = path.join(process.cwd(), 'uploads', 'clones');

/**
 * Configuration for the cloner controller.
 * Can be passed when creating the router to customize behavior.
 */
export interface ClonerConfig {
  /** Whether to show banner (can be overridden by CLONER_BANNER env var) */
  banner?: boolean;
  /** Custom clones directory */
  clonesDir?: string;
  /** Max HTML size in bytes */
  maxHtmlBytes?: number;
  /** Fetch timeout in ms */
  timeoutMs?: number;
}

/**
 * Creates a clone handler with optional configuration.
 */
export function createCloneHandler(config: ClonerConfig = {}) {
  return async function clone(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url } = req.body;

      if (!url || typeof url !== 'string' || !url.trim()) {
        res.status(400).json({ success: false, error: 'A valid URL is required.', statusCode: 400 });
        return;
      }

      // Determine banner setting: env var overrides config
      const envBanner = process.env.CLONER_BANNER;
      const bannerEnabled = envBanner === 'off' ? false : (config.banner ?? true);

      const options: CloneOptions = {
        banner: bannerEnabled,
        clonesDir: config.clonesDir,
        maxHtmlBytes: config.maxHtmlBytes,
        timeoutMs: config.timeoutMs,
      };

      const result = await cloneWebsite(url.trim(), options);
      
      // Return exact shape: { id, source, bytes, createdAt, warning? }
      res.json({ 
        success: true, 
        data: { 
          id: result.id, 
          source: result.source, 
          bytes: result.bytes,
          createdAt: result.createdAt.toISOString(),
          ...(result.warning ? { warning: result.warning } : {}),
        } 
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clone website.';
      // Validation errors return 400; everything else is 500
      if (message.includes('Invalid URL') || message.includes('Only HTTP')) {
        res.status(400).json({ success: false, error: message, statusCode: 400 });
        return;
      }
      if (message.includes('exceeds size limit') || message.includes('timed out')) {
        res.status(400).json({ success: false, error: message, statusCode: 400 });
        return;
      }
      next(err);
    }
  };
}

// Default clone handler (backward compatible)
export const clone = createCloneHandler();

/**
 * GET /clones — List all recent clones
 */
export async function listAllClones(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const clones = await listClones();
    res.json({ success: true, data: clones });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /preview/:id — Serve cloned HTML for preview
 * Overrides Helmet's restrictive frame/embed headers so the page renders
 * correctly when opened in a new tab or embedded in an iframe.
 */
export async function preview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const cloneRecord = await getCloneById(id);

    if (!cloneRecord) {
      res.status(404).json({ success: false, error: 'Clone not found.', statusCode: 404 });
      return;
    }

    const resolvedPath = getCloneFilePath(cloneRecord.filePath);

    if (!fs.existsSync(resolvedPath)) {
      res.status(404).json({ success: false, error: 'Clone file not found on disk.', statusCode: 404 });
      return;
    }

    // Override Helmet's restrictive headers so the cloned page can render
    // in iframes and new tabs without ERR_BLOCKED_BY_RESPONSE.
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; img-src * data: blob:; style-src * 'unsafe-inline'; font-src * data:;");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.sendFile(resolvedPath);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /download/:id — Download cloned HTML as attachment
 */
export async function download(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const cloneRecord = await getCloneById(id);

    if (!cloneRecord) {
      res.status(404).json({ success: false, error: 'Clone not found.', statusCode: 404 });
      return;
    }

    const resolvedPath = getCloneFilePath(cloneRecord.filePath);

    if (!fs.existsSync(resolvedPath)) {
      res.status(404).json({ success: false, error: 'Clone file not found on disk.', statusCode: 404 });
      return;
    }

    // Derive a meaningful filename from the source URL
    let filename = `clone-${id}.html`;
    try {
      const sourceUrl = new URL(cloneRecord.source);
      const hostPart = sourceUrl.hostname.replace(/[^a-zA-Z0-9.-]/g, '-');
      filename = `${hostPart}-clone.html`;
    } catch {
      // Keep default filename
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.sendFile(resolvedPath);
  } catch (err) {
    next(err);
  }
}
