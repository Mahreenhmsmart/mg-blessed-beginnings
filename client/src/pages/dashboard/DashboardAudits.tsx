import { useEffect, useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, XCircle, Clock, Trash2, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { fetchAuditsByProject, fetchAuditById } from '@/store/slices/auditsSlice';
import {
  fetchSchedule,
  createOrUpdateSchedule,
  toggleSchedule,
  removeSchedule,
} from '@/store/slices/analysisSlice';
import { Button, Badge, Spinner, Input, Pagination, CopyButton } from '@/components/ui';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EmptyStatePanel from '@/components/dashboard/EmptyStatePanel';
import type { Audit, CheckResult, LayerResults, Recommendation } from '@/types';

const AUDITS_PER_PAGE = 10;

const LAYER_LABELS: Record<string, { label: string; color: string }> = {
  seo: { label: 'SEO', color: 'var(--color-purple)' },
  aeo: { label: 'AEO', color: 'var(--color-teal)' },
  geo: { label: 'GEO', color: 'var(--color-pink)' },
  aio: { label: 'AIO', color: 'var(--color-gold)' },
  sxo: { label: 'SXO', color: 'var(--gradient-primary)' },
  cq: { label: 'CQ', color: 'rgb(var(--accent))' },
};

function StatusIcon({ status }: { status: string }) {
  if (status === 'pass') return (
    <CheckCircle2
      className="h-4 w-4 text-success"
      data-icod-id="src_pages_dashboard_dashboardaudits_tsx_1408" />
  );
  if (status === 'warn') return (
    <AlertCircle
      className="h-4 w-4 text-warning"
      data-icod-id="src_pages_dashboard_dashboardaudits_tsx_e29f" />
  );
  return (
    <XCircle
      className="h-4 w-4 text-accent"
      data-icod-id="src_pages_dashboard_dashboardaudits_tsx_07a5" />
  );
}

function LayerDetail({ name, results }: { name: string; results: LayerResults }) {
  const [expanded, setExpanded] = useState(false);
  const meta = LAYER_LABELS[name] || { label: name.toUpperCase(), color: 'var(--color-purple)' };

  return (
    <div
      className="rounded-xl border border-border/40 overflow-hidden"
      data-icod-id="src_pages_dashboard_dashboardaudits_tsx_006f">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
        data-icod-id="src_pages_dashboard_dashboardaudits_tsx_ec4a">
        <div
          className="flex items-center gap-3"
          data-icod-id="src_pages_dashboard_dashboardaudits_tsx_3442">
          <span
            className="font-heading text-sm font-semibold text-foreground"
            data-icod-id="src_pages_dashboard_dashboardaudits_tsx_00bc">{meta.label}</span>
          <Badge
            variant="default"
            className="text-[10px]"
            data-icod-id="src_pages_dashboard_dashboardaudits_tsx_d00d">
            Score: {results.score}/{results.maxScore}
          </Badge>
        </div>
        {expanded ? <ChevronUp
          className="h-4 w-4 text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardaudits_tsx_8658" /> : <ChevronDown
          className="h-4 w-4 text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardaudits_tsx_b231" />}
      </button>
      {expanded && (
        <div
          className="border-t border-border/40 bg-muted/20 px-4 py-3"
          data-icod-id="src_pages_dashboard_dashboardaudits_tsx_ba3f">
          <div
            className="flex flex-col gap-2"
            data-icod-id="src_pages_dashboard_dashboardaudits_tsx_a04d">
            {results.checks.map((check: CheckResult) => (
              <div
                key={check.id}
                className="flex items-start gap-3 rounded-lg border border-border/30 bg-card p-3"
                data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_686d_${check.id}`}>
                <StatusIcon
                  status={check.status}
                  data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_6494_${check.id}`} />
                <div
                  className="min-w-0 flex-1"
                  data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_9368_${check.id}`}>
                  <div
                    className="flex items-center gap-2"
                    data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_ad4d_${check.id}`}>
                    <span
                      className="text-sm font-medium text-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_960c_${check.id}`}>{check.name}</span>
                    <span
                      className="text-xs text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_f291_${check.id}`}>
                      ({check.points}/{check.maxPoints})
                    </span>
                  </div>
                  <p
                    className="mt-0.5 text-xs text-muted-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_3a25_${check.id}`}>{check.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Extract the current value from a recommendation description for display */
function extractCurrentValue(rec: Recommendation): string {
  // Try to extract "Current value: ..." pattern from description
  const match = rec.description.match(/Current value:\s*["']?([^"']+?)["']?\s*$/);
  if (match) return match[1];
  // Fallback: try to find quoted text
  const quoteMatch = rec.description.match(/Current[^:]*:\s*"([^"]+)"/);
  if (quoteMatch) return quoteMatch[1];
  // Last resort: show first 100 chars of description
  return rec.description.substring(0, 100);
}

export default function DashboardAudits() {
  const dispatch = useAppDispatch();
  const { currentProjectId } = useAppSelector((s) => s.projects);
  const { audits, currentAudit, fetchStatus } = useAppSelector((s) => s.audits);
  const { schedule } = useAppSelector((s) => s.analysis);
  const userRole = useAppSelector((s) => s.auth.user?.role) || 'viewer';
  const canWrite = userRole !== 'viewer';
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [scheduleFreq, setScheduleFreq] = useState<'weekly' | 'monthly'>('weekly');
  const [scheduleDayOfWeek, setScheduleDayOfWeek] = useState(1); // Monday
  const [scheduleDayOfMonth, setScheduleDayOfMonth] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (currentProjectId) {
      dispatch(fetchAuditsByProject(currentProjectId));
      dispatch(fetchSchedule(currentProjectId));
    }
  }, [currentProjectId, dispatch]);

  useEffect(() => {
    if (selectedAuditId) {
      dispatch(fetchAuditById(selectedAuditId));
    }
  }, [selectedAuditId, dispatch]);

  // Pagination for audits
  const totalPages = Math.ceil(audits.length / AUDITS_PER_PAGE);
  const paginatedAudits = useMemo(() => {
    const start = (currentPage - 1) * AUDITS_PER_PAGE;
    return audits.slice(start, start + AUDITS_PER_PAGE);
  }, [audits, currentPage]);

  const handleViewAudit = (auditId: string) => {
    setSelectedAuditId(auditId === selectedAuditId ? null : auditId);
  };

  const handleSaveSchedule = () => {
    if (!currentProjectId) return;
    dispatch(createOrUpdateSchedule({
      projectId: currentProjectId,
      frequency: scheduleFreq,
      dayOfWeek: scheduleFreq === 'weekly' ? scheduleDayOfWeek : undefined,
      dayOfMonth: scheduleFreq === 'monthly' ? scheduleDayOfMonth : undefined,
    }))
      .then(() => {
        dispatch(addToast({ message: 'Schedule saved!', variant: 'success' }));
        dispatch(fetchSchedule(currentProjectId));
      })
      .catch(() => {
        dispatch(addToast({ message: 'Failed to save schedule.', variant: 'error' }));
      });
  };

  const handleToggleSchedule = () => {
    if (!currentProjectId || !schedule) return;
    dispatch(toggleSchedule({ projectId: currentProjectId, isActive: !schedule.isActive }))
      .then(() => dispatch(fetchSchedule(currentProjectId)));
  };

  const handleDeleteSchedule = () => {
    if (!currentProjectId) return;
    dispatch(removeSchedule(currentProjectId))
      .then(() => {
        dispatch(addToast({ message: 'Schedule deleted.', variant: 'success' }));
      });
  };

  const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div
      className="flex flex-col gap-8"
      data-icod-id="src_pages_dashboard_dashboardaudits_tsx_5e11">
      <div data-icod-id="src_pages_dashboard_dashboardaudits_tsx_ec31">
        <h1
          className="font-heading text-2xl font-bold text-foreground sm:text-3xl tracking-tight"
          data-icod-id="src_pages_dashboard_dashboardaudits_tsx_3b13">
          Website Audits
        </h1>
        <p
          className="mt-2 text-sm text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardaudits_tsx_c44e">
          View audit history and drill down into detailed check results per layer.
        </p>
      </div>
      {/* Audit History Table */}
      <DashboardCard
        heading="Audit History"
        data-icod-id="src_pages_dashboard_dashboardaudits_tsx_33bb">
        {fetchStatus === 'loading' ? (
          <div
            className="flex justify-center py-12"
            data-icod-id="src_pages_dashboard_dashboardaudits_tsx_5dc6"><Spinner size="lg" data-icod-id="src_pages_dashboard_dashboardaudits_tsx_3dea" /></div>
        ) : audits.length > 0 ? (
          <div
            className="overflow-x-auto rounded-lg border border-border/50"
            data-icod-id="src_pages_dashboard_dashboardaudits_tsx_2efe">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_dashboardaudits_tsx_3bcc">
              <thead
                className="bg-muted/50"
                data-icod-id="src_pages_dashboard_dashboardaudits_tsx_fffd">
                <tr
                  className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardaudits_tsx_6954">
                  <th
                    className="px-4 py-3 pr-4"
                    data-icod-id="src_pages_dashboard_dashboardaudits_tsx_42a7">Date</th>
                  <th
                    className="px-4 py-3 pr-4"
                    data-icod-id="src_pages_dashboard_dashboardaudits_tsx_e6da">SEO</th>
                  <th
                    className="px-4 py-3 pr-4"
                    data-icod-id="src_pages_dashboard_dashboardaudits_tsx_ab0b">AEO</th>
                  <th
                    className="px-4 py-3 pr-4"
                    data-icod-id="src_pages_dashboard_dashboardaudits_tsx_5f79">GEO</th>
                  <th
                    className="px-4 py-3 pr-4"
                    data-icod-id="src_pages_dashboard_dashboardaudits_tsx_2783">AIO</th>
                  <th
                    className="px-4 py-3 pr-4"
                    data-icod-id="src_pages_dashboard_dashboardaudits_tsx_cca8">SXO</th>
                  <th
                    className="px-4 py-3 pr-4"
                    data-icod-id="src_pages_dashboard_dashboardaudits_tsx_cq_col">CQ</th>
                  <th
                    className="px-4 py-3 pr-4"
                    data-icod-id="src_pages_dashboard_dashboardaudits_tsx_14d2">Status</th>
                  <th
                    className="px-4 py-3"
                    data-icod-id="src_pages_dashboard_dashboardaudits_tsx_342a">Action</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_pages_dashboard_dashboardaudits_tsx_8406">
                {paginatedAudits.map((audit: Audit) => (
                  <tr
                    key={audit._id}
                    className={`border-b border-border/30 cursor-pointer hover:bg-muted/30 transition-colors ${selectedAuditId === audit._id ? 'bg-primary/5' : ''}`}
                    onClick={() => handleViewAudit(audit._id)}
                    data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_a718_${audit._id}`}>
                    <td
                      className="px-4 py-3 text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_fdd3_${audit._id}`}>
                      {new Date(audit.createdAt).toLocaleDateString()}
                    </td>
                    <td
                      className="px-4 py-3 font-medium"
                      data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_98a3_${audit._id}`}>{audit.scores.seo}</td>
                    <td
                      className="px-4 py-3 font-medium"
                      data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_7a7f_${audit._id}`}>{audit.scores.aeo}</td>
                    <td
                      className="px-4 py-3 font-medium"
                      data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_f9a9_${audit._id}`}>{audit.scores.geo}</td>
                    <td
                      className="px-4 py-3 font-medium"
                      data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_cac4_${audit._id}`}>{audit.scores.aio}</td>
                    <td
                      className="px-4 py-3 font-medium"
                      data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_c9ef_${audit._id}`}>{audit.scores.sxo}</td>
                    <td
                      className="px-4 py-3 font-medium"
                      data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_cq_score_${audit._id}`}>{audit.scores.cq ?? 0}</td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_7d57_${audit._id}`}>
                      <Badge
                        variant={audit.status === 'completed' ? 'new' : audit.status === 'failed' ? 'free' : 'default'}
                        className="text-[10px]"
                        data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_7d90_${audit._id}`}>
                        {audit.status}
                      </Badge>
                    </td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_71c7_${audit._id}`}>
                      {selectedAuditId === audit._id ? (
                        <ChevronUp
                          className="h-4 w-4 text-primary"
                          data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_9908_${audit._id}`} />
                      ) : (
                        <ChevronDown
                          className="h-4 w-4 text-muted-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_5dd3_${audit._id}`} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyStatePanel
            icon={Search}
            title="No audits yet"
            description="Run an audit from the Overview page to see results here."
            className="py-12"
            data-icod-id="src_pages_dashboard_dashboardaudits_tsx_d1df" />
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="mt-4"
            data-icod-id="src_pages_dashboard_dashboardaudits_tsx_d614">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              data-icod-id="src_pages_dashboard_dashboardaudits_tsx_2b5a" />
          </div>
        )}
      </DashboardCard>
      {/* Expanded Audit Detail */}
      {selectedAuditId && currentAudit && currentAudit.status === 'completed' && (
        <DashboardCard
          heading={`Audit Detail — ${new Date(currentAudit.createdAt).toLocaleDateString()}`}
          data-icod-id="src_pages_dashboard_dashboardaudits_tsx_f9d6">
          <div
            className="flex flex-col gap-3"
            data-icod-id="src_pages_dashboard_dashboardaudits_tsx_431d">
            {Object.entries(currentAudit.results || {}).map(([layer, results], __icodIdx0) => (results && <LayerDetail
              key={layer}
              name={layer}
              results={results}
              data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_699f_${__icodIdx0}`} />))}
          </div>
        </DashboardCard>
      )}
      {/* On-Page SEO Recommendations with AI Suggestions */}
      {selectedAuditId && currentAudit && currentAudit.status === 'completed' && (() => {
        const onPageRecs = (currentAudit.recommendations || []).filter(
          (r: Recommendation) => r.suggestedText || r.currentPage,
        );
        if (onPageRecs.length === 0) return null;

        // Group by page URL
        const groupedByPage: Record<string, Recommendation[]> = {};
        for (const rec of onPageRecs) {
          const page = rec.currentPage || 'Unknown Page';
          if (!groupedByPage[page]) groupedByPage[page] = [];
          groupedByPage[page].push(rec);
        }

        return (
          <DashboardCard
            heading="On-Page SEO Recommendations"
            data-icod-id="src_pages_dashboard_dashboardaudits_tsx_ddee">
            <div
              className="flex flex-col gap-4"
              data-icod-id="src_pages_dashboard_dashboardaudits_tsx_e635">
              {Object.entries(groupedByPage).map(([pageUrl, recs]) => (
                <div
                  key={pageUrl}
                  className="rounded-xl border border-border/40 overflow-hidden"
                  data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_606c_${pageUrl}`}>
                  <div
                    className="px-4 py-2.5 bg-muted/30 border-b border-border/40"
                    data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_33c2_${pageUrl}`}>
                    <p
                      className="text-xs font-medium text-muted-foreground truncate"
                      data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_7199_${pageUrl}`}>{pageUrl}</p>
                  </div>
                  <div
                    className="flex flex-col gap-3 p-4"
                    data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_9f3d_${pageUrl}`}>
                    {recs.map((rec, idx) => (
                      <div
                        key={`${rec.title}-${idx}`}
                        className="rounded-lg border border-border/30 bg-card p-4"
                        data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_1d20_${pageUrl}_${idx}`}>
                        <div
                          className="flex items-start gap-3"
                          data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_afd8_${pageUrl}_${idx}`}>
                          <Sparkles
                            className="h-4 w-4 mt-0.5 text-primary shrink-0"
                            data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_050b_${pageUrl}_${idx}`} />
                          <div
                            className="min-w-0 flex-1"
                            data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_eb7c_${pageUrl}_${idx}`}>
                            <div
                              className="flex items-center gap-2 mb-1"
                              data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_b7eb_${pageUrl}_${idx}`}>
                              <span
                                className="text-sm font-medium text-foreground"
                                data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_12c5_${pageUrl}_${idx}`}>{rec.title}</span>
                              <Badge
                                variant={rec.severity === 'critical' ? 'free' : 'default'}
                                className="text-[10px]"
                                data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_15eb_${pageUrl}_${idx}`}>
                                {rec.severity}
                              </Badge>
                            </div>
                            <p
                              className="text-xs text-muted-foreground mb-3"
                              data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_8462_${pageUrl}_${idx}`}>{rec.description}</p>
                            {rec.suggestedText && (
                              <div
                                className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg bg-muted/20 p-3"
                                data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_25eb_${pageUrl}_${idx}`}>
                                <div
                                  data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_8e93_${pageUrl}_${idx}`}>
                                  <p
                                    className="text-[10px] font-medium uppercase tracking-wider text-warning mb-1"
                                    data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_4bdc_${pageUrl}_${idx}`}>Current</p>
                                  <p
                                    className="text-xs text-muted-foreground line-through decoration-warning/50 break-words"
                                    data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_967b_${pageUrl}_${idx}`}>
                                    {extractCurrentValue(rec)}
                                  </p>
                                </div>
                                <div
                                  data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_2b1f_${pageUrl}_${idx}`}>
                                  <div
                                    className="flex items-center justify-between mb-1"
                                    data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_c516_${pageUrl}_${idx}`}>
                                    <p
                                      className="text-[10px] font-medium uppercase tracking-wider text-success"
                                      data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_ea68_${pageUrl}_${idx}`}>AI Suggested</p>
                                    <CopyButton
                                      text={rec.suggestedText}
                                      label="Copy"
                                      className="h-6 px-1.5 text-[10px]"
                                      data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_bebc_${pageUrl}_${idx}`} />
                                  </div>
                                  <p
                                    className="text-xs text-success break-words font-medium"
                                    data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_9553_${pageUrl}_${idx}`}>
                                    {rec.suggestedText}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        );
      })()}
      {selectedAuditId && currentAudit && currentAudit.status === 'failed' && (
        <DashboardCard
          heading="Audit Failed"
          data-icod-id="src_pages_dashboard_dashboardaudits_tsx_99f9">
          <div
            className="rounded-xl border border-accent/30 bg-accent/5 p-4"
            data-icod-id="src_pages_dashboard_dashboardaudits_tsx_965d">
            <p
              className="text-sm text-accent"
              data-icod-id="src_pages_dashboard_dashboardaudits_tsx_9d71">{currentAudit.errorMessage || 'An unknown error occurred during the audit.'}</p>
          </div>
        </DashboardCard>
      )}
      {selectedAuditId && currentAudit && (currentAudit.status === 'queued' || currentAudit.status === 'running') && (
        <DashboardCard
          heading="Audit In Progress"
          data-icod-id="src_pages_dashboard_dashboardaudits_tsx_bc61">
          <div
            className="flex flex-col items-center gap-4 py-12"
            data-icod-id="src_pages_dashboard_dashboardaudits_tsx_61fa">
            <Spinner size="lg" data-icod-id="src_pages_dashboard_dashboardaudits_tsx_6c9b" />
            <p
              className="text-sm text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardaudits_tsx_c44b">Audit is {currentAudit.status}. Results will appear when complete.</p>
          </div>
        </DashboardCard>
      )}
      {/* Scheduled Audits */}
      {currentProjectId && (
        <DashboardCard
          heading="Scheduled Audits"
          data-icod-id="src_pages_dashboard_dashboardaudits_tsx_0fa4">
          <div
            className="flex flex-col gap-4"
            data-icod-id="src_pages_dashboard_dashboardaudits_tsx_499e">
            {schedule ? (
              <div
                className="flex flex-col gap-4 rounded-xl border border-border/40 p-4"
                data-icod-id="src_pages_dashboard_dashboardaudits_tsx_917d">
                <div
                  className="flex items-center justify-between"
                  data-icod-id="src_pages_dashboard_dashboardaudits_tsx_e06e">
                  <div
                    className="flex items-center gap-2"
                    data-icod-id="src_pages_dashboard_dashboardaudits_tsx_8621">
                    <Clock
                      className="h-4 w-4 text-primary"
                      data-icod-id="src_pages_dashboard_dashboardaudits_tsx_dfcf" />
                    <span
                      className="text-sm font-medium text-foreground"
                      data-icod-id="src_pages_dashboard_dashboardaudits_tsx_e10f">
                      {schedule.frequency === 'weekly'
                        ? `Every ${DAYS_OF_WEEK[schedule.dayOfWeek ?? 1]}`
                        : `Monthly on day ${schedule.dayOfMonth ?? 1}`}
                    </span>
                  </div>
                  <Badge
                    variant={schedule.isActive ? 'new' : 'default'}
                    className="text-[10px]"
                    data-icod-id="src_pages_dashboard_dashboardaudits_tsx_1dce">
                    {schedule.isActive ? 'Active' : 'Paused'}
                  </Badge>
                </div>

                <div
                  className="grid grid-cols-2 gap-4 text-xs text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardaudits_tsx_4686">
                  <div data-icod-id="src_pages_dashboard_dashboardaudits_tsx_11cd">
                    <span
                      className="font-medium"
                      data-icod-id="src_pages_dashboard_dashboardaudits_tsx_92f4">Last run:</span>{' '}
                    {schedule.lastRunAt ? new Date(schedule.lastRunAt).toLocaleDateString() : 'Never'}
                  </div>
                  <div data-icod-id="src_pages_dashboard_dashboardaudits_tsx_4229">
                    <span
                      className="font-medium"
                      data-icod-id="src_pages_dashboard_dashboardaudits_tsx_32af">Next run:</span>{' '}
                    {schedule.nextRunAt ? new Date(schedule.nextRunAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                {canWrite && (
                  <div
                    className="flex items-center gap-2 pt-2"
                    data-icod-id="src_pages_dashboard_dashboardaudits_tsx_5d04">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleSchedule}
                      data-icod-id="src_pages_dashboard_dashboardaudits_tsx_17c9">
                      {schedule.isActive ? 'Pause' : 'Resume'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteSchedule}
                      data-icod-id="src_pages_dashboard_dashboardaudits_tsx_c185">
                      <Trash2
                        className="h-3 w-3"
                        data-icod-id="src_pages_dashboard_dashboardaudits_tsx_9def" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            ) : canWrite ? (
              <div
                className="flex flex-col gap-4"
                data-icod-id="src_pages_dashboard_dashboardaudits_tsx_cdd2">
                <p
                  className="text-sm text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardaudits_tsx_a2f6">
                  Set up automatic audits to run on a schedule.
                </p>
                <div
                  className="flex flex-wrap items-end gap-4"
                  data-icod-id="src_pages_dashboard_dashboardaudits_tsx_3790">
                  <div data-icod-id="src_pages_dashboard_dashboardaudits_tsx_ad64">
                    <label
                      className="mb-1.5 block text-xs font-medium text-muted-foreground"
                      data-icod-id="src_pages_dashboard_dashboardaudits_tsx_11b2">Frequency</label>
                    <select
                      value={scheduleFreq}
                      onChange={(e) => setScheduleFreq(e.target.value as 'weekly' | 'monthly')}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                      data-icod-id="src_pages_dashboard_dashboardaudits_tsx_d770">
                      <option
                        value="weekly"
                        data-icod-id="src_pages_dashboard_dashboardaudits_tsx_ff54">Weekly</option>
                      <option
                        value="monthly"
                        data-icod-id="src_pages_dashboard_dashboardaudits_tsx_0cbb">Monthly</option>
                    </select>
                  </div>

                  {scheduleFreq === 'weekly' && (
                    <div data-icod-id="src_pages_dashboard_dashboardaudits_tsx_5c45">
                      <label
                        className="mb-1.5 block text-xs font-medium text-muted-foreground"
                        data-icod-id="src_pages_dashboard_dashboardaudits_tsx_95d2">Day of Week</label>
                      <select
                        value={scheduleDayOfWeek}
                        onChange={(e) => setScheduleDayOfWeek(Number(e.target.value))}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                        data-icod-id="src_pages_dashboard_dashboardaudits_tsx_2318">
                        {DAYS_OF_WEEK.map((day, i) => (
                          <option
                            key={i}
                            value={i}
                            data-icod-id={`src_pages_dashboard_dashboardaudits_tsx_10d2_${i}`}>{day}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {scheduleFreq === 'monthly' && (
                    <div data-icod-id="src_pages_dashboard_dashboardaudits_tsx_aead">
                      <label
                        className="mb-1.5 block text-xs font-medium text-muted-foreground"
                        data-icod-id="src_pages_dashboard_dashboardaudits_tsx_6419">Day of Month</label>
                      <Input
                        type="number"
                        min={1}
                        max={28}
                        value={scheduleDayOfMonth}
                        onChange={(e) => setScheduleDayOfMonth(Number(e.target.value))}
                        className="w-20"
                        data-icod-id="src_pages_dashboard_dashboardaudits_tsx_e410" />
                    </div>
                  )}

                  <Button
                    size="sm"
                    onClick={handleSaveSchedule}
                    data-icod-id="src_pages_dashboard_dashboardaudits_tsx_f645">
                    Save Schedule
                  </Button>
                </div>
              </div>
            ) : (
              <p
                className="text-sm text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardaudits_tsx_a2f6">
                No schedule configured.
              </p>
            )}
          </div>
        </DashboardCard>
      )}
    </div>
  );
}
