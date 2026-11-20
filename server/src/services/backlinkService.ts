/**
 * Backlink Service — Heuristic-based backlink opportunity finder.
 * Extracts outbound links from competitor crawl results and categorizes opportunities.
 * NOTE: This is based on crawling data only — not a full backlink index like Ahrefs/Moz.
 */

import mongoose from 'mongoose';
import BacklinkOpportunity from '../models/BacklinkOpportunity';
import type { RelAttribute } from '../models/BacklinkOpportunity';
import CompetitorAudit from '../models/CompetitorAudit';
import { crawlUrl } from './crawlerService';
import type { CrawlResult } from './crawlerService';

interface LinkOpportunity {
  sourceUrl: string;
  targetUrl: string;
  type: 'competitor-referral' | 'broken-link' | 'unlinked-mention' | 'guest-post';
  anchorText: string | null;
  relAttribute: RelAttribute;
  isBroken: boolean;
  spamSignal: boolean;
  referringDomain: string;
}

/**
 * Extract referring domain from a URL.
 */
function getReferringDomain(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return url;
  }
}

/**
 * Detect if a domain looks like a low-quality directory or link farm.
 */
function isSpamSignal(domain: string): boolean {
  const spamPatterns = [
    /directory/i, /links?\.(com|net|org)/i, /free-?seo/i, /link-?farm/i,
    /submit-?url/i, /add-?url/i, /web-?dir/i, /cheap-?seo/i,
    /backlinks?-?(buy|get|free)/i, /pr\d/i, /pagerank/i,
    /\.xyz$/i, /\.top$/i, /\.click$/i, /\.tk$/i, /\.ml$/i,
    /auto-?approve/i, /mass-?submit/i,
  ];
  return spamPatterns.some((p) => p.test(domain));
}

/**
 * Infer rel attribute from context (heuristic — we can't see the actual <a> tag attributes
 * of external sites linking to competitors, so we use pattern matching).
 */
function inferRelAttribute(url: string, type: string): RelAttribute {
  // Guest post and blog sites often use nofollow for outbound links
  if (type === 'guest-post') return 'nofollow';
  // UGC platforms
  if (/forum|community|reddit|quora|medium\.com|wordpress\.com|blogspot/i.test(url)) return 'ugc';
  // Sponsored content patterns
  if (/sponsor|partner|affiliate|ad\./i.test(url)) return 'sponsored';
  return 'follow';
}

/**
 * Detect if a URL looks like a blog/content site (for guest post opportunities).
 */
function isBlogOrContentSite(url: string): boolean {
  const blogPatterns = [
    /blog/i, /news/i, /article/i, /post/i, /journal/i,
    /magazine/i, /media/i, /stories/i, /insights/i,
    /resources/i, /guides/i, /tutorials/i,
  ];
  return blogPatterns.some((p) => p.test(url));
}

/**
 * Detect resource page patterns.
 */
function isResourcePage(url: string): boolean {
  const resourcePatterns = [
    /resources/i, /links/i, /directory/i, /tools/i,
    /useful/i, /recommended/i, /favorites/i,
  ];
  return resourcePatterns.some((p) => p.test(url));
}

/**
 * Analyze backlink opportunities from crawl data.
 */
