import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/cn';

export type BadgeVariant = 'free' | 'new' | 'ai' | 'default' | 'category';

export interface BadgeProps extends ComponentPropsWithoutRef<'span'> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  free: 'text-white shadow-[0_2px_8px_rgba(0,212,245,0.4)]',
  new: 'text-white shadow-[0_2px_8px_rgba(157,106,255,0.4)]',
  ai: 'text-white shadow-[0_2px_8px_rgba(157,106,255,0.4)]',
  category: 'text-accent-foreground shadow-[0_2px_8px_rgba(0,212,245,0.3)]',
  default: 'bg-muted text-muted-foreground border border-border/50',
};

/**
 * Small pill-shaped badge for labels and tags.
 * Use variant="free" for free items, "new" for new items, "ai" for AI-related,
 * "category" for category tags, or "default" for generic labels.
 */
export default function Badge({ variant = 'default', className, children, style, ...rest }: BadgeProps) {
  const getGradientStyle = (): React.CSSProperties => {
    const baseStyle = style || {};
    if (variant === 'free') {
      return { background: 'var(--gradient-accent)', ...baseStyle };
    }
    if (variant === 'new') {
      return { background: 'var(--gradient-secondary)', ...baseStyle };
    }
    if (variant === 'ai') {
      return { background: 'var(--gradient-primary)', ...baseStyle };
    }
    if (variant === 'category') {
      return { background: 'rgb(var(--accent))', ...baseStyle };
    }
    return baseStyle;
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-bold tracking-wider uppercase whitespace-nowrap shrink-0',
        variantStyles[variant],
        className,
      )}
      style={getGradientStyle()}
      data-icod-id="src_components_ui_badge_tsx_5f6e"
      {...rest}>
      {children}
    </span>
  );
}
