import { Home, Wrench, BookOpen, Globe, Layout, Monitor } from 'lucide-react';
import { Card } from '@/components/ui';
import { cn } from '@/utils/cn';

interface PlacementLocation {
  name: string;
  icon: typeof Home;
  formats: ('banner' | 'sidebar')[];
}

const PLACEMENTS: PlacementLocation[] = [
  { name: 'Home Page', icon: Home, formats: ['banner', 'sidebar'] },
  { name: 'AI Tools', icon: Wrench, formats: ['banner', 'sidebar'] },
  { name: 'Services', icon: Globe, formats: ['banner', 'sidebar'] },
  { name: 'Blog', icon: BookOpen, formats: ['banner', 'sidebar'] },
  { name: 'All Other Pages', icon: Layout, formats: ['banner', 'sidebar'] },
];

interface PlacementMapProps {
  className?: string;
}

export default function PlacementMap({ className }: PlacementMapProps) {
  return (
    <Card className={cn('p-6', className)} data-icod-id="placement_map_root">
      <div className="flex items-center gap-2 mb-5" data-icod-id="placement_map_header">
        <Monitor className="h-5 w-5 text-primary" data-icod-id="placement_map_icon" />
        <h3 className="font-semibold text-foreground font-heading" data-icod-id="placement_map_title">
          Where Your Ad Appears
        </h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4" data-icod-id="placement_map_desc">
        Your ad is displayed site-wide on every page that uses the Layout component.
        Below are the key locations where visitors will see your ad.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" data-icod-id="placement_map_grid">
        {PLACEMENTS.map((placement) => (
          <div
            key={placement.name}
            className="flex items-start gap-3 rounded-lg border border-border/60 bg-background p-3 transition-colors hover:border-primary/20 hover:bg-muted/30"
            data-icod-id={`placement_map_card_${placement.name.replace(/\s+/g, '_').toLowerCase()}`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10" data-icod-id={`placement_map_card_icon_bg_${placement.name.replace(/\s+/g, '_').toLowerCase()}`}>
              <placement.icon className="h-4 w-4 text-primary" data-icod-id={`placement_map_card_icon_${placement.name.replace(/\s+/g, '_').toLowerCase()}`} />
            </div>
            <div className="min-w-0" data-icod-id={`placement_map_card_text_${placement.name.replace(/\s+/g, '_').toLowerCase()}`}>
              <p className="text-sm font-medium text-foreground truncate" data-icod-id={`placement_map_card_name_${placement.name.replace(/\s+/g, '_').toLowerCase()}`}>
                {placement.name}
              </p>
              <div className="flex flex-wrap gap-1 mt-1" data-icod-id={`placement_map_card_formats_${placement.name.replace(/\s+/g, '_').toLowerCase()}`}>
                {placement.formats.map((format) => (
                  <span
                    key={format}
                    className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary capitalize"
                    data-icod-id={`placement_map_format_badge_${placement.name.replace(/\s+/g, '_').toLowerCase()}_${format}`}
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-success/5 border border-success/20 px-4 py-3" data-icod-id="placement_map_footer">
        <Layout className="h-4 w-4 text-success shrink-0" data-icod-id="placement_map_footer_icon" />
        <p className="text-xs text-muted-foreground" data-icod-id="placement_map_footer_text">
          Ads appear automatically in the site layout — no extra setup needed. Every page renders both banner and sidebar placements.
        </p>
      </div>
    </Card>
  );
}
