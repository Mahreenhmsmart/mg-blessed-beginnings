/**
 * AI Insight Service — Optional enhancement layer that uses the existing
 * generateCompletion from aiService to produce natural language summaries.
 */

import { generateCompletion } from './aiService';
import type { IAudit, Recommendation } from '../models/Audit';

export interface AISummaryResult {
  summaryEn: string;
  summaryUr: string;
  actionPlanNarrative: string;
}

export async function generateAuditInsights(audit: IAudit): Promise<AISummaryResult> {
  const scores = audit.scores;
  const recCount = audit.recommendations.length;
  const criticalCount = audit.recommendations.filter((r) => r.severity === 'critical').length;
  const warningCount = audit.recommendations.filter((r) => r.severity === 'warning').length;

  // Extract top CQ findings if available
  const cqResults = audit.results?.cq;
  const cqFindings = cqResults
    ? cqResults.checks
        .filter((c) => c.status !== 'pass')
        .slice(0, 4)
        .map((c) => `- [${c.status.toUpperCase()}] ${c.name}: ${c.details}`)
        .join('\n')
    : '';

  const topRecs = audit.recommendations.slice(0, 8).map((r: Recommendation) =>
    `- [${r.severity.toUpperCase()}] ${r.title} (${r.layer.toUpperCase()}, effort: ${r.effort})`,
  ).join('\n');

  const prompt = `You are an SEO and digital visibility expert. Analyze these website audit results and provide insights.

SCORES (out of 100):
- SEO: ${scores.seo}
- AEO (Answer Engine Optimization): ${scores.aeo}
- GEO (Generative Engine Optimization): ${scores.geo}
- AIO (AI Optimization): ${scores.aio}
- SXO (Search Experience Optimization): ${scores.sxo}
- CQ (Content Quality / E-E-A-T): ${scores.cq ?? 'N/A'}

${cqFindings ? `CONTENT QUALITY FINDINGS:\n${cqFindings}\n` : ''}RECOMMENDATIONS SUMMARY:
- Total: ${recCount} (${criticalCount} critical, ${warningCount} warnings)

TOP ISSUES:
${topRecs}

Provide three outputs separated by "---DIVIDER---":
1. A concise English summary of findings (3-5 sentences), including content quality and E-E-A-T assessment
2. The same summary in Roman Urdu (transliterated Urdu using Latin script)
3. A prioritized action plan narrative describing what to fix first, second, and third — include content quality improvements where relevant`;

  try {
    const response = await generateCompletion(prompt, {
      system: 'You are a professional website visibility analyst. Be concise and actionable.',
      maxTokens: 1500,
    });

    const parts = response.split('---DIVIDER---');
    return {
      summaryEn: (parts[0] || '').trim(),
      summaryUr: (parts[1] || '').trim(),
      actionPlanNarrative: (parts[2] || '').trim(),
    };
  } catch (err) {
    console.error('[aiInsight] Failed to generate insights:', err);
    return {
      summaryEn: 'AI insights unavailable. Review individual check results for detailed findings.',
      summaryUr: 'AI insights abhi dastyaab nahi hain. Tafseeli jaanch ke nataij dekhein.',
      actionPlanNarrative: 'Start with critical issues in your lowest-scoring layer, then address warnings systematically.',
    };
  }
}
