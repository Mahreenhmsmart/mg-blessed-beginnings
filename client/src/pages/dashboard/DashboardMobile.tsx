import { useEffect, useState } from 'react';
import { Smartphone, CheckCircle2, AlertCircle, XCircle, Monitor } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { Button, Badge, Spinner } from '@/components/ui';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EmptyStatePanel from '@/components/dashboard/EmptyStatePanel';
import ScoreCard from '@/components/dashboard/ScoreCard';
import type { CheckResult } from '@/types';

function StatusIcon({ status }: { status: string }) {
  if (status === 'pass') return (
    <CheckCircle2
      className="h-4 w-4 text-success"
      data-icod-id="src_pages_dashboard_dashboardmobile_tsx_87b1" />
  );
  if (status === 'warn') return (
    <AlertCircle
      className="h-4 w-4 text-warning"
      data-icod-id="src_pages_dashboard_dashboardmobile_tsx_c2b2" />
  );
  return (
    <XCircle
      className="h-4 w-4 text-accent"
      data-icod-id="src_pages_dashboard_dashboardmobile_tsx_17cf" />
  );
}

/** Mobile Preview component — shows a phone-frame simulation */
function MobilePreview({ url }: { url: string }) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div
      className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
      data-icod-id="src_pages_dashboard_dashboardmobile_tsx_31c7">
      <div
        className="flex items-center justify-between mb-4"
        data-icod-id="src_pages_dashboard_dashboardmobile_tsx_3fcb">
        <div
          className="flex items-center gap-2"
          data-icod-id="src_pages_dashboard_dashboardmobile_tsx_63d2">
          <Smartphone
            className="h-5 w-5 text-primary"
            data-icod-id="src_pages_dashboard_dashboardmobile_tsx_7351" />
          <h3
            className="font-heading text-sm font-semibold text-foreground"
            data-icod-id="src_pages_dashboard_dashboardmobile_tsx_8280">Mobile Preview</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          data-icod-id="src_pages_dashboard_dashboardmobile_tsx_2dc4">
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>
      </div>
      {showPreview && (
        <div
          className="mx-auto max-w-[375px] overflow-hidden rounded-[2rem] border-4 border-muted bg-background shadow-lg"
          data-icod-id="src_pages_dashboard_dashboardmobile_tsx_e63a">
          {/* Phone notch */}
          <div
            className="flex justify-center bg-muted py-1.5"
            data-icod-id="src_pages_dashboard_dashboardmobile_tsx_92a8">
            <div
              className="h-4 w-20 rounded-full bg-background/50"
              data-icod-id="src_pages_dashboard_dashboardmobile_tsx_d92e" />
          </div>
          {/* Content area */}
          <div
            className="relative h-[600px] w-full overflow-y-auto bg-background"
            data-icod-id="src_pages_dashboard_dashboardmobile_tsx_0aeb">
            <iframe
              src={url}
              title="Mobile Preview"
              className="h-full w-full border-0"
              sandbox="allow-scripts allow-same-origin"
              style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' }}
              data-icod-id="src_pages_dashboard_dashboardmobile_tsx_80dc" />
          </div>
          {/* Bottom bar */}
          <div
            className="flex justify-center bg-muted py-2"
            data-icod-id="src_pages_dashboard_dashboardmobile_tsx_fe5f">
            <div
              className="h-1 w-32 rounded-full bg-background/50"
              data-icod-id="src_pages_dashboard_dashboardmobile_tsx_bf5b" />
          </div>
        </div>
      )}
      {!showPreview && (
        <p
          className="text-xs text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardmobile_tsx_e8e3">
          Click &quot;Show Preview&quot; to see how your site renders in a mobile viewport (375px wide).
        </p>
      )}
    </div>
  );
}

