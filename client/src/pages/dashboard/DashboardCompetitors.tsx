import { useState, useEffect } from 'react';
import { Users, ExternalLink, Plus, Trash2, RefreshCw, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import {
  fetchCompetitorComparison,
  fetchCompetitorIntelligence,
  addCompetitorUrl,
  removeCompetitorUrl,
  triggerCompetitorAuditThunk,
} from '@/store/slices/analysisSlice';
import { Button, Input, Badge, Spinner, Alert } from '@/components/ui';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EmptyStatePanel from '@/components/dashboard/EmptyStatePanel';

const LAYERS = [
  { key: 'seo', label: 'SEO', color: 'var(--color-purple)' },
  { key: 'aeo', label: 'AEO', color: 'var(--color-teal)' },
  { key: 'geo', label: 'GEO', color: 'var(--color-pink)' },
  { key: 'aio', label: 'AIO', color: 'var(--color-gold)' },
  { key: 'sxo', label: 'SXO', color: 'var(--gradient-primary)' },
] as const;

const SEVERITY_ICONS = {
  critical: ShieldAlert,
  warning: AlertTriangle,
  info: Info,
};

const SEVERITY_STYLES = {
  critical: 'border-destructive/40 bg-destructive/5',
  warning: 'border-warning/40 bg-warning/5',
  info: 'border-border/40 bg-muted/30',
};

export default function DashboardCompetitors() {
  const dispatch = useAppDispatch();
  const { currentProjectId } = useAppSelector((s) => s.projects);
  const { competitorComparison, competitorStatus, competitorIntelligence, competitorIntelStatus } = useAppSelector((s) => s.analysis);
  const userRole = useAppSelector((s) => s.auth.user?.role) || 'viewer';
  const canWrite = userRole !== 'viewer';
  const [newCompetitorUrl, setNewCompetitorUrl] = useState('');

  useEffect(() => {
    if (currentProjectId) {
      dispatch(fetchCompetitorComparison(currentProjectId));
      dispatch(fetchCompetitorIntelligence(currentProjectId));
    }
  }, [currentProjectId, dispatch]);

  const handleAddCompetitor = () => {
    if (!currentProjectId || !newCompetitorUrl.trim()) return;
    try {
      new URL(newCompetitorUrl.trim());
    } catch {
      dispatch(addToast({ message: 'Please enter a valid URL.', variant: 'error' }));
      return;
    }
    dispatch(addCompetitorUrl({ projectId: currentProjectId, url: newCompetitorUrl.trim() }))
      .then(() => {
        dispatch(addToast({ message: 'Competitor added! Audit starting...', variant: 'success' }));
        setNewCompetitorUrl('');
        setTimeout(() => dispatch(fetchCompetitorComparison(currentProjectId)), 3000);
      })
      .catch(() => {
        dispatch(addToast({ message: 'Failed to add competitor.', variant: 'error' }));
      });
  };

  const handleRemoveCompetitor = (url: string) => {
    if (!currentProjectId) return;
    dispatch(removeCompetitorUrl({ projectId: currentProjectId, url }))
      .then(() => {
        dispatch(addToast({ message: 'Competitor removed.', variant: 'success' }));
        dispatch(fetchCompetitorComparison(currentProjectId));
      });
  };

  const handleTriggerAudit = () => {
    if (!currentProjectId) return;
    dispatch(triggerCompetitorAuditThunk(currentProjectId))
      .then(() => {
        dispatch(addToast({ message: 'Competitor audit started!', variant: 'success' }));
        setTimeout(() => {
          dispatch(fetchCompetitorComparison(currentProjectId));
          dispatch(fetchCompetitorIntelligence(currentProjectId));
        }, 10000);
      })
      .catch(() => {
        dispatch(addToast({ message: 'Failed to start competitor audit.', variant: 'error' }));
      });
  };

  const isLoading = competitorStatus === 'loading';
  const isIntelLoading = competitorIntelStatus === 'loading';
  const competitorsOnly = competitorComparison.filter((_, i) => i > 0);

  return (
    <div
      className="flex flex-col gap-8"
      data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_5cfc">
      <div data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_8618">
        <h1
          className="font-heading text-2xl font-bold text-foreground sm:text-3xl tracking-tight"
          data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_bdc9">
          Competitor Intelligence
        </h1>
        <p
          className="mt-2 text-sm text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_fadd">
          Compare your visibility scores and detailed metrics against competitors side-by-side.
        </p>
      </div>
      {/* Add Competitor Form */}
      {currentProjectId && (
        <DashboardCard
          heading="Manage Competitors"
          data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_caf5">
          <div
            className="flex flex-col gap-4"
            data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_8488">
            {canWrite && (
              <div
                className="flex items-end gap-3"
                data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_4e77">
                <div
                  className="flex-1"
                  data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_ae32">
                  <label
                    htmlFor="competitor-url"
                    className="mb-1.5 block text-xs font-medium text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_e494">
                    Add Competitor URL
                  </label>
                  <Input
                    id="competitor-url"
                    type="url"
                    placeholder="https://competitor.com"
                    value={newCompetitorUrl}
                    onChange={(e) => setNewCompetitorUrl(e.target.value)}
                    data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_68ab" />
                </div>
                <Button
                  onClick={handleAddCompetitor}
                  disabled={!newCompetitorUrl.trim()}
                  data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_7601">
                  <Plus
                    className="h-4 w-4"
                    data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_3c91" />
                  Add
                </Button>
              </div>
            )}

            <div
              className="flex items-center justify-between pt-2"
              data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_c34c">
              <span
                className="text-xs text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_edf7">
                {competitorsOnly.length} competitor(s) configured
              </span>
              {canWrite && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTriggerAudit}
                  loading={isLoading}
                  disabled={competitorsOnly.length === 0}
                  data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_5c05">
                  <RefreshCw
                    className="h-3 w-3"
                    data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_2836" />
                  Run Competitor Audit
                </Button>
              )}
            </div>

            {competitorsOnly.length > 0 && (
              <div
                className="flex flex-wrap gap-2 pt-2"
                data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_69b7">
                {competitorsOnly.map((comp) => (
                  <div
                    key={comp.url}
                    className="flex items-center gap-2 rounded-lg border border-border/40 px-3 py-1.5"
                    data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_e484_${comp.url}`}>
                    <span
                      className="truncate text-xs text-foreground max-w-[200px]"
                      data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_734e_${comp.url}`}>{comp.url}</span>
                    {canWrite && (
                      <button
                        onClick={() => handleRemoveCompetitor(comp.url)}
                        className="text-muted-foreground hover:text-accent transition-colors"
                        aria-label={`Remove ${comp.url}`}
                        data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_f6bf_${comp.url}`}>
                        <Trash2
                          className="h-3 w-3"
                          data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_a7de_${comp.url}`} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DashboardCard>
      )}
      {/* Score Comparison Table */}
      {isLoading ? (
        <div
          className="flex justify-center py-16"
          data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_1a5b">
          <Spinner
            size="lg"
            data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_8719" />
        </div>
      ) : competitorComparison.length > 0 ? (
        <>
          <DashboardCard
            heading="Score Overview"
            data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_8802">
            <Alert
              variant="info"
              data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_71c9">
              Competitor analysis is based on crawl-based heuristics and AI estimation. Results are directional estimates, not exact metrics.
            </Alert>
            <div
              className="overflow-x-auto mt-4"
              data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_3271">
              <table
                className="w-full text-left text-sm"
                data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_f6f7">
                <thead
                  className="bg-muted/50"
                  data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_62b1">
                  <tr
                    className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_b099">
                    <th
                      className="px-4 py-3 min-w-[200px]"
                      data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_ba8d">Website</th>
                    {LAYERS.map((l) => (
                      <th
                        key={l.key}
                        className="px-4 py-3"
                        data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_8a8f_${l.key}`}>{l.label}</th>
                    ))}
                    <th
                      className="px-4 py-3"
                      data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_933d">Average</th>
                  </tr>
                </thead>
                <tbody data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_6078">
                  {competitorComparison.map((comp, i) => {
                    const avg = comp.scores
                      ? Math.round(Object.values(comp.scores).reduce((a, b) => a + b, 0) / 5)
                      : null;
                    return (
                      <tr
                        key={i}
                        className={`border-b border-border/30 ${i === 0 ? 'bg-primary/5' : ''}`}
                        data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_a30d_${i}`}>
                        <td
                          className="px-4 py-3"
                          data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_0f21_${i}`}>
                          <div
                            className="flex items-center gap-2"
                            data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_08e0_${i}`}>
                            <span
                              className={`text-sm font-medium ${i === 0 ? 'text-primary' : 'text-foreground'}`}
                              data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_0896_${i}`}>
                              {i === 0 ? 'Your Site' : (() => { try { return new URL(comp.url).hostname; } catch { return comp.url; } })()}
                            </span>
                            {i !== 0 && <ExternalLink
                              className="h-3 w-3 text-muted-foreground"
                              data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_7592_${i}`} />}
                          </div>
                          <p
                            className="text-xs text-muted-foreground truncate max-w-[200px]"
                            data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_26c9_${i}`}>{comp.url}</p>
                        </td>
                        {LAYERS.map((l) => (
                          <td
                            key={l.key}
                            className="px-4 py-3 font-medium"
                            data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_971e_${i}_${l.key}`}>
                            {comp.scores ? (
                              <span
                                data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_7e04_${i}_${l.key}`}>{comp.scores[l.key as keyof typeof comp.scores]}</span>
                            ) : (
                              <Badge
                                variant="default"
                                className="text-[9px]"
                                data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_4e54_${i}_${l.key}`}>Pending Audit</Badge>
                            )}
                          </td>
                        ))}
                        <td
                          className="px-4 py-3 font-bold"
                          data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_d317_${i}`}>
                          {avg !== null ? avg : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DashboardCard>

          {/* Comparison Matrix */}
          {isIntelLoading ? (
            <div
              className="flex justify-center py-12"
              data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_0c35">
              <Spinner
                size="md"
                data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_8521" />
            </div>
          ) : competitorIntelligence ? (
            <>
              <DashboardCard
                heading="Detailed Comparison Matrix"
                data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_d503">
                <Alert
                  variant="info"
                  data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_8519">
                  Data extracted from crawling available pages. Metrics represent what the crawler could discover.
                </Alert>
                <div
                  className="overflow-x-auto mt-4"
                  data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_b9c6">
                  <table
                    className="w-full text-left text-sm"
                    data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_ed5b">
                    <thead
                      className="bg-muted/50"
                      data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_a302">
                      <tr
                        className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground"
                        data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_d040">
                        <th
                          className="px-4 py-3 min-w-[140px]"
                          data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_e925">Metric</th>
                        <th
                          className="px-4 py-3 min-w-[120px]"
                          data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_cf10">Your Site</th>
                        {competitorIntelligence.competitors.map((comp, i) => (
                          <th
                            key={i}
                            className="px-4 py-3 min-w-[120px]"
                            data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_417a_${i}`}>
                            {(() => { try { return new URL(comp.url).hostname; } catch { return `Competitor ${i + 1}`; } })()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_3a5a">
                      {[
                        { label: 'Title', key: 'title', format: (v: unknown) => String(v || 'N/A').substring(0, 50) },
                        { label: 'H1 Heading', key: 'h1', format: (v: unknown) => String(v || 'None').substring(0, 50) },
                        { label: 'Content Words', key: 'wordCount', format: (v: unknown) => String(v ?? 0) },
                        { label: 'Keywords Found', key: 'keywordCount', format: (v: unknown) => String(v ?? 0) },
                        { label: 'Internal Links', key: 'internalLinks', format: (v: unknown) => String(v ?? 0) },
                        { label: 'External Links', key: 'externalLinks', format: (v: unknown) => String(v ?? 0) },
                        { label: 'Schema Markup', key: 'schemaMarkup', format: (v: unknown) => v ? 'Yes' : 'No' },
                        { label: 'HTTPS', key: 'https', format: (v: unknown) => v ? 'Yes' : 'No' },
                        { label: 'Security Headers', key: 'securityHeadersCount', format: (v: unknown) => String(v ?? 0) },
                      ].map((row) => (
                        <tr
                          key={row.key}
                          className="border-b border-border/30 hover:bg-muted/30"
                          data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_9819_${row.key}`}>
                          <td
                            className="px-4 py-3 font-medium text-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_8d74_${row.key}`}>{row.label}</td>
                          <td
                            className="px-4 py-3 text-primary font-medium"
                            data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_76d7_${row.key}`}>
                            {row.format((competitorIntelligence.mainSite as unknown as Record<string, unknown>)[row.key])}
                          </td>
                          {competitorIntelligence.competitors.map((comp, i) => (
                            <td
                              key={i}
                              className="px-4 py-3 text-muted-foreground"
                              data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_ffa3_${row.key}_${i}`}>
                              {row.format((comp as unknown as Record<string, unknown>)[row.key])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DashboardCard>

              {/* What Competitors Do That You Don't */}
              {competitorIntelligence.gaps.length > 0 && (
                <DashboardCard
                  heading="What Competitors Do That You Don't"
                  data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_b5e6">
                  <div
                    className="flex flex-col gap-3"
                    data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_cc9f">
                    {competitorIntelligence.gaps.map((gap, i) => {
                      const Icon = SEVERITY_ICONS[gap.severity];
                      return (
                        <div
                          key={i}
                          className={`flex items-start gap-3 rounded-lg border p-3 ${SEVERITY_STYLES[gap.severity]}`}
                          data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_4b09_${i}`}>
                          <Icon
                            className={`h-4 w-4 shrink-0 mt-0.5 ${gap.severity === 'critical' ? 'text-destructive' : gap.severity === 'warning' ? 'text-warning' : 'text-muted-foreground'}`}
                            data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_54dd_${i}`} />
                          <div
                            className="min-w-0 flex-1"
                            data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_2da1_${i}`}>
                            <div
                              className="flex items-center gap-2 mb-1"
                              data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_88b3_${i}`}>
                              <Badge
                                variant={gap.severity === 'critical' ? 'free' : gap.severity === 'warning' ? 'new' : 'default'}
                                className="text-[9px]"
                                data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_a2de_${i}`}>
                                {gap.severity}
                              </Badge>
                              <span
                                className="text-xs text-muted-foreground"
                                data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_62b5_${i}`}>{gap.competitor}</span>
                            </div>
                            <p
                              className="text-sm text-foreground"
                              data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_8aa3_${i}`}>{gap.gap}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </DashboardCard>
              )}

              {/* Content Topic Overlap */}
              <DashboardCard
                heading="Content Topics Comparison"
                data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_9903">
                <div
                  className="grid grid-cols-1 gap-6 lg:grid-cols-2"
                  data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_29e1">
                  <div data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_9cf5">
                    <p
                      className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_9bc6">Your Site Topics</p>
                    <div
                      className="flex flex-wrap gap-1.5"
                      data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_6dee">
                      {(competitorIntelligence.mainSite.contentTopics || []).length > 0 ? (
                        competitorIntelligence.mainSite.contentTopics.map((topic, i) => (
                          <span
                            key={i}
                            className="inline-block rounded-md bg-success/10 px-2 py-1 text-[10px] font-medium text-success border border-success/20"
                            data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_c401_${i}`}>
                            {topic.substring(0, 40)}
                          </span>
                        ))
                      ) : (
                        <span
                          className="text-xs text-muted-foreground"
                          data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_96ce">No topics discovered</span>
                      )}
                    </div>
                  </div>
                  <div data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_d196">
                    <p
                      className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_db41">Competitor Topics</p>
                    <div
                      className="flex flex-wrap gap-1.5"
                      data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_e378">
                      {competitorIntelligence.competitors.flatMap((comp, ci) =>
                        (comp.contentTopics || []).map((topic, ti) => (
                          <span
                            key={`${ci}-${ti}`}
                            className="inline-block rounded-md bg-accent/10 px-2 py-1 text-[10px] font-medium text-accent-foreground border border-accent/20"
                            data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_72af_${ti}`}>
                            {topic.substring(0, 40)}
                          </span>
                        ))
                      ).slice(0, 30)}
                      {competitorIntelligence.competitors.every(c => !c.contentTopics || c.contentTopics.length === 0) && (
                        <span
                          className="text-xs text-muted-foreground"
                          data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_ff0a">No topics discovered</span>
                      )}
                    </div>
                  </div>
                </div>
              </DashboardCard>
            </>
          ) : null}

          {/* Per-layer breakdown cards */}
          <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
            data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_4d6c">
            {LAYERS.map((layer) => (
              <DashboardCard
                key={layer.key}
                heading={`${layer.label} Comparison`}
                data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_8541_${layer.key}`}>
                <div
                  className="flex flex-col gap-3"
                  data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_51af_${layer.key}`}>
                  {competitorComparison.map((comp, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border/30 p-2"
                      data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_6698_${layer.key}_${i}`}>
                      <span
                        className="truncate text-xs text-foreground max-w-[100px]"
                        data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_1d55_${layer.key}_${i}`}>
                        {i === 0 ? 'You' : (() => { try { return new URL(comp.url).hostname; } catch { return comp.url; } })()}
                      </span>
                      {comp.scores ? (
                        <span
                          className="text-sm font-bold"
                          style={{ color: layer.color }}
                          data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_f18e_${layer.key}_${i}`}>
                          {comp.scores[layer.key as keyof typeof comp.scores]}
                        </span>
                      ) : (
                        <span
                          className="text-xs text-muted-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardcompetitors_tsx_93cd_${layer.key}_${i}`}>—</span>
                      )}
                    </div>
                  ))}
                </div>
              </DashboardCard>
            ))}
          </div>
        </>
      ) : (
        <DashboardCard
          heading="Competitors"
          data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_487c">
          <EmptyStatePanel
            icon={Users}
            title="No competitors configured"
            description="Add competitor URLs above to see side-by-side comparisons."
            className="py-12"
            data-icod-id="src_pages_dashboard_dashboardcompetitors_tsx_8a02" />
        </DashboardCard>
      )}
    </div>
  );
}
