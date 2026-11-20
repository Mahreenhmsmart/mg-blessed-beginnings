import { useEffect, useState } from 'react';
import { BarChart3, Download, FileText, FileSpreadsheet, FileDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAuditsByProject } from '@/store/slices/auditsSlice';
import { downloadPDFReport, downloadCSVReport } from '@/services/projectService';
import { addToast } from '@/store/slices/uiSlice';
import { Button, Spinner } from '@/components/ui';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EmptyStatePanel from '@/components/dashboard/EmptyStatePanel';
import type { Audit } from '@/types';

function exportToCSV(audit: Audit) {
  const rows = [
    ['Layer', 'Score', 'Max Score', 'Checks Passed', 'Checks Warned', 'Checks Failed'],
  ];

  for (const [layer, results] of Object.entries(audit.results || {})) {
    if (!results) continue;
    const passed = results.checks.filter((c: { status: string }) => c.status === 'pass').length;
    const warned = results.checks.filter((c: { status: string }) => c.status === 'warn').length;
    const failed = results.checks.filter((c: { status: string }) => c.status === 'fail').length;
    rows.push([layer.toUpperCase(), String(results.score), String(results.maxScore), String(passed), String(warned), String(failed)]);
  }

  // Add recommendations
  rows.push([]);
  rows.push(['Recommendations']);
  rows.push(['Severity', 'Title', 'Layer', 'Effort', 'Category']);
  for (const rec of audit.recommendations) {
    rows.push([rec.severity, rec.title, rec.layer.toUpperCase(), rec.effort, rec.category]);
  }

  const csvContent = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mg-visibility-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function printReport(audit: Audit) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const scoresHtml = Object.entries(audit.scores)
    .map(([k, v]) => `<tr><td>${k.toUpperCase()}</td><td>${v}/100</td></tr>`)
    .join('');

  const recsHtml = audit.recommendations
    .map((r) => `<tr><td>${r.severity}</td><td>${r.title}</td><td>${r.layer.toUpperCase()}</td><td>${r.effort}</td></tr>`)
    .join('');

  printWindow.document.write(`
    <html><head><title>MG Visibility Report</title>
    <style>body{font-family:sans-serif;padding:40px;background:rgb(var(--background));color:rgb(var(--foreground))}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid rgb(var(--border));padding:8px;text-align:left;color:rgb(var(--muted-foreground))}th{background:rgb(var(--card));color:rgb(var(--foreground))}h1,h2{color:rgb(var(--primary))}</style>
    </head><body>
    <h1>MG Visibility Intelligence Report</h1>
    <p>Date: ${new Date(audit.createdAt).toLocaleDateString()}</p>
    <h2>Scores</h2>
    <table><tr><th>Layer</th><th>Score</th></tr>${scoresHtml}</table>
    <h2>Recommendations (${audit.recommendations.length})</h2>
    <table><tr><th>Severity</th><th>Title</th><th>Layer</th><th>Effort</th></tr>${recsHtml}</table>
    </body></html>
  `);
  printWindow.document.close();
  printWindow.print();
}

