import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, CopyButton } from '@/components/ui';
import { cn } from '@/utils/cn';
import SEOHead from '@/components/SEOHead';
import AdSenseSlot from '@/components/AdSenseSlot';
import { contentTemplates, type ContentTemplate } from '@/data/contentHooks';
import { SchemaInjector, PAGE_META } from '@/seo';

const contentTemplatesMeta = PAGE_META['/content-templates'];
import { recordingScripts, type RecordingScript } from '@/data/screenRecordingScripts';
import { weeklyContentPlan, contentPillars, platformStrategies } from '@/data/contentCalendar';
import { week2Reels, type Week2Reel } from '@/data/week2Reels';
import { generatePlatformCaptions } from '@/data/crossPlatformCaptions';
import { buildSeriesEpisodes, type BuildEpisode } from '@/data/buildSeries';
import {
  Copy,
  Check,
  Video,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  Hash,
  FileText,
  Share2,
  Download,
  Play,
  TrendingUp,
  Lightbulb,
  Clapperboard,
  ChevronDown,
  ChevronUp,
  Filter,
  MessageCircle,
  Globe,
  ExternalLink
} from 'lucide-react';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://mgblessed.icod.ai';

type TabView = 'hooks' | 'scripts' | 'calendar' | 'strategy' | 'week2reels' | 'whatsapp' | 'crossplatform' | 'buildseries';

