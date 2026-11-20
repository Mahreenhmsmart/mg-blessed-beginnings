import { Card, Button, Badge } from '@/components/ui';
import { cn } from '@/utils/cn';
import { Download, FileText, FileCheck, ClipboardList, Image as ImageIcon, Table } from 'lucide-react';

export type ResourceType = 'PDF' | 'Template' | 'Checklist' | 'Guide' | 'Worksheet';

interface ResourceCardProps {
  title: string;
  description: string;
  resourceType: ResourceType;
  onDownload?: () => void;
  className?: string;
}

// Category color map — single source of truth for resource type accent colors.
const CATEGORY_COLORS: Record<ResourceType, string> = {
  PDF: 'bg-destructive',
  Template: 'bg-info',
  Checklist: 'bg-success',
  Guide: 'bg-primary',
  Worksheet: 'bg-warning',
};

const typeConfig: Record<ResourceType, { icon: typeof FileText; color: string }> = {
  PDF: { icon: FileText, color: CATEGORY_COLORS.PDF },
  Template: { icon: FileCheck, color: CATEGORY_COLORS.Template },
  Checklist: { icon: ClipboardList, color: CATEGORY_COLORS.Checklist },
  Guide: { icon: ImageIcon, color: CATEGORY_COLORS.Guide },
  Worksheet: { icon: Table, color: CATEGORY_COLORS.Worksheet },
};

/**
 * Card component for displaying downloadable resources.
 * Shows thumbnail, title, description, file-type badge, and download button.
 */
export default function ResourceCard({
  title,
  description,
  resourceType,
  onDownload,
  className,
}: ResourceCardProps) {
  const config = typeConfig[resourceType];
  const Icon = config.icon;

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Generate a simple text file as placeholder
      const content = `${title}\n\n${description}\n\nThis is a placeholder resource. Full content coming soon!`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Card
      className={cn('flex flex-col h-full overflow-hidden', className)}
      data-icod-id="src_components_resourcecard_tsx_card">
      {/* Accent strip at top */}
      <div
        className={cn('h-1.5 w-full', config.color)}
        data-icod-id="src_components_resourcecard_tsx_accent" />

      <div className="p-6 flex flex-col flex-1 gap-1" data-icod-id="src_components_resourcecard_tsx_content">
        {/* Icon and Badge Row */}
        <div
          className="flex items-start justify-between mb-3"
          data-icod-id="src_components_resourcecard_tsx_header">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center text-primary-foreground shadow-sm',
              config.color,
            )}
            data-icod-id="src_components_resourcecard_tsx_icon_wrapper">
            <Icon className="h-6 w-6" data-icod-id="src_components_resourcecard_tsx_icon" />
          </div>
          <Badge variant="default" data-icod-id="src_components_resourcecard_tsx_badge">
            {resourceType}
          </Badge>
        </div>

        {/* Title */}
        <h3
          className="text-lg font-semibold text-foreground mb-1 font-heading leading-snug"
          data-icod-id="src_components_resourcecard_tsx_title">{title}</h3>

        {/* Description */}
        <p
          className="text-sm text-muted-foreground mb-5 flex-1 leading-relaxed"
          data-icod-id="src_components_resourcecard_tsx_description">{description}</p>

        {/* Download Button */}
        <Button
          variant="outline"
          size="md"
          className="w-full"
          onClick={handleDownload}
          data-icod-id="src_components_resourcecard_tsx_download_btn">
          <Download className="h-4 w-4 mr-2" data-icod-id="src_components_resourcecard_tsx_download_icon" />
          Download Free
        </Button>
      </div>
    </Card>
  );
}