export default function DashboardReports() {
  const dispatch = useAppDispatch();
  const { currentProjectId } = useAppSelector((s) => s.projects);
  const { audits, fetchStatus } = useAppSelector((s) => s.audits);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [csvDownloading, setCsvDownloading] = useState(false);

  useEffect(() => {
    if (currentProjectId) {
      dispatch(fetchAuditsByProject(currentProjectId));
    }
  }, [currentProjectId, dispatch]);

  const handleDownloadPDF = async () => {
    if (!currentProjectId) return;
    
    setPdfDownloading(true);
    try {
      const blob = await downloadPDFReport(currentProjectId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mg-visibility-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      dispatch(addToast({ message: 'PDF report downloaded', variant: 'success' }));
    } catch {
      dispatch(addToast({ message: 'Failed to download PDF report', variant: 'error' }));
    } finally {
      setPdfDownloading(false);
    }
  };

  const handleDownloadCSV = async () => {
    if (!currentProjectId) return;
    
    setCsvDownloading(true);
    try {
      const blob = await downloadCSVReport(currentProjectId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mg-visibility-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      dispatch(addToast({ message: 'CSV report downloaded', variant: 'success' }));
    } catch {
      dispatch(addToast({ message: 'Failed to download CSV report', variant: 'error' }));
    } finally {
      setCsvDownloading(false);
    }
  };

  const completedAudits = audits.filter((a) => a.status === 'completed');

  return (
    <div
      className="flex flex-col gap-8"
      data-icod-id="src_pages_dashboard_dashboardreports_tsx_9875">
      <div data-icod-id="src_pages_dashboard_dashboardreports_tsx_f079">
        <h1
          className="font-heading text-2xl font-bold text-foreground sm:text-3xl tracking-tight"
          data-icod-id="src_pages_dashboard_dashboardreports_tsx_436a">
          Reports & Export
        </h1>
        <p
          className="mt-2 text-sm text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardreports_tsx_0090">
          Generate and export visibility reports in PDF or CSV format.
        </p>
      </div>
      {fetchStatus === 'loading' ? (
        <div
          className="flex justify-center py-16"
          data-icod-id="src_pages_dashboard_dashboardreports_tsx_e98b"><Spinner size="lg" data-icod-id="src_pages_dashboard_dashboardreports_tsx_2904" /></div>
      ) : completedAudits.length > 0 ? (
        <>
          {/* Latest report actions */}
          <DashboardCard
            heading="Export Latest Report"
            data-icod-id="src_pages_dashboard_dashboardreports_tsx_b446">
            <div
              className="flex flex-col gap-4 sm:flex-row sm:items-center"
              data-icod-id="src_pages_dashboard_dashboardreports_tsx_6d53">
              <div
                className="flex-1"
                data-icod-id="src_pages_dashboard_dashboardreports_tsx_a1c6">
                <p
                  className="text-sm font-medium text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardreports_tsx_2be3">
                  Report from {new Date(completedAudits[0].createdAt).toLocaleDateString()}
                </p>
                <p
                  className="text-xs text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardreports_tsx_30e2">
                  Scores: SEO {completedAudits[0].scores.seo} | AEO {completedAudits[0].scores.aeo} | GEO {completedAudits[0].scores.geo} | AIO {completedAudits[0].scores.aio} | SXO {completedAudits[0].scores.sxo}
                </p>
              </div>
              <div
                className="flex gap-2"
                data-icod-id="src_pages_dashboard_dashboardreports_tsx_931f">
                <Button
                  variant="primary"
                  onClick={handleDownloadPDF}
                  loading={pdfDownloading}
                  data-icod-id="src_pages_dashboard_dashboardreports_tsx_pdf_btn">
                  <FileDown
                    className="mr-2 h-4 w-4"
                    data-icod-id="src_pages_dashboard_dashboardreports_tsx_pdf_icon" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => printReport(completedAudits[0])}
                  data-icod-id="src_pages_dashboard_dashboardreports_tsx_05d8">
                  <FileText
                    className="mr-2 h-4 w-4"
                    data-icod-id="src_pages_dashboard_dashboardreports_tsx_e16d" />
                  Print / PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadCSV}
                  loading={csvDownloading}
                  data-icod-id="src_pages_dashboard_dashboardreports_tsx_8c04">
                  <FileSpreadsheet
                    className="mr-2 h-4 w-4"
                    data-icod-id="src_pages_dashboard_dashboardreports_tsx_33b2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </DashboardCard>

          {/* Audit history for export */}
          <DashboardCard
            heading="Available Reports"
            data-icod-id="src_pages_dashboard_dashboardreports_tsx_3c92">
            <div
              className="overflow-x-auto rounded-lg border border-border/50"
              data-icod-id="src_pages_dashboard_dashboardreports_tsx_02d4">
              <table
                className="w-full text-left text-sm"
                data-icod-id="src_pages_dashboard_dashboardreports_tsx_9560">
                <thead
                  className="bg-muted/50"
                  data-icod-id="src_pages_dashboard_dashboardreports_tsx_6859">
                  <tr
                    className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    data-icod-id="src_pages_dashboard_dashboardreports_tsx_a6a5">
                    <th
                      className="px-4 py-3 pr-4"
                      data-icod-id="src_pages_dashboard_dashboardreports_tsx_a718">Date</th>
                    <th
                      className="px-4 py-3 pr-4"
                      data-icod-id="src_pages_dashboard_dashboardreports_tsx_20fb">Avg Score</th>
                    <th
                      className="px-4 py-3 pr-4"
                      data-icod-id="src_pages_dashboard_dashboardreports_tsx_05c8">Issues</th>
                    <th
                      className="px-4 py-3"
                      data-icod-id="src_pages_dashboard_dashboardreports_tsx_cf0a">Actions</th>
                  </tr>
                </thead>
                <tbody data-icod-id="src_pages_dashboard_dashboardreports_tsx_a628">
                  {completedAudits.map((audit: Audit) => {
                    const avg = Math.round(Object.values(audit.scores).reduce((a, b) => a + b, 0) / 5);
                    return (
                      <tr
                        key={audit._id}
                        className="border-b border-border/30 hover:bg-muted/30"
                        data-icod-id={`src_pages_dashboard_dashboardreports_tsx_a02a_${audit._id}`}>
                        <td
                          className="px-4 py-3 text-muted-foreground"
                          data-icod-id={`src_pages_dashboard_dashboardreports_tsx_a223_${audit._id}`}>
                          {new Date(audit.createdAt).toLocaleDateString()}
                        </td>
                        <td
                          className="px-4 py-3 font-medium"
                          data-icod-id={`src_pages_dashboard_dashboardreports_tsx_4550_${audit._id}`}>{avg}/100</td>
                        <td
                          className="px-4 py-3"
                          data-icod-id={`src_pages_dashboard_dashboardreports_tsx_1635_${audit._id}`}>{audit.recommendations.length}</td>
                        <td
                          className="px-4 py-3"
                          data-icod-id={`src_pages_dashboard_dashboardreports_tsx_cd5d_${audit._id}`}>
                          <div
                            className="flex gap-1"
                            data-icod-id={`src_pages_dashboard_dashboardreports_tsx_b1b9_${audit._id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => printReport(audit)}
                              data-icod-id={`src_pages_dashboard_dashboardreports_tsx_2ffd_${audit._id}`}>
                              <FileText
                                className="h-3 w-3"
                                data-icod-id={`src_pages_dashboard_dashboardreports_tsx_bc72_${audit._id}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => exportToCSV(audit)}
                              data-icod-id={`src_pages_dashboard_dashboardreports_tsx_75fd_${audit._id}`}>
                              <Download
                                className="h-3 w-3"
                                data-icod-id={`src_pages_dashboard_dashboardreports_tsx_759a_${audit._id}`} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </>
      ) : (
        <DashboardCard
          heading="Reports"
          data-icod-id="src_pages_dashboard_dashboardreports_tsx_32ff">
          <EmptyStatePanel
            icon={BarChart3}
            title="No reports available"
            description="Run an audit first to generate exportable reports."
            className="py-12"
            data-icod-id="src_pages_dashboard_dashboardreports_tsx_fda5" />
        </DashboardCard>
      )}
    </div>
  );
}
