/**
 * Audit Routes — All endpoints protected with JWT auth middleware.
 */

import { Router } from 'express';
import { protect, restrictTo, verifyProjectOwnership } from '../middleware/auth';
import * as auditController from '../controllers/auditController';

const router = Router();

// ─── Projects ──────────────────────────────────────────────────────────────
router.post('/projects', protect, restrictTo('admin', 'manager'), auditController.createProject);
router.get('/projects', protect, auditController.getProjects);
router.get('/projects/:id', protect, auditController.getProjectById);
router.patch('/projects/:id', protect, restrictTo('admin', 'manager'), auditController.updateProject);
router.delete('/projects/:id', protect, restrictTo('admin'), auditController.deleteProject);

// ─── Audits ────────────────────────────────────────────────────────────────
router.post('/projects/:id/audit', protect, restrictTo('admin', 'manager'), auditController.triggerAudit);
router.get('/projects/:id/audits', protect, auditController.getAuditsByProject);
router.get('/projects/:projectId/audits/:auditId', protect, auditController.getAuditByProjectAndId);
router.get('/audits/:id', protect, auditController.getAuditById);
router.get('/audits/:id/insights', protect, auditController.getAuditInsights);

// ─── Reports ───────────────────────────────────────────────────────────────
router.get('/projects/:id/reports/pdf', protect, auditController.generatePDFReport);
router.get('/projects/:id/reports/csv', protect, auditController.generateCSVReport);

// ─── Gap Analysis ─────────────────────────────────────────────────────────
router.get('/projects/:id/keyword-gaps', protect, auditController.getKeywordGaps);
router.post('/projects/:id/keyword-gaps/reanalyze', protect, restrictTo('admin', 'manager'), auditController.reanalyzeKeywordGapsHandler);
router.get('/projects/:id/backlinks', protect, auditController.getBacklinks);
router.post('/projects/:id/backlinks/reanalyze', protect, restrictTo('admin', 'manager'), auditController.reanalyzeBacklinksHandler);
router.get('/projects/:id/content-gaps', protect, auditController.getContentGaps);
router.post('/projects/:id/content-gaps/reanalyze', protect, restrictTo('admin', 'manager'), auditController.reanalyzeContentGapsHandler);

// ─── Competitors ──────────────────────────────────────────────────────────
router.get('/projects/:id/competitors', protect, auditController.getCompetitorComparison);
router.get('/projects/:id/competitor-intelligence', protect, auditController.getCompetitorIntelligence);
router.post('/projects/:id/competitors', protect, restrictTo('admin', 'manager'), auditController.addCompetitor);
router.delete('/projects/:id/competitors', protect, restrictTo('admin', 'manager'), auditController.removeCompetitor);
router.post('/projects/:id/competitors/audit', protect, restrictTo('admin', 'manager'), auditController.triggerCompetitorAudit);

// ─── Content Plan Generation ─────────────────────────────────────────────
router.post('/projects/:id/content-gaps/generate-plan', protect, restrictTo('admin', 'manager'), auditController.generateContentPlanHandler);

// ─── AI Visibility ────────────────────────────────────────────────────────
router.post('/projects/:id/ai-visibility/check', protect, restrictTo('admin', 'manager'), auditController.triggerVisibilityCheck);
router.get('/projects/:id/ai-visibility/history', protect, auditController.getVisibilityHistoryHandler);
router.get('/projects/:id/ai-visibility/summary', protect, auditController.getVisibilitySummaryHandler);

// ─── Google Search Console ────────────────────────────────────────────────
router.get('/gsc/config', protect, auditController.checkGSCConfig);
router.get('/projects/:id/gsc/auth-url', protect, verifyProjectOwnership, auditController.getGSCAuthUrl);
router.get('/gsc/callback', protect, auditController.gscCallback);
router.post('/projects/:id/gsc/import', protect, verifyProjectOwnership, restrictTo('admin', 'manager'), auditController.importGSCData);
router.get('/projects/:id/gsc/data', protect, verifyProjectOwnership, auditController.getGSCData);

// Extended GSC endpoints — all protected with ownership verification
router.get('/seo/gsc/properties/:projectId', protect, verifyProjectOwnership, auditController.listGSCProperties);
router.get('/seo/gsc/analytics/:projectId', protect, verifyProjectOwnership, auditController.getGSCAnalyticsByDimension);
router.get('/seo/gsc/top-queries/:projectId', protect, verifyProjectOwnership, auditController.getGSCTopQueries);
router.get('/seo/gsc/top-pages/:projectId', protect, verifyProjectOwnership, auditController.getGSCTopPages);
router.get('/seo/gsc/countries/:projectId', protect, verifyProjectOwnership, auditController.getGSCCountries);
router.get('/seo/gsc/devices/:projectId', protect, verifyProjectOwnership, auditController.getGSCDevices);
router.post('/seo/gsc/inspect/:projectId', protect, verifyProjectOwnership, auditController.inspectGSCUrl);
router.get('/seo/gsc/sitemaps/:projectId', protect, verifyProjectOwnership, auditController.listGSCSitemaps);
router.post('/seo/gsc/sitemaps/:projectId', protect, verifyProjectOwnership, auditController.submitGSCSitemap);
router.delete('/seo/gsc/disconnect/:projectId', protect, verifyProjectOwnership, auditController.disconnectGSC);

// ─── Scheduled Audits ─────────────────────────────────────────────────────
router.post('/projects/:id/schedules', protect, restrictTo('admin', 'manager'), auditController.createSchedule);
router.get('/projects/:id/schedules', protect, auditController.getSchedule);
router.put('/projects/:id/schedules', protect, restrictTo('admin', 'manager'), auditController.updateSchedule);
router.delete('/projects/:id/schedules', protect, restrictTo('admin', 'manager'), auditController.deleteSchedule);

// ─── Website Intelligence — Exports & Issues ──────────────────────────────
router.get('/audits/:auditId/export/checklist', protect, auditController.exportSeoChecklist);
router.get('/audits/:auditId/executive-summary', protect, auditController.getExecutiveSummary);
router.post('/audits/:auditId/issues/:issueId/fix', protect, auditController.generateIssueFix);
router.post('/audits/:auditId/issues/:issueId/status', protect, auditController.updateIssueStatus);
router.post('/audits/:auditId/fix-all', protect, auditController.fixAllSafeIssues);
router.get('/audits/:auditId/health-report', protect, auditController.generateHealthReport);

export default router;
