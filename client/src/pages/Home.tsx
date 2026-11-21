import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAITools } from '@/store/slices/aiToolsSlice';
import SEOHead from '@/components/SEOHead';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Button } from '@/components/ui';
import { Rocket, ArrowRight } from 'lucide-react';
import NewsletterSignup from '@/components/NewsletterSignup';
import {
  HomepageHero,
  PromoVideo,
  BusinessJourney,
  AIBusinessToolkit,
  AppScreenshots,
  BuildJourney,
  BusinessSimulator,
  WhyMG,
  FounderTrust,
  FinalCTA,
  ShopDigitalProducts,
  FreeResources,
  ClientReviews,
  CoursesShowcase,
  HomepageStats,
  ContentHookSection,
  WhatsAppShareSection,
  ToolsMarquee,
  LatestBlogPosts,
} from '@/components/homepage';
import { PAGE_META, SchemaInjector } from '@/seo';
import { useSeo } from '@/components/Seo';

const homeMeta = PAGE_META['/'];

export default function Home() {
  useSeo(
    'MG Blessed Beginnings — 14 Free AI Tools for Online Sellers',
    '14 free AI tools for online sellers — product descriptions, SEO titles, hashtags, profit calculator and more. No sign-up, no credit card, free forever.',
  );
  const dispatch = useAppDispatch();
  const { items: aiTools, status: aiToolsStatus } = useAppSelector((state) => state.aiTools);

  useEffect(() => {
    if (aiToolsStatus === 'idle') {
      dispatch(fetchAITools());
    }
  }, [dispatch, aiToolsStatus]);

  return (
    <>
      <SEOHead
        title={homeMeta.title}
        description={homeMeta.description}
        keywords={homeMeta.keywords}
        canonicalUrl={homeMeta.canonical}
        data-icod-id="src_pages_home_tsx_d533" />
      <SchemaInjector schemaType="home" pageMeta={homeMeta} data-icod-id="src_pages_home_tsx_fc1b" />
      {/* Section 1 & 2: Hero + Interactive Business Idea Box */}
      <ErrorBoundary data-icod-id="src_pages_home_tsx_aeda">
        <HomepageHero data-icod-id="src_pages_home_tsx_50ec" />
      </ErrorBoundary>
      {/* Content Hook of the Moment — above ticker slider */}
      <ErrorBoundary data-icod-id="src_pages_home_tsx_content_hook_boundary">
        <ContentHookSection data-icod-id="src_pages_home_tsx_870f" />
      </ErrorBoundary>
      {/* WhatsApp Share — above ticker slider */}
      <ErrorBoundary data-icod-id="src_pages_home_tsx_whatsapp_share_boundary">
        <WhatsAppShareSection data-icod-id="src_pages_home_tsx_66a1" />
      </ErrorBoundary>
      {/* Tools Marquee Strip — 14 tool names, directly above stat cards */}
      <ToolsMarquee data-icod-id="src_pages_home_tsx_tools_marquee" />
      {/* Animated Stat Cards — below tools marquee */}
      <HomepageStats data-icod-id="src_pages_home_tsx_stats_section" />
      {/* Section 2.5: Promo Video */}
      <ErrorBoundary data-icod-id="src_pages_home_tsx_promo_video_boundary">
        <PromoVideo data-icod-id="src_pages_home_tsx_promo_video" />
      </ErrorBoundary>
      {/* Section 2.7: Free Resources Library */}
      <ErrorBoundary data-icod-id="src_pages_home_tsx_free_resources_boundary">
        <FreeResources data-icod-id="src_pages_home_tsx_free_resources" />
      </ErrorBoundary>
      {/* Section 3: Business Journey */}
      <section id="how-it-works" data-icod-id="src_pages_home_tsx_how_it_works_wrapper">
        <ErrorBoundary data-icod-id="src_pages_home_tsx_e980">
          <BusinessJourney data-icod-id="src_pages_home_tsx_1bc0" />
        </ErrorBoundary>
      </section>
      {/* Section 4: AI Business Toolkit */}
      <ErrorBoundary data-icod-id="src_pages_home_tsx_e41c">
        <AIBusinessToolkit
          tools={aiTools}
          status={aiToolsStatus}
          data-icod-id="src_pages_home_tsx_7643" />
      </ErrorBoundary>
      {/* Section 4.05: Shop Digital Products */}
      <ErrorBoundary data-icod-id="src_pages_home_tsx_shop_digital_boundary">
        <ShopDigitalProducts data-icod-id="src_pages_home_tsx_shop_digital" />
      </ErrorBoundary>
      {/* Section 4.055: Courses Showcase */}
      <ErrorBoundary data-icod-id="src_pages_home_tsx_courses_showcase_boundary">
        <CoursesShowcase data-icod-id="src_pages_home_tsx_courses_showcase" />
      </ErrorBoundary>
      {/* Section 4.1: App Screenshots Showcase */}
      <ErrorBoundary data-icod-id="src_pages_home_tsx_screenshots_boundary">
        <AppScreenshots data-icod-id="src_pages_home_tsx_screenshots" />
      </ErrorBoundary>
      {/* Section 4.5: Build Journey — I Built This Series */}
      <ErrorBoundary data-icod-id="src_pages_home_tsx_build_journey_boundary">
        <BuildJourney data-icod-id="src_pages_home_tsx_build_journey" />
      </ErrorBoundary>
      {/* Section 4.55: Client Reviews Carousel */}
      <ErrorBoundary data-icod-id="src_pages_home_tsx_client_reviews_boundary">
        <ClientReviews data-icod-id="src_pages_home_tsx_client_reviews" />
      </ErrorBoundary>
      {/* Section 4.56: From the Blog */}
      <LatestBlogPosts data-icod-id="src_pages_home_tsx_2aff" />
      {/* Section 4.565: Follow Us on Pinterest */}
      <section className="py-16 bg-background" data-icod-id="src_pages_home_tsx_pinterest_section">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          data-icod-id="src_pages_home_tsx_pinterest_container">
          <div
            className="inline-flex items-center gap-3 rounded-full bg-primary/10 border border-primary/20 px-6 py-3 transition-all duration-300 hover:bg-primary/20"
            data-icod-id="src_pages_home_tsx_pinterest_badge">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 text-primary"
              aria-hidden="true"
              data-icod-id="src_pages_home_tsx_pinterest_icon"><path
              d="M12 0C5.373 0 0 5.373 0 12c0 4.99 3.063 9.248 7.406 11.078-.102-.937-.195-2.375.042-3.397l1.453-6.17s-.37-.742-.37-1.837c0-1.718.992-2.998 2.228-2.998 1.048 0 1.553.787 1.553 1.73 0 1.056-.672 2.636-1.018 4.099-.29 1.226.613 2.226 1.822 2.226 2.186 0 3.868-2.305 3.868-5.63 0-2.945-2.116-4.998-5.136-4.998-3.744 0-5.94 2.81-5.94 5.715 0 1.132.436 2.345.982 3.004.108.13.124.25.093.383l-.368 1.493c-.058.235-.188.286-.434.173-1.62-.754-2.627-3.118-2.627-5.018 0-4.086 2.968-7.838 8.563-7.838 4.496 0 7.99 3.204 7.99 7.488 0 4.47-2.818 8.07-6.73 8.07-1.314 0-2.548-.683-2.973-1.488l-.81 3.08c-.293 1.122-1.085 2.525-1.617 3.38A12.002 12.002 0 0 0 24 12c0-6.627-5.373-12-12-12z"
              data-icod-id="src_pages_home_tsx_pinterest_path" /></svg>
            <a
              href="https://www.pinterest.com/mgblessedbeginnings/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-bold text-primary hover:text-primary-hover transition-colors duration-200"
              data-icod-id="src_pages_home_tsx_pinterest_link">
              Follow us on Pinterest
            </a>
          </div>
        </div>
      </section>
      {/* Section 4.57: Newsletter Signup */}
      <section className="py-20 bg-background" data-icod-id="src_pages_home_tsx_newsletter_section">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          data-icod-id="src_pages_home_tsx_b826">
          <NewsletterSignup variant="default" data-icod-id="src_pages_home_tsx_4487" />
        </div>
      </section>
      {/* Section 4.6: 30-Day Growth Plan CTA */}
      <section className="py-20 md:py-28 relative overflow-hidden" data-icod-id="src_pages_home_tsx_growth_plan_cta">
        <div
          className="absolute inset-0 bg-primary/5"
          aria-hidden="true"
          data-icod-id="src_pages_home_tsx_b5cb" />
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
          data-icod-id="src_pages_home_tsx_fe87">
          <div
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 mb-5"
            data-icod-id="src_pages_home_tsx_b5ab">
            <Rocket className="h-4 w-4 text-primary" data-icod-id="src_pages_home_tsx_d3f7" />
            <span
              className="text-sm font-semibold text-primary"
              data-icod-id="src_pages_home_tsx_e95c">New: 30-Day Growth Plan</span>
          </div>
          <h2
            className="text-2xl md:text-3xl font-bold text-foreground mb-4 font-heading"
            data-icod-id="src_pages_home_tsx_eed9">
            Want 500 Users in 30 Days?
          </h2>
          <p
            className="text-muted-foreground mb-6 leading-relaxed max-w-lg mx-auto"
            data-icod-id="src_pages_home_tsx_9d2c">
            Follow our step-by-step growth plan with daily action items covering branding, content creation, referrals, community building, and analytics.
          </p>
          <Link to="/30-day-plan" data-icod-id="src_pages_home_tsx_d922">
            <Button variant="primary" size="md" data-icod-id="src_pages_home_tsx_e6ad">
              Start the 30-Day Plan
              <ArrowRight className="h-4 w-4 ml-1" data-icod-id="src_pages_home_tsx_8f2a" />
            </Button>
          </Link>
        </div>
      </section>
      {/* Section 5: Business Simulator Preview */}
      <ErrorBoundary data-icod-id="src_pages_home_tsx_a43e">
        <BusinessSimulator data-icod-id="src_pages_home_tsx_8141" />
      </ErrorBoundary>
      {/* Section 6: Why MG */}
      <ErrorBoundary data-icod-id="src_pages_home_tsx_9338">
        <WhyMG data-icod-id="src_pages_home_tsx_b667" />
      </ErrorBoundary>
      {/* Section 7: Founder Trust Section */}
      <ErrorBoundary data-icod-id="src_pages_home_tsx_8ec5">
        <FounderTrust data-icod-id="src_pages_home_tsx_56a1" />
      </ErrorBoundary>
      {/* Section 8: Final CTA */}
      <ErrorBoundary data-icod-id="src_pages_home_tsx_e584">
        <FinalCTA data-icod-id="src_pages_home_tsx_6abf" />
      </ErrorBoundary>
    </>
  );
}
