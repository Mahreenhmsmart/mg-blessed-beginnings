import { useEffect, useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAuditById, fetchAuditInsights } from '@/store/slices/auditsSlice';
import { Badge, Spinner, Button } from '@/components/ui';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EmptyStatePanel from '@/components/dashboard/EmptyStatePanel';
import type { Recommendation, AISummaryResult } from '@/types';

const SEVERITY_VARIANTS: Record<string, 'free' | 'new' | 'default'> = {
  critical: 'free',
  warning: 'new',
  info: 'default',
};

const EFFORT_COLORS: Record<string, string> = {
  quick: 'text-success',
  moderate: 'text-warning',
  extensive: 'text-accent',
};

type PlanTab = '7day' | '30day' | '90day';

export default function DashboardRecommendations() {
  const dispatch = useAppDispatch();
  const { currentProjectId } = useAppSelector((s) => s.projects);
  const { audits, currentAudit, aiInsights, insightsStatus } = useAppSelector((s) => s.audits);
  const [activeTab, setActiveTab] = useState<PlanTab>('7day');
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const [expandedRec, setExpandedRec] = useState<number | null>(null);

  // Get latest completed audit
  const latestAudit = audits.find((a) => a.status === 'completed') || null;

  useEffect(() => {
    if (latestAudit && !currentAudit) {
      dispatch(fetchAuditById(latestAudit._id));
    }
  }, [latestAudit, currentAudit, dispatch]);

  const recommendations = currentAudit?.recommendations || [];

  // Build action plans from recommendations
  const quickWins = recommendations.filter((r) => r.effort === 'quick');
  const moderateItems = recommendations.filter((r) => r.effort === 'moderate');
  const extensiveItems = recommendations.filter((r) => r.effort === 'extensive');

  const plans: Record<PlanTab, Recommendation[]> = {
    '7day': quickWins.slice(0, 10),
    '30day': [...quickWins.slice(10), ...moderateItems.slice(0, 10)],
    '90day': [...moderateItems.slice(10), ...extensiveItems],
  };

  const handleGenerateInsights = () => {
    if (latestAudit) {
      dispatch(fetchAuditInsights(latestAudit._id));
    }
  };

  return (
    <div
      className="flex flex-col gap-8"
      data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_025f">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_9abb">
        <div data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_21ec">
          <h1
            className="font-heading text-2xl font-bold text-foreground sm:text-3xl tracking-tight"
            data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_bc87">
            Recommendations
          </h1>
          <p
            className="mt-2 text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_8f32">
            Prioritized, actionable recommendations with implementation timelines.
          </p>
        </div>
        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
          className="flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/40 transition-colors"
          data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_b4b0">
          <Globe
            className="h-3 w-3"
            data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_2348" />
          {lang === 'en' ? 'English' : 'Roman Urdu'}
        </button>
      </div>
      {/* AI Insights Panel */}
      <DashboardCard
        heading="AI-Powered Insights"
        data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_8952">
        {aiInsights ? (
          <div
            className="flex flex-col gap-4"
            data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_1106">
            <div
              className="rounded-xl bg-muted/30 p-4"
              data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_63bc">
              <p
                className="text-sm leading-relaxed text-foreground"
                data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_c1e9">
                {lang === 'en' ? aiInsights.summaryEn : aiInsights.summaryUr}
              </p>
            </div>
            <div
              className="rounded-xl bg-primary/5 p-4"
              data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_f435">
              <p
                className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary"
                data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_98c7">Action Plan</p>
              <p
                className="text-sm leading-relaxed text-foreground"
                data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_1dbc">{aiInsights.actionPlanNarrative}</p>
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col items-center gap-4 py-8"
            data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_ecf0">
            <Button
              onClick={handleGenerateInsights}
              loading={insightsStatus === 'loading'}
              disabled={!latestAudit}
              data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_01b7">
              <Lightbulb
                className="mr-2 h-4 w-4"
                data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_268a" />
              Generate AI Insights
            </Button>
            {!latestAudit && (
              <p
                className="text-xs text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_a5df">Run an audit first to generate insights.</p>
            )}
          </div>
        )}
      </DashboardCard>
      {/* Action Plan Tabs */}
      <DashboardCard
        heading="Action Plans"
        data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_78bd">
        <div
          className="flex gap-2 border-b border-border/40 pb-3 mb-4"
          data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_e777">
          {(['7day', '30day', '90day'] as PlanTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/40'
              }`}
              data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_8972_${tab}`}>
              {tab === '7day' ? '7-Day Quick Wins' : tab === '30day' ? '30-Day Plan' : '90-Day Strategy'}
              <span
                className="ml-1.5 opacity-70"
                data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_af9b_${tab}`}>({plans[tab].length})</span>
            </button>
          ))}
        </div>

        {plans[activeTab].length > 0 ? (
          <div
            className="flex flex-col gap-3"
            data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_1e93">
            {plans[activeTab].map((rec, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/40 overflow-hidden"
                data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_cd2e_${i}`}>
                <button
                  onClick={() => setExpandedRec(expandedRec === i ? null : i)}
                  className="flex w-full items-start gap-3 p-4 hover:bg-muted/20 transition-colors text-left"
                  data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_5f31_${i}`}>
                  <Badge
                    variant={SEVERITY_VARIANTS[rec.severity] || 'default'}
                    className="shrink-0 mt-0.5 text-[10px]"
                    data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_2a7a_${i}`}>
                    {rec.severity}
                  </Badge>
                  <div
                    className="min-w-0 flex-1"
                    data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_fbc2_${i}`}>
                    <div
                      className="flex items-center gap-2"
                      data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_a0e7_${i}`}>
                      <span
                        className="text-sm font-medium text-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_a986_${i}`}>{rec.title}</span>
                      <Badge
                        variant="default"
                        className="text-[9px]"
                        data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_f40e_${i}`}>{rec.layer.toUpperCase()}</Badge>
                    </div>
                    <div
                      className="mt-1 flex items-center gap-3 text-xs text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_4e5e_${i}`}>
                      <span
                        className={EFFORT_COLORS[rec.effort] || ''}
                        data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_0ed0_${i}`}>{rec.effort} effort</span>
                      <span
                        data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_bce3_${i}`}>{rec.category}</span>
                    </div>
                  </div>
                  {expandedRec === i ? (
                    <ChevronUp
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_ff6c_${i}`} />
                  ) : (
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_f339_${i}`} />
                  )}
                </button>
                {expandedRec === i && (
                  <div
                    className="border-t border-border/40 bg-muted/20 px-4 py-3 pl-16"
                    data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_fa83_${i}`}>
                    <p
                      className="text-sm leading-relaxed text-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_b02e_${i}`}>{rec.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyStatePanel
            icon={Lightbulb}
            title={`No items in ${activeTab === '7day' ? '7-day' : activeTab === '30day' ? '30-day' : '90-day'} plan`}
            description="Complete the shorter-term plans first, or run an audit to generate recommendations."
            className="py-8"
            data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_8784" />
        )}
      </DashboardCard>
      {/* All Recommendations */}
      <DashboardCard
        heading={`All Recommendations (${recommendations.length})`}
        data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_0591">
        {recommendations.length > 0 ? (
          <div
            className="overflow-x-auto rounded-lg border border-border/50"
            data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_0f61">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_8e4d">
              <thead
                className="bg-muted/50"
                data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_3d67">
                <tr
                  className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_9fbb">
                  <th
                    className="px-4 py-3 pr-4"
                    data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_612c">Severity</th>
                  <th
                    className="px-4 py-3 pr-4"
                    data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_156c">Title</th>
                  <th
                    className="px-4 py-3 pr-4"
                    data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_f78a">Layer</th>
                  <th
                    className="px-4 py-3 pr-4"
                    data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_ad3e">Effort</th>
                  <th
                    className="px-4 py-3"
                    data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_93a4">Category</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_dcd5">
                {recommendations.map((rec, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/30 hover:bg-muted/30"
                    data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_4f16_${i}`}>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_8fce_${i}`}>
                      <Badge
                        variant={SEVERITY_VARIANTS[rec.severity] || 'default'}
                        className="text-[10px]"
                        data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_90af_${i}`}>
                        {rec.severity}
                      </Badge>
                    </td>
                    <td
                      className="px-4 py-3 font-medium text-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_912e_${i}`}>{rec.title}</td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_72d5_${i}`}>
                      <Badge
                        variant="default"
                        className="text-[9px]"
                        data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_c5b5_${i}`}>{rec.layer.toUpperCase()}</Badge>
                    </td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_7ce7_${i}`}>
                      <span
                        className={`text-xs font-medium ${EFFORT_COLORS[rec.effort] || ''}`}
                        data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_dbff_${i}`}>{rec.effort}</span>
                    </td>
                    <td
                      className="px-4 py-3 text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardrecommendations_tsx_2586_${i}`}>{rec.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyStatePanel
            icon={Lightbulb}
            title="No recommendations yet"
            description="Run an audit to generate recommendations."
            className="py-12"
            data-icod-id="src_pages_dashboard_dashboardrecommendations_tsx_0b79" />
        )}
      </DashboardCard>
    </div>
  );
}
