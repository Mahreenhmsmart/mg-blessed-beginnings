import { Button, Card } from '@/components/ui';
import { cn } from '@/utils/cn';
import { BookOpen, ExternalLink } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

interface FreeResourcesProps {
  className?: string;
}

const GUIDES = [
  {
    title: 'Free AI Tools Guide',
    description: 'Best free AI tools for productivity, content creation, and business automation',
    url: 'https://drive.google.com/file/d/1lUtcASlXnQUwieiOICzIlG0TNa--DAt8/view?usp=drivesdk',
    image: 'https://drive.google.com/thumbnail?id=1TxiNG_aNGu9V7E_evqpfAJQ4lvXwwCGh&sz=w1920',
  },
  {
    title: 'Canva Tips and Tutorials',
    description: 'Canva design tools, shortcuts, and mini tutorials',
    url: 'https://drive.google.com/file/d/1s4p30L4ldk67e8cZYKAjOivC2yyo_Tbk/view?usp=drivesdk',
    image: 'https://drive.google.com/thumbnail?id=1R8KX-2Wl9WoXOntLUHHjAoFRqqKkkdLQ&sz=w1920',
  },
  {
    title: 'AI Marketing Guide',
    description: 'Market research, ad copy, and free email automation',
    url: 'https://drive.google.com/file/d/1X1alL1NTU2PX9b9MuNKncEs2_MCowODG/view?usp=drivesdk',
    image: 'https://drive.google.com/thumbnail?id=1KYlY8OShZeKA0uGe7d9wVdEGqTZLdp-9&sz=w1920',
  },
  {
    title: 'Digital Safety Guide',
    description: 'Password manager, 2FA, and safe browsing',
    url: 'https://drive.google.com/file/d/1DNkABaawd_SqyzK3pOw2QsnMhtIHkQDc/view?usp=drivesdk',
    image: 'https://drive.google.com/thumbnail?id=1Cuko2HlRNQXVMYdSdniRRIJwWOUUNsI3&sz=w1920',
  },
] as const;

export default function FreeResources({ className }: FreeResourcesProps) {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section
      className={cn('py-20 md:py-28 bg-background relative overflow-hidden', className)}
      data-icod-id="src_components_homepage_freeresources_tsx_section">
      {/* Background gradient accents */}
      <div
        className="absolute -left-40 top-1/3 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--primary)) 0%, transparent 70%)' }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_freeresources_tsx_glow_left" />
      <div
        className="absolute -right-40 bottom-1/3 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--color-pink)) 0%, transparent 70%)' }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_freeresources_tsx_glow_right" />

      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        data-icod-id="src_components_homepage_freeresources_tsx_container">
        {/* Section header */}
        <div
          className="text-center mb-12 md:mb-16"
          data-icod-id="src_components_homepage_freeresources_tsx_header">
          <div
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 mb-5"
            data-icod-id="src_components_homepage_freeresources_tsx_badge">
            <BookOpen
              className="h-4 w-4 text-primary"
              data-icod-id="src_components_homepage_freeresources_tsx_icon" />
            <span
              className="text-sm font-semibold text-primary tracking-wide uppercase"
              data-icod-id="src_components_homepage_freeresources_tsx_label">
              Free Forever
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 font-heading tracking-tight"
            data-icod-id="src_components_homepage_freeresources_tsx_title">
            MG Blessed Beginnings{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--color-pink)) 50%, rgb(var(--gold)) 100%)' }}
              data-icod-id="src_components_homepage_freeresources_tsx_gradient">
              Resource Library
            </span>
          </h2>
          <p
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            data-icod-id="src_components_homepage_freeresources_tsx_subheading">
            Free guides and resources to help you grow your business — no sign-up required.
          </p>
        </div>

        {/* Guide cards grid */}
        <div
          ref={ref}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          data-icod-id="src_components_homepage_freeresources_tsx_grid">
          {GUIDES.map((guide, index) => (
              <Card
                key={guide.title}
                hoverLift
                className="flex flex-col border-border/80 overflow-hidden p-0"
                data-icod-id={`src_components_homepage_freeresources_tsx_card_${index}`}>
                {/* Full-width image at top */}
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="w-full h-48 object-cover rounded-t-2xl"
                  data-icod-id={`src_components_homepage_freeresources_tsx_card_image_${index}`} />

                {/* Card content below image */}
                <div className="flex flex-col gap-4 p-6 flex-1" data-icod-id={`src_components_homepage_freeresources_tsx_card_content_${index}`}>
                  {/* Title & Description */}
                  <h3
                    className="text-lg font-bold text-foreground font-heading"
                    data-icod-id={`src_components_homepage_freeresources_tsx_card_title_${index}`}>
                    {guide.title}
                  </h3>
                  <p
                    className="text-sm text-muted-foreground leading-relaxed flex-1"
                    data-icod-id={`src_components_homepage_freeresources_tsx_card_desc_${index}`}>
                    {guide.description}
                  </p>

                  {/* CTA Button */}
                  <a
                    href={guide.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto"
                    data-icod-id={`src_components_homepage_freeresources_tsx_link_${index}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      data-icod-id={`src_components_homepage_freeresources_tsx_btn_${index}`}>
                      View / Download
                      <ExternalLink
                        className="h-3.5 w-3.5 ml-1.5"
                        data-icod-id={`src_components_homepage_freeresources_tsx_ext_icon_${index}`} />
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </section>
  );
}
