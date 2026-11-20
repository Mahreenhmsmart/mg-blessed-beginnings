import { Shield, CheckCircle2, AlertCircle, XCircle, Wrench } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { Badge, Spinner } from '@/components/ui';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EmptyStatePanel from '@/components/dashboard/EmptyStatePanel';
import ScoreCard from '@/components/dashboard/ScoreCard';
import type { CheckResult } from '@/types';

function StatusIcon({ status }: { status: string }) {
  if (status === 'pass') return (
    <CheckCircle2
      className="h-4 w-4 text-success"
      data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_9b94" />
  );
  if (status === 'warn') return (
    <AlertCircle
      className="h-4 w-4 text-warning"
      data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_a3b7" />
  );
  return (
    <XCircle
      className="h-4 w-4 text-accent"
      data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_46bf" />
  );
}

export default function DashboardSecurity() {
  const { currentProjectId } = useAppSelector((s) => s.projects);
  const { audits, fetchStatus } = useAppSelector((s) => s.audits);

  const latestAudit = audits.find((a) => a.status === 'completed') || null;
  const secResults = latestAudit?.results?.security;
  const secScore = latestAudit?.scores?.security ?? 0;

  // Find the primary bottleneck (worst failing check)
  const failedChecks = secResults?.checks.filter((c: CheckResult) => c.status === 'fail') || [];
  const primaryBottleneck = failedChecks.length > 0 ? failedChecks[0] : null;

  // Extract fix recommendation from details
  const extractFixRecommendation = (details: string): string | null => {
    const match = details.match(/Fix recommendation:\s*(.+?)(?:\.|$)/i);
    return match ? match[1].trim() : null;
  };

  if (!currentProjectId) {
    return (
      <div
        className="flex flex-col gap-8"
        data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_236d">
        <div data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_c8fe">
          <h1
            className="font-heading text-2xl font-bold text-foreground sm:text-3xl tracking-tight"
            data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_8ed5">
            Security Audit
          </h1>
          <p
            className="mt-2 text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_727c">
            HTTPS enforcement, security headers, mixed content, and vulnerability surface analysis.
          </p>
        </div>
        <EmptyStatePanel
          icon={Shield}
          title="No project selected"
          description="Select a project from the sidebar to view security analysis."
          data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_dd6a" />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-8"
      data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_e10a">
      <div data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_daf3">
        <div
          className="flex items-center gap-3"
          data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_f9ef">
          <Shield
            className="h-7 w-7 text-primary"
            data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_a338" />
          <h1
            className="font-heading text-2xl font-bold text-foreground sm:text-3xl tracking-tight"
            data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_9073">
            Security Audit
          </h1>
        </div>
        <p
          className="mt-2 text-sm text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_5897">
          HTTPS enforcement, security headers, mixed content, and vulnerability surface analysis.
        </p>
      </div>
      {fetchStatus === 'loading' ? (
        <div
          className="flex justify-center py-12"
          data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_2ba0">
          <Spinner
            size="lg"
            data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_b33e" />
        </div>
      ) : !latestAudit ? (
        <EmptyStatePanel
          icon={Shield}
          title="No audit data available"
          description="Run an audit from the Overview page to see security results."
          data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_942a" />
      ) : (
        <>
          {/* Security Score + Primary Bottleneck */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_b94d">
            <ScoreCard
              title="Security"
              score={secScore}
              maxScore={100}
              color={secScore >= 70 ? 'var(--color-teal)' : secScore >= 40 ? 'var(--color-gold)' : 'var(--color-pink)'}
              label={`Security: ${secScore}/100`}
              data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_e04d" />
            <div
              className="sm:col-span-2 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
              data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_71ad">
              {primaryBottleneck ? (
                <>
                  <div
                    className="flex items-start gap-3 mb-3"
                    data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_6d78">
                    <span
                      className="text-lg"
                      role="img"
                      aria-label="alert"
                      data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_2664">&#x1F534;</span>
                    <div data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_3de0">
                      <h3
                        className="font-heading text-sm font-semibold text-foreground"
                        data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_206b">
                        Largest issue: {primaryBottleneck.name.replace(/^Security:\s*/, '').replace(/\s*\(.*\)$/, '')}
                      </h3>
                      <p
                        className="text-sm text-muted-foreground mt-1"
                        data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_b266">{primaryBottleneck.details.split('. ')[0]}.</p>
                    </div>
                  </div>
                  {extractFixRecommendation(primaryBottleneck.details) && (
                    <div
                      className="rounded-lg bg-muted/30 p-3 mt-3"
                      data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_4f15">
                      <div
                        className="flex items-start gap-2"
                        data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_e2f6">
                        <Wrench
                          className="h-4 w-4 mt-0.5 text-primary shrink-0"
                          data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_5def" />
                        <p
                          className="text-xs text-foreground"
                          data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_ed3a">
                          <span
                            className="font-medium"
                            data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_1d60">Fix recommendation:</span>{' '}
                          {extractFixRecommendation(primaryBottleneck.details)}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="flex items-center gap-3"
                  data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_fd51">
                  <CheckCircle2
                    className="h-6 w-6 text-success"
                    data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_b2cc" />
                  <p
                    className="text-sm text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_1571">No critical security issues detected.</p>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Checks */}
          <DashboardCard
            heading="Security Checks"
            icon={<Shield
              className="h-5 w-5"
              data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_db6a" />}
            data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_2813">
            <div
              className="flex flex-col gap-3"
              data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_063a">
              {secResults?.checks.map((check: CheckResult) => {
                const fixRec = extractFixRecommendation(check.details);
                return (
                  <div
                    key={check.id}
                    className="flex flex-col gap-2 rounded-lg border border-border/30 bg-card p-4"
                    data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_7fd9">
                    <div
                      className="flex items-center gap-3"
                      data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_2395">
                      <StatusIcon
                        status={check.status}
                        data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_133a" />
                      <div
                        className="min-w-0 flex-1"
                        data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_cf7f">
                        <div
                          className="flex items-center gap-2"
                          data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_2045">
                          <span
                            className="text-sm font-medium text-foreground"
                            data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_4103">{check.name}</span>
                          <Badge
                            variant={check.status === 'pass' ? 'new' : check.status === 'warn' ? 'default' : 'free'}
                            className="text-[10px]"
                            data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_eb74">
                            {check.points}/{check.maxPoints}
                          </Badge>
                        </div>
                        <p
                          className="mt-1 text-xs text-muted-foreground"
                          data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_d81d">{check.details}</p>
                      </div>
                    </div>
                    {fixRec && check.status !== 'pass' && (
                      <div
                        className="ml-7 rounded-md bg-muted/20 px-3 py-2"
                        data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_c686">
                        <div
                          className="flex items-start gap-2"
                          data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_be54">
                          <Wrench
                            className="h-3 w-3 mt-0.5 text-primary shrink-0"
                            data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_316c" />
                          <p
                            className="text-[11px] text-foreground"
                            data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_fe13">
                            <span
                              className="font-medium"
                              data-icod-id="src_pages_dashboard_dashboardsecurity_tsx_31e0">Fix recommendation:</span> {fixRec}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </DashboardCard>
        </>
      )}
    </div>
  );
}
