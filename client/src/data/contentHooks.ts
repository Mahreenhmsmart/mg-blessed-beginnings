export interface ContentTemplate {
  tool: string;
  toolSlug: string;
  hooks: string[];
  beforeExample: string;
  afterExample: string;
  cta: string;
  trendingAudio?: string[];
}

export const contentTemplates: ContentTemplate[] = [
  {
    tool: 'Product Description Generator',
    toolSlug: 'product-description-generator',
    hooks: [
      'Still writing product descriptions manually? 😩',
      'I made 30 sales last month with THIS description ⬇️',
      'POV: You just automated 4 hours of work in 10 seconds',
      'Your competitor is using AI for product descriptions. Are you?',
      'This free tool writes better descriptions than me (and I\'m a copywriter)'
    ],
    beforeExample: 'Blue t-shirt, 100% cotton, size M, good quality',
    afterExample: 'Premium Navy Blue Cotton Tee – Experience ultimate comfort with our 100% organic cotton shirt. Perfect for casual outings or work-from-home days. Breathable, durable, and designed for all-day wear. Size M fits chest 38-40 inches.',
    cta: 'Try it free — link in bio',
    trendingAudio: ['Upbeat corporate', 'Trending TikTok sounds', 'Lo-fi beats']
  },
  {
    tool: 'SEO Title Optimizer',
    toolSlug: 'seo-title-optimizer',
    hooks: [
      'Your product title is killing your sales 🔪',
      'How I ranked #1 on Etsy with ONE title change',
      'Stop using boring titles. Do this instead ⬇️',
      'The title hack that 10x\'d my clicks',
      'SEO titles that actually convert (free tool)'
    ],
    beforeExample: 'Women\'s Handbag',
    afterExample: 'Vintage Leather Crossbody Bag | Women\'s Designer Purse | Adjustable Strap Handbag | Gift for Her | Brown Satchel',
    cta: 'Generate your SEO title — link in bio',
    trendingAudio: ['Suspenseful reveal', 'Success story music', 'Educational background']
  },
  {
    tool: 'Hashtag Generator',
    toolSlug: 'hashtag-generator',
    hooks: [
      'I went from 50 to 5000 followers with these hashtags 📈',
      'Stop using #fyp. Use THESE instead ⬇️',
      'The hashtag strategy that actually works in 2026',
      '30 hashtags in 5 seconds. Here\'s how ⬇️',
      'Why your posts get 0 views (and how to fix it)'
    ],
    beforeExample: '#handmade #jewelry #love #beautiful',
    afterExample: 'TRENDING: #handmadejewelry #customjewelry #giftideas\nNICHE: #minimalistjewelry #delicatejewelry #everydayjewelry\nCOMMUNITY: #smallbusiness #handmadewithLove #etsyseller',
    cta: 'Get your hashtags — link in bio',
    trendingAudio: ['Viral transition sounds', 'Growth mindset audio', 'Tech tutorial music']
  },
  {
    tool: 'Listing Optimizer',
    toolSlug: 'listing-optimizer',
    hooks: [
      'Your listings aren\'t getting seen? Here\'s why 👀',
      'The listing mistakes killing your sales 📉',
      'I optimized my listing. Sales doubled.',
      'Get a perfect listing score in 30 seconds',
      'Why your product isn\'t showing up in search'
    ],
    beforeExample: 'Title: "Nice Bag", Description: "Good quality bag for sale"',
    afterExample: 'Title: "Luxury Leather Crossbody Bag - Women\'s Designer Handbag"\nDescription: "Premium genuine leather crossbody bag with adjustable strap..."\nKeywords: luxury, leather, crossbody, designer, women\nScore: 92/100',
    cta: 'Optimize your listings — link in bio',
    trendingAudio: ['Success reveal sounds', 'Upbeat tutorial music', 'Growth mindset audio']
  },
  {
    tool: 'Competitor Analyzer',
    toolSlug: 'competitor-analyzer',
    hooks: [
      'Spy on your competitors (legally) 🕵️',
      'How I found my competitor\'s weakness',
      'This tool shows what your competitors are doing',
      'Steal your competitor\'s best keywords ⬇️',
      'Why they\'re outselling you (and how to fix it)'
    ],
    beforeExample: 'No idea what competitors are doing',
    afterExample: 'Competitor Analysis:\n✓ They rank for: "luxury leather bag"\n✗ They miss: "affordable designer bag"\n✓ Their price: $89\n✓ Your opportunity: $79 with better SEO',
    cta: 'Analyze competitors — link in bio',
    trendingAudio: ['Spy theme music', 'Investigation sounds', 'Competitive edge audio']
  },
  {
    tool: 'Review Response Writer',
    toolSlug: 'review-response-writer',
    hooks: [
      'How I respond to 50 reviews in 5 minutes ⏱️',
      'Turn bad reviews into loyal customers',
      'The review response that went viral',
      'Stop writing "Thank you" to every review',
      'Professional responses that build trust'
    ],
    beforeExample: 'Thanks for the review!',
    afterExample: 'Thank you so much, Sarah! We\'re thrilled your leather bag arrived safely and that you love the vintage look. Your support means the world to our small business. Don\'t forget to tag us in your photos – we\'d love to see how you style it! 💕',
    cta: 'Write better responses — link in bio',
    trendingAudio: ['Customer service vibes', 'Warm and friendly', 'Professional tone music']
  },
  {
    tool: 'Listing Optimizer',
    toolSlug: 'listing-optimizer',
    hooks: [
      'Your listing is invisible. Here\'s why 👻',
      'I fixed my listing and sales doubled',
      'The listing mistakes costing you sales',
      'Optimize your listing in 60 seconds ⬇️',
      'From page 5 to page 1 with these fixes'
    ],
    beforeExample: 'Title: Red Dress\nDescription: Nice dress for sale',
    afterExample: 'Title: Women\'s Red Cocktail Dress | Party Evening Wear | Size S-XL\nDescription: Turn heads in our stunning red cocktail dress. Perfect for date nights, parties, and special occasions. Features flattering A-line cut, premium fabric, and hidden zipper. Available in sizes S-XL. Free shipping!',
    cta: 'Optimize your listing — link in bio',
    trendingAudio: ['Transformation reveal', 'Before/after music', 'Success celebration']
  },
  {
    tool: 'Social Media Studio',
    toolSlug: 'social-media-studio',
    hooks: [
      'A month of content in 10 minutes 📅',
      'The content calendar that changed my business',
      'Stop posting randomly. Do this instead ⬇️',
      'How I plan 30 days of posts in one sitting',
      'Content strategy for lazy entrepreneurs 😴'
    ],
    beforeExample: 'Posting whatever comes to mind',
    afterExample: 'Week 1: Product showcase (Mon), Behind-the-scenes (Wed), Customer spotlight (Fri)\nWeek 2: Educational tips (Tue), User-generated content (Thu), Sale announcement (Sat)\nAll captions, hashtags, and best posting times included!',
    cta: 'Plan your content — link in bio',
    trendingAudio: ['Planning montage', 'Productivity beats', 'Organized life audio']
  }
];

export function getTemplateBySlug(slug: string): ContentTemplate | undefined {
  return contentTemplates.find((t) => t.toolSlug === slug);
}

export function getRandomHook(toolSlug: string): string | undefined {
  const template = getTemplateBySlug(toolSlug);
  if (!template) return undefined;
  const randomIndex = Math.floor(Math.random() * template.hooks.length);
  return template.hooks[randomIndex];
}
