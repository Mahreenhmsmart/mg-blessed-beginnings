/**
 * Local SEO Analyzer — Evaluates local search optimization signals.
 * Conditionally relevant for businesses with physical locations.
 * Checks NAP consistency, LocalBusiness schema, location pages, local keywords,
 * reviews signals, maps integration, and local citations.
 */

import type { CrawlResult } from './crawlerService';
import type { CheckResult, LayerResults } from '../models/Audit';

interface LocalCheck {
  id: string;
  name: string;
  maxPoints: number;
  evaluate: (crawl: CrawlResult) => { status: 'pass' | 'warn' | 'fail'; points: number; details: string };
}

const localChecks: LocalCheck[] = [
  {
    id: 'local-nap-consistency',
    name: 'NAP Consistency',
    maxPoints: 15,
    evaluate: (crawl) => {
      const text = crawl.visibleText;
      const html = crawl.html;
      // Look for address patterns
      const hasAddress = /\d+\s+(?:[A-Z][a-z]+\s+){1,4}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl)/i.test(text);
      const hasPhone = /(?:tel:|phone:?|call:?|\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/i.test(html);
      const hasEmail = /mailto:[^"'\s]+@[^\s"']+/i.test(html);
      const hasCityState = /,\s*[A-Z]{2}\s+\d{5}|,\s*[A-Z][a-z]+,\s*[A-Z]{2}/i.test(text);
      const signals = [hasAddress, hasPhone, hasEmail, hasCityState].filter(Boolean).length;
      if (signals >= 3) return { status: 'pass', points: 15, details: 'Strong NAP signals: address, phone, email, and city/state found on page.' };
      if (signals >= 2) return { status: 'warn', points: 8, details: `${signals}/4 NAP elements found. Ensure Name, Address, Phone are consistent across all pages.` };
      return { status: 'fail', points: 0, details: 'Weak NAP presence. Add your business name, full address, and phone number consistently on every page.' };
    },
  },
  {
    id: 'local-schema',
    name: 'LocalBusiness Schema',
    maxPoints: 15,
    evaluate: (crawl) => {
      let raw: Record<string, unknown> | null = null;
      for (const sd of crawl.structuredData) {
        const t = sd.type.toLowerCase();
        if (t === 'localbusiness' || t.includes('localbusiness')) {
          raw = sd.raw;
          break;
        }
      }
      if (!raw) return { status: 'fail', points: 0, details: 'No LocalBusiness schema found. Add JSON-LD with @type "LocalBusiness", name, address, phone, and openingHours.' };
      const fields = ['name', 'address', 'telephone'];
      const present = fields.filter((f) => raw![f]).length;
      if (present === 3) return { status: 'pass', points: 15, details: `LocalBusiness schema complete with name, address, and telephone.` };
      if (present >= 1) return { status: 'warn', points: 7, details: `LocalBusiness schema missing ${3 - present} required field(s): ${fields.filter((f) => !raw![f]).join(', ')}.` };
      return { status: 'warn', points: 3, details: 'LocalBusiness schema exists but is empty. Fill in name, address, and telephone.' };
    },
  },
  {
    id: 'local-location-pages',
    name: 'Location Pages',
    maxPoints: 12,
    evaluate: (crawl) => {
      const internalLinks = crawl.internalLinks;
      const locationPatterns = /\/(?:locations?|offices?|branches?|stores?|areas?|cities?|regions?|near-me|in-[a-z])/i;
      const locationLinks = internalLinks.filter((l) => locationPatterns.test(l));
      if (locationLinks.length >= 2) return { status: 'pass', points: 12, details: `${locationLinks.length} location-specific pages linked from this page.` };
      if (locationLinks.length === 1) return { status: 'warn', points: 6, details: '1 location page linked. Create dedicated landing pages for each service area or branch.' };
      return { status: 'warn', points: 0, details: 'No location pages detected. If you serve multiple areas, create location-specific landing pages.' };
    },
  },
  {
    id: 'local-keywords',
    name: 'Local Keywords',
    maxPoints: 12,
    evaluate: (crawl) => {
      const text = crawl.visibleText.toLowerCase();
      const title = (crawl.title || '').toLowerCase();
      // Common local keyword patterns
      const localPatterns = [
        /\bnear\s+me\b/i, /\bin\s+[a-z]+\b/i, /\blocal\b/i, /\bnearby\b/i,
        /\b(city|town|county|state|region)\b/i, /\b(area|neighborhood|district)\b/i,
        /\bserving\b/i, /\bserve[sd]?\b/i,
      ];
      const matches = localPatterns.filter((p) => p.test(text) || p.test(title)).length;
      if (matches >= 3) return { status: 'pass', points: 12, details: 'Good local keyword presence in content and title.' };
      if (matches >= 1) return { status: 'warn', points: 6, details: `${matches} local keyword signal(s) found. Include city/area names in titles, headings, and body content.` };
      return { status: 'warn', points: 0, details: 'No local keyword signals found. Add location-specific terms to your page titles, headings, and content.' };
    },
  },
  {
    id: 'local-reviews',
    name: 'Reviews & Ratings Signals',
    maxPoints: 12,
    evaluate: (crawl) => {
      const html = crawl.html;
      const text = crawl.visibleText;
      const hasReviewSchema = crawl.structuredData.some((sd) => {
        const t = sd.type.toLowerCase();
        return t === 'review' || t === 'aggregateRating' || t.includes('review');
      });
      const hasReviewContent = /review|rating|stars?|testimonial|customer\s+feedback/i.test(text);
      const hasThirdParty = /google.*reviews?|yelp|trustpilot|facebook.*reviews?|bbb|angie/i.test(html);
      const signals = [hasReviewSchema, hasReviewContent, hasThirdParty].filter(Boolean).length;
      if (signals >= 2) return { status: 'pass', points: 12, details: 'Strong review signals: structured data, on-page reviews, and third-party references.' };
      if (signals === 1) return { status: 'warn', points: 6, details: 'Basic review signal found. Add customer testimonials and link to your Google Business Profile reviews.' };
      return { status: 'fail', points: 0, details: 'No review signals found. Display customer reviews/testimonials and add Review schema markup.' };
    },
  },
  {
    id: 'local-maps',
    name: 'Maps Integration',
    maxPoints: 12,
    evaluate: (crawl) => {
      const html = crawl.html;
      const hasGoogleMap = /maps\.googleapis\.com|google\.com\/maps|embed\?pb=/i.test(html);
      const hasMapEmbed = /<iframe[^>]*(?:maps|openstreetmap|bing.*maps)/i.test(html);
      const hasMapLink = /href=["'][^"']*maps\.google[^"']*["']/i.test(html);
      const hasGeoCoords = /geo:|latitude|longitude|"geo"/i.test(html);
      const signals = [hasGoogleMap || hasMapEmbed, hasMapLink, hasGeoCoords].filter(Boolean).length;
      if (signals >= 2) return { status: 'pass', points: 12, details: 'Maps integration detected: embedded map and/or location links.' };
      if (signals === 1) return { status: 'warn', points: 6, details: 'Basic maps signal found. Embed a Google Map showing your business location.' };
      return { status: 'fail', points: 0, details: 'No maps integration found. Embed a Google Map on your contact/location page.' };
    },
  },
  {
    id: 'local-citations',
    name: 'Local Citations & Directories',
    maxPoints: 12,
    evaluate: (crawl) => {
      const extLinks = crawl.externalLinks;
      const directoryPatterns = /(yelp|yellowpages|superpages|merchantcircle|manta|citysearch|local\.com|dexknows|insiderpages|judysbook|foursquare|bingplaces|apple.*maps)/i;
      const socialPatterns = /(facebook\.com|linkedin\.com|instagram\.com|twitter\.com|x\.com)/i;
      const dirLinks = extLinks.filter((l) => directoryPatterns.test(l)).length;
      const socialLinks = extLinks.filter((l) => socialPatterns.test(l)).length;
      const total = dirLinks + socialLinks;
      if (total >= 4) return { status: 'pass', points: 12, details: `${dirLinks} directory + ${socialLinks} social citations linked. Strong local citation profile.` };
      if (total >= 2) return { status: 'warn', points: 6, details: `${total} external citation(s) found. Build more listings on Yelp, Google Business, Facebook, and industry directories.` };
      return { status: 'fail', points: 0, details: 'No local citations detected. List your business on Google Business Profile, Yelp, Bing Places, and industry directories.' };
    },
  },
  {
    id: 'local-gbp',
    name: 'Google Business Profile Connection',
    maxPoints: 10,
    evaluate: (crawl) => {
      const html = crawl.html;
      const extLinks = crawl.externalLinks;
      const hasGbpLink = extLinks.some((l) => /business\.google\.com|g\.page|goo\.gl\/maps|google\.com\/maps.*place/i.test(l));
      const hasGbpMeta = /google-site-verification|google-business/i.test(html);
      const hasGooglePlusLegacy = /plus\.google\.com/i.test(html);
      if (hasGbpLink || hasGbpMeta) return { status: 'pass', points: 10, details: 'Google Business Profile connection detected via link or verification meta tag.' };
      if (hasGooglePlusLegacy) return { status: 'warn', points: 3, details: 'Legacy Google+ link found. Update to Google Business Profile link.' };
      return { status: 'fail', points: 0, details: 'No Google Business Profile link found. Link to your GBP listing from your website footer or contact page.' };
    },
  },
];

export function analyzeLocalSeo(crawl: CrawlResult): LayerResults {
  const checks: CheckResult[] = [];
  let totalPoints = 0;
  let maxScore = 0;

  for (const check of localChecks) {
    const result = check.evaluate(crawl);
    checks.push({
      id: check.id,
      name: check.name,
      status: result.status,
      points: result.points,
      maxPoints: check.maxPoints,
      details: result.details,
    });
    totalPoints += result.points;
    maxScore += check.maxPoints;
  }

  const score = maxScore > 0 ? Math.round((totalPoints / maxScore) * 100) : 0;

  return { checks, score, maxScore: 100 };
}
