import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAIToolBySlug, clearCurrentTool } from '@/store/slices/aiToolsSlice';
import { Spinner, Button, Card, buttonClass } from '@/components/ui';
import SEOHead from '@/components/SEOHead';
import FAQAccordion from '@/components/FAQAccordion';
import { ChevronLeft, Check, Sparkles, ExternalLink } from 'lucide-react';
import { getNichesForTool, getNicheBySlug } from '@/data/toolNiches';
import type { FAQItem } from '@/components/FAQAccordion';
import { SITE_NAME } from '@/seo';
// Security fix: Sanitize HTML content to prevent XSS attacks
import { sanitizeRichText } from '@/utils/sanitize';

export default function ToolNichePage() {
  const { toolSlug, niche } = useParams<{ toolSlug: string; niche: string }>();
  const dispatch = useAppDispatch();
  const { currentTool, detailStatus } = useAppSelector((state) => state.aiTools);

  useEffect(() => {
    if (toolSlug) {
      dispatch(fetchAIToolBySlug(toolSlug));
    }
    return () => {
      dispatch(clearCurrentTool());
    };
  }, [dispatch, toolSlug]);

  if (detailStatus === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" data-icod-id="src_pages_toolnichepage_tsx_loading">
        <Spinner size="lg" data-icod-id="src_pages_toolnichepage_tsx_spinner" />
      </div>
    );
  }

  if (!currentTool || !toolSlug || !niche) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4" data-icod-id="src_pages_toolnichepage_tsx_notfound">
        <h2 className="text-2xl font-bold text-foreground mb-4" data-icod-id="src_pages_toolnichepage_tsx_nf_title">Page Not Found</h2>
        <p className="text-muted-foreground mb-6" data-icod-id="src_pages_toolnichepage_tsx_nf_desc">The page you're looking for doesn't exist.</p>
        <Link to="/ai-tools" className="inline-flex items-center text-primary hover:underline" data-icod-id="src_pages_toolnichepage_tsx_nf_link">
          <ChevronLeft className="h-4 w-4 mr-1" data-icod-id="src_pages_toolnichepage_tsx_nf_icon" />
          Back to AI Tools
        </Link>
      </div>
    );
  }

  const nicheData = getNicheBySlug(toolSlug, niche);
  const allNiches = getNichesForTool(toolSlug);

  if (!nicheData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4" data-icod-id="src_pages_toolnichepage_tsx_niche_notfound">
        <h2 className="text-2xl font-bold text-foreground mb-4" data-icod-id="src_pages_toolnichepage_tsx_nn_title">Niche Not Found</h2>
        <p className="text-muted-foreground mb-6" data-icod-id="src_pages_toolnichepage_tsx_nn_desc">This specific niche page doesn't exist.</p>
        <Link to={`/tools/${toolSlug}`} className="inline-flex items-center text-primary hover:underline" data-icod-id="src_pages_toolnichepage_tsx_nn_link">
          <ChevronLeft className="h-4 w-4 mr-1" data-icod-id="src_pages_toolnichepage_tsx_nn_icon" />
          Back to {currentTool.name}
        </Link>
      </div>
    );
  }

  // Niche-specific FAQs
  const nicheFAQs: FAQItem[] = [
    {
      question: `How does ${currentTool.name} help with ${nicheData.nicheName}?`,
      answer: `Our tool is specifically optimized for ${nicheData.nicheName.toLowerCase()} content. It understands industry-specific terminology, buyer search patterns, and best practices unique to this niche.`,
    },
    {
      question: `What keywords work best for ${nicheData.nicheName}?`,
      answer: `The most effective keywords depend on your specific products. Our tool analyzes top-performing keywords in the ${nicheData.nicheName.toLowerCase()} category and suggests combinations that balance search volume with competition level.`,
    },
    {
      question: `Is this tool free for ${nicheData.nicheName} sellers?`,
      answer: 'Yes! Our tool is completely free for all sellers in every niche. No subscription, no hidden fees, unlimited usage.',
    },
    {
      question: `Can I see examples of ${nicheData.nicheName} outputs?`,
      answer: 'Absolutely! Scroll down to see sample outputs specifically created for the ' + nicheData.nicheName.toLowerCase() + ' niche. These demonstrate the quality and relevance of our AI-generated content.',
    },
    {
      question: `How often should I update my ${nicheData.nicheName} listings?`,
      answer: 'We recommend reviewing and refreshing your listings monthly. Trends change, new keywords emerge, and seasonal shifts affect buyer behavior. Regular optimization keeps your listings competitive.',
    },
  ];

  const canonicalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/tools/${toolSlug}/${niche}`
    : undefined;

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to Use ${currentTool.name} for ${nicheData.nicheName}`,
    description: `Step-by-step guide to optimizing your ${nicheData.nicheName.toLowerCase()} listings using our free AI tool.`,
    step: [
      {
        '@type': 'HowToStep',
        name: 'Enter Your Product Details',
        text: 'Input your product information, target audience, and key features.',
      },
      {
        '@type': 'HowToStep',
        name: 'Select Your Niche',
        text: `Choose "${nicheData.nicheName}" from our niche categories for specialized optimization.`,
      },
      {
        '@type': 'HowToStep',
        name: 'Generate Optimized Content',
        text: 'Our AI creates tailored content using niche-specific keywords and best practices.',
      },
      {
        '@type': 'HowToStep',
        name: 'Apply to Your Listings',
        text: 'Copy the generated content and apply it to your marketplace listings.',
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: nicheFAQs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <SEOHead
        title={`${currentTool.name} for ${nicheData.nicheName} — Free AI Tool | ${SITE_NAME}`}
        description={`Optimize your ${nicheData.nicheName.toLowerCase()} listings with our free ${currentTool.name}. Get AI-powered results specifically designed for ${nicheData.nicheName.toLowerCase()} sellers.`}
        keywords={`${currentTool.name}, ${nicheData.nicheName}, ${toolSlug}, free ai tool`}
        canonicalUrl={canonicalUrl}
        structuredData={[howToSchema, faqSchema] as unknown as Record<string, unknown>}
        data-icod-id="src_pages_toolnichepage_tsx_seo" />

      {/* Hero Section */}
      <section className="py-16 md:py-24" style={{ background: 'var(--section-lavender)' }} data-icod-id="src_pages_toolnichepage_tsx_hero">
        <div className="container mx-auto px-4" data-icod-id="src_pages_toolnichepage_tsx_hero_container">
          <nav className="mb-8 max-w-4xl mx-auto" data-icod-id="src_pages_toolnichepage_tsx_breadcrumb">
            <div className="flex items-center gap-2 text-sm text-muted-foreground" data-icod-id="src_pages_toolnichepage_tsx_bread_inner">
              <Link to="/ai-tools" className="hover:text-primary transition-colors" data-icod-id="src_pages_toolnichepage_tsx_bread_tools">AI Tools</Link>
              <span data-icod-id="src_pages_toolnichepage_tsx_bread_sep">/</span>
              <Link to={`/tools/${toolSlug}`} className="hover:text-primary transition-colors" data-icod-id="src_pages_toolnichepage_tsx_bread_tool">{currentTool.name}</Link>
              <span data-icod-id="src_pages_toolnichepage_tsx_bread_sep2">/</span>
              <span className="text-foreground font-medium" data-icod-id="src_pages_toolnichepage_tsx_bread_niche">{nicheData.nicheName}</span>
            </div>
          </nav>

          <div className="max-w-7xl mx-auto text-center" data-icod-id="src_pages_toolnichepage_tsx_hero_content">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6" data-icod-id="src_pages_toolnichepage_tsx_hero_badge">
              <Sparkles className="h-4 w-4" data-icod-id="src_pages_toolnichepage_tsx_hero_sparkle" />
              For {nicheData.nicheName} Sellers
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-heading" data-icod-id="src_pages_toolnichepage_tsx_title">
              {currentTool.name} for {nicheData.nicheName}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-icod-id="src_pages_toolnichepage_tsx_desc">
              Get AI-optimized results specifically designed for {nicheData.nicheName.toLowerCase()} sellers. Free forever, no sign-up required.
            </p>
            <a href={currentTool.toolUrl} target="_blank" rel="noopener noreferrer" data-icod-id="src_pages_toolnichepage_tsx_cta_link">
              <Button variant="primary" size="lg" data-icod-id="src_pages_toolnichepage_tsx_cta_btn">
                Try Free Now
                <ExternalLink className="h-4 w-4 ml-2" data-icod-id="src_pages_toolnichepage_tsx_cta_icon" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Niche Description Section */}
      <section className="py-16 md:py-20 bg-background" data-icod-id="src_pages_toolnichepage_tsx_description">
        <div className="container mx-auto px-4" data-icod-id="src_pages_toolnichepage_tsx_desc_container">
          <div className="max-w-3xl mx-auto prose prose-lg" data-icod-id="src_pages_toolnichepage_tsx_desc_prose">
            {/* Security fix: Sanitize HTML to prevent XSS */}
            <div dangerouslySetInnerHTML={{ __html: sanitizeRichText(nicheData.description) }} data-icod-id="src_pages_toolnichepage_tsx_desc_html" />
          </div>
        </div>
      </section>

      {/* Sample Keywords Section */}
      <section className="py-16 md:py-20" style={{ background: 'var(--section-blush)' }} data-icod-id="src_pages_toolnichepage_tsx_keywords">
        <div className="container mx-auto px-4" data-icod-id="src_pages_toolnichepage_tsx_kw_container">
          <div className="max-w-4xl mx-auto" data-icod-id="src_pages_toolnichepage_tsx_kw_inner">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center font-heading" data-icod-id="src_pages_toolnichepage_tsx_kw_title">
              Popular {nicheData.nicheName} Keywords
            </h2>
            <div className="flex flex-wrap gap-3 justify-center" data-icod-id="src_pages_toolnichepage_tsx_kw_list">
              {nicheData.sampleKeywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-full border border-border bg-card text-foreground font-medium"
                  data-icod-id={`src_pages_toolnichepage_tsx_kw_${index}`}>
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Example Outputs Section */}
      <section className="py-16 md:py-20 bg-background" data-icod-id="src_pages_toolnichepage_tsx_examples">
        <div className="container mx-auto px-4" data-icod-id="src_pages_toolnichepage_tsx_ex_container">
          <div className="max-w-4xl mx-auto" data-icod-id="src_pages_toolnichepage_tsx_ex_inner">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center font-heading" data-icod-id="src_pages_toolnichepage_tsx_ex_title">
              Example Outputs for {nicheData.nicheName}
            </h2>
            <div className="space-y-4" data-icod-id="src_pages_toolnichepage_tsx_ex_list">
              {nicheData.exampleOutputs.map((output, index) => (
                <Card key={index} className="p-6" data-icod-id={`src_pages_toolnichepage_tsx_output_${index}`}>
                  <p className="text-foreground leading-relaxed" data-icod-id={`src_pages_toolnichepage_tsx_outtext_${index}`}>{output}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 md:py-20" style={{ background: 'var(--section-aqua)' }} data-icod-id="src_pages_toolnichepage_tsx_tips">
        <div className="container mx-auto px-4" data-icod-id="src_pages_toolnichepage_tsx_tips_container">
          <div className="max-w-4xl mx-auto" data-icod-id="src_pages_toolnichepage_tsx_tips_inner">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center font-heading" data-icod-id="src_pages_toolnichepage_tsx_tips_title">
              Pro Tips for {nicheData.nicheName} Sellers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-icod-id="src_pages_toolnichepage_tsx_tips_grid">
              {nicheData.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3" data-icod-id={`src_pages_toolnichepage_tsx_tip_${index}`}>
                  <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" data-icod-id={`src_pages_toolnichepage_tsx_tipicon_${index}`} />
                  <p className="text-foreground" data-icod-id={`src_pages_toolnichepage_tsx_tiptext_${index}`}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Niches Section */}
      <section className="py-16 md:py-20 bg-background" data-icod-id="src_pages_toolnichepage_tsx_relatedniches">
        <div className="container mx-auto px-4" data-icod-id="src_pages_toolnichepage_tsx_rn_container">
          <div className="max-w-5xl mx-auto" data-icod-id="src_pages_toolnichepage_tsx_rn_inner">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center font-heading" data-icod-id="src_pages_toolnichepage_tsx_rn_title">
              Explore Other Categories
            </h2>
            <div className="flex flex-wrap gap-3 justify-center" data-icod-id="src_pages_toolnichepage_tsx_rn_list">
              {allNiches
                .filter((n) => n.slug !== niche)
                .map((n) => (
                  <Link
                    key={n.slug}
                    to={`/tools/${toolSlug}/${n.slug}`}
                    className="px-4 py-2 rounded-full border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all text-sm font-medium text-foreground"
                    data-icod-id={`src_pages_toolnichepage_tsx_rnlink_${n.slug}`}>
                    {n.nicheName}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20" style={{ background: 'var(--section-lavender)' }} data-icod-id="src_pages_toolnichepage_tsx_faq">
        <div className="container mx-auto px-4" data-icod-id="src_pages_toolnichepage_tsx_faq_container">
          <div className="max-w-3xl mx-auto" data-icod-id="src_pages_toolnichepage_tsx_faq_inner">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center font-heading" data-icod-id="src_pages_toolnichepage_tsx_faq_title">
              Frequently Asked Questions
            </h2>
            <FAQAccordion items={nicheFAQs} data-icod-id="src_pages_toolnichepage_tsx_faq_accordion" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20" style={{ background: 'var(--gradient-signature)' }} data-icod-id="src_pages_toolnichepage_tsx_cta">
        <div className="container mx-auto px-4 text-center" data-icod-id="src_pages_toolnichepage_tsx_cta_container">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6 font-heading" data-icod-id="src_pages_toolnichepage_tsx_cta_title">
            Ready to Optimize Your {nicheData.nicheName} Listings?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto" data-icod-id="src_pages_toolnichepage_tsx_cta_desc">
            Join thousands of {nicheData.nicheName.toLowerCase()} sellers using our free AI tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center" data-icod-id="src_pages_toolnichepage_tsx_cta_buttons">
            <a href={currentTool.toolUrl} target="_blank" rel="noopener noreferrer" className={buttonClass({ size: 'lg', className: 'shadow-lg' })} data-icod-id="src_pages_toolnichepage_tsx_cta_trylink">
                Try Free Now
            </a>
            <Link to={`/tools/${toolSlug}`} className={buttonClass({ variant: 'outline', size: 'lg', className: 'border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20' })} data-icod-id="src_pages_toolnichepage_tsx_cta_toollink">
                Learn More About This Tool
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
