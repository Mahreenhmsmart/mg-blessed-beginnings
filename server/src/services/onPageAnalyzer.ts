/**
 * On-Page SEO Analyzer — Per-page analysis of content quality, keyword usage,
 * heading structure, and on-page elements. Produces OnPageResult with
 * actionable findings for AI-powered recommendation generation.
 */

import type { CrawlResult } from './crawlerService';

export interface OnPageFinding {
  id: string;
  category: 'title' | 'meta-description' | 'h1' | 'headings' | 'keyword' | 'content' | 'images' | 'links' | 'cta' | 'duplicate';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  currentValue: string;
  details: string;
}

export interface OnPageResult {
  url: string;
  findings: OnPageFinding[];
  wordCount: number;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  internalLinkCount: number;
  externalLinkCount: number;
  imageCount: number;
  imagesWithAlt: number;
  hasCta: boolean;
  readabilityScore: number; // 0-100 rough Flesch-Kincaid estimate
}

/**
 * Estimate readability using a simplified Flesch-Kincaid formula.
 * Returns a score 0-100 (higher = easier to read).
 */
function estimateReadability(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter(Boolean);
  const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0);

  if (sentences.length === 0 || words.length === 0) return 50;

  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllableCount / words.length;

  // Flesch Reading Ease formula
  const score = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function countSyllables(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (cleaned.length <= 2) return 1;
  // Remove trailing silent e
  const noE = cleaned.replace(/e$/, '');
  const vowelGroups = noE.match(/[aeiouy]+/gi);
  return vowelGroups ? Math.max(1, vowelGroups.length) : 1;
}

/** Detect CTA presence (buttons/links with action-oriented text) */
function detectCta(html: string): boolean {
  const ctaPatterns = [
    /\b(buy|shop|order|subscribe|sign\s*up|get\s*started|learn\s*more|download|register|join|try\s*free|book\s*now|contact\s*us|start\s*free|explore)\b/i,
  ];
  // Check buttons and links
  const buttonAndLinks = html.match(/<(?:a|button)[^>]*>([\s\S]*?)<\/(?:a|button)>/gi) || [];
  for (const element of buttonAndLinks) {
    const text = element.replace(/<[^>]+>/g, '').trim();
    for (const pattern of ctaPatterns) {
      if (pattern.test(text)) return true;
    }
  }
  return false;
}

/** Extract first paragraph text */
function extractFirstParagraph(html: string): string {
  const match = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (!match) return '';
  return match[1].replace(/<[^>]+>/g, '').trim();
}

