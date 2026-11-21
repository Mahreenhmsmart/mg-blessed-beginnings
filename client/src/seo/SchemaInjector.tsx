/**
 * SchemaInjector — renders JSON-LD <script> tags via direct DOM manipulation.
 *
 * Uses imperative DOM writes instead of react-helmet-async to avoid Helmet's
 * reconciliation overwriting document.title set by useSeo(). Each injected
 * <script> is tagged with data-schema-source="client" so it can be
 * distinguished from server-injected scripts.
 *
 * Deduplication: Before injecting, checks whether a <script type="application/ld+json">
 * already exists in the DOM whose parsed JSON contains the same @type value(s).
 * If all schema types are already present, injection is skipped entirely.
 *
 * Usage:
 *   <SchemaInjector schemaType="home" pageMeta={meta} />
 *   <SchemaInjector schemaType="tool" tool={tool} faqItems={items} breadcrumbs={[...]} pageMeta={meta} />
 *   <SchemaInjector schemaType="blogPost" post={post} breadcrumbs={[...]} pageMeta={meta} />
 *   <SchemaInjector schemaType="page" breadcrumbs={[...]} pageMeta={meta} />
 */

import { useEffect } from 'react';
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
 * Extract all @type values from a schema object (handles both single objects
 * and @graph arrays). Returns a Set of lowercase type strings for comparison.
 */
function extractTypes(schema: Record<string, unknown>): Set<string> {
  const types = new Set<string>();
  if (schema['@graph'] && Array.isArray(schema['@graph'])) {
    for (const item of schema['@graph']) {
      if (item && typeof item === 'object' && '@type' in item) {
        const t = (item as Record<string, unknown>)['@type'];
        if (typeof t === 'string') types.add(t.toLowerCase());
      }
    }
  } else if (typeof schema['@type'] === 'string') {
    types.add((schema['@type'] as string).toLowerCase());
  }
  return types;
}

/**
 * Check if every @type in the given schemas is already present in an existing
 * JSON-LD script tag in the DOM. This provides deterministic dedup regardless
 * of how the server-injected scripts were rendered.
 */
function allTypesAlreadyPresent(schemas: Record<string, unknown>[]): boolean {
  if (typeof document === 'undefined') return false;

  // Collect all @type values we intend to inject
  const neededTypes = new Set<string>();
  for (const schema of schemas) {
    for (const t of extractTypes(schema)) {
      neededTypes.add(t);
    }
  }
  if (neededTypes.size === 0) return false;

  // Collect all @type values already in the DOM
  const existingTypes = new Set<string>();
  const scripts = document.querySelectorAll('head > script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const parsed = JSON.parse(script.textContent || '');
      for (const t of extractTypes(parsed)) {
        existingTypes.add(t);
      }
    } catch {
      // Skip unparseable scripts
    }
  }

  // All needed types must already exist for us to skip
  for (const t of neededTypes) {
    if (!existingTypes.has(t)) return false;
  }
  return true;
}

export default function SchemaInjector(props: SchemaInjectorProps) {
  useEffect(() => {
    const schemas: Record<string, unknown>[] = [];

    switch (props.schemaType) {
      case 'home': {
        schemas.push(organizationSchema());
        schemas.push(websiteSchema());
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

    if (schemas.length === 0) return;

    // Deterministic dedup: skip if all @type values are already in the DOM
    if (allTypesAlreadyPresent(schemas)) return;

    // Use @graph when multiple schemas are present on the same page
    const jsonLd =
      schemas.length === 1
        ? schemas[0]
        : { '@context': 'https://schema.org', '@graph': schemas };

    // Direct DOM manipulation — bypasses Helmet entirely so it cannot
    // overwrite document.title or other meta tags managed by useSeo().
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema-source', 'client');
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    // Cleanup on unmount / re-render
    return () => {
      script.remove();
    };
  }, [props]);

  return null;
}
