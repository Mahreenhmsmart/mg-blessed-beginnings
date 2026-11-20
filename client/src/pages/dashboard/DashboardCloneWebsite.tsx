import { useState, useEffect } from 'react';
import { Trash2, ExternalLink, Download, Globe as GlobeIcon } from 'lucide-react';
import { Button, Card, Spinner, EmptyState, Badge } from '@/components/ui';
import { adminApiService } from '@/services/adminService';
import { getPreviewUrl, getDownloadUrl } from '@/services/clonerService';
import type { CloneAdmin } from '@/types';

export default function DashboardCloneWebsite() {
  const [clones, setClones] = useState<CloneAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    adminApiService
      .getClones()
      .then((data) => setClones(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this clone record? This action cannot be undone.')) return;
    setDeletingId(id);
    try {
      await adminApiService.deleteClone(id);
      setClones((prev) => prev.filter((c) => c._id !== id));
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div
        className="flex justify-center py-12"
        data-icod-id="src_pages_dashboard_dashboardclonewebsite_tsx_6ce7">
        <Spinner
          size="lg"
          data-icod-id="src_pages_dashboard_dashboardclonewebsite_tsx_e72e" />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4"
      data-icod-id="src_pages_dashboard_dashboardclonewebsite_tsx_6b55">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_dashboardclonewebsite_tsx_5658">
        <h3
          className="font-heading text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardclonewebsite_tsx_4cd0">
          Saved Clones ({clones.length})
        </h3>
      </div>
      {clones.length === 0 ? (
        <EmptyState
          icon={GlobeIcon}
          title="No clones yet"
          description="No website clones have been saved yet. Use the Website Cloner tool to create one."
          data-icod-id="src_pages_dashboard_dashboardclonewebsite_tsx_593e" />
      ) : (
        <Card
          className="overflow-hidden"
          data-icod-id="src_pages_dashboard_dashboardclonewebsite_tsx_d552">
          <div
            className="overflow-x-auto"
            data-icod-id="src_pages_dashboard_dashboardclonewebsite_tsx_ac7e">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_dashboardclonewebsite_tsx_ef1c">
              <thead data-icod-id="src_pages_dashboard_dashboardclonewebsite_tsx_d95b">
                <tr
                  className="border-b border-border bg-muted/30"
                  data-icod-id="src_pages_dashboard_dashboardclonewebsite_tsx_cff9">
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardclonewebsite_tsx_dd84">Source URL</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardclonewebsite_tsx_f291">Status</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardclonewebsite_tsx_e500">Size</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardclonewebsite_tsx_27a1">Created</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground text-right"
                    data-icod-id="src_pages_dashboard_dashboardclonewebsite_tsx_bc4d">Actions</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_pages_dashboard_dashboardclonewebsite_tsx_05d7">
                {clones.map((clone) => (
                  <tr
                    key={clone._id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-icod-id={`src_pages_dashboard_dashboardclonewebsite_tsx_0b28_${clone._id}`}>
                    <td
                      className="px-4 py-3 font-medium text-foreground truncate max-w-[300px]"
                      data-icod-id={`src_pages_dashboard_dashboardclonewebsite_tsx_758b_${clone._id}`}>
                      <a
                        href={clone.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary hover:underline"
                        data-icod-id={`src_pages_dashboard_dashboardclonewebsite_tsx_b351_${clone._id}`}>
                        {clone.source}
                      </a>
                    </td>
                    <td
                      className="px-4 py-3"
                      data-icod-id={`src_pages_dashboard_dashboardclonewebsite_tsx_1df0_${clone._id}`}>
                      <Badge
                        variant="ai"
                        data-icod-id={`src_pages_dashboard_dashboardclonewebsite_tsx_9ce2_${clone._id}`}>Saved</Badge>
                    </td>
                    <td
                      className="px-4 py-3 text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardclonewebsite_tsx_4948_${clone._id}`}>
                      {clone.bytes ? `${(clone.bytes / 1024).toFixed(1)} KB` : '-'}
                    </td>
                    <td
                      className="px-4 py-3 text-muted-foreground text-xs"
                      data-icod-id={`src_pages_dashboard_dashboardclonewebsite_tsx_c6fd_${clone._id}`}>
                      {new Date(clone.createdAt).toLocaleDateString()}
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      data-icod-id={`src_pages_dashboard_dashboardclonewebsite_tsx_9476_${clone._id}`}>
                      <div
                        className="flex items-center justify-end gap-1"
                        data-icod-id={`src_pages_dashboard_dashboardclonewebsite_tsx_cc24_${clone._id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Preview"
                          onClick={() => window.open(getPreviewUrl(clone.id), '_blank')}
                          data-icod-id={`src_pages_dashboard_dashboardclonewebsite_tsx_5d1d_${clone._id}`}>
                          <ExternalLink
                            className="h-4 w-4"
                            data-icod-id={`src_pages_dashboard_dashboardclonewebsite_tsx_8324_${clone._id}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Download"
                          onClick={() => window.open(getDownloadUrl(clone.id), '_blank')}
                          data-icod-id={`src_pages_dashboard_dashboardclonewebsite_tsx_b17a_${clone._id}`}>
                          <Download
                            className="h-4 w-4"
                            data-icod-id={`src_pages_dashboard_dashboardclonewebsite_tsx_aea0_${clone._id}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete"
                          onClick={() => handleDelete(clone._id)}
                          loading={deletingId === clone._id}
                          className="text-destructive hover:text-destructive"
                          data-icod-id={`src_pages_dashboard_dashboardclonewebsite_tsx_9017_${clone._id}`}>
                          <Trash2
                            className="h-4 w-4"
                            data-icod-id={`src_pages_dashboard_dashboardclonewebsite_tsx_aaf1_${clone._id}`} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
