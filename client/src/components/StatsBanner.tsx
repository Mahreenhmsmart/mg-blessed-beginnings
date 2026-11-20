import { Calendar, RefreshCw, LayoutGrid, Eye, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui';
import { cn } from '@/utils/cn';

interface StatsBannerProps {
  price: string;
  currencyCode: string;
  className?: string;
}

const STATS = [
  {
    icon: Calendar,
    label: 'DURATION',
    value: '30 Days',
    description: 'Active placement period',
  },
  {
    icon: RefreshCw,
    label: 'ROTATION',
    value: 'Every 8s',
    description: 'Rotates with other ads',
  },
  {
    icon: LayoutGrid,
    label: 'FORMAT',
    value: 'Banner + Sidebar',
    description: 'Dual placement types',
  },
  {
    icon: Eye,
    label: 'VISIBILITY',
    value: 'All Visitors',
    description: 'Across all site pages',
  },
];

export default function StatsBanner({ price, currencyCode, className }: StatsBannerProps) {
  return (
    <Card className={cn('p-5', className)} data-icod-id="stats_banner_root">
      <div className="flex items-center gap-2 mb-4" data-icod-id="stats_banner_header">
        <DollarSign className="h-5 w-5 text-primary" data-icod-id="stats_banner_icon" />
        <h3 className="font-semibold text-foreground font-heading" data-icod-id="stats_banner_title">
          Campaign Details
        </h3>
        <span
          className="ml-auto rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary border border-primary/20"
          data-icod-id="stats_banner_price">
          {price} {currencyCode}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-icod-id="stats_banner_grid">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-start gap-1.5 rounded-xl bg-surface-elevated p-3"
            data-icod-id={`stats_banner_stat_${stat.label.toLowerCase().replace(/\s+/g, '_')}`}
          >
            <div className="flex items-center gap-1.5" data-icod-id={`stats_banner_stat_header_${stat.label.toLowerCase().replace(/\s+/g, '_')}`}>
              <stat.icon className="h-3.5 w-3.5 text-primary" data-icod-id={`stats_banner_stat_icon_${stat.label.toLowerCase().replace(/\s+/g, '_')}`} />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground" data-icod-id={`stats_banner_stat_label_${stat.label.toLowerCase().replace(/\s+/g, '_')}`}>
                {stat.label}
              </span>
            </div>
            <p className="text-sm font-bold text-foreground" data-icod-id={`stats_banner_stat_value_${stat.label.toLowerCase().replace(/\s+/g, '_')}`}>
              {stat.value}
            </p>
            <p className="text-[10px] text-muted-foreground" data-icod-id={`stats_banner_stat_desc_${stat.label.toLowerCase().replace(/\s+/g, '_')}`}>
              {stat.description}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
