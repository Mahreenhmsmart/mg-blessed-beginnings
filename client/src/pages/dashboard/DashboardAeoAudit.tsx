import { useEffect, useState } from 'react';
import { Brain, Sparkles, CheckCircle2, AlertCircle, XCircle, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAuditById } from '@/store/slices/auditsSlice';
import { Button, Badge, Spinner } from '@/components/ui';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EmptyStatePanel from '@/components/dashboard/EmptyStatePanel';
import ScoreCard from '@/components/dashboard/ScoreCard';
import type { CheckResult } from '@/types';

function StatusIcon({ status }: { status: string }) {
  if (status === 'pass') return (
    <CheckCircle2
      className="h-4 w-4 text-success"
      data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_8eec" />
  );
  if (status === 'warn') return (
    <AlertCircle
      className="h-4 w-4 text-warning"
      data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_0e24" />
  );
  return (
    <XCircle
      className="h-4 w-4 text-accent"
      data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_4238" />
  );
}

export default function DashboardAeoAudit() {
  const dispatch = useAppDispatch();
  const { currentProjectId } = useAppSelector((s) => s.projects);
  const { audits, currentAudit, fetchStatus } = useAppSelector((s) => s.audits);

  // Get latest completed audit
  const latestAudit = audits.find((a) => a.status === 'completed') || null;
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedAuditId) {
      dispatch(fetchAuditById(selectedAuditId));
    }
  }, [selectedAuditId, dispatch]);

  const audit = currentAudit || latestAudit;
  const aeoResults = audit?.results?.aeo;
  const aeoScore = audit?.scores?.aeo ?? 0;

  // Separate AI search readiness checks from original AEO checks
  const aiSearchChecks = aeoResults?.checks?.filter((c: CheckResult) =>
    ['aeo-clear-answers', 'aeo-entity-context', 'aeo-author-info', 'aeo-trust-signals', 'aeo-citations', 'aeo-org-info'].includes(c.id)
  ) || [];
  const coreAeoChecks = aeoResults?.checks?.filter((c: CheckResult) =>
    !['aeo-clear-answers', 'aeo-entity-context', 'aeo-author-info', 'aeo-trust-signals', 'aeo-citations', 'aeo-org-info'].includes(c.id)
  ) || [];

  // Generate "How AI Search Engines May Understand This Page" summary
  const generateAISummary = () => {
    if (!aeoResults) return null;
    const passed = aeoResults.checks.filter((c: CheckResult) => c.status === 'pass');
    const failed = aeoResults.checks.filter((c: CheckResult) => c.status === 'fail');
    const warnings = aeoResults.checks.filter((c: CheckResult) => c.status === 'warn');

    const items: string[] = [];
    if (passed.length > 0) {
      items.push(`AI search engines can identify ${passed.length} well-structured elements on this page.`);
    }
    if (failed.length > 0) {
      items.push(`${failed.length} area(s) need attention for AI search readiness: ${failed.map((c: CheckResult) => c.name).join(', ')}.`);
    }
    if (warnings.length > 0) {
      items.push(`${warnings.length} area(s) could be improved to strengthen AI understanding.`);
    }
    return items;
  };

  if (!currentProjectId) {
    return (
      <div
        className="flex flex-col gap-8"
        data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_d05e">
        <div data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_1009">
          <h1
            className="font-heading text-2xl font-bold text-foreground sm:text-3xl tracking-tight"
            data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_2666">
            AEO / AI Search Audit
          </h1>
          <p
            className="mt-2 text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_4a54">
            Evaluate how well your pages are structured for AI search engines and answer platforms.
          </p>
        </div>
        <EmptyStatePanel
          icon={Brain}
          title="No project selected"
          description="Select a project from the sidebar to view AI search readiness analysis."
          data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_94f2" />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-8"
      data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_11ea">
      <div data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_f5f2">
        <div
          className="flex items-center gap-3"
          data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_2d74">
          <Brain
            className="h-7 w-7 text-primary"
            data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_489d" />
          <h1
            className="font-heading text-2xl font-bold text-foreground sm:text-3xl tracking-tight"
            data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_4076">
            AEO / AI Search Audit
          </h1>
        </div>
        <p
          className="mt-2 text-sm text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_be68">
          AI-search readiness analysis — how well AI engines like ChatGPT, Perplexity, and Google SGE can understand and cite your content.
        </p>
      </div>
      {fetchStatus === 'loading' ? (
        <div
          className="flex justify-center py-12"
          data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_314b">
          <Spinner size="lg" data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_f647" />
        </div>
      ) : !audit ? (
        <EmptyStatePanel
          icon={Brain}
          title="No audit data available"
          description="Run an audit from the Overview page to see AI search readiness results."
          data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_346f" />
      ) : (
        <>
          {/* Score overview */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_3937">
            <ScoreCard
              title="AEO Score"
              score={aeoScore}
              maxScore={100}
              color="var(--color-teal)"
              label="AI Search Readiness"
              data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_0545" />
            <div
              className="sm:col-span-2 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
              data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_8e1e">
              <h3
                className="font-heading text-sm font-semibold text-foreground mb-3"
                data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_1cd0">
                How AI Search Engines May Understand This Page
              </h3>
              <div
                className="flex flex-col gap-2"
                data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_77dd">
                {generateAISummary()?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2"
                    data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_f84b">
                    <Sparkles
                      className="h-4 w-4 mt-0.5 text-primary shrink-0"
                      data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_62b8" />
                    <p
                      className="text-sm text-muted-foreground"
                      data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_796c">{item}</p>
                  </div>
                ))}
              </div>
              <div
                className="mt-4 pt-4 border-t border-border/40"
                data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_8539">
                <Button
                  variant="primary"
                  size="sm"
                  data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_7b0d">
                  Improve for AI Search
                  <ArrowRight
                    className="ml-2 h-4 w-4"
                    data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_c3a6" />
                </Button>
              </div>
            </div>
          </div>

          {/* AI Search Readiness Checks */}
          <DashboardCard
            heading="AI Search Readiness"
            icon={<Brain
              className="h-5 w-5"
              data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_8f29" />}
            data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_6562">
            <div
              className="flex flex-col gap-3"
              data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_c699">
              {aiSearchChecks.map((check: CheckResult) => (
                <div
                  key={check.id}
                  className="flex items-start gap-3 rounded-lg border border-border/30 bg-card p-4"
                  data-icod-id={`src_pages_dashboard_dashboardaeoaudit_tsx_8e89_${check.id}`}>
                  <StatusIcon
                    status={check.status}
                    data-icod-id={`src_pages_dashboard_dashboardaeoaudit_tsx_e168_${check.id}`} />
                  <div
                    className="min-w-0 flex-1"
                    data-icod-id={`src_pages_dashboard_dashboardaeoaudit_tsx_cc79_${check.id}`}>
                    <div
                      className="flex items-center gap-2"
                      data-icod-id={`src_pages_dashboard_dashboardaeoaudit_tsx_52fa_${check.id}`}>
                      <span
                        className="text-sm font-medium text-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardaeoaudit_tsx_bb76_${check.id}`}>{check.name}</span>
                      <Badge
                        variant={check.status === 'pass' ? 'new' : check.status === 'warn' ? 'default' : 'free'}
                        className="text-[10px]"
                        data-icod-id={`src_pages_dashboard_dashboardaeoaudit_tsx_8c13_${check.id}`}>
                        {check.points}/{check.maxPoints}
                      </Badge>
                    </div>
                    <p
                      className="mt-1 text-xs text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardaeoaudit_tsx_9fae_${check.id}`}>{check.details}</p>
                  </div>
                </div>
              ))}
              {aiSearchChecks.length === 0 && (
                <p
                  className="text-sm text-muted-foreground py-4"
                  data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_e4d4">No AI search readiness checks available yet.</p>
              )}
            </div>
          </DashboardCard>

          {/* Core AEO Checks */}
          <DashboardCard
            heading="Answer Engine Optimization"
            data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_409a">
            <div
              className="flex flex-col gap-3"
              data-icod-id="src_pages_dashboard_dashboardaeoaudit_tsx_7b02">
              {coreAeoChecks.map((check: CheckResult) => (
                <div
                  key={check.id}
                  className="flex items-start gap-3 rounded-lg border border-border/30 bg-card p-4"
                  data-icod-id={`src_pages_dashboard_dashboardaeoaudit_tsx_e909_${check.id}`}>
                  <StatusIcon
                    status={check.status}
                    data-icod-id={`src_pages_dashboard_dashboardaeoaudit_tsx_5a98_${check.id}`} />
                  <div
                    className="min-w-0 flex-1"
                    data-icod-id={`src_pages_dashboard_dashboardaeoaudit_tsx_6de9_${check.id}`}>
                    <div
                      className="flex items-center gap-2"
                      data-icod-id={`src_pages_dashboard_dashboardaeoaudit_tsx_48de_${check.id}`}>
                      <span
                        className="text-sm font-medium text-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardaeoaudit_tsx_7847_${check.id}`}>{check.name}</span>
                      <Badge
                        variant={check.status === 'pass' ? 'new' : check.status === 'warn' ? 'default' : 'free'}
                        className="text-[10px]"
                        data-icod-id={`src_pages_dashboard_dashboardaeoaudit_tsx_812f_${check.id}`}>
                        {check.points}/{check.maxPoints}
                      </Badge>
                    </div>
                    <p
                      className="mt-1 text-xs text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardaeoaudit_tsx_a347_${check.id}`}>{check.details}</p>
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
