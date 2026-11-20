import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        'fixed bottom-44 right-4 z-[80] flex items-center justify-center',
        'w-12 h-12 rounded-full bg-primary text-primary-foreground',
        'shadow-[0_4px_16px_rgba(109,0,217,0.3)] hover:shadow-[0_6px_24px_rgba(109,0,217,0.4)]',
        'hover:bg-primary-hover transition-all duration-300 animate-fade-in-up'
      )}
      aria-label="Back to top"
      data-icod-id="src_components_backtotop_tsx_root">
      <ArrowUp className="h-5 w-5" data-icod-id="src_components_backtotop_tsx_icon" />
    </button>
  );
}
