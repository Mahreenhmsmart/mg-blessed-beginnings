import { useState, useEffect, useRef } from 'react';
import { Search, Lightbulb, Users, FileText, AlertTriangle, Info, Plus, ExternalLink, BarChart3, Shield, Accessibility, Share2, ArrowUpRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { fetchProjects } from '@/store/slices/projectsSlice';
import { triggerNewAudit, fetchAuditsByProject, fetchAuditById } from '@/store/slices/auditsSlice';
import { fetchGSCData } from '@/store/slices/analysisSlice';
import { Button, Input, Badge, Spinner, Alert } from '@/components/ui';
import ScoreCard from '@/components/dashboard/ScoreCard';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EmptyStatePanel from '@/components/dashboard/EmptyStatePanel';
import CreateProjectModal from '@/components/dashboard/CreateProjectModal';
import { getGSCTopQueries, getGSCTopPages } from '@/services/auditService';
import type { Audit, GSCAnalyticsRow } from '@/types';

export default function DashboardOverview() {
  const dispatch = useAppDispatch();
  const { items: projects, currentProjectId, status: projectStatus } = useAppSelector((s) => s.projects);
  const { audits, triggerStatus } = useAppSelector((s) => s.audits);
  const { gscData, gscStatus } = useAppSelector((s) => s.analysis);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pollingAuditId, setPollingAuditId] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [gscTopQueries, setGscTopQueries] = useState<GSCAnalyticsRow[]>([]);
  const [gscTopPages, setGscTopPages] = useState<GSCAnalyticsRow[]>([]);

  const userRole = useAppSelector((s) => s.auth.user?.role) || 'viewer';
  const canWrite = userRole !== 'viewer';
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    if (projectStatus === 'idle') {
      dispatch(fetchProjects());
    }
  }, [projectStatus, dispatch]);

  useEffect(() => {
    if (currentProjectId) {
      dispatch(fetchAuditsByProject(currentProjectId));
      dispatch(fetchGSCData(currentProjectId));
    }
  }, [currentProjectId, dispatch]);

  // Fetch GSC top queries/pages for overview widgets
  useEffect(() => {
    if (!currentProjectId || !gscData?.configured) return;
    let cancelled = false;
    async function fetchGSCWidgets() {
      try {
        const [queries, pages] = await Promise.allSettled([
          getGSCTopQueries(currentProjectId!, undefined, undefined, 5),
          getGSCTopPages(currentProjectId!, undefined, undefined, 5),
        ]);
        if (!cancelled) {
          if (queries.status === 'fulfilled') setGscTopQueries(queries.value.rows || []);
          if (pages.status === 'fulfilled') setGscTopPages(pages.value.rows || []);
        }
      } catch {
        // Silently fail — these are supplementary widgets
      }
    }
    fetchGSCWidgets();
    return () => { cancelled = true; };
  }, [currentProjectId, gscData?.configured]);

  // Poll for audit completion
  useEffect(() => {
    if (pollingAuditId && currentProjectId) {
      pollingRef.current = setInterval(async () => {
        try {
          const result = await dispatch(fetchAuditById(pollingAuditId)).unwrap();
          if (result.status === 'completed' || result.status === 'failed') {
            setPollingAuditId(null);
            dispatch(fetchAuditsByProject(currentProjectId));
            if (result.status === 'completed') {
              dispatch(addToast({ message: 'Audit completed successfully!', variant: 'success' }));
            } else {
              dispatch(addToast({ message: 'Audit failed. Please try again.', variant: 'error' }));
            }
          }
        } catch {
          // Continue polling on error
        }
      }, 2000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [pollingAuditId, currentProjectId, dispatch]);

  const currentProject = projects.find((p) => p._id === currentProjectId);
  const latestAudit = audits.find((a) => a.status === 'completed') || null;

  const scores = latestAudit?.scores || null;
  const recommendations = latestAudit?.recommendations || [];
  const criticalCount = recommendations.filter((r) => r.severity === 'critical').length;
  const warningCount = recommendations.filter((r) => r.severity === 'warning').length;
  const infoCount = recommendations.filter((r) => r.severity === 'info').length;

  const handleAnalyze = async () => {
    if (!currentProjectId) {
      dispatch(addToast({ message: 'Please create a project first.', variant: 'error' }));
      return;
    }
    
    try {
      const result = await dispatch(triggerNewAudit(currentProjectId)).unwrap();
      if (result?.auditId) {
        setPollingAuditId(result.auditId);
        dispatch(addToast({ message: 'Audit started! Monitoring progress...', variant: 'info' }));
      }
    } catch {
      dispatch(addToast({ message: 'Failed to start audit', variant: 'error' }));
    }
  };

  const isRunning = triggerStatus === 'loading' || pollingAuditId !== null;

  return (
    <div
      className="flex flex-col gap-10"
      data-icod-id="src_pages_dashboard_dashboardoverview_tsx_2c2f">
      {/* Page heading */}
      <div data-icod-id="src_pages_dashboard_dashboardoverview_tsx_cbd8">
        <h1
          className="font-heading text-2xl font-bold text-foreground sm:text-3xl tracking-tight"
          data-icod-id="src_pages_dashboard_dashboardoverview_tsx_5309">
          Dashboard Overview
        </h1>
        <p
          className="mt-2 text-sm text-muted-foreground leading-relaxed"
          data-icod-id="src_pages_dashboard_dashboardoverview_tsx_5738">
          Monitor your website visibility across search engines and AI platforms.
        </p>
      </div>
      {/* Project creation / selection */}
      {!currentProject && !showCreateModal && isAdmin && (
        <DashboardCard
          heading="Get Started"
          data-icod-id="src_pages_dashboard_dashboardoverview_tsx_c82d">
          <EmptyStatePanel
            icon={Plus}
            title="No projects yet"
            description="Create your first project to start analyzing website visibility."
            action={
              <Button
                onClick={() => setShowCreateModal(true)}
                data-icod-id="src_pages_dashboard_dashboardoverview_tsx_dca8">
                <Plus
                  className="h-4 w-4"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_9108" />
                Create Project
              </Button>
            }
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_3984" />
        </DashboardCard>
      )}
      {!currentProject && !showCreateModal && !isAdmin && (
        <DashboardCard
          heading="Get Started"
          data-icod-id="src_pages_dashboard_dashboardoverview_tsx_c82d">
          <EmptyStatePanel
            icon={Plus}
            title="No projects yet"
            description="Create your first project to start analyzing website visibility."
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_3984" />
        </DashboardCard>
      )}
      {/* Shared Create Project Modal */}
      <CreateProjectModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        data-icod-id="src_pages_dashboard_dashboardoverview_tsx_99a8" />
      {/* Score Cards Row */}
      <section data-icod-id="src_pages_dashboard_dashboardoverview_tsx_e1d2">
        <div
          className="mb-4 flex items-center justify-between"
          data-icod-id="src_pages_dashboard_dashboardoverview_tsx_5aaf">
          <h2
            className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_cc8f">
            Technical Health Metrics
          </h2>
          {!scores && <Badge
            variant="default"
            className="text-[10px]"
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_d490">No Data Yet</Badge>}
        </div>
        <div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          data-icod-id="src_pages_dashboard_dashboardoverview_tsx_84cc">
          <ScoreCard
            title="On-Page SEO"
            score={scores?.seo ?? null}
            maxScore={100}
            color="var(--color-purple)"
            label="Meta tags, headings, content structure"
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_153b" />
          <ScoreCard
            title="AEO Score"
            score={scores?.aeo ?? null}
            maxScore={100}
            color="var(--color-teal)"
            label="AI Search Readiness"
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_b164" />
          <ScoreCard
            title="Schema Score"
            score={scores?.schema ?? null}
            maxScore={100}
            color="var(--color-pink)"
            label="Structured Data"
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_schema_score" />
          <ScoreCard
            title="Performance"
            score={scores?.performance ?? null}
            maxScore={100}
            color="var(--color-gold)"
            label={`Performance: ${scores?.performance ?? 0}/100`}
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_perf_score" />
          <ScoreCard
            title="Mobile Score"
            score={scores?.mobile ?? null}
            maxScore={100}
            color="var(--gradient-primary)"
            label="Mobile Friendliness"
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_mobile_score" />
        </div>
        {/* Extended Scores Row */}
        <div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mt-5"
          data-icod-id="src_pages_dashboard_dashboardoverview_tsx_extended_scores">
          <ScoreCard
            title="GEO Score"
            score={scores?.geo ?? null}
            maxScore={100}
            color="var(--color-pink)"
            label="Generative Engine Optimization"
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_936c" />
          <ScoreCard
            title="AIO Score"
            score={scores?.aio ?? null}
            maxScore={100}
            color="var(--color-gold)"
            label="AI Optimization"
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_25be" />
          <ScoreCard
            title="SXO Score"
            score={scores?.sxo ?? null}
            maxScore={100}
            color="var(--gradient-primary)"
            label="Search Experience Optimization"
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_cf75" />
          <ScoreCard
            title="CQ Score"
            score={scores?.cq ?? null}
            maxScore={100}
            color="rgb(var(--accent))"
            label="Content Quality / E-E-A-T"
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_cq_score" />
          <ScoreCard
            title="Local SEO"
            score={scores?.localSeo ?? null}
            maxScore={100}
            color="var(--color-teal)"
            label="Local Visibility"
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_local_score" />
        </div>
        {/* New Intelligence Scores Row */}
        <div
          className="grid grid-cols-1 gap-5 sm:grid-cols-3 mt-5"
          data-icod-id="src_pages_dashboard_dashboardoverview_tsx_intel_scores">
          <ScoreCard
            title="Security"
            score={scores?.security ?? null}
            maxScore={100}
            color="rgb(var(--accent))"
            label="Security Headers & HTTPS"
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_security_score" />
          <ScoreCard
            title="Accessibility"
            score={scores?.accessibility ?? null}
            maxScore={100}
            color="var(--color-teal)"
            label="WCAG Compliance"
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_a11y_score" />
          <ScoreCard
            title="Social Media"
            score={scores?.social ?? null}
            maxScore={100}
            color="var(--color-purple)"
            label="OG & Twitter Cards"
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_social_score" />
        </div>
      </section>
      {/* Website Health Widget */}
      {latestAudit && latestAudit.status === 'completed' && (
        <DashboardCard
          heading="Website Health"
          icon={<BarChart3
            className="h-5 w-5"
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_dcdb" />}
          action={
            <a
              href="/website-audit"
              className="text-xs text-primary hover:underline font-medium"
              data-icod-id="src_pages_dashboard_dashboardoverview_tsx_bbd1">View Full Audit</a>
          }
          data-icod-id="src_pages_dashboard_dashboardoverview_tsx_health_widget">
          <div
            className="flex items-center gap-6"
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_f214">
            <div
              className="flex flex-col items-center"
              data-icod-id="src_pages_dashboard_dashboardoverview_tsx_9256">
              <span
                className="font-heading text-3xl font-extrabold text-foreground"
                data-icod-id="src_pages_dashboard_dashboardoverview_tsx_3321">
                {(() => {
                  const vals = Object.values(latestAudit.scores).filter((v): v is number => typeof v === 'number');
                  return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
                })()}
              </span>
              <span
                className="text-xs text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardoverview_tsx_cb16">Overall /100</span>
            </div>
            <div
              className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center"
              data-icod-id="src_pages_dashboard_dashboardoverview_tsx_d39c">
              <div data-icod-id="src_pages_dashboard_dashboardoverview_tsx_0971">
                <p
                  className="text-lg font-bold text-destructive"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_91c1">
                  {Object.values(latestAudit.results || {}).reduce((acc, lr) => acc + (lr?.checks?.filter((c: { status: string }) => c.status === 'fail').length || 0), 0)}
                </p>
                <p
                  className="text-[10px] text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_6594">Critical</p>
              </div>
              <div data-icod-id="src_pages_dashboard_dashboardoverview_tsx_3794">
                <p
                  className="text-lg font-bold text-warning"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_146f">
                  {Object.values(latestAudit.results || {}).reduce((acc, lr) => acc + (lr?.checks?.filter((c: { status: string }) => c.status === 'warn').length || 0), 0)}
                </p>
                <p
                  className="text-[10px] text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_50d8">Warnings</p>
              </div>
              <div data-icod-id="src_pages_dashboard_dashboardoverview_tsx_09b1">
                <p
                  className="text-lg font-bold text-success"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_d12e">
                  {Object.values(latestAudit.results || {}).reduce((acc, lr) => acc + (lr?.checks?.filter((c: { status: string }) => c.status === 'pass').length || 0), 0)}
                </p>
                <p
                  className="text-[10px] text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_1064">Passed</p>
              </div>
              <div data-icod-id="src_pages_dashboard_dashboardoverview_tsx_345d">
                <p
                  className="text-lg font-bold text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_8821">{Object.keys(latestAudit.results || {}).length}</p>
                <p
                  className="text-[10px] text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_c9b3">Categories</p>
              </div>
            </div>
          </div>
        </DashboardCard>
      )}
      {/* Analyze button */}
      {currentProject && canWrite && (
        <DashboardCard
          heading="Run Analysis"
          className="border-primary/20 bg-gradient-to-br from-card to-muted/30"
          data-icod-id="src_pages_dashboard_dashboardoverview_tsx_4dc6">
          <p
            className="text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_a1af">
            Run a comprehensive visibility audit for <strong data-icod-id="src_pages_dashboard_dashboardoverview_tsx_84f3">{currentProject.url}</strong>.
          </p>
          <div
            className="flex items-center gap-3 pt-2"
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_e96f">
            <Button
              onClick={handleAnalyze}
              loading={isRunning}
              className="shadow-md"
              data-icod-id="src_pages_dashboard_dashboardoverview_tsx_60da">
              <Search
                className="h-4 w-4"
                data-icod-id="src_pages_dashboard_dashboardoverview_tsx_b2d0" />
              {isRunning ? 'Analyzing...' : 'Run Full Audit'}
            </Button>
            {isRunning && (
              <span
                className="flex items-center gap-2 text-xs text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardoverview_tsx_b23f">
                <Spinner size="sm" data-icod-id="src_pages_dashboard_dashboardoverview_tsx_fbcb" /> This may take 10-30 seconds
              </span>
            )}
          </div>
        </DashboardCard>
      )}
      {/* Two-column layout */}
      <div
        className="grid grid-cols-1 gap-7 lg:grid-cols-2"
        data-icod-id="src_pages_dashboard_dashboardoverview_tsx_a51d">
        {/* Recent Audits Table */}
        <DashboardCard
          heading="Recent Audits"
          data-icod-id="src_pages_dashboard_dashboardoverview_tsx_c405">
          {audits.length > 0 ? (
            <div
              className="overflow-x-auto rounded-lg border border-border/50"
              data-icod-id="src_pages_dashboard_dashboardoverview_tsx_bdda">
              <table
                className="w-full text-left text-sm"
                data-icod-id="src_pages_dashboard_dashboardoverview_tsx_64eb">
                <thead
                  className="bg-muted/50"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_b745">
                  <tr
                    className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardoverview_tsx_9cdc">
                    <th
                      className="px-4 py-3 pr-4"
                      data-icod-id="src_pages_dashboard_dashboardoverview_tsx_9a17">Date</th>
                    <th
                      className="px-4 py-3 pr-4"
                      data-icod-id="src_pages_dashboard_dashboardoverview_tsx_84bb">SEO</th>
                    <th
                      className="px-4 py-3 pr-4"
                      data-icod-id="src_pages_dashboard_dashboardoverview_tsx_980e">AEO</th>
                    <th
                      className="px-4 py-3 pr-4"
                      data-icod-id="src_pages_dashboard_dashboardoverview_tsx_f7b7">GEO</th>
                    <th
                      className="px-4 py-3 pr-4"
                      data-icod-id="src_pages_dashboard_dashboardoverview_tsx_e9e8">AIO</th>
                    <th
                      className="px-4 py-3 pr-4"
                      data-icod-id="src_pages_dashboard_dashboardoverview_tsx_7cc1">SXO</th>
                    <th
                      className="px-4 py-3 pr-4"
                      data-icod-id="src_pages_dashboard_dashboardoverview_tsx_cq_hdr">CQ</th>
                    <th
                      className="px-4 py-3"
                      data-icod-id="src_pages_dashboard_dashboardoverview_tsx_4e6b">Status</th>
                  </tr>
                </thead>
                <tbody data-icod-id="src_pages_dashboard_dashboardoverview_tsx_9aaf">
                  {audits.slice(0, 5).map((audit: Audit) => (
                    <tr
                      key={audit._id}
                      className="border-b border-border/30 hover:bg-muted/30"
                      data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_6ae2_${audit._id}`}>
                      <td
                        className="px-4 py-3 text-muted-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_ebe0_${audit._id}`}>
                        {new Date(audit.createdAt).toLocaleDateString()}
                      </td>
                      <td
                        className="px-4 py-3 font-medium"
                        data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_b687_${audit._id}`}>{audit.scores.seo}</td>
                      <td
                        className="px-4 py-3 font-medium"
                        data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_ce9f_${audit._id}`}>{audit.scores.aeo}</td>
                      <td
                        className="px-4 py-3 font-medium"
                        data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_228d_${audit._id}`}>{audit.scores.geo}</td>
                      <td
                        className="px-4 py-3 font-medium"
                        data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_581b_${audit._id}`}>{audit.scores.aio}</td>
                      <td
                        className="px-4 py-3 font-medium"
                        data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_5f26_${audit._id}`}>{audit.scores.sxo}</td>
                      <td
                        className="px-4 py-3 font-medium"
                        data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_cq_score_${audit._id}`}>{audit.scores.cq ?? 0}</td>
                      <td
                        className="px-4 py-3"
                        data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_8e76_${audit._id}`}>
                        <Badge
                          variant={audit.status === 'completed' ? 'new' : 'default'}
                          className="text-[10px]"
                          data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_f920_${audit._id}`}>
                          {audit.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyStatePanel
              icon={FileText}
              title="No audits yet"
              description="Run your first website analysis to see results here."
              className="py-10"
              data-icod-id="src_pages_dashboard_dashboardoverview_tsx_fa50" />
          )}
        </DashboardCard>

        {/* Issues Summary */}
        <DashboardCard
          heading="Issues by Severity"
          data-icod-id="src_pages_dashboard_dashboardoverview_tsx_d128">
          <div
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_13ed">
            {[
              { label: 'Critical', count: criticalCount, colorClass: 'text-accent', bgClass: 'bg-accent/10' },
              { label: 'Warning', count: warningCount, colorClass: 'text-warning', bgClass: 'bg-warning/10' },
              { label: 'Info', count: infoCount, colorClass: 'text-primary', bgClass: 'bg-primary/10' },
              { label: 'Total', count: recommendations.length, colorClass: 'text-foreground', bgClass: 'bg-muted/50' },
            ].map((bucket) => (
              <div
                key={bucket.label}
                className={`flex flex-col items-center rounded-2xl border border-border/40 p-4 text-center transition-all duration-[250ms] hover:border-primary/20 hover:shadow-sm ${bucket.bgClass}`}
                data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_b90b_${bucket.label}`}>
                <span
                  className={`text-2xl font-bold tracking-tight ${bucket.colorClass}`}
                  data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_e70f_${bucket.label}`}>{bucket.count}</span>
                <span
                  className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_892e_${bucket.label}`}>{bucket.label}</span>
              </div>
            ))}
          </div>
          {recommendations.length === 0 && (
            <div
              className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-muted/50 px-3 py-2"
              data-icod-id="src_pages_dashboard_dashboardoverview_tsx_3ec9">
              <Info
                className="h-3 w-3 text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardoverview_tsx_4777" />
              <p
                className="text-[10px] italic text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardoverview_tsx_4e7e">
                Run an audit to see issue counts.
              </p>
            </div>
          )}
        </DashboardCard>
      </div>
      {/* Recommendations + Competitors */}
      <div
        className="grid grid-cols-1 gap-7 lg:grid-cols-2"
        data-icod-id="src_pages_dashboard_dashboardoverview_tsx_a05e">
        <DashboardCard
          heading="Top Recommendations"
          data-icod-id="src_pages_dashboard_dashboardoverview_tsx_ad25">
          {recommendations.length > 0 ? (
            <div
              className="flex flex-col gap-3"
              data-icod-id="src_pages_dashboard_dashboardoverview_tsx_4de2">
              {recommendations.slice(0, 5).map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-border/40 p-3"
                  data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_6a0d_${i}`}>
                  <Badge
                    variant={rec.severity === 'critical' ? 'free' : rec.severity === 'warning' ? 'new' : 'default'}
                    className="shrink-0 text-[10px]"
                    data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_f85f_${i}`}>
                    {rec.severity}
                  </Badge>
                  <div
                    className="min-w-0"
                    data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_5f48_${i}`}>
                    <p
                      className="text-sm font-medium text-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_b4e9_${i}`}>{rec.title}</p>
                    <p
                      className="mt-0.5 text-xs text-muted-foreground line-clamp-2"
                      data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_9df1_${i}`}>{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-10 text-center"
              data-icod-id="src_pages_dashboard_dashboardoverview_tsx_9211">
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-full shadow-md"
                style={{ background: 'var(--gradient-primary)' }}
                data-icod-id="src_pages_dashboard_dashboardoverview_tsx_1fb2">
                <Lightbulb
                  className="h-8 w-8 text-primary-foreground"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_9e4e" />
              </div>
              <p
                className="font-heading text-sm font-semibold text-foreground"
                data-icod-id="src_pages_dashboard_dashboardoverview_tsx_e93b">No recommendations yet</p>
              <p
                className="mt-1 max-w-xs text-xs text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardoverview_tsx_f0de">
                Run a website audit to receive prioritized, actionable recommendations.
              </p>
            </div>
          )}
        </DashboardCard>

        <DashboardCard
          heading="Competitor Comparison"
          data-icod-id="src_pages_dashboard_dashboardoverview_tsx_8513">
          {currentProject && currentProject.competitors.length > 0 ? (
            <div
              className="flex flex-col gap-2"
              data-icod-id="src_pages_dashboard_dashboardoverview_tsx_7066">
              {currentProject.competitors.map((comp) => (
                <div
                  key={comp}
                  className="flex items-center gap-3 rounded-xl border border-border/40 p-3"
                  data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_47eb_${comp}`}>
                  <Users
                    className="h-4 w-4 text-muted-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_8ce8_${comp}`} />
                  <span
                    className="truncate text-sm text-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_699c_${comp}`}>{comp}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyStatePanel
              icon={AlertTriangle}
              title="No competitors added"
              description="Add competitor websites when creating a project to compare visibility scores."
              className="py-10"
              data-icod-id="src_pages_dashboard_dashboardoverview_tsx_ab72" />
          )}
        </DashboardCard>
      </div>
      {/* Google Search Console Integration */}
      <DashboardCard
        heading="Google Search Console"
        data-icod-id="src_pages_dashboard_dashboardoverview_tsx_0383">
        {gscStatus === 'loading' ? (
          <div
            className="flex justify-center py-8"
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_e6bb"><Spinner size="md" data-icod-id="src_pages_dashboard_dashboardoverview_tsx_872d" /></div>
        ) : gscData?.configured && gscData.summary ? (
          <div
            className="flex flex-col gap-4"
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_a0a1">
            <div
              className="grid grid-cols-2 gap-3 sm:grid-cols-4"
              data-icod-id="src_pages_dashboard_dashboardoverview_tsx_26d4">
              <div
                className="rounded-xl border border-border/40 p-3 text-center"
                data-icod-id="src_pages_dashboard_dashboardoverview_tsx_1464">
                <p
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_1721">Clicks</p>
                <p
                  className="text-xl font-bold text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_1ace">{gscData.summary.totalClicks.toLocaleString()}</p>
              </div>
              <div
                className="rounded-xl border border-border/40 p-3 text-center"
                data-icod-id="src_pages_dashboard_dashboardoverview_tsx_e438">
                <p
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_c59d">Impressions</p>
                <p
                  className="text-xl font-bold text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_006b">{gscData.summary.totalImpressions.toLocaleString()}</p>
              </div>
              <div
                className="rounded-xl border border-border/40 p-3 text-center"
                data-icod-id="src_pages_dashboard_dashboardoverview_tsx_5aaf">
                <p
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_04c7">Avg CTR</p>
                <p
                  className="text-xl font-bold text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_39a3">{gscData.summary.avgCtr}%</p>
              </div>
              <div
                className="rounded-xl border border-border/40 p-3 text-center"
                data-icod-id="src_pages_dashboard_dashboardoverview_tsx_9b45">
                <p
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_f1a3">Avg Position</p>
                <p
                  className="text-xl font-bold text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_a298">{gscData.summary.avgPosition}</p>
              </div>
            </div>

            {/* Top 5 Queries mini-widget */}
            {gscTopQueries.length > 0 && (
              <div
                className="mt-2"
                data-icod-id="src_pages_dashboard_dashboardoverview_tsx_d200">
                <h4
                  className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_f30e">Top 5 Queries</h4>
                <div
                  className="overflow-x-auto rounded-lg border border-border/50"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_5a70">
                  <table
                    className="w-full text-left text-xs"
                    data-icod-id="src_pages_dashboard_dashboardoverview_tsx_60a4">
                    <thead
                      className="bg-muted/50"
                      data-icod-id="src_pages_dashboard_dashboardoverview_tsx_3675">
                      <tr
                        className="border-b border-border text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
                        data-icod-id="src_pages_dashboard_dashboardoverview_tsx_ea66">
                        <th
                          className="px-3 py-2"
                          data-icod-id="src_pages_dashboard_dashboardoverview_tsx_e581">Query</th>
                        <th
                          className="px-3 py-2"
                          data-icod-id="src_pages_dashboard_dashboardoverview_tsx_55a0">Clicks</th>
                        <th
                          className="px-3 py-2"
                          data-icod-id="src_pages_dashboard_dashboardoverview_tsx_34e7">Impressions</th>
                        <th
                          className="px-3 py-2"
                          data-icod-id="src_pages_dashboard_dashboardoverview_tsx_7381">Position</th>
                      </tr>
                    </thead>
                    <tbody data-icod-id="src_pages_dashboard_dashboardoverview_tsx_8223">
                      {gscTopQueries.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-border/30 hover:bg-muted/30"
                          data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_786e_${i}`}>
                          <td
                            className="px-3 py-2 font-medium text-foreground truncate max-w-[200px]"
                            title={row.keys.query}
                            data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_3b8f_${i}`}>{row.keys.query}</td>
                          <td
                            className="px-3 py-2 text-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_f7cb_${i}`}>{row.clicks.toLocaleString()}</td>
                          <td
                            className="px-3 py-2 text-muted-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_5a51_${i}`}>{row.impressions.toLocaleString()}</td>
                          <td
                            className="px-3 py-2"
                            data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_cf3a_${i}`}>
                            <span
                              className={row.position <= 10 ? 'text-success' : row.position <= 20 ? 'text-warning' : 'text-muted-foreground'}
                              data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_d851_${i}`}>
                              {row.position}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Top 5 Pages mini-widget */}
            {gscTopPages.length > 0 && (
              <div
                className="mt-2"
                data-icod-id="src_pages_dashboard_dashboardoverview_tsx_3c31">
                <h4
                  className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_727f">Top 5 Pages</h4>
                <div
                  className="overflow-x-auto rounded-lg border border-border/50"
                  data-icod-id="src_pages_dashboard_dashboardoverview_tsx_671b">
                  <table
                    className="w-full text-left text-xs"
                    data-icod-id="src_pages_dashboard_dashboardoverview_tsx_0ed0">
                    <thead
                      className="bg-muted/50"
                      data-icod-id="src_pages_dashboard_dashboardoverview_tsx_0143">
                      <tr
                        className="border-b border-border text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
                        data-icod-id="src_pages_dashboard_dashboardoverview_tsx_cc7c">
                        <th
                          className="px-3 py-2"
                          data-icod-id="src_pages_dashboard_dashboardoverview_tsx_c450">Page</th>
                        <th
                          className="px-3 py-2"
                          data-icod-id="src_pages_dashboard_dashboardoverview_tsx_f62a">Clicks</th>
                        <th
                          className="px-3 py-2"
                          data-icod-id="src_pages_dashboard_dashboardoverview_tsx_6fd7">Impressions</th>
                      </tr>
                    </thead>
                    <tbody data-icod-id="src_pages_dashboard_dashboardoverview_tsx_fec6">
                      {gscTopPages.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-border/30 hover:bg-muted/30"
                          data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_036a_${i}`}>
                          <td
                            className="px-3 py-2 font-medium text-foreground truncate max-w-[250px]"
                            title={row.keys.page}
                            data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_96c2_${i}`}>{row.keys.page}</td>
                          <td
                            className="px-3 py-2 text-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_b285_${i}`}>{row.clicks.toLocaleString()}</td>
                          <td
                            className="px-3 py-2 text-muted-foreground"
                            data-icod-id={`src_pages_dashboard_dashboardoverview_tsx_e100_${i}`}>{row.impressions.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <p
              className="text-[10px] text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardoverview_tsx_c734">Last 30 days from Google Search Console</p>
          </div>
        ) : (
          <div
            className="flex flex-col items-center gap-3 py-6 text-center"
            data-icod-id="src_pages_dashboard_dashboardoverview_tsx_261d">
            <BarChart3
              className="h-8 w-8 text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardoverview_tsx_173a" />
            <p
              className="text-sm text-muted-foreground"
              data-icod-id="src_pages_dashboard_dashboardoverview_tsx_e21d">
              Connect Google Search Console to see real search performance data — clicks, impressions, CTR, and rankings.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.hash = ''}
              data-icod-id="src_pages_dashboard_dashboardoverview_tsx_02c3">
              <ExternalLink
                className="h-3 w-3"
                data-icod-id="src_pages_dashboard_dashboardoverview_tsx_16ad" />
              Go to Search Performance
            </Button>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
