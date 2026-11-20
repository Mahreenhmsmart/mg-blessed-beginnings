import apiClient from './apiClient';
import type { Audit, KeywordGap, BacklinkOpportunity, ContentGap, CompetitorComparison, CompetitorIntelligence, ContentPlan, AISummaryResult, AIVisibilityRecord, GSCData, AuditSchedule, Issue, GSCProperty, GSCAnalyticsResult, GSCInspectionResult, GSCSitemap } from '@/types';

export async function triggerAudit(projectId: string): Promise<{ auditId: string; status: string }> {
  const { data: res } = await apiClient.post(`/projects/${projectId}/audit`);
  return res.data;
}

export async function getAuditsByProject(projectId: string): Promise<Audit[]> {
  const { data: res } = await apiClient.get(`/projects/${projectId}/audits`);
  return res.data;
}

export async function getAuditById(auditId: string): Promise<Audit> {
  const { data: res } = await apiClient.get(`/audits/${auditId}`);
  return res.data;
}

export async function getAuditInsights(auditId: string): Promise<AISummaryResult> {
  const { data: res } = await apiClient.get(`/audits/${auditId}/insights`);
  return res.data;
}

export async function getKeywordGaps(projectId: string): Promise<KeywordGap[]> {
  const { data: res } = await apiClient.get(`/projects/${projectId}/keyword-gaps`);
  return res.data;
}

export async function reanalyzeKeywordGaps(projectId: string): Promise<void> {
  await apiClient.post(`/projects/${projectId}/keyword-gaps/reanalyze`);
}

export async function getBacklinks(projectId: string): Promise<BacklinkOpportunity[]> {
  const { data: res } = await apiClient.get(`/projects/${projectId}/backlinks`);
  return res.data;
}

export async function reanalyzeBacklinks(projectId: string): Promise<void> {
  await apiClient.post(`/projects/${projectId}/backlinks/reanalyze`);
}

export async function getContentGaps(projectId: string): Promise<ContentGap[]> {
  const { data: res } = await apiClient.get(`/projects/${projectId}/content-gaps`);
  return res.data;
}

export async function reanalyzeContentGaps(projectId: string): Promise<void> {
  await apiClient.post(`/projects/${projectId}/content-gaps/reanalyze`);
}

export async function getCompetitorComparison(projectId: string): Promise<CompetitorComparison[]> {
  const { data: res } = await apiClient.get(`/projects/${projectId}/competitors`);
  return res.data;
}

export async function addCompetitor(projectId: string, url: string): Promise<void> {
  await apiClient.post(`/projects/${projectId}/competitors`, { url });
}

