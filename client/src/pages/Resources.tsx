import { useEffect, useState } from 'react';
import SEOHead from '@/components/SEOHead';
import ResourceCard from '@/components/ResourceCard';
import AdSenseSlot from '@/components/AdSenseSlot';
import type { ResourceType } from '@/components/ResourceCard';
import { buttonClass, Spinner, EmptyState, Card, Button } from '@/components/ui';
import { FileText, Download, ExternalLink, BookOpen, Palette, Megaphone, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resourceService, type Resource as ApiResource } from '@/services/resourceService';
import { SchemaInjector, PAGE_META } from '@/seo';

const resourcesMeta = PAGE_META['/resources'];

const MG_GUIDES = [
  {
    title: 'Free AI Tools Guide',
    description: 'Best free AI tools for productivity, content creation, and business automation',
    url: 'https://drive.google.com/file/d/1lUtcASlXnQUwieiOICzIlG0TNa--DAt8/view?usp=drivesdk',
    icon: BookOpen,
    accentColor: 'rgb(var(--primary))',
    glowColor: 'rgba(157, 106, 255, 0.15)',
  },
  {
    title: 'Canva Tips and Tutorials',
    description: 'Canva design tools, shortcuts, and mini tutorials',
    url: 'https://drive.google.com/file/d/1s4p30L4ldk67e8cZYKAjOivC2yyo_Tbk/view?usp=drivesdk',
    icon: Palette,
    accentColor: '#FF6EB4',
    glowColor: 'rgba(255, 110, 180, 0.15)',
  },
  {
    title: 'AI Marketing Guide',
    description: 'Market research, ad copy, and free email automation',
    url: 'https://drive.google.com/file/d/1X1alL1NTU2PX9b9MuNKncEs2_MCowODG/view?usp=drivesdk',
    icon: Megaphone,
    accentColor: 'rgb(var(--accent))',
    glowColor: 'rgba(0, 212, 245, 0.15)',
  },
  {
    title: 'Digital Safety Guide',
    description: 'Password manager, 2FA, and safe browsing',
    url: 'https://drive.google.com/file/d/1DNkABaawd_SqyzK3pOw2QsnMhtIHkQDc/view?usp=drivesdk',
    icon: ShieldCheck,
    accentColor: '#FFAA44',
    glowColor: 'rgba(255, 170, 68, 0.15)',
  },
] as const;

interface StaticResource {
  title: string;
  description: string;
  resourceType: ResourceType;
}

const staticResources: StaticResource[] = [
  {
    title: 'Seller SEO Checklist',
    description: 'Complete SEO audit checklist for eBay, Etsy, and Shopify sellers. Covers titles, tags, descriptions, images, and more.',
    resourceType: 'Checklist',
  },
  {
    title: 'eBay Listing Optimization Template',
    description: 'Fill-in-the-blank template for creating optimized eBay listings. Includes title formula, item specifics guide, and description structure.',
    resourceType: 'Template',
  },
  {
    title: 'Etsy Shop Setup Guide',
    description: 'Step-by-step checklist for setting up a successful Etsy shop. From account creation to first listing optimization.',
    resourceType: 'Guide',
  },
  {
    title: 'Product Photography Tips',
    description: 'Quick reference card with essential product photography tips. Lighting setup, background choices, angles, and editing basics.',
    resourceType: 'PDF',
  },
  {
    title: 'Keyword Research Worksheet',
    description: 'Structured worksheet for finding profitable seller keywords. Includes competitor analysis columns and search volume tracking.',
    resourceType: 'Worksheet',
  },
];

// Map API resource type to component type
function mapResourceType(type: string): ResourceType {
  const mapping: Record<string, ResourceType> = {
    guide: 'Guide',
    template: 'Template',
    checklist: 'Checklist',
    ebook: 'PDF',
    worksheet: 'Worksheet',
  };
  return mapping[type] || 'Guide';
}

