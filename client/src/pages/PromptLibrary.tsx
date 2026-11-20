import { useState, useMemo } from 'react';
import { Card, Button, Badge, Input, EmptyState } from '@/components/ui';
import SEOHead from '@/components/SEOHead';
import AdSenseSlot from '@/components/AdSenseSlot';
import ChatGPTPromptCollection from '@/components/ChatGPTPromptCollection';
import { Copy, Check, Search, Sparkles, Tag } from 'lucide-react';
import { SchemaInjector, PAGE_META } from '@/seo';

const promptLibraryMeta = PAGE_META['/prompt-library'];

interface Prompt {
  id: string;
  title: string;
  category: string;
  prompt: string;
  tags: string[];
  useCase: string;
}

const prompts: Prompt[] = [
  // Product Descriptions
  {
    id: 'prod-1',
    title: 'Compelling Product Description',
    category: 'Product Descriptions',
    prompt: `Write a compelling product description for [PRODUCT NAME].

Key features:
- [Feature 1]
- [Feature 2]
- [Feature 3]

Target audience: [TARGET AUDIENCE]
Tone: [professional/casual/luxury/playful]
Platform: [Shopify/eBay/Etsy/Amazon]

Include sensory details, benefits over features, and a subtle call-to-action.`,
    tags: ['product', 'description', 'ecommerce'],
    useCase: 'Creating product listings for online stores',
  },
  {
    id: 'prod-2',
    title: 'Bullet Point Features',
    category: 'Product Descriptions',
    prompt: `Create 5 compelling bullet points for [PRODUCT NAME] highlighting its key benefits.

Product details:
- [Material/Construction]
- [Size/Dimensions]
- [Key Feature 1]
- [Key Feature 2]
- [Unique Selling Point]

Format each bullet to lead with a benefit, followed by the feature that delivers it.`,
    tags: ['bullets', 'features', 'listing'],
    useCase: 'eBay item specifics or Amazon bullet points',
  },
  // SEO Titles
  {
    id: 'seo-1',
    title: 'SEO-Optimized eBay Title',
    category: 'SEO Titles',
    prompt: `Generate 3 SEO-optimized eBay titles (max 80 characters each) for:

Product: [PRODUCT NAME]
Brand: [BRAND]
Key attributes: [SIZE, COLOR, CONDITION, MATERIAL]
Keywords to include: [KEYWORD 1, KEYWORD 2, KEYWORD 3]

Front-load the most important keywords. Include brand, model, size, color, and condition. Avoid filler words like "wow" or "amazing".`,
    tags: ['ebay', 'title', 'seo'],
    useCase: 'Optimizing eBay listing titles for search visibility',
  },
  {
    id: 'seo-2',
    title: 'Etsy Tags Generator',
    category: 'SEO Titles',
    prompt: `Generate 13 Etsy tags (max 20 characters each) for [PRODUCT TYPE].

Product details:
- Category: [CATEGORY]
- Material: [MATERIAL]
- Style: [STYLE]
- Occasion: [OCCASION]
- Recipient: [WHO IS THIS FOR]

Mix broad terms with specific long-tail keywords. Use all 13 tag slots. No duplicates.`,
    tags: ['etsy', 'tags', 'keywords'],
    useCase: 'Maximizing Etsy search visibility with strategic tags',
  },
  // Social Media
  {
    id: 'social-1',
    title: 'Instagram Caption with Hook',
    category: 'Social Media',
    prompt: `Write an engaging Instagram caption for [POST TYPE: product launch/behind-the-scenes/tip/tutorial].

Topic/Product: [TOPIC]
Target audience: [AUDIENCE]
Tone: [casual/inspirational/humorous/professional]
Call-to-action: [SHOP NOW/LINK IN BIO/COMMENT BELOW]

Start with a scroll-stopping hook. Use line breaks for readability. Include 10-15 relevant hashtags at the end.`,
    tags: ['instagram', 'caption', 'engagement'],
    useCase: 'Creating engaging Instagram posts that drive action',
  },
  {
    id: 'social-2',
    title: 'TikTok Video Script',
    category: 'Social Media',
    prompt: `Create a 30-second TikTok video script for [PRODUCT/TOPIC].

Hook (first 3 seconds): [ATTENTION-GRABBING OPENING]
Main content: [WHAT TO SHOW/SAY]
Call-to-action: [WHAT VIEWERS SHOULD DO]

Keep it authentic and fast-paced. Use trending audio suggestions. Include text overlay cues.`,
    tags: ['tiktok', 'video', 'script'],
    useCase: 'Planning TikTok content that converts viewers to customers',
  },
  // Email Marketing
  {
    id: 'email-1',
    title: 'Abandoned Cart Recovery Email',
    category: 'Email Marketing',
    prompt: `Write an abandoned cart recovery email for [STORE NAME].

Product left in cart: [PRODUCT NAME]
Price: [PRICE]
Incentive: [DISCOUNT/FREE SHIPPING/BONUS]

Subject line options (provide 3):
Body: Create urgency without being pushy. Remind them what they're missing. Include a clear CTA button.`,
    tags: ['email', 'cart', 'recovery'],
    useCase: 'Recovering lost sales from abandoned shopping carts',
  },
  {
    id: 'email-2',
    title: 'Welcome Email Sequence',
    category: 'Email Marketing',
    prompt: `Write a 3-email welcome sequence for new subscribers to [STORE NAME].

Email 1 (Immediate): Welcome + deliver lead magnet + introduce brand story
Email 2 (Day 2): Share best-selling products + social proof
Email 3 (Day 4): Special offer + urgency to make first purchase

Brand voice: [DESCRIBE YOUR BRAND VOICE]
Lead magnet: [WHAT THEY SIGNED UP FOR]`,
    tags: ['email', 'welcome', 'sequence'],
    useCase: 'Nurturing new subscribers into first-time customers',
  },
  // Customer Service
  {
    id: 'cs-1',
    title: 'Professional Review Response',
    category: 'Customer Service',
    prompt: `Write a professional response to this customer review:

Review: "[PASTE REVIEW HERE]"
Rating: [X]/5 stars
Business name: [YOUR BUSINESS NAME]

Tone: [grateful/apologetic/professional/friendly]
If negative: Acknowledge the issue, apologize sincerely, offer specific resolution
If positive: Thank them specifically, reference their feedback, invite them back`,
    tags: ['review', 'response', 'customer-service'],
    useCase: 'Responding to customer reviews professionally and effectively',
  },
  // Content Creation
  {
    id: 'content-1',
    title: 'Blog Post Outline',
    category: 'Content Creation',
    prompt: `Create a detailed blog post outline for:

Topic: [TOPIC]
Target keyword: [PRIMARY KEYWORD]
Target audience: [WHO IS THIS FOR]
Goal: [EDUCATE/INSPIRE/SELL/ENGAGE]

Include:
- Catchy title options (3)
- Meta description (under 155 chars)
- H2 and H3 heading structure
- Key points under each section
- Internal linking opportunities
- Call-to-action placement`,
    tags: ['blog', 'outline', 'seo'],
    useCase: 'Planning SEO-optimized blog content that ranks',
  },
];

