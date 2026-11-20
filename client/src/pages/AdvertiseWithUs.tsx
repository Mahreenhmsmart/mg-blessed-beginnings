import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import FAQAccordion from '@/components/FAQAccordion';
import { Button, Card } from '@/components/ui';
import PlacementMap from '@/components/PlacementMap';
import { cn } from '@/utils/cn';
import type { FAQItem } from '@/components/FAQAccordion';
import { SchemaInjector, PAGE_META } from '@/seo';

const advertiseWithUsMeta = PAGE_META['/advertise'];
import {
  Megaphone,
  ArrowRight,
  Target,
  Users,
  Eye,
  BarChart3,
  Globe,
  Zap,
  CheckCircle2,
} from 'lucide-react';

const benefits = [
  {
    icon: Users,
    title: 'Reach Entrepreneurs',
    description:
      'Connect with thousands of e-commerce business owners actively building and growing their online presence.',
  },
  {
    icon: Eye,
    title: 'High Visibility',
    description:
      'Your ad appears on every page across the site — banner and sidebar placements ensure maximum exposure.',
  },
  {
    icon: Target,
    title: 'Targeted Audience',
    description:
      'Our visitors are digital marketers, Shopify sellers, and e-commerce founders — exactly who you want to reach.',
  },
  {
    icon: Zap,
    title: 'Simple & Fast',
    description:
      'Create your ad in minutes. One-time payment, 30-day placement, no recurring commitments.',
  },
];

const adFormats = [
  {
    name: 'Banner Ad',
    description: 'Full-width banner displayed at the top of every page. Ideal for brand awareness and promotions.',
    specs: ['1200px wide', 'Auto-rotating (8s intervals)', 'Clickable link included'],
  },
  {
    name: 'Sidebar Ad',
    description: 'Vertical sidebar placement visible on desktop screens. Perfect for persistent brand visibility.',
    specs: ['280px wide', 'Sticky positioning', 'Always visible while scrolling'],
  },
];

const ADVERTISE_FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How much does it cost to advertise?',
    answer: 'Banner and sidebar ad placements start at $50 for a 30-day campaign. One-time payment with no recurring commitments.',
  },
  {
    question: 'Where will my ad be displayed?',
    answer: 'Your ad appears site-wide across all pages of MG Blessed Beginnings, including the homepage, AI tools, services, blog, and dashboard pages.',
  },
  {
    question: 'Who will see my ads?',
    answer: 'Our audience consists of e-commerce entrepreneurs, Shopify sellers, eBay merchants, digital marketers, and small business owners actively growing their online presence.',
  },
  {
    question: 'Can I track my ad performance?',
    answer: 'Yes, every advertiser gets access to an ad dashboard showing impressions, clicks, click-through rate, and other key metrics in real time.',
  },
  {
    question: 'How do I create an ad?',
    answer: 'Visit our advertisement page, upload your creative (image or text), set your landing URL, and complete the one-time payment. Your ad goes live immediately after payment confirmation.',
  },
];

const advertiseStructuredData = [
  {
    '@type': 'WebPage',
    name: 'Advertise With Us — MG Blessed Beginnings',
    description: 'Reach engaged entrepreneurs and small business owners with banner and sidebar ad placements across our platform.',
  },
  {
    '@type': 'FAQPage',
    mainEntity: ADVERTISE_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  },
];

