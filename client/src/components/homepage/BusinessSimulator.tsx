import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '@/components/ui';
import { cn } from '@/utils/cn';
import { BarChart3, ArrowRight, TrendingUp, ShieldCheck, Tag, Megaphone, Search, Activity, Info } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

interface BusinessSimulatorProps {
  className?: string;
}

const METRICS = [
  { label: 'Business Readiness Score', value: 78, max: 100, color: 'rgb(var(--primary))', icon: BarChart3, gradient: 'from-primary to-primary-hover' },
  { label: 'Product Opportunity', value: 86, max: 100, color: 'rgb(var(--primary-hover))', icon: TrendingUp, gradient: 'from-primary-hover to-accent' },
  { label: 'Brand Readiness', value: 72, max: 100, color: 'rgb(var(--accent))', icon: ShieldCheck, gradient: 'from-accent to-accent-hover' },
  { label: 'Pricing', value: 81, max: 100, color: 'rgb(var(--warning))', icon: Tag, gradient: 'from-warning to-warning-hover' },
  { label: 'Marketing', value: 75, max: 100, color: 'rgb(var(--primary))', icon: Megaphone, gradient: 'from-primary to-primary-hover' },
  { label: 'SEO', value: 69, max: 100, color: 'rgb(var(--primary-hover))', icon: Search, gradient: 'from-primary-hover to-accent' },
];

