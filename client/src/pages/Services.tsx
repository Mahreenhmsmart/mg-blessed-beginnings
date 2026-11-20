import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchServices } from '@/store/slices/servicesSlice';
import { Spinner, Button, Skeleton } from '@/components/ui';
import SEOHead from '@/components/SEOHead';
import ServiceCard from '@/components/ServiceCard';
import FAQAccordion from '@/components/FAQAccordion';
import AdSenseSlot from '@/components/AdSenseSlot';
import LocalPaymentMethods from '@/components/LocalPaymentMethods';
import type { Service } from '@/types';
import { MessageCircle } from 'lucide-react';
import type { FAQItem } from '@/components/FAQAccordion';
import { SchemaInjector, PAGE_META } from '@/seo';

const servicesMeta = PAGE_META['/services'];

const coreExpertiseServices: Service[] = [
  {
    _id: 'core-shopify',
    title: 'Shopify Store Setup & Optimization',
    slug: 'shopify-setup',
    description: 'End-to-end store creation, premium theme customization, and conversion rate optimization.',
    features: [],
    price: '',
    duration: '',
    icon: 'ShoppingBag',
    order: 1,
  },
  {
    _id: 'core-ebay',
    title: 'eBay Listing Optimization',
    slug: 'ebay-listing',
    description: 'Professional listing creation, keyword research, and SEO to boost search visibility.',
    features: [],
    price: '',
    duration: '',
    icon: 'Tag',
    order: 2,
  },
  {
    _id: 'core-etsy',
    title: 'Etsy Shop Management',
    slug: 'etsy-management',
    description: 'Complete store management, product research, and strategic marketing for creative brands.',
    features: [],
    price: '',
    duration: '',
    icon: 'Palette',
    order: 3,
  },
  {
    _id: 'core-marketing',
    title: 'Digital Marketing & SEO',
    slug: 'digital-marketing',
    description: 'Data-driven paid ads, social media marketing, and SEO content strategies designed to improve visibility and growth.',
    features: [],
    price: '',
    duration: '',
    icon: 'Share2',
    order: 4,
  },
];

const SERVICES_FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What e-commerce platforms do you work with?',
    answer: 'We specialize in Shopify, eBay, and Etsy. Our team has deep expertise in store setup, listing optimization, and growth strategies across all three platforms.',
  },
  {
    question: 'How long does a typical Shopify store setup take?',
    answer: 'A complete Shopify store setup typically takes 5-10 business days depending on the complexity of your product catalog and customization requirements.',
  },
  {
    question: 'Do you offer ongoing support after project completion?',
    answer: 'Yes, we provide post-launch support for all our clients. You can reach us via email or WhatsApp for questions about your store or marketing strategy.',
  },
  {
    question: 'Can you help optimize my existing eBay listings?',
    answer: 'Absolutely. We analyze your current listings, identify keyword gaps, rewrite titles and descriptions for SEO, and optimize images to improve search visibility and conversion rates.',
  },
  {
    question: 'What is included in your digital marketing services?',
    answer: 'Our digital marketing services include SEO content strategy, social media marketing, paid advertising campaigns, competitor analysis, and data-driven performance reporting.',
  },
];

const servicesStructuredData = [
  {
    '@type': 'Service',
    name: 'MG Blessed Beginnings Services',
    description: 'Professional e-commerce consulting services including Shopify store setup, eBay listing optimization, Etsy shop management, social media marketing, and SEO.',
    provider: {
      '@type': 'Organization',
      name: 'MG Blessed Beginnings',
      url: 'https://mgblessed.icod.ai',
    },
    serviceType: 'E-Commerce Consulting',
    areaServed: 'Worldwide',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'E-Commerce Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Shopify Store Setup & Optimization' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'eBay Listing Optimization' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Etsy Shop Management' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Digital Marketing & SEO' } },
      ],
    },
  },
  {
    '@type': 'FAQPage',
    mainEntity: SERVICES_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  },
];

