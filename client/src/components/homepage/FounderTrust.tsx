import { Link } from 'react-router-dom';
import { Button, Card, Badge } from '@/components/ui';
import { cn } from '@/utils/cn';
import { ArrowRight, Award, Store, TrendingUp } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

interface FounderTrustProps {
  className?: string;
}

const EXPERTISE_AREAS = [
  { icon: Store, label: 'E-Commerce' },
  { icon: TrendingUp, label: 'Digital Marketing' },
  { icon: Award, label: 'AI-Powered Tools' },
];

export default function FounderTrust({ className }: FounderTrustProps) {
  const { ref, isInView } = useInView({ threshold: 0.15, triggerOnce: true });

  return (
    <section
      className={cn('py-20 md:py-28 bg-background relative overflow-hidden', className)}
      data-icod-id="src_components_homepage_foundertrust_tsx_660a">
      {/* Background accents */}
      <div
        className="absolute -right-40 top-1/3 w-[500px] h-[500px] rounded-full opacity-[0.04] blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--primary)) 0%, transparent 70%)' }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_foundertrust_tsx_3ca5" />
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        data-icod-id="src_components_homepage_foundertrust_tsx_b646">
        <div
          ref={ref}
          className={`max-w-5xl mx-auto transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          data-icod-id="src_components_homepage_foundertrust_tsx_da5f">
          <Card
            hoverLift={false}
            className="overflow-hidden border-border/80 shadow-[0_8px_32px_rgba(var(--primary),0.08)]"
            data-icod-id="src_components_homepage_foundertrust_tsx_a751">
            <div
              className="flex flex-col lg:flex-row items-center gap-10 p-8 md:p-12 lg:p-14"
              data-icod-id="src_components_homepage_foundertrust_tsx_f701">
              
              {/* Founder image/avatar with premium styling */}
              <div
                className="shrink-0 relative group"
                data-icod-id="src_components_homepage_foundertrust_tsx_16de">
                {/* Decorative ring */}
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500"
                  data-icod-id="src_components_homepage_foundertrust_tsx_46d0" />
                
                <div
                  className="relative h-40 w-40 md:h-48 md:w-48 rounded-full overflow-hidden border-4 border-card shadow-[0_12px_32px_rgba(var(--primary),0.15)]"
                  data-icod-id="src_components_homepage_foundertrust_tsx_2013">
                  <img
                    src="/assets/1792968956320_AI_Professional_in_a_Modern_Workspace-upload.webp"
                    alt="Mahreen Yousaf, founder and CEO of MG Blessed Beginnings"
                    className="h-full w-full object-cover object-top"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    data-icod-id="src_components_homepage_foundertrust_tsx_3916"
                  />
                </div>
                
                {/* Verified badge */}
                <div
                  className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent border-[3px] border-card shadow-lg"
                  data-icod-id="src_components_homepage_foundertrust_tsx_09bb">
                  <Award
                    className="h-5 w-5 text-primary-foreground"
                    data-icod-id="src_components_homepage_foundertrust_tsx_8cbf" />
                </div>
              </div>

              {/* Content */}
              <div
                className="text-center lg:text-left flex-1"
                data-icod-id="src_components_homepage_foundertrust_tsx_41a6">
                <Badge
                  variant="ai"
                  className="mb-4 text-[10px] px-3 py-1"
                  data-icod-id="src_components_homepage_foundertrust_tsx_3ef3">
                  FOUNDER & CEO
                </Badge>
                
                <h2
                  className="text-3xl md:text-4xl font-extrabold text-foreground mb-5 font-heading tracking-tight"
                  data-icod-id="src_components_homepage_foundertrust_tsx_3e81">
                  Built From Real{' '}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--accent)) 100%)' }}
                    data-icod-id="src_components_homepage_foundertrust_tsx_df1d">
                    Business Experience
                  </span>
                </h2>
                
                <p
                  className="text-muted-foreground leading-relaxed mb-8 text-lg"
                  data-icod-id="src_components_homepage_foundertrust_tsx_d4fc">
                  Mahreen Yousaf built MG Blessed Beginnings from hands-on experience in e-commerce,
                  digital marketing, and AI-powered business tools. Every tool and resource on this
                  platform is designed from practical, real-world knowledge — not theory.
                </p>
                
                {/* Expertise areas */}
                <div
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8"
                  data-icod-id="src_components_homepage_foundertrust_tsx_aaf4">
                  {EXPERTISE_AREAS.map((area) => {
                    const Icon = area.icon;
                    return (
                      <div
                        key={area.label}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border/80"
                        data-icod-id={`src_components_homepage_foundertrust_tsx_ffe5_${area.label}`}>
                        <Icon
                          className="h-4 w-4 text-primary"
                          data-icod-id={`src_components_homepage_foundertrust_tsx_c70c_${area.label}`} />
                        <span
                          className="text-sm font-semibold text-foreground"
                          data-icod-id={`src_components_homepage_foundertrust_tsx_5a34_${area.label}`}>{area.label}</span>
                      </div>
                    );
                  })}
                </div>
                
                <Link to="/about" data-icod-id="src_components_homepage_foundertrust_tsx_2d99">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-primary/30 text-primary hover:bg-secondary hover:border-primary/50 group"
                    data-icod-id="src_components_homepage_foundertrust_tsx_2892">
                    Meet Mahreen
                    <ArrowRight
                      className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300"
                      data-icod-id="src_components_homepage_foundertrust_tsx_0cef" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
