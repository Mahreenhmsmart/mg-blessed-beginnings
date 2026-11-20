import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { ArrowRight, Home, Wrench, BookOpen, Sparkles, GraduationCap, MessageSquare, Shield } from 'lucide-react';
import { SchemaInjector, PAGE_META } from '@/seo';

const htmlSitemapMeta = PAGE_META['/sitemap'];

const SITEMAP_SECTIONS = [
  {
    title: 'Main Pages',
    icon: Home,
    links: [
      { label: 'Home', to: '/' },
      { label: 'About Us', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Portfolio', to: '/portfolio' },
      { label: 'Sitemap', to: '/sitemap' },
    ],
  },
  {
    title: 'Services',
    icon: Wrench,
    links: [
      { label: 'All Services', to: '/services' },
      { label: 'Book Consultation', to: '/book-consultation' },
      { label: 'Website Audit', to: '/website-audit' },
    ],
  },
  {
    title: 'AI Tools',
    icon: Sparkles,
    links: [
      { label: 'All AI Tools', to: '/ai-tools' },
      { label: 'Product Description Generator', to: '/tools/product-description-generator' },
      { label: 'SEO Title Optimizer', to: '/tools/seo-title-optimizer' },
      { label: 'Hashtag Generator', to: '/tools/hashtag-generator' },
      { label: 'Competitor Analyzer', to: '/tools/competitor-analyzer' },
      { label: 'Review Response Writer', to: '/tools/review-response-writer' },
      { label: 'Blog Post Generator', to: '/tools/blog-post-generator' },
      { label: 'Meta Description Generator', to: '/tools/meta-description-generator' },
      { label: 'Email Subject Line Generator', to: '/tools/email-subject-line-generator' },
      { label: 'Prompt Library', to: '/prompt-library' },
      { label: 'Video Generator', to: '/video-generator' },
    ],
  },
  {
    title: 'Blog & Resources',
    icon: BookOpen,
    links: [
      { label: 'Blog', to: '/blog' },
      { label: 'Resources', to: '/resources' },
      { label: 'Courses', to: '/courses' },
    ],
  },
  {
    title: 'Legal',
    icon: Shield,
    links: [
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms of Service', to: '/terms-of-service' },
      { label: 'Cookie Policy', to: '/cookie-policy' },
    ],
  },
];

export default function HtmlSitemap() {
  return (
    <>
      <SEOHead
        title={htmlSitemapMeta.title}
        description={htmlSitemapMeta.description}
        keywords={htmlSitemapMeta.keywords}
        canonicalUrl={htmlSitemapMeta.canonical}
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Sitemap', url: '/sitemap' }]}
        data-icod-id="src_pages_htmlsitemap_tsx_dcc7" />
      <SchemaInjector
        schemaType="page"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Sitemap', url: '/sitemap' },
        ]}
        data-icod-id="src_pages_htmlsitemap_tsx_5c52" />
      <section
        className="py-16 bg-background"
        data-icod-id="src_pages_htmlsitemap_tsx_6707">
        <div
          className="container mx-auto px-4 max-w-5xl"
          data-icod-id="src_pages_htmlsitemap_tsx_261a">
          <header
            className="text-center mb-12"
            data-icod-id="src_pages_htmlsitemap_tsx_f4e2">
            <h1
              className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4"
              data-icod-id="src_pages_htmlsitemap_tsx_f68d">
              Site Map
            </h1>
            <p
              className="text-muted-foreground max-w-lg mx-auto"
              data-icod-id="src_pages_htmlsitemap_tsx_afc9">
              Browse all pages on MG Blessed Beginnings. Find everything you need to grow your online business.
            </p>
          </header>

          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            data-icod-id="src_pages_htmlsitemap_tsx_c974">
            {SITEMAP_SECTIONS.map((section) => (
              <div
                key={section.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                data-icod-id={`src_pages_htmlsitemap_tsx_84a4_${section.title}`}>
                <div
                  className="flex items-center gap-3 mb-4"
                  data-icod-id={`src_pages_htmlsitemap_tsx_6d5c_${section.title}`}>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"
                    data-icod-id={`src_pages_htmlsitemap_tsx_a0cf_${section.title}`}>
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2
                    className="font-heading text-lg font-semibold text-foreground"
                    data-icod-id={`src_pages_htmlsitemap_tsx_436c_${section.title}`}>
                    {section.title}
                  </h2>
                </div>
                <ul
                  className="space-y-2"
                  data-icod-id={`src_pages_htmlsitemap_tsx_5d15_${section.title}`}>
                  {section.links.map((link) => (
                    <li
                      key={link.to}
                      data-icod-id={`src_pages_htmlsitemap_tsx_4b9b_${section.title}_${link.to}`}>
                      <Link
                        to={link.to}
                        className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                        data-icod-id={`src_pages_htmlsitemap_tsx_dd4c_${section.title}_${link.to}`}>
                        <ArrowRight
                          className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
                          data-icod-id={`src_pages_htmlsitemap_tsx_b7d4_${section.title}_${link.to}`} />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Additional note */}
          <div
            className="mt-12 text-center"
            data-icod-id="src_pages_htmlsitemap_tsx_9273">
            <p
              className="text-sm text-muted-foreground"
              data-icod-id="src_pages_htmlsitemap_tsx_8ee5">
              Can't find what you're looking for?{' '}
              <Link
                to="/contact"
                className="text-primary hover:underline font-medium"
                data-icod-id="src_pages_htmlsitemap_tsx_13bb">
                Contact us
              </Link>{' '}
              and we'll help you out.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
