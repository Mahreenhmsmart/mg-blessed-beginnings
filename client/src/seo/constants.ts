/**
 * SEO constants — single source of truth for site-wide metadata.
 * Domain is derived from robots.txt Sitemap line (https://mgblessed.icod.ai).
 *
 * IMPORTANT: The server-side buildJsonLd in seoMetaMiddleware.ts must produce
 * semantically equivalent Organization and WebSite schemas. Keep both in sync.
 */

export const SITE_URL = 'https://mgblessed.icod.ai';

export const SITE_NAME = 'MG Blessed Beginnings';

/** Absolute URL to an existing asset in client/public/assets/ */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/1792968956320_AI_Professional_in_a_Modern_Workspace-upload.webp`;

/** Logo URL used consistently across all JSON-LD schemas (client + server). */
export const LOGO_URL = `${SITE_URL}/assets/icon-512.png`;

/** Organization JSON-LD (schema.org/Organization) — homepage only. */
export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: LOGO_URL,
  sameAs: [
    'https://www.linkedin.com/in/mahreenyousafdigital/',
    'https://www.instagram.com/mahreenyousafdigi/',
    'https://www.instagram.com/mgblessedbeginnings/',
    'https://www.tiktok.com/@hmsmart.ceo',
    'https://www.youtube.com/@blessedbeginnings8003',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: 'English',
  },
};

/** WebSite JSON-LD (schema.org/WebSite with SearchAction) — homepage only. */
export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/ai-tools?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};
