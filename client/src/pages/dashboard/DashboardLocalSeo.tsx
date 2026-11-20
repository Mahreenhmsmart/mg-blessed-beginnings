import { MapPin, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
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
      data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_157a" />
  );
  if (status === 'warn') return (
    <AlertCircle
      className="h-4 w-4 text-warning"
      data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_e373" />
  );
  return (
    <XCircle
      className="h-4 w-4 text-accent"
      data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_962f" />
  );
}

export default function DashboardLocalSeo() {
  const { currentProjectId } = useAppSelector((s) => s.projects);
  const { audits, fetchStatus } = useAppSelector((s) => s.audits);

  const latestAudit = audits.find((a) => a.status === 'completed') || null;
  const localResults = latestAudit?.results?.localSeo;
  const localScore = latestAudit?.scores?.localSeo ?? 0;

  // Determine if Local SEO is relevant based on check results
  const hasLocalSignals = localResults?.checks.some(
    (c: CheckResult) => c.status === 'pass' || c.points > 0
  );

  if (!currentProjectId) {
    return (
      <div
        className="flex flex-col gap-8"
        data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_3039">
        <div data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_14fe">
          <h1
            className="font-heading text-2xl font-bold text-foreground sm:text-3xl tracking-tight"
            data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_c2e0">
            Local SEO
          </h1>
          <p
            className="mt-2 text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_941d">
            NAP consistency, Google Business Profile, local schema, and citation analysis.
          </p>
        </div>
        <EmptyStatePanel
          icon={MapPin}
          title="No project selected"
          description="Select a project from the sidebar to view local SEO analysis."
          data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_c90a" />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-8"
      data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_07f8">
      <div data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_9757">
        <div
          className="flex items-center gap-3"
          data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_4967">
          <MapPin
            className="h-7 w-7 text-primary"
            data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_91bd" />
          <h1
            className="font-heading text-2xl font-bold text-foreground sm:text-3xl tracking-tight"
            data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_31eb">
            Local SEO
          </h1>
        </div>
        <p
          className="mt-2 text-sm text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_5e84">
          Google Business Profile, NAP consistency, LocalBusiness schema, location pages, reviews, maps, and local citations.
        </p>
      </div>
      {fetchStatus === 'loading' ? (
        <div
          className="flex justify-center py-12"
          data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_ffd9">
          <Spinner size="lg" data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_b142" />
        </div>
      ) : !latestAudit ? (
        <EmptyStatePanel
          icon={MapPin}
          title="No audit data available"
          description="Run an audit from the Overview page to see local SEO results."
          data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_3cce" />
      ) : !hasLocalSignals && localScore === 0 ? (
        <DashboardCard
          heading="Local SEO Analysis"
          icon={<MapPin
            className="h-5 w-5"
            data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_9a00" />}
          data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_4f07">
          <div
            className="rounded-xl border border-border/40 bg-muted/20 p-6 text-center"
            data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_615b">
            <MapPin
              className="mx-auto h-10 w-10 text-muted-foreground mb-3"
              data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_a6fd" />
            <h3
              className="font-heading text-sm font-semibold text-foreground mb-2"
              data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_dd07">
              No Local Signals Detected
            </h3>
            <p
              className="text-sm text-muted-foreground max-w-md mx-auto"
              data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_273e">
              This module is most relevant for businesses with physical locations or local service areas.
              If your business serves specific geographic areas, add your address, phone number, and
              LocalBusiness schema to activate local SEO checks.
            </p>
          </div>
        </DashboardCard>
      ) : (
        <>
          {/* Score */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_d57f">
            <ScoreCard
              title="Local SEO Score"
              score={localScore}
              maxScore={100}
              color={localScore >= 70 ? 'var(--color-teal)' : localScore >= 40 ? 'var(--color-gold)' : 'var(--color-pink)'}
              label="Local Visibility"
              data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_2184" />
            <div
              className="sm:col-span-2 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
              data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_9055">
              <h3
                className="font-heading text-sm font-semibold text-foreground mb-2"
                data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_e351">
                Local Search Summary
              </h3>
              <p
                className="text-sm text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_2786">
                {localResults?.checks.filter((c: CheckResult) => c.status === 'pass').length ?? 0} of{' '}
                {localResults?.checks.length ?? 0} local SEO checks passed.
                {' '}Optimizing these signals helps your business appear in local search results and Google Maps.
              </p>
            </div>
          </div>

          {/* Detailed Checks */}
          <DashboardCard
            heading="Local SEO Checks"
            icon={<MapPin
              className="h-5 w-5"
              data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_a690" />}
            data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_a99b">
            <div
              className="flex flex-col gap-3"
              data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_1b97">
              {localResults?.checks.map((check: CheckResult) => (
                <div
                  key={check.id}
                  className="flex items-start gap-3 rounded-lg border border-border/30 bg-card p-4"
                  data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_807a">
                  <StatusIcon
                    status={check.status}
                    data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_ecc5" />
                  <div
                    className="min-w-0 flex-1"
                    data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_ad34">
                    <div
                      className="flex items-center gap-2"
                      data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_89de">
                      <span
                        className="text-sm font-medium text-foreground"
                        data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_8c18">{check.name}</span>
                      <Badge
                        variant={check.status === 'pass' ? 'new' : check.status === 'warn' ? 'default' : 'free'}
                        className="text-[10px]"
                        data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_7dd3">
                        {check.points}/{check.maxPoints}
                      </Badge>
                    </div>
                    <p
                      className="mt-1 text-xs text-muted-foreground"
                      data-icod-id="src_pages_dashboard_dashboardlocalseo_tsx_ded9">{check.details}</p>
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
