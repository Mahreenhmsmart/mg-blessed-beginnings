import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Search,
  BarChart3,
  Shield,
  Zap,
  Code,
  Target,
  FileText,
  Link as LinkIcon,
  Activity,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  RefreshCw,
  History,
  ChevronDown,
  ChevronUp,
  Filter,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Wrench,
  TrendingUp,
  Users,
  Lock,
  Smartphone,
  Server,
  Layers,
} from 'lucide-react';
import { Button, Card, Input, Field, Spinner, Alert, EmptyState } from '@/components/ui';
import { cn } from '@/utils/cn';
import SEOHead from '@/components/SEOHead';
import { SchemaInjector, PAGE_META } from '@/seo';

const websiteIntelligenceMeta = PAGE_META['/website-intelligence'];


// ─── Types ────────────────────────────────────────────────────────────────

type AuditStatus = 'idle' | 'validating' | 'scanning' | 'complete' | 'error';

interface AuditFormData {
  url: string;
  targetCountry: string;
  targetLanguage: string;
  businessType: string;
  primaryKeyword: string;
}

interface ScoreCategory {
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

interface Finding {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  category: string;
  url: string;
  problem: string;
  evidence: string;
  impact: string;
  solution: string;
  priority: number;
}

interface AuditResult {
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
  recommendations: Array<{
    rank: number;
    title: string;
    impact: string;
    effort: string;
    priority: string;
  }>;
}

// ─── Constants ────────────────────────────────────────────────────────────

const COUNTRIES = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'in', label: 'India' },
  { value: 'pk', label: 'Pakistan' },
  { value: 'ae', label: 'UAE' },
  { value: 'sa', label: 'Saudi Arabia' },
  { value: 'global', label: 'Global' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ar', label: 'Arabic' },
  { value: 'ur', label: 'Urdu' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
];

const BUSINESS_TYPES = [
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'saas', label: 'SaaS / Software' },
  { value: 'services', label: 'Professional Services' },
  { value: 'local', label: 'Local Business' },
  { value: 'blog', label: 'Blog / Media' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'nonprofit', label: 'Non-profit' },
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'other', label: 'Other' },
];

// ─── URL Validation ───────────────────────────────────────────────────────

function normalizeUrl(input: string): { valid: boolean; url: string; error?: string } {
  let url = input.trim();
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'file:', 'data:', 'vbscript:'];
  const lowerUrl = url.toLowerCase();
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return { valid: false, url: '', error: 'Invalid URL protocol detected.' };
    }
  }
  
  // Add https:// if no protocol
  if (!url.match(/^https?:\/\//i)) {
    url = `https://${url}`;
  }
  
  try {
    const parsed = new URL(url);
    
    // Block localhost in production context
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
      return { valid: false, url: '', error: 'Local addresses cannot be audited.' };
    }
    
    // Validate domain format
    if (!hostname.includes('.') || hostname.length < 3) {
      return { valid: false, url: '', error: 'Invalid domain format.' };
    }
    
    // Normalize to https
    parsed.protocol = 'https:';
    
    return { valid: true, url: parsed.toString().replace(/\/$/, '') };
  } catch {
    return { valid: false, url: '', error: 'Please enter a valid URL (e.g., example.com)' };
  }
}

function getStatusFromScore(score: number): 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical' {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Critical';
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Excellent': return 'text-success bg-success/10 border-success/30';
    case 'Good': return 'text-primary bg-primary/10 border-primary/30';
    case 'Needs Improvement': return 'text-warning bg-warning/10 border-warning/30';
    case 'Critical': return 'text-destructive bg-destructive/10 border-destructive/30';
    default: return 'text-muted-foreground bg-muted border-border';
  }
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'Critical': return 'bg-destructive text-destructive-foreground';
    case 'High': return 'bg-warning text-warning-foreground';
    case 'Medium': return 'bg-primary text-primary-foreground';
    case 'Low': return 'bg-secondary text-secondary-foreground';
    case 'Info': return 'bg-muted text-muted-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
}

// ─── Helper Components ────────────────────────────────────────────────────

