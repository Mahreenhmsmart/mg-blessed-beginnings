import { useState, useEffect, useMemo } from 'react';
import { Key, RefreshCw, TrendingUp, Target, Filter, Search, ExternalLink } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { fetchKeywordGaps, triggerReanalyzeKeywords } from '@/store/slices/analysisSlice';
import { Button, Badge, Spinner, Alert } from '@/components/ui';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EmptyStatePanel from '@/components/dashboard/EmptyStatePanel';
import { getGSCTopQueries, checkGSCConfig } from '@/services/auditService';
import type { KeywordGap, GSCAnalyticsRow } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  primary: 'bg-primary/20 text-primary',
  secondary: 'bg-secondary/40 text-foreground',
  'long-tail': 'bg-accent/20 text-accent-foreground',
  question: 'bg-muted text-muted-foreground',
  commercial: 'bg-destructive/10 text-destructive',
  informational: 'bg-card border border-border/40 text-foreground',
  local: 'bg-success/10 text-success',
};

const INTENT_LABELS: Record<string, string> = {
  informational: 'Info',
  commercial: 'Commercial',
  transactional: 'Transactional',
  navigational: 'Navigational',
};

type FilterCategory = 'all' | 'primary' | 'secondary' | 'long-tail' | 'question' | 'commercial' | 'informational' | 'local';
type FilterIntent = 'all' | 'informational' | 'commercial' | 'transactional' | 'navigational';

