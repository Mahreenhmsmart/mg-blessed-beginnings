export interface PlatformCaption {
  platform: string;
  iconEmoji: string;
  hookStyle: string;
  maxChars: number;
  captionTemplate: string;
  postingTips: string[];
  accentColor: string;
}

export const platformCaptionTemplates: PlatformCaption[] = [
  {
    platform: 'Instagram',
    iconEmoji: '\ud83d\udcf7',
    hookStyle: 'Visual-first, emoji-heavy storytelling with hashtags',
    maxChars: 2200,
    captionTemplate: `Still writing product descriptions manually? \ud83d\ude29 This free AI tool does it in seconds \u2728\n\n{{HOOK}}\n\nTry {{TOOL_NAME}} for FREE \ud83d\udd25\nNo signup. No credit card. Just paste and generate.\n\n\ud83d\udd17 Link in bio or try now:\n{{SITE_URL}}\n\n#AITools #EcommerceTools #ProductDescription #SellerTips #FreeAITool #OnlineBusiness #SmallBusiness #ShopifySeller #EtsySeller #DarazSeller #ContentCreator #AIWritingTool #DigitalMarketing #EntrepreneurLife #PakistanSellers`,
    postingTips: [
      'Use a carousel or reel showing the tool in action',
      'Put the hook in the first line before "more" truncation',
      'Use 15-30 relevant hashtags for maximum reach',
      'Post between 9-11 AM or 7-9 PM PKT'
    ],
    accentColor: '#E4405F'
  },
  {
    platform: 'Facebook',
    iconEmoji: '\ud83d\udc65',
    hookStyle: 'Storytelling-driven, longer form, community-oriented',
    maxChars: 63206,
    captionTemplate: `I built something that's helping thousands of sellers save hours every week. Here's the story...\n\n{{HOOK}}\n\nWhen I started selling online, I spent HOURS writing product descriptions. One listing could take an entire evening. Then I realized \u2014 if I was struggling, thousands of other sellers were too.\n\nSo I built {{TOOL_NAME}}. It's completely free, and here's what it does:\n\n\u2705 Generates professional product descriptions in seconds\n\u2705 Creates SEO-optimized titles that actually rank\n\u2705 Produces trending hashtags for social media\n\u2705 Writes review responses that build trust\n\nNo signup required. No hidden costs. Just tools that work.\n\nTry it yourself \ud83d\udc47\n{{SITE_URL}}\n\nTag a fellow seller who needs this! \ud83d\ude4c`,
    postingTips: [
      'Share to relevant Facebook groups (seller communities)',
      'Ask a question at the end to drive comments',
      'Longer posts perform well on Facebook \u2014 tell your story',
      'Post mid-week mornings for best engagement'
    ],
    accentColor: '#1877F2'
  },
  {
    platform: 'YouTube Shorts',
    iconEmoji: '\u25b6\ufe0f',
    hookStyle: 'Title-driven, SEO keywords, concise description',
    maxChars: 100,
    captionTemplate: `TITLE: AI Writes Product Descriptions in 3 Seconds | Free Tool for Sellers\n\nDESCRIPTION:\n{{HOOK}}\n\nIn this video I show you how {{TOOL_NAME}} generates professional product descriptions, SEO titles, and hashtags instantly.\n\n\ud83d\udd17 Try it free: {{SITE_URL}}\n\n#Shorts #AITools #ProductDescription #Ecommerce #FreeTools #SellerHacks #SEO`,
    postingTips: [
      'Keep title under 100 characters for mobile display',
      'Front-load keywords in the title for YouTube SEO',
      'Add timestamps if the Short is longer than 30 seconds',
      'Pin a comment with the direct link to the tool'
    ],
    accentColor: '#FF0000'
  },
  {
    platform: 'TikTok',
    iconEmoji: '\ud83c\udfb5',
    hookStyle: 'Trend-driven, casual, hook in first line',
    maxChars: 2200,
    captionTemplate: `POV: You discover a free tool that writes better descriptions than you \ud83e\udd2f\n\n{{HOOK}}\n\nThis tool literally changed my business \ud83d\udc47\nTry {{TOOL_NAME}} for free!\n\n\ud83d\udd17 {{SITE_URL}}\n\n#aitools #productdescription #ecommerce #sellerhacks #freetools #smallbusiness #onlineseller #fyp #viral #techtok #aitok`,
    postingTips: [
      'Use trending audio/sounds from the TikTok library',
      'Hook viewers in the first 1-2 seconds visually',
      'Text overlay with the hook boosts retention',
      'Post 3-5 times per day for algorithm momentum'
    ],
    accentColor: '#000000'
  },
  {
    platform: 'Threads',
    iconEmoji: '\ud83e\udde0',
    hookStyle: 'Conversational, short, engagement-bait',
    maxChars: 500,
    captionTemplate: `Hot take: If you're still writing product descriptions by hand in 2024, you're losing money. Here's why \ud83d\udc47\n\n{{HOOK}}\n\nI built {{TOOL_NAME}} to fix this. It's free, takes 3 seconds, and writes better copy than most humans.\n\nTry it: {{SITE_URL}}\n\nWhat tool do YOU use for product descriptions? Reply below \ud83d\udc47`,
    postingTips: [
      'Keep it conversational and opinionated',
      'End with a question to drive replies',
      'Threads favors text-only posts over links',
      'Engage with replies to boost visibility'
    ],
    accentColor: '#000000'
  },
  {
    platform: 'LinkedIn',
    iconEmoji: '\ud83d\udcbc',
    hookStyle: 'Professional framing, business value, credibility',
    maxChars: 3000,
    captionTemplate: `I've been building AI tools for e-commerce sellers. The results have been remarkable \u2014 10,000+ descriptions generated, countless hours saved.\n\n{{HOOK}}\n\nHere's what I learned while building {{TOOL_NAME}}:\n\n1\ufe0f\u20e3 Most sellers spend 2-3 hours per listing on copywriting\n2\ufe0f\u20e3 AI-generated descriptions convert equally well (and sometimes better)\n3\ufe0f\u20e3 The real bottleneck isn't quality \u2014 it's consistency at scale\n\nThat's why I made this tool completely free. No signup, no upsells, no catch.\n\nIf you sell online (or know someone who does), try it:\n{{SITE_URL}}\n\nWhat's the biggest time sink in your e-commerce workflow? I'd love to hear from fellow builders and sellers.\n\n#AITools #Ecommerce #Productivity #StartupJourney #SellerTools #ArtificialIntelligence`,
    postingTips: [
      'Frame as a learning/insight post, not a sales pitch',
      'Use numbered lists for readability on mobile',
      'Tag relevant people or companies for reach',
      'Post Tuesday-Thursday 7-9 AM for best engagement'
    ],
    accentColor: '#0A66C2'
  },
  {
    platform: 'WhatsApp Status',
    iconEmoji: '\ud83d\udce9',
    hookStyle: 'Personal tone, FOMO-driven, short & punchy',
    maxChars: 700,
    captionTemplate: `Found this amazing free AI tool \ud83c\udf81\n\nGenerates product descriptions, hashtags, SEO titles \u2014 try it!\n\n{{HOOK}}\n\n\ud83d\udd17 {{SITE_URL}}\n\nTotally free. No signup needed. Share with anyone who sells online! \ud83d\ude4f`,
    postingTips: [
      'Keep it under 700 chars for full status visibility',
      'Use emojis to break up text visually',
      'Post during peak WhatsApp hours (evenings PKT)',
      'Encourage forwarding to multiply reach'
    ],
    accentColor: '#25D366'
  },
  {
    platform: 'Pinterest',
    iconEmoji: '\ud83d\udccc',
    hookStyle: 'Keyword-rich description, action-oriented, SEO-focused',
    maxChars: 500,
    captionTemplate: `Free AI Product Description Generator \u2014 Create SEO-Optimized Listings in Seconds | E-commerce Tools\n\n{{HOOK}}\n\nStop spending hours writing product descriptions. This free AI tool generates professional, keyword-rich descriptions for any product in seconds. Perfect for Etsy, Shopify, Daraz, and Amazon sellers.\n\n\u2705 Professional descriptions\n\u2705 SEO-optimized titles\n\u2705 Trending hashtags\n\u2705 Review responses\n\nTry it free: {{SITE_URL}}\n\nSave this pin for later! \ud83d\udccc`,
    postingTips: [
      'Design a vertical pin image (1000x1500px)',
      'Include text overlay with the key benefit',
      'Keywords in description drive Pinterest search',
      'Pin consistently \u2014 5-10 pins per day'
    ],
    accentColor: '#E60023'
  }
];

