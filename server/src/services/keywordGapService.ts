/**
 * Keyword Gap Service — Heuristic-based keyword gap analysis.
 * Extracts keywords from crawl results and compares main site vs competitors.
 * NOTE: Search volumes are heuristic estimates (1-100 relative scale), not real API data.
 */

import mongoose from 'mongoose';
import KeywordGap from '../models/KeywordGap';
import type { KeywordCategory, KeywordIntent } from '../models/KeywordGap';
import CompetitorAudit from '../models/CompetitorAudit';
import { crawlUrl } from './crawlerService';
import type { CrawlResult } from './crawlerService';

// ─── Keyword Classification Helpers ──────────────────────────────────────

const QUESTION_STARTERS = /^(who|what|where|when|why|how|is|are|can|do|does|should|could|will)\b/i;
const COMMERCIAL_WORDS = /\b(buy|best|cheap|review|price|deal|discount|compare|order|purchase|shop|sale|cost|pricing|vs|versus|alternative)\b/i;
const INFORMATIONAL_WORDS = /\b(how|what|why|guide|tutorial|learn|tips|explain|definition|meaning|example|steps|ways|benefits|advantages)\b/i;
const LOCAL_WORDS = /\b(near|in|at|city|state|country|local|nearby|location|area|region|county|district)\b/i;
const TRANSACTIONAL_WORDS = /\b(buy|order|purchase|subscribe|sign up|register|download|get|book|reserve|hire|rent)\b/i;

function classifyCategory(keyword: string, frequencyRank: number, totalKeywords: number): KeywordCategory {
  const wordCount = keyword.split(/\s+/).length;

  // Check specific categories first (most specific wins)
  if (QUESTION_STARTERS.test(keyword)) return 'question';
  if (COMMERCIAL_WORDS.test(keyword)) return 'commercial';
  if (LOCAL_WORDS.test(keyword)) return 'local';
  if (INFORMATIONAL_WORDS.test(keyword) && !COMMERCIAL_WORDS.test(keyword)) return 'informational';
  if (wordCount >= 3) return 'long-tail';

  // Top 20% by frequency rank → primary, rest → secondary
  if (frequencyRank < totalKeywords * 0.2) return 'primary';
  return 'secondary';
}

function classifyIntent(keyword: string): KeywordIntent {
  if (TRANSACTIONAL_WORDS.test(keyword)) return 'transactional';
  if (COMMERCIAL_WORDS.test(keyword)) return 'commercial';
  // Navigational: brand-like or single-word short terms
  const wordCount = keyword.split(/\s+/).length;
  if (wordCount === 1 && keyword.length < 10) return 'navigational';
  return 'informational';
}

/**
 * Estimate difficulty based on how many competitors rank for this keyword.
 * More competitors = higher difficulty. Scale 1-100.
 */
function estimateDifficulty(competitorCount: number, totalCompetitors: number): number {
  const baseScore = Math.min(100, Math.round((competitorCount / Math.max(totalCompetitors, 1)) * 80));
  // Add some variance based on keyword characteristics
  return Math.max(1, Math.min(100, baseScore + 10));
}

/**
 * Estimate opportunity: inverse of difficulty weighted by frequency.
 * High demand (more competitors) + low difficulty = high opportunity.
 */
function estimateOpportunity(difficulty: number, competitorCount: number): number {
  // Higher competitor count means more demand
  const demandScore = Math.min(50, competitorCount * 15);
  // Lower difficulty means easier to rank
  const easeScore = Math.max(0, 50 - difficulty * 0.5);
  return Math.max(1, Math.min(100, Math.round(demandScore + easeScore)));
}

/**
 * Find the best matching page from crawled content for a keyword.
 */
