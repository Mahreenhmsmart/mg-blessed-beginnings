import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Shield, Accessibility as AccessibilityIcon, Share2, Zap, Smartphone,
  Brain, FileText, Code2, MapPin, CheckCircle2, AlertCircle, XCircle,
  ChevronDown, ChevronUp, Download, Copy, Wrench, BarChart3, RefreshCw,
  ArrowRight, Loader2, Eye, Globe, Target, Building2, Users,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button, Card, Badge, Input, Spinner, Alert, Modal } from '@/components/ui';
import SEOHead from '@/components/SEOHead';
import ScoreCard from '@/components/dashboard/ScoreCard';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { triggerAudit, getAuditsByProject, getAuditById, exportSeoChecklist, getExecutiveSummary, generateIssueFix, fixAllSafeIssues, getHealthReportUrl } from '@/services/auditService';
import { fetchProjects, setCurrentProject } from '@/store/slices/projectsSlice';
import type { Audit, CheckResult, LayerResults, Issue, IssueSeverity } from '@/types';
import { SchemaInjector, PAGE_META } from '@/seo';

const websiteAuditMeta = PAGE_META['/website-audit'];

// ─── Severity helpers ──────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
  high: 'bg-warning/10 text-warning border-warning/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  low: 'bg-cyan/10 text-cyan border-cyan/20',
  passed: 'bg-success/10 text-success border-success/20',
};

const SEVERITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  critical: XCircle,
  high: AlertCircle,
  medium: AlertCircle,
  low: AlertCircle,
  passed: CheckCircle2,
};

// ─── Score ring component (reuses ScoreCard pattern) ──────────────────────

function OverallScoreRing({ score, size = 'lg' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'lg' ? 160 : size === 'md' ? 120 : 80;
  const radius = dims / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? 'rgb(var(--cyan))' : score >= 40 ? 'rgb(var(--warning))' : 'rgb(var(--accent))';

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: dims, height: dims }}
      data-icod-id="src_pages_websiteaudit_tsx_7a7b">
      <svg
        className="h-full w-full -rotate-90"
        viewBox={`0 0 ${dims} ${dims}`}
        data-icod-id="src_pages_websiteaudit_tsx_7116">
        <circle
          cx={dims / 2}
          cy={dims / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted"
          data-icod-id="src_pages_websiteaudit_tsx_bd73" />
        <circle
          cx={dims / 2}
          cy={dims / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          data-icod-id="src_pages_websiteaudit_tsx_4a8b" />
      </svg>
      <div
        className="absolute flex flex-col items-center"
        data-icod-id="src_pages_websiteaudit_tsx_97f9">
        <span
          className="font-heading text-3xl font-extrabold text-foreground"
          data-icod-id="src_pages_websiteaudit_tsx_35a1">{score}</span>
        <span
          className="text-xs text-muted-foreground"
          data-icod-id="src_pages_websiteaudit_tsx_aade">/100</span>
      </div>
    </div>
  );
}

// ─── Sub-score card ──────────────────────────────────────────────────────

