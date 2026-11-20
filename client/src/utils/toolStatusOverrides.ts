/**
 * Shared tool status override constants.
 * These ensure consistent status display across all views (cards, homepage, detail pages).
 */

// Tools that should ALWAYS show as "Coming Soon" regardless of their database status.
// This is the single source of truth for force-override logic.
export const FORCE_COMING_SOON_SLUGS = [
  'ai-video-generator',
  'listing-health-score',
] as const;

// Tools with working generators that should appear live even if DB status is coming_soon
export const LIVE_OVERRIDE_SLUGS = [
  'branding-assistant',
  'product-description-generator',
  'seo-title-optimizer',
  'hashtag-generator',
  'profit-calculator',
  'competitor-analyzer',
  'review-response-writer',
  'listing-optimizer',
  'social-media-studio',
  'prompt-library',
  'keyword-research',
  'brand-campaign-studio',
] as const;

/**
 * Compute the effective status for a tool, applying override rules.
 * @param slug - The tool's slug
 * @param dbStatus - The status from the database
 * @returns The effective status to display
 */
export function getEffectiveStatus(slug: string, dbStatus?: string): string {
  // Force coming_soon takes precedence
  if ((FORCE_COMING_SOON_SLUGS as readonly string[]).includes(slug)) {
    return 'coming_soon';
  }
  
  // Live override: if DB says coming_soon but tool has working generator
  if (dbStatus === 'coming_soon' && (LIVE_OVERRIDE_SLUGS as readonly string[]).includes(slug)) {
    return 'live';
  }
  
  // Default to DB status or 'live'
  return dbStatus || 'live';
}
