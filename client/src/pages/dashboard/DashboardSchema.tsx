import { useState, useEffect } from 'react';
import { Code2, CheckCircle2, AlertCircle, XCircle, Wand2, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { Button, Badge, Spinner, Card } from '@/components/ui';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EmptyStatePanel from '@/components/dashboard/EmptyStatePanel';
import ScoreCard from '@/components/dashboard/ScoreCard';
import type { CheckResult } from '@/types';

function SchemaStatusBadge({ status }: { status: string }) {
  if (status === 'pass') return (
    <Badge
      variant="new"
      className="text-[10px]"
      data-icod-id="src_pages_dashboard_dashboardschema_tsx_74a4">Found</Badge>
  );
  if (status === 'warn') return (
    <Badge
      variant="default"
      className="text-[10px]"
      data-icod-id="src_pages_dashboard_dashboardschema_tsx_85d8">Invalid</Badge>
  );
  return (
    <Badge
      variant="free"
      className="text-[10px]"
      data-icod-id="src_pages_dashboard_dashboardschema_tsx_f56e">Missing</Badge>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'pass') return (
    <CheckCircle2
      className="h-4 w-4 text-success"
      data-icod-id="src_pages_dashboard_dashboardschema_tsx_119c" />
  );
  if (status === 'warn') return (
    <AlertCircle
      className="h-4 w-4 text-warning"
      data-icod-id="src_pages_dashboard_dashboardschema_tsx_a4fc" />
  );
  return (
    <XCircle
      className="h-4 w-4 text-accent"
      data-icod-id="src_pages_dashboard_dashboardschema_tsx_c399" />
  );
}

export default function DashboardSchema() {
  const { currentProjectId } = useAppSelector((s) => s.projects);
  const { audits, fetchStatus } = useAppSelector((s) => s.audits);

  const latestAudit = audits.find((a) => a.status === 'completed') || null;
  const schemaResults = latestAudit?.results?.schema;
  const schemaScore = latestAudit?.scores?.schema ?? 0;

  if (!currentProjectId) {
    return (
      <div
        className="flex flex-col gap-8"
        data-icod-id="src_pages_dashboard_dashboardschema_tsx_cdc1">
        <div data-icod-id="src_pages_dashboard_dashboardschema_tsx_2b40">
          <h1
            className="font-heading text-2xl font-bold text-foreground sm:text-3xl tracking-tight"
            data-icod-id="src_pages_dashboard_dashboardschema_tsx_7b70">
            Schema / Structured Data
          </h1>
          <p
            className="mt-2 text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardschema_tsx_6bf2">
            Detect and validate JSON-LD structured data on your pages.
          </p>
        </div>
        <EmptyStatePanel
          icon={Code2}
          title="No project selected"
          description="Select a project from the sidebar to view structured data analysis."
          data-icod-id="src_pages_dashboard_dashboardschema_tsx_307e" />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-8"
      data-icod-id="src_pages_dashboard_dashboardschema_tsx_7dd1">
      <div data-icod-id="src_pages_dashboard_dashboardschema_tsx_dcd8">
        <div
          className="flex items-center gap-3"
          data-icod-id="src_pages_dashboard_dashboardschema_tsx_8411">
          <Code2
            className="h-7 w-7 text-primary"
            data-icod-id="src_pages_dashboard_dashboardschema_tsx_0c72" />
          <h1
            className="font-heading text-2xl font-bold text-foreground sm:text-3xl tracking-tight"
            data-icod-id="src_pages_dashboard_dashboardschema_tsx_0f96">
            Schema / Structured Data
          </h1>
        </div>
        <p
          className="mt-2 text-sm text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardschema_tsx_629f">
          JSON-LD detection and validation for Organization, WebSite, Breadcrumb, Article, Product, FAQ, LocalBusiness, Person, and Service schemas.
        </p>
      </div>
      {fetchStatus === 'loading' ? (
        <div
          className="flex justify-center py-12"
          data-icod-id="src_pages_dashboard_dashboardschema_tsx_1088">
          <Spinner size="lg" data-icod-id="src_pages_dashboard_dashboardschema_tsx_70af" />
        </div>
      ) : !latestAudit ? (
        <EmptyStatePanel
          icon={Code2}
          title="No audit data available"
          description="Run an audit from the Overview page to see structured data results."
          data-icod-id="src_pages_dashboard_dashboardschema_tsx_58c6" />
      ) : (
        <>
          {/* Score + Generate button */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            data-icod-id="src_pages_dashboard_dashboardschema_tsx_2da5">
            <ScoreCard
              title="Schema Score"
              score={schemaScore}
              maxScore={100}
              color="var(--color-purple)"
              label="Structured Data"
              data-icod-id="src_pages_dashboard_dashboardschema_tsx_bc53" />
            <div
              className="sm:col-span-2 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] flex flex-col justify-between"
              data-icod-id="src_pages_dashboard_dashboardschema_tsx_8940">
              <div data-icod-id="src_pages_dashboard_dashboardschema_tsx_14e4">
                <h3
                  className="font-heading text-sm font-semibold text-foreground mb-2"
                  data-icod-id="src_pages_dashboard_dashboardschema_tsx_fb28">
                  Schema Summary
                </h3>
                <p
                  className="text-sm text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardschema_tsx_8f45">
                  {schemaResults?.checks.filter((c: CheckResult) => c.status === 'pass').length ?? 0} of {schemaResults?.checks.length ?? 0} schema types detected and valid.
                  {' '}JSON-LD is the recommended format for all structured data.
                </p>
              </div>
              <div
                className="mt-4 pt-4 border-t border-border/40"
                data-icod-id="src_pages_dashboard_dashboardschema_tsx_15dd">
                <Button
                  variant="primary"
                  size="sm"
                  data-icod-id="src_pages_dashboard_dashboardschema_tsx_1195">
                  <Wand2
                    className="mr-2 h-4 w-4"
                    data-icod-id="src_pages_dashboard_dashboardschema_tsx_36ff" />
                  Generate Schema
                </Button>
              </div>
            </div>
          </div>

          {/* Schema Detection Grid */}
          <DashboardCard
            heading="Schema Detection"
            icon={<Code2
              className="h-5 w-5"
              data-icod-id="src_pages_dashboard_dashboardschema_tsx_4046" />}
            data-icod-id="src_pages_dashboard_dashboardschema_tsx_a609">
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
              data-icod-id="src_pages_dashboard_dashboardschema_tsx_e3ee">
              {schemaResults?.checks.map((check: CheckResult) => (
                <div
                  key={check.id}
                  className="flex flex-col gap-2 rounded-lg border border-border/30 bg-card p-4"
                  data-icod-id="src_pages_dashboard_dashboardschema_tsx_8696">
                  <div
                    className="flex items-center justify-between"
                    data-icod-id="src_pages_dashboard_dashboardschema_tsx_0616">
                    <div
                      className="flex items-center gap-2"
                      data-icod-id="src_pages_dashboard_dashboardschema_tsx_e9f9">
                      <StatusIcon
                        status={check.status}
                        data-icod-id="src_pages_dashboard_dashboardschema_tsx_3d4f" />
                      <span
                        className="text-sm font-medium text-foreground"
                        data-icod-id="src_pages_dashboard_dashboardschema_tsx_7600">{check.name}</span>
                    </div>
                    <SchemaStatusBadge
                      status={check.status}
                      data-icod-id="src_pages_dashboard_dashboardschema_tsx_2b0a" />
                  </div>
                  <p
                    className="text-xs text-muted-foreground leading-relaxed"
                    data-icod-id="src_pages_dashboard_dashboardschema_tsx_eadc">{check.details}</p>
                </div>
              ))}
            </div>
            {(!schemaResults || schemaResults.checks.length === 0) && (
              <p
                className="text-sm text-muted-foreground py-4"
                data-icod-id="src_pages_dashboard_dashboardschema_tsx_4b49">No schema checks available.</p>
            )}
          </DashboardCard>

          {/* Schema Markup Generator */}
          <SchemaGeneratorSection data-icod-id="src_pages_dashboard_dashboardschema_tsx_b44b" />
        </>
      )}
    </div>
  );
}

// ─── Schema Generator Section ──────────────────────────────────────────────────

const SCHEMA_TEMPLATES = [
  {
    name: 'Organization',
    template: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Your Business Name',
      url: 'https://yourwebsite.com',
      logo: 'https://yourwebsite.com/logo.png',
      description: 'Brief description of your business.',
      sameAs: ['https://facebook.com/yourpage', 'https://twitter.com/yourhandle'],
      contactPoint: { '@type': 'ContactPoint', telephone: '+1-xxx-xxx-xxxx', contactType: 'customer service' },
    },
  },
  {
    name: 'WebSite',
    template: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Your Website Name',
      url: 'https://yourwebsite.com',
      potentialAction: { '@type': 'SearchAction', target: 'https://yourwebsite.com/search?q={search_term_string}', 'query-input': 'required name=search_term_string' },
    },
  },
  {
    name: 'Article',
    template: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Article Title',
      author: { '@type': 'Person', name: 'Author Name' },
      publisher: { '@type': 'Organization', name: 'Publisher Name', logo: { '@type': 'ImageObject', url: 'https://yourwebsite.com/logo.png' } },
      datePublished: '2026-01-01',
      dateModified: '2026-01-01',
      description: 'Article description.',
    },
  },
  {
    name: 'Product',
    template: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Product Name',
      description: 'Product description.',
      image: 'https://yourwebsite.com/product.jpg',
      brand: { '@type': 'Brand', name: 'Brand Name' },
      offers: { '@type': 'Offer', price: '29.99', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
    },
  },
  {
    name: 'Service',
    template: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Service Name',
      description: 'Service description.',
      provider: { '@type': 'Organization', name: 'Business Name' },
      areaServed: 'Worldwide',
      serviceType: 'Consulting',
    },
  },
  {
    name: 'FAQ',
    template: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is your service?', acceptedAnswer: { '@type': 'Answer', text: 'Answer to the question.' } },
        { '@type': 'Question', name: 'How does it work?', acceptedAnswer: { '@type': 'Answer', text: 'Explanation of how it works.' } },
      ],
    },
  },
  {
    name: 'BreadcrumbList',
    template: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://yourwebsite.com/' },
        { '@type': 'ListItem', position: 2, name: 'Category', item: 'https://yourwebsite.com/category' },
        { '@type': 'ListItem', position: 3, name: 'Current Page', item: 'https://yourwebsite.com/category/page' },
      ],
    },
  },
  {
    name: 'LocalBusiness',
    template: {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Business Name',
      address: { '@type': 'PostalAddress', streetAddress: '123 Main St', addressLocality: 'City', addressRegion: 'State', postalCode: '12345', addressCountry: 'US' },
      telephone: '+1-xxx-xxx-xxxx',
      openingHours: 'Mo-Fr 09:00-17:00',
    },
  },
  {
    name: 'Person',
    template: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Full Name',
      jobTitle: 'Job Title',
      url: 'https://yourwebsite.com/about',
      sameAs: ['https://linkedin.com/in/profile'],
    },
  },
  {
    name: 'Course',
    template: {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'Course Title',
      description: 'Course description.',
      provider: { '@type': 'Organization', name: 'Provider Name' },
      educationalLevel: 'Beginner',
      inLanguage: 'en',
    },
  },
] as const;

