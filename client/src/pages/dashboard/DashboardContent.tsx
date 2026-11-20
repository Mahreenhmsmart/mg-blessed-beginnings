import { useState, useEffect } from 'react';
import { FileText, MessageCircleQuestion, RefreshCw, ShieldCheck, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { fetchContentGaps, triggerReanalyzeContent, generateContentPlanThunk } from '@/store/slices/analysisSlice';
import { fetchAuditsByProject } from '@/store/slices/auditsSlice';
import { Button, Badge, Spinner, Alert } from '@/components/ui';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EmptyStatePanel from '@/components/dashboard/EmptyStatePanel';
import ScoreCard from '@/components/dashboard/ScoreCard';
import type { CheckResult, ContentGap } from '@/types';

const PRIORITY_VARIANTS: Record<string, 'free' | 'new' | 'default'> = {
  high: 'free',
  medium: 'new',
  low: 'default',
};

const INTENT_COLORS: Record<string, string> = {
  informational: 'bg-primary/10 text-primary',
  commercial: 'bg-accent/10 text-accent-foreground',
  transactional: 'bg-success/10 text-success',
};

export default function DashboardContent() {
  const dispatch = useAppDispatch();
  const { currentProjectId } = useAppSelector((s) => s.projects);
  const { contentGaps, contentStatus, reanalyzeContentStatus, contentPlanStatus } = useAppSelector((s) => s.analysis);
  const { audits } = useAppSelector((s) => s.audits);
  const userRole = useAppSelector((s) => s.auth.user?.role) || 'viewer';
  const canWrite = userRole !== 'viewer';
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    if (currentProjectId) {
      dispatch(fetchContentGaps(currentProjectId));
      dispatch(fetchAuditsByProject(currentProjectId));
    }
  }, [currentProjectId, dispatch]);

  const handleReanalyze = () => {
    if (!currentProjectId) return;
    dispatch(triggerReanalyzeContent(currentProjectId))
      .then(() => {
        dispatch(addToast({ message: 'Content gap re-analysis started!', variant: 'success' }));
        setTimeout(() => dispatch(fetchContentGaps(currentProjectId)), 5000);
      })
      .catch(() => {
        dispatch(addToast({ message: 'Failed to start re-analysis.', variant: 'error' }));
      });
  };

  const handleGeneratePlan = (gapId: string) => {
    if (!currentProjectId) return;
    setGeneratingId(gapId);
    dispatch(generateContentPlanThunk({ projectId: currentProjectId, gapId }))
      .then(() => {
        dispatch(addToast({ message: 'Content plan generated!', variant: 'success' }));
        setExpandedPlanId(gapId);
      })
      .catch(() => {
        dispatch(addToast({ message: 'Failed to generate content plan.', variant: 'error' }));
      })
      .finally(() => {
        setGeneratingId(null);
      });
  };

  const isLoading = contentStatus === 'loading' || reanalyzeContentStatus === 'loading';

  // Get latest completed audit for CQ data
  const latestAudit = audits.find((a) => a.status === 'completed') || null;
  const cqResults = latestAudit?.results?.cq;
  const cqScore = latestAudit?.scores?.cq ?? null;

  // Compute E-E-A-T sub-scores from CQ checks
  const eeatBreakdown = (() => {
    if (!cqResults) return null;
    const mapping: Record<string, string> = {
      'cq-experience-signals': 'Experience',
      'cq-expertise-signals': 'Expertise',
      'cq-authoritativeness': 'Authoritativeness',
      'cq-trustworthiness': 'Trustworthiness',
    };
    const breakdown: Record<string, { score: number; maxScore: number }> = {};
    for (const check of cqResults.checks) {
      const label = mapping[check.id];
      if (label) {
        if (!breakdown[label]) breakdown[label] = { score: 0, maxScore: 0 };
        breakdown[label].score += check.points;
        breakdown[label].maxScore += check.maxPoints;
      }
    }
    return breakdown;
  })();

  // Top CQ findings (non-pass checks)
  const topCqFindings = cqResults?.checks.filter((c: CheckResult) => c.status !== 'pass').slice(0, 5) || [];

  // Compute coverage comparison
  const competitorTopics = [...new Set(contentGaps.map(g => g.topic))];
  const coveredTopics = contentGaps.filter(g => g.priority === 'low').map(g => g.topic);
  const opportunityTopics = contentGaps.filter(g => g.priority === 'high' || g.priority === 'medium');

  return (
    <div
      className="flex flex-col gap-8"
      data-icod-id="src_pages_dashboard_dashboardcontent_tsx_c5e1">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_dashboardcontent_tsx_8ad0">
        <div data-icod-id="src_pages_dashboard_dashboardcontent_tsx_2dd5">
          <h1
            className="font-heading text-2xl font-bold text-foreground sm:text-3xl tracking-tight"
            data-icod-id="src_pages_dashboard_dashboardcontent_tsx_3fed">
            Content Gap Analysis
          </h1>
          <p
            className="mt-2 text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardcontent_tsx_c756">
            Identify content gaps and topics your competitors cover that you are missing.
          </p>
        </div>
        {currentProjectId && canWrite && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReanalyze}
            loading={isLoading}
            data-icod-id="src_pages_dashboard_dashboardcontent_tsx_4208">
            <RefreshCw
              className="h-3 w-3"
              data-icod-id="src_pages_dashboard_dashboardcontent_tsx_98ef" />
            Re-analyze
          </Button>
        )}
      </div>
      <Alert
        variant="info"
        data-icod-id="src_pages_dashboard_dashboardcontent_tsx_055d">
        Content gaps are identified by comparing headings and topics between your site and competitors via crawling. For comprehensive content intelligence, integrate SEMrush or Ahrefs.
      </Alert>
      {/* Content Coverage Comparison */}
      {contentGaps.length > 0 && (
        <DashboardCard
          heading="Content Coverage Comparison"
          data-icod-id="src_pages_dashboard_dashboardcontent_tsx_a880">
          <div
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
            data-icod-id="src_pages_dashboard_dashboardcontent_tsx_4bb6">
            <div data-icod-id="src_pages_dashboard_dashboardcontent_tsx_5eea">
              <div
                className="mb-3 flex items-center gap-2"
                data-icod-id="src_pages_dashboard_dashboardcontent_tsx_212a">
                <div
                  className="h-3 w-3 rounded-full bg-destructive/40"
                  data-icod-id="src_pages_dashboard_dashboardcontent_tsx_1c43" />
                <p
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardcontent_tsx_286b">Competitors Cover</p>
              </div>
              <div
                className="flex flex-wrap gap-1.5"
                data-icod-id="src_pages_dashboard_dashboardcontent_tsx_3502">
                {competitorTopics.slice(0, 15).map((topic, i) => (
                  <span
                    key={i}
                    className="inline-block rounded-md bg-destructive/5 px-2 py-1 text-[10px] font-medium text-destructive border border-destructive/20 max-w-full truncate"
                    data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_a7c9_${i}`}>
                    {topic.substring(0, 40)}
                  </span>
                ))}
                {competitorTopics.length > 15 && (
                  <span
                    className="text-[10px] text-muted-foreground self-center"
                    data-icod-id="src_pages_dashboard_dashboardcontent_tsx_9f82">+{competitorTopics.length - 15} more</span>
                )}
              </div>
            </div>
            <div data-icod-id="src_pages_dashboard_dashboardcontent_tsx_d816">
              <div
                className="mb-3 flex items-center gap-2"
                data-icod-id="src_pages_dashboard_dashboardcontent_tsx_7d90">
                <div
                  className="h-3 w-3 rounded-full bg-success/40"
                  data-icod-id="src_pages_dashboard_dashboardcontent_tsx_2718" />
                <p
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardcontent_tsx_4922">Your Site Covers</p>
              </div>
              <div
                className="flex flex-wrap gap-1.5"
                data-icod-id="src_pages_dashboard_dashboardcontent_tsx_43da">
                {coveredTopics.length > 0 ? coveredTopics.slice(0, 15).map((topic, i) => (
                  <span
                    key={i}
                    className="inline-block rounded-md bg-success/5 px-2 py-1 text-[10px] font-medium text-success border border-success/20 max-w-full truncate"
                    data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_9145_${i}`}>
                    {topic.substring(0, 40)}
                  </span>
                )) : (
                  <span
                    className="text-xs text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardcontent_tsx_3ff1">Low-priority gaps (likely partially covered)</span>
                )}
              </div>
            </div>
            <div data-icod-id="src_pages_dashboard_dashboardcontent_tsx_a9d0">
              <div
                className="mb-3 flex items-center gap-2"
                data-icod-id="src_pages_dashboard_dashboardcontent_tsx_8586">
                <div
                  className="h-3 w-3 rounded-full bg-primary/40"
                  data-icod-id="src_pages_dashboard_dashboardcontent_tsx_d967" />
                <p
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardcontent_tsx_97c9">Opportunities</p>
              </div>
              <div
                className="flex flex-wrap gap-1.5"
                data-icod-id="src_pages_dashboard_dashboardcontent_tsx_0bd6">
                {opportunityTopics.slice(0, 15).map((gap, i) => (
                  <span
                    key={i}
                    className="inline-block rounded-md bg-primary/5 px-2 py-1 text-[10px] font-medium text-primary border border-primary/20 max-w-full truncate"
                    data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_bd80_${i}`}>
                    {gap.topic.substring(0, 40)}
                  </span>
                ))}
                {opportunityTopics.length > 15 && (
                  <span
                    className="text-[10px] text-muted-foreground self-center"
                    data-icod-id="src_pages_dashboard_dashboardcontent_tsx_fecf">+{opportunityTopics.length - 15} more</span>
                )}
              </div>
            </div>
          </div>
        </DashboardCard>
      )}
      {/* Content Quality Score & E-E-A-T Breakdown */}
      <DashboardCard
        heading="Content Quality (E-E-A-T)"
        icon={<ShieldCheck
          className="h-5 w-5"
          data-icod-id="src_pages_dashboard_dashboardcontent_tsx_48d7" />}
        data-icod-id="src_pages_dashboard_dashboardcontent_tsx_fc5b">
        {cqScore !== null && cqResults ? (
          <div
            className="flex flex-col gap-6"
            data-icod-id="src_pages_dashboard_dashboardcontent_tsx_8923">
            <div
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
              data-icod-id="src_pages_dashboard_dashboardcontent_tsx_4e8d">
              {eeatBreakdown && Object.entries(eeatBreakdown).map(([label, data]) => (
                <ScoreCard
                  key={label}
                  title={label}
                  score={data.maxScore > 0 ? Math.round((data.score / data.maxScore) * 100) : 0}
                  maxScore={100}
                  color="rgb(var(--accent))"
                  label={`${data.score}/${data.maxScore} pts`}
                  data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_32f3_${label}`} />
              ))}
            </div>

            {topCqFindings.length > 0 && (
              <div data-icod-id="src_pages_dashboard_dashboardcontent_tsx_d438">
                <p
                  className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardcontent_tsx_153c">
                  Top Content Quality Findings
                </p>
                <div
                  className="flex flex-col gap-2"
                  data-icod-id="src_pages_dashboard_dashboardcontent_tsx_729e">
                  {topCqFindings.map((finding: CheckResult) => (
                    <div
                      key={finding.id}
                      className="flex items-start gap-3 rounded-lg border border-border/30 bg-card p-3"
                      data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_2fd2_${finding.id}`}>
                      <Badge
                        variant={finding.status === 'fail' ? 'free' : finding.status === 'warn' ? 'new' : 'default'}
                        className="shrink-0 mt-0.5 text-[10px]"
                        data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_37a5_${finding.id}`}>
                        {finding.status}
                      </Badge>
                      <div
                        className="min-w-0 flex-1"
                        data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_3480_${finding.id}`}>
                        <span
                          className="text-sm font-medium text-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_a88f_${finding.id}`}>{finding.name}</span>
                        <p
                          className="mt-0.5 text-xs text-muted-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_efaf_${finding.id}`}>{finding.details}</p>
                      </div>
                      <span
                        className="shrink-0 text-xs text-muted-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_d91b_${finding.id}`}>
                        {finding.points}/{finding.maxPoints}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <EmptyStatePanel
            icon={ShieldCheck}
            title="No content quality data"
            description="Run a full audit to see Content Quality and E-E-A-T analysis results."
            className="py-8"
            data-icod-id="src_pages_dashboard_dashboardcontent_tsx_adec" />
        )}
      </DashboardCard>
      {/* Content Gaps with Plan Generation */}
      {isLoading ? (
        <div
          className="flex justify-center py-16"
          data-icod-id="src_pages_dashboard_dashboardcontent_tsx_f0db">
          <Spinner size="lg" data-icod-id="src_pages_dashboard_dashboardcontent_tsx_b222" />
        </div>
      ) : contentGaps.length > 0 ? (
        <>
          <Alert
            variant="info"
            data-icod-id="src_pages_dashboard_dashboardcontent_tsx_2102">
            Content plans are AI-generated suggestions based on crawl analysis. Review and customize before publishing.
          </Alert>
          <div
            className="grid grid-cols-1 gap-5 lg:grid-cols-2"
            data-icod-id="src_pages_dashboard_dashboardcontent_tsx_e409">
            {contentGaps.map((gap) => (
              <DashboardCard
                key={gap._id}
                heading={gap.topic}
                data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_f64d_${gap._id}`}>
                <div
                  className="flex flex-col gap-4"
                  data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_5f40_${gap._id}`}>
                  <div
                    className="flex items-center justify-between"
                    data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_efec_${gap._id}`}>
                    <div
                      className="flex items-center gap-2"
                      data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_3896_${gap._id}`}>
                      <Badge
                        variant={PRIORITY_VARIANTS[gap.priority] || 'default'}
                        className="text-[10px]"
                        data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_e870_${gap._id}`}>
                        {gap.priority} priority
                      </Badge>
                      {gap.searchIntent && (
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold ${INTENT_COLORS[gap.searchIntent] || INTENT_COLORS.informational}`}
                          data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_fd13_${gap._id}`}>
                          {gap.searchIntent}
                        </span>
                      )}
                    </div>
                    <span
                      className="text-xs text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_e66f_${gap._id}`}>
                      {gap.competitorUrls.length} competitor(s) covering this
                    </span>
                  </div>

                  {/* Primary keyword and suggested title */}
                  {(gap.primaryKeyword || gap.suggestedTitle) && (
                    <div
                      className="rounded-lg bg-muted/30 p-3"
                      data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_811e_${gap._id}`}>
                      {gap.primaryKeyword && (
                        <div
                          className="mb-1"
                          data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_9ae7_${gap._id}`}>
                          <span
                            className="text-[10px] font-medium uppercase text-muted-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_a119_${gap._id}`}>Primary Keyword: </span>
                          <span
                            className="text-xs font-medium text-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_5dfd_${gap._id}`}>{gap.primaryKeyword}</span>
                        </div>
                      )}
                      {gap.suggestedTitle && (
                        <div data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_490c_${gap._id}`}>
                          <span
                            className="text-[10px] font-medium uppercase text-muted-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_f1c6_${gap._id}`}>Suggested Title: </span>
                          <span
                            className="text-xs text-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_7bff_${gap._id}`}>{gap.suggestedTitle}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {gap.questions.length > 0 && (
                    <div data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_3d00_${gap._id}`}>
                      <p
                        className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_f8a0_${gap._id}`}>
                        Unanswered Questions
                      </p>
                      <div
                        className="flex flex-col gap-1.5"
                        data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_467b_${gap._id}`}>
                        {gap.questions.slice(0, 5).map((q, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 rounded-lg bg-muted/30 p-2"
                            data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_ea4f_${gap._id}_${i}`}>
                            <MessageCircleQuestion
                              className="h-3 w-3 shrink-0 mt-0.5 text-primary"
                              data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_8e05_${gap._id}_${i}`} />
                            <span
                              className="text-xs text-foreground"
                              data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_2a56_${gap._id}_${i}`}>{q}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {gap.competitorUrls.length > 0 && (
                    <div data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_670d_${gap._id}`}>
                      <p
                        className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_b3d8_${gap._id}`}>
                        Competitor Coverage
                      </p>
                      <div
                        className="flex flex-wrap gap-1"
                        data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_d3c1_${gap._id}`}>
                        {gap.competitorUrls.map((url, i) => (
                          <Badge
                            key={i}
                            variant="default"
                            className="text-[9px]"
                            data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_9605_${gap._id}_${i}`}>
                            {(() => { try { return new URL(url).hostname; } catch { return url; } })()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Generate Content Plan Button */}
                  {canWrite && (
                    <div
                      className="pt-2"
                      data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_75a9_${gap._id}`}>
                      {gap.contentPlan ? (
                        <div data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_5aee_${gap._id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setExpandedPlanId(expandedPlanId === gap._id ? null : gap._id)}
                            data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_dae3_${gap._id}`}>
                            {expandedPlanId === gap._id ? <ChevronUp
                              className="h-3 w-3"
                              data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_74a2_${gap._id}`} /> : <ChevronDown
                              className="h-3 w-3"
                              data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_c119_${gap._id}`} />}
                            {expandedPlanId === gap._id ? 'Hide Plan' : 'View Content Plan'}
                          </Button>

                          {expandedPlanId === gap._id && (
                            <div
                              className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-4"
                              data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_86fd_${gap._id}`}>
                              <div
                                className="mb-3 flex items-center gap-2"
                                data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_4708_${gap._id}`}>
                                <Sparkles
                                  className="h-4 w-4 text-primary"
                                  data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_9117_${gap._id}`} />
                                <span
                                  className="text-sm font-semibold text-foreground"
                                  data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_8f7a_${gap._id}`}>AI-Generated Content Plan</span>
                              </div>

                              <div
                                className="flex flex-col gap-3 text-sm"
                                data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_89f1_${gap._id}`}>
                                <div data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_22b3_${gap._id}`}>
                                  <span
                                    className="text-[10px] font-medium uppercase text-muted-foreground"
                                    data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_db28_${gap._id}`}>Topic:</span>
                                  <p
                                    className="text-foreground"
                                    data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_4244_${gap._id}`}>{gap.contentPlan.topic}</p>
                                </div>
                                <div data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_3295_${gap._id}`}>
                                  <span
                                    className="text-[10px] font-medium uppercase text-muted-foreground"
                                    data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_6548_${gap._id}`}>Search Intent:</span>
                                  <p
                                    className="text-foreground"
                                    data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_8718_${gap._id}`}>{gap.contentPlan.searchIntent}</p>
                                </div>
                                <div data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_8b52_${gap._id}`}>
                                  <span
                                    className="text-[10px] font-medium uppercase text-muted-foreground"
                                    data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_d266_${gap._id}`}>Primary Keyword:</span>
                                  <p
                                    className="text-foreground"
                                    data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_c59b_${gap._id}`}>{gap.contentPlan.primaryKeyword}</p>
                                </div>
                                {gap.contentPlan.secondaryKeywords.length > 0 && (
                                  <div data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_18f6_${gap._id}`}>
                                    <span
                                      className="text-[10px] font-medium uppercase text-muted-foreground"
                                      data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_7bb7_${gap._id}`}>Secondary Keywords:</span>
                                    <div
                                      className="flex flex-wrap gap-1 mt-1"
                                      data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_1a8d_${gap._id}`}>
                                      {gap.contentPlan.secondaryKeywords.map((kw, i) => (
                                        <Badge
                                          key={i}
                                          variant="default"
                                          className="text-[9px]"
                                          data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_88fe_${gap._id}_${i}`}>{kw}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_bbe7_${gap._id}`}>
                                  <span
                                    className="text-[10px] font-medium uppercase text-muted-foreground"
                                    data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_c859_${gap._id}`}>Suggested Title:</span>
                                  <p
                                    className="font-medium text-foreground"
                                    data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_bba6_${gap._id}`}>{gap.contentPlan.suggestedTitle}</p>
                                </div>
                                {gap.contentPlan.outline.length > 0 && (
                                  <div data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_041f_${gap._id}`}>
                                    <span
                                      className="text-[10px] font-medium uppercase text-muted-foreground"
                                      data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_3832_${gap._id}`}>Outline:</span>
                                    <ul
                                      className="mt-1 flex flex-col gap-1 pl-4"
                                      data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_2c03_${gap._id}`}>
                                      {gap.contentPlan.outline.map((item, i) => (
                                        <li
                                          key={i}
                                          className="text-xs text-foreground list-disc"
                                          data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_2a92_${gap._id}_${i}`}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {gap.contentPlan.internalLinks.length > 0 && (
                                  <div data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_18e1_${gap._id}`}>
                                    <span
                                      className="text-[10px] font-medium uppercase text-muted-foreground"
                                      data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_c150_${gap._id}`}>Recommended Internal Links:</span>
                                    <ul
                                      className="mt-1 flex flex-col gap-1 pl-4"
                                      data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_f530_${gap._id}`}>
                                      {gap.contentPlan.internalLinks.map((link, i) => (
                                        <li
                                          key={i}
                                          className="text-xs text-muted-foreground list-disc"
                                          data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_0e4f_${gap._id}_${i}`}>{link}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {gap.contentPlan.cta && (
                                  <div data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_2d8d_${gap._id}`}>
                                    <span
                                      className="text-[10px] font-medium uppercase text-muted-foreground"
                                      data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_134e_${gap._id}`}>CTA Suggestion:</span>
                                    <p
                                      className="text-foreground"
                                      data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_5ef4_${gap._id}`}>{gap.contentPlan.cta}</p>
                                  </div>
                                )}
                              </div>

                              <p
                                className="mt-3 text-[10px] italic text-muted-foreground"
                                data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_2891_${gap._id}`}>
                                This is an AI-generated suggestion. Review and customize before publishing.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleGeneratePlan(gap._id)}
                          loading={generatingId === gap._id || contentPlanStatus === 'loading'}
                          data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_e3ee_${gap._id}`}>
                          <Sparkles
                            className="h-3 w-3"
                            data-icod-id={`src_pages_dashboard_dashboardcontent_tsx_6e1a_${gap._id}`} />
                          Generate Content Plan
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </DashboardCard>
            ))}
          </div>
        </>
      ) : (
        <DashboardCard
          heading="Content Gaps"
          data-icod-id="src_pages_dashboard_dashboardcontent_tsx_0759">
          <EmptyStatePanel
            icon={FileText}
            title="No content gaps identified"
            description="Run a full audit first, then use Re-analyze to discover content gaps based on competitor crawling."
            note="Data is derived from crawling competitor pages — not from external SEO APIs."
            className="py-12"
            data-icod-id="src_pages_dashboard_dashboardcontent_tsx_d710" />
        </DashboardCard>
      )}
    </div>
  );
}