function ScoreRing({ score, size = 'md', label }: { score: number; size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const percentage = Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const sizeClasses = { sm: 'h-16 w-16', md: 'h-24 w-24', lg: 'h-32 w-32' };
  const textSizes = { sm: 'text-sm', md: 'text-xl', lg: 'text-3xl' };
  
  const colorClass =
    percentage >= 85 ? 'text-success' :
    percentage >= 70 ? 'text-primary' :
    percentage >= 50 ? 'text-warning' :
    'text-destructive';

  return (
    <div
      className={cn('relative flex flex-col items-center justify-center', sizeClasses[size])}
      data-icod-id="src_pages_websiteintelligence_tsx_7f36">
      <svg
        className="h-full w-full -rotate-90 transform"
        viewBox="0 0 100 100"
        data-icod-id="src_pages_websiteintelligence_tsx_0ad8">
        <circle
          className="stroke-muted"
          cx="50"
          cy="50"
          r="40"
          fill="none"
          strokeWidth="8"
          data-icod-id="src_pages_websiteintelligence_tsx_9b6d" />
        <circle
          className={cn('transition-all duration-1000 ease-out', colorClass)}
          cx="50"
          cy="50"
          r="40"
          fill="none"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          data-icod-id="src_pages_websiteintelligence_tsx_a607" />
      </svg>
      <span
        className={cn('absolute font-bold text-foreground', textSizes[size])}
        data-icod-id="src_pages_websiteintelligence_tsx_99cd">
        {Math.round(percentage)}
      </span>
      {label && <span
        className="mt-1 text-xs text-muted-foreground"
        data-icod-id="src_pages_websiteintelligence_tsx_8cbe">{label}</span>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', getStatusColor(status))}
      data-icod-id="src_pages_websiteintelligence_tsx_e6bb">
      {status}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-xs font-bold', getSeverityColor(severity))}
      data-icod-id="src_pages_websiteintelligence_tsx_cd12">
      {severity}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function WebsiteIntelligence() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<AuditFormData>({
    url: '',
    targetCountry: 'us',
    targetLanguage: 'en',
    businessType: 'services',
    primaryKeyword: '',
  });
  
  const [status, setStatus] = useState<AuditStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<AuditResult | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Simulate audit progress
  const simulateAudit = useCallback(async (url: string) => {
    setStatus('scanning');
    setProgress(0);
    
    const steps = [
      { progress: 10, message: 'Connecting to website...' },
      { progress: 20, message: 'Analyzing site structure...' },
      { progress: 35, message: 'Checking technical SEO...' },
      { progress: 50, message: 'Analyzing on-page elements...' },
      { progress: 65, message: 'Evaluating content quality...' },
      { progress: 75, message: 'Testing performance metrics...' },
      { progress: 85, message: 'Checking mobile responsiveness...' },
      { progress: 90, message: 'Validating structured data...' },
      { progress: 95, message: 'Generating AI search readiness score...' },
      { progress: 100, message: 'Compiling final report...' },
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setProgress(step.progress);
      setProgressMessage(step.message);
    }

    // Generate mock result (in production, this would come from API)
    const mockResult: AuditResult = {
      website: url,
      auditDate: new Date().toISOString(),
      overallHealth: 72,
      scores: {
        seo: { name: 'SEO Score', score: 78, maxScore: 100, status: 'Good', issues: { critical: 2, high: 5, medium: 12, low: 8 } },
        technical: { name: 'Technical Score', score: 82, maxScore: 100, status: 'Good', issues: { critical: 1, high: 3, medium: 8, low: 5 } },
        performance: { name: 'Performance Score', score: 65, maxScore: 100, status: 'Needs Improvement', issues: { critical: 3, high: 4, medium: 6, low: 2 } },
        content: { name: 'Content Score', score: 71, maxScore: 100, status: 'Good', issues: { critical: 0, high: 4, medium: 9, low: 11 } },
        aeo: { name: 'AEO Score', score: 58, maxScore: 100, status: 'Needs Improvement', issues: { critical: 2, high: 6, medium: 8, low: 4 } },
        security: { name: 'Security Score', score: 88, maxScore: 100, status: 'Excellent', issues: { critical: 0, high: 1, medium: 3, low: 2 } },
        mobile: { name: 'Mobile Score', score: 75, maxScore: 100, status: 'Good', issues: { critical: 1, high: 2, medium: 5, low: 7 } },
        schema: { name: 'Schema Score', score: 45, maxScore: 100, status: 'Critical', issues: { critical: 4, high: 3, medium: 2, low: 1 } },
        internalLinks: { name: 'Internal Links', score: 68, maxScore: 100, status: 'Needs Improvement', issues: { critical: 0, high: 5, medium: 7, low: 9 } },
      },
      findings: generateMockFindings(url),
      recommendations: generateMockRecommendations(),
    };

    setResult(mockResult);
    setStatus('complete');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validation = normalizeUrl(formData.url);
    if (!validation.valid) {
      setError(validation.error || 'Invalid URL');
      return;
    }

    setStatus('validating');
    await simulateAudit(validation.url);
  };

  const handleReset = () => {
    setStatus('idle');
    setResult(null);
    setProgress(0);
    setError(null);
    setFormData(prev => ({ ...prev, url: '' }));
  };

  const filteredFindings = result?.findings.filter(f => {
    if (filterSeverity !== 'all' && f.severity !== filterSeverity) return false;
    if (filterCategory !== 'all' && f.category !== filterCategory) return false;
    return true;
  }) || [];

  const categories = [...new Set(result?.findings.map(f => f.category) || [])];

  return (
    <>
      <SEOHead
        title={websiteIntelligenceMeta.title}
        description={websiteIntelligenceMeta.description}
        keywords={websiteIntelligenceMeta.keywords}
        canonicalUrl={websiteIntelligenceMeta.canonical}
        data-icod-id="src_pages_websiteintelligence_tsx_c734" />
      <SchemaInjector
        schemaType="page"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Website Intelligence', url: '/website-intelligence' },
        ]}
        data-icod-id="src_pages_websiteintelligence_tsx_3d16" />
      <div
        className="min-h-screen bg-background"
        data-icod-id="src_pages_websiteintelligence_tsx_32ee">
        {/* Header */}
        <div
          className="border-b border-border bg-card"
          data-icod-id="src_pages_websiteintelligence_tsx_feb1">
          <div
            className="container mx-auto px-4 py-6"
            data-icod-id="src_pages_websiteintelligence_tsx_f7a6">
            <div
              className="flex items-center gap-3"
              data-icod-id="src_pages_websiteintelligence_tsx_d7a5">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"
                data-icod-id="src_pages_websiteintelligence_tsx_b887">
                <Globe
                  className="h-6 w-6 text-primary"
                  data-icod-id="src_pages_websiteintelligence_tsx_04e4" />
              </div>
              <div data-icod-id="src_pages_websiteintelligence_tsx_6332">
                <h1
                  className="text-2xl font-bold text-foreground"
                  data-icod-id="src_pages_websiteintelligence_tsx_a327">Website Intelligence Center</h1>
                <p
                  className="text-sm text-muted-foreground"
                  data-icod-id="src_pages_websiteintelligence_tsx_5ade">Comprehensive website auditing & SEO intelligence</p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="container mx-auto px-4 py-8"
          data-icod-id="src_pages_websiteintelligence_tsx_6868">
          {/* AEO Direct Answer Section */}
          <section className="max-w-7xl mx-auto mb-10" data-icod-id="src_pages_websiteintelligence_tsx_aeo_section">
            <h2 className="text-xl font-bold text-foreground mb-3" data-icod-id="src_pages_websiteintelligence_tsx_aeo_h2_1">What is Website Intelligence?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6" data-icod-id="src_pages_websiteintelligence_tsx_aeo_p1">
              Website Intelligence is a comprehensive analysis system that evaluates your website across nine key dimensions: SEO, technical health, performance, content quality, AI search readiness, security, mobile responsiveness, structured data, and internal linking. It provides actionable scores and findings so you can improve visibility in both traditional search engines and AI-powered answer engines.
            </p>
            <h2 className="text-xl font-bold text-foreground mb-3" data-icod-id="src_pages_websiteintelligence_tsx_aeo_h2_2">How does an SEO audit work?</h2>
            <p className="text-muted-foreground leading-relaxed" data-icod-id="src_pages_websiteintelligence_tsx_aeo_p2">
              An SEO audit crawls your website and checks hundreds of ranking factors including meta tags, page speed, mobile usability, schema markup, backlink profile, and content quality. The audit generates a health score for each category, identifies critical issues, and provides prioritized recommendations with specific fixes to improve your search engine rankings and AI search visibility.
            </p>
          </section>
          {/* Audit Input Form */}
          {status === 'idle' && (
            <Card
              className="mx-auto max-w-3xl p-8"
              data-icod-id="src_pages_websiteintelligence_tsx_20b2">
              <div
                className="mb-6 text-center"
                data-icod-id="src_pages_websiteintelligence_tsx_23fa">
                <h2
                  className="text-xl font-semibold text-foreground"
                  data-icod-id="src_pages_websiteintelligence_tsx_7a6e">Start Your Website Audit</h2>
                <p
                  className="mt-2 text-muted-foreground"
                  data-icod-id="src_pages_websiteintelligence_tsx_22b1">
                  Enter your website URL to receive a comprehensive analysis of SEO, performance, security, and AI search readiness.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
                data-icod-id="src_pages_websiteintelligence_tsx_441a">
                <Field
                  label="Website URL"
                  required
                  error={error || undefined}
                  data-icod-id="src_pages_websiteintelligence_tsx_bd64">
                  <Input
                    type="text"
                    placeholder="example.com"
                    value={formData.url}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, url: e.target.value }));
                      setError(null);
                    }}
                    className="text-lg"
                    data-icod-id="src_pages_websiteintelligence_tsx_cb53" />
                </Field>

                <div
                  className="grid gap-5 md:grid-cols-2"
                  data-icod-id="src_pages_websiteintelligence_tsx_eb56">
                  <Field
                    label="Target Country"
                    data-icod-id="src_pages_websiteintelligence_tsx_7ec6">
                    <select
                      value={formData.targetCountry}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetCountry: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      data-icod-id="src_pages_websiteintelligence_tsx_c8dd">
                      {COUNTRIES.map(c => (
                        <option
                          key={c.value}
                          value={c.value}
                          data-icod-id={`src_pages_websiteintelligence_tsx_8fb5_${c.value}`}>{c.label}</option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    label="Target Language"
                    data-icod-id="src_pages_websiteintelligence_tsx_4616">
                    <select
                      value={formData.targetLanguage}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetLanguage: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      data-icod-id="src_pages_websiteintelligence_tsx_a439">
                      {LANGUAGES.map(l => (
                        <option
                          key={l.value}
                          value={l.value}
                          data-icod-id={`src_pages_websiteintelligence_tsx_7cab_${l.value}`}>{l.label}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div
                  className="grid gap-5 md:grid-cols-2"
                  data-icod-id="src_pages_websiteintelligence_tsx_a496">
                  <Field
                    label="Business Type"
                    data-icod-id="src_pages_websiteintelligence_tsx_6324">
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      data-icod-id="src_pages_websiteintelligence_tsx_9f2a">
                      {BUSINESS_TYPES.map(b => (
                        <option
                          key={b.value}
                          value={b.value}
                          data-icod-id={`src_pages_websiteintelligence_tsx_bde2_${b.value}`}>{b.label}</option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    label="Primary Keyword (optional)"
                    hint="Main keyword you want to rank for"
                    data-icod-id="src_pages_websiteintelligence_tsx_30da">
                    <Input
                      type="text"
                      placeholder="e.g., digital marketing services"
                      value={formData.primaryKeyword}
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryKeyword: e.target.value }))}
                      data-icod-id="src_pages_websiteintelligence_tsx_f9f3" />
                  </Field>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  data-icod-id="src_pages_websiteintelligence_tsx_a2d0">
                  <Search
                    className="mr-2 h-5 w-5"
                    data-icod-id="src_pages_websiteintelligence_tsx_2cca" />
                  Start Website Audit
                </Button>
              </form>

              <div
                className="mt-6 rounded-lg bg-muted/50 p-4"
                data-icod-id="src_pages_websiteintelligence_tsx_7314">
                <p
                  className="text-xs text-muted-foreground"
                  data-icod-id="src_pages_websiteintelligence_tsx_f523">
                  <strong data-icod-id="src_pages_websiteintelligence_tsx_88fb">Note:</strong> This audit analyzes publicly accessible information only. 
                  No unauthorized access or intrusive scanning is performed. Results are based on 
                  best practices and industry standards.
                </p>
              </div>
            </Card>
          )}

          {/* Scanning Progress */}
          {status === 'scanning' && (
            <Card
              className="mx-auto max-w-2xl p-12 text-center"
              data-icod-id="src_pages_websiteintelligence_tsx_54e6">
              <div
                className="mb-6 flex justify-center"
                data-icod-id="src_pages_websiteintelligence_tsx_e620">
                <ScoreRing
                  score={progress}
                  size="lg"
                  data-icod-id="src_pages_websiteintelligence_tsx_9d4e" />
              </div>
              <h3
                className="text-xl font-semibold text-foreground"
                data-icod-id="src_pages_websiteintelligence_tsx_710f">Analyzing Website</h3>
              <p
                className="mt-2 text-muted-foreground"
                data-icod-id="src_pages_websiteintelligence_tsx_3bfb">{progressMessage}</p>
              <div
                className="mt-6 h-2 w-full overflow-hidden rounded-full bg-muted"
                data-icod-id="src_pages_websiteintelligence_tsx_b151">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                  data-icod-id="src_pages_websiteintelligence_tsx_59f6" />
              </div>
              <p
                className="mt-4 text-sm text-muted-foreground"
                data-icod-id="src_pages_websiteintelligence_tsx_8fc1">
                This may take 30-60 seconds depending on site complexity
              </p>
            </Card>
          )}

          {/* Audit Dashboard */}
          {status === 'complete' && result && (
            <div
              className="space-y-6"
              data-icod-id="src_pages_websiteintelligence_tsx_ad3f">
              {/* Top Bar */}
              <div
                className="flex flex-wrap items-center justify-between gap-4"
                data-icod-id="src_pages_websiteintelligence_tsx_1bb8">
                <div data-icod-id="src_pages_websiteintelligence_tsx_6475">
                  <div
                    className="flex items-center gap-2"
                    data-icod-id="src_pages_websiteintelligence_tsx_10a5">
                    <h2
                      className="text-xl font-bold text-foreground"
                      data-icod-id="src_pages_websiteintelligence_tsx_56b7">{result.website}</h2>
                    <a
                      href={result.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                      data-icod-id="src_pages_websiteintelligence_tsx_7b6d">
                      <ExternalLink className="h-4 w-4" data-icod-id="src_pages_websiteintelligence_tsx_d2ee" />
                    </a>
                  </div>
                  <p
                    className="text-sm text-muted-foreground"
                    data-icod-id="src_pages_websiteintelligence_tsx_2a25">
                    Audited on {new Date(result.auditDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div
                  className="flex gap-2"
                  data-icod-id="src_pages_websiteintelligence_tsx_6172">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    data-icod-id="src_pages_websiteintelligence_tsx_29e2">
                    <RefreshCw
                      className="mr-2 h-4 w-4"
                      data-icod-id="src_pages_websiteintelligence_tsx_6cf7" />
                    New Audit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    data-icod-id="src_pages_websiteintelligence_tsx_d2f6">
                    <Download
                      className="mr-2 h-4 w-4"
                      data-icod-id="src_pages_websiteintelligence_tsx_90d2" />
                    Export Report
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    data-icod-id="src_pages_websiteintelligence_tsx_3991">
                    <History
                      className="mr-2 h-4 w-4"
                      data-icod-id="src_pages_websiteintelligence_tsx_f005" />
                    History
                  </Button>
                </div>
              </div>

              {/* Overall Health Score */}
              <Card className="p-6" data-icod-id="src_pages_websiteintelligence_tsx_d1f5">
                <div
                  className="flex flex-col items-center gap-6 md:flex-row md:items-start"
                  data-icod-id="src_pages_websiteintelligence_tsx_4651">
                  <div
                    className="flex-shrink-0"
                    data-icod-id="src_pages_websiteintelligence_tsx_e535">
                    <ScoreRing
                      score={result.overallHealth}
                      size="lg"
                      label="Overall Health"
                      data-icod-id="src_pages_websiteintelligence_tsx_242d" />
                  </div>
                  <div className="flex-1" data-icod-id="src_pages_websiteintelligence_tsx_eadb">
                    <h3
                      className="text-lg font-semibold text-foreground"
                      data-icod-id="src_pages_websiteintelligence_tsx_6ff4">Overall Website Health</h3>
                    <p
                      className="mt-1 text-muted-foreground"
                      data-icod-id="src_pages_websiteintelligence_tsx_e2de">
                      Based on comprehensive analysis across 9 key categories
                    </p>
                    <div
                      className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
                      data-icod-id="src_pages_websiteintelligence_tsx_59b9">
                      {Object.entries(result.scores).map(([key, score]) => (
                        <div
                          key={key}
                          className="rounded-lg border border-border bg-muted/30 p-3"
                          data-icod-id={`src_pages_websiteintelligence_tsx_6ca8_${key}`}>
                          <div
                            className="flex items-center justify-between"
                            data-icod-id={`src_pages_websiteintelligence_tsx_f532_${key}`}>
                            <span
                              className="text-xs font-medium text-muted-foreground"
                              data-icod-id={`src_pages_websiteintelligence_tsx_45e0_${key}`}>{score.name}</span>
                            <span
                              className={cn(
                                'text-sm font-bold',
                                score.score >= 85 ? 'text-success' :
                                score.score >= 70 ? 'text-primary' :
                                score.score >= 50 ? 'text-warning' :
                                'text-destructive'
                              )}
                              data-icod-id={`src_pages_websiteintelligence_tsx_d1e8_${key}`}>
                              {score.score}/100
                            </span>
                          </div>
                          <div
                            className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                            data-icod-id={`src_pages_websiteintelligence_tsx_4006_${key}`}>
                            <div
                              className={cn(
                                'h-full rounded-full',
                                score.score >= 85 ? 'bg-success' :
                                score.score >= 70 ? 'bg-primary' :
                                score.score >= 50 ? 'bg-warning' :
                                'bg-destructive'
                              )}
                              style={{ width: `${score.score}%` }}
                              data-icod-id={`src_pages_websiteintelligence_tsx_d639_${key}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tabs */}
              <div
                className="flex flex-wrap gap-2 border-b border-border pb-1"
                data-icod-id="src_pages_websiteintelligence_tsx_ae65">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'technical', label: 'Technical SEO', icon: Code },
                  { id: 'onpage', label: 'On-Page SEO', icon: Search },
                  { id: 'content', label: 'Content', icon: FileText },
                  { id: 'performance', label: 'Performance', icon: Zap },
                  { id: 'mobile', label: 'Mobile', icon: Smartphone },
                  { id: 'schema', label: 'Schema', icon: Layers },
                  { id: 'aeo', label: 'AI Search Readiness', icon: Eye },
                  { id: 'keywords', label: 'Keywords', icon: Target },
                  { id: 'competitors', label: 'Competitors', icon: Users },
                  { id: 'backlinks', label: 'Backlinks', icon: LinkIcon },
                  { id: 'security', label: 'Security', icon: Shield },
                  { id: 'findings', label: 'Findings', icon: AlertTriangle },
                  { id: 'actionplan', label: 'Action Plan', icon: TrendingUp },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'border-b-2 border-primary bg-primary/5 text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    data-icod-id={`src_pages_websiteintelligence_tsx_8915_${tab.id}`}>
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div
                className="min-h-[400px]"
                data-icod-id="src_pages_websiteintelligence_tsx_7157">
                {activeTab === 'overview' && (
                  <div
                    className="space-y-6"
                    data-icod-id="src_pages_websiteintelligence_tsx_5afb">
                    {/* Score Breakdown */}
                    <div
                      className="grid gap-4 md:grid-cols-3"
                      data-icod-id="src_pages_websiteintelligence_tsx_1220">
                      {Object.entries(result.scores).slice(0, 6).map(([key, score]) => (
                        <Card
                          key={key}
                          className="p-5"
                          data-icod-id={`src_pages_websiteintelligence_tsx_f5ba_${key}`}>
                          <div
                            className="flex items-start justify-between"
                            data-icod-id={`src_pages_websiteintelligence_tsx_d193_${key}`}>
                            <div data-icod-id={`src_pages_websiteintelligence_tsx_967f_${key}`}>
                              <h4
                                className="font-semibold text-foreground"
                                data-icod-id={`src_pages_websiteintelligence_tsx_8690_${key}`}>{score.name}</h4>
                              <StatusBadge
                                status={score.status}
                                data-icod-id={`src_pages_websiteintelligence_tsx_cfab_${key}`} />
                            </div>
                            <ScoreRing
                              score={score.score}
                              size="sm"
                              data-icod-id={`src_pages_websiteintelligence_tsx_03e5_${key}`} />
                          </div>
                          <div
                            className="mt-4 space-y-1 text-sm"
                            data-icod-id={`src_pages_websiteintelligence_tsx_1fa4_${key}`}>
                            <div
                              className="flex justify-between"
                              data-icod-id={`src_pages_websiteintelligence_tsx_b966_${key}`}>
                              <span
                                className="text-muted-foreground"
                                data-icod-id={`src_pages_websiteintelligence_tsx_99b2_${key}`}>Critical Issues</span>
                              <span
                                className="font-medium text-destructive"
                                data-icod-id={`src_pages_websiteintelligence_tsx_fd97_${key}`}>{score.issues.critical}</span>
                            </div>
                            <div
                              className="flex justify-between"
                              data-icod-id={`src_pages_websiteintelligence_tsx_db7f_${key}`}>
                              <span
                                className="text-muted-foreground"
                                data-icod-id={`src_pages_websiteintelligence_tsx_555e_${key}`}>High Priority</span>
                              <span
                                className="font-medium text-warning"
                                data-icod-id={`src_pages_websiteintelligence_tsx_74aa_${key}`}>{score.issues.high}</span>
                            </div>
                            <div
                              className="flex justify-between"
                              data-icod-id={`src_pages_websiteintelligence_tsx_5512_${key}`}>
                              <span
                                className="text-muted-foreground"
                                data-icod-id={`src_pages_websiteintelligence_tsx_2ce6_${key}`}>Medium Priority</span>
                              <span
                                className="font-medium text-primary"
                                data-icod-id={`src_pages_websiteintelligence_tsx_f953_${key}`}>{score.issues.medium}</span>
                            </div>
                            <div
                              className="flex justify-between"
                              data-icod-id={`src_pages_websiteintelligence_tsx_e229_${key}`}>
                              <span
                                className="text-muted-foreground"
                                data-icod-id={`src_pages_websiteintelligence_tsx_98c4_${key}`}>Low Priority</span>
                              <span
                                className="font-medium text-muted-foreground"
                                data-icod-id={`src_pages_websiteintelligence_tsx_22e3_${key}`}>{score.issues.low}</span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Quick Stats */}
                    <Card className="p-6" data-icod-id="src_pages_websiteintelligence_tsx_9b36">
                      <h3
                        className="mb-4 text-lg font-semibold text-foreground"
                        data-icod-id="src_pages_websiteintelligence_tsx_2f50">Quick Summary</h3>
                      <div
                        className="grid gap-4 md:grid-cols-4"
                        data-icod-id="src_pages_websiteintelligence_tsx_8af6">
                        <div
                          className="rounded-lg bg-destructive/10 p-4"
                          data-icod-id="src_pages_websiteintelligence_tsx_17f9">
                          <p
                            className="text-sm text-muted-foreground"
                            data-icod-id="src_pages_websiteintelligence_tsx_19d3">Critical Issues</p>
                          <p
                            className="text-2xl font-bold text-destructive"
                            data-icod-id="src_pages_websiteintelligence_tsx_070d">
                            {Object.values(result.scores).reduce((sum, s) => sum + s.issues.critical, 0)}
                          </p>
                        </div>
                        <div
                          className="rounded-lg bg-warning/10 p-4"
                          data-icod-id="src_pages_websiteintelligence_tsx_100e">
                          <p
                            className="text-sm text-muted-foreground"
                            data-icod-id="src_pages_websiteintelligence_tsx_471c">High Priority</p>
                          <p
                            className="text-2xl font-bold text-warning"
                            data-icod-id="src_pages_websiteintelligence_tsx_828e">
                            {Object.values(result.scores).reduce((sum, s) => sum + s.issues.high, 0)}
                          </p>
                        </div>
                        <div
                          className="rounded-lg bg-primary/10 p-4"
                          data-icod-id="src_pages_websiteintelligence_tsx_60ed">
                          <p
                            className="text-sm text-muted-foreground"
                            data-icod-id="src_pages_websiteintelligence_tsx_b69a">Total Findings</p>
                          <p
                            className="text-2xl font-bold text-primary"
                            data-icod-id="src_pages_websiteintelligence_tsx_0a99">{result.findings.length}</p>
                        </div>
                        <div
                          className="rounded-lg bg-success/10 p-4"
                          data-icod-id="src_pages_websiteintelligence_tsx_b5c1">
                          <p
                            className="text-sm text-muted-foreground"
                            data-icod-id="src_pages_websiteintelligence_tsx_2950">Passed Checks</p>
                          <p
                            className="text-2xl font-bold text-success"
                            data-icod-id="src_pages_websiteintelligence_tsx_8540">
                            {result.findings.filter(f => f.severity === 'Info').length}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {activeTab === 'findings' && (
                  <div
                    className="space-y-4"
                    data-icod-id="src_pages_websiteintelligence_tsx_4b6f">
                    {/* Filters */}
                    <Card className="p-4" data-icod-id="src_pages_websiteintelligence_tsx_677a">
                      <div
                        className="flex flex-wrap gap-4"
                        data-icod-id="src_pages_websiteintelligence_tsx_bd73">
                        <div
                          className="flex items-center gap-2"
                          data-icod-id="src_pages_websiteintelligence_tsx_5d7c">
                          <Filter
                            className="h-4 w-4 text-muted-foreground"
                            data-icod-id="src_pages_websiteintelligence_tsx_f5d3" />
                          <span
                            className="text-sm font-medium text-foreground"
                            data-icod-id="src_pages_websiteintelligence_tsx_2123">Filters:</span>
                        </div>
                        <select
                          value={filterSeverity}
                          onChange={(e) => setFilterSeverity(e.target.value)}
                          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                          data-icod-id="src_pages_websiteintelligence_tsx_5246">
                          <option value="all" data-icod-id="src_pages_websiteintelligence_tsx_ee64">All Severities</option>
                          <option value="Critical" data-icod-id="src_pages_websiteintelligence_tsx_4eb1">Critical</option>
                          <option value="High" data-icod-id="src_pages_websiteintelligence_tsx_5a07">High</option>
                          <option value="Medium" data-icod-id="src_pages_websiteintelligence_tsx_9679">Medium</option>
                          <option value="Low" data-icod-id="src_pages_websiteintelligence_tsx_b9d9">Low</option>
                          <option value="Info" data-icod-id="src_pages_websiteintelligence_tsx_b982">Info</option>
                        </select>
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                          data-icod-id="src_pages_websiteintelligence_tsx_1fc2">
                          <option value="all" data-icod-id="src_pages_websiteintelligence_tsx_5c97">All Categories</option>
                          {categories.map(cat => (
                            <option
                              key={cat}
                              value={cat}
                              data-icod-id={`src_pages_websiteintelligence_tsx_a9f6_${cat}`}>{cat}</option>
                          ))}
                        </select>
                        <span
                          className="ml-auto text-sm text-muted-foreground"
                          data-icod-id="src_pages_websiteintelligence_tsx_389f">
                          Showing {filteredFindings.length} of {result.findings.length} findings
                        </span>
                      </div>
                    </Card>

                    {/* Findings List */}
                    <div
                      className="space-y-3"
                      data-icod-id="src_pages_websiteintelligence_tsx_f008">
                      {filteredFindings.map((finding) => (
                        <Card
                          key={finding.id}
                          className="overflow-hidden"
                          data-icod-id={`src_pages_websiteintelligence_tsx_780a_${finding.id}`}>
                          <div
                            className="flex cursor-pointer items-start gap-4 p-4 hover:bg-muted/30"
                            onClick={() => setExpandedFinding(expandedFinding === finding.id ? null : finding.id)}
                            data-icod-id={`src_pages_websiteintelligence_tsx_0398_${finding.id}`}>
                            <SeverityBadge
                              severity={finding.severity}
                              data-icod-id={`src_pages_websiteintelligence_tsx_1a69_${finding.id}`} />
                            <div
                              className="flex-1"
                              data-icod-id={`src_pages_websiteintelligence_tsx_170f_${finding.id}`}>
                              <div
                                className="flex items-start justify-between"
                                data-icod-id={`src_pages_websiteintelligence_tsx_37ed_${finding.id}`}>
                                <div data-icod-id={`src_pages_websiteintelligence_tsx_39b5_${finding.id}`}>
                                  <h4
                                    className="font-medium text-foreground"
                                    data-icod-id={`src_pages_websiteintelligence_tsx_2cfd_${finding.id}`}>{finding.problem}</h4>
                                  <p
                                    className="mt-1 text-sm text-muted-foreground"
                                    data-icod-id={`src_pages_websiteintelligence_tsx_ea71_${finding.id}`}>{finding.category} • {finding.url}</p>
                                </div>
                                {expandedFinding === finding.id ? (
                                  <ChevronUp
                                    className="h-5 w-5 text-muted-foreground"
                                    data-icod-id={`src_pages_websiteintelligence_tsx_66d1_${finding.id}`} />
                                ) : (
                                  <ChevronDown
                                    className="h-5 w-5 text-muted-foreground"
                                    data-icod-id={`src_pages_websiteintelligence_tsx_b9e5_${finding.id}`} />
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {expandedFinding === finding.id && (
                            <div
                              className="border-t border-border bg-muted/20 p-4"
                              data-icod-id={`src_pages_websiteintelligence_tsx_8cb7_${finding.id}`}>
                              <div
                                className="grid gap-4 md:grid-cols-2"
                                data-icod-id={`src_pages_websiteintelligence_tsx_9848_${finding.id}`}>
                                <div data-icod-id={`src_pages_websiteintelligence_tsx_eeb6_${finding.id}`}>
                                  <h5
                                    className="mb-1 text-xs font-semibold uppercase text-muted-foreground"
                                    data-icod-id={`src_pages_websiteintelligence_tsx_cb33_${finding.id}`}>Evidence</h5>
                                  <p
                                    className="text-sm text-foreground"
                                    data-icod-id={`src_pages_websiteintelligence_tsx_fdb2_${finding.id}`}>{finding.evidence}</p>
                                </div>
                                <div data-icod-id={`src_pages_websiteintelligence_tsx_f20a_${finding.id}`}>
                                  <h5
                                    className="mb-1 text-xs font-semibold uppercase text-muted-foreground"
                                    data-icod-id={`src_pages_websiteintelligence_tsx_ad5b_${finding.id}`}>Impact</h5>
                                  <p
                                    className="text-sm text-foreground"
                                    data-icod-id={`src_pages_websiteintelligence_tsx_824d_${finding.id}`}>{finding.impact}</p>
                                </div>
                                <div
                                  className="md:col-span-2"
                                  data-icod-id={`src_pages_websiteintelligence_tsx_613a_${finding.id}`}>
                                  <h5
                                    className="mb-1 text-xs font-semibold uppercase text-muted-foreground"
                                    data-icod-id={`src_pages_websiteintelligence_tsx_11a8_${finding.id}`}>Recommended Solution</h5>
                                  <p
                                    className="text-sm text-foreground"
                                    data-icod-id={`src_pages_websiteintelligence_tsx_65a8_${finding.id}`}>{finding.solution}</p>
                                </div>
                              </div>
                              <div
                                className="mt-4 flex gap-2"
                                data-icod-id={`src_pages_websiteintelligence_tsx_1b8a_${finding.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  data-icod-id={`src_pages_websiteintelligence_tsx_bdc0_${finding.id}`}>
                                  <Wrench
                                    className="mr-1.5 h-3.5 w-3.5"
                                    data-icod-id={`src_pages_websiteintelligence_tsx_d509_${finding.id}`} />
                                  Generate Fix
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  data-icod-id={`src_pages_websiteintelligence_tsx_2cf3_${finding.id}`}>
                                  <Copy
                                    className="mr-1.5 h-3.5 w-3.5"
                                    data-icod-id={`src_pages_websiteintelligence_tsx_d638_${finding.id}`} />
                                  Copy Solution
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  data-icod-id={`src_pages_websiteintelligence_tsx_f13d_${finding.id}`}>
                                  Mark Resolved
                                </Button>
                              </div>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'actionplan' && (
                  <Card className="p-6" data-icod-id="src_pages_websiteintelligence_tsx_53e8">
                    <h3
                      className="mb-6 text-lg font-semibold text-foreground"
                      data-icod-id="src_pages_websiteintelligence_tsx_99e0">Recommended Action Plan</h3>
                    <div
                      className="space-y-4"
                      data-icod-id="src_pages_websiteintelligence_tsx_e6b0">
                      {result.recommendations.map((rec, idx) => (
                        <div
                          key={idx}
                          className="flex gap-4 rounded-lg border border-border p-4"
                          data-icod-id={`src_pages_websiteintelligence_tsx_02a3_${idx}`}>
                          <div
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary"
                            data-icod-id={`src_pages_websiteintelligence_tsx_4586_${idx}`}>
                            {rec.rank}
                          </div>
                          <div
                            className="flex-1"
                            data-icod-id={`src_pages_websiteintelligence_tsx_b0b0_${idx}`}>
                            <h4
                              className="font-medium text-foreground"
                              data-icod-id={`src_pages_websiteintelligence_tsx_bb39_${idx}`}>{rec.title}</h4>
                            <div
                              className="mt-2 flex flex-wrap gap-3 text-sm"
                              data-icod-id={`src_pages_websiteintelligence_tsx_3b74_${idx}`}>
                              <span
                                className="flex items-center gap-1 text-muted-foreground"
                                data-icod-id={`src_pages_websiteintelligence_tsx_71ce_${idx}`}>
                                <TrendingUp
                                  className="h-3.5 w-3.5"
                                  data-icod-id={`src_pages_websiteintelligence_tsx_a3fb_${idx}`} />
                                Impact: {rec.impact}
                              </span>
                              <span
                                className="flex items-center gap-1 text-muted-foreground"
                                data-icod-id={`src_pages_websiteintelligence_tsx_0c34_${idx}`}>
                                <Activity
                                  className="h-3.5 w-3.5"
                                  data-icod-id={`src_pages_websiteintelligence_tsx_7229_${idx}`} />
                                Effort: {rec.effort}
                              </span>
                              <span
                                className={cn(
                                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                                  rec.priority === 'High' ? 'bg-destructive/20 text-destructive' : 
                                  rec.priority === 'Medium' ? 'bg-warning/20 text-warning' : 
                                  'bg-muted text-muted-foreground'
                                )}
                                data-icod-id={`src_pages_websiteintelligence_tsx_c9dc_${idx}`}>
                                {rec.priority} Priority
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Placeholder for other tabs */}
                {['technical', 'onpage', 'content', 'performance', 'mobile', 'schema', 'aeo', 'keywords', 'competitors', 'backlinks', 'security'].includes(activeTab) && (
                  <EmptyState
                    icon={BarChart3}
                    title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Analysis`}
                    description={`Detailed ${activeTab} analysis will be displayed here with specific findings, recommendations, and actionable insights.`}
                    data-icod-id="src_pages_websiteintelligence_tsx_76dd" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Mock Data Generators ─────────────────────────────────────────────────

function generateMockFindings(url: string): Finding[] {
  return [
    {
      id: '1',
      severity: 'Critical',
      category: 'Technical SEO',
      url: `${url}/`,
      problem: 'Missing canonical tag on homepage',
      evidence: 'No <link rel="canonical"> tag found in page head',
      impact: 'Search engines may index duplicate versions of your pages, diluting ranking signals',
      solution: 'Add <link rel="canonical" href="https://example.com/" /> to the <head> section',
      priority: 95,
    },
    {
      id: '2',
      severity: 'Critical',
      category: 'Schema',
      url: `${url}/`,
      problem: 'No Organization schema markup detected',
      evidence: 'No JSON-LD or microdata schema found for Organization type',
      impact: 'Search engines cannot understand your business entity, reducing rich snippet eligibility',
      solution: 'Add Organization schema with name, logo, contact info, and social profiles',
      priority: 90,
    },
    {
      id: '3',
      severity: 'High',
      category: 'Performance',
      url: `${url}/`,
      problem: 'Large unoptimized images detected',
      evidence: 'Multiple images exceed 500KB without modern format compression',
      impact: 'Slower page load times affect user experience and Core Web Vitals scores',
      solution: 'Convert images to WebP/AVIF format and implement responsive image sizing',
      priority: 85,
    },
    {
      id: '4',
      severity: 'High',
      category: 'On-Page SEO',
      url: `${url}/about`,
      problem: 'Meta description too short',
      evidence: 'Meta description is 45 characters (recommended: 150-160)',
      impact: 'Reduced click-through rates from search results due to incomplete descriptions',
      solution: 'Expand meta description to 150-160 characters with compelling copy and keywords',
      priority: 80,
    },
    {
      id: '5',
      severity: 'Medium',
      category: 'Content',
      url: `${url}/services`,
      problem: 'Thin content on service pages',
      evidence: 'Service pages average 150 words (recommended: 500+ for competitive topics)',
      impact: 'Insufficient content depth may fail to rank for target keywords',
      solution: 'Expand service descriptions with detailed explanations, benefits, and FAQs',
      priority: 70,
    },
    {
      id: '6',
      severity: 'Medium',
      category: 'AEO',
      url: `${url}/`,
      problem: 'Missing FAQ section for common queries',
      evidence: 'No FAQ schema or question-based headings found on key pages',
      impact: 'Missed opportunities for featured snippets and AI-generated answers',
      solution: 'Add FAQ sections with schema markup addressing common customer questions',
      priority: 65,
    },
    {
      id: '7',
      severity: 'Low',
      category: 'Internal Links',
      url: `${url}/blog/post-1`,
      problem: 'Orphan page detected',
      evidence: 'Page has no incoming internal links from other site pages',
      impact: 'Search engines may have difficulty discovering and ranking this page',
      solution: 'Add contextual internal links from relevant pages to this content',
      priority: 50,
    },
    {
      id: '8',
      severity: 'Info',
      category: 'Security',
      url: `${url}/`,
      problem: 'HTTPS properly configured',
      evidence: 'Valid SSL certificate with strong cipher suites',
      impact: 'Site is secure and trusted by browsers and search engines',
      solution: 'Continue monitoring certificate expiration and security headers',
      priority: 10,
    },
  ];
}

function generateMockRecommendations() {
  return [
    { rank: 1, title: 'Fix missing canonical tags across all pages', impact: 'High', effort: 'Quick', priority: 'High' },
    { rank: 2, title: 'Implement Organization and LocalBusiness schema', impact: 'High', effort: 'Moderate', priority: 'High' },
    { rank: 3, title: 'Optimize and compress all images', impact: 'High', effort: 'Moderate', priority: 'High' },
    { rank: 4, title: 'Expand thin content on service pages', impact: 'Medium', effort: 'Extensive', priority: 'Medium' },
    { rank: 5, title: 'Add FAQ sections with schema markup', impact: 'Medium', effort: 'Moderate', priority: 'Medium' },
    { rank: 6, title: 'Improve internal linking structure', impact: 'Medium', effort: 'Moderate', priority: 'Medium' },
    { rank: 7, title: 'Optimize meta descriptions across all pages', impact: 'Medium', effort: 'Quick', priority: 'Low' },
    { rank: 8, title: 'Implement breadcrumb navigation with schema', impact: 'Low', effort: 'Quick', priority: 'Low' },
    { rank: 9, title: 'Add author information for E-E-A-T signals', impact: 'Medium', effort: 'Quick', priority: 'Medium' },
    { rank: 10, title: 'Create topic clusters for core service areas', impact: 'High', effort: 'Extensive', priority: 'Medium' },
  ];
}
