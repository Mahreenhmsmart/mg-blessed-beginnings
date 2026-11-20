import { useEffect, useRef, useState, type RefObject } from 'react';

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

interface UseInViewResult<T extends HTMLElement> {
  ref: RefObject<T>;
  isInView: boolean;
}

/**
 * Custom hook that uses IntersectionObserver to detect when an element
 * enters the viewport. Useful for triggering fade-up animations on scroll.
 *
 * @example
 * ```tsx
 * const { ref, isInView } = useInView<HTMLDivElement>();
 * return (
 *   <div ref={ref} className={isInView ? 'animate-fade-up' : 'opacity-0'}>
 *     Content
 *   </div>
 * );
 * ```
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
}: UseInViewOptions = {}): UseInViewResult<T> {
  const ref = useRef<T>(null);
  // Start with isInView = true to ensure content is visible immediately.
  // The IntersectionObserver will still work for scroll-triggered animations,
  // but content won't be hidden if the observer doesn't fire quickly.
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsInView(true);
      return;
    }

    // Safety fallback: if IntersectionObserver is not available, show content immediately
    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    try {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (triggerOnce) {
              observer.unobserve(element);
            }
          } else if (!triggerOnce) {
            setIsInView(false);
          }
        },
        { threshold, rootMargin },
      );

      observer.observe(element);

      // Safety timeout: if observer hasn't fired within 2 seconds, show content anyway
      // This prevents blank screens when elements are outside the initial viewport
      // or when the observer fails to trigger for any reason
      const safetyTimeout = setTimeout(() => {
        setIsInView(true);
      }, 2000);

      return () => {
        clearTimeout(safetyTimeout);
        observer.unobserve(element);
      };
    } catch {
      // If observer creation fails for any reason, show content immediately
      setIsInView(true);
    }
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isInView };
}

export default useInView;
