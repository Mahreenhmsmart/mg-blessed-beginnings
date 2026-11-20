import { Button } from '@/components/ui';
import { ArrowRight, Sparkles, CheckCircle2, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export default function Hero({
  title = 'Build Your Online Business With Practical AI, Digital Marketing & eCommerce Guidance',
  subtitle = "Hi, I'm Mahreen Yousaf — your AI & digital marketing mentor. I help entrepreneurs like you learn, build, and grow online businesses on Shopify, eBay, and Etsy using practical strategies and AI tools.",
  ctaText = 'Explore Free AI Tools',
  ctaLink = '/ai-tools',
  secondaryCtaText = 'Book a Consultation',
  secondaryCtaLink = '/book-consultation',
}: HeroProps) {
  return (
    <section
      className="relative overflow-hidden py-28 md:py-40"
      style={{ background: 'var(--gradient-hero)' }}
      data-icod-id="src_components_hero_tsx_ea0d">
      {/* Very subtle floating orbs at edges */}
      <div
        className="pointer-events-none absolute -top-48 -right-48 h-[600px] w-[600px] rounded-full opacity-[0.15] blur-3xl animate-float-slow"
        style={{ background: 'radial-gradient(circle, rgb(var(--primary)) 0%, transparent 70%)' }}
        aria-hidden="true"
        data-icod-id="src_components_hero_tsx_1bfe" />
      <div
        className="pointer-events-none absolute -bottom-56 -left-56 h-[500px] w-[500px] rounded-full opacity-[0.12] blur-3xl animate-float-slow"
        style={{ 
          background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)',
          animationDelay: '2s'
        }}
        aria-hidden="true"
        data-icod-id="src_components_hero_tsx_50b3" />
      {/* Subtle purple wash overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgb(var(--primary) / 0.08) 0%, rgb(var(--background) / 0) 60%)' }}
        aria-hidden="true"
        data-icod-id="src_components_hero_tsx_b624" />
      <div
        className="container relative z-10 mx-auto px-4 max-w-[1200px]"
        data-icod-id="src_components_hero_tsx_33b1">
        <div
          className="max-w-4xl mx-auto text-center luxury-stagger"
          data-icod-id="src_components_hero_tsx_5239">
          
          {/* Badge — refined pill */}
          <div
            className="inline-flex items-center gap-2.5 rounded-full bg-primary/15 px-6 py-2.5 text-base font-bold text-primary-hover mb-10 animate-fade-up-stagger border border-primary/30 tracking-wide"
            data-icod-id="src_components_hero_tsx_d57a">
            <Sparkles className="h-5 w-5" data-icod-id="src_components_hero_tsx_a419" />
            <span data-icod-id="src_components_hero_tsx_6965">Learn. Build. Launch. Grow.</span>
          </div>

          {/* Title — large editorial heading */}
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground mb-8 leading-[1.05] tracking-tight font-heading animate-fade-up-stagger"
            style={{ animationDelay: '80ms', textShadow: '0 4px 24px rgba(157, 106, 255, 0.3)' }}
            data-icod-id="src_components_hero_tsx_b16f">
            {title}
          </h1>

          {/* Subtitle — generous line height */}
          <p
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-body font-medium animate-fade-up-stagger"
            style={{ animationDelay: '160ms' }}
            data-icod-id="src_components_hero_tsx_4ab9">
            {subtitle}
          </p>

          {/* CTAs — solid primary + outline secondary + WhatsApp */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-up-stagger"
            style={{ animationDelay: '240ms' }}
            data-icod-id="src_components_hero_tsx_f8b9">
            <Link to={ctaLink} data-icod-id="src_components_hero_tsx_4f92">
              <Button 
                variant="primary" 
                size="lg" 
                className="shadow-[0_8px_24px_rgba(157,106,255,0.5)] hover:shadow-[0_12px_36px_rgba(157,106,255,0.7),0_0_40px_rgba(0,212,245,0.3)]"
                data-icod-id="src_components_hero_tsx_b706">
                {ctaText}
                <ArrowRight className="h-5 w-5 ml-2" data-icod-id="src_components_hero_tsx_377a" />
              </Button>
            </Link>
            <Link to={secondaryCtaLink} data-icod-id="src_components_hero_tsx_ac0e">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-primary/50 text-foreground hover:bg-primary/15 hover:border-primary/70 font-bold"
                data-icod-id="src_components_hero_tsx_e5ee">
                {secondaryCtaText}
              </Button>
            </Link>
            <a
              href="https://wa.me/923358380233"
              target="_blank"
              rel="noopener noreferrer"
              data-icod-id="src_components_hero_tsx_whatsapp_cta">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-[#25D366]/50 text-[#25D366] hover:bg-[#25D366]/15 hover:border-[#25D366]/70 font-bold"
                data-icod-id="src_components_hero_tsx_whatsapp_btn">
                <MessageCircle className="h-5 w-5 mr-2" data-icod-id="src_components_hero_tsx_wa_icon" />
                Chat on WhatsApp
              </Button>
            </a>
          </div>

          {/* Trust indicators — clean muted text */}
          <div
            className="mt-16 flex flex-wrap items-center justify-center gap-12 text-base text-muted-foreground font-semibold animate-fade-up-stagger"
            style={{ animationDelay: '320ms' }}
            data-icod-id="src_components_hero_tsx_e11f">
            <span
              className="flex items-center gap-2.5"
              data-icod-id="src_components_hero_tsx_41b6">
              <CheckCircle2 className="h-5 w-5 text-primary" data-icod-id="src_components_hero_tsx_8a31" />
              Practical, Hands-On Guidance
            </span>
            <span
              className="flex items-center gap-2.5"
              data-icod-id="src_components_hero_tsx_c95d">
              <CheckCircle2 className="h-5 w-5 text-primary" data-icod-id="src_components_hero_tsx_f903" />
              Free AI Tools for Sellers
            </span>
            <span
              className="flex items-center gap-2.5"
              data-icod-id="src_components_hero_tsx_ec87">
              <CheckCircle2 className="h-5 w-5 text-primary" data-icod-id="src_components_hero_tsx_fd65" />
              Serving Clients Worldwide
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
