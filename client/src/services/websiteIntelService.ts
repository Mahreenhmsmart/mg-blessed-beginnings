import apiClient from './apiClient';

// ─── Types ────────────────────────────────────────────────────────────────

export interface AuditRequest {
  url: string;
  targetCountry: string;
  targetLanguage: string;
  businessType: string;
  primaryKeyword?: string;
  competitorUrls?: string[];
}

export interface ScoreCategory {
  name: string;
  score: number;
  maxScore: number;
  status: 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical';
  issues: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface Finding {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  category: string;
  url: string;
  problem: string;
  evidence: string;
  impact: string;
  solution: string;
  priority: number;
  fixCode?: string;
}

export interface InternalLink {
  sourcePage: string;
  targetPage: string;
  anchorText: string;
  isBroken: boolean;
}

export interface InternalLinkMap {
  pages: Array<{
    url: string;
    incomingLinks: number;
    outgoingLinks: number;
    isOrphan: boolean;
  }>;
  links: InternalLink[];
  recommendations: Array<{
    sourcePage: string;
    targetPage: string;
    suggestedAnchor: string;
    reason: string;
  }>;
}

export interface SchemaItem {
  type: string;
  status: 'Valid' | 'Invalid' | 'Missing' | 'Opportunity';
  details: string;
  fixCode?: string;
}

export interface CompetitorData {
  url: string;
  siteStructure: {
    pageCount: number;
    categories: string[];
  };
  titlePatterns: string[];
  headings: string[];
  contentTopics: string[];
  schemaTypes: string[];
  internalLinkCount: number;
  services: string[];
  scores: {
    seo: number;
    performance: number;
    content: number;
  };
}

export interface CompetitorGapAnalysis {
  you: {
    url: string;
    strengths: string[];
    weaknesses: string[];
  };
  competitors: CompetitorData[];
  gaps: {
    whereCompetitorsStronger: string[];
    whereYouAreStronger: string[];
    opportunitiesMissing: string[];
  };
}

export interface KeywordData {
  keyword: string;
  searchVolume: number | null;
  intent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational' | 'Local';
  difficulty: number;
  currentPosition: number | null;
  opportunity: number;
  recommendedPage: string;
  isAISuggestion: boolean;
}

export interface BacklinkData {
  totalBacklinks: number | null;
  referringDomains: number | null;
  newBacklinks: number | null;
  lostBacklinks: number | null;
  followCount: number | null;
  nofollowCount: number | null;
  topReferringDomains: Array<{ domain: string; count: number }>;
  anchorTexts: Array<{ text: string; count: number }>;
  competitorGaps: Array<{ competitor: string; domains: string[] }>;
  providerConnected: boolean;
}

export interface SecurityCheck {
  https: { status: 'pass' | 'fail'; details: string };
  securityHeaders: {
    hsts: { present: boolean; value?: string };
    csp: { present: boolean; value?: string };
    xFrameOptions: { present: boolean; value?: string };
    xContentTypeOptions: { present: boolean; value?: string };
    referrerPolicy: { present: boolean; value?: string };
  };
  cookieFlags: { secure: boolean; httpOnly: boolean; sameSite: boolean };
  tlsInfo: { version: string; cipherSuite: string; validUntil: string };
  mixedContent: { found: boolean; urls: string[] };
  exposedConfig: { found: boolean; files: string[] };
}

export interface PerformanceMetrics {
  lcp: { value: number | null; status: 'good' | 'needs-improvement' | 'poor' | 'unavailable' };
  inp: { value: number | null; status: 'good' | 'needs-improvement' | 'poor' | 'unavailable' };
  cls: { value: number | null; status: 'good' | 'needs-improvement' | 'poor' | 'unavailable' };
  pageSize: { total: number; js: number; css: number; images: number };
  compression: { gzip: boolean; brotli: boolean };
  caching: { enabled: boolean; maxAge: number };
  renderBlocking: { scripts: string[]; stylesheets: string[] };
}

export interface MobileAudit {
  responsive: { pass: boolean; breakpoints: string[] };
  viewport: { configured: boolean; content: string };
  touchTargets: { adequate: boolean; issues: string[] };
  horizontalOverflow: { found: boolean; elements: string[] };
  fontSize: { readable: boolean; issues: string[] };
  mobileUsability: { score: number; issues: string[] };
}

export interface AEOAnalysis {
  clearAnswers: { found: boolean; count: number; examples: string[] };
  questionHeadings: { found: boolean; count: number; examples: string[] };
  entityInfo: { organization: boolean; person: boolean; location: boolean };
  authorInfo: { present: boolean; details: string };
  trustSignals: { reviews: boolean; certifications: boolean; privacy: boolean; terms: boolean };
  faqOpportunities: Array<{ question: string; page: string }>;
  topicalCoverage: { covered: string[]; missing: string[] };
  score: number;
}

export interface AuditResult {
  auditId: string;
  website: string;
  auditDate: string;
  overallHealth: number;
  scores: {
    seo: ScoreCategory;
    technical: ScoreCategory;
    performance: ScoreCategory;
    content: ScoreCategory;
    aeo: ScoreCategory;
    security: ScoreCategory;
    mobile: ScoreCategory;
    schema: ScoreCategory;
    internalLinks: ScoreCategory;
  };
  findings: Finding[];
  internalLinkMap: InternalLinkMap;
  schemaItems: SchemaItem[];
  keywords: KeywordData[];
  competitorAnalysis: CompetitorGapAnalysis | null;
  backlinks: BacklinkData;
  securityCheck: SecurityCheck;
  performanceMetrics: PerformanceMetrics;
  mobileAudit: MobileAudit;
  aeoAnalysis: AEOAnalysis;
  recommendations: Array<{
    rank: number;
    title: string;
    impact: string;
    effort: string;
    priority: string;
  }>;
}

export interface AuditHistoryItem {
  auditId: string;
  website: string;
  date: string;
  overallScore: number;
  criticalIssues: number;
  highIssues: number;
  status: 'completed' | 'failed';
}

export interface AuditComparison {
  before: {
    auditId: string;
    date: string;
    scores: Record<string, number>;
    criticalCount: number;
    highCount: number;
  };
  after: {
    auditId: string;
    date: string;
    scores: Record<string, number>;
    criticalCount: number;
    highCount: number;
  };
  changes: {
    scoreChanges: Record<string, { before: number; after: number; delta: number }>;
    newIssues: Finding[];
    resolvedIssues: Finding[];
    remainingIssues: Finding[];
  };
}

// ─── API Functions ────────────────────────────────────────────────────────

/**
 * Start a new website audit
 */
export async function startWebsiteAudit(params: AuditRequest): Promise<{ auditId: string }> {
  const { data: res } = await apiClient.post('/website-intelligence/audit', params);
  return res.data;
}

/**
 * Get audit status (for polling during scan)
 */
export async function getAuditStatus(auditId: string): Promise<{ 
  status: 'queued' | 'scanning' | 'complete' | 'error'; 
  progress: number; 
  message: string;
}> {
  const { data: res } = await apiClient.get(`/website-intelligence/audit/${auditId}/status`);
  return res.data;
}

/**
 * Get complete audit result
 */
export async function getAuditResult(auditId: string): Promise<AuditResult> {
  const { data: res } = await apiClient.get(`/website-intelligence/audit/${auditId}`);
  return res.data;
}

/**
 * Get audit history for a website
 */
export async function getAuditHistory(url: string): Promise<AuditHistoryItem[]> {
  const { data: res } = await apiClient.get('/website-intelligence/history', { params: { url } });
  return res.data;
}

/**
 * Compare two audits
 */
export async function compareAudits(beforeId: string, afterId: string): Promise<AuditComparison> {
  const { data: res } = await apiClient.get('/website-intelligence/compare', { 
    params: { before: beforeId, after: afterId } 
  });
  return res.data;
}

/**
 * Delete an audit from history
 */
export async function deleteAudit(auditId: string): Promise<void> {
  await apiClient.delete(`/website-intelligence/audit/${auditId}`);
}

/**
 * Generate fix code for a finding
 */
export async function generateFix(auditId: string, findingId: string): Promise<{ fixCode: string }> {
  const { data: res } = await apiClient.post(`/website-intelligence/audit/${auditId}/findings/${findingId}/fix`);
  return res.data;
}

/**
 * Mark finding as resolved
 */
export async function markFindingResolved(auditId: string, findingId: string): Promise<void> {
  await apiClient.post(`/website-intelligence/audit/${auditId}/findings/${findingId}/resolve`);
}

/**
 * Export audit report in specified format
 */
export async function exportReport(
  auditId: string, 
  format: 'pdf' | 'markdown' | 'csv'
): Promise<Blob> {
  const { data } = await apiClient.get(`/website-intelligence/audit/${auditId}/export`, {
    params: { format },
    responseType: 'blob',
  });
  return data;
}

/**
 * Get AI-generated keyword suggestions based on site content
 */
export async function getKeywordSuggestions(auditId: string): Promise<KeywordData[]> {
  const { data: res } = await apiClient.get(`/website-intelligence/audit/${auditId}/keyword-suggestions`);
  return res.data;
}

/**
 * Trigger competitor analysis
 */
export async function analyzeCompetitors(
  auditId: string, 
  competitorUrls: string[]
): Promise<CompetitorGapAnalysis> {
  const { data: res } = await apiClient.post(`/website-intelligence/audit/${auditId}/competitors`, { 
    competitors: competitorUrls 
  });
  return res.data;
}

/**
 * Check if data providers are connected
 */
export async function checkDataProvider(): Promise<{
  keywordProvider: boolean;
  backlinkProvider: boolean;
  searchConsole: boolean;
  performanceApi: boolean;
}> {
  const { data: res } = await apiClient.get('/website-intelligence/providers');
  return res.data;
}
