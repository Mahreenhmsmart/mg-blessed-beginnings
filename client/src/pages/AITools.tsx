import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAITools, fetchAIToolCategories } from '@/store/slices/aiToolsSlice';
import { Spinner, Button, EmptyState, Skeleton, Input } from '@/components/ui';
import Badge from '@/components/ui/Badge';
import SEOHead from '@/components/SEOHead';
import AIToolCard from '@/components/AIToolCard';
import FAQAccordion from '@/components/FAQAccordion';
import AdSenseSlot from '@/components/AdSenseSlot';
import { AlertCircle, SearchX, RefreshCw, Infinity as InfinityIcon, Search } from 'lucide-react';
import type { FAQItem } from '@/components/FAQAccordion';
import { SchemaInjector, PAGE_META } from '@/seo';

const aiToolsMeta = PAGE_META['/ai-tools'];

/** Canonical category order for the filter bar. */
const CANONICAL_CATEGORIES = [
  'Analytics',
  'Content',
  'SEO',
  'Social Media',
  'Marketing',
  'Customer Service',
  'Media',
  'Research',
  'E-commerce',
  'Branding',
] as const;

const AI_TOOLS_FAQ_ITEMS: FAQItem[] = [
  {
    question: 'Are the AI tools on MG Blessed Beginnings really free?',
    answer: 'Yes, our core AI tools are completely free to use. They include product description generators, hashtag generators, SEO title optimizers, competitor analyzers, and more.',
  },
  {
    question: 'What types of AI tools are available?',
    answer: 'We offer 15 AI-powered tools across categories like content creation, SEO optimization, social media marketing, e-commerce management, and branding assistance.',
  },
  {
    question: 'Do I need an account to use the AI tools?',
    answer: 'Most tools can be used without an account. Creating a free account unlocks additional features like saved history, advanced analytics, and premium tool access.',
  },
  {
    question: 'Can these tools help with Shopify, eBay, or Etsy?',
    answer: 'Absolutely. Our tools are specifically designed for e-commerce sellers on Shopify, eBay, and Etsy. They generate product descriptions, optimize listings, and create marketing content tailored to each platform.',
  },
  {
    question: 'How does the product description generator work?',
    answer: 'Enter your product name, key features, and target audience. The AI generates multiple professional product descriptions optimized for search engines and conversion.',
  },
];

const aiToolsStructuredData = [
  {
    '@type': 'CollectionPage',
    name: 'Free AI Tools — MG Blessed Beginnings',
    description: '15 free AI-powered tools for e-commerce sellers including hashtag generator, product descriptions, SEO optimizer, competitor analyzer, and more.',
  },
  {
    '@type': 'FAQPage',
    mainEntity: AI_TOOLS_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  },
];