export default function AdvertiseWithUs() {
  return (
    <>
      <SEOHead
        title={advertiseWithUsMeta.title}
        description={advertiseWithUsMeta.description}
        keywords={advertiseWithUsMeta.keywords}
        canonicalUrl={advertiseWithUsMeta.canonical}
        structuredData={advertiseStructuredData}
        data-icod-id="src_pages_advertisewithus_tsx_seo"
      />
      <SchemaInjector
        schemaType="page"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Advertise', url: '/advertise' },
        ]}
        data-icod-id="src_pages_advertisewithus_tsx_6566" />
      {/* Hero Section */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: 'var(--section-lavender)' }}
        data-icod-id="src_pages_advertisewithus_tsx_hero">
        <div className="container mx-auto px-4 text-center max-w-7xl" data-icod-id="src_pages_advertisewithus_tsx_hero_content">
          <div
            className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl shadow-[0_0_60px_rgba(108,60,225,0.3)]"
            style={{ background: 'linear-gradient(135deg, #7662C7 0%, #29ADA4 100%)' }}
            data-icod-id="src_pages_advertisewithus_tsx_icon_badge">
            <Megaphone className="h-10 w-10 text-white" data-icod-id="src_pages_advertisewithus_tsx_megaphone" />
          </div>
          <h1
            className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight font-heading"
            data-icod-id="src_pages_advertisewithus_tsx_title">
            Get Your Brand In Front Of{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #7662C7, #29ADA4)' }}
              data-icod-id="src_pages_advertisewithus_tsx_gradient_text">
              E-Commerce Entrepreneurs
            </span>
          </h1>
          <p
            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
            data-icod-id="src_pages_advertisewithus_tsx_subtitle">
            Reach a highly engaged audience of Shopify sellers, eBay merchants, and digital business builders. 
            Premium ad placements starting at just $50 for 30 days.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4" data-icod-id="src_pages_advertisewithus_tsx_cta_group">
            <Link to="/advertisement" data-icod-id="src_pages_advertisewithus_tsx_cta_primary_link">
              <Button
                variant="primary"
                size="lg"
                className={cn(
                  'shadow-[0_4px_20px_rgba(118,98,199,0.4)] hover:shadow-[0_6px_30px_rgba(118,98,199,0.6)]',
                  'transition-all duration-300 ease-out'
                )}
                data-icod-id="src_pages_advertisewithus_tsx_cta_primary">
                Start Advertising Now
                <ArrowRight className="ml-2 h-5 w-5" data-icod-id="src_pages_advertisewithus_tsx_arrow" />
              </Button>
            </Link>
            <Link to="/ad-dashboard" data-icod-id="src_pages_advertisewithus_tsx_cta_secondary_link">
              <Button
                variant="outline"
                size="lg"
                data-icod-id="src_pages_advertisewithus_tsx_cta_secondary">
                <BarChart3 className="mr-2 h-5 w-5" data-icod-id="src_pages_advertisewithus_tsx_chart_icon" />
                View Ad Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Benefits Section */}
      <section className="py-20 bg-background" data-icod-id="src_pages_advertisewithus_tsx_benefits">
        <div className="container mx-auto px-4 max-w-6xl" data-icod-id="src_pages_advertisewithus_tsx_benefits_container">
          <div className="text-center mb-14" data-icod-id="src_pages_advertisewithus_tsx_benefits_header">
            <h2
              className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight font-heading"
              data-icod-id="src_pages_advertisewithus_tsx_benefits_title">
              Why Advertise With Us?
            </h2>
            <p
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              data-icod-id="src_pages_advertisewithus_tsx_benefits_subtitle">
              Our platform connects you directly with business owners actively seeking tools and services to grow their online stores.
            </p>
          </div>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            data-icod-id="src_pages_advertisewithus_tsx_benefits_grid">
            {benefits.map((benefit) => (
              <Card
                key={benefit.title}
                className="p-6 border-border/60 hover:border-primary/30 transition-colors duration-300"
                data-icod-id={`src_pages_advertisewithus_tsx_benefit_${benefit.title.replace(/\s+/g, '_').toLowerCase()}`}>
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"
                  data-icod-id={`src_pages_advertisewithus_tsx_benefit_icon_bg_${benefit.title.replace(/\s+/g, '_').toLowerCase()}`}>
                  <benefit.icon className="h-6 w-6 text-primary" data-icod-id={`src_pages_advertisewithus_tsx_benefit_icon_${benefit.title.replace(/\s+/g, '_').toLowerCase()}`} />
                </div>
                <h3
                  className="text-lg font-semibold text-foreground mb-2 font-heading"
                  data-icod-id={`src_pages_advertisewithus_tsx_benefit_title_${benefit.title.replace(/\s+/g, '_').toLowerCase()}`}>
                  {benefit.title}
                </h3>
                <p
                  className="text-sm text-muted-foreground leading-relaxed"
                  data-icod-id={`src_pages_advertisewithus_tsx_benefit_desc_${benefit.title.replace(/\s+/g, '_').toLowerCase()}`}>
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Ad Formats Section */}
      <section
        className="py-20"
        style={{ background: 'var(--section-lavender)' }}
        data-icod-id="src_pages_advertisewithus_tsx_formats">
        <div className="container mx-auto px-4 max-w-5xl" data-icod-id="src_pages_advertisewithus_tsx_formats_container">
          <div className="text-center mb-12" data-icod-id="src_pages_advertisewithus_tsx_formats_header">
            <h2
              className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight font-heading"
              data-icod-id="src_pages_advertisewithus_tsx_formats_title">
              Ad Formats
            </h2>
            <p
              className="text-lg text-muted-foreground"
              data-icod-id="src_pages_advertisewithus_tsx_formats_subtitle">
              Choose from two high-impact ad placements designed for maximum visibility.
            </p>
          </div>
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            data-icod-id="src_pages_advertisewithus_tsx_formats_grid">
            {adFormats.map((format) => (
              <Card
                key={format.name}
                className="p-8 border-border/60"
                data-icod-id={`src_pages_advertisewithus_tsx_format_${format.name.replace(/\s+/g, '_').toLowerCase()}`}>
                <div className="flex items-center gap-3 mb-4" data-icod-id={`src_pages_advertisewithus_tsx_format_header_${format.name.replace(/\s+/g, '_').toLowerCase()}`}>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"
                    data-icod-id={`src_pages_advertisewithus_tsx_format_icon_bg_${format.name.replace(/\s+/g, '_').toLowerCase()}`}>
                    <Globe className="h-5 w-5 text-primary" data-icod-id={`src_pages_advertisewithus_tsx_format_icon_${format.name.replace(/\s+/g, '_').toLowerCase()}`} />
                  </div>
                  <h3
                    className="text-xl font-semibold text-foreground font-heading"
                    data-icod-id={`src_pages_advertisewithus_tsx_format_name_${format.name.replace(/\s+/g, '_').toLowerCase()}`}>
                    {format.name}
                  </h3>
                </div>
                <p
                  className="text-muted-foreground mb-5 leading-relaxed"
                  data-icod-id={`src_pages_advertisewithus_tsx_format_desc_${format.name.replace(/\s+/g, '_').toLowerCase()}`}>
                  {format.description}
                </p>
                <ul className="space-y-2" data-icod-id={`src_pages_advertisewithus_tsx_format_specs_${format.name.replace(/\s+/g, '_').toLowerCase()}`}>
                  {format.specs.map((spec) => (
                    <li
                      key={spec}
                      className="flex items-center gap-2 text-sm text-foreground"
                      data-icod-id={`src_pages_advertisewithus_tsx_spec_${format.name.replace(/\s+/g, '_').toLowerCase()}_${spec.replace(/\s+/g, '_')}`}>
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" data-icod-id={`src_pages_advertisewithus_tsx_check_${spec.replace(/\s+/g, '_')}`} />
                      {spec}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Placement Map Section */}
      <section className="py-20 bg-background" data-icod-id="src_pages_advertisewithus_tsx_placement">
        <div className="container mx-auto px-4 max-w-7xl" data-icod-id="src_pages_advertisewithus_tsx_placement_container">
          <div className="text-center mb-10" data-icod-id="src_pages_advertisewithus_tsx_placement_header">
            <h2
              className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight font-heading"
              data-icod-id="src_pages_advertisewithus_tsx_placement_title">
              Where Your Ads Appear
            </h2>
            <p
              className="text-lg text-muted-foreground"
              data-icod-id="src_pages_advertisewithus_tsx_placement_subtitle">
              Your ad is displayed site-wide across all pages using our layout system.
            </p>
          </div>
          <PlacementMap data-icod-id="src_pages_advertisewithus_tsx_placement_map" />
        </div>
      </section>
      {/* CTA Section */}
      <section
        className="py-24 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(118, 98, 199, 0.1) 0%, rgba(41, 173, 164, 0.1) 100%)',
        }}
        data-icod-id="src_pages_advertisewithus_tsx_cta_section">
        <div className="container mx-auto px-4 text-center max-w-7xl" data-icod-id="src_pages_advertisewithus_tsx_cta_content">
          <h2
            className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight font-heading"
            data-icod-id="src_pages_advertisewithus_tsx_cta_title">
            Ready to Grow Your Brand?
          </h2>
          <p
            className="text-lg text-muted-foreground mb-10 leading-relaxed"
            data-icod-id="src_pages_advertisewithus_tsx_cta_description">
            Join businesses that are already reaching our engaged audience of e-commerce entrepreneurs.
            Simple setup, one-time payment, 30-day campaign.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4" data-icod-id="src_pages_advertisewithus_tsx_cta_buttons">
            <Link to="/advertisement" data-icod-id="src_pages_advertisewithus_tsx_final_cta_link">
              <Button
                variant="primary"
                size="lg"
                className={cn(
                  'px-8 py-4 text-lg shadow-[0_4px_20px_rgba(118,98,199,0.4)] hover:shadow-[0_6px_30px_rgba(118,98,199,0.6)]',
                  'transition-all duration-300 ease-out'
                )}
                data-icod-id="src_pages_advertisewithus_tsx_final_cta_btn">
                Create Your Ad Campaign
                <ArrowRight className="ml-2 h-5 w-5" data-icod-id="src_pages_advertisewithus_tsx_final_arrow" />
              </Button>
            </Link>
          </div>
          <p
            className="mt-6 text-sm text-muted-foreground"
            data-icod-id="src_pages_advertisewithus_tsx_cta_note">
            Already an advertiser?{' '}
            <Link
              to="/ad-dashboard"
              className="text-primary hover:text-primary-hover underline transition-colors"
              data-icod-id="src_pages_advertisewithus_tsx_dashboard_link">
              View your ad dashboard
            </Link>
          </p>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-20 bg-background" data-icod-id="src_pages_advertisewithus_tsx_faq_section">
        <div className="max-w-3xl mx-auto px-4" data-icod-id="src_pages_advertisewithus_tsx_faq_container">
          <h2
            className="text-2xl md:text-3xl font-bold text-foreground font-heading text-center mb-10"
            data-icod-id="src_pages_advertisewithus_tsx_faq_title">
            Frequently Asked Questions
          </h2>
          <FAQAccordion items={ADVERTISE_FAQ_ITEMS} data-icod-id="src_pages_advertisewithus_tsx_faq_accordion" />
        </div>
      </section>
    </>
  );
}