function SubScoreCard({ label, score, icon: Icon, onClick }: { label: string; score: number; icon: React.ComponentType<{ className?: string }>; onClick?: () => void }) {
  const color = score >= 70 ? 'rgb(var(--cyan))' : score >= 40 ? 'rgb(var(--warning))' : 'rgb(var(--accent))';
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border border-border/40 bg-card p-3 transition-all hover:border-primary/30 hover:shadow-md text-left"
      data-icod-id="src_pages_websiteaudit_tsx_5047">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${color}15` }}
        data-icod-id="src_pages_websiteaudit_tsx_d884">
        <span style={{ color }} data-icod-id="src_pages_websiteaudit_tsx_0af6"><Icon className="h-5 w-5" data-icod-id="src_pages_websiteaudit_tsx_b8c0" /></span>
      </div>
      <div className="min-w-0 flex-1" data-icod-id="src_pages_websiteaudit_tsx_59d8">
        <p
          className="text-xs text-muted-foreground truncate"
          data-icod-id="src_pages_websiteaudit_tsx_3303">{label}</p>
        <p
          className="text-lg font-bold text-foreground"
          data-icod-id="src_pages_websiteaudit_tsx_17bc">{score}<span
          className="text-xs text-muted-foreground font-normal"
          data-icod-id="src_pages_websiteaudit_tsx_d8b5">/100</span></p>
      </div>
    </button>
  );
}

// ─── Issue card ──────────────────────────────────────────────────────────

function IssueCard({ issue, onGenerateFix }: { issue: Issue; onGenerateFix?: (issueId: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [fixLoading, setFixLoading] = useState(false);
  const [localFix, setLocalFix] = useState(issue.fixCode);
  const Icon = SEVERITY_ICONS[issue.severity] || AlertCircle;

  const handleFix = async () => {
    if (localFix) return;
    setFixLoading(true);
    try {
      await onGenerateFix?.(issue.id);
    } finally {
      setFixLoading(false);
    }
  };

  return (
    <div
      className={cn('rounded-xl border transition-all', SEVERITY_COLORS[issue.severity] || 'border-border')}
      data-icod-id="src_pages_websiteaudit_tsx_37ff">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left"
        data-icod-id="src_pages_websiteaudit_tsx_bb68">
        <Icon
          className="h-5 w-5 shrink-0"
          data-icod-id="src_pages_websiteaudit_tsx_b433" />
        <div className="min-w-0 flex-1" data-icod-id="src_pages_websiteaudit_tsx_dc0f">
          <div
            className="flex items-center gap-2"
            data-icod-id="src_pages_websiteaudit_tsx_6ef6">
            <Badge
              variant={issue.severity === 'critical' || issue.severity === 'high' ? 'free' : issue.severity === 'passed' ? 'new' : 'default'}
              className="text-[10px] uppercase"
              data-icod-id="src_pages_websiteaudit_tsx_f5c1">
              {issue.severity}
            </Badge>
            <span
              className="text-sm font-medium text-foreground truncate"
              data-icod-id="src_pages_websiteaudit_tsx_9a27">{issue.title}</span>
          </div>
          <p
            className="mt-1 text-xs text-muted-foreground line-clamp-1"
            data-icod-id="src_pages_websiteaudit_tsx_a6ee">{issue.description}</p>
        </div>
        {expanded ? <ChevronUp
          className="h-4 w-4 text-muted-foreground"
          data-icod-id="src_pages_websiteaudit_tsx_066a" /> : <ChevronDown
          className="h-4 w-4 text-muted-foreground"
          data-icod-id="src_pages_websiteaudit_tsx_b440" />}
      </button>
      {expanded && (
        <div
          className="border-t border-border/20 px-4 py-3 space-y-3"
          data-icod-id="src_pages_websiteaudit_tsx_0094">
          <div data-icod-id="src_pages_websiteaudit_tsx_8108">
            <p
              className="text-xs font-semibold text-foreground"
              data-icod-id="src_pages_websiteaudit_tsx_a2e8">Why it matters</p>
            <p
              className="text-xs text-muted-foreground mt-1"
              data-icod-id="src_pages_websiteaudit_tsx_1f01">{issue.whyItMatters}</p>
          </div>
          <div data-icod-id="src_pages_websiteaudit_tsx_50e5">
            <p
              className="text-xs font-semibold text-foreground"
              data-icod-id="src_pages_websiteaudit_tsx_f5e4">Evidence</p>
            <p
              className="text-xs text-muted-foreground mt-1"
              data-icod-id="src_pages_websiteaudit_tsx_0732">{issue.evidence}</p>
          </div>
          <div data-icod-id="src_pages_websiteaudit_tsx_9d3d">
            <p
              className="text-xs font-semibold text-foreground"
              data-icod-id="src_pages_websiteaudit_tsx_e25e">Recommended Solution</p>
            <p
              className="text-xs text-muted-foreground mt-1"
              data-icod-id="src_pages_websiteaudit_tsx_0711">{issue.recommendedSolution}</p>
          </div>
          {localFix && (
            <div
              className="rounded-lg bg-muted/30 p-3"
              data-icod-id="src_pages_websiteaudit_tsx_f8a0">
              <div
                className="flex items-center justify-between mb-2"
                data-icod-id="src_pages_websiteaudit_tsx_571a">
                <p
                  className="text-xs font-semibold text-foreground flex items-center gap-1"
                  data-icod-id="src_pages_websiteaudit_tsx_2ee2">
                  <Wrench className="h-3 w-3" data-icod-id="src_pages_websiteaudit_tsx_12ae" /> Generated Fix
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[10px] h-6"
                  onClick={() => navigator.clipboard.writeText(localFix)}
                  data-icod-id="src_pages_websiteaudit_tsx_455b">
                  <Copy className="h-3 w-3 mr-1" data-icod-id="src_pages_websiteaudit_tsx_cc22" /> Copy
                </Button>
              </div>
              <pre
                className="text-[11px] text-foreground overflow-x-auto whitespace-pre-wrap font-mono"
                data-icod-id="src_pages_websiteaudit_tsx_6b1e">{localFix}</pre>
            </div>
          )}
          {!localFix && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleFix}
              loading={fixLoading}
              data-icod-id="src_pages_websiteaudit_tsx_428c">
              <Wrench className="h-3 w-3 mr-1" data-icod-id="src_pages_websiteaudit_tsx_e4b6" /> Generate Fix
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

export default function WebsiteAudit() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { items: projects } = useAppSelector((s) => s.projects);

  // Form state
  const [url, setUrl] = useState('');
  const [targetCountry, setTargetCountry] = useState('');
  const [language, setLanguage] = useState('');
  const [mainKeyword, setMainKeyword] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [competitorUrls, setCompetitorUrls] = useState('');

  // Audit state
  const [auditMode, setAuditMode] = useState<'complete' | 'quick' | 'advanced'>('complete');
  const [isRunning, setIsRunning] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [currentAudit, setCurrentAudit] = useState<Audit | null>(null);
  const [activeSection, setActiveSection] = useState<'scores' | 'issues' | 'fixes' | 'report'>('scores');
  const [issueFilter, setIssueFilter] = useState<IssueSeverity | 'all'>('all');
  const [error, setError] = useState('');

  // Derived data
  const isLoggedIn = !!user;

  // Transform results to issues client-side
  const issues: Issue[] = currentAudit ? (() => {
    const result: Issue[] = [];
    for (const [layer, lr] of Object.entries(currentAudit.results || {})) {
      if (!lr?.checks) continue;
      for (const check of lr.checks) {
        const severity: IssueSeverity = check.status === 'fail' ? 'critical' : check.status === 'warn' ? 'medium' : 'passed';
        result.push({
          id: `${layer}-${check.id}`,
          checkId: check.id,
          severity,
          title: check.name,
          description: check.details,
          url: url || '',
          evidence: check.details,
          whyItMatters: `This ${layer} issue affects your website's overall performance.`,
          recommendedSolution: check.status !== 'pass' ? `Fix: ${check.details}` : '',
          implementationGuidance: '',
          priorityScore: check.maxPoints - check.points,
          status: check.status === 'pass' ? 'resolved' : 'open',
          fixCode: null,
          category: layer,
          layer,
          source: 'crawler',
          confidence: 'high',
          timestamp: new Date().toISOString(),
        });
      }
    }
    return result.sort((a, b) => b.priorityScore - a.priorityScore);
  })() : [];

  const filteredIssues = issueFilter === 'all' ? issues : issues.filter((i) => i.severity === issueFilter);

  const overallScore = currentAudit ? (() => {
    const scores = Object.values(currentAudit.scores).filter((v): v is number => typeof v === 'number');
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  })() : 0;

  const startAudit = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (!url.trim()) {
      setError('Please enter a valid URL.');
      return;
    }

    setError('');
    setIsRunning(true);
    setProgressStage('Initializing...');

    try {
      // Ensure project exists
      let projectId = projects.find((p) => p.url === url)?. _id;
      if (!projectId) {
        setProgressStage('Creating project...');
        // We need to call the API directly since createProjectAction may not exist
        const { data: res } = await (await import('@/services/apiClient')).default.post('/projects', {
          url,
          name: new URL(url).hostname,
          competitors: competitorUrls ? competitorUrls.split(',').map((u) => u.trim()).filter(Boolean) : [],
        });
        projectId = res.data._id;
        dispatch(fetchProjects());
      }

      dispatch(setCurrentProject(projectId));

      // Simulate stage-by-stage progress
      const stages = [
        'Crawling website...',
        'Analyzing technical SEO...',
        'Checking on-page elements...',
        'Evaluating content quality...',
        'Scanning keywords...',
        'Testing performance...',
        'Checking mobile compatibility...',
        'Auditing security headers...',
        'Evaluating accessibility...',
        'Checking social metadata...',
        'Computing final scores...',
      ];

      // Start the audit
      const { auditId } = await triggerAudit(projectId!);

      // Progress simulation while polling
      let stageIdx = 0;
      const progressInterval = setInterval(() => {
        if (stageIdx < stages.length) {
          setProgressStage(stages[stageIdx]);
          stageIdx++;
        }
      }, 2000);

      // Poll for completion
      let attempts = 0;
      const maxAttempts = 60; // 2 minutes
      while (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 2000));
        attempts++;
        try {
          const audit = await getAuditById(auditId);
          if (audit.status === 'completed') {
            clearInterval(progressInterval);
            setCurrentAudit(audit);
            setIsRunning(false);
            setProgressStage('');
            return;
          }
          if (audit.status === 'failed') {
            clearInterval(progressInterval);
            setError(`Audit failed: ${audit.errorMessage || 'Unknown error'}`);
            setIsRunning(false);
            setProgressStage('');
            return;
          }
        } catch {
          // Continue polling
        }
      }

      clearInterval(progressInterval);
      setError('Audit timed out. Please try again later.');
      setIsRunning(false);
      setProgressStage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start audit.');
      setIsRunning(false);
      setProgressStage('');
    }
  };

  const handleGenerateFix = async (issueId: string) => {
    if (!currentAudit) return;
    try {
      const { fixCode } = await generateIssueFix(currentAudit._id, issueId);
      // Update local issues state
      setCurrentAudit((prev) => prev ? { ...prev } : null);
    } catch (err) {
      console.error('Fix generation failed:', err);
    }
  };

  const issueCounts = {
    critical: issues.filter((i) => i.severity === 'critical').length,
    high: issues.filter((i) => i.severity === 'high').length,
    medium: issues.filter((i) => i.severity === 'medium').length,
    low: issues.filter((i) => i.severity === 'low').length,
    passed: issues.filter((i) => i.severity === 'passed').length,
  };

  const subScores: Array<{ key: string; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { key: 'seo', label: 'Technical SEO', icon: Search },
    { key: 'aeo', label: 'Answer Engine', icon: Brain },
    { key: 'geo', label: 'Generative Engine', icon: Globe },
    { key: 'aio', label: 'AI Optimization', icon: Target },
    { key: 'sxo', label: 'Search Experience', icon: Eye },
    { key: 'cq', label: 'Content Quality', icon: FileText },
    { key: 'schema', label: 'Schema Data', icon: Code2 },
    { key: 'performance', label: 'Performance', icon: Zap },
    { key: 'mobile', label: 'Mobile', icon: Smartphone },
    { key: 'localSeo', label: 'Local SEO', icon: MapPin },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'accessibility', label: 'Accessibility', icon: AccessibilityIcon },
    { key: 'social', label: 'Social Media', icon: Share2 },
  ];

  return (
    <>
      <SEOHead
        title={websiteAuditMeta.title}
        description={websiteAuditMeta.description}
        keywords={websiteAuditMeta.keywords}
        canonicalUrl={websiteAuditMeta.canonical}
        data-icod-id="src_pages_websiteaudit_tsx_9a72" />
      <SchemaInjector
        schemaType="page"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Website Audit', url: '/website-audit' },
        ]}
        data-icod-id="src_pages_websiteaudit_tsx_5b6f" />
      <div
        className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"
        data-icod-id="src_pages_websiteaudit_tsx_c3bf">
        {/* Hero Section */}
        <div
          className="text-center mb-12"
          data-icod-id="src_pages_websiteaudit_tsx_8faf">
          <h1
            className="font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            data-icod-id="src_pages_websiteaudit_tsx_c38f">
            Website Intelligence{' '}
            <span
              className="bg-gradient-to-r from-primary via-accent to-cyan bg-clip-text text-transparent"
              data-icod-id="src_pages_websiteaudit_tsx_fdfb">
              Audit
            </span>
          </h1>
          <p
            className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
            data-icod-id="src_pages_websiteaudit_tsx_3560">
            Comprehensive analysis across 13 dimensions — SEO, security, accessibility, performance, AI readiness, and more.
          </p>
        </div>

        {/* AEO Direct Answer Section */}
        <section className="max-w-7xl mx-auto mb-10 text-center" data-icod-id="src_pages_websiteaudit_tsx_aeo_section">
          <h2 className="text-xl font-bold text-foreground mb-3" data-icod-id="src_pages_websiteaudit_tsx_aeo_h2">What is a website audit?</h2>
          <p className="text-muted-foreground leading-relaxed" data-icod-id="src_pages_websiteaudit_tsx_aeo_p">
            A website audit is a comprehensive evaluation of your site's technical health, SEO performance, security posture, accessibility compliance, and AI search readiness. It identifies issues that hurt your rankings and provides prioritized fixes with code-level solutions to improve visibility across Google, Bing, and generative AI search engines like ChatGPT and Perplexity.
          </p>
        </section>

        {/* URL Input Form */}
        {!currentAudit && !isRunning && (
          <Card
            className="mx-auto max-w-3xl p-6 sm:p-8 shadow-xl border-border/50"
            data-icod-id="src_pages_websiteaudit_tsx_a77a">
            <div className="space-y-4" data-icod-id="src_pages_websiteaudit_tsx_b5e9">
              <div data-icod-id="src_pages_websiteaudit_tsx_df6b">
                <label
                  htmlFor="audit-url"
                  className="block text-sm font-medium text-foreground mb-1.5"
                  data-icod-id="src_pages_websiteaudit_tsx_b1ea">Website URL</label>
                <div className="flex gap-2" data-icod-id="src_pages_websiteaudit_tsx_36a6">
                  <Input
                    id="audit-url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1"
                    data-icod-id="src_pages_websiteaudit_tsx_e40e" />
                </div>
              </div>

              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                data-icod-id="src_pages_websiteaudit_tsx_3422">
                <div data-icod-id="src_pages_websiteaudit_tsx_f720">
                  <label
                    htmlFor="target-country"
                    className="block text-xs font-medium text-muted-foreground mb-1"
                    data-icod-id="src_pages_websiteaudit_tsx_1b18">Target Country (optional)</label>
                  <Input
                    id="target-country"
                    placeholder="United States"
                    value={targetCountry}
                    onChange={(e) => setTargetCountry(e.target.value)}
                    data-icod-id="src_pages_websiteaudit_tsx_4560" />
                </div>
                <div data-icod-id="src_pages_websiteaudit_tsx_6077">
                  <label
                    htmlFor="language"
                    className="block text-xs font-medium text-muted-foreground mb-1"
                    data-icod-id="src_pages_websiteaudit_tsx_fb40">Language (optional)</label>
                  <Input
                    id="language"
                    placeholder="English"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    data-icod-id="src_pages_websiteaudit_tsx_bd3d" />
                </div>
                <div data-icod-id="src_pages_websiteaudit_tsx_73b1">
                  <label
                    htmlFor="keyword"
                    className="block text-xs font-medium text-muted-foreground mb-1"
                    data-icod-id="src_pages_websiteaudit_tsx_b617">Main Keyword (optional)</label>
                  <Input
                    id="keyword"
                    placeholder="digital marketing"
                    value={mainKeyword}
                    onChange={(e) => setMainKeyword(e.target.value)}
                    data-icod-id="src_pages_websiteaudit_tsx_b8e6" />
                </div>
                <div data-icod-id="src_pages_websiteaudit_tsx_d7ce">
                  <label
                    htmlFor="biz-type"
                    className="block text-xs font-medium text-muted-foreground mb-1"
                    data-icod-id="src_pages_websiteaudit_tsx_07a9">Business Type (optional)</label>
                  <Input
                    id="biz-type"
                    placeholder="SaaS, E-commerce, Agency..."
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    data-icod-id="src_pages_websiteaudit_tsx_f8f7" />
                </div>
              </div>

              <div data-icod-id="src_pages_websiteaudit_tsx_c30c">
                <label
                  htmlFor="competitors"
                  className="block text-xs font-medium text-muted-foreground mb-1"
                  data-icod-id="src_pages_websiteaudit_tsx_7ce6">Competitor URLs (comma-separated, optional)</label>
                <Input
                  id="competitors"
                  placeholder="https://competitor1.com, https://competitor2.com"
                  value={competitorUrls}
                  onChange={(e) => setCompetitorUrls(e.target.value)}
                  data-icod-id="src_pages_websiteaudit_tsx_6579" />
              </div>

              {error && <Alert variant="error" data-icod-id="src_pages_websiteaudit_tsx_59ad">{error}</Alert>}

              <div
                className="flex flex-wrap gap-3 pt-2"
                data-icod-id="src_pages_websiteaudit_tsx_26f9">
                <Button
                  size="lg"
                  onClick={() => { setAuditMode('complete'); startAudit(); }}
                  className="flex-1 min-w-[180px]"
                  data-icod-id="src_pages_websiteaudit_tsx_2d2c">
                  <Search className="h-4 w-4 mr-2" data-icod-id="src_pages_websiteaudit_tsx_3d39" /> Start Complete Audit
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => { setAuditMode('quick'); startAudit(); }}
                  className="flex-1 min-w-[140px]"
                  data-icod-id="src_pages_websiteaudit_tsx_d810">
                  <Zap className="h-4 w-4 mr-2" data-icod-id="src_pages_websiteaudit_tsx_d961" /> Quick Audit
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => { setAuditMode('advanced'); startAudit(); }}
                  className="flex-1 min-w-[160px]"
                  data-icod-id="src_pages_websiteaudit_tsx_3eb2">
                  <BarChart3 className="h-4 w-4 mr-2" data-icod-id="src_pages_websiteaudit_tsx_d8e4" /> Advanced Audit
                </Button>
              </div>

              {!isLoggedIn && (
                <p
                  className="text-center text-sm text-muted-foreground mt-3"
                  data-icod-id="src_pages_websiteaudit_tsx_b48a">
                  You'll need to <button
                  onClick={() => navigate('/login')}
                  className="text-primary underline font-medium"
                  data-icod-id="src_pages_websiteaudit_tsx_4874">log in</button> to start an audit.
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Progress Indicator */}
        {isRunning && (
          <Card
            className="mx-auto max-w-2xl p-8 text-center"
            data-icod-id="src_pages_websiteaudit_tsx_911b">
            <Loader2
              className="h-12 w-12 mx-auto text-primary animate-spin mb-4"
              data-icod-id="src_pages_websiteaudit_tsx_319a" />
            <h2
              className="font-heading text-xl font-bold text-foreground mb-2"
              data-icod-id="src_pages_websiteaudit_tsx_4ce8">Analyzing Your Website</h2>
            <p
              className="text-sm text-muted-foreground mb-4"
              data-icod-id="src_pages_websiteaudit_tsx_6bcd">{progressStage}</p>
            <div
              className="h-2 w-full rounded-full bg-muted overflow-hidden"
              data-icod-id="src_pages_websiteaudit_tsx_3110">
              <div
                className="h-full bg-gradient-to-r from-primary to-cyan animate-pulse rounded-full transition-all duration-1000"
                style={{ width: progressStage ? `${Math.min(((['Crawling','Analyzing','Checking','Evaluating','Scanning','Testing','Auditing','Computing'].findIndex(s => progressStage.includes(s)) + 1) / 8) * 100, 95)}%` : '10%' }}
                data-icod-id="src_pages_websiteaudit_tsx_9240" />
            </div>
            <p
              className="text-xs text-muted-foreground mt-3"
              data-icod-id="src_pages_websiteaudit_tsx_bbfb">This typically takes 30-60 seconds.</p>
          </Card>
        )}

        {/* Results Display */}
        {currentAudit && !isRunning && (
          <div className="space-y-8" data-icod-id="src_pages_websiteaudit_tsx_e0ad">
            {/* Navigation tabs */}
            <div
              className="flex flex-wrap gap-2 border-b border-border pb-2"
              data-icod-id="src_pages_websiteaudit_tsx_4284">
              {[
                { key: 'scores', label: 'Overall Score', icon: BarChart3 },
                { key: 'issues', label: `Issue Center (${issues.filter(i => i.severity !== 'passed').length})`, icon: AlertCircle },
                { key: 'fixes', label: 'Fix My Website', icon: Wrench },
                { key: 'report', label: 'Final Report', icon: FileText },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSection(tab.key as typeof activeSection)}
                  className={cn('flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                    activeSection === tab.key ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50')}
                  data-icod-id={`src_pages_websiteaudit_tsx_4190_${tab.key}`}>
                  <tab.icon className="h-4 w-4" /> {tab.label}
                </button>
              ))}
              <div className="ml-auto" data-icod-id="src_pages_websiteaudit_tsx_d0ee">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setCurrentAudit(null); setUrl(''); }}
                  data-icod-id="src_pages_websiteaudit_tsx_bb25">
                  <RefreshCw className="h-4 w-4 mr-1" data-icod-id="src_pages_websiteaudit_tsx_dfaa" /> New Audit
                </Button>
              </div>
            </div>

            {/* Scores Section */}
            {activeSection === 'scores' && (
              <div className="space-y-6" data-icod-id="src_pages_websiteaudit_tsx_deba">
                <div
                  className="flex flex-col sm:flex-row items-center gap-8"
                  data-icod-id="src_pages_websiteaudit_tsx_aa96">
                  <OverallScoreRing
                    score={overallScore}
                    size="lg"
                    data-icod-id="src_pages_websiteaudit_tsx_4f71" />
                  <div className="flex-1" data-icod-id="src_pages_websiteaudit_tsx_ade2">
                    <h2
                      className="font-heading text-2xl font-bold text-foreground"
                      data-icod-id="src_pages_websiteaudit_tsx_7fde">Overall Health Score</h2>
                    <p
                      className="text-muted-foreground mt-1"
                      data-icod-id="src_pages_websiteaudit_tsx_b049">Based on {Object.keys(currentAudit.results || {}).length} analysis dimensions across {issues.length} individual checks.</p>
                    <div
                      className="flex gap-4 mt-4"
                      data-icod-id="src_pages_websiteaudit_tsx_9b08">
                      <div className="text-center" data-icod-id="src_pages_websiteaudit_tsx_5331">
                        <p
                          className="text-2xl font-bold text-destructive"
                          data-icod-id="src_pages_websiteaudit_tsx_7a79">{issueCounts.critical}</p>
                        <p
                          className="text-xs text-muted-foreground"
                          data-icod-id="src_pages_websiteaudit_tsx_072f">Critical</p>
                      </div>
                      <div className="text-center" data-icod-id="src_pages_websiteaudit_tsx_f6f2">
                        <p
                          className="text-2xl font-bold text-warning"
                          data-icod-id="src_pages_websiteaudit_tsx_5508">{issueCounts.medium}</p>
                        <p
                          className="text-xs text-muted-foreground"
                          data-icod-id="src_pages_websiteaudit_tsx_80ae">Warnings</p>
                      </div>
                      <div className="text-center" data-icod-id="src_pages_websiteaudit_tsx_4d9c">
                        <p
                          className="text-2xl font-bold text-success"
                          data-icod-id="src_pages_websiteaudit_tsx_3b4e">{issueCounts.passed}</p>
                        <p
                          className="text-xs text-muted-foreground"
                          data-icod-id="src_pages_websiteaudit_tsx_e0b3">Passed</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                  data-icod-id="src_pages_websiteaudit_tsx_ed88">
                  {subScores.map(({ key, label, icon }) => (
                    <SubScoreCard
                      key={key}
                      label={label}
                      score={(currentAudit.scores as any)[key] ?? 0}
                      icon={icon}
                      data-icod-id={`src_pages_websiteaudit_tsx_cbf6_${key}`} />
                  ))}
                </div>
              </div>
            )}

            {/* Issues Section */}
            {activeSection === 'issues' && (
              <div className="space-y-4" data-icod-id="src_pages_websiteaudit_tsx_7df0">
                <div
                  className="flex flex-wrap gap-2"
                  data-icod-id="src_pages_websiteaudit_tsx_d1c5">
                  {(['all', 'critical', 'high', 'medium', 'low', 'passed'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setIssueFilter(filter)}
                      className={cn('rounded-full px-3 py-1 text-xs font-medium capitalize transition-all',
                        issueFilter === filter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground')}
                      data-icod-id={`src_pages_websiteaudit_tsx_d21a_${filter}`}>
                      {filter} {filter !== 'all' && `(${issueCounts[filter as keyof typeof issueCounts] ?? 0})`}
                    </button>
                  ))}
                </div>
                <div className="space-y-2" data-icod-id="src_pages_websiteaudit_tsx_0fc5">
                  {filteredIssues.slice(0, 50).map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      onGenerateFix={handleGenerateFix}
                      data-icod-id={`src_pages_websiteaudit_tsx_668b_${issue.id}`} />
                  ))}
                  {filteredIssues.length === 0 && (
                    <div
                      className="text-center py-12 text-muted-foreground"
                      data-icod-id="src_pages_websiteaudit_tsx_38a3">No issues found matching this filter.</div>
                  )}
                </div>
              </div>
            )}

            {/* Fixes Section */}
            {activeSection === 'fixes' && (
              <div className="space-y-4" data-icod-id="src_pages_websiteaudit_tsx_e5ad">
                <div
                  className="flex items-center justify-between"
                  data-icod-id="src_pages_websiteaudit_tsx_7e22">
                  <h2
                    className="font-heading text-xl font-bold text-foreground"
                    data-icod-id="src_pages_websiteaudit_tsx_7920">Open Issues Requiring Fixes</h2>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={async () => {
                      if (!currentAudit) return;
                      try { await fixAllSafeIssues(currentAudit._id); } catch {}
                    }}
                    data-icod-id="src_pages_websiteaudit_tsx_fcb7">
                    <Zap className="h-4 w-4 mr-1" data-icod-id="src_pages_websiteaudit_tsx_8154" /> Fix All Safe Issues
                  </Button>
                </div>
                <div className="space-y-2" data-icod-id="src_pages_websiteaudit_tsx_7344">
                  {issues.filter((i) => i.status === 'open' && i.severity !== 'passed').slice(0, 30).map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      onGenerateFix={handleGenerateFix}
                      data-icod-id={`src_pages_websiteaudit_tsx_eb0d_${issue.id}`} />
                  ))}
                </div>
              </div>
            )}

            {/* Report Section */}
            {activeSection === 'report' && (
              <div className="space-y-6" data-icod-id="src_pages_websiteaudit_tsx_cf95">
                <Card className="p-6" data-icod-id="src_pages_websiteaudit_tsx_2578">
                  <h2
                    className="font-heading text-xl font-bold text-foreground mb-4"
                    data-icod-id="src_pages_websiteaudit_tsx_37d9">Export & Reports</h2>
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    data-icod-id="src_pages_websiteaudit_tsx_e092">
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = getHealthReportUrl(currentAudit._id);
                        link.download = 'health-report.pdf';
                        link.click();
                      }}
                      data-icod-id="src_pages_websiteaudit_tsx_1c41">
                      <Download className="h-4 w-4 mr-2" data-icod-id="src_pages_websiteaudit_tsx_c976" /> PDF Health Report
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={async () => {
                        try {
                          const md = await exportSeoChecklist(currentAudit._id);
                          const blob = new Blob([md], { type: 'text/markdown' });
                          const a = document.createElement('a');
                          a.href = URL.createObjectURL(blob);
                          a.download = 'seo-checklist.md';
                          a.click();
                        } catch {}
                      }}
                      data-icod-id="src_pages_websiteaudit_tsx_148e">
                      <FileText className="h-4 w-4 mr-2" data-icod-id="src_pages_websiteaudit_tsx_0903" /> SEO Checklist (Markdown)
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={async () => {
                        try {
                          const { summary } = await getExecutiveSummary(currentAudit._id);
                          await navigator.clipboard.writeText(summary);
                        } catch {}
                      }}
                      data-icod-id="src_pages_websiteaudit_tsx_309e">
                      <Copy className="h-4 w-4 mr-2" data-icod-id="src_pages_websiteaudit_tsx_6893" /> Copy Executive Summary
                    </Button>
                  </div>
                </Card>

                <Card className="p-6" data-icod-id="src_pages_websiteaudit_tsx_aec6">
                  <h2
                    className="font-heading text-xl font-bold text-foreground mb-4"
                    data-icod-id="src_pages_websiteaudit_tsx_2641">Top Priority Actions</h2>
                  <div className="space-y-2" data-icod-id="src_pages_websiteaudit_tsx_087b">
                    {issues.filter((i) => i.severity !== 'passed').slice(0, 10).map((issue, idx) => (
                      <div
                        key={issue.id}
                        className="flex items-start gap-3 rounded-lg border border-border/30 p-3"
                        data-icod-id={`src_pages_websiteaudit_tsx_3b17_${issue.id}`}>
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
                          data-icod-id={`src_pages_websiteaudit_tsx_e979_${issue.id}`}>{idx + 1}</span>
                        <div data-icod-id={`src_pages_websiteaudit_tsx_d46c_${issue.id}`}>
                          <p
                            className="text-sm font-medium text-foreground"
                            data-icod-id={`src_pages_websiteaudit_tsx_bf13_${issue.id}`}>{issue.title}</p>
                          <p
                            className="text-xs text-muted-foreground"
                            data-icod-id={`src_pages_websiteaudit_tsx_d282_${issue.id}`}>{issue.category} — Priority: {issue.priorityScore}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
