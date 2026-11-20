import { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, RefreshCw, MessageCircle, TrendingUp, Zap, AlertTriangle, Search, Target, Lightbulb, BarChart3, Share2, Info } from 'lucide-react';
import { Button, Card, Input, Spinner, Alert, MarkdownRenderer } from '@/components/ui';
import Badge from '@/components/ui/Badge';
import CopyButton from '@/components/ui/CopyButton';
import { aiToolApiService } from '@/services/aiToolService';
import { cn } from '@/utils/cn';

// ─── Business DNA Parser & Renderer ────────────────────────────────────────

interface BrandColor {
  hex: string;
  name: string;
}

interface BusinessDNAData {
  tone: string;
  colors: BrandColor[];
  styleKeywords: string;
  audience: string;
}

function parseBusinessDNA(markdown: string): BusinessDNAData | null {
  try {
    // Parse tone section
    const toneMatch = markdown.match(/###\s*Brand Tone\s*\n([\s\S]*?)(?=###|$)/i);
    const tone = toneMatch ? toneMatch[1].trim().replace(/^[-*•]\s*/gm, '').trim() : '';

    // Parse color palette section
    const colors: BrandColor[] = [];
    const colorSection = markdown.match(/###\s*Color Palette\s*\n([\s\S]*?)(?=###|$)/i);
    if (colorSection) {
      const colorLines = colorSection[1].split('\n');
      for (const line of colorLines) {
        // Match patterns like "1. #HEXCODE - Color Name" or "#HEXCODE - Color Name"
        const colorMatch = line.match(/(#(?:[0-9a-fA-F]{3}){1,2})\s*[-–—]\s*(.+)/i);
        if (colorMatch) {
          colors.push({
            hex: colorMatch[1].toUpperCase(),
            name: colorMatch[2].trim().replace(/^\d+\.\s*/, ''),
          });
        }
      }
    }

    // Parse style keywords
    const styleMatch = markdown.match(/###\s*Style Keywords\s*\n([\s\S]*?)(?=###|$)/i);
    const styleKeywords = styleMatch ? styleMatch[1].trim().replace(/^[-*•]\s*/gm, '').trim() : '';

    // Parse audience profile
    const audienceMatch = markdown.match(/###\s*Audience Profile\s*\n([\s\S]*?)(?=###|$)/i);
    const audience = audienceMatch ? audienceMatch[1].trim().replace(/^[-*•]\s*/gm, '').trim() : '';

    if (!tone && colors.length === 0 && !audience) return null;

    return { tone, colors, styleKeywords, audience };
  } catch {
    return null;
  }
}

function BusinessDNAResults({ markdown }: { markdown: string }) {
  const parsed = parseBusinessDNA(markdown);
  if (!parsed) {
    return (
      <MarkdownRenderer
        content={markdown}
        className="prose prose-sm max-w-none"
        data-icod-id="src_components_aitoolgenerator_tsx_dna_fallback" />
    );
  }

  const { tone, colors, styleKeywords, audience } = parsed;

  return (
    <div className="space-y-6" data-icod-id="src_components_aitoolgenerator_tsx_dna_results">
      {/* Brand Tone */}
      {tone && (
        <div data-icod-id="src_components_aitoolgenerator_tsx_dna_tone_section">
          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2" data-icod-id="src_components_aitoolgenerator_tsx_dna_tone_heading">
            <Sparkles className="h-4 w-4 text-primary" data-icod-id="src_components_aitoolgenerator_tsx_dna_tone_icon" />
            Brand Tone
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed" data-icod-id="src_components_aitoolgenerator_tsx_dna_tone_text">{tone}</p>
        </div>
      )}

      {/* Color Palette */}
      {colors.length > 0 && (
        <div data-icod-id="src_components_aitoolgenerator_tsx_dna_colors_section">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2" data-icod-id="src_components_aitoolgenerator_tsx_dna_colors_heading">
            <Target className="h-4 w-4 text-primary" data-icod-id="src_components_aitoolgenerator_tsx_dna_colors_icon" />
            Color Palette
          </h4>
          <div className="flex flex-wrap gap-3" data-icod-id="src_components_aitoolgenerator_tsx_dna_colors_grid">
            {colors.map((color, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-card p-2.5 pr-4"
                data-icod-id={`src_components_aitoolgenerator_tsx_dna_color_${idx}`}>
                <div
                  className="h-8 w-8 shrink-0 rounded-md border border-border/60 shadow-sm"
                  style={{ backgroundColor: color.hex }}
                  data-icod-id={`src_components_aitoolgenerator_tsx_dna_swatch_${idx}`} />
                <div className="min-w-0" data-icod-id={`src_components_aitoolgenerator_tsx_dna_color_info_${idx}`}>
                  <p className="text-xs font-medium text-foreground truncate" data-icod-id={`src_components_aitoolgenerator_tsx_dna_color_name_${idx}`}>{color.name}</p>
                  <p className="text-[11px] font-mono text-muted-foreground" data-icod-id={`src_components_aitoolgenerator_tsx_dna_color_hex_${idx}`}>{color.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Style Keywords */}
      {styleKeywords && (
        <div data-icod-id="src_components_aitoolgenerator_tsx_dna_style_section">
          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2" data-icod-id="src_components_aitoolgenerator_tsx_dna_style_heading">
            <Lightbulb className="h-4 w-4 text-warning" data-icod-id="src_components_aitoolgenerator_tsx_dna_style_icon" />
            Style Keywords
          </h4>
          <div className="flex flex-wrap gap-2" data-icod-id="src_components_aitoolgenerator_tsx_dna_style_tags">
            {styleKeywords.split(',').map((kw, idx) => {
              const trimmed = kw.trim();
              if (!trimmed) return null;
              return (
                <span
                  key={idx}
                  className="rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-medium text-foreground"
                  data-icod-id={`src_components_aitoolgenerator_tsx_dna_style_tag_${idx}`}>
                  {trimmed}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Audience Profile */}
      {audience && (
        <div data-icod-id="src_components_aitoolgenerator_tsx_dna_audience_section">
          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2" data-icod-id="src_components_aitoolgenerator_tsx_dna_audience_heading">
            <TrendingUp className="h-4 w-4 text-success" data-icod-id="src_components_aitoolgenerator_tsx_dna_audience_icon" />
            Audience Profile
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed" data-icod-id="src_components_aitoolgenerator_tsx_dna_audience_text">{audience}</p>
        </div>
      )}
    </div>
  );
}

// ─── Campaign Ideas Parser & Renderer ──────────────────────────────────────

interface CampaignIdea {
  title: string;
  description: string;
}

function parseCampaignIdeas(markdown: string): CampaignIdea[] {
  const ideas: CampaignIdea[] = [];
  const trimmed = markdown.trim();

  // Strategy 1: Split by --- separator or double newlines, then detect title/description pairs
  const blocks = trimmed.split(/(?:---|\n\s*\n)/).filter((b) => b.trim());

  for (const block of blocks) {
    const lines = block.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    let title = '';
    let descriptionLines: string[] = [];

    // Try to extract a title from the first line(s)
    const firstLine = lines[0];

    // Pattern A: **Bold Title** or **[Bold Title]** (with optional numbering prefix)
    const boldMatch = firstLine.match(/^\*{0,2}\d*[\.\)]?\s*\*{0,2}\s*\*{1,2}\[?([^\]*]+)\]?\*{1,2}\s*$/);
    if (boldMatch) {
      title = boldMatch[1].trim();
      descriptionLines = lines.slice(1);
    }

    // Pattern B: ### Heading or ## Heading
    if (!title) {
      const headingMatch = firstLine.match(/^#{1,4}\s+(.+)/);
      if (headingMatch) {
        title = headingMatch[1].replace(/\*{1,2}/g, '').trim();
        descriptionLines = lines.slice(1);
      }
    }

    // Pattern C: Numbered item like "1. Title" or "1) Title" where title is on one line
    // and description follows on subsequent lines
    if (!title) {
      const numberedMatch = firstLine.match(/^\*{0,2}\d+[\.\)]\s*\*{0,2}\s*(.+)/);
      if (numberedMatch && lines.length > 1) {
        title = numberedMatch[1].replace(/\*{1,2}/g, '').replace(/^\[|\]$/g, '').trim();
        descriptionLines = lines.slice(1);
      }
    }

    // Pattern D: First line is just a bold title without brackets
    if (!title) {
      const simpleBoldMatch = firstLine.match(/^\*{1,2}(.+?)\*{1,2}$/);
      if (simpleBoldMatch && lines.length > 1) {
        title = simpleBoldMatch[1].replace(/^\[|\]$/g, '').trim();
        descriptionLines = lines.slice(1);
      }
    }

    // Build description from remaining lines
    let description = descriptionLines
      .join(' ')
      .replace(/^\s*[-–—:]\s*/, '')
      .replace(/\*{1,2}/g, '')
      .trim();

    // Only add if we have both a meaningful title and description
    if (title && title.length > 2 && description && description.length > 5) {
      ideas.push({ title, description });
    }
  }

  // If strategy 1 found ideas, return them (max 5)
  if (ideas.length > 0) {
    return ideas.slice(0, 5);
  }

  // Strategy 2: Line-by-line scan for bold titles followed by description text
  const allLines = trimmed.split('\n');
  let currentTitle = '';
  let currentDesc: string[] = [];

  for (const rawLine of allLines) {
    const line = rawLine.trim();
    if (!line) {
      // Blank line — flush any accumulated idea
      if (currentTitle && currentDesc.length > 0) {
        const desc = currentDesc.join(' ').replace(/\*{1,2}/g, '').trim();
        if (desc.length > 5) {
          ideas.push({ title: currentTitle, description: desc });
        }
      }
      currentTitle = '';
      currentDesc = [];
      continue;
    }

    // Check if this line is a title candidate
    const boldTitleMatch = line.match(/^\*{1,2}\[?([^\]*]+)\]?\*{1,2}$/);
    const headingTitleMatch = line.match(/^#{1,4}\s+(.+)/);

    if (boldTitleMatch || headingTitleMatch) {
      // Flush previous idea if any
      if (currentTitle && currentDesc.length > 0) {
        const desc = currentDesc.join(' ').replace(/\*{1,2}/g, '').trim();
        if (desc.length > 5) {
          ideas.push({ title: currentTitle, description: desc });
        }
      }
      currentTitle = (boldTitleMatch?.[1] || headingTitleMatch?.[1] || '').replace(/^\[|\]$/g, '').replace(/\*{1,2}/g, '').trim();
      currentDesc = [];
    } else if (currentTitle) {
      // Accumulate description lines
      currentDesc.push(line.replace(/^\s*[-–—:]\s*/, ''));
    }
  }

  // Flush last idea
  if (currentTitle && currentDesc.length > 0) {
    const desc = currentDesc.join(' ').replace(/\*{1,2}/g, '').trim();
    if (desc.length > 5) {
      ideas.push({ title: currentTitle, description: desc });
    }
  }

  return ideas.slice(0, 5);
}

function CampaignIdeasResults({ markdown }: { markdown: string }) {
  const ideas = parseCampaignIdeas(markdown);
  if (ideas.length === 0) {
    return (
      <div className="space-y-3" data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_parse_fail">
        <p
          className="text-muted-foreground"
          data-icod-id="src_components_aitoolgenerator_tsx_d2f8">
          Could not parse campaign ideas from the AI response. The raw output is shown below — you can copy it manually.
        </p>
        <div
          className="rounded-lg border border-border/40 bg-muted/20 p-4 text-sm"
          data-icod-id="src_components_aitoolgenerator_tsx_60c9">
          <MarkdownRenderer content={markdown} data-icod-id="src_components_aitoolgenerator_tsx_602b" />
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4" data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_list">
      {ideas.map((idea, idx) => (
        <Card
          key={idx}
          className="relative p-5 border-border/60 bg-card"
          data-icod-id={`src_components_aitoolgenerator_tsx_campaign_idea_${idx}`}>
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4" data-icod-id={`src_components_aitoolgenerator_tsx_campaign_idea_inner_${idx}`}>
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold"
              data-icod-id={`src_components_aitoolgenerator_tsx_campaign_idea_num_${idx}`}>
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0" data-icod-id={`src_components_aitoolgenerator_tsx_campaign_idea_content_${idx}`}>
              <h5 className="font-semibold text-foreground mb-1" data-icod-id={`src_components_aitoolgenerator_tsx_campaign_idea_title_${idx}`}>
                {idea.title}
              </h5>
              <p className="text-sm text-muted-foreground leading-relaxed" data-icod-id={`src_components_aitoolgenerator_tsx_campaign_idea_desc_${idx}`}>
                {idea.description}
              </p>
            </div>
            <CopyButton
              text={`${idea.title}\n\n${idea.description}`}
              label="Copy"
              className="shrink-0 self-end sm:self-auto"
              data-icod-id={`src_components_aitoolgenerator_tsx_f309_${idx}`} />
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Social Media Posts Parser & Renderer ──────────────────────────────────

interface SocialMediaPost {
  platform: string;
  content: string;
}

function parseSocialMediaPosts(markdown: string): SocialMediaPost[] {
  const posts: SocialMediaPost[] = [];
  // Split by --- separator or double newlines
  const blocks = markdown.split(/(?:---|\n\s*\n)/).filter((b) => b.trim());
  
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    
    // Try to detect platform from [Platform] prefix first
    let platform = 'Social Media';
    const platformMatch = trimmed.match(/^\[(Instagram|LinkedIn|Twitter\/?X?|Facebook|TikTok)\]/i);
    if (platformMatch) {
      platform = platformMatch[1].replace('Twitter/X', 'Twitter/X').replace('TwitterX', 'Twitter/X');
    } else {
      // Fallback: detect from content cues
      const lowerContent = trimmed.toLowerCase();
      if (lowerContent.includes('linkedin') || lowerContent.includes('professional')) {
        platform = 'LinkedIn';
      } else if (lowerContent.includes('twitter') || trimmed.length < 280) {
        platform = 'Twitter/X';
      } else if (lowerContent.includes('instagram') || trimmed.match(/#\w+/g)?.length! >= 3) {
        platform = 'Instagram';
      } else if (lowerContent.includes('facebook')) {
        platform = 'Facebook';
      } else if (lowerContent.includes('tiktok')) {
        platform = 'TikTok';
      }
    }
    
    // Remove the [Platform] prefix from content if present
    const content = trimmed.replace(/^\[(Instagram|LinkedIn|Twitter\/?X?|Facebook|TikTok)\]\s*/i, '').trim();
    
    posts.push({
      platform,
      content: content.replace(/^\d+[\.\)]\s*/, '').trim(), // Also remove leading numbers like "1." or "1)"
    });
  }
  
  return posts.slice(0, 5); // Ensure max 5 posts
}

function SocialMediaPostsResults({ markdown }: { markdown: string }) {
  const posts = parseSocialMediaPosts(markdown);
  if (posts.length === 0) {
    return (
      <p className="text-muted-foreground" data-icod-id="src_components_aitoolgenerator_tsx_social_posts_empty">
        Something went wrong generating this. Please try again in a moment.
      </p>
    );
  }
  return (
    <div className="space-y-4" data-icod-id="src_components_aitoolgenerator_tsx_social_posts_list">
      {posts.map((post, idx) => (
        <Card
          key={idx}
          className="relative p-5 border-border/60 bg-card"
          data-icod-id={`src_components_aitoolgenerator_tsx_social_post_${idx}`}>
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4" data-icod-id={`src_components_aitoolgenerator_tsx_social_post_inner_${idx}`}>
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-bold"
              data-icod-id={`src_components_aitoolgenerator_tsx_social_post_num_${idx}`}>
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0" data-icod-id={`src_components_aitoolgenerator_tsx_social_post_content_${idx}`}>
              <div className="flex items-center gap-2 mb-2" data-icod-id={`src_components_aitoolgenerator_tsx_social_post_header_${idx}`}>
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  data-icod-id={`src_components_aitoolgenerator_tsx_social_post_platform_${idx}`}>
                  <Share2
                    className="h-3 w-3"
                    data-icod-id={`src_components_aitoolgenerator_tsx_a660_${idx}`} />
                  {post.platform}
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap" data-icod-id={`src_components_aitoolgenerator_tsx_social_post_text_${idx}`}>
                {post.content}
              </p>
            </div>
            <CopyButton
              text={post.content}
              label="Copy"
              className="shrink-0 self-end sm:self-auto"
              data-icod-id={`src_components_aitoolgenerator_tsx_social_post_copy_${idx}`} />
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Ad Headlines Parser & Renderer ────────────────────────────────────────

interface AdHeadline {
  headline: string;
}

function parseAdHeadlines(markdown: string): AdHeadline[] {
  const headlines: AdHeadline[] = [];
  const trimmed = markdown.trim();

  // Strategy 1: Try parsing as a JSON array (preferred format from updated prompt)
  try {
    // Strip any markdown code fences that might wrap the JSON
    const jsonStr = trimmed.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```$/i, '').trim();
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        const text = typeof item === 'string' ? item.trim() : String(item).trim();
        if (text && text.length > 1) {
          headlines.push({ headline: text });
        }
      }
      if (headlines.length > 0) {
        return headlines.slice(0, 5);
      }
    }
  } catch {
    // Not valid JSON — fall through to line-based parsing
  }

  // Strategy 2: Split by numbered markers (1. or 1) or **1.** patterns
  const numberedPattern = /^\*{0,2}\d+[\.\)]\s*\*{0,2}\s*/;
  const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    let content = line.replace(numberedPattern, '').trim();
    // Remove bold markers
    content = content.replace(/^\*{1,2}/, '').replace(/\*{1,2}$/, '').trim();
    // Remove bullet/dash prefixes
    content = content.replace(/^[-•*]\s*/, '').trim();

    if (content && content.length > 2) {
      headlines.push({ headline: content });
    }
  }

  if (headlines.length > 0) {
    return headlines.slice(0, 5);
  }

  // Strategy 3: Split by double newlines or --- separators
  const blocks = trimmed.split(/(?:---|\n\s*\n)/).filter((b) => b.trim());
  for (const block of blocks) {
    let content = block.trim().replace(numberedPattern, '').trim();
    content = content.replace(/^\*{1,2}/, '').replace(/\*{1,2}$/, '').trim();
    if (content && content.length > 2) {
      headlines.push({ headline: content });
    }
  }

  return headlines.slice(0, 5);
}

function AdHeadlinesResults({ markdown }: { markdown: string }) {
  const headlines = parseAdHeadlines(markdown);
  if (headlines.length === 0) {
    return (
      <p className="text-muted-foreground" data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_empty">
        Something went wrong generating this. Please try again in a moment.
      </p>
    );
  }
  return (
    <div className="space-y-4" data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_list">
      {headlines.map((item, idx) => (
        <Card
          key={idx}
          className="relative p-5 border-border/60 bg-card"
          data-icod-id={`src_components_aitoolgenerator_tsx_ad_headline_${idx}`}>
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4" data-icod-id={`src_components_aitoolgenerator_tsx_ad_headline_inner_${idx}`}>
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold"
              data-icod-id={`src_components_aitoolgenerator_tsx_ad_headline_num_${idx}`}>
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0" data-icod-id={`src_components_aitoolgenerator_tsx_ad_headline_content_${idx}`}>
              <p className="text-base font-medium text-foreground leading-relaxed" data-icod-id={`src_components_aitoolgenerator_tsx_ad_headline_text_${idx}`}>
                {item.headline}
              </p>
            </div>
            <CopyButton
              text={item.headline}
              label="Copy"
              className="shrink-0 self-end sm:self-auto"
              data-icod-id={`src_components_aitoolgenerator_tsx_ad_headline_copy_${idx}`} />
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Product Descriptions Parser & Renderer ────────────────────────────────

interface ProductDescription {
  description: string;
}

function parseProductDescriptions(markdown: string): ProductDescription[] {
  const descriptions: ProductDescription[] = [];
  // Split by numbered items, double newlines, or --- separators
  const blocks = markdown.split(/(?:---|\n\s*\n)/).filter((b) => b.trim());

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Remove leading number like "1." or "1)" or "**1.**" etc.
    let content = trimmed.replace(/^\*{0,2}\d+[\.\)]\s*\*{0,2}\s*/, '').trim();
    // Remove bold markers from start/end
    content = content.replace(/^\*{1,2}/, '').replace(/\*{1,2}$/, '').trim();

    if (content && content.length > 10) {
      descriptions.push({ description: content });
    }
  }

  return descriptions.slice(0, 3); // Ensure max 3 descriptions
}

function ProductDescriptionsResults({ markdown }: { markdown: string }) {
  const descriptions = parseProductDescriptions(markdown);
  if (descriptions.length === 0) {
    return (
      <p className="text-muted-foreground" data-icod-id="src_components_aitoolgenerator_tsx_product_desc_empty">
        Something went wrong generating this. Please try again in a moment.
      </p>
    );
  }
  return (
    <div className="space-y-4" data-icod-id="src_components_aitoolgenerator_tsx_product_desc_list">
      {descriptions.map((item, idx) => (
        <Card
          key={idx}
          className="relative p-5 border-border/60 bg-card"
          data-icod-id={`src_components_aitoolgenerator_tsx_product_desc_${idx}`}>
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4" data-icod-id={`src_components_aitoolgenerator_tsx_product_desc_inner_${idx}`}>
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-bold"
              data-icod-id={`src_components_aitoolgenerator_tsx_product_desc_num_${idx}`}>
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0" data-icod-id={`src_components_aitoolgenerator_tsx_product_desc_content_${idx}`}>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap" data-icod-id={`src_components_aitoolgenerator_tsx_product_desc_text_${idx}`}>
                {item.description}
              </p>
            </div>
            <CopyButton
              text={item.description}
              label="Copy"
              className="shrink-0 self-end sm:self-auto"
              data-icod-id={`src_components_aitoolgenerator_tsx_product_desc_copy_${idx}`} />
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Meta Ads Campaign Plan Parser & Renderer ──────────────────────────────

interface MetaAdSetSchedule {
  recommendation?: string;
  dayparting?: string;
}

interface MetaAdSet {
  name: string;
  targetingType: string;
  audienceDescription: string;
  placements: string[];
  budgetPercentage: number;
  budgetAmount: number;
  schedule: string | MetaAdSetSchedule;
}

interface MetaCampaignPlan {
  campaign: {
    metaObjective?: string;
    campaignName?: string;
    name?: string;
    objective?: string;
    campaignGoal?: string;
    namingConvention?: string;
    dailyBudget?: number;
    monthlyBudget?: number;
  };
  adSets: MetaAdSet[];
  recommendations?: string[];
}

function parseMetaAdsCampaignPlan(markdown: string): MetaCampaignPlan | null {
  try {
    // Strip markdown code fences if present
    const jsonStr = markdown.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```$/i, '').trim();
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.campaign && Array.isArray(parsed.adSets)) {
      return parsed as MetaCampaignPlan;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Ad Variants (client-side fallback + AI response support) ──────────────

interface AdVariant {
  headline: string;
  primaryText: string;
  cta: string;
}

/**
 * Generate realistic ad copy variants client-side when the AI response does not
 * include an `adVariants` array. Uses the form inputs to produce varied angles.
 */
function generateFallbackAdVariants(formData: Record<string, unknown>): AdVariant[] {
  const brandName = String(formData.brandName || 'Your Brand').trim();
  const goal = String(formData.campaignGoal || 'Sales').trim();
  const productDetails = String(formData.productDetails || '').trim();
  const interests = String(formData.interests || '').trim();

  // Extract a short product descriptor from productDetails (first sentence or first 60 chars)
  const productShort = productDetails
    ? productDetails.split(/[.!]/)[0].slice(0, 60).trim()
    : brandName;

  const ctaByGoal: Record<string, string[]> = {
    Sales: ['Shop Now', 'Get Offer', 'Buy Now'],
    Leads: ['Sign Up', 'Get Quote', 'Learn More'],
    Traffic: ['Learn More', 'See Details', 'Explore Now'],
    Awareness: ['Learn More', 'Discover', 'Find Out More'],
  };
  const ctas = ctaByGoal[goal] || ctaByGoal.Sales;

  const variants: AdVariant[] = [
    {
      headline: `${brandName} — Don't Miss Out`,
      primaryText: `Limited-time offer on ${productShort}. ${interests ? `Perfect for anyone who loves ${interests.split(',')[0].trim()}.` : 'Designed for people who value quality.'} Grab yours before they're gone!`,
      cta: ctas[0],
    },
    {
      headline: `Loved by Thousands — ${brandName}`,
      primaryText: `Join thousands of happy customers who trust ${brandName}. ${productDetails ? `${productShort} — crafted with care.` : 'Quality you can feel, results you can see.'} See what everyone's talking about.`,
      cta: ctas[1] || 'Learn More',
    },
    {
      headline: `Why Settle? Try ${brandName} Today`,
      primaryText: `Experience the difference with ${productShort}. ${goal === 'Sales' ? 'Premium quality at prices that make sense.' : goal === 'Leads' ? 'Get your free quote in under 60 seconds.' : 'Discover what makes us different.'} No risk, all reward.`,
      cta: ctas[2] || 'Learn More',
    },
    {
      headline: `${brandName}: Made for You`,
      primaryText: `${productShort} — designed with ${interests ? `people who love ${interests.split(',')[0].trim()}` : 'you'} in mind. Elevate your everyday with products that deliver real results.`,
      cta: goal === 'Sales' ? 'Shop Now' : 'Learn More',
    },
    {
      headline: `Special Offer Inside — ${brandName}`,
      primaryText: `Unlock exclusive deals on ${productShort}. ${goal === 'Sales' ? 'Save more when you shop today.' : goal === 'Leads' ? 'Sign up now and get a personalized recommendation.' : 'Click through to see what we have for you.'} This offer won't last forever.`,
      cta: goal === 'Sales' ? 'Get Offer' : 'Sign Up',
    },
  ];

  return variants;
}

/**
 * Try to extract ad variants from the parsed AI campaign plan. Returns null if
 * the AI did not include them.
 */
function extractAdVariantsFromPlan(plan: MetaCampaignPlan): AdVariant[] | null {
  const raw = plan as unknown as Record<string, unknown>;
  const candidates = raw.adVariants ?? raw.adCreatives ?? raw.variants;
  if (!Array.isArray(candidates) || candidates.length === 0) return null;

  const variants: AdVariant[] = [];
  for (const item of candidates) {
    if (typeof item !== 'object' || item === null) continue;
    const v = item as Record<string, unknown>;
    const headline = String(v.headline || v.title || '').trim();
    const primaryText = String(v.primaryText || v.body || v.description || v.text || '').trim();
    const cta = String(v.cta || v.callToAction || v.buttonText || '').trim();
    if (headline && primaryText) {
      variants.push({ headline, primaryText, cta: cta || 'Learn More' });
    }
  }

  return variants.length >= 3 ? variants.slice(0, 5) : null;
}

function MetaAdsCampaignPlanResults({ markdown, monthlyBudget, metaAdsFormData }: { markdown: string; monthlyBudget?: number; metaAdsFormData?: Record<string, unknown> }) {
  const plan = parseMetaAdsCampaignPlan(markdown);
  if (!plan) {
    return (
      <div className="space-y-3" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_parse_fail">
        <p className="text-muted-foreground" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_parse_msg">
          Could not parse the campaign plan from the AI response. The raw output is shown below.
        </p>
        <div className="rounded-lg border border-border/40 bg-muted/20 p-4 text-sm" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_raw">
          <MarkdownRenderer content={markdown} data-icod-id="src_components_aitoolgenerator_tsx_f72d" />
        </div>
      </div>
    );
  }

  const { campaign, adSets, recommendations } = plan;

  // Defect 1 fix: replace any stale MM/YYYY in the campaign name with the current month/year
  const now = new Date();
  const currentMonthYear = `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  const rawCampaignName = campaign.campaignName || campaign.name || 'Campaign Plan';
  const campaignName = rawCampaignName.replace(/\b\d{1,2}\/\d{4}\b/, currentMonthYear);

  // Defect 2 fix: use the form's monthlyBudget directly instead of relying on AI response
  const effectiveMonthlyBudget = monthlyBudget && monthlyBudget > 0 ? monthlyBudget : campaign.monthlyBudget;
  const effectiveDailyBudget = effectiveMonthlyBudget ? effectiveMonthlyBudget / 30 : campaign.dailyBudget;

  return (
    <div className="space-y-5" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_results">
      {/* Campaign Card */}
      <Card className="border-primary/30 bg-primary/5 p-5" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_campaign_card">
        <div className="flex items-center gap-3 mb-3" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_campaign_header">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_campaign_icon_bg">
            <Target className="h-5 w-5" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_campaign_icon" />
          </div>
          <div data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_campaign_title_wrap">
            <h4 className="font-semibold text-foreground" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_campaign_name">{campaignName}</h4>
            <p className="text-xs text-muted-foreground" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_campaign_obj">Meta Objective: {campaign.metaObjective || campaign.objective || 'N/A'}</p>
            {campaign.namingConvention && (
              <p className="text-[11px] text-muted-foreground mt-0.5" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_campaign_naming">Naming: {campaign.namingConvention}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_budget_grid">
          <div className="rounded-lg border border-border/40 bg-card p-3" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_daily_budget">
            <p className="text-xs font-medium text-muted-foreground" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_daily_label">Daily Budget</p>
            <p className="text-lg font-bold text-foreground" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_daily_value">${effectiveDailyBudget != null ? effectiveDailyBudget.toFixed(2) : '—'}</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-card p-3" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_monthly_budget">
            <p className="text-xs font-medium text-muted-foreground" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_monthly_label">Monthly Budget</p>
            <p className="text-lg font-bold text-foreground" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_monthly_value">${effectiveMonthlyBudget != null ? effectiveMonthlyBudget.toFixed(2) : '—'}</p>
          </div>
        </div>
      </Card>
      {/* Ad Set Cards */}
      <div data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_adsets_section">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_adsets_heading">
          <Zap className="h-4 w-4 text-primary" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_adsets_icon" />
          Ad Sets ({adSets.length})
        </h4>
        <div className="space-y-4" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_adsets_list">
          {adSets.map((adSet, idx) => (
            <Card key={idx} className="p-5 border-border/60 bg-card" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_adset_${idx}`}>
              <div className="flex items-start gap-3 mb-3" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_adset_header_${idx}`}>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_adset_num_${idx}`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_adset_title_wrap_${idx}`}>
                  <h5 className="font-semibold text-foreground" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_adset_name_${idx}`}>{adSet.name.replace(/\s*[–-]\s*\d{1,2}\/\d{4}/g, '') + ` – ${currentMonthYear}`}</h5>
                  <span className="inline-flex mt-1 items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_adset_targeting_type_${idx}`}>
                    {adSet.targetingType}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pl-10" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_adset_body_${idx}`}>
                {/* Audience */}
                <div data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_adset_audience_${idx}`}>
                  <p className="text-xs font-medium text-muted-foreground mb-1" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_adset_audience_label_${idx}`}>TARGETING APPROACH</p>
                  <p className="text-sm text-foreground leading-relaxed" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_adset_audience_text_${idx}`}>{adSet.audienceDescription}</p>
                </div>

                {/* Placements */}
                {adSet.placements && adSet.placements.length > 0 && (
                  <div data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_adset_placements_${idx}`}>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_adset_placements_label_${idx}`}>PLACEMENTS</p>
                    <div className="flex flex-wrap gap-1.5" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_adset_placements_tags_${idx}`}>
                      {adSet.placements.map((placement, pIdx) => (
                        <span key={pIdx} className="rounded-full border border-border bg-muted/30 px-2.5 py-0.5 text-xs font-medium text-foreground" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_adset_placement_${idx}_${pIdx}`}>
                          {placement}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Budget & Schedule */}
                <div className="grid grid-cols-2 gap-3" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_adset_budget_schedule_${idx}`}>
                  <div className="rounded-lg border border-border/40 bg-muted/20 p-2.5" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_adset_budget_${idx}`}>
                    <p className="text-[11px] font-medium text-muted-foreground" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_adset_budget_label_${idx}`}>BUDGET SPLIT</p>
                    <p className="text-sm font-semibold text-foreground" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_adset_budget_value_${idx}`}>
                      {adSet.budgetPercentage}% (${adSet.budgetAmount?.toFixed(2) ?? '—'})
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-muted/20 p-2.5" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_adset_schedule_${idx}`}>
                    <p className="text-[11px] font-medium text-muted-foreground" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_adset_schedule_label_${idx}`}>SCHEDULE</p>
                    <p className="text-sm font-semibold text-foreground" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_adset_schedule_value_${idx}`}>
                      {typeof adSet.schedule === 'object' && adSet.schedule !== null
                        ? (adSet.schedule as MetaAdSetSchedule).recommendation || (adSet.schedule as MetaAdSetSchedule).dayparting || 'Continuous'
                        : (adSet.schedule as string) || 'Continuous'}
                    </p>
                    {typeof adSet.schedule === 'object' && adSet.schedule !== null && (adSet.schedule as MetaAdSetSchedule).dayparting && (adSet.schedule as MetaAdSetSchedule).dayparting !== 'Run continuously' && (
                      <p className="text-[11px] text-muted-foreground mt-0.5" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_adset_dayparting_${idx}`}>
                        {(adSet.schedule as MetaAdSetSchedule).dayparting}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_recommendations">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_rec_heading">
            <Lightbulb className="h-4 w-4 text-warning" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_rec_icon" />
            Recommendations
          </h4>
          <ul className="space-y-2" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_rec_list">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 rounded-lg border border-border/40 bg-card p-3 text-sm text-foreground" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_rec_${i}`}>
                <Check className="h-4 w-4 text-success shrink-0 mt-0.5" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_rec_check_${i}`} />
                <span data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_rec_text_${i}`}>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Ad Variants */}
      {(() => {
        const aiVariants = plan ? extractAdVariantsFromPlan(plan) : null;
        const variants = aiVariants ?? (metaAdsFormData ? generateFallbackAdVariants(metaAdsFormData) : []);
        if (variants.length === 0) return null;
        return (
          <div data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_variants_section">
            <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_variants_heading">
              <Sparkles className="h-4 w-4 text-primary" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_variants_icon" />
              Ad Variants
            </h4>
            <p className="text-xs text-muted-foreground mb-3" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_variants_subtitle">
              AI-suggested ad creatives for your campaign
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_variants_grid">
              {variants.map((variant, idx) => {
                const copyText = `${variant.headline}\n\n${variant.primaryText}\n\nCTA: ${variant.cta}`;
                return (
                  <Card key={idx} className="relative p-5 border-border/60 bg-card flex flex-col gap-3" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_variant_${idx}`}>
                    <div className="flex items-start justify-between gap-2" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_variant_header_${idx}`}>
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_variant_num_${idx}`}>
                        {idx + 1}
                      </div>
                      <CopyButton
                        text={copyText}
                        label="Copy"
                        className="shrink-0 -mr-1 -mt-1"
                        data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_variant_copy_${idx}`} />
                    </div>
                    <div className="space-y-2 min-w-0" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_variant_body_${idx}`}>
                      <p className="text-sm font-semibold text-foreground leading-snug" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_variant_headline_${idx}`}>
                        {variant.headline}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_variant_text_${idx}`}>
                        {variant.primaryText}
                      </p>
                    </div>
                    <div className="mt-auto pt-1" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_variant_cta_wrap_${idx}`}>
                      <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent" data-icod-id={`src_components_aitoolgenerator_tsx_meta_ads_variant_cta_${idx}`}>
                        {variant.cta}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })()}
      {/* Meta Algorithm Best Practices */}
      <Card className="border-blue-500/30 bg-blue-500/5 p-5" data-icod-id="src_components_aitoolgenerator_tsx_meta_best_practices">
        <div className="flex items-center gap-2 mb-3" data-icod-id="src_components_aitoolgenerator_tsx_meta_bp_header">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400" data-icod-id="src_components_aitoolgenerator_tsx_meta_bp_icon_bg">
            <TrendingUp className="h-4 w-4" data-icod-id="src_components_aitoolgenerator_tsx_meta_bp_icon" />
          </div>
          <h4 className="text-sm font-semibold text-foreground" data-icod-id="src_components_aitoolgenerator_tsx_meta_bp_heading">Meta Algorithm Best Practices</h4>
        </div>
        <ul className="space-y-2" data-icod-id="src_components_aitoolgenerator_tsx_meta_bp_list">
          {[
            'Use broad targeting to let Meta\'s algorithm find your best audience',
            'Keep 3\u20137 active ads per ad set for optimal learning',
            'Allow 50 conversions per week per ad set before making changes',
            'Use Advantage+ placements for maximum delivery efficiency',
            'Avoid editing ads during the learning phase (first 3\u20137 days)',
            'Set campaign budget optimization (CBO) for automatic budget allocation',
            'Use high-quality creative with text overlay under 20%',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed" data-icod-id={`src_components_aitoolgenerator_tsx_meta_bp_item_${i}`}>
              <Check className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" data-icod-id={`src_components_aitoolgenerator_tsx_meta_bp_check_${i}`} />
              <span data-icod-id={`src_components_aitoolgenerator_tsx_meta_bp_text_${i}`}>{item}</span>
            </li>
          ))}
        </ul>
      </Card>
      {/* Meta Ad Policy Checklist */}
      <Card className="border-amber-500/30 bg-amber-500/5 p-5" data-icod-id="src_components_aitoolgenerator_tsx_meta_policy">
        <div className="flex items-center gap-2 mb-3" data-icod-id="src_components_aitoolgenerator_tsx_meta_policy_header">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400" data-icod-id="src_components_aitoolgenerator_tsx_meta_policy_icon_bg">
            <AlertTriangle className="h-4 w-4" data-icod-id="src_components_aitoolgenerator_tsx_meta_policy_icon" />
          </div>
          <h4 className="text-sm font-semibold text-foreground" data-icod-id="src_components_aitoolgenerator_tsx_meta_policy_heading">Meta Ad Policy Checklist</h4>
        </div>
        <div className="space-y-3" data-icod-id="src_components_aitoolgenerator_tsx_meta_policy_content">
          <div data-icod-id="src_components_aitoolgenerator_tsx_meta_policy_allowed">
            <p className="text-xs font-semibold text-success mb-1.5 flex items-center gap-1.5" data-icod-id="src_components_aitoolgenerator_tsx_meta_policy_allowed_label">
              <Check className="h-3.5 w-3.5" data-icod-id="src_components_aitoolgenerator_tsx_meta_policy_allowed_icon" />
              Allowed
            </p>
            <ul className="space-y-1" data-icod-id="src_components_aitoolgenerator_tsx_meta_policy_allowed_list">
              {[
                'Honest claims and truthful representations',
                'Original imagery and clear branding',
                'Landing page content matches ad messaging',
                'Proper grammar and professional language',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed pl-5" data-icod-id={`src_components_aitoolgenerator_tsx_meta_policy_allowed_item_${i}`}>
                  <span className="text-success shrink-0" data-icod-id={`src_components_aitoolgenerator_tsx_meta_policy_allowed_bullet_${i}`}>&#x2022;</span>
                  <span data-icod-id={`src_components_aitoolgenerator_tsx_meta_policy_allowed_text_${i}`}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div data-icod-id="src_components_aitoolgenerator_tsx_meta_policy_prohibited">
            <p className="text-xs font-semibold text-destructive mb-1.5 flex items-center gap-1.5" data-icod-id="src_components_aitoolgenerator_tsx_meta_policy_prohibited_label">
              <AlertTriangle className="h-3.5 w-3.5" data-icod-id="src_components_aitoolgenerator_tsx_meta_policy_prohibited_icon" />
              Prohibited / Restricted
            </p>
            <ul className="space-y-1" data-icod-id="src_components_aitoolgenerator_tsx_meta_policy_prohibited_list">
              {[
                'Misleading before/after images',
                'Sensational or exaggerated language',
                'Targeting based on personal attributes (race, religion, health conditions)',
                'Tobacco, drugs, weapons, or adult content',
                'Discriminatory practices or unrealistic income claims',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed pl-5" data-icod-id={`src_components_aitoolgenerator_tsx_meta_policy_prohibited_item_${i}`}>
                  <span className="text-destructive shrink-0" data-icod-id={`src_components_aitoolgenerator_tsx_meta_policy_prohibited_bullet_${i}`}>&#x2022;</span>
                  <span data-icod-id={`src_components_aitoolgenerator_tsx_meta_policy_prohibited_text_${i}`}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
      {/* Meta Ads Manager Launch Checklist */}
      <Card className="border-green-500/30 bg-green-500/5 p-5" data-icod-id="src_components_aitoolgenerator_tsx_meta_launch">
        <div className="flex items-center gap-2 mb-3" data-icod-id="src_components_aitoolgenerator_tsx_meta_launch_header">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400" data-icod-id="src_components_aitoolgenerator_tsx_meta_launch_icon_bg">
            <Check className="h-4 w-4" data-icod-id="src_components_aitoolgenerator_tsx_meta_launch_icon" />
          </div>
          <h4 className="text-sm font-semibold text-foreground" data-icod-id="src_components_aitoolgenerator_tsx_meta_launch_heading">Meta Ads Manager Launch Checklist</h4>
        </div>
        <ol className="space-y-2" data-icod-id="src_components_aitoolgenerator_tsx_meta_launch_list">
          {[
            'Review campaign objective matches your business goal',
            'Verify pixel/installation on your website',
            'Set up conversion events and custom audiences',
            'Double-check audience targeting and exclusions',
            'Preview ad creative on all placements (Feed, Stories, Reels)',
            'Set campaign start date and schedule',
            'Review budget allocation across ad sets, then click Publish',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed" data-icod-id={`src_components_aitoolgenerator_tsx_meta_launch_item_${i}`}>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold mt-0.5" data-icod-id={`src_components_aitoolgenerator_tsx_meta_launch_num_${i}`}>{i + 1}</span>
              <span data-icod-id={`src_components_aitoolgenerator_tsx_meta_launch_text_${i}`}>{item}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

const WHATSAPP_DIRECT_CHAT = 'https://wa.me/923358380233';

// ─── Listing Health Score Parser & Renderer ──────────────────────────────

interface ListingHealthScores {
  overall: number;
  titleSeo: number;
  descriptionQuality: number;
  keywordCoverage: number;
  pricingCompetitiveness: number;
  trustConversion: number;
}

interface ListingHealthFix {
  issue: string;
  whyItMatters: string;
  correction: string;
}

interface ListingHealthResult {
  scores: ListingHealthScores;
  fixes: ListingHealthFix[];
  quickWins: string[];
}

function parseListingHealthScore(markdown: string): ListingHealthResult | null {
  try {
    const overallMatch = markdown.match(/Overall Score:\s*(\d+)/i);
    const titleSeoMatch = markdown.match(/Title SEO:\s*(\d+)/i);
    const descMatch = markdown.match(/Description Quality:\s*(\d+)/i);
    const keywordMatch = markdown.match(/Keyword Coverage:\s*(\d+)/i);
    const pricingMatch = markdown.match(/Pricing Competitiveness:\s*(\d+)/i);
    const trustMatch = markdown.match(/Trust\s*&?\s*Conversion Signals?:\s*(\d+)/i);

    if (!overallMatch) return null;

    const scores: ListingHealthScores = {
      overall: parseInt(overallMatch[1], 10),
      titleSeo: titleSeoMatch ? parseInt(titleSeoMatch[1], 10) : 0,
      descriptionQuality: descMatch ? parseInt(descMatch[1], 10) : 0,
      keywordCoverage: keywordMatch ? parseInt(keywordMatch[1], 10) : 0,
      pricingCompetitiveness: pricingMatch ? parseInt(pricingMatch[1], 10) : 0,
      trustConversion: trustMatch ? parseInt(trustMatch[1], 10) : 0,
    };

    const fixes: ListingHealthFix[] = [];
    const fixBlocks = markdown.split(/(?=Fix #\d+:)/i);
    for (const block of fixBlocks) {
      const issueMatch = block.match(/Fix #\d+:\s*(.+)/i);
      const whyMatch = block.match(/Why It Matters:\s*(.+)/i);
      const correctionMatch = block.match(/Suggested Correction:\s*(.+)/i);
      if (issueMatch && whyMatch && correctionMatch) {
        fixes.push({
          issue: issueMatch[1].trim(),
          whyItMatters: whyMatch[1].trim(),
          correction: correctionMatch[1].trim(),
        });
      }
    }

    const quickWins: string[] = [];
    const qwSection = markdown.split('## QUICK WINS');
    if (qwSection.length > 1) {
      const lines = qwSection[1].split('\n');
      for (const line of lines) {
        const trimmed = line.replace(/^[-•*]\s*/, '').trim();
        if (trimmed && !trimmed.startsWith('#')) {
          quickWins.push(trimmed);
        }
      }
    }

    return { scores, fixes, quickWins };
  } catch {
    return null;
  }
}

function ScoreRing({ score, size = 'lg', label }: { score: number; size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const dims = size === 'lg' ? 140 : size === 'md' ? 100 : 60;
  const radius = dims / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? 'rgb(var(--cyan))' : score >= 40 ? 'rgb(var(--warning))' : 'rgb(var(--accent))';

  return (
    <div
      className="flex flex-col items-center gap-1"
      data-icod-id="src_components_aitoolgenerator_tsx_5e84">
      <div
        className="relative flex items-center justify-center"
        style={{ width: dims, height: dims }}
        data-icod-id="src_components_aitoolgenerator_tsx_290f">
        <svg
          className="h-full w-full -rotate-90"
          viewBox={`0 0 ${dims} ${dims}`}
          data-icod-id="src_components_aitoolgenerator_tsx_4373">
          <circle
            cx={dims / 2}
            cy={dims / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            className="text-muted"
            data-icod-id="src_components_aitoolgenerator_tsx_fc9c" />
          <circle
            cx={dims / 2}
            cy={dims / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            data-icod-id="src_components_aitoolgenerator_tsx_eccc" />
        </svg>
        <div
          className="absolute flex flex-col items-center"
          data-icod-id="src_components_aitoolgenerator_tsx_142b">
          <span
            className={cn('font-heading font-extrabold text-foreground', size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-xl' : 'text-sm')}
            data-icod-id="src_components_aitoolgenerator_tsx_f239">{score}</span>
          {size !== 'sm' && <span
            className="text-[10px] text-muted-foreground"
            data-icod-id="src_components_aitoolgenerator_tsx_2d45">/100</span>}
        </div>
      </div>
      {label && <span
        className="text-xs font-medium text-muted-foreground text-center max-w-[100px]"
        data-icod-id="src_components_aitoolgenerator_tsx_edf5">{label}</span>}
    </div>
  );
}

function ListingHealthResults({ markdown }: { markdown: string }) {
  const parsed = parseListingHealthScore(markdown);
  if (!parsed) return null;

  const { scores, fixes, quickWins } = parsed;
  const subScores = [
    { label: 'Title SEO', score: scores.titleSeo },
    { label: 'Description Quality', score: scores.descriptionQuality },
    { label: 'Keyword Coverage', score: scores.keywordCoverage },
    { label: 'Pricing', score: scores.pricingCompetitiveness },
    { label: 'Trust & Conversion', score: scores.trustConversion },
  ];

  return (
    <div
      className="space-y-6"
      data-icod-id="src_components_aitoolgenerator_tsx_9c47">
      {/* Overall Score */}
      <div
        className="flex flex-col items-center py-4"
        data-icod-id="src_components_aitoolgenerator_tsx_4dc5">
        <ScoreRing
          score={scores.overall}
          size="lg"
          label="Overall Health Score"
          data-icod-id="src_components_aitoolgenerator_tsx_2e88" />
      </div>
      {/* Sub-Score Breakdown */}
      <div data-icod-id="src_components_aitoolgenerator_tsx_117a">
        <h4
          className="text-sm font-semibold text-foreground mb-3"
          data-icod-id="src_components_aitoolgenerator_tsx_30c1">Sub-Score Breakdown</h4>
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
          data-icod-id="src_components_aitoolgenerator_tsx_202a">
          {subScores.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center rounded-lg border border-border/40 bg-card p-3"
              data-icod-id={`src_components_aitoolgenerator_tsx_2df3_${s.label}`}>
              <ScoreRing
                score={s.score}
                size="sm"
                data-icod-id={`src_components_aitoolgenerator_tsx_adff_${s.label}`} />
              <span
                className="mt-1 text-[11px] font-medium text-muted-foreground text-center leading-tight"
                data-icod-id={`src_components_aitoolgenerator_tsx_c51e_${s.label}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Ranked Fixes */}
      {fixes.length > 0 && (
        <div data-icod-id="src_components_aitoolgenerator_tsx_cde5">
          <div
            className="flex items-center gap-2 mb-3"
            data-icod-id="src_components_aitoolgenerator_tsx_cd37">
            <AlertTriangle
              className="h-4 w-4 text-warning"
              data-icod-id="src_components_aitoolgenerator_tsx_9725" />
            <h4
              className="text-sm font-semibold text-foreground"
              data-icod-id="src_components_aitoolgenerator_tsx_0777">Ranked Fixes by Impact</h4>
          </div>
          <div
            className="space-y-3"
            data-icod-id="src_components_aitoolgenerator_tsx_a1e9">
            {fixes.map((fix, i) => (
              <div
                key={i}
                className="rounded-lg border border-border/40 bg-card p-4"
                data-icod-id={`src_components_aitoolgenerator_tsx_a565_${i}`}>
                <div
                  className="flex items-start gap-3"
                  data-icod-id={`src_components_aitoolgenerator_tsx_6f24_${i}`}>
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive text-xs font-bold mt-0.5"
                    data-icod-id={`src_components_aitoolgenerator_tsx_0b1e_${i}`}>{i + 1}</span>
                  <div
                    className="min-w-0 flex-1 space-y-1.5"
                    data-icod-id={`src_components_aitoolgenerator_tsx_5d55_${i}`}>
                    <p
                      className="text-sm font-medium text-foreground"
                      data-icod-id={`src_components_aitoolgenerator_tsx_c256_${i}`}>{fix.issue}</p>
                    <p
                      className="text-xs text-muted-foreground"
                      data-icod-id={`src_components_aitoolgenerator_tsx_59dd_${i}`}><span
                      className="font-medium text-foreground/80"
                      data-icod-id={`src_components_aitoolgenerator_tsx_1318_${i}`}>Why it matters:</span> {fix.whyItMatters}</p>
                    <p
                      className="text-xs text-success"
                      data-icod-id={`src_components_aitoolgenerator_tsx_f742_${i}`}><span
                      className="font-medium"
                      data-icod-id={`src_components_aitoolgenerator_tsx_ceaf_${i}`}>Fix:</span> {fix.correction}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Quick Wins */}
      {quickWins.length > 0 && (
        <div data-icod-id="src_components_aitoolgenerator_tsx_7aba">
          <div
            className="flex items-center gap-2 mb-3"
            data-icod-id="src_components_aitoolgenerator_tsx_b4ee">
            <Zap
              className="h-4 w-4 text-success"
              data-icod-id="src_components_aitoolgenerator_tsx_4379" />
            <h4
              className="text-sm font-semibold text-foreground"
              data-icod-id="src_components_aitoolgenerator_tsx_3922">Quick Wins</h4>
          </div>
          <ul
            className="space-y-2"
            data-icod-id="src_components_aitoolgenerator_tsx_8ecc">
            {quickWins.map((win, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-lg border border-success/20 bg-success/5 p-3 text-sm text-foreground"
                data-icod-id={`src_components_aitoolgenerator_tsx_75d4_${i}`}>
                <Check
                  className="h-4 w-4 text-success shrink-0 mt-0.5"
                  data-icod-id={`src_components_aitoolgenerator_tsx_15b5_${i}`} />
                <span data-icod-id={`src_components_aitoolgenerator_tsx_fdcc_${i}`}>{win}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Keyword Research Parser & Renderer ────────────────────────────────────

interface KeywordRow {
  keyword: string;
  searchVolume: string;
  competition: string;
}

interface KeywordResearchResult {
  keywords: KeywordRow[];
  difficulty: string;
  difficultyExplanation: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  strategyNote: string;
  contentIdeas: string[];
}

function parseKeywordResearch(markdown: string): KeywordResearchResult | null {
  try {
    // Parse keyword table
    const keywords: KeywordRow[] = [];
    const tableMatch = markdown.match(/## KEYWORD TABLE[\s\S]*?\|[-\s|]+\n([\s\S]*?)(?=\n## |\n$)/i);
    if (tableMatch) {
      const rows = tableMatch[1].trim().split('\n');
      for (const row of rows) {
        const cells = row.split('|').map((c) => c.trim()).filter(Boolean);
        if (cells.length >= 3) {
          keywords.push({
            keyword: cells[0],
            searchVolume: cells[1],
            competition: cells[2],
          });
        }
      }
    }

    // Parse difficulty
    const diffMatch = markdown.match(/Overall Difficulty:\s*(Easy|Medium|Hard)/i);
    const difficulty = diffMatch ? diffMatch[1] : 'Unknown';
    const diffExplMatch = markdown.match(/Explanation:\s*([\s\S]*?)(?=\n## |\n$)/i);
    const difficultyExplanation = diffExplMatch ? diffExplMatch[1].trim() : '';

    // Parse recommended keywords
    const primaryMatch = markdown.match(/Primary Keyword:\s*(.+)/i);
    const primaryKeyword = primaryMatch ? primaryMatch[1].trim() : '';

    const secondaryKeywords: string[] = [];
    const secondarySection = markdown.match(/Secondary Keywords:\s*\n([\s\S]*?)(?=\nStrategy Note:|\n## |\n$)/i);
    if (secondarySection) {
      const lines = secondarySection[1].split('\n');
      for (const line of lines) {
        const trimmed = line.replace(/^[-•*]\s*/, '').trim();
        if (trimmed && !trimmed.startsWith('#')) {
          secondaryKeywords.push(trimmed);
        }
      }
    }

    const strategyMatch = markdown.match(/Strategy Note:\s*(.+)/i);
    const strategyNote = strategyMatch ? strategyMatch[1].trim() : '';

    // Parse content ideas
    const contentIdeas: string[] = [];
    const ideasSection = markdown.match(/## CONTENT IDEAS[\s\S]*?(?=\n## |\n$)/i);
    if (ideasSection) {
      const lines = ideasSection[0].split('\n');
      for (const line of lines) {
        const trimmed = line.replace(/^\d+\.\s*/, '').trim();
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('CONTENT')) {
          contentIdeas.push(trimmed);
        }
      }
    }

    if (keywords.length === 0 && !primaryKeyword) return null;

    return { keywords, difficulty, difficultyExplanation, primaryKeyword, secondaryKeywords, strategyNote, contentIdeas };
  } catch {
    return null;
  }
}

function KeywordResearchResults({ markdown }: { markdown: string }) {
  const parsed = parseKeywordResearch(markdown);
  if (!parsed) {
    return (
      <MarkdownRenderer
        content={markdown}
        className="prose prose-sm max-w-none"
        data-icod-id="src_components_aitoolgenerator_tsx_5ca4" />
    );
  }

  const { keywords, difficulty, difficultyExplanation, primaryKeyword, secondaryKeywords, strategyNote, contentIdeas } = parsed;

  const diffColor = difficulty.toLowerCase() === 'easy' ? 'text-success' : difficulty.toLowerCase() === 'hard' ? 'text-destructive' : 'text-warning';
  const diffBg = difficulty.toLowerCase() === 'easy' ? 'bg-success/10 border-success/20' : difficulty.toLowerCase() === 'hard' ? 'bg-destructive/10 border-destructive/20' : 'bg-warning/10 border-warning/20';

  return (
    <div className="space-y-6" data-icod-id="src_components_aitoolgenerator_tsx_kr_results">
      {/* Keyword Table */}
      {keywords.length > 0 && (
        <div data-icod-id="src_components_aitoolgenerator_tsx_kr_table_section">
          <div className="flex items-center gap-2 mb-3" data-icod-id="src_components_aitoolgenerator_tsx_kr_table_header">
            <BarChart3 className="h-4 w-4 text-primary" data-icod-id="src_components_aitoolgenerator_tsx_kr_table_icon" />
            <h4 className="text-sm font-semibold text-foreground" data-icod-id="src_components_aitoolgenerator_tsx_kr_table_title">Keyword Analysis</h4>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border/40" data-icod-id="src_components_aitoolgenerator_tsx_kr_table_wrap">
            <table className="w-full text-sm" data-icod-id="src_components_aitoolgenerator_tsx_kr_table">
              <thead data-icod-id="src_components_aitoolgenerator_tsx_kr_thead">
                <tr className="border-b border-border/40 bg-muted/30" data-icod-id="src_components_aitoolgenerator_tsx_kr_thead_row">
                  <th className="px-4 py-2.5 text-left font-medium text-foreground" data-icod-id="src_components_aitoolgenerator_tsx_kr_th_kw">Keyword</th>
                  <th className="px-4 py-2.5 text-left font-medium text-foreground" data-icod-id="src_components_aitoolgenerator_tsx_kr_th_vol">Est. Search Volume</th>
                  <th className="px-4 py-2.5 text-left font-medium text-foreground" data-icod-id="src_components_aitoolgenerator_tsx_kr_th_comp">Competition Level</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_components_aitoolgenerator_tsx_kr_tbody">
                {keywords.map((kw, i) => (
                  <tr key={i} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors" data-icod-id={`src_components_aitoolgenerator_tsx_kr_row_${i}`}>
                    <td className="px-4 py-2.5 font-medium text-foreground" data-icod-id={`src_components_aitoolgenerator_tsx_kr_kw_${i}`}>{kw.keyword}</td>
                    <td className="px-4 py-2.5 text-muted-foreground" data-icod-id={`src_components_aitoolgenerator_tsx_kr_vol_${i}`}>{kw.searchVolume}</td>
                    <td className="px-4 py-2.5 text-muted-foreground" data-icod-id={`src_components_aitoolgenerator_tsx_kr_comp_${i}`}>{kw.competition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Difficulty Assessment */}
      <div data-icod-id="src_components_aitoolgenerator_tsx_kr_difficulty">
        <div className="flex items-center gap-2 mb-3" data-icod-id="src_components_aitoolgenerator_tsx_kr_diff_header">
          <TrendingUp className="h-4 w-4 text-primary" data-icod-id="src_components_aitoolgenerator_tsx_kr_diff_icon" />
          <h4 className="text-sm font-semibold text-foreground" data-icod-id="src_components_aitoolgenerator_tsx_kr_diff_title">Keyword Difficulty</h4>
        </div>
        <div className={cn('rounded-lg border p-4', diffBg)} data-icod-id="src_components_aitoolgenerator_tsx_kr_diff_card">
          <div className="flex items-center gap-3 mb-2" data-icod-id="src_components_aitoolgenerator_tsx_kr_diff_badge_row">
            <span className={cn('text-lg font-bold', diffColor)} data-icod-id="src_components_aitoolgenerator_tsx_kr_diff_level">{difficulty}</span>
          </div>
          {difficultyExplanation && (
            <p className="text-sm text-muted-foreground" data-icod-id="src_components_aitoolgenerator_tsx_kr_diff_expl">{difficultyExplanation}</p>
          )}
        </div>
      </div>

      {/* Recommended Keywords */}
      {(primaryKeyword || secondaryKeywords.length > 0) && (
        <div data-icod-id="src_components_aitoolgenerator_tsx_kr_recommended">
          <div className="flex items-center gap-2 mb-3" data-icod-id="src_components_aitoolgenerator_tsx_kr_rec_header">
            <Target className="h-4 w-4 text-success" data-icod-id="src_components_aitoolgenerator_tsx_kr_rec_icon" />
            <h4 className="text-sm font-semibold text-foreground" data-icod-id="src_components_aitoolgenerator_tsx_kr_rec_title">Recommended Keywords</h4>
          </div>
          <div className="space-y-3" data-icod-id="src_components_aitoolgenerator_tsx_kr_rec_content">
            {primaryKeyword && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4" data-icod-id="src_components_aitoolgenerator_tsx_kr_primary">
                <p className="text-xs font-medium text-muted-foreground mb-1" data-icod-id="src_components_aitoolgenerator_tsx_kr_primary_label">PRIMARY KEYWORD</p>
                <p className="text-base font-semibold text-foreground" data-icod-id="src_components_aitoolgenerator_tsx_kr_primary_value">{primaryKeyword}</p>
              </div>
            )}
            {secondaryKeywords.length > 0 && (
              <div className="rounded-lg border border-border/40 bg-card p-4" data-icod-id="src_components_aitoolgenerator_tsx_kr_secondary">
                <p className="text-xs font-medium text-muted-foreground mb-2" data-icod-id="src_components_aitoolgenerator_tsx_kr_secondary_label">SECONDARY KEYWORDS</p>
                <div className="flex flex-wrap gap-2" data-icod-id="src_components_aitoolgenerator_tsx_kr_secondary_tags">
                  {secondaryKeywords.map((kw, i) => (
                    <span key={i} className="rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-medium text-foreground" data-icod-id={`src_components_aitoolgenerator_tsx_kr_sec_tag_${i}`}>{kw}</span>
                  ))}
                </div>
              </div>
            )}
            {strategyNote && (
              <p className="text-sm text-muted-foreground italic" data-icod-id="src_components_aitoolgenerator_tsx_kr_strategy">{strategyNote}</p>
            )}
          </div>
        </div>
      )}

      {/* Content Ideas */}
      {contentIdeas.length > 0 && (
        <div data-icod-id="src_components_aitoolgenerator_tsx_kr_ideas">
          <div className="flex items-center gap-2 mb-3" data-icod-id="src_components_aitoolgenerator_tsx_kr_ideas_header">
            <Lightbulb className="h-4 w-4 text-warning" data-icod-id="src_components_aitoolgenerator_tsx_kr_ideas_icon" />
            <h4 className="text-sm font-semibold text-foreground" data-icod-id="src_components_aitoolgenerator_tsx_kr_ideas_title">Content Ideas</h4>
          </div>
          <ul className="space-y-2" data-icod-id="src_components_aitoolgenerator_tsx_kr_ideas_list">
            {contentIdeas.map((idea, i) => (
              <li key={i} className="flex items-start gap-2 rounded-lg border border-border/40 bg-card p-3 text-sm text-foreground" data-icod-id={`src_components_aitoolgenerator_tsx_kr_idea_${i}`}>
                <Search className="h-4 w-4 text-primary shrink-0 mt-0.5" data-icod-id={`src_components_aitoolgenerator_tsx_kr_idea_icon_${i}`} />
                <span data-icod-id={`src_components_aitoolgenerator_tsx_kr_idea_text_${i}`}>{idea}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── WhatsApp Messages Parser & Renderer ─────────────────────────────────────

interface WhatsAppMessage {
  option: string;
  text: string;
}

function parseWhatsAppMessages(markdown: string): WhatsAppMessage[] {
  const messages: WhatsAppMessage[] = [];
  // Match **Option N:** followed by message text until next option or end
  const optionRegex = /\*\*Option\s+\d+[:.]?\*\*\s*\n?([\s\S]*?)(?=\*\*Option\s+\d+|$)/gi;
  let match: RegExpExecArray | null;
  while ((match = optionRegex.exec(markdown)) !== null) {
    const text = match[1].trim();
    if (text && text.length > 5) {
      messages.push({ option: `Option ${messages.length + 1}`, text });
    }
  }

  // Fallback: split by double newlines or --- separators
  if (messages.length === 0) {
    const blocks = markdown.split(/(?:---|\n\s*\n)/).filter((b) => b.trim());
    for (const block of blocks) {
      const trimmed = block.trim().replace(/^\d+[\.\)]\s*/, '').replace(/^\*{1,2}/, '').replace(/\*{1,2}$/, '').trim();
      if (trimmed && trimmed.length > 10) {
        messages.push({ option: `Option ${messages.length + 1}`, text: trimmed });
      }
    }
  }

  return messages.slice(0, 3);
}

function WhatsAppMessagesResults({ markdown }: { markdown: string }) {
  const messages = parseWhatsAppMessages(markdown);
  if (messages.length === 0) {
    return (
      <div className="space-y-3" data-icod-id="src_components_aitoolgenerator_tsx_whatsapp_parse_fail">
        <p className="text-muted-foreground" data-icod-id="src_components_aitoolgenerator_tsx_whatsapp_parse_msg">
          Could not parse messages from the AI response. The raw output is shown below — you can copy it manually.
        </p>
        <div className="rounded-lg border border-border/40 bg-muted/20 p-4 text-sm" data-icod-id="src_components_aitoolgenerator_tsx_whatsapp_raw">
          <MarkdownRenderer content={markdown} data-icod-id="src_components_aitoolgenerator_tsx_whatsapp_raw_md" />
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4" data-icod-id="src_components_aitoolgenerator_tsx_whatsapp_list">
      {messages.map((msg, idx) => (
        <Card
          key={idx}
          className="relative p-5 border-border/60 bg-card"
          data-icod-id={`src_components_aitoolgenerator_tsx_whatsapp_msg_${idx}`}>
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4" data-icod-id={`src_components_aitoolgenerator_tsx_whatsapp_msg_inner_${idx}`}>
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-primary-foreground text-sm font-bold"
              data-icod-id={`src_components_aitoolgenerator_tsx_whatsapp_msg_num_${idx}`}>
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0" data-icod-id={`src_components_aitoolgenerator_tsx_whatsapp_msg_content_${idx}`}>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap" data-icod-id={`src_components_aitoolgenerator_tsx_whatsapp_msg_text_${idx}`}>
                {msg.text}
              </p>
            </div>
            <CopyButton
              text={msg.text}
              label="Copy"
              className="shrink-0 self-end sm:self-auto"
              data-icod-id={`src_components_aitoolgenerator_tsx_whatsapp_msg_copy_${idx}`} />
          </div>
        </Card>
      ))}
    </div>
  );
}

interface AIToolGeneratorProps {
  toolSlug: string;
  className?: string;
}

// Form configurations per tool type
const toolFormConfigs: Record<string, { fields: FormField[] }> = {
  'product-description-generator': {
    fields: [
      { name: 'product', label: 'Product Name/Description', type: 'textarea', placeholder: 'e.g., Organic cotton t-shirt with vintage wash', required: true },
      { name: 'tone', label: 'Tone', type: 'select', options: ['professional', 'casual', 'luxury', 'playful', 'urgent'], defaultValue: 'professional' },
      { name: 'outputLanguage', label: 'Output Language', type: 'select', options: ['english', 'roman-urdu'], defaultValue: 'english' },
      { name: 'length', label: 'Length', type: 'select', options: ['short', 'medium', 'long'], defaultValue: 'medium' },
      { name: 'targetAudience', label: 'Target Audience (optional)', type: 'text', placeholder: 'e.g., Young professionals, eco-conscious shoppers' },
    ],
  },
  'seo-title-optimizer': {
    fields: [
      { name: 'topic', label: 'Product/Topic', type: 'text', placeholder: 'e.g., Vintage Levi\'s 501 Jeans', required: true },
      { name: 'keywords', label: 'Keywords (comma-separated)', type: 'text', placeholder: 'e.g., vintage, denim, high-waisted, straight leg' },
      { name: 'platform', label: 'Platform', type: 'select', options: ['general', 'eBay', 'Etsy', 'Shopify', 'Amazon'], defaultValue: 'general' },
      { name: 'sellingMarketplace', label: 'Selling on', type: 'select', options: ['General', 'Daraz', 'Shopify', 'eBay'], defaultValue: 'General' },
    ],
  },
  'hashtag-generator': {
    fields: [
      { name: 'topic', label: 'Topic/Niche', type: 'text', placeholder: 'e.g., Handmade jewelry, sustainable fashion', required: true },
      { name: 'platform', label: 'Platform', type: 'select', options: ['Instagram', 'TikTok', 'Pinterest', 'Twitter', 'LinkedIn'], defaultValue: 'Instagram' },
      { name: 'count', label: 'Number of Hashtags', type: 'select', options: ['15', '20', '30'], defaultValue: '30' },
    ],
  },
  'profit-calculator': {
    fields: [
      { name: 'profitMarketplace', label: 'Marketplace', type: 'select', options: ['Amazon', 'eBay', 'Shopify', 'Daraz', 'Own Website', 'Other'], defaultValue: 'Other' },
      { name: 'profitCountry', label: 'Country', type: 'select', options: ['Pakistan', 'USA', 'UK', 'UAE', 'India', 'Canada', 'Australia', 'Other'], defaultValue: '' },
      { name: 'profitCurrency', label: 'Currency Code', type: 'text', placeholder: 'e.g. PKR, USD, GBP', defaultValue: 'USD' },
      { name: 'productCost', label: 'Product Cost', type: 'number', placeholder: '10.00', required: true },
      { name: 'sellingPrice', label: 'Selling Price', type: 'number', placeholder: '25.00', required: true },
      { name: 'shippingCost', label: 'Shipping Cost', type: 'number', placeholder: '3.00', defaultValue: '0' },
      { name: 'commissionPercent', label: 'Commission / Referral Fee (%)', type: 'number', placeholder: 'e.g. 15', defaultValue: '0' },
      { name: 'paymentProcessingPercent', label: 'Payment Processing Fee (%)', type: 'number', placeholder: 'e.g. 2.9', defaultValue: '0' },
      { name: 'deliveryFee', label: 'Delivery / Shipping Fee', type: 'number', placeholder: 'e.g. 5', defaultValue: '0' },
      { name: 'advertisingCost', label: 'Advertising Cost', type: 'number', placeholder: '0.00', defaultValue: '0' },
      { name: 'otherExpenses', label: 'Other Expenses', type: 'number', placeholder: '0.00', defaultValue: '0' },
    ],
  },
  'competitor-analyzer': {
    fields: [
      { name: 'url', label: 'Competitor URL', type: 'url', placeholder: 'https://competitor-store.com', required: true },
      { name: 'focusAreas', label: 'Focus Areas', type: 'multiselect', options: ['pricing', 'seo', 'content', 'ux', 'social'], defaultValue: ['pricing', 'seo', 'content'] },
    ],
  },
  'review-response-writer': {
    fields: [
      { name: 'review', label: 'Customer Review', type: 'textarea', placeholder: 'Paste the customer review here...', required: true },
      { name: 'rating', label: 'Rating (1-5)', type: 'number', placeholder: '5' },
      { name: 'tone', label: 'Response Tone', type: 'select', options: ['friendly', 'professional', 'apologetic', 'grateful', 'empathetic'], defaultValue: 'professional' },
    ],
  },
  'listing-optimizer': {
    fields: [
      { name: 'productTitle', label: 'Current Product Title', type: 'text', placeholder: 'e.g., Blue Cotton T-Shirt Medium', required: true },
      { name: 'description', label: 'Current Description', type: 'textarea', placeholder: 'Paste your current product description...', required: true },
      { name: 'category', label: 'Category', type: 'text', placeholder: 'e.g., Clothing > Men > T-Shirts' },
      { name: 'keywords', label: 'Target Keywords (comma-separated)', type: 'text', placeholder: 'e.g., cotton t-shirt, men casual wear, blue tee' },
      { name: 'platform', label: 'Platform', type: 'select', options: ['general', 'eBay', 'Etsy', 'Shopify', 'Amazon'], defaultValue: 'general' },
      { name: 'sellingMarketplace', label: 'Selling on', type: 'select', options: ['General', 'Daraz', 'Shopify', 'eBay'], defaultValue: 'General' },
      { name: 'details', label: 'Additional Details (optional)', type: 'textarea', placeholder: 'Brand, material, condition, dimensions, etc.' },
    ],
  },
  'social-media-studio': {
    fields: [
      { name: 'platform', label: 'Platform', type: 'select', options: ['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'Twitter'], defaultValue: 'Instagram', required: true },
      { name: 'topic', label: 'Topic / Product', type: 'text', placeholder: 'e.g., New summer collection launch', required: true },
      { name: 'targetAudience', label: 'Target Audience', type: 'text', placeholder: 'e.g., Women 25-35 interested in sustainable fashion' },
      { name: 'contentType', label: 'Content Type', type: 'select', options: ['post', 'reel', 'story', 'carousel'], defaultValue: 'post' },
      { name: 'tone', label: 'Tone', type: 'select', options: ['professional', 'casual', 'inspirational', 'humorous'], defaultValue: 'casual' },
      { name: 'keyMessage', label: 'Key Message (optional)', type: 'text', placeholder: 'e.g., Our fabrics are 100% recycled materials' },
      { name: 'cta', label: 'Call-to-Action (optional)', type: 'text', placeholder: 'e.g., Shop now, Link in bio, Comment below' },
    ],
  },
  'store-audit': {
    fields: [
      { name: 'storeUrl', label: 'Store URL', type: 'url', placeholder: 'https://your-store.com', required: true },
      { name: 'platformType', label: 'Platform', type: 'select', options: ['Shopify', 'WooCommerce', 'Etsy', 'eBay', 'Wix', 'Custom', 'Other'], defaultValue: 'Shopify' },
      { name: 'businessNiche', label: 'Business Niche', type: 'text', placeholder: 'e.g., Handmade jewelry, vintage clothing' },
      { name: 'additionalInfo', label: 'Additional Store Info (optional)', type: 'textarea', placeholder: 'Any specific concerns or areas you want analyzed...' },
    ],
  },
  'branding-assistant': {
    fields: [
      { name: 'businessName', label: 'Business Name', type: 'text', placeholder: 'e.g., Crafted & Co.', required: true },
      { name: 'niche', label: 'Niche / Industry', type: 'text', placeholder: 'e.g., Sustainable fashion, handmade candles', required: true },
      { name: 'targetAudience', label: 'Target Audience', type: 'textarea', placeholder: 'e.g., Eco-conscious millennials who value ethical production' },
      { name: 'brandPersonality', label: 'Brand Personality Traits', type: 'multiselect', options: ['modern', 'classic', 'playful', 'luxurious', 'minimalist', 'bold', 'warm', 'innovative', 'trustworthy', 'adventurous'] },
      { name: 'existingColors', label: 'Existing Colors (optional)', type: 'text', placeholder: 'e.g., Navy blue and gold, or hex codes like #1a237e #ffd700' },
    ],
  },
  'bulk-listing-generator': {
    fields: [
      { name: 'products', label: 'Product Data (JSON or line-by-line)', type: 'textarea', placeholder: 'Enter products as JSON array:\n[{"name":"Blue T-Shirt","category":"Clothing","features":"Cotton, Medium"}]\n\nOr line-by-line:\nBlue T-Shirt | Clothing | Cotton, Medium\nRed Mug | Home | Ceramic, 12oz', required: true },
      { name: 'targetMarketplace', label: 'Target Marketplace', type: 'select', options: ['general', 'eBay', 'Etsy', 'Shopify', 'Amazon'], defaultValue: 'general' },
      { name: 'batchSize', label: 'Batch Size (max 20)', type: 'number', placeholder: '10', defaultValue: '10' },
    ],
  },
  'product-research-assistant': {
    fields: [
      { name: 'productNiche', label: 'Product Niche', type: 'text', placeholder: 'e.g., Eco-friendly phone cases, pet accessories', required: true },
      { name: 'keywords', label: 'Related Keywords', type: 'text', placeholder: 'e.g., sustainable phone case, biodegradable cover' },
      { name: 'targetMarket', label: 'Target Market', type: 'select', options: ['United States', 'Europe', 'United Kingdom', 'Canada', 'Australia', 'Global'], defaultValue: 'United States' },
      { name: 'competitorUrls', label: 'Competitor URLs (optional)', type: 'textarea', placeholder: 'Paste competitor product URLs, one per line...' },
    ],
  },
  'prompt-library': {
    fields: [
      { name: 'category', label: 'Category', type: 'select', options: ['Social Media', 'Email Marketing', 'Product Listings', 'Blog/SEO', 'Customer Service', 'Advertising'], defaultValue: 'Social Media', required: true },
      { name: 'topic', label: 'Topic / Subject', type: 'text', placeholder: 'e.g., handmade candles, fitness supplements', required: true },
      { name: 'platform', label: 'Platform (optional)', type: 'select', options: ['Instagram', 'TikTok', 'Facebook', 'Twitter/X', 'LinkedIn', 'Email', 'Blog', 'General'], defaultValue: 'General' },
      { name: 'tone', label: 'Tone (optional)', type: 'select', options: ['Professional', 'Casual', 'Friendly', 'Urgent', 'Inspirational'], defaultValue: 'Professional' },
      { name: 'count', label: 'Number of Prompts', type: 'number', placeholder: '10', defaultValue: '10' },
    ],
  },
  'listing-health-score': {
    fields: [
      { name: 'listingTitle', label: 'Listing Title', type: 'text', placeholder: 'e.g., Vintage Levi\'s 501 Jeans Men\'s Size 32 Dark Wash', required: true },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Paste your full product description here...', required: true },
      { name: 'price', label: 'Price ($)', type: 'number', placeholder: '29.99', required: true },
      { name: 'marketplace', label: 'Marketplace', type: 'select', options: ['Shopify', 'eBay', 'Etsy', 'Amazon'], defaultValue: 'Shopify', required: true },
    ],
  },
  'keyword-research': {
    fields: [
      { name: 'seedKeyword', label: 'Seed Keyword / Topic', type: 'text', placeholder: 'e.g., organic skincare, vintage denim jacket', required: true },
      { name: 'target', label: 'Target Marketplace', type: 'select', options: ['Google', 'Shopify', 'eBay', 'Etsy', 'Amazon'], defaultValue: 'Google', required: true },
    ],
  },
  'brand-campaign-studio': {
    fields: [
      { name: 'brandName', label: 'Brand Name', type: 'text', placeholder: 'e.g., Crafted & Co.', required: true },
      { name: 'websiteUrl', label: 'Website URL (optional)', type: 'url', placeholder: 'https://yourbrand.com' },
      { name: 'description', label: 'Brand Description', type: 'textarea', placeholder: 'Describe your brand, products, and what makes you unique...', required: true },
      { name: 'targetAudience', label: 'Target Audience', type: 'textarea', placeholder: 'e.g., Eco-conscious millennials who value ethical production and sustainable materials', required: true },
    ],
  },
  'whatsapp-business-generator': {
    fields: [
      { name: 'businessName', label: 'Business Name', type: 'text', placeholder: 'e.g., MG Blessed Beginnings', required: true },
      { name: 'productService', label: 'Product / Service', type: 'text', placeholder: 'e.g., Handmade leather bags, organic skincare', required: true },
      { name: 'messageType', label: 'Message Type', type: 'select', options: ['catalog', 'broadcast', 'order-confirmation', 'cod-followup', 'welcome', 'abandoned-cart'], defaultValue: 'catalog', required: true },
      { name: 'tone', label: 'Tone', type: 'select', options: ['friendly', 'professional'], defaultValue: 'friendly', required: true },
      { name: 'language', label: 'Language', type: 'select', options: ['english', 'roman-urdu'], defaultValue: 'english', required: true },
    ],
  },
};

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'url';
  placeholder?: string;
  options?: string[];
  defaultValue?: string | string[] | number;
  required?: boolean;
}

export default function AIToolGenerator({ toolSlug, className }: AIToolGeneratorProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [output, setOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Brand Campaign Studio — Campaign Ideas sub-generator state
  const [campaignIdeasOutput, setCampaignIdeasOutput] = useState<string | null>(null);
  const [isCampaignIdeasLoading, setIsCampaignIdeasLoading] = useState(false);
  const [campaignIdeasError, setCampaignIdeasError] = useState<string | null>(null);

  // Brand Campaign Studio — Social Media Posts sub-generator state
  const [socialPostsOutput, setSocialPostsOutput] = useState<string | null>(null);
  const [isSocialPostsLoading, setIsSocialPostsLoading] = useState(false);
  const [socialPostsError, setSocialPostsError] = useState<string | null>(null);

  // Brand Campaign Studio — Ad Headlines sub-generator state
  const [adHeadlinesResult, setAdHeadlinesResult] = useState<string | null>(null);
  const [adHeadlinesLoading, setAdHeadlinesLoading] = useState(false);
  const [adHeadlinesError, setAdHeadlinesError] = useState<string | null>(null);

  // Brand Campaign Studio — Product Descriptions sub-generator state
  const [productDescriptionsResult, setProductDescriptionsResult] = useState<string | null>(null);
  const [productDescriptionsLoading, setProductDescriptionsLoading] = useState(false);
  const [productDescriptionsError, setProductDescriptionsError] = useState<string | null>(null);

  // Brand Campaign Studio — Meta Ads Campaign Planner sub-generator state
  const [metaAdsPlanResult, setMetaAdsPlanResult] = useState<string | null>(null);
  const [metaAdsPlanLoading, setMetaAdsPlanLoading] = useState(false);
  const [metaAdsPlanError, setMetaAdsPlanError] = useState<string | null>(null);
  const [metaAdsFormData, setMetaAdsFormData] = useState<Record<string, unknown>>({
    campaignGoal: 'Sales',
    monthlyBudget: 500,
  });

  const config = toolFormConfigs[toolSlug];

  // Initialize form data with default values when tool changes
  useEffect(() => {
    if (config) {
      const defaults: Record<string, unknown> = {};
      for (const field of config.fields) {
        if (field.defaultValue !== undefined) {
          defaults[field.name] = field.defaultValue;
        }
      }
      setFormData(defaults);
    }
    // Reset other state when tool changes
    setOutput(null);
    setError(null);
    setCopied(false);
    setCampaignIdeasOutput(null);
    setIsCampaignIdeasLoading(false);
    setCampaignIdeasError(null);
    setSocialPostsOutput(null);
    setIsSocialPostsLoading(false);
    setSocialPostsError(null);
    setAdHeadlinesResult(null);
    setAdHeadlinesLoading(false);
    setAdHeadlinesError(null);
    setProductDescriptionsResult(null);
    setProductDescriptionsLoading(false);
    setProductDescriptionsError(null);
    setMetaAdsPlanResult(null);
    setMetaAdsPlanLoading(false);
    setMetaAdsPlanError(null);
    setMetaAdsFormData({ campaignGoal: 'Sales', monthlyBudget: 500 });
  }, [toolSlug, config]);

  if (!config) {
    return (
      <Card
        className={cn('p-6', className)}
        data-icod-id="src_components_aitoolgenerator_tsx_c7d8">
        <p
          className="text-muted-foreground"
          data-icod-id="src_components_aitoolgenerator_tsx_6b1a">Generation form not available for this tool.</p>
      </Card>
    );
  }

  const handleChange = (name: string, value: unknown) => {
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Auto-set currency when country changes in profit calculator
      if (toolSlug === 'profit-calculator' && name === 'profitCountry') {
        const countryCurrencyMap: Record<string, string> = {
          Pakistan: 'PKR',
          USA: 'USD',
          UK: 'GBP',
          UAE: 'AED',
          India: 'INR',
          Canada: 'CAD',
          Australia: 'AUD',
        };
        const countryStr = String(value);
        if (countryCurrencyMap[countryStr]) {
          next.profitCurrency = countryCurrencyMap[countryStr];
        } else {
          next.profitCurrency = 'USD';
        }
      }
      return next;
    });
    // Clear validation error when user updates a field
    if (error) {
      setError(null);
    }
  };

  const handleGenerate = async () => {
    // Validate required fields
    for (const field of config.fields) {
      if (field.required && !formData[field.name]) {
        setError(`Please fill in the ${field.label} field.`);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setOutput(null);

    try {
      // Transform data for API
      const apiData: Record<string, unknown> = { ...formData };
      
      // Convert comma-separated keywords to array only for tools that expect arrays
      if (apiData.keywords && typeof apiData.keywords === 'string') {
        if (toolSlug === 'seo-title-optimizer' || toolSlug === 'hashtag-generator') {
          apiData.keywords = apiData.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
        }
        // For listing-optimizer, product-research-assistant and others, keep as comma-separated string
      }

      // Convert multiselect fields from comma-separated strings to arrays
      if (toolSlug === 'branding-assistant' && apiData.brandPersonality) {
        if (typeof apiData.brandPersonality === 'string') {
          apiData.brandPersonality = (apiData.brandPersonality as string).split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      }

      if (toolSlug === 'competitor-analyzer' && apiData.focusAreas) {
        if (typeof apiData.focusAreas === 'string') {
          apiData.focusAreas = (apiData.focusAreas as string).split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      }

      // Convert numeric strings to numbers for all number fields
      for (const field of config.fields) {
        if (field.type === 'number' && apiData[field.name] !== undefined && apiData[field.name] !== '') {
          const val = parseFloat(String(apiData[field.name]));
          if (isNaN(val)) {
            setError(`Invalid value for ${field.label}. Please enter a valid number.`);
            setIsLoading(false);
            return;
          }
          apiData[field.name] = val;
        }
      }

      // Additional validation for price-calculator and profit-calculator
      if (toolSlug === 'profit-calculator') {
        const cost = apiData.productCost as number;
        const price = apiData.sellingPrice as number;
        if (cost < 0) {
          setError('Product cost cannot be negative.');
          setIsLoading(false);
          return;
        }
        if (!price || price <= 0) {
          setError('Selling price must be greater than zero.');
          setIsLoading(false);
          return;
        }
        const mpFee = (apiData.commissionPercent as number) || 0;
        const ppFee = (apiData.paymentProcessingPercent as number) || 0;
        if (mpFee < 0 || mpFee > 100) {
          setError('Commission / referral fee percentage must be between 0 and 100.');
          setIsLoading(false);
          return;
        }
        if (ppFee < 0 || ppFee > 100) {
          setError('Payment processing fee percentage must be between 0 and 100.');
          setIsLoading(false);
          return;
        }
      }

      const result = await aiToolApiService.generateContent(toolSlug, apiData);
      if (!result || result.trim().length === 0) {
        setError('Generation produced no output. Please try again with different inputs.');
      } else {
        setOutput(result);
      }
    } catch (err: unknown) {
      // Log raw error to browser console for debugging
      console.error('[AIToolGenerator] Generation failed:', err);

      // Extract user-friendly message from the error.
      // The apiClient interceptor and aiToolService both produce Error objects
      // with descriptive .message strings suitable for display.
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong generating this. Please try again in a moment.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

  const handleReset = () => {
    // Reset to default values from config
    const defaults: Record<string, unknown> = {};
    if (config) {
      for (const field of config.fields) {
        if (field.defaultValue !== undefined) {
          defaults[field.name] = field.defaultValue;
        }
      }
    }
    setFormData(defaults);
    setOutput(null);
    setError(null);
    setCampaignIdeasOutput(null);
    setIsCampaignIdeasLoading(false);
    setCampaignIdeasError(null);
    setSocialPostsOutput(null);
    setIsSocialPostsLoading(false);
    setSocialPostsError(null);
    setAdHeadlinesResult(null);
    setAdHeadlinesLoading(false);
    setAdHeadlinesError(null);
    setProductDescriptionsResult(null);
    setProductDescriptionsLoading(false);
    setProductDescriptionsError(null);
  };

  // Brand Campaign Studio — generate campaign ideas using existing Business DNA
  const handleGenerateCampaignIdeas = async () => {
    if (!output) return; // No DNA to work from
    setIsCampaignIdeasLoading(true);
    setCampaignIdeasError(null);
    setCampaignIdeasOutput(null);

    try {
      const result = await aiToolApiService.generateContent(toolSlug, {
        type: 'brand-content',
        contentType: 'campaign-ideas',
        brandDNA: output,
        brandName: formData.brandName as string | undefined,
        description: formData.description as string | undefined,
        targetAudience: formData.targetAudience as string | undefined,
      });
      if (!result || result.trim().length === 0) {
        setCampaignIdeasError('Generation produced no output. Please try again.');
      } else {
        setCampaignIdeasOutput(result);
      }
    } catch (err: unknown) {
      console.error('[AIToolGenerator] Campaign Ideas generation failed:', err);
      const msg = err instanceof Error ? err.message : 'Something went wrong generating this. Please try again in a moment.';
      setCampaignIdeasError(msg);
    } finally {
      setIsCampaignIdeasLoading(false);
    }
  };

  // Brand Campaign Studio — generate social media posts using existing Business DNA
  const handleGenerateSocialPosts = async () => {
    if (!output) return; // No DNA to work from
    setIsSocialPostsLoading(true);
    setSocialPostsError(null);
    setSocialPostsOutput(null);

    try {
      const result = await aiToolApiService.generateContent(toolSlug, {
        type: 'brand-content',
        contentType: 'social-posts',
        brandDNA: output,
        brandName: formData.brandName as string | undefined,
        description: formData.description as string | undefined,
        targetAudience: formData.targetAudience as string | undefined,
      });
      if (!result || result.trim().length === 0) {
        setSocialPostsError('Generation produced no output. Please try again.');
      } else {
        setSocialPostsOutput(result);
      }
    } catch (err: unknown) {
      console.error('[AIToolGenerator] Social Media Posts generation failed:', err);
      const msg = err instanceof Error ? err.message : 'Something went wrong generating this. Please try again in a moment.';
      setSocialPostsError(msg);
    } finally {
      setIsSocialPostsLoading(false);
    }
  };

  // Brand Campaign Studio — generate ad headlines using existing Business DNA
  const handleGenerateAdHeadlines = async () => {
    if (!output) return; // No DNA to work from
    setAdHeadlinesLoading(true);
    setAdHeadlinesError(null);
    setAdHeadlinesResult(null);

    try {
      const result = await aiToolApiService.generateContent(toolSlug, {
        type: 'brand-content',
        contentType: 'ad-headlines',
        brandDNA: output,
        brandName: formData.brandName as string | undefined,
        description: formData.description as string | undefined,
        targetAudience: formData.targetAudience as string | undefined,
      });
      if (!result || result.trim().length === 0) {
        setAdHeadlinesError('Generation produced no output. Please try again.');
      } else {
        setAdHeadlinesResult(result);
      }
    } catch (err: unknown) {
      console.error('[AIToolGenerator] Ad Headlines generation failed:', err);
      const msg = err instanceof Error ? err.message : 'Something went wrong generating this. Please try again in a moment.';
      setAdHeadlinesError(msg);
    } finally {
      setAdHeadlinesLoading(false);
    }
  };

  // Brand Campaign Studio — generate product descriptions using existing Business DNA
  const handleGenerateProductDescriptions = async () => {
    if (!output) return; // No DNA to work from
    setProductDescriptionsLoading(true);
    setProductDescriptionsError(null);
    setProductDescriptionsResult(null);

    try {
      const result = await aiToolApiService.generateContent(toolSlug, {
        type: 'brand-content',
        contentType: 'product-descriptions',
        brandDNA: output,
        brandName: formData.brandName as string | undefined,
        description: formData.description as string | undefined,
        targetAudience: formData.targetAudience as string | undefined,
      });
      if (!result || result.trim().length === 0) {
        setProductDescriptionsError('Generation produced no output. Please try again.');
      } else {
        setProductDescriptionsResult(result);
      }
    } catch (err: unknown) {
      console.error('[AIToolGenerator] Product Descriptions generation failed:', err);
      const msg = err instanceof Error ? err.message : 'Something went wrong generating this. Please try again in a moment.';
      setProductDescriptionsError(msg);
    } finally {
      setProductDescriptionsLoading(false);
    }
  };

  // Brand Campaign Studio — Meta Ads Campaign Planner (independent form, does not require DNA)
  const handleGenerateMetaAdsPlan = async () => {
    // Validate required fields
    if (!metaAdsFormData.brandName || String(metaAdsFormData.brandName).trim() === '') {
      setMetaAdsPlanError('Please enter a brand or product name.');
      return;
    }
    const budget = Number(metaAdsFormData.monthlyBudget);
    if (!budget || budget <= 0) {
      setMetaAdsPlanError('Please enter a valid monthly budget.');
      return;
    }

    setMetaAdsPlanLoading(true);
    setMetaAdsPlanError(null);
    setMetaAdsPlanResult(null);

    try {
      const result = await aiToolApiService.generateContent('meta-ads-campaign-plan', {
        brandName: String(metaAdsFormData.brandName).trim(),
        campaignGoal: metaAdsFormData.campaignGoal || 'Sales',
        monthlyBudget: budget,
        ageRange: metaAdsFormData.ageRange ? String(metaAdsFormData.ageRange).trim() : undefined,
        location: metaAdsFormData.location ? String(metaAdsFormData.location).trim() : undefined,
        interests: metaAdsFormData.interests ? String(metaAdsFormData.interests).trim() : undefined,
        productDetails: metaAdsFormData.productDetails ? String(metaAdsFormData.productDetails).trim() : undefined,
      });
      if (!result || result.trim().length === 0) {
        setMetaAdsPlanError('Generation produced no output. Please try again.');
      } else {
        setMetaAdsPlanResult(result);
      }
    } catch (err: unknown) {
      console.error('[AIToolGenerator] Meta Ads Campaign Plan generation failed:', err);
      const msg = err instanceof Error ? err.message : 'Something went wrong generating this. Please try again in a moment.';
      setMetaAdsPlanError(msg);
    } finally {
      setMetaAdsPlanLoading(false);
    }
  };

  return (
    <Card
      className={cn('overflow-hidden', className)}
      data-icod-id="src_components_aitoolgenerator_tsx_0b05">
      <div
        className="bg-primary/5 p-6 border-b border-border/50"
        data-icod-id="src_components_aitoolgenerator_tsx_360e">
        <div
          className="flex items-center gap-3 mb-2"
          data-icod-id="src_components_aitoolgenerator_tsx_0522">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
            data-icod-id="src_components_aitoolgenerator_tsx_1786">
            <Sparkles
              className="h-5 w-5"
              data-icod-id="src_components_aitoolgenerator_tsx_fd12" />
          </div>
          <h3
            className="text-lg font-semibold text-foreground"
            data-icod-id="src_components_aitoolgenerator_tsx_185c">Generate Content</h3>
          <Badge variant="free" data-icod-id="src_components_aitoolgenerator_tsx_free_badge">Free Forever</Badge>
        </div>
        <p
          className="text-sm text-muted-foreground"
          data-icod-id="src_components_aitoolgenerator_tsx_c8bb">Fill in the details below and let AI create content for you.</p>
      </div>
      <div
        className="p-6 space-y-6"
        data-icod-id="src_components_aitoolgenerator_tsx_c7b2">
        {/* Form Fields */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          data-icod-id="src_components_aitoolgenerator_tsx_90b9">
          {config.fields
            .map((field) => {
              // Dynamic label: append currency code for money fields in profit calculator
              let displayLabel = field.label;
              if (toolSlug === 'profit-calculator') {
                const moneyFields = ['productCost', 'sellingPrice', 'shippingCost', 'deliveryFee', 'advertisingCost', 'otherExpenses'];
                if (moneyFields.includes(field.name)) {
                  const cs = String(formData.profitCurrency || 'USD').trim() || 'USD';
                  displayLabel = `${field.label} (${cs})`;
                }
              }
              return { field, displayLabel };
            })
            .map(({ field, displayLabel }) => (
            <div
              key={field.name}
              className={field.type === 'textarea' ? 'md:col-span-2' : ''}
              data-icod-id={`src_components_aitoolgenerator_tsx_b9cd_${field.name}`}>
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-foreground mb-1.5"
                data-icod-id={`src_components_aitoolgenerator_tsx_af16_${field.name}`}>
                {displayLabel}
                {field.required && <span
                  className="text-destructive ml-1"
                  data-icod-id={`src_components_aitoolgenerator_tsx_6632_${field.name}`}>*</span>}
              </label>
              
              {field.type === 'select' ? (
                <>
                  <select
                    id={field.name}
                    value={(formData[field.name] as string) || field.defaultValue || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    data-icod-id={`src_components_aitoolgenerator_tsx_a09c_${field.name}`}>
                    <option
                      value=""
                      data-icod-id={`src_components_aitoolgenerator_tsx_1a7d_${field.name}`}>Select...</option>
                    {field.options?.map((opt) => (
                      <option
                        key={opt}
                        value={opt}
                        data-icod-id={`src_components_aitoolgenerator_tsx_d50c_${field.name}`}>{opt}</option>
                    ))}
                  </select>
                  {/* Daraz guidance hint for Selling on selector */}
                  {field.name === 'sellingMarketplace' && formData.sellingMarketplace === 'Daraz' && (
                    <p className="mt-1.5 text-xs text-muted-foreground flex items-start gap-1.5" data-icod-id="src_components_aitoolgenerator_tsx_daraz_hint">
                      <Info
                        className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary"
                        data-icod-id={`src_components_aitoolgenerator_tsx_1c62_${field.name}`} />
                      Daraz format: Brand + Product + Key Feature. No special characters or emojis. Max 200 characters.
                    </p>
                  )}
                </>
              ) : field.type === 'multiselect' ? (
                <div
                  className="flex flex-wrap gap-2"
                  data-icod-id={`src_components_aitoolgenerator_tsx_multiselect_${field.name}`}>
                  {field.options?.map((opt) => {
                    const selectedValues = Array.isArray(formData[field.name])
                      ? formData[field.name] as string[]
                      : Array.isArray(field.defaultValue)
                        ? field.defaultValue
                        : [];
                    const isSelected = selectedValues.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          const current = Array.isArray(formData[field.name])
                            ? formData[field.name] as string[]
                            : Array.isArray(field.defaultValue)
                              ? [...field.defaultValue]
                              : [];
                          const updated = isSelected
                            ? current.filter((v) => v !== opt)
                            : [...current, opt];
                          handleChange(field.name, updated);
                        }}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground',
                        )}
                        data-icod-id={`src_components_aitoolgenerator_tsx_multiselect_opt_${field.name}_${opt}`}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  rows={3}
                  placeholder={field.placeholder}
                  value={(formData[field.name] as string) || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  data-icod-id={`src_components_aitoolgenerator_tsx_2322_${field.name}`} />
              ) : (
                <Input
                  id={field.name}
                  type={field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : 'text'}
                  placeholder={field.placeholder}
                  value={(formData[field.name] as string) || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  data-icod-id={`src_components_aitoolgenerator_tsx_f240_${field.name}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="space-y-2" data-icod-id="src_components_aitoolgenerator_tsx_f2cc_wrapper">
            <Alert variant="error" data-icod-id="src_components_aitoolgenerator_tsx_f2cc">{error}</Alert>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setError(null); handleGenerate(); }}
              disabled={isLoading}
              data-icod-id="src_components_aitoolgenerator_tsx_retry">
              <RefreshCw
                className="mr-1 h-3 w-3"
                data-icod-id="src_components_aitoolgenerator_tsx_5c16" />
              Retry
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div
          className="flex gap-3"
          data-icod-id="src_components_aitoolgenerator_tsx_a2b2">
          <Button
            onClick={handleGenerate}
            loading={isLoading}
            disabled={isLoading}
            className="flex-1"
            data-icod-id="src_components_aitoolgenerator_tsx_14e3">
            <Sparkles
              className="mr-2 h-4 w-4"
              data-icod-id="src_components_aitoolgenerator_tsx_46ca" />
            {isLoading ? 'Generating...' : 'Generate'}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
            data-icod-id="src_components_aitoolgenerator_tsx_1c81">
            <RefreshCw
              className="mr-2 h-4 w-4"
              data-icod-id="src_components_aitoolgenerator_tsx_68e3" />
            Reset
          </Button>
        </div>

        {/* Output Area */}
        {output && (
          <div
            className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4"
            data-icod-id="src_components_aitoolgenerator_tsx_74df">
            <div
              className="flex flex-wrap items-center justify-between gap-2 mb-3"
              data-icod-id="src_components_aitoolgenerator_tsx_e259">
              <h4
                className="font-semibold text-foreground"
                data-icod-id="src_components_aitoolgenerator_tsx_45fa">{toolSlug === 'brand-campaign-studio' ? 'Business DNA Profile' : 'Generated Output'}</h4>
              <div className="flex items-center gap-2" data-icod-id="src_components_aitoolgenerator_tsx_output_actions">
                <a
                  href={WHATSAPP_DIRECT_CHAT}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-icod-id="src_components_aitoolgenerator_tsx_whatsapp_share_link">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-[#25D366] hover:text-[#20BD5A] hover:bg-[#25D366]/10"
                    data-icod-id="src_components_aitoolgenerator_tsx_whatsapp_share_btn">
                    <MessageCircle
                      className="h-4 w-4"
                      data-icod-id="src_components_aitoolgenerator_tsx_whatsapp_share_icon" />
                    Share on WhatsApp
                  </Button>
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  data-icod-id="src_components_aitoolgenerator_tsx_acea">
                  {copied ? (
                    <>
                      <Check
                        className="mr-1 h-4 w-4 text-success"
                        data-icod-id="src_components_aitoolgenerator_tsx_0bc9" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy
                        className="mr-1 h-4 w-4"
                        data-icod-id="src_components_aitoolgenerator_tsx_9d15" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div
              className="prose prose-sm max-w-none text-foreground"
              data-icod-id="src_components_aitoolgenerator_tsx_b818">
              {toolSlug === 'listing-health-score' ? (
                <ListingHealthResults markdown={output} data-icod-id="src_components_aitoolgenerator_tsx_d45c" />
              ) : toolSlug === 'keyword-research' ? (
                <KeywordResearchResults markdown={output} data-icod-id="src_components_aitoolgenerator_tsx_62f7" />
              ) : toolSlug === 'brand-campaign-studio' ? (
                <BusinessDNAResults markdown={output} data-icod-id="src_components_aitoolgenerator_tsx_dna_render" />
              ) : toolSlug === 'whatsapp-business-generator' ? (
                <WhatsAppMessagesResults markdown={output} data-icod-id="src_components_aitoolgenerator_tsx_0905" />
              ) : (
                <MarkdownRenderer content={output} data-icod-id="src_components_aitoolgenerator_tsx_5e34" />
              )}
            </div>
          </div>
        )}

        {/* Brand Campaign Studio — Campaign Ideas Generator */}
        {toolSlug === 'brand-campaign-studio' && output && !isLoading && (
          <div
            className="mt-6 rounded-xl border border-border bg-card p-5"
            data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_section">
            <div
              className="flex items-center gap-3 mb-4"
              data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_header">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground"
                data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_icon_bg">
                <Lightbulb
                  className="h-5 w-5"
                  data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_icon" />
              </div>
              <div data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_title_wrap">
                <h4
                  className="font-semibold text-foreground"
                  data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_heading">Campaign Ideas</h4>
                <p
                  className="text-xs text-muted-foreground"
                  data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_subheading">Generate 5 on-brand campaign concepts using your Business DNA</p>
              </div>
            </div>

            {!campaignIdeasOutput && !isCampaignIdeasLoading && !campaignIdeasError && (
              <Button
                onClick={handleGenerateCampaignIdeas}
                disabled={isCampaignIdeasLoading}
                className="w-full"
                data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_gen_btn">
                <Sparkles
                  className="mr-2 h-4 w-4"
                  data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_gen_icon" />
                Generate Campaign Ideas
              </Button>
            )}

            {campaignIdeasError && (
              <div className="space-y-2" data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_error_wrap">
                <Alert variant="error" data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_error">{campaignIdeasError}</Alert>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setCampaignIdeasError(null); handleGenerateCampaignIdeas(); }}
                  disabled={isCampaignIdeasLoading}
                  data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_retry">
                  <RefreshCw
                    className="mr-1 h-3 w-3"
                    data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_retry_icon" />
                  Retry
                </Button>
              </div>
            )}

            {isCampaignIdeasLoading && (
              <div
                className="flex flex-col items-center justify-center py-8 text-center"
                data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_loading">
                <Spinner size="lg" data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_spinner" />
                <p
                  className="mt-4 text-sm text-muted-foreground"
                  data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_loading_text">
                  Generating campaign ideas...
                </p>
              </div>
            )}

            {campaignIdeasOutput && !isCampaignIdeasLoading && (
              <div data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_results_wrap">
                <div
                  className="flex flex-wrap items-center justify-between gap-2 mb-3"
                  data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_results_header">
                  <span
                    className="text-sm font-medium text-muted-foreground"
                    data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_results_count">
                    {parseCampaignIdeas(campaignIdeasOutput).length} ideas generated
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateCampaignIdeas}
                    disabled={isCampaignIdeasLoading}
                    data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_regenerate">
                    <RefreshCw
                      className="mr-1 h-3 w-3"
                      data-icod-id="src_components_aitoolgenerator_tsx_campaign_ideas_regenerate_icon" />
                    Regenerate
                  </Button>
                </div>
                <CampaignIdeasResults
                  markdown={campaignIdeasOutput}
                  data-icod-id="src_components_aitoolgenerator_tsx_bb07" />
              </div>
            )}
          </div>
        )}

        {/* Brand Campaign Studio — Social Media Posts Generator */}
        {toolSlug === 'brand-campaign-studio' && output && !isLoading && (
          <div
            className="mt-6 rounded-xl border border-border bg-card p-5"
            data-icod-id="src_components_aitoolgenerator_tsx_social_posts_section">
            <div
              className="flex items-center gap-3 mb-4"
              data-icod-id="src_components_aitoolgenerator_tsx_social_posts_header">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground"
                data-icod-id="src_components_aitoolgenerator_tsx_social_posts_icon_bg">
                <Share2
                  className="h-5 w-5"
                  data-icod-id="src_components_aitoolgenerator_tsx_social_posts_icon" />
              </div>
              <div data-icod-id="src_components_aitoolgenerator_tsx_social_posts_title_wrap">
                <h4
                  className="font-semibold text-foreground"
                  data-icod-id="src_components_aitoolgenerator_tsx_social_posts_heading">Social Media Posts</h4>
                <p
                  className="text-xs text-muted-foreground"
                  data-icod-id="src_components_aitoolgenerator_tsx_social_posts_subheading">Generate 5 on-brand social media posts using your Business DNA</p>
              </div>
            </div>

            {!socialPostsOutput && !isSocialPostsLoading && !socialPostsError && (
              <Button
                onClick={handleGenerateSocialPosts}
                disabled={isSocialPostsLoading}
                className="w-full"
                data-icod-id="src_components_aitoolgenerator_tsx_social_posts_gen_btn">
                <Sparkles
                  className="mr-2 h-4 w-4"
                  data-icod-id="src_components_aitoolgenerator_tsx_social_posts_gen_icon" />
                Generate Social Media Posts
              </Button>
            )}

            {socialPostsError && (
              <div className="space-y-2" data-icod-id="src_components_aitoolgenerator_tsx_social_posts_error_wrap">
                <Alert variant="error" data-icod-id="src_components_aitoolgenerator_tsx_social_posts_error">{socialPostsError}</Alert>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSocialPostsError(null); handleGenerateSocialPosts(); }}
                  disabled={isSocialPostsLoading}
                  data-icod-id="src_components_aitoolgenerator_tsx_social_posts_retry">
                  <RefreshCw
                    className="mr-1 h-3 w-3"
                    data-icod-id="src_components_aitoolgenerator_tsx_social_posts_retry_icon" />
                  Retry
                </Button>
              </div>
            )}

            {isSocialPostsLoading && (
              <div
                className="flex flex-col items-center justify-center py-8 text-center"
                data-icod-id="src_components_aitoolgenerator_tsx_social_posts_loading">
                <Spinner size="lg" data-icod-id="src_components_aitoolgenerator_tsx_social_posts_spinner" />
                <p
                  className="mt-4 text-sm text-muted-foreground"
                  data-icod-id="src_components_aitoolgenerator_tsx_social_posts_loading_text">
                  Generating social media posts...
                </p>
              </div>
            )}

            {socialPostsOutput && !isSocialPostsLoading && (
              <div data-icod-id="src_components_aitoolgenerator_tsx_social_posts_results_wrap">
                <div
                  className="flex flex-wrap items-center justify-between gap-2 mb-3"
                  data-icod-id="src_components_aitoolgenerator_tsx_social_posts_results_header">
                  <span
                    className="text-sm font-medium text-muted-foreground"
                    data-icod-id="src_components_aitoolgenerator_tsx_social_posts_results_count">
                    {parseSocialMediaPosts(socialPostsOutput).length} posts generated
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateSocialPosts}
                    disabled={isSocialPostsLoading}
                    data-icod-id="src_components_aitoolgenerator_tsx_social_posts_regenerate">
                    <RefreshCw
                      className="mr-1 h-3 w-3"
                      data-icod-id="src_components_aitoolgenerator_tsx_social_posts_regenerate_icon" />
                    Regenerate
                  </Button>
                </div>
                <SocialMediaPostsResults
                  markdown={socialPostsOutput}
                  data-icod-id="src_components_aitoolgenerator_tsx_social_posts_results" />
              </div>
            )}
          </div>
        )}

        {/* Brand Campaign Studio — Ad Headlines Generator */}
        {toolSlug === 'brand-campaign-studio' && output && !isLoading && (
          <div
            className="mt-6 rounded-xl border border-border bg-card p-5"
            data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_section">
            <div
              className="flex items-center gap-3 mb-4"
              data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_header">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_icon_bg">
                <Zap
                  className="h-5 w-5"
                  data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_icon" />
              </div>
              <div data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_title_wrap">
                <h4
                  className="font-semibold text-foreground"
                  data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_heading">Ad Headlines</h4>
                <p
                  className="text-xs text-muted-foreground"
                  data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_subheading">Generate 5 on-brand ad headlines using your Business DNA</p>
              </div>
            </div>

            {!adHeadlinesResult && !adHeadlinesLoading && !adHeadlinesError && (
              <Button
                onClick={handleGenerateAdHeadlines}
                disabled={adHeadlinesLoading}
                className="w-full"
                data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_gen_btn">
                <Sparkles
                  className="mr-2 h-4 w-4"
                  data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_gen_icon" />
                Generate 5 Ad Headlines
              </Button>
            )}

            {adHeadlinesError && (
              <div className="space-y-2" data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_error_wrap">
                <Alert variant="error" data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_error">{adHeadlinesError}</Alert>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setAdHeadlinesError(null); handleGenerateAdHeadlines(); }}
                  disabled={adHeadlinesLoading}
                  data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_retry">
                  <RefreshCw
                    className="mr-1 h-3 w-3"
                    data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_retry_icon" />
                  Retry
                </Button>
              </div>
            )}

            {adHeadlinesLoading && (
              <div
                className="flex flex-col items-center justify-center py-8 text-center"
                data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_loading">
                <Spinner size="lg" data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_spinner" />
                <p
                  className="mt-4 text-sm text-muted-foreground"
                  data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_loading_text">
                  Generating ad headlines...
                </p>
              </div>
            )}

            {adHeadlinesResult && !adHeadlinesLoading && (
              <div data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_results_wrap">
                <div
                  className="flex flex-wrap items-center justify-between gap-2 mb-3"
                  data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_results_header">
                  <span
                    className="text-sm font-medium text-muted-foreground"
                    data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_results_count">
                    {parseAdHeadlines(adHeadlinesResult).length} headlines generated
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateAdHeadlines}
                    disabled={adHeadlinesLoading}
                    data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_regenerate">
                    <RefreshCw
                      className="mr-1 h-3 w-3"
                      data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_regenerate_icon" />
                    Regenerate
                  </Button>
                </div>
                <AdHeadlinesResults
                  markdown={adHeadlinesResult}
                  data-icod-id="src_components_aitoolgenerator_tsx_ad_headlines_results" />
              </div>
            )}
          </div>
        )}

        {/* Brand Campaign Studio — Product Descriptions Generator */}
        {toolSlug === 'brand-campaign-studio' && output && !isLoading && (
          <div
            className="mt-6 rounded-xl border border-border bg-card p-5"
            data-icod-id="src_components_aitoolgenerator_tsx_product_desc_section">
            <div
              className="flex items-center gap-3 mb-4"
              data-icod-id="src_components_aitoolgenerator_tsx_product_desc_header">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground"
                data-icod-id="src_components_aitoolgenerator_tsx_product_desc_icon_bg">
                <MessageCircle
                  className="h-5 w-5"
                  data-icod-id="src_components_aitoolgenerator_tsx_product_desc_icon" />
              </div>
              <div data-icod-id="src_components_aitoolgenerator_tsx_product_desc_title_wrap">
                <h4
                  className="font-semibold text-foreground"
                  data-icod-id="src_components_aitoolgenerator_tsx_product_desc_heading">Product Descriptions</h4>
                <p
                  className="text-xs text-muted-foreground"
                  data-icod-id="src_components_aitoolgenerator_tsx_product_desc_subheading">Generate 3 on-brand product descriptions using your Business DNA</p>
              </div>
            </div>

            {!productDescriptionsResult && !productDescriptionsLoading && !productDescriptionsError && (
              <Button
                onClick={handleGenerateProductDescriptions}
                disabled={productDescriptionsLoading}
                className="w-full"
                data-icod-id="src_components_aitoolgenerator_tsx_product_desc_gen_btn">
                <Sparkles
                  className="mr-2 h-4 w-4"
                  data-icod-id="src_components_aitoolgenerator_tsx_product_desc_gen_icon" />
                Generate 3 Product Descriptions
              </Button>
            )}

            {productDescriptionsError && (
              <div className="space-y-2" data-icod-id="src_components_aitoolgenerator_tsx_product_desc_error_wrap">
                <Alert variant="error" data-icod-id="src_components_aitoolgenerator_tsx_product_desc_error">{productDescriptionsError}</Alert>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setProductDescriptionsError(null); handleGenerateProductDescriptions(); }}
                  disabled={productDescriptionsLoading}
                  data-icod-id="src_components_aitoolgenerator_tsx_product_desc_retry">
                  <RefreshCw
                    className="mr-1 h-3 w-3"
                    data-icod-id="src_components_aitoolgenerator_tsx_product_desc_retry_icon" />
                  Retry
                </Button>
              </div>
            )}

            {productDescriptionsLoading && (
              <div
                className="flex flex-col items-center justify-center py-8 text-center"
                data-icod-id="src_components_aitoolgenerator_tsx_product_desc_loading">
                <Spinner size="lg" data-icod-id="src_components_aitoolgenerator_tsx_product_desc_spinner" />
                <p
                  className="mt-4 text-sm text-muted-foreground"
                  data-icod-id="src_components_aitoolgenerator_tsx_product_desc_loading_text">
                  Generating product descriptions...
                </p>
              </div>
            )}

            {productDescriptionsResult && !productDescriptionsLoading && (
              <div data-icod-id="src_components_aitoolgenerator_tsx_product_desc_results_wrap">
                <div
                  className="flex flex-wrap items-center justify-between gap-2 mb-3"
                  data-icod-id="src_components_aitoolgenerator_tsx_product_desc_results_header">
                  <span
                    className="text-sm font-medium text-muted-foreground"
                    data-icod-id="src_components_aitoolgenerator_tsx_product_desc_results_count">
                    {parseProductDescriptions(productDescriptionsResult).length} descriptions generated
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateProductDescriptions}
                    disabled={productDescriptionsLoading}
                    data-icod-id="src_components_aitoolgenerator_tsx_product_desc_regenerate">
                    <RefreshCw
                      className="mr-1 h-3 w-3"
                      data-icod-id="src_components_aitoolgenerator_tsx_product_desc_regenerate_icon" />
                    Regenerate
                  </Button>
                </div>
                <ProductDescriptionsResults
                  markdown={productDescriptionsResult}
                  data-icod-id="src_components_aitoolgenerator_tsx_product_desc_results" />
              </div>
            )}
          </div>
        )}

        {/* Brand Campaign Studio — Meta Ads Campaign Planner (standalone, no DNA required) */}
        {toolSlug === 'brand-campaign-studio' && !isLoading && (
          <div
            className="mt-6 rounded-xl border border-border bg-card overflow-hidden"
            data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_section">
            {/* Section Header */}
            <div
              className="bg-primary/5 p-5 border-b border-border/50"
              data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_header">
              <div
                className="flex items-center gap-3 mb-2"
                data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_header_inner">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                  data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_icon_bg">
                  <Target
                    className="h-5 w-5"
                    data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_icon" />
                </div>
                <div data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_title_wrap">
                  <h4
                    className="font-semibold text-foreground"
                    data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_heading">Meta Ads Campaign Planner</h4>
                  <p
                    className="text-xs text-muted-foreground"
                    data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_subheading">Plan your campaign here, then launch it in Meta Ads Manager</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_form_grid">
                {/* Brand/Product Name */}
                <div data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_field_brand">
                  <label htmlFor="meta-brandName" className="block text-sm font-medium text-foreground mb-1.5" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_label_brand">
                    Brand / Product Name <span
                    className="text-destructive"
                    data-icod-id="src_components_aitoolgenerator_tsx_b621">*</span>
                  </label>
                  <Input
                    id="meta-brandName"
                    type="text"
                    placeholder="e.g., EcoClean Home Products"
                    value={(metaAdsFormData.brandName as string) || ''}
                    onChange={(e) => setMetaAdsFormData((prev) => ({ ...prev, brandName: e.target.value }))}
                    data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_input_brand" />
                </div>

                {/* Campaign Goal */}
                <div data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_field_goal">
                  <label htmlFor="meta-campaignGoal" className="block text-sm font-medium text-foreground mb-1.5" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_label_goal">
                    Campaign Goal <span
                    className="text-destructive"
                    data-icod-id="src_components_aitoolgenerator_tsx_bdf3">*</span>
                  </label>
                  <select
                    id="meta-campaignGoal"
                    value={(metaAdsFormData.campaignGoal as string) || 'Sales'}
                    onChange={(e) => setMetaAdsFormData((prev) => ({ ...prev, campaignGoal: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_select_goal">
                    <option value="Sales" data-icod-id="src_components_aitoolgenerator_tsx_78c0">Sales</option>
                    <option value="Leads" data-icod-id="src_components_aitoolgenerator_tsx_e8d7">Leads</option>
                    <option value="Traffic" data-icod-id="src_components_aitoolgenerator_tsx_a56d">Traffic</option>
                    <option value="Awareness" data-icod-id="src_components_aitoolgenerator_tsx_e618">Awareness</option>
                  </select>
                </div>

                {/* Monthly Budget */}
                <div data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_field_budget">
                  <label htmlFor="meta-monthlyBudget" className="block text-sm font-medium text-foreground mb-1.5" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_label_budget">
                    Monthly Budget ($) <span
                    className="text-destructive"
                    data-icod-id="src_components_aitoolgenerator_tsx_e8d8">*</span>
                  </label>
                  <Input
                    id="meta-monthlyBudget"
                    type="number"
                    placeholder="500"
                    value={(metaAdsFormData.monthlyBudget as number) || ''}
                    onChange={(e) => setMetaAdsFormData((prev) => ({ ...prev, monthlyBudget: parseFloat(e.target.value) || 0 }))}
                    data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_input_budget" />
                </div>

                {/* Age Range */}
                <div data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_field_age">
                  <label htmlFor="meta-ageRange" className="block text-sm font-medium text-foreground mb-1.5" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_label_age">
                    Age Range
                  </label>
                  <Input
                    id="meta-ageRange"
                    type="text"
                    placeholder="e.g., 25-45"
                    value={(metaAdsFormData.ageRange as string) || ''}
                    onChange={(e) => setMetaAdsFormData((prev) => ({ ...prev, ageRange: e.target.value }))}
                    data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_input_age" />
                </div>

                {/* Location */}
                <div data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_field_location">
                  <label htmlFor="meta-location" className="block text-sm font-medium text-foreground mb-1.5" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_label_location">
                    Location
                  </label>
                  <Input
                    id="meta-location"
                    type="text"
                    placeholder="e.g., USA, UK, Canada"
                    value={(metaAdsFormData.location as string) || ''}
                    onChange={(e) => setMetaAdsFormData((prev) => ({ ...prev, location: e.target.value }))}
                    data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_input_location" />
                </div>

                {/* Interests */}
                <div data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_field_interests">
                  <label htmlFor="meta-interests" className="block text-sm font-medium text-foreground mb-1.5" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_label_interests">
                    Interests
                  </label>
                  <Input
                    id="meta-interests"
                    type="text"
                    placeholder="e.g., eco-friendly home goods, sustainable living"
                    value={(metaAdsFormData.interests as string) || ''}
                    onChange={(e) => setMetaAdsFormData((prev) => ({ ...prev, interests: e.target.value }))}
                    data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_input_interests" />
                </div>
              </div>

              {/* Product/Service Details */}
              <div data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_field_details">
                <label htmlFor="meta-productDetails" className="block text-sm font-medium text-foreground mb-1.5" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_label_details">
                  Product / Service Details
                </label>
                <textarea
                  id="meta-productDetails"
                  rows={3}
                  placeholder="Describe your product/service, unique selling points, and what makes it stand out..."
                  value={(metaAdsFormData.productDetails as string) || ''}
                  onChange={(e) => setMetaAdsFormData((prev) => ({ ...prev, productDetails: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_textarea_details" />
              </div>

              {/* Error Message */}
              {metaAdsPlanError && (
                <div className="space-y-2" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_error_wrap">
                  <Alert variant="error" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_error">{metaAdsPlanError}</Alert>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setMetaAdsPlanError(null); handleGenerateMetaAdsPlan(); }}
                    disabled={metaAdsPlanLoading}
                    data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_retry">
                    <RefreshCw className="mr-1 h-3 w-3" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_retry_icon" />
                    Retry
                  </Button>
                </div>
              )}

              {/* Generate Button */}
              {!metaAdsPlanResult && !metaAdsPlanLoading && !metaAdsPlanError && (
                <Button
                  onClick={handleGenerateMetaAdsPlan}
                  disabled={metaAdsPlanLoading}
                  className="w-full"
                  data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_gen_btn">
                  <Sparkles className="mr-2 h-4 w-4" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_gen_icon" />
                  Generate Campaign Plan
                </Button>
              )}

              {/* Loading State */}
              {metaAdsPlanLoading && (
                <div
                  className="flex flex-col items-center justify-center py-8 text-center"
                  data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_loading">
                  <Spinner size="lg" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_spinner" />
                  <p
                    className="mt-4 text-sm text-muted-foreground"
                    data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_loading_text">
                    Generating your Meta Ads campaign plan...
                  </p>
                </div>
              )}

              {/* Results */}
              {metaAdsPlanResult && !metaAdsPlanLoading && (
                <div data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_results_wrap">
                  {/* Banner notice */}
                  <div
                    className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-3 flex items-start gap-3"
                    data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_banner">
                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_banner_icon" />
                    <p className="text-sm font-medium text-foreground" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_banner_text">
                      Plan your campaign here, then launch it in Meta Ads Manager
                    </p>
                  </div>

                  {/* AI-suggested label + Regenerate */}
                  <div
                    className="flex flex-wrap items-center justify-between gap-2 mb-3"
                    data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_results_header">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                      data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_ai_label">
                      <Sparkles className="h-3 w-3" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_ai_icon" />
                      AI-Suggested Campaign Plan
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerateMetaAdsPlan}
                      disabled={metaAdsPlanLoading}
                      data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_regenerate">
                      <RefreshCw className="mr-1 h-3 w-3" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_regenerate_icon" />
                      Regenerate
                    </Button>
                  </div>

                  {/* Structured results */}
                  <MetaAdsCampaignPlanResults
                    markdown={metaAdsPlanResult}
                    monthlyBudget={Number(metaAdsFormData.monthlyBudget) || undefined}
                    metaAdsFormData={metaAdsFormData}
                    data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_results" />

                  {/* Honesty disclaimer */}
                  <div
                    className="mt-4 rounded-lg border border-border/40 bg-muted/20 p-3"
                    data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_disclaimer">
                    <p className="text-[11px] text-muted-foreground leading-relaxed" data-icod-id="src_components_aitoolgenerator_tsx_meta_ads_disclaimer_text">
                      This is an AI-generated campaign plan based on Meta advertising best practices. It does not connect to Meta Ads Manager or any external API. Review and implement this plan manually in Meta Ads Manager.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div
            className="flex flex-col items-center justify-center py-8 text-center"
            data-icod-id="src_components_aitoolgenerator_tsx_0801">
            <Spinner size="lg" data-icod-id="src_components_aitoolgenerator_tsx_c587" />
            <p
              className="mt-4 text-sm text-muted-foreground"
              data-icod-id="src_components_aitoolgenerator_tsx_940f">
              {toolSlug === 'profit-calculator' ? 'Calculating...' : toolSlug === 'bulk-listing-generator' ? 'Generating listings (this may take a minute)...' : 'AI is generating your content...'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
