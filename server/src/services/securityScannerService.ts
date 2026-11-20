/**
 * Security Scanner Service
 * Manages security scan execution using the pure TypeScript scanner.
 * Handles background job execution, status polling, and result processing.
 * No child_process usage — all scanning runs via native Node.js async APIs.
 */

import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import SecurityScan from '../models/SecurityScan';
import SecurityFinding from '../models/SecurityFinding';
import { runFallbackScan } from './fallbackScanner';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCANNER_DIR = path.resolve(__dirname, '../../security-scanner');
const REPORTS_DIR = path.join(SCANNER_DIR, 'reports');

// Active scans tracking for concurrency control
const activeScans = new Map<string, { abortController: AbortController; startTime: number }>();

// Configuration
const MAX_CONCURRENT_SCANS_PER_USER = 1;
const MAX_SCANS_PER_HOUR = 3;
const SCAN_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes max
const STATUS_POLL_INTERVAL_MS = 2000;

/**
 * Validate and normalize target input.
 * Prevents shell injection and ensures valid format.
 */
export function validateAndNormalizeTarget(target: string): { valid: boolean; normalized?: string; error?: string } {
  if (!target || typeof target !== 'string') {
    return { valid: false, error: 'Target is required' };
  }

  const trimmed = target.trim();

  // Check for shell injection characters
  if (/[;&|`$(){}[\]<>\\!#]/.test(trimmed)) {
    return { valid: false, error: 'Invalid target: contains disallowed characters' };
  }

  // Remove protocol prefix for normalization
  let hostname = trimmed;
  if (hostname.startsWith('http://')) {
    hostname = hostname.substring(7);
  } else if (hostname.startsWith('https://')) {
    hostname = hostname.substring(8);
  }

  // Remove trailing slashes and paths
  hostname = hostname.split('/')[0];

  // Basic validation - must look like a domain or IP
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;

  const isIp = ipPattern.test(hostname);
  const isDomain = domainPattern.test(hostname);

  if (!isIp && !isDomain) {
    return { valid: false, error: 'Invalid target format. Use a domain name or IP address.' };
  }

  // Validate IP octets if it's an IP
  if (isIp) {
    const octets = hostname.split('.').map(Number);
    if (octets.some(o => o < 0 || o > 255)) {
      return { valid: false, error: 'Invalid IP address: octets must be 0-255' };
    }
  }

  return { valid: true, normalized: hostname.toLowerCase() };
}

/**
 * Check if user has too many concurrent scans running.
 */
export async function checkUserScanLimit(userId: string): Promise<boolean> {
  const activeCount = await SecurityScan.countDocuments({
    userId,
    status: { $in: ['planning', 'reconnaissance', 'port_analysis', 'web_security_audit', 'generating_report'] },
  });

  return activeCount >= MAX_CONCURRENT_SCANS_PER_USER;
}

/**
 * Check if user has exceeded hourly scan rate limit.
 */
export async function checkHourlyRateLimit(userId: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await SecurityScan.countDocuments({
    userId,
    createdAt: { $gte: oneHourAgo },
  });

  return recentCount >= MAX_SCANS_PER_HOUR;
}

/**
 * Start a new security scan.
 */
export async function startScan(
  userId: string,
  target: string,
  normalizedTarget: string
): Promise<{ scanId: string }> {
  const scanId = crypto.randomUUID();
  const outputDir = path.join(REPORTS_DIR, scanId);

  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });

  // Create scan record
  const scan = await SecurityScan.create({
    userId,
    scanId,
    target,
    normalizedTarget,
    authorizationConfirmed: true,
    authorizationTimestamp: new Date(),
    status: 'pending',
    progress: 0,
    statusMessage: 'Initializing scan...',
  });

  // Start scanner process in background
  runScannerProcess(scanId, normalizedTarget, outputDir).catch((err) => {
    console.error(`[SecurityScanner] Process error for ${scanId}:`, err);
  });

  return { scanId };
}

/**
 * Run the TypeScript scanner directly (no child_process).
 * Uses Promise-based async execution with timeout enforcement.
 */
async function runScannerProcess(scanId: string, target: string, outputDir: string): Promise<void> {
  // Update status to planning
  await SecurityScan.findOneAndUpdate(
    { scanId },
    { status: 'planning', startTime: new Date() }
  );

  const abortController = new AbortController();
  activeScans.set(scanId, { abortController, startTime: Date.now() });

  // Set up timeout using Promise.race
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Scan timed out after 5 minutes'));
    }, SCAN_TIMEOUT_MS);
  });

  try {
    // Start status file polling for real-time updates
    pollStatusFile(scanId, outputDir);

    // Race between the actual scan and the timeout
    const success = await Promise.race([
      runFallbackScan(target, scanId, outputDir),
      timeoutPromise,
    ]);

    activeScans.delete(scanId);

    if (success) {
      await processScanResults(scanId, outputDir);
    } else {
      // Scanner returned false — try to read partial results
      await processScanResults(scanId, outputDir);
    }
  } catch (err) {
    activeScans.delete(scanId);
    const errorMessage = err instanceof Error ? err.message : 'Unknown scanner error';
    console.error(`[SecurityScanner] Error for ${scanId}:`, errorMessage);

    await SecurityScan.findOneAndUpdate(
      { scanId },
      {
        status: 'failed',
        errorMessage,
        completionTime: new Date(),
      }
    );

    // Try to save any partial results
    try {
      await processScanResults(scanId, outputDir);
    } catch {
      // Non-fatal — already marked as failed
    }
  }
}

/**
 * Poll the status file written by the scanner for real-time updates.
 */
async function pollStatusFile(scanId: string, outputDir: string): Promise<void> {
  const statusFilePath = path.join(outputDir, 'status.json');

  const poll = async () => {
    const scan = await SecurityScan.findOne({ scanId });
    if (!scan || scan.status === 'completed' || scan.status === 'failed' || scan.status === 'cancelled') {
      return;
    }

    try {
      if (fs.existsSync(statusFilePath)) {
        const content = fs.readFileSync(statusFilePath, 'utf-8');
        const statusData = JSON.parse(content);

        // Map scanner status to database status
        const statusMap: Record<string, string> = {
          planning: 'planning',
          reconnaissance: 'reconnaissance',
          port_analysis: 'port_analysis',
          web_security_audit: 'web_security_audit',
          generating_report: 'generating_report',
          completed: 'completed',
          failed: 'failed',
        };

        const dbStatus = statusMap[statusData.status] || scan.status;

        await SecurityScan.findOneAndUpdate(
          { scanId },
          {
            status: dbStatus,
            progress: statusData.progress || scan.progress,
            statusMessage: statusData.message || scan.statusMessage,
          }
        );

        if (statusData.status === 'completed' || statusData.status === 'failed') {
          return; // Stop polling
        }
      }
    } catch (err) {
      // Status file may not exist yet or be partially written
    }

    // Continue polling
    setTimeout(poll, STATUS_POLL_INTERVAL_MS);
  };

  poll();
}

/**
 * Process scan results after successful completion.
 */
async function processScanResults(scanId: string, outputDir: string): Promise<void> {
  try {
    const summaryPath = path.join(outputDir, 'summary.json');

    if (!fs.existsSync(summaryPath)) {
      await SecurityScan.findOneAndUpdate(
        { scanId },
        {
          status: 'failed',
          errorMessage: 'Results file not found',
          completionTime: new Date(),
        }
      );
      return;
    }

    const summaryContent = fs.readFileSync(summaryPath, 'utf-8');
    const summary = JSON.parse(summaryContent);

    // Save findings to database
    if (summary.findings && Array.isArray(summary.findings)) {
      const scanDoc = await SecurityScan.findOne({ scanId });
      if (scanDoc) {
        for (const finding of summary.findings) {
          await SecurityFinding.create({
            scanId: scanDoc._id,
            title: finding.title,
            severity: finding.severity,
            target: finding.target,
            evidence: finding.evidence,
            impact: finding.impact,
            remediation: finding.remediation,
            status: 'open',
          });
        }
      }
    }

    // Update scan record with results
    const finalStatus = summary.status === 'failed' ? 'failed' : 'completed';

    // Read report content for storage in DB
    let reportContent: string | null = null;
    const reportPath = path.join(outputDir, 'report.md');
    if (finalStatus === 'completed' && fs.existsSync(reportPath)) {
      try {
        reportContent = fs.readFileSync(reportPath, 'utf-8');
      } catch {
        // Non-fatal — report file read failure
      }
    }

    await SecurityScan.findOneAndUpdate(
      { scanId },
      {
        status: finalStatus,
        progress: finalStatus === 'completed' ? 100 : 0,
        statusMessage: finalStatus === 'completed' ? 'Scan completed successfully' : (summary.error || 'Scan failed'),
        errorMessage: summary.error || null,
        completionTime: new Date(),
        score: summary.score ?? null,
        findingsCount: {
          critical: summary.severity_counts?.Critical || 0,
          high: summary.severity_counts?.High || 0,
          medium: summary.severity_counts?.Medium || 0,
          low: summary.severity_counts?.Low || 0,
          informational: summary.severity_counts?.Informational || 0,
        },
        reportPath: finalStatus === 'completed' ? reportPath : null,
        reportContent,
      }
    );
  } catch (err) {
    console.error(`[SecurityScanner] Error processing results for ${scanId}:`, err);
    await SecurityScan.findOneAndUpdate(
      { scanId },
      {
        status: 'failed',
        errorMessage: 'Error processing scan results',
        completionTime: new Date(),
      }
    );
  }
}

/**
 * Get current scan status.
 */
export async function getScanStatus(scanId: string, userId: string) {
  const scan = await SecurityScan.findOne({ scanId, userId });
  if (!scan) {
    return null;
  }

  return {
    scanId: scan.scanId,
    status: scan.status,
    progress: scan.progress,
    statusMessage: scan.statusMessage,
    startTime: scan.startTime,
    completionTime: scan.completionTime,
  };
}

/**
 * Get full scan details including findings.
 */
export async function getScanDetails(scanId: string, userId: string) {
  const scan = await SecurityScan.findOne({ scanId, userId });
  if (!scan) {
    return null;
  }

  const findings = await SecurityFinding.find({ scanId: scan._id }).sort({
    severity: 1,
    createdAt: 1,
  });

  return {
    scanId: scan.scanId,
    target: scan.target,
    status: scan.status,
    score: scan.score,
    findingsCount: scan.findingsCount,
    startTime: scan.startTime,
    completionTime: scan.completionTime,
    findings: findings.map((f) => ({
      id: f._id,
      title: f.title,
      severity: f.severity,
      target: f.target,
      evidence: f.evidence,
      impact: f.impact,
      remediation: f.remediation,
      status: f.status,
    })),
  };
}

/**
 * Get scan report content.
 * Reads from DB first, falls back to file system.
 */
export async function getScanReport(scanId: string, userId: string): Promise<string | null> {
  const scan = await SecurityScan.findOne({ scanId, userId });
  if (!scan) {
    return null;
  }

  // Try DB-stored content first
  if (scan.reportContent) {
    return scan.reportContent;
  }

  // Fall back to file system
  if (!scan.reportPath) {
    return null;
  }

  try {
    if (fs.existsSync(scan.reportPath)) {
      return fs.readFileSync(scan.reportPath, 'utf-8');
    }
  } catch (err) {
    console.error(`[SecurityScanner] Error reading report for ${scanId}:`, err);
  }

  return null;
}

/**
 * Get user's scan history.
 */
export async function getScanHistory(userId: string, limit = 20) {
  const scans = await SecurityScan.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-errorMessage');

  return scans.map((scan) => ({
    scanId: scan.scanId,
    target: scan.target,
    status: scan.status,
    score: scan.score,
    findingsCount: scan.findingsCount,
    createdAt: scan.createdAt,
    completionTime: scan.completionTime,
  }));
}

/**
 * Cancel a running scan.
 */
export async function cancelScan(scanId: string, userId: string): Promise<boolean> {
  const scan = await SecurityScan.findOne({ scanId, userId });
  if (!scan) {
    return false;
  }

  if (['completed', 'failed', 'cancelled'].includes(scan.status)) {
    return false;
  }

  // Abort the active scan if running
  const activeScan = activeScans.get(scanId);
  if (activeScan) {
    activeScan.abortController.abort();
    activeScans.delete(scanId);
  }

  await SecurityScan.findOneAndUpdate(
    { scanId },
    {
      status: 'cancelled',
      completionTime: new Date(),
    }
  );

  return true;
}

/**
 * Delete a scan and its associated data.
 */
export async function deleteScan(scanId: string, userId: string): Promise<boolean> {
  const scan = await SecurityScan.findOne({ scanId, userId });
  if (!scan) {
    return false;
  }

  // Delete findings
  await SecurityFinding.deleteMany({ scanId: scan._id });

  // Delete scan record
  await SecurityScan.deleteOne({ scanId });

  // Optionally clean up files (keep for audit trail in production)
  // const outputDir = path.join(REPORTS_DIR, scanId);
  // if (fs.existsSync(outputDir)) {
  //   fs.rmSync(outputDir, { recursive: true, force: true });
  // }

  return true;
}

/**
 * Cleanup function for graceful shutdown.
 */
export function cleanupActiveScans(): void {
  for (const [scanId, { abortController }] of activeScans) {
    console.log(`[SecurityScanner] Aborting active scan ${scanId}`);
    abortController.abort();
  }
  activeScans.clear();
}
