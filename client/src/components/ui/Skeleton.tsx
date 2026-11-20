import { cn } from '@/utils/cn';

export type SkeletonVariant = 'text' | 'card' | 'circle' | 'rect';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
  width?: string | number;
  height?: string | number;
}

/**
 * Shimmer placeholder blocks for loading states.
 * Use in place of Spinner for more contextual loading indicators.
 */
export default function Skeleton({
  variant = 'text',
  className,
  width,
  height,
}: SkeletonProps) {
  const baseClasses = 'bg-muted/50 rounded animate-shimmer relative overflow-hidden';

  const variantClasses: Record<SkeletonVariant, string> = {
    text: 'h-4 w-full',
    card: 'h-48 w-full rounded-[20px]',
    circle: 'h-12 w-12 rounded-full',
    rect: 'h-32 w-full rounded-lg',
  };

  const style = {
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
      data-icod-id="src_components_ui_skeleton_tsx_dfed">
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer"
        data-icod-id="src_components_ui_skeleton_tsx_1d74" />
    </div>
  );
}