export async function analyzeBacklinks(
  projectId: mongoose.Types.ObjectId,
  mainCrawlResult: CrawlResult,
  mainUrl: string,
): Promise<void> {
  try {
    // Clear old backlink opportunities for this project
    await BacklinkOpportunity.deleteMany({ projectId });

    // Get competitor audit results
    const competitorAudits = await CompetitorAudit.find({
      projectId,
      status: 'completed',
    }).lean();

    if (competitorAudits.length === 0) return;

    const opportunities: LinkOpportunity[] = [];
    const seenPairs = new Set<string>();

    for (const comp of competitorAudits) {
      try {
        const compCrawl = await crawlUrl(comp.competitorUrl);

        // 1. External links FROM competitor pages = potential referral sources
        for (const extLink of compCrawl.externalLinks) {
          let origin: string;
          try {
            origin = new URL(extLink).origin;
          } catch {
            continue;
          }

          // Skip social media and common non-editorial domains
          const skipDomains = [
            'facebook.com', 'twitter.com', 'x.com', 'linkedin.com',
            'instagram.com', 'youtube.com', 'tiktok.com', 'pinterest.com',
            'google.com', 'apple.com', 'microsoft.com',
          ];
          const hostname = new URL(extLink).hostname.toLowerCase();
          if (skipDomains.some((d) => hostname.includes(d))) continue;

          const pairKey = `${origin}|${comp.competitorUrl}`;
          if (seenPairs.has(pairKey)) continue;
          seenPairs.add(pairKey);

          // Categorize the opportunity
          let type: LinkOpportunity['type'] = 'competitor-referral';

          if (isBlogOrContentSite(extLink)) {
            type = 'guest-post';
          } else if (isResourcePage(extLink)) {
            type = 'competitor-referral';
          }

          opportunities.push({
            sourceUrl: extLink,
            targetUrl: comp.competitorUrl,
            type,
            anchorText: null, // Anchor text not available from external crawl
            relAttribute: inferRelAttribute(extLink, type),
            isBroken: false,
            spamSignal: isSpamSignal(hostname),
            referringDomain: hostname,
          });
        }

        // 2. Check internal links that might be broken (simple heuristic)
        for (const intLink of compCrawl.internalLinks.slice(0, 20)) {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3000);
            const res = await fetch(intLink, { method: 'HEAD', signal: controller.signal });
            clearTimeout(timeout);

            if (res.status >= 400) {
              const pairKey = `broken|${intLink}`;
              if (!seenPairs.has(pairKey)) {
                seenPairs.add(pairKey);
                const domain = getReferringDomain(comp.competitorUrl);
                opportunities.push({
                  sourceUrl: comp.competitorUrl,
                  targetUrl: intLink,
                  type: 'broken-link',
                  anchorText: null,
                  relAttribute: 'follow',
                  isBroken: true,
                  spamSignal: false,
                  referringDomain: domain,
                });
              }
            }
          } catch {
            // Timeout or error — could be a broken link
            const pairKey = `broken|${intLink}`;
            if (!seenPairs.has(pairKey)) {
              seenPairs.add(pairKey);
              const domain = getReferringDomain(comp.competitorUrl);
              opportunities.push({
                sourceUrl: comp.competitorUrl,
                targetUrl: intLink,
                type: 'broken-link',
                anchorText: null,
                relAttribute: 'follow',
                isBroken: true,
                spamSignal: false,
                referringDomain: domain,
              });
            }
          }
        }
      } catch (err) {
        console.error(`[backlink] Failed to crawl competitor ${comp.competitorUrl}:`, err);
      }
    }

    // Limit to top 100 opportunities
    const limited = opportunities.slice(0, 100);

    if (limited.length > 0) {
      const docs = limited.map((opp) => ({
        projectId,
        sourceUrl: opp.sourceUrl,
        targetUrl: opp.targetUrl,
        type: opp.type,
        status: 'discovered' as const,
        domainAuthority: null, // Requires Moz/Ahrefs API
        anchorText: opp.anchorText,
        relAttribute: opp.relAttribute,
        isBroken: opp.isBroken,
        spamSignal: opp.spamSignal,
        referringDomain: opp.referringDomain,
      }));

      await BacklinkOpportunity.insertMany(docs);
      console.log(`[backlink] Created ${docs.length} backlink opportunity records for project ${projectId}`);
    }
  } catch (err) {
    console.error('[backlink] Analysis failed:', err);
  }
}

/**
 * Re-run backlink analysis on demand.
 */
export async function reanalyzeBacklinks(projectId: string): Promise<void> {
  const pid = new mongoose.Types.ObjectId(projectId);
  const Project = (await import('../models/Project')).default;
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  const { crawlUrl: crawl } = await import('./crawlerService');
  const mainCrawl = await crawl(project.url);
  await analyzeBacklinks(pid, mainCrawl, project.url);
}
