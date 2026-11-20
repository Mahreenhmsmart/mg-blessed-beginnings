import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Input, Alert, Spinner } from '@/components/ui';
import Badge from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import SEOHead from '@/components/SEOHead';
import { ChevronLeft, Link2, Download, Sparkles, RefreshCw, ExternalLink, Info, Anchor, Calendar, CheckCircle2, FileText, Copy, Search } from 'lucide-react';
import { SITE_NAME } from '@/seo';
import { aiToolApiService } from '@/services/aiToolService';

// ─── Types ──────────────────────────────────────────────────────────────────

interface BacklinkOpportunity {
  platform: string;
  anchorText: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  steps: string[];
}

interface BacklinkPlan {
  directories: BacklinkOpportunity[];
  profiles: BacklinkOpportunity[];
  guest_posts: BacklinkOpportunity[];
  forums: BacklinkOpportunity[];
  web20: BacklinkOpportunity[];
}

interface AnchorCategory {
  name: string;
  percentage: number;
  examples: string[];
}

interface AnchorStrategy {
  categories: AnchorCategory[];
}

type ToolTab = 'backlink-finder' | 'anchor-text-strategist';

// ─── Growth Plan Types ──────────────────────────────────────────────────────

interface WeekTask {
  day: string;
  description: string;
  category: string;
}

interface WeekData {
  weekNumber: number;
  title: string;
  tasks: WeekTask[];
  milestones: string[];
}

interface GrowthPlan {
  weeks: WeekData[];
}

// ─── Blog Article Types ──────────────────────────────────────────────────────

interface BlogArticle {
  metaTitle: string;
  metaDescription: string;
  articleBody: string;
}

// ─── Competitor Snapshot Types ──────────────────────────────────────────────

interface CompetitorObservation {
  text: string;
  indicator: 'Strong' | 'Moderate' | 'Gap Identified';
}

interface CompetitorDimension {
  dimension: string;
  observations: Record<string, CompetitorObservation>;
}

interface CompetitorGaps {
  contentGaps: string[];
  keywordOpportunities: string[];
  differentiationIdeas: string[];
}

interface CompetitorSnapshot {
  comparison: CompetitorDimension[];
  gaps: CompetitorGaps;
}

// ─── Parser ─────────────────────────────────────────────────────────────────

function parseBacklinkPlan(raw: string): BacklinkPlan | null {
  try {
    // Strip any markdown code fences that might wrap the JSON
    const cleaned = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed || typeof parsed !== 'object') return null;

    // Validate structure — each category should be an array of opportunities
    const normalizeCategory = (arr: unknown): BacklinkOpportunity[] => {
      if (!Array.isArray(arr)) return [];
      return arr.filter((item): item is BacklinkOpportunity => {
        return (
          item &&
          typeof item === 'object' &&
          typeof (item as BacklinkOpportunity).platform === 'string' &&
          typeof (item as BacklinkOpportunity).anchorText === 'string' &&
          typeof (item as BacklinkOpportunity).difficulty === 'string' &&
          Array.isArray((item as BacklinkOpportunity).steps)
        );
      });
    };

    const plan: BacklinkPlan = {
      directories: normalizeCategory(parsed.directories),
      profiles: normalizeCategory(parsed.profiles),
      guest_posts: normalizeCategory(parsed.guest_posts),
      forums: normalizeCategory(parsed.forums),
      web20: normalizeCategory(parsed.web20),
    };

    // Return null if all categories are empty (parse failed)
    const total =
      plan.directories.length +
      plan.profiles.length +
      plan.guest_posts.length +
      plan.forums.length +
      plan.web20.length;

    return total > 0 ? plan : null;
  } catch {
    return null;
  }
}

// ─── Anchor Strategy Parser ────────────────────────────────────────────────

function parseAnchorStrategy(raw: string): AnchorStrategy | null {
  try {
    const cleaned = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.categories)) return null;

    const categories: AnchorCategory[] = parsed.categories.filter(
      (cat: unknown): cat is AnchorCategory => {
        return (
          cat != null &&
          typeof cat === 'object' &&
          typeof (cat as AnchorCategory).name === 'string' &&
          typeof (cat as AnchorCategory).percentage === 'number' &&
          Array.isArray((cat as AnchorCategory).examples) &&
          (cat as AnchorCategory).examples.length > 0
        );
      },
    );

    return categories.length > 0 ? { categories } : null;
  } catch {
    return null;
  }
}

// ─── Growth Plan Parser ─────────────────────────────────────────────────────

function parseGrowthPlan(raw: string): GrowthPlan | null {
  try {
    const cleaned = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.weeks)) return null;

    const weeks: WeekData[] = parsed.weeks.filter(
      (w: unknown): w is WeekData => {
        if (!w || typeof w !== 'object') return false;
        const week = w as Record<string, unknown>;
        return (
          typeof week.weekNumber === 'number' &&
          typeof week.title === 'string' &&
          Array.isArray(week.tasks) &&
          week.tasks.length > 0 &&
          Array.isArray(week.milestones)
        );
      },
    );

    // Validate individual tasks within each week
    for (const week of weeks) {
      week.tasks = week.tasks.filter(
        (t: unknown): t is WeekTask => {
          if (!t || typeof t !== 'object') return false;
          const task = t as Record<string, unknown>;
          return (
            typeof task.day === 'string' &&
            typeof task.description === 'string' &&
            typeof task.category === 'string'
          );
        },
      );
    }

    return weeks.length >= 4 ? { weeks: weeks.slice(0, 4) } : null;
  } catch {
    return null;
  }
}

// ─── Blog Article Parser ─────────────────────────────────────────────────────

function parseBlogArticle(raw: string): BlogArticle | null {
  try {
    const cleaned = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed || typeof parsed !== 'object') return null;

    const metaTitle = typeof parsed.metaTitle === 'string' ? parsed.metaTitle.trim() : '';
    const metaDescription = typeof parsed.metaDescription === 'string' ? parsed.metaDescription.trim() : '';
    const articleBody = typeof parsed.articleBody === 'string' ? parsed.articleBody.trim() : '';

    if (!metaTitle || !metaDescription || !articleBody) return null;

    return { metaTitle, metaDescription, articleBody };
  } catch {
    return null;
  }
}

// ─── Competitor Snapshot Parser ──────────────────────────────────────────────

function parseCompetitorSnapshot(raw: string): CompetitorSnapshot | null {
  try {
    const cleaned = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed || typeof parsed !== 'object') return null;
    if (!Array.isArray(parsed.comparison) || parsed.comparison.length === 0) return null;
    if (!parsed.gaps || typeof parsed.gaps !== 'object') return null;

    // Validate comparison dimensions
    const comparison: CompetitorDimension[] = parsed.comparison.filter(
      (dim: unknown): dim is CompetitorDimension => {
        if (!dim || typeof dim !== 'object') return false;
        const d = dim as Record<string, unknown>;
        return (
          typeof d.dimension === 'string' &&
          d.observations != null &&
          typeof d.observations === 'object'
        );
      },
    );

    // Validate gaps
    const gaps: CompetitorGaps = {
      contentGaps: Array.isArray(parsed.gaps.contentGaps) ? parsed.gaps.contentGaps.filter((g: unknown) => typeof g === 'string') : [],
      keywordOpportunities: Array.isArray(parsed.gaps.keywordOpportunities) ? parsed.gaps.keywordOpportunities.filter((g: unknown) => typeof g === 'string') : [],
      differentiationIdeas: Array.isArray(parsed.gaps.differentiationIdeas) ? parsed.gaps.differentiationIdeas.filter((g: unknown) => typeof g === 'string') : [],
    };

    if (comparison.length === 0) return null;

    return { comparison, gaps };
  } catch {
    return null;
  }
}

// ─── CSV Export ─────────────────────────────────────────────────────────────

function downloadCSV(plan: BacklinkPlan) {
  const escapeCSV = (val: string) => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Include AI honesty disclaimer as a comment line at the top of the CSV
  const headerComment = '# AI-Suggested Opportunities — These are AI-generated suggestions based on your niche. No live backlink data or domain authority scores are used. Always verify each opportunity before pursuing it.';

  const rows: string[][] = [['Category', 'Opportunity', 'Anchor Text', 'Difficulty', 'Signup Steps']];

  const addCategory = (category: string, items: BacklinkOpportunity[]) => {
    for (const item of items) {
      rows.push([
        category,
        item.platform,
        item.anchorText,
        item.difficulty,
        item.steps.join('; '),
      ]);
    }
  };

  addCategory('Directories', plan.directories);
  addCategory('Profiles', plan.profiles);
  addCategory('Guest Posts', plan.guest_posts);
  addCategory('Forums', plan.forums);
  addCategory('Web 2.0', plan.web20);

  const csvContent = headerComment + '\n' + rows.map((row) => row.map(escapeCSV).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ai-suggested-backlink-plan-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Difficulty badge color ─────────────────────────────────────────────────

function difficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-success/10 text-success border-success/20';
    case 'hard':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    default:
      return 'bg-warning/10 text-warning border-warning/20';
  }
}

// ─── Category sections ─────────────────────────────────────────────────────

const CATEGORY_CONFIG: { key: keyof BacklinkPlan; label: string; icon: typeof Link2 }[] = [
  { key: 'directories', label: 'Directories', icon: ExternalLink },
  { key: 'profiles', label: 'Profiles', icon: Link2 },
  { key: 'guest_posts', label: 'Guest Posts', icon: Sparkles },
  { key: 'forums', label: 'Forums', icon: RefreshCw },
  { key: 'web20', label: 'Web 2.0', icon: Info },
];

// ─── Page Component ─────────────────────────────────────────────────────────

// ─── Anchor Strategy CSV Export ──────────────────────────────────────────────

