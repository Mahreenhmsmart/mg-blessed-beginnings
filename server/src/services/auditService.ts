/**
 * Audit Service — Orchestrates the full website audit pipeline.
 * Calls crawler, runs all 6 analyzers, generates recommendations, saves Audit document.
 */

import mongoose from 'mongoose';
import Audit from '../models/Audit';
import Project from '../models/Project';
import CompetitorAudit from '../models/CompetitorAudit';
import { crawlUrl } from './crawlerService';
import { analyzeSeo } from './seoAnalyzer';
import { analyzeAeo } from './aeoAnalyzer';
import { analyzeGeo } from './geoAnalyzer';
import { analyzeAio } from './aioAnalyzer';
import { analyzeSxo } from './sxoAnalyzer';
import { analyzeContentQuality } from './contentQualityAnalyzer';
import { analyzeSchema } from './schemaAnalyzer';
import { analyzePerformance } from './performanceAnalyzer';
import { analyzeMobile } from './mobileAnalyzer';
import { analyzeLocalSeo } from './localSeoAnalyzer';
import { analyzeSecurity } from './securityAnalyzer';
import { analyzeAccessibility } from './accessibilityAnalyzer';
import { analyzeSocial } from './socialAnalyzer';
import { analyzeOnPage } from './onPageAnalyzer';
import { generateRecommendations, generateOnPageRecommendations } from './recommendationEngine';
import { analyzeKeywordGaps } from './keywordGapService';
import { analyzeBacklinks } from './backlinkService';
import { analyzeContentGaps } from './contentGapService';
import type { LayerResults } from '../models/Audit';
import type { CrawlResult } from './crawlerService';

export async function createAudit(projectId: string): Promise<string> {
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  const audit = await Audit.create({
    projectId: new mongoose.Types.ObjectId(projectId),
    status: 'queued',
    scores: { seo: 0, aeo: 0, geo: 0, aio: 0, sxo: 0, cq: 0, schema: 0, performance: 0, mobile: 0, localSeo: 0, security: 0, accessibility: 0, social: 0 },
    results: {},
    recommendations: [],
  });

  // Run audit asynchronously (don't block the response)
  runAuditPipeline(audit._id.toString(), project.url, projectId).catch((err) => {
    console.error(`[audit] Pipeline failed for audit ${audit._id}:`, err);
  });

  return audit._id.toString();
}

export async function runAuditPipeline(auditId: string, url: string, projectId?: string): Promise<{ crawlResult: CrawlResult; scores: Record<string, number> }> {
  const audit = await Audit.findById(auditId);
  if (!audit) throw new Error('Audit not found');

  try {
    // Mark as running
    audit.status = 'running';
    audit.startedAt = new Date();
    await audit.save();

    // Crawl the target URL
    const crawlResult = await crawlUrl(url);

    // Run all 10 core analyzers + 3 new intelligence analyzers
    const seoResults = analyzeSeo(crawlResult);
    const aeoResults = analyzeAeo(crawlResult);
    const geoResults = analyzeGeo(crawlResult);
    const aioResults = analyzeAio(crawlResult);
    const sxoResults = analyzeSxo(crawlResult);
    const cqResults = analyzeContentQuality(crawlResult);
    const schemaResults = analyzeSchema(crawlResult);
    const perfResults = analyzePerformance(crawlResult);
    const mobileResults = analyzeMobile(crawlResult);
    const localResults = analyzeLocalSeo(crawlResult);
    const securityResults = analyzeSecurity(crawlResult);
    const accessibilityResults = analyzeAccessibility(crawlResult);
    const socialResults = analyzeSocial(crawlResult);

    const results: Record<string, LayerResults> = {
      seo: seoResults,
      aeo: aeoResults,
      geo: geoResults,
      aio: aioResults,
      sxo: sxoResults,
      cq: cqResults,
      schema: schemaResults,
      performance: perfResults,
      mobile: mobileResults,
      localSeo: localResults,
      security: securityResults,
      accessibility: accessibilityResults,
      social: socialResults,
    };

    // Generate recommendations
    const recommendations = generateRecommendations(results);

    // Run on-page analysis and generate AI-powered suggestions (non-blocking)
    try {
      const onPageResult = analyzeOnPage(crawlResult);
      const onPageRecs = await generateOnPageRecommendations(crawlResult, onPageResult);
      recommendations.push(...onPageRecs);
    } catch (err) {
      console.error('[audit] On-page recommendation generation failed:', err instanceof Error ? err.message : err);
      // Continue without on-page recs — core audit is still valid
    }

    const scores = {
      seo: seoResults.score,
      aeo: aeoResults.score,
      geo: geoResults.score,
      aio: aioResults.score,
      sxo: sxoResults.score,
      cq: cqResults.score,
      schema: schemaResults.score,
      performance: perfResults.score,
      mobile: mobileResults.score,
      localSeo: localResults.score,
      security: securityResults.score,
      accessibility: accessibilityResults.score,
      social: socialResults.score,
    };

    // Update audit with results
    audit.status = 'completed';
    audit.completedAt = new Date();
    audit.scores = scores;
    audit.results = results;
    audit.recommendations = recommendations;
    await audit.save();

    // Run gap analyses if projectId provided
    if (projectId) {
      const pid = new mongoose.Types.ObjectId(projectId);
      // Run keyword gap, backlink, and content gap analysis asynchronously
      Promise.all([
        analyzeKeywordGaps(pid, crawlResult, url).catch((e: unknown) => console.error('[audit] Keyword gap analysis failed:', e)),
        analyzeBacklinks(pid, crawlResult, url).catch((e: unknown) => console.error('[audit] Backlink analysis failed:', e)),
        analyzeContentGaps(pid, crawlResult, url).catch((e: unknown) => console.error('[audit] Content gap analysis failed:', e)),
      ]).catch(() => {});
    }

    return { crawlResult, scores };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error during audit';
    console.error(`[audit] Error in pipeline for ${auditId}:`, errorMessage);

    audit.status = 'failed';
    audit.completedAt = new Date();
    audit.errorMessage = errorMessage;
    await audit.save();

    throw err;
  }
}

