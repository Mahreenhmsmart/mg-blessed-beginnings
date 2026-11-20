import type { ComponentType } from 'react';
import { Construction } from 'lucide-react';
import { Badge } from '@/components/ui';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EmptyStatePanel from '@/components/dashboard/EmptyStatePanel';

interface DashboardPlaceholderProps {
  title: string;
  icon?: ComponentType<{ className?: string }>;
}

/**
 * Generic placeholder page for dashboard sections not yet implemented.
 */
export default function DashboardPlaceholder({
  title,
  icon,
}: DashboardPlaceholderProps) {
  return (
    <div
      className="flex flex-col gap-6"
      data-icod-id="src_pages_dashboard_dashboardplaceholder_tsx_438b">
      <div data-icod-id="src_pages_dashboard_dashboardplaceholder_tsx_0c12">
        <div
          className="flex items-center gap-3"
          data-icod-id="src_pages_dashboard_dashboardplaceholder_tsx_9fbd">
          <h1
            className="font-heading text-2xl font-bold text-foreground sm:text-3xl"
            data-icod-id="src_pages_dashboard_dashboardplaceholder_tsx_b1e5">
            {title}
          </h1>
          <Badge
            variant="default"
            className="text-[10px]"
            data-icod-id="src_pages_dashboard_dashboardplaceholder_tsx_b728">Coming Soon</Badge>
        </div>
        <p
          className="mt-2 text-sm text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardplaceholder_tsx_2ff2">
          This feature is currently under development. Check back later for updates.
        </p>
      </div>
      <DashboardCard
        heading={title}
        className="min-h-[400px]"
        data-icod-id="src_pages_dashboard_dashboardplaceholder_tsx_d430">
        <EmptyStatePanel
          icon={icon ?? Construction}
          title={`${title} — Coming Soon`}
          description={`The ${title.toLowerCase()} feature is being built. You'll be able to access it in a future update.`}
          note="Preview UI — this section will be fully functional soon."
          data-icod-id="src_pages_dashboard_dashboardplaceholder_tsx_91a9" />
      </DashboardCard>
    </div>
  );
}