export function generatePlatformCaptions(
  toolName: string,
  toolSlug: string,
  hook: string,
  siteUrl?: string
): Array<{ platform: string; iconEmoji: string; hookStyle: string; maxChars: number; caption: string; postingTips: string[]; accentColor: string }> {
  const url = siteUrl || import.meta.env.VITE_SITE_URL || 'https://mgblessed.icod.ai';

  return platformCaptionTemplates.map((template) => {
    let caption = template.captionTemplate
      .replace(/\{\{TOOL_NAME\}\}/g, toolName)
      .replace(/\{\{HOOK\}\}/g, hook)
      .replace(/\{\{SITE_URL\}\}/g, url);

    // For YouTube Shorts, truncate the TITLE line to maxChars
    if (template.platform === 'YouTube Shorts') {
      const lines = caption.split('\n');
      const titleLine = lines[0]; // "TITLE: ..."
      if (titleLine.length > template.maxChars) {
        lines[0] = titleLine.substring(0, template.maxChars - 3) + '...';
      }
      caption = lines.join('\n');
    }

    return {
      platform: template.platform,
      iconEmoji: template.iconEmoji,
      hookStyle: template.hookStyle,
      maxChars: template.maxChars,
      caption,
      postingTips: template.postingTips,
      accentColor: template.accentColor
    };
  });
}
