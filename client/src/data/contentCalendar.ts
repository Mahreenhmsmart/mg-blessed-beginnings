export interface DailyContentPlan {
  theme: string;
  hook: string;
  tool: string;
  format: 'Before/After' | 'Tutorial' | 'Story' | 'Case Study' | 'Quick Demo' | 'Testimonial' | 'Tips & Tricks';
  platforms: ('Instagram' | 'TikTok' | 'YouTube' | 'Twitter' | 'Pinterest' | 'LinkedIn' | 'Facebook')[];
  bestTimeToPost: string;
  contentPillars: string[];
}

export interface WeeklyContentPlan {
  [day: string]: DailyContentPlan;
}

export const weeklyContentPlan: WeeklyContentPlan = {
  Monday: {
    theme: 'Problem Awareness',
    hook: 'Show the pain point your audience faces',
    tool: 'Any tool',
    format: 'Before/After',
    platforms: ['Instagram', 'TikTok', 'LinkedIn'],
    bestTimeToPost: '9:00 AM - 11:00 AM EST',
    contentPillars: ['Identify common seller struggles', 'Show relatable frustration moments', 'Position tool as the solution']
  },
  Tuesday: {
    theme: 'Quick Tip',
    hook: 'Did you know... (share surprising insight)',
    tool: 'SEO Title Optimizer or Hashtag Generator',
    format: 'Tutorial',
    platforms: ['TikTok', 'Instagram', 'YouTube'],
    bestTimeToPost: '12:00 PM - 2:00 PM EST',
    contentPillars: ['Share actionable advice', 'Teach one specific skill', 'Provide immediate value']
  },
  Wednesday: {
    theme: 'Behind the Scenes',
    hook: 'How I built this... (creator journey)',
    tool: 'Any tool',
    format: 'Story',
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    bestTimeToPost: '6:00 PM - 8:00 PM EST',
    contentPillars: ['Show development process', 'Share founder story', 'Build personal connection']
  },
  Thursday: {
    theme: 'Results & Proof',
    hook: 'The numbers don\'t lie (show real outcomes)',
    tool: 'Profit Calculator or Competitor Analyzer',
    format: 'Case Study',
    platforms: ['LinkedIn', 'Instagram', 'Twitter'],
    bestTimeToPost: '10:00 AM - 12:00 PM EST',
    contentPillars: ['Share user success stories', 'Display concrete metrics', 'Build credibility with data']
  },
  Friday: {
    theme: 'Fun & Easy Wins',
    hook: 'Watch this magic happen (entertaining demo)',
    tool: 'Review Response Writer or Social Media Studio',
    format: 'Quick Demo',
    platforms: ['TikTok', 'Instagram', 'YouTube'],
    bestTimeToPost: '3:00 PM - 5:00 PM EST',
    contentPillars: ['Keep it light and entertaining', 'Show quick wins', 'End the week on high energy']
  },
  Saturday: {
    theme: 'Community Spotlight',
    hook: 'Look what our users created! (UGC showcase)',
    tool: 'Product Description Generator or Listing Optimizer',
    format: 'Testimonial',
    platforms: ['Instagram', 'Facebook', 'Pinterest'],
    bestTimeToPost: '10:00 AM - 1:00 PM EST',
    contentPillars: ['Feature user testimonials', 'Share community wins', 'Encourage user submissions']
  },
  Sunday: {
    theme: 'Planning & Prep',
    hook: 'Start your week right with this strategy',
    tool: 'Social Media Studio',
    format: 'Tips & Tricks',
    platforms: ['Instagram', 'Pinterest', 'LinkedIn'],
    bestTimeToPost: '7:00 PM - 9:00 PM EST',
    contentPillars: ['Help audience plan ahead', 'Share productivity tips', 'Set up for successful week']
  }
};

export interface ContentPillar {
  name: string;
  description: string;
  percentage: number;
  examples: string[];
}