function SchemaGeneratorSection() {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const jsonOutput = JSON.stringify(SCHEMA_TEMPLATES[selectedTemplate].template, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <DashboardCard
      heading="Schema Markup Generator"
      icon={<Wand2
        className="h-5 w-5"
        data-icod-id="src_pages_dashboard_dashboardschema_tsx_480e" />}
      action={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          data-icod-id="src_pages_dashboard_dashboardschema_tsx_281f">
          {isExpanded ? <ChevronUp
            className="h-4 w-4 mr-1"
            data-icod-id="src_pages_dashboard_dashboardschema_tsx_b666" /> : <ChevronDown
            className="h-4 w-4 mr-1"
            data-icod-id="src_pages_dashboard_dashboardschema_tsx_9a44" />}
          {isExpanded ? 'Collapse' : 'Expand'}
        </Button>
      }
      data-icod-id="src_pages_dashboard_dashboardschema_tsx_e719">
      <p
        className="text-sm text-muted-foreground mb-4"
        data-icod-id="src_pages_dashboard_dashboardschema_tsx_6468">
        Generate copy-paste ready JSON-LD structured data for your website. Select a schema type below, customize the values, and paste the code into your page's &lt;head&gt;.
      </p>
      {/* Template selector */}
      <div
        className="flex flex-wrap gap-2 mb-4"
        data-icod-id="src_pages_dashboard_dashboardschema_tsx_90d6">
        {SCHEMA_TEMPLATES.map((tpl, idx) => (
          <button
            key={tpl.name}
            type="button"
            onClick={() => { setSelectedTemplate(idx); setCopied(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
              selectedTemplate === idx
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
            }`}
            data-icod-id={`src_pages_dashboard_dashboardschema_tsx_1956_${tpl.name}`}>
            {tpl.name}
          </button>
        ))}
      </div>
      {/* JSON output */}
      {isExpanded && (
        <div
          className="relative"
          data-icod-id="src_pages_dashboard_dashboardschema_tsx_eccd">
          <pre
            className="rounded-lg bg-card p-4 text-xs text-success overflow-x-auto font-mono leading-relaxed"
            data-icod-id="src_pages_dashboard_dashboardschema_tsx_95d9">
            {`<script type="application/ld+json">\n${jsonOutput}\n</script>`}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary-foreground/10 text-primary-foreground text-xs font-medium hover:bg-primary-foreground/20 transition-colors backdrop-blur-sm"
            data-icod-id="src_pages_dashboard_dashboardschema_tsx_d77c">
            {copied ? <CheckCircle2
              className="h-3.5 w-3.5"
              data-icod-id="src_pages_dashboard_dashboardschema_tsx_79a5" /> : <Copy
              className="h-3.5 w-3.5"
              data-icod-id="src_pages_dashboard_dashboardschema_tsx_4fd0" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
      {!isExpanded && (
        <Card
          className="p-4 bg-muted/30 border-border/50"
          data-icod-id="src_pages_dashboard_dashboardschema_tsx_3a1d">
          <p
            className="text-xs text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardschema_tsx_dd60">
            Click "Expand" to view and copy the generated JSON-LD markup for{' '}
            <strong
              className="text-foreground"
              data-icod-id="src_pages_dashboard_dashboardschema_tsx_0777">{SCHEMA_TEMPLATES[selectedTemplate].name}</strong> schema.
          </p>
        </Card>
      )}
    </DashboardCard>
  );
}
