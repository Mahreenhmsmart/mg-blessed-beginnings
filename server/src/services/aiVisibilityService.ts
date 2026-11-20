/**
 * AI Visibility Service — Checks if AI platforms mention/recommend a brand.
 * Uses the configured AI provider to query about brand visibility.
 */

import mongoose from 'mongoose';
import AIVisibilityRecord from '../models/AIVisibilityRecord';
import Project from '../models/Project';
import { generateCompletion } from './aiService';

const PLATFORMS = ['ChatGPT', 'Perplexity', 'Gemini', 'Google-SGE'] as const;

interface VisibilityCheckResult {
  platform: string;
  brandMentioned: boolean;
  mentionContext: string;
  confidence: number;
}

/**
 * Check AI visibility for a project across all platforms.
 */
export async function checkAIVisibility(projectId: string): Promise<VisibilityCheckResult[]> {
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  const pid = new mongoose.Types.ObjectId(projectId);
  const results: VisibilityCheckResult[] = [];

  for (const platform of PLATFORMS) {
    try {
      const prompt = `I'm checking if ${platform} mentions or recommends the website "${project.name}" (${project.url}). 

Please answer in this exact JSON format (no other text):
{"mentioned": true/false, "context": "brief description of how/if it's mentioned", "confidence": 0-100}

If you are not sure whether you would mention this specific website, set mentioned to false and confidence to the percentage of uncertainty. Be honest — do not fabricate mentions.`;

      const response = await generateCompletion(prompt, { maxTokens: 256 });

      // Parse the JSON response — strip markdown fences and extract the JSON object
      let parsed: { mentioned: boolean; context: string; confidence: number };
      try {
        // Strip markdown code fences (```json ... ``` or ``` ... ```)
        const stripped = response.replace(/```(?:json)?\s*\n?/gi, '').replace(/```/g, '');
        // Use non-greedy match to find the first complete JSON object
        const jsonMatch = stripped.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');
      } catch {
        parsed = { mentioned: false, context: 'Unable to parse AI response', confidence: 0 };
      }

      const result: VisibilityCheckResult = {
        platform,
        brandMentioned: Boolean(parsed.mentioned),
        mentionContext: String(parsed.context || '').slice(0, 500),
        confidence: Math.max(0, Math.min(100, Number(parsed.confidence) || 0)),
      };

      // Store the record
      await AIVisibilityRecord.create({
        projectId: pid,
        platform,
        brandMentioned: result.brandMentioned,
        mentionContext: result.mentionContext,
        confidence: result.confidence,
        checkedAt: new Date(),
      });

      results.push(result);
    } catch (err) {
      console.error(`[ai-visibility] Failed to check ${platform}:`, err);
      results.push({
        platform,
        brandMentioned: false,
        mentionContext: `Error checking ${platform}: ${err instanceof Error ? err.message : 'Unknown error'}`,
        confidence: 0,
      });
    }
  }

  return results;
}

/**
 * Get visibility history for time-series display.
 */
export async function getVisibilityHistory(projectId: string, limit = 50) {
  const pid = new mongoose.Types.ObjectId(projectId);
  return AIVisibilityRecord.find({ projectId: pid })
    .sort({ checkedAt: -1 })
    .limit(limit)
    .lean();
}

/**
 * Get visibility summary (latest check per platform).
 */
export async function getVisibilitySummary(projectId: string) {
  const pid = new mongoose.Types.ObjectId(projectId);
  
  const pipeline = [
    { $match: { projectId: pid } },
    { $sort: { checkedAt: -1 } },
    {
      $group: {
        _id: '$platform',
        latestRecord: { $first: '$$ROOT' },
      },
    },
  ];

  const results = await (AIVisibilityRecord as any).aggregate(pipeline);
  return (results as Array<{ latestRecord: any }>).map((r) => r.latestRecord);
}
