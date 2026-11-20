export interface BuildEpisode {
  episode: number;
  title: string;
  hook: string;
  storyAngle: string;
  fullScript: {
    timestamp: string;
    narration: string;
    visual: string;
  }[];
  caption: string;
  hashtags: string[];
  platforms: string[];
  toolsFeatured: { name: string; slug: string }[];
  suggestedAudio: string;
  engagementHook: string;
  videoUrl?: string;
}

export const buildSeriesEpisodes: BuildEpisode[] = [
  {
    episode: 1,
    title: 'I Built an AI Tool for Online Sellers',
    hook: "I was tired of watching online sellers struggle with content. So I built something about it.",
    storyAngle: 'Origin story — the frustration that sparked MG Blessed Beginnings, identifying the gap in affordable AI tools for small e-commerce businesses, and building the first prototype.',
    fullScript: [
      {
        timestamp: '0-5s',
        narration: 'I was tired of watching online sellers struggle with content. So I built something about it.',
        visual: 'Face camera, confident expression. Text overlay of the hook appears with bold typography.'
      },
      {
        timestamp: '5-15s',
        narration: 'Every day I saw sellers spending hours writing product descriptions, SEO titles, and social media posts. Most gave up or hired expensive freelancers they could barely afford.',
        visual: 'Quick cuts showing frustrated seller stock footage, clock ticking, messy desk with notes. Split screen showing blank document vs dollar signs.'
      },
      {
        timestamp: '15-35s',
        narration: 'So I started building MG Blessed Beginnings — a free AI toolkit designed specifically for online sellers. Product descriptions, SEO titles, hashtag generators, all in one place. No subscriptions, no credit cards, just tools that actually work.',
        visual: 'Screen recording of the platform loading, quick tour of the dashboard showing multiple tools. Smooth transitions between tool previews with text callouts.'
      },
      {
        timestamp: '35-45s',
        narration: 'The first prototype took two weeks. It was ugly but functional. I tested it with five friends who sell on Etsy and Shopify. Their feedback changed everything.',
        visual: 'Show early wireframe sketches or screenshots transitioning to the polished current design. Side-by-side before/after of the UI evolution.'
      },
      {
        timestamp: '45-60s',
        narration: "This is episode one of documenting my entire journey building this in public. Follow along if you're curious how an AI tool actually gets built from scratch. Link in bio to try it yourself.",
        visual: 'Point to camera with subscribe/follow gesture. End card with platform logo, link arrow, and series branding. Animated CTA overlay.'
      }
    ],
    caption: `I got tired of watching online sellers waste hours on content creation. 😤

So I decided to fix it myself.

MG Blessed Beginnings is a FREE AI toolkit I'm building specifically for e-commerce sellers. Product descriptions, SEO titles, hashtags, social media posts — all generated in seconds.

No subscriptions. No credit cards. Just tools that work.

This is Episode 1 of my "I Built This" series where I'm documenting the entire journey of building an AI tool from scratch.

🔗 Try it free — link in bio!

What's the biggest content challenge YOU face as an online seller? Drop it below 👇`,
    hashtags: [
      '#buildinpublic', '#indiehacker', '#aitools', '#ecommerce', '#onlineselling',
      '#shopify', '#etsyseller', '#smallbusiness', '#saas', '#startupjourney',
      '#techtwitter', '#makerlog', '#mgbbtools', '#producthunt', '#sideproject',
      '#freetools', '#contentcreation'
    ],
    platforms: ['Instagram Reels', 'TikTok', 'YouTube Shorts', 'LinkedIn'],
    toolsFeatured: [],
    suggestedAudio: 'Inspiring lo-fi beat / trending storytelling audio',
    engagementHook: "What's the biggest content challenge YOU face as an online seller?",
    videoUrl: 'https://drive.google.com/file/d/1WIzjjZ5h6W5wHzfdPSiKyobzGfvCYZn-/preview'
  },
  {
    episode: 2,
    title: 'I Added an AI Product Description Generator',
    hook: "Watch me turn three words into a product description that actually sells.",
    storyAngle: 'Feature deep-dive — showing the product description generator working end-to-end, demonstrating real before/after results, and explaining the AI prompt engineering behind it.',
    fullScript: [
      {
        timestamp: '0-5s',
        narration: 'Watch me turn three words into a product description that actually sells.',
        visual: 'Hold up three fingers. Bold text overlay: "3 WORDS → SELLING DESCRIPTION". Quick zoom effect.'
      },
      {
        timestamp: '5-15s',
        narration: 'Most sellers write descriptions like this: "Blue cotton t-shirt, size medium, good quality." That does not convert. Let me show you what AI can do instead.',
        visual: 'Show a terrible product listing screenshot with red X overlay. Shake head. Transition to tool interface.'
      },
      {
        timestamp: '15-40s',
        narration: 'I type in "handmade leather wallet" and add a couple features. Hit generate. Boom — a professional, keyword-rich description that highlights craftsmanship, materials, dimensions, and emotional appeal. Ready to paste directly into your listing.',
        visual: 'Screen recording showing input fields being filled, generate button click, loading animation, then the full generated description appearing. Highlight key selling phrases with colored overlays as they appear.'
      },
      {
        timestamp: '40-50s',
        narration: "The secret is the prompt engineering underneath. I spent weeks testing different structures until the output consistently sounded human, persuasive, and SEO-friendly. Not robotic AI slop.",
        visual: 'Quick flash of prompt structure diagram (simplified). Back to the finished description with green checkmarks next to quality indicators.'
      },
      {
        timestamp: '50-60s',
        narration: 'This tool is completely free. Episode two of my build series. Follow for more. Link in bio to try it right now.',
        visual: 'End card with tool preview thumbnail, series badge "Ep. 2", and animated follow/subscribe CTA. Arrow pointing to bio link.'
      }
    ],
    caption: `"Blue cotton t-shirt, good quality" is NOT a product description. 😬

Here's what happens when you use AI properly:

Input: "handmade leather wallet" + 2 features
Output: A professional, keyword-rich description ready to paste into your Etsy/Shopify listing.

I built this free tool after watching too many sellers lose sales because of lazy descriptions.

The AI doesn't just spit out generic text — I engineered the prompts to produce descriptions that sound human, highlight benefits, and include SEO keywords naturally.

Try it free — link in bio! 🔗

Episode 2 of my "I Built This" series 🏗️

Would you trust AI to write YOUR product descriptions? Yes or No? 👇`,
    hashtags: [
      '#productdescription', '#aitools', '#ecommerce', '#copywriting', '#onlineselling',
      '#shopify', '#etsyseller', '#productlisting', '#buildinpublic', '#indiehacker',
      '#aiwriting', '#smallbusiness', '#mgbbtools', '#freelancing', '#digitalmarketing',
      '#sellerlife', '#conversioncopywriting'
    ],
    platforms: ['Instagram Reels', 'TikTok', 'YouTube Shorts'],
    toolsFeatured: [{ name: 'Product Description Generator', slug: 'product-description-generator' }],
    suggestedAudio: 'Upbeat tutorial beat / satisfying reveal sound',
    engagementHook: 'Would you trust AI to write YOUR product descriptions? Yes or No?',
    videoUrl: 'https://drive.google.com/file/d/1-d4ENPvZQoNZRpHwHmMwVeLf-UQQNlXA/preview'
  },
  {
    episode: 3,
    title: 'I Added an SEO Title Optimizer',
    hook: "Your product title is probably killing your search ranking. Here's proof.",
    storyAngle: 'Problem-solution demonstration — comparing bad titles vs AI-optimized titles, showing keyword impact, and revealing the SEO logic behind the optimization engine.',
    fullScript: [
      {
        timestamp: '0-5s',
        narration: "Your product title is probably killing your search ranking. Here's proof.",
        visual: 'Dramatic zoom into a bad product title on screen. Red warning icon overlay. Attention-grabbing text animation.'
      },
      {
        timestamp: '5-15s',
        narration: "This seller titled their product 'Nice Bracelet.' That's it. They're competing against thousands of other 'nice bracelets' and wondering why nobody finds them.",
        visual: 'Show actual marketplace search results for generic term. Scroll through hundreds of identical listings. Highlight the invisible listing.'
      },
      {
        timestamp: '15-40s',
        narration: "Now watch what happens when I run it through my SEO Title Optimizer. The AI analyzes top-ranking competitors, identifies high-value keywords, and restructures the title for maximum search visibility. 'Nice Bracelet' becomes 'Handmade Gold Chain Bracelet for Women — Adjustable Boho Style Gift.' Same product. Completely different discoverability.",
        visual: 'Screen recording of the SEO tool. Show input → analysis animation → optimized output. Side-by-side comparison with before/after. Keyword highlighting with green tags. Search ranking position mockup showing improvement.'
      },
      {
        timestamp: '40-50s',
        narration: 'The optimizer checks keyword density, character limits per platform, and front-loads the most important terms. Every suggestion is backed by actual search data patterns.',
        visual: 'Quick infographic-style overlay showing the optimization criteria. Platform-specific character count badges (Etsy, Amazon, Shopify).'
      },
      {
        timestamp: '50-60s',
        narration: "Stop guessing at titles. This tool is free. Episode three — follow for the full build series. Link in bio.",
        visual: 'End card with Ep. 3 badge, tool screenshot, follow CTA, and link direction arrow.'
      }
    ],
    caption: `"Nice Bracelet" is costing you sales every single day. 💸

Your product title is the #1 factor in whether buyers find you or scroll past.

I built a free SEO Title Optimizer that:
✅ Analyzes competitor titles
✅ Identifies high-value keywords
✅ Restructures for maximum search visibility
✅ Respects platform character limits

Before: "Nice Bracelet"
After: "Handmade Gold Chain Bracelet for Women — Adjustable Boho Style Gift"

Same product. Completely different results.

Free to use — link in bio! 🔗

Episode 3 of "I Built This" 🏗️

What does YOUR current product title look like? Be honest 👇`,
    hashtags: [
      '#seotips', '#seo', '#producttitle', '#ecommerce', '#onlineselling',
      '#etsyseo', '#amazonseo', '#shopify', '#keywordresearch', '#buildinpublic',
      '#indiehacker', '#aitools', '#mgbbtools', '#searchranking', '#productlisting',
      '#smallbusiness', '#digitalselling'
    ],
    platforms: ['Instagram Reels', 'TikTok', 'YouTube Shorts', 'LinkedIn'],
    toolsFeatured: [{ name: 'SEO Title Optimizer', slug: 'seo-title-optimizer' }],
    suggestedAudio: 'Dramatic reveal beat / trending transformation audio',
    engagementHook: 'What does YOUR current product title look like? Be honest!',
    videoUrl: 'https://drive.google.com/file/d/1gKhODEyQye8_0eNXbuR8vi8NN6fMyEuG/preview'
  },
  {
    episode: 4,
    title: 'I Added an AI Social Media Studio',
    hook: "I generated an entire week of social media posts in under sixty seconds.",
    storyAngle: 'Efficiency showcase — generating a full week of varied social content at once, showing the time savings, and demonstrating different content types the studio produces.',
    fullScript: [
      {
        timestamp: '0-5s',
        narration: 'I generated an entire week of social media posts in under sixty seconds.',
        visual: 'Timer graphic counting down from 60. Stack of post previews fanning out. Bold text overlay.'
      },
      {
        timestamp: '5-15s',
        narration: "Planning social media content is exhausting. You need variety — promotions, tips, stories, engagement posts. Most sellers burn out trying to come up with fresh ideas every single day.",
        visual: 'Montage of overwhelmed creator stock footage. Calendar with empty slots. Clock spinning fast. Relatable pain point visuals.'
      },
      {
        timestamp: '15-40s',
        narration: "My AI Social Media Studio takes your business niche and generates seven unique posts with captions, hashtags, and even image suggestions. Monday motivation, Wednesday tip, Friday promo — each one tailored to your audience. One click. Done.",
        visual: 'Screen recording showing niche selection, generate button, then seven distinct post cards appearing one by one with smooth animations. Each card shows a different content type with preview thumbnails.'
      },
      {
        timestamp: '40-50s',
        narration: "The best part? Every post includes platform-specific formatting. Instagram gets emoji-rich captions with line breaks. LinkedIn gets professional tone. TikTok gets short punchy hooks. One generation, multiple formats.",
        visual: 'Side-by-side showing same topic adapted for three different platforms. Format badges and character counts visible.'
      },
      {
        timestamp: '50-60s',
        narration: 'A full week of content in under a minute. Free tool. Episode four. Follow the build series. Link in bio.',
        visual: 'Calendar filling up animation. Ep. 4 badge. Subscribe/follow CTA with link arrow.'
      }
    ],
    caption: `An entire week of social media content. Generated in 60 seconds. ⏱️

I used to spend Sunday evenings planning the whole week's posts. Now my AI Social Media Studio does it for me.

You pick your niche → it generates:
📅 7 unique posts
✍️ Captions with the right tone
#️⃣ Hashtag sets for each post
🎨 Image suggestions
📱 Platform-specific formatting

Monday motivation ✅
Wednesday tip ✅
Friday promo ✅
Weekend engagement ✅

All tailored to YOUR audience. All free.

Episode 4 of "I Built This" 🏗️

How much time do YOU spend planning social media content each week? 👇`,
    hashtags: [
      '#socialmedia', '#contentcreation', '#aitools', '#socialmediamarketing',
      '#instagram', '#tiktok', '#linkedin', '#contentcalendar', '#buildinpublic',
      '#indiehacker', '#mgbbtools', '#smallbusiness', '#digitalmarketing',
      '#socialmediatips', '#contentstrategy', '#automation', '#freetools'
    ],
    platforms: ['Instagram Reels', 'TikTok', 'YouTube Shorts'],
    toolsFeatured: [{ name: 'Social Media Post Generator', slug: 'social-media-post-generator' }],
    suggestedAudio: 'Fast-paced productivity beat / trending speed-run audio',
    engagementHook: 'How much time do YOU spend planning social media content each week?',
    videoUrl: 'https://drive.google.com/file/d/1hVZikx0WoTdZQunEfOz7O7SPxHbXklKh/preview'
  },
  {
    episode: 5,
    title: 'I Added Competitor Analysis',
    hook: "I built a tool that spies on your competitors' strategies so you don't have to guess.",
    storyAngle: 'Competitive intelligence demo — showing real competitor analysis in action, revealing actionable insights, and explaining how the data helps sellers make better decisions.',
    fullScript: [
      {
        timestamp: '0-5s',
        narration: "I built a tool that spies on your competitors' strategies so you don't have to guess.",
        visual: 'Spy/detective themed text overlay. Magnifying glass animation over competitor profiles. Intrigue-building visual hook.'
      },
      {
        timestamp: '5-15s',
        narration: "The biggest mistake new sellers make? Building in a vacuum. You have no idea what's already working in your niche, what price points convert, or which keywords drive traffic.",
        visual: 'Person looking confused at analytics dashboard. Question marks floating. Blindfolded person trying to hit a target metaphor.'
      },
      {
        timestamp: '15-40s',
        narration: "My Competitor Analysis tool pulls apart successful stores and listings. It shows you their pricing strategy, keyword choices, content patterns, posting frequency, and what makes their descriptions convert. Then it gives you specific recommendations based on what's actually working in your space.",
        visual: 'Screen recording of the competitor analysis tool. Show competitor URL input → analysis running → detailed report appearing. Charts, keyword clouds, pricing comparisons, and actionable recommendation cards.'
      },
      {
        timestamp: '40-50s',
        narration: "This isn't about copying anyone. It's about understanding the landscape so you can position yourself smarter. Data beats guessing every single time.",
        visual: 'Split screen: left side shows raw data, right side shows strategic insight summary. Checkmark animations on key findings.'
      },
      {
        timestamp: '50-60s',
        narration: 'Know your competition. Win your niche. Free tool. Episode five of the build series. Follow along. Link in bio.',
        visual: 'Victory/confidence visual. Ep. 5 badge. Tool preview card. Follow CTA with link direction.'
      }
    ],
    caption: `Stop guessing. Start knowing. 🕵️

The #1 mistake new sellers make? Building in a vacuum.

I built a free Competitor Analysis tool that reveals:
📊 Pricing strategies in your niche
🔑 Keywords that actually drive traffic
📝 Content patterns that convert
⏰ Optimal posting schedules
💡 Specific recommendations for YOUR store

This isn't about copying. It's about understanding the landscape so you can position yourself smarter.

Data beats guessing. Every. Single. Time.

Free to use — link in bio! 🔗

Episode 5 of "I Built This" 🏗️

Who's your biggest competitor and what do they do better than you? Be brave 👇`,
    hashtags: [
      '#competitoranalysis', '#marketresearch', '#ecommerce', '#onlineselling',
      '#aitools', '#businessintelligence', '#buildinpublic', '#indiehacker',
      '#mgbbtools', '#smallbusiness', '#digitalmarketing', '#nicheresearch',
      '#pricingstrategy', '#keywordanalysis', '#dataanalytics', '#growthhacking',
      '#entrepreneurship'
    ],
    platforms: ['Instagram Reels', 'TikTok', 'YouTube Shorts', 'LinkedIn'],
    toolsFeatured: [{ name: 'Competitor Analysis', slug: 'competitor-analysis' }],
    suggestedAudio: 'Mysterious/investigative beat / trending spy-themed audio',
    engagementHook: "Who's your biggest competitor and what do they do better than you?",
    videoUrl: 'https://drive.google.com/file/d/1zKMTaLT31p9qw13GBhymDJX4noXsESoe/preview'
  },
  {
    episode: 6,
    title: 'I Finally Launched MG Blessed Beginnings',
    hook: "After months of building in secret, I finally hit publish. Here's what launch day felt like.",
    storyAngle: 'Emotional milestone — capturing the vulnerability and excitement of launching, walking through the complete platform, and sharing the personal significance of making it public.',
    fullScript: [
      {
        timestamp: '0-5s',
        narration: "After months of building in secret, I finally hit publish. Here's what launch day felt like.",
        visual: 'Finger hovering over publish button. Dramatic pause. Click. Confetti or celebration animation. Emotional close-up.'
      },
      {
        timestamp: '5-15s',
        narration: "Launching something you've built is terrifying. What if nobody cares? What if it breaks? What if people think it's not good enough? I had all those thoughts at 3 AM the night before.",
        visual: 'Late-night coding montage. Coffee cups. Nervous pacing. Self-doubt text overlays crossing out. Authentic vulnerable moments.'
      },
      {
        timestamp: '15-40s',
        narration: "But then I remembered why I started. Online sellers deserve free, powerful tools. Period. So here's what MG Blessed Beginnings actually is: AI product descriptions, SEO title optimization, social media content generation, hashtag research, competitor analysis, and more. All free. All designed for people actually running online businesses.",
        visual: 'Smooth platform walkthrough showing each tool category. Clean UI shots with feature callout labels. Professional product demo style with transitions.'
      },
      {
        timestamp: '40-50s',
        narration: "Launch day brought messages from sellers saying they'd been waiting for exactly this. Some cried. I almost did too. Building something that genuinely helps people is a feeling nothing else matches.",
        visual: 'Screenshots of positive DMs/comments (anonymized). Heart reaction animations. Grateful expression. Community response collage.'
      },
      {
        timestamp: '50-60s',
        narration: "This is what building in public looks like. The fear, the work, the payoff. Episode six. If you're building something, keep going. Link in bio to try MG Blessed Beginnings.",
        visual: 'Inspirational end card. Series timeline showing all 6 episodes so far. Encouraging message overlay. Link CTA with emphasis.'
      }
    ],
    caption: `I finally hit publish. And honestly? I was terrified. 😰

Months of late nights, self-doubt, and "what if nobody cares?"

But I remembered WHY I started: online sellers deserve free, powerful AI tools. No gatekeeping. No $99/month subscriptions.

MG Blessed Beginnings is LIVE with:
✨ AI Product Descriptions
🔍 SEO Title Optimization  
📱 Social Media Content Studio
#️⃣ Hashtag Research
🕵️ Competitor Analysis
...and more. All free.

Launch day brought messages from sellers who said they'd been waiting for exactly this. Some cried. I almost did too.

Building something that genuinely helps people > everything else.

Try it free — link in bio! 🔗

Episode 6 of "I Built This" 🏗️

Have you ever launched something you built? How did it feel? 👇`,
    hashtags: [
      '#launchday', '#buildinpublic', '#indiehacker', '#startup', '#mgbbtools',
      '#aitools', '#ecommerce', '#onlineselling', '#makerlog', '#saas',
      '#techtwitter', '#productlaunch', '#smallbusiness', '#entrepreneur',
      '#shippingit', '#dreambig', '#freetools'
    ],
    platforms: ['Instagram Reels', 'TikTok', 'YouTube Shorts', 'LinkedIn', 'Twitter/X'],
    toolsFeatured: [],
    suggestedAudio: 'Emotional/triumphant indie track / trending achievement audio',
    engagementHook: 'Have you ever launched something you built? How did it feel?',
    videoUrl: 'https://drive.google.com/file/d/1tGo1ZOtXpzNPwolewrYzCAG5xMwQ1Tl6/preview'
  },
  {
    episode: 7,
    title: '100 People Tested My AI App',
    hook: "One hundred people tested my AI app. Their feedback surprised me.",
    storyAngle: 'Social proof and iteration — sharing real user feedback stats, highlighting what people loved, addressing criticism transparently, and teasing what comes next in the roadmap.',
    fullScript: [
      {
        timestamp: '0-5s',
        narration: 'One hundred people tested my AI app. Their feedback surprised me.',
        visual: 'Counter animation reaching 100. Surprised expression. Notification bell overflowing. Bold statistic overlay.'
      },
      {
        timestamp: '5-15s',
        narration: "After launching MG Blessed Beginnings, I asked for honest feedback. Not the polite kind. The brutal kind. What works, what doesn't, what's missing. One hundred sellers, creators, and entrepreneurs responded.",
        visual: 'Feedback form/survey visual. Mix of review screenshots (positive and constructive). Graph/chart showing response volume growing.'
      },
      {
        timestamp: '15-40s',
        narration: "Here's what they loved: the product description generator saved them an average of forty-five minutes per listing. The SEO optimizer increased their search impressions within the first week. The social media studio became their Sunday routine replacement. But here's what they wanted more of: bulk generation, multi-language support, and integration with actual marketplace APIs. Fair criticism. Already on the roadmap.",
        visual: 'Stats cards animating in: "45 min saved/listing", "+search impressions", "Sunday planning eliminated". Then transition to wishlist items with roadmap timeline graphic. Green checkmarks for shipped features, yellow dots for upcoming.'
      },
      {
        timestamp: '40-50s',
        narration: "The most common comment wasn't about features. It was: 'Thank you for making this free.' That hit different. Building tools people can actually access regardless of budget — that's the mission.",
        visual: 'Highlighted testimonial quotes emphasizing the free aspect. Heartfelt reaction. Mission statement text overlay with brand colors.'
      },
      {
        timestamp: '50-60s',
        narration: "One hundred testers. Dozens of improvements shipped. More coming. This is episode seven — the finale of season one. Thank you for following the build series. Link in bio to be tester #101.",
        visual: 'Celebration montage. Season 1 complete badge. Roadmap teaser for season 2. Final CTA with strong link emphasis. Credits-style end card.'
      }
    ],
    caption: `100 people tested my AI app. Here's what happened. 📊

I asked for BRUTAL honesty. Not the polite kind.

What they LOVED:
⏱️ Product Description Generator saved avg 45 min/listing
📈 SEO Optimizer boosted search impressions in week 1
📱 Social Media Studio replaced their Sunday planning grind

What they wanted MORE of:
🔄 Bulk generation
🌍 Multi-language support
🔗 Marketplace API integrations

Fair criticism. Already on the roadmap.

But the comment that hit hardest?
"Thank you for making this free."

Building tools people can access regardless of budget — that's the mission. Always has been.

Season 1 of "I Built This" is complete. 🏁

Be tester #101 — link in bio! 🔗

What feature would YOU want added to an AI toolkit for sellers? 👇`,
    hashtags: [
      '#userfeedback', '#buildinpublic', '#indiehacker', '#aitools', '#mgbbtools',
      '#productfeedback', '#startupjourney', '#ecommerce', '#onlineselling',
      '#freetools', '#saas', '#makerlog', '#techtwitter', '#userresearch',
      '#roadmap', '#communityfeedback', '#seasonfinale'
    ],
    platforms: ['Instagram Reels', 'TikTok', 'YouTube Shorts', 'LinkedIn', 'Twitter/X'],
    toolsFeatured: [],
    suggestedAudio: 'Celebratory/upbeat recap beat / trending milestone audio',
    engagementHook: 'What feature would YOU want added to an AI toolkit for sellers?',
    videoUrl: 'https://drive.google.com/file/d/1qZWCUWapSLZCo7iTh8DPfx0DjNxtExRA/preview'
  }
];
