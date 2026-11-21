// Standard response envelope returned by the Express backend.
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface BlogPost {
  _id?: string;
  id?: string | number;
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  category?: string;
  tags?: string[];
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
  status?: 'draft' | 'published';
  createdAt?: string;
}

export interface Service {
  _id: string;
  title: string;
  slug: string;
  description: string;
  features: string[];
  price: string;
  duration: string;
  icon: string;
  order: number;
}

export interface Consultation {
  _id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  createdAt?: string;
}

export interface ConsultationFormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'sent' | 'failed';
  createdAt: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface AITool {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  features: string[];
  toolUrl: string;
  isFree: boolean;
  status?: 'live' | 'beta' | 'demo' | 'coming_soon';
  image?: string;
}

// ─── MG Visibility Intelligence Types ─────────────────────────────────────

export interface Project {
  _id: string;
  url: string;
  name: string;
  userId: string;
  competitors: string[];
  createdAt: string;
  updatedAt: string;
  latestAudit?: Audit | null;
}

export interface AuditScores {
  seo: number;
  aeo: number;
  geo: number;
  aio: number;
  sxo: number;
  cq: number;
  schema?: number;
  performance?: number;
  mobile?: number;
  localSeo?: number;
  security?: number;
  accessibility?: number;
  social?: number;
}

export interface CheckResult {
  id: string;
  name: string;
  status: 'pass' | 'warn' | 'fail';
  points: number;
  maxPoints: number;
  details: string;
}

export interface LayerResults {
  checks: CheckResult[];
  score: number;
  maxScore: number;
}

export interface AuditResults {
  seo?: LayerResults;
  aeo?: LayerResults;
  geo?: LayerResults;
  aio?: LayerResults;
  sxo?: LayerResults;
  cq?: LayerResults;
  schema?: LayerResults;
  performance?: LayerResults;
  mobile?: LayerResults;
  localSeo?: LayerResults;
  security?: LayerResults;
  accessibility?: LayerResults;
  social?: LayerResults;
}

export interface Recommendation {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  effort: 'quick' | 'moderate' | 'extensive';
  layer: 'seo' | 'aeo' | 'geo' | 'aio' | 'sxo' | 'cq' | 'schema' | 'performance' | 'mobile' | 'localSeo' | 'security' | 'accessibility' | 'social';
  suggestedText?: string;
  currentPage?: string;
}

