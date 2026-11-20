import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import Badge from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { ArrowRight, Sparkles, Send, Lightbulb, Zap, Play, MessageCircle, Infinity as InfinityIcon } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import { contentTemplates } from '@/data/contentHooks';
import { week2Reels } from '@/data/week2Reels';
import { buildSeriesEpisodes } from '@/data/buildSeries';
import HeroSlider from '@/components/HeroSlider';

const WHATSAPP_DIRECT_CHAT = 'https://wa.me/923358380233';

const SUGGESTIONS = [
  { text: 'I want to start a Shopify store', route: '/ai-tools' },
  { text: 'I want to sell on eBay', route: '/ai-tools' },
  { text: 'I want to create digital products', route: '/ai-tools' },
  { text: 'I have a product idea', route: '/book-consultation' },
];

interface HomepageHeroProps {
  className?: string;
}

export default function HomepageHero({ className }: HomepageHeroProps) {
  const [idea, setIdea] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [currentHookIndex, setCurrentHookIndex] = useState(0);
  const navigate = useNavigate();
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true });

  // Flatten all hooks from all tools for rotation, including Week 2 reel hooks and Build Series hooks
  const contentHooks = contentTemplates.flatMap((template) =>
    template.hooks.map((hook) => ({ hook, tool: template.tool, toolSlug: template.toolSlug }))
  );
  const week2Hooks = week2Reels.map((reel) => ({
    hook: reel.hook,
    tool: reel.toolName,
    toolSlug: reel.toolSlug
  }));
  const buildSeriesHooks = buildSeriesEpisodes.map((ep) => ({
    hook: ep.hook,
    tool: `Build Series Ep. ${ep.episode}`,
    toolSlug: 'content-templates'
  }));
  const allHooks = [...contentHooks, ...week2Hooks, ...buildSeriesHooks];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHookIndex((prev) => (prev + 1) % allHooks.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [allHooks.length]);

  const currentHook = allHooks[currentHookIndex];

  const handleSubmit = () => {
    if (idea.trim()) {
      navigate('/ai-tools');
    }
  };

  const handleSuggestionClick = (suggestion: typeof SUGGESTIONS[number]) => {
    setIdea(suggestion.text);
    navigate(suggestion.route);
  };

  return (
    <section
      className={cn('relative overflow-hidden pt-2 pb-24 md:pb-32', className)}
      style={{ background: 'var(--gradient-hero)' }}
      data-icod-id="src_components_homepage_homepagehero_tsx_3701">
      {/* Ambient background orbs with vibrant purple/teal tones — layered mesh effect */}
      <div
        className="pointer-events-none absolute -top-72 -right-72 h-[900px] w-[900px] rounded-full opacity-[0.18] blur-[140px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--primary)) 0%, transparent 70%)' }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_homepagehero_tsx_b13f" />
      <div
        className="pointer-events-none absolute -bottom-80 -left-80 h-[800px] w-[800px] rounded-full opacity-[0.14] blur-[140px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)' }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_homepagehero_tsx_55e8" />
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full opacity-[0.1] blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--color-pink)) 0%, transparent 70%)' }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_homepagehero_tsx_accent_orb" />
      {/* Mesh gradient overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none opacity-35"
        style={{ 
          backgroundImage: `radial-gradient(at 0% 0%, rgba(157, 106, 255, 0.12) 0px, transparent 50%),
                           radial-gradient(at 100% 0%, rgba(0, 212, 245, 0.08) 0px, transparent 50%),
                           radial-gradient(at 50% 100%, rgba(255, 110, 180, 0.06) 0px, transparent 50%)`
        }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_homepagehero_tsx_mesh_overlay" />
      {/* Subtle top gradient wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgb(var(--primary) / 0.08) 0%, rgb(var(--background) / 0) 50%)' }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_homepagehero_tsx_32d6" />
      {/* Full-width hero slider — edge-to-edge, auto-rotating */}
      <div
        className="relative z-10 w-full"
        data-icod-id="src_components_homepage_homepagehero_tsx_banner_wrap">
        <HeroSlider
          slides={[
            {
              src: 'https://drive.google.com/thumbnail?id=1JyOiHzGnglHR5woY1qwApIHM3PA6BxYa&sz=w1920',
              alt: 'MG Blessed Beginnings — AI-Powered Business Toolkit slide 1',
            },
            {
              src: 'https://drive.google.com/thumbnail?id=1Fq4RS9zm_GebBCoo5s1VA7w8GIladxi3&sz=w1920',
              alt: 'MG Blessed Beginnings — AI-Powered Business Toolkit slide 2',
            },
            {
              src: 'https://drive.google.com/thumbnail?id=1SCMEW_o7-1RvTtbVW8f8b4tYk5aMN-3n&sz=w1920',
              alt: 'MG Blessed Beginnings — AI-Powered Business Toolkit slide 3',
            },
          ]}
          intervalMs={3000}
          data-icod-id="src_components_homepage_homepagehero_tsx_hero_slider"
        />
      </div>
      {/* Two CTA buttons directly below the slider */}
      <div
        className="relative z-10 w-full py-6"
        data-icod-id="src_components_homepage_homepagehero_tsx_slider_ctas_wrap">
        <div
          className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-5 animate-fade-up"
          data-icod-id="src_components_homepage_homepagehero_tsx_slider_ctas_inner">
          <Link
            to="/ai-tools"
            data-icod-id="src_components_homepage_homepagehero_tsx_explore_ai_link">
            <Button
              variant="premium"
              size="lg"
              className="shadow-[0_8px_28px_rgba(157,106,255,0.6)] hover:shadow-[0_12px_40px_rgba(157,106,255,0.8),0_0_48px_rgba(0,212,245,0.4)] min-w-[220px]"
              data-icod-id="src_components_homepage_homepagehero_tsx_explore_ai_btn">
              Explore AI Tools
              <ArrowRight
                className="h-5 w-5 ml-1.5"
                data-icod-id="src_components_homepage_homepagehero_tsx_76a3" />
            </Button>
          </Link>
          <Link
            to="/courses"
            data-icod-id="src_components_homepage_homepagehero_tsx_join_learning_link">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-primary/50 text-foreground hover:bg-primary/15 hover:border-primary/70 min-w-[200px] font-bold"
              data-icod-id="src_components_homepage_homepagehero_tsx_join_learning_btn">
              Join Learning Hub
            </Button>
          </Link>
        </div>
      </div>
      {/* Free Forever Promise — below banner, above CTAs */}
      <div
        className="w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        data-icod-id="src_components_homepage_homepagehero_tsx_free_promise_wrap">
        <div
          className="max-w-7xl mx-auto text-center animate-fade-up"
          style={{ animationDelay: '200ms' }}
          data-icod-id="src_components_homepage_homepagehero_tsx_free_promise_inner">
          <Badge variant="free" className="text-base md:text-lg px-5 py-2 mb-4 inline-flex items-center gap-2 shadow-[0_4px_16px_rgba(0,212,245,0.5)]" data-icod-id="src_components_homepage_homepagehero_tsx_free_badge">
            <InfinityIcon className="h-4 w-4" data-icod-id="src_components_homepage_homepagehero_tsx_infinity_icon" />
            100% Free Forever
          </Badge>
          <p
            className="text-lg md:text-xl font-bold text-foreground tracking-wide"
            data-icod-id="src_components_homepage_homepagehero_tsx_free_subheadline">
            Unlimited Use. No Sign-Up. No Credit Card.
          </p>
        </div>
      </div>
      {/* Centered content below banner */}
      <div
        className="w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        data-icod-id="src_components_homepage_homepagehero_tsx_85f6">
        <div
          ref={ref}
          className={`max-w-7xl mx-auto transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          data-icod-id="src_components_homepage_homepagehero_tsx_6a72">

          {/* Clickable CTAs — real buttons since the button in the banner is a graphic */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-8 animate-fade-up"
            style={{ animationDelay: '300ms' }}
            data-icod-id="src_components_homepage_homepagehero_tsx_8a33">
            <Link
              to="/ai-tools"
              data-icod-id="src_components_homepage_homepagehero_tsx_628f">
              <Button
                variant="premium"
                size="lg"
                className="shadow-[0_8px_28px_rgba(157,106,255,0.6)] hover:shadow-[0_12px_40px_rgba(157,106,255,0.8),0_0_48px_rgba(0,212,245,0.4)] min-w-[220px]"
                data-icod-id="src_components_homepage_homepagehero_tsx_eddf">
                <Zap
                  className="h-5 w-5 mr-1.5"
                  data-icod-id="src_components_homepage_homepagehero_tsx_7b7b" />
                Start Creating Content
                <ArrowRight
                  className="h-5 w-5 ml-1.5"
                  data-icod-id="src_components_homepage_homepagehero_tsx_04c5" />
              </Button>
            </Link>
            <Link
              to="/ai-tools"
              data-icod-id="src_components_homepage_homepagehero_tsx_f4ba">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-primary/50 text-foreground hover:bg-primary/15 hover:border-primary/70 min-w-[200px] font-bold"
                data-icod-id="src_components_homepage_homepagehero_tsx_46c2">
                Explore AI Tools
              </Button>
            </Link>
          </div>

          {/* Rotating Hook Examples */}
          <div
            className="max-w-4xl mx-auto mb-12 animate-fade-up"
            style={{ animationDelay: '420ms' }}
            data-icod-id="src_components_homepage_homepagehero_tsx_rotating_hooks">
            <Card
              glass
              hoverLift={false}
              className="p-6 border-border/70 text-center relative overflow-hidden shadow-[0_6px_28px_rgba(0,0,0,0.4)]"
              data-icod-id="src_components_homepage_homepagehero_tsx_hook_card">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary opacity-90" data-icod-id="src_components_homepage_homepagehero_tsx_hook_accent" />
              <p className="text-sm font-bold text-primary uppercase tracking-widest mb-3" data-icod-id="src_components_homepage_homepagehero_tsx_hook_label">
                Content Hook of the Moment
              </p>
              <p
                key={currentHookIndex}
                className="text-xl md:text-2xl font-bold text-foreground mb-4 animate-fade-in min-h-[4rem] flex items-center justify-center"
                data-icod-id="src_components_homepage_homepagehero_tsx_hook_text">
                "{currentHook.hook}"
              </p>
              <div className="flex items-center justify-center gap-4" data-icod-id="src_components_homepage_homepagehero_tsx_hook_actions">
                <span className="text-sm text-muted-foreground px-3 py-1.5 rounded-lg bg-secondary font-semibold" data-icod-id="src_components_homepage_homepagehero_tsx_hook_tool">
                  {currentHook.tool}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const element = document.getElementById('how-it-works');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="text-sm text-primary hover:underline flex items-center gap-1.5 font-bold cursor-pointer bg-transparent border-none p-0"
                  data-icod-id={`src_components_homepage_homepagehero_tsx_hook_demo_link_${currentHook.toolSlug}`}>
                  <Play className="h-4 w-4" data-icod-id="src_components_homepage_homepagehero_tsx_play_icon" />
                  Watch how it works
                </button>
              </div>
            </Card>
          </div>

          {/* Interactive Business Idea Box with enhanced glassmorphism */}
          <div
            className="max-w-4xl mx-auto animate-fade-up"
            style={{ animationDelay: '460ms' }}
            data-icod-id="src_components_homepage_homepagehero_tsx_8113">
            <Card
              glass
              hoverLift={false}
              className={cn(
                'p-6 md:p-8 text-left transition-all duration-500 border-border/60 shadow-[0_4px_24px_rgba(0,0,0,0.3)]',
                isFocused && 'ring-2 ring-primary/40 shadow-[0_12px_48px_rgba(157,106,255,0.3)] scale-[1.01]'
              )}
              data-icod-id="src_components_homepage_homepagehero_tsx_6b6e">
              <label
                htmlFor="business-idea-input"
                className="block mb-4"
                data-icod-id="src_components_homepage_homepagehero_tsx_61e0">
                <span
                  className="flex items-center gap-2.5 text-lg font-bold text-foreground font-heading"
                  data-icod-id="src_components_homepage_homepagehero_tsx_96af">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-warning to-gold"
                    data-icod-id="src_components_homepage_homepagehero_tsx_7642">
                    <Lightbulb
                      className="h-4.5 w-4.5 text-background"
                      data-icod-id="src_components_homepage_homepagehero_tsx_f761" />
                  </div>
                  What do you want to build?
                </span>
              </label>

              <div
                className="relative group"
                data-icod-id="src_components_homepage_homepagehero_tsx_8ff4">
                <input
                  id="business-idea-input"
                  type="text"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Tell MG what you're planning..."
                  className="w-full rounded-xl border border-border bg-surface-elevated/90 px-5 py-4 pr-14 text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  data-icod-id="src_components_homepage_homepagehero_tsx_c066" />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground hover:shadow-[0_4px_16px_rgba(157,106,255,0.5)] transition-all duration-300 hover:scale-105 active:scale-95"
                  aria-label="Submit idea"
                  onClick={handleSubmit}
                  data-icod-id="src_components_homepage_homepagehero_tsx_e2b1">
                  <Send
                    className="h-4.5 w-4.5"
                    data-icod-id="src_components_homepage_homepagehero_tsx_ce28" />
                </button>
              </div>

              {/* Enhanced suggestion chips */}
              <div
                className="mt-5 flex flex-wrap gap-3"
                data-icod-id="src_components_homepage_homepagehero_tsx_02ae">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion.text}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="rounded-full border border-border bg-surface-elevated/90 px-5 py-2.5 text-sm font-bold text-muted-foreground hover:border-primary/60 hover:bg-primary/20 hover:text-primary-hover hover:shadow-[0_4px_16px_rgba(157,106,255,0.3)] transition-all duration-300 hover:-translate-y-0.5"
                    data-icod-id={`src_components_homepage_homepagehero_tsx_56d4_${suggestion.text}`}>
                    {suggestion.text}
                  </button>
                ))}
              </div>

              {/* Visual AI assistant hint with premium styling */}
              <div
                className="mt-6 flex items-center gap-4 rounded-xl bg-surface-elevated/80 backdrop-blur-md px-6 py-5 border border-border/60"
                data-icod-id="src_components_homepage_homepagehero_tsx_fd5c">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-[0_6px_20px_rgba(157,106,255,0.5)]"
                  data-icod-id="src_components_homepage_homepagehero_tsx_d9d4">
                  <Sparkles
                    className="h-6 w-6 text-primary-foreground"
                    data-icod-id="src_components_homepage_homepagehero_tsx_7bb1" />
                </div>
                <p
                  className="text-base text-muted-foreground leading-relaxed font-medium"
                  data-icod-id="src_components_homepage_homepagehero_tsx_f9ac">
                  <span
                    className="font-bold text-primary-hover"
                    data-icod-id="src_components_homepage_homepagehero_tsx_97ad">MG AI Assistant</span>{' '}
                  can help you generate SEO titles, product descriptions, hashtags, and marketing content — try our free AI tools today.
                </p>
              </div>
            </Card>
          </div>

          {/* WhatsApp Share CTA Card */}
          <div
            className="max-w-4xl mx-auto mt-8 animate-fade-up"
            style={{ animationDelay: '500ms' }}
            data-icod-id="src_components_homepage_homepagehero_tsx_whatsapp_cta_wrap">
            <Card
              className="relative overflow-hidden border-[#25D366]/40 bg-card/95 p-7 md:p-9"
              data-icod-id="src_components_homepage_homepagehero_tsx_whatsapp_cta_card">
              {/* Green accent bar at top */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5 bg-[#25D366]"
                data-icod-id="src_components_homepage_homepagehero_tsx_whatsapp_accent_bar" />
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left" data-icod-id="src_components_homepage_homepagehero_tsx_whatsapp_cta_content">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#25D366]/20 shadow-[0_6px_20px_rgba(37,211,102,0.3)]"
                  data-icod-id="src_components_homepage_homepagehero_tsx_whatsapp_icon_bg">
                  <MessageCircle
                    className="h-8 w-8 text-[#25D366]"
                    data-icod-id="src_components_homepage_homepagehero_tsx_whatsapp_icon" />
                </div>
                <div className="flex-1" data-icod-id="src_components_homepage_homepagehero_tsx_whatsapp_text_wrap">
                  <h3
                    className="text-xl font-bold text-foreground mb-2"
                    data-icod-id="src_components_homepage_homepagehero_tsx_whatsapp_title">
                    Know someone who needs free AI tools?
                  </h3>
                  <p
                    className="text-base text-muted-foreground font-medium"
                    data-icod-id="src_components_homepage_homepagehero_tsx_whatsapp_desc">
                    Share on WhatsApp 🎁 — help fellow entrepreneurs discover these tools
                  </p>
                </div>
                <a
                  href={WHATSAPP_DIRECT_CHAT}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-icod-id="src_components_homepage_homepagehero_tsx_whatsapp_btn_link">
                  <Button
                    className="gap-2 bg-[#25D366] text-white hover:bg-[#20BD5A] border-none shadow-[0_6px_20px_rgba(37,211,102,0.5)] hover:shadow-[0_8px_32px_rgba(37,211,102,0.6)] min-w-[200px] font-bold"
                    size="lg"
                    data-icod-id="src_components_homepage_homepagehero_tsx_whatsapp_btn">
                    <MessageCircle
                      className="h-5 w-5"
                      data-icod-id="src_components_homepage_homepagehero_tsx_whatsapp_btn_icon" />
                    Share on WhatsApp
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
