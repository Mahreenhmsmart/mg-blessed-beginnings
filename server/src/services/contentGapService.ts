/**
 * Content Gap Service — Heuristic-based content gap analysis.
 * Compares headings, topics, and content themes between main site and competitors.
 * Identifies topics competitors cover that the main site does not.
 */

import mongoose from 'mongoose';
import ContentGap from '../models/ContentGap';
import CompetitorAudit from '../models/CompetitorAudit';
import { crawlUrl } from './crawlerService';
import type { CrawlResult } from './crawlerService';

// ─── Intent Classification for Topics ─────────────────────────────────────

const COMMERCIAL_TOPIC_WORDS = /\b(buy|price|cost|review|best|cheap|deal|discount|compare|vs|versus|alternative|pricing|shop|product|service)\b/i;
const TRANSACTIONAL_TOPIC_WORDS = /\b(sign up|register|subscribe|download|book|order|purchase|get started|free trial|demo)\b/i;

function inferSearchIntent(topic: string): string {
  if (TRANSACTIONAL_TOPIC_WORDS.test(topic)) return 'transactional';
  if (COMMERCIAL_TOPIC_WORDS.test(topic)) return 'commercial';
  return 'informational';
}

function derivePrimaryKeyword(topic: string): string {
  // Take the first 3-4 meaningful words as primary keyword
  const words = topic.split(/\s+/).filter((w) => w.length > 2 && !/^(the|a|an|and|or|for|in|to|of|with|on|at)$/i.test(w));
  return words.slice(0, 4).join(' ').toLowerCase();
}

function deriveSecondaryKeywords(topic: string, questions: string[]): string[] {
  const secondary = new Set<string>();
  const primaryWords = new Set(derivePrimaryKeyword(topic).split(/\s+/));

  // Extract additional meaningful words from topic
  const topicWords = topic.split(/\s+/).filter((w) => w.length > 3 && !primaryWords.has(w.toLowerCase()));
  for (const w of topicWords.slice(0, 3)) {
    secondary.add(w.toLowerCase());
  }

  // Extract keywords from related questions
  for (const q of questions.slice(0, 3)) {
    const qWords = q.split(/\s+/).filter((w) => w.length > 3 && !primaryWords.has(w.toLowerCase()) && !/^(what|how|why|when|where|who|which|can|should|does|do|is|are|will|could)$/i.test(w));
    for (const w of qWords.slice(0, 2)) {
      secondary.add(w.toLowerCase());
    }
  }

  return [...secondary].slice(0, 5);
}

function generateSuggestedTitle(topic: string, intent: string): string {
  const capitalized = topic.charAt(0).toUpperCase() + topic.slice(1);
  if (intent === 'commercial') return `Best ${capitalized}: A Complete Guide`;
  if (intent === 'transactional') return `${capitalized}: Get Started Today`;
  return `The Complete Guide to ${capitalized}`;
}

/**
 * Extract topic phrases from headings (h1-h3).
 * Returns normalized topic strings.
 */
function extractTopics(crawlResult: CrawlResult): string[] {
  const topics = new Set<string>();

  for (const h of crawlResult.headings) {
    if (h.level <= 3 && h.text.length > 5) {
      // Normalize: lowercase, trim
      const normalized = h.text.trim().toLowerCase();
      topics.add(normalized);
    }
  }

  // Also extract from title
  if (crawlResult.title) {
    topics.add(crawlResult.title.trim().toLowerCase());
  }

  return [...topics];
}

/**
 * Check if a heading is question-like.
 */
function isQuestionHeading(text: string): boolean {
  const q = text.toLowerCase().trim();
  return (
    q.endsWith('?') ||
    /^(what|how|why|when|where|who|which|can|should|does|do|is|are|will|could)/i.test(q)
  );
}

/**
 * Normalize a topic for comparison (remove common prefixes/suffixes).
 */
