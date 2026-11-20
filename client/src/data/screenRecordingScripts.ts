export interface RecordingStep {
  timestamp: string;
  action: string;
  narration: string;
  visualNotes?: string;
}

export interface RecordingScript {
  tool: string;
  toolSlug: string;
  duration: string;
  platform: 'Instagram Reels' | 'TikTok' | 'YouTube Shorts' | 'All';
  steps: RecordingStep[];
  tips: string[];
}

export const recordingScripts: RecordingScript[] = [
  {
    tool: 'Product Description Generator',
    toolSlug: 'product-description-generator',
    duration: '30-45 seconds',
    platform: 'All',
    steps: [
      {
        timestamp: '0:00-0:05',
        action: 'Show boring product description on screen',
        narration: 'Still writing descriptions like this?',
        visualNotes: 'Use red X or sad emoji overlay'
      },
      {
        timestamp: '0:05-0:10',
        action: 'Open MG Blessed Beginnings tool',
        narration: 'I built a free AI tool that does this in seconds',
        visualNotes: 'Screen recording of tool homepage'
      },
      {
        timestamp: '0:10-0:20',
        action: 'Type product details and click generate',
        narration: 'Just enter your product name, features, and tone',
        visualNotes: 'Speed up typing slightly for pacing'
      },
      {
        timestamp: '0:20-0:30',
        action: 'Show generated description',
        narration: 'Boom! Professional description that actually sells',
        visualNotes: 'Highlight key selling points with arrows'
      },
      {
        timestamp: '0:30-0:35',
        action: 'Show CTA',
        narration: 'Try it free — link in bio',
        visualNotes: 'Point to bio link or show URL overlay'
      }
    ],
    tips: [
      'Use trending audio in background at 20% volume',
      'Add captions for accessibility',
      'Show real product example for authenticity',
      'End with clear call-to-action text overlay'
    ]
  },
  {
    tool: 'SEO Title Optimizer',
    toolSlug: 'seo-title-optimizer',
    duration: '25-35 seconds',
    platform: 'All',
    steps: [
      {
        timestamp: '0:00-0:05',
        action: 'Show weak product title with low views',
        narration: 'Your product title is killing your sales',
        visualNotes: 'Show analytics screenshot with low impressions'
      },
      {
        timestamp: '0:05-0:12',
        action: 'Enter title into SEO optimizer tool',
        narration: 'This free tool rewrites your title for maximum visibility',
        visualNotes: 'Quick screen capture of input field'
      },
      {
        timestamp: '0:12-0:22',
        action: 'Show optimized title with keywords highlighted',
        narration: 'Look at these keyword-rich titles it generates',
        visualNotes: 'Highlight keywords in different colors'
      },
      {
        timestamp: '0:22-0:30',
        action: 'Show before/after comparison',
        narration: 'From invisible to page one rankings',
        visualNotes: 'Side-by-side comparison graphic'
      },
      {
        timestamp: '0:30-0:35',
        action: 'CTA with link',
        narration: 'Optimize your titles free — link in bio',
        visualNotes: 'Animated arrow pointing to bio'
      }
    ],
    tips: [
      'Show actual search results if possible',
      'Use suspenseful music for the reveal',
      'Include platform-specific tips (Etsy vs eBay)',
      'Mention character limits for credibility'
    ]
  },
  {
    tool: 'Hashtag Generator',
    toolSlug: 'hashtag-generator',
    duration: '30-40 seconds',
    platform: 'Instagram Reels',
    steps: [
      {
        timestamp: '0:00-0:05',
        action: 'Show post with 0 views using generic hashtags',
        narration: 'Stop using #fyp. Use THESE instead',
        visualNotes: 'Screenshot of poor-performing post'
      },
      {
        timestamp: '0:05-0:15',
        action: 'Enter niche keyword into hashtag generator',
        narration: 'Enter your niche and get 30 targeted hashtags instantly',
        visualNotes: 'Show tool interface clearly'
      },
      {
        timestamp: '0:15-0:25',
        action: 'Show categorized hashtags (trending, niche, community)',
        narration: 'It even categorizes them by strategy',
        visualNotes: 'Color-code each category'
      },
      {
        timestamp: '0:25-0:35',
        action: 'Copy hashtags and show improved post performance',
        narration: 'Watch your reach explode',
        visualNotes: 'Show analytics improvement graph'
      },
      {
        timestamp: '0:35-0:40',
        action: 'CTA',
        narration: 'Get your hashtags free — link in bio',
        visualNotes: 'Text overlay with arrow'
      }
    ],
    tips: [
      'Use Instagram-native editing style',
      'Show real follower growth if available',
      'Explain why generic hashtags fail',
      'Include hashtag count recommendation (3-5-10 rule)'
    ]
  },
  {
    tool: 'Listing Optimizer',
    toolSlug: 'listing-optimizer',
    duration: '35-45 seconds',
    platform: 'TikTok',
    steps: [
      {
        timestamp: '0:00-0:07',
        action: 'Show seller frustrated with low views',
        narration: 'Your listings aren\'t getting seen? Here\'s why.',
        visualNotes: 'Start with sad face, low view count overlay'
      },
      {
        timestamp: '0:07-0:15',
        action: 'Enter product details into optimizer',
        narration: 'Let me show you how to fix it',
        visualNotes: 'Screen record entering product info'
      },
      {
        timestamp: '0:15-0:28',
        action: 'Show AI analyzing title, description, keywords',
        narration: 'It checks your title, description, keywords...',
        visualNotes: 'Each section animates with checkmarks or warnings'
      },
      {
        timestamp: '0:28-0:38',
        action: 'Reveal listing score and suggestions',
        narration: 'Your score? 85/100. Here\'s how to reach 100.',
        visualNotes: 'Big score reveal with improvement tips highlighted'
      },
      {
        timestamp: '0:38-0:45',
        action: 'CTA with rocket emoji',
        narration: 'Stop guessing. Optimize your listings free — link in bio',
        visualNotes: 'Rocket emoji + link arrow'
      }
    ],
    tips: [
      'Use upbeat success sound effect',
      'Show real listing examples for authenticity',
      'Include before/after score comparison',
      'Create urgency around listing optimization'
    ]
  },
  {
    tool: 'Competitor Analyzer',
    toolSlug: 'competitor-analyzer',
    duration: '40-50 seconds',
    platform: 'All',
    steps: [
      {
        timestamp: '0:00-0:06',
        action: 'Show competitor outselling you',
        narration: 'Why are they outselling you? Let\'s find out.',
        visualNotes: 'Frustrated seller POV shot'
      },
      {
        timestamp: '0:06-0:15',
        action: 'Enter competitor URL into analyzer',
        narration: 'This tool legally spies on your competitors',
        visualNotes: 'Screen recording of tool input'
      },
      {
        timestamp: '0:15-0:30',
        action: 'Show competitor analysis results',
        narration: 'Look at their keywords, pricing gaps, and weaknesses',
        visualNotes: 'Highlight key findings with annotations'
      },
      {
        timestamp: '0:30-0:42',
        action: 'Show opportunity insights',
        narration: 'Here\'s exactly how to beat them',
        visualNotes: 'Green checkmarks for opportunities'
      },
      {
        timestamp: '0:42-0:50',
        action: 'CTA',
        narration: 'Analyze your competitors free — link in bio',
        visualNotes: 'Spy emoji + link animation'
      }
    ],
    tips: [
      'Use spy/detective theme music',
      'Blur actual competitor names for privacy',
      'Focus on actionable insights',
      'Create FOMO around competitor intelligence'
    ]
  },
  {
    tool: 'Review Response Writer',
    toolSlug: 'review-response-writer',
    duration: '30-40 seconds',
    platform: 'All',
    steps: [
      {
        timestamp: '0:00-0:05',
        action: 'Show pile of unread reviews',
        narration: '50 reviews waiting for responses. No time.',
        visualNotes: 'Overwhelmed seller expression'
      },
      {
        timestamp: '0:05-0:12',
        action: 'Paste review into response writer',
        narration: 'This AI writes professional responses in seconds',
        visualNotes: 'Quick paste and generate action'
      },
      {
        timestamp: '0:12-0:22',
        action: 'Show personalized, warm response',
        narration: 'Personalized, on-brand, and builds customer loyalty',
        visualNotes: 'Highlight personalization elements'
      },
      {
        timestamp: '0:22-0:30',
        action: 'Show negative review transformation',
        narration: 'Even turns bad reviews into trust-building moments',
        visualNotes: 'Before/after of difficult review response'
      },
      {
        timestamp: '0:30-0:35',
        action: 'Batch response demo',
        narration: 'Respond to 50 reviews in 5 minutes',
        visualNotes: 'Speed through multiple responses'
      },
      {
        timestamp: '0:35-0:40',
        action: 'CTA',
        narration: 'Write better responses free — link in bio',
        visualNotes: 'Heart emoji + link'
      }
    ],
    tips: [
      'Show real review examples (anonymized)',
      'Emphasize time savings',
      'Include both positive and negative review demos',
      'Mention brand voice consistency'
    ]
  },
  {
    tool: 'Listing Optimizer',
    toolSlug: 'listing-optimizer',
    duration: '35-45 seconds',
    platform: 'YouTube Shorts',
    steps: [
      {
        timestamp: '0:00-0:06',
        action: 'Show listing on page 5 of search results',
        narration: 'Your listing is invisible. Here\'s why.',
        visualNotes: 'Scroll through search pages dramatically'
      },
      {
        timestamp: '0:06-0:15',
        action: 'Paste current listing into optimizer',
        narration: 'Let the AI analyze what\'s wrong',
        visualNotes: 'Tool scanning animation'
      },
      {
        timestamp: '0:15-0:28',
        action: 'Show optimization recommendations',
        narration: 'New title, better description, missing keywords revealed',
        visualNotes: 'Checklist animation with green checks'
      },
      {
        timestamp: '0:28-0:38',
        action: 'Apply optimizations and show improved listing',
        narration: 'Copy, paste, and watch your ranking climb',
        visualNotes: 'Before/after side by side'
      },
      {
        timestamp: '0:38-0:45',
        action: 'Results + CTA',
        narration: 'From page 5 to page 1. Optimize free — link in bio',
        visualNotes: 'Ranking improvement graph + link'
      }
    ],
    tips: [
      'Show real ranking improvements if available',
      'Break down each optimization clearly',
      'Use platform-specific examples',
      'Include quick-win vs long-term tips'
    ]
  },
  {
    tool: 'Social Media Studio',
    toolSlug: 'social-media-studio',
    duration: '40-50 seconds',
    platform: 'All',
    steps: [
      {
        timestamp: '0:00-0:06',
        action: 'Show chaotic content planning (sticky notes everywhere)',
        narration: 'Stop posting randomly. Do this instead.',
        visualNotes: 'Messy desk / overwhelmed creator aesthetic'
      },
      {
        timestamp: '0:06-0:15',
        action: 'Enter business type into Social Media Studio',
        narration: 'Tell the AI about your business and platforms',
        visualNotes: 'Clean tool interface demo'
      },
      {
        timestamp: '0:15-0:30',
        action: 'Show generated content calendar',
        narration: 'A full month of posts, captions, and hashtags — done',
        visualNotes: 'Calendar view with color-coded content types'
      },
      {
        timestamp: '0:30-0:42',
        action: 'Show individual post previews',
        narration: 'Every caption written, every hashtag researched',
        visualNotes: 'Scroll through generated posts'
      },
      {
        timestamp: '0:42-0:50',
        action: 'Time savings + CTA',
        narration: 'A month of content in 10 minutes. Plan free — link in bio',
        visualNotes: 'Clock animation + satisfied creator'
      }
    ],
    tips: [
      'Show real content calendar output',
      'Emphasize consistency benefits',
      'Include best posting times tip',
      'Mention multi-platform support'
    ]
  }
];

export function getScriptBySlug(slug: string): RecordingScript | undefined {
  return recordingScripts.find((s) => s.toolSlug === slug);
}

export function getScriptsByPlatform(platform: RecordingScript['platform']): RecordingScript[] {
  return recordingScripts.filter((s) => s.platform === platform || s.platform === 'All');
}
