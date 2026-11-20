import { useEffect, useMemo } from 'react';
import { Link2, ExternalLink, RefreshCw, AlertTriangle, ShieldAlert, Globe, Unlink } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { fetchBacklinks, triggerReanalyzeBacklinks } from '@/store/slices/analysisSlice';
import { Button, Badge, Spinner, Alert } from '@/components/ui';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EmptyStatePanel from '@/components/dashboard/EmptyStatePanel';

const TYPE_LABELS: Record<string, string> = {
  'competitor-referral': 'Competitor Referral',
  'broken-link': 'Broken Link',
  'unlinked-mention': 'Unlinked Mention',
  'guest-post': 'Guest Post',
};

const STATUS_VARIANTS: Record<string, 'new' | 'free' | 'default'> = {
  discovered: 'default',
  contacted: 'new',
  acquired: 'free',
};

const REL_COLORS: Record<string, string> = {
  follow: 'bg-success/10 text-success',
  nofollow: 'bg-muted text-muted-foreground',
  ugc: 'bg-accent/10 text-accent-foreground',
  sponsored: 'bg-warning/10 text-warning',
};

export default function DashboardBacklinks() {
  const dispatch = useAppDispatch();
  const { currentProjectId } = useAppSelector((s) => s.projects);
  const { backlinks, backlinkStatus, reanalyzeBacklinksStatus } = useAppSelector((s) => s.analysis);
  const userRole = useAppSelector((s) => s.auth.user?.role) || 'viewer';
  const canWrite = userRole !== 'viewer';

  useEffect(() => {
    if (currentProjectId) {
      dispatch(fetchBacklinks(currentProjectId));
    }
  }, [currentProjectId, dispatch]);

  const handleReanalyze = () => {
    if (!currentProjectId) return;
    dispatch(triggerReanalyzeBacklinks(currentProjectId))
      .then(() => {
        dispatch(addToast({ message: 'Backlink re-analysis started!', variant: 'success' }));
        setTimeout(() => dispatch(fetchBacklinks(currentProjectId)), 5000);
      })
      .catch(() => {
        dispatch(addToast({ message: 'Failed to start re-analysis.', variant: 'error' }));
      });
  };

  const isLoading = backlinkStatus === 'loading' || reanalyzeBacklinksStatus === 'loading';

  // Compute summary stats
  const stats = useMemo(() => {
    if (backlinks.length === 0) return null;
    const totalBacklinks = backlinks.length;
    const uniqueDomains = new Set(backlinks.map(bl => bl.referringDomain).filter(Boolean)).size;
    const followCount = backlinks.filter(bl => bl.relAttribute === 'follow').length;
    const nofollowCount = backlinks.filter(bl => bl.relAttribute === 'nofollow').length;
    const brokenCount = backlinks.filter(bl => bl.isBroken).length;
    const spamCount = backlinks.filter(bl => bl.spamSignal).length;

    // Top referring domains
    const domainCounts = new Map<string, { count: number; follow: number; nofollow: number }>();
    for (const bl of backlinks) {
      const domain = bl.referringDomain || (() => { try { return new URL(bl.sourceUrl).hostname; } catch { return 'unknown'; } })();
      if (!domainCounts.has(domain)) domainCounts.set(domain, { count: 0, follow: 0, nofollow: 0 });
      const entry = domainCounts.get(domain)!;
      entry.count++;
      if (bl.relAttribute === 'follow') entry.follow++;
      else entry.nofollow++;
    }
    const topDomains = [...domainCounts.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);

    return {
      totalBacklinks,
      uniqueDomains,
      followCount,
      nofollowCount,
      followRatio: totalBacklinks > 0 ? Math.round((followCount / totalBacklinks) * 100) : 0,
      brokenCount,
      spamCount,
      topDomains,
    };
  }, [backlinks]);

  // Group by type
  const grouped = backlinks.reduce<Record<string, typeof backlinks>>((acc, bl) => {
    if (!acc[bl.type]) acc[bl.type] = [];
    acc[bl.type].push(bl);
    return acc;
  }, {});

  const brokenBacklinks = backlinks.filter(bl => bl.isBroken);
  const spamSignals = backlinks.filter(bl => bl.spamSignal);

  return (
    <div
      className="flex flex-col gap-8"
      data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_4b3d">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_1597">
        <div data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_6b34">
          <h1
            className="font-heading text-2xl font-bold text-foreground sm:text-3xl tracking-tight"
            data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_552a">
            Backlink Audit
          </h1>
          <p
            className="mt-2 text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_c41e">
            Discover and track backlink opportunities to improve domain authority.
          </p>
        </div>
        {currentProjectId && canWrite && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReanalyze}
            loading={isLoading}
            data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_0943">
            <RefreshCw
              className="h-3 w-3"
              data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_3bb7" />
            Re-analyze
          </Button>
        )}
      </div>
      <Alert
        variant="info"
        data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_9f7e">
        Backlink data is generated through site crawling analysis. For comprehensive backlink profiles, connect a dedicated backlink provider (Ahrefs, Moz, Majestic).
      </Alert>
      {/* Intelligence Summary */}
      {stats && (
        <div
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
          data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_b1be">
          <DashboardCard
            heading="Total Found"
            data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_147e">
            <div
              className="flex items-center gap-2"
              data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_b206">
              <Link2
                className="h-6 w-6 text-primary"
                data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_5573" />
              <div data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_733e">
                <p
                  className="text-xl font-bold text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_5be1">{stats.totalBacklinks}</p>
                <p
                  className="text-[10px] text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_c12a">Backlinks</p>
              </div>
            </div>
          </DashboardCard>
          <DashboardCard
            heading="Referring Domains"
            data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_2f36">
            <div
              className="flex items-center gap-2"
              data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_5e38">
              <Globe
                className="h-6 w-6 text-accent-foreground"
                data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_b6bc" />
              <div data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_29fd">
                <p
                  className="text-xl font-bold text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_0538">{stats.uniqueDomains}</p>
                <p
                  className="text-[10px] text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_f6bf">Unique domains</p>
              </div>
            </div>
          </DashboardCard>
          <DashboardCard
            heading="Follow Ratio"
            data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_fb61">
            <div
              className="flex items-center gap-2"
              data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_eae9">
              <div
                className="h-6 w-6 rounded-full border-2 border-success flex items-center justify-center text-[8px] font-bold text-success"
                data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_be30">
                {stats.followRatio}%
              </div>
              <div data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_7262">
                <p
                  className="text-sm font-medium text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_e113">{stats.followCount}F / {stats.nofollowCount}NF</p>
                <p
                  className="text-[10px] text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_d355">Follow vs Nofollow</p>
              </div>
            </div>
          </DashboardCard>
          <DashboardCard
            heading="Broken Links"
            data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_d5d6">
            <div
              className="flex items-center gap-2"
              data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_1bfc">
              <Unlink
                className={`h-6 w-6 ${stats.brokenCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`}
                data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_1eda" />
              <div data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_9a50">
                <p
                  className={`text-xl font-bold ${stats.brokenCount > 0 ? 'text-destructive' : 'text-foreground'}`}
                  data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_4398">{stats.brokenCount}</p>
                <p
                  className="text-[10px] text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_4732">Broken backlinks</p>
              </div>
            </div>
          </DashboardCard>
          <DashboardCard
            heading="Spam Signals"
            data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_672a">
            <div
              className="flex items-center gap-2"
              data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_8ec6">
              <ShieldAlert
                className={`h-6 w-6 ${stats.spamCount > 0 ? 'text-warning' : 'text-muted-foreground'}`}
                data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_fee3" />
              <div data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_9c15">
                <p
                  className={`text-xl font-bold ${stats.spamCount > 0 ? 'text-warning' : 'text-foreground'}`}
                  data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_1ec6">{stats.spamCount}</p>
                <p
                  className="text-[10px] text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_652c">Potential spam</p>
              </div>
            </div>
          </DashboardCard>
        </div>
      )}
      {isLoading ? (
        <div
          className="flex justify-center py-16"
          data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_7432">
          <Spinner size="lg" data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_3b0c" />
        </div>
      ) : backlinks.length > 0 ? (
        <>
          {/* Top Referring Domains */}
          {stats && stats.topDomains.length > 0 && (
            <DashboardCard
              heading="Top Referring Domains"
              data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_72e2">
              <div
                className="overflow-x-auto rounded-lg border border-border/50"
                data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_87c2">
                <table
                  className="w-full text-left text-sm"
                  data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_466b">
                  <thead
                    className="bg-muted/50"
                    data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_e269">
                    <tr
                      className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_5a86">
                      <th
                        className="px-4 py-3"
                        data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_b9fc">Domain</th>
                      <th
                        className="px-4 py-3"
                        data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_d3a0">Links</th>
                      <th
                        className="px-4 py-3"
                        data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_9f08">Follow</th>
                      <th
                        className="px-4 py-3"
                        data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_8ac4">Nofollow</th>
                    </tr>
                  </thead>
                  <tbody data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_5ba3">
                    {stats.topDomains.map(([domain, data]) => (
                      <tr
                        key={domain}
                        className="border-b border-border/30 hover:bg-muted/30"
                        data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_41aa_${domain}`}>
                        <td
                          className="px-4 py-3 font-medium text-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_f31d_${domain}`}>{domain}</td>
                        <td
                          className="px-4 py-3 text-muted-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_4f42_${domain}`}>{data.count}</td>
                        <td
                          className="px-4 py-3 text-success"
                          data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_29de_${domain}`}>{data.follow}</td>
                        <td
                          className="px-4 py-3 text-muted-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_7bfc_${domain}`}>{data.nofollow}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashboardCard>
          )}

          {/* Broken Backlinks Section */}
          {brokenBacklinks.length > 0 && (
            <DashboardCard
              heading="Broken Backlinks"
              data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_4e4f">
              <Alert
                variant="error"
                data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_5b5b">
                {brokenBacklinks.length} backlink(s) point to pages returning errors. These may be opportunities to reclaim or redirect.
              </Alert>
              <div
                className="overflow-x-auto rounded-lg border border-border/50 mt-4"
                data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_f71b">
                <table
                  className="w-full text-left text-sm"
                  data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_fd58">
                  <thead
                    className="bg-muted/50"
                    data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_f2fa">
                    <tr
                      className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_306c">
                      <th
                        className="px-4 py-3"
                        data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_0236">Source</th>
                      <th
                        className="px-4 py-3"
                        data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_dd64">Target (Broken)</th>
                      <th
                        className="px-4 py-3"
                        data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_a17e">Type</th>
                    </tr>
                  </thead>
                  <tbody data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_3c9b">
                    {brokenBacklinks.slice(0, 20).map((bl) => (
                      <tr
                        key={bl._id}
                        className="border-b border-border/30 hover:bg-destructive/5"
                        data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_fdea_${bl._id}`}>
                        <td
                          className="px-4 py-3"
                          data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_0fb4_${bl._id}`}>
                          <a
                            href={bl.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline truncate max-w-[200px]"
                            data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_3645_${bl._id}`}>
                            {(() => { try { return new URL(bl.sourceUrl).hostname; } catch { return bl.sourceUrl; } })()}
                            <ExternalLink
                              className="h-3 w-3 shrink-0"
                              data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_28a3_${bl._id}`} />
                          </a>
                        </td>
                        <td
                          className="px-4 py-3 text-destructive truncate max-w-[200px]"
                          data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_4c20_${bl._id}`}>{bl.targetUrl}</td>
                        <td
                          className="px-4 py-3"
                          data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_795c_${bl._id}`}>
                          <Badge
                            variant="free"
                            className="text-[9px]"
                            data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_d561_${bl._id}`}>{TYPE_LABELS[bl.type] || bl.type}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashboardCard>
          )}

          {/* Spam Signals Section */}
          {spamSignals.length > 0 && (
            <DashboardCard
              heading="Spam Signals"
              data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_d4cf">
              <Alert
                variant="warning"
                data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_e1b8">
                {spamSignals.length} link(s) flagged as potentially low-quality based on domain patterns. Review before pursuing.
              </Alert>
              <div
                className="overflow-x-auto rounded-lg border border-border/50 mt-4"
                data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_407d">
                <table
                  className="w-full text-left text-sm"
                  data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_04db">
                  <thead
                    className="bg-muted/50"
                    data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_031d">
                    <tr
                      className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_f0e5">
                      <th
                        className="px-4 py-3"
                        data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_d778">Source Domain</th>
                      <th
                        className="px-4 py-3"
                        data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_23cf">Target</th>
                      <th
                        className="px-4 py-3"
                        data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_50df">Signal</th>
                    </tr>
                  </thead>
                  <tbody data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_af3f">
                    {spamSignals.slice(0, 20).map((bl) => (
                      <tr
                        key={bl._id}
                        className="border-b border-border/30 hover:bg-warning/5"
                        data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_ad9e_${bl._id}`}>
                        <td
                          className="px-4 py-3 text-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_22e8_${bl._id}`}>{bl.referringDomain || bl.sourceUrl}</td>
                        <td
                          className="px-4 py-3 text-muted-foreground truncate max-w-[200px]"
                          data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_0376_${bl._id}`}>{bl.targetUrl}</td>
                        <td
                          className="px-4 py-3"
                          data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_d9a4_${bl._id}`}>
                          <div
                            className="flex items-center gap-1"
                            data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_bf55_${bl._id}`}>
                            <AlertTriangle
                              className="h-3 w-3 text-warning"
                              data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_7ae1_${bl._id}`} />
                            <span
                              className="text-xs text-warning"
                              data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_e1fe_${bl._id}`}>Low-quality pattern</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashboardCard>
          )}

          {/* Main backlink list by type */}
          {Object.entries(grouped).map(([type, items]) => (
            <DashboardCard
              key={type}
              heading={TYPE_LABELS[type] || type}
              data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_84e4_${type}`}>
              <div
                className="overflow-x-auto rounded-lg border border-border/50"
                data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_feb1_${type}`}>
                <table
                  className="w-full text-left text-sm"
                  data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_06d3_${type}`}>
                  <thead
                    className="bg-muted/50"
                    data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_55b2_${type}`}>
                    <tr
                      className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_28e7_${type}`}>
                      <th
                        className="px-4 py-3 pr-4 min-w-[150px]"
                        data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_a279_${type}`}>Source URL</th>
                      <th
                        className="px-4 py-3 pr-4 min-w-[120px]"
                        data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_8b2a_${type}`}>Anchor Text</th>
                      <th
                        className="px-4 py-3 pr-4 min-w-[80px]"
                        data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_3ca7_${type}`}>Rel</th>
                      <th
                        className="px-4 py-3 pr-4 min-w-[100px]"
                        data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_8fbb_${type}`}>Target URL</th>
                      <th
                        className="px-4 py-3 pr-4 min-w-[80px]"
                        data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_3cd2_${type}`}>Flags</th>
                      <th
                        className="px-4 py-3 min-w-[80px]"
                        data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_5299_${type}`}>Status</th>
                    </tr>
                  </thead>
                  <tbody data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_818b_${type}`}>
                    {items.map((bl) => (
                      <tr
                        key={bl._id}
                        className={`border-b border-border/30 hover:bg-muted/30 ${bl.isBroken ? 'bg-destructive/5' : ''} ${bl.spamSignal ? 'bg-warning/5' : ''}`}
                        data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_2d36_${type}_${bl._id}`}>
                        <td
                          className="px-4 py-3"
                          data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_061c_${type}_${bl._id}`}>
                          <a
                            href={bl.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline truncate max-w-[200px]"
                            data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_fb7a_${type}_${bl._id}`}>
                            {(() => { try { return new URL(bl.sourceUrl).hostname; } catch { return bl.sourceUrl; } })()}
                            <ExternalLink
                              className="h-3 w-3 shrink-0"
                              data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_e5fa_${type}_${bl._id}`} />
                          </a>
                        </td>
                        <td
                          className="px-4 py-3 text-muted-foreground truncate max-w-[150px]"
                          title={bl.anchorText || ''}
                          data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_2000_${type}_${bl._id}`}>
                          {bl.anchorText || 'N/A'}
                        </td>
                        <td
                          className="px-4 py-3"
                          data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_55b5_${type}_${bl._id}`}>
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold ${REL_COLORS[bl.relAttribute] || REL_COLORS.follow}`}
                            data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_6fd9_${type}_${bl._id}`}>
                            {bl.relAttribute}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 text-muted-foreground truncate max-w-[150px]"
                          data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_c640_${type}_${bl._id}`}>{bl.targetUrl}</td>
                        <td
                          className="px-4 py-3"
                          data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_175a_${type}_${bl._id}`}>
                          <div
                            className="flex gap-1"
                            data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_aefd_${type}_${bl._id}`}>
                            {bl.isBroken && <Badge
                              variant="free"
                              className="text-[8px]"
                              data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_f6dd_${type}_${bl._id}`}>Broken</Badge>}
                            {bl.spamSignal && <Badge
                              variant="new"
                              className="text-[8px]"
                              data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_7ebf_${type}_${bl._id}`}>Spam</Badge>}
                          </div>
                        </td>
                        <td
                          className="px-4 py-3"
                          data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_522a_${type}_${bl._id}`}>
                          <Badge
                            variant={STATUS_VARIANTS[bl.status] || 'default'}
                            className="text-[10px]"
                            data-icod-id={`src_pages_dashboard_dashboardbacklinks_tsx_9d9b_${type}_${bl._id}`}>
                            {bl.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashboardCard>
          ))}
        </>
      ) : (
        <DashboardCard
          heading="Backlink Opportunities"
          data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_844a">
          <EmptyStatePanel
            icon={Link2}
            title="No backlink opportunities found"
            description="Run a full audit first, then use Re-analyze to discover backlink opportunities based on competitor crawling."
            note="Data is derived from crawling competitor pages — not from external backlink APIs."
            className="py-12"
            data-icod-id="src_pages_dashboard_dashboardbacklinks_tsx_7698" />
        </DashboardCard>
      )}
    </div>
  );
}