export default function Services() {
  const dispatch = useAppDispatch();
  const { items: services, status } = useAppSelector((state) => state.services);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchServices());
    }
  }, [dispatch, status]);

  return (
    <>
      <SEOHead
        title={servicesMeta.title}
        description={servicesMeta.description}
        keywords={servicesMeta.keywords}
        canonicalUrl={servicesMeta.canonical}
        structuredData={servicesStructuredData}
        data-icod-id="src_pages_services_tsx_534e" />
      <SchemaInjector
        schemaType="page"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Services', url: '/services' },
        ]}
        data-icod-id="src_pages_services_tsx_2b8b" />
      {/* Hero */}
      <section
        className="py-24"
        style={{ background: 'var(--section-lavender)' }}
        data-icod-id="src_pages_services_tsx_d07e">
        <div
          className="container mx-auto px-4 text-center"
          data-icod-id="src_pages_services_tsx_5066">
          <h1
            className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight"
            data-icod-id="src_pages_services_tsx_96b0">How I Can Help</h1>
          <p
            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            data-icod-id="src_pages_services_tsx_bdd5">
            E-commerce solutions tailored to your business needs. From store setup to ongoing optimization, I'm here to guide you at every stage.
          </p>
        </div>
      </section>
      {/* Ad Banner after Hero */}
      <div
        className="container mx-auto px-4 py-6"
        data-icod-id="src_pages_services_tsx_4c6e">
        <AdSenseSlot format="banner" data-icod-id="src_pages_services_tsx_c29d" />
      </div>
      {/* Our Core Expertise */}
      <section className="py-24 bg-background" data-icod-id="src_pages_services_tsx_44d0">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_services_tsx_b625">
          <div className="text-center mb-14" data-icod-id="src_pages_services_tsx_53b1">
            <h2
              className="text-3xl font-bold text-foreground mb-4 tracking-tight"
              data-icod-id="src_pages_services_tsx_6265">Our Core Expertise</h2>
            <p
              className="text-lg text-muted-foreground leading-relaxed"
              data-icod-id="src_pages_services_tsx_8f52">Specialized solutions across every major e-commerce platform</p>
          </div>
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto"
            data-icod-id="src_pages_services_tsx_942f">
            {coreExpertiseServices.map((service, idx) => (
              <ServiceCard
                key={service._id}
                service={service}
                compact
                className={
                  idx === 0 ? 'border-l-4 border-l-primary' :
                  idx === 1 ? 'border-l-4 border-l-cyan' :
                  idx === 2 ? 'border-l-4 border-l-accent' :
                  'border-l-4 border-l-warning'
                }
                data-icod-id={`src_pages_services_tsx_be0d_${service._id}`} />
            ))}
          </div>

          {/* WhatsApp CTA */}
          <div className="text-center mt-12" data-icod-id="src_pages_services_tsx_wa_cta">
            <a
              href="https://wa.me/923358380233"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#25D366] font-medium hover:underline underline-offset-4 transition-all"
              data-icod-id="src_pages_services_tsx_wa_link">
              <MessageCircle className="h-4 w-4" data-icod-id="src_pages_services_tsx_f615" />
              Discuss your needs on WhatsApp
            </a>
          </div>
        </div>
      </section>
      {/* Services Grid */}
      <section
        className="py-24"
        style={{ background: 'var(--section-blush)' }}
        data-icod-id="src_pages_services_tsx_326d">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_services_tsx_7f94">
          {status === 'loading' ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              data-icod-id="src_pages_services_tsx_skeleton_grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-[20px] border border-border bg-card p-6 space-y-4"
                  data-icod-id={`src_pages_services_tsx_skel_${i}`}>
                  <Skeleton variant="circle" className="h-12 w-12 mb-4" data-icod-id={`src_pages_services_tsx_skel_icon_${i}`} />
                  <Skeleton variant="text" className="h-6 w-3/4" data-icod-id={`src_pages_services_tsx_skel_title_${i}`} />
                  <Skeleton variant="text" className="h-4 w-full" data-icod-id={`src_pages_services_tsx_skel_desc1_${i}`} />
                  <Skeleton variant="text" className="h-4 w-5/6" data-icod-id={`src_pages_services_tsx_skel_desc2_${i}`} />
                  <div className="pt-4 space-y-2" data-icod-id={`src_pages_services_tsx_skel_features_${i}`}>
                    <Skeleton variant="text" className="h-3 w-2/3" data-icod-id={`src_pages_services_tsx_skel_feat1_${i}`} />
                    <Skeleton variant="text" className="h-3 w-1/2" data-icod-id={`src_pages_services_tsx_skel_feat2_${i}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              data-icod-id="src_pages_services_tsx_d328">
              {services.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  data-icod-id={`src_pages_services_tsx_4a93_${service._id}`} />
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Local Payment Methods */}
      <LocalPaymentMethods data-icod-id="src_pages_services_tsx_payment_methods" />
      {/* Process Section */}
      <section className="py-24" style={{ background: 'var(--section-aqua)' }} data-icod-id="src_pages_services_tsx_d719">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_services_tsx_9652">
          <div className="text-center mb-14" data-icod-id="src_pages_services_tsx_289a">
            <h2
              className="text-3xl font-bold text-foreground mb-4 tracking-tight"
              data-icod-id="src_pages_services_tsx_c3c0">How It Works</h2>
            <p
              className="text-lg text-muted-foreground leading-relaxed"
              data-icod-id="src_pages_services_tsx_9db5">Simple steps to get started</p>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto"
            data-icod-id="src_pages_services_tsx_5a26">
            {[
              { step: '1', title: 'Book Consultation', desc: 'Schedule a free consultation call' },
              { step: '2', title: 'Strategy Session', desc: 'I analyze your needs and goals' },
              { step: '3', title: 'Implementation', desc: 'Execute the strategy together' },
              { step: '4', title: 'Growth', desc: 'Build and scale your business' },
            ].map((item) => (
              <div
                key={item.step}
                className="text-center group"
                data-icod-id={`src_pages_services_tsx_d5cd_${item.step}`}>
                <div
                  className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-sm transition-transform duration-[250ms] group-hover:scale-105"
                  style={{ background: 'var(--gradient-primary)' }}
                  data-icod-id={`src_pages_services_tsx_a9a1_${item.step}`}>
                  {item.step}
                </div>
                <h3
                  className="font-semibold text-foreground mb-2 leading-tight"
                  data-icod-id={`src_pages_services_tsx_b069_${item.step}`}>{item.title}</h3>
                <p
                  className="text-sm text-muted-foreground leading-relaxed"
                  data-icod-id={`src_pages_services_tsx_be0a_${item.step}`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-20 bg-background" data-icod-id="src_pages_services_tsx_faq_section">
        <div className="max-w-3xl mx-auto px-4" data-icod-id="src_pages_services_tsx_faq_container">
          <h2
            className="text-2xl md:text-3xl font-bold text-foreground font-heading text-center mb-10"
            data-icod-id="src_pages_services_tsx_faq_title">
            Frequently Asked Questions
          </h2>
          <FAQAccordion items={SERVICES_FAQ_ITEMS} data-icod-id="src_pages_services_tsx_faq_accordion" />
        </div>
      </section>
      {/* Sidebar Ad (xl screens only) */}
      <div
        className="hidden xl:block fixed right-6 top-1/2 -translate-y-1/2 w-44 z-30"
        data-icod-id="src_pages_services_tsx_b95c">
        <AdSenseSlot format="sidebar" data-icod-id="src_pages_services_tsx_196b" />
      </div>
    </>
  );
}
