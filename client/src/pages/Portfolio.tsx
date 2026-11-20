import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import AdSenseSlot from '@/components/AdSenseSlot';
import { Card, Button } from '@/components/ui';
import { ShoppingBag, TrendingUp, Store, Megaphone, ArrowRight, BarChart3, Users, Globe } from 'lucide-react';
import { SchemaInjector, PAGE_META } from '@/seo';
import { getPortfolioContent } from '@/services/pageContentService';

const portfolioMeta = PAGE_META['/portfolio'];

interface CaseStudy {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: typeof ShoppingBag;
  metrics: string[];
}

// Icon map for case studies — maps index position to icon
const CASE_STUDY_ICONS = [ShoppingBag, TrendingUp, Store, Megaphone];

export default function Portfolio() {
  const content = getPortfolioContent();

  // Build case studies from editable content, preserving icon mapping by index
  const caseStudies: CaseStudy[] = content.caseStudies.map((cs, idx) => ({
    id: cs.id,
    title: cs.title,
    category: cs.category,
    description: cs.description,
    icon: CASE_STUDY_ICONS[idx % CASE_STUDY_ICONS.length],
    metrics: cs.metrics,
  }));

  return (
    <>
      <SEOHead
        title={portfolioMeta.title}
        description={portfolioMeta.description}
        keywords={portfolioMeta.keywords}
        canonicalUrl={portfolioMeta.canonical}
        data-icod-id="src_pages_portfolio_tsx_seo" />
      <SchemaInjector
        schemaType="page"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Portfolio', url: '/portfolio' },
        ]}
        data-icod-id="src_pages_portfolio_tsx_94fd" />
      {/* Hero Section */}
      <section
        className="py-24"
        style={{ background: 'var(--section-lavender)' }}
        data-icod-id="src_pages_portfolio_tsx_hero">
        <div className="container mx-auto px-4 text-center" data-icod-id="src_pages_portfolio_tsx_hero_container">
          <h1
            className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight"
            data-icod-id="src_pages_portfolio_tsx_hero_title">
            {content.heroTitle}
          </h1>
          <p
            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            data-icod-id="src_pages_portfolio_tsx_hero_desc">
            {content.heroDescription}
          </p>
        </div>
      </section>
      {/* Ad Banner after Hero */}
      <div
        className="container mx-auto px-4 py-6"
        data-icod-id="src_pages_portfolio_tsx_afb9">
        <AdSenseSlot format="banner" data-icod-id="src_pages_portfolio_tsx_858c" />
      </div>
      {/* Stats Overview */}
      <section className="py-16 bg-background border-b border-border/40" data-icod-id="src_pages_portfolio_tsx_stats">
        <div className="container mx-auto px-4" data-icod-id="src_pages_portfolio_tsx_stats_container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8" data-icod-id="src_pages_portfolio_tsx_stats_grid">
            {[
              { icon: Store, value: 'Multiple', label: 'Stores Launched' },
              { icon: Users, value: 'Growing', label: 'Client Base' },
              { icon: BarChart3, value: 'Focused', label: 'Results-Driven' },
              { icon: Globe, value: 'Global', label: 'Reach' },
            ].map((stat) => (
              <div key={stat.label} className="text-center" data-icod-id={`src_pages_portfolio_tsx_stat_${stat.label}`}>
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3"
                  data-icod-id={`src_pages_portfolio_tsx_stat_icon_${stat.label}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div
                  className="text-3xl font-bold text-foreground mb-1"
                  data-icod-id={`src_pages_portfolio_tsx_stat_value_${stat.label}`}>{stat.value}</div>
                <div
                  className="text-sm text-muted-foreground"
                  data-icod-id={`src_pages_portfolio_tsx_stat_label_${stat.label}`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Case Studies Grid */}
      <section className="py-24" style={{ background: 'var(--section-blush)' }} data-icod-id="src_pages_portfolio_tsx_cases">
        <div className="container mx-auto px-4" data-icod-id="src_pages_portfolio_tsx_cases_container">
          <h2
            className="text-3xl font-bold text-foreground mb-12 text-center"
            data-icod-id="src_pages_portfolio_tsx_cases_title">
            {content.casesTitle}
          </h2>
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            data-icod-id="src_pages_portfolio_tsx_cases_grid">
            {caseStudies.map((study) => (
              <Card
                key={study.id}
                className="p-6 md:p-8 rounded-2xl border border-border/40 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-md)] transition-shadow duration-300"
                data-icod-id={`src_pages_portfolio_tsx_case_${study.id}`}>
                <div className="flex items-start gap-4 mb-4" data-icod-id={`src_pages_portfolio_tsx_case_header_${study.id}`}>
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
                    data-icod-id={`src_pages_portfolio_tsx_case_icon_${study.id}`}>
                    <study.icon className="h-6 w-6" />
                  </div>
                  <div data-icod-id={`src_pages_portfolio_tsx_case_info_${study.id}`}>
                    <span
                      className="inline-block text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full mb-2"
                      data-icod-id={`src_pages_portfolio_tsx_case_cat_${study.id}`}>
                      {study.category}
                    </span>
                    <h3
                      className="text-xl font-semibold text-foreground"
                      data-icod-id={`src_pages_portfolio_tsx_case_title_${study.id}`}>
                      {study.title}
                    </h3>
                  </div>
                </div>
                <p
                  className="text-muted-foreground leading-relaxed mb-6"
                  data-icod-id={`src_pages_portfolio_tsx_case_desc_${study.id}`}>
                  {study.description}
                </p>
                <div className="space-y-2 mb-6" data-icod-id={`src_pages_portfolio_tsx_case_metrics_${study.id}`}>
                  {study.metrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm text-foreground"
                      data-icod-id={`src_pages_portfolio_tsx_metric_${study.id}_${idx}`}>
                      <div
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                        data-icod-id={`src_pages_portfolio_tsx_a23b_${study.id}_${idx}`} />
                      <span data-icod-id={`src_pages_portfolio_tsx_1461_${study.id}_${idx}`}>{metric}</span>
                    </div>
                  ))}
                </div>
                <div
                  className="pt-4 border-t border-border/40 flex items-center justify-between"
                  data-icod-id={`src_pages_portfolio_tsx_case_footer_${study.id}`}>
                  <span
                    className="text-sm text-muted-foreground italic"
                    data-icod-id={`src_pages_portfolio_tsx_case_soon_${study.id}`}>
                    Detailed results coming soon
                  </span>
                  <Link
                    to="/contact"
                    className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
                    data-icod-id={`src_pages_portfolio_tsx_case_link_${study.id}`}>
                    Learn More <ArrowRight
                    className="h-3 w-3"
                    data-icod-id={`src_pages_portfolio_tsx_2974_${study.id}`} />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-24 bg-background" data-icod-id="src_pages_portfolio_tsx_cta">
        <div className="container mx-auto px-4" data-icod-id="src_pages_portfolio_tsx_cta_container">
          <div
            className="max-w-3xl mx-auto text-center p-8 md:p-12 rounded-3xl border border-primary/20 bg-primary/5"
            data-icod-id="src_pages_portfolio_tsx_cta_card">
            <h2
              className="text-3xl font-bold text-foreground mb-4"
              data-icod-id="src_pages_portfolio_tsx_cta_title">
              {content.ctaTitle}
            </h2>
            <p
              className="text-lg text-muted-foreground mb-8 leading-relaxed"
              data-icod-id="src_pages_portfolio_tsx_cta_desc">
              {content.ctaDescription}
            </p>
            <Link to="/book-consultation" data-icod-id="src_pages_portfolio_tsx_cta_link">
              <Button variant="primary" size="lg" data-icod-id="src_pages_portfolio_tsx_cta_btn">
                Book a Free Consultation
                <ArrowRight className="h-4 w-4 ml-2" data-icod-id="src_pages_portfolio_tsx_09de" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