export const contentPillars: ContentPillar[] = [
  {
    name: 'Educational',
    description: 'Teach your audience something valuable about e-commerce, SEO, or AI tools',
    percentage: 40,
    examples: [
      'How to write product descriptions that convert',
      '5 SEO mistakes killing your Etsy sales',
      'The math behind profitable pricing',
      'Hashtag strategy masterclass'
    ]
  },
  {
    name: 'Entertaining',
    description: 'Fun, relatable content that builds connection and shareability',
    percentage: 25,
    examples: [
      'POV: You just discovered AI tools',
      'Seller struggles we all relate to',
      'When your listing finally ranks #1',
      'E-commerce memes and trends'
    ]
  },
  {
    name: 'Inspirational',
    description: 'Motivate sellers with success stories and possibilities',
    percentage: 20,
    examples: [
      'From 0 to $10K/month journey',
      'Small business wins celebration',
      'Why starting now matters',
      'Dream big, automate smart'
    ]
  },
  {
    name: 'Promotional',
    description: 'Direct tool promotion and feature showcases',
    percentage: 15,
    examples: [
      'New feature announcement',
      'Tool tutorial walkthrough',
      'Free tool reminder',
      'Limited-time offer or update'
    ]
  }
];

export interface PlatformStrategy {
  platform: string;
  optimalLength: string;
  postingFrequency: string;
  bestFormats: string[];
  hashtagStrategy: string;
  keyMetrics: string[];
}

export const platformStrategies: PlatformStrategy[] = [
  {
    platform: 'Instagram',
    optimalLength: 'Reels: 15-30s, Captions: 150-300 words',
    postingFrequency: '4-5x per week (mix of Reels, Stories, Carousels)',
    bestFormats: ['Reels', 'Carousels', 'Stories with polls'],
    hashtagStrategy: '3-5 broad + 10-15 niche + 5-10 community hashtags',
    keyMetrics: ['Reach', 'Saves', 'Shares', 'Profile visits']
  },
  {
    platform: 'TikTok',
    optimalLength: '15-60 seconds (sweet spot: 30-45s)',
    postingFrequency: '5-7x per week',
    bestFormats: ['Quick tutorials', 'Before/after reveals', 'Trending audio adaptations'],
    hashtagStrategy: '3-5 trending + 3-5 niche + 1-2 branded',
    keyMetrics: ['Views', 'Completion rate', 'Shares', 'Follows']
  },
  {
    platform: 'YouTube Shorts',
    optimalLength: 'Under 60 seconds',
    postingFrequency: '3-5x per week',
    bestFormats: ['Tool demos', 'Quick tips', 'Results showcases'],
    hashtagStrategy: 'Include in title and description, 3-5 relevant tags',
    keyMetrics: ['Views', 'Watch time', 'Subscriber conversion']
  },
  {
    platform: 'Twitter/X',
    optimalLength: 'Threads: 5-10 tweets, Single: under 280 chars',
    postingFrequency: 'Daily engagement + 3-5 original posts/week',
    bestFormats: ['Threads', 'Polls', 'Quick tips', 'Tool screenshots'],
    hashtagStrategy: '1-3 relevant hashtags maximum',
    keyMetrics: ['Impressions', 'Engagement rate', 'Link clicks']
  },
  {
    platform: 'Pinterest',
    optimalLength: 'Pin description: 100-200 characters',
    postingFrequency: '5-10 pins per day (including repins)',
    bestFormats: ['Infographics', 'Step-by-step guides', 'Tool screenshots'],
    hashtagStrategy: '2-5 keyword-rich hashtags',
    keyMetrics: ['Impressions', 'Saves', 'Outbound clicks']
  }
];

export interface Week2DailyPlan {
  theme: string;
  hook: string;
  tool: string;
  toolSlug: string;
  format: 'Tool Demo' | 'Before/After' | 'Tutorial';
  platforms: ('Instagram' | 'TikTok' | 'YouTube' | 'Twitter' | 'Pinterest' | 'LinkedIn' | 'Facebook')[];
  bestTimeToPost: string;
  contentPillars: string[];
}