export interface Audit {
  _id: string;
  projectId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  scores: AuditScores;
  results: AuditResults;
  recommendations: Recommendation[];
  startedAt: string | null;
  completedAt: string | null;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KeywordGap {
  _id: string;
  projectId: string;
  keyword: string;
  searchVolume: number | null;
  category: 'primary' | 'secondary' | 'long-tail' | 'question' | 'commercial' | 'informational' | 'local';
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  difficulty: number;
  opportunity: number;
  recommendedPage: string | null;
  competitors: Array<{ url: string; position: number | null }>;
  yourPosition: number | null;
  createdAt: string;
}

export interface BacklinkOpportunity {
  _id: string;
  projectId: string;
  sourceUrl: string;
  targetUrl: string;
  type: 'competitor-referral' | 'broken-link' | 'unlinked-mention' | 'guest-post';
  status: 'discovered' | 'contacted' | 'acquired';
  domainAuthority: number | null;
  anchorText: string | null;
  relAttribute: 'follow' | 'nofollow' | 'ugc' | 'sponsored';
  isBroken: boolean;
  spamSignal: boolean;
  referringDomain: string;
  createdAt: string;
}

export interface ContentPlan {
  topic: string;
  searchIntent: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  suggestedTitle: string;
  outline: string[];
  internalLinks: string[];
  cta: string;
}

export interface ContentGap {
  _id: string;
  projectId: string;
  topic: string;
  questions: string[];
  competitorUrls: string[];
  priority: 'high' | 'medium' | 'low';
  searchIntent: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  suggestedTitle: string;
  contentPlan: ContentPlan | null;
  createdAt: string;
}

export interface CompetitorComparison {
  url: string;
  scores: AuditScores | null;
}

export interface CompetitorIntelData {
  title: string | null;
  h1: string | null;
  wordCount: number;
  keywordCount: number;
  internalLinks: number;
  externalLinks: number;
  schemaMarkup: boolean;
  https: boolean;
  securityHeadersCount: number;
  contentTopics: string[];
}

export interface CompetitorIntelligence {
  mainSite: CompetitorIntelData;
  competitors: Array<CompetitorIntelData & { url: string }>;
  gaps: Array<{ competitor: string; gap: string; severity: 'critical' | 'warning' | 'info' }>;
}

export interface AISummaryResult {
  summaryEn: string;
  summaryUr: string;
  actionPlanNarrative: string;
}

export interface ActionPlans {
  sevenDay: Recommendation[];
  thirtyDay: Recommendation[];
  ninetyDay: Recommendation[];
}

// ─── Auth Types ──────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'manager' | 'viewer' | 'user';

export interface User {
  id?: string;
  name?: string;
  email: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ─── AI Visibility Types ──────────────────────────────────────────────────────

export interface AIVisibilityRecord {
  _id: string;
  projectId: string;
  platform: 'ChatGPT' | 'Perplexity' | 'Gemini' | 'Google-SGE';
  brandMentioned: boolean;
  mentionContext: string;
  confidence: number;
  checkedAt: string;
  createdAt: string;
}

// ─── GSC Types ────────────────────────────────────────────────────────────────

export interface GSCDailyData {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCSummary {
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgPosition: number;
}

export interface GSCData {
  configured: boolean;
  message?: string;
  period?: { startDate: string; endDate: string };
  summary?: GSCSummary;
  dailyData?: GSCDailyData[];
}

export interface GSCProperty {
  siteUrl: string;
  permissionLevel: string;
}

export interface GSCAnalyticsRow {
  keys: Record<string, string>;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCAnalyticsResult {
  rows: GSCAnalyticsRow[];
  totalRows: number;
}

export interface GSCInspectionResult {
  indexStatusResult: any | null;
  mobileUsabilityResult: any | null;
  richResultsResult: any | null;
  ampResult: any | null;
}

export interface GSCSitemap {
  path: string;
  lastSubmitted: string | null;
  isPending: boolean;
  warnings: string;
  errors: string;
  contents: any[];
}

// ─── Schedule Types ───────────────────────────────────────────────────────────

export interface AuditSchedule {
  _id: string;
  projectId: string;
  frequency: 'weekly' | 'monthly';
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  isActive: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
}

// ─── Issue Center Types ─────────────────────────────────────────────────────

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low' | 'passed';
export type IssueStatus = 'open' | 'inProgress' | 'resolved' | 'ignored';

export interface Issue {
  id: string;
  checkId: string;
  severity: IssueSeverity;
  title: string;
  description: string;
  url: string;
  evidence: string;
  whyItMatters: string;
  recommendedSolution: string;
  implementationGuidance: string;
  priorityScore: number;
  status: IssueStatus;
  fixCode: string | null;
  category: string;
  layer: string;
  source: 'crawler' | 'ai' | 'estimated' | 'unavailable';
  confidence: 'high' | 'medium' | 'low';
  timestamp: string;
}

export interface ActionItem {
  rank: number;
  issueId: string;
  title: string;
  impact: number;
  urgency: number;
  difficulty: number;
  priorityScore: number;
  category: string;
}

// ─── Security Audit Types ──────────────────────────────────────────────────────

export type SecurityScanStatus =
  | 'pending'
  | 'planning'
  | 'reconnaissance'
  | 'port_analysis'
  | 'web_security_audit'
  | 'generating_report'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type FindingSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export interface SecurityFinding {
  id: string;
  title: string;
  severity: FindingSeverity;
  target: string;
  evidence: string;
  impact: string;
  remediation: string;
  status: 'open' | 'resolved' | 'accepted' | 'ignored';
}

export interface SecurityFindingsCount {
  critical: number;
  high: number;
  medium: number;
  low: number;
  informational: number;
}

export interface SecurityScan {
  scanId: string;
  target: string;
  status: SecurityScanStatus;
  progress: number;
  statusMessage: string;
  score: number | null;
  findingsCount: SecurityFindingsCount;
  startTime: string | null;
  completionTime: string | null;
  createdAt: string;
}

export interface SecurityScanDetails extends SecurityScan {
  findings: SecurityFinding[];
}

export interface SecurityScanHistoryItem {
  scanId: string;
  target: string;
  status: SecurityScanStatus;
  score: number | null;
  findingsCount: SecurityFindingsCount;
  createdAt: string;
  completionTime: string | null;
}

export interface AuthorizationResponse {
  target: string;
  normalizedTarget: string;
  message: string;
  authorizationNotice: string;
}

export interface ScanStatusResponse {
  scanId: string;
  status: SecurityScanStatus;
  progress: number;
  statusMessage: string;
  startTime: string | null;
  completionTime: string | null;
}

// ─── Admin Console Types ──────────────────────────────────────────────────────

export interface SecurityFindingsBreakdown {
  critical: number;
  high: number;
  medium: number;
  low: number;
  informational: number;
}

export interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalAudits: number;
  totalServices: number;
  totalBlogPosts: number;
  totalConsultations: number;
  totalContacts: number;
  totalGSCConnections: number;
  totalSecurityScans: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalReferrals: number;
  totalCourses: number;
  totalResources: number;
  totalNewsletterSubscribers: number;
  totalAIVisibilityRecords: number;
  totalCompetitorAudits: number;
  totalBacklinkOpportunities: number;
  totalContentGaps: number;
  totalKeywordGaps: number;
  securityFindings: SecurityFindingsBreakdown;
}

export interface ApiLogStats {
  requestCount: number;
  errorCount: number;
  warningCount: number;
  errorRate: number;
  avgResponseTime: number;
  slowestEndpoints: { path: string; avgMs: number; count: number }[];
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subscriptionStatus?: string;
  credits?: number;
  totalReferrals?: number;
}

// ─── Pagination Types ──────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ─── GSC Connection Types ──────────────────────────────────────────────────────

export interface GSCConnectionAdmin {
  _id: string;
  projectId: string | { _id: string; name: string; url: string; userId: string };
  siteUrl: string;
  connectedAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Security Scan Admin Types ─────────────────────────────────────────────────

export interface SecurityScanAdmin {
  _id: string;
  userId: string | { _id: string; name: string; email: string };
  scanId: string;
  target: string;
  normalizedTarget: string;
  status: SecurityScanStatus;
  progress: number;
  score: number | null;
  findingsCount: SecurityFindingsCount;
  startTime: string | null;
  completionTime: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityFindingsSummary {
  totalScans: number;
  avgScore: number;
  criticalTotal: number;
  highTotal: number;
  mediumTotal: number;
  lowTotal: number;
  infoTotal: number;
}

// ─── Subscription Admin Types ──────────────────────────────────────────────────

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'paused';

export interface SubscriptionAdmin {
  _id: string;
  userId: string | { _id: string; name: string; email: string };
  customerId: string;
  subscriptionId: string;
  status: SubscriptionStatus;
  planId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStatsByStatus {
  byStatus: Record<string, number>;
  total: number;
}

// ─── Referral Admin Types ──────────────────────────────────────────────────────

export interface ReferralAdmin {
  _id: string;
  referrer: string | { _id: string; name: string; email: string };
  referred: string | { _id: string; name: string; email: string };
  status: 'pending' | 'completed';
  creditsAwarded: number;
  createdAt: string;
}

export interface ReferralStats {
  totalReferrals: number;
  totalCreditsAwarded: number;
  pendingCount: number;
  completedCount: number;
}

// ─── Course Admin Types ────────────────────────────────────────────────────────

export interface Lesson {
  title: string;
  content: string;
  videoUrl?: string;
  duration?: number;
}

export interface Module {
  title: string;
  lessons: Lesson[];
}

export interface CourseAdmin {
  _id: string;
  title: string;
  slug: string;
  description: string;
  instructor: string;
  modules: Module[];
  price: number;
  status: 'draft' | 'published';
  thumbnail: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  enrolledCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseInput {
  title: string;
  slug: string;
  description: string;
  instructor: string;
  modules?: Module[];
  price?: number;
  status?: 'draft' | 'published';
  thumbnail?: string;
  category: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

// ─── Resource Admin Types ──────────────────────────────────────────────────────

export type ResourceType = 'guide' | 'template' | 'checklist' | 'ebook' | 'worksheet';

export interface ResourceAdmin {
  _id: string;
  title: string;
  slug: string;
  description: string;
  type: ResourceType;
  downloadUrl: string;
  category: string;
  thumbnail: string;
  fileSize?: string;
  format?: string;
  downloadCount: number;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceInput {
  title: string;
  slug: string;
  description: string;
  type: ResourceType;
  downloadUrl: string;
  category: string;
  thumbnail?: string;
  fileSize?: string;
  format?: string;
  status?: 'draft' | 'published';
}

// ─── AI Visibility Admin Types ─────────────────────────────────────────────────

export interface AIVisibilityRecordAdmin {
  _id: string;
  projectId: string | { _id: string; name: string; url: string };
  platform: 'ChatGPT' | 'Perplexity' | 'Gemini' | 'Google-SGE';
  brandMentioned: boolean;
  mentionContext: string;
  confidence: number;
  checkedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Competitor Audit Admin Types ──────────────────────────────────────────────

export interface CompetitorScores {
  seo: number;
  aeo: number;
  geo: number;
  aio: number;
  sxo: number;
  cq: number;
}

export interface CompetitorAuditAdmin {
  _id: string;
  projectId: string | { _id: string; name: string; url: string };
  competitorUrl: string;
  scores: CompetitorScores;
  status: 'queued' | 'running' | 'completed' | 'failed';
  errorMessage?: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Backlink Opportunity Admin Types ──────────────────────────────────────────

export type BacklinkType = 'competitor-referral' | 'broken-link' | 'unlinked-mention' | 'guest-post';
export type BacklinkStatus = 'discovered' | 'contacted' | 'acquired';
export type RelAttribute = 'follow' | 'nofollow' | 'ugc' | 'sponsored';

export interface BacklinkOpportunityAdmin {
  _id: string;
  projectId: string | { _id: string; name: string; url: string };
  sourceUrl: string;
  targetUrl: string;
  type: BacklinkType;
  status: BacklinkStatus;
  domainAuthority: number | null;
  anchorText: string | null;
  relAttribute: RelAttribute;
  isBroken: boolean;
  spamSignal: boolean;
  referringDomain: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Content Gap Admin Types ───────────────────────────────────────────────────

export interface ContentGapAdmin {
  _id: string;
  projectId: string | { _id: string; name: string; url: string };
  topic: string;
  questions: string[];
  competitorUrls: string[];
  priority: 'high' | 'medium' | 'low';
  searchIntent: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  suggestedTitle: string;
  contentPlan: ContentPlan | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Keyword Gap Admin Types ───────────────────────────────────────────────────

export type KeywordCategory = 'primary' | 'secondary' | 'long-tail' | 'question' | 'commercial' | 'informational' | 'local';
export type KeywordIntent = 'informational' | 'commercial' | 'transactional' | 'navigational';

export interface KeywordGapAdmin {
  _id: string;
  projectId: string | { _id: string; name: string; url: string };
  keyword: string;
  searchVolume: number | null;
  category: KeywordCategory;
  intent: KeywordIntent;
  difficulty: number;
  opportunity: number;
  recommendedPage: string | null;
  competitors: Array<{ url: string; position: number | null }>;
  yourPosition: number | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Newsletter Subscriber Admin Types ─────────────────────────────────────────

export interface NewsletterSubscriberAdmin {
  _id: string;
  email: string;
  source?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Service Admin Types (Pricing Tab) ──────────────────────────────────────────

export interface ServiceAdmin {
  _id: string;
  title: string;
  slug: string;
  price: string;
  order: number;
}

// ─── Portfolio Admin Types ──────────────────────────────────────────────────────

export interface PortfolioAdmin {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  projectUrl: string;
  category: string;
  metrics: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePortfolioInput {
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  category: string;
  metrics?: string[];
}

// ─── Founder Admin Types ────────────────────────────────────────────────────────

export interface SocialLink {
  platform: string;
  url: string;
}

export interface FounderAdmin {
  _id: string;
  name: string;
  photo: string;
  bio: string;
  title: string;
  socialLinks: SocialLink[];
  createdAt: string;
  updatedAt: string;
}

export interface UpsertFounderInput {
  name: string;
  photo?: string;
  bio: string;
  title: string;
  socialLinks?: SocialLink[];
}

// ─── Clone Admin Types ──────────────────────────────────────────────────────────

export interface CloneAdmin {
  _id: string;
  id: string;
  source: string;
  bytes: number;
  filePath: string;
  status?: 'SAVED' | 'FILE_MISSING';
  createdAt: string;
}

// ─── 30-Day Plan Admin Types ────────────────────────────────────────────────────

export interface ThirtyDayPlanAdmin {
  _id: string;
  dayNumber: number;
  title: string;
  description: string;
  tasks: string[];
  resources: string[];
  phase: string;
  icon: string;
  tip: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateThirtyDayPlanInput {
  dayNumber: number;
  title: string;
  description: string;
  tasks?: string[];
  resources?: string[];
  phase?: string;
  icon?: string;
  tip?: string;
  category?: string;
}

// ─── Contact Message Admin Types ────────────────────────────────────────────────

export interface ContactMessageAdmin {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Product Admin Types ────────────────────────────────────────────────────────

export interface ProductAdmin {
  _id: string;
  title: string;
  price: string;
  description: string;
  image: string;
  category: string;
  purchaseLink: string;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  title: string;
  price: string;
  description?: string;
  image?: string;
  category?: string;
  purchaseLink?: string;
}
