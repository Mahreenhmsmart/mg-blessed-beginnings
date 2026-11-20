/**
 * Security Audit Service
 * Frontend API calls for security scanning functionality.
 */

import apiClient from './apiClient';
import type {
  AuthorizationResponse,
  SecurityScanDetails,
  SecurityScanHistoryItem,
  ScanStatusResponse,
} from '@/types';

/**
 * Validate target and get authorization info.
 */
export async function authorizeTarget(target: string): Promise<AuthorizationResponse> {
  const { data } = await apiClient.post('/security-audit/authorize', { target });
  return data.data;
}

/**
 * Start a new authorized security scan.
 */
export async function startSecurityScan(
  target: string,
  authorizationConfirmed: boolean
): Promise<{ scanId: string }> {
  const { data } = await apiClient.post('/security-audit/start', {
    target,
    authorizationConfirmed,
  });
  return data.data;
}

/**
 * Get current scan status (for polling).
 */
export async function getScanStatus(scanId: string): Promise<ScanStatusResponse> {
  const { data } = await apiClient.get(`/security-audit/status/${scanId}`);
  return data.data;
}

/**
 * Get full scan details including findings.
 */
export async function getScanDetails(scanId: string): Promise<SecurityScanDetails> {
  const { data } = await apiClient.get(`/security-audit/${scanId}`);
  return data.data;
}

/**
 * Get user's scan history.
 */
export async function getScanHistory(limit = 20): Promise<SecurityScanHistoryItem[]> {
  const { data } = await apiClient.get(`/security-audit/history?limit=${limit}`);
  return data.data.scans;
}

/**
 * Get scan report content (Markdown).
 */
export async function getScanReport(scanId: string): Promise<string> {
  const { data } = await apiClient.get(`/security-audit/report/${scanId}`);
  return data.data.content;
}

/**
 * Delete a scan from history.
 */
export async function deleteScan(scanId: string): Promise<void> {
  await apiClient.delete(`/security-audit/${scanId}`);
}
