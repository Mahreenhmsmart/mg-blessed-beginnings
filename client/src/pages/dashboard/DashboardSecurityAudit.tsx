import { useState, useEffect, useRef } from 'react';
import { Shield, CheckCircle2, AlertCircle, XCircle, Clock, Download, ChevronDown, ChevronUp, Copy, Info, RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import {
  authorizeTarget,
  startScan,
  fetchScanStatus,
  fetchScanDetails,
  fetchScanHistory,
  fetchScanReport,
  deleteScanFromHistory,
  clearCurrentScan,
  clearAuthorization,
} from '@/store/slices/securityAuditSlice';
import { Button, Alert, Spinner, Field, Badge, Card } from '@/components/ui';
import { inputClass } from '@/components/ui/Input';
import DashboardCard from '@/components/dashboard/DashboardCard';
import ScoreCard from '@/components/dashboard/ScoreCard';
import EmptyStatePanel from '@/components/dashboard/EmptyStatePanel';
import type { SecurityFinding, FindingSeverity, SecurityScanStatus } from '@/types';
import { cn } from '@/utils/cn';

// ─── Status Step Configuration ──────────────────────────────────────────────

const SCAN_STEPS = [
  { id: 'authorization', label: 'Authorization confirmed', statusKey: null },
  { id: 'planning', label: 'Planner', statusKey: 'planning' },
  { id: 'reconnaissance', label: 'Recon', statusKey: 'reconnaissance' },
  { id: 'port_analysis', label: 'Port Scanner', statusKey: 'port_analysis' },
  { id: 'web_security_audit', label: 'Web Auditor', statusKey: 'web_security_audit' },
  { id: 'generating_report', label: 'Reporter', statusKey: 'generating_report' },
  { id: 'completed', label: 'Completed', statusKey: 'completed' },
] as const;

const SEVERITY_COLORS: Record<FindingSeverity, string> = {
  Critical: 'text-destructive bg-destructive/10 border-destructive/30',
  High: 'text-warning bg-warning/10 border-warning/30',
  Medium: 'text-foreground bg-muted border-border',
  Low: 'text-muted-foreground bg-muted/50 border-border/50',
  Informational: 'text-muted-foreground bg-background border-border/30',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock
    className="h-4 w-4 text-muted-foreground"
    data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_4c99" />,
  running: <RefreshCw
    className="h-4 w-4 animate-spin text-primary"
    data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_61da" />,
  completed: <CheckCircle2
    className="h-4 w-4 text-success"
    data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_9d33" />,
  failed: <XCircle
    className="h-4 w-4 text-destructive"
    data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_ae06" />,
};

// ─── Helper Components ──────────────────────────────────────────────────────

function StatusStep({
  step,
  currentStatus,
}: {
  step: typeof SCAN_STEPS[number];
  currentStatus: SecurityScanStatus | null;
}) {
  const getStepStatus = (): 'pending' | 'running' | 'completed' => {
    if (!currentStatus) return 'pending';
    if (step.statusKey === null) return 'completed'; // Authorization always shown as complete once scanning

    const statusOrder = ['planning', 'reconnaissance', 'port_analysis', 'web_security_audit', 'generating_report', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(step.statusKey);

    if (currentIndex < 0) return 'pending';
    if (currentStatus === 'failed') return stepIndex <= currentIndex ? 'completed' : 'pending';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'running';
    return 'pending';
  };

  const status = getStepStatus();

  return (
    <div
      className={cn('flex items-center gap-3 rounded-lg border p-3 transition-all',
        status === 'completed' && 'border-success/30 bg-success/5',
        status === 'running' && 'border-primary/30 bg-primary/5',
        status === 'pending' && 'border-border/30 bg-muted/20'
      )}
      data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_d664">
      <div
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
          status === 'completed' && 'bg-success text-background',
          status === 'running' && 'bg-primary text-background',
          status === 'pending' && 'bg-muted text-muted-foreground'
        )}
        data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_39b6">
        {status === 'completed' && <CheckCircle2
          className="h-4 w-4"
          data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_dcff" />}
        {status === 'running' && <RefreshCw
          className="h-3 w-3 animate-spin"
          data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_b0c8" />}
        {status === 'pending' && <Clock
          className="h-3 w-3"
          data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_c5d2" />}
      </div>
      <span
        className={cn(
          'text-sm font-medium',
          status === 'completed' && 'text-success',
          status === 'running' && 'text-primary',
          status === 'pending' && 'text-muted-foreground'
        )}
        data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_bf1a">
        {step.label}
      </span>
      {status === 'running' && (
        <span
          className="ml-auto text-xs text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_fb69">Running...</span>
      )}
    </div>
  );
}

function FindingCard({ finding }: { finding: SecurityFinding }) {
  const [expanded, setExpanded] = useState(false);
  const dispatch = useAppDispatch();

  const handleCopyFix = () => {
    navigator.clipboard.writeText(finding.remediation);
    dispatch(addToast({ message: 'Remediation copied to clipboard', variant: 'success' }));
  };

  return (
    <Card
      className={cn('overflow-hidden border-l-4', 
        finding.severity === 'Critical' && 'border-l-destructive',
        finding.severity === 'High' && 'border-l-warning',
        finding.severity === 'Medium' && 'border-l-primary',
        finding.severity === 'Low' && 'border-l-muted-foreground',
        finding.severity === 'Informational' && 'border-l-border'
      )}
      data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_d938">
      <div
        className="p-4"
        data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_7350">
        <div
          className="flex items-start justify-between gap-4"
          data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_0dfd">
          <div
            className="flex-1 min-w-0"
            data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_6f42">
            <div
              className="flex items-center gap-2 mb-1"
              data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_9ccf">
              <Badge
                variant={
                  finding.severity === 'Critical' ? 'free' :
                  finding.severity === 'High' ? 'new' :
                  finding.severity === 'Medium' ? 'ai' :
                  'default'
                }
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_a709">
                {finding.severity}
              </Badge>
              <span
                className="text-xs text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_1032">{finding.target}</span>
            </div>
            <h4
              className="font-medium text-foreground truncate"
              data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_2955">{finding.title}</h4>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_ba91">
            {expanded ? <ChevronUp
              className="h-4 w-4"
              data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_ceb7" /> : <ChevronDown
              className="h-4 w-4"
              data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_cef5" />}
          </Button>
        </div>

        {expanded && (
          <div
            className="mt-4 space-y-3 border-t border-border/30 pt-4"
            data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_61f3">
            <div data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_f85d">
              <p
                className="text-xs font-medium text-muted-foreground mb-1"
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_c4c0">Evidence</p>
              <p
                className="text-sm text-foreground bg-muted/30 p-2 rounded"
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_7d71">{finding.evidence}</p>
            </div>
            <div data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_cfc5">
              <p
                className="text-xs font-medium text-muted-foreground mb-1"
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_74fe">Why it matters</p>
              <p
                className="text-sm text-foreground"
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_3df3">{finding.impact}</p>
            </div>
            <div data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_9c32">
              <p
                className="text-xs font-medium text-muted-foreground mb-1"
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_a72d">Recommended fix</p>
              <p
                className="text-sm text-foreground bg-success/5 p-2 rounded border border-success/20"
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_35bf">{finding.remediation}</p>
            </div>
            <div
              className="flex gap-2 pt-2"
              data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_bcf3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyFix}
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_135b">
                <Copy
                  className="h-3 w-3 mr-1"
                  data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_9b5a" />
                Copy Fix
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_beb8">
                Mark Resolved
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function DashboardSecurityAudit() {
  const dispatch = useAppDispatch();
  const {
    currentScanId,
    currentScanStatus,
    currentScanProgress,
    currentScanMessage,
    scanDetails,
    history,
    historyStatus,
    reportContent,
    authorizationInfo,
    isAuthorizing,
    isStarting,
    error,
  } = useAppSelector((s) => s.securityAudit);

  const [target, setTarget] = useState('');
  const [authorizationConfirmed, setAuthorizationConfirmed] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load history on mount
  useEffect(() => {
    dispatch(fetchScanHistory());
  }, [dispatch]);

  // Poll for status updates during active scan
  useEffect(() => {
    if (currentScanId && currentScanStatus && !['completed', 'failed', 'cancelled'].includes(currentScanStatus)) {
      pollIntervalRef.current = setInterval(() => {
        dispatch(fetchScanStatus(currentScanId));
      }, 2000);
    } else if (currentScanStatus === 'completed' && currentScanId) {
      // Fetch full details when complete
      dispatch(fetchScanDetails(currentScanId));
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [currentScanId, currentScanStatus, dispatch]);

  const handleAuthorize = async () => {
    if (!target.trim()) {
      dispatch(addToast({ message: 'Please enter a target', variant: 'error' }));
      return;
    }
    dispatch(authorizeTarget(target.trim()));
  };

  const handleStartScan = async () => {
    if (!authorizationConfirmed || !authorizationInfo) {
      dispatch(addToast({ message: 'Please confirm authorization first', variant: 'error' }));
      return;
    }

    try {
      await dispatch(startScan({
        target: authorizationInfo.normalizedTarget,
        authorizationConfirmed: true,
      })).unwrap();
      dispatch(addToast({ message: 'Security scan started', variant: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: err as string || 'Failed to start scan', variant: 'error' }));
    }
  };

  const handleDownloadReport = async () => {
    if (!currentScanId) return;

    try {
      const content = reportContent || (await dispatch(fetchScanReport(currentScanId)).unwrap());
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-report-${currentScanId}.md`;
      a.click();
      URL.revokeObjectURL(url);
      dispatch(addToast({ message: 'Report downloaded', variant: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: 'Failed to download report', variant: 'error' }));
    }
  };

  const handleDeleteHistoryItem = async (scanId: string) => {
    if (!confirm('Are you sure you want to delete this scan from history?')) return;

    try {
      await dispatch(deleteScanFromHistory(scanId)).unwrap();
      dispatch(addToast({ message: 'Scan deleted from history', variant: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: 'Failed to delete scan', variant: 'error' }));
    }
  };

  const handleReset = () => {
    dispatch(clearCurrentScan());
    dispatch(clearAuthorization());
    setTarget('');
    setAuthorizationConfirmed(false);
  };

  const handleViewHistoryItem = async (scanId: string) => {
    try {
      await dispatch(fetchScanDetails(scanId)).unwrap();
    } catch (err) {
      dispatch(addToast({ message: 'Failed to load scan details', variant: 'error' }));
    }
  };

  // Calculate total findings
  const totalFindings = scanDetails?.findingsCount
    ? Object.values(scanDetails.findingsCount).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div
      className="flex flex-col gap-8"
      data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_780d">
      {/* Header */}
      <div data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_39a5">
        <div
          className="flex items-center gap-3"
          data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_d671">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"
            data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_950a">
            <Shield
              className="h-6 w-6 text-primary"
              data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_ab65" />
          </div>
          <div data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_010a">
            <h1
              className="font-heading text-2xl font-bold text-foreground sm:text-3xl tracking-tight"
              data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_f1eb">
              Security Audit
            </h1>
            <p
              className="mt-1 text-sm text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_40cc">
              Understand Your Website's Security Exposure
            </p>
          </div>
        </div>
        <p
          className="mt-3 text-muted-foreground max-w-2xl"
          data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_fa80">
          Run an authorized security assessment and receive clear, actionable security recommendations.
        </p>
      </div>
      {/* Authorization Notice */}
      <Alert
        variant="warning"
        data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_6370">
        <div
          className="flex items-start gap-2"
          data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_48e3">
          <Info
            className="h-5 w-5 shrink-0 mt-0.5"
            data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_83fe" />
          <div data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_68f9">
            <p
              className="font-medium"
              data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_bb9b">Only scan websites and systems you own or have explicit authorization to test.</p>
            <p
              className="text-sm mt-1 opacity-90"
              data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_b985">Unauthorized scanning is illegal and unethical. Always obtain proper authorization before conducting any security assessment.</p>
          </div>
        </div>
      </Alert>
      {/* Error Display */}
      {error && (
        <Alert
          variant="error"
          data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_f3d0">
          <div
            className="flex items-center justify-between"
            data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_5270">
            <span data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_5175">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(clearCurrentScan())}
              data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_465e">
              Dismiss
            </Button>
          </div>
        </Alert>
      )}
      {/* Main Content Area */}
      {!currentScanId && !scanDetails ? (
        // New Scan Form
        (<DashboardCard
          heading="Start Security Audit"
          data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_b34e">
          <div
            className="space-y-6"
            data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_983e">
            {/* Target Input */}
            <div
              className="max-w-md"
              data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_f8e6">
              <Field
                label="Target Domain or IP"
                htmlFor="target"
                required
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_24b7">
                <input
                  id="target"
                  type="text"
                  placeholder="example.com or 192.168.1.1"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className={inputClass()}
                  disabled={!!authorizationInfo || isStarting}
                  data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_151f" />
              </Field>
              <p
                className="text-xs text-muted-foreground mt-1"
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_7d05">
                Enter a domain name, hostname, or IP address you own or have permission to scan.
              </p>
            </div>

            {/* Authorization Confirmation */}
            {authorizationInfo && (
              <div
                className="rounded-lg border border-primary/30 bg-primary/5 p-4"
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_9d9d">
                <h4
                  className="font-medium text-foreground mb-2"
                  data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_e7fc">Target Validated</h4>
                <p
                  className="text-sm text-muted-foreground mb-3"
                  data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_e818">
                  Target: <span
                  className="font-mono text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_8117">{authorizationInfo.normalizedTarget}</span>
                </p>
                <label
                  className="flex items-start gap-3 cursor-pointer"
                  data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_c31e">
                  <input
                    type="checkbox"
                    checked={authorizationConfirmed}
                    onChange={(e) => setAuthorizationConfirmed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_4fb7" />
                  <span
                    className="text-sm text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_ba32">
                    I confirm that I own or have explicit written authorization to scan this target.
                    I understand that unauthorized scanning is illegal.
                  </span>
                </label>
              </div>
            )}

            {/* Action Buttons */}
            <div
              className="flex gap-3"
              data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_858a">
              {!authorizationInfo ? (
                <Button
                  onClick={handleAuthorize}
                  loading={isAuthorizing}
                  disabled={!target.trim()}
                  data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_568a">
                  Validate Target
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleStartScan}
                    loading={isStarting}
                    disabled={!authorizationConfirmed}
                    data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_b033">
                    Start Security Audit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_ab48">
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </DashboardCard>)
      ) : scanDetails ? (
        // Results View
        (<>
          {/* Score and Summary */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_1c9d">
            <ScoreCard
              title="Security Score"
              score={scanDetails.score ?? 0}
              maxScore={100}
              color={
                (scanDetails.score ?? 0) >= 80 ? 'var(--color-teal)' :
                (scanDetails.score ?? 0) >= 60 ? 'var(--color-gold)' :
                'var(--color-pink)'
              }
              label={`${scanDetails.score ?? 0}/100`}
              data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_4eac" />
            <Card
              className="p-6 flex flex-col justify-center"
              data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_a0d5">
              <p
                className="text-sm text-muted-foreground mb-2"
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_b509">Total Findings</p>
              <p
                className="text-3xl font-bold text-foreground"
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_5887">{totalFindings}</p>
              <div
                className="flex gap-2 mt-3 flex-wrap"
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_19d6">
                {scanDetails.findingsCount.critical > 0 && (
                  <Badge
                    variant="free"
                    data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_7a8e">{scanDetails.findingsCount.critical} Critical</Badge>
                )}
                {scanDetails.findingsCount.high > 0 && (
                  <Badge
                    variant="new"
                    data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_8c2a">{scanDetails.findingsCount.high} High</Badge>
                )}
                {scanDetails.findingsCount.medium > 0 && (
                  <Badge
                    variant="ai"
                    data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_472d">{scanDetails.findingsCount.medium} Medium</Badge>
                )}
                {scanDetails.findingsCount.low > 0 && (
                  <Badge
                    variant="default"
                    data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_ddec">{scanDetails.findingsCount.low} Low</Badge>
                )}
                {scanDetails.findingsCount.informational > 0 && (
                  <Badge
                    variant="category"
                    data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_eddc">{scanDetails.findingsCount.informational} Info</Badge>
                )}
              </div>
            </Card>
            <Card
              className="p-6 flex flex-col justify-center gap-3"
              data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_aaf0">
              <p
                className="text-sm text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_8be5">Target</p>
              <p
                className="font-mono text-foreground truncate"
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_5151">{scanDetails.target}</p>
              <div
                className="flex gap-2 mt-2"
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_9fca">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadReport}
                  data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_503a">
                  <Download
                    className="h-3 w-3 mr-1"
                    data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_87c8" />
                  Download Report
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_3fb9">
                  New Scan
                </Button>
              </div>
            </Card>
          </div>
          {/* Findings List */}
          {scanDetails.findings.length > 0 ? (
            <DashboardCard
              heading={`Findings (${totalFindings})`}
              data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_9f92">
              <div
                className="space-y-3"
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_5988">
                {scanDetails.findings.map((finding) => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    data-icod-id={`src_pages_dashboard_dashboardsecurityaudit_tsx_ae22_${finding.id}`} />
                ))}
              </div>
            </DashboardCard>
          ) : (
            <DashboardCard
              heading="Findings"
              data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_be27">
              <div
                className="flex items-center gap-3 py-8 justify-center text-success"
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_1820">
                <CheckCircle2
                  className="h-6 w-6"
                  data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_d4d7" />
                <p
                  className="font-medium"
                  data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_eb0d">No issues detected by the checks performed.</p>
              </div>
            </DashboardCard>
          )}
        </>)
      ) : (
        // Live Console - Active Scan
        (<DashboardCard
          heading="Live Console"
          data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_db2a">
          <div
            className="space-y-6"
            data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_3829">
            {/* Progress Bar */}
            <div data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_8807">
              <div
                className="flex justify-between text-sm mb-2"
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_b371">
                <span
                  className="text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_3c8a">{currentScanMessage || 'Initializing...'}</span>
                <span
                  className="font-medium"
                  data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_92d7">{currentScanProgress}%</span>
              </div>
              <div
                className="h-2 bg-muted rounded-full overflow-hidden"
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_fb09">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${currentScanProgress}%` }}
                  data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_cf85" />
              </div>
            </div>

            {/* Status Steps */}
            <div
              className="grid gap-2"
              data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_92ec">
              {SCAN_STEPS.map((step) => (
                <StatusStep
                  key={step.id}
                  step={step}
                  currentStatus={currentScanStatus}
                  data-icod-id={`src_pages_dashboard_dashboardsecurityaudit_tsx_90f8_${step.id}`} />
              ))}
            </div>

            {/* Cancel Button */}
            {currentScanStatus && !['completed', 'failed', 'cancelled'].includes(currentScanStatus) && (
              <div
                className="pt-4 border-t border-border/30"
                data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_7f8d">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_8717">
                  Cancel Scan
                </Button>
              </div>
            )}
          </div>
        </DashboardCard>)
      )}
      {/* Scan History */}
      <DashboardCard
        heading="Scan History"
        data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_5548">
        {historyStatus === 'loading' ? (
          <div
            className="flex justify-center py-8"
            data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_a856">
            <Spinner
              size="md"
              data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_a5e8" />
          </div>
        ) : history.length === 0 ? (
          <EmptyStatePanel
            icon={Shield}
            title="No scan history"
            description="Your security scan history will appear here."
            data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_1b0c" />
        ) : (
          <div
            className="overflow-x-auto"
            data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_43b6">
            <table
              className="w-full text-sm"
              data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_df78">
              <thead data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_bab3">
                <tr
                  className="border-b border-border"
                  data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_21b0">
                  <th
                    className="text-left py-3 px-2 font-medium text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_e54a">Target</th>
                  <th
                    className="text-left py-3 px-2 font-medium text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_37af">Date</th>
                  <th
                    className="text-left py-3 px-2 font-medium text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_f7c1">Score</th>
                  <th
                    className="text-left py-3 px-2 font-medium text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_02e9">Findings</th>
                  <th
                    className="text-left py-3 px-2 font-medium text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_ee66">Status</th>
                  <th
                    className="text-right py-3 px-2 font-medium text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_2921">Actions</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_pages_dashboard_dashboardsecurityaudit_tsx_3f96">
                {history.map((item) => {
                  const findingsTotal = item.findingsCount
                    ? Object.values(item.findingsCount).reduce((a, b) => a + b, 0)
                    : 0;
                  
                  return (
                    <tr
                      key={item.scanId}
                      className="border-b border-border/30 hover:bg-muted/20"
                      data-icod-id={`src_pages_dashboard_dashboardsecurityaudit_tsx_edad_${item.scanId}`}>
                      <td
                        className="py-3 px-2 font-mono text-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardsecurityaudit_tsx_bcbf_${item.scanId}`}>{item.target}</td>
                      <td
                        className="py-3 px-2 text-muted-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardsecurityaudit_tsx_fb0c_${item.scanId}`}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td
                        className="py-3 px-2"
                        data-icod-id={`src_pages_dashboard_dashboardsecurityaudit_tsx_0743_${item.scanId}`}>
                        {item.score !== null ? (
                          <span
                            className={cn(
                              'font-medium',
                              item.score >= 80 && 'text-success',
                              item.score >= 60 && item.score < 80 && 'text-warning',
                              item.score < 60 && 'text-destructive'
                            )}
                            data-icod-id={`src_pages_dashboard_dashboardsecurityaudit_tsx_1a86_${item.scanId}`}>
                            {item.score}/100
                          </span>
                        ) : (
                          <span
                            className="text-muted-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardsecurityaudit_tsx_17c1_${item.scanId}`}>-</span>
                        )}
                      </td>
                      <td
                        className="py-3 px-2 text-muted-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardsecurityaudit_tsx_4428_${item.scanId}`}>{findingsTotal}</td>
                      <td
                        className="py-3 px-2"
                        data-icod-id={`src_pages_dashboard_dashboardsecurityaudit_tsx_7456_${item.scanId}`}>
                        <Badge
                          variant={
                            item.status === 'completed' ? 'new' :
                            item.status === 'failed' ? 'free' :
                            'default'
                          }
                          data-icod-id={`src_pages_dashboard_dashboardsecurityaudit_tsx_22d8_${item.scanId}`}>
                          {item.status}
                        </Badge>
                      </td>
                      <td
                        className="py-3 px-2 text-right"
                        data-icod-id={`src_pages_dashboard_dashboardsecurityaudit_tsx_12a5_${item.scanId}`}>
                        <div
                          className="flex gap-1 justify-end"
                          data-icod-id={`src_pages_dashboard_dashboardsecurityaudit_tsx_d68a_${item.scanId}`}>
                          {item.status === 'completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewHistoryItem(item.scanId)}
                              data-icod-id={`src_pages_dashboard_dashboardsecurityaudit_tsx_f545_${item.scanId}`}>
                              View
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteHistoryItem(item.scanId)}
                            data-icod-id={`src_pages_dashboard_dashboardsecurityaudit_tsx_8bb7_${item.scanId}`}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
