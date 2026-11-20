import { cn } from '@/utils/cn';

export interface SectionDividerProps {
  className?: string;
}

/**
 * Thin gradient line divider for separating sections on pages.
 * Uses a subtle purple-tinted fade line.
 */
export default function SectionDivider({ className }: SectionDividerProps) {
  return (
    <div
      className={cn('luxury-divider', className)}
      role="separator"
      aria-hidden="true"
      data-icod-id="src_components_sectiondivider_tsx_6a9f" />
  );
}
