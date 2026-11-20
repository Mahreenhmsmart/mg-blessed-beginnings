import { useState, useEffect, useCallback } from 'react';
import {
  Search, ExternalLink, TrendingUp, MousePointerClick, Eye, BarChart3, Calendar,
  ArrowUpRight, ArrowDownRight, Globe, Monitor, Smartphone, Tablet, FileText,
  Plus, Trash2, RefreshCw, CheckCircle, XCircle, AlertTriangle, Link as LinkIcon,
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { Button, Spinner, Alert, Input } from '@/components/ui';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EmptyStatePanel from '@/components/dashboard/EmptyStatePanel';
import {
  checkGSCConfig, getGSCAuthUrl, getGSCData,
  listGSCProperties, getGSCTopQueries, getGSCTopPages,
  getGSCCountries, getGSCDevices, inspectGSCUrl,
  listGSCSitemaps, submitGSCSitemap, disconnectGSC,
} from '@/services/auditService';
import type {
  GSCData, GSCDailyData, GSCProperty, GSCAnalyticsRow,
  GSCInspectionResult, GSCSitemap,
} from '@/types';

type DateRange = '7' | '28' | '90';

function getDateRange(range: DateRange): { startDate: string; endDate: string } {
  const end = new Date();
  // GSC data is delayed ~2 days
  end.setDate(end.getDate() - 2);
  const endDate = end.toISOString().split('T')[0];
  const start = new Date(end);
  start.setDate(start.getDate() - parseInt(range, 10));
  const startDate = start.toISOString().split('T')[0];
  return { startDate, endDate };
}

export default function DashboardSearchPerformance() {
  const { currentProjectId } = useAppSelector((s) => s.projects);
  const userRole = useAppSelector((s) => s.auth.user?.role) || 'viewer';

  // Connection state
  const [gscConfigured, setGscConfigured] = useState<boolean | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  // Properties state
  const [properties, setProperties] = useState<GSCProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [propertiesLoading, setPropertiesLoading] = useState(false);

  // Date range
  const [dateRange, setDateRange] = useState<DateRange>('28');

  // Data states
  const [gscData, setGscData] = useState<GSCData | null>(null);
  const [topQueries, setTopQueries] = useState<GSCAnalyticsRow[]>([]);
  const [topPages, setTopPages] = useState<GSCAnalyticsRow[]>([]);
  const [countries, setCountries] = useState<GSCAnalyticsRow[]>([]);
  const [devices, setDevices] = useState<GSCAnalyticsRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL Inspection
  const [inspectUrlInput, setInspectUrlInput] = useState('');
  const [inspectionResult, setInspectionResult] = useState<GSCInspectionResult | null>(null);
  const [inspecting, setInspecting] = useState(false);

  // Sitemaps
  const [sitemaps, setSitemaps] = useState<GSCSitemap[]>([]);
  const [sitemapInput, setSitemapInput] = useState('');
  const [sitemapsLoading, setSitemapsLoading] = useState(false);

  // Disconnect
  const [disconnecting, setDisconnecting] = useState(false);

  // Check GSC config on mount
  useEffect(() => {
    let cancelled = false;
    async function checkConfig() {
      try {
        const result = await checkGSCConfig();
        if (!cancelled) {
          setGscConfigured(result.configured);
          setConfigLoading(false);
        }
      } catch {
        if (!cancelled) {
          setGscConfigured(false);
          setConfigLoading(false);
        }
      }
    }
    checkConfig();
    return () => { cancelled = true; };
  }, []);

  // Fetch properties when connected
  const fetchProperties = useCallback(async () => {
    if (!currentProjectId || !gscConfigured) return;
    setPropertiesLoading(true);
    try {
      const props = await listGSCProperties(currentProjectId);
      setProperties(props);
      setConnected(true);
      if (props.length > 0 && !selectedProperty) {
        setSelectedProperty(props[0].siteUrl);
      }
    } catch {
      // GSC may not be connected yet — that's ok
      setConnected(false);
    } finally {
      setPropertiesLoading(false);
    }
  }, [currentProjectId, gscConfigured, selectedProperty]);

  useEffect(() => {
    if (gscConfigured && currentProjectId) {
      fetchProperties();
    }
  }, [gscConfigured, currentProjectId, fetchProperties]);

  // Fetch all data when date range or project changes
  const fetchAllData = useCallback(async () => {
    if (!currentProjectId || !connected) return;
    setLoading(true);
    setError(null);

    const { startDate, endDate } = getDateRange(dateRange);

    try {
      const [dataResult, queriesResult, pagesResult, countriesResult, devicesResult] = await Promise.allSettled([
        getGSCData(currentProjectId),
        getGSCTopQueries(currentProjectId, startDate, endDate, 25),
        getGSCTopPages(currentProjectId, startDate, endDate, 25),
        getGSCCountries(currentProjectId, startDate, endDate),
        getGSCDevices(currentProjectId, startDate, endDate),
      ]);

      if (dataResult.status === 'fulfilled') setGscData(dataResult.value);
      if (queriesResult.status === 'fulfilled') setTopQueries(queriesResult.value.rows || []);
      if (pagesResult.status === 'fulfilled') setTopPages(pagesResult.value.rows || []);
      if (countriesResult.status === 'fulfilled') setCountries(countriesResult.value.rows || []);
      if (devicesResult.status === 'fulfilled') setDevices(devicesResult.value.rows || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch search performance data');
    } finally {
      setLoading(false);
    }
  }, [currentProjectId, connected, dateRange]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Fetch sitemaps
  const fetchSitemaps = useCallback(async () => {
    if (!currentProjectId || !connected) return;
    setSitemapsLoading(true);
    try {
      const result = await listGSCSitemaps(currentProjectId, selectedProperty || undefined);
      setSitemaps(result);
    } catch {
      // Silently fail — sitemaps are optional
    } finally {
      setSitemapsLoading(false);
    }
  }, [currentProjectId, connected, selectedProperty]);

  useEffect(() => {
    fetchSitemaps();
  }, [fetchSitemaps]);

  const handleConnectGSC = async () => {
    if (!currentProjectId) return;
    try {
      const result = await getGSCAuthUrl(currentProjectId);
      if (result.authUrl) {
        window.open(result.authUrl, '_blank', 'noopener,noreferrer');
      } else {
        setError(result.message || 'Google Search Console is not configured on the server.');
      }
    } catch {
      setError('Failed to generate authorization URL. Please try again.');
    }
  };

  const handleDisconnect = async () => {
    if (!currentProjectId) return;
    setDisconnecting(true);
    try {
      await disconnectGSC(currentProjectId);
      setConnected(false);
      setProperties([]);
      setGscData(null);
      setTopQueries([]);
      setTopPages([]);
      setCountries([]);
      setDevices([]);
    } catch {
      setError('Failed to disconnect Google Search Console.');
    } finally {
      setDisconnecting(false);
    }
  };

  const handleInspectUrl = async () => {
    if (!currentProjectId || !inspectUrlInput.trim()) return;
    setInspecting(true);
    setInspectionResult(null);
    try {
      const result = await inspectGSCUrl(currentProjectId, inspectUrlInput.trim());
      setInspectionResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'URL inspection failed.');
    } finally {
      setInspecting(false);
    }
  };

  const handleSubmitSitemap = async () => {
    if (!currentProjectId || !sitemapInput.trim() || !selectedProperty) return;
    try {
      await submitGSCSitemap(currentProjectId, selectedProperty, sitemapInput.trim());
      setSitemapInput('');
      fetchSitemaps();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit sitemap.');
    }
  };

  // Admin-only access
  if (userRole !== 'admin') {
    return (
      <div
        className="flex flex-col gap-8"
        data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_f0da">
        <Alert
          variant="error"
          data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_46fb">
          Search Performance is only available to administrators.
        </Alert>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-8"
      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_839c">
      {/* Header */}
      <div data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_b3b2">
        <h1
          className="font-heading text-2xl font-bold text-foreground sm:text-3xl tracking-tight"
          data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_5b1e">
          Search Performance
        </h1>
        <p
          className="mt-2 text-sm text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_fa35">
          Real search analytics from Google Search Console — impressions, clicks, CTR, and position data.
        </p>
      </div>
      {/* Loading state for config check */}
      {configLoading && (
        <div
          className="flex justify-center py-16"
          data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_2a87">
          <Spinner
            size="lg"
            data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_6bbe" />
        </div>
      )}
      {/* Not configured / Not connected */}
      {!configLoading && !connected && (
        <DashboardCard
          heading="Connect Google Search Console"
          data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_be04">
          <div
            className="flex flex-col items-center justify-center py-12 text-center"
            data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_0c52">
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_311b">
              <Search
                className="h-8 w-8 text-primary"
                data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_79ac" />
            </div>
            <h3
              className="mb-2 font-semibold text-foreground"
              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_7b12">
              Connect Google Search Console
            </h3>
            <p
              className="mb-6 max-w-md text-sm text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_a670">
              Get real search performance data directly from Google. See how your site appears in search results,
              which queries drive traffic, and track your ranking positions over time.
            </p>
            <Button
              onClick={handleConnectGSC}
              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_3499">
              <ExternalLink
                className="h-4 w-4"
                data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_c2a3" />
              Connect Google Search Console
            </Button>
            {error && (
              <Alert
                variant="error"
                className="mt-4 max-w-md"
                data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_81a4">
                {error}
              </Alert>
            )}
          </div>
        </DashboardCard>
      )}
      {/* Connected — show full dashboard */}
      {!configLoading && connected && (
        <>
          {/* Controls bar */}
          <div
            className="flex flex-wrap items-center justify-between gap-4"
            data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_bad0">
            {/* Property selector */}
            <div
              className="flex items-center gap-3"
              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_c7f7">
              {properties.length > 1 && (
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                  data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_ffa4">
                  {properties.map((p) => (
                    <option
                      key={p.siteUrl}
                      value={p.siteUrl}
                      data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_70ed_${p.siteUrl}`}>{p.siteUrl}</option>
                  ))}
                </select>
              )}
              {properties.length <= 1 && selectedProperty && (
                <span
                  className="text-sm font-medium text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_0ff1">{selectedProperty}</span>
              )}
            </div>

            {/* Date range picker + actions */}
            <div
              className="flex items-center gap-2"
              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_a181">
              <div
                className="flex rounded-lg border border-border bg-background p-0.5"
                data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_a5ee">
                {(['7', '28', '90'] as DateRange[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setDateRange(r)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      dateRange === r
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_029f_${r}`}>
                    {r}d
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAllData}
                loading={loading}
                data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_9e19">
                <RefreshCw
                  className="h-3 w-3"
                  data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_12aa" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                loading={disconnecting}
                data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_b74e">
                <Trash2
                  className="h-3 w-3"
                  data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_6a2e" />
                Disconnect
              </Button>
            </div>
          </div>

          {error && (
            <Alert
              variant="error"
              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_4f36">{error}</Alert>
          )}

          {loading ? (
            <div
              className="flex justify-center py-16"
              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_e740">
              <Spinner
                size="lg"
                data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_125a" />
            </div>
          ) : (
            <>
              {/* Summary cards */}
              {gscData?.summary && (
                <div
                  className="grid grid-cols-2 gap-4 sm:grid-cols-4"
                  data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_d18c">
                  <DashboardCard
                    heading="Total Clicks"
                    data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_46c3">
                    <div
                      className="flex items-center gap-3"
                      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_e042">
                      <MousePointerClick
                        className="h-7 w-7 text-primary"
                        data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_e705" />
                      <div data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_63e8">
                        <p
                          className="text-2xl font-bold text-foreground"
                          data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_9223">
                          {gscData.summary.totalClicks.toLocaleString()}
                        </p>
                        <p
                          className="text-xs text-muted-foreground"
                          data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_55bb">Clicks</p>
                      </div>
                    </div>
                  </DashboardCard>

                  <DashboardCard
                    heading="Total Impressions"
                    data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_d258">
                    <div
                      className="flex items-center gap-3"
                      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_6220">
                      <Eye
                        className="h-7 w-7 text-accent-foreground"
                        data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_38a2" />
                      <div data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_27f6">
                        <p
                          className="text-2xl font-bold text-foreground"
                          data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_19d9">
                          {gscData.summary.totalImpressions.toLocaleString()}
                        </p>
                        <p
                          className="text-xs text-muted-foreground"
                          data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_4099">Impressions</p>
                      </div>
                    </div>
                  </DashboardCard>

                  <DashboardCard
                    heading="Average CTR"
                    data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_49bc">
                    <div
                      className="flex items-center gap-3"
                      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_7c13">
                      <TrendingUp
                        className="h-7 w-7 text-success"
                        data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_fd95" />
                      <div data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_e06b">
                        <p
                          className="text-2xl font-bold text-foreground"
                          data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_c4a0">
                          {(gscData.summary.avgCtr * 100).toFixed(1)}%
                        </p>
                        <p
                          className="text-xs text-muted-foreground"
                          data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_a292">Click-through rate</p>
                      </div>
                    </div>
                  </DashboardCard>

                  <DashboardCard
                    heading="Avg Position"
                    data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_658b">
                    <div
                      className="flex items-center gap-3"
                      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_5b8f">
                      <BarChart3
                        className="h-7 w-7 text-warning"
                        data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_c1d0" />
                      <div data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_91d8">
                        <p
                          className="text-2xl font-bold text-foreground"
                          data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_ff4a">
                          {gscData.summary.avgPosition.toFixed(1)}
                        </p>
                        <p
                          className="text-xs text-muted-foreground"
                          data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_7099">Average rank</p>
                      </div>
                    </div>
                  </DashboardCard>
                </div>
              )}

              {/* Daily performance table */}
              {gscData?.dailyData && gscData.dailyData.length > 0 && (
                <DashboardCard
                  heading="Daily Performance"
                  data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_0a19">
                  <div
                    className="overflow-x-auto rounded-lg border border-border/50"
                    data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_d577">
                    <table
                      className="w-full text-left text-sm"
                      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_7e7d">
                      <thead
                        className="bg-muted/50"
                        data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_7465">
                        <tr
                          className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground"
                          data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_23b6">
                          <th
                            className="px-4 py-3"
                            data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_e4f4">Date</th>
                          <th
                            className="px-4 py-3"
                            data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_8803">Clicks</th>
                          <th
                            className="px-4 py-3"
                            data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_0454">Impressions</th>
                          <th
                            className="px-4 py-3"
                            data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_676a">CTR</th>
                          <th
                            className="px-4 py-3"
                            data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_e53d">Position</th>
                        </tr>
                      </thead>
                      <tbody data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_5804">
                        {gscData.dailyData.slice(0, 30).map((day: GSCDailyData) => (
                          <tr
                            key={day.date}
                            className="border-b border-border/30 hover:bg-muted/30"
                            data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_6a5a_${day.date}`}>
                            <td
                              className="px-4 py-3 font-medium text-foreground"
                              data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_f163_${day.date}`}>{day.date}</td>
                            <td
                              className="px-4 py-3 text-foreground"
                              data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_015d_${day.date}`}>{day.clicks.toLocaleString()}</td>
                            <td
                              className="px-4 py-3 text-muted-foreground"
                              data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_3338_${day.date}`}>{day.impressions.toLocaleString()}</td>
                            <td
                              className="px-4 py-3 text-muted-foreground"
                              data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_a92a_${day.date}`}>{(day.ctr * 100).toFixed(2)}%</td>
                            <td
                              className="px-4 py-3"
                              data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_fb9a_${day.date}`}>
                              <span
                                className={`inline-flex items-center gap-1 ${day.position <= 10 ? 'text-success' : day.position <= 20 ? 'text-warning' : 'text-muted-foreground'}`}
                                data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_02e7_${day.date}`}>
                                {day.position <= 10 ? <ArrowUpRight
                                  className="h-3 w-3"
                                  data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_b531_${day.date}`} /> : day.position > 20 ? <ArrowDownRight
                                  className="h-3 w-3"
                                  data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_1c60_${day.date}`} /> : null}
                                {day.position.toFixed(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </DashboardCard>
              )}

              {/* Two-column layout: Top Queries + Top Pages */}
              <div
                className="grid grid-cols-1 gap-7 lg:grid-cols-2"
                data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_6beb">
                {/* Top Queries */}
                <DashboardCard
                  heading="Top Search Queries"
                  data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_094f">
                  {topQueries.length > 0 ? (
                    <div
                      className="overflow-x-auto rounded-lg border border-border/50"
                      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_618a">
                      <table
                        className="w-full text-left text-sm"
                        data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_c6d5">
                        <thead
                          className="bg-muted/50"
                          data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_c7a0">
                          <tr
                            className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground"
                            data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_0cbc">
                            <th
                              className="px-4 py-3 min-w-[180px]"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_8f39">Query</th>
                            <th
                              className="px-4 py-3"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_42a8">Clicks</th>
                            <th
                              className="px-4 py-3"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_0686">Impressions</th>
                            <th
                              className="px-4 py-3"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_37a5">CTR</th>
                            <th
                              className="px-4 py-3"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_e5eb">Position</th>
                          </tr>
                        </thead>
                        <tbody data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_2061">
                          {topQueries.slice(0, 15).map((row, i) => (
                            <tr
                              key={i}
                              className="border-b border-border/30 hover:bg-muted/30"
                              data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_b969_${i}`}>
                              <td
                                className="px-4 py-3 font-medium text-foreground truncate max-w-[250px]"
                                title={row.keys.query}
                                data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_246e_${i}`}>
                                {row.keys.query}
                              </td>
                              <td
                                className="px-4 py-3 text-foreground"
                                data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_6443_${i}`}>{row.clicks.toLocaleString()}</td>
                              <td
                                className="px-4 py-3 text-muted-foreground"
                                data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_5d7d_${i}`}>{row.impressions.toLocaleString()}</td>
                              <td
                                className="px-4 py-3 text-muted-foreground"
                                data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_04b8_${i}`}>{row.ctr}%</td>
                              <td
                                className="px-4 py-3"
                                data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_a717_${i}`}>
                                <span
                                  className={row.position <= 10 ? 'text-success' : row.position <= 20 ? 'text-warning' : 'text-muted-foreground'}
                                  data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_fe6a_${i}`}>
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
                      title="No query data"
                      description="Query data will appear once Google has collected enough search data."
                      className="py-8"
                      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_f905" />
                  )}
                </DashboardCard>

                {/* Top Pages */}
                <DashboardCard
                  heading="Top Pages"
                  data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_0a10">
                  {topPages.length > 0 ? (
                    <div
                      className="overflow-x-auto rounded-lg border border-border/50"
                      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_eb97">
                      <table
                        className="w-full text-left text-sm"
                        data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_d8ad">
                        <thead
                          className="bg-muted/50"
                          data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_5bb6">
                          <tr
                            className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground"
                            data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_304a">
                            <th
                              className="px-4 py-3 min-w-[250px]"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_0675">Page</th>
                            <th
                              className="px-4 py-3"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_ac6e">Clicks</th>
                            <th
                              className="px-4 py-3"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_a30b">Impressions</th>
                            <th
                              className="px-4 py-3"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_c504">CTR</th>
                          </tr>
                        </thead>
                        <tbody data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_f8be">
                          {topPages.slice(0, 15).map((row, i) => (
                            <tr
                              key={i}
                              className="border-b border-border/30 hover:bg-muted/30"
                              data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_0a36_${i}`}>
                              <td
                                className="px-4 py-3 font-medium text-foreground truncate max-w-[300px]"
                                title={row.keys.page}
                                data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_521c_${i}`}>
                                {row.keys.page}
                              </td>
                              <td
                                className="px-4 py-3 text-foreground"
                                data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_75bf_${i}`}>{row.clicks.toLocaleString()}</td>
                              <td
                                className="px-4 py-3 text-muted-foreground"
                                data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_e5aa_${i}`}>{row.impressions.toLocaleString()}</td>
                              <td
                                className="px-4 py-3 text-muted-foreground"
                                data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_e466_${i}`}>{row.ctr}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyStatePanel
                      icon={FileText}
                      title="No page data"
                      description="Page data will appear once Google has collected enough search data."
                      className="py-8"
                      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_e76b" />
                  )}
                </DashboardCard>
              </div>

              {/* Two-column layout: Countries + Devices */}
              <div
                className="grid grid-cols-1 gap-7 lg:grid-cols-2"
                data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_2e20">
                {/* Country Breakdown */}
                <DashboardCard
                  heading="Country Breakdown"
                  icon={<Globe
                    className="h-5 w-5"
                    data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_848f" />}
                  data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_c608">
                  {countries.length > 0 ? (
                    <div
                      className="overflow-x-auto rounded-lg border border-border/50"
                      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_fba3">
                      <table
                        className="w-full text-left text-sm"
                        data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_3233">
                        <thead
                          className="bg-muted/50"
                          data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_eab4">
                          <tr
                            className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground"
                            data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_97ef">
                            <th
                              className="px-4 py-3"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_e786">Country</th>
                            <th
                              className="px-4 py-3"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_08c4">Clicks</th>
                            <th
                              className="px-4 py-3"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_32bb">Impressions</th>
                            <th
                              className="px-4 py-3"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_54ca">CTR</th>
                          </tr>
                        </thead>
                        <tbody data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_3994">
                          {countries.slice(0, 15).map((row, i) => (
                            <tr
                              key={i}
                              className="border-b border-border/30 hover:bg-muted/30"
                              data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_c04a_${i}`}>
                              <td
                                className="px-4 py-3 font-medium text-foreground"
                                data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_adb0_${i}`}>{row.keys.country}</td>
                              <td
                                className="px-4 py-3 text-foreground"
                                data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_530e_${i}`}>{row.clicks.toLocaleString()}</td>
                              <td
                                className="px-4 py-3 text-muted-foreground"
                                data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_8b8c_${i}`}>{row.impressions.toLocaleString()}</td>
                              <td
                                className="px-4 py-3 text-muted-foreground"
                                data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_cd4a_${i}`}>{row.ctr}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyStatePanel
                      icon={Globe}
                      title="No country data"
                      description="Country data will appear once Google has enough data."
                      className="py-8"
                      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_20bd" />
                  )}
                </DashboardCard>

                {/* Device Breakdown */}
                <DashboardCard
                  heading="Device Breakdown"
                  icon={<Monitor
                    className="h-5 w-5"
                    data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_5ebc" />}
                  data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_0cb5">
                  {devices.length > 0 ? (
                    <div
                      className="overflow-x-auto rounded-lg border border-border/50"
                      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_ca3c">
                      <table
                        className="w-full text-left text-sm"
                        data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_8ea5">
                        <thead
                          className="bg-muted/50"
                          data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_2caf">
                          <tr
                            className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground"
                            data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_b266">
                            <th
                              className="px-4 py-3"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_3a18">Device</th>
                            <th
                              className="px-4 py-3"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_59c4">Clicks</th>
                            <th
                              className="px-4 py-3"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_c135">Impressions</th>
                            <th
                              className="px-4 py-3"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_5344">CTR</th>
                            <th
                              className="px-4 py-3"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_f1e8">Share</th>
                          </tr>
                        </thead>
                        <tbody data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_18ed">
                          {devices.map((row, i) => {
                            const totalClicks = devices.reduce((sum, d) => sum + d.clicks, 0);
                            const share = totalClicks > 0 ? ((row.clicks / totalClicks) * 100).toFixed(1) : '0';
                            const icon = row.keys.device === 'MOBILE' ? <Smartphone
                              className="h-3 w-3"
                              data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_7eaf_${i}`} /> : row.keys.device === 'TABLET' ? <Tablet
                              className="h-3 w-3"
                              data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_8ddf_${i}`} /> : <Monitor
                              className="h-3 w-3"
                              data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_690a_${i}`} />;
                            return (
                              <tr
                                key={i}
                                className="border-b border-border/30 hover:bg-muted/30"
                                data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_f7d5_${i}`}>
                                <td
                                  className="px-4 py-3 font-medium text-foreground"
                                  data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_215e_${i}`}>
                                  <span
                                    className="flex items-center gap-2"
                                    data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_3019_${i}`}>{icon}{row.keys.device}</span>
                                </td>
                                <td
                                  className="px-4 py-3 text-foreground"
                                  data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_6106_${i}`}>{row.clicks.toLocaleString()}</td>
                                <td
                                  className="px-4 py-3 text-muted-foreground"
                                  data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_5b68_${i}`}>{row.impressions.toLocaleString()}</td>
                                <td
                                  className="px-4 py-3 text-muted-foreground"
                                  data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_dde1_${i}`}>{row.ctr}%</td>
                                <td
                                  className="px-4 py-3 text-muted-foreground"
                                  data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_36f7_${i}`}>{share}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyStatePanel
                      icon={Monitor}
                      title="No device data"
                      description="Device data will appear once Google has enough data."
                      className="py-8"
                      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_842b" />
                  )}
                </DashboardCard>
              </div>

              {/* URL Inspection Tool */}
              <DashboardCard
                heading="URL Inspection"
                icon={<LinkIcon
                  className="h-5 w-5"
                  data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_7efe" />}
                data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_58c8">
                <div
                  className="flex flex-col gap-4"
                  data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_4f38">
                  <div
                    className="flex gap-2"
                    data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_3821">
                    <Input
                      placeholder="Enter a URL to inspect..."
                      value={inspectUrlInput}
                      onChange={(e) => setInspectUrlInput(e.target.value)}
                      className="flex-1"
                      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_3555" />
                    <Button
                      onClick={handleInspectUrl}
                      loading={inspecting}
                      disabled={!inspectUrlInput.trim()}
                      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_57af">
                      <Search
                        className="h-4 w-4"
                        data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_fcb7" />
                      Inspect
                    </Button>
                  </div>

                  {inspectionResult && (
                    <div
                      className="rounded-lg border border-border/50 p-4"
                      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_5b44">
                      {inspectionResult.indexStatusResult && (
                        <div
                          className="mb-3"
                          data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_a09c">
                          <h4
                            className="mb-2 text-sm font-semibold text-foreground"
                            data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_3da6">Index Status</h4>
                          <div
                            className="flex flex-wrap gap-3 text-sm"
                            data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_e7cd">
                            <span
                              className={`flex items-center gap-1.5 ${inspectionResult.indexStatusResult.coverageState?.includes('indexed') || inspectionResult.indexStatusResult.verdict === 'PASS' ? 'text-success' : 'text-warning'}`}
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_3828">
                              {inspectionResult.indexStatusResult.verdict === 'PASS' ? <CheckCircle
                                className="h-4 w-4"
                                data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_23a1" /> : <XCircle
                                className="h-4 w-4"
                                data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_cccf" />}
                              {inspectionResult.indexStatusResult.coverageState || inspectionResult.indexStatusResult.verdict || 'Unknown'}
                            </span>
                            {inspectionResult.indexStatusResult.lastCrawlTime && (
                              <span
                                className="text-muted-foreground"
                                data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_1b61">
                                Last crawled: {new Date(inspectionResult.indexStatusResult.lastCrawlTime).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {inspectionResult.mobileUsabilityResult && (
                        <div
                          className="mb-3"
                          data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_8d4d">
                          <h4
                            className="mb-2 text-sm font-semibold text-foreground"
                            data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_80ae">Mobile Usability</h4>
                          <span
                            className={`flex items-center gap-1.5 text-sm ${inspectionResult.mobileUsabilityResult.verdict === 'PASS' ? 'text-success' : 'text-warning'}`}
                            data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_2ac0">
                            {inspectionResult.mobileUsabilityResult.verdict === 'PASS' ? <CheckCircle
                              className="h-4 w-4"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_d814" /> : <AlertTriangle
                              className="h-4 w-4"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_4ada" />}
                            {inspectionResult.mobileUsabilityResult.verdict || 'Unknown'}
                          </span>
                          {inspectionResult.mobileUsabilityResult.issues?.length > 0 && (
                            <ul
                              className="mt-2 list-disc pl-5 text-xs text-muted-foreground"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_0971">
                              {inspectionResult.mobileUsabilityResult.issues.map((issue: any, i: number) => (
                                <li
                                  key={i}
                                  data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_5860_${i}`}>{issue.issueType}: {issue.severity}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {inspectionResult.richResultsResult && (
                        <div data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_5f90">
                          <h4
                            className="mb-2 text-sm font-semibold text-foreground"
                            data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_a960">Rich Results</h4>
                          <span
                            className={`flex items-center gap-1.5 text-sm ${inspectionResult.richResultsResult.verdict === 'PASS' ? 'text-success' : 'text-muted-foreground'}`}
                            data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_dbe7">
                            {inspectionResult.richResultsResult.verdict === 'PASS' ? <CheckCircle
                              className="h-4 w-4"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_b6c7" /> : <XCircle
                              className="h-4 w-4"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_4721" />}
                            {inspectionResult.richResultsResult.detectedItems?.length
                              ? `${inspectionResult.richResultsResult.detectedItems.length} rich result(s) detected`
                              : inspectionResult.richResultsResult.verdict || 'None detected'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </DashboardCard>

              {/* Sitemap Management */}
              <DashboardCard
                heading="Sitemaps"
                icon={<FileText
                  className="h-5 w-5"
                  data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_58e2" />}
                data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_d84f">
                <div
                  className="flex flex-col gap-4"
                  data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_7cd8">
                  {/* Submit new sitemap */}
                  <div
                    className="flex gap-2"
                    data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_c869">
                    <Input
                      placeholder="Sitemap URL (e.g., https://example.com/sitemap.xml)"
                      value={sitemapInput}
                      onChange={(e) => setSitemapInput(e.target.value)}
                      className="flex-1"
                      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_faf6" />
                    <Button
                      onClick={handleSubmitSitemap}
                      disabled={!sitemapInput.trim() || !selectedProperty}
                      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_fd96">
                      <Plus
                        className="h-4 w-4"
                        data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_e245" />
                      Submit
                    </Button>
                  </div>

                  {/* Sitemap list */}
                  {sitemapsLoading ? (
                    <div
                      className="flex justify-center py-6"
                      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_c6b8"><Spinner
                      size="md"
                      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_f399" /></div>
                  ) : sitemaps.length > 0 ? (
                    <div
                      className="overflow-x-auto rounded-lg border border-border/50"
                      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_774f">
                      <table
                        className="w-full text-left text-sm"
                        data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_dad8">
                        <thead
                          className="bg-muted/50"
                          data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_611a">
                          <tr
                            className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground"
                            data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_ba55">
                            <th
                              className="px-4 py-3"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_8a95">Path</th>
                            <th
                              className="px-4 py-3"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_9440">Last Submitted</th>
                            <th
                              className="px-4 py-3"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_f837">Status</th>
                            <th
                              className="px-4 py-3"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_c78a">Errors</th>
                            <th
                              className="px-4 py-3"
                              data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_1681">Warnings</th>
                          </tr>
                        </thead>
                        <tbody data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_0a57">
                          {sitemaps.map((sm, i) => (
                            <tr
                              key={i}
                              className="border-b border-border/30 hover:bg-muted/30"
                              data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_a2ac_${i}`}>
                              <td
                                className="px-4 py-3 font-medium text-foreground truncate max-w-[300px]"
                                title={sm.path}
                                data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_0555_${i}`}>
                                {sm.path}
                              </td>
                              <td
                                className="px-4 py-3 text-muted-foreground"
                                data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_2344_${i}`}>
                                {sm.lastSubmitted ? new Date(sm.lastSubmitted).toLocaleDateString() : 'N/A'}
                              </td>
                              <td
                                className="px-4 py-3"
                                data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_561d_${i}`}>
                                <span
                                  className={`text-xs font-medium ${sm.isPending ? 'text-warning' : parseInt(sm.errors) > 0 ? 'text-destructive' : 'text-success'}`}
                                  data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_7d25_${i}`}>
                                  {sm.isPending ? 'Pending' : parseInt(sm.errors) > 0 ? 'Errors' : 'OK'}
                                </span>
                              </td>
                              <td
                                className="px-4 py-3 text-muted-foreground"
                                data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_d778_${i}`}>{sm.errors}</td>
                              <td
                                className="px-4 py-3 text-muted-foreground"
                                data-icod-id={`src_pages_dashboard_dashboardsearchperformance_tsx_d3ba_${i}`}>{sm.warnings}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyStatePanel
                      icon={FileText}
                      title="No sitemaps found"
                      description="Submit a sitemap URL above to help Google discover your pages."
                      className="py-6"
                      data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_70de" />
                  )}
                </div>
              </DashboardCard>

              {/* Data source disclaimer */}
              <Alert
                variant="info"
                data-icod-id="src_pages_dashboard_dashboardsearchperformance_tsx_05fe">
                Data sourced directly from Google Search Console API. Metrics reflect actual search performance
                for verified properties. Data may be delayed by up to 48 hours.
              </Alert>
            </>
          )}
        </>
      )}
    </div>
  );
}
