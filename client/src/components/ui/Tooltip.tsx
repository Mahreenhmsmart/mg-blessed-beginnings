import { useState, useRef, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom';
  className?: string;
}

/**
 * Hover-triggered tooltip wrapper component.
 * Positioned above (default) or below the trigger element.
 */
export default function Tooltip({
  content,
  children,
  position = 'top',
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(true);
  };

  const hideTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-foreground border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-foreground border-x-transparent border-t-transparent',
  };

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      data-icod-id="src_components_ui_tooltip_tsx_c03f">
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-2 py-1 text-xs font-medium text-white bg-foreground rounded whitespace-nowrap',
            'animate-fade-up',
            positionClasses[position],
          )}
          data-icod-id="src_components_ui_tooltip_tsx_78a7">
          {content}
          <div
            className={cn(
              'absolute w-0 h-0 border-4',
              arrowClasses[position],
            )}
            data-icod-id="src_components_ui_tooltip_tsx_8543" />
        </div>
      )}
    </div>
  );
}