function HookCard({ template }: { template: ContentTemplate }) {
  const [expandedHook, setExpandedHook] = useState<number | null>(null);

  return (
    <Card className="p-6 mb-6" data-icod-id={`content_templates_hook_card_${template.toolSlug}`}>
      <div className="flex items-start justify-between mb-4" data-icod-id="content_templates_hook_header">
        <div data-icod-id="content_templates_hook_title_wrap">
          <div className="flex items-center gap-2 mb-2" data-icod-id="content_templates_hook_badges">
            <Badge variant="ai" data-icod-id="content_templates_tool_badge">{template.tool}</Badge>
            <Link
              to={`/tools/${template.toolSlug}`}
              className="text-xs text-primary hover:underline flex items-center gap-1"
              data-icod-id={`content_templates_tool_link_${template.toolSlug}`}>
              Try Tool <ArrowRight className="h-3 w-3" data-icod-id="content_templates_arrow_icon" />
            </Link>
          </div>
        </div>
      </div>
      <div className="space-y-3" data-icod-id="content_templates_hooks_list">
        {template.hooks.map((hook, index) => (
          <div
            key={index}
            className={cn(
              'group relative p-4 rounded-lg border transition-all cursor-pointer',
              expandedHook === index
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/30 hover:bg-muted/50'
            )}
            onClick={() => setExpandedHook(expandedHook === index ? null : index)}
            data-icod-id={`content_templates_hook_item_${index}`}>
            <div className="flex items-start justify-between gap-3" data-icod-id="content_templates_hook_content">
              <p className="text-foreground font-medium flex-1" data-icod-id={`content_templates_hook_text_${index}`}>
                {hook}
              </p>
              <CopyButton
                text={hook}
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                data-icod-id={`src_pages_contenttemplates_tsx_479b_${index}`} />
            </div>
            {expandedHook === index && (
              <div className="mt-4 pt-4 border-t border-border/50 animate-fade-in" data-icod-id="content_templates_hook_expanded">
                <div className="grid md:grid-cols-2 gap-4" data-icod-id="content_templates_before_after">
                  <div data-icod-id="content_templates_before_section">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2" data-icod-id="content_templates_before_label">Before</p>
                    <p className="text-sm text-muted-foreground italic p-3 rounded bg-muted/50" data-icod-id="content_templates_before_text">
                      {template.beforeExample}
                    </p>
                  </div>
                  <div data-icod-id="content_templates_after_section">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2" data-icod-id="content_templates_after_label">After (with AI)</p>
                    <p className="text-sm text-foreground p-3 rounded bg-primary/5 border border-primary/20" data-icod-id="content_templates_after_text">
                      {template.afterExample}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2" data-icod-id="content_templates_cta_section">
                  <Sparkles className="h-4 w-4 text-primary" data-icod-id="content_templates_sparkle_icon" />
                  <p className="text-sm font-medium text-primary" data-icod-id="content_templates_cta_text">{template.cta}</p>
                  <CopyButton
                    text={template.cta}
                    className="ml-auto"
                    data-icod-id={`src_pages_contenttemplates_tsx_5760_${index}`} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {template.trendingAudio && template.trendingAudio.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50" data-icod-id="content_templates_audio_section">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2" data-icod-id="content_templates_audio_label">
            <TrendingUp className="h-3.5 w-3.5" data-icod-id="content_templates_trending_icon" />
            Suggested Audio
          </p>
          <div className="flex flex-wrap gap-2" data-icod-id="content_templates_audio_tags">
            {template.trendingAudio.map((audio, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground" data-icod-id={`content_templates_audio_tag_${i}`}>
                {audio}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function ScriptCard({ script }: { script: RecordingScript }) {
  return (
    <Card className="p-6 mb-6" data-icod-id={`content_templates_script_card_${script.toolSlug}`}>
      <div className="flex items-start justify-between mb-4" data-icod-id="content_templates_script_header">
        <div data-icod-id="content_templates_script_info">
          <div className="flex items-center gap-2 mb-2" data-icod-id="content_templates_script_badges">
            <Badge variant="ai" data-icod-id="content_templates_script_tool_badge">{script.tool}</Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground" data-icod-id="content_templates_script_duration">
              <Clock className="h-3.5 w-3.5" data-icod-id="content_templates_clock_icon" />
              {script.duration}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground" data-icod-id="content_templates_script_platform">
              {script.platform}
            </span>
          </div>
          <Link
            to={`/tools/${script.toolSlug}`}
            className="text-sm text-primary hover:underline flex items-center gap-1"
            data-icod-id={`content_templates_script_link_${script.toolSlug}`}>
            <Play className="h-3.5 w-3.5" data-icod-id="content_templates_play_icon" />
            Demo this tool
          </Link>
        </div>
      </div>

      <div className="space-y-4" data-icod-id="content_templates_script_steps">
        {script.steps.map((step, index) => (
          <div key={index} className="flex gap-4" data-icod-id={`content_templates_step_${index}`}>
            <div className="shrink-0 w-16 text-xs font-mono text-muted-foreground pt-1" data-icod-id={`content_templates_timestamp_${index}`}>
              {step.timestamp}
            </div>
            <div className="flex-1 space-y-1" data-icod-id={`content_templates_step_content_${index}`}>
              <p className="font-medium text-foreground" data-icod-id={`content_templates_action_${index}`}>{step.action}</p>
              <p className="text-sm text-muted-foreground italic" data-icod-id={`content_templates_narration_${index}`}>"{step.narration}"</p>
              {step.visualNotes && (
                <p className="text-xs text-primary/80 flex items-center gap-1" data-icod-id={`content_templates_visual_${index}`}>
                  <Lightbulb className="h-3 w-3" data-icod-id="content_templates_lightbulb_icon" />
                  {step.visualNotes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {script.tips.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border/50" data-icod-id="content_templates_tips_section">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3" data-icod-id="content_templates_tips_label">Pro Tips</p>
          <ul className="space-y-2" data-icod-id="content_templates_tips_list">
            {script.tips.map((tip, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2" data-icod-id={`content_templates_tip_${i}`}>
                <Check className="h-4 w-4 text-success shrink-0 mt-0.5" data-icod-id="content_templates_tip_check" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

function CalendarView() {
  const days = Object.entries(weeklyContentPlan);

  return (
    <div className="space-y-6" data-icod-id="content_templates_calendar_view">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" data-icod-id="content_templates_calendar_grid">
        {days.map(([day, plan]) => (
          <Card key={day} className="p-5" data-icod-id={`content_templates_day_${day}`}>
            <div className="flex items-center justify-between mb-3" data-icod-id={`content_templates_day_header_${day}`}>
              <h3 className="font-bold text-foreground" data-icod-id={`content_templates_day_name_${day}`}>{day}</h3>
              <Badge variant="default" className="text-[10px]" data-icod-id={`content_templates_day_format_${day}`}>{plan.format}</Badge>
            </div>
            <p className="text-sm font-medium text-primary mb-2" data-icod-id={`content_templates_day_theme_${day}`}>{plan.theme}</p>
            <p className="text-xs text-muted-foreground mb-3 italic" data-icod-id={`content_templates_day_hook_${day}`}>"{plan.hook}"</p>
            
            <div className="space-y-2" data-icod-id={`content_templates_day_details_${day}`}>
              <div className="flex items-center gap-2 text-xs" data-icod-id={`content_templates_day_tool_${day}`}>
                <Sparkles className="h-3.5 w-3.5 text-primary" data-icod-id="content_templates_day_sparkle" />
                <span className="text-muted-foreground" data-icod-id="content_templates_day_tool_label">Tool:</span>
                <span className="text-foreground" data-icod-id="content_templates_day_tool_name">{plan.tool}</span>
              </div>
              <div className="flex items-center gap-2 text-xs" data-icod-id={`content_templates_day_time_${day}`}>
                <Clock className="h-3.5 w-3.5 text-warning" data-icod-id="content_templates_day_clock" />
                <span className="text-muted-foreground" data-icod-id="content_templates_day_best_time">{plan.bestTimeToPost}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border/50" data-icod-id={`content_templates_day_platforms_${day}`}>
              <div className="flex flex-wrap gap-1" data-icod-id={`content_templates_platform_tags_${day}`}>
                {plan.platforms.slice(0, 3).map((platform) => (
                  <span key={platform} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground" data-icod-id={`content_templates_platform_${platform}`}>
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 mt-8" data-icod-id="content_templates_pillars_card">
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2" data-icod-id="content_templates_pillars_title">
          <Hash className="h-5 w-5 text-primary" data-icod-id="content_templates_hash_icon" />
          Content Pillars
        </h3>
        <div className="grid md:grid-cols-2 gap-4" data-icod-id="content_templates_pillars_grid">
          {contentPillars.map((pillar) => (
            <div key={pillar.name} className="p-4 rounded-lg bg-muted/30 border border-border/50" data-icod-id={`content_templates_pillar_${pillar.name}`}>
              <div className="flex items-center justify-between mb-2" data-icod-id={`content_templates_pillar_header_${pillar.name}`}>
                <h4 className="font-semibold text-foreground" data-icod-id={`content_templates_pillar_name_${pillar.name}`}>{pillar.name}</h4>
                <span className="text-xs font-bold text-primary" data-icod-id={`content_templates_pillar_pct_${pillar.name}`}>{pillar.percentage}%</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3" data-icod-id={`content_templates_pillar_desc_${pillar.name}`}>{pillar.description}</p>
              <ul className="space-y-1" data-icod-id={`content_templates_pillar_examples_${pillar.name}`}>
                {pillar.examples.slice(0, 2).map((example, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5" data-icod-id={`content_templates_example_${i}`}>
                    <span className="text-primary mt-0.5" data-icod-id="content_templates_bullet">•</span>
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StrategyView() {
  return (
    <div className="space-y-6" data-icod-id="content_templates_strategy_view">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-icod-id="content_templates_strategy_grid">
        {platformStrategies.map((strategy) => (
          <Card key={strategy.platform} className="p-6" data-icod-id={`content_templates_strategy_${strategy.platform}`}>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2" data-icod-id={`content_templates_strategy_name_${strategy.platform}`}>
              <Share2 className="h-5 w-5 text-primary" data-icod-id="content_templates_share_icon" />
              {strategy.platform}
            </h3>
            
            <div className="space-y-4" data-icod-id={`content_templates_strategy_details_${strategy.platform}`}>
              <div data-icod-id={`content_templates_length_${strategy.platform}`}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1" data-icod-id="content_templates_length_label">Optimal Length</p>
                <p className="text-sm text-foreground" data-icod-id="content_templates_length_value">{strategy.optimalLength}</p>
              </div>
              
              <div data-icod-id={`content_templates_frequency_${strategy.platform}`}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1" data-icod-id="content_templates_frequency_label">Posting Frequency</p>
                <p className="text-sm text-foreground" data-icod-id="content_templates_frequency_value">{strategy.postingFrequency}</p>
              </div>
              
              <div data-icod-id={`content_templates_formats_${strategy.platform}`}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1" data-icod-id="content_templates_formats_label">Best Formats</p>
                <div className="flex flex-wrap gap-1.5" data-icod-id="content_templates_formats_list">
                  {strategy.bestFormats.map((format) => (
                    <span key={format} className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground" data-icod-id={`content_templates_format_${format}`}>
                      {format}
                    </span>
                  ))}
                </div>
              </div>
              
              <div data-icod-id={`content_templates_hashtag_strategy_${strategy.platform}`}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1" data-icod-id="content_templates_hashtag_label">Hashtag Strategy</p>
                <p className="text-sm text-muted-foreground" data-icod-id="content_templates_hashtag_value">{strategy.hashtagStrategy}</p>
              </div>
              
              <div data-icod-id={`content_templates_metrics_${strategy.platform}`}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1" data-icod-id="content_templates_metrics_label">Key Metrics</p>
                <div className="flex flex-wrap gap-1.5" data-icod-id="content_templates_metrics_list">
                  {strategy.keyMetrics.map((metric) => (
                    <span key={metric} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary" data-icod-id={`content_templates_metric_${metric}`}>
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Week2ReelCard({ reel }: { reel: Week2Reel }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="relative overflow-hidden" data-icod-id={`week2_reel_card_${reel.day}`}>
      {/* Timeline connector line */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-border/50 -z-10 hidden md:block" data-icod-id={`week2_timeline_line_${reel.day}`} />
      <div className="p-6" data-icod-id={`week2_reel_content_${reel.day}`}>
        {/* Day badge + title row */}
        <div className="flex items-start justify-between gap-4 mb-4" data-icod-id={`week2_reel_header_${reel.day}`}>
          <div className="flex items-center gap-3" data-icod-id={`week2_reel_title_row_${reel.day}`}>
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25"
              data-icod-id={`week2_day_badge_${reel.day}`}>
              {reel.day}
            </div>
            <div data-icod-id={`week2_reel_titles_${reel.day}`}>
              <h3 className="font-bold text-foreground text-lg leading-tight" data-icod-id={`week2_reel_title_${reel.day}`}>
                {reel.title}
              </h3>
              <Link
                to={`/tools/${reel.toolSlug}`}
                className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                data-icod-id={`week2_tool_link_${reel.toolSlug}`}>
                <Sparkles className="h-3 w-3" data-icod-id={`week2_sparkle_${reel.day}`} />
                {reel.toolName}
              </Link>
            </div>
          </div>
          <Badge variant="ai" data-icod-id={`week2_badge_${reel.day}`}>Day {reel.day}</Badge>
        </div>

        {/* Hook quote */}
        <div
          className="mb-4 p-4 rounded-lg border-l-4 border-primary bg-primary/5 italic"
          data-icod-id={`week2_hook_quote_${reel.day}`}>
          <p className="text-foreground font-medium" data-icod-id={`week2_hook_text_${reel.day}`}>
            "{reel.hook}"
          </p>
        </div>

        {/* Problem setup */}
        <p className="text-sm text-muted-foreground mb-4" data-icod-id={`week2_problem_${reel.day}`}>
          {reel.problemSetup}
        </p>

        {/* Collapsible demo script */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors mb-3"
          data-icod-id={`week2_toggle_script_${reel.day}`}>
          {expanded ? <ChevronUp className="h-4 w-4" data-icod-id="src_pages_contenttemplates_tsx_5028" /> : <ChevronDown className="h-4 w-4" data-icod-id="src_pages_contenttemplates_tsx_bc6d" />}
          {expanded ? 'Hide Demo Script' : 'Show Demo Script'}
        </button>

        {expanded && (
          <div className="mb-4 space-y-3 animate-fade-in" data-icod-id={`week2_script_steps_${reel.day}`}>
            {reel.demoScript.map((step, index) => (
              <div key={index} className="flex gap-3 pl-2 border-l-2 border-border/50" data-icod-id={`week2_step_${reel.day}_${index}`}>
                <div className="shrink-0 w-14 text-xs font-mono text-muted-foreground pt-0.5" data-icod-id={`week2_timestamp_${reel.day}_${index}`}>
                  {step.timestamp}
                </div>
                <div className="flex-1 space-y-1" data-icod-id={`week2_step_content_${reel.day}_${index}`}>
                  <p className="font-medium text-sm text-foreground" data-icod-id={`week2_action_${reel.day}_${index}`}>{step.action}</p>
                  <p className="text-xs text-muted-foreground italic" data-icod-id={`week2_narration_${reel.day}_${index}`}>"{step.narration}"</p>
                  {step.visualNotes && (
                    <p className="text-xs text-primary/80 flex items-center gap-1" data-icod-id={`week2_visual_${reel.day}_${index}`}>
                      <Lightbulb className="h-3 w-3" data-icod-id={`week2_lightbulb_${reel.day}_${index}`} />
                      {step.visualNotes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Caption preview with copy */}
        <div className="mb-4" data-icod-id={`week2_caption_section_${reel.day}`}>
          <div className="flex items-center justify-between mb-1.5" data-icod-id={`week2_caption_header_${reel.day}`}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" data-icod-id={`week2_caption_label_${reel.day}`}>Caption Preview</p>
            <CopyButton text={reel.caption} data-icod-id="src_pages_contenttemplates_tsx_e6e6" />
          </div>
          <p className="text-xs text-muted-foreground line-clamp-3 p-3 rounded bg-muted/30 border border-border/50" data-icod-id={`week2_caption_preview_${reel.day}`}>
            {reel.caption}
          </p>
        </div>

        {/* Hashtag cloud */}
        <div className="mb-4" data-icod-id={`week2_hashtags_${reel.day}`}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2" data-icod-id={`week2_hashtag_label_${reel.day}`}>Hashtags</p>
          <div className="flex flex-wrap gap-1.5" data-icod-id={`week2_hashtag_cloud_${reel.day}`}>
            {reel.hashtags.map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground" data-icod-id={`week2_tag_${reel.day}_${tag}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Audio suggestion */}
        <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground" data-icod-id={`week2_audio_${reel.day}`}>
          <TrendingUp className="h-3.5 w-3.5 text-primary" data-icod-id={`week2_audio_icon_${reel.day}`} />
          <span data-icod-id={`week2_audio_text_${reel.day}`}>Audio: {reel.suggestedAudio}</span>
        </div>

        {/* Platforms */}
        <div className="mb-4" data-icod-id={`week2_platforms_${reel.day}`}>
          <div className="flex flex-wrap gap-1.5" data-icod-id={`week2_platform_tags_${reel.day}`}>
            {reel.platforms.map((platform) => (
              <span key={platform} className="text-[10px] px-2 py-0.5 rounded bg-accent/10 text-accent-foreground border border-accent/20" data-icod-id={`week2_platform_${reel.day}_${platform}`}>
                {platform}
              </span>
            ))}
          </div>
        </div>

        {/* CTA button */}
        <Link to={`/tools/${reel.toolSlug}`} data-icod-id={`week2_cta_link_${reel.toolSlug}`}>
          <Button variant="outline" size="sm" className="w-full gap-2" data-icod-id={`week2_cta_btn_${reel.day}`}>
            Try This Tool <ArrowRight className="h-3.5 w-3.5" data-icod-id={`week2_cta_arrow_${reel.day}`} />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

function Week2ReelsView() {
  const [toolFilter, setToolFilter] = useState<string>('all');

  const toolOptions = [
    { slug: 'all', name: 'All Tools' },
    ...week2Reels.map((r) => ({ slug: r.toolSlug, name: r.toolName }))
  ];

  const filteredReels = toolFilter === 'all'
    ? week2Reels
    : week2Reels.filter((r) => r.toolSlug === toolFilter);

  const handleCopyFullWeek = async () => {
    const fullPlan = week2Reels
      .map((r) => `Day ${r.day}: ${r.title}\nHook: "${r.hook}"\n\n${r.caption}\n`)
      .join('\n---\n\n');
    try {
      await navigator.clipboard.writeText(fullPlan);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-8" data-icod-id="week2_reels_view">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto" data-icod-id="week2_reels_header">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 font-heading" data-icod-id="week2_reels_title">
          Week 2 — Demonstrate the Tools
        </h2>
        <p className="text-muted-foreground" data-icod-id="week2_reels_subtitle">
          Each video demonstrates one tool end-to-end. Record, post, grow.
        </p>
      </div>
      {/* Copy Full Week Plan button */}
      <div className="flex justify-center" data-icod-id="week2_copy_all_wrap">
        <Button
          variant="secondary"
          size="md"
          onClick={handleCopyFullWeek}
          className="gap-2"
          data-icod-id="week2_copy_all_btn">
          <Copy className="h-4 w-4" data-icod-id="week2_copy_all_icon" />
          Copy Full Week Plan
        </Button>
      </div>
      {/* Tool filter dropdown */}
      <div className="flex items-center justify-center gap-3" data-icod-id="week2_filter_wrap">
        <Filter className="h-4 w-4 text-muted-foreground" data-icod-id="week2_filter_icon" />
        <select
          value={toolFilter}
          onChange={(e) => setToolFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          data-icod-id="week2_filter_select">
          {toolOptions.map((opt) => (
            <option
              key={opt.slug}
              value={opt.slug}
              data-icod-id={`src_pages_contenttemplates_tsx_47b4_${opt.slug}`}>{opt.name}</option>
          ))}
        </select>
      </div>
      {/* Vertical timeline of 7 cards */}
      <div className="max-w-7xl mx-auto space-y-6" data-icod-id="week2_reels_timeline">
        {filteredReels.map((reel) => (
          <Week2ReelCard key={reel.day} reel={reel} data-icod-id={`week2_reel_wrapper_${reel.day}`} />
        ))}
      </div>
      {filteredReels.length === 0 && (
        <div className="text-center py-12" data-icod-id="week2_no_results">
          <p
            className="text-muted-foreground"
            data-icod-id="src_pages_contenttemplates_tsx_81f9">No reels match the selected filter.</p>
        </div>
      )}
    </div>
  );
}

function EpisodeCard({ episode }: { episode: BuildEpisode }) {
  const [expanded, setExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const fullEpisodePlan = `🏗️ BUILD SERIES — EPISODE ${episode.episode}: ${episode.title}\n\nHOOK:\n"${episode.hook}"\n\nCAPTION:\n${episode.caption}\n\nHASHTAGS:\n${episode.hashtags.join(' ')}\n\nPLATFORMS: ${episode.platforms.join(', ')}\n\nENGAGEMENT QUESTION:\n${episode.engagementHook}`;

  return (
    <Card className="relative overflow-hidden" data-icod-id={`build_episode_card_${episode.episode}`}>
      {/* Timeline connector line */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-border/50 -z-10 hidden md:block" data-icod-id={`build_timeline_line_${episode.episode}`} />
      <div className="p-6" data-icod-id={`build_episode_content_${episode.episode}`}>
        {/* Episode badge + title row */}
        <div className="flex items-start justify-between gap-4 mb-4" data-icod-id={`build_episode_header_${episode.episode}`}>
          <div className="flex items-center gap-3" data-icod-id={`build_episode_title_row_${episode.episode}`}>
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25"
              data-icod-id={`build_ep_badge_${episode.episode}`}>
              {episode.episode}
            </div>
            <div data-icod-id={`build_episode_titles_${episode.episode}`}>
              <h3 className="font-bold text-foreground text-lg leading-tight" data-icod-id={`build_episode_title_${episode.episode}`}>
                {episode.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1" data-icod-id={`build_episode_angle_${episode.episode}`}>
                {episode.storyAngle.split('—')[0].trim()}
              </p>
            </div>
          </div>
          <Badge variant="ai" data-icod-id={`build_ep_number_badge_${episode.episode}`}>Ep. {episode.episode}</Badge>
        </div>

        {/* Hook quote */}
        <div
          className="mb-4 p-4 rounded-lg border-l-4 border-primary bg-primary/5 italic"
          data-icod-id={`build_hook_quote_${episode.episode}`}>
          <p className="text-foreground font-medium" data-icod-id={`build_hook_text_${episode.episode}`}>
            "{episode.hook}"
          </p>
        </div>

        {/* Platforms */}
        <div className="mb-4" data-icod-id={`build_platforms_${episode.episode}`}>
          <div className="flex flex-wrap gap-1.5" data-icod-id={`build_platform_tags_${episode.episode}`}>
            {episode.platforms.map((platform) => (
              <span key={platform} className="text-[10px] px-2 py-0.5 rounded bg-accent/10 text-accent-foreground border border-accent/20" data-icod-id={`build_platform_${episode.episode}_${platform}`}>
                {platform}
              </span>
            ))}
          </div>
        </div>

        {/* Featured tools */}
        {episode.toolsFeatured.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2" data-icod-id={`build_tools_featured_${episode.episode}`}>
            {episode.toolsFeatured.map((tool) => (
              <Link
                key={tool.slug}
                to={`/tools/${tool.slug}`}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline bg-primary/5 px-2.5 py-1 rounded-full border border-primary/20 transition-colors hover:bg-primary/10"
                data-icod-id={`build_tool_link_${episode.episode}_${tool.slug}`}>
                <Sparkles className="h-3 w-3" data-icod-id={`build_tool_sparkle_${episode.episode}_${tool.slug}`} />
                {tool.name}
              </Link>
            ))}
          </div>
        )}

        {/* Collapsible full script */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors mb-3"
          data-icod-id={`build_toggle_script_${episode.episode}`}>
          {expanded ? <ChevronUp className="h-4 w-4" data-icod-id={`build_chevron_up_${episode.episode}`} /> : <ChevronDown className="h-4 w-4" data-icod-id={`build_chevron_down_${episode.episode}`} />}
          {expanded ? 'Hide Full Script & Details' : 'Show Full Script & Details'}
        </button>

        {expanded && (
          <div className="space-y-5 animate-fade-in" data-icod-id={`build_expanded_content_${episode.episode}`}>
            {/* Full Script with timestamp/narration/visual columns */}
            <div data-icod-id={`build_script_section_${episode.episode}`}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2" data-icod-id={`build_script_label_${episode.episode}`}>
                <Clapperboard className="h-3.5 w-3.5" data-icod-id={`build_clapperboard_${episode.episode}`} />
                Full Script
              </p>
              <div className="space-y-3" data-icod-id={`build_script_steps_${episode.episode}`}>
                {episode.fullScript.map((step, index) => (
                  <div key={index} className="flex gap-3 pl-2 border-l-2 border-border/50" data-icod-id={`build_step_${episode.episode}_${index}`}>
                    <div className="shrink-0 w-16 text-xs font-mono text-muted-foreground pt-0.5" data-icod-id={`build_timestamp_${episode.episode}_${index}`}>
                      {step.timestamp}
                    </div>
                    <div className="flex-1 space-y-1" data-icod-id={`build_step_content_${episode.episode}_${index}`}>
                      <p className="font-medium text-sm text-foreground" data-icod-id={`build_narration_${episode.episode}_${index}`}>{step.narration}</p>
                      <p className="text-xs text-primary/80 flex items-start gap-1" data-icod-id={`build_visual_${episode.episode}_${index}`}>
                        <Lightbulb className="h-3 w-3 shrink-0 mt-0.5" data-icod-id={`build_lightbulb_${episode.episode}_${index}`} />
                        {step.visual}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Caption section with copy */}
            <div data-icod-id={`build_caption_section_${episode.episode}`}>
              <div className="flex items-center justify-between mb-1.5" data-icod-id={`build_caption_header_${episode.episode}`}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" data-icod-id={`build_caption_label_${episode.episode}`}>Ready-to-Post Caption</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(episode.caption, 'caption')}
                  className="gap-1.5 h-7 text-xs"
                  data-icod-id={`build_copy_caption_btn_${episode.episode}`}>
                  {copiedField === 'caption' ? <Check className="h-3 w-3 text-success" data-icod-id={`build_check_caption_${episode.episode}`} /> : <Copy className="h-3 w-3" data-icod-id={`build_copy_icon_caption_${episode.episode}`} />}
                  {copiedField === 'caption' ? 'Copied!' : 'Copy Caption'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap p-3 rounded bg-muted/30 border border-border/50 select-all max-h-48 overflow-y-auto" data-icod-id={`build_caption_preview_${episode.episode}`}>
                {episode.caption}
              </p>
            </div>

            {/* Hashtag cloud with copy */}
            <div data-icod-id={`build_hashtags_${episode.episode}`}>
              <div className="flex items-center justify-between mb-2" data-icod-id={`build_hashtag_header_${episode.episode}`}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" data-icod-id={`build_hashtag_label_${episode.episode}`}>Hashtags ({episode.hashtags.length})</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(episode.hashtags.join(' '), 'hashtags')}
                  className="gap-1.5 h-7 text-xs"
                  data-icod-id={`build_copy_hashtags_btn_${episode.episode}`}>
                  {copiedField === 'hashtags' ? <Check className="h-3 w-3 text-success" data-icod-id={`build_check_hashtags_${episode.episode}`} /> : <Copy className="h-3 w-3" data-icod-id={`build_copy_icon_hashtags_${episode.episode}`} />}
                  {copiedField === 'hashtags' ? 'Copied!' : 'Copy All'}
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5" data-icod-id={`build_hashtag_cloud_${episode.episode}`}>
                {episode.hashtags.map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground" data-icod-id={`build_tag_${episode.episode}_${tag}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Engagement hook */}
            <div className="p-3 rounded-lg bg-warning/5 border border-warning/20" data-icod-id={`build_engagement_${episode.episode}`}>
              <p className="text-xs font-semibold text-warning uppercase tracking-wider mb-1 flex items-center gap-1.5" data-icod-id={`build_engagement_label_${episode.episode}`}>
                <MessageCircle className="h-3 w-3" data-icod-id={`build_engagement_icon_${episode.episode}`} />
                Engagement Hook
              </p>
              <p className="text-sm text-foreground font-medium" data-icod-id={`build_engagement_question_${episode.episode}`}>
                {episode.engagementHook}
              </p>
            </div>

            {/* Audio suggestion */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground" data-icod-id={`build_audio_${episode.episode}`}>
              <TrendingUp className="h-3.5 w-3.5 text-primary" data-icod-id={`build_audio_icon_${episode.episode}`} />
              <span data-icod-id={`build_audio_text_${episode.episode}`}>Audio: {episode.suggestedAudio}</span>
            </div>

            {/* Copy Full Episode Plan button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleCopy(fullEpisodePlan, 'fullplan')}
              className="w-full gap-2"
              data-icod-id={`build_copy_full_plan_btn_${episode.episode}`}>
              {copiedField === 'fullplan' ? <Check className="h-3.5 w-3.5 text-success" data-icod-id={`build_check_fullplan_${episode.episode}`} /> : <Copy className="h-3.5 w-3.5" data-icod-id={`build_copy_icon_fullplan_${episode.episode}`} />}
              {copiedField === 'fullplan' ? 'Full Plan Copied!' : 'Copy Full Episode Plan'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function BuildSeriesView() {
  const handleCopyFullSeries = async () => {
    const fullSeries = buildSeriesEpisodes
      .map((ep) => `EPISODE ${ep.episode}: ${ep.title}\nHook: "${ep.hook}"\n\n${ep.caption}\n`)
      .join('\n---\n\n');
    try {
      await navigator.clipboard.writeText(fullSeries);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-8" data-icod-id="build_series_view">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto" data-icod-id="build_series_header">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4" data-icod-id="build_series_badge">
          <Clapperboard className="h-4 w-4" data-icod-id="build_series_badge_icon" />
          7-Episode Content Series
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 font-heading" data-icod-id="build_series_title">
          I Built This — Building MG Blessed Beginnings in Public
        </h2>
        <p className="text-muted-foreground" data-icod-id="build_series_subtitle">
          A complete content marketing series documenting the journey of building an AI toolkit for online sellers. Each episode is a ready-to-film short-form video with full scripts, captions, and hashtags.
        </p>
      </div>
      {/* Copy Full Series Plan button */}
      <div className="flex justify-center" data-icod-id="build_copy_all_wrap">
        <Button
          variant="secondary"
          size="md"
          onClick={handleCopyFullSeries}
          className="gap-2"
          data-icod-id="build_copy_all_btn">
          <Copy className="h-4 w-4" data-icod-id="build_copy_all_icon" />
          Copy Full Series Plan
        </Button>
      </div>
      {/* Vertical timeline of 7 episodes */}
      <div className="max-w-7xl mx-auto space-y-6" data-icod-id="build_series_timeline">
        {buildSeriesEpisodes.map((episode) => (
          <EpisodeCard key={episode.episode} episode={episode} data-icod-id={`build_episode_wrapper_${episode.episode}`} />
        ))}
      </div>
    </div>
  );
}

function WhatsAppTemplatesView() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const templates = [
    {
      audience: 'For fellow sellers & entrepreneurs',
      message: `FREE AI TOOL 🎁

I found a free AI toolkit that generates product descriptions, SEO titles, and listing optimizations in seconds. Perfect for anyone selling online!

Try it here 👇
${SITE_URL}`
    },
    {
      audience: 'For content creators',
      message: `CONTENT CREATOR HACK 🚀

This free AI tool writes social media posts, captions, and hashtags for you. No more staring at a blank screen!

Check it out 👇
${SITE_URL}`
    },
    {
      audience: 'For students & freelancers',
      message: `FREE TOOL ALERT 💡

Need to write product descriptions, blog posts, or marketing copy? This AI toolkit does it all for free. Great for side hustles and freelance work!

Try it now 👇
${SITE_URL}`
    },
    {
      audience: 'General — Free tools announcement',
      message: `🆓 FREE AI TOOLS

Generate product descriptions, SEO titles, hashtags, social media posts and more — all completely free. Built for Pakistani entrepreneurs and online sellers!

Start creating 👇
${SITE_URL}`
    }
  ];

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto" data-icod-id="whatsapp_templates_view">
      {/* Intro card */}
      <div className="p-5 rounded-xl border border-[#25D366]/30 bg-[#25D366]/5" data-icod-id="whatsapp_templates_intro">
        <div className="flex items-center gap-3 mb-2" data-icod-id="whatsapp_templates_intro_header">
          <MessageCircle className="h-5 w-5 text-[#25D366]" data-icod-id="whatsapp_templates_intro_icon" />
          <h3 className="font-bold text-foreground" data-icod-id="whatsapp_templates_intro_title">WhatsApp Quick-Copy Templates</h3>
        </div>
        <p className="text-sm text-muted-foreground" data-icod-id="whatsapp_templates_intro_desc">
          Copy any message below and paste it directly into WhatsApp to share with your contacts, groups, or status. Each template is tailored for a different audience.
        </p>
      </div>

      {/* Template cards */}
      <div className="grid gap-4" data-icod-id="whatsapp_templates_grid">
        {templates.map((template, index) => (
          <Card key={index} className="p-5 relative overflow-hidden" data-icod-id={`whatsapp_template_card_${index}`}>
            {/* Green accent bar */}
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#25D366]" data-icod-id={`whatsapp_template_accent_${index}`} />
            <div className="pl-3" data-icod-id={`whatsapp_template_content_${index}`}>
              <div className="flex items-center justify-between mb-3" data-icod-id={`whatsapp_template_header_${index}`}>
                <Badge variant="default" className="bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20" data-icod-id={`whatsapp_template_badge_${index}`}>
                  {template.audience}
                </Badge>
              </div>
              <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed mb-4 p-3 rounded-lg bg-muted/30 border border-border/50 select-all" data-icod-id={`whatsapp_template_text_${index}`}>
                {template.message}
              </pre>
              <div className="flex items-center gap-2" data-icod-id={`whatsapp_template_actions_${index}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(template.message, index)}
                  className="gap-1.5"
                  data-icod-id={`whatsapp_template_copy_btn_${index}`}>
                  {copiedIndex === index ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-success" data-icod-id={`whatsapp_template_check_${index}`} />
                      <span className="text-success" data-icod-id={`whatsapp_template_copied_${index}`}>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" data-icod-id={`whatsapp_template_copy_icon_${index}`} />
                      <span data-icod-id={`whatsapp_template_copy_text_${index}`}>Copy Message</span>
                    </>
                  )}
                </Button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(template.message)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-icod-id={`whatsapp_template_share_link_${index}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-[#25D366] hover:text-[#20BD5A] hover:bg-[#25D366]/10"
                    data-icod-id={`whatsapp_template_share_btn_${index}`}>
                    <MessageCircle className="h-3.5 w-3.5" data-icod-id={`whatsapp_template_share_icon_${index}`} />
                    <span data-icod-id={`whatsapp_template_share_text_${index}`}>Open in WhatsApp</span>
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CrossPlatformView() {
  const [selectedToolSlug, setSelectedToolSlug] = useState<string>(contentTemplates[0]?.toolSlug || '');

  const toolOptions = useMemo(
    () => contentTemplates.map((t) => ({ slug: t.toolSlug, name: t.tool })),
    []
  );

  const selectedTemplate = useMemo(
    () => contentTemplates.find((t) => t.toolSlug === selectedToolSlug),
    [selectedToolSlug]
  );

  const baseHook = selectedTemplate?.hooks[0] || 'Discover this free AI tool that saves you hours';

  const captions = useMemo(
    () => generatePlatformCaptions(
      selectedTemplate?.tool || 'AI Tool',
      selectedToolSlug,
      baseHook,
      SITE_URL
    ),
    [selectedTemplate, selectedToolSlug, baseHook]
  );

  const handleCopyAll = async () => {
    const allCaptions = captions
      .map((c) => `${c.iconEmoji} ${c.platform}\n${'='.repeat(30)}\n\n${c.caption}`)
      .join('\n\n\n');
    try {
      await navigator.clipboard.writeText(allCaptions);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async (caption: string, platform: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${platform} Caption`, text: caption });
      } catch {
        // User cancelled or share failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(caption);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  function getCharCountColor(current: number, max: number): string {
    const ratio = current / max;
    if (ratio > 1) return 'text-destructive';
    if (ratio >= 0.8) return 'text-warning';
    return 'text-success';
  }

  return (
    <div className="space-y-8" data-icod-id="cross_platform_view">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto" data-icod-id="cross_platform_header">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 font-heading" data-icod-id="cross_platform_title">
          Cross-Platform Publisher
        </h2>
        <p className="text-muted-foreground" data-icod-id="cross_platform_subtitle">
          One tool, eight unique captions. Each platform gets a different hook optimized for its audience and algorithm.
        </p>
      </div>
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4" data-icod-id="cross_platform_controls">
        {/* Tool selector */}
        <div className="flex items-center gap-3" data-icod-id="cross_platform_selector_wrap">
          <Filter className="h-4 w-4 text-muted-foreground" data-icod-id="cross_platform_filter_icon" />
          <select
            value={selectedToolSlug}
            onChange={(e) => setSelectedToolSlug(e.target.value)}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[240px]"
            data-icod-id="cross_platform_tool_select">
            {toolOptions.map((opt) => (
              <option
                key={opt.slug}
                value={opt.slug}
                data-icod-id={`src_pages_contenttemplates_tsx_e1ce_${opt.slug}`}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>

        {/* Copy All button */}
        <Button
          variant="secondary"
          size="md"
          onClick={handleCopyAll}
          className="gap-2"
          data-icod-id="cross_platform_copy_all_btn">
          <Copy className="h-4 w-4" data-icod-id="cross_platform_copy_all_icon" />
          Copy All 8 Captions
        </Button>
      </div>
      {/* Platform cards grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        data-icod-id="cross_platform_grid">
        {captions.map((item) => {
          const charCount = item.caption.length;
          const charColorClass = getCharCountColor(charCount, item.maxChars);

          return (
            <Card
              key={item.platform}
              hoverLift={false}
              className="relative overflow-hidden flex flex-col"
              style={{ borderLeftWidth: 4, borderLeftColor: item.accentColor }}
              data-icod-id={`cross_platform_card_${item.platform}`}>
              {/* Top accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: item.accentColor }}
                data-icod-id={`cross_platform_accent_bar_${item.platform}`} />
              <div className="p-5 flex flex-col flex-1" data-icod-id={`cross_platform_card_content_${item.platform}`}>
                {/* Platform header */}
                <div className="flex items-center justify-between mb-3" data-icod-id={`cross_platform_card_header_${item.platform}`}>
                  <div className="flex items-center gap-2" data-icod-id={`cross_platform_platform_name_${item.platform}`}>
                    <span
                      className="text-xl"
                      role="img"
                      aria-label={item.platform}
                      data-icod-id={`src_pages_contenttemplates_tsx_6dcd_${item.platform}`}>{item.iconEmoji}</span>
                    <span
                      className="font-bold text-foreground"
                      data-icod-id={`src_pages_contenttemplates_tsx_1527_${item.platform}`}>{item.platform}</span>
                  </div>
                  <Badge
                    variant="default"
                    className="text-[10px] max-w-[120px] truncate"
                    data-icod-id={`cross_platform_hook_style_badge_${item.platform}`}>
                    {item.hookStyle.split(',')[0]}
                  </Badge>
                </div>

                {/* Caption text area */}
                <div className="flex-1 mb-3" data-icod-id={`cross_platform_caption_area_${item.platform}`}>
                  <textarea
                    readOnly
                    value={item.caption}
                    className="w-full h-48 resize-none rounded-lg bg-muted/30 border border-border/50 p-3 text-xs text-foreground font-sans leading-relaxed select-all focus:outline-none focus:border-primary/50 scrollbar-thin"
                    data-icod-id={`cross_platform_caption_text_${item.platform}`} />
                </div>

                {/* Character count */}
                <div className="flex items-center justify-between mb-3" data-icod-id={`cross_platform_char_count_${item.platform}`}>
                  <span
                    className={cn('text-xs font-medium', charColorClass)}
                    data-icod-id={`src_pages_contenttemplates_tsx_cf64_${item.platform}`}>
                    {charCount.toLocaleString()} / {item.maxChars.toLocaleString()} chars
                  </span>
                  {charCount > item.maxChars && (
                    <span
                      className="text-[10px] text-destructive font-medium"
                      data-icod-id={`src_pages_contenttemplates_tsx_2afe_${item.platform}`}>Over limit</span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 mt-auto" data-icod-id={`cross_platform_actions_${item.platform}`}>
                  <CopyButton
                    text={item.caption}
                    label="Copy Caption"
                    className="flex-1"
                    data-icod-id={`src_pages_contenttemplates_tsx_9aa2_${item.platform}`} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(item.caption, item.platform)}
                    className="gap-1.5 shrink-0"
                    data-icod-id={`cross_platform_share_btn_${item.platform}`}>
                    <ExternalLink
                      className="h-3.5 w-3.5"
                      data-icod-id={`src_pages_contenttemplates_tsx_ab31_${item.platform}`} />
                    <span
                      className="hidden sm:inline"
                      data-icod-id={`src_pages_contenttemplates_tsx_3d13_${item.platform}`}>Share</span>
                  </Button>
                </div>

                {/* Posting tips (collapsed by default via details/summary) */}
                {item.postingTips.length > 0 && (
                  <details className="mt-3 pt-3 border-t border-border/30" data-icod-id={`cross_platform_tips_details_${item.platform}`}>
                    <summary className="text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none" data-icod-id={`cross_platform_tips_summary_${item.platform}`}>
                      <Lightbulb
                        className="h-3 w-3 inline mr-1"
                        data-icod-id={`src_pages_contenttemplates_tsx_7bf1_${item.platform}`} />
                      Posting Tips
                    </summary>
                    <ul className="mt-2 space-y-1" data-icod-id={`cross_platform_tips_list_${item.platform}`}>
                      {item.postingTips.map((tip, i) => (
                        <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5" data-icod-id={`cross_platform_tip_${item.platform}_${i}`}>
                          <span
                            className="text-primary mt-0.5 shrink-0"
                            data-icod-id={`src_pages_contenttemplates_tsx_3631_${item.platform}_${i}`}>&#x2022;</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function ContentTemplates() {
  const [activeTab, setActiveTab] = useState<TabView>('hooks');
  const [selectedTool, setSelectedTool] = useState<string>('all');

  const filteredTemplates = selectedTool === 'all'
    ? contentTemplates
    : contentTemplates.filter((t) => t.toolSlug === selectedTool);

  const filteredScripts = selectedTool === 'all'
    ? recordingScripts
    : recordingScripts.filter((s) => s.toolSlug === selectedTool);

  const tabs: { id: TabView; label: string; icon: React.ElementType }[] = [
    { id: 'hooks', label: 'Content Hooks', icon: FileText },
    { id: 'scripts', label: 'Recording Scripts', icon: Video },
    { id: 'calendar', label: 'Content Calendar', icon: Calendar },
    { id: 'strategy', label: 'Platform Strategy', icon: TrendingUp },
    { id: 'week2reels', label: 'Week 2 Reels', icon: Clapperboard },
    { id: 'whatsapp', label: 'WhatsApp Templates', icon: MessageCircle },
    { id: 'crossplatform', label: 'Cross-Platform', icon: Globe },
    { id: 'buildseries', label: '🏗️ Build Series', icon: Clapperboard },
  ];

  const toolOptions = [
    { slug: 'all', name: 'All Tools' },
    ...contentTemplates.map((t) => ({ slug: t.toolSlug, name: t.tool }))
  ];

  return (
    <>
      <SEOHead
        title={contentTemplatesMeta.title}
        description={contentTemplatesMeta.description}
        keywords={contentTemplatesMeta.keywords}
        canonicalUrl={contentTemplatesMeta.canonical}
        data-icod-id="content_templates_seo" />
      <SchemaInjector
        schemaType="page"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Content Templates', url: '/content-templates' },
        ]}
        data-icod-id="src_pages_contenttemplates_tsx_70e3" />
      {/* Hero Section */}
      <section className="py-16 md:py-24" style={{ background: 'var(--gradient-signature)' }} data-icod-id="content_templates_hero">
        <div className="container mx-auto px-4 text-center" data-icod-id="content_templates_hero_container">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 text-sm font-medium text-primary-foreground mb-6" data-icod-id="content_templates_hero_badge">
            <Sparkles className="h-4 w-4" data-icod-id="content_templates_hero_sparkle" />
            Content Marketing Machine
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-6 font-heading" data-icod-id="content_templates_hero_title">
            Ready-to-Use Social Media Templates
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8" data-icod-id="content_templates_hero_desc">
            Stop staring at a blank screen. Get proven hooks, recording scripts, and content calendars 
            designed specifically for promoting AI e-commerce tools.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4" data-icod-id="content_templates_hero_ctas">
            <Link to="/ai-tools" data-icod-id="content_templates_hero_tools_link">
              <Button variant="secondary" size="lg" className="min-w-[180px]" data-icod-id="content_templates_hero_tools_btn">
                Explore AI Tools
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 min-w-[180px]"
              onClick={() => window.print()}
              data-icod-id="content_templates_hero_download_btn">
              <Download className="h-4 w-4 mr-2" data-icod-id="content_templates_download_icon" />
              Print / Save
            </Button>
          </div>
        </div>
      </section>
      {/* Ad Banner after Hero */}
      <div
        className="container mx-auto px-4 py-6"
        data-icod-id="src_pages_contenttemplates_tsx_1b16">
        <AdSenseSlot format="banner" data-icod-id="src_pages_contenttemplates_tsx_b7c4" />
      </div>
      {/* Main Content */}
      <section className="py-12 md:py-16 bg-background" data-icod-id="content_templates_main">
        <div className="container mx-auto px-4 max-w-[1200px]" data-icod-id="content_templates_main_container">
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center" data-icod-id="content_templates_tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                      : 'bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  data-icod-id={`content_templates_tab_${tab.id}`}>
                  <Icon className="h-4 w-4" data-icod-id={`content_templates_tab_icon_${tab.id}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tool Filter (only for hooks, scripts, and week2reels) */}
          {(activeTab === 'hooks' || activeTab === 'scripts') && (
            <div className="mb-8 flex flex-wrap gap-2 justify-center" data-icod-id="content_templates_filter">
              {toolOptions.map((option) => (
                <button
                  key={option.slug}
                  onClick={() => setSelectedTool(option.slug)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all',
                    selectedTool === option.slug
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                  data-icod-id={`content_templates_filter_${option.slug}`}>
                  {option.name}
                </button>
              ))}
            </div>
          )}

          {/* Tab Content */}
          <div data-icod-id="content_templates_content">
            {activeTab === 'hooks' && (
              <div className="max-w-3xl mx-auto" data-icod-id="content_templates_hooks_view">
                <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20" data-icod-id="content_templates_hooks_intro">
                  <p className="text-sm text-muted-foreground" data-icod-id="content_templates_hooks_intro_text">
                    Click any hook to expand and see the before/after example. Use the copy button to grab hooks instantly for your posts.
                  </p>
                </div>
                {filteredTemplates.map((template) => (
                  <HookCard
                    key={template.toolSlug}
                    template={template}
                    data-icod-id={`src_pages_contenttemplates_tsx_adf5_${template.toolSlug}`} />
                ))}
              </div>
            )}

            {activeTab === 'scripts' && (
              <div className="max-w-3xl mx-auto" data-icod-id="content_templates_scripts_view">
                <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20" data-icod-id="content_templates_scripts_intro">
                  <p className="text-sm text-muted-foreground" data-icod-id="content_templates_scripts_intro_text">
                    Step-by-step screen recording scripts optimized for short-form video. Each script is under 60 seconds with narration and visual notes.
                  </p>
                </div>
                {filteredScripts.map((script) => (
                  <ScriptCard
                    key={script.toolSlug}
                    script={script}
                    data-icod-id={`src_pages_contenttemplates_tsx_e29f_${script.toolSlug}`} />
                ))}
              </div>
            )}

            {activeTab === 'calendar' && (
              <CalendarView data-icod-id="src_pages_contenttemplates_tsx_9eee" />
            )}

            {activeTab === 'strategy' && (
              <StrategyView data-icod-id="src_pages_contenttemplates_tsx_a7fd" />
            )}

            {activeTab === 'week2reels' && (
              <Week2ReelsView data-icod-id="week2_reels_tab_content" />
            )}

            {activeTab === 'whatsapp' && (
              <WhatsAppTemplatesView data-icod-id="whatsapp_templates_tab_content" />
            )}

            {activeTab === 'crossplatform' && (
              <CrossPlatformView data-icod-id="src_pages_contenttemplates_tsx_ce85" />
            )}

            {activeTab === 'buildseries' && (
              <BuildSeriesView data-icod-id="build_series_tab_content" />
            )}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-muted/30" data-icod-id="content_templates_cta_section">
        <div className="container mx-auto px-4 text-center" data-icod-id="content_templates_cta_container">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-heading" data-icod-id="content_templates_cta_title">
            Ready to Create Content That Converts?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto" data-icod-id="content_templates_cta_desc">
            Use these templates with our free AI tools to create professional content in minutes, not hours.
          </p>
          <Link to="/ai-tools" data-icod-id="content_templates_cta_link">
            <Button variant="primary" size="lg" className="shadow-lg shadow-primary/25" data-icod-id="content_templates_cta_btn">
              <Sparkles className="h-5 w-5 mr-2" data-icod-id="content_templates_cta_sparkle" />
              Start Creating with AI Tools
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
