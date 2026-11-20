import { Link } from 'react-router-dom';
import { Card, Button, Spinner, Badge, Skeleton } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { AITool } from '@/types';
import { ArrowRight, Sparkles, FileText, Search, Hash, Calculator, Users, MessageSquare, BarChart3, Image as ImageIcon, BookOpen, Store, Palette, Zap, TrendingUp, Activity, Megaphone, Link2, Infinity as InfinityIcon } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import { FORCE_COMING_SOON_SLUGS, getEffectiveStatus } from '@/utils/toolStatusOverrides';

interface AIBusinessToolkitProps {
  tools: AITool[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  className?: string;
}

const TOOL_ICONS: Record<string, React.ElementType> = {
  'product-description-generator': FileText,
  'seo-title-optimizer': Search,
  'hashtag-generator': Hash,
  'profit-calculator': Calculator,
  'competitor-analyzer': Users,
  'review-response-writer': MessageSquare,
  'listing-optimizer': BarChart3,
  'social-media-studio': ImageIcon,
  'product-research-assistant': Search,
  'prompt-library': BookOpen,
  'store-audit': Store,
  'branding-assistant': Palette,
  'seo-backlink-studio': Link2,
  'free-ai-tokens-hub': InfinityIcon,
};

/** Static thumbnail images keyed by exact tool name for homepage cards. */
const TOOL_IMAGES: Record<string, string> = {
  'AI Video Generator': 'https://drive.google.com/thumbnail?id=1YpGlb_nugUp_3-GYkIWyybOuqwYISouq&sz=w1920',
  'Brand Campaign Studio': 'https://drive.google.com/thumbnail?id=1E8VwZBlfz2tqd_bm2p3O8DY7uhJ3w_7Y&sz=w1920',
  'Branding Assistant': 'https://drive.google.com/thumbnail?id=171KO7Pn5YaU4pcuGwg5vyvSYBeNbIlkp&sz=w1920',
  'Competitor Analyzer': 'https://drive.google.com/thumbnail?id=13WQbzyj9Ak2GWYo1khgEbC4DnKXIjwJH&sz=w1920',
  'Hashtag Generator': 'https://drive.google.com/thumbnail?id=1P6W8B1M3bEt2LigfVrikZ-CDsxGmmscu&sz=w1920',
  'Keyword Research Tool': 'https://drive.google.com/thumbnail?id=1Mev8FX2cDFOEqLqdZWwHCByMh1k1Q-Mc&sz=w1920',
  'Listing Health Score': 'https://drive.google.com/thumbnail?id=1veq-WanQstJU0P39P4f1kdDm2lxIv-38&sz=w1920',
  'Listing Optimizer': 'https://drive.google.com/thumbnail?id=1XP4sOhfZkVaa4zRV0JjqVU2_Ktcz7pmz&sz=w1920',
  'Product Description Generator': 'https://drive.google.com/thumbnail?id=1DHnaw_YJmaeC_a86sb_ohySPA_T4b6Lb&sz=w1920',
  'Profit Calculator': 'https://drive.google.com/thumbnail?id=1daUTE2rgq9C7lJMJLtsaEDCXyOD_ruxw&sz=w1920',
  'Prompt Library': 'https://drive.google.com/thumbnail?id=1oixTHNGN2srEKnnvljWkCC7nZ1bbUIUL&sz=w1920',
  'Review Response Writer': 'https://drive.google.com/thumbnail?id=1w4zj4NCna0kLhMl13uhwEm3uXwgDOm5d&sz=w1920',
  'SEO & Backlink Studio': 'https://drive.google.com/thumbnail?id=1WZs2lWSeoQ8O4C4mwkGDSjHkPrzOPu-R&sz=w1920',
  'SEO Title Optimizer': 'https://drive.google.com/thumbnail?id=1ceEltnnVCMfWWQJ8wzK2U0sDNQuSHHeM&sz=w1920',
  'Social Media Studio': 'https://drive.google.com/thumbnail?id=1b7ty8OcuLoM8iqJSSWg1kPjtjN9Vnb1V&sz=w1920',
  'WhatsApp Business Generator': 'https://drive.google.com/thumbnail?id=148g0RO9938gD__bxYf97cBrrPNcU3ucs&sz=w1920',
};

const TOOL_COLORS = [
  { bg: 'rgb(var(--primary))', light: 'rgb(var(--surface))' },
  { bg: 'rgb(var(--primary-hover))', light: 'rgb(var(--surface-elevated))' },
  { bg: 'rgb(var(--accent))', light: 'rgb(var(--surface-elevated))' },
  { bg: 'rgb(var(--warning))', light: 'rgb(var(--surface-elevated))' },
];

export default function AIBusinessToolkit({ tools, status, className }: AIBusinessToolkitProps) {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true });

  // Show only live tools OR force-coming-soon tools, deduplicating by canonical slug and name.
  // A previous seed may have created a 'price-calculator' entry alongside
  // the canonical 'profit-calculator'. Keep only the canonical one.
  const STALE_DUPLICATE_SLUGS = new Set(['price-calculator']);
  const seenNames = new Set<string>();
  
  // Include tools that are either live or in the force-coming-soon list
  const displayTools = tools.filter((t) => {
    // Skip stale duplicates
    if (STALE_DUPLICATE_SLUGS.has(t.slug)) return false;
    
    // Get effective status using shared override logic
    const effectiveStatus = getEffectiveStatus(t.slug, t.status);
    
    // Include if effectively live OR if it's in the force-coming-soon list
    const isLive = effectiveStatus === 'live';
    const isForceComingSoon = (FORCE_COMING_SOON_SLUGS as readonly string[]).includes(t.slug);
    
    if (!isLive && !isForceComingSoon) return false;
    
    // Deduplicate by name
    const key = t.name.toLowerCase();
    if (seenNames.has(key)) return false;
    seenNames.add(key);
    return true;
  });

  return (
    <section
      className={cn('py-20 md:py-28 bg-background relative overflow-hidden', className)}
      data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_6907">
      {/* Subtle background accent */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.03] blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--primary)) 0%, transparent 70%)' }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_1af6" />
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_5e78">
        {/* Section header */}
        <div
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 gap-6"
          data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_9810">
          <div data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_6909">
            <div
              className="inline-flex items-center gap-2 text-primary mb-4"
              data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_ede0">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent"
                data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_7d02">
                <Sparkles
                  className="h-4 w-4 text-primary-foreground"
                  data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_843c" />
              </div>
              <span
                className="font-bold text-sm tracking-wide uppercase"
                data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_447b">AI Business Toolkit</span>
            </div>
            <h2
              className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 font-heading tracking-tight"
              data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_578f">
              Your AI-Powered{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--accent)) 100%)' }}
                data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_d6ed">
                Business Toolkit
              </span>
            </h2>
            <p
              className="text-lg text-muted-foreground"
              data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_54af">
              Free AI tools for content, marketing, SEO, eCommerce & online business.
            </p>
          </div>
          <Link
            to="/ai-tools"
            className="shrink-0 group"
            data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_fc2d">
            <span
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm hover:shadow-[0_4px_16px_rgba(var(--primary),0.25)]"
              data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_f8a9">
              View All Tools 
              <ArrowRight
                className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300"
                data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_d3c3" />
            </span>
          </Link>
        </div>

        {/* Tool cards grid */}
        <div
          ref={ref}
          className={`transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_896c">
          {status === 'loading' ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_skeleton_grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-[20px] border border-border bg-card p-6 space-y-4"
                  data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_skel_${i}`}>
                  <div className="flex items-center justify-between" data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_skel_header_${i}`}>
                    <Skeleton variant="circle" className="h-12 w-12" data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_skel_icon_${i}`} />
                    <Skeleton variant="rect" className="h-5 w-12 rounded-full" data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_skel_badge_${i}`} />
                  </div>
                  <Skeleton variant="text" className="h-5 w-4/5" data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_skel_title_${i}`} />
                  <Skeleton variant="text" className="h-4 w-full" data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_skel_desc1_${i}`} />
                  <Skeleton variant="text" className="h-4 w-3/4" data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_skel_desc2_${i}`} />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_ae00">
              {displayTools.map((tool, index) => {
                const colorSet = TOOL_COLORS[index % TOOL_COLORS.length];
                
                // Use shared override logic for consistent status display
                const effectiveStatus = getEffectiveStatus(tool.slug, tool.status);
                const isEffectivelyLive = effectiveStatus === 'live';
                const isComingSoon = effectiveStatus === 'coming_soon';

                // Resolve image from name-keyed map
                const imageUrl = TOOL_IMAGES[tool.name];
                
                return (
                  <Card
                    key={tool._id}
                    gradientBorder
                    className="flex flex-col gap-0 group relative overflow-hidden"
                    data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_ffe1_${tool._id}`}>
                    {/* Full-width thumbnail image */}
                    {imageUrl && (
                      <div
                        className="w-full shrink-0 overflow-hidden"
                        style={{ height: '140px', borderRadius: '22px 22px 0 0' }}
                        data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_img_wrap_${tool._id}`}>
                        <img
                          src={imageUrl}
                          alt={tool.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_img_${tool._id}`} />
                      </div>
                    )}
                    {/* Gradient accent on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: `linear-gradient(135deg, ${colorSet.bg}05 0%, transparent 50%)` }}
                      data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_3e16_${tool._id}`} />
                    {/* Content area */}
                    <div className="flex flex-col flex-1 p-6 gap-4" data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_content_${tool._id}`}>
                      {/* Status badge */}
                      <div
                        className="flex items-center justify-between"
                        data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_a2e0_${tool._id}`}>
                        {isEffectivelyLive && (
                          <Badge
                            variant="free"
                            className="text-[10px] px-2 py-0.5"
                            data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_c378_${tool._id}`}>
                            LIVE
                          </Badge>
                        )}
                        {isComingSoon && (
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border bg-muted/50 text-muted-foreground border-border"
                            data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_cs_badge_${tool._id}`}>
                            COMING SOON
                          </span>
                        )}
                      </div>
                      {/* Name & category */}
                      <div
                        data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_9859_${tool._id}`}>
                        <h3
                          className="text-base font-bold text-foreground font-heading leading-snug mb-1.5 group-hover:text-primary transition-colors duration-300"
                          data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_7b98_${tool._id}`}>
                          {tool.name}
                        </h3>
                        <span
                          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80"
                          data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_2893_${tool._id}`}>
                          {tool.category}
                        </span>
                      </div>
                      {/* Description */}
                      <p
                        className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-2"
                        data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_a8b0_${tool._id}`}>
                        {tool.description}
                      </p>
                      {/* CTA with enhanced styling */}
                      {isEffectivelyLive ? (
                        <Link
                          to={tool.toolUrl || `/tools/${tool.slug}`}
                          className="mt-auto pt-4"
                          data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_b379_${tool._id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-border text-primary hover:bg-secondary hover:border-primary/30 group/btn"
                            data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_44e0_${tool._id}`}>
                            <Zap
                              className="h-3.5 w-3.5 mr-1"
                              data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_94d8_${tool._id}`} />
                            Try Tool
                            <ArrowRight
                              className="h-3.5 w-3.5 ml-1 group-hover/btn:translate-x-0.5 transition-transform duration-300"
                              data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_9254_${tool._id}`} />
                          </Button>
                        </Link>
                      ) : (
                        <div className="mt-auto pt-4" data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_cs_cta_${tool._id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-border text-muted-foreground cursor-not-allowed opacity-60"
                            disabled
                            data-icod-id={`src_components_homepage_aibusinesstoolkit_tsx_cs_btn_${tool._id}`}>
                            Coming Soon
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Social Proof Section */}
        <div className="mt-16 pt-12 border-t border-border/30" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_social_proof">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_stats_grid">
            <div className="p-6 rounded-xl bg-secondary/50 border border-border/30" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_stat_1">
              <div className="flex items-center justify-center gap-2 mb-2" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_stat_1_header">
                <Sparkles className="h-5 w-5 text-primary" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_stat_1_icon" />
                <span className="text-xl font-bold text-foreground" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_stat_1_number">100%</span>
              </div>
              <p className="text-sm text-muted-foreground" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_stat_1_label">Free Forever</p>
            </div>

            <div className="p-6 rounded-xl bg-secondary/50 border border-border/30" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_stat_2">
              <div className="flex items-center justify-center gap-2 mb-2" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_stat_2_header">
                <Zap className="h-5 w-5 text-accent" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_stat_2_icon" />
                <span className="text-xl font-bold text-foreground" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_stat_2_number">No Sign-Up</span>
              </div>
              <p className="text-sm text-muted-foreground" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_stat_2_label">Required</p>
            </div>

            <div className="p-6 rounded-xl bg-secondary/50 border border-border/30" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_stat_3">
              <div className="flex items-center justify-center gap-2 mb-2" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_stat_3_header">
                <Activity className="h-5 w-5 text-primary" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_stat_3_icon" />
                <span className="text-xl font-bold text-foreground" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_stat_3_number">15</span>
              </div>
              <p className="text-sm text-muted-foreground" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_stat_3_label">Free AI Tools</p>
            </div>

            <div className="p-6 rounded-xl bg-secondary/50 border border-border/30" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_stat_4">
              <div className="flex items-center justify-center gap-2 mb-2" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_stat_4_header">
                <Store className="h-5 w-5 text-warning" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_stat_4_icon" />
                <span className="text-xl font-bold text-foreground" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_stat_4_number">Built for</span>
              </div>
              <p className="text-sm text-muted-foreground" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_stat_4_label">Online Sellers</p>
            </div>
          </div>

          {/* Join CTA */}
          <div className="mt-8 text-center" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_join_cta">
            <p className="text-muted-foreground mb-4" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_join_text">
              Start using these free AI tools for your online business
            </p>
            <Link to="/content-templates" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_templates_link">
              <Button variant="outline" size="sm" className="gap-2" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_templates_btn">
                <TrendingUp className="h-4 w-4" data-icod-id="src_components_homepage_aibusinesstoolkit_tsx_trending_icon" />
                Get Content Templates
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