export default function BusinessSimulator({ className }: BusinessSimulatorProps) {
  const { ref, isInView } = useInView({ threshold: 0.15, triggerOnce: true });

  return (
    <section
      className={cn('py-20 md:py-28 bg-background relative overflow-hidden', className)}
      data-icod-id="src_components_homepage_businesssimulator_tsx_6c38">
      {/* Background accents */}
      <div
        className="absolute -left-32 top-1/4 w-[400px] h-[400px] rounded-full opacity-[0.04] blur-[80px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--primary)) 0%, transparent 70%)' }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_businesssimulator_tsx_5876" />
      <div
        className="absolute -right-32 bottom-1/4 w-[400px] h-[400px] rounded-full opacity-[0.04] blur-[80px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--primary-hover)) 0%, transparent 70%)' }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_businesssimulator_tsx_afe7" />
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        data-icod-id="src_components_homepage_businesssimulator_tsx_15d0">
        {/* Section header */}
        <div
          className="text-center mb-16"
          data-icod-id="src_components_homepage_businesssimulator_tsx_6bdf">
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest text-accent mb-3"
            data-icod-id="src_components_homepage_businesssimulator_tsx_db92">
            AI-Powered Insights
          </span>
          <h2
            className="text-3xl md:text-5xl font-extrabold text-foreground mb-5 font-heading tracking-tight"
            data-icod-id="src_components_homepage_businesssimulator_tsx_7241">
            See Your Business Potential{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--accent)) 100%)' }}
              data-icod-id="src_components_homepage_businesssimulator_tsx_d950">
              Before You Launch
            </span>
          </h2>
          <p
            className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
            data-icod-id="src_components_homepage_businesssimulator_tsx_5f34">
            Get an AI-powered readiness preview that shows where your business idea stands — before you invest time and money.
          </p>
        </div>

        {/* Photorealistic seller desk image */}
        <div
          className="max-w-5xl mx-auto mb-12 animate-fade-up"
          data-icod-id="src_components_homepage_businesssimulator_tsx_seller_image_wrap">
          <div
            className="relative overflow-hidden rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-border/40"
            data-icod-id="src_components_homepage_businesssimulator_tsx_dc46">
            <img
              src="/assets/seller-desk-dashboard.webp"
              alt="Photorealistic image of an online seller's desk with a laptop showing a bulk product listing dashboard with many product rows, stacked product boxes beside it, natural cinematic lighting"
              className="w-full h-auto aspect-video object-cover"
              loading="lazy"
              data-icod-id="src_components_homepage_businesssimulator_tsx_seller_image"
            />
            {/* Gradient overlay for visual cohesion with the section */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none"
              aria-hidden="true"
              data-icod-id="src_components_homepage_businesssimulator_tsx_seller_image_overlay"
            />
          </div>
        </div>

        {/* Dashboard-style preview card */}
        <div
          ref={ref}
          className={`max-w-4xl mx-auto transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          data-icod-id="src_components_homepage_businesssimulator_tsx_0c48">
          <Card
            hoverLift={false}
            className="overflow-hidden border-border/80 shadow-[0_4px_24px_rgba(var(--primary),0.08)]"
            data-icod-id="src_components_homepage_businesssimulator_tsx_adbf">
            {/* Card header with premium styling */}
            <div
              className="flex items-center justify-between px-6 py-5 border-b border-border/80 bg-gradient-to-r from-secondary to-card"
              data-icod-id="src_components_homepage_businesssimulator_tsx_1dd1">
              <div
                className="flex items-center gap-4"
                data-icod-id="src_components_homepage_businesssimulator_tsx_7dfb">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-[0_4px_12px_rgba(var(--primary),0.25)]"
                  data-icod-id="src_components_homepage_businesssimulator_tsx_0d42">
                  <Activity
                    className="h-5 w-5 text-primary-foreground"
                    data-icod-id="src_components_homepage_businesssimulator_tsx_fb92" />
                </div>
                <div data-icod-id="src_components_homepage_businesssimulator_tsx_63e9">
                  <h3
                    className="text-base font-bold text-foreground font-heading"
                    data-icod-id="src_components_homepage_businesssimulator_tsx_bdf8">AI Business Readiness Preview</h3>
                  <p
                    className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"
                    data-icod-id="src_components_homepage_businesssimulator_tsx_a79e">
                    <Info
                      className="h-3 w-3"
                      data-icod-id="src_components_homepage_businesssimulator_tsx_37ba" />
                    Visual preview — launch to get real analysis
                  </p>
                </div>
              </div>
              <Badge
                variant="ai"
                className="text-[10px] px-3 py-1"
                data-icod-id="src_components_homepage_businesssimulator_tsx_7061">
                DEMO
              </Badge>
            </div>

            {/* Metrics grid */}
            <div
              className="p-6 md:p-8"
              data-icod-id="src_components_homepage_businesssimulator_tsx_940f">
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                data-icod-id="src_components_homepage_businesssimulator_tsx_ecaf">
                {METRICS.map((metric, index) => {
                  const Icon = metric.icon;
                  const percentage = Math.round((metric.value / metric.max) * 100);
                  return (
                    <div
                      key={metric.label}
                      className="group p-4 rounded-xl bg-card border border-border/60 hover:border-border hover:shadow-[0_4px_16px_rgba(var(--primary),0.06)] transition-all duration-300"
                      data-icod-id={`src_components_homepage_businesssimulator_tsx_7ceb_${metric.label}`}>
                      <div
                        className="flex items-center gap-2.5 mb-3"
                        data-icod-id={`src_components_homepage_businesssimulator_tsx_7f1e_${metric.label}`}>
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
                          style={{ backgroundColor: `${metric.color}12` }}
                          data-icod-id={`src_components_homepage_businesssimulator_tsx_7841_${metric.label}`}>
                          <Icon
                            className="h-4 w-4"
                            style={{ color: metric.color }}
                            data-icod-id={`src_components_homepage_businesssimulator_tsx_b3f1_${metric.label}`} />
                        </div>
                        <span
                          className="text-sm font-medium text-muted-foreground"
                          data-icod-id={`src_components_homepage_businesssimulator_tsx_65db_${metric.label}`}>{metric.label}</span>
                      </div>
                      <div
                        className="flex items-end gap-2 mb-3"
                        data-icod-id={`src_components_homepage_businesssimulator_tsx_b0f1_${metric.label}`}>
                        <span
                          className="text-3xl font-extrabold text-foreground font-heading tabular-nums"
                          data-icod-id={`src_components_homepage_businesssimulator_tsx_72a5_${metric.label}`}>{metric.value}</span>
                        <span
                          className="text-sm text-muted-foreground mb-1.5"
                          data-icod-id={`src_components_homepage_businesssimulator_tsx_32f9_${metric.label}`}>/ {metric.max}</span>
                      </div>
                      {/* Enhanced progress bar */}
                      <div
                        className="h-2.5 w-full rounded-full bg-secondary overflow-hidden relative"
                        data-icod-id={`src_components_homepage_businesssimulator_tsx_fbff_${metric.label}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-1500 ease-out relative overflow-hidden`}
                          style={{
                            width: isInView ? `${percentage}%` : '0%',
                            background: `linear-gradient(90deg, ${metric.color}, ${metric.color}CC)`,
                            transitionDelay: `${300 + index * 100}ms`,
                          }}
                          data-icod-id={`src_components_homepage_businesssimulator_tsx_2851_${metric.label}`}>
                          {/* Shimmer effect */}
                          <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/30 to-transparent animate-shimmer"
                            data-icod-id={`src_components_homepage_businesssimulator_tsx_c512_${metric.label}`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card footer CTA with enhanced styling */}
            <div
              className="px-6 py-6 border-t border-border/80 bg-gradient-to-r from-secondary to-card flex flex-col sm:flex-row items-center justify-between gap-4"
              data-icod-id="src_components_homepage_businesssimulator_tsx_6da1">
              <p
                className="text-sm text-muted-foreground text-center sm:text-left"
                data-icod-id="src_components_homepage_businesssimulator_tsx_d218">
                Ready to see your real business score?
              </p>
              <Link
                to="/ai-tools"
                data-icod-id="src_components_homepage_businesssimulator_tsx_2466">
                <Button
                  variant="premium"
                  size="lg"
                  className="shadow-[0_4px_16px_rgba(var(--primary),0.25)] hover:shadow-[0_6px_24px_rgba(var(--primary),0.35)]"
                  data-icod-id="src_components_homepage_businesssimulator_tsx_ec15">
                  Explore Your Business Journey
                  <ArrowRight
                    className="h-4 w-4 ml-1"
                    data-icod-id="src_components_homepage_businesssimulator_tsx_4652" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
