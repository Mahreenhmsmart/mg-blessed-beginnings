/**
 * Security Audit Routes
 * All endpoints protected with JWT auth middleware.
 */

import { Router } from 'express';
import { protect } from '../middleware/auth';
import * as securityAuditController from '../controllers/securityAuditController';

const router = Router();

// ─── Authorization & Target Validation ──────────────────────────────────────
router.post('/authorize', protect, securityAuditController.authorizeTarget);

// ─── Scan Operations ────────────────────────────────────────────────────────
router.post('/start', protect, securityAuditController.startScan);
router.get('/status/:scanId', protect, securityAuditController.getScanStatus);
router.get('/history', protect, securityAuditController.getScanHistory);
router.get('/report/:scanId', protect, securityAuditController.getScanReport);
router.get('/:scanId', protect, securityAuditController.getScanDetails);
router.delete('/:scanId', protect, securityAuditController.deleteScan);

export default router;
