import { useEffect, useState, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/cn';
import { Card, Badge } from '@/components/ui';

interface ScoreCardProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title' | 'color'> {
  title: string;
  score: number | null;
  maxScore: number;
  /** CSS color value for the indicator (e.g., 'var(--color-purple)') */
  color: string;
  label?: string;
}

/**
 * Premium dashboard score metric card with animated circular progress indicator.
 * Features gradient stroke, glow effect, and count-up animation.
 */
export default function ScoreCard({
  title,
  score,
  maxScore,
  color,
  label,
  className,
  ...rest
}: ScoreCardProps) {
  const hasData = score !== null;
  const percentage = hasData ? Math.min((score / maxScore) * 100, 100) : 0;
  
  // Animated score counter
  const [displayScore, setDisplayScore] = useState<number>(0);
  
  useEffect(() => {
    if (!hasData || score === null) {
      setDisplayScore(0);
      return;
    }
    
    const duration = 1000;
    const steps = 30;
    const increment = score / steps;
    let current = 0;
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), score);
      setDisplayScore(current);
      
      if (step >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [score, hasData]);

  // SVG circle parameters
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = hasData
    ? circumference - (percentage / 100) * circumference
    : circumference;

  // Color tier based on score
  const getColorTier = () => {
    if (!hasData || score === null) return 'text-muted-foreground';
    if (score <= 40) return 'text-[rgb(var(--destructive))]';
    if (score <= 70) return 'text-warning';
    return 'text-success';
  };

  return (
    <Card
      className={cn(
        'group flex flex-col items-center justify-center gap-4 p-7 text-center transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
        className,
      )}
      data-icod-id="src_components_dashboard_scorecard_tsx_6578"
      {...rest}>
      {/* Circular progress indicator — refined */}
      <div
        className="relative flex h-24 w-24 items-center justify-center"
        data-icod-id="src_components_dashboard_scorecard_tsx_a83b">
        
        {/* Subtle glow behind circle on hover */}
        {hasData && (
          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-[500ms] blur-xl"
            style={{ background: color, filter: 'blur(15px)' }}
            data-icod-id="src_components_dashboard_scorecard_tsx_5288" />
        )}
        
        <svg
          className="h-full w-full -rotate-90"
          viewBox="0 0 64 64"
          aria-hidden="true"
          data-icod-id="src_components_dashboard_scorecard_tsx_056f">
          {/* Background track */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="rgb(var(--border))"
            strokeWidth="4"
            data-icod-id="src_components_dashboard_scorecard_tsx_1317" />
          {/* Progress arc */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ 
              opacity: hasData ? 1 : 0.15,
            }}
            data-icod-id="src_components_dashboard_scorecard_tsx_9497" />
        </svg>
        
        {/* Score number */}
        <span
          className={cn(
            'absolute font-heading text-3xl font-extrabold tracking-tight animate-count-up',
            hasData ? getColorTier() : 'text-muted-foreground',
          )}
          data-icod-id="src_components_dashboard_scorecard_tsx_3d64">
          {hasData ? displayScore : '—'}
        </span>
      </div>
      {/* Title */}
      <h3
        className="font-heading text-sm font-bold text-foreground leading-tight tracking-tight"
        data-icod-id="src_components_dashboard_scorecard_tsx_5470">
        {title}
      </h3>
      {/* Label / status */}
      {hasData ? (
        <p
          className="text-xs text-muted-foreground"
          data-icod-id="src_components_dashboard_scorecard_tsx_d4b7">
          out of {maxScore}
        </p>
      ) : (
        <div
          className="flex flex-col items-center gap-1.5"
          data-icod-id="src_components_dashboard_scorecard_tsx_94e1">
          <span
            className="text-xs text-muted-foreground"
            data-icod-id="src_components_dashboard_scorecard_tsx_49ba">No data yet</span>
          <Badge
            variant="default"
            className="text-[10px] font-medium"
            data-icod-id="src_components_dashboard_scorecard_tsx_2b7b">
            Preview
          </Badge>
        </div>
      )}
      {label && (
        <p
          className="mt-1 text-[10px] italic text-muted-foreground"
          data-icod-id="src_components_dashboard_scorecard_tsx_98f4">
          {label}
        </p>
      )}
    </Card>
  );
}
