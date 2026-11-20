import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Slide {
  src: string;
  alt: string;
}

interface HeroSliderProps {
  slides: Slide[];
  intervalMs?: number;
  className?: string;
}

export default function HeroSlider({
  slides,
  intervalMs = 3000,
  className,
}: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(((index % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  // Auto-rotate
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goNext, intervalMs);
    return () => clearInterval(timer);
  }, [isPaused, goNext, intervalMs]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (diff > threshold) {
      goNext();
    } else if (diff < -threshold) {
      goPrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      className={cn('relative w-full overflow-hidden', className)}
      style={{ aspectRatio: '1920 / 1080' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Hero image slider"
      data-icod-id="src_components_heroslider_tsx_3af5">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          className={cn(
            'absolute inset-0 transition-opacity duration-500 ease-in-out',
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0',
          )}
          aria-hidden={index !== currentIndex}
          data-icod-id={`src_components_heroslider_tsx_f329_${slide.src}`}>
          <img
            src={slide.src}
            alt={slide.alt}
            className="h-full w-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            data-icod-id={`src_components_heroslider_tsx_6d9f_${slide.src}`} />
        </div>
      ))}
      {/* Previous arrow */}
      <button
        type="button"
        onClick={goPrev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/60 text-foreground backdrop-blur-sm transition-all hover:bg-background/80 hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring md:left-5 md:h-12 md:w-12"
        data-icod-id="src_components_heroslider_tsx_c3fb">
        <ChevronLeft
          className="h-5 w-5 md:h-6 md:w-6"
          data-icod-id="src_components_heroslider_tsx_bbd7" />
      </button>
      {/* Next arrow */}
      <button
        type="button"
        onClick={goNext}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/60 text-foreground backdrop-blur-sm transition-all hover:bg-background/80 hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring md:right-5 md:h-12 md:w-12"
        data-icod-id="src_components_heroslider_tsx_4bb4">
        <ChevronRight
          className="h-5 w-5 md:h-6 md:w-6"
          data-icod-id="src_components_heroslider_tsx_482d" />
      </button>
      {/* Dot indicators */}
      <div
        className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2.5"
        data-icod-id="src_components_heroslider_tsx_0bb4">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex ? 'true' : undefined}
            className={cn(
              'h-2.5 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring',
              index === currentIndex
                ? 'w-8 bg-primary'
                : 'w-2.5 bg-foreground/40 hover:bg-foreground/70',
            )}
            data-icod-id={`src_components_heroslider_tsx_cb26_${index}`} />
        ))}
      </div>
    </div>
  );
}
