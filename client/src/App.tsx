import { useEffect, lazy, Suspense, type ComponentType } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useSearchParams } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { registerServiceWorker } from '@/utils/registerSW';
import Layout from '@/components/Layout';
import PageShell from '@/components/PageShell';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';

// ── Chunk error detection & retry helper ────────────────────────────────────────
const CHUNK_ERROR_RE = /Loading chunk \d+ failed|Loading CSS chunk|Failed to fetch dynamically imported module/i;

/** Returns true if the error is a stale-chunk / dynamic-import failure. */
export function isChunkError(error: unknown): boolean {
  if (error instanceof Error) return CHUNK_ERROR_RE.test(error.message);
  if (typeof error === 'string') return CHUNK_ERROR_RE.test(error);
  return false;
}

/** Clear all browser caches and unregister service workers to force fresh assets. */
async function clearAllCaches(): Promise<void> {
  try {
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
    }
    // Clear Cache API caches
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));
    }
  } catch {
    // Best-effort — don't block recovery on cache clearing failures
  }
}

/**
 * Wraps React.lazy() with automatic retry on chunk load failures.
 * On the first chunk error it clears caches and retries once; on persistent
 * failure it re-throws so ErrorBoundary can handle full recovery.
 */
function lazyWithRetry<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (err) {
      if (isChunkError(err)) {
        console.warn('[lazyWithRetry] Chunk load failed, clearing caches and retrying…', err);
        await clearAllCaches();
        // Append a cache-bust param so the browser doesn't serve a cached 404
        const bustUrl = (import.meta.env.BASE_URL || '/') + '?_cb=' + Date.now();
        window.history.replaceState(null, '', bustUrl);
        return await importFn();
      }
      throw err;
    }
  });
}

// ── Lazy-loaded pages (with chunk-error retry) ─────────────────────────────────
const Home = lazyWithRetry(() => import('@/pages/Home'));
const Login = lazyWithRetry(() => import('@/pages/Login'));
const Signup = lazyWithRetry(() => import('@/pages/Signup'));
const Services = lazyWithRetry(() => import('@/pages/Services'));
const AITools = lazyWithRetry(() => import('@/pages/AITools'));
const ToolDetail = lazyWithRetry(() => import('@/pages/ToolDetail'));
const ToolNichePage = lazyWithRetry(() => import('@/pages/ToolNichePage'));
const Blog = lazyWithRetry(() => import('@/pages/Blog'));
const BlogDetail = lazyWithRetry(() => import('@/pages/BlogDetail'));
const About = lazyWithRetry(() => import('@/pages/About'));
const Contact = lazyWithRetry(() => import('@/pages/Contact'));
const BookConsultation = lazyWithRetry(() => import('@/pages/BookConsultation'));
const Resources = lazyWithRetry(() => import('@/pages/Resources'));
const Courses = lazyWithRetry(() => import('@/pages/Courses'));
const Portfolio = lazyWithRetry(() => import('@/pages/Portfolio'));
const PromptLibrary = lazyWithRetry(() => import('@/pages/PromptLibrary'));
const WebsiteAudit = lazyWithRetry(() => import('@/pages/WebsiteAudit'));
const VideoGenerator = lazyWithRetry(() => import('@/pages/VideoGenerator'));
const NotFound = lazyWithRetry(() => import('@/pages/NotFound'));
const PrivacyPolicy = lazyWithRetry(() => import('@/pages/PrivacyPolicy'));
const TermsOfService = lazyWithRetry(() => import('@/pages/TermsOfService'));
const CookiePolicy = lazyWithRetry(() => import('@/pages/CookiePolicy'));
const HtmlSitemap = lazyWithRetry(() => import('@/pages/HtmlSitemap'));
const WebsiteIntelligence = lazyWithRetry(() => import('@/pages/WebsiteIntelligence'));
const ContentTemplates = lazyWithRetry(() => import('@/pages/ContentTemplates'));
const Referral = lazyWithRetry(() => import('@/pages/Referral'));
const ThirtyDayPlan = lazyWithRetry(() => import('@/pages/ThirtyDayPlan'));
const SubscriptionSuccess = lazyWithRetry(() => import('@/pages/SubscriptionSuccess'));
const SubscriptionCancel = lazyWithRetry(() => import('@/pages/SubscriptionCancel'));
const Advertisement = lazyWithRetry(() => import('@/pages/Advertisement'));
const AdPaymentSuccess = lazyWithRetry(() => import('@/pages/AdPaymentSuccess'));
const AdPaymentCancel = lazyWithRetry(() => import('@/pages/AdPaymentCancel'));
const AdDashboard = lazyWithRetry(() => import('@/pages/AdDashboard'));
const CardPayment = lazyWithRetry(() => import('@/pages/CardPayment'));
const WebsiteCloner = lazyWithRetry(() => import('@/pages/WebsiteCloner'));
const AdvertiseWithUs = lazyWithRetry(() => import('@/pages/AdvertiseWithUs'));
const SeoBacklinkStudio = lazyWithRetry(() => import('@/pages/SeoBacklinkStudio'));
const WhatsAppBusinessGenerator = lazyWithRetry(() => import('@/pages/WhatsAppBusinessGenerator'));
const Shop = lazyWithRetry(() => import('@/pages/Shop'));
const EpisodeScripts = lazyWithRetry(() => import('@/pages/EpisodeScripts'));
const FreeAITokensHub = lazyWithRetry(() => import('@/pages/FreeAITokensHub'));
const Help = lazyWithRetry(() => import('@/pages/Help'));

