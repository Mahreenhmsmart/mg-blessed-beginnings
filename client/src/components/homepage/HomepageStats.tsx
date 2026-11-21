import { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/cn';
import { Zap, Users, Layers } from 'lucide-react';

interface StatCardData {
  label: string;
  target: number;
  suffix: string;
  color: string;
  icon: React.ElementType;
}

const STAT_CARDS: StatCardData[] = [
  {
    label: 'Free AI Tools',
    target: 14,
    suffix: '',
    color: '#9D6AFF',
    icon: Zap,
  },
  {
    label: 'Happy Sellers',
    target: 500,
    suffix: '+',
    color: '#FF6EB4',
    icon: Users,
  },
  {
    label: 'AI Content Tools',
    target: 4,
    suffix: '-in-1',
    color: '#00D4F5',
    icon: Layers,
  },
];

/** Cubic ease-out: 1 - (1 - p)^3 */
function easeOutCubic(p: number): number {
  return 1 - Math.pow(1 - p, 3);
}

interface AnimatedStatProps {
  card: StatCardData;
  hasStarted: boolean;
}

function AnimatedStat({ card, hasStarted }: AnimatedStatProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!hasStarted) return;

    const duration = 1600;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const currentValue = Math.round(easedProgress * card.target);

      setDisplayValue(currentValue);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [hasStarted, card.target]);

  const Icon = card.icon;

  return (
    <div
      className="mg-stat-card"
      data-icod-id="src_components_homepage_homepagestats_tsx_621c">
      <div
        className="mg-stat-icon"
        style={{ color: card.color, backgroundColor: `${card.color}20` }}
        data-icod-id="src_components_homepage_homepagestats_tsx_470c">
        <Icon
          className="h-7 w-7"
          data-icod-id="src_components_homepage_homepagestats_tsx_30f8" />
      </div>
      <div
        className="mg-stat-number"
        style={{ color: card.color }}
        data-icod-id="src_components_homepage_homepagestats_tsx_39a1">
        {displayValue}{card.suffix}
      </div>
      <div
        className="mg-stat-label"
        data-icod-id="src_components_homepage_homepagestats_tsx_4d73">{card.label}</div>
    </div>
  );
}

interface HomepageStatsProps {
  className?: string;
}

export default function HomepageStats({ className }: HomepageStatsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setHasAnimated(true);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn('mg-stats', className)}
      data-icod-id="src_components_homepage_homepagestats_tsx_698a">
      <div
        className="mg-stats-grid"
        data-icod-id="src_components_homepage_homepagestats_tsx_12c9">
        {STAT_CARDS.map((card) => (
          <AnimatedStat
            key={card.label}
            card={card}
            hasStarted={hasAnimated}
            data-icod-id={`src_components_homepage_homepagestats_tsx_6eab_${card.label}`} />
        ))}
      </div>
    </section>
  );
}