export async function removeCompetitor(projectId: string, url: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/competitors`, { data: { url } });
}

export async function triggerCompetitorAudit(projectId: string): Promise<void> {
  await apiClient.post(`/projects/${projectId}/competitors/audit`);
}

// ─── AI Visibility ────────────────────────────────────────────────────────

export async function triggerVisibilityCheck(projectId: string): Promise<void> {
  await apiClient.post(`/projects/${projectId}/ai-visibility/check`);
}

export async function getVisibilityHistory(projectId: string): Promise<AIVisibilityRecord[]> {
  const { data: res } = await apiClient.get(`/projects/${projectId}/ai-visibility/history`);
  return res.data;
}

export async function getVisibilitySummary(projectId: string): Promise<AIVisibilityRecord[]> {
  const { data: res } = await apiClient.get(`/projects/${projectId}/ai-visibility/summary`);
  return res.data;
}

// ─── Google Search Console ────────────────────────────────────────────────

export async function checkGSCConfig(): Promise<{ configured: boolean; message: string }> {
  const { data: res } = await apiClient.get('/gsc/config');
  return res.data;
}

export async function getGSCAuthUrl(projectId: string): Promise<{ authUrl?: string; configured: boolean; message?: string }> {
  const { data: res } = await apiClient.get(`/projects/${projectId}/gsc/auth-url`);
  return res.data;
}

export async function getGSCData(projectId: string): Promise<GSCData> {
  const { data: res } = await apiClient.get(`/projects/${projectId}/gsc/data`);
  return res.data;
}

// ─── Extended GSC Endpoints ──────────────────────────────────────────────

export async function listGSCProperties(projectId: string): Promise<GSCProperty[]> {
  const { data: res } = await apiClient.get(`/seo/gsc/properties/${projectId}`);
  return res.data;
}

export async function getGSCAnalyticsByDimension(
  projectId: string,
  startDate: string,
  endDate: string,
  dimensions: string[],
): Promise<GSCAnalyticsResult> {
  const params = new URLSearchParams({
    startDate,
    endDate,
    dimensions: dimensions.join(','),
  });
  const { data: res } = await apiClient.get(`/seo/gsc/analytics/${projectId}?${params.toString()}`);
  return res.data;
}

export async function getGSCTopQueries(
  projectId: string,
  startDate?: string,
  endDate?: string,
  limit?: number,
): Promise<GSCAnalyticsResult> {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  if (limit) params.set('limit', String(limit));
  const { data: res } = await apiClient.get(`/seo/gsc/top-queries/${projectId}?${params.toString()}`);
  return res.data;
}

export async function getGSCTopPages(
  projectId: string,
  startDate?: string,
  endDate?: string,
  limit?: number,
): Promise<GSCAnalyticsResult> {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  if (limit) params.set('limit', String(limit));
  const { data: res } = await apiClient.get(`/seo/gsc/top-pages/${projectId}?${params.toString()}`);
  return res.data;
}

export async function getGSCCountries(
  projectId: string,
  startDate?: string,
  endDate?: string,
): Promise<GSCAnalyticsResult> {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  const { data: res } = await apiClient.get(`/seo/gsc/countries/${projectId}?${params.toString()}`);
  return res.data;
}

export async function getGSCDevices(
  projectId: string,
  startDate?: string,
  endDate?: string,
): Promise<GSCAnalyticsResult> {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  const { data: res } = await apiClient.get(`/seo/gsc/devices/${projectId}?${params.toString()}`);
  return res.data;
}

export async function inspectGSCUrl(projectId: string, url: string): Promise<GSCInspectionResult> {
  const { data: res } = await apiClient.post(`/seo/gsc/inspect/${projectId}`, { url });
  return res.data;
}

export async function listGSCSitemaps(projectId: string, siteUrl?: string): Promise<GSCSitemap[]> {
  const params = new URLSearchParams();
  if (siteUrl) params.set('siteUrl', siteUrl);
  const { data: res } = await apiClient.get(`/seo/gsc/sitemaps/${projectId}?${params.toString()}`);
  return res.data;
}

export async function submitGSCSitemap(projectId: string, siteUrl: string, feedpath: string): Promise<void> {
  await apiClient.post(`/seo/gsc/sitemaps/${projectId}`, { siteUrl, feedpath });
}

export async function disconnectGSC(projectId: string): Promise<void> {
  await apiClient.delete(`/seo/gsc/disconnect/${projectId}`);
}

// ─── Scheduled Audits ─────────────────────────────────────────────────────

export async function getSchedule(projectId: string): Promise<AuditSchedule | null> {
  const { data: res } = await apiClient.get(`/projects/${projectId}/schedules`);
  return res.data;
}

export async function createSchedule(
  projectId: string,
  frequency: 'weekly' | 'monthly',
  dayOfWeek?: number,
  dayOfMonth?: number,
): Promise<AuditSchedule> {
  const { data: res } = await apiClient.post(`/projects/${projectId}/schedules`, {
    frequency,
    dayOfWeek,
    dayOfMonth,
  });
  return res.data;
}

export async function updateSchedule(
  projectId: string,
  updates: { frequency?: 'weekly' | 'monthly'; dayOfWeek?: number; dayOfMonth?: number; isActive?: boolean },
): Promise<AuditSchedule | { message: string }> {
  const { data: res } = await apiClient.put(`/projects/${projectId}/schedules`, updates);
  return res.data;
}

export async function deleteSchedule(projectId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/schedules`);
}

// ─── Competitor Intelligence ─────────────────────────────────────────────

export async function getCompetitorIntelligence(projectId: string): Promise<CompetitorIntelligence> {
  const { data: res } = await apiClient.get(`/projects/${projectId}/competitor-intelligence`);
  return res.data;
}

// ─── Content Plan Generation ──────────────────────────────────────────────

export async function generateContentPlan(projectId: string, gapId: string): Promise<ContentPlan> {
  const { data: res } = await apiClient.post(`/projects/${projectId}/content-gaps/generate-plan`, { gapId });
  return res.data;
}

// ─── Website Intelligence — Exports & Issues ──────────────────────────────

export async function exportSeoChecklist(auditId: string): Promise<string> {
  const { data } = await apiClient.get(`/audits/${auditId}/export/checklist`, { responseType: 'text' });
  return data;
}

export async function getExecutiveSummary(auditId: string): Promise<{ summary: string }> {
  const { data: res } = await apiClient.get(`/audits/${auditId}/executive-summary`);
  return res.data;
}

export async function generateIssueFix(auditId: string, issueId: string): Promise<{ issueId: string; fixCode: string }> {
  const { data: res } = await apiClient.post(`/audits/${auditId}/issues/${issueId}/fix`);
  return res.data;
}

export async function updateIssueStatus(auditId: string, issueId: string, status: string): Promise<void> {
  await apiClient.post(`/audits/${auditId}/issues/${issueId}/status`, { status });
}

export async function fixAllSafeIssues(auditId: string): Promise<{ issues: Issue[]; fixesGenerated: number }> {
  const { data: res } = await apiClient.post(`/audits/${auditId}/fix-all`);
  return res.data;
}

export function getHealthReportUrl(auditId: string): string {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  return `${baseUrl}/audits/${auditId}/health-report`;
}
