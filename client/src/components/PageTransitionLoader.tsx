import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface PageTransitionLoaderProps {
  /** When true, the overlay is visible. Set to false to trigger fade-out. */
  visible: boolean;
  /** Human-readable page name displayed during loading (e.g., "Home Page"). */
  pageName?: string;
}

/**
 * Full-screen branded loading overlay shown during route transitions.
 * Uses the site's dark purple/indigo gradient theme with a shimmer animation
 * on the brand name and a circular progress spinner.
 *
 * Brief display time for smooth page transitions without blocking UX.
 */
export default function PageTransitionLoader({ visible, pageName }: PageTransitionLoaderProps) {
  const [show, setShow] = useState(visible);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pageNameVisible, setPageNameVisible] = useState(false);

  // Transition time in milliseconds (reduced for better UX)
  const TRANSITION_TIME = 400;

  useEffect(() => {
    if (visible) {
      setShow(true);
      setAnimatingOut(false);
      setProgress(0);
      setPageNameVisible(false);

      // Trigger page name fade-in after a short delay
      const nameTimer = setTimeout(() => {
        setPageNameVisible(true);
      }, 200);

      return () => clearTimeout(nameTimer);
    } else {
      // visible changed to false — start fade-out immediately.
      // The parent (RouteTransitionManager) controls timing, so we don't need to wait here.
      setAnimatingOut(true);
    }
  }, [visible]);

  // Progress bar animation - fills over TRANSITION_TIME
  useEffect(() => {
    if (visible && show && !animatingOut) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / TRANSITION_TIME) * 100, 100);
        setProgress(newProgress);

        if (newProgress >= 100) {
          clearInterval(interval);
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [visible, show, animatingOut]);

  // After fade-out animation completes, hide entirely
  useEffect(() => {
    if (animatingOut) {
      const fadeTimer = setTimeout(() => {
        setShow(false);
        setAnimatingOut(false);
        setProgress(0);
        setPageNameVisible(false);
      }, 500); // matches CSS transition duration

      return () => clearTimeout(fadeTimer);
    }
  }, [animatingOut]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center transition-opacity duration-[500ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        animatingOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, rgb(var(--background)) 0%, rgba(var(--primary), 0.2) 40%, rgba(var(--primary), 0.4) 70%, rgb(var(--background)) 100%)',
      }}
      role="status"
      aria-label={`Loading ${pageName || 'page'}`}
      data-icod-id="src_components_pagetransitionloader_tsx_overlay">
      {/* Ambient glow orbs */}
      <div
        className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full opacity-20 blur-[100px] animate-pulse"
        style={{ background: 'radial-gradient(circle, rgb(var(--primary)) 0%, transparent 70%)' }}
        data-icod-id="src_components_pagetransitionloader_tsx_glow1" />
      <div
        className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full opacity-15 blur-[80px] animate-pulse"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)', animationDelay: '1s' }}
        data-icod-id="src_components_pagetransitionloader_tsx_glow2" />
      {/* Brand Logo + Name */}
      <div
        className="relative flex flex-col items-center gap-4"
        data-icod-id="src_components_pagetransitionloader_tsx_brand">
        {/* Logo icon with pulse glow */}
        <div
          className="relative flex h-16 w-16 items-center justify-center rounded-2xl text-primary-foreground shadow-[0_0_40px_rgba(109,0,217,0.5)] animate-pulse-glow-loader"
          style={{ background: 'var(--gradient-primary)' }}
          data-icod-id="src_components_pagetransitionloader_tsx_logo">
          <Zap className="h-8 w-8" data-icod-id="src_components_pagetransitionloader_tsx_icon" />
        </div>

        {/* Brand name with shimmer */}
        <h2
          className="text-2xl font-bold font-heading tracking-tight text-transparent bg-clip-text animate-shimmer-text"
          style={{
            backgroundImage: 'linear-gradient(90deg, rgb(var(--foreground)) 0%, rgba(var(--accent), 0.7) 40%, rgb(var(--accent)) 60%, rgb(var(--foreground)) 100%)',
            backgroundSize: '200% 100%',
          }}
          data-icod-id="src_components_pagetransitionloader_tsx_name">
          MG Blessed Beginnings
        </h2>

        {/* Page name with fade-in animation */}
        {pageName && (
          <p
            className={`mt-2 text-lg font-medium text-primary-foreground/90 transition-all duration-700 ease-out ${
              pageNameVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            data-icod-id="src_components_pagetransitionloader_tsx_page_name">
            Preparing your {pageName} experience...
          </p>
        )}

        {/* Circular progress spinner */}
        <div
          className="mt-4 relative"
          data-icod-id="src_components_pagetransitionloader_tsx_spinner_wrap">
          <div
            className="h-10 w-10 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin"
            data-icod-id="src_components_pagetransitionloader_tsx_spinner" />
        </div>

        {/* Determinate progress bar - fills over 3 seconds */}
        <div
          className="mt-6 h-1.5 w-64 rounded-full overflow-hidden bg-primary/10"
          data-icod-id="src_components_pagetransitionloader_tsx_progress_track">
          <div
            className="h-full rounded-full transition-all duration-100 ease-linear"
            style={{
              width: `${progress}%`,
              background: 'var(--gradient-primary)',
            }}
            data-icod-id="src_components_pagetransitionloader_tsx_progress_bar" />
        </div>

        {/* Percentage indicator */}
        <span
          className={`mt-2 text-sm font-medium text-primary-foreground/70 tabular-nums transition-opacity duration-300 ${
            pageNameVisible ? 'opacity-100' : 'opacity-0'
          }`}
          data-icod-id="src_components_pagetransitionloader_tsx_percentage">
          {Math.round(progress)}%
        </span>
      </div>
      {/* Inline styles for custom keyframe animations */}
      <style data-icod-id="src_components_pagetransitionloader_tsx_13b9">{`
        @keyframes shimmer-text {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer-text {
          animation: shimmer-text 2.5s ease-in-out infinite;
        }
        @keyframes pulse-glow-loader {
          0%, 100% { box-shadow: 0 0 20px rgba(109, 0, 217, 0.4); }
          50% { box-shadow: 0 0 40px rgba(109, 0, 217, 0.6), 0 0 60px rgba(229, 45, 255, 0.3); }
        }
        .animate-pulse-glow-loader {
          animation: pulse-glow-loader 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
