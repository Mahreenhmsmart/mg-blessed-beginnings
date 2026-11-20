/**
 * SchemaInjector — renders JSON-LD <script> tags via Helmet based on schema type.
 *
 * Deduplication: The server-side middleware (seoMetaMiddleware.ts) injects
 * JSON-LD into the initial HTML for crawlers that don't execute JS. After
 * hydration, this component checks whether server-injected JSON-LD already
 * exists in the DOM. If it does, the client skips injection to avoid
 * duplicate <script type="application/ld+json"> blocks. React Helmet will
 * replace meta/title tags by attribute, but JSON-LD scripts have no unique
 * identifier — so we gate on presence.
 *
 * Usage:
 *   <SchemaInjector schemaType="home" pageMeta={meta} />
 *   <SchemaInjector schemaType="tool" tool={tool} faqItems={items} breadcrumbs={[...]} pageMeta={meta} />
 *   <SchemaInjector schemaType="blogPost" post={post} breadcrumbs={[...]} pageMeta={meta} />
 *   <SchemaInjector schemaType="page" breadcrumbs={[...]} pageMeta={meta} />
 */

import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  organizationSchema,
  websiteSchema,
  webPageSchema,
  faqPageSchema,
  breadcrumbListSchema,
  blogPostingSchema,
  softwareApplicationSchema,
} from './jsonLd';
import type { PageMeta } from './pageMeta';

interface FAQItem {
  question: string;
  answer: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BlogPostData {
  title: string;
  excerpt?: string;
  featuredImage?: string;
  publishedAt?: string | Date;
  updatedAt?: string | Date;
  author?: string;
  category?: string;
  tags?: string[];
  slug?: string;
}

interface ToolData {
  name: string;
  slug: string;
  description: string;
  category: string;
  features?: string[];
}

type SchemaInjectorProps =
  | { schemaType: 'home'; pageMeta?: PageMeta }
  | { schemaType: 'tool'; tool: ToolData; faqItems?: FAQItem[]; breadcrumbs: BreadcrumbItem[]; pageMeta?: PageMeta }
  | { schemaType: 'blogPost'; post: BlogPostData; breadcrumbs: BreadcrumbItem[]; pageMeta?: PageMeta }
  | { schemaType: 'page'; breadcrumbs: BreadcrumbItem[]; pageMeta?: PageMeta };

/**
 * Check if server-side JSON-LD is already present in the DOM.
 * The server middleware injects a <script type="application/ld+json"> tag
 * directly into the HTML before React hydrates. If found, we skip client
 * injection to avoid duplicates.
 */
function hasServerInjectedJsonLd(): boolean {
  if (typeof document === 'undefined') return false;
  // Server-injected scripts are direct children of <head> and NOT managed
  // by React Helmet (they lack data-react-helmet attribute).
  const scripts = document.querySelectorAll('head > script[type="application/ld+json"]');
  for (const script of scripts) {
    if (!script.hasAttribute('data-react-helmet') && !script.hasAttribute('data-icod-id')) {
      return true;
    }
  }
  return false;
}

export default function SchemaInjector(props: SchemaInjectorProps) {
  // Track whether server-injected JSON-LD exists. Check once after mount.
  const [serverJsonLdPresent, setServerJsonLdPresent] = useState(false);

  useEffect(() => {
    setServerJsonLdPresent(hasServerInjectedJsonLd());
  }, []);

  // If server already injected JSON-LD, skip client-side injection
  if (serverJsonLdPresent) return null;

  const schemas: Record<string, unknown>[] = [];

  switch (props.schemaType) {
    case 'home': {
      schemas.push(organizationSchema());
      schemas.push(websiteSchema());
      // Also add WebPage for the homepage
      if (props.pageMeta) {
        schemas.push(webPageSchema({
          title: props.pageMeta.title,
          description: props.pageMeta.description,
          url: props.pageMeta.canonical,
        }));
      }
      break;
    }

    case 'tool': {
      // WebPage schema for the tool page
      if (props.pageMeta) {
        schemas.push(webPageSchema({
          title: props.pageMeta.title,
          description: props.pageMeta.description,
          url: props.pageMeta.canonical,
        }));
      }
      schemas.push(softwareApplicationSchema(props.tool));
      if (props.faqItems && props.faqItems.length > 0) {
        schemas.push(faqPageSchema(props.faqItems));
      }
      if (props.breadcrumbs.length > 0) {
        schemas.push(breadcrumbListSchema(props.breadcrumbs));
      }
      break;
    }

    case 'blogPost': {
      // WebPage schema for the blog post page
      if (props.pageMeta) {
        schemas.push(webPageSchema({
          title: props.pageMeta.title,
          description: props.pageMeta.description,
          url: props.pageMeta.canonical,
        }));
      }
      schemas.push(blogPostingSchema(props.post));
      if (props.breadcrumbs.length > 0) {
        schemas.push(breadcrumbListSchema(props.breadcrumbs));
      }
      break;
    }

    case 'page': {
      // WebPage schema for generic pages
      if (props.pageMeta) {
        schemas.push(webPageSchema({
          title: props.pageMeta.title,
          description: props.pageMeta.description,
          url: props.pageMeta.canonical,
        }));
      }
      if (props.breadcrumbs.length > 0) {
        schemas.push(breadcrumbListSchema(props.breadcrumbs));
      }
      break;
    }
  }

  if (schemas.length === 0) return null;

  // Use @graph when multiple schemas are present on the same page
  const jsonLd =
    schemas.length === 1
      ? schemas[0]
      : { '@context': 'https://schema.org', '@graph': schemas };

  return (
    <Helmet data-icod-id="src_seo_schemainjector_tsx_dde7">
      <script type="application/ld+json" data-icod-id="src_seo_schemainjector_tsx_e56d">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
