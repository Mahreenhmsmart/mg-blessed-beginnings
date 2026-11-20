/**
 * SEO module barrel — single import point for all SEO utilities.
 */

export { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, LOGO_URL, ORGANIZATION_SCHEMA, WEBSITE_SCHEMA } from './constants';
export { PAGE_META } from './pageMeta';
export type { PageMeta } from './pageMeta';
export {
  organizationSchema,
  websiteSchema,
  webPageSchema,
  faqPageSchema,
  breadcrumbListSchema,
  blogPostingSchema,
  softwareApplicationSchema,
} from './jsonLd';
export { default as SchemaInjector } from './SchemaInjector';
