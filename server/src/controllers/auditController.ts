/**
 * Audit Controller — Orchestrates project/audit requests.
 * All methods are async and use try/catch with next(err).
 */

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';
import Project from '../models/Project';
import KeywordGap from '../models/KeywordGap';
import BacklinkOpportunity from '../models/BacklinkOpportunity';
import ContentGap from '../models/ContentGap';
import CompetitorAudit from '../models/CompetitorAudit';
import * as auditService from '../services/auditService';
import { generateAuditInsights } from '../services/aiInsightService';
import { reanalyzeKeywordGaps } from '../services/keywordGapService';
import { reanalyzeBacklinks } from '../services/backlinkService';
import { reanalyzeContentGaps } from '../services/contentGapService';
import { generateCompletion } from '../services/aiService';
import { checkAIVisibility, getVisibilityHistory, getVisibilitySummary } from '../services/aiVisibilityService';
import * as gscService from '../services/gscService';
import * as schedulerService from '../services/schedulerService';
import { crawlUrl } from '../services/crawlerService';

// ─── Projects ──────────────────────────────────────────────────────────────

export async function createProject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { url, name, competitors } = req.body;
    if (!url || !name) {
      res.status(400).json({ success: false, error: 'url and name are required.' });
      return;
    }

    const userId = req.user?.email || 'anonymous';

    // Check for existing project with same URL + user
    const existing = await Project.findOne({ userId, url });
    if (existing) {
      res.status(409).json({ success: false, error: 'A project with this URL already exists.' });
      return;
    }

    const project = await Project.create({
      url,
      name,
      userId,
      competitors: competitors || [],
    });

    // If competitor URLs provided, trigger crawling them asynchronously
    if (competitors && competitors.length > 0) {
      auditService.runCompetitorAudits(project._id.toString(), competitors).catch((err) => {
        console.error('[project] Failed to run initial competitor audits:', err);
      });
    }

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function getProjects(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.email || 'anonymous';
    const role = req.user?.role;

    // Admin users see all projects regardless of userId format
    const filter = role === 'admin' ? {} : { userId };
    const projects = await Project.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
}

export async function getProjectById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await Project.findById(req.params.id).lean();
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }

    const latestAudit = await auditService.getLatestAudit(req.params.id);
    res.json({ success: true, data: { ...project, latestAudit } });
  } catch (err) {
    next(err);
  }
}

export async function updateProject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, url, competitors } = req.body;
    const userId = req.user?.email || 'anonymous';

    const project = await Project.findOne({ _id: req.params.id, userId });
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }

    // Check for URL conflict if changing URL
    if (url && url !== project.url) {
      const existing = await Project.findOne({ userId, url, _id: { $ne: req.params.id } });
      if (existing) {
        res.status(409).json({ success: false, error: 'A project with this URL already exists.' });
        return;
      }
      project.url = url;
    }

    if (name) project.name = name;
    if (competitors) project.competitors = competitors;

    await project.save();
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.email || 'anonymous';
    const projectId = req.params.id;

    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }

    // Cascade delete related data
    const Audit = (await import('../models/Audit')).default;
    const AuditSchedule = (await import('../models/AuditSchedule')).default;

    await Promise.all([
      Audit.deleteMany({ projectId }),
      AuditSchedule.deleteMany({ projectId }),
      KeywordGap.deleteMany({ projectId }),
      BacklinkOpportunity.deleteMany({ projectId }),
      ContentGap.deleteMany({ projectId }),
      CompetitorAudit.deleteMany({ projectId }),
    ]);

    await Project.deleteOne({ _id: projectId });
    res.json({ success: true, message: 'Project and all related data deleted.' });
  } catch (err) {
    next(err);
  }
}

// ─── Audits ────────────────────────────────────────────────────────────────

export async function triggerAudit(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }

    const auditId = await auditService.createAudit(projectId);
    res.status(201).json({ success: true, data: { auditId, status: 'queued' } });
  } catch (err) {
    next(err);
  }
}

export async function getAuditsByProject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const audits = await auditService.getAuditsByProject(req.params.id);
    res.json({ success: true, data: audits });
  } catch (err) {
    next(err);
  }
}

export async function getAuditById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const audit = await auditService.getAuditById(req.params.id);
    if (!audit) {
      res.status(404).json({ success: false, error: 'Audit not found.' });
      return;
    }
    res.json({ success: true, data: audit });
  } catch (err) {
    next(err);
  }
}

