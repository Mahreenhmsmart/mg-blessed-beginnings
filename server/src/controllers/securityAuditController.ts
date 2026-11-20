/**
 * Security Audit Controller
 * Handles API requests for security scanning functionality.
 */

import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth';
import * as scannerService from '../services/securityScannerService';

/**
 * POST /api/security-audit/authorize
 * Validate target and confirm authorization before starting scan.
 */
export async function authorizeTarget(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { target } = req.body;

    if (!target || typeof target !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Target is required',
        statusCode: 400,
      });
      return;
    }

    const validation = scannerService.validateAndNormalizeTarget(target);

    if (!validation.valid) {
      res.status(400).json({
        success: false,
        error: validation.error,
        statusCode: 400,
      });
      return;
    }

    // Return validated target info for confirmation
    res.json({
      success: true,
      data: {
        target: target.trim(),
        normalizedTarget: validation.normalized,
        message: 'Target validated. Please confirm authorization to proceed.',
        authorizationNotice: 'Only scan websites and systems you own or have explicit authorization to test.',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/security-audit/start
 * Start a new authorized security scan.
 */
export async function startScan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        statusCode: 401,
      });
      return;
    }

    const { target, authorizationConfirmed } = req.body;

    // Require explicit authorization confirmation
    if (!authorizationConfirmed || authorizationConfirmed !== true) {
      res.status(400).json({
        success: false,
        error: 'Authorization confirmation is required. You must confirm that you own or have explicit permission to scan this target.',
        statusCode: 400,
      });
      return;
    }

    if (!target || typeof target !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Target is required',
        statusCode: 400,
      });
      return;
    }

    // Validate target
    const validation = scannerService.validateAndNormalizeTarget(target);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        error: validation.error,
        statusCode: 400,
      });
      return;
    }

    // Check concurrent scan limit
    const atLimit = await scannerService.checkUserScanLimit(userId);
    if (atLimit) {
      res.status(429).json({
        success: false,
        error: 'Too many concurrent scans. Please wait for existing scans to complete.',
        statusCode: 429,
      });
      return;
    }

    // Check hourly rate limit (max 3 per hour)
    const atHourlyLimit = await scannerService.checkHourlyRateLimit(userId);
    if (atHourlyLimit) {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Maximum 3 scans per hour. Please try again later.',
        statusCode: 429,
      });
      return;
    }

    // Start the scan
    const result = await scannerService.startScan(userId, target.trim(), validation.normalized!);

    res.status(201).json({
      success: true,
      data: {
        scanId: result.scanId,
        status: 'pending',
        message: 'Security scan started successfully',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/security-audit/status/:scanId
 * Get current scan status for polling.
 */
export async function getScanStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        statusCode: 401,
      });
      return;
    }

    const { scanId } = req.params;

    const status = await scannerService.getScanStatus(scanId, userId);

    if (!status) {
      res.status(404).json({
        success: false,
        error: 'Scan not found',
        statusCode: 404,
      });
      return;
    }

    res.json({
      success: true,
      data: status,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/security-audit/:scanId
 * Get full scan details including findings.
 */
export async function getScanDetails(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        statusCode: 401,
      });
      return;
    }

    const { scanId } = req.params;

    const details = await scannerService.getScanDetails(scanId, userId);

    if (!details) {
      res.status(404).json({
        success: false,
        error: 'Scan not found',
        statusCode: 404,
      });
      return;
    }

    res.json({
      success: true,
      data: details,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/security-audit/history
 * Get user's scan history.
 */
export async function getScanHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        statusCode: 401,
      });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 20;

    const history = await scannerService.getScanHistory(userId, limit);

    res.json({
      success: true,
      data: {
        scans: history,
        total: history.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/security-audit/report/:scanId
 * Get scan report content (Markdown).
 */
export async function getScanReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        statusCode: 401,
      });
      return;
    }

    const { scanId } = req.params;

    const report = await scannerService.getScanReport(scanId, userId);

    if (!report) {
      res.status(404).json({
        success: false,
        error: 'Report not found or scan not completed',
        statusCode: 404,
      });
      return;
    }

    res.json({
      success: true,
      data: {
        scanId,
        format: 'markdown',
        content: report,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/security-audit/:scanId
 * Delete a scan and its associated data.
 */
export async function deleteScan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        statusCode: 401,
      });
      return;
    }

    const { scanId } = req.params;

    const deleted = await scannerService.deleteScan(scanId, userId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Scan not found',
        statusCode: 404,
      });
      return;
    }

    res.json({
      success: true,
      data: {
        message: 'Scan deleted successfully',
      },
    });
  } catch (err) {
    next(err);
  }
}
