/**
 * /llms.txt — plain-text page for AI crawlers (GEO/AEO foundation).
 * Follows the llms.txt convention: structured plain text describing
 * the site and listing all AI tools dynamically from the database.
 */

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import AITool from '../models/AITool';

const router = Router();

const SITE_DOMAIN = 'https://mgblessed.icod.ai';

router.get('/llms.txt', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tools = await AITool.find({ status: { $ne: 'coming_soon' } })
      .sort({ name: 1 })
      .lean();

    const lines: string[] = [
      '# MG Blessed Beginnings — AI-Powered Business Growth Platform',
      '',
      '> A collection of free AI-powered tools designed for e-commerce sellers,',
      '> online business owners, and digital entrepreneurs. Built with AI-first',
      '> SEO, AEO, and GEO best practices.',
      '',
      '## AI Tools',
      '',
    ];

    for (const tool of tools) {
      lines.push(`### ${tool.name}`);
      lines.push(`- URL: ${SITE_DOMAIN}/tools/${tool.slug}`);
      lines.push(`- Description: ${tool.description}`);
      if (tool.features && tool.features.length > 0) {
        lines.push(`- Features: ${tool.features.join(', ')}`);
      }
      lines.push('');
    }

    lines.push('## About');
    lines.push('MG Blessed Beginnings provides free AI-powered business tools for e-commerce sellers.');
    lines.push(`Learn more: ${SITE_DOMAIN}`);
    lines.push('');

    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(lines.join('\n'));
  } catch (err) {
    next(err);
  }
});

export default router;
