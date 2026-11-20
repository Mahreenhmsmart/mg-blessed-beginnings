/**
 * Page prefetch map — maps route paths to their dynamic import() so that
 * hovering/focusing a nav link can start downloading the chunk before click.
 *
 * Each entry is a zero-arg function that triggers the browser's module fetch
 * without awaiting it. The call is intentionally fire-and-forget.
 */

const pageImports: Record<string, () => void> = {
  '/':               () => { import('@/pages/Home'); },
  '/ai-tools':       () => { import('@/pages/AITools'); },
  '/services':       () => { import('@/pages/Services'); },
  '/shop':           () => { import('@/pages/Shop'); },
  '/blog':           () => { import('@/pages/Blog'); },
  '/contact':        () => { import('@/pages/Contact'); },
  '/about':          () => { import('@/pages/About'); },
  '/portfolio':      () => { import('@/pages/Portfolio'); },
  '/book-consultation': () => { import('@/pages/BookConsultation'); },
  '/30-day-plan':    () => { import('@/pages/ThirtyDayPlan'); },
  '/website-intelligence': () => { import('@/pages/WebsiteIntelligence'); },
  '/website-audit':  () => { import('@/pages/WebsiteAudit'); },
  '/website-cloner': () => { import('@/pages/WebsiteCloner'); },
  '/advertise':      () => { import('@/pages/AdvertiseWithUs'); },
  '/referral':       () => { import('@/pages/Referral'); },
  '/help':           () => { import('@/pages/Help'); },
  '/login':          () => { import('@/pages/Login'); },
  '/signup':         () => { import('@/pages/Signup'); },
};

// Track which paths have already been prefetched to avoid duplicate requests.
const prefetched = new Set<string>();

/**
 * Prefetch the JS chunk for a given route path. Safe to call multiple times —
 * subsequent calls are no-ops. Designed to be attached to onMouseEnter / onFocus
 * of navigation links.
 */
export function prefetchPage(path: string): void {
  if (prefetched.has(path)) return;
  const loader = pageImports[path];
  if (loader) {
    prefetched.add(path);
    loader();
  }
}