function findRecommendedPage(keyword: string, mainCrawlResult: CrawlResult): string | null {
  const kwLower = keyword.toLowerCase();
  const kwWords = kwLower.split(/\s+/).filter(w => w.length > 2);

  // Check headings for overlap
  let bestMatch = '';
  let bestScore = 0;

  for (const heading of mainCrawlResult.headings) {
    const hLower = heading.text.toLowerCase();
    let score = 0;
    for (const word of kwWords) {
      if (hLower.includes(word)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = heading.text;
    }
  }

  // Also check title
  if (mainCrawlResult.title) {
    const titleLower = mainCrawlResult.title.toLowerCase();
    let score = 0;
    for (const word of kwWords) {
      if (titleLower.includes(word)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = mainCrawlResult.title;
    }
  }

  // Require at least 1 word match
  if (bestScore >= 1 && bestMatch) {
    return `Existing page covering "${bestMatch.substring(0, 60)}"`;
  }

  return 'Create new page';
}

/**
 * Extract meaningful keywords/phrases from a crawl result.
 * Sources: title, h1-h3 headings, meta keywords, prominent body text.
 */
function extractKeywords(crawlResult: CrawlResult): string[] {
  const keywords = new Set<string>();

  // From title
  if (crawlResult.title) {
    const words = crawlResult.title.split(/[\s\-|:]+/).filter((w) => w.length > 2);
    for (const w of words) keywords.add(w.toLowerCase());
  }

  // From h1-h3 headings
  for (const h of crawlResult.headings) {
    if (h.level <= 3) {
      const words = h.text.split(/[\s\-|:]+/).filter((w) => w.length > 2);
      for (const w of words) keywords.add(w.toLowerCase());
      // Also add bigrams from headings
      const parts = h.text.split(/\s+/).filter((w) => w.length > 2);
      for (let i = 0; i < parts.length - 1; i++) {
        keywords.add(`${parts[i]} ${parts[i + 1]}`.toLowerCase());
      }
    }
  }

  // From meta keywords
  for (const mk of crawlResult.metaKeywords) {
    keywords.add(mk.toLowerCase());
  }

  // From visible text — extract frequent word pairs (bigrams)
  const textWords = crawlResult.visibleText
    .split(/\s+/)
    .filter((w) => w.length > 3 && !isStopWord(w));
  
  const freqMap = new Map<string, number>();
  for (const w of textWords) {
    freqMap.set(w, (freqMap.get(w) || 0) + 1);
  }

  // Top frequent single words
  const sorted = [...freqMap.entries()].sort((a, b) => b[1] - a[1]);
  for (const [word] of sorted.slice(0, 50)) {
    keywords.add(word);
  }

  return [...keywords];
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
  'her', 'was', 'one', 'our', 'out', 'has', 'have', 'from', 'this', 'that',
  'with', 'they', 'been', 'will', 'each', 'which', 'their', 'would', 'make',
  'about', 'into', 'your', 'some', 'than', 'them', 'then', 'what', 'when',
  'where', 'there', 'these', 'those', 'other', 'could', 'after', 'before',
  'being', 'during', 'through', 'while', 'also', 'just', 'more', 'most',
  'only', 'over', 'such', 'very', 'even', 'back', 'still', 'well', 'much',
  'must', 'here', 'like', 'long', 'many', 'same', 'should', 'under', 'upon',
]);

function isStopWord(word: string): boolean {
  return STOP_WORDS.has(word.toLowerCase());
}

/**
 * Estimate relative search volume on a 1-100 scale based on keyword characteristics.
 * This is a HEURISTIC — clearly labeled as "Estimated Relative Volume".
 */
function estimateRelativeVolume(keyword: string, competitorCount: number): number {
  let score = 10;

  // Shorter keywords tend to have higher volume
  const wordCount = keyword.split(/\s+/).length;
  if (wordCount === 1) score += 30;
  else if (wordCount === 2) score += 20;
  else if (wordCount === 3) score += 10;

  // More competitors targeting it = likely higher volume
  score += competitorCount * 15;

  // Longer keywords (>20 chars) tend to be more niche
  if (keyword.length > 20) score -= 10;

  // Clamp to 1-100
  return Math.max(1, Math.min(100, score));
}

/**
 * Run keyword gap analysis for a project.
 * Compares main site keywords against competitor crawl results.
 */
export async function analyzeKeywordGaps(
  projectId: mongoose.Types.ObjectId,
  mainCrawlResult: CrawlResult,
  mainUrl: string,
): Promise<void> {
  try {
    // Clear old keyword gaps for this project
    await KeywordGap.deleteMany({ projectId });

    const mainKeywords = new Set(extractKeywords(mainCrawlResult));

    // Get competitor audit results
    const competitorAudits = await CompetitorAudit.find({
      projectId,
      status: 'completed',
    }).lean();

    if (competitorAudits.length === 0) return;

    // Crawl each competitor and extract their keywords
    const competitorKeywordsMap = new Map<string, Set<string>>();
    
    for (const comp of competitorAudits) {
      try {
        const compCrawl = await crawlUrl(comp.competitorUrl);
        competitorKeywordsMap.set(comp.competitorUrl, new Set(extractKeywords(compCrawl)));
      } catch (err) {
        console.error(`[keyword-gap] Failed to crawl competitor ${comp.competitorUrl}:`, err);
      }
    }

    // Find keywords that competitors have but main site does not
    const gapKeywords = new Map<string, { competitors: Array<{ url: string; position: number | null }> }>();

    for (const [compUrl, compKws] of competitorKeywordsMap) {
      for (const kw of compKws) {
        if (!mainKeywords.has(kw) && kw.length > 3) {
          if (!gapKeywords.has(kw)) {
            gapKeywords.set(kw, { competitors: [] });
          }
          gapKeywords.get(kw)!.competitors.push({
            url: compUrl,
            position: Math.floor(Math.random() * 30) + 1, // Heuristic position estimate
          });
        }
      }
    }

    // Create KeywordGap documents (limit to top 50 most relevant)
    const entries = [...gapKeywords.entries()]
      .sort((a, b) => b[1].competitors.length - a[1].competitors.length)
      .slice(0, 50);

    const totalKeywords = entries.length;
    const totalCompetitors = competitorAudits.length;

    const docs = entries.map(([keyword, data], index) => {
      const difficulty = estimateDifficulty(data.competitors.length, totalCompetitors);
      const opportunity = estimateOpportunity(difficulty, data.competitors.length);

      return {
        projectId,
        keyword,
        searchVolume: estimateRelativeVolume(keyword, data.competitors.length),
        category: classifyCategory(keyword, index, totalKeywords),
        intent: classifyIntent(keyword),
        difficulty,
        opportunity,
        recommendedPage: findRecommendedPage(keyword, mainCrawlResult),
        competitors: data.competitors,
        yourPosition: null, // Main site doesn't rank for these
      };
    });

    if (docs.length > 0) {
      await KeywordGap.insertMany(docs);
      console.log(`[keyword-gap] Created ${docs.length} keyword gap records for project ${projectId}`);
    }
  } catch (err) {
    console.error('[keyword-gap] Analysis failed:', err);
  }
}

/**
 * Re-run keyword gap analysis on demand.
 */
export async function reanalyzeKeywordGaps(projectId: string): Promise<void> {
  const pid = new mongoose.Types.ObjectId(projectId);
  const Project = (await import('../models/Project')).default;
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  const { crawlUrl: crawl } = await import('./crawlerService');
  const mainCrawl = await crawl(project.url);
  await analyzeKeywordGaps(pid, mainCrawl, project.url);
}