export default function DashboardKeywords() {
  const dispatch = useAppDispatch();
  const { currentProjectId } = useAppSelector((s) => s.projects);
  const { keywordGaps, keywordStatus, reanalyzeKeywordsStatus } = useAppSelector((s) => s.analysis);
  const userRole = useAppSelector((s) => s.auth.user?.role) || 'viewer';
  const canWrite = userRole !== 'viewer';
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');
  const [intentFilter, setIntentFilter] = useState<FilterIntent>('all');
  const [gscQueries, setGscQueries] = useState<GSCAnalyticsRow[]>([]);
  const [gscConnected, setGscConnected] = useState(false);
  const [gscLoading, setGscLoading] = useState(false);

  useEffect(() => {
    if (currentProjectId) {
      dispatch(fetchKeywordGaps(currentProjectId));
    }
  }, [currentProjectId, dispatch]);

  // Fetch GSC queries if connected
  useEffect(() => {
    if (!currentProjectId) return;
    let cancelled = false;
    async function loadGSC() {
      try {
        const config = await checkGSCConfig();
        if (!cancelled && config.configured) {
          setGscConnected(true);
          setGscLoading(true);
          const result = await getGSCTopQueries(currentProjectId!, undefined, undefined, 25);
          if (!cancelled) setGscQueries(result.rows || []);
        }
      } catch {
        // GSC not connected or failed — that's ok
      } finally {
        if (!cancelled) setGscLoading(false);
      }
    }
    loadGSC();
    return () => { cancelled = true; };
  }, [currentProjectId]);

  const handleReanalyze = () => {
    if (!currentProjectId) return;
    dispatch(triggerReanalyzeKeywords(currentProjectId))
      .then(() => {
        dispatch(addToast({ message: 'Keyword re-analysis started!', variant: 'success' }));
        setTimeout(() => dispatch(fetchKeywordGaps(currentProjectId)), 5000);
      })
      .catch(() => {
        dispatch(addToast({ message: 'Failed to start re-analysis.', variant: 'error' }));
      });
  };

  const isLoading = keywordStatus === 'loading' || reanalyzeKeywordsStatus === 'loading';

  // Compute summary stats
  const summaryStats = useMemo(() => {
    if (keywordGaps.length === 0) return null;
    const avgDifficulty = Math.round(keywordGaps.reduce((sum, k) => sum + (k.difficulty ?? 50), 0) / keywordGaps.length);
    const topOpportunities = [...keywordGaps]
      .sort((a, b) => (b.opportunity ?? 0) - (a.opportunity ?? 0))
      .slice(0, 5);
    return { total: keywordGaps.length, avgDifficulty, topOpportunities };
  }, [keywordGaps]);

  // Filter keywords
  const filteredKeywords = useMemo(() => {
    return keywordGaps.filter((kw) => {
      if (categoryFilter !== 'all' && kw.category !== categoryFilter) return false;
      if (intentFilter !== 'all' && kw.intent !== intentFilter) return false;
      return true;
    });
  }, [keywordGaps, categoryFilter, intentFilter]);

  return (
    <div
      className="flex flex-col gap-8"
      data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_56cf">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_2349">
        <div data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_b77f">
          <h1
            className="font-heading text-2xl font-bold text-foreground sm:text-3xl tracking-tight"
            data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_5330">
            Keyword Intelligence
          </h1>
          <p
            className="mt-2 text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_8183">
            Identify keywords your competitors rank for that you are missing.
          </p>
        </div>
        {currentProjectId && canWrite && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReanalyze}
            loading={isLoading}
            data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_bfe5">
            <RefreshCw
              className="h-3 w-3"
              data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_1b20" />
            Re-analyze
          </Button>
        )}
      </div>
      {/* Summary Header */}
      {summaryStats && (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_d4b2">
          <DashboardCard
            heading="Total Keywords"
            data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_7f32">
            <div
              className="flex items-center gap-3"
              data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_61f7">
              <Key
                className="h-8 w-8 text-primary"
                data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_0aff" />
              <div data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_92d4">
                <p
                  className="text-2xl font-bold text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_d12a">{summaryStats.total}</p>
                <p
                  className="text-xs text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_5c12">Keywords discovered</p>
              </div>
            </div>
          </DashboardCard>
          <DashboardCard
            heading="Avg Difficulty"
            data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_6408">
            <div
              className="flex items-center gap-3"
              data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_faaf">
              <Target
                className="h-8 w-8 text-accent-foreground"
                data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_0e0e" />
              <div data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_04e0">
                <p
                  className="text-2xl font-bold text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_33f3">{summaryStats.avgDifficulty}/100</p>
                <p
                  className="text-xs text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_98d4">Heuristic estimate</p>
              </div>
            </div>
          </DashboardCard>
          <DashboardCard
            heading="Top Opportunity"
            data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_8cd4">
            <div
              className="flex items-center gap-3"
              data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_3f3f">
              <TrendingUp
                className="h-8 w-8 text-success"
                data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_9853" />
              <div data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_9073">
                <p
                  className="text-lg font-bold text-foreground truncate max-w-[180px]"
                  data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_3b1b">
                  {summaryStats.topOpportunities[0]?.keyword || 'N/A'}
                </p>
                <p
                  className="text-xs text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_eb13">
                  Score: {summaryStats.topOpportunities[0]?.opportunity ?? 0}/100
                </p>
              </div>
            </div>
          </DashboardCard>
        </div>
      )}
      {/* GSC Search Queries — real data from Google Search Console */}
      <DashboardCard
        heading="GSC Search Queries"
        icon={<Search
          className="h-5 w-5"
          data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_0c2f" />}
        data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_28ce">
        {!gscConnected ? (
          <div
            className="flex flex-col items-center gap-3 py-8 text-center"
            data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_2baa">
            <Search
              className="h-8 w-8 text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_98fa" />
            <p
              className="text-sm text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_1b5d">
              Connect Google Search Console to see real search queries driving traffic to your site.
            </p>
            <Button
              variant="outline"
              size="sm"
              data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_3df5">
              <ExternalLink
                className="h-3 w-3"
                data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_ab24" />
              Connect Search Console
            </Button>
          </div>
        ) : gscLoading ? (
          <div
            className="flex justify-center py-8"
            data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_caeb"><Spinner size="md" data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_f588" /></div>
        ) : gscQueries.length > 0 ? (
          <div
            className="overflow-x-auto rounded-lg border border-border/50"
            data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_60b6">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_f9e8">
              <thead
                className="bg-muted/50"
                data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_eaa8">
                <tr
                  className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_78f1">
                  <th
                    className="px-4 py-3 min-w-[200px]"
                    data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_0b82">Query</th>
                  <th
                    className="px-4 py-3"
                    data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_5919">Clicks</th>
                  <th
                    className="px-4 py-3"
                    data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_e57b">Impressions</th>
                  <th
                    className="px-4 py-3"
                    data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_8009">CTR</th>
                  <th
                    className="px-4 py-3"
                    data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_ed42">Avg Position</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_a7bc">
                {gscQueries.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/30 hover:bg-muted/30"
                    data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_c29a_${i}`}>
                    <td
                      className="px-4 py-3 font-medium text-foreground truncate max-w-[300px]"
                      title={row.keys.query}
                      data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_fd03_${i}`}>{row.keys.query}</td>
                    <td
                      className="px-4 py-3 text-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_97ed_${i}`}>{row.clicks.toLocaleString()}</td>
                    <td
                      className="px-4 py-3 text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_2d50_${i}`}>{row.impressions.toLocaleString()}</td>
                    <td
                      className="px-4 py-3 text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_9f14_${i}`}>{row.ctr}%</td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_00cc_${i}`}>
                      <span
                        className={row.position <= 10 ? 'text-success' : row.position <= 20 ? 'text-warning' : 'text-muted-foreground'}
                        data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_9654_${i}`}>
                        {row.position}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyStatePanel
            icon={Search}
            title="No search query data"
            description="Query data will appear once Google has collected enough search data for your verified property."
            className="py-8"
            data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_bc32" />
        )}
      </DashboardCard>
      <Alert
        variant="info"
        data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_1890">
        Keyword data is AI-estimated based on crawl analysis, not from a real keyword API (Google Ads API, SEMrush, etc.). Difficulty and opportunity scores are heuristic estimates. Search volumes are relative estimates on a 1-100 scale derived from page crawling.
      </Alert>
      <DashboardCard
        heading="Keyword Gap Analysis"
        data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_4cad">
        {/* Filters */}
        {keywordGaps.length > 0 && (
          <div
            className="mb-4 flex flex-wrap items-center gap-3"
            data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_b12b">
            <div
              className="flex items-center gap-2"
              data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_d09a">
              <Filter
                className="h-4 w-4 text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_291c" />
              <span
                className="text-xs font-medium text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_f277">Filters:</span>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as FilterCategory)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_846e">
              <option value="all" data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_e095">All Categories</option>
              <option
                value="primary"
                data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_9fa1">Primary</option>
              <option
                value="secondary"
                data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_a109">Secondary</option>
              <option
                value="long-tail"
                data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_6041">Long-tail</option>
              <option
                value="question"
                data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_be08">Question</option>
              <option
                value="commercial"
                data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_dc5b">Commercial</option>
              <option
                value="informational"
                data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_4c55">Informational</option>
              <option
                value="local"
                data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_80cb">Local</option>
            </select>
            <select
              value={intentFilter}
              onChange={(e) => setIntentFilter(e.target.value as FilterIntent)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_e986">
              <option value="all" data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_70d6">All Intents</option>
              <option
                value="informational"
                data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_17f9">Informational</option>
              <option
                value="commercial"
                data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_40b7">Commercial</option>
              <option
                value="transactional"
                data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_a93d">Transactional</option>
              <option
                value="navigational"
                data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_dae4">Navigational</option>
            </select>
            <span
              className="text-xs text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_2266">
              Showing {filteredKeywords.length} of {keywordGaps.length}
            </span>
          </div>
        )}

        {isLoading ? (
          <div
            className="flex justify-center py-12"
            data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_6b40">
            <Spinner size="lg" data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_aa2d" />
          </div>
        ) : filteredKeywords.length > 0 ? (
          <div
            className="overflow-x-auto rounded-lg border border-border/50"
            data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_39d3">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_09ca">
              <thead
                className="bg-muted/50"
                data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_6ef0">
                <tr
                  className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_edf0">
                  <th
                    className="px-4 py-3 pr-4 min-w-[150px]"
                    data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_ca38">Keyword</th>
                  <th
                    className="px-4 py-3 pr-4 min-w-[100px]"
                    data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_aae1">Category</th>
                  <th
                    className="px-4 py-3 pr-4 min-w-[80px]"
                    data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_0bd1">Intent</th>
                  <th
                    className="px-4 py-3 pr-4 min-w-[120px]"
                    data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_c3b6">Difficulty</th>
                  <th
                    className="px-4 py-3 pr-4 min-w-[120px]"
                    data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_0195">Opportunity</th>
                  <th
                    className="px-4 py-3 min-w-[150px]"
                    data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_8e2f">Recommended Page</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_e413">
                {filteredKeywords.map((gap) => (
                  <tr
                    key={gap._id}
                    className="border-b border-border/30 hover:bg-muted/30"
                    data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_1047_${gap._id}`}>
                    <td
                      className="px-4 py-3 font-medium text-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_f191_${gap._id}`}>{gap.keyword}</td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_c8a5_${gap._id}`}>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLORS[gap.category] || CATEGORY_COLORS.secondary}`}
                        data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_cc93_${gap._id}`}>
                        {gap.category}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_1659_${gap._id}`}>
                      <Badge
                        variant="default"
                        className="text-[9px]"
                        data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_6a0d_${gap._id}`}>
                        {INTENT_LABELS[gap.intent] || gap.intent}
                      </Badge>
                    </td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_e424_${gap._id}`}>
                      <div
                        className="flex items-center gap-2"
                        data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_b6e4_${gap._id}`}>
                        <div
                          className="h-2 w-16 overflow-hidden rounded-full bg-muted"
                          data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_b6d2_${gap._id}`}>
                          <div
                            className={`h-full rounded-full ${(gap.difficulty ?? 50) > 70 ? 'bg-destructive' : (gap.difficulty ?? 50) > 40 ? 'bg-warning' : 'bg-success'}`}
                            style={{ width: `${gap.difficulty ?? 50}%` }}
                            data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_e9ac_${gap._id}`} />
                        </div>
                        <span
                          className="text-xs text-muted-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_7571_${gap._id}`}>{gap.difficulty ?? 50}</span>
                      </div>
                    </td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_7c69_${gap._id}`}>
                      <div
                        className="flex items-center gap-2"
                        data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_2997_${gap._id}`}>
                        <div
                          className="h-2 w-16 overflow-hidden rounded-full bg-muted"
                          data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_95e2_${gap._id}`}>
                          <div
                            className={`h-full rounded-full ${(gap.opportunity ?? 50) > 70 ? 'bg-success' : (gap.opportunity ?? 50) > 40 ? 'bg-primary' : 'bg-muted-foreground'}`}
                            style={{ width: `${gap.opportunity ?? 50}%` }}
                            data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_87db_${gap._id}`} />
                        </div>
                        <span
                          className="text-xs text-muted-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_2e51_${gap._id}`}>{gap.opportunity ?? 50}</span>
                      </div>
                    </td>
                    <td
                      className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate"
                      title={gap.recommendedPage || ''}
                      data-icod-id={`src_pages_dashboard_dashboardkeywords_tsx_4bb6_${gap._id}`}>
                      {gap.recommendedPage || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : keywordGaps.length > 0 ? (
          <div
            className="py-8 text-center text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_1fdc">
            No keywords match the selected filters.
          </div>
        ) : (
          <EmptyStatePanel
            icon={Key}
            title="No keyword gaps found"
            description="Run a full audit first, then use Re-analyze to discover keyword opportunities based on competitor crawling."
            note="Keyword data is derived from crawling competitor pages — not from external SEO APIs."
            className="py-12"
            data-icod-id="src_pages_dashboard_dashboardkeywords_tsx_d71e" />
        )}
      </DashboardCard>
    </div>
  );
}
