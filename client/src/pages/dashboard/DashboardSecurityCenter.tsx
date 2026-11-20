import { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  FileText,
  History,
  Server,
  Globe,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button, Card, Badge, Input, Spinner, Alert, EmptyState } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  startSecurityScan,
  getScanStatus,
  getScanDetails,
  getScanHistory,
  getScanReport,
} from '@/services/securityAuditService';
import { extractErrorMessage } from '@/utils/errorHandler';
import type {
  SecurityFinding,
  FindingSeverity,
  SecurityScanHistoryItem,
  SecurityScanDetails,
} from '@/types';

// ─── Tab Types ──────────────────────────────────────────────────────────────

type TabId = 'audit' | 'planner' | 'recon' | 'ports' | 'webauditor' | 'reporter' | 'history';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const TABS: TabConfig[] = [
  { id: 'audit', label: 'Security Audit', icon: Shield },
  { id: 'planner', label: 'Security Planner', icon: Lock },
  { id: 'recon', label: 'Recon', icon: Search },
  { id: 'ports', label: 'Port Scanner', icon: Server },
  { id: 'webauditor', label: 'Web Auditor', icon: Globe },
  { id: 'reporter', label: 'Reporter', icon: FileText },
  { id: 'history', label: 'Scan History', icon: History },
];

// ─── Severity Helpers ───────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<FindingSeverity, string> = {
  Critical: 'bg-destructive text-primary-foreground',
  High: 'bg-destructive/80 text-primary-foreground',
  Medium: 'bg-warning text-foreground',
  Low: 'bg-accent text-accent-foreground',
  Informational: 'bg-muted text-muted-foreground',
};

const SEVERITY_ORDER: FindingSeverity[] = ['Critical', 'High', 'Medium', 'Low', 'Informational'];

function getSeverityColor(severity: FindingSeverity): string {
  return SEVERITY_COLORS[severity] || 'bg-muted text-muted-foreground';
}

// ─── Security Planner Checklist Items ───────────────────────────────────────

interface PlannerItem {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  checked: boolean;
}

const INITIAL_PLANNER_ITEMS: PlannerItem[] = [
  {
    id: 'https',
    category: 'Transport Security',
    title: 'Enable HTTPS/TLS',
    description: 'Ensure all traffic is encrypted with valid SSL/TLS certificates',
    priority: 'critical',
    checked: false,
  },
  {
    id: 'csp',
    category: 'Headers',
    title: 'Content Security Policy (CSP)',
    description: 'Implement CSP headers to prevent XSS and data injection attacks',
    priority: 'high',
    checked: false,
  },
  {
    id: 'cors',
    category: 'Access Control',
    title: 'Configure CORS Properly',
    description: 'Restrict cross-origin requests to trusted domains only',
    priority: 'high',
    checked: false,
  },
  {
    id: 'rate-limiting',
    category: 'API Security',
    title: 'Implement Rate Limiting',
    description: 'Protect against brute force and DDoS attacks with rate limits',
    priority: 'high',
    checked: false,
  },
  {
    id: 'input-validation',
    category: 'Input Handling',
    title: 'Validate All Inputs',
    description: 'Sanitize and validate user inputs server-side to prevent injection',
    priority: 'critical',
    checked: false,
  },
  {
    id: 'deps-update',
    category: 'Maintenance',
    title: 'Update Dependencies',
    description: 'Regularly update packages and audit for known vulnerabilities',
    priority: 'medium',
    checked: false,
  },
  {
    id: 'auth-mfa',
    category: 'Authentication',
    title: 'Multi-Factor Authentication',
    description: 'Enable MFA for all user accounts, especially admin accounts',
    priority: 'critical',
    checked: false,
  },
  {
    id: 'session-mgmt',
    category: 'Session Management',
    title: 'Secure Session Handling',
    description: 'Use secure, httpOnly cookies with proper expiration',
    priority: 'high',
    checked: false,
  },
  {
    id: 'error-handling',
    category: 'Error Handling',
    title: 'Safe Error Messages',
    description: 'Never expose stack traces or internal details in production errors',
    priority: 'medium',
    checked: false,
  },
  {
    id: 'logging',
    category: 'Monitoring',
    title: 'Security Logging',
    description: 'Log authentication attempts, access patterns, and security events',
    priority: 'medium',
    checked: false,
  },
];

// ─── Port Scanner Configuration ─────────────────────────────────────────────

interface PortInfo {
  port: number;
  service: string;
  status: 'open' | 'closed' | 'filtered' | 'unknown';
  details?: string;
}

const COMMON_PORTS = [21, 22, 23, 25, 53, 80, 443, 3306, 5432, 8080, 8443];

const PORT_SERVICE_MAP: Record<number, string> = {
  21: 'FTP',
  22: 'SSH',
  23: 'Telnet',
  25: 'SMTP',
  53: 'DNS',
  80: 'HTTP',
  443: 'HTTPS',
  3306: 'MySQL',
  5432: 'PostgreSQL',
  8080: 'HTTP Proxy',
  8443: 'HTTPS Alt',
};

// ─── Recon Data Types ───────────────────────────────────────────────────────

interface ReconData {
  domain: string;
  dns: {
    a: string[];
    mx: string[];
    ns: string[];
    txt: string[];
  };
  tls: {
    issuer: string;
    subject: string;
    validFrom: string;
    validTo: string;
    protocol: string;
    cipher: string;
  } | null;
  headers: Record<string, { present: boolean; value?: string }>;
}

// ─── Web Auditor Checks ─────────────────────────────────────────────────────

interface WebAuditCheck {
  id: string;
  name: string;
  category: 'xss' | 'csrf' | 'sqli' | 'cookies' | 'auth' | 'headers';
  status: 'pass' | 'fail' | 'warning' | 'pending';
  details: string;
}