export function analyzeOnPage(crawl: CrawlResult): OnPageResult {
  const findings: OnPageFinding[] = [];
  const wordCount = crawl.visibleText.split(/\s+/).filter(Boolean).length;
  const h1s = crawl.headings.filter((h) => h.level === 1);
  const h2s = crawl.headings.filter((h) => h.level === 2);
  const h3s = crawl.headings.filter((h) => h.level === 3);
  const hasCta = detectCta(crawl.html);
  const readabilityScore = estimateReadability(crawl.visibleText);
  const firstParagraph = extractFirstParagraph(crawl.html);

  // ─── Title Tag Analysis ──────────────────────────────────────────────
  if (!crawl.title) {
    findings.push({
      id: 'onpage-title-missing',
      category: 'title',
      severity: 'critical',
      title: 'Missing Title Tag',
      currentValue: '(none)',
      details: 'Every page needs a unique, descriptive title tag. This is the most important on-page SEO element.',
    });
  } else {
    const len = crawl.title.length;
    if (len < 30) {
      findings.push({
        id: 'onpage-title-short',
        category: 'title',
        severity: 'warning',
        title: 'Title Too Short',
        currentValue: crawl.title,
        details: `Title is only ${len} characters. Aim for 50-60 characters for optimal SERP display.`,
      });
    } else if (len > 60) {
      findings.push({
        id: 'onpage-title-long',
        category: 'title',
        severity: 'warning',
        title: 'Title Too Long',
        currentValue: crawl.title,
        details: `Title is ${len} characters. Google typically displays 50-60 characters. The rest will be truncated.`,
      });
    }
  }

  // ─── Meta Description Analysis ───────────────────────────────────────
  if (!crawl.metaDescription) {
    findings.push({
      id: 'onpage-meta-desc-missing',
      category: 'meta-description',
      severity: 'critical',
      title: 'Missing Meta Description',
      currentValue: '(none)',
      details: 'A meta description helps search engines understand your page and improves click-through rates.',
    });
  } else {
    const len = crawl.metaDescription.length;
    if (len < 120) {
      findings.push({
        id: 'onpage-meta-desc-short',
        category: 'meta-description',
        severity: 'warning',
        title: 'Meta Description Too Short',
        currentValue: crawl.metaDescription,
        details: `Meta description is ${len} characters. Aim for 150-160 characters for optimal display.`,
      });
    } else if (len > 160) {
      findings.push({
        id: 'onpage-meta-desc-long',
        category: 'meta-description',
        severity: 'warning',
        title: 'Meta Description Too Long',
        currentValue: crawl.metaDescription,
        details: `Meta description is ${len} characters. Google truncates descriptions over ~160 characters.`,
      });
    }
    // Check for call-to-action in meta description
    const ctaWords = /\b(learn|discover|find|get|shop|buy|explore|try|start|join|sign up|download)\b/i;
    if (!ctaWords.test(crawl.metaDescription)) {
      findings.push({
        id: 'onpage-meta-desc-no-cta',
        category: 'meta-description',
        severity: 'info',
        title: 'No Call-to-Action in Meta Description',
        currentValue: crawl.metaDescription,
        details: 'Adding an action verb or call-to-action in the meta description can improve click-through rates.',
      });
    }
  }

  // ─── H1 Analysis ─────────────────────────────────────────────────────
  if (h1s.length === 0) {
    findings.push({
      id: 'onpage-h1-missing',
      category: 'h1',
      severity: 'critical',
      title: 'Missing H1 Heading',
      currentValue: '(none)',
      details: 'Every page should have exactly one H1 that clearly describes the main topic.',
    });
  } else if (h1s.length > 1) {
    findings.push({
      id: 'onpage-h1-multiple',
      category: 'h1',
      severity: 'warning',
      title: 'Multiple H1 Tags',
      currentValue: h1s.map((h) => h.text).join(' | '),
      details: `${h1s.length} H1 tags found. Use exactly one H1 per page for clear content hierarchy.`,
    });
  }

  // ─── Heading Structure ───────────────────────────────────────────────
  if (h2s.length === 0 && h3s.length === 0 && wordCount > 300) {
    findings.push({
      id: 'onpage-headings-flat',
      category: 'headings',
      severity: 'warning',
      title: 'No Subheadings (H2/H3)',
      currentValue: `${crawl.headings.length} total headings`,
      details: 'Long content without subheadings is hard to scan. Add H2/H3 headings to break up sections.',
    });
  }

  // Check heading hierarchy gaps
  if (crawl.headings.length > 1) {
    const levels = crawl.headings.map((h) => h.level);
    let hasGap = false;
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] > levels[i - 1] + 1) {
        hasGap = true;
        break;
      }
    }
    if (hasGap) {
      findings.push({
        id: 'onpage-heading-gap',
        category: 'headings',
        severity: 'warning',
        title: 'Heading Hierarchy Gap',
        currentValue: `Levels: ${levels.join(', ')}`,
        details: 'Heading levels skip (e.g., H2 to H4 without H3). Maintain sequential hierarchy for accessibility and SEO.',
      });
    }
  }

  // ─── Content Length ──────────────────────────────────────────────────
  if (wordCount < 300) {
    findings.push({
      id: 'onpage-thin-content',
      category: 'content',
      severity: 'critical',
      title: 'Thin Content',
      currentValue: `${wordCount} words`,
      details: 'Pages with fewer than 300 words are considered thin content. Expand with valuable information.',
    });
  }

  // ─── Content Quality ─────────────────────────────────────────────────
  if (readabilityScore < 30) {
    findings.push({
      id: 'onpage-readability-low',
      category: 'content',
      severity: 'warning',
      title: 'Low Readability Score',
      currentValue: `Flesch-Kincaid: ${readabilityScore}/100`,
      details: 'Content may be too complex. Use shorter sentences and simpler words for better comprehension.',
    });
  }

  // Heading-to-text ratio
  const headingWordCount = crawl.headings.reduce((sum, h) => sum + h.text.split(/\s+/).filter(Boolean).length, 0);
  const headingRatio = wordCount > 0 ? headingWordCount / wordCount : 0;
  if (headingRatio > 0.3 && wordCount > 100) {
    findings.push({
      id: 'onpage-heading-ratio-high',
      category: 'content',
      severity: 'info',
      title: 'High Heading-to-Text Ratio',
      currentValue: `${Math.round(headingRatio * 100)}% of content is in headings`,
      details: 'Too much content in headings relative to body text. Add more detailed paragraphs under each heading.',
    });
  }

  // ─── Image SEO ───────────────────────────────────────────────────────
  const imagesWithAlt = crawl.images.filter((i) => i.hasAlt).length;
  const imagesWithoutAlt = crawl.images.length - imagesWithAlt;
  if (imagesWithoutAlt > 0) {
    findings.push({
      id: 'onpage-images-no-alt',
      category: 'images',
      severity: imagesWithoutAlt > 3 ? 'critical' : 'warning',
      title: 'Images Missing Alt Text',
      currentValue: `${imagesWithoutAlt} of ${crawl.images.length} images`,
      details: 'Add descriptive alt text to all images for accessibility and image search optimization.',
    });
  }

  // ─── Internal Links ──────────────────────────────────────────────────
  if (crawl.internalLinks.length < 3) {
    findings.push({
      id: 'onpage-few-internal-links',
      category: 'links',
      severity: 'warning',
      title: 'Few Internal Links',
      currentValue: `${crawl.internalLinks.length} internal links`,
      details: 'Add more internal links to help users navigate and distribute link equity.',
    });
  }

  // ─── External Links ──────────────────────────────────────────────────
  if (crawl.externalLinks.length === 0 && wordCount > 500) {
    findings.push({
      id: 'onpage-no-external-links',
      category: 'links',
      severity: 'info',
      title: 'No External Links',
      currentValue: '0 external links',
      details: 'Linking to authoritative external sources can boost credibility and E-E-A-T signals.',
    });
  }

  // ─── CTA Presence ────────────────────────────────────────────────────
  if (!hasCta) {
    findings.push({
      id: 'onpage-no-cta',
      category: 'cta',
      severity: 'info',
      title: 'No Clear Call-to-Action',
      currentValue: '(none detected)',
      details: 'Add action-oriented buttons or links (e.g., "Shop Now", "Learn More") to guide user engagement.',
    });
  }

  // ─── First Paragraph Keyword ─────────────────────────────────────────
  if (firstParagraph && crawl.title) {
    // Extract key terms from title (words >= 4 chars)
    const titleTerms = crawl.title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length >= 4)
      .slice(0, 3);
    const firstParaLower = firstParagraph.toLowerCase();
    const keywordInFirstPara = titleTerms.some((term) => firstParaLower.includes(term));
    if (!keywordInFirstPara && titleTerms.length > 0) {
      findings.push({
        id: 'onpage-keyword-not-in-first-para',
        category: 'keyword',
        severity: 'info',
        title: 'Title Keywords Not in First Paragraph',
        currentValue: firstParagraph.substring(0, 100) + (firstParagraph.length > 100 ? '...' : ''),
        details: 'Include primary keywords from your title in the first paragraph to reinforce topical relevance.',
      });
    }
  }

  return {
    url: crawl.url,
    findings,
    wordCount,
    h1Count: h1s.length,
    h2Count: h2s.length,
    h3Count: h3s.length,
    internalLinkCount: crawl.internalLinks.length,
    externalLinkCount: crawl.externalLinks.length,
    imageCount: crawl.images.length,
    imagesWithAlt,
    hasCta,
    readabilityScore,
  };
}
