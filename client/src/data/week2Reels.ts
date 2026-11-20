import type { RecordingStep } from './screenRecordingScripts';

export interface Week2Reel {
  day: number;
  title: string;
  hook: string;
  toolSlug: string;
  toolName: string;
  problemSetup: string;
  demoScript: RecordingStep[];
  caption: string;
  hashtags: string[];
  ctaText: string;
  suggestedAudio: string;
  platforms: ('Instagram' | 'TikTok' | 'YouTube' | 'Twitter' | 'Pinterest' | 'LinkedIn' | 'Facebook')[];
}

export const week2Reels: Week2Reel[] = [
  {
    day: 1,
    title: 'Product Description Generator Demo',
    hook: 'Give me any product. I\'ll show you how AI creates its description.',
    toolSlug: 'product-description-generator',
    toolName: 'Product Description Generator',
    problemSetup: 'You stare at a blank screen trying to write a product description that actually sells. Hours pass and you still have nothing compelling.',
    demoScript: [
      {
        timestamp: '0:00-0:03',
        action: 'Face camera with confident expression',
        narration: 'Give me any product. I\'ll show you how AI creates its description.',
        visualNotes: 'Direct eye contact, text overlay of the hook appears on screen'
      },
      {
        timestamp: '0:03-0:08',
        action: 'Open the Product Description Generator tool',
        narration: 'I built this free AI tool for online sellers who hate writing descriptions.',
        visualNotes: 'Screen recording showing clean tool interface loading'
      },
      {
        timestamp: '0:08-0:15',
        action: 'Type "handmade leather wallet" into the product name field',
        narration: 'Just enter your product name and a few key features.',
        visualNotes: 'Speed up typing slightly, zoom in on input field for clarity'
      },
      {
        timestamp: '0:15-0:22',
        action: 'Click Generate and watch AI produce the description',
        narration: 'Hit generate and watch the magic happen in seconds.',
        visualNotes: 'Show loading animation then reveal generated text with highlight effect'
      },
      {
        timestamp: '0:22-0:28',
        action: 'Read through the generated description highlighting key selling points',
        narration: 'Professional, persuasive, and ready to convert — no copywriter needed.',
        visualNotes: 'Highlight keywords and power phrases with colored overlays'
      },
      {
        timestamp: '0:28-0:33',
        action: 'Click Copy button and show CTA',
        narration: 'One click to copy. Try it free — link in bio.',
        visualNotes: 'Copy confirmation animation + arrow pointing to profile link'
      }
    ],
    caption: 'Struggling to write product descriptions that actually sell? 😩\n\nI used to spend HOURS staring at a blank screen. Then I built this free AI tool.\n\nEnter your product → Get a professional, conversion-ready description in seconds.\n\nNo copywriting skills needed. No expensive freelancers. Just better descriptions, faster.\n\n🔗 Try it free — link in bio!\n\n#aitools #ecommerce #productdescription #onlineselling #copywriting #smallbusiness #etsyseller #shopify #freelancing #aiwriting #contentcreation #digitalmarketing #sellerlife #ecommercetips #productlisting #mgbbtools',
    hashtags: [
      '#aitools', '#ecommerce', '#productdescription', '#onlineselling', '#copywriting',
      '#smallbusiness', '#etsyseller', '#shopify', '#freelancing', '#aiwriting',
      '#contentcreation', '#digitalmarketing', '#sellerlife', '#ecommercetips',
      '#productlisting', '#mgbbtools', '#freesoftware', '#sidehustle'
    ],
    ctaText: 'Try the Product Description Generator free — link in bio!',
    suggestedAudio: 'Upbeat corporate / trending TikTok tutorial beat',
    platforms: ['Instagram', 'TikTok', 'YouTube']
  },
  {
    day: 2,
    title: 'SEO Title Optimizer Demo',
    hook: 'Your product title might be killing your SEO.',
    toolSlug: 'seo-title-optimizer',
    toolName: 'SEO Title Optimizer',
    problemSetup: 'Your products are invisible because your titles don\'t match what buyers actually search for. One bad title can cost you thousands of impressions.',
    demoScript: [
      {
        timestamp: '0:00-0:04',
        action: 'Show a weak product title with red warning indicator',
        narration: 'Your product title might be killing your SEO. Here\'s proof.',
        visualNotes: 'Display "Women\'s Bag" as example bad title with red X overlay'
      },
      {
        timestamp: '0:04-0:10',
        action: 'Paste the bad title into the SEO Title Optimizer',
        narration: 'Let me run this through our free SEO title optimizer.',
        visualNotes: 'Screen recording of pasting title and clicking Analyze'
      },
      {
        timestamp: '0:10-0:18',
        action: 'Show the analysis results — keyword gaps and suggestions',
        narration: 'The AI identifies missing keywords and generates optimized alternatives.',
        visualNotes: 'Highlight keyword suggestions in green, missing terms in yellow'
      },
      {
        timestamp: '0:18-0:26',
        action: 'Show before/after comparison side by side',
        narration: 'From "Women\'s Bag" to a keyword-rich title that ranks on page one.',
        visualNotes: 'Split-screen comparison with before (red) and after (green) styling'
      },
      {
        timestamp: '0:26-0:32',
        action: 'Copy the optimized title and show CTA',
        narration: 'Better titles mean more visibility. Optimize yours free — link in bio.',
        visualNotes: 'Copy animation + text overlay with URL'
      }
    ],
    caption: 'Your product title is the #1 factor in whether buyers find you. 🔍\n\nBad title = invisible listing. Good title = page one rankings.\n\nThis free AI tool analyzes your title and generates SEO-optimized alternatives in seconds.\n\nBefore: "Women\'s Bag"\nAfter: "Vintage Leather Crossbody Bag | Women\'s Designer Purse | Adjustable Strap | Gift for Her"\n\nSee the difference? 🔥\n\n🔗 Optimize your titles free — link in bio!\n\n#seotools #seotitle #ecommerce #etsy #shopify #productlisting #keywords #searchengineoptimization #onlineselling #smallbusiness #digitalmarketing #aitools #sellonline #mgbbtools #seostrategy #listingoptimization',
    hashtags: [
      '#seotools', '#seotitle', '#ecommerce', '#etsy', '#shopify',
      '#productlisting', '#keywords', '#searchengineoptimization', '#onlineselling',
      '#smallbusiness', '#digitalmarketing', '#aitools', '#sellonline',
      '#mgbbtools', '#seostrategy', '#listingoptimization', '#freetools'
    ],
    ctaText: 'Optimize your titles free — link in bio!',
    suggestedAudio: 'Suspenseful reveal / dramatic transformation sound',
    platforms: ['Instagram', 'TikTok', 'YouTube', 'LinkedIn']
  },
  {
    day: 3,
    title: 'Hashtag Generator Demo',
    hook: 'Here\'s how I generate 30 hashtags in seconds.',
    toolSlug: 'hashtag-generator',
    toolName: 'Hashtag Generator',
    problemSetup: 'You spend 20 minutes researching hashtags every time you post. Generic tags like #fyp get you nowhere while niche tags drive real engagement.',
    demoScript: [
      {
        timestamp: '0:00-0:03',
        action: 'Hold up phone showing a post with low reach',
        narration: 'Here\'s how I generate 30 targeted hashtags in seconds.',
        visualNotes: 'Quick flash of low-engagement post analytics'
      },
      {
        timestamp: '0:03-0:09',
        action: 'Open Hashtag Generator and enter topic "handmade jewelry"',
        narration: 'Enter your niche topic and let the AI do the research.',
        visualNotes: 'Clean screen capture of entering topic and clicking Generate'
      },
      {
        timestamp: '0:09-0:17',
        action: 'Show 30 categorized hashtags appearing instantly',
        narration: 'Thirty hashtags, organized by strategy — trending, niche, and community.',
        visualNotes: 'Color-coded hashtag groups with count badges'
      },
      {
        timestamp: '0:17-0:23',
        action: 'Click "Copy All" button',
        narration: 'One click copies everything. Paste directly into your post.',
        visualNotes: 'Copy confirmation toast notification animation'
      },
      {
        timestamp: '0:23-0:28',
        action: 'Show improved post performance comparison',
        narration: 'Stop guessing. Start ranking. Try it free — link in bio.',
        visualNotes: 'Before/after reach comparison graphic'
      }
    ],
    caption: 'Stop spending 20 minutes on hashtags every time you post. ⏱️\n\nGeneric tags like #fyp and #love get you ZERO reach.\n\nThis free AI tool generates 30 targeted hashtags in seconds — organized by trending, niche, and community categories.\n\nEnter your topic → Get 30 strategic hashtags → Copy all with one click.\n\nYour next viral post starts with better hashtags. 🚀\n\n🔗 Generate your hashtags free — link in bio!\n\n#hashtags #hashtaggenerator #instagramgrowth #tiktokgrowth #socialmedia #contentcreator #influencer #smallbusiness #digitalmarketing #engagement #reach #viral #aitools #socialmediatips #mgbbtools #contentmarketing #growyouraccount',
    hashtags: [
      '#hashtags', '#hashtaggenerator', '#instagramgrowth', '#tiktokgrowth',
      '#socialmedia', '#contentcreator', '#influencer', '#smallbusiness',
      '#digitalmarketing', '#engagement', '#reach', '#viral',
      '#aitools', '#socialmediatips', '#mgbbtools', '#contentmarketing',
      '#growyouraccount', '#freetools'
    ],
    ctaText: 'Generate your hashtags free — link in bio!',
    suggestedAudio: 'Viral transition sound / upbeat tech tutorial music',
    platforms: ['Instagram', 'TikTok', 'YouTube']
  },
  {
    day: 4,
    title: 'Review Response Writer Demo',
    hook: 'Don\'t know how to reply to a negative review?',
    toolSlug: 'review-response-writer',
    toolName: 'Review Response Writer',
    problemSetup: 'A customer left a 2-star review and you\'re frozen. You want to respond professionally but emotions are running high and you don\'t know what to say.',
    demoScript: [
      {
        timestamp: '0:00-0:04',
        action: 'Show a negative review with stressed seller expression',
        narration: 'Don\'t know how to reply to a negative review? Watch this.',
        visualNotes: 'Display actual-style 2-star review with worried emoji overlay'
      },
      {
        timestamp: '0:04-0:10',
        action: 'Paste the negative review into the Review Response Writer',
        narration: 'Paste the review and let AI craft a professional response.',
        visualNotes: 'Screen recording of paste action and tone selector set to Empathetic'
      },
      {
        timestamp: '0:10-0:18',
        action: 'Show the generated empathetic, professional response',
        narration: 'Empathetic, professional, and turns frustration into trust.',
        visualNotes: 'Highlight key empathy phrases with green underlines'
      },
      {
        timestamp: '0:18-0:24',
        action: 'Show a positive review being responded to as well',
        narration: 'Works great for positive reviews too — personalized every time.',
        visualNotes: 'Quick demo of 5-star review getting a warm, specific response'
      },
      {
        timestamp: '0:24-0:30',
        action: 'Copy the response and show CTA',
        narration: 'Respond to every review like a pro. Try it free — link in bio.',
        visualNotes: 'Copy animation + satisfied expression + link overlay'
      }
    ],
    caption: 'Got a bad review and don\'t know what to say? 😰\n\nIgnoring it makes it worse. A generic "sorry" doesn\'t help either.\n\nThis free AI tool writes professional, empathetic responses that turn unhappy customers into loyal fans.\n\nPaste any review → Choose your tone → Get a perfect response in seconds.\n\nPositive reviews? It handles those too. Every response feels personal, not robotic. 💕\n\n🔗 Write better responses free — link in bio!\n\n#reviewresponse #customerservice #smallbusiness #ecommerce #onlinereputation #customerexperience #businesstips #aitools #reputationmanagement #sellerlife #etsyseller #shopifyseller #professionalcommunication #mgbbtools #customersupport #freelancing',
    hashtags: [
      '#reviewresponse', '#customerservice', '#smallbusiness', '#ecommerce',
      '#onlinereputation', '#customerexperience', '#businesstips', '#aitools',
      '#reputationmanagement', '#sellerlife', '#etsyseller', '#shopifyseller',
      '#professionalcommunication', '#mgbbtools', '#customersupport',
      '#freelancing', '#freetools'
    ],
    ctaText: 'Write better responses free — link in bio!',
    suggestedAudio: 'Warm and friendly acoustic / customer service vibes',
    platforms: ['Instagram', 'TikTok', 'YouTube', 'LinkedIn']
  },
  {
    day: 5,
    title: 'Competitor Analyzer Demo',
    hook: 'Want to check your competitors?',
    toolSlug: 'competitor-analyzer',
    toolName: 'Competitor Analyzer',
    problemSetup: 'Your competitor is outselling you and you have no idea why. You need actionable intelligence, not guesswork.',
    demoScript: [
      {
        timestamp: '0:00-0:04',
        action: 'Point at camera with questioning expression',
        narration: 'Want to check your competitors? Here\'s the legal way.',
        visualNotes: 'Spy/detective themed intro with magnifying glass icon overlay'
      },
      {
        timestamp: '0:04-0:10',
        action: 'Enter a competitor URL into the Competitor Analyzer',
        narration: 'Enter any competitor\'s store URL and let the AI analyze it.',
        visualNotes: 'Screen recording showing URL input and Analyze button click'
      },
      {
        timestamp: '0:10-0:20',
        action: 'Show analysis results — strengths, weaknesses, opportunities',
        narration: 'Strengths, weaknesses, keyword gaps, and pricing insights revealed.',
        visualNotes: 'Animated charts and color-coded insight cards appearing'
      },
      {
        timestamp: '0:20-0:27',
        action: 'Highlight the biggest opportunity found',
        narration: 'Found it — they\'re missing this keyword entirely. That\'s your opening.',
        visualNotes: 'Zoom into specific opportunity with green highlight and arrow'
      },
      {
        timestamp: '0:27-0:33',
        action: 'Show CTA with competitive edge messaging',
        narration: 'Know what they\'re doing. Do it better. Analyze free — link in bio.',
        visualNotes: 'Competitive advantage graphic + link animation'
      }
    ],
    caption: 'Why are they outselling you? Let\'s find out. 🕵️\n\nGuessing what your competitors are doing is wasting your time.\n\nThis free AI tool analyzes any competitor\'s store and reveals:\n✅ Their top keywords\n❌ Their blind spots\n💡 Your biggest opportunities\n\nStop guessing. Start strategizing with data.\n\n🔗 Analyze your competitors free — link in bio!\n\n#competitoranalysis #competitiveintelligence #ecommerce #businessstrategy #marketresearch #smallbusiness #onlineselling #aitools #digitalmarketing #seo #keywordresearch #businessgrowth #entrepreneur #mgbbtools #strategicplanning #sellonline',
    hashtags: [
      '#competitoranalysis', '#competitiveintelligence', '#ecommerce',
      '#businessstrategy', '#marketresearch', '#smallbusiness', '#onlineselling',
      '#aitools', '#digitalmarketing', '#seo', '#keywordresearch',
      '#businessgrowth', '#entrepreneur', '#mgbbtools', '#strategicplanning',
      '#sellonline', '#freetools'
    ],
    ctaText: 'Analyze your competitors free — link in bio!',
    suggestedAudio: 'Spy theme music / investigation suspense audio',
    platforms: ['Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Twitter']
  },
  {
    day: 6,
    title: 'Listing Optimizer Demo',
    hook: 'Optimize your product listings for maximum visibility.',
    toolSlug: 'listing-optimizer',
    toolName: 'Listing Optimizer',
    problemSetup: 'Your product listings aren\'t getting seen. Poor titles, weak descriptions, and missing keywords are killing your discoverability.',
    demoScript: [
      {
        timestamp: '0:00-0:04',
        action: 'Show frustrated seller with low views',
        narration: 'Optimize your product listings for maximum visibility.',
        visualNotes: 'Low view count animation with sad face emoji'
      },
      {
        timestamp: '0:04-0:10',
        action: 'Enter product details into the optimizer',
        narration: 'Enter your product details. The AI analyzes everything.',
        visualNotes: 'Clean input fields with product image, speed up entry'
      },
      {
        timestamp: '0:10-0:18',
        action: 'Show AI analyzing title, description, and keywords',
        narration: 'It checks your title, description, keywords, and more...',
        visualNotes: 'Each section animates in with checkmarks or warnings'
      },
      {
        timestamp: '0:18-0:25',
        action: 'Show the optimized listing score and suggestions',
        narration: 'Your listing score? 85/100. Here\'s how to reach 100.',
        visualNotes: 'Big score reveal with improvement suggestions highlighted'
      },
      {
        timestamp: '0:25-0:30',
        action: 'Show CTA with urgency messaging',
        narration: 'Stop guessing. Optimize your listings free — link in bio.',
        visualNotes: 'Rocket emoji + chart icon + link overlay'
      }
    ],
    caption: 'Your listings aren\'t getting seen? Here\'s why. 👀\n\nCommon listing mistakes:\n• Weak titles (no keywords)\n• Short descriptions\n• Missing search terms\n• Poor formatting\n\nThe Listing Optimizer scores your listing and shows EXACTLY what to fix.\n\nGet more views, clicks, and sales. 📈\n\n🔗 Optimize your listings free — link in bio!\n\n#listingoptimizer #productlisting #ecommerce #smallbusiness #seo #visibility #businesstips #onlineselling #sellerlife #etsyseller #shopify #aitools #mgbbtools #listingscore #getmoreviews #freetools',
    hashtags: [
      '#listingoptimizer', '#productlisting', '#ecommerce', '#smallbusiness',
      '#seo', '#visibility', '#businesstips', '#onlineselling', '#sellerlife',
      '#etsyseller', '#shopify', '#aitools', '#mgbbtools', '#listingscore',
      '#getmoreviews', '#freetools'
    ],
    ctaText: 'Optimize your listings free — link in bio!',
    suggestedAudio: 'Upbeat tutorial / success reveal sound effect',
    platforms: ['TikTok', 'Instagram', 'YouTube', 'Twitter']
  },
  {
    day: 7,
    title: 'AI Business Dashboard Overview',
    hook: 'One AI dashboard for your online business.',
    toolSlug: 'ai-tools',
    toolName: 'AI Business Dashboard',
    problemSetup: 'You\'re juggling 10 different tools across 10 browser tabs. Your workflow is chaotic and you\'re losing time switching between apps.',
    demoScript: [
      {
        timestamp: '0:00-0:04',
        action: 'Show overwhelmed seller with multiple browser tabs open',
        narration: 'One AI dashboard for your entire online business.',
        visualNotes: 'Chaotic multi-tab browser view transitioning to clean dashboard'
      },
      {
        timestamp: '0:04-0:10',
        action: 'Navigate to the AI tools dashboard landing page',
        narration: 'Every tool you need, organized in one place.',
        visualNotes: 'Smooth scroll through the tools grid showing all available tools'
      },
      {
        timestamp: '0:10-0:18',
        action: 'Click through 3-4 different tools rapidly',
        narration: 'Product descriptions, SEO titles, hashtags, profit calculations — all here.',
        visualNotes: 'Quick cuts between tool interfaces showing variety'
      },
      {
        timestamp: '0:18-0:25',
        action: 'Show the unified experience — same design, consistent UX',
        narration: 'Same clean design. Same instant results. Zero tab-switching chaos.',
        visualNotes: 'Side-by-side comparison of consistent UI patterns across tools'
      },
      {
        timestamp: '0:25-0:32',
        action: 'End with full dashboard overview and CTA',
        narration: 'Your AI-powered business toolkit. Free forever. Link in bio.',
        visualNotes: 'Dashboard screenshot with all tools visible + animated link pointer'
      }
    ],
    caption: 'Tired of juggling 10 different tools across 10 browser tabs? 😵‍💫\n\nWhat if everything you needed was in ONE dashboard?\n\nMG Blessed Beginnings gives you:\n✨ Product Description Generator\n✨ SEO Title Optimizer\n✨ Hashtag Generator\n✨ Review Response Writer\n✨ Competitor Analyzer\n✨ Profit Calculator\n...and more. All free. All in one place.\n\nStop tab-switching. Start scaling. 🚀\n\n🔗 Access your AI business toolkit free — link in bio!\n\n#aidashboard #businesstoolkit #ecommerce #allinone #smallbusiness #onlineselling #productivity #workflow #aitools #digitalmarketing #sellerlife #entrepreneur #mgbbtools #freetools #businesstools #scalability #automation',
    hashtags: [
      '#aidashboard', '#businesstoolkit', '#ecommerce', '#allinone',
      '#smallbusiness', '#onlineselling', '#productivity', '#workflow',
      '#aitools', '#digitalmarketing', '#sellerlife', '#entrepreneur',
      '#mgbbtools', '#freetools', '#businesstools', '#scalability',
      '#automation', '#techtools'
    ],
    ctaText: 'Access your AI business toolkit free — link in bio!',
    suggestedAudio: 'Productivity beats / tech showcase montage music',
    platforms: ['Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Twitter']
  }
];

export function getReelByDay(day: number): Week2Reel | undefined {
  return week2Reels.find((r) => r.day === day);
}

export function getReelByToolSlug(slug: string): Week2Reel | undefined {
  return week2Reels.find((r) => r.toolSlug === slug);
}