function normalizeTopic(topic: string): string {
  return topic
    .replace(/^(the|a|an)\s+/i, '')
    .replace(/\s*(guide|tutorial|introduction|overview|complete|ultimate|best)\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Check if two topics are semantically similar (simple word overlap heuristic).
 */
function topicsOverlap(a: string, b: string): boolean {
  const wordsA = new Set(normalizeTopic(a).split(/\s+/).filter((w) => w.length > 3));
  const wordsB = new Set(normalizeTopic(b).split(/\s+/).filter((w) => w.length > 3));
  
  if (wordsA.size === 0 || wordsB.size === 0) return false;
  
  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }
  
  const minSize = Math.min(wordsA.size, wordsB.size);
  return minSize > 0 && overlap / minSize >= 0.5;
}

/**
 * Run content gap analysis for a project.
 */
export async function analyzeContentGaps(
  projectId: mongoose.Types.ObjectId,
  mainCrawlResult: CrawlResult,
  mainUrl: string,
): Promise<void> {
  try {
    // Clear old content gaps for this project
    await ContentGap.deleteMany({ projectId });

    const mainTopics = extractTopics(mainCrawlResult);

    // Get competitor audit results
    const competitorAudits = await CompetitorAudit.find({
      projectId,
      status: 'completed',
    }).lean();

    if (competitorAudits.length === 0) return;

    // Map: normalized topic -> { original topic, questions, competitor URLs }
    const gapMap = new Map<string, {
      topic: string;
      questions: string[];
      competitorUrls: string[];
    }>();

    for (const comp of competitorAudits) {
      try {
        const compCrawl = await crawlUrl(comp.competitorUrl);
        const compTopics = extractTopics(compCrawl);

        for (const compTopic of compTopics) {
          // Check if main site already covers this topic
          const alreadyCovered = mainTopics.some((mt) => topicsOverlap(mt, compTopic));
          if (alreadyCovered) continue;

          const normalized = normalizeTopic(compTopic);
          if (normalized.length < 4) continue;

          if (!gapMap.has(normalized)) {
            gapMap.set(normalized, {
              topic: compTopic,
              questions: [],
              competitorUrls: [],
            });
          }

          const entry = gapMap.get(normalized)!;
          if (!entry.competitorUrls.includes(comp.competitorUrl)) {
            entry.competitorUrls.push(comp.competitorUrl);
          }

          // Extract question-like headings related to this topic
          for (const h of compCrawl.headings) {
            if (isQuestionHeading(h.text) && topicsOverlap(h.text, compTopic)) {
              if (!entry.questions.includes(h.text)) {
                entry.questions.push(h.text);
              }
            }
          }
        }
      } catch (err) {
        console.error(`[content-gap] Failed to crawl competitor ${comp.competitorUrl}:`, err);
      }
    }

    // Assign priority based on how many competitors cover the topic
    const docs = [...gapMap.values()]
      .map((entry) => {
        const intent = inferSearchIntent(entry.topic);
        const primaryKeyword = derivePrimaryKeyword(entry.topic);
        const secondaryKeywords = deriveSecondaryKeywords(entry.topic, entry.questions);
        const suggestedTitle = generateSuggestedTitle(entry.topic, intent);

        return {
          projectId,
          topic: entry.topic,
          questions: entry.questions.slice(0, 10),
          competitorUrls: entry.competitorUrls,
          priority: entry.competitorUrls.length >= 3 ? 'high' as const
            : entry.competitorUrls.length >= 2 ? 'medium' as const
            : 'low' as const,
          searchIntent: intent,
          primaryKeyword,
          secondaryKeywords,
          suggestedTitle,
          contentPlan: null,
        };
      })
      .sort((a, b) => b.competitorUrls.length - a.competitorUrls.length)
      .slice(0, 50);

    if (docs.length > 0) {
      await ContentGap.insertMany(docs);
      console.log(`[content-gap] Created ${docs.length} content gap records for project ${projectId}`);
    }
  } catch (err) {
    console.error('[content-gap] Analysis failed:', err);
  }
}

/**
 * Re-run content gap analysis on demand.
 */
export async function reanalyzeContentGaps(projectId: string): Promise<void> {
  const pid = new mongoose.Types.ObjectId(projectId);
  const Project = (await import('../models/Project')).default;
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  const { crawlUrl: crawl } = await import('./crawlerService');
  const mainCrawl = await crawl(project.url);
  await analyzeContentGaps(pid, mainCrawl, project.url);
}
