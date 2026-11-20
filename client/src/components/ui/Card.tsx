import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends ComponentPropsWithoutRef<'div'> {
  /** Enable glassmorphism effect */
  glass?: boolean;
  /** Enable gradient border on hover */
  gradientBorder?: boolean;
  /** Enable hover lift effect */
  hoverLift?: boolean;
}

/**
 * Premium bordered surface: content card, dashboard tile, form panel, list row.
 * Pass padding and layout through className — <Card className="p-4 flex gap-3">.
 * Supports glass morphism, gradient borders, and hover effects with enhanced visuals.
 */
export default function Card({ 
  className, 
  glass = false,
  gradientBorder = false,
  hoverLift = true,
  ...rest 
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card text-card-foreground',
        'shadow-[0_2px_8px_rgba(0,0,0,0.4),0_8px_24px_rgba(0,0,0,0.3)]',
        'transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
        hoverLift && 'hover:-translate-y-1.5 hover:shadow-[0_8px_16px_rgba(0,0,0,0.5),0_24px_48px_rgba(124,58,237,0.2)] hover:border-primary/50 hover:bg-card-hover',
        glass && 'bg-surface/90 backdrop-blur-xl border-border/70 shadow-[0_4px_16px_rgba(0,0,0,0.3)]',
        gradientBorder && 'gradient-border-hover',
        className,
      )}
      data-icod-id="src_components_ui_card_tsx_6f5d"
      {...rest} />
  );
}