const WEB_AUDIT_CHECKS: WebAuditCheck[] = [
  { id: 'xss-reflected', name: 'Reflected XSS Protection', category: 'xss', status: 'pending', details: '' },
  { id: 'xss-stored', name: 'Stored XSS Protection', category: 'xss', status: 'pending', details: '' },
  { id: 'csrf-token', name: 'CSRF Token Implementation', category: 'csrf', status: 'pending', details: '' },
  { id: 'csrf-cookie', name: 'SameSite Cookie Attribute', category: 'csrf', status: 'pending', details: '' },
  { id: 'sqli-basic', name: 'Basic SQL Injection Vectors', category: 'sqli', status: 'pending', details: '' },
  { id: 'sqli-blind', name: 'Blind SQL Injection', category: 'sqli', status: 'pending', details: '' },
  { id: 'cookie-secure', name: 'Secure Cookie Flag', category: 'cookies', status: 'pending', details: '' },
  { id: 'cookie-httponly', name: 'HttpOnly Cookie Flag', category: 'cookies', status: 'pending', details: '' },
  { id: 'auth-jwt', name: 'JWT Token Security', category: 'auth', status: 'pending', details: '' },
  { id: 'auth-session', name: 'Session Management', category: 'auth', status: 'pending', details: '' },
  { id: 'header-xframe', name: 'X-Frame-Options Header', category: 'headers', status: 'pending', details: '' },
  { id: 'header-hsts', name: 'HSTS Header', category: 'headers', status: 'pending', details: '' },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export default function DashboardSecurityCenter() {
  const [activeTab, setActiveTab] = useState<TabId>('audit');

  return (
    <div
      className="space-y-6"
      data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_5504">
      {/* Header */}
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_535c">
        <div data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_9de1">
          <h1
            className="text-2xl font-bold text-foreground"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_a29e">Security Center</h1>
          <p
            className="text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_7369">
            Comprehensive security scanning and hardening tools
          </p>
        </div>
        <div
          className="flex items-center gap-2"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_9f85">
          <Shield
            className="h-8 w-8 text-primary"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_8088" />
        </div>
      </div>
      {/* Tabs Navigation */}
      <Card
        className="p-1"
        data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_7f3e">
        <div
          className="flex flex-wrap gap-1"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_70dc">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_034d_${tab.id}`}>
                <Icon
                  className="h-4 w-4"
                  data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_54d6_${tab.id}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </Card>
      {/* Tab Content */}
      <div
        className="min-h-[400px]"
        data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_5e9d">
        {activeTab === 'audit' && <SecurityAuditTab data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_a71b" />}
        {activeTab === 'planner' && <SecurityPlannerTab data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_122d" />}
        {activeTab === 'recon' && <ReconTab data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_ae4f" />}
        {activeTab === 'ports' && <PortScannerTab data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_5225" />}
        {activeTab === 'webauditor' && <WebAuditorTab data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_6757" />}
        {activeTab === 'reporter' && <ReporterTab data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_dc30" />}
        {activeTab === 'history' && <ScanHistoryTab data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_8b0b" />}
      </div>
    </div>
  );
}

// ─── Security Audit Tab ─────────────────────────────────────────────────────

function SecurityAuditTab() {
  const [targetUrl, setTargetUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [findings, setFindings] = useState<SecurityFinding[]>([]);
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartScan = async () => {
    if (!targetUrl.trim()) {
      setError('Please enter a target URL');
      return;
    }

    setError(null);
    setIsScanning(true);
    setFindings([]);
    setScanProgress(0);

    try {
      const result = await startSecurityScan(targetUrl, true);
      setScanId(result.scanId);
      pollScanStatus(result.scanId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start scan');
      setIsScanning(false);
    }
  };

  const pollScanStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await getScanStatus(id);
        setScanProgress(status.progress);
        setScanStatus(status.statusMessage);

        if (status.status === 'completed') {
          clearInterval(interval);
          setIsScanning(false);
          fetchScanResults(id);
        } else if (status.status === 'failed') {
          clearInterval(interval);
          setIsScanning(false);
          setError('Scan failed. Please try again.');
        }
      } catch (err) {
        clearInterval(interval);
        setIsScanning(false);
        setError('Lost connection to scan');
      }
    }, 2000);
  };

  const fetchScanResults = async (id: string) => {
    try {
      const details = await getScanDetails(id);
      setFindings(details.findings);
    } catch (err) {
      setError('Failed to fetch scan results');
    }
  };

  const findingsBySeverity = SEVERITY_ORDER.reduce((acc, severity) => {
    acc[severity] = findings.filter((f) => f.severity === severity);
    return acc;
  }, {} as Record<FindingSeverity, SecurityFinding[]>);

  return (
    <div
      className="space-y-6"
      data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_1d10">
      {/* Scan Input */}
      <Card
        className="p-6"
        data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_5275">
        <h2
          className="mb-4 text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_4b65">Run Security Audit</h2>
        <div
          className="flex gap-4"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_6705">
          <div
            className="flex-1"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_84a6">
            <Input
              type="url"
              placeholder="https://example.com"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              disabled={isScanning}
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_fb2c" />
          </div>
          <Button
            onClick={handleStartScan}
            disabled={isScanning}
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_75dd">
            {isScanning ? (
              <>
                <Spinner
                  size="sm"
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_da93" />
                <span
                  className="ml-2"
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_2263">Scanning...</span>
              </>
            ) : (
              <>
                <Search
                  className="mr-2 h-4 w-4"
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_7031" />
                Start Scan
              </>
            )}
          </Button>
        </div>
        {error && (
          <Alert
            variant="error"
            className="mt-4"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_4800">
            {error}
          </Alert>
        )}
      </Card>
      {/* Scan Progress */}
      {isScanning && (
        <Card
          className="p-6"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_6b38">
          <div
            className="space-y-3"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_3446">
            <div
              className="flex items-center justify-between"
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_2d18">
              <span
                className="text-sm font-medium text-foreground"
                data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_3062">{scanStatus}</span>
              <span
                className="text-sm text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_28b5">{scanProgress}%</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-muted"
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_622d">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
                data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_50bc" />
            </div>
          </div>
        </Card>
      )}
      {/* Findings Summary */}
      {findings.length > 0 && (
        <>
          <Card
            className="p-6"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_f630">
            <h3
              className="mb-4 text-lg font-semibold text-foreground"
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_9fe4">Findings Summary</h3>
            <div
              className="grid grid-cols-2 gap-4 sm:grid-cols-5"
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_add9">
              {SEVERITY_ORDER.map((severity) => {
                const count = findingsBySeverity[severity]?.length || 0;
                if (count === 0) return null;
                return (
                  <div
                    key={severity}
                    className="rounded-lg border border-border bg-muted p-3 text-center"
                    data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_631d_${severity}`}>
                    <div
                      className={cn('mb-1 text-2xl font-bold', getSeverityColor(severity).split(' ')[1])}
                      data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_4d37_${severity}`}>
                      {count}
                    </div>
                    <div
                      className="text-xs text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_9812_${severity}`}>{severity}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Findings List */}
          <div
            className="space-y-3"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_376f">
            {SEVERITY_ORDER.map((severity) => {
              const severityFindings = findingsBySeverity[severity];
              if (!severityFindings || severityFindings.length === 0) return null;

              return (
                <div
                  key={severity}
                  className="space-y-2"
                  data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_552d_${severity}`}>
                  <h4
                    className="flex items-center gap-2 text-sm font-semibold text-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_0a7b_${severity}`}>
                    <Badge
                      className={getSeverityColor(severity)}
                      data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_ad9f_${severity}`}>{severity}</Badge>
                    <span
                      className="text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_f7ce_${severity}`}>({severityFindings.length})</span>
                  </h4>
                  {severityFindings.map((finding) => (
                    <Card
                      key={finding.id}
                      className="overflow-hidden"
                      data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_7306_${severity}_${finding.id}`}>
                      <button
                        onClick={() =>
                          setExpandedFinding(expandedFinding === finding.id ? null : finding.id)
                        }
                        className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50"
                        data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_cc6b_${severity}_${finding.id}`}>
                        <div
                          className="flex-1"
                          data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_f20f_${severity}_${finding.id}`}>
                          <h5
                            className="font-medium text-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_ea62_${severity}_${finding.id}`}>{finding.title}</h5>
                          <p
                            className="text-sm text-muted-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_bfb0_${severity}_${finding.id}`}>{finding.target}</p>
                        </div>
                        {expandedFinding === finding.id ? (
                          <ChevronUp
                            className="h-4 w-4 text-muted-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_609c_${severity}_${finding.id}`} />
                        ) : (
                          <ChevronDown
                            className="h-4 w-4 text-muted-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_e3de_${severity}_${finding.id}`} />
                        )}
                      </button>
                      {expandedFinding === finding.id && (
                        <div
                          className="border-t border-border bg-muted/30 p-4 space-y-3"
                          data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_3877_${severity}_${finding.id}`}>
                          <div
                            data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_e3e3_${severity}_${finding.id}`}>
                            <h6
                              className="text-xs font-semibold uppercase text-muted-foreground"
                              data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_f01e_${severity}_${finding.id}`}>Evidence</h6>
                            <p
                              className="text-sm text-foreground"
                              data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_f655_${severity}_${finding.id}`}>{finding.evidence}</p>
                          </div>
                          <div
                            data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_bdef_${severity}_${finding.id}`}>
                            <h6
                              className="text-xs font-semibold uppercase text-muted-foreground"
                              data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_07d7_${severity}_${finding.id}`}>Impact</h6>
                            <p
                              className="text-sm text-foreground"
                              data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_6543_${severity}_${finding.id}`}>{finding.impact}</p>
                          </div>
                          <div
                            data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_1ece_${severity}_${finding.id}`}>
                            <h6
                              className="text-xs font-semibold uppercase text-muted-foreground"
                              data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_0c9f_${severity}_${finding.id}`}>Remediation</h6>
                            <p
                              className="text-sm text-foreground"
                              data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_fbf6_${severity}_${finding.id}`}>{finding.remediation}</p>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}
      {!isScanning && findings.length === 0 && !error && (
        <EmptyState
          icon={Shield}
          title="No Scan Results"
          description="Enter a target URL and start a security audit to see findings"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_605c" />
      )}
    </div>
  );
}

// ─── Security Planner Tab ───────────────────────────────────────────────────

function SecurityPlannerTab() {
  const [items, setItems] = useState<PlannerItem[]>(INITIAL_PLANNER_ITEMS);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const completedCount = items.filter((i) => i.checked).length;
  const progress = Math.round((completedCount / items.length) * 100);

  const itemsByPriority = {
    critical: items.filter((i) => i.priority === 'critical'),
    high: items.filter((i) => i.priority === 'high'),
    medium: items.filter((i) => i.priority === 'medium'),
    low: items.filter((i) => i.priority === 'low'),
  };

  const PRIORITY_COLORS = {
    critical: 'bg-destructive text-primary-foreground',
    high: 'bg-warning text-foreground',
    medium: 'bg-accent text-accent-foreground',
    low: 'bg-muted text-muted-foreground',
  };

  return (
    <div
      className="space-y-6"
      data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_9915">
      {/* Progress Overview */}
      <Card
        className="p-6"
        data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_50b2">
        <div
          className="flex items-center justify-between mb-4"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_43ce">
          <h2
            className="text-lg font-semibold text-foreground"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_1600">Hardening Progress</h2>
          <span
            className="text-2xl font-bold text-primary"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_04b6">{progress}%</span>
        </div>
        <div
          className="h-3 overflow-hidden rounded-full bg-muted"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_53ce">
          <div
            className="h-full rounded-full bg-success transition-all duration-500"
            style={{ width: `${progress}%` }}
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_3268" />
        </div>
        <p
          className="mt-2 text-sm text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_7f5c">
          {completedCount} of {items.length} security measures implemented
        </p>
      </Card>
      {/* Checklist by Priority */}
      {(Object.keys(itemsByPriority) as Array<keyof typeof itemsByPriority>).map((priority) => {
        const priorityItems = itemsByPriority[priority];
        if (priorityItems.length === 0) return null;

        return (
          <div
            key={priority}
            className="space-y-3"
            data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_8f43_${priority}`}>
            <div
              className="flex items-center gap-2"
              data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_8353_${priority}`}>
              <Badge
                className={PRIORITY_COLORS[priority]}
                data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_82f5_${priority}`}>{priority.toUpperCase()}</Badge>
              <h3
                className="text-sm font-semibold text-foreground capitalize"
                data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_9a4a_${priority}`}>{priority} Priority</h3>
            </div>
            <div
              className="space-y-2"
              data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_d085_${priority}`}>
              {priorityItems.map((item) => (
                <Card
                  key={item.id}
                  className={cn(
                    'cursor-pointer transition-all hover:border-primary/50',
                    item.checked && 'border-success/50 bg-success/5'
                  )}
                  onClick={() => toggleItem(item.id)}
                  data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_6a92_${priority}_${item.id}`}>
                  <div
                    className="flex items-start gap-3 p-4"
                    data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_3b30_${priority}_${item.id}`}>
                    <div
                      className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                        item.checked
                          ? 'border-success bg-success text-primary-foreground'
                          : 'border-border bg-background'
                      )}
                      data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_b106_${priority}_${item.id}`}>
                      {item.checked && <CheckCircle
                        className="h-3.5 w-3.5"
                        data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_7296_${priority}_${item.id}`} />}
                    </div>
                    <div
                      className="flex-1"
                      data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_9ca8_${priority}_${item.id}`}>
                      <h4
                        className={cn(
                          'font-medium',
                          item.checked ? 'text-muted-foreground line-through' : 'text-foreground'
                        )}
                        data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_61d1_${priority}_${item.id}`}>
                        {item.title}
                      </h4>
                      <p
                        className="text-sm text-muted-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_7f73_${priority}_${item.id}`}>{item.description}</p>
                      <p
                        className="mt-1 text-xs text-muted-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_f740_${priority}_${item.id}`}>Category: {item.category}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Recon Tab ──────────────────────────────────────────────────────────────

function ReconTab() {
  const [domain, setDomain] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [reconData, setReconData] = useState<ReconData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRecon = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain');
      return;
    }

    setError(null);
    setIsScanning(true);
    setReconData(null);

    // Simulate recon scan (would call backend API in production)
    setTimeout(() => {
      setReconData({
        domain,
        dns: {
          a: ['192.0.2.1', '192.0.2.2'],
          mx: ['mail.example.com', 'backup-mail.example.com'],
          ns: ['ns1.example.com', 'ns2.example.com'],
          txt: ['v=spf1 include:_spf.google.com ~all', 'google-site-verification=abc123'],
        },
        tls: {
          issuer: "Let's Encrypt Authority X3",
          subject: domain,
          validFrom: '2024-01-15T00:00:00Z',
          validTo: '2024-04-14T23:59:59Z',
          protocol: 'TLS 1.3',
          cipher: 'TLS_AES_256_GCM_SHA384',
        },
        headers: {
          'Strict-Transport-Security': { present: true, value: 'max-age=31536000; includeSubDomains' },
          'X-Frame-Options': { present: true, value: 'DENY' },
          'X-Content-Type-Options': { present: true, value: 'nosniff' },
          'Content-Security-Policy': { present: false },
          'X-XSS-Protection': { present: true, value: '1; mode=block' },
          'Referrer-Policy': { present: true, value: 'strict-origin-when-cross-origin' },
          'Permissions-Policy': { present: false },
        },
      });
      setIsScanning(false);
    }, 1500);
  };

  return (
    <div
      className="space-y-6"
      data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_a3c9">
      {/* Domain Input */}
      <Card
        className="p-6"
        data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_ff3b">
        <h2
          className="mb-4 text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_d20e">Domain Reconnaissance</h2>
        <div
          className="flex gap-4"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_d871">
          <div
            className="flex-1"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_243b">
            <Input
              type="text"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              disabled={isScanning}
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_f89c" />
          </div>
          <Button
            onClick={handleRecon}
            disabled={isScanning}
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_99a6">
            {isScanning ? (
              <>
                <Spinner
                  size="sm"
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_a1c9" />
                <span
                  className="ml-2"
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_c9ed">Scanning...</span>
              </>
            ) : (
              <>
                <Search
                  className="mr-2 h-4 w-4"
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_2584" />
                Run Recon
              </>
            )}
          </Button>
        </div>
        {error && (
          <Alert
            variant="error"
            className="mt-4"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_d471">
            {error}
          </Alert>
        )}
      </Card>
      {/* Results */}
      {reconData && (
        <div
          className="space-y-6"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_f0d8">
          {/* DNS Records */}
          <Card
            className="p-6"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_8a0d">
            <h3
              className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground"
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_8ef9">
              <Globe
                className="h-5 w-5 text-primary"
                data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_1f29" />
              DNS Records
            </h3>
            <div
              className="space-y-4"
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_e928">
              {Object.entries(reconData.dns).map(([type, records]) => (
                <div
                  key={type}
                  data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_6e27_${type}`}>
                  <h4
                    className="mb-2 text-sm font-semibold uppercase text-muted-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_3c95_${type}`}>
                    {type.toUpperCase()} Records
                  </h4>
                  <div
                    className="space-y-1"
                    data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_d8a5_${type}`}>
                    {records.map((record, idx) => (
                      <div
                        key={idx}
                        className="rounded bg-muted p-2 text-sm font-mono text-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_602f_${type}_${idx}`}>
                        {record}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* TLS/SSL Certificate */}
          {reconData.tls && (
            <Card
              className="p-6"
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_5605">
              <h3
                className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground"
                data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_9434">
                <Lock
                  className="h-5 w-5 text-primary"
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_5147" />
                SSL/TLS Certificate
              </h3>
              <div
                className="grid gap-4 sm:grid-cols-2"
                data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_c862">
                <div data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_b7fa">
                  <p
                    className="text-xs text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_56a5">Issuer</p>
                  <p
                    className="font-medium text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_94d2">{reconData.tls.issuer}</p>
                </div>
                <div data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_f43b">
                  <p
                    className="text-xs text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_3929">Subject</p>
                  <p
                    className="font-medium text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_1484">{reconData.tls.subject}</p>
                </div>
                <div data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_33f6">
                  <p
                    className="text-xs text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_603a">Valid From</p>
                  <p
                    className="font-medium text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_a95c">
                    {new Date(reconData.tls.validFrom).toLocaleDateString()}
                  </p>
                </div>
                <div data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_fdfa">
                  <p
                    className="text-xs text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_849a">Valid To</p>
                  <p
                    className="font-medium text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_8edc">
                    {new Date(reconData.tls.validTo).toLocaleDateString()}
                  </p>
                </div>
                <div data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_0fe5">
                  <p
                    className="text-xs text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_f722">Protocol</p>
                  <p
                    className="font-medium text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_b472">{reconData.tls.protocol}</p>
                </div>
                <div data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_bc11">
                  <p
                    className="text-xs text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_0ff7">Cipher Suite</p>
                  <p
                    className="font-mono text-sm text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_b9a3">{reconData.tls.cipher}</p>
                </div>
              </div>
            </Card>
          )}

          {/* HTTP Security Headers */}
          <Card
            className="p-6"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_331c">
            <h3
              className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground"
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_141b">
              <Shield
                className="h-5 w-5 text-primary"
                data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_c6f5" />
              HTTP Security Headers
            </h3>
            <div
              className="space-y-2"
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_a434">
              {Object.entries(reconData.headers).map(([header, info]) => (
                <div
                  key={header}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                  data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_4391_${header}`}>
                  <div
                    className="flex items-center gap-3"
                    data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_618c_${header}`}>
                    {info.present ? (
                      <CheckCircle
                        className="h-5 w-5 text-success"
                        data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_9966_${header}`} />
                    ) : (
                      <XCircle
                        className="h-5 w-5 text-destructive"
                        data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_c834_${header}`} />
                    )}
                    <span
                      className="font-mono text-sm text-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_675f_${header}`}>{header}</span>
                  </div>
                  {info.present && info.value && (
                    <span
                      className="max-w-xs truncate text-xs text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_ab7e_${header}`}>{info.value}</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
      {!isScanning && !reconData && !error && (
        <EmptyState
          icon={Search}
          title="No Recon Data"
          description="Enter a domain to gather DNS, TLS, and header information"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_40a5" />
      )}
    </div>
  );
}

// ─── Port Scanner Tab ───────────────────────────────────────────────────────

function PortScannerTab() {
  const [targetHost, setTargetHost] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentPort, setCurrentPort] = useState<number | null>(null);
  const [portResults, setPortResults] = useState<PortInfo[]>([]);

  const handlePortScan = async () => {
    if (!targetHost.trim()) return;

    setIsScanning(true);
    setScanProgress(0);
    setPortResults([]);

    // Simulate port scanning with progress
    const results: PortInfo[] = [];
    for (let i = 0; i < COMMON_PORTS.length; i++) {
      const port = COMMON_PORTS[i];
      setCurrentPort(port);
      setScanProgress(Math.round(((i + 1) / COMMON_PORTS.length) * 100));

      // Simulate scan delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Simulate realistic results
      const random = Math.random();
      let status: PortInfo['status'] = 'closed';
      let details = '';

      if (port === 80 || port === 443) {
        status = 'open';
        details = 'Web server responding';
      } else if (port === 22) {
        status = random > 0.3 ? 'open' : 'filtered';
        details = status === 'open' ? 'SSH service detected' : 'Firewall blocking';
      } else if (random > 0.85) {
        status = 'open';
        details = 'Service detected';
      } else if (random > 0.7) {
        status = 'filtered';
        details = 'Firewall response';
      }

      results.push({
        port,
        service: PORT_SERVICE_MAP[port],
        status,
        details,
      });

      setPortResults([...results]);
    }

    setCurrentPort(null);
    setIsScanning(false);
  };

  const STATUS_COLORS = {
    open: 'bg-destructive text-primary-foreground',
    closed: 'bg-muted text-muted-foreground',
    filtered: 'bg-warning text-foreground',
    unknown: 'bg-accent text-accent-foreground',
  };

  return (
    <div
      className="space-y-6"
      data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_fd57">
      {/* Scan Input */}
      <Card
        className="p-6"
        data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_822f">
        <h2
          className="mb-4 text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_592d">Port Scanner</h2>
        <div
          className="flex gap-4"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_532c">
          <div
            className="flex-1"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_2027">
            <Input
              type="text"
              placeholder="hostname or IP address"
              value={targetHost}
              onChange={(e) => setTargetHost(e.target.value)}
              disabled={isScanning}
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_2256" />
          </div>
          <Button
            onClick={handlePortScan}
            disabled={isScanning}
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_985d">
            {isScanning ? (
              <>
                <Spinner
                  size="sm"
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_f611" />
                <span
                  className="ml-2"
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_976b">Scanning...</span>
              </>
            ) : (
              <>
                <Server
                  className="mr-2 h-4 w-4"
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_3730" />
                Scan Ports
              </>
            )}
          </Button>
        </div>
        <p
          className="mt-2 text-xs text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_ff93">
          Scans common ports: {COMMON_PORTS.join(', ')}
        </p>
      </Card>
      {/* Scan Progress */}
      {isScanning && (
        <Card
          className="p-6"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_e3a2">
          <div
            className="space-y-3"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_7937">
            <div
              className="flex items-center justify-between"
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_0de9">
              <span
                className="text-sm font-medium text-foreground"
                data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_addc">
                Scanning port {currentPort} ({PORT_SERVICE_MAP[currentPort!]})
              </span>
              <span
                className="text-sm text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_f1e9">{scanProgress}%</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-muted"
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_4b24">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
                data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_c73d" />
            </div>
          </div>
        </Card>
      )}
      {/* Results Table */}
      {portResults.length > 0 && (
        <Card
          className="overflow-hidden"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_da96">
          <div
            className="overflow-x-auto"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_d061">
            <table
              className="w-full"
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_8e84">
              <thead
                className="border-b border-border bg-muted"
                data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_a337">
                <tr data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_14dd">
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_6499">
                    Port
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_b9f3">
                    Service
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_be49">
                    Status
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_3dce">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y divide-border"
                data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_1a43">
                {portResults.map((result) => (
                  <tr
                    key={result.port}
                    className="hover:bg-muted/30"
                    data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_495c_${result.port}`}>
                    <td
                      className="px-4 py-3 font-mono text-sm text-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_4eb9_${result.port}`}>{result.port}</td>
                    <td
                      className="px-4 py-3 text-sm text-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_1bc2_${result.port}`}>{result.service}</td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_e2de_${result.port}`}>
                      <Badge
                        className={STATUS_COLORS[result.status]}
                        data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_fb60_${result.port}`}>{result.status}</Badge>
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_9e7c_${result.port}`}>
                      {result.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            className="border-t border-border bg-muted/30 px-4 py-3"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_94b0">
            <div
              className="flex gap-4 text-xs text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_c59b">
              <span
                className="flex items-center gap-1"
                data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_023f">
                <Badge
                  className="bg-destructive text-primary-foreground"
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_c479">Open</Badge>
                {portResults.filter((r) => r.status === 'open').length}
              </span>
              <span
                className="flex items-center gap-1"
                data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_69e8">
                <Badge
                  className="bg-warning text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_aaff">Filtered</Badge>
                {portResults.filter((r) => r.status === 'filtered').length}
              </span>
              <span
                className="flex items-center gap-1"
                data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_683a">
                <Badge
                  className="bg-muted text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_6112">Closed</Badge>
                {portResults.filter((r) => r.status === 'closed').length}
              </span>
            </div>
          </div>
        </Card>
      )}
      {!isScanning && portResults.length === 0 && (
        <EmptyState
          icon={Server}
          title="No Scan Results"
          description="Enter a target host to scan common ports"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_9724" />
      )}
    </div>
  );
}

// ─── Web Auditor Tab ────────────────────────────────────────────────────────

function WebAuditorTab() {
  const [targetUrl, setTargetUrl] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [checks, setChecks] = useState<WebAuditCheck[]>(WEB_AUDIT_CHECKS);
  const [progress, setProgress] = useState(0);

  const handleAudit = async () => {
    if (!targetUrl.trim()) return;

    setIsAuditing(true);
    setProgress(0);
    setChecks(WEB_AUDIT_CHECKS.map((c) => ({ ...c, status: 'pending', details: '' })));

    // Simulate audit progress
    for (let i = 0; i < WEB_AUDIT_CHECKS.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setProgress(Math.round(((i + 1) / WEB_AUDIT_CHECKS.length) * 100));

      // Simulate check results
      const random = Math.random();
      let status: WebAuditCheck['status'] = 'pass';
      let details = 'Check passed';

      if (random > 0.8) {
        status = 'fail';
        details = 'Vulnerability detected - requires attention';
      } else if (random > 0.6) {
        status = 'warning';
        details = 'Potential issue found - review recommended';
      }

      setChecks((prev) =>
        prev.map((check, idx) =>
          idx === i ? { ...check, status, details } : check
        )
      );
    }

    setIsAuditing(false);
  };

  const CHECK_STATUS_COLORS = {
    pass: 'text-success',
    fail: 'text-destructive',
    warning: 'text-warning',
    pending: 'text-muted-foreground',
  };

  const CHECK_STATUS_ICONS = {
    pass: CheckCircle,
    fail: XCircle,
    warning: AlertTriangle,
    pending: RefreshCw,
  };

  const checksByCategory = checks.reduce((acc, check) => {
    if (!acc[check.category]) acc[check.category] = [];
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, WebAuditCheck[]>);

  const CATEGORY_LABELS: Record<string, string> = {
    xss: 'Cross-Site Scripting (XSS)',
    csrf: 'Cross-Site Request Forgery (CSRF)',
    sqli: 'SQL Injection',
    cookies: 'Cookie Security',
    auth: 'Authentication',
    headers: 'Security Headers',
  };

  return (
    <div
      className="space-y-6"
      data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_3344">
      {/* Audit Input */}
      <Card
        className="p-6"
        data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_89f8">
        <h2
          className="mb-4 text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_a8b0">Web Application Audit</h2>
        <div
          className="flex gap-4"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_6fbd">
          <div
            className="flex-1"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_d00e">
            <Input
              type="url"
              placeholder="https://example.com"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              disabled={isAuditing}
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_4113" />
          </div>
          <Button
            onClick={handleAudit}
            disabled={isAuditing}
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_eb1c">
            {isAuditing ? (
              <>
                <Spinner
                  size="sm"
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_959d" />
                <span
                  className="ml-2"
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_624a">Auditing...</span>
              </>
            ) : (
              <>
                <Globe
                  className="mr-2 h-4 w-4"
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_5775" />
                Run Audit
              </>
            )}
          </Button>
        </div>
      </Card>
      {/* Progress */}
      {isAuditing && (
        <Card
          className="p-6"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_6b34">
          <div
            className="space-y-3"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_099f">
            <div
              className="flex items-center justify-between"
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_2e60">
              <span
                className="text-sm font-medium text-foreground"
                data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_cd36">Running security checks...</span>
              <span
                className="text-sm text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_ed2c">{progress}%</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-muted"
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_3839">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
                data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_8b4a" />
            </div>
          </div>
        </Card>
      )}
      {/* Results by Category */}
      {Object.entries(checksByCategory).map(([category, categoryChecks]) => (
        <Card
          key={category}
          className="p-6"
          data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_5754_${category}`}>
          <h3
            className="mb-4 text-lg font-semibold text-foreground"
            data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_ab49_${category}`}>
            {CATEGORY_LABELS[category] || category}
          </h3>
          <div
            className="space-y-3"
            data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_5cf1_${category}`}>
            {categoryChecks.map((check) => {
              const Icon = CHECK_STATUS_ICONS[check.status];
              return (
                <div
                  key={check.id}
                  className="flex items-start gap-3 rounded-lg border border-border p-4"
                  data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_e317_${category}_${check.id}`}>
                  <Icon
                    className={cn('mt-0.5 h-5 w-5 shrink-0', CHECK_STATUS_COLORS[check.status])}
                    data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_acd6_${category}_${check.id}`} />
                  <div
                    className="flex-1"
                    data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_66d8_${category}_${check.id}`}>
                    <div
                      className="flex items-center justify-between"
                      data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_8885_${category}_${check.id}`}>
                      <h4
                        className="font-medium text-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_76f9_${category}_${check.id}`}>{check.name}</h4>
                      <Badge
                        className={cn(
                          'capitalize',
                          check.status === 'pass' && 'bg-success/20 text-success',
                          check.status === 'fail' && 'bg-destructive/20 text-destructive',
                          check.status === 'warning' && 'bg-warning/20 text-warning',
                          check.status === 'pending' && 'bg-muted text-muted-foreground'
                        )}
                        data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_e6ef_${category}_${check.id}`}>
                        {check.status}
                      </Badge>
                    </div>
                    {check.details && (
                      <p
                        className="mt-1 text-sm text-muted-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_d2b7_${category}_${check.id}`}>{check.details}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
      {!isAuditing && checks.every((c) => c.status === 'pending') && (
        <EmptyState
          icon={Globe}
          title="No Audit Results"
          description="Enter a URL to run web application security checks"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_5205" />
      )}
    </div>
  );
}

// ─── Reporter Tab ───────────────────────────────────────────────────────────

function ReporterTab() {
  const [selectedScanId, setSelectedScanId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<SecurityScanHistoryItem[]>([]);

  useEffect(() => {
    // Load scan history for selection
    getScanHistory(50)
      .then(setScanHistory)
      .catch(() => setError('Failed to load scan history'));
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedScanId) {
      setError('Please select a scan');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setReportContent(null);

    try {
      const content = await getScanReport(selectedScanId);
      setReportContent(content);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to generate report'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!reportContent) return;

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${selectedScanId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const completedScans = scanHistory.filter((s) => s.status === 'completed');

  return (
    <div
      className="space-y-6"
      data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_46e3">
      {/* Report Generator */}
      <Card
        className="p-6"
        data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_eaa8">
        <h2
          className="mb-4 text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_9184">Generate Security Report</h2>
        <div
          className="space-y-4"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_0961">
          <div data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_9b6c">
            <label
              className="mb-2 block text-sm font-medium text-foreground"
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_6662">Select Completed Scan</label>
            <select
              value={selectedScanId}
              onChange={(e) => setSelectedScanId(e.target.value)}
              disabled={isGenerating}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_fbfe">
              <option
                value=""
                data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_1bce">-- Select a scan --</option>
              {completedScans.map((scan) => (
                <option
                  key={scan.scanId}
                  value={scan.scanId}
                  data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_ab5c_${scan.scanId}`}>
                  {scan.target} - {new Date(scan.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
          <div
            className="flex gap-3"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_b192">
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating || !selectedScanId}
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_a511">
              {isGenerating ? (
                <>
                  <Spinner
                    size="sm"
                    data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_2b4d" />
                  <span
                    className="ml-2"
                    data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_9262">Generating...</span>
                </>
              ) : (
                <>
                  <FileText
                    className="mr-2 h-4 w-4"
                    data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_808a" />
                  Generate Report
                </>
              )}
            </Button>
            {reportContent && (
              <Button
                variant="secondary"
                onClick={handleDownload}
                data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_0c1e">
                <Download
                  className="mr-2 h-4 w-4"
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_6700" />
                Download
              </Button>
            )}
          </div>
        </div>
        {error && (
          <Alert
            variant="error"
            className="mt-4"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_ffe6">
            {error}
          </Alert>
        )}
      </Card>
      {/* Report Preview */}
      {reportContent && (
        <Card
          className="p-6"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_b579">
          <h3
            className="mb-4 text-lg font-semibold text-foreground"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_3e29">Report Preview</h3>
          <div
            className="max-h-[600px] overflow-auto rounded-lg border border-border bg-muted/30 p-4"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_b77f">
            <pre
              className="whitespace-pre-wrap font-mono text-sm text-foreground"
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_e8f8">{reportContent}</pre>
          </div>
        </Card>
      )}
      {!reportContent && !isGenerating && !error && (
        <EmptyState
          icon={FileText}
          title="No Report Generated"
          description="Select a completed scan to generate a downloadable security report"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_3e05" />
      )}
    </div>
  );
}

// ─── Scan History Tab ───────────────────────────────────────────────────────

function ScanHistoryTab() {
  const [scans, setScans] = useState<SecurityScanHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'date' | 'target' | 'risk'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getScanHistory(100);
      setScans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scan history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedScans = [...scans].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'target':
        comparison = a.target.localeCompare(b.target);
        break;
      case 'risk':
        const riskA = a.findingsCount.critical + a.findingsCount.high;
        const riskB = b.findingsCount.critical + b.findingsCount.high;
        comparison = riskA - riskB;
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getRiskLevel = (scan: SecurityScanHistoryItem): 'critical' | 'high' | 'medium' | 'low' | 'safe' => {
    if (scan.findingsCount.critical > 0) return 'critical';
    if (scan.findingsCount.high > 0) return 'high';
    if (scan.findingsCount.medium > 0) return 'medium';
    if (scan.findingsCount.low > 0) return 'low';
    return 'safe';
  };

  const RISK_COLORS = {
    critical: 'bg-destructive text-primary-foreground',
    high: 'bg-destructive/80 text-primary-foreground',
    medium: 'bg-warning text-foreground',
    low: 'bg-accent text-accent-foreground',
    safe: 'bg-success/20 text-success',
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp
        className="ml-1 inline h-3 w-3"
        data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_017c" />
    ) : (
      <ChevronDown
        className="ml-1 inline h-3 w-3"
        data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_36f2" />
    );
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-12"
        data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_886f">
        <Spinner
          size="lg"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_76d8" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="error"
        data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_55f1">
        {error}
        <Button
          variant="ghost"
          size="sm"
          onClick={loadHistory}
          className="ml-4"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_0084">
          Retry
        </Button>
      </Alert>
    );
  }

  if (scans.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No Scan History"
        description="Complete security scans will appear here"
        data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_c85b" />
    );
  }

  return (
    <div
      className="space-y-4"
      data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_87c2">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_f05c">
        <h2
          className="text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_f991">Scan History</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={loadHistory}
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_944f">
          <RefreshCw
            className="mr-2 h-4 w-4"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_d73d" />
          Refresh
        </Button>
      </div>
      <Card
        className="overflow-hidden"
        data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_f975">
        <div
          className="overflow-x-auto"
          data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_1512">
          <table
            className="w-full"
            data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_8fbe">
            <thead
              className="border-b border-border bg-muted"
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_8cd1">
              <tr data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_b931">
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort('date')}
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_2ba7">
                  Date <SortIcon
                  field="date"
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_3444" />
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort('target')}
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_a9b9">
                  Target <SortIcon
                  field="target"
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_aa04" />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_61e5">
                  Status
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_7d63">
                  Findings
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort('risk')}
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_8fa7">
                  Risk Level <SortIcon
                  field="risk"
                  data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_e375" />
                </th>
              </tr>
            </thead>
            <tbody
              className="divide-y divide-border"
              data-icod-id="src_pages_dashboard_dashboardsecuritycenter_tsx_e7a3">
              {sortedScans.map((scan) => {
                const riskLevel = getRiskLevel(scan);
                const totalFindings =
                  scan.findingsCount.critical +
                  scan.findingsCount.high +
                  scan.findingsCount.medium +
                  scan.findingsCount.low +
                  scan.findingsCount.informational;

                return (
                  <tr
                    key={scan.scanId}
                    className="hover:bg-muted/30"
                    data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_1c9b_${scan.scanId}`}>
                    <td
                      className="px-4 py-3 text-sm text-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_c414_${scan.scanId}`}>
                      {new Date(scan.createdAt).toLocaleString()}
                    </td>
                    <td
                      className="max-w-xs truncate px-4 py-3 text-sm font-medium text-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_5e1f_${scan.scanId}`}>
                      {scan.target}
                    </td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_6c1f_${scan.scanId}`}>
                      <Badge
                        className={cn(
                          'capitalize',
                          scan.status === 'completed' && 'bg-success/20 text-success',
                          scan.status === 'failed' && 'bg-destructive/20 text-destructive',
                          scan.status !== 'completed' && scan.status !== 'failed' && 'bg-muted text-muted-foreground'
                        )}
                        data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_a7d7_${scan.scanId}`}>
                        {scan.status}
                      </Badge>
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_4503_${scan.scanId}`}>
                      <div
                        className="flex gap-2 text-xs"
                        data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_6d6b_${scan.scanId}`}>
                        {scan.findingsCount.critical > 0 && (
                          <span
                            className="text-destructive"
                            data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_bcc6_${scan.scanId}`}>{scan.findingsCount.critical}C</span>
                        )}
                        {scan.findingsCount.high > 0 && (
                          <span
                            className="text-destructive/80"
                            data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_a8b4_${scan.scanId}`}>{scan.findingsCount.high}H</span>
                        )}
                        {scan.findingsCount.medium > 0 && (
                          <span
                            className="text-warning"
                            data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_72b6_${scan.scanId}`}>{scan.findingsCount.medium}M</span>
                        )}
                        {scan.findingsCount.low > 0 && (
                          <span
                            className="text-accent-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_f267_${scan.scanId}`}>{scan.findingsCount.low}L</span>
                        )}
                        <span
                          className="text-muted-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_6727_${scan.scanId}`}>Total: {totalFindings}</span>
                      </div>
                    </td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_9859_${scan.scanId}`}>
                      <Badge
                        className={RISK_COLORS[riskLevel]}
                        data-icod-id={`src_pages_dashboard_dashboardsecuritycenter_tsx_aebb_${scan.scanId}`}>{riskLevel.toUpperCase()}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
