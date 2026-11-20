/**
 * Website Intelligence Routes — Standalone website auditing endpoints.
 * All endpoints protected with JWT auth middleware.
 */

import { Router } from 'express';
import { protect } from '../middleware/auth';
import * as websiteIntelController from '../controllers/websiteIntelController';

const router = Router();

// ─── Audit Lifecycle ──────────────────────────────────────────────────────
router.post('/audit', protect, websiteIntelController.startAudit);
router.get('/audit/:auditId/status', protect, websiteIntelController.getAuditStatus);
router.get('/audit/:auditId', protect, websiteIntelController.getAuditResult);
router.delete('/audit/:auditId', protect, websiteIntelController.deleteAudit);

// ─── History & Comparison ─────────────────────────────────────────────────
router.get('/history', protect, websiteIntelController.getAuditHistory);
router.get('/compare', protect, websiteIntelController.compareAudits);

// ─── Findings Actions ─────────────────────────────────────────────────────
router.post('/audit/:auditId/findings/:findingId/fix', protect, websiteIntelController.generateFix);
router.post('/audit/:auditId/findings/:findingId/resolve', protect, websiteIntelController.resolveFinding);

// ─── Export ───────────────────────────────────────────────────────────────
router.get('/audit/:auditId/export', protect, websiteIntelController.exportReport);

// ─── Data Providers ───────────────────────────────────────────────────────
router.get('/providers', protect, websiteIntelController.checkProviders);

// ─── Keyword Suggestions ──────────────────────────────────────────────────
router.get('/audit/:auditId/keyword-suggestions', protect, websiteIntelController.getKeywordSuggestions);

// ─── Competitor Analysis ──────────────────────────────────────────────────
router.post('/audit/:auditId/competitors', protect, websiteIntelController.analyzeCompetitors);

export default router;
