import { cn } from '@/utils/cn';
import { ArrowRight } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import { useHomepageSettings } from '@/hooks/useHomepageSettings';

interface BusinessJourneyProps {
  className?: string;
}

const STEP_IMAGES = [
  'https://drive.google.com/thumbnail?id=1k3WmsHuMpqqbg8xdgmOu9zSMt6Eor_KW&sz=w1920',
  'https://drive.google.com/thumbnail?id=1IVpg0pK3-CcEsRr5ToOorYZXCwNzsF58&sz=w1920',
  'https://drive.google.com/thumbnail?id=1YEYQ-pE2am7XqQ_QIkbBnTw5ElabxDSg&sz=w1920',
  'https://drive.google.com/thumbnail?id=1xnTngt6v3z0_f3JUfpow6PDpGnJHibAI&sz=w1920',
  'https://drive.google.com/thumbnail?id=1GArCQN7rfAhFL-gA6Z3lDr1EnJwx3vTL&sz=w1920',
  'https://drive.google.com/thumbnail?id=1_JyJ320eU6sbd6wX0a3Fmzcf2RMF9s7I&sz=w1920',
];

const STEP_COLORS = [
  'rgb(var(--warning))',
  'rgb(var(--primary))',
  'rgb(var(--accent))',
  'rgb(var(--cyan))',
  'rgb(var(--primary-hover))',
  'rgb(var(--success))',
];

export default function BusinessJourney({ className }: BusinessJourneyProps) {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { settings } = useHomepageSettings();

  // Merge DB steps with static images/colors (images and colors are not editable)
  const steps = settings.journeySteps.map((step, idx) => ({
    ...step,
    image: STEP_IMAGES[idx] || '',
    color: STEP_COLORS[idx] || 'rgb(var(--primary))',
  }));

  return (
    <section
      id="how-it-works"
      className={cn('py-20 md:py-28 bg-background relative overflow-hidden', className)}
      data-icod-id="src_components_homepage_businessjourney_tsx_a32b">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ 
          backgroundImage: 'radial-gradient(rgb(var(--primary)) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_businessjourney_tsx_311d" />
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        data-icod-id="src_components_homepage_businessjourney_tsx_a517">
        {/* Section header */}
        <div
          className="text-center mb-20"
          data-icod-id="src_components_homepage_businessjourney_tsx_f03d">
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3"
            data-icod-id="src_components_homepage_businessjourney_tsx_ba62">
            Your Path to Success
          </span>
          <h2
            className="text-3xl md:text-5xl font-extrabold text-foreground mb-5 font-heading tracking-tight"
            data-icod-id="src_components_homepage_businessjourney_tsx_fe66">
            From Idea to Launch in{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--accent)) 100%)' }}
              data-icod-id="src_components_homepage_businessjourney_tsx_4c5a">
              6 Clear Steps
            </span>
          </h2>
          <p
            className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
            data-icod-id="src_components_homepage_businessjourney_tsx_7b11">
            Your business journey mapped out with AI tools and expert guidance at every stage.
          </p>
        </div>

        {/* Steps progression */}
        <div
          ref={ref}
          className={`relative transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          data-icod-id="src_components_homepage_businessjourney_tsx_d361">
          {/* Desktop horizontal connector line with gradient */}
          <div
            className="hidden lg:block absolute top-[12rem] left-[10%] right-[10%] h-1 rounded-full"
            aria-hidden="true"
            data-icod-id="src_components_homepage_businessjourney_tsx_2033">
            <div
              className="w-full h-full bg-gradient-to-r from-warning/30 via-primary/30 to-accent/30 rounded-full"
              data-icod-id="src_components_homepage_businessjourney_tsx_52e6" />
            <div
              className="absolute inset-0 bg-gradient-to-r from-warning/10 via-primary/10 to-accent/10 blur-sm"
              data-icod-id="src_components_homepage_businessjourney_tsx_1369" />
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8 lg:gap-5"
            data-icod-id="src_components_homepage_businessjourney_tsx_14ee">
            {steps.map((step, index) => (
                <div
                  key={step.number}
                  className="group relative flex flex-col items-center text-center rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                  style={{ 
                    animationDelay: `${index * 120}ms`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 12px 32px ${step.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                  data-icod-id={`src_components_homepage_businessjourney_tsx_cf7a_${step.number}`}>
                  {/* Card image */}
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-48 object-cover rounded-t-2xl"
                    loading="lazy"
                    data-icod-id={`src_components_homepage_businessjourney_tsx_img_${step.number}`}
                  />
                  {/* Step number badge */}
                  <span
                    className="absolute top-40 left-1/2 -translate-x-1/2 rounded-full bg-card border border-border px-3 py-1 text-xs font-bold text-muted-foreground group-hover:border-primary/50 group-hover:text-primary-foreground transition-all duration-300 shadow-sm z-10"
                    style={{ 
                      minWidth: '2.5rem',
                    }}
                    data-icod-id={`src_components_homepage_businessjourney_tsx_f390_${step.number}`}>
                    <span
                      className="group-hover:hidden"
                      data-icod-id={`src_components_homepage_businessjourney_tsx_de15_${step.number}`}>{step.number}</span>
                    <span
                      className="hidden group-hover:inline-flex items-center gap-1"
                      data-icod-id={`src_components_homepage_businessjourney_tsx_3f86_${step.number}`}>
                      {step.number} <ArrowRight
                      className="h-3 w-3"
                      data-icod-id={`src_components_homepage_businessjourney_tsx_2bd9_${step.number}`} />
                    </span>
                  </span>
                  {/* Title & description */}
                  <div
                    className="p-5 pt-6"
                    data-icod-id={`src_components_homepage_businessjourney_tsx_89c9_${step.number}`}>
                    <h3
                      className="text-lg font-bold text-foreground font-heading mb-2 group-hover:text-primary-hover transition-colors duration-300"
                      data-icod-id={`src_components_homepage_businessjourney_tsx_4f08_${step.number}`}>{step.title}</h3>
                    <p
                      className="text-sm text-muted-foreground leading-relaxed"
                      data-icod-id={`src_components_homepage_businessjourney_tsx_387b_${step.number}`}>{step.description}</p>
                  </div>
                  {/* Mobile vertical connector with arrow */}
                  {index < steps.length - 1 && (
                    <div
                      className="lg:hidden absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
                      aria-hidden="true"
                      data-icod-id={`src_components_homepage_businessjourney_tsx_0252_${step.number}`}>
                      <div
                        className="h-6 w-0.5 bg-gradient-to-b from-border to-border/50"
                        data-icod-id={`src_components_homepage_businessjourney_tsx_23d7_${step.number}`} />
                      <div
                        className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-border"
                        data-icod-id={`src_components_homepage_businessjourney_tsx_d501_${step.number}`} />
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
