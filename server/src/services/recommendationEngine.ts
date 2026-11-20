/**
 * Recommendation Engine — Converts failed/warning checks into prioritized recommendations.
 * Groups by severity with estimated effort and layer assignment.
 * Generates AI-powered rewrite suggestions for on-page elements.
 */

import type { LayerResults, Recommendation } from '../models/Audit';
import type { CrawlResult } from './crawlerService';
import type { OnPageResult } from './onPageAnalyzer';
import { generateCompletion } from './aiService';

type LayerName = 'seo' | 'aeo' | 'geo' | 'aio' | 'sxo' | 'cq' | 'schema' | 'performance' | 'mobile' | 'localSeo' | 'security' | 'accessibility' | 'social';

interface CheckRecommendationMap {
  [checkId: string]: {
    title: string;
    description: string;
    effort: 'quick' | 'moderate' | 'extensive';
  };
}

const RECOMMENDATION_MAP: CheckRecommendationMap = {
  // SEO — existing
  'seo-title-presence': { title: 'Add a Title Tag', description: 'Every page needs a unique, descriptive <title> tag. This is the most important on-page SEO element.', effort: 'quick' },
  'seo-title-length': { title: 'Optimize Title Length', description: 'Adjust your title tag to be between 30-60 characters for optimal display in search results.', effort: 'quick' },
  'seo-meta-description': { title: 'Add/Optimize Meta Description', description: 'Write a compelling meta description (120-160 chars) that summarizes the page content and encourages clicks.', effort: 'quick' },
  'seo-h1-unique': { title: 'Fix H1 Heading', description: 'Ensure each page has exactly one H1 heading that clearly describes the page topic.', effort: 'quick' },
  'seo-canonical': { title: 'Add Canonical Tag', description: 'Add a <link rel="canonical"> tag to prevent duplicate content issues and consolidate ranking signals.', effort: 'quick' },
  'seo-internal-links': { title: 'Improve Internal Linking', description: 'Add more internal links to help crawlers discover pages and distribute link equity throughout your site.', effort: 'moderate' },
  'seo-image-alt': { title: 'Add Image Alt Text', description: 'Add descriptive alt text to all images. This improves accessibility and helps search engines understand image content.', effort: 'moderate' },
  'seo-viewport': { title: 'Add Viewport Meta Tag', description: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> for proper mobile rendering.', effort: 'quick' },
  'seo-https': { title: 'Enable HTTPS', description: 'Migrate your site to HTTPS. This is a confirmed ranking factor and essential for security.', effort: 'extensive' },
  'seo-sitemap': { title: 'Create XML Sitemap', description: 'Generate and submit an XML sitemap to help search engines discover and index all your pages.', effort: 'moderate' },
  'seo-robots': { title: 'Add robots.txt', description: 'Create a robots.txt file to guide search engine crawlers on which pages to index.', effort: 'quick' },
  'seo-heading-hierarchy': { title: 'Fix Heading Hierarchy', description: 'Ensure headings follow a logical hierarchy (H1 > H2 > H3) without skipping levels.', effort: 'moderate' },
  'seo-content-length': { title: 'Increase Content Depth', description: 'Expand thin content to at least 300 words with valuable, relevant information for users.', effort: 'moderate' },
  // SEO — new technical checks
  'seo-hsts-header': { title: 'Add HSTS Header', description: 'Add Strict-Transport-Security header to enforce HTTPS connections and prevent downgrade attacks.', effort: 'quick' },
  'seo-redirect-chain': { title: 'Reduce Redirect Chain', description: 'Minimize redirect hops to 1 or fewer. Long chains waste crawl budget and slow page loading.', effort: 'moderate' },
  'seo-robots-wellformed': { title: 'Fix robots.txt Rules', description: 'Review robots.txt to ensure important pages are not blocked from crawling.', effort: 'quick' },
  'seo-sitemap-valid': { title: 'Fix XML Sitemap', description: 'Ensure your sitemap.xml contains valid URLs and is properly formatted.', effort: 'moderate' },
  'seo-noindex-check': { title: 'Remove Noindex Directive', description: 'Remove noindex/nofollow meta tags from pages you want search engines to index.', effort: 'quick' },
  'seo-url-structure': { title: 'Clean Up URL Structure', description: 'Use short, descriptive URLs without special characters, uppercase, or excessive parameters.', effort: 'moderate' },
  'seo-broken-links': { title: 'Fix Broken Internal Links', description: 'Update or remove broken internal links (404/5xx errors) to improve user experience and crawl efficiency.', effort: 'moderate' },
  'seo-image-alt-coverage-90': { title: 'Improve Image Alt Coverage', description: 'Add alt text to all images to reach 90%+ coverage for better accessibility and image search.', effort: 'moderate' },
  'seo-security-headers': { title: 'Add Security Headers', description: 'Implement security headers: X-Frame-Options, X-Content-Type-Options, CSP, Referrer-Policy, Permissions-Policy.', effort: 'moderate' },
  'seo-mixed-content': { title: 'Fix Mixed Content', description: 'Replace HTTP resource references with HTTPS on your HTTPS pages to eliminate browser warnings.', effort: 'moderate' },
  'seo-client-rendering': { title: 'Improve Server-Side Rendering', description: 'Consider server-side rendering or pre-rendering to ensure search engines can fully index your content.', effort: 'extensive' },
  'seo-hreflang-consistency': { title: 'Fix Hreflang Tags', description: 'Ensure hreflang tags include self-referencing entries and match across all language variants.', effort: 'moderate' },
  'seo-no-5xx-errors': { title: 'Fix Server Errors', description: 'Investigate and fix 5xx server errors on internal links. These indicate server-side issues.', effort: 'extensive' },
  // AEO
  'aeo-faq-schema': { title: 'Add FAQ Schema Markup', description: 'Implement FAQPage JSON-LD schema to increase chances of appearing in featured snippets and answer boxes.', effort: 'moderate' },
  'aeo-question-headings': { title: 'Use Question-Based Headings', description: 'Rephrase H2/H3 headings as questions (What, How, Why) to target voice search and answer engines.', effort: 'moderate' },
  'aeo-short-answers': { title: 'Add Concise Answer Paragraphs', description: 'Place short, direct answers (<20 words) immediately after question headings for featured snippet targeting.', effort: 'moderate' },
  'aeo-definition-lists': { title: 'Use Definition Lists', description: 'Use <dl>/<dt>/<dd> elements for definitions, glossaries, and term explanations.', effort: 'quick' },
  'aeo-tables': { title: 'Add Data Tables', description: 'Use HTML tables for comparisons, specifications, and structured data presentation.', effort: 'moderate' },
  'aeo-lists': { title: 'Use Ordered/Unordered Lists', description: 'Structure steps, features, and enumerations using <ol> or <ul> lists for better scannability.', effort: 'quick' },
  'aeo-content-depth': { title: 'Deepen Content for Answers', description: 'Expand content to provide comprehensive coverage that answer engines can extract from.', effort: 'extensive' },
  'aeo-structured-data-richness': { title: 'Enrich Structured Data', description: 'Add more JSON-LD schema types to provide richer context for answer engines.', effort: 'moderate' },
  // GEO
  'geo-author-schema': { title: 'Add Author Schema', description: 'Implement Person schema markup to establish author identity and E-E-A-T signals for generative engines.', effort: 'moderate' },
  'geo-organization-schema': { title: 'Add Organization Schema', description: 'Implement Organization or LocalBusiness schema to help AI engines identify your brand entity.', effort: 'moderate' },
  'geo-citation-patterns': { title: 'Add Authoritative Citations', description: 'Link to authoritative sources (government, academic, industry leaders) to boost credibility with AI engines.', effort: 'moderate' },
  'geo-trust-privacy': { title: 'Add Privacy Policy Page', description: 'Create and link to a privacy policy page. This is a key trust signal for both users and AI systems.', effort: 'moderate' },
  'geo-trust-about': { title: 'Add About Page', description: 'Create an About page with company/team information. Transparency builds trust with generative engines.', effort: 'moderate' },
  'geo-trust-contact': { title: 'Add Contact Page', description: 'Create a contact page with clear contact information to improve trust signals.', effort: 'quick' },
  'geo-structured-data-richness': { title: 'Expand Schema Coverage', description: 'Add multiple schema types to provide comprehensive entity context for generative AI engines.', effort: 'moderate' },
  'geo-content-substance': { title: 'Increase Content Substance', description: 'Add more substantive content that generative engines can cite and reference.', effort: 'extensive' },
  // AIO
  'aio-entity-markup': { title: 'Define Entity Types', description: 'Add structured data for Organization, Person, and Product/Service entities for AI understanding.', effort: 'moderate' },
  'aio-schema-completeness': { title: 'Complete Schema Properties', description: 'Ensure schema items include name, description, and URL properties for complete AI entity recognition.', effort: 'quick' },
  'aio-machine-readable': { title: 'Add Machine-Readable Patterns', description: 'Use tables, lists, definition lists, and schema markup to make content machine-readable.', effort: 'moderate' },
  'aio-factual-claims': { title: 'Add Factual Claims & Data', description: 'Include statistics, dates, and citations to make content verifiable and citable by AI systems.', effort: 'moderate' },
  'aio-brand-identity': { title: 'Strengthen Brand Identity', description: 'Add organization schema, logo markup, and consistent OG tags for clear brand entity recognition.', effort: 'moderate' },
  'aio-topic-coherence': { title: 'Improve Topic Structure', description: 'Add more headings and content depth to establish topical authority and coherence.', effort: 'extensive' },
  'aio-og-tags': { title: 'Add Open Graph Tags', description: 'Implement og:title, og:description, og:image, and og:type for social and AI context.', effort: 'quick' },
  // SXO
  'sxo-load-time': { title: 'Improve Page Load Speed', description: 'Optimize images, minify CSS/JS, enable compression, and consider a CDN to reduce load time below 2 seconds.', effort: 'extensive' },
  'sxo-image-optimization': { title: 'Optimize Images', description: 'Use modern formats (WebP/AVIF), add alt text, implement lazy loading, and serve appropriately sized images.', effort: 'moderate' },
  'sxo-readability-sentence': { title: 'Shorten Sentences', description: 'Break long sentences into shorter ones (under 20 words) for improved readability and comprehension.', effort: 'moderate' },
  'sxo-paragraph-length': { title: 'Break Up Long Paragraphs', description: 'Split paragraphs exceeding 60 words into shorter chunks for better scannability.', effort: 'moderate' },
  'sxo-list-usage': { title: 'Add Lists for Scannability', description: 'Convert dense text blocks into bullet points or numbered lists for easier scanning.', effort: 'quick' },
  'sxo-navigation': { title: 'Improve Navigation Structure', description: 'Add semantic <nav> elements with clear link structure for better user experience and crawlability.', effort: 'moderate' },
  'sxo-breadcrumb-schema': { title: 'Add Breadcrumb Navigation', description: 'Implement BreadcrumbList schema and visible breadcrumbs to help users understand site hierarchy.', effort: 'moderate' },
  'sxo-mobile-viewport': { title: 'Fix Mobile Responsiveness', description: 'Add viewport meta tag and ensure responsive design for mobile-first indexing.', effort: 'quick' },
  'sxo-internal-linking-depth': { title: 'Increase Content Cross-Linking', description: 'Add more internal links between related pages to improve discoverability and user engagement.', effort: 'moderate' },
  'sxo-trust-signals': { title: 'Add Trust Signals', description: 'Ensure privacy policy, about page, contact page, and HTTPS are all present for user confidence.', effort: 'moderate' },
  // CQ — Content Quality / E-E-A-T
  'cq-original-content': { title: 'Increase Original Content', description: 'Add more substantial original text (>300 words) with a healthy text-to-HTML ratio. Reduce boilerplate and template content.', effort: 'moderate' },
  'cq-content-depth': { title: 'Expand Thin Content', description: 'Expand thin content pages to at least 1500 words with comprehensive coverage, multiple headings, lists, and examples.', effort: 'extensive' },
  'cq-heading-quality': { title: 'Improve Heading Structure', description: 'Use descriptive, honest H1 headings (avoid clickbait). Build logical H2/H3 hierarchy throughout the page.', effort: 'quick' },
  'cq-quality-signals': { title: 'Add Quality Signals', description: 'Include data, statistics, varied paragraph lengths, and consistent formatting to demonstrate content quality.', effort: 'moderate' },
  'cq-author-attribution': { title: 'Add Author Bylines & Dates', description: 'Add author bylines with credentials, publication dates, and last-updated timestamps to all content pages.', effort: 'quick' },
  'cq-trust-signals': { title: 'Strengthen Trust Signals', description: 'Add contact information, privacy policy link, terms of service, and social proof (testimonials, reviews).', effort: 'moderate' },
  'cq-experience-signals': { title: 'Demonstrate First-Hand Experience', description: 'Add first-person language, original photos, personal anecdotes, and hands-on insights to show real experience.', effort: 'moderate' },
  'cq-expertise-signals': { title: 'Showcase Expertise', description: 'Add author bio with credentials, citations/references, and technical terminology appropriate to the topic.', effort: 'moderate' },
  'cq-authoritativeness': { title: 'Build Authoritativeness', description: 'Link to authoritative external sources, increase internal linking depth, and add structured data markup.', effort: 'moderate' },
  'cq-trustworthiness': { title: 'Improve Trustworthiness', description: 'Enable HTTPS, add security headers, provide clear contact info, and implement cookie consent for transparency.', effort: 'moderate' },
  'cq-search-intent-alignment': { title: 'Align Content with Search Intent', description: 'Ensure title, H1, and opening paragraph address the same topic. Provide a clear answer or summary near the top.', effort: 'quick' },
  'cq-satisfying-experience': { title: 'Enhance User Experience', description: 'Add table of contents, clear CTAs, related content links, and next-step guidance for a satisfying reading experience.', effort: 'moderate' },
  'cq-anti-seo-spam': { title: 'Reduce SEO Spam Signals', description: 'Lower keyword density below 3%, remove keyword stuffing from headings, and expand doorway/thin pages.', effort: 'moderate' },
  'cq-ai-disclosure': { title: 'Add AI Transparency Disclosure', description: 'If content uses AI assistance, add a transparency statement describing your editorial process.', effort: 'quick' },
  'cq-freshness-maintenance': { title: 'Update Content Freshness', description: 'Add publication and modification dates. Review and update outdated references to keep content current.', effort: 'quick' },
  // AEO — AI Search Readiness (new checks)
  'aeo-clear-answers': { title: 'Add Clear Direct Answers', description: 'Write declarative, factual sentences immediately after headings so AI search engines can extract direct answers.', effort: 'moderate' },
  'aeo-entity-context': { title: 'Define Entity Context', description: 'Add Organization, Person, or Product schema to help AI engines understand who you are and what you offer.', effort: 'moderate' },
  'aeo-author-info': { title: 'Add Author Attribution', description: 'Include author bylines, meta author tags, and Person schema for E-E-A-T credibility with AI systems.', effort: 'quick' },
  'aeo-trust-signals': { title: 'Strengthen Trust Signals', description: 'Add privacy policy, about page, contact page, HTTPS, and reviews/testimonials for AI credibility.', effort: 'moderate' },
  'aeo-citations': { title: 'Add Authoritative Citations', description: 'Link to .gov, .edu, or industry-leading sources to help AI engines verify your claims.', effort: 'moderate' },
  'aeo-org-info': { title: 'Add Organization Information', description: 'Include Organization schema with address, phone, and email for clear business identity.', effort: 'moderate' },
  // Schema / Structured Data
  'schema-organization': { title: 'Add Organization Schema', description: 'Implement Organization JSON-LD with name, url, logo, and sameAs social profiles.', effort: 'moderate' },
  'schema-website': { title: 'Add WebSite Schema', description: 'Implement WebSite JSON-LD with name and url for sitelinks search box eligibility.', effort: 'quick' },
  'schema-breadcrumb': { title: 'Add Breadcrumb Schema', description: 'Implement BreadcrumbList JSON-LD with at least 2 items for better navigation understanding.', effort: 'quick' },
  'schema-article': { title: 'Add Article Schema', description: 'Implement Article/BlogPosting JSON-LD with headline, author, and datePublished.', effort: 'moderate' },
  'schema-product': { title: 'Add Product Schema', description: 'Implement Product JSON-LD with name, offers/price, and description for product pages.', effort: 'moderate' },
  'schema-faq': { title: 'Add FAQ Schema', description: 'Implement FAQPage JSON-LD with at least 2 Q&A entries for featured snippet eligibility.', effort: 'moderate' },
  'schema-localbusiness': { title: 'Add LocalBusiness Schema', description: 'Implement LocalBusiness JSON-LD with name, address, telephone, and openingHours.', effort: 'moderate' },
  'schema-person': { title: 'Add Person Schema', description: 'Implement Person JSON-LD with name, jobTitle, and url for author/team pages.', effort: 'quick' },
  'schema-service': { title: 'Add Service Schema', description: 'Implement Service JSON-LD with name, provider, and serviceType for service pages.', effort: 'moderate' },
  // Performance
  'perf-load-time': { title: 'Improve Page Load Time', description: 'Optimize images, reduce render-blocking resources, enable compression, and use a CDN to achieve sub-2.5s load time.', effort: 'extensive' },
  'perf-page-size': { title: 'Reduce Page Size', description: 'Compress images, minify CSS/JS, remove unused code, and implement lazy loading to reduce total page weight.', effort: 'moderate' },
  'perf-images': { title: 'Optimize Images', description: 'Convert PNG/JPG to WebP/AVIF, add lazy loading, serve responsive sizes with srcset, and ensure all images have alt text.', effort: 'moderate' },
  'perf-js-resources': { title: 'Optimize JavaScript', description: 'Bundle and minify JS files, add defer/async attributes, tree-shake unused code, and use dynamic imports.', effort: 'moderate' },
  'perf-css-resources': { title: 'Optimize CSS', description: 'Combine and minify CSS files, inline critical CSS, and defer non-critical stylesheets.', effort: 'moderate' },
  'perf-fonts': { title: 'Optimize Font Loading', description: 'Add font-display: swap to @font-face rules, preload critical fonts, and limit custom font families.', effort: 'quick' },
  'perf-render-blocking': { title: 'Eliminate Render-Blocking Resources', description: 'Move scripts to bottom of page, use async/defer, inline above-the-fold CSS, and defer non-critical resources.', effort: 'moderate' },
  'perf-caching': { title: 'Implement Caching Strategy', description: 'Set Cache-Control headers on static assets, implement a service worker for offline support, and use resource hints.', effort: 'moderate' },
  'perf-compression': { title: 'Enable Compression', description: 'Enable gzip/brotli compression on your web server and minify all JS/CSS files.', effort: 'quick' },
  'perf-mobile-performance': { title: 'Optimize Mobile Performance', description: 'Add viewport meta tag, implement responsive images with srcset, and optimize touch targets for mobile devices.', effort: 'moderate' },
  // Mobile
  'mobile-viewport': { title: 'Add Viewport Meta Tag', description: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> for proper mobile rendering.', effort: 'quick' },
  'mobile-responsive-design': { title: 'Implement Responsive Design', description: 'Use CSS media queries, flexible layouts (flex/grid), and relative units for all screen sizes.', effort: 'extensive' },
  'mobile-text-size': { title: 'Ensure Readable Text Size', description: 'Use minimum 16px base font size or relative units (rem/em) for mobile readability.', effort: 'quick' },
  'mobile-touch-targets': { title: 'Increase Touch Target Size', description: 'Ensure all buttons and links have minimum 44x44px touch targets with adequate padding.', effort: 'moderate' },
  'mobile-navigation': { title: 'Add Mobile Navigation', description: 'Implement a hamburger menu or collapsible navigation pattern for smaller screens.', effort: 'moderate' },
  'mobile-horizontal-overflow': { title: 'Prevent Horizontal Overflow', description: 'Use max-width: 100% and overflow-x: hidden on body, apply box-sizing: border-box globally.', effort: 'quick' },
  'mobile-image-scaling': { title: 'Make Images Responsive', description: 'Add max-width: 100% to images, use srcset for different screen densities, and implement picture element.', effort: 'moderate' },
  'mobile-performance': { title: 'Optimize for Mobile Connections', description: 'Reduce page weight, minimize HTTP requests, and prioritize critical rendering path for slower mobile networks.', effort: 'extensive' },
  // Local SEO
  'local-nap-consistency': { title: 'Ensure NAP Consistency', description: 'Display consistent Name, Address, Phone number across all pages and external directories.', effort: 'moderate' },
  'local-schema': { title: 'Add LocalBusiness Schema', description: 'Implement LocalBusiness JSON-LD with name, address, telephone, and openingHours.', effort: 'moderate' },
  'local-location-pages': { title: 'Create Location Pages', description: 'Build dedicated landing pages for each service area or physical branch location.', effort: 'extensive' },
  'local-keywords': { title: 'Include Local Keywords', description: 'Add city/area names in titles, headings, and body content to target local searches.', effort: 'moderate' },
  'local-reviews': { title: 'Display Reviews & Ratings', description: 'Show customer testimonials on-site, add Review schema markup, and link to Google Business Profile reviews.', effort: 'moderate' },
  'local-maps': { title: 'Embed Google Map', description: 'Embed a Google Map showing your business location on your contact or location page.', effort: 'quick' },
  'local-citations': { title: 'Build Local Citations', description: 'List your business on Google Business Profile, Yelp, Bing Places, Facebook, and industry directories.', effort: 'moderate' },
  'local-gbp': { title: 'Connect Google Business Profile', description: 'Link to your Google Business Profile listing from your website footer or contact page.', effort: 'quick' },
  // Security
  'sec-https-enforcement': { title: 'Enable HTTPS', description: 'Migrate your site to HTTPS. This is essential for security, trust, and search rankings.', effort: 'extensive' },
  'sec-hsts-header': { title: 'Add HSTS Header', description: 'Add Strict-Transport-Security header to enforce HTTPS connections and prevent protocol downgrade attacks.', effort: 'quick' },
  'sec-x-frame-options': { title: 'Add X-Frame-Options Header', description: 'Add X-Frame-Options: DENY or SAMEORIGIN header to protect against clickjacking attacks.', effort: 'quick' },
  'sec-x-content-type-options': { title: 'Add X-Content-Type-Options Header', description: 'Add X-Content-Type-Options: nosniff to prevent MIME-type sniffing attacks.', effort: 'quick' },
  'sec-content-security-policy': { title: 'Implement Content Security Policy', description: 'Add a Content-Security-Policy header to mitigate XSS, clickjacking, and code injection attacks.', effort: 'moderate' },
  'sec-referrer-policy': { title: 'Add Referrer-Policy Header', description: 'Set Referrer-Policy to control how much referrer information is shared with external sites.', effort: 'quick' },
  'sec-permissions-policy': { title: 'Add Permissions-Policy Header', description: 'Restrict browser features like camera, microphone, and geolocation using Permissions-Policy.', effort: 'quick' },
  'sec-mixed-content': { title: 'Fix Mixed Content', description: 'Replace all HTTP resource references with HTTPS on your HTTPS pages to eliminate browser warnings.', effort: 'moderate' },
  'sec-sensitive-paths-exposed': { title: 'Review Sensitive Paths in robots.txt', description: 'Remove or obscure sensitive paths (admin, config, backup) from robots.txt Disallow rules.', effort: 'quick' },
  'sec-insecure-resource-loading': { title: 'Fix Insecure Resource Loading', description: 'Update all HTTP image and resource URLs to use HTTPS for secure content delivery.', effort: 'moderate' },
  'sec-server-header-disclosure': { title: 'Remove Server Information Disclosure', description: 'Remove X-Powered-By headers and generator meta tags that reveal technology stack details.', effort: 'quick' },
  'sec-security-headers-count': { title: 'Improve Security Headers Coverage', description: 'Add missing security headers (HSTS, CSP, X-Frame-Options, etc.) for comprehensive protection.', effort: 'moderate' },
  // Accessibility
  'a11y-image-alt-text': { title: 'Add Image Alt Text', description: 'Add descriptive alt text to all images for screen reader accessibility and SEO benefits.', effort: 'moderate' },
  'a11y-heading-hierarchy': { title: 'Fix Heading Hierarchy', description: 'Ensure exactly one H1 per page and maintain sequential heading order (H1 > H2 > H3).', effort: 'moderate' },
  'a11y-form-labels': { title: 'Add Form Labels', description: 'Associate labels with all form inputs using <label for="id"> or aria-label attributes.', effort: 'moderate' },
  'a11y-aria-landmarks': { title: 'Add ARIA Landmarks', description: 'Use semantic HTML elements (<header>, <nav>, <main>, <footer>) for screen reader navigation.', effort: 'moderate' },
  'a11y-language-attribute': { title: 'Set HTML Language Attribute', description: 'Add lang attribute to <html> element so screen readers use correct pronunciation rules.', effort: 'quick' },
  'a11y-link-text-quality': { title: 'Improve Link Text', description: 'Replace vague link text ("click here", "read more") with descriptive text that indicates the destination.', effort: 'moderate' },
  'a11y-color-contrast-inline': { title: 'Improve Color Contrast', description: 'Ensure text meets WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text).', effort: 'moderate' },
  'a11y-skip-navigation': { title: 'Add Skip Navigation Link', description: 'Add a "Skip to main content" link as the first focusable element for keyboard users.', effort: 'quick' },
  'a11y-viewport-zoom': { title: 'Allow Viewport Zoom', description: 'Remove user-scalable=no and maximum-scale=1 from viewport meta tag. Users must be able to zoom to 200%.', effort: 'quick' },
  'a11y-focus-visible': { title: 'Ensure Focus Indicators', description: 'Provide visible :focus styles for all interactive elements. Never remove outline without replacement.', effort: 'moderate' },
  // Social
  'social-og-title': { title: 'Add Open Graph Title', description: 'Set og:title meta tag for rich social media previews when sharing links.', effort: 'quick' },
  'social-og-description': { title: 'Add Open Graph Description', description: 'Set og:description for compelling social media preview text.', effort: 'quick' },
  'social-og-image': { title: 'Add Open Graph Image', description: 'Set og:image with an absolute URL (recommended: 1200x630px) for visual social previews.', effort: 'quick' },
  'social-og-url': { title: 'Set Open Graph URL', description: 'Set og:url to the canonical URL for proper link attribution on social platforms.', effort: 'quick' },
  'social-og-type': { title: 'Set Open Graph Type', description: 'Specify og:type (website, article, product) for proper content categorization.', effort: 'quick' },
  'social-twitter-card': { title: 'Add Twitter Card Meta Tags', description: 'Add twitter:card meta tag to enable rich card previews on Twitter/X.', effort: 'quick' },
  'social-twitter-title': { title: 'Set Twitter Card Title', description: 'Add twitter:title for platform-specific title control on Twitter/X shares.', effort: 'quick' },
  'social-twitter-description': { title: 'Set Twitter Card Description', description: 'Add twitter:description for custom preview text on Twitter/X shares.', effort: 'quick' },
  'social-twitter-image': { title: 'Set Twitter Card Image', description: 'Add twitter:image (recommended: 1200x628px) for visual Twitter/X card previews.', effort: 'quick' },
  'social-favicon': { title: 'Add Favicon', description: 'Add <link rel="icon"> for brand recognition in browser tabs, bookmarks, and social previews.', effort: 'quick' },
  'social-metadata-completeness': { title: 'Complete Social Metadata', description: 'Add all recommended OG and Twitter Card meta tags for optimal social sharing appearance.', effort: 'moderate' },
  'social-canonical-consistency': { title: 'Align Canonical and OG URLs', description: 'Ensure canonical URL and og:url point to the same preferred URL for consistency.', effort: 'quick' },
};

export function generateRecommendations(
  results: Record<string, LayerResults>,
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const layers: LayerName[] = ['seo', 'aeo', 'geo', 'aio', 'sxo', 'cq', 'schema', 'performance', 'mobile', 'localSeo', 'security', 'accessibility', 'social'];

  for (const layer of layers) {
    const layerResults = results[layer];
    if (!layerResults) continue;

    for (const check of layerResults.checks) {
      if (check.status === 'pass') continue;

      const mapping = RECOMMENDATION_MAP[check.id];
      if (!mapping) continue;

      recommendations.push({
        severity: check.status === 'fail' ? 'critical' : 'warning',
        category: getCategoryFromCheckId(check.id),
        title: mapping.title,
        description: `${mapping.description} ${check.details}`,
        effort: mapping.effort,
        layer,
      });
    }
  }

  // Sort: critical first, then warning, then info
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  recommendations.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return recommendations;
}

/**
 * Generate AI-powered on-page recommendations with suggested rewrites.
 * Called separately after the main audit to avoid blocking the pipeline.
 */
export async function generateOnPageRecommendations(
  crawl: CrawlResult,
  onPageResult: OnPageResult,
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  for (const finding of onPageResult.findings) {
    if (finding.severity === 'info') continue; // Only generate AI suggestions for critical/warning

    let suggestedText: string | undefined;

    try {
      // Generate AI suggestions for title, meta description, and H1
      if (finding.category === 'title' && crawl.title) {
        suggestedText = await generateTitleSuggestion(crawl);
      } else if (finding.category === 'meta-description' && crawl.metaDescription) {
        suggestedText = await generateMetaDescriptionSuggestion(crawl);
      } else if (finding.category === 'h1' && crawl.headings.filter((h) => h.level === 1).length > 0) {
        suggestedText = await generateH1Suggestion(crawl);
      }
    } catch (err) {
      console.error(`[recommendations] AI suggestion generation failed for ${finding.id}:`, err instanceof Error ? err.message : err);
      // Continue without AI suggestion — the recommendation is still valid
    }

    recommendations.push({
      severity: finding.severity === 'critical' ? 'critical' : 'warning',
      category: mapOnPageCategory(finding.category),
      title: finding.title,
      description: `${finding.details} Current value: "${finding.currentValue}"`,
      effort: getEffortForCategory(finding.category),
      layer: 'seo',
      suggestedText,
      currentPage: onPageResult.url,
    });
  }

  return recommendations;
}

async function generateTitleSuggestion(crawl: CrawlResult): Promise<string> {
  const currentTitle = crawl.title || '(no title)';
  const h1 = crawl.headings.find((h) => h.level === 1)?.text || '';
  const prompt = `You are an SEO expert. Generate an optimized page title tag (50-60 characters) for this page.

Current title: "${currentTitle}"
Page H1: "${h1}"
URL: ${crawl.url}

Requirements:
- Include the primary keyword/topic
- Be compelling and clickable
- Stay within 50-60 characters
- Do NOT use quotes around the title

Return ONLY the suggested title text, nothing else.`;

  const result = await generateCompletion(prompt, { maxTokens: 100 });
  return result.trim().replace(/^["']|["']$/g, '');
}

async function generateMetaDescriptionSuggestion(crawl: CrawlResult): Promise<string> {
  const currentDesc = crawl.metaDescription || '(no description)';
  const title = crawl.title || '';
  const prompt = `You are an SEO expert. Generate an optimized meta description (150-160 characters) for this page.

Current meta description: "${currentDesc}"
Page title: "${title}"
URL: ${crawl.url}

Requirements:
- Summarize the page content compellingly
- Include a call-to-action
- Stay within 150-160 characters
- Do NOT use quotes around the description

Return ONLY the suggested meta description text, nothing else.`;

  const result = await generateCompletion(prompt, { maxTokens: 150 });
  return result.trim().replace(/^["']|["']$/g, '');
}

async function generateH1Suggestion(crawl: CrawlResult): Promise<string> {
  const currentH1 = crawl.headings.find((h) => h.level === 1)?.text || '(no H1)';
  const title = crawl.title || '';
  const prompt = `You are an SEO expert. Generate an optimized H1 heading for this page.

Current H1: "${currentH1}"
Page title: "${title}"
URL: ${crawl.url}

Requirements:
- Clearly describe the page's main topic
- Include the primary keyword
- Be concise but descriptive
- Do NOT use quotes around the heading

Return ONLY the suggested H1 text, nothing else.`;

  const result = await generateCompletion(prompt, { maxTokens: 100 });
  return result.trim().replace(/^["']|["']$/g, '');
}

function mapOnPageCategory(category: string): string {
  const map: Record<string, string> = {
    'title': 'Meta Tags',
    'meta-description': 'Meta Tags',
    'h1': 'Headings',
    'headings': 'Headings',
    'keyword': 'Keywords',
    'content': 'Content',
    'images': 'Images',
    'links': 'Linking',
    'cta': 'Conversion',
    'duplicate': 'Content',
  };
  return map[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

function getEffortForCategory(category: string): 'quick' | 'moderate' | 'extensive' {
  const quick = ['title', 'meta-description', 'h1', 'cta'];
  const extensive = ['content', 'duplicate'];
  if (quick.includes(category)) return 'quick';
  if (extensive.includes(category)) return 'extensive';
  return 'moderate';
}

function getCategoryFromCheckId(id: string): string {
  const parts = id.split('-');
  if (parts.length >= 2) {
    const category = parts.slice(1).join(' ');
    // Map to human-readable categories
    const categoryMap: Record<string, string> = {
      'title presence': 'Meta Tags',
      'title length': 'Meta Tags',
      'meta description': 'Meta Tags',
      'h1 unique': 'Headings',
      canonical: 'Technical SEO',
      'internal links': 'Linking',
      'image alt': 'Images',
      viewport: 'Mobile',
      https: 'Security',
      sitemap: 'Technical SEO',
      robots: 'Technical SEO',
      'heading hierarchy': 'Headings',
      'content length': 'Content',
      'faq schema': 'Schema Markup',
      'question headings': 'Content Structure',
      'short answers': 'Content Structure',
      'definition lists': 'Content Structure',
      tables: 'Content Structure',
      lists: 'Content Structure',
      'content depth': 'Content',
      'structured data richness': 'Schema Markup',
      'author schema': 'E-E-A-T',
      'organization schema': 'E-E-A-T',
      'citation patterns': 'Credibility',
      'trust privacy': 'Trust Signals',
      'trust about': 'Trust Signals',
      'trust contact': 'Trust Signals',
      'entity markup': 'Entity Optimization',
      'schema completeness': 'Schema Markup',
      'machine readable': 'Machine Readability',
      'factual claims': 'Content Quality',
      'brand identity': 'Brand Signals',
      'topic coherence': 'Content Structure',
      'og tags': 'Social/Meta',
      'load time': 'Performance',
      'image optimization': 'Performance',
      'readability sentence': 'Readability',
      'paragraph length': 'Readability',
      'list usage': 'Content Structure',
      navigation: 'UX/Navigation',
      'breadcrumb schema': 'UX/Navigation',
      'mobile viewport': 'Mobile',
      'internal linking depth': 'Linking',
      'trust signals': 'Trust Signals',
      // New technical SEO categories
      'hsts header': 'Security',
      'redirect chain': 'Technical SEO',
      'robots wellformed': 'Technical SEO',
      'sitemap valid': 'Technical SEO',
      'noindex check': 'Technical SEO',
      'url structure': 'Technical SEO',
      'broken links': 'Technical SEO',
      'image alt coverage 90': 'Images',
      'security headers': 'Security',
      'mixed content': 'Security',
      'client rendering': 'Technical SEO',
      'hreflang consistency': 'International SEO',
      'no 5xx errors': 'Technical SEO',
      // CQ — Content Quality / E-E-A-T
      'original content': 'Content Quality',
      'heading quality': 'Content Quality',
      'quality signals': 'Content Quality',
      'author attribution': 'E-E-A-T',
      'experience signals': 'E-E-A-T',
      'expertise signals': 'E-E-A-T',
      authoritativeness: 'E-E-A-T',
      trustworthiness: 'E-E-A-T',
      'search intent alignment': 'User Intent',
      'satisfying experience': 'User Experience',
      'anti seo spam': 'Content Quality',
      'ai disclosure': 'Transparency',
      'freshness maintenance': 'Content Freshness',
      // AI Search Readiness
      'clear answers': 'AI Search',
      'entity context': 'AI Search',
      'author info': 'AI Search',
      citations: 'Credibility',
      'org info': 'AI Search',
      // Schema
      organization: 'Schema Markup',
      website: 'Schema Markup',
      breadcrumb: 'Schema Markup',
      article: 'Schema Markup',
      product: 'Schema Markup',
      faq: 'Schema Markup',
      localbusiness: 'Schema Markup',
      person: 'Schema Markup',
      service: 'Schema Markup',
      // Performance
      'page size': 'Performance',
      images: 'Images',
      'js resources': 'Performance',
      'css resources': 'Performance',
      fonts: 'Performance',
      'render blocking': 'Performance',
      caching: 'Performance',
      compression: 'Performance',
      'mobile performance': 'Mobile',
      // Mobile
      'responsive design': 'Mobile',
      'text size': 'Mobile',
      'touch targets': 'Mobile',
      'horizontal overflow': 'Mobile',
      'image scaling': 'Mobile',
      // Local SEO
      'nap consistency': 'Local SEO',
      schema: 'Local SEO',
      'location pages': 'Local SEO',
      keywords: 'Local SEO',
      reviews: 'Local SEO',
      maps: 'Local SEO',
      gbp: 'Local SEO',
      // Security
      'https enforcement': 'Security',
      'x frame options': 'Security',
      'x content type options': 'Security',
      'content security policy': 'Security',
      'referrer policy': 'Security',
      'permissions policy': 'Security',
      'sensitive paths exposed': 'Security',
      'insecure resource loading': 'Security',
      'server header disclosure': 'Security',
      'security headers count': 'Security',
      // Accessibility
      'image alt text': 'Accessibility',
      'heading hierarchy structure': 'Accessibility',
      'form labels': 'Accessibility',
      'aria landmarks': 'Accessibility',
      'language attribute': 'Accessibility',
      'link text quality': 'Accessibility',
      'color contrast inline': 'Accessibility',
      'skip navigation': 'Accessibility',
      'viewport zoom': 'Accessibility',
      'focus visible': 'Accessibility',
      // Social
      'og title': 'Social Media',
      'og description': 'Social Media',
      'og image': 'Social Media',
      'og url': 'Social Media',
      'og type': 'Social Media',
      'twitter card': 'Social Media',
      'twitter title': 'Social Media',
      'twitter description': 'Social Media',
      'twitter image': 'Social Media',
      favicon: 'Social Media',
      'metadata completeness': 'Social Media',
      'canonical consistency': 'Social Media',
    };
    return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }
  return 'General';
}

/**
 * Group recommendations into 7-day, 30-day, and 90-day action plans.
 */
export function generateActionPlans(recommendations: Recommendation[]): {
  sevenDay: Recommendation[];
  thirtyDay: Recommendation[];
  ninetyDay: Recommendation[];
} {
  const quickWins = recommendations.filter((r) => r.effort === 'quick');
  const moderateItems = recommendations.filter((r) => r.effort === 'moderate');
  const extensiveItems = recommendations.filter((r) => r.effort === 'extensive');

  return {
    sevenDay: quickWins.slice(0, 10),
    thirtyDay: [...quickWins.slice(10), ...moderateItems.slice(0, 10)],
    ninetyDay: [...moderateItems.slice(10), ...extensiveItems],
  };
}