/**
 * Run audits on competitor URLs and store results as CompetitorAudit documents.
 */
export async function runCompetitorAudits(projectId: string, competitorUrls: string[]): Promise<void> {
  const pid = new mongoose.Types.ObjectId(projectId);

  for (const url of competitorUrls) {
    try {
      const crawlResult = await crawlUrl(url);

      const seoResults = analyzeSeo(crawlResult);
      const aeoResults = analyzeAeo(crawlResult);
      const geoResults = analyzeGeo(crawlResult);
      const aioResults = analyzeAio(crawlResult);
      const sxoResults = analyzeSxo(crawlResult);
      const cqResults = analyzeContentQuality(crawlResult);
      const schemaResults = analyzeSchema(crawlResult);
      const perfResults = analyzePerformance(crawlResult);
      const mobileResults = analyzeMobile(crawlResult);
      const localResults = analyzeLocalSeo(crawlResult);
      const securityResults = analyzeSecurity(crawlResult);
      const accessibilityResults = analyzeAccessibility(crawlResult);
      const socialResults = analyzeSocial(crawlResult);

      const scores = {
        seo: seoResults.score,
        aeo: aeoResults.score,
        geo: geoResults.score,
        aio: aioResults.score,
        sxo: sxoResults.score,
        cq: cqResults.score,
        schema: schemaResults.score,
        performance: perfResults.score,
        mobile: mobileResults.score,
        localSeo: localResults.score,
        security: securityResults.score,
        accessibility: accessibilityResults.score,
        social: socialResults.score,
      };

      // Upsert competitor audit result
      await CompetitorAudit.findOneAndUpdate(
        { projectId: pid, competitorUrl: url },
        {
          $set: {
            projectId: pid,
            competitorUrl: url,
            scores,
            status: 'completed',
            completedAt: new Date(),
          },
        },
        { upsert: true, new: true },
      );

      console.log(`[competitor-audit] Completed audit for ${url}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[competitor-audit] Failed to audit ${url}:`, errorMessage);

      await CompetitorAudit.findOneAndUpdate(
        { projectId: pid, competitorUrl: url },
        {
          $set: {
            projectId: pid,
            competitorUrl: url,
            status: 'failed',
            errorMessage,
            completedAt: new Date(),
          },
        },
        { upsert: true, new: true },
      );
    }
  }
}

/**
 * Get competitor audit results for comparison.
 */
export async function getCompetitorAudits(projectId: string) {
  const pid = new mongoose.Types.ObjectId(projectId);
  return CompetitorAudit.find({ projectId: pid }).sort({ updatedAt: -1 }).lean();
}

export async function getAuditById(auditId: string) {
  return Audit.findById(auditId).lean();
}

export async function getAuditsByProject(projectId: string, limit = 20) {
  return Audit.find({ projectId: new mongoose.Types.ObjectId(projectId) })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getLatestAudit(projectId: string) {
  return Audit.findOne({
    projectId: new mongoose.Types.ObjectId(projectId),
    status: 'completed',
  })
    .sort({ completedAt: -1 })
    .lean();
}
