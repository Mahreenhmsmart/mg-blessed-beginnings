import type { ReactNode, ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/cn';
import { Card } from '@/components/ui';

interface DashboardCardProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  heading: string;
  children: ReactNode;
  /** Optional action element (button, link) rendered to the right of the heading */
  action?: ReactNode;
  /** Optional icon to display before the heading */
  icon?: ReactNode;
  /** Show gradient top border on hover */
  premium?: boolean;
}

/**
 * Premium wrapper around Card with consistent heading, optional action slot,
 * gradient accent, and standard padding for dashboard panels.
 */
export default function DashboardCard({
  heading,
  children,
  action,
  icon,
  premium = true,
  className,
  ...rest
}: DashboardCardProps) {
  return (
    <Card
      className={cn(
        'flex flex-col gap-5 p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-lg)]',
        premium && 'card-premium',
        className
      )}
      data-icod-id="src_components_dashboard_dashboardcard_tsx_65f1"
      {...rest}>
      <div
        className="flex items-center justify-between border-b border-border/40 pb-4"
        data-icod-id="src_components_dashboard_dashboardcard_tsx_5629">
        <div
          className="flex items-center gap-2.5"
          data-icod-id="src_components_dashboard_dashboardcard_tsx_2a06">
          {icon && (
            <span
              className="text-primary"
              data-icod-id="src_components_dashboard_dashboardcard_tsx_8cf2">{icon}</span>
          )}
          <h2
            className="font-heading text-base font-semibold text-foreground sm:text-lg leading-tight"
            data-icod-id="src_components_dashboard_dashboardcard_tsx_c241">
            {heading}
          </h2>
        </div>
        {action && <div
          className="shrink-0 ml-3"
          data-icod-id="src_components_dashboard_dashboardcard_tsx_8381">{action}</div>}
      </div>
      <div
        className="flex-1"
        data-icod-id="src_components_dashboard_dashboardcard_tsx_6018">{children}</div>
    </Card>
  );
}
