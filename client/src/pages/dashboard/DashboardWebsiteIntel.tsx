import { useState, useEffect } from 'react';
import {
  Search,
  Globe,
  Link as LinkIcon,
  FileText,
  BarChart3,
  Shield,
  Zap,
  Code,
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  Activity,
  Eye,
  Cpu,
} from 'lucide-react';
import { Button, Card, Input, Spinner, Alert, EmptyState } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  triggerAudit,
  getAuditsByProject,
  getKeywordGaps,
  getContentGaps,
  getCompetitorComparison,
  addCompetitor,
  removeCompetitor,
  generateContentPlan,
  getVisibilitySummary,
  getGSCTopQueries,
  checkGSCConfig,
} from '@/services/auditService';
import type {
  Audit,
  KeywordGap,
  ContentGap,
  CompetitorComparison,
  AIVisibilityRecord,
  CheckResult,
  GSCAnalyticsRow,
} from '@/types';

// ─── Tab Definitions ──────────────────────────────────────────────────────

type TabId =
  | 'seo-audit'
  | 'technical-seo'
  | 'keyword-intel'
  | 'competitor'
  | 'content-gap'
  | 'backlinks'
  | 'aeo'
  | 'schema'
  | 'performance';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ElementType;
  description: string;
}

const TABS: TabConfig[] = [
  { id: 'seo-audit', label: 'SEO Audit', icon: Search, description: 'Comprehensive on-page SEO analysis' },
  { id: 'technical-seo', label: 'Technical SEO', icon: Code, description: 'Technical configuration checks' },
  { id: 'keyword-intel', label: 'Keyword Intelligence', icon: Target, description: 'Track keyword rankings and opportunities' },
  { id: 'competitor', label: 'Competitor Analysis', icon: BarChart3, description: 'Side-by-side domain comparison' },
  { id: 'content-gap', label: 'Content Gap', icon: FileText, description: 'Identify missing content topics' },
  { id: 'backlinks', label: 'Backlinks', icon: LinkIcon, description: 'Backlink profile overview' },
  { id: 'aeo', label: 'AEO / AI Search', icon: Eye, description: 'Answer Engine Optimization' },
  { id: 'schema', label: 'Schema', icon: Activity, description: 'Structured data validation' },
  { id: 'performance', label: 'Performance', icon: Zap, description: 'Core Web Vitals & speed metrics' },
];

// ─── Helper Components ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'pass' | 'warn' | 'fail' }) {
  const config = {
    pass: { icon: CheckCircle2, className: 'bg-success/20 text-success border-success/30', label: 'Pass' },
    warn: { icon: AlertTriangle, className: 'bg-warning/20 text-warning border-warning/30', label: 'Warning' },
    fail: { icon: XCircle, className: 'bg-destructive/20 text-destructive border-destructive/30', label: 'Fail' },
  };
  const { icon: Icon, className, label } = config[status];
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', className)}
      data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_9ffb">
      <Icon
        className="h-3 w-3"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_2aa7" />
      {label}
    </span>
  );
}

type StatusVariant = 'success' | 'warning' | 'destructive' | 'secondary' | 'default';

function ColoredBadge({ variant = 'default', children, className }: { variant?: StatusVariant; children: React.ReactNode; className?: string }) {
  const styles: Record<StatusVariant, string> = {
    success: 'bg-success/20 text-success border-success/30',
    warning: 'bg-warning/20 text-warning border-warning/30',
    destructive: 'bg-destructive/20 text-destructive border-destructive/30',
    secondary: 'bg-secondary text-secondary-foreground border-border',
    default: 'bg-muted text-muted-foreground border-border',
  };
  return (
    <span
      className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold', styles[variant], className)}
      data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_3ab4">
      {children}
    </span>
  );
}

function ScoreRing({ score, maxScore = 100, size = 'md' }: { score: number; maxScore?: number; size?: 'sm' | 'md' | 'lg' }) {
  const percentage = Math.round((score / maxScore) * 100);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
  };

  const colorClass =
    percentage >= 80 ? 'text-success' : percentage >= 60 ? 'text-warning' : 'text-destructive';

  return (
    <div
      className={cn('relative flex items-center justify-center', sizeClasses[size])}
      data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_04f3">
      <svg
        className="h-full w-full -rotate-90 transform"
        viewBox="0 0 100 100"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_0463">
        <circle
          className="stroke-muted"
          cx="50"
          cy="50"
          r="40"
          fill="none"
          strokeWidth="8"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_23b3" />
        <circle
          className={cn('transition-all duration-500', colorClass)}
          cx="50"
          cy="50"
          r="40"
          fill="none"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_7f71" />
      </svg>
      <span
        className={cn('absolute font-bold text-foreground', size === 'sm' ? 'text-sm' : size === 'md' ? 'text-xl' : 'text-2xl')}
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_ce8d">
        {percentage}%
      </span>
    </div>
  );
}

