import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import { ArrowRight, CalendarCheck, Sparkles, Zap } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

interface FinalCTAProps {
  className?: string;
}

export default function FinalCTA({ className }: FinalCTAProps) {
  const { ref, isInView } = useInView({ threshold: 0.15, triggerOnce: true });

  return (
    <section
      className={cn('py-24 md:py-32 relative overflow-hidden', className)}
      data-icod-id="src_components_homepage_finalcta_tsx_11f7">
      {/* Premium gradient background — vibrant multi-stop */}
      <div
        className="absolute inset-0"
        style={{ 
          background: 'var(--gradient-cta)'
        }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_finalcta_tsx_0b3e" />
      {/* Animated orbs with enhanced glow */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-[0.3] blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--primary)) 0%, transparent 70%)' }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_finalcta_tsx_a3f5" />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full opacity-[0.25] blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)' }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_finalcta_tsx_7dd3" />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full opacity-[0.18] blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--color-pink)) 0%, transparent 70%)' }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_finalcta_tsx_b5cf" />
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        data-icod-id="src_components_homepage_finalcta_tsx_52a5">
        
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2.5 rounded-full bg-primary-foreground/15 backdrop-blur-lg px-6 py-2.5 mb-10 border border-primary-foreground/30 shadow-[0_6px_24px_rgba(0,0,0,0.25)]"
          data-icod-id="src_components_homepage_finalcta_tsx_0476">
          <Sparkles
            className="h-5 w-5 text-primary-foreground"
            data-icod-id="src_components_homepage_finalcta_tsx_7b8f" />
          <span
            className="text-base font-bold text-primary-foreground tracking-wide"
            data-icod-id="src_components_homepage_finalcta_tsx_8665">Ready to Start?</span>
        </div>
        
        <h2
          className="text-5xl md:text-6xl lg:text-7xl font-black text-primary-foreground mb-8 font-heading tracking-tight leading-tight"
          style={{ textShadow: '0 4px 32px rgba(0, 0, 0, 0.3)' }}
          data-icod-id="src_components_homepage_finalcta_tsx_38ca">
          Create Better Content With{' '}
          <span
            className="relative inline-block text-primary-foreground/95"
            data-icod-id="src_components_homepage_finalcta_tsx_c237">
            Free AI Tools
            <span
              className="absolute -bottom-3 left-0 right-0 h-2 bg-primary-foreground/50 rounded-full"
              aria-hidden="true"
              data-icod-id="src_components_homepage_finalcta_tsx_613e" />
          </span>
        </h2>
        
        <p
          className="text-2xl md:text-3xl text-primary-foreground/95 mb-14 leading-relaxed max-w-3xl mx-auto font-semibold"
          data-icod-id="src_components_homepage_finalcta_tsx_bd19">
          Generate SEO titles, product descriptions, hashtags, and social media content in seconds — all free, no sign-up required.
        </p>
        
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
          data-icod-id="src_components_homepage_finalcta_tsx_2be8">
          <Link to="/ai-tools" data-icod-id="src_components_homepage_finalcta_tsx_3934">
            <Button
              variant="secondary"
              size="lg"
              className="shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)] min-w-[240px] text-xl px-10 py-5 h-auto bg-primary-foreground text-primary hover:bg-primary-foreground/95 font-extrabold"
              data-icod-id="src_components_homepage_finalcta_tsx_c6ba">
              <Zap
                className="h-6 w-6 mr-2"
                data-icod-id="src_components_homepage_finalcta_tsx_5b02" />
              Try Free AI Tools
              <ArrowRight
                className="h-6 w-6 ml-2"
                data-icod-id="src_components_homepage_finalcta_tsx_950a" />
            </Button>
          </Link>
          <Link
            to="/book-consultation"
            data-icod-id="src_components_homepage_finalcta_tsx_293c">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/20 hover:border-primary-foreground/70 min-w-[260px] text-xl px-10 py-5 h-auto backdrop-blur-md font-extrabold"
              data-icod-id="src_components_homepage_finalcta_tsx_8f35">
              <CalendarCheck
                className="h-6 w-6 mr-2"
                data-icod-id="src_components_homepage_finalcta_tsx_f5ad" />
              Book a Consultation
            </Button>
          </Link>
        </div>
        
        {/* Trust indicators */}
        <div
          className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-base text-primary-foreground/90 font-bold"
          data-icod-id="src_components_homepage_finalcta_tsx_bd48">
          <span
            className="flex items-center gap-2.5"
            data-icod-id="src_components_homepage_finalcta_tsx_1088">
            <div
              className="h-3 w-3 rounded-full bg-success shadow-[0_0_12px_rgba(52,214,107,0.6)]"
              data-icod-id="src_components_homepage_finalcta_tsx_d32e" />
            Free AI Tools
          </span>
          <span
            className="flex items-center gap-2.5"
            data-icod-id="src_components_homepage_finalcta_tsx_fada">
            <div
              className="h-3 w-3 rounded-full bg-primary-foreground shadow-[0_0_12px_rgba(255,255,255,0.6)]"
              data-icod-id="src_components_homepage_finalcta_tsx_e967" />
            SEO & Content Generator
          </span>
          <span
            className="flex items-center gap-2.5"
            data-icod-id="src_components_homepage_finalcta_tsx_cd06">
            <div
              className="h-3 w-3 rounded-full bg-accent shadow-[0_0_12px_rgba(0,212,245,0.6)]"
              data-icod-id="src_components_homepage_finalcta_tsx_0094" />
            No Sign-Up Required
          </span>
        </div>
      </div>
    </section>
  );
}
