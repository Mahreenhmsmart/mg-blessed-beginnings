import { cn } from '@/utils/cn';
import { useInView } from '@/hooks/useInView';
import { ArrowRight, BarChart3 } from 'lucide-react';
import VideoEmbed from '@/components/VideoEmbed';

interface AppScreenshotsProps {
  className?: string;
}

export default function AppScreenshots({ className }: AppScreenshotsProps) {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section
      className={cn('py-20 md:py-28 bg-background relative overflow-hidden', className)}
      data-icod-id="src_components_homepage_appscreenshots_tsx_section">
      {/* Background accents */}
      <div
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-[0.04] blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--primary)) 0%, transparent 70%)' }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_appscreenshots_tsx_bg1" />
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.03] blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)' }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_appscreenshots_tsx_bg2" />
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        data-icod-id="src_components_homepage_appscreenshots_tsx_container">
        {/* Section header */}
        <div
          className="text-center mb-16 max-w-3xl mx-auto"
          data-icod-id="src_components_homepage_appscreenshots_tsx_header">
          <div
            className="inline-flex items-center gap-2 text-primary mb-4"
            data-icod-id="src_components_homepage_appscreenshots_tsx_badge">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent"
              data-icod-id="src_components_homepage_appscreenshots_tsx_badge_icon">
              <BarChart3
                className="h-4 w-4 text-primary-foreground"
                data-icod-id="src_components_homepage_appscreenshots_tsx_3015" />
            </div>
            <span
              className="font-bold text-sm tracking-wide uppercase"
              data-icod-id="src_components_homepage_appscreenshots_tsx_badge_text">See It In Action</span>
          </div>
          <h2
            className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 font-heading tracking-tight"
            data-icod-id="src_components_homepage_appscreenshots_tsx_title">
            How MG AI Tools{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--accent)) 100%)' }}
              data-icod-id="src_components_homepage_appscreenshots_tsx_title_gradient">
              Transform Your Business
            </span>
          </h2>
          <p
            className="text-lg text-muted-foreground"
            data-icod-id="src_components_homepage_appscreenshots_tsx_subtitle">
            See how our free AI tools solve real problems and deliver instant results for your online business.
          </p>
        </div>

        {/* Video tutorial panels */}
        <div
          ref={ref}
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          data-icod-id="src_components_homepage_appscreenshots_tsx_grid">
          <VideoEmbed
            src="https://drive.google.com/file/d/1M57RHp2dMod2H-rm-EkXLizazB5s9xab/preview"
            title="AI-Powered Business Toolkit"
            description="Access 14 free AI tools for content, SEO, and eCommerce in one dashboard."
            className="w-full"
            data-icod-id="src_components_homepage_appscreenshots_tsx_99aa" />
          <VideoEmbed
            src="https://drive.google.com/file/d/1Q-9LzwlApL_74zrVGUCDTtTPllHQb-op/preview"
            title="Create Better Content in Seconds"
            description="Professional-quality content generated instantly, ready to publish."
            className="w-full"
            data-icod-id="src_components_homepage_appscreenshots_tsx_3b73" />
          <VideoEmbed
            src="https://drive.google.com/file/d/1z00iU_O4I2R1RM_593bkRiBCRH5sSl6Y/preview"
            title="SEO Titles & Product Descriptions"
            description="SEO-optimized titles that boost visibility and drive organic traffic."
            className="w-full"
            data-icod-id="src_components_homepage_appscreenshots_tsx_3772" />
          <VideoEmbed
            src="https://drive.google.com/file/d/1rGWxiKwtAqkX1fqPtW0zQY-1gHMns19E/preview"
            title="Grow Your Social Media With AI"
            description="Trending hashtags and captions that increase reach and engagement."
            className="w-full"
            data-icod-id="src_components_homepage_appscreenshots_tsx_b897" />
          <VideoEmbed
            src="https://drive.google.com/file/d/1G9juHbzhdXnSCLm-X-4yI3H1TiFbhIaJ/preview"
            title="Free Tools for Online Business"
            description="All tools completely free — no credit card, no sign-up required."
            className="w-full"
            data-icod-id="src_components_homepage_appscreenshots_tsx_047f" />
        </div>

        {/* Bottom CTA */}
        <div
          className="mt-16 text-center"
          data-icod-id="src_components_homepage_appscreenshots_tsx_cta">
          <p className="text-muted-foreground mb-4" data-icod-id="src_components_homepage_appscreenshots_tsx_cta_text">
            Ready to experience these tools yourself?
          </p>
          <a
            href="/ai-tools"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-hover transition-colors"
            data-icod-id="src_components_homepage_appscreenshots_tsx_cta_link">
            Try All Free AI Tools
            <ArrowRight
              className="h-4 w-4"
              data-icod-id="src_components_homepage_appscreenshots_tsx_d229" />
          </a>
        </div>
      </div>
    </section>
  );
}
