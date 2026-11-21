import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://mgblessed.icod.ai";
const HOMEPAGE_OG_IMAGE = `${SITE_URL}/assets/1795177902729_mg-logo-new-transparent-upload.webp`;

/**
 * useSeo — sole runtime SEO writer.
 *
 * Writes document.title, meta description, og:*, twitter:*, canonical,
 * og:image, and og:url on every route change (including the homepage).
 * Uses imperative DOM manipulation so there is no dependency on
 * react-helmet-async for these tags.
 */
export function useSeo(fullTitle: string, description: string) {
  const { pathname } = useLocation();

  useEffect(() => {
    // ── Title & meta description ────────────────────────────────────────
    document.title = fullTitle;

    const setMeta = (attr: string, value: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${value}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, value);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);

    // ── Canonical URL ───────────────────────────────────────────────────
    const canonicalUrl = `${SITE_URL}${pathname === "/" ? "" : pathname}`;
    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute("href", canonicalUrl);

    // ── og:image ────────────────────────────────────────────────────────
    // Homepage uses the logo image; inner pages fall back to the same logo
    // since no per-page ogImage exists in pageMeta yet.
    const ogImage = pathname === "/" ? HOMEPAGE_OG_IMAGE : HOMEPAGE_OG_IMAGE;
    setMeta("property", "og:image", ogImage);

    // ── og:url ──────────────────────────────────────────────────────────
    setMeta("property", "og:url", canonicalUrl);
  }, [fullTitle, description, pathname]);
}