function downloadAnchorCSV(strategy: AnchorStrategy) {
  const escapeCSV = (val: string) => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerComment = '# AI-Suggested Anchor Strategy — These are AI-generated suggestions based on your keywords. No live backlink data or domain authority scores are used. Always verify your anchor text strategy before implementing it.';

  const rows: string[][] = [['Category', 'Recommended %', 'Example Anchor Text']];

  for (const cat of strategy.categories) {
    for (const example of cat.examples) {
      rows.push([cat.name, `${cat.percentage}%`, example]);
    }
  }

  const csvContent = headerComment + '\n' + rows.map((row) => row.map(escapeCSV).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ai-suggested-anchor-strategy-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Growth Plan CSV Export ──────────────────────────────────────────────────

function downloadGrowthPlanCSV(plan: GrowthPlan) {
  const escapeCSV = (val: string) => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerComment = '# AI-Suggested 30-Day SEO Growth Plan — These are AI-generated suggestions based on your niche and SEO best practices. No live data or metrics are used.';

  const rows: string[][] = [['Week', 'Day', 'Category', 'Task', 'Milestones']];

  for (const week of plan.weeks) {
    const milestoneStr = week.milestones.join('; ');
    for (const task of week.tasks) {
      rows.push([
        `Week ${week.weekNumber}: ${week.title}`,
        task.day,
        task.category,
        task.description,
        milestoneStr,
      ]);
    }
  }

  const csvContent = headerComment + '\n' + rows.map((row) => row.map(escapeCSV).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ai-suggested-30day-seo-plan-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Blog Article CSV Export ────────────────────────────────────────────────

function downloadBlogArticleCSV(article: BlogArticle) {
  const escapeCSV = (val: string) => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerComment = '# AI-Generated SEO Article — This is an AI-generated article based on your topic and keywords. No live data or external API connections.';

  const rows: string[][] = [['Field', 'Content']];
  rows.push(['Meta Title', article.metaTitle]);
  rows.push(['Meta Description', article.metaDescription]);
  rows.push(['Full Article', article.articleBody]);

  const csvContent = headerComment + '\n' + rows.map((row) => row.map(escapeCSV).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ai-seo-blog-article-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Competitor Snapshot CSV Export ──────────────────────────────────────────

function downloadCompetitorSnapshotCSV(snapshot: CompetitorSnapshot, competitorUrls: string[]) {
  const escapeCSV = (val: string) => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerComment = '# AI-Generated Competitor Snapshot — These are AI-generated qualitative assessments based on competitor URLs and SEO best practices. No live data, domain authority scores, or traffic metrics.';

  // Build comparison table rows
  const rows: string[][] = [['Dimension', ...competitorUrls]];

  for (const dim of snapshot.comparison) {
    const row: string[] = [dim.dimension];
    for (const url of competitorUrls) {
      const obs = dim.observations[url];
      row.push(obs ? `[${obs.indicator}] ${obs.text}` : 'N/A');
    }
    rows.push(row);
  }

  // Add gaps section
  rows.push([]);
  rows.push(['GAPS & OPPORTUNITIES']);
  rows.push(['Content Gaps', ...snapshot.gaps.contentGaps]);
  rows.push(['Keyword Opportunities', ...snapshot.gaps.keywordOpportunities]);
  rows.push(['Differentiation Ideas', ...snapshot.gaps.differentiationIdeas]);

  const csvContent = headerComment + '\n' + rows.map((row) => row.map(escapeCSV).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ai-competitor-snapshot-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Category color for anchor strategy ──────────────────────────────────────

function anchorCategoryColor(name: string) {
  switch (name.toLowerCase()) {
    case 'exact match':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'partial match':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'branded':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'generic':
      return 'bg-muted text-muted-foreground border-border/60';
    case 'naked url':
      return 'bg-accent/10 text-accent-foreground border-accent/20';
    case 'lsi / synonyms':
      return 'bg-success/10 text-success border-success/20';
    default:
      return 'bg-muted text-muted-foreground border-border/60';
  }
}

// ─── Growth Plan task category color ─────────────────────────────────────────

function taskCategoryColor(category: string) {
  switch (category.toLowerCase()) {
    case 'keyword research':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'content creation':
      return 'bg-success/10 text-success border-success/20';
    case 'on-page seo':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'link building':
      return 'bg-accent/10 text-accent-foreground border-accent/20';
    case 'technical seo':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'analytics':
      return 'bg-muted text-muted-foreground border-border/60';
    default:
      return 'bg-muted text-muted-foreground border-border/60';
  }
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function SeoBacklinkStudio() {
  const [niche, setNiche] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [country, setCountry] = useState('USA');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<BacklinkPlan | null>(null);
  const [rawOutput, setRawOutput] = useState<string | null>(null);

  // Anchor Text Strategist state
  const [anchorUrl, setAnchorUrl] = useState('');
  const [anchorKeywords, setAnchorKeywords] = useState('');
  const [anchorLoading, setAnchorLoading] = useState(false);
  const [anchorError, setAnchorError] = useState<string | null>(null);
  const [anchorStrategy, setAnchorStrategy] = useState<AnchorStrategy | null>(null);
  const [anchorRawOutput, setAnchorRawOutput] = useState<string | null>(null);

  // 30-Day SEO Growth Plan state
  const [growthNiche, setGrowthNiche] = useState('');
  const [growthCountry, setGrowthCountry] = useState('USA');
  const [growthLoading, setGrowthLoading] = useState(false);
  const [growthError, setGrowthError] = useState<string | null>(null);
  const [growthPlan, setGrowthPlan] = useState<GrowthPlan | null>(null);
  const [growthRawOutput, setGrowthRawOutput] = useState<string | null>(null);

  // SEO Blog Article Writer state
  const [blogTopic, setBlogTopic] = useState('');
  const [blogKeywords, setBlogKeywords] = useState('');
  const [blogTone, setBlogTone] = useState('Professional');
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogError, setBlogError] = useState<string | null>(null);
  const [blogArticle, setBlogArticle] = useState<BlogArticle | null>(null);
  const [blogRawOutput, setBlogRawOutput] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Competitor Snapshot state
  const [snapshotUrls, setSnapshotUrls] = useState('');
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [snapshotData, setSnapshotData] = useState<CompetitorSnapshot | null>(null);
  const [snapshotRawOutput, setSnapshotRawOutput] = useState<string | null>(null);
  const [parsedSnapshotUrls, setParsedSnapshotUrls] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!niche.trim()) {
      setError('Please enter a niche or industry.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPlan(null);
    setRawOutput(null);

    try {
      const input: Record<string, unknown> = {
        niche: niche.trim(),
        country: country.trim() || 'USA',
      };
      if (competitorUrl.trim()) {
        input.competitorUrl = competitorUrl.trim();
      }

      const result = await aiToolApiService.generateContent('seo-backlink-studio', input);
      setRawOutput(result);

      const parsed = parseBacklinkPlan(result);
      if (parsed) {
        setPlan(parsed);
      } else {
        // If parsing fails, show the raw output so the user isn't left empty-handed
        setError('The AI response could not be parsed into a structured plan. The raw output is shown below.');
      }
    } catch (err: unknown) {
      console.error('[SeoBacklinkStudio] Generation failed:', err);
      const msg = err instanceof Error ? err.message : 'Something went wrong generating this. Please try again in a moment.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnchorGenerate = async () => {
    if (!anchorUrl.trim()) {
      setAnchorError('Please enter a website URL.');
      return;
    }
    if (!anchorKeywords.trim()) {
      setAnchorError('Please enter at least one target keyword.');
      return;
    }

    setAnchorLoading(true);
    setAnchorError(null);
    setAnchorStrategy(null);
    setAnchorRawOutput(null);

    try {
      const result = await aiToolApiService.generateContent('anchor-text-strategist', {
        websiteUrl: anchorUrl.trim(),
        keywords: anchorKeywords.trim(),
      });
      setAnchorRawOutput(result);

      const parsed = parseAnchorStrategy(result);
      if (parsed) {
        setAnchorStrategy(parsed);
      } else {
        setAnchorError('The AI response could not be parsed into a structured strategy. The raw output is shown below.');
      }
    } catch (err: unknown) {
      console.error('[SeoBacklinkStudio] Anchor strategy generation failed:', err);
      const msg = err instanceof Error ? err.message : 'Something went wrong generating this. Please try again in a moment.';
      setAnchorError(msg);
    } finally {
      setAnchorLoading(false);
    }
  };

  const handleGrowthPlanGenerate = async () => {
    if (!growthNiche.trim()) {
      setGrowthError('Please enter a niche or industry.');
      return;
    }

    setGrowthLoading(true);
    setGrowthError(null);
    setGrowthPlan(null);
    setGrowthRawOutput(null);

    try {
      // The backend endpoint expects niche, keywords, and country.
      // We use the niche as the primary keyword input since this section
      // only has a niche field — the AI prompt generates keyword-aware tasks from it.
      const result = await aiToolApiService.generateContent('seo-growth-plan', {
        niche: growthNiche.trim(),
        keywords: growthNiche.trim(),
        country: growthCountry.trim() || 'USA',
      });
      setGrowthRawOutput(result);

      const parsed = parseGrowthPlan(result);
      if (parsed) {
        setGrowthPlan(parsed);
      } else {
        setGrowthError('The AI response could not be parsed into a structured plan. The raw output is shown below.');
      }
    } catch (err: unknown) {
      console.error('[SeoBacklinkStudio] Growth plan generation failed:', err);
      const msg = err instanceof Error ? err.message : 'Something went wrong generating this. Please try again in a moment.';
      setGrowthError(msg);
    } finally {
      setGrowthLoading(false);
    }
  };

  const handleBlogArticleGenerate = async () => {
    if (!blogTopic.trim()) {
      setBlogError('Please enter a topic for the blog article.');
      return;
    }
    if (!blogKeywords.trim()) {
      setBlogError('Please enter at least one keyword.');
      return;
    }

    setBlogLoading(true);
    setBlogError(null);
    setBlogArticle(null);
    setBlogRawOutput(null);
    setCopiedField(null);

    try {
      const result = await aiToolApiService.generateContent('seo-blog-article', {
        topic: blogTopic.trim(),
        keywords: blogKeywords.trim(),
        tone: blogTone,
      });
      setBlogRawOutput(result);

      const parsed = parseBlogArticle(result);
      if (parsed) {
        setBlogArticle(parsed);
      } else {
        setBlogError('The AI response could not be parsed into a structured article. The raw output is shown below.');
      }
    } catch (err: unknown) {
      console.error('[SeoBacklinkStudio] Blog article generation failed:', err);
      const msg = err instanceof Error ? err.message : 'Something went wrong generating this. Please try again in a moment.';
      setBlogError(msg);
    } finally {
      setBlogLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }).catch(() => {
      // Fallback — do nothing on clipboard failure
    });
  };

  const handleSnapshotGenerate = async () => {
    if (!snapshotUrls.trim()) {
      setSnapshotError('Please enter your website URL and at least 2 competitor URLs.');
      return;
    }

    // Parse URLs — split by newline or comma, filter empty
    const urls = snapshotUrls
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter(Boolean);

    if (urls.length < 3) {
      setSnapshotError('Please enter your website URL plus at least 2 competitor URLs (3 URLs minimum).');
      return;
    }

    // First URL is the user's site, rest are competitors
    const userWebsiteUrl = urls[0];
    const competitorUrls = urls.slice(1, 4); // max 3 competitors

    setSnapshotLoading(true);
    setSnapshotError(null);
    setSnapshotData(null);
    setSnapshotRawOutput(null);
    setParsedSnapshotUrls([userWebsiteUrl, ...competitorUrls]);

    try {
      const result = await aiToolApiService.generateContent('seo-competitor-snapshot', {
        competitorUrls,
        userWebsiteUrl,
      });
      setSnapshotRawOutput(result);

      const parsed = parseCompetitorSnapshot(result);
      if (parsed) {
        setSnapshotData(parsed);
      } else {
        setSnapshotError('The AI response could not be parsed into a structured snapshot. The raw output is shown below.');
      }
    } catch (err: unknown) {
      console.error('[SeoBacklinkStudio] Competitor snapshot generation failed:', err);
      const msg = err instanceof Error ? err.message : 'Something went wrong generating this. Please try again in a moment.';
      setSnapshotError(msg);
    } finally {
      setSnapshotLoading(false);
    }
  };

  const indicatorColor = (indicator: string) => {
    switch (indicator) {
      case 'Strong':
        return 'bg-success/10 text-success border-success/20';
      case 'Moderate':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Gap Identified':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border/60';
    }
  };

  const totalOpportunities = plan
    ? plan.directories.length + plan.profiles.length + plan.guest_posts.length + plan.forums.length + plan.web20.length
    : 0;

  return (
    <>
      <SEOHead
        title={`Backlink Opportunity Finder — Free AI Tool | ${SITE_NAME}`}
        description="Find AI-suggested backlink opportunities for your niche. Get a structured plan with directories, profiles, guest posts, forums, and Web 2.0 platforms."
        keywords="backlink finder, link building, SEO backlinks, backlink opportunities, free backlink tool"
        canonicalUrl="/tools/seo-backlink-studio"
        data-icod-id="src_pages_seobacklinkstudio_tsx_f032" />
      {/* Hero Section */}
      <section
        className="py-16 md:py-24"
        style={{ background: 'var(--section-lavender)' }}
        data-icod-id="src_pages_seobacklinkstudio_tsx_6fba">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_seobacklinkstudio_tsx_ac93">
          <nav className="mb-8" data-icod-id="src_pages_seobacklinkstudio_tsx_27ee">
            <Link
              to="/ai-tools"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
              data-icod-id="src_pages_seobacklinkstudio_tsx_7826">
              <ChevronLeft
                className="h-4 w-4 mr-1"
                data-icod-id="src_pages_seobacklinkstudio_tsx_dbca" />
              Back to AI Tools
            </Link>
          </nav>

          <div
            className="max-w-7xl mx-auto text-center"
            data-icod-id="src_pages_seobacklinkstudio_tsx_e57f">
            <div
              className="flex items-center justify-center gap-2 mb-4"
              data-icod-id="src_pages_seobacklinkstudio_tsx_cbbb">
              <Badge variant="free" data-icod-id="src_pages_seobacklinkstudio_tsx_a46a">Free Forever</Badge>
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-heading"
              data-icod-id="src_pages_seobacklinkstudio_tsx_d4e5">
              Backlink Opportunity Finder
            </h1>
            <p
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              data-icod-id="src_pages_seobacklinkstudio_tsx_8c8f">
              Get AI-suggested backlink opportunities tailored to your niche. No live data, no fake metrics — just actionable suggestions.
            </p>
          </div>
        </div>
      </section>
      {/* Tool Banner Image */}
      <div className="w-full" data-icod-id="src_pages_seobacklinkstudio_tsx_banner">
        <img
          src="https://drive.google.com/thumbnail?id=1kW6Jk-Oq6OgHTldj2KbZ_IPdPOy-_60E&sz=w1920"
          alt="Backlink Opportunity Finder Banner"
          className="w-full h-auto object-cover"
          loading="eager"
          data-icod-id="src_pages_seobacklinkstudio_tsx_banner_img"
        />
      </div>
      {/* Tool Section */}
      <section
        className="py-12 md:py-16 bg-background"
        data-icod-id="src_pages_seobacklinkstudio_tsx_f843">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_seobacklinkstudio_tsx_6f89">
          <div
            className="max-w-7xl mx-auto space-y-8"
            data-icod-id="src_pages_seobacklinkstudio_tsx_c7eb">
            {/* Form */}
            <Card
              className="p-6 md:p-8"
              data-icod-id="src_pages_seobacklinkstudio_tsx_85e2">
              <div
                className="flex items-center gap-3 mb-6"
                data-icod-id="src_pages_seobacklinkstudio_tsx_85c5">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_64cc">
                  <Sparkles className="h-5 w-5" data-icod-id="src_pages_seobacklinkstudio_tsx_3f44" />
                </div>
                <div data-icod-id="src_pages_seobacklinkstudio_tsx_a433">
                  <h2
                    className="text-lg font-semibold text-foreground"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_605f">Generate Backlink Plan</h2>
                  <p
                    className="text-sm text-muted-foreground"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_5000">Fill in your details to get tailored suggestions</p>
                </div>
              </div>

              <div className="space-y-4" data-icod-id="src_pages_seobacklinkstudio_tsx_7630">
                <div data-icod-id="src_pages_seobacklinkstudio_tsx_f4d9">
                  <label
                    htmlFor="niche"
                    className="block text-sm font-medium text-foreground mb-1.5"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_de6e">
                    Niche / Industry <span
                    className="text-destructive"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_9e7e">*</span>
                  </label>
                  <Input
                    id="niche"
                    type="text"
                    placeholder='e.g., home & kitchen products'
                    value={niche}
                    onChange={(e) => { setNiche(e.target.value); if (error) setError(null); }}
                    data-icod-id="src_pages_seobacklinkstudio_tsx_6438" />
                </div>

                <div data-icod-id="src_pages_seobacklinkstudio_tsx_925f">
                  <label
                    htmlFor="competitorUrl"
                    className="block text-sm font-medium text-foreground mb-1.5"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_0497">
                    Competitor URL (optional)
                  </label>
                  <Input
                    id="competitorUrl"
                    type="url"
                    placeholder="https://competitor-site.com"
                    value={competitorUrl}
                    onChange={(e) => setCompetitorUrl(e.target.value)}
                    data-icod-id="src_pages_seobacklinkstudio_tsx_ad4c" />
                </div>

                <div data-icod-id="src_pages_seobacklinkstudio_tsx_bad0">
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-foreground mb-1.5"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_b55a">
                    Country
                  </label>
                  <Input
                    id="country"
                    type="text"
                    placeholder="USA"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    data-icod-id="src_pages_seobacklinkstudio_tsx_de41" />
                </div>

                {error && (
                  <Alert variant="error" data-icod-id="src_pages_seobacklinkstudio_tsx_eeb4">{error}</Alert>
                )}

                <Button
                  onClick={handleGenerate}
                  loading={isLoading}
                  disabled={isLoading}
                  size="lg"
                  className="w-full"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_21bd">
                  <Sparkles
                    className="mr-2 h-4 w-4"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_b8c5" />
                  {isLoading ? 'Generating...' : 'Generate Backlink Plan'}
                </Button>
              </div>
            </Card>

            {/* Loading State */}
            {isLoading && (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-icod-id="src_pages_seobacklinkstudio_tsx_c9fc">
                <Spinner size="lg" data-icod-id="src_pages_seobacklinkstudio_tsx_0b5d" />
                <p
                  className="mt-4 text-sm text-muted-foreground"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_036d">
                  Analyzing your niche and generating backlink opportunities...
                </p>
              </div>
            )}

            {/* Results */}
            {plan && !isLoading && (
              <div className="space-y-6" data-icod-id="src_pages_seobacklinkstudio_tsx_91f1">
                {/* Disclaimer */}
                <div
                  className="rounded-lg border border-border/60 bg-muted/30 p-4"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_e900">
                  <div
                    className="flex items-start gap-3"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_5d53">
                    <Info
                      className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_49e3" />
                    <div data-icod-id="src_pages_seobacklinkstudio_tsx_d589">
                      <p
                        className="text-sm font-semibold text-foreground mb-1"
                        data-icod-id="src_pages_seobacklinkstudio_tsx_435b">AI-Suggested Opportunities</p>
                      <p
                        className="text-xs text-muted-foreground leading-relaxed"
                        data-icod-id="src_pages_seobacklinkstudio_tsx_a345">
                        These are AI-generated suggestions based on your niche. No live backlink data or domain authority scores are used. Always verify each opportunity before pursuing it.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary bar */}
                <div
                  className="flex flex-wrap items-center justify-between gap-4"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_9c3d">
                  <div data-icod-id="src_pages_seobacklinkstudio_tsx_bd90">
                    <h3
                      className="text-xl font-bold text-foreground"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_1810">
                      Your Backlink Plan
                    </h3>
                    <p
                      className="text-sm text-muted-foreground"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_267f">
                      {totalOpportunities} opportunities across 5 categories
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => downloadCSV(plan)}
                    data-icod-id="src_pages_seobacklinkstudio_tsx_687b">
                    <Download
                      className="mr-2 h-4 w-4"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_08c9" />
                    Download CSV
                  </Button>
                </div>

                {/* Category Groups */}
                {CATEGORY_CONFIG.map(({ key, label, icon: Icon }) => {
                  const items = plan[key];
                  if (items.length === 0) return null;

                  return (
                    <div key={key} data-icod-id={`src_pages_seobacklinkstudio_tsx_a7ba_${key}`}>
                      <div
                        className="flex items-center gap-2 mb-3"
                        data-icod-id={`src_pages_seobacklinkstudio_tsx_9c31_${key}`}>
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"
                          data-icod-id={`src_pages_seobacklinkstudio_tsx_629f_${key}`}>
                          <Icon
                            className="h-4 w-4 text-primary"
                            data-icod-id={`src_pages_seobacklinkstudio_tsx_33bb_${key}`} />
                        </div>
                        <h4
                          className="text-base font-semibold text-foreground"
                          data-icod-id={`src_pages_seobacklinkstudio_tsx_8e7f_${key}`}>{label}</h4>
                        <span
                          className="text-xs font-medium text-muted-foreground rounded-full bg-muted px-2 py-0.5"
                          data-icod-id={`src_pages_seobacklinkstudio_tsx_c1bc_${key}`}>
                          {items.length}
                        </span>
                      </div>
                      <div
                        className="grid grid-cols-1 md:grid-cols-2 gap-3"
                        data-icod-id={`src_pages_seobacklinkstudio_tsx_0dcf_${key}`}>
                        {items.map((item, idx) => (
                          <Card
                            key={idx}
                            className="p-4 border-border/60"
                            data-icod-id={`src_pages_seobacklinkstudio_tsx_4c6a_${key}_${idx}`}>
                            <div
                              className="flex items-start justify-between gap-2 mb-2"
                              data-icod-id={`src_pages_seobacklinkstudio_tsx_33f9_${key}_${idx}`}>
                              <h5
                                className="text-sm font-semibold text-foreground leading-snug"
                                data-icod-id={`src_pages_seobacklinkstudio_tsx_1fea_${key}_${idx}`}>
                                {item.platform}
                              </h5>
                              <span
                                className={cn(
                                  'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                                  difficultyColor(item.difficulty),
                                )}
                                data-icod-id={`src_pages_seobacklinkstudio_tsx_c39e_${key}_${idx}`}>
                                {item.difficulty}
                              </span>
                            </div>

                            <div
                              className="space-y-2"
                              data-icod-id={`src_pages_seobacklinkstudio_tsx_464c_${key}_${idx}`}>
                              <div data-icod-id={`src_pages_seobacklinkstudio_tsx_20bb_${key}_${idx}`}>
                                <p
                                  className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5"
                                  data-icod-id={`src_pages_seobacklinkstudio_tsx_7378_${key}_${idx}`}>Suggested Anchor</p>
                                <p
                                  className="text-xs text-foreground font-medium truncate"
                                  data-icod-id={`src_pages_seobacklinkstudio_tsx_4f62_${key}_${idx}`}>{item.anchorText}</p>
                              </div>

                              <div data-icod-id={`src_pages_seobacklinkstudio_tsx_94c7_${key}_${idx}`}>
                                <p
                                  className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5"
                                  data-icod-id={`src_pages_seobacklinkstudio_tsx_71a1_${key}_${idx}`}>Steps</p>
                                <ul
                                  className="space-y-0.5"
                                  data-icod-id={`src_pages_seobacklinkstudio_tsx_5ae1_${key}_${idx}`}>
                                  {item.steps.map((step, sIdx) => (
                                    <li
                                      key={sIdx}
                                      className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5"
                                      data-icod-id={`src_pages_seobacklinkstudio_tsx_f3d1_${key}_${idx}_${sIdx}`}>
                                      <span
                                        className="text-primary/60 font-mono text-[10px] mt-0.5 shrink-0"
                                        data-icod-id={`src_pages_seobacklinkstudio_tsx_0fc6_${key}_${idx}_${sIdx}`}>{sIdx + 1}.</span>
                                      <span
                                        data-icod-id={`src_pages_seobacklinkstudio_tsx_d5a5_${key}_${idx}_${sIdx}`}>{step}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Raw output fallback when parsing fails but we got a response */}
            {!plan && rawOutput && !isLoading && (
              <Card className="p-6" data-icod-id="src_pages_seobacklinkstudio_tsx_2beb">
                <h4
                  className="font-semibold text-foreground mb-3"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_d782">Raw Output</h4>
                <pre
                  className="text-xs text-muted-foreground whitespace-pre-wrap overflow-x-auto"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_903e">{rawOutput}</pre>
              </Card>
            )}
          </div>
        </div>
      </section>
      {/* ─── Anchor Text Strategist Section ────────────────────────────────────── */}
      <section
        className="py-12 md:py-16 bg-muted/20"
        data-icod-id="src_pages_seobacklinkstudio_tsx_ea3d">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_seobacklinkstudio_tsx_183d">
          <div
            className="max-w-7xl mx-auto space-y-8"
            data-icod-id="src_pages_seobacklinkstudio_tsx_3e24">
            {/* Section Header */}
            <div
              className="text-center"
              data-icod-id="src_pages_seobacklinkstudio_tsx_5df3">
              <div
                className="flex items-center justify-center gap-2 mb-3"
                data-icod-id="src_pages_seobacklinkstudio_tsx_5069">
                <Anchor
                  className="h-6 w-6 text-primary"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_356c" />
                <h2
                  className="text-3xl md:text-4xl font-bold text-foreground font-heading"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_05dc">
                  Anchor Text Strategist
                </h2>
              </div>
              <p
                className="text-lg text-muted-foreground max-w-2xl mx-auto"
                data-icod-id="src_pages_seobacklinkstudio_tsx_d419">
                Generate an AI-suggested anchor text mix for your backlink profile. Get recommended ratios across branded, partial-match, and generic anchors based on your keywords.
              </p>
            </div>

            {/* Form */}
            <Card
              className="p-6 md:p-8"
              data-icod-id="src_pages_seobacklinkstudio_tsx_6c09">
              <div
                className="flex items-center gap-3 mb-6"
                data-icod-id="src_pages_seobacklinkstudio_tsx_b4f6">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_33e5">
                  <Anchor className="h-5 w-5" data-icod-id="src_pages_seobacklinkstudio_tsx_d979" />
                </div>
                <div data-icod-id="src_pages_seobacklinkstudio_tsx_d25b">
                  <h3
                    className="text-lg font-semibold text-foreground"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_3bb8">Generate Anchor Strategy</h3>
                  <p
                    className="text-sm text-muted-foreground"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_4bba">Enter your website URL and target keywords</p>
                </div>
              </div>

              <div className="space-y-4" data-icod-id="src_pages_seobacklinkstudio_tsx_d18a">
                <div data-icod-id="src_pages_seobacklinkstudio_tsx_adec">
                  <label
                    htmlFor="anchorUrl"
                    className="block text-sm font-medium text-foreground mb-1.5"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_02bc">
                    Website URL <span
                    className="text-destructive"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_4d1d">*</span>
                  </label>
                  <Input
                    id="anchorUrl"
                    type="url"
                    placeholder="https://example.com"
                    value={anchorUrl}
                    onChange={(e) => { setAnchorUrl(e.target.value); if (anchorError) setAnchorError(null); }}
                    data-icod-id="src_pages_seobacklinkstudio_tsx_61d3" />
                </div>

                <div data-icod-id="src_pages_seobacklinkstudio_tsx_2263">
                  <label
                    htmlFor="anchorKeywords"
                    className="block text-sm font-medium text-foreground mb-1.5"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_5a3c">
                    Keywords <span
                    className="text-destructive"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_7f13">*</span>
                  </label>
                  <Input
                    id="anchorKeywords"
                    type="text"
                    placeholder="e.g., handmade candles, soy candles, candle gifts"
                    value={anchorKeywords}
                    onChange={(e) => { setAnchorKeywords(e.target.value); if (anchorError) setAnchorError(null); }}
                    data-icod-id="src_pages_seobacklinkstudio_tsx_4337" />
                  <p
                    className="text-xs text-muted-foreground mt-1"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_e239">Separate multiple keywords with commas</p>
                </div>

                {anchorError && (
                  <Alert variant="error" data-icod-id="src_pages_seobacklinkstudio_tsx_3c9a">{anchorError}</Alert>
                )}

                <Button
                  onClick={handleAnchorGenerate}
                  loading={anchorLoading}
                  disabled={anchorLoading}
                  size="lg"
                  className="w-full"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_ad44">
                  <Anchor
                    className="mr-2 h-4 w-4"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_bfc8" />
                  {anchorLoading ? 'Generating...' : 'Generate Anchor Strategy'}
                </Button>
              </div>
            </Card>

            {/* Loading State */}
            {anchorLoading && (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-icod-id="src_pages_seobacklinkstudio_tsx_09ba">
                <Spinner size="lg" data-icod-id="src_pages_seobacklinkstudio_tsx_32ca" />
                <p
                  className="mt-4 text-sm text-muted-foreground"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_41f4">
                  Analyzing your keywords and generating anchor text recommendations...
                </p>
              </div>
            )}

            {/* Results */}
            {anchorStrategy && !anchorLoading && (
              <div className="space-y-6" data-icod-id="src_pages_seobacklinkstudio_tsx_6683">
                {/* Disclaimer */}
                <div
                  className="rounded-lg border border-border/60 bg-muted/30 p-4"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_0850">
                  <div
                    className="flex items-start gap-3"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_5e77">
                    <Info
                      className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_74c7" />
                    <div data-icod-id="src_pages_seobacklinkstudio_tsx_44bf">
                      <p
                        className="text-sm font-semibold text-foreground mb-1"
                        data-icod-id="src_pages_seobacklinkstudio_tsx_322e">AI-Suggested Anchor Strategy</p>
                      <p
                        className="text-xs text-muted-foreground leading-relaxed"
                        data-icod-id="src_pages_seobacklinkstudio_tsx_1d31">
                        These are AI-generated suggestions based on your keywords and SEO best practices. No live backlink data or domain authority scores are used. Always verify and adjust your anchor text strategy based on your own research.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary bar */}
                <div
                  className="flex flex-wrap items-center justify-between gap-4"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_ca2e">
                  <div data-icod-id="src_pages_seobacklinkstudio_tsx_b29a">
                    <h3
                      className="text-xl font-bold text-foreground"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_4743">
                      Recommended Anchor Mix
                    </h3>
                    <p
                      className="text-sm text-muted-foreground"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_f726">
                      {anchorStrategy.categories.length} categories &middot; Percentages should total ~100%
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => downloadAnchorCSV(anchorStrategy)}
                    data-icod-id="src_pages_seobacklinkstudio_tsx_ffb7">
                    <Download
                      className="mr-2 h-4 w-4"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_3990" />
                    Download CSV
                  </Button>
                </div>

                {/* Ratio Visualization Bar */}
                <div className="space-y-2" data-icod-id="src_pages_seobacklinkstudio_tsx_4a78">
                  <p
                    className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_7d10">Distribution Overview</p>
                  <div
                    className="flex h-6 w-full overflow-hidden rounded-full"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_3336">
                    {anchorStrategy.categories.map((cat, idx) => (
                      <div
                        key={idx}
                        style={{ width: `${cat.percentage}%` }}
                        className={cn(
                          'flex items-center justify-center text-[9px] font-bold text-foreground transition-all',
                          idx === 0 && 'bg-primary/80',
                          idx === 1 && 'bg-warning/60',
                          idx === 2 && 'bg-success/60',
                          idx === 3 && 'bg-muted',
                          idx === 4 && 'bg-accent/60',
                          idx === 5 && 'bg-destructive/40',
                        )}
                        title={`${cat.name}: ${cat.percentage}%`}
                        data-icod-id={`src_pages_seobacklinkstudio_tsx_e821_${idx}`}>
                        {cat.percentage >= 8 && `${cat.percentage}%`}
                      </div>
                    ))}
                  </div>
                  <div
                    className="flex flex-wrap gap-3 pt-1"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_d6d2">
                    {anchorStrategy.categories.map((cat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5"
                        data-icod-id={`src_pages_seobacklinkstudio_tsx_f85a_${idx}`}>
                        <span
                          className={cn(
                            'inline-block h-2.5 w-2.5 rounded-full',
                            idx === 0 && 'bg-primary/80',
                            idx === 1 && 'bg-warning/60',
                            idx === 2 && 'bg-success/60',
                            idx === 3 && 'bg-muted',
                            idx === 4 && 'bg-accent/60',
                            idx === 5 && 'bg-destructive/40',
                          )}
                          data-icod-id={`src_pages_seobacklinkstudio_tsx_cebc_${idx}`} />
                        <span
                          className="text-xs text-muted-foreground"
                          data-icod-id={`src_pages_seobacklinkstudio_tsx_4c4b_${idx}`}>{cat.name} ({cat.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Cards */}
                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_4ad7">
                  {anchorStrategy.categories.map((cat, catIdx) => (
                    <Card
                      key={catIdx}
                      className="p-5 border-border/60"
                      data-icod-id={`src_pages_seobacklinkstudio_tsx_2e20_${catIdx}`}>
                      <div
                        className="flex items-center justify-between mb-3"
                        data-icod-id={`src_pages_seobacklinkstudio_tsx_0d4c_${catIdx}`}>
                        <div
                          className="flex items-center gap-2"
                          data-icod-id={`src_pages_seobacklinkstudio_tsx_555a_${catIdx}`}>
                          <span
                            className={cn(
                              'rounded-full border px-2.5 py-0.5 text-xs font-bold',
                              anchorCategoryColor(cat.name),
                            )}
                            data-icod-id={`src_pages_seobacklinkstudio_tsx_2f41_${catIdx}`}>
                            {cat.percentage}%
                          </span>
                          <h4
                            className="text-sm font-semibold text-foreground"
                            data-icod-id={`src_pages_seobacklinkstudio_tsx_c834_${catIdx}`}>{cat.name}</h4>
                        </div>
                      </div>

                      <div
                        className="space-y-1.5"
                        data-icod-id={`src_pages_seobacklinkstudio_tsx_fba7_${catIdx}`}>
                        <p
                          className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider"
                          data-icod-id={`src_pages_seobacklinkstudio_tsx_8f33_${catIdx}`}>
                          Suggested Anchors
                        </p>
                        {cat.examples.map((example, exIdx) => (
                          <div
                            key={exIdx}
                            className="flex items-start gap-2 rounded-md bg-muted/40 px-3 py-2"
                            data-icod-id={`src_pages_seobacklinkstudio_tsx_e427_${catIdx}_${exIdx}`}>
                            <Link2
                              className="h-3.5 w-3.5 text-primary/60 shrink-0 mt-0.5"
                              data-icod-id={`src_pages_seobacklinkstudio_tsx_e5df_${catIdx}_${exIdx}`} />
                            <span
                              className="text-sm text-foreground"
                              data-icod-id={`src_pages_seobacklinkstudio_tsx_cef6_${catIdx}_${exIdx}`}>{example}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Raw output fallback when parsing fails but we got a response */}
            {!anchorStrategy && anchorRawOutput && !anchorLoading && (
              <Card className="p-6" data-icod-id="src_pages_seobacklinkstudio_tsx_0993">
                <h4
                  className="font-semibold text-foreground mb-3"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_b085">Raw Output</h4>
                <pre
                  className="text-xs text-muted-foreground whitespace-pre-wrap overflow-x-auto"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_8742">{anchorRawOutput}</pre>
              </Card>
            )}
          </div>
        </div>
      </section>
      {/* ─── 30-Day SEO Growth Plan Section ────────────────────────────────────── */}
      <section
        className="py-12 md:py-16 bg-background"
        data-icod-id="src_pages_seobacklinkstudio_tsx_93c0">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_seobacklinkstudio_tsx_7ed2">
          <div
            className="max-w-7xl mx-auto space-y-8"
            data-icod-id="src_pages_seobacklinkstudio_tsx_4bbf">
            {/* Section Header */}
            <div
              className="text-center"
              data-icod-id="src_pages_seobacklinkstudio_tsx_667e">
              <div
                className="flex items-center justify-center gap-2 mb-3"
                data-icod-id="src_pages_seobacklinkstudio_tsx_a671">
                <Calendar
                  className="h-6 w-6 text-primary"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_7e9b" />
                <h2
                  className="text-3xl md:text-4xl font-bold text-foreground font-heading"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_4b81">
                  30-Day SEO Growth Plan
                </h2>
              </div>
              <p
                className="text-lg text-muted-foreground max-w-2xl mx-auto"
                data-icod-id="src_pages_seobacklinkstudio_tsx_cbd0">
                Get an AI-suggested week-by-week SEO action plan tailored to your niche. Practical daily tasks across keyword research, content creation, on-page optimization, link building, and more.
              </p>
            </div>

            {/* Form */}
            <Card
              className="p-6 md:p-8"
              data-icod-id="src_pages_seobacklinkstudio_tsx_f8da">
              <div
                className="flex items-center gap-3 mb-6"
                data-icod-id="src_pages_seobacklinkstudio_tsx_78db">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_3260">
                  <Calendar className="h-5 w-5" data-icod-id="src_pages_seobacklinkstudio_tsx_dfd4" />
                </div>
                <div data-icod-id="src_pages_seobacklinkstudio_tsx_9f11">
                  <h3
                    className="text-lg font-semibold text-foreground"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_df33">Generate 30-Day Plan</h3>
                  <p
                    className="text-sm text-muted-foreground"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_cbe7">Enter your niche to get a personalized growth plan</p>
                </div>
              </div>

              <div className="space-y-4" data-icod-id="src_pages_seobacklinkstudio_tsx_9a6b">
                <div data-icod-id="src_pages_seobacklinkstudio_tsx_f0e9">
                  <label
                    htmlFor="growthNiche"
                    className="block text-sm font-medium text-foreground mb-1.5"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_e690">
                    Niche / Industry <span
                    className="text-destructive"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_bde1">*</span>
                  </label>
                  <Input
                    id="growthNiche"
                    type="text"
                    placeholder="e.g., home & kitchen products"
                    value={growthNiche}
                    onChange={(e) => { setGrowthNiche(e.target.value); if (growthError) setGrowthError(null); }}
                    data-icod-id="src_pages_seobacklinkstudio_tsx_1498" />
                </div>

                <div data-icod-id="src_pages_seobacklinkstudio_tsx_4850">
                  <label
                    htmlFor="growthCountry"
                    className="block text-sm font-medium text-foreground mb-1.5"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_243c">
                    Country
                  </label>
                  <Input
                    id="growthCountry"
                    type="text"
                    placeholder="USA"
                    value={growthCountry}
                    onChange={(e) => setGrowthCountry(e.target.value)}
                    data-icod-id="src_pages_seobacklinkstudio_tsx_4fcf" />
                </div>

                {growthError && (
                  <Alert variant="error" data-icod-id="src_pages_seobacklinkstudio_tsx_774c">{growthError}</Alert>
                )}

                <Button
                  onClick={handleGrowthPlanGenerate}
                  loading={growthLoading}
                  disabled={growthLoading}
                  size="lg"
                  className="w-full"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_67bb">
                  <Sparkles
                    className="mr-2 h-4 w-4"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_3dce" />
                  {growthLoading ? 'Generating...' : 'Generate 30-Day Plan'}
                </Button>
              </div>
            </Card>

            {/* Loading State */}
            {growthLoading && (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-icod-id="src_pages_seobacklinkstudio_tsx_40d0">
                <Spinner size="lg" data-icod-id="src_pages_seobacklinkstudio_tsx_0ba8" />
                <p
                  className="mt-4 text-sm text-muted-foreground"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_b571">
                  Building your personalized 30-day SEO growth plan...
                </p>
              </div>
            )}

            {/* Results */}
            {growthPlan && !growthLoading && (
              <div className="space-y-6" data-icod-id="src_pages_seobacklinkstudio_tsx_421e">
                {/* Honesty Disclaimer */}
                <div
                  className="rounded-lg border border-border/60 bg-muted/30 p-4"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_f64b">
                  <div
                    className="flex items-start gap-3"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_b27e">
                    <Info
                      className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_4c02" />
                    <div data-icod-id="src_pages_seobacklinkstudio_tsx_b594">
                      <p
                        className="text-sm font-semibold text-foreground mb-1"
                        data-icod-id="src_pages_seobacklinkstudio_tsx_ab7b">AI-Suggested Tasks Based on Your Niche and SEO Best Practices</p>
                      <p
                        className="text-xs text-muted-foreground leading-relaxed"
                        data-icod-id="src_pages_seobacklinkstudio_tsx_e2fe">
                        This plan is entirely AI-generated based on general SEO knowledge and your niche. No live data, domain authority scores, traffic numbers, or backlink counts are used. Adapt these suggestions to your specific situation and verify with your own research.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary bar */}
                <div
                  className="flex flex-wrap items-center justify-between gap-4"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_c9aa">
                  <div data-icod-id="src_pages_seobacklinkstudio_tsx_76c1">
                    <h3
                      className="text-xl font-bold text-foreground"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_8d70">
                      Your 30-Day SEO Growth Plan
                    </h3>
                    <p
                      className="text-sm text-muted-foreground"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_b499">
                      {growthPlan.weeks.length} weeks &middot; {growthPlan.weeks.reduce((sum, w) => sum + w.tasks.length, 0)} tasks total
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => downloadGrowthPlanCSV(growthPlan)}
                    data-icod-id="src_pages_seobacklinkstudio_tsx_2ab3">
                    <Download
                      className="mr-2 h-4 w-4"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_2ab8" />
                    Download CSV
                  </Button>
                </div>

                {/* Week-by-Week Timeline */}
                <div className="space-y-6" data-icod-id="src_pages_seobacklinkstudio_tsx_e5aa">
                  {growthPlan.weeks.map((week) => (
                    <div
                      key={week.weekNumber}
                      className="relative"
                      data-icod-id={`src_pages_seobacklinkstudio_tsx_cbb3_${week.weekNumber}`}>
                      {/* Week Header */}
                      <div
                        className="flex items-center gap-3 mb-4"
                        data-icod-id={`src_pages_seobacklinkstudio_tsx_8f81_${week.weekNumber}`}>
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm"
                          data-icod-id={`src_pages_seobacklinkstudio_tsx_63b4_${week.weekNumber}`}>
                          {week.weekNumber}
                        </div>
                        <div data-icod-id={`src_pages_seobacklinkstudio_tsx_9672_${week.weekNumber}`}>
                          <h4
                            className="text-base font-semibold text-foreground"
                            data-icod-id={`src_pages_seobacklinkstudio_tsx_a197_${week.weekNumber}`}>
                            Week {week.weekNumber}: {week.title}
                          </h4>
                          <p
                            className="text-xs text-muted-foreground"
                            data-icod-id={`src_pages_seobacklinkstudio_tsx_6724_${week.weekNumber}`}>
                            {week.tasks.length} tasks &middot; {week.milestones.length} milestones
                          </p>
                        </div>
                      </div>

                      {/* Task Cards */}
                      <div
                        className="ml-5 border-l-2 border-border/40 pl-5 space-y-3"
                        data-icod-id={`src_pages_seobacklinkstudio_tsx_e895_${week.weekNumber}`}>
                        {week.tasks.map((task, taskIdx) => (
                          <Card
                            key={taskIdx}
                            className="p-4 border-border/60"
                            data-icod-id={`src_pages_seobacklinkstudio_tsx_435f_${week.weekNumber}_${taskIdx}`}>
                            <div
                              className="flex items-start justify-between gap-2 mb-1.5"
                              data-icod-id={`src_pages_seobacklinkstudio_tsx_b292_${week.weekNumber}_${taskIdx}`}>
                              <div
                                className="flex items-center gap-2"
                                data-icod-id={`src_pages_seobacklinkstudio_tsx_e40b_${week.weekNumber}_${taskIdx}`}>
                                <span
                                  className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary"
                                  data-icod-id={`src_pages_seobacklinkstudio_tsx_133f_${week.weekNumber}_${taskIdx}`}>
                                  {task.day}
                                </span>
                                <span
                                  className={cn(
                                    'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                                    taskCategoryColor(task.category),
                                  )}
                                  data-icod-id={`src_pages_seobacklinkstudio_tsx_2d0c_${week.weekNumber}_${taskIdx}`}>
                                  {task.category}
                                </span>
                              </div>
                            </div>
                            <p
                              className="text-sm text-foreground leading-relaxed"
                              data-icod-id={`src_pages_seobacklinkstudio_tsx_c323_${week.weekNumber}_${taskIdx}`}>
                              {task.description}
                            </p>
                          </Card>
                        ))}
                      </div>

                      {/* Milestones */}
                      {week.milestones.length > 0 && (
                        <div
                          className="ml-5 mt-3 pl-5"
                          data-icod-id={`src_pages_seobacklinkstudio_tsx_3200_${week.weekNumber}`}>
                          <p
                            className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5"
                            data-icod-id={`src_pages_seobacklinkstudio_tsx_c1be_${week.weekNumber}`}>
                            Week {week.weekNumber} Milestones
                          </p>
                          <div
                            className="space-y-1"
                            data-icod-id={`src_pages_seobacklinkstudio_tsx_58e9_${week.weekNumber}`}>
                            {week.milestones.map((milestone, mIdx) => (
                              <div
                                key={mIdx}
                                className="flex items-start gap-2 rounded-md bg-success/5 px-3 py-1.5"
                                data-icod-id={`src_pages_seobacklinkstudio_tsx_a0c3_${week.weekNumber}_${mIdx}`}>
                                <CheckCircle2
                                  className="h-3.5 w-3.5 text-success shrink-0 mt-0.5"
                                  data-icod-id={`src_pages_seobacklinkstudio_tsx_f93b_${week.weekNumber}_${mIdx}`} />
                                <span
                                  className="text-xs text-foreground"
                                  data-icod-id={`src_pages_seobacklinkstudio_tsx_7eee_${week.weekNumber}_${mIdx}`}>{milestone}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw output fallback when parsing fails but we got a response */}
            {!growthPlan && growthRawOutput && !growthLoading && (
              <Card className="p-6" data-icod-id="src_pages_seobacklinkstudio_tsx_47c8">
                <h4
                  className="font-semibold text-foreground mb-3"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_6110">Raw Output</h4>
                <pre
                  className="text-xs text-muted-foreground whitespace-pre-wrap overflow-x-auto"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_ff07">{growthRawOutput}</pre>
              </Card>
            )}
          </div>
        </div>
      </section>
      {/* ─── SEO Blog Article Writer Section ────────────────────────────────────── */}
      <section
        className="py-12 md:py-16 bg-muted/20"
        data-icod-id="src_pages_seobacklinkstudio_tsx_blog_section">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_seobacklinkstudio_tsx_blog_container">
          <div
            className="max-w-7xl mx-auto space-y-8"
            data-icod-id="src_pages_seobacklinkstudio_tsx_blog_inner">
            {/* Section Header */}
            <div
              className="text-center"
              data-icod-id="src_pages_seobacklinkstudio_tsx_blog_header">
              <div
                className="flex items-center justify-center gap-2 mb-3"
                data-icod-id="src_pages_seobacklinkstudio_tsx_blog_header_icon">
                <FileText
                  className="h-6 w-6 text-primary"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_blog_icon" />
                <h2
                  className="text-3xl md:text-4xl font-bold text-foreground font-heading"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_blog_title">
                  SEO Blog Article Writer
                </h2>
              </div>
              <p
                className="text-lg text-muted-foreground max-w-2xl mx-auto"
                data-icod-id="src_pages_seobacklinkstudio_tsx_blog_desc">
                Generate an AI-written SEO blog article with meta title, meta description, and a full article body with proper heading hierarchy and CTA. No live data or external API connections.
              </p>
            </div>

            {/* Form */}
            <Card
              className="p-6 md:p-8"
              data-icod-id="src_pages_seobacklinkstudio_tsx_blog_form_card">
              <div
                className="flex items-center gap-3 mb-6"
                data-icod-id="src_pages_seobacklinkstudio_tsx_blog_form_header">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_blog_form_icon_bg">
                  <FileText className="h-5 w-5" data-icod-id="src_pages_seobacklinkstudio_tsx_blog_form_icon" />
                </div>
                <div data-icod-id="src_pages_seobacklinkstudio_tsx_blog_form_text">
                  <h3
                    className="text-lg font-semibold text-foreground"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_blog_form_title">Generate SEO Blog Article</h3>
                  <p
                    className="text-sm text-muted-foreground"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_blog_form_subtitle">Enter your topic and keywords to get a full article</p>
                </div>
              </div>

              <div className="space-y-4" data-icod-id="src_pages_seobacklinkstudio_tsx_blog_form_fields">
                <div data-icod-id="src_pages_seobacklinkstudio_tsx_blog_topic_field">
                  <label
                    htmlFor="blogTopic"
                    className="block text-sm font-medium text-foreground mb-1.5"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_blog_topic_label">
                    Topic <span
                    className="text-destructive"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_blog_topic_req">*</span>
                  </label>
                  <Input
                    id="blogTopic"
                    type="text"
                    placeholder="e.g., Best Home Organization Tips"
                    value={blogTopic}
                    onChange={(e) => { setBlogTopic(e.target.value); if (blogError) setBlogError(null); }}
                    data-icod-id="src_pages_seobacklinkstudio_tsx_blog_topic_input" />
                </div>

                <div data-icod-id="src_pages_seobacklinkstudio_tsx_blog_kw_field">
                  <label
                    htmlFor="blogKeywords"
                    className="block text-sm font-medium text-foreground mb-1.5"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_blog_kw_label">
                    Keywords <span
                    className="text-destructive"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_blog_kw_req">*</span>
                  </label>
                  <Input
                    id="blogKeywords"
                    type="text"
                    placeholder="e.g., home organization, declutter, storage solutions"
                    value={blogKeywords}
                    onChange={(e) => { setBlogKeywords(e.target.value); if (blogError) setBlogError(null); }}
                    data-icod-id="src_pages_seobacklinkstudio_tsx_blog_kw_input" />
                  <p
                    className="text-xs text-muted-foreground mt-1"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_blog_kw_hint">Separate multiple keywords with commas</p>
                </div>

                <div data-icod-id="src_pages_seobacklinkstudio_tsx_blog_tone_field">
                  <label
                    htmlFor="blogTone"
                    className="block text-sm font-medium text-foreground mb-1.5"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_blog_tone_label">
                    Tone (optional)
                  </label>
                  <select
                    id="blogTone"
                    value={blogTone}
                    onChange={(e) => setBlogTone(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_blog_tone_select">
                    <option value="Professional" data-icod-id="src_pages_seobacklinkstudio_tsx_813d">Professional</option>
                    <option
                      value="Conversational"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_42e9">Conversational</option>
                    <option value="Informative" data-icod-id="src_pages_seobacklinkstudio_tsx_0a1d">Informative</option>
                  </select>
                </div>

                {blogError && (
                  <Alert variant="error" data-icod-id="src_pages_seobacklinkstudio_tsx_blog_error">{blogError}</Alert>
                )}

                <Button
                  onClick={handleBlogArticleGenerate}
                  loading={blogLoading}
                  disabled={blogLoading}
                  size="lg"
                  className="w-full"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_blog_generate_btn">
                  <Sparkles
                    className="mr-2 h-4 w-4"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_blog_generate_icon" />
                  {blogLoading ? 'Generating...' : 'Generate Blog Article'}
                </Button>
              </div>
            </Card>

            {/* Loading State */}
            {blogLoading && (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-icod-id="src_pages_seobacklinkstudio_tsx_blog_loading">
                <Spinner size="lg" data-icod-id="src_pages_seobacklinkstudio_tsx_blog_spinner" />
                <p
                  className="mt-4 text-sm text-muted-foreground"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_blog_loading_text">
                  Writing your SEO-optimized blog article...
                </p>
              </div>
            )}

            {/* Results */}
            {blogArticle && !blogLoading && (
              <div className="space-y-6" data-icod-id="src_pages_seobacklinkstudio_tsx_blog_results">
                {/* Honesty Disclaimer */}
                <div
                  className="rounded-lg border border-border/60 bg-muted/30 p-4"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_blog_disclaimer">
                  <div
                    className="flex items-start gap-3"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_blog_disclaimer_inner">
                    <Info
                      className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_blog_disclaimer_icon" />
                    <div data-icod-id="src_pages_seobacklinkstudio_tsx_blog_disclaimer_text">
                      <p
                        className="text-sm font-semibold text-foreground mb-1"
                        data-icod-id="src_pages_seobacklinkstudio_tsx_blog_disclaimer_title">AI-Generated SEO Article</p>
                      <p
                        className="text-xs text-muted-foreground leading-relaxed"
                        data-icod-id="src_pages_seobacklinkstudio_tsx_blog_disclaimer_body">
                        AI-generated SEO article based on your topic and keywords. No live data or external API connections.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary bar */}
                <div
                  className="flex flex-wrap items-center justify-between gap-4"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_blog_summary_bar">
                  <div data-icod-id="src_pages_seobacklinkstudio_tsx_blog_summary_text">
                    <h3
                      className="text-xl font-bold text-foreground"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_blog_summary_title">
                      Your SEO Blog Article
                    </h3>
                    <p
                      className="text-sm text-muted-foreground"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_blog_summary_meta">
                      Meta title &middot; Meta description &middot; Full article
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => downloadBlogArticleCSV(blogArticle)}
                    data-icod-id="src_pages_seobacklinkstudio_tsx_blog_csv_btn">
                    <Download
                      className="mr-2 h-4 w-4"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_blog_csv_icon" />
                    Download CSV
                  </Button>
                </div>

                {/* Meta Title */}
                <Card
                  className="p-5 border-border/60"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_blog_meta_title_card">
                  <div
                    className="flex items-start justify-between gap-3 mb-2"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_blog_meta_title_header">
                    <p
                      className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_blog_meta_title_label">Meta Title</p>
                    <div className="flex items-center gap-2" data-icod-id="src_pages_seobacklinkstudio_tsx_blog_meta_title_actions">
                      <span
                        className={cn(
                          'text-xs font-medium',
                          blogArticle.metaTitle.length >= 50 && blogArticle.metaTitle.length <= 60
                            ? 'text-success'
                            : 'text-warning',
                        )}
                        data-icod-id="src_pages_seobacklinkstudio_tsx_blog_meta_title_count">
                        {blogArticle.metaTitle.length} chars
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Copy meta title"
                        onClick={() => copyToClipboard(blogArticle.metaTitle, 'metaTitle')}
                        data-icod-id="src_pages_seobacklinkstudio_tsx_blog_meta_title_copy">
                        {copiedField === 'metaTitle' ? (
                          <CheckCircle2 className="h-4 w-4 text-success" data-icod-id="src_pages_seobacklinkstudio_tsx_blog_meta_title_copied" />
                        ) : (
                          <Copy className="h-4 w-4" data-icod-id="src_pages_seobacklinkstudio_tsx_blog_meta_title_copy_icon" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p
                    className="text-lg font-semibold text-foreground"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_blog_meta_title_value">
                    {blogArticle.metaTitle}
                  </p>
                </Card>

                {/* Meta Description */}
                <Card
                  className="p-5 border-border/60"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_blog_meta_desc_card">
                  <div
                    className="flex items-start justify-between gap-3 mb-2"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_blog_meta_desc_header">
                    <p
                      className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_blog_meta_desc_label">Meta Description</p>
                    <div className="flex items-center gap-2" data-icod-id="src_pages_seobacklinkstudio_tsx_blog_meta_desc_actions">
                      <span
                        className={cn(
                          'text-xs font-medium',
                          blogArticle.metaDescription.length >= 140 && blogArticle.metaDescription.length <= 160
                            ? 'text-success'
                            : 'text-warning',
                        )}
                        data-icod-id="src_pages_seobacklinkstudio_tsx_blog_meta_desc_count">
                        {blogArticle.metaDescription.length} chars
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Copy meta description"
                        onClick={() => copyToClipboard(blogArticle.metaDescription, 'metaDescription')}
                        data-icod-id="src_pages_seobacklinkstudio_tsx_blog_meta_desc_copy">
                        {copiedField === 'metaDescription' ? (
                          <CheckCircle2 className="h-4 w-4 text-success" data-icod-id="src_pages_seobacklinkstudio_tsx_blog_meta_desc_copied" />
                        ) : (
                          <Copy className="h-4 w-4" data-icod-id="src_pages_seobacklinkstudio_tsx_blog_meta_desc_copy_icon" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p
                    className="text-sm text-foreground leading-relaxed"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_blog_meta_desc_value">
                    {blogArticle.metaDescription}
                  </p>
                </Card>

                {/* Full Article Body */}
                <Card
                  className="p-6 md:p-8 border-border/60"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_blog_article_card">
                  <div
                    className="flex items-start justify-between gap-3 mb-4"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_blog_article_header">
                    <p
                      className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_blog_article_label">Full Article</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Copy full article"
                      onClick={() => copyToClipboard(blogArticle.articleBody, 'articleBody')}
                      data-icod-id="src_pages_seobacklinkstudio_tsx_blog_article_copy">
                      {copiedField === 'articleBody' ? (
                        <>
                          <CheckCircle2 className="mr-1.5 h-4 w-4 text-success" data-icod-id="src_pages_seobacklinkstudio_tsx_blog_article_copied" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1.5 h-4 w-4" data-icod-id="src_pages_seobacklinkstudio_tsx_blog_article_copy_icon" />
                          Copy Article
                        </>
                      )}
                    </Button>
                  </div>
                  <div
                    className="prose prose-sm max-w-none text-foreground"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_blog_article_body">
                    {blogArticle.articleBody.split('\n').map((line, lineIdx) => {
                      const trimmed = line.trim();
                      if (!trimmed) return <div key={lineIdx} className="h-3" data-icod-id={`src_pages_seobacklinkstudio_tsx_blog_line_${lineIdx}`} />;
                      if (trimmed.startsWith('### ')) {
                        return <h3 key={lineIdx} className="text-base font-semibold text-foreground mt-5 mb-2" data-icod-id={`src_pages_seobacklinkstudio_tsx_blog_h3_${lineIdx}`}>{trimmed.replace(/^### /, '')}</h3>;
                      }
                      if (trimmed.startsWith('## ')) {
                        return <h2 key={lineIdx} className="text-lg font-bold text-foreground mt-6 mb-3" data-icod-id={`src_pages_seobacklinkstudio_tsx_blog_h2_${lineIdx}`}>{trimmed.replace(/^## /, '')}</h2>;
                      }
                      if (trimmed.startsWith('# ')) {
                        return <h2 key={lineIdx} className="text-xl font-bold text-foreground mt-6 mb-3" data-icod-id={`src_pages_seobacklinkstudio_tsx_blog_h1_${lineIdx}`}>{trimmed.replace(/^# /, '')}</h2>;
                      }
                      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                        return <li key={lineIdx} className="text-sm text-foreground leading-relaxed ml-4 list-disc" data-icod-id={`src_pages_seobacklinkstudio_tsx_blog_li_${lineIdx}`}>{trimmed.replace(/^[-*] /, '')}</li>;
                      }
                      return <p key={lineIdx} className="text-sm text-foreground leading-relaxed mb-2" data-icod-id={`src_pages_seobacklinkstudio_tsx_blog_p_${lineIdx}`}>{trimmed}</p>;
                    })}
                  </div>
                </Card>
              </div>
            )}

            {/* Raw output fallback when parsing fails but we got a response */}
            {!blogArticle && blogRawOutput && !blogLoading && (
              <Card className="p-6" data-icod-id="src_pages_seobacklinkstudio_tsx_blog_raw_card">
                <h4
                  className="font-semibold text-foreground mb-3"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_blog_raw_title">Raw Output</h4>
                <pre
                  className="text-xs text-muted-foreground whitespace-pre-wrap overflow-x-auto"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_blog_raw_output">{blogRawOutput}</pre>
              </Card>
            )}
          </div>
        </div>
      </section>
      {/* ─── Competitor Snapshot Section ────────────────────────────────────── */}
      <section
        className="py-12 md:py-16 bg-background"
        data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_section">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_container">
          <div
            className="max-w-7xl mx-auto space-y-8"
            data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_inner">
            {/* Section Header */}
            <div
              className="text-center"
              data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_header">
              <div
                className="flex items-center justify-center gap-2 mb-3"
                data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_header_icon">
                <Search
                  className="h-6 w-6 text-primary"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_icon" />
                <h2
                  className="text-3xl md:text-4xl font-bold text-foreground font-heading"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_title">
                  Competitor Snapshot
                </h2>
              </div>
              <p
                className="text-lg text-muted-foreground max-w-2xl mx-auto"
                data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_desc">
                Get an AI-suggested competitive analysis comparing your site against competitors across key SEO dimensions. Qualitative assessments only — no fake metrics or live data.
              </p>
            </div>

            {/* Form */}
            <Card
              className="p-6 md:p-8"
              data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_form_card">
              <div
                className="flex items-center gap-3 mb-6"
                data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_form_header">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_form_icon_bg">
                  <Search className="h-5 w-5" data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_form_icon" />
                </div>
                <div data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_form_text">
                  <h3
                    className="text-lg font-semibold text-foreground"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_form_title">Generate Competitor Snapshot</h3>
                  <p
                    className="text-sm text-muted-foreground"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_form_subtitle">Enter your website and competitor URLs for comparison</p>
                </div>
              </div>

              <div className="space-y-4" data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_form_fields">
                <div data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_urls_field">
                  <label
                    htmlFor="snapshotUrls"
                    className="block text-sm font-medium text-foreground mb-1.5"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_urls_label">
                    Website URLs <span
                    className="text-destructive"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_urls_req">*</span>
                  </label>
                  <textarea
                    id="snapshotUrls"
                    rows={4}
                    placeholder={"https://your-site.com\nhttps://competitor1.com\nhttps://competitor2.com"}
                    value={snapshotUrls}
                    onChange={(e) => { setSnapshotUrls(e.target.value); if (snapshotError) setSnapshotError(null); }}
                    className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_urls_input" />
                  <p
                    className="text-xs text-muted-foreground mt-1"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_urls_hint">First URL = your website. Add 2-3 competitor URLs below it. One per line or comma-separated.</p>
                </div>

                {snapshotError && (
                  <Alert variant="error" data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_error">{snapshotError}</Alert>
                )}

                <Button
                  onClick={handleSnapshotGenerate}
                  loading={snapshotLoading}
                  disabled={snapshotLoading}
                  size="lg"
                  className="w-full"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_generate_btn">
                  <Sparkles
                    className="mr-2 h-4 w-4"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_generate_icon" />
                  {snapshotLoading ? 'Generating...' : 'Generate Snapshot'}
                </Button>
              </div>
            </Card>

            {/* Loading State */}
            {snapshotLoading && (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_loading">
                <Spinner size="lg" data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_spinner" />
                <p
                  className="mt-4 text-sm text-muted-foreground"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_loading_text">
                  Analyzing competitors and generating your snapshot...
                </p>
              </div>
            )}

            {/* Results */}
            {snapshotData && !snapshotLoading && (
              <div className="space-y-6" data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_results">
                {/* AI Honesty Disclaimer */}
                <div
                  className="rounded-lg border border-warning/30 bg-warning/5 p-4"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_disclaimer">
                  <div
                    className="flex items-start gap-3"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_disclaimer_inner">
                    <Info
                      className="h-5 w-5 text-warning shrink-0 mt-0.5"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_disclaimer_icon" />
                    <div data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_disclaimer_text">
                      <p
                        className="text-sm font-semibold text-foreground mb-1"
                        data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_disclaimer_title">AI-Generated Competitive Analysis</p>
                      <p
                        className="text-xs text-muted-foreground leading-relaxed"
                        data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_disclaimer_body">
                        This is an AI-generated competitive analysis based on your inputs and SEO best practices. It does not use live backlink data, domain authority scores, traffic numbers, or any external SEO tool API. All assessments are qualitative suggestions only.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary bar */}
                <div
                  className="flex flex-wrap items-center justify-between gap-4"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_summary_bar">
                  <div data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_summary_text">
                    <h3
                      className="text-xl font-bold text-foreground"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_summary_title">
                      Competitor Comparison
                    </h3>
                    <p
                      className="text-sm text-muted-foreground"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_summary_meta">
                      {snapshotData.comparison.length} dimensions &middot; {parsedSnapshotUrls.length} sites compared
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => downloadCompetitorSnapshotCSV(snapshotData, parsedSnapshotUrls)}
                    data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_csv_btn">
                    <Download
                      className="mr-2 h-4 w-4"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_csv_icon" />
                    Download CSV
                  </Button>
                </div>

                {/* Comparison Table */}
                <Card
                  className="border-border/60 overflow-hidden"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_table_card">
                  <div
                    className="overflow-x-auto"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_d986">
                    <table className="w-full text-left text-sm" data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_table">
                      <thead data-icod-id="src_pages_seobacklinkstudio_tsx_2734">
                        <tr
                          className="border-b border-border/60 bg-muted/30"
                          data-icod-id="src_pages_seobacklinkstudio_tsx_8edb">
                          <th
                            className="px-4 py-3 font-semibold text-foreground min-w-[160px]"
                            data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_th_dim">Dimension</th>
                          {parsedSnapshotUrls.map((url, urlIdx) => (
                            <th
                              key={urlIdx}
                              className="px-4 py-3 font-semibold text-foreground min-w-[200px]"
                              data-icod-id={`src_pages_seobacklinkstudio_tsx_snapshot_th_url_${urlIdx}`}>
                              <span
                                className="block truncate max-w-[220px]"
                                title={url}
                                data-icod-id={`src_pages_seobacklinkstudio_tsx_6acf_${urlIdx}`}>{url}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody data-icod-id="src_pages_seobacklinkstudio_tsx_8fdd">
                        {snapshotData.comparison.map((dim, dimIdx) => (
                          <tr
                            key={dimIdx}
                            className="border-b border-border/40 last:border-b-0"
                            data-icod-id={`src_pages_seobacklinkstudio_tsx_snapshot_tr_${dimIdx}`}>
                            <td
                              className="px-4 py-3 font-medium text-foreground align-top"
                              data-icod-id={`src_pages_seobacklinkstudio_tsx_snapshot_td_dim_${dimIdx}`}>
                              {dim.dimension}
                            </td>
                            {parsedSnapshotUrls.map((url, urlIdx) => {
                              const obs = dim.observations[url];
                              return (
                                <td
                                  key={urlIdx}
                                  className="px-4 py-3 align-top"
                                  data-icod-id={`src_pages_seobacklinkstudio_tsx_snapshot_td_obs_${dimIdx}_${urlIdx}`}>
                                  {obs ? (
                                    <div
                                      className="space-y-1.5"
                                      data-icod-id={`src_pages_seobacklinkstudio_tsx_0b70_${dimIdx}_${urlIdx}`}>
                                      <span
                                        className={cn(
                                          'inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                                          indicatorColor(obs.indicator),
                                        )}
                                        data-icod-id={`src_pages_seobacklinkstudio_tsx_snapshot_indicator_${dimIdx}_${urlIdx}`}>
                                        {obs.indicator}
                                      </span>
                                      <p
                                        className="text-xs text-muted-foreground leading-relaxed"
                                        data-icod-id={`src_pages_seobacklinkstudio_tsx_snapshot_text_${dimIdx}_${urlIdx}`}>
                                        {obs.text}
                                      </p>
                                    </div>
                                  ) : (
                                    <span
                                      className="text-xs text-muted-foreground italic"
                                      data-icod-id={`src_pages_seobacklinkstudio_tsx_c7b9_${dimIdx}_${urlIdx}`}>N/A</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Gaps & Opportunities */}
                <div className="space-y-4" data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_gaps">
                  <h3
                    className="text-lg font-bold text-foreground"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_gaps_title">
                    Gaps &amp; Opportunities
                  </h3>

                  <div
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_gaps_grid">
                    {/* Content Gaps */}
                    <Card
                      className="p-5 border-border/60"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_gap_content">
                      <div
                        className="flex items-center gap-2 mb-3"
                        data-icod-id="src_pages_seobacklinkstudio_tsx_8456">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10"
                          data-icod-id="src_pages_seobacklinkstudio_tsx_336c">
                          <Info
                            className="h-4 w-4 text-destructive"
                            data-icod-id="src_pages_seobacklinkstudio_tsx_1381" />
                        </div>
                        <h4
                          className="text-sm font-semibold text-foreground"
                          data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_gap_content_title">Your Content Gaps to Close</h4>
                      </div>
                      <ul className="space-y-2" data-icod-id="src_pages_seobacklinkstudio_tsx_cb9a">
                        {snapshotData.gaps.contentGaps.map((gap, gIdx) => (
                          <li
                            key={gIdx}
                            className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed"
                            data-icod-id={`src_pages_seobacklinkstudio_tsx_snapshot_gap_content_item_${gIdx}`}>
                            <span
                              className="text-destructive/60 font-mono text-[10px] mt-0.5 shrink-0"
                              data-icod-id={`src_pages_seobacklinkstudio_tsx_5692_${gIdx}`}>{gIdx + 1}.</span>
                            <span data-icod-id={`src_pages_seobacklinkstudio_tsx_f41a_${gIdx}`}>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    {/* Keyword Opportunities */}
                    <Card
                      className="p-5 border-border/60"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_gap_keywords">
                      <div
                        className="flex items-center gap-2 mb-3"
                        data-icod-id="src_pages_seobacklinkstudio_tsx_21fe">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"
                          data-icod-id="src_pages_seobacklinkstudio_tsx_bd75">
                          <Sparkles
                            className="h-4 w-4 text-primary"
                            data-icod-id="src_pages_seobacklinkstudio_tsx_a588" />
                        </div>
                        <h4
                          className="text-sm font-semibold text-foreground"
                          data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_gap_kw_title">Your Keyword Opportunities</h4>
                      </div>
                      <ul className="space-y-2" data-icod-id="src_pages_seobacklinkstudio_tsx_efbb">
                        {snapshotData.gaps.keywordOpportunities.map((kw, kIdx) => (
                          <li
                            key={kIdx}
                            className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed"
                            data-icod-id={`src_pages_seobacklinkstudio_tsx_snapshot_gap_kw_item_${kIdx}`}>
                            <span
                              className="text-primary/60 font-mono text-[10px] mt-0.5 shrink-0"
                              data-icod-id={`src_pages_seobacklinkstudio_tsx_49a6_${kIdx}`}>{kIdx + 1}.</span>
                            <span data-icod-id={`src_pages_seobacklinkstudio_tsx_b6c5_${kIdx}`}>{kw}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    {/* Differentiation Ideas */}
                    <Card
                      className="p-5 border-border/60"
                      data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_gap_diff">
                      <div
                        className="flex items-center gap-2 mb-3"
                        data-icod-id="src_pages_seobacklinkstudio_tsx_f82c">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10"
                          data-icod-id="src_pages_seobacklinkstudio_tsx_0709">
                          <CheckCircle2
                            className="h-4 w-4 text-success"
                            data-icod-id="src_pages_seobacklinkstudio_tsx_d61c" />
                        </div>
                        <h4
                          className="text-sm font-semibold text-foreground"
                          data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_gap_diff_title">Your Differentiation Ideas</h4>
                      </div>
                      <ul className="space-y-2" data-icod-id="src_pages_seobacklinkstudio_tsx_d847">
                        {snapshotData.gaps.differentiationIdeas.map((idea, iIdx) => (
                          <li
                            key={iIdx}
                            className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed"
                            data-icod-id={`src_pages_seobacklinkstudio_tsx_snapshot_gap_diff_item_${iIdx}`}>
                            <span
                              className="text-success/60 font-mono text-[10px] mt-0.5 shrink-0"
                              data-icod-id={`src_pages_seobacklinkstudio_tsx_3b5c_${iIdx}`}>{iIdx + 1}.</span>
                            <span data-icod-id={`src_pages_seobacklinkstudio_tsx_eba5_${iIdx}`}>{idea}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Raw output fallback when parsing fails but we got a response */}
            {!snapshotData && snapshotRawOutput && !snapshotLoading && (
              <Card className="p-6" data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_raw_card">
                <h4
                  className="font-semibold text-foreground mb-3"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_raw_title">Raw Output</h4>
                <pre
                  className="text-xs text-muted-foreground whitespace-pre-wrap overflow-x-auto"
                  data-icod-id="src_pages_seobacklinkstudio_tsx_snapshot_raw_output">{snapshotRawOutput}</pre>
              </Card>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
