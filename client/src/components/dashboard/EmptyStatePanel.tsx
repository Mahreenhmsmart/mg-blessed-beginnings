import type { ComponentType, ReactNode, ComponentPropsWithoutRef } from 'react';
import { Inbox, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui';

interface EmptyStatePanelProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
  /** Subtle note text below the main content */
  note?: string;
  /** Action button text and handler (alternative to action prop) */
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Premium centered empty-state message with icon for dashboard sections.
 * Features gradient accent, clear CTA, and actionable guidance.
 */
export default function EmptyStatePanel({
  icon: Icon = Inbox,
  title,
  description,
  action,
  note,
  actionLabel,
  onAction,
  className,
  ...rest
}: EmptyStatePanelProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 text-center animate-fade-in-up',
        className,
      )}
      data-icod-id="src_components_dashboard_emptystatepanel_tsx_6395"
      {...rest}>
      {/* Icon container with gradient background */}
      <div
        className="mb-6 relative"
        data-icod-id="src_components_dashboard_emptystatepanel_tsx_be5e">
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full opacity-30 blur-xl"
          style={{ background: 'var(--gradient-primary)' }}
          data-icod-id="src_components_dashboard_emptystatepanel_tsx_7262" />
        <div
          className="relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-[var(--shadow-md)]"
          style={{ background: 'var(--gradient-primary)' }}
          data-icod-id="src_components_dashboard_emptystatepanel_tsx_0093">
          <Icon
            className="h-8 w-8 text-white"
            data-icod-id="src_components_dashboard_emptystatepanel_tsx_a6cb" />
        </div>
      </div>
      {/* Title */}
      <p
        className="font-heading text-lg font-semibold text-foreground mb-2"
        data-icod-id="src_components_dashboard_emptystatepanel_tsx_ecf3">
        {title}
      </p>
      {/* Description */}
      {description && (
        <p
          className="max-w-sm text-sm leading-relaxed text-muted-foreground mb-6"
          data-icod-id="src_components_dashboard_emptystatepanel_tsx_cadc">
          {description}
        </p>
      )}
      {/* Action button or custom action */}
      {(action || actionLabel) && (
        <div
          className="mt-2"
          data-icod-id="src_components_dashboard_emptystatepanel_tsx_6fb7">
          {action || (
            <Button
              variant="primary"
              size="md"
              onClick={onAction}
              className="shadow-[var(--shadow-glow-sm)] hover:shadow-[var(--shadow-glow)]"
              data-icod-id="src_components_dashboard_emptystatepanel_tsx_e8ca">
              {actionLabel}
              <ArrowRight
                className="h-4 w-4 ml-2"
                data-icod-id="src_components_dashboard_emptystatepanel_tsx_9156" />
            </Button>
          )}
        </div>
      )}
      {/* Note */}
      {note && (
        <p
          className="mt-6 text-xs italic text-muted-foreground/60 max-w-xs"
          data-icod-id="src_components_dashboard_emptystatepanel_tsx_11e5">
          {note}
        </p>
      )}
    </div>
  );
}