export default function Resources() {
  const [apiResources, setApiResources] = useState<ApiResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResources() {
      try {
        const data = await resourceService.getAll();
        setApiResources(data);
      } catch (err) {
        console.error('[Resources] Failed to load:', err);
        // Fall back to static resources silently
      } finally {
        setLoading(false);
      }
    }
    loadResources();
  }, []);

  // Combine API resources with static resources if API is empty
  const displayResources = apiResources.length > 0 
    ? apiResources.map(r => ({
        title: r.title,
        description: r.description,
        resourceType: mapResourceType(r.type),
      }))
    : staticResources;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Free Seller Resources',
    description: 'Free downloadable resources for e-commerce sellers including checklists, templates, guides, and worksheets.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: displayResources.map((resource, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: resource.title,
        description: resource.description,
      })),
    },
  };

  return (
    <>
      <SEOHead
        title={resourcesMeta.title}
        description={resourcesMeta.description}
        keywords={resourcesMeta.keywords}
        canonicalUrl={resourcesMeta.canonical}
        structuredData={structuredData as unknown as Record<string, unknown>}
        data-icod-id="src_pages_resources_tsx_db99" />
      <SchemaInjector
        schemaType="page"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Resources', url: '/resources' },
        ]}
        data-icod-id="src_pages_resources_tsx_cf42" />
      {/* Hero Section */}
      <section
        className="py-16 md:py-24 bg-background"
        data-icod-id="src_pages_resources_tsx_3b21">
        <div
          className="container mx-auto px-4 text-center max-w-7xl"
          data-icod-id="src_pages_resources_tsx_16cd">
          <div
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6"
            data-icod-id="src_pages_resources_tsx_167f">
            <FileText className="h-4 w-4" data-icod-id="src_pages_resources_tsx_a8ee" />
            <span data-icod-id="src_pages_resources_tsx_6870">Free Downloads</span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-heading"
            data-icod-id="src_pages_resources_tsx_ab40">
            Free Seller Resources
          </h1>
          <p
            className="text-xl text-muted-foreground mb-8 leading-relaxed"
            data-icod-id="src_pages_resources_tsx_1d2a">
            Download our collection of free resources designed to help you optimize your listings, 
            improve your SEO, and grow your e-commerce business.
          </p>
        </div>
      </section>
      {/* Ad Banner after Hero */}
      <div
        className="container mx-auto px-4 py-6"
        data-icod-id="src_pages_resources_tsx_bb07">
        <AdSenseSlot format="banner" data-icod-id="src_pages_resources_tsx_94b0" />
      </div>
      {/* Resources Grid */}
      <section
        className="py-16"
        style={{ background: 'var(--section-lavender)' }}
        data-icod-id="src_pages_resources_tsx_e6d7">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_resources_tsx_7dfe">
          <h2
            className="text-3xl font-bold text-foreground mb-8 text-center font-heading"
            data-icod-id="src_pages_resources_tsx_915b">
            Available Resources
          </h2>

          {loading ? (
            <div
              className="flex justify-center py-16"
              data-icod-id="src_pages_resources_tsx_6b39">
              <Spinner size="lg" data-icod-id="src_pages_resources_tsx_719f" />
            </div>
          ) : displayResources.length === 0 ? (
            <EmptyState
              icon={Download}
              title="No resources available"
              description="Check back later for new downloadable resources."
              data-icod-id="src_pages_resources_tsx_fcac" />
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
              data-icod-id="src_pages_resources_tsx_0401">
              {displayResources.map((resource, index) => (
                <ResourceCard
                  key={index}
                  title={resource.title}
                  description={resource.description}
                  resourceType={resource.resourceType}
                  onDownload={() => {
                    // In production, this would trigger actual download
                    console.log(`Downloading: ${resource.title}`);
                  }}
                  data-icod-id={`src_pages_resources_tsx_307e_${index}`} />
              ))}
            </div>
          )}
        </div>
      </section>
      {/* MG Blessed Beginnings Resource Library */}
      <section
        className="py-16 md:py-24 bg-background relative overflow-hidden"
        data-icod-id="src_pages_resources_tsx_mg_guides_section">
        <div
          className="absolute -left-40 top-1/3 w-[400px] h-[400px] rounded-full opacity-[0.06] blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgb(var(--primary)) 0%, transparent 70%)' }}
          aria-hidden="true"
          data-icod-id="src_pages_resources_tsx_mg_glow_left" />
        <div
          className="container mx-auto px-4 relative z-10"
          data-icod-id="src_pages_resources_tsx_mg_container">
          <div
            className="text-center mb-12"
            data-icod-id="src_pages_resources_tsx_mg_header">
            <div
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 mb-5"
              data-icod-id="src_pages_resources_tsx_mg_badge">
              <BookOpen
                className="h-4 w-4 text-primary"
                data-icod-id="src_pages_resources_tsx_mg_badge_icon" />
              <span
                className="text-sm font-semibold text-primary tracking-wide uppercase"
                data-icod-id="src_pages_resources_tsx_mg_badge_label">
                Free Forever — No Sign-Up
              </span>
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-heading"
              data-icod-id="src_pages_resources_tsx_mg_title">
              MG Blessed Beginnings{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--primary)) 0%, #FF6EB4 50%, #FFAA44 100%)' }}
                data-icod-id="src_pages_resources_tsx_mg_gradient">
                Resource Library
              </span>
            </h2>
            <p
              className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed"
              data-icod-id="src_pages_resources_tsx_mg_subheading">
              Curated guides and resources to help you grow your business with AI, design, marketing, and digital safety.
            </p>
          </div>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
            data-icod-id="src_pages_resources_tsx_mg_grid">
            {MG_GUIDES.map((guide, index) => {
              const Icon = guide.icon;
              return (
                <Card
                  key={guide.title}
                  hoverLift
                  className="flex flex-col p-6 gap-4 border-border/80"
                  data-icod-id={`src_pages_resources_tsx_mg_card_${index}`}>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: guide.glowColor }}
                    data-icod-id={`src_pages_resources_tsx_mg_icon_bg_${index}`}>
                    <Icon
                      className="h-6 w-6"
                      style={{ color: guide.accentColor }}
                      data-icod-id={`src_pages_resources_tsx_mg_card_icon_${index}`} />
                  </div>
                  <h3
                    className="text-lg font-bold text-foreground font-heading"
                    data-icod-id={`src_pages_resources_tsx_mg_card_title_${index}`}>
                    {guide.title}
                  </h3>
                  <p
                    className="text-sm text-muted-foreground leading-relaxed flex-1"
                    data-icod-id={`src_pages_resources_tsx_mg_card_desc_${index}`}>
                    {guide.description}
                  </p>
                  <a
                    href={guide.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto"
                    data-icod-id={`src_pages_resources_tsx_mg_link_${index}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      data-icod-id={`src_pages_resources_tsx_mg_btn_${index}`}>
                      View / Download
                      <ExternalLink
                        className="h-3.5 w-3.5 ml-1.5"
                        data-icod-id={`src_pages_resources_tsx_mg_ext_icon_${index}`} />
                    </Button>
                  </a>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section
        className="py-16 bg-background"
        data-icod-id="src_pages_resources_tsx_f38f">
        <div
          className="container mx-auto px-4 text-center max-w-7xl"
          data-icod-id="src_pages_resources_tsx_dd77">
          <h2
            className="text-3xl font-bold text-foreground mb-6 font-heading"
            data-icod-id="src_pages_resources_tsx_1242">
            Need Custom Resources?
          </h2>
          <p
            className="text-lg text-muted-foreground mb-8"
            data-icod-id="src_pages_resources_tsx_63b4">
            We create custom templates, guides, and training materials tailored to your specific 
            business needs and industry.
          </p>
          <Link
            to="/contact"
            className={buttonClass({ size: 'lg' })}
            data-icod-id="src_pages_resources_tsx_7348">
            Request Custom Resource
          </Link>
        </div>
      </section>
    </>
  );
}