const categories = ['All', ...Array.from(new Set(prompts.map((p) => p.category)))];

export default function PromptLibrary() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      const matchesCategory = selectedCategory === 'All' || prompt.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <>
      <SEOHead
        title={promptLibraryMeta.title}
        description={promptLibraryMeta.description}
        keywords={promptLibraryMeta.keywords}
        canonicalUrl={promptLibraryMeta.canonical}
        data-icod-id="src_pages_promptlibrary_tsx_deef" />
      <SchemaInjector
        schemaType="page"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Prompt Library', url: '/prompt-library' },
        ]}
        data-icod-id="src_pages_promptlibrary_tsx_fbdd" />
      {/* Hero */}
      <section
        className="py-20"
        style={{ background: 'var(--section-lavender)' }}
        data-icod-id="src_pages_promptlibrary_tsx_0dfc">
        <div
          className="container mx-auto px-4 text-center"
          data-icod-id="src_pages_promptlibrary_tsx_e349">
          <div
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6"
            data-icod-id="src_pages_promptlibrary_tsx_e0cf">
            <Sparkles className="h-4 w-4" data-icod-id="src_pages_promptlibrary_tsx_a9d3" />
            <span data-icod-id="src_pages_promptlibrary_tsx_eba1">Free Resource</span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight"
            data-icod-id="src_pages_promptlibrary_tsx_8da7">
            Prompt Library
          </h1>
          <p
            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            data-icod-id="src_pages_promptlibrary_tsx_8711">
            Ready-to-use prompts for AI tools. Copy, customize, and create better content for your e-commerce business.
          </p>
        </div>
      </section>
      {/* Tool Banner Image */}
      <div className="w-full" data-icod-id="src_pages_promptlibrary_tsx_banner">
        <img
          src="https://drive.google.com/thumbnail?id=1iXBVDt_yYyjXvc7Mq7Bkbmr5tQEgO9bM&sz=w1920"
          alt="Prompt Library Banner"
          className="w-full h-auto object-cover"
          loading="eager"
          data-icod-id="src_pages_promptlibrary_tsx_banner_img"
        />
      </div>
      {/* Ad Banner after Hero */}
      <div
        className="container mx-auto px-4 py-6"
        data-icod-id="src_pages_promptlibrary_tsx_eee5">
        <AdSenseSlot format="banner" data-icod-id="src_pages_promptlibrary_tsx_8526" />
      </div>
      {/* Filters & Search */}
      <section
        className="py-8 border-b border-border/40 sticky top-16 z-40 bg-background/95 backdrop-blur-sm"
        data-icod-id="src_pages_promptlibrary_tsx_b643">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_promptlibrary_tsx_03ae">
          <div
            className="flex flex-col md:flex-row gap-4 items-center justify-between"
            data-icod-id="src_pages_promptlibrary_tsx_b278">
            {/* Category Filters */}
            <div
              className="flex flex-wrap gap-2 justify-center"
              data-icod-id="src_pages_promptlibrary_tsx_2a3e">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  data-icod-id={`src_pages_promptlibrary_tsx_6783_${category}`}>
                  {category}
                </Button>
              ))}
            </div>

            {/* Search */}
            <div
              className="relative w-full md:w-72"
              data-icod-id="src_pages_promptlibrary_tsx_84ec">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                data-icod-id="src_pages_promptlibrary_tsx_fbb5" />
              <Input
                type="text"
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-icod-id="src_pages_promptlibrary_tsx_619a" />
            </div>
          </div>
        </div>
      </section>
      {/* Prompts Grid */}
      <section
        className="py-16 bg-background"
        data-icod-id="src_pages_promptlibrary_tsx_945c">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_promptlibrary_tsx_9847">
          {filteredPrompts.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No prompts found"
              description="Try adjusting your search or category filter."
              action={
                <Button
                  variant="outline"
                  onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                  data-icod-id="src_pages_promptlibrary_tsx_1065">
                  Clear Filters
                </Button>
              }
              data-icod-id="src_pages_promptlibrary_tsx_cd9e" />
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              data-icod-id="src_pages_promptlibrary_tsx_8a0f">
              {filteredPrompts.map((prompt) => (
                <Card
                  key={prompt.id}
                  className="flex flex-col h-full p-6 gap-4"
                  data-icod-id={`src_pages_promptlibrary_tsx_a571_${prompt.id}`}>
                  {/* Header */}
                  <div
                    className="flex items-start justify-between gap-3"
                    data-icod-id={`src_pages_promptlibrary_tsx_dc72_${prompt.id}`}>
                    <Badge
                      variant="category"
                      data-icod-id={`src_pages_promptlibrary_tsx_b045_${prompt.id}`}>{prompt.category}</Badge>
                  </div>

                  {/* Title */}
                  <h3
                    className="text-lg font-semibold text-foreground"
                    data-icod-id={`src_pages_promptlibrary_tsx_5afd_${prompt.id}`}>{prompt.title}</h3>

                  {/* Use Case */}
                  <p
                    className="text-sm text-muted-foreground"
                    data-icod-id={`src_pages_promptlibrary_tsx_045f_${prompt.id}`}>{prompt.useCase}</p>

                  {/* Prompt Preview */}
                  <div
                    className="flex-1 bg-muted/30 rounded-lg p-4 text-sm text-foreground/80 font-mono whitespace-pre-wrap line-clamp-6 overflow-hidden"
                    data-icod-id={`src_pages_promptlibrary_tsx_a75f_${prompt.id}`}>
                    {prompt.prompt}
                  </div>

                  {/* Tags */}
                  <div
                    className="flex flex-wrap gap-1.5"
                    data-icod-id={`src_pages_promptlibrary_tsx_2e51_${prompt.id}`}>
                    {prompt.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded"
                        data-icod-id={`src_pages_promptlibrary_tsx_c4ca_${prompt.id}_${tag}`}>
                        <Tag
                          className="h-3 w-3"
                          data-icod-id={`src_pages_promptlibrary_tsx_8e69_${prompt.id}_${tag}`} />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div
                    className="pt-4 border-t border-border/40 mt-auto"
                    data-icod-id={`src_pages_promptlibrary_tsx_bd7c_${prompt.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleCopy(prompt.id, prompt.prompt)}
                      data-icod-id={`src_pages_promptlibrary_tsx_4b54_${prompt.id}`}>
                      {copiedId === prompt.id ? (
                        <>
                          <Check
                            className="h-4 w-4 mr-2 text-success"
                            data-icod-id={`src_pages_promptlibrary_tsx_3511_${prompt.id}`} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy
                            className="h-4 w-4 mr-2"
                            data-icod-id={`src_pages_promptlibrary_tsx_be7f_${prompt.id}`} />
                          Copy Prompt
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Tips Section */}
      <section
        className="py-16"
        style={{ background: 'var(--section-blush)' }}
        data-icod-id="src_pages_promptlibrary_tsx_545d">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_promptlibrary_tsx_9ad6">
          <div
            className="max-w-7xl mx-auto"
            data-icod-id="src_pages_promptlibrary_tsx_a3a4">
            <h2
              className="text-2xl font-bold text-foreground mb-8 text-center"
              data-icod-id="src_pages_promptlibrary_tsx_653b">How to Use These Prompts</h2>
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              data-icod-id="src_pages_promptlibrary_tsx_4349">
              {[
                { step: '1', title: 'Copy', desc: 'Click the copy button to copy any prompt to your clipboard.' },
                { step: '2', title: 'Customize', desc: 'Replace the [BRACKETED] placeholders with your specific details.' },
                { step: '3', title: 'Generate', desc: 'Paste into ChatGPT, Claude, or your preferred AI tool and generate.' },
              ].map((item) => (
                <div
                  key={item.step}
                  className="text-center"
                  data-icod-id={`src_pages_promptlibrary_tsx_3ec0_${item.step}`}>
                  <div
                    className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"
                    data-icod-id={`src_pages_promptlibrary_tsx_d36a_${item.step}`}>
                    <span
                      className="text-primary font-bold"
                      data-icod-id={`src_pages_promptlibrary_tsx_4fc9_${item.step}`}>{item.step}</span>
                  </div>
                  <h3
                    className="font-semibold text-foreground mb-2"
                    data-icod-id={`src_pages_promptlibrary_tsx_89cc_${item.step}`}>{item.title}</h3>
                  <p
                    className="text-sm text-muted-foreground"
                    data-icod-id={`src_pages_promptlibrary_tsx_42e9_${item.step}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* ChatGPT Prompt Collection — MG Blessed Beginnings */}
      <ChatGPTPromptCollection data-icod-id="src_pages_promptlibrary_tsx_3f15" />
    </>
  );
}