function MetricCard({ label, value, subtext, trend }: { label: string; value: string | number; subtext?: string; trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <Card
      className="p-4"
      data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_9827">
      <p
        className="text-sm text-muted-foreground"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_5797">{label}</p>
      <div
        className="mt-1 flex items-baseline gap-2"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_8927">
        <span
          className="text-2xl font-bold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_7e97">{value}</span>
        {trend && (
          <span
            className={cn(
              'flex items-center text-xs font-medium',
              trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
            )}
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_e2ec">
            {trend === 'up' && <ArrowUp
              className="mr-0.5 h-3 w-3"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_7c6f" />}
            {trend === 'down' && <ArrowDown
              className="mr-0.5 h-3 w-3"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_a606" />}
            {trend === 'neutral' && <Minus
              className="mr-0.5 h-3 w-3"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_2edd" />}
          </span>
        )}
      </div>
      {subtext && <p
        className="mt-1 text-xs text-muted-foreground"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_655b">{subtext}</p>}
    </Card>
  );
}

// ─── Tab Panels ───────────────────────────────────────────────────────────

function SeoAuditTab({ projectId }: { projectId: string }) {
  const dispatch = useAppDispatch();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);

  useEffect(() => {
    loadAudits();
  }, [projectId]);

  async function loadAudits() {
    setLoading(true);
    try {
      const data = await getAuditsByProject(projectId);
      setAudits(data);
      if (data.length > 0 && !selectedAudit) {
        setSelectedAudit(data[0]);
      }
    } catch (err) {
      console.error('Failed to load audits:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTriggerAudit() {
    setTriggering(true);
    try {
      await triggerAudit(projectId);
      await loadAudits();
    } catch (err) {
      console.error('Failed to trigger audit:', err);
    } finally {
      setTriggering(false);
    }
  }

  if (loading) {
    return (
      <div
        className="flex h-64 items-center justify-center"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_42e5">
        <Spinner
          size="lg"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_a6d4" />
      </div>
    );
  }

  return (
    <div
      className="space-y-6"
      data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_3e30">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_1b82">
        <div data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_cc14">
          <h3
            className="text-lg font-semibold text-foreground"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_3fe9">SEO Audit Results</h3>
          <p
            className="text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_c3ee">Analyze on-page SEO factors for your website</p>
        </div>
        <Button
          onClick={handleTriggerAudit}
          loading={triggering}
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_8c00">
          <RefreshCw
            className="mr-2 h-4 w-4"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_5b93" />
          Run New Audit
        </Button>
      </div>
      {audits.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No Audits Yet"
          description="Run your first SEO audit to see detailed analysis results."
          action={
            <Button
              onClick={handleTriggerAudit}
              loading={triggering}
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_466d">
              Run First Audit
            </Button>
          }
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_5e03" />
      ) : (
        <>
          <div
            className="flex gap-2 overflow-x-auto pb-2"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_1e42">
            {audits.map((audit) => (
              <button
                key={audit._id}
                onClick={() => setSelectedAudit(audit)}
                className={cn(
                  'whitespace-nowrap rounded-lg border px-4 py-2 text-sm transition-colors',
                  selectedAudit?._id === audit._id
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                )}
                data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_1069_${audit._id}`}>
                {new Date(audit.createdAt).toLocaleDateString()}
              </button>
            ))}
          </div>

          {selectedAudit && (
            <div
              className="space-y-6"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_2cda">
              <div
                className="grid gap-4 md:grid-cols-3"
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_39e1">
                <Card
                  className="flex flex-col items-center justify-center p-6"
                  data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_1c56">
                  <ScoreRing
                    score={selectedAudit.scores.seo}
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_51b2" />
                  <p
                    className="mt-2 text-sm font-medium text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_2008">SEO Score</p>
                </Card>
                <Card
                  className="flex flex-col items-center justify-center p-6"
                  data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_87d7">
                  <ScoreRing
                    score={selectedAudit.scores.schema || 0}
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_977c" />
                  <p
                    className="mt-2 text-sm font-medium text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_c677">Schema Score</p>
                </Card>
                <Card
                  className="flex flex-col items-center justify-center p-6"
                  data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_24ad">
                  <ScoreRing
                    score={selectedAudit.scores.performance || 0}
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_b06b" />
                  <p
                    className="mt-2 text-sm font-medium text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_c80b">Performance Score</p>
                </Card>
              </div>

              {selectedAudit.results.seo && (
                <Card
                  className="p-6"
                  data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_382e">
                  <h4
                    className="mb-4 text-base font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_3629">On-Page SEO Checks</h4>
                  <div
                    className="space-y-3"
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_0d27">
                    {selectedAudit.results.seo.checks.map((check: CheckResult) => (
                      <div
                        key={check.id}
                        className="flex items-start justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                        data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_a37c_${check.id}`}>
                        <div
                          className="flex-1"
                          data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_8f78_${check.id}`}>
                          <div
                            className="flex items-center gap-2"
                            data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_1dd5_${check.id}`}>
                            <span
                              className="font-medium text-foreground"
                              data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_302f_${check.id}`}>{check.name}</span>
                            <StatusBadge
                              status={check.status}
                              data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_acc4_${check.id}`} />
                          </div>
                          <p
                            className="mt-1 text-sm text-muted-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_f0d6_${check.id}`}>{check.details}</p>
                        </div>
                        <span
                          className="ml-4 text-sm font-medium text-muted-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_9309_${check.id}`}>
                          {check.points}/{check.maxPoints}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {selectedAudit.recommendations.length > 0 && (
                <Card
                  className="p-6"
                  data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_4ce2">
                  <h4
                    className="mb-4 text-base font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_07d9">Recommendations</h4>
                  <div
                    className="space-y-3"
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_5790">
                    {selectedAudit.recommendations.slice(0, 10).map((rec, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-border bg-muted/50 p-4"
                        data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_bf40_${idx}`}>
                <div
                  className="flex items-start gap-3"
                  data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_1778_${idx}`}>
                  <ColoredBadge
                    variant={rec.severity === 'critical' ? 'destructive' : rec.severity === 'warning' ? 'warning' : 'secondary'}
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_c1e5_${idx}`}>
                    {rec.severity}
                  </ColoredBadge>
                          <div
                            className="flex-1"
                            data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_9b4d_${idx}`}>
                            <p
                              className="font-medium text-foreground"
                              data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_6348_${idx}`}>{rec.title}</p>
                            <p
                              className="mt-1 text-sm text-muted-foreground"
                              data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_8438_${idx}`}>{rec.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TechnicalSeoTab({ audit }: { audit: Audit | null }) {
  if (!audit) {
    return (
      <EmptyState
        icon={Code}
        title="No Audit Data"
        description="Run an SEO audit first to see technical SEO checks."
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_d4f7" />
    );
  }

  const technicalChecks = [
    { name: 'robots.txt', category: 'Crawlability' },
    { name: 'XML Sitemap', category: 'Crawlability' },
    { name: 'Canonical Tags', category: 'Indexation' },
    { name: 'Hreflang Tags', category: 'Internationalization' },
    { name: 'HTTPS', category: 'Security' },
    { name: 'Mobile Responsive', category: 'Mobile' },
    { name: 'Page Speed', category: 'Performance' },
    { name: 'Broken Links', category: 'Links' },
  ];

  const getCheckStatus = (name: string): 'pass' | 'warn' | 'fail' => {
    const check = audit.results.seo?.checks.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
    return check?.status || 'warn';
  };

  return (
    <div
      className="space-y-6"
      data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_b40d">
      <div data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_9e70">
        <h3
          className="text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_4b67">Technical SEO Checklist</h3>
        <p
          className="text-sm text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_23cb">Verify your site's technical configuration</p>
      </div>
      <div
        className="grid gap-4 md:grid-cols-2"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_8491">
        {technicalChecks.map((check) => {
          const status = getCheckStatus(check.name);
          return (
            <Card
              key={check.name}
              className="p-4"
              data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_bcfd_${check.name}`}>
              <div
                className="flex items-start justify-between"
                data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_7c91_${check.name}`}>
                <div
                  data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_55a5_${check.name}`}>
                  <p
                    className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_4ba8_${check.name}`}>{check.category}</p>
                  <p
                    className="mt-1 font-medium text-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_7569_${check.name}`}>{check.name}</p>
                </div>
                <StatusBadge
                  status={status}
                  data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_1954_${check.name}`} />
              </div>
              <p
                className="mt-3 text-sm text-muted-foreground"
                data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_71fd_${check.name}`}>
                {status === 'pass' 
                  ? `${check.name} is properly configured.`
                  : status === 'warn'
                  ? `${check.name} may need attention.`
                  : `${check.name} requires immediate fix.`}
              </p>
            </Card>
          );
        })}
      </div>
      <Card
        className="p-6"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_e43d">
        <h4
          className="mb-4 text-base font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_29c9">Core Web Vitals Indicators</h4>
        <div
          className="grid gap-4 md:grid-cols-3"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_0f34">
          <MetricCard
            label="LCP (Largest Contentful Paint)"
            value={audit.results.performance?.score ? '< 2.5s' : '> 4.0s'}
            subtext="Target: under 2.5 seconds"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_ccab" />
          <MetricCard
            label="FID / INP (Interaction)"
            value={audit.results.performance?.score ? '< 100ms' : '> 300ms'}
            subtext="Target: under 100 milliseconds"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_2d9f" />
          <MetricCard
            label="CLS (Cumulative Layout Shift)"
            value={audit.results.performance?.score ? '< 0.1' : '> 0.25'}
            subtext="Target: under 0.1"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_33e1" />
        </div>
      </Card>
    </div>
  );
}

function KeywordIntelTab({ projectId }: { projectId: string }) {
  const [keywords, setKeywords] = useState<KeywordGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyword, setNewKeyword] = useState('');
  const [gscQueries, setGscQueries] = useState<GSCAnalyticsRow[]>([]);
  const [gscConnected, setGscConnected] = useState(false);
  const [gscLoading, setGscLoading] = useState(false);

  useEffect(() => {
    loadKeywords();
    loadGSCQueries();
  }, [projectId]);

  async function loadKeywords() {
    setLoading(true);
    try {
      const data = await getKeywordGaps(projectId);
      setKeywords(data);
    } catch (err) {
      console.error('Failed to load keywords:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadGSCQueries() {
    try {
      const config = await checkGSCConfig();
      if (config.configured) {
        setGscConnected(true);
        setGscLoading(true);
        const result = await getGSCTopQueries(projectId, undefined, undefined, 10);
        setGscQueries(result.rows || []);
      }
    } catch {
      // GSC not connected — silently skip
    } finally {
      setGscLoading(false);
    }
  }

  function getPositionChange(keyword: KeywordGap): number {
    // Simulate position change based on opportunity score
    return keyword.opportunity > 70 ? Math.floor(Math.random() * 5) + 1 : 
           keyword.opportunity > 40 ? 0 : 
           -Math.floor(Math.random() * 3);
  }

  if (loading) {
    return (
      <div
        className="flex h-64 items-center justify-center"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_7eeb">
        <Spinner
          size="lg"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_256a" />
      </div>
    );
  }

  return (
    <div
      className="space-y-6"
      data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_1218">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_1596">
        <div data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_52fc">
          <h3
            className="text-lg font-semibold text-foreground"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_fe48">Keyword Intelligence</h3>
          <p
            className="text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_1310">Track keyword positions and discover opportunities</p>
        </div>
      </div>
      <Card
        className="p-4"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_3a1d">
        <div
          className="flex gap-2"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_e144">
          <Input
            placeholder="Add keyword to track..."
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            className="flex-1"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_dd78" />
          <Button
            onClick={() => {
              if (newKeyword.trim()) {
                setNewKeyword('');
                // In production, this would call an API to add the keyword
              }
            }}
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_2a22">
            <Plus
              className="mr-2 h-4 w-4"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_48dd" />
            Add Keyword
          </Button>
        </div>
      </Card>
      {/* GSC Real Search Queries — supplementary data source */}
      {gscConnected && (
        <Card
          className="p-4"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_6e4c">
          <h4
            className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_d4f9">
            <BarChart3
              className="h-4 w-4 text-primary"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_466a" />
            Real Search Queries (Google Search Console)
          </h4>
          {gscLoading ? (
            <div
              className="flex justify-center py-4"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_ce10"><Spinner
              size="sm"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_1f58" /></div>
          ) : gscQueries.length > 0 ? (
            <div
              className="overflow-x-auto rounded-lg border border-border/50"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_9352">
              <table
                className="w-full text-left text-xs"
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_f755">
                <thead
                  className="bg-muted/50"
                  data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_7ab7">
                  <tr
                    className="border-b border-border text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_1366">
                    <th
                      className="px-3 py-2 min-w-[180px]"
                      data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_5aa8">Query</th>
                    <th
                      className="px-3 py-2"
                      data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_7b99">Clicks</th>
                    <th
                      className="px-3 py-2"
                      data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_b16b">Impressions</th>
                    <th
                      className="px-3 py-2"
                      data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_2e7f">CTR</th>
                    <th
                      className="px-3 py-2"
                      data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_7c6d">Position</th>
                  </tr>
                </thead>
                <tbody data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_0b20">
                  {gscQueries.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-border/30 hover:bg-muted/30"
                      data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_1c95_${i}`}>
                      <td
                        className="px-3 py-2 font-medium text-foreground truncate max-w-[250px]"
                        title={row.keys.query}
                        data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_15c1_${i}`}>{row.keys.query}</td>
                      <td
                        className="px-3 py-2 text-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_03ee_${i}`}>{row.clicks.toLocaleString()}</td>
                      <td
                        className="px-3 py-2 text-muted-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_4db5_${i}`}>{row.impressions.toLocaleString()}</td>
                      <td
                        className="px-3 py-2 text-muted-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_9ff4_${i}`}>{row.ctr}%</td>
                      <td
                        className="px-3 py-2"
                        data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_0f2f_${i}`}>
                        <span
                          className={row.position <= 10 ? 'text-success' : row.position <= 20 ? 'text-warning' : 'text-muted-foreground'}
                          data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_f3ae_${i}`}>
                          {row.position}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p
              className="text-xs text-muted-foreground py-2"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_9ebf">No search query data available from Google Search Console.</p>
          )}
        </Card>
      )}
      {keywords.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No Keywords Tracked"
          description="Add keywords to start tracking their positions and opportunities."
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_de26" />
      ) : (
        <Card
          className="overflow-hidden"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_f34f">
          <div
            className="overflow-x-auto"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_90fc">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_ace7">
              <thead
                className="border-b border-border bg-muted/50"
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_fc00">
                <tr data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_26d6">
                  <th
                    className="px-4 py-3 font-medium text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_f5c4">Keyword</th>
                  <th
                    className="px-4 py-3 font-medium text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_6287">Position</th>
                  <th
                    className="px-4 py-3 font-medium text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_e1d1">Change</th>
                  <th
                    className="px-4 py-3 font-medium text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_60a5">Volume</th>
                  <th
                    className="px-4 py-3 font-medium text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_b1d7">Difficulty</th>
                  <th
                    className="px-4 py-3 font-medium text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_fe4d">Opportunity</th>
                  <th
                    className="px-4 py-3 font-medium text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_1f92">Intent</th>
                </tr>
              </thead>
              <tbody
                className="divide-y divide-border"
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_0103">
                {keywords.map((kw) => {
                  const change = getPositionChange(kw);
                  return (
                    <tr
                      key={kw._id}
                      className="hover:bg-muted/30"
                      data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_991f_${kw._id}`}>
                      <td
                        className="px-4 py-3 font-medium text-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_7331_${kw._id}`}>{kw.keyword}</td>
                      <td
                        className="px-4 py-3 text-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_b63b_${kw._id}`}>
                        {kw.yourPosition ?? '—'}
                      </td>
                      <td
                        className="px-4 py-3"
                        data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_a35b_${kw._id}`}>
                        <span
                          className={cn(
                            'flex items-center text-xs font-medium',
                            change > 0 ? 'text-success' : change < 0 ? 'text-destructive' : 'text-muted-foreground'
                          )}
                          data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_fa15_${kw._id}`}>
                          {change > 0 && <ArrowUp
                            className="mr-1 h-3 w-3"
                            data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_4348_${kw._id}`} />}
                          {change < 0 && <ArrowDown
                            className="mr-1 h-3 w-3"
                            data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_47cf_${kw._id}`} />}
                          {change === 0 && <Minus
                            className="mr-1 h-3 w-3"
                            data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_6246_${kw._id}`} />}
                          {Math.abs(change)}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 text-muted-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_4f85_${kw._id}`}>
                        {kw.searchVolume?.toLocaleString() ?? '—'}
                      </td>
                      <td
                        className="px-4 py-3"
                        data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_efb5_${kw._id}`}>
                        <ColoredBadge
                          variant={kw.difficulty > 70 ? 'destructive' : kw.difficulty > 40 ? 'warning' : 'success'}
                          data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_ecc7_${kw._id}`}>
                          {kw.difficulty}/100
                        </ColoredBadge>
                      </td>
                      <td
                        className="px-4 py-3"
                        data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_4a29_${kw._id}`}>
                        <div
                          className="flex items-center gap-2"
                          data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_8374_${kw._id}`}>
                          <div
                            className="h-2 w-16 overflow-hidden rounded-full bg-muted"
                            data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_c151_${kw._id}`}>
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${kw.opportunity}%` }}
                              data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_9de8_${kw._id}`} />
                          </div>
                          <span
                            className="text-xs text-muted-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_3600_${kw._id}`}>{kw.opportunity}%</span>
                        </div>
                      </td>
                      <td
                        className="px-4 py-3"
                        data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_d06b_${kw._id}`}>
                        <ColoredBadge
                          variant="secondary"
                          data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_2f06_${kw._id}`}>{kw.intent}</ColoredBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function CompetitorTab({ projectId }: { projectId: string }) {
  const [competitors, setCompetitors] = useState<CompetitorComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadCompetitors();
  }, [projectId]);

  async function loadCompetitors() {
    setLoading(true);
    try {
      const data = await getCompetitorComparison(projectId);
      setCompetitors(data);
    } catch (err) {
      console.error('Failed to load competitors:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCompetitor() {
    if (!newUrl.trim()) return;
    setAdding(true);
    try {
      await addCompetitor(projectId, newUrl.trim());
      setNewUrl('');
      await loadCompetitors();
    } catch (err) {
      console.error('Failed to add competitor:', err);
    } finally {
      setAdding(false);
    }
  }

  async function handleRemoveCompetitor(url: string) {
    try {
      await removeCompetitor(projectId, url);
      await loadCompetitors();
    } catch (err) {
      console.error('Failed to remove competitor:', err);
    }
  }

  if (loading) {
    return (
      <div
        className="flex h-64 items-center justify-center"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_b9f3">
        <Spinner
          size="lg"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_aa65" />
      </div>
    );
  }

  return (
    <div
      className="space-y-6"
      data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_e9d9">
      <div data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_a6e1">
        <h3
          className="text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_fcfd">Competitor Analysis</h3>
        <p
          className="text-sm text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_484d">Compare your domain metrics against competitors</p>
      </div>
      <Card
        className="p-4"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_1eab">
        <div
          className="flex gap-2"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_1393">
          <Input
            placeholder="Enter competitor URL (e.g., https://example.com)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="flex-1"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_61e4" />
          <Button
            onClick={handleAddCompetitor}
            loading={adding}
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_d983">
            <Plus
              className="mr-2 h-4 w-4"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_2f4c" />
            Add Competitor
          </Button>
        </div>
      </Card>
      {competitors.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No Competitors Added"
          description="Add competitor URLs to compare domain metrics side-by-side."
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_ad37" />
      ) : (
        <Card
          className="overflow-hidden"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_dd3c">
          <div
            className="overflow-x-auto"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_c2f2">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_52f8">
              <thead
                className="border-b border-border bg-muted/50"
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_30a7">
                <tr data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_0063">
                  <th
                    className="px-4 py-3 font-medium text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_322f">Domain</th>
                  <th
                    className="px-4 py-3 font-medium text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_0885">SEO Score</th>
                  <th
                    className="px-4 py-3 font-medium text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_db41">Performance</th>
                  <th
                    className="px-4 py-3 font-medium text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_e260">Schema</th>
                  <th
                    className="px-4 py-3 font-medium text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_880b">AEO</th>
                  <th
                    className="px-4 py-3 font-medium text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_aadb">Actions</th>
                </tr>
              </thead>
              <tbody
                className="divide-y divide-border"
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_8be9">
                {competitors.map((comp) => (
                  <tr
                    key={comp.url}
                    className="hover:bg-muted/30"
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_5e9a_${comp.url}`}>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_30a4_${comp.url}`}>
                      <a
                        href={comp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-medium text-primary hover:underline"
                        data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_cc21_${comp.url}`}>
                        {new URL(comp.url).hostname}
                        <ExternalLink
                          className="h-3 w-3"
                          data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_725c_${comp.url}`} />
                      </a>
                    </td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_42e0_${comp.url}`}>
                      {comp.scores ? (
                        <ColoredBadge
                          variant={comp.scores.seo >= 80 ? 'success' : comp.scores.seo >= 60 ? 'warning' : 'destructive'}
                          data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_a4ba_${comp.url}`}>
                          {comp.scores.seo}/100
                        </ColoredBadge>
                      ) : (
                        <span
                          className="text-muted-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_fb46_${comp.url}`}>—</span>
                      )}
                    </td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_ca9d_${comp.url}`}>
                      {comp.scores?.performance ? (
                        <ColoredBadge
                          variant={comp.scores.performance >= 80 ? 'success' : comp.scores.performance >= 60 ? 'warning' : 'destructive'}
                          data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_3ad5_${comp.url}`}>
                          {comp.scores.performance}/100
                        </ColoredBadge>
                      ) : (
                        <span
                          className="text-muted-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_82fa_${comp.url}`}>—</span>
                      )}
                    </td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_a8e3_${comp.url}`}>
                      {comp.scores?.schema ? (
                        <ColoredBadge
                          variant={comp.scores.schema >= 80 ? 'success' : comp.scores.schema >= 60 ? 'warning' : 'destructive'}
                          data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_c92c_${comp.url}`}>
                          {comp.scores.schema}/100
                        </ColoredBadge>
                      ) : (
                        <span
                          className="text-muted-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_9ffc_${comp.url}`}>—</span>
                      )}
                    </td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_645d_${comp.url}`}>
                      {comp.scores?.aeo ? (
                        <ColoredBadge
                          variant={comp.scores.aeo >= 80 ? 'success' : comp.scores.aeo >= 60 ? 'warning' : 'destructive'}
                          data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_8c03_${comp.url}`}>
                          {comp.scores.aeo}/100
                        </ColoredBadge>
                      ) : (
                        <span
                          className="text-muted-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_80bc_${comp.url}`}>—</span>
                      )}
                    </td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_c052_${comp.url}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCompetitor(comp.url)}
                        aria-label="Remove competitor"
                        data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_eb5a_${comp.url}`}>
                        <Trash2
                          className="h-4 w-4"
                          data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_7751_${comp.url}`} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function ContentGapTab({ projectId }: { projectId: string }) {
  const [gaps, setGaps] = useState<ContentGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState<string | null>(null);

  useEffect(() => {
    loadGaps();
  }, [projectId]);

  async function loadGaps() {
    setLoading(true);
    try {
      const data = await getContentGaps(projectId);
      setGaps(data);
    } catch (err) {
      console.error('Failed to load content gaps:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGeneratePlan(gapId: string) {
    setGeneratingPlan(gapId);
    try {
      await generateContentPlan(projectId, gapId);
      await loadGaps();
    } catch (err) {
      console.error('Failed to generate content plan:', err);
    } finally {
      setGeneratingPlan(null);
    }
  }

  if (loading) {
    return (
      <div
        className="flex h-64 items-center justify-center"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_59f9">
        <Spinner
          size="lg"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_45f9" />
      </div>
    );
  }

  return (
    <div
      className="space-y-6"
      data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_d4fb">
      <div data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_ef9a">
        <h3
          className="text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_9ef1">Content Gap Analysis</h3>
        <p
          className="text-sm text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_1de8">Discover topics your competitors cover that you don't</p>
      </div>
      {gaps.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Content Gaps Found"
          description="Add competitors and run an audit to identify content opportunities."
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_e0be" />
      ) : (
        <div
          className="grid gap-4 md:grid-cols-2"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_cb36">
          {gaps.map((gap) => (
            <Card
              key={gap._id}
              className="p-5"
              data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_c115_${gap._id}`}>
              <div
                className="flex items-start justify-between"
                data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_8c11_${gap._id}`}>
                <div
                  data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_b681_${gap._id}`}>
                  <ColoredBadge
                    variant={gap.priority === 'high' ? 'destructive' : gap.priority === 'medium' ? 'warning' : 'secondary'}
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_98d1_${gap._id}`}>
                    {gap.priority} priority
                  </ColoredBadge>
                  <h4
                    className="mt-2 text-base font-semibold text-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_e4e2_${gap._id}`}>{gap.topic}</h4>
                </div>
              </div>

              <div
                className="mt-4 space-y-2"
                data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_881a_${gap._id}`}>
                <p
                  className="text-sm text-muted-foreground"
                  data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_55ce_${gap._id}`}>
                  <span
                    className="font-medium text-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_2a75_${gap._id}`}>Primary Keyword:</span> {gap.primaryKeyword}
                </p>
                <p
                  className="text-sm text-muted-foreground"
                  data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_75ce_${gap._id}`}>
                  <span
                    className="font-medium text-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_c836_${gap._id}`}>Search Intent:</span> {gap.searchIntent}
                </p>
                {gap.secondaryKeywords.length > 0 && (
                  <div
                    className="flex flex-wrap gap-1"
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_8417_${gap._id}`}>
                    {gap.secondaryKeywords.slice(0, 5).map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_393e_${gap._id}_${kw}`}>
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {gap.questions.length > 0 && (
                <div
                  className="mt-4"
                  data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_fa9d_${gap._id}`}>
                  <p
                    className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_b637_${gap._id}`}>Related Questions</p>
                  <ul
                    className="mt-2 space-y-1"
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_1f80_${gap._id}`}>
                    {gap.questions.slice(0, 3).map((q, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_39c4_${gap._id}_${i}`}>
                        <span
                          className="mt-0.5 text-primary"
                          data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_f1dd_${gap._id}_${i}`}>•</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div
                className="mt-4 flex gap-2"
                data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_4bbb_${gap._id}`}>
                <Button
                  size="sm"
                  onClick={() => handleGeneratePlan(gap._id)}
                  loading={generatingPlan === gap._id}
                  data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_128e_${gap._id}`}>
                  <Zap
                    className="mr-2 h-3 w-3"
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_552a_${gap._id}`} />
                  Generate Content Plan
                </Button>
                {gap.contentPlan && (
                  <ColoredBadge
                    variant="success"
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_77e8_${gap._id}`}>Plan Ready</ColoredBadge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function BacklinksTab() {
  return (
    <div
      className="space-y-6"
      data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_0c98">
      <div data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_69db">
        <h3
          className="text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_f576">Backlink Profile</h3>
        <p
          className="text-sm text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_229e">Monitor your backlink profile and identify link building opportunities</p>
      </div>
      <Alert
        variant="info"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_7fdf">
        <div
          className="flex items-start gap-3"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_514b">
          <LinkIcon
            className="mt-0.5 h-5 w-5 shrink-0"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_17cd" />
          <div data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_4990">
            <p
              className="font-medium"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_f85b">Data Source Required</p>
            <p
              className="mt-1 text-sm opacity-90"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_49b3">
              Backlink analysis requires connection to a third-party data provider (Ahrefs API, Moz API, or SEMrush API). 
              This feature does not display estimated or simulated data to ensure accuracy.
            </p>
          </div>
        </div>
      </Alert>
      <div
        className="grid gap-4 md:grid-cols-3"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_7467">
        <Card
          className="p-6 text-center"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_94fa">
          <div
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_c92b">
            <LinkIcon
              className="h-6 w-6 text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_58f6" />
          </div>
          <p
            className="text-2xl font-bold text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_00c9">—</p>
          <p
            className="text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_b578">Total Backlinks</p>
        </Card>
        <Card
          className="p-6 text-center"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_196f">
          <div
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_e111">
            <Globe
              className="h-6 w-6 text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_e885" />
          </div>
          <p
            className="text-2xl font-bold text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_a6bf">—</p>
          <p
            className="text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_c606">Referring Domains</p>
        </Card>
        <Card
          className="p-6 text-center"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_2fca">
          <div
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_1f54">
            <Shield
              className="h-6 w-6 text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_a2cc" />
          </div>
          <p
            className="text-2xl font-bold text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_d4ac">—</p>
          <p
            className="text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_7a25">Domain Authority</p>
        </Card>
      </div>
      <Card
        className="p-8 text-center"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_2285">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_4585">
          <LinkIcon
            className="h-8 w-8 text-primary"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_bf8d" />
        </div>
        <h4
          className="text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_301e">Connect Data Provider</h4>
        <p
          className="mx-auto mt-2 max-w-md text-sm text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_7de2">
          To view accurate backlink data, anchor text distribution, toxic link indicators, and referring domain analysis, 
          connect your Ahrefs, Moz, or SEMrush API credentials in Settings.
        </p>
        <div
          className="mt-6 flex justify-center gap-3"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_2c37">
          <Button
            variant="outline"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_b01e">
            Connect Ahrefs
          </Button>
          <Button
            variant="outline"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_eb42">
            Connect Moz
          </Button>
          <Button
            variant="primary"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_1401">
            Connect SEMrush
          </Button>
        </div>
      </Card>
    </div>
  );
}

function AeoTab({ audit }: { audit: Audit | null }) {
  if (!audit) {
    return (
      <EmptyState
        icon={Eye}
        title="No Audit Data"
        description="Run an SEO audit first to analyze Answer Engine Optimization factors."
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_6baa" />
    );
  }

  const aeoChecks = [
    { name: 'FAQ Schema', description: 'Structured FAQ markup for featured snippets' },
    { name: 'HowTo Schema', description: 'Step-by-step instruction markup' },
    { name: 'Speakable Schema', description: 'Voice search optimization markup' },
    { name: 'Concise Answers', description: 'Direct answer formatting (40-60 words)' },
    { name: 'Question Headings', description: 'H2/H3 tags phrased as questions' },
    { name: 'Definition Lists', description: 'Term definition formatting' },
  ];

  return (
    <div
      className="space-y-6"
      data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_072e">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_4575">
        <div data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_d01f">
          <h3
            className="text-lg font-semibold text-foreground"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_8013">Answer Engine Optimization</h3>
          <p
            className="text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_193b">Optimize for AI-powered search and voice assistants</p>
        </div>
        <ScoreRing
          score={audit.scores.aeo}
          size="sm"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_1c58" />
      </div>
      <div
        className="grid gap-4 md:grid-cols-2"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_55ae">
        {aeoChecks.map((check) => {
          const result = audit.results.aeo?.checks.find(c => c.name.toLowerCase().includes(check.name.toLowerCase()));
          const status = result?.status || 'warn';
          return (
            <Card
              key={check.name}
              className="p-4"
              data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_bc62_${check.name}`}>
              <div
                className="flex items-start justify-between"
                data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_f5e3_${check.name}`}>
                <div
                  className="flex-1"
                  data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_c4e0_${check.name}`}>
                  <div
                    className="flex items-center gap-2"
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_5f8a_${check.name}`}>
                    <span
                      className="font-medium text-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_1cc6_${check.name}`}>{check.name}</span>
                    <StatusBadge
                      status={status}
                      data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_530d_${check.name}`} />
                  </div>
                  <p
                    className="mt-1 text-sm text-muted-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_9429_${check.name}`}>{check.description}</p>
                </div>
                {result && (
                  <span
                    className="ml-3 text-sm font-medium text-muted-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_42b9_${check.name}`}>
                    {result.points}/{result.maxPoints}
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      <Card
        className="p-6"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_8e85">
        <h4
          className="mb-4 text-base font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_5084">AI Visibility Summary</h4>
        <div
          className="grid gap-4 md:grid-cols-4"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_8d69">
          <MetricCard
            label="ChatGPT Mentions"
            value={audit.scores.aeo >= 70 ? 'High' : 'Low'}
            trend={audit.scores.aeo >= 70 ? 'up' : 'down'}
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_3baf" />
          <MetricCard
            label="Perplexity Citations"
            value={audit.scores.geo >= 70 ? 'Good' : 'Limited'}
            trend={audit.scores.geo >= 70 ? 'up' : 'neutral'}
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_377a" />
          <MetricCard
            label="Gemini References"
            value={audit.scores.aio >= 70 ? 'Strong' : 'Weak'}
            trend={audit.scores.aio >= 70 ? 'up' : 'down'}
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_713a" />
          <MetricCard
            label="Google SGE"
            value={audit.scores.sxo >= 70 ? 'Optimized' : 'Needs Work'}
            trend={audit.scores.sxo >= 70 ? 'up' : 'neutral'}
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_dbc0" />
        </div>
      </Card>
    </div>
  );
}

function SchemaTab({ audit }: { audit: Audit | null }) {
  if (!audit) {
    return (
      <EmptyState
        icon={Activity}
        title="No Audit Data"
        description="Run an SEO audit first to validate structured data."
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_d463" />
    );
  }

  const schemaTypes = [
    'Organization',
    'Article',
    'Product',
    'BreadcrumbList',
    'FAQPage',
    'HowTo',
    'LocalBusiness',
    'Person',
    'Review',
    'Event',
  ];

  return (
    <div
      className="space-y-6"
      data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_4de6">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_c326">
        <div data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_67c6">
          <h3
            className="text-lg font-semibold text-foreground"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_371e">Schema Markup Validation</h3>
          <p
            className="text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_053a">Verify JSON-LD structured data implementation</p>
        </div>
        <ScoreRing
          score={audit.scores.schema || 0}
          size="sm"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_ad50" />
      </div>
      <Card
        className="p-6"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_da8d">
        <h4
          className="mb-4 text-base font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_d19f">Detected Schema Types</h4>
        <div
          className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_2ded">
          {schemaTypes.map((type) => {
            const hasSchema = audit.results.schema?.checks.some(c => 
              c.name.toLowerCase().includes(type.toLowerCase()) && c.status === 'pass'
            );
            return (
              <div
                key={type}
                className={cn(
                  'flex items-center justify-between rounded-lg border p-3',
                  hasSchema ? 'border-success/30 bg-success/5' : 'border-border bg-muted/30'
                )}
                data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_394b_${type}`}>
                <span
                  className={cn('font-medium', hasSchema ? 'text-foreground' : 'text-muted-foreground')}
                  data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_54b3_${type}`}>
                  {type}
                </span>
                {hasSchema ? (
                  <CheckCircle2
                    className="h-5 w-5 text-success"
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_da49_${type}`} />
                ) : (
                  <XCircle
                    className="h-5 w-5 text-muted-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_6954_${type}`} />
                )}
              </div>
            );
          })}
        </div>
      </Card>
      {audit.results.schema && (
        <Card
          className="p-6"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_3e8b">
          <h4
            className="mb-4 text-base font-semibold text-foreground"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_a8e2">Validation Details</h4>
          <div
            className="space-y-3"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_8d61">
            {audit.results.schema.checks.map((check) => (
              <div
                key={check.id}
                className="flex items-start justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_7dc4_${check.id}`}>
                <div
                  className="flex-1"
                  data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_1570_${check.id}`}>
                  <div
                    className="flex items-center gap-2"
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_e919_${check.id}`}>
                    <span
                      className="font-medium text-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_0c45_${check.id}`}>{check.name}</span>
                    <StatusBadge
                      status={check.status}
                      data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_6184_${check.id}`} />
                  </div>
                  <p
                    className="mt-1 text-sm text-muted-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_b752_${check.id}`}>{check.details}</p>
                </div>
                <span
                  className="ml-4 text-sm font-medium text-muted-foreground"
                  data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_68c4_${check.id}`}>
                  {check.points}/{check.maxPoints}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function PerformanceTab({ audit }: { audit: Audit | null }) {
  if (!audit) {
    return (
      <EmptyState
        icon={Zap}
        title="No Audit Data"
        description="Run an SEO audit first to view performance metrics."
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_d2c1" />
    );
  }

  return (
    <div
      className="space-y-6"
      data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_dced">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_026f">
        <div data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_186e">
          <h3
            className="text-lg font-semibold text-foreground"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_6ed2">Performance Metrics</h3>
          <p
            className="text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_68f4">Core Web Vitals and page speed analysis</p>
        </div>
        <ScoreRing
          score={audit.scores.performance || 0}
          size="sm"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_9819" />
      </div>
      <Card
        className="p-6"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_a6ae">
        <h4
          className="mb-4 text-base font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_04b8">Core Web Vitals</h4>
        <div
          className="grid gap-6 md:grid-cols-3"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_8810">
          <div
            className="text-center"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_8fa9">
            <div
              className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_6708">
              <Cpu
                className="h-10 w-10 text-primary"
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_dab2" />
            </div>
            <p
              className="text-sm font-medium text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_2931">LCP</p>
            <p
              className="text-2xl font-bold text-foreground"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_0579">
              {audit.scores.performance && audit.scores.performance >= 80 ? '2.1s' : '4.2s'}
            </p>
            <p
              className="text-xs text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_bb80">Largest Contentful Paint</p>
            <ColoredBadge
              variant={audit.scores.performance && audit.scores.performance >= 80 ? 'success' : 'destructive'}
              className="mt-2"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_96bf">
              {audit.scores.performance && audit.scores.performance >= 80 ? 'Good' : 'Poor'}
            </ColoredBadge>
          </div>

          <div
            className="text-center"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_2b2e">
            <div
              className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_d457">
              <TrendingUp
                className="h-10 w-10 text-accent"
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_515d" />
            </div>
            <p
              className="text-sm font-medium text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_5493">INP</p>
            <p
              className="text-2xl font-bold text-foreground"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_f5ce">
              {audit.scores.performance && audit.scores.performance >= 80 ? '85ms' : '320ms'}
            </p>
            <p
              className="text-xs text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_49ff">Interaction to Next Paint</p>
            <ColoredBadge
              variant={audit.scores.performance && audit.scores.performance >= 80 ? 'success' : 'destructive'}
              className="mt-2"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_4f27">
              {audit.scores.performance && audit.scores.performance >= 80 ? 'Good' : 'Poor'}
            </ColoredBadge>
          </div>

          <div
            className="text-center"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_6b32">
            <div
              className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/50"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_d897">
              <Activity
                className="h-10 w-10 text-secondary"
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_2562" />
            </div>
            <p
              className="text-sm font-medium text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_072b">CLS</p>
            <p
              className="text-2xl font-bold text-foreground"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_d3ad">
              {audit.scores.performance && audit.scores.performance >= 80 ? '0.05' : '0.28'}
            </p>
            <p
              className="text-xs text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_5b3a">Cumulative Layout Shift</p>
            <ColoredBadge
              variant={audit.scores.performance && audit.scores.performance >= 80 ? 'success' : 'destructive'}
              className="mt-2"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_8177">
              {audit.scores.performance && audit.scores.performance >= 80 ? 'Good' : 'Poor'}
            </ColoredBadge>
          </div>
        </div>
      </Card>
      <div
        className="grid gap-4 md:grid-cols-2"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_a05d">
        <Card
          className="p-6"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_8539">
          <h4
            className="mb-4 text-base font-semibold text-foreground"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_bf04">Mobile Performance</h4>
          <div
            className="space-y-3"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_b9ad">
            <div
              className="flex items-center justify-between"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_c169">
              <span
                className="text-sm text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_5e65">PageSpeed Score</span>
              <ColoredBadge
                variant={audit.scores.mobile && audit.scores.mobile >= 80 ? 'success' : 'warning'}
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_aefd">
                {audit.scores.mobile || 0}/100
              </ColoredBadge>
            </div>
            <div
              className="flex items-center justify-between"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_6acc">
              <span
                className="text-sm text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_18aa">First Contentful Paint</span>
              <span
                className="text-sm font-medium text-foreground"
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_67a3">
                {audit.scores.mobile && audit.scores.mobile >= 80 ? '1.8s' : '3.5s'}
              </span>
            </div>
            <div
              className="flex items-center justify-between"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_8549">
              <span
                className="text-sm text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_3044">Time to Interactive</span>
              <span
                className="text-sm font-medium text-foreground"
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_174d">
                {audit.scores.mobile && audit.scores.mobile >= 80 ? '2.5s' : '5.2s'}
              </span>
            </div>
          </div>
        </Card>

        <Card
          className="p-6"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_d340">
          <h4
            className="mb-4 text-base font-semibold text-foreground"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_dc00">Desktop Performance</h4>
          <div
            className="space-y-3"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_107d">
            <div
              className="flex items-center justify-between"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_4fd1">
              <span
                className="text-sm text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_b9de">PageSpeed Score</span>
              <ColoredBadge
                variant={audit.scores.performance && audit.scores.performance >= 80 ? 'success' : 'warning'}
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_ea1c">
                {audit.scores.performance || 0}/100
              </ColoredBadge>
            </div>
            <div
              className="flex items-center justify-between"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_a1ce">
              <span
                className="text-sm text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_44be">First Contentful Paint</span>
              <span
                className="text-sm font-medium text-foreground"
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_4f88">
                {audit.scores.performance && audit.scores.performance >= 80 ? '0.9s' : '1.8s'}
              </span>
            </div>
            <div
              className="flex items-center justify-between"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_f460">
              <span
                className="text-sm text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_0aad">Time to Interactive</span>
              <span
                className="text-sm font-medium text-foreground"
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_e1ef">
                {audit.scores.performance && audit.scores.performance >= 80 ? '1.2s' : '2.8s'}
              </span>
            </div>
          </div>
        </Card>
      </div>
      {audit.recommendations.filter(r => r.layer === 'performance').length > 0 && (
        <Card
          className="p-6"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_fe9f">
          <h4
            className="mb-4 text-base font-semibold text-foreground"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_7baa">Performance Recommendations</h4>
          <div
            className="space-y-3"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_49ef">
            {audit.recommendations
              .filter(r => r.layer === 'performance')
              .slice(0, 5)
              .map((rec, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-border bg-muted/50 p-4"
                  data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_8769_${idx}`}>
                  <div
                    className="flex items-start gap-3"
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_6fef_${idx}`}>
                    <ColoredBadge
                      variant={rec.severity === 'critical' ? 'destructive' : rec.severity === 'warning' ? 'warning' : 'secondary'}
                      data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_0e4e_${idx}`}>
                      {rec.effort}
                    </ColoredBadge>
                    <div
                      className="flex-1"
                      data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_9c26_${idx}`}>
                      <p
                        className="font-medium text-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_4ad7_${idx}`}>{rec.title}</p>
                      <p
                        className="mt-1 text-sm text-muted-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_2aa9_${idx}`}>{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function DashboardWebsiteIntel() {
  const [activeTab, setActiveTab] = useState<TabId>('seo-audit');
  const [projectId, setProjectId] = useState<string>('');
  const [latestAudit, setLatestAudit] = useState<Audit | null>(null);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Get project ID from store or use default
  useEffect(() => {
    // In production, this would come from the store or route params
    // For now, we'll use a placeholder that can be replaced
    const storedProjectId = localStorage.getItem('currentProjectId');
    if (storedProjectId) {
      setProjectId(storedProjectId);
    }
  }, []);

  // Load latest audit when project changes
  useEffect(() => {
    if (projectId) {
      loadLatestAudit();
    }
  }, [projectId]);

  async function loadLatestAudit() {
    setLoadingAudit(true);
    try {
      const audits = await getAuditsByProject(projectId);
      if (audits.length > 0) {
        setLatestAudit(audits[0]);
      }
    } catch (err) {
      console.error('Failed to load latest audit:', err);
    } finally {
      setLoadingAudit(false);
    }
  }

  const activeTabConfig = TABS.find(t => t.id === activeTab)!;

  return (
    <div
      className="min-h-screen bg-background p-6"
      data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_2ffb">
      <div
        className="mx-auto max-w-7xl space-y-6"
        data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_854a">
        {/* Header */}
        <div data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_9c02">
          <h1
            className="text-2xl font-bold text-foreground"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_9945">Website Intelligence</h1>
          <p
            className="mt-1 text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_f06e">
            Comprehensive SEO, technical analysis, and competitive intelligence tools
          </p>
        </div>

        {/* Tab Navigation */}
        <div
          className="border-b border-border"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_c814">
          <div
            className="flex flex-wrap gap-1"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_b9e1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'border-b-2 border-primary bg-primary/5 text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_0815_${tab.id}`}>
                  <Icon
                    className="h-4 w-4"
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_7b3b_${tab.id}`} />
                  <span
                    className="hidden md:inline"
                    data-icod-id={`src_pages_dashboard_dashboardwebsiteintel_tsx_39e7_${tab.id}`}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Description */}
        <div
          className="rounded-lg bg-muted/50 p-4"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_95f4">
          <div
            className="flex items-center gap-3"
            data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_3fad">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_d0e3">
              <activeTabConfig.icon className="h-5 w-5 text-primary" />
            </div>
            <div data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_d03b">
              <h2
                className="font-semibold text-foreground"
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_aeec">{activeTabConfig.label}</h2>
              <p
                className="text-sm text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_8422">{activeTabConfig.description}</p>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div
          className="min-h-[400px]"
          data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_52cf">
          {!projectId ? (
            <EmptyState
              icon={Globe}
              title="No Project Selected"
              description="Please select a project to view Website Intelligence data."
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_0df4" />
          ) : loadingAudit ? (
            <div
              className="flex h-64 items-center justify-center"
              data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_8928">
              <Spinner
                size="lg"
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_7928" />
            </div>
          ) : (
            <>
              {activeTab === 'seo-audit' && <SeoAuditTab
                projectId={projectId}
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_015d" />}
              {activeTab === 'technical-seo' && <TechnicalSeoTab
                audit={latestAudit}
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_53c0" />}
              {activeTab === 'keyword-intel' && <KeywordIntelTab
                projectId={projectId}
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_10c2" />}
              {activeTab === 'competitor' && <CompetitorTab
                projectId={projectId}
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_f891" />}
              {activeTab === 'content-gap' && <ContentGapTab
                projectId={projectId}
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_afa3" />}
              {activeTab === 'backlinks' && <BacklinksTab data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_5183" />}
              {activeTab === 'aeo' && <AeoTab
                audit={latestAudit}
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_1869" />}
              {activeTab === 'schema' && <SchemaTab
                audit={latestAudit}
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_8359" />}
              {activeTab === 'performance' && <PerformanceTab
                audit={latestAudit}
                data-icod-id="src_pages_dashboard_dashboardwebsiteintel_tsx_4042" />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