// ── Lazy-loaded dashboard layout + pages (with chunk-error retry) ───────────────
const DashboardLayout = lazyWithRetry(() => import('@/components/dashboard/DashboardLayout'));
const DashboardOverview = lazyWithRetry(() => import('@/pages/dashboard/DashboardOverview'));
const DashboardProjects = lazyWithRetry(() => import('@/pages/dashboard/DashboardProjects'));
const DashboardAudits = lazyWithRetry(() => import('@/pages/dashboard/DashboardAudits'));
const DashboardAeoAudit = lazyWithRetry(() => import('@/pages/dashboard/DashboardAeoAudit'));
const DashboardSchema = lazyWithRetry(() => import('@/pages/dashboard/DashboardSchema'));
const DashboardPerformance = lazyWithRetry(() => import('@/pages/dashboard/DashboardPerformance'));
const DashboardMobile = lazyWithRetry(() => import('@/pages/dashboard/DashboardMobile'));
const DashboardLocalSeo = lazyWithRetry(() => import('@/pages/dashboard/DashboardLocalSeo'));
const DashboardCompetitors = lazyWithRetry(() => import('@/pages/dashboard/DashboardCompetitors'));
const DashboardKeywords = lazyWithRetry(() => import('@/pages/dashboard/DashboardKeywords'));
const DashboardBacklinks = lazyWithRetry(() => import('@/pages/dashboard/DashboardBacklinks'));
const DashboardContent = lazyWithRetry(() => import('@/pages/dashboard/DashboardContent'));
const DashboardAIVisibility = lazyWithRetry(() => import('@/pages/dashboard/DashboardAIVisibility'));
const DashboardRecommendations = lazyWithRetry(() => import('@/pages/dashboard/DashboardRecommendations'));
const DashboardReports = lazyWithRetry(() => import('@/pages/dashboard/DashboardReports'));
const DashboardSettings = lazyWithRetry(() => import('@/pages/dashboard/DashboardSettings'));
const DashboardSecurity = lazyWithRetry(() => import('@/pages/dashboard/DashboardSecurity'));
const DashboardSecurityAudit = lazyWithRetry(() => import('@/pages/dashboard/DashboardSecurityAudit'));
const DashboardAccessibility = lazyWithRetry(() => import('@/pages/dashboard/DashboardAccessibility'));
const DashboardSocial = lazyWithRetry(() => import('@/pages/dashboard/DashboardSocial'));
const DashboardSearchPerformance = lazyWithRetry(() => import('@/pages/dashboard/DashboardSearchPerformance'));
const DashboardAICenter = lazyWithRetry(() => import('@/pages/dashboard/DashboardAICenter'));
const DashboardWebsiteIntel = lazyWithRetry(() => import('@/pages/dashboard/DashboardWebsiteIntel'));
const DashboardSecurityCenter = lazyWithRetry(() => import('@/pages/dashboard/DashboardSecurityCenter'));
const DashboardEcommerceIntel = lazyWithRetry(() => import('@/pages/dashboard/DashboardEcommerceIntel'));
const DashboardBusinessGrowth = lazyWithRetry(() => import('@/pages/dashboard/DashboardBusinessGrowth'));
const AdminConsole = lazyWithRetry(() => import('@/pages/dashboard/AdminConsole'));