export default function DashboardMobile() {
  const { currentProjectId, items: projects } = useAppSelector((s) => s.projects);
  const { audits, fetchStatus } = useAppSelector((s) => s.audits);

  const latestAudit = audits.find((a) => a.status === 'completed') || null;
  const mobileResults = latestAudit?.results?.mobile;
  const mobileScore = latestAudit?.scores?.mobile ?? 0;

  const projectUrl = projects.find((p) => p._id === currentProjectId)?.url || '';

  if (!currentProjectId) {
    return (
      <div
        className="flex flex-col gap-8"
        data-icod-id="src_pages_dashboard_dashboardmobile_tsx_a60e">
        <div data-icod-id="src_pages_dashboard_dashboardmobile_tsx_4698">
          <h1
            className="font-heading text-2xl font-bold text-foreground sm:text-3xl tracking-tight"
            data-icod-id="src_pages_dashboard_dashboardmobile_tsx_fd21">
            Mobile Audit
          </h1>
          <p
            className="mt-2 text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardmobile_tsx_b56e">
            Responsive design, touch targets, viewport, and mobile performance analysis.
          </p>
        </div>
        <EmptyStatePanel
          icon={Smartphone}
          title="No project selected"
          description="Select a project from the sidebar to view mobile analysis."
          data-icod-id="src_pages_dashboard_dashboardmobile_tsx_666d" />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-8"
      data-icod-id="src_pages_dashboard_dashboardmobile_tsx_cfd6">
      <div data-icod-id="src_pages_dashboard_dashboardmobile_tsx_e265">
        <div
          className="flex items-center gap-3"
          data-icod-id="src_pages_dashboard_dashboardmobile_tsx_d4fa">
          <Smartphone
            className="h-7 w-7 text-primary"
            data-icod-id="src_pages_dashboard_dashboardmobile_tsx_a83e" />
          <h1
            className="font-heading text-2xl font-bold text-foreground sm:text-3xl tracking-tight"
            data-icod-id="src_pages_dashboard_dashboardmobile_tsx_35af">
            Mobile Audit
          </h1>
        </div>
        <p
          className="mt-2 text-sm text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardmobile_tsx_eb63">
          Responsive design, text readability, touch targets, navigation, image scaling, and mobile performance checks.
        </p>
      </div>
      {fetchStatus === 'loading' ? (
        <div
          className="flex justify-center py-12"
          data-icod-id="src_pages_dashboard_dashboardmobile_tsx_bd50">
          <Spinner size="lg" data-icod-id="src_pages_dashboard_dashboardmobile_tsx_45db" />
        </div>
      ) : !latestAudit ? (
        <EmptyStatePanel
          icon={Smartphone}
          title="No audit data available"
          description="Run an audit from the Overview page to see mobile analysis results."
          data-icod-id="src_pages_dashboard_dashboardmobile_tsx_4603" />
      ) : (
        <>
          {/* Score + Mobile Preview */}
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
            data-icod-id="src_pages_dashboard_dashboardmobile_tsx_63ad">
            <ScoreCard
              title="Mobile Score"
              score={mobileScore}
              maxScore={100}
              color={mobileScore >= 70 ? 'var(--color-teal)' : mobileScore >= 40 ? 'var(--color-gold)' : 'var(--color-pink)'}
              label="Mobile Friendliness"
              data-icod-id="src_pages_dashboard_dashboardmobile_tsx_9ef8" />
            <div
              className="lg:col-span-2"
              data-icod-id="src_pages_dashboard_dashboardmobile_tsx_5234">
              <MobilePreview
                url={projectUrl}
                data-icod-id="src_pages_dashboard_dashboardmobile_tsx_8f1b" />
            </div>
          </div>

          {/* Detailed Checks */}
          <DashboardCard
            heading="Mobile Checks"
            icon={<Monitor
              className="h-5 w-5"
              data-icod-id="src_pages_dashboard_dashboardmobile_tsx_3f1c" />}
            data-icod-id="src_pages_dashboard_dashboardmobile_tsx_f5db">
            <div
              className="flex flex-col gap-3"
              data-icod-id="src_pages_dashboard_dashboardmobile_tsx_2408">
              {mobileResults?.checks.map((check: CheckResult) => (
                <div
                  key={check.id}
                  className="flex items-start gap-3 rounded-lg border border-border/30 bg-card p-4"
                  data-icod-id="src_pages_dashboard_dashboardmobile_tsx_f5a1">
                  <StatusIcon
                    status={check.status}
                    data-icod-id="src_pages_dashboard_dashboardmobile_tsx_6e28" />
                  <div
                    className="min-w-0 flex-1"
                    data-icod-id="src_pages_dashboard_dashboardmobile_tsx_3650">
                    <div
                      className="flex items-center gap-2"
                      data-icod-id="src_pages_dashboard_dashboardmobile_tsx_d917">
                      <span
                        className="text-sm font-medium text-foreground"
                        data-icod-id="src_pages_dashboard_dashboardmobile_tsx_f43e">{check.name}</span>
                      <Badge
                        variant={check.status === 'pass' ? 'new' : check.status === 'warn' ? 'default' : 'free'}
                        className="text-[10px]"
                        data-icod-id="src_pages_dashboard_dashboardmobile_tsx_f9a1">
                        {check.points}/{check.maxPoints}
                      </Badge>
                    </div>
                    <p
                      className="mt-1 text-xs text-muted-foreground"
                      data-icod-id="src_pages_dashboard_dashboardmobile_tsx_6870">{check.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </>
      )}
    </div>
  );
}