export interface Week2ContentPlan {
  [day: string]: Week2DailyPlan;
}

export const week2ContentPlan: Week2ContentPlan = {
  Monday: {
    theme: 'Product Description Generator',
    hook: 'Give me any product. I\'ll show you how AI creates its description.',
    tool: 'Product Description Generator',
    toolSlug: 'product-description-generator',
    format: 'Tool Demo',
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    bestTimeToPost: '9:00 AM - 11:00 AM EST',
    contentPillars: ['Demonstrate AI writing capability', 'Show before/after transformation', 'Highlight time savings']
  },
  Tuesday: {
    theme: 'SEO Title Optimizer',
    hook: 'Your product title might be killing your SEO.',
    tool: 'SEO Title Optimizer',
    toolSlug: 'seo-title-optimizer',
    format: 'Before/After',
    platforms: ['Instagram', 'TikTok', 'YouTube', 'LinkedIn'],
    bestTimeToPost: '12:00 PM - 2:00 PM EST',
    contentPillars: ['Show SEO impact of bad titles', 'Demonstrate keyword optimization', 'Reveal ranking improvements']
  },
  Wednesday: {
    theme: 'Hashtag Generator',
    hook: 'Here\'s how I generate 30 hashtags in seconds.',
    tool: 'Hashtag Generator',
    toolSlug: 'hashtag-generator',
    format: 'Tool Demo',
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    bestTimeToPost: '6:00 PM - 8:00 PM EST',
    contentPillars: ['Show speed of hashtag generation', 'Explain categorization strategy', 'Demonstrate one-click copy']
  },
  Thursday: {
    theme: 'Review Response Writer',
    hook: 'Don\'t know how to reply to a negative review?',
    tool: 'Review Response Writer',
    toolSlug: 'review-response-writer',
    format: 'Tutorial',
    platforms: ['Instagram', 'TikTok', 'YouTube', 'LinkedIn'],
    bestTimeToPost: '10:00 AM - 12:00 PM EST',
    contentPillars: ['Address negative review anxiety', 'Show empathetic response generation', 'Build customer trust narrative']
  },
  Friday: {
    theme: 'Competitor Analyzer',
    hook: 'Want to check your competitors?',
    tool: 'Competitor Analyzer',
    toolSlug: 'competitor-analyzer',
    format: 'Tool Demo',
    platforms: ['Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Twitter'],
    bestTimeToPost: '3:00 PM - 5:00 PM EST',
    contentPillars: ['Create competitive intelligence FOMO', 'Reveal actionable insights', 'Show strategic advantage']
  },
  Saturday: {
    theme: 'Listing Optimizer',
    hook: 'Optimize your product listings for maximum visibility.',
    tool: 'Listing Optimizer',
    toolSlug: 'listing-optimizer',
    format: 'Tutorial',
    platforms: ['TikTok', 'Instagram', 'YouTube', 'Twitter'],
    bestTimeToPost: '10:00 AM - 1:00 PM EST',
    contentPillars: ['Improve listing quality', 'Boost search rankings', 'Drive more sales']
  },
  Sunday: {
    theme: 'AI Business Dashboard',
    hook: 'One AI dashboard for your online business.',
    tool: 'AI Business Dashboard',
    toolSlug: 'ai-tools',
    format: 'Tool Demo',
    platforms: ['Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Twitter'],
    bestTimeToPost: '7:00 PM - 9:00 PM EST',
    contentPillars: ['Showcase unified toolkit', 'Emphasize workflow efficiency', 'Drive overall platform adoption']
  }
};

export function getDayPlan(day: string): DailyContentPlan | undefined {
  return weeklyContentPlan[day];
}

export function getNextPostingDay(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];
  return today;
}
