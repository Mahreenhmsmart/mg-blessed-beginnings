import { Helmet } from 'react-helmet-async';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/seo/constants';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonicalUrl?: string;
  noindex?: boolean;
  structuredData?: unknown;
  breadcrumbs?: { name: string; url: string }[];
}

/**
 * SEOHead — manages <title>, meta tags, OG/Twitter cards, and canonical URL.
 *
 * JSON-LD structured data is NOT rendered here. Use SchemaInjector from
 * @/seo for all JSON-LD output. This separation prevents duplicate
 * JSON-LD blocks when both components are used on the same page.
 */
export default function SEOHead({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  canonicalUrl,
  noindex = false,
  // structuredData and breadcrumbs are accepted for API compatibility
  // but JSON-LD is rendered by SchemaInjector from @/seo instead.
}: SEOHeadProps) {
  // Title is used as-is — pageMeta.ts already includes the site name suffix.
  // Appending SITE_NAME here would cause duplication since server-side middleware
  // also uses the full title from ROUTE_META (which matches pageMeta.ts).
  const fullTitle = title;
  // Ensure absolute URLs for OG/Twitter images
  const imageUrl = ogImage
    ? ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`
    : DEFAULT_OG_IMAGE;
  // Canonical URL should be absolute
  const canonical = canonicalUrl
    ? canonicalUrl.startsWith('http') ? canonicalUrl : `${SITE_URL}${canonicalUrl}`
    : undefined;

  return (
    <Helmet data-icod-id="src_components_seohead_tsx_0632">
      <title data-icod-id="src_components_seohead_tsx_f9fb">{fullTitle}</title>
      <meta
        name="description"
        content={description}
        data-icod-id="src_components_seohead_tsx_ba6f" />
      {keywords && <meta
        name="keywords"
        content={keywords}
        data-icod-id="src_components_seohead_tsx_bf58" />}
      <meta
        name="robots"
        content={noindex ? 'noindex, nofollow' : 'index, follow'}
        data-icod-id="src_components_seohead_tsx_robots" />

      {/* Open Graph */}
      <meta
        property="og:title"
        content={fullTitle}
        data-icod-id="src_components_seohead_tsx_2cf1" />
      <meta
        property="og:description"
        content={description}
        data-icod-id="src_components_seohead_tsx_fb0b" />
      <meta
        property="og:type"
        content={ogType}
        data-icod-id="src_components_seohead_tsx_a5a7" />
      <meta
        property="og:image"
        content={imageUrl}
        data-icod-id="src_components_seohead_tsx_5a96" />
      <meta
        property="og:site_name"
        content={SITE_NAME}
        data-icod-id="src_components_seohead_tsx_210f" />
      {canonical && <meta
        property="og:url"
        content={canonical}
        data-icod-id="src_components_seohead_tsx_6541" />}

      {/* Twitter Card */}
      <meta
        name="twitter:card"
        content="summary_large_image"
        data-icod-id="src_components_seohead_tsx_8dac" />
      <meta
        name="twitter:title"
        content={fullTitle}
        data-icod-id="src_components_seohead_tsx_9acc" />
      <meta
        name="twitter:description"
        content={description}
        data-icod-id="src_components_seohead_tsx_15a0" />
      <meta
        name="twitter:image"
        content={imageUrl}
        data-icod-id="src_components_seohead_tsx_bcd5" />

      {/* Canonical URL */}
      {canonical && <link
        rel="canonical"
        href={canonical}
        data-icod-id="src_components_seohead_tsx_4917" />}
    </Helmet>
  );
}