// ── Route change transition manager ───────────────────────────────────────────

function RouteTransitionManager({ children }: { children: React.ReactNode }) {
  // Full-page transition overlay disabled for instant page loads.
  // Content renders immediately without any loading screen or splash.
  return (
    <div className="opacity-100" data-icod-id="src_app_tsx_page_content_wrap">
      {children}
    </div>
  );
}

// ── Capture ?ref=XXXXX from URL and store in localStorage ─────────────────────
function ReferralCapture() {
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref && /^[A-Za-z0-9]{6,12}$/.test(ref)) {
      localStorage.setItem('referralCode', ref.toUpperCase());
    }
  }, [searchParams]);
  return null;
}

export default function App() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <ErrorBoundary data-icod-id="src_app_tsx_1394">
      <HelmetProvider data-icod-id="src_app_tsx_b653">
        <BrowserRouter>
          <ReferralCapture data-icod-id="src_app_tsx_1d06" />
          <RouteTransitionManager data-icod-id="src_app_tsx_transition_mgr">
              <Routes>
              {/* ── Auth routes (no site layout) ── */}
              <Route path="/login" element={<Suspense fallback={<PageShell title="Login" data-icod-id="src_app_tsx_13c4" />}><Login data-icod-id="src_app_tsx_3978" /></Suspense>} />
              <Route path="/signup" element={<Suspense fallback={<PageShell title="Sign Up" data-icod-id="src_app_tsx_6045" />}><Signup data-icod-id="src_app_tsx_f290" /></Suspense>} />

              {/* ── Public website routes (wrapped in site Layout) ── */}
              <Route element={<Layout data-icod-id="src_app_tsx_b7dc"><Outlet /></Layout>}>
                <Route path="/" element={<Suspense fallback={<PageShell title="Home" data-icod-id="src_app_tsx_fe88" />}><Home data-icod-id="src_app_tsx_6615" /></Suspense>} />
                <Route path="/services" element={<Suspense fallback={<PageShell title="Services" data-icod-id="src_app_tsx_1832" />}><Services data-icod-id="src_app_tsx_9394" /></Suspense>} />
                <Route path="/ai-tools" element={<Suspense fallback={<PageShell title="AI Tools" data-icod-id="src_app_tsx_d88e" />}><AITools data-icod-id="src_app_tsx_1f3d" /></Suspense>} />
                <Route path="/ai-tools/free-ai-tokens-hub" element={<Suspense fallback={<PageShell title="Free AI Tokens" data-icod-id="src_app_tsx_1cc6" />}><FreeAITokensHub data-icod-id="src_app_tsx_free_ai_tokens_hub" /></Suspense>} />
                <Route path="/tools/free-ai-tokens-hub" element={<Suspense fallback={<PageShell title="Free AI Tokens" data-icod-id="src_app_tsx_9be1" />}><FreeAITokensHub data-icod-id="src_app_tsx_free_ai_tokens_hub_alias" /></Suspense>} />
                <Route path="/tools/seo-backlink-studio" element={<Suspense fallback={<PageShell title="SEO Backlink Studio" data-icod-id="src_app_tsx_bc0b" />}><SeoBacklinkStudio data-icod-id="src_app_tsx_seo_backlink_studio" /></Suspense>} />
                <Route path="/tools/whatsapp-business-generator" element={<Suspense fallback={<PageShell title="WhatsApp Generator" data-icod-id="src_app_tsx_7378" />}><WhatsAppBusinessGenerator data-icod-id="src_app_tsx_whatsapp_biz_gen" /></Suspense>} />
                <Route path="/tools/:slug" element={<Suspense fallback={<PageShell title="Tool" data-icod-id="src_app_tsx_f970" />}><ToolDetail data-icod-id="src_app_tsx_bf4c" /></Suspense>} />
                <Route path="/tools/:toolSlug/:niche" element={<Suspense fallback={<PageShell title="Tool" data-icod-id="src_app_tsx_f4a6" />}><ToolNichePage data-icod-id="src_app_tsx_a3b3" /></Suspense>} />
                <Route path="/blog" element={<Suspense fallback={<PageShell title="Blog" data-icod-id="src_app_tsx_366a" />}><Blog data-icod-id="src_app_tsx_9dbd" /></Suspense>} />
                <Route path="/blog/:id" element={<Suspense fallback={<PageShell title="Blog Post" data-icod-id="src_app_tsx_b6c2" />}><BlogDetail data-icod-id="src_app_tsx_4f44" /></Suspense>} />
                <Route path="/about" element={<Suspense fallback={<PageShell title="About" data-icod-id="src_app_tsx_7822" />}><About data-icod-id="src_app_tsx_27cd" /></Suspense>} />
                <Route path="/portfolio" element={<Suspense fallback={<PageShell title="Portfolio" data-icod-id="src_app_tsx_c473" />}><Portfolio data-icod-id="src_app_tsx_portfolio" /></Suspense>} />
                <Route path="/contact" element={<Suspense fallback={<PageShell title="Contact" data-icod-id="src_app_tsx_0dc3" />}><Contact data-icod-id="src_app_tsx_c5f4" /></Suspense>} />
                <Route path="/book" element={<Suspense fallback={<PageShell title="Book Consultation" data-icod-id="src_app_tsx_20ea" />}><BookConsultation data-icod-id="src_app_tsx_1df8" /></Suspense>} />
                <Route path="/book-consultation" element={<Suspense fallback={<PageShell title="Book Consultation" data-icod-id="src_app_tsx_07ee" />}><BookConsultation data-icod-id="src_app_tsx_d198" /></Suspense>} />
                <Route path="/resources" element={<Suspense fallback={<PageShell title="Resources" data-icod-id="src_app_tsx_9fa9" />}><Resources data-icod-id="src_app_tsx_f730" /></Suspense>} />
                <Route path="/courses" element={<Suspense fallback={<PageShell title="Courses" data-icod-id="src_app_tsx_674f" />}><Courses data-icod-id="src_app_tsx_8152" /></Suspense>} />
                <Route path="/prompt-library" element={<Suspense fallback={<PageShell title="Prompt Library" data-icod-id="src_app_tsx_a0cd" />}><PromptLibrary data-icod-id="src_app_tsx_6e33" /></Suspense>} />
                <Route path="/website-audit" element={<Suspense fallback={<PageShell title="Website Audit" data-icod-id="src_app_tsx_dff0" />}><WebsiteAudit data-icod-id="src_app_tsx_90fe" /></Suspense>} />
                <Route path="/video-generator" element={<Suspense fallback={<PageShell title="Video Generator" data-icod-id="src_app_tsx_ed50" />}><VideoGenerator data-icod-id="src_app_tsx_video_gen" /></Suspense>} />
                <Route path="/privacy-policy" element={<Suspense fallback={<PageShell title="Privacy Policy" data-icod-id="src_app_tsx_b85b" />}><PrivacyPolicy data-icod-id="src_app_tsx_4498" /></Suspense>} />
                <Route path="/terms-of-service" element={<Suspense fallback={<PageShell title="Terms of Service" data-icod-id="src_app_tsx_c0a3" />}><TermsOfService data-icod-id="src_app_tsx_b7d1" /></Suspense>} />
                <Route path="/cookie-policy" element={<Suspense fallback={<PageShell title="Cookie Policy" data-icod-id="src_app_tsx_c823" />}><CookiePolicy data-icod-id="src_app_tsx_56af" /></Suspense>} />
                <Route path="/sitemap" element={<Suspense fallback={<PageShell title="Sitemap" data-icod-id="src_app_tsx_4dfe" />}><HtmlSitemap data-icod-id="src_app_tsx_98b8" /></Suspense>} />
                <Route path="/website-intelligence" element={<Suspense fallback={<PageShell title="Website Intelligence" data-icod-id="src_app_tsx_c58d" />}><WebsiteIntelligence data-icod-id="src_app_tsx_d0f5" /></Suspense>} />
                <Route path="/content-templates" element={<Suspense fallback={<PageShell title="Content Templates" data-icod-id="src_app_tsx_69bc" />}><ContentTemplates data-icod-id="src_app_tsx_content_templates" /></Suspense>} />
                <Route path="/referral" element={<Suspense fallback={<PageShell title="Referral" data-icod-id="src_app_tsx_ac39" />}><Referral data-icod-id="src_app_tsx_fd8d" /></Suspense>} />
                <Route path="/30-day-plan" element={<Suspense fallback={<PageShell title="30-Day Plan" data-icod-id="src_app_tsx_615d" />}><ThirtyDayPlan data-icod-id="src_app_tsx_30day_plan" /></Suspense>} />
                <Route path="/advertisement" element={<Suspense fallback={<PageShell title="Advertisement" data-icod-id="src_app_tsx_65a0" />}><Advertisement data-icod-id="src_app_tsx_adb4" /></Suspense>} />
                <Route path="/website-cloner" element={<Suspense fallback={<PageShell title="Website Cloner" data-icod-id="src_app_tsx_c420" />}><WebsiteCloner data-icod-id="src_app_tsx_website_cloner" /></Suspense>} />
                <Route path="/advertise" element={<Suspense fallback={<PageShell title="Advertise" data-icod-id="src_app_tsx_db3a" />}><AdvertiseWithUs data-icod-id="src_app_tsx_advertise_with_us" /></Suspense>} />
                <Route path="/shop" element={<Suspense fallback={<PageShell title="Shop" data-icod-id="src_app_tsx_6b6b" />}><Shop data-icod-id="src_app_tsx_shop" /></Suspense>} />
                <Route path="/episode-scripts" element={<Suspense fallback={<PageShell title="Episode Scripts" data-icod-id="src_app_tsx_362f" />}><EpisodeScripts data-icod-id="src_app_tsx_episode_scripts" /></Suspense>} />
                <Route path="/help" element={<Suspense fallback={<PageShell title="Help" data-icod-id="src_app_tsx_83e5" />}><Help data-icod-id="src_app_tsx_help" /></Suspense>} />
                {/* Redirect legacy path to canonical path */}
                <Route path="/thirty-day-plan" element={<Navigate to="/30-day-plan" replace />} />
              </Route>

              {/* ── Card Payment (protected — requires auth, inside Layout) ── */}
              <Route element={<ProtectedRoute data-icod-id="src_app_tsx_card_payment_protected" />}>
                <Route path="/card-payment" element={<Layout data-icod-id="src_app_tsx_card_payment_layout"><Suspense fallback={<PageShell title="Payment" data-icod-id="src_app_tsx_e8fa" />}><CardPayment data-icod-id="src_app_tsx_card_payment" /></Suspense></Layout>} />
              </Route>

              {/* ── Subscription result pages (outside Layout — standalone) ── */}
              <Route path="/subscription/success" element={<Suspense fallback={<PageShell title="Success" data-icod-id="src_app_tsx_74c3" />}><SubscriptionSuccess data-icod-id="src_app_tsx_sub_success" /></Suspense>} />
              <Route path="/subscription/cancel" element={<Suspense fallback={<PageShell title="Cancelled" data-icod-id="src_app_tsx_1ec0" />}><SubscriptionCancel data-icod-id="src_app_tsx_sub_cancel" /></Suspense>} />

              {/* ── Ad payment result pages (outside Layout — standalone) ── */}
              <Route path="/ad-payment/success" element={<Suspense fallback={<PageShell title="Success" data-icod-id="src_app_tsx_bed4" />}><AdPaymentSuccess data-icod-id="src_app_tsx_4130" /></Suspense>} />
              <Route path="/ad-payment/cancel" element={<Suspense fallback={<PageShell title="Cancelled" data-icod-id="src_app_tsx_b8c1" />}><AdPaymentCancel data-icod-id="src_app_tsx_2ace" /></Suspense>} />

              {/* ── Ad Dashboard (protected — requires auth, inside Layout) ── */}
              <Route element={<ProtectedRoute data-icod-id="src_app_tsx_ad_dashboard_protected" />}>
                <Route path="/ad-dashboard" element={<Layout data-icod-id="src_app_tsx_ad_dashboard_layout"><Suspense fallback={<PageShell title="Ad Dashboard" data-icod-id="src_app_tsx_e51f" />}><AdDashboard data-icod-id="src_app_tsx_ad_dashboard" /></Suspense></Layout>} />
              </Route>

              {/* ── Dashboard routes (protected — requires auth) ── */}
              <Route element={<ProtectedRoute data-icod-id="src_app_tsx_8ff5" />}>
                <Route path="/dashboard" element={<Suspense fallback={<PageShell title="Dashboard" data-icod-id="src_app_tsx_a7ba" />}><DashboardLayout data-icod-id="src_app_tsx_5c31" /></Suspense>}>
                  <Route index element={<Suspense fallback={<PageShell title="Overview" data-icod-id="src_app_tsx_26e2" />}><DashboardOverview data-icod-id="src_app_tsx_2b25" /></Suspense>} />
                  <Route path="projects" element={<Suspense fallback={<PageShell title="Projects" data-icod-id="src_app_tsx_3010" />}><DashboardProjects data-icod-id="src_app_tsx_82bf" /></Suspense>} />
                  <Route path="audits" element={<Suspense fallback={<PageShell title="Audits" data-icod-id="src_app_tsx_826e" />}><DashboardAudits data-icod-id="src_app_tsx_9c4b" /></Suspense>} />
                  <Route path="aeo-audit" element={<Suspense fallback={<PageShell title="AEO Audit" data-icod-id="src_app_tsx_4ae4" />}><DashboardAeoAudit data-icod-id="src_app_tsx_95d6" /></Suspense>} />
                  <Route path="schema" element={<Suspense fallback={<PageShell title="Schema" data-icod-id="src_app_tsx_bbef" />}><DashboardSchema data-icod-id="src_app_tsx_48d4" /></Suspense>} />
                  <Route path="performance" element={<Suspense fallback={<PageShell title="Performance" data-icod-id="src_app_tsx_15d7" />}><DashboardPerformance data-icod-id="src_app_tsx_554a" /></Suspense>} />
                  <Route path="mobile" element={<Suspense fallback={<PageShell title="Mobile" data-icod-id="src_app_tsx_5372" />}><DashboardMobile data-icod-id="src_app_tsx_a2cd" /></Suspense>} />
                  <Route path="local-seo" element={<Suspense fallback={<PageShell title="Local SEO" data-icod-id="src_app_tsx_a9c8" />}><DashboardLocalSeo data-icod-id="src_app_tsx_7214" /></Suspense>} />
                  <Route path="competitors" element={<Suspense fallback={<PageShell title="Competitors" data-icod-id="src_app_tsx_7255" />}><DashboardCompetitors data-icod-id="src_app_tsx_9305" /></Suspense>} />
                  <Route path="keywords" element={<Suspense fallback={<PageShell title="Keywords" data-icod-id="src_app_tsx_73e7" />}><DashboardKeywords data-icod-id="src_app_tsx_9546" /></Suspense>} />
                  <Route path="backlinks" element={<Suspense fallback={<PageShell title="Backlinks" data-icod-id="src_app_tsx_7f86" />}><DashboardBacklinks data-icod-id="src_app_tsx_c326" /></Suspense>} />
                  <Route path="content" element={<Suspense fallback={<PageShell title="Content" data-icod-id="src_app_tsx_e95b" />}><DashboardContent data-icod-id="src_app_tsx_a2c6" /></Suspense>} />
                  <Route path="ai-visibility" element={<Suspense fallback={<PageShell title="AI Visibility" data-icod-id="src_app_tsx_f353" />}><DashboardAIVisibility data-icod-id="src_app_tsx_ba3e" /></Suspense>} />
                  <Route path="recommendations" element={<Suspense fallback={<PageShell title="Recommendations" data-icod-id="src_app_tsx_46c8" />}><DashboardRecommendations data-icod-id="src_app_tsx_0f11" /></Suspense>} />
                  <Route path="reports" element={<Suspense fallback={<PageShell title="Reports" data-icod-id="src_app_tsx_400a" />}><DashboardReports data-icod-id="src_app_tsx_236e" /></Suspense>} />
                  <Route path="security" element={<Suspense fallback={<PageShell title="Security" data-icod-id="src_app_tsx_a4ba" />}><DashboardSecurity data-icod-id="src_app_tsx_1ee1" /></Suspense>} />
                  <Route path="security-audit" element={<Suspense fallback={<PageShell title="Security Audit" data-icod-id="src_app_tsx_d1e7" />}><DashboardSecurityAudit data-icod-id="src_app_tsx_security_audit" /></Suspense>} />
                  <Route path="accessibility" element={<Suspense fallback={<PageShell title="Accessibility" data-icod-id="src_app_tsx_e8f9" />}><DashboardAccessibility data-icod-id="src_app_tsx_48fe" /></Suspense>} />
                  <Route path="social" element={<Suspense fallback={<PageShell title="Social" data-icod-id="src_app_tsx_2881" />}><DashboardSocial data-icod-id="src_app_tsx_35d9" /></Suspense>} />
                  <Route path="search-performance" element={<Suspense fallback={<PageShell title="Search Performance" data-icod-id="src_app_tsx_c3cb" />}><DashboardSearchPerformance data-icod-id="src_app_tsx_search_perf" /></Suspense>} />
                  {/* ── New Intelligence Modules ── */}
                  <Route path="ai-center" element={<Suspense fallback={<PageShell title="AI Center" data-icod-id="src_app_tsx_340c" />}><DashboardAICenter data-icod-id="src_app_tsx_efc7" /></Suspense>} />
                  <Route path="website-intel" element={<Suspense fallback={<PageShell title="Website Intel" data-icod-id="src_app_tsx_2755" />}><DashboardWebsiteIntel data-icod-id="src_app_tsx_3131" /></Suspense>} />
                  <Route path="security-center" element={<Suspense fallback={<PageShell title="Security Center" data-icod-id="src_app_tsx_a498" />}><DashboardSecurityCenter data-icod-id="src_app_tsx_0633" /></Suspense>} />
                  <Route path="ecommerce-intel" element={<Suspense fallback={<PageShell title="Ecommerce Intel" data-icod-id="src_app_tsx_51a2" />}><DashboardEcommerceIntel data-icod-id="src_app_tsx_7c82" /></Suspense>} />
                  <Route path="business-growth" element={<Suspense fallback={<PageShell title="Business Growth" data-icod-id="src_app_tsx_01b7" />}><DashboardBusinessGrowth data-icod-id="src_app_tsx_bc93" /></Suspense>} />
                  {/* Admin-only settings — role check handled inside the page component */}
                  <Route path="settings" element={<Suspense fallback={<PageShell title="Settings" data-icod-id="src_app_tsx_2eaa" />}><DashboardSettings data-icod-id="src_app_tsx_78b2" /></Suspense>} />
                  {/* Admin Console — admin only */}
                  <Route path="admin-console" element={<Suspense fallback={<PageShell title="Admin Console" data-icod-id="src_app_tsx_6a93" />}><AdminConsole data-icod-id="src_app_tsx_admin_console" /></Suspense>} />
                </Route>
              </Route>

              {/* ── 404 catch-all ── */}
                <Route path="*" element={<Suspense fallback={<PageShell data-icod-id="src_app_tsx_e5d1" />}><NotFound data-icod-id="src_app_tsx_bd5d" /></Suspense>} />
              </Routes>
            </RouteTransitionManager>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