export async function getAuditInsights(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const audit = await auditService.getAuditById(req.params.id);
    if (!audit) {
      res.status(404).json({ success: false, error: 'Audit not found.' });
      return;
    }

    const insights = await generateAuditInsights(audit as any);
    res.json({ success: true, data: insights });
  } catch (err) {
    next(err);
  }
}

export async function getAuditByProjectAndId(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId, auditId } = req.params;
    const Audit = (await import('../models/Audit')).default;

    const audit = await Audit.findOne({
      _id: auditId,
      projectId: new mongoose.Types.ObjectId(projectId),
    }).lean();

    if (!audit) {
      res.status(404).json({ success: false, error: 'Audit not found.' });
      return;
    }

    res.json({ success: true, data: audit });
  } catch (err) {
    next(err);
  }
}

// ─── Reports ────────────────────────────────────────────────────────────────

export async function generatePDFReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId).lean();
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }

    // Get the latest completed audit
    const latestAudit = await auditService.getLatestAudit(projectId);
    if (!latestAudit || latestAudit.status !== 'completed') {
      res.status(400).json({ success: false, error: 'No completed audit available for this project.' });
      return;
    }

    // Import PDF service dynamically to avoid issues if pdfkit is not installed
    const { generateAuditReport, auditToReportData } = await import('../services/pdfService');

    const reportData = auditToReportData(latestAudit as any, project.name, project.url);
    const doc = generateAuditReport(reportData);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="mg-visibility-report-${new Date().toISOString().slice(0, 10)}.pdf"`);

    // Pipe the PDF to the response
    doc.pipe(res);
  } catch (err) {
    next(err);
  }
}

export async function generateCSVReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId).lean();
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }

    // Get the latest completed audit
    const latestAudit = await auditService.getLatestAudit(projectId);
    if (!latestAudit || latestAudit.status !== 'completed') {
      res.status(400).json({ success: false, error: 'No completed audit available for this project.' });
      return;
    }

    const audit = latestAudit as any;
    const rows: string[][] = [];

    // Header row
    rows.push(['MG Blessed Beginnings - Visibility Intelligence Report']);
    rows.push(['Project', project.name]);
    rows.push(['URL', project.url]);
    rows.push(['Generated', new Date().toISOString()]);
    rows.push([]);

    // Scores section
    rows.push(['AUDIT SCORES']);
    rows.push(['Layer', 'Score', 'Max Score']);
    for (const [layer, score] of Object.entries(audit.scores || {})) {
      rows.push([layer.toUpperCase(), String(score), '100']);
    }
    rows.push([]);

    // Detailed results section
    rows.push(['DETAILED RESULTS']);
    rows.push(['Layer', 'Score', 'Max Score', 'Checks Passed', 'Checks Warned', 'Checks Failed']);
    for (const [layer, results] of Object.entries(audit.results || {})) {
      if (!results) continue;
      const r = results as any;
      const passed = r.checks?.filter((c: { status: string }) => c.status === 'pass').length || 0;
      const warned = r.checks?.filter((c: { status: string }) => c.status === 'warn').length || 0;
      const failed = r.checks?.filter((c: { status: string }) => c.status === 'fail').length || 0;
      rows.push([layer.toUpperCase(), String(r.score), String(r.maxScore), String(passed), String(warned), String(failed)]);
    }
    rows.push([]);

    // Recommendations section
    rows.push(['RECOMMENDATIONS']);
    rows.push(['Severity', 'Title', 'Layer', 'Effort', 'Category', 'Description']);
    for (const rec of audit.recommendations || []) {
      // Escape quotes and wrap fields containing commas
      const escapeCSV = (val: string) => {
        if (!val) return '';
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      };
      rows.push([
        rec.severity,
        escapeCSV(rec.title),
        rec.layer?.toUpperCase() || '',
        rec.effort,
        rec.category,
        escapeCSV(rec.description || ''),
      ]);
    }

    // Convert to CSV string
    const csvContent = rows.map(row => row.join(',')).join('\n');

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="mg-visibility-report-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csvContent);
  } catch (err) {
    next(err);
  }
}

// ─── Keyword Gaps ──────────────────────────────────────────────────────────

export async function getKeywordGaps(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const gaps = await KeywordGap.find({
      projectId: new mongoose.Types.ObjectId(req.params.id),
    }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: gaps });
  } catch (err) {
    next(err);
  }
}

export async function reanalyzeKeywordGapsHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }

    // Run asynchronously
    reanalyzeKeywordGaps(projectId).catch((err) => {
      console.error('[reanalyze-keywords] Failed:', err);
    });

    res.json({ success: true, data: { message: 'Keyword gap re-analysis started.' } });
  } catch (err) {
    next(err);
  }
}

// ─── Backlinks ─────────────────────────────────────────────────────────────

export async function getBacklinks(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const backlinks = await BacklinkOpportunity.find({
      projectId: new mongoose.Types.ObjectId(req.params.id),
    }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: backlinks });
  } catch (err) {
    next(err);
  }
}

export async function reanalyzeBacklinksHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }

    reanalyzeBacklinks(projectId).catch((err) => {
      console.error('[reanalyze-backlinks] Failed:', err);
    });

    res.json({ success: true, data: { message: 'Backlink re-analysis started.' } });
  } catch (err) {
    next(err);
  }
}

// ─── Content Gaps ──────────────────────────────────────────────────────────

export async function getContentGaps(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const gaps = await ContentGap.find({
      projectId: new mongoose.Types.ObjectId(req.params.id),
    }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: gaps });
  } catch (err) {
    next(err);
  }
}

export async function reanalyzeContentGapsHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }

    reanalyzeContentGaps(projectId).catch((err) => {
      console.error('[reanalyze-content] Failed:', err);
    });

    res.json({ success: true, data: { message: 'Content gap re-analysis started.' } });
  } catch (err) {
    next(err);
  }
}

// ─── Competitor Management ────────────────────────────────────────────────

export async function getCompetitorComparison(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await Project.findById(req.params.id).lean();
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }

    const comparisons: Array<{ url: string; scores: Record<string, number> | null }> = [];

    // Add main site scores
    const mainAudit = await auditService.getLatestAudit(req.params.id);
    comparisons.push({
      url: project.url,
      scores: mainAudit ? mainAudit.scores : null,
    });

    // Get actual competitor audit results
    const competitorAudits = await auditService.getCompetitorAudits(req.params.id);
    const compAuditMap = new Map(competitorAudits.map((ca: any) => [ca.competitorUrl, ca]));

    for (const compUrl of project.competitors) {
      const compAudit = compAuditMap.get(compUrl);
      comparisons.push({
        url: compUrl,
        scores: compAudit && compAudit.status === 'completed' ? compAudit.scores : null,
      });
    }

    res.json({ success: true, data: comparisons });
  } catch (err) {
    next(err);
  }
}

export async function addCompetitor(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ success: false, error: 'url is required.' });
      return;
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }

    if (project.competitors.includes(url)) {
      res.status(409).json({ success: false, error: 'Competitor already exists.' });
      return;
    }

    project.competitors.push(url);
    await project.save();

    // Trigger audit for new competitor asynchronously
    auditService.runCompetitorAudits(project._id.toString(), [url]).catch((err) => {
      console.error('[competitor] Failed to audit new competitor:', err);
    });

    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function removeCompetitor(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ success: false, error: 'url is required.' });
      return;
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }

    project.competitors = project.competitors.filter((c) => c !== url);
    await project.save();

    // Remove competitor audit data
    await CompetitorAudit.deleteOne({
      projectId: project._id,
      competitorUrl: url,
    });

    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function triggerCompetitorAudit(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }

    if (project.competitors.length === 0) {
      res.status(400).json({ success: false, error: 'No competitors configured.' });
      return;
    }

    // Run competitor audits asynchronously
    auditService.runCompetitorAudits(project._id.toString(), project.competitors).catch((err) => {
      console.error('[competitor-audit] Failed:', err);
    });

    res.json({ success: true, data: { message: `Competitor audit started for ${project.competitors.length} competitors.` } });
  } catch (err) {
    next(err);
  }
}

// ─── AI Visibility ────────────────────────────────────────────────────────

export async function triggerVisibilityCheck(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }

    // Run asynchronously
    checkAIVisibility(projectId).catch((err) => {
      console.error('[ai-visibility] Check failed:', err);
    });

    res.json({ success: true, data: { message: 'AI visibility check started.' } });
  } catch (err) {
    next(err);
  }
}

export async function getVisibilityHistoryHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const history = await getVisibilityHistory(req.params.id);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

export async function getVisibilitySummaryHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const summary = await getVisibilitySummary(req.params.id);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

// ─── Google Search Console ────────────────────────────────────────────────

export async function getGSCAuthUrl(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const config = gscService.checkConfiguration();
    if (!config.configured) {
      res.json({ success: true, data: config });
      return;
    }

    // Ownership verified by middleware — use verified project ID
    const projectId = req.verifiedProject?._id?.toString() || req.params.id;
    const authUrl = gscService.getAuthUrl(projectId);
    res.json({ success: true, data: { authUrl, configured: true } });
  } catch (err) {
    next(err);
  }
}

export async function gscCallback(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code, state } = req.query as { code?: string; state?: string };
    if (!code || !state) {
      res.status(400).json({ success: false, error: 'Missing code or state parameter.' });
      return;
    }

    // M-5 fix: Verify the authenticated user owns the project referenced in the OAuth state.
    // The state parameter contains the projectId that was set when generating the auth URL.
    if (!mongoose.Types.ObjectId.isValid(state)) {
      res.status(400).json({ success: false, error: 'Invalid state parameter.' });
      return;
    }

    const userId = req.user?.email;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Not authenticated.' });
      return;
    }

    const project = await Project.findOne({ _id: state, userId });
    if (!project) {
      console.warn(`[gsc-authz] OAuth callback rejected: user=${userId} stateProjectId=${state}`);
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }

    await gscService.exchangeCode(code, state);
    res.json({ success: true, data: { message: 'Google Search Console connected successfully.' } });
  } catch (err) {
    next(err);
  }
}

export async function importGSCData(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
      res.status(400).json({ success: false, error: 'startDate and endDate are required.' });
      return;
    }

    // Ownership verified by middleware
    const projectId = req.verifiedProject?._id?.toString() || req.params.id;
    const data = await gscService.fetchSearchAnalytics(projectId, startDate, endDate);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getGSCData(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    // Default to last 30 days
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Ownership verified by middleware
    const projectId = req.verifiedProject?._id?.toString() || req.params.id;
    const data = await gscService.fetchSearchAnalytics(projectId, startDate, endDate);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function checkGSCConfig(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const config = gscService.checkConfiguration();
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
}

// ─── Extended GSC Endpoints ──────────────────────────────────────────────

export async function listGSCProperties(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    // Ownership verified by middleware
    const projectId = req.verifiedProject?._id?.toString() || req.params.projectId;
    const properties = await gscService.listProperties(projectId);
    res.json({ success: true, data: properties });
  } catch (err) {
    next(err);
  }
}

export async function getGSCAnalyticsByDimension(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startDate, endDate, dimensions } = req.query as {
      startDate?: string;
      endDate?: string;
      dimensions?: string;
    };

    if (!startDate || !endDate || !dimensions) {
      res.status(400).json({ success: false, error: 'startDate, endDate, and dimensions query params are required.' });
      return;
    }

    const dims = dimensions.split(',').map((d) => d.trim()).filter(Boolean);
    // Ownership verified by middleware
    const projectId = req.verifiedProject?._id?.toString() || req.params.projectId;
    const result = await gscService.fetchSearchAnalyticsByDimension(projectId, startDate, endDate, dims);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getGSCTopQueries(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startDate, endDate, limit } = req.query as {
      startDate?: string;
      endDate?: string;
      limit?: string;
    };

    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const rowLimit = limit ? parseInt(limit, 10) : 25;

    // Ownership verified by middleware
    const projectId = req.verifiedProject?._id?.toString() || req.params.projectId;
    const result = await gscService.fetchTopQueries(projectId, start, end, rowLimit);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getGSCTopPages(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startDate, endDate, limit } = req.query as {
      startDate?: string;
      endDate?: string;
      limit?: string;
    };

    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const rowLimit = limit ? parseInt(limit, 10) : 25;

    // Ownership verified by middleware
    const projectId = req.verifiedProject?._id?.toString() || req.params.projectId;
    const result = await gscService.fetchTopPages(projectId, start, end, rowLimit);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getGSCCountries(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startDate, endDate } = req.query as {
      startDate?: string;
      endDate?: string;
    };

    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Ownership verified by middleware
    const projectId = req.verifiedProject?._id?.toString() || req.params.projectId;
    const result = await gscService.fetchCountryBreakdown(projectId, start, end);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getGSCDevices(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startDate, endDate } = req.query as {
      startDate?: string;
      endDate?: string;
    };

    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Ownership verified by middleware
    const projectId = req.verifiedProject?._id?.toString() || req.params.projectId;
    const result = await gscService.fetchDeviceBreakdown(projectId, start, end);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function inspectGSCUrl(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ success: false, error: 'url is required in request body.' });
      return;
    }

    // Ownership verified by middleware; URL scope validation is in gscService.inspectUrl
    const projectId = req.verifiedProject?._id?.toString() || req.params.projectId;
    const result = await gscService.inspectUrl(projectId, url);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function listGSCSitemaps(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    // H-3 fix: Ignore any client-supplied siteUrl override.
    // Always use the stored connection's siteUrl (enforced in gscService.listSitemaps).
    // Ownership verified by middleware.
    const projectId = req.verifiedProject?._id?.toString() || req.params.projectId;
    const result = await gscService.listSitemaps(projectId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function submitGSCSitemap(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { siteUrl, feedpath } = req.body;
    if (!siteUrl || !feedpath) {
      res.status(400).json({ success: false, error: 'siteUrl and feedpath are required.' });
      return;
    }

    // Ownership verified by middleware; domain validation is in gscService.submitSitemap
    const projectId = req.verifiedProject?._id?.toString() || req.params.projectId;
    await gscService.submitSitemap(projectId, siteUrl, feedpath);
    res.json({ success: true, data: { message: 'Sitemap submitted successfully.' } });
  } catch (err) {
    next(err);
  }
}

export async function disconnectGSC(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    // C-4 fix: Ownership verified by middleware; pass userId to service for defense-in-depth
    const projectId = req.verifiedProject?._id?.toString() || req.params.projectId;
    const userId = req.user!.email;
    await gscService.disconnectGSC(projectId, userId);
    res.json({ success: true, data: { message: 'Google Search Console disconnected.' } });
  } catch (err) {
    next(err);
  }
}

// ─── Scheduled Audits ─────────────────────────────────────────────────────

export async function createSchedule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { frequency, dayOfWeek, dayOfMonth } = req.body;
    if (!frequency || !['weekly', 'monthly'].includes(frequency)) {
      res.status(400).json({ success: false, error: 'frequency must be "weekly" or "monthly".' });
      return;
    }

    if (frequency === 'weekly' && (dayOfWeek === undefined || dayOfWeek === null)) {
      res.status(400).json({ success: false, error: 'dayOfWeek is required for weekly schedules.' });
      return;
    }

    if (frequency === 'monthly' && (dayOfMonth === undefined || dayOfMonth === null)) {
      res.status(400).json({ success: false, error: 'dayOfMonth is required for monthly schedules.' });
      return;
    }

    const schedule = await schedulerService.upsertSchedule(req.params.id, frequency, dayOfWeek, dayOfMonth);
    res.status(201).json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
}

export async function getSchedule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const schedule = await schedulerService.getSchedule(req.params.id);
    res.json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
}

export async function updateSchedule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { frequency, dayOfWeek, dayOfMonth, isActive } = req.body;

    if (isActive === false) {
      await schedulerService.deactivateSchedule(req.params.id);
      res.json({ success: true, data: { message: 'Schedule deactivated.' } });
      return;
    }

    const schedule = await schedulerService.upsertSchedule(
      req.params.id,
      frequency || 'weekly',
      dayOfWeek,
      dayOfMonth,
    );
    res.json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
}

export async function deleteSchedule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await schedulerService.deleteSchedule(req.params.id);
    res.json({ success: true, data: { message: 'Schedule deleted.' } });
  } catch (err) {
    next(err);
  }
}

// ─── Competitor Intelligence ──────────────────────────────────────────────

export async function getCompetitorIntelligence(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await Project.findById(req.params.id).lean();
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }

    // Crawl main site for detailed comparison data
    let mainCrawlData: Record<string, unknown> = {};
    try {
      const mainCrawl = await crawlUrl(project.url);
      mainCrawlData = {
        title: mainCrawl.title,
        h1: mainCrawl.headings.find((h) => h.level === 1)?.text || null,
        wordCount: mainCrawl.visibleText.split(/\s+/).filter(Boolean).length,
        keywordCount: new Set(mainCrawl.metaKeywords).size,
        internalLinks: mainCrawl.internalLinks.length,
        externalLinks: mainCrawl.externalLinks.length,
        schemaMarkup: mainCrawl.structuredData.length > 0,
        https: mainCrawl.isHttps,
        securityHeadersCount: Object.values(mainCrawl.technicalDetails.securityHeaders).filter(Boolean).length,
        contentTopics: mainCrawl.headings.filter((h) => h.level <= 2).map((h) => h.text).slice(0, 15),
      };
    } catch (err) {
      console.error('[competitor-intel] Failed to crawl main site:', err);
    }

    // Crawl competitors for comparison
    const competitorData: Array<Record<string, unknown>> = [];
    const gaps: Array<{ competitor: string; gap: string; severity: 'critical' | 'warning' | 'info' }> = [];

    const competitorAudits = await auditService.getCompetitorAudits(req.params.id);
    const compAuditMap = new Map(competitorAudits.map((ca: any) => [ca.competitorUrl, ca]));

    for (const compUrl of project.competitors) {
      try {
        const compCrawl = await crawlUrl(compUrl);
        const hostname = (() => { try { return new URL(compUrl).hostname; } catch { return compUrl; } })();

        const compData = {
          url: compUrl,
          title: compCrawl.title,
          h1: compCrawl.headings.find((h) => h.level === 1)?.text || null,
          wordCount: compCrawl.visibleText.split(/\s+/).filter(Boolean).length,
          keywordCount: new Set(compCrawl.metaKeywords).size,
          internalLinks: compCrawl.internalLinks.length,
          externalLinks: compCrawl.externalLinks.length,
          schemaMarkup: compCrawl.structuredData.length > 0,
          https: compCrawl.isHttps,
          securityHeadersCount: Object.values(compCrawl.technicalDetails.securityHeaders).filter(Boolean).length,
          contentTopics: compCrawl.headings.filter((h) => h.level <= 2).map((h) => h.text).slice(0, 15),
        };
        competitorData.push(compData);

        // Generate actionable gaps
        const mainInternalLinks = (mainCrawlData.internalLinks as number) || 0;
        if (compCrawl.internalLinks.length > mainInternalLinks * 2) {
          gaps.push({
            competitor: hostname,
            gap: `${hostname} has ${compCrawl.internalLinks.length} internal links vs your ${mainInternalLinks}`,
            severity: 'warning',
          });
        }

        if (compCrawl.hasFaqSchema && !(mainCrawlData.schemaMarkup)) {
          gaps.push({
            competitor: hostname,
            gap: `${hostname} uses FAQ schema markup`,
            severity: 'info',
          });
        }

        if (compCrawl.structuredData.length > 0 && !mainCrawlData.schemaMarkup) {
          gaps.push({
            competitor: hostname,
            gap: `${hostname} has structured data/schema markup`,
            severity: 'warning',
          });
        }

        const compWordCount = compCrawl.visibleText.split(/\s+/).filter(Boolean).length;
        const mainWordCount = (mainCrawlData.wordCount as number) || 0;
        if (compWordCount > mainWordCount * 2) {
          gaps.push({
            competitor: hostname,
            gap: `${hostname} has ~${Math.round(compWordCount / Math.max(mainWordCount, 1))}x more content (${compWordCount} words vs ${mainWordCount})`,
            severity: 'critical',
          });
        }

        const compSecurityCount = Object.values(compCrawl.technicalDetails.securityHeaders).filter(Boolean).length;
        const mainSecurityCount = (mainCrawlData.securityHeadersCount as number) || 0;
        if (compSecurityCount > mainSecurityCount + 2) {
          gaps.push({
            competitor: hostname,
            gap: `${hostname} has ${compSecurityCount} security headers vs your ${mainSecurityCount}`,
            severity: 'warning',
          });
        }

        // Check for topic coverage gaps
        const mainTopics = ((mainCrawlData.contentTopics as string[]) || []).map((t: string) => t.toLowerCase());
        for (const topic of compCrawl.headings.filter((h) => h.level <= 2).map((h) => h.text).slice(0, 10)) {
          const isCovered = mainTopics.some((mt: string) => {
            const mtWords = mt.split(/\s+/).filter((w: string) => w.length > 3);
            const topicWords = topic.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
            const overlap = topicWords.filter((w: string) => mtWords.includes(w)).length;
            return overlap >= Math.min(mtWords.length, topicWords.length) * 0.5;
          });
          if (!isCovered && topic.length > 5) {
            gaps.push({
              competitor: hostname,
              gap: `${hostname} covers "${topic.substring(0, 60)}" which your site doesn't`,
              severity: 'info',
            });
          }
        }
      } catch (err) {
        console.error(`[competitor-intel] Failed to crawl ${compUrl}:`, err);
      }
    }

    res.json({
      success: true,
      data: {
        mainSite: mainCrawlData,
        competitors: competitorData,
        gaps: gaps.slice(0, 30),
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Content Plan Generation ──────────────────────────────────────────────

export async function generateContentPlanHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { gapId } = req.body;
    if (!gapId || typeof gapId !== 'string') {
      res.status(400).json({ success: false, error: 'gapId is required.' });
      return;
    }

    const gap = await ContentGap.findById(gapId);
    if (!gap) {
      res.status(404).json({ success: false, error: 'Content gap not found.' });
      return;
    }

    // Verify the gap belongs to this project
    if (gap.projectId.toString() !== req.params.id) {
      res.status(403).json({ success: false, error: 'Content gap does not belong to this project.' });
      return;
    }

    const prompt = `Generate a detailed content plan for the following topic gap analysis. This is a SUGGESTION that requires human review before publishing.

Topic: ${gap.topic}
Search Intent: ${gap.searchIntent || 'informational'}
Primary Keyword: ${gap.primaryKeyword || gap.topic}
Secondary Keywords: ${(gap.secondaryKeywords || []).join(', ') || 'N/A'}
Questions to Answer: ${(gap.questions || []).join('; ') || 'N/A'}
Competitors Covering This: ${gap.competitorUrls.length} competitor(s)
Priority: ${gap.priority}

Generate a JSON response with exactly these fields:
{
  "topic": "the blog topic",
  "searchIntent": "informational|commercial|transactional",
  "primaryKeyword": "the primary target keyword",
  "secondaryKeywords": ["keyword1", "keyword2", "keyword3"],
  "suggestedTitle": "SEO-optimized title for the article",
  "outline": ["H2: Section Title", "H3: Subsection", "H2: Another Section", ...],
  "internalLinks": ["Suggest pages from the site that should link to this article or vice versa"],
  "cta": "A suggested call-to-action for the end of the article"
}

Return ONLY valid JSON, no markdown fences.`;

    const aiResponse = await generateCompletion(prompt, { maxTokens: 2048 });

    // Parse AI response
    let plan: Record<string, unknown>;
    try {
      // Try to extract JSON from the response (in case it's wrapped in markdown)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      plan = JSON.parse(jsonMatch ? jsonMatch[0] : aiResponse);
    } catch {
      res.status(500).json({ success: false, error: 'Failed to parse AI-generated content plan.' });
      return;
    }

    // Save the plan on the document
    gap.contentPlan = {
      topic: String(plan.topic || gap.topic),
      searchIntent: String(plan.searchIntent || gap.searchIntent || 'informational'),
      primaryKeyword: String(plan.primaryKeyword || gap.primaryKeyword || ''),
      secondaryKeywords: Array.isArray(plan.secondaryKeywords) ? plan.secondaryKeywords.map(String) : [],
      suggestedTitle: String(plan.suggestedTitle || gap.suggestedTitle || ''),
      outline: Array.isArray(plan.outline) ? plan.outline.map(String) : [],
      internalLinks: Array.isArray(plan.internalLinks) ? plan.internalLinks.map(String) : [],
      cta: String(plan.cta || ''),
    };

    await gap.save();

    res.json({ success: true, data: gap.contentPlan });
  } catch (err) {
    next(err);
  }
}

// ─── Website Intelligence — Exports & Issues ──────────────────────────────

export async function exportSeoChecklist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const audit = await auditService.getAuditById(req.params.auditId);
    if (!audit) {
      res.status(404).json({ success: false, error: 'Audit not found.' });
      return;
    }

    const a = audit as any;
    const lines: string[] = [
      '# SEO Audit Checklist',
      `# Generated: ${new Date().toISOString()}`,
      '',
    ];

    for (const [layer, results] of Object.entries(a.results || {})) {
      if (!results) continue;
      const r = results as any;
      lines.push(`## ${layer.toUpperCase()} (${r.score}/100)`);
      lines.push('');
      for (const check of r.checks || []) {
        const icon = check.status === 'pass' ? '[x]' : check.status === 'warn' ? '[!]' : '[ ]';
        lines.push(`${icon} ${check.name}: ${check.details}`);
      }
      lines.push('');
    }

    const content = lines.join('\n');
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="seo-checklist-${req.params.auditId}.md"`);
    res.send(content);
  } catch (err) {
    next(err);
  }
}

export async function getExecutiveSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const audit = await auditService.getAuditById(req.params.auditId);
    if (!audit) {
      res.status(404).json({ success: false, error: 'Audit not found.' });
      return;
    }

    const a = audit as any;
    const scores = a.scores || {};
    const allScores = Object.values(scores).filter((v: unknown): v is number => typeof v === 'number');
    const overallScore = allScores.length > 0
      ? Math.round(allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length)
      : 0;

    let criticalCount = 0;
    let warnCount = 0;
    let passCount = 0;
    for (const lr of Object.values(a.results || {})) {
      if (!lr) continue;
      const r = lr as any;
      for (const c of r.checks || []) {
        if (c.status === 'fail') criticalCount++;
        else if (c.status === 'warn') warnCount++;
        else passCount++;
      }
    }

    const summary = [
      `Website Health Score: ${overallScore}/100`,
      `Critical Issues: ${criticalCount}`,
      `Warnings: ${warnCount}`,
      `Passed Checks: ${passCount}`,
      '',
      'Score Breakdown:',
      ...Object.entries(scores).map(([k, v]) => `  - ${k.toUpperCase()}: ${v}/100`),
      '',
      `Top Recommendations:`,
      ...(a.recommendations || []).slice(0, 5).map((r: any) => `  - [${r.severity}] ${r.title}`),
    ].join('\n');

    res.json({ success: true, data: { summary } });
  } catch (err) {
    next(err);
  }
}

export async function generateIssueFix(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { auditId, issueId } = req.params;
    const audit = await auditService.getAuditById(auditId);
    if (!audit) {
      res.status(404).json({ success: false, error: 'Audit not found.' });
      return;
    }

    const { transformResultsToIssues, generateFixForIssue } = await import('../services/issueService');
    const project = await Project.findOne({ _id: (audit as any).projectId });
    const url = project?.url || '';
    const issues = transformResultsToIssues((audit as any).results || {}, url);
    const issue = issues.find((i) => i.id === issueId);

    if (!issue) {
      res.status(404).json({ success: false, error: 'Issue not found in this audit.' });
      return;
    }

    const fixCode = await generateFixForIssue(issue);
    res.json({ success: true, data: { issueId, fixCode } });
  } catch (err) {
    next(err);
  }
}

export async function updateIssueStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.body;
    if (!status || !['open', 'inProgress', 'resolved', 'ignored'].includes(status)) {
      res.status(400).json({ success: false, error: 'Valid status required: open, inProgress, resolved, or ignored.' });
      return;
    }

    // Issue status is client-side state; acknowledge the update
    res.json({ success: true, data: { issueId: req.params.issueId, status } });
  } catch (err) {
    next(err);
  }
}

export async function fixAllSafeIssues(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const audit = await auditService.getAuditById(req.params.auditId);
    if (!audit) {
      res.status(404).json({ success: false, error: 'Audit not found.' });
      return;
    }

    const { transformResultsToIssues, generateFixesForAllSafeIssues } = await import('../services/issueService');
    const project = await Project.findOne({ _id: (audit as any).projectId });
    const url = project?.url || '';
    const issues = transformResultsToIssues((audit as any).results || {}, url);
    const fixedIssues = await generateFixesForAllSafeIssues(issues);

    const fixesGenerated = fixedIssues.filter((i) => i.fixCode !== null).length;
    res.json({ success: true, data: { issues: fixedIssues, fixesGenerated } });
  } catch (err) {
    next(err);
  }
}

export async function generateHealthReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const audit = await auditService.getAuditById(req.params.auditId);
    if (!audit || (audit as any).status !== 'completed') {
      res.status(400).json({ success: false, error: 'No completed audit available.' });
      return;
    }

    const project = await Project.findById((audit as any).projectId).lean();
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }

    const { transformResultsToIssues, generateActionPlan } = await import('../services/issueService');
    const { generateHealthReport: genPDF, buildHealthReportData } = await import('../services/pdfService');

    const issues = transformResultsToIssues((audit as any).results || {}, project.url);
    const actionPlan = generateActionPlan(issues);

    const reportData = buildHealthReportData(
      audit as any,
      project.name,
      project.url,
      actionPlan.map((a) => ({ rank: a.rank, issueId: a.issueId, title: a.title, category: a.category, priorityScore: a.priorityScore })),
    );

    const doc = genPDF(reportData);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="health-report-${new Date().toISOString().slice(0, 10)}.pdf"`);
    doc.pipe(res);
  } catch (err) {
    next(err);
  }
}