export default function AITools() {
  const dispatch = useAppDispatch();
  const { items: tools, categories: apiCategories, status, error } = useAppSelector((state) => state.aiTools);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Always fetch ALL tools (no category param) so client-side combined filtering works
  useEffect(() => {
    if (status === 'idle' || status === 'failed') {
      dispatch(fetchAITools());
      dispatch(fetchAIToolCategories());
    }
  }, [dispatch, status]);

  // Category click only updates local state — filtering is done client-side
  const handleCategoryClick = (category: string | undefined) => {
    setSelectedCategory(category);
  };

  const handleRetry = () => {
    dispatch(fetchAITools());
  };

  // Deduplicate: a previous seed may have created a 'price-calculator' entry
  // alongside the canonical 'profit-calculator'. Keep only the canonical one.
  // Also deduplicate by name (case-insensitive) so even if two DB entries slip
  // through with different slugs but the same display name, only one card renders.
  const STALE_DUPLICATE_SLUGS = new Set(['price-calculator']);
  const seenNames = new Set<string>();
  const uniqueTools = tools.filter((t) => {
    if (STALE_DUPLICATE_SLUGS.has(t.slug)) return false;
    const key = t.name.toLowerCase();
    if (seenNames.has(key)) return false;
    seenNames.add(key);
    return true;
  });

  // Ensure WhatsApp Business Generator always appears even if not yet seeded in DB
  const hasWhatsApp = uniqueTools.some((t) => t.slug === 'whatsapp-business-generator');
  if (!hasWhatsApp) {
    uniqueTools.push({
      _id: 'local-whatsapp',
      name: 'WhatsApp Business Generator',
      slug: 'whatsapp-business-generator',
      description: 'AI-powered WhatsApp messages for Pakistani sellers. Generate catalog messages, broadcasts, order confirmations, and COD follow-ups.',
      category: 'Customer Service',
      features: ['Catalog messages', 'Broadcast announcements', 'Order confirmations', 'COD follow-ups', 'Welcome messages', 'Abandoned cart reminders'],
      toolUrl: '/tools/whatsapp-business-generator',
      isFree: true,
      status: 'live',
    });
  }

  // Ensure Free AI Tokens Hub always appears even if not yet seeded in DB
  const hasFreeTokensHub = uniqueTools.some((t) => t.slug === 'free-ai-tokens-hub');
  if (!hasFreeTokensHub) {
    uniqueTools.push({
      _id: 'local-free-ai-tokens-hub',
      name: 'Free AI Tokens Hub',
      slug: 'free-ai-tokens-hub',
      description: 'Run AI prompts for free with automatic provider failover. No key, no sign-up, no credit card — powered by pooled free-tier providers.',
      category: 'Content',
      features: ['Automatic provider failover', 'Live provider status', 'No API key needed', 'Free forever quotas'],
      toolUrl: '/ai-tools/free-ai-tokens-hub',
      isFree: true,
      status: 'live',
    });
  }

  // Build the category list: prefer API categories, fall back to deriving from tools,
  // and finally fall back to the canonical hardcoded list.
  // Always sorted in canonical order for consistency.
  const displayCategories = useMemo(() => {
    let cats: string[];
    if (apiCategories.length > 0) {
      cats = apiCategories;
    } else {
      // Derive from actual tool data
      const derived = [...new Set(uniqueTools.map((t) => t.category).filter(Boolean))] as string[];
      if (derived.length > 0) {
        cats = derived;
      } else {
        cats = [...CANONICAL_CATEGORIES];
      }
    }
    // Sort in canonical order; unknown categories go at the end alphabetically
    const canonicalOrder = new Map<string, number>(CANONICAL_CATEGORIES.map((c, i) => [c, i]));
    return [...cats].sort((a, b) => {
      const ai = canonicalOrder.get(a) ?? 999;
      const bi = canonicalOrder.get(b) ?? 999;
      if (ai !== bi) return ai - bi;
      return a.localeCompare(b);
    });
  }, [apiCategories, uniqueTools]);

  // Combined client-side filtering: category AND search query
  const filteredTools = useMemo(() => {
    let result = uniqueTools;

    // Filter by selected category
    if (selectedCategory) {
      result = result.filter(
        (t) => t.category?.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    // Filter by search query (name + description + category, case-insensitive)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [uniqueTools, selectedCategory, searchQuery]);

  return (
    <>
      <SEOHead
        title={aiToolsMeta.title}
        description={aiToolsMeta.description}
        keywords={aiToolsMeta.keywords}
        canonicalUrl={aiToolsMeta.canonical}
        structuredData={aiToolsStructuredData}
        data-icod-id="src_pages_aitools_tsx_55f3" />
      <SchemaInjector
        schemaType="page"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'AI Tools', url: '/ai-tools' },
        ]}
        data-icod-id="src_pages_aitools_tsx_f899" />
      {/* Hero */}
      <section
        className="py-24"
        style={{ background: 'var(--section-lavender)' }}
        data-icod-id="src_pages_aitools_tsx_fe2a">
        <div
          className="container mx-auto px-4 text-center"
          data-icod-id="src_pages_aitools_tsx_11ad">
          <h1
            className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight"
            data-icod-id="src_pages_aitools_tsx_32d8">Free AI Tools</h1>
          <p
            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            data-icod-id="src_pages_aitools_tsx_2cc4">
            Powerful AI-powered tools designed specifically for e-commerce sellers. Boost productivity and grow your business.
          </p>
          {/* Free Forever Promise */}
          <div className="mt-6 flex flex-col items-center gap-2" data-icod-id="src_pages_aitools_tsx_free_promise_wrap">
            <Badge variant="free" className="text-base md:text-lg px-5 py-2 inline-flex items-center gap-2 shadow-[0_4px_16px_rgba(0,212,245,0.5)]" data-icod-id="src_pages_aitools_tsx_free_badge">
              <InfinityIcon className="h-4 w-4" data-icod-id="src_pages_aitools_tsx_infinity_icon" />
              100% Free Forever
            </Badge>
            <p
              className="text-lg md:text-xl font-bold text-foreground tracking-wide"
              data-icod-id="src_pages_aitools_tsx_free_subheadline">
              Unlimited Use. No Sign-Up. No Credit Card.
            </p>
          </div>
        </div>
      </section>
      {/* Ad Banner after Hero */}
      <div
        className="container mx-auto px-4 py-6"
        data-icod-id="src_pages_aitools_tsx_d32a">
        <AdSenseSlot format="banner" data-icod-id="src_pages_aitools_tsx_24a0" />
      </div>
      {/* Search Box */}
      <section className="py-6" data-icod-id="src_pages_aitools_tsx_search_section">
        <div
          className="container mx-auto px-4 max-w-4xl"
          data-icod-id="src_pages_aitools_tsx_b5b2">
          <div className="relative" data-icod-id="src_pages_aitools_tsx_f07d">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none"
              data-icod-id="src_pages_aitools_tsx_search_icon" />
            <Input
              type="text"
              placeholder="Search tools…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              data-icod-id="src_pages_aitools_tsx_search_input" />
          </div>
        </div>
      </section>
      {/* Filters */}
      <section
        className="py-10 border-b border-border/40"
        style={{ background: 'rgba(var(--background), 0.95)' }}
        data-icod-id="src_pages_aitools_tsx_05ae">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_aitools_tsx_a090">
          <div
            className="flex flex-wrap gap-2 justify-center"
            data-icod-id="src_pages_aitools_tsx_a793">
            <Button
              variant={selectedCategory === undefined ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleCategoryClick(undefined)}
              data-icod-id="src_pages_aitools_tsx_eea3">
              All Tools
            </Button>
            {displayCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleCategoryClick(category)}
                data-icod-id={`src_pages_aitools_tsx_2295_${category}`}>
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>
      {/* Tools Grid */}
      <section className="py-24" style={{ background: 'var(--section-blush)' }} data-icod-id="src_pages_aitools_tsx_a751">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_aitools_tsx_d950">
          {status === 'loading' && (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              data-icod-id="src_pages_aitools_tsx_skeleton_grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-[20px] border border-border bg-card p-6 space-y-4"
                  data-icod-id={`src_pages_aitools_tsx_skel_${i}`}>
                  <div className="flex items-center gap-3 mb-2" data-icod-id={`src_pages_aitools_tsx_skel_header_${i}`}>
                    <Skeleton variant="circle" className="h-10 w-10" data-icod-id={`src_pages_aitools_tsx_skel_icon_${i}`} />
                    <Skeleton variant="text" className="h-5 w-32" data-icod-id={`src_pages_aitools_tsx_skel_cat_${i}`} />
                  </div>
                  <Skeleton variant="text" className="h-6 w-4/5" data-icod-id={`src_pages_aitools_tsx_skel_title_${i}`} />
                  <Skeleton variant="text" className="h-4 w-full" data-icod-id={`src_pages_aitools_tsx_skel_desc1_${i}`} />
                  <Skeleton variant="text" className="h-4 w-3/4" data-icod-id={`src_pages_aitools_tsx_skel_desc2_${i}`} />
                  <div className="pt-3 flex gap-2" data-icod-id={`src_pages_aitools_tsx_skel_btns_${i}`}>
                    <Skeleton variant="rect" className="h-9 w-24 rounded-lg" data-icod-id={`src_pages_aitools_tsx_skel_btn1_${i}`} />
                    <Skeleton variant="rect" className="h-9 w-24 rounded-lg" data-icod-id={`src_pages_aitools_tsx_skel_btn2_${i}`} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {status === 'failed' && (
            <EmptyState
              icon={AlertCircle}
              title="Failed to load tools"
              description={error || 'Something went wrong while fetching AI tools. Please try again.'}
              action={
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleRetry}
                  data-icod-id="src_pages_aitools_tsx_d254">
                  <RefreshCw className="h-4 w-4 mr-2" data-icod-id="src_pages_aitools_tsx_8f06" />
                  Retry
                </Button>
              }
              data-icod-id="src_pages_aitools_tsx_error_state" />
          )}

          {status === 'succeeded' && filteredTools.length === 0 && (
            <EmptyState
              icon={SearchX}
              title="No tools found"
              description={searchQuery.trim()
                ? `No tools match your search "${searchQuery}". Try a different keyword.`
                : selectedCategory
                  ? `No tools available in the "${selectedCategory}" category. Try selecting "All Tools" to see everything.`
                  : 'No AI tools are currently available. Check back later for new additions.'}
              action={selectedCategory ? (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleCategoryClick(undefined)}
                  data-icod-id="src_pages_aitools_tsx_0b4e">
                  View All Tools
                </Button>
              ) : undefined}
              data-icod-id="src_pages_aitools_tsx_empty_state" />
          )}

          {status === 'succeeded' && filteredTools.length > 0 && (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              data-icod-id="src_pages_aitools_tsx_3c4f">
              {filteredTools.map((tool) => (
                <AIToolCard
                  key={tool._id}
                  tool={tool}
                  data-icod-id={`src_pages_aitools_tsx_290f_${tool._id}`} />
              ))}
            </div>
          )}
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-20 bg-background" data-icod-id="src_pages_aitools_tsx_faq_section">
        <div className="max-w-3xl mx-auto px-4" data-icod-id="src_pages_aitools_tsx_faq_container">
          <h2
            className="text-2xl md:text-3xl font-bold text-foreground font-heading text-center mb-10"
            data-icod-id="src_pages_aitools_tsx_faq_title">
            Frequently Asked Questions
          </h2>
          <FAQAccordion items={AI_TOOLS_FAQ_ITEMS} data-icod-id="src_pages_aitools_tsx_faq_accordion" />
        </div>
      </section>
      {/* Sidebar Ad (xl screens only) */}
      <div
        className="hidden xl:block fixed right-6 top-1/2 -translate-y-1/2 w-44 z-30"
        data-icod-id="src_pages_aitools_tsx_ce51">
        <AdSenseSlot format="sidebar" data-icod-id="src_pages_aitools_tsx_065c" />
      </div>
    </>
  );
}
