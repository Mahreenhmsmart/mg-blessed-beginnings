import { Card } from '@/components/ui';
import { cn } from '@/utils/cn';
import { Sparkles, ShoppingBag, Megaphone, GraduationCap, CheckCircle2 } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

interface WhyMGProps {
  className?: string;
}

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Content Creator',
    description: 'Generate SEO titles, product descriptions, and marketing copy in seconds — no writing skills needed.',
    color: 'rgb(var(--primary))',
    gradient: 'from-primary to-primary-hover',
    lightBg: 'rgb(var(--surface))',
  },
  {
    icon: ShoppingBag,
    title: 'eCommerce Tools',
    description: 'Optimize Shopify, eBay & Etsy listings with AI-generated product descriptions that convert.',
    color: 'rgb(var(--primary-hover))',
    gradient: 'from-primary-hover to-accent',
    lightBg: 'rgb(var(--surface-elevated))',
  },
  {
    icon: Megaphone,
    title: 'Social Media Tools',
    description: 'Grow your audience with AI-generated hashtags, captions, and social media content strategies.',
    color: 'rgb(var(--accent))',
    gradient: 'from-accent to-accent-hover',
    lightBg: 'rgb(var(--surface-elevated))',
  },
  {
    icon: GraduationCap,
    title: 'Free Online Business Tools',
    description: 'Access a full suite of AI marketing and SEO tools at zero cost — built for entrepreneurs.',
    color: 'rgb(var(--warning))',
    gradient: 'from-warning to-warning-hover',
    lightBg: 'rgb(var(--surface-elevated))',
  },
];

export default function WhyMG({ className }: WhyMGProps) {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section
      className={cn('py-20 md:py-28 bg-background relative overflow-hidden', className)}
      data-icod-id="src_components_homepage_whymg_tsx_3d20">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{ 
          backgroundImage: 'radial-gradient(rgb(var(--primary)) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_whymg_tsx_c6c5" />
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        data-icod-id="src_components_homepage_whymg_tsx_cf91">
        {/* Section header */}
        <div
          className="text-center mb-20"
          data-icod-id="src_components_homepage_whymg_tsx_d17f">
          <span
            className="inline-block text-sm font-bold uppercase tracking-widest text-accent mb-4"
            data-icod-id="src_components_homepage_whymg_tsx_f715">
            Why Choose MG
          </span>
          <h2
            className="text-4xl md:text-6xl font-black text-foreground mb-6 font-heading tracking-tight"
            style={{ textShadow: '0 4px 24px rgba(157, 106, 255, 0.25)' }}
            data-icod-id="src_components_homepage_whymg_tsx_6a6c">
            Free AI Tools for{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--accent)) 100%)' }}
              data-icod-id="src_components_homepage_whymg_tsx_5dcf">
              Online Business
            </span>
          </h2>
          <p
            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium"
            data-icod-id="src_components_homepage_whymg_tsx_7883">
            MG Blessed Beginnings gives you free AI tools for content creation, SEO optimization, social media growth, and eCommerce — everything you need to grow your online business.
          </p>
        </div>

        {/* Feature cards */}
        <div
          ref={ref}
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          data-icod-id="src_components_homepage_whymg_tsx_737c">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                hoverLift={false}
                className="p-7 flex flex-col items-start gap-5 group relative overflow-hidden border-border/80"
                style={{ animationDelay: `${index * 100}ms` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = `0 20px 40px ${feature.color}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
                data-icod-id={`src_components_homepage_whymg_tsx_0a99_${feature.title}`}>
                {/* Gradient accent on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `linear-gradient(135deg, ${feature.color}08 0%, transparent 60%)` }}
                  data-icod-id={`src_components_homepage_whymg_tsx_0ff0_${feature.title}`} />
                {/* Icon with enhanced styling */}
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg relative overflow-hidden"
                  style={{ backgroundColor: feature.lightBg }}
                  data-icod-id={`src_components_homepage_whymg_tsx_0976_${feature.title}`}>
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    data-icod-id={`src_components_homepage_whymg_tsx_b105_${feature.title}`} />
                  <Icon
                    className="h-8 w-8 relative z-10 transition-colors duration-500"
                    style={{ color: feature.color }}
                    data-icod-id={`src_components_homepage_whymg_tsx_f816_${feature.title}`} />
                </div>
                {/* Content */}
                <div className="relative z-10" data-icod-id={`src_components_homepage_whymg_tsx_876c_${feature.title}`}>
                  <h3
                    className="text-2xl font-bold text-foreground font-heading mb-4 group-hover:text-primary transition-colors duration-300"
                    data-icod-id={`src_components_homepage_whymg_tsx_64de_${feature.title}`}>{feature.title}</h3>
                  <p
                    className="text-lg text-muted-foreground leading-relaxed mb-5 font-medium"
                    data-icod-id={`src_components_homepage_whymg_tsx_1d14_${feature.title}`}>{feature.description}</p>
                  
                  {/* Checkmark indicator */}
                  <div
                    className="flex items-center gap-2 text-base font-bold"
                    style={{ color: feature.color }}
                    data-icod-id={`src_components_homepage_whymg_tsx_9da4_${feature.title}`}>
                    <CheckCircle2
                      className="h-5 w-5"
                      data-icod-id={`src_components_homepage_whymg_tsx_9895_${feature.title}`} />
                    <span data-icod-id={`src_components_homepage_whymg_tsx_82c1_${feature.title}`}>Included</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
