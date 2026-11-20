export interface ThirtyDayTask {
  id: string;
  text: string;
  link?: string;
}

export type DayCategory = 'branding' | 'content' | 'referral' | 'engagement' | 'analytics';

export interface ThirtyDayEntry {
  day: number;
  phase: string;
  title: string;
  description: string;
  tasks: ThirtyDayTask[];
  category: DayCategory;
  icon: string;
  tip?: string;
}

export const thirtyDayPlan: ThirtyDayEntry[] = [
  // ── Phase 1: Foundation (Days 1-3) ───────────────────────────────────────────
  {
    day: 1,
    phase: 'Foundation',
    title: 'Fix Branding + ASO',
    description: 'Update your app name, description, and keywords across all store listings and website meta tags. Consistent branding builds trust and improves discoverability from day one.',
    tasks: [
      { id: 'd1-t1', text: 'Audit current app store listings for keyword gaps' },
      { id: 'd1-t2', text: 'Rewrite app title with primary keyword in first 30 characters' },
      { id: 'd1-t3', text: 'Update website meta tags to match new messaging' },
      { id: 'd1-t4', text: 'List top 5 target keywords per platform' },
    ],
    category: 'branding',
    icon: 'Tag',
    tip: 'Use AI SEO Title Optimizer to generate keyword-rich titles instantly.',
  },
  {
    day: 2,
    phase: 'Foundation',
    title: 'Visual Brand Identity',
    description: 'Create consistent visual branding — logo, color palette, and font pairings. A cohesive brand identity makes your content instantly recognizable across every platform.',
    tasks: [
      { id: 'd2-t1', text: 'Finalize logo in square, horizontal, and icon-only formats' },
      { id: 'd2-t2', text: 'Define brand color palette (primary, secondary, accent)' },
      { id: 'd2-t3', text: 'Choose two complementary fonts (heading + body)' },
      { id: 'd2-t4', text: 'Create social media profile images using new branding' },
      { id: 'd2-t5', text: 'Build a simple brand guidelines PDF for consistency' },
    ],
    category: 'branding',
    icon: 'Palette',
  },
  {
    day: 3,
    phase: 'Foundation',
    title: 'Optimize Store Listings',
    description: 'Optimize screenshots and app store descriptions for target keywords. Well-crafted descriptions convert browsers into downloads and improve organic search rankings.',
    tasks: [
      { id: 'd3-t1', text: 'Write keyword-rich app description (first 80 chars most important)' },
      { id: 'd3-t2', text: 'Design 3-5 feature highlight screenshots' },
      { id: 'd3-t3', text: 'Add captions to each screenshot explaining the benefit' },
      { id: 'd3-t4', text: 'Submit updated listing for review' },
    ],
    category: 'branding',
    icon: 'Store',
    tip: 'Use Content Templates to generate optimized product descriptions quickly.',
  },

  // ── Phase 2: Content Launch (Days 4-7) ───────────────────────────────────────
  {
    day: 4,
    phase: 'Content Launch',
    title: 'Design App Screenshots',
    description: 'Design 5 app store screenshots that follow a problem-solution-result narrative. Visual storytelling in screenshots dramatically increases conversion rates.',
    tasks: [
      { id: 'd4-t1', text: 'Screenshot 1: Show the pain point users face' },
      { id: 'd4-t2', text: 'Screenshot 2-3: Demonstrate the solution flow' },
      { id: 'd4-t3', text: 'Screenshot 4: Highlight key results and metrics' },
      { id: 'd4-t4', text: 'Screenshot 5: Strong CTA with social proof' },
      { id: 'd4-t5', text: 'Export in correct dimensions for each store' },
    ],
    category: 'content',
    icon: 'Image',
  },
  {
    day: 5,
    phase: 'Content Launch',
    title: 'Screen Record Tool Demos',
    description: 'Screen-record tool demos for each AI tool. Short video walkthroughs build credibility and show potential users exactly what they will get before downloading.',
    tasks: [
      { id: 'd5-t1', text: 'Record Product Description Generator demo (30-60 sec)', link: '/ai-tools' },
      { id: 'd5-t2', text: 'Record SEO Title Optimizer demo (30-60 sec)', link: '/ai-tools' },
      { id: 'd5-t3', text: 'Record Hashtag Generator demo (30-60 sec)', link: '/ai-tools' },
      { id: 'd5-t4', text: 'Edit clips: add captions, trim dead air, add outro CTA' },
    ],
    category: 'content',
    icon: 'Video',
    tip: 'Keep each demo under 60 seconds — attention spans are short on social media.',
  },
  {
    day: 6,
    phase: 'Content Launch',
    title: 'Publish Launch Announcement',
    description: 'Write and publish your launch announcement across all platforms. A well-crafted launch post generates initial buzz and drives your first wave of users.',
    tasks: [
      { id: 'd6-t1', text: 'Write launch post with compelling hook and CTA' },
      { id: 'd6-t2', text: 'Create platform-specific versions (IG, TikTok, LinkedIn, Twitter)' },
      { id: 'd6-t3', text: 'Post at optimal times for each platform' },
      { id: 'd6-t4', text: 'Engage with every comment within 1 hour' },
    ],
    category: 'content',
    icon: 'Megaphone',
  },
  {
    day: 7,
    phase: 'Content Launch',
    title: 'Community Outreach',
    description: 'Share your launch announcement in WhatsApp groups, Facebook communities, and relevant online forums. Personal outreach in communities converts better than cold ads.',
    tasks: [
      { id: 'd7-t1', text: 'Identify 10+ relevant WhatsApp/Facebook groups' },
      { id: 'd7-t2', text: 'Craft personalized messages for each community' },
      { id: 'd7-t3', text: 'Share launch post with value-first framing' },
      { id: 'd7-t4', text: 'Follow up with interested members via DM' },
    ],
    category: 'engagement',
    icon: 'Users',
  },

  // ── Phase 3: Demo Series (Days 8-10) ─────────────────────────────────────────
  {
    day: 8,
    phase: 'Demo Series',
    title: 'Reel: Product Description Generator',
    description: 'Create a Reel showcasing the Product Description Generator. Demo Reels are the highest-converting content format for SaaS products on Instagram and TikTok.',
    tasks: [
      { id: 'd8-t1', text: 'Script the Reel: hook (3s), demo (20s), CTA (5s)' },
      { id: 'd8-t2', text: 'Record screen capture of tool in action' },
      { id: 'd8-t3', text: 'Add trending audio and text overlays' },
      { id: 'd8-t4', text: 'Post to Instagram Reels, TikTok, and YouTube Shorts' },
    ],
    category: 'content',
    icon: 'Film',
  },
  {
    day: 9,
    phase: 'Demo Series',
    title: 'Reel: SEO Title Optimizer',
    description: 'Create a Reel demonstrating the SEO Title Optimizer. Show real before-and-after title improvements to prove the tool delivers measurable results.',
    tasks: [
      { id: 'd9-t1', text: 'Prepare 3 weak titles and their optimized versions' },
      { id: 'd9-t2', text: 'Record the optimization process on screen' },
      { id: 'd9-t3', text: 'Add before/after comparison overlay' },
      { id: 'd9-t4', text: 'Cross-post to all short-form video platforms' },
    ],
    category: 'content',
    icon: 'Search',
  },
  {
    day: 10,
    phase: 'Demo Series',
    title: 'Reel: Hashtag Generator',
    description: 'Create a Reel showing the Hashtag Generator in action. Hashtags drive discovery — demonstrate how the tool finds niche-relevant tags that boost reach.',
    tasks: [
      { id: 'd10-t1', text: 'Show hashtag generation for a real product niche' },
      { id: 'd10-t2', text: 'Highlight the relevance score and categorization' },
      { id: 'd10-t3', text: 'Include a "Try it free" CTA in caption' },
      { id: 'd10-t4', text: 'Engage with comments and share user results' },
    ],
    category: 'content',
    icon: 'Hash',
  },

  // ── Phase 4: Education (Days 11-14) ──────────────────────────────────────────
  {
    day: 11,
    phase: 'Education',
    title: 'Why SEO Titles Matter',
    description: 'Post educational content about why SEO titles matter for sellers. Educational posts position you as an authority and attract users who need your tools.',
    tasks: [
      { id: 'd11-t1', text: 'Write carousel or thread: "5 Reasons Your SEO Title Is Losing Sales"' },
      { id: 'd11-t2', text: 'Include real examples of bad vs. good titles' },
      { id: 'd11-t3', text: 'End with CTA linking to your SEO Title Optimizer', link: '/ai-tools' },
      { id: 'd11-t4', text: 'Repurpose as blog post or LinkedIn article' },
    ],
    category: 'content',
    icon: 'BookOpen',
  },
  {
    day: 12,
    phase: 'Education',
    title: 'Product Descriptions & Sales',
    description: 'Post educational content about how product descriptions directly affect sales. Data-backed educational content builds trust and drives tool adoption.',
    tasks: [
      { id: 'd12-t1', text: 'Research stats on description quality vs. conversion rates' },
      { id: 'd12-t2', text: 'Create infographic or carousel with key findings' },
      { id: 'd12-t3', text: 'Show side-by-side comparison of weak vs. strong descriptions' },
      { id: 'd12-t4', text: 'Link to Product Description Generator in bio/comments', link: '/ai-tools' },
    ],
    category: 'content',
    icon: 'TrendingUp',
  },
  {
    day: 13,
    phase: 'Education',
    title: 'Hashtag Strategy Guide',
    description: 'Post educational content on hashtag strategy for small businesses. Practical tips create saveable content that gets shared and extends your reach organically.',
    tasks: [
      { id: 'd13-t1', text: 'Write "Hashtag Strategy 101" guide for e-commerce sellers' },
      { id: 'd13-t2', text: 'Include mix ratios: broad, niche, branded hashtags' },
      { id: 'd13-t3', text: 'Provide a free hashtag template or checklist' },
      { id: 'd13-t4', text: 'CTA: "Generate your perfect hashtag set with our free tool"', link: '/ai-tools' },
    ],
    category: 'content',
    icon: 'Bookmark',
  },
  {
    day: 14,
    phase: 'Education',
    title: 'Launch Referral Campaign',
    description: 'Launch your first referral campaign — activate the referral system and share it on WhatsApp. Referrals are the highest-trust acquisition channel for early-stage apps.',
    tasks: [
      { id: 'd14-t1', text: 'Activate referral system and test end-to-end flow', link: '/referral' },
      { id: 'd14-t2', text: 'Create referral announcement post for all platforms' },
      { id: 'd14-t3', text: 'Share personal referral link in WhatsApp groups' },
      { id: 'd14-t4', text: 'DM early supporters asking them to share' },
      { id: 'd14-t5', text: 'Track first referral signups and celebrate publicly' },
    ],
    category: 'referral',
    icon: 'Gift',
    tip: 'Offer a meaningful incentive — free credits or exclusive content for referrals.',
  },

  // ── Phase 5: Lead Magnet (Days 15-17) ────────────────────────────────────────
  {
    day: 15,
    phase: 'Lead Magnet',
    title: 'Create Free PDF Guide',
    description: 'Create a free downloadable PDF guide such as "10 AI Hacks for Online Sellers." Lead magnets capture emails and build your audience beyond social media followers.',
    tasks: [
      { id: 'd15-t1', text: 'Outline 10 actionable AI tips for e-commerce sellers' },
      { id: 'd15-t2', text: 'Design PDF with brand colors and professional layout' },
      { id: 'd15-t3', text: 'Include screenshots and step-by-step instructions' },
      { id: 'd15-t4', text: 'Add CTAs linking to your AI tools throughout' },
    ],
    category: 'content',
    icon: 'FileText',
  },
  {
    day: 16,
    phase: 'Lead Magnet',
    title: 'Promote PDF Across Social',
    description: 'Set up a landing page and promote the PDF across social media. A dedicated landing page with clear value proposition maximizes download conversions.',
    tasks: [
      { id: 'd16-t1', text: 'Create simple landing page with email capture form' },
      { id: 'd16-t2', text: 'Write promotional posts highlighting key takeaways' },
      { id: 'd16-t3', text: 'Share in stories with swipe-up/link sticker' },
      { id: 'd16-t4', text: 'Pin the promotion post on your profiles' },
    ],
    category: 'content',
    icon: 'Link',
  },
  {
    day: 17,
    phase: 'Lead Magnet',
    title: 'Share-to-Unlock Promotion',
    description: 'Run a "Share to unlock" promotion for the PDF. Viral mechanics incentivize sharing and exponentially increase your reach without ad spend.',
    tasks: [
      { id: 'd17-t1', text: 'Set up share-gated download mechanism' },
      { id: 'd17-t2', text: 'Announce the promotion with urgency language' },
      { id: 'd17-t3', text: 'Create story templates users can reshare easily' },
      { id: 'd17-t4', text: 'Track shares and feature top sharers publicly' },
    ],
    category: 'engagement',
    icon: 'Share2',
  },

  // ── Phase 6: Build in Public (Days 18-20) ────────────────────────────────────
  {
    day: 18,
    phase: 'Build in Public',
    title: 'Why I Started Building This',
    description: 'Share Episode 1 of "I Built This" — why you started building MG Blessed Beginnings. Authentic founder stories create emotional connections that drive loyalty.',
    tasks: [
      { id: 'd18-t1', text: 'Write your origin story — the problem that sparked the idea' },
      { id: 'd18-t2', text: 'Include early struggles and pivot moments' },
      { id: 'd18-t3', text: 'Record a short video version for Reels/TikTok' },
      { id: 'd18-t4', text: 'Ask followers to share their own startup stories' },
    ],
    category: 'engagement',
    icon: 'Heart',
  },
  {
    day: 19,
    phase: 'Build in Public',
    title: 'AI Tools Added This Week',
    description: 'Share Episode 2 — the AI tools you added this week and why. Build-in-public updates keep your audience invested in your journey and excited about new features.',
    tasks: [
      { id: 'd19-t1', text: 'List new tools/features shipped this week' },
      { id: 'd19-t2', text: 'Explain the user problem each tool solves' },
      { id: 'd19-t3', text: 'Show behind-the-scenes development snippets' },
      { id: 'd19-t4', text: 'Poll followers on which tool to build next' },
    ],
    category: 'content',
    icon: 'Wrench',
  },
  {
    day: 20,
    phase: 'Build in Public',
    title: 'What Users Are Saying',
    description: 'Share Episode 3 — what users are saying about your app. Social proof is the strongest conversion driver; real testimonials validate your product\'s value.',
    tasks: [
      { id: 'd20-t1', text: 'Collect 3-5 user testimonials or screenshots of feedback' },
      { id: 'd20-t2', text: 'Design testimonial cards with user photos/names' },
      { id: 'd20-t3', text: 'Create a compilation Reel of user reactions' },
      { id: 'd20-t4', text: 'Invite more users to share their experience' },
    ],
    category: 'engagement',
    icon: 'MessageSquare',
  },

  // ── Phase 7: Community (Days 21-24) ──────────────────────────────────────────
  {
    day: 21,
    phase: 'Community',
    title: 'User Feedback Campaign',
    description: 'Run a user feedback campaign using surveys, polls, and DMs. Direct feedback reveals your highest-impact improvements and makes users feel valued.',
    tasks: [
      { id: 'd21-t1', text: 'Create a 3-question survey (Google Forms or Typeform)' },
      { id: 'd21-t2', text: 'Post interactive polls on Instagram Stories' },
      { id: 'd21-t3', text: 'DM active users asking for honest feedback' },
      { id: 'd21-t4', text: 'Compile top themes and share publicly' },
    ],
    category: 'engagement',
    icon: 'ClipboardList',
  },
  {
    day: 22,
    phase: 'Community',
    title: 'Launch 7-Day Tool Challenge',
    description: 'Launch the "7-Day Tool Challenge" — use one tool per day for a week. Challenges create engagement loops and help users discover tools they might otherwise skip.',
    tasks: [
      { id: 'd22-t1', text: 'Announce the challenge with rules and daily schedule' },
      { id: 'd22-t2', text: 'Create daily challenge graphics for the week' },
      { id: 'd22-t3', text: 'Day 1 task: Generate a product description and share result' },
      { id: 'd22-t4', text: 'Create a unique hashtag for challenge participants' },
    ],
    category: 'engagement',
    icon: 'Target',
  },
  {
    day: 23,
    phase: 'Community',
    title: 'Challenge Results & Testimonials',
    description: 'Post challenge Day 2 results and user testimonials. Showing participant progress creates FOMO and encourages lurkers to join in.',
    tasks: [
      { id: 'd23-t1', text: 'Share Day 1 participant results (with permission)' },
      { id: 'd23-t2', text: 'Highlight best submissions in a Story compilation' },
      { id: 'd23-t3', text: 'Day 2 task: Optimize an SEO title and compare before/after' },
      { id: 'd23-t4', text: 'Respond to every challenge submission personally' },
    ],
    category: 'engagement',
    icon: 'Award',
  },
  {
    day: 24,
    phase: 'Community',
    title: 'Before/After Comparisons',
    description: 'Share Day 3 of the challenge with before/after content comparisons. Visual transformations are the most shareable content format and prove tool effectiveness.',
    tasks: [
      { id: 'd24-t1', text: 'Collect before/after pairs from challenge participants' },
      { id: 'd24-t2', text: 'Design side-by-side comparison graphics' },
      { id: 'd24-t3', text: 'Day 3 task: Generate hashtags and measure reach difference' },
      { id: 'd24-t4', text: 'Share aggregate improvement stats from the challenge' },
    ],
    category: 'engagement',
    icon: 'ArrowLeftRight',
  },

  // ── Phase 8: Growth Push (Days 25-30) ────────────────────────────────────────
  {
    day: 25,
    phase: 'Growth Push',
    title: 'Referral Push: Bonus Credits',
    description: 'Launch a referral push with bonus credits and limited-time rewards. Urgency combined with tangible incentives creates a surge in word-of-mouth acquisition.',
    tasks: [
      { id: 'd25-t1', text: 'Announce double referral credits for 48 hours', link: '/referral' },
      { id: 'd25-t2', text: 'Create urgency-driven graphics with countdown timer' },
      { id: 'd25-t3', text: 'DM top 20 existing users with personal referral ask' },
      { id: 'd25-t4', text: 'Post referral success stories as social proof' },
    ],
    category: 'referral',
    icon: 'Rocket',
  },
  {
    day: 26,
    phase: 'Growth Push',
    title: 'Top Referrer Leaderboard',
    description: 'Share top referrer stories and update the leaderboard. Public recognition motivates continued sharing and creates healthy competition among advocates.',
    tasks: [
      { id: 'd26-t1', text: 'Publish top 5 referrers leaderboard graphic' },
      { id: 'd26-t2', text: 'Share individual referrer spotlight stories' },
      { id: 'd26-t3', text: 'Announce prizes for top 3 referrers' },
      { id: 'd26-t4', text: 'Remind followers the bonus window is closing' },
    ],
    category: 'referral',
    icon: 'Trophy',
  },
  {
    day: 27,
    phase: 'Growth Push',
    title: 'Last Call: Referral Urgency',
    description: 'Send last call messaging with urgency for the referral program. Scarcity and deadline pressure drive action from procrastinators who intended to share.',
    tasks: [
      { id: 'd27-t1', text: 'Post "Last 24 Hours" urgency content across platforms' },
      { id: 'd27-t2', text: 'Send final WhatsApp broadcast to contact list' },
      { id: 'd27-t3', text: 'Share real-time referral count updates' },
      { id: 'd27-t4', text: 'Thank everyone who participated regardless of count' },
    ],
    category: 'referral',
    icon: 'Clock',
  },
  {
    day: 28,
    phase: 'Growth Push',
    title: 'Publish 30-Day Results',
    description: 'Publish your 30-day results — downloads, users, and engagement metrics. Transparent results build massive credibility and inspire others to follow your playbook.',
    tasks: [
      { id: 'd28-t1', text: 'Compile key metrics: downloads, signups, DAU, retention' },
      { id: 'd28-t2', text: 'Design a results infographic with growth chart' },
      { id: 'd28-t3', text: 'Write detailed breakdown post (LinkedIn + blog)' },
      { id: 'd28-t4', text: 'Create a short video summarizing the journey' },
    ],
    category: 'analytics',
    icon: 'BarChart3',
  },
  {
    day: 29,
    phase: 'Growth Push',
    title: '"Help Me Reach 500" Campaign',
    description: 'Make a personal, authentic ask to help reach 500 users. Vulnerability and transparency create emotional investment — people want to be part of a milestone.',
    tasks: [
      { id: 'd29-t1', text: 'Write a heartfelt post sharing current numbers and goal' },
      { id: 'd29-t2', text: 'Explain specifically how each share/download helps' },
      { id: 'd29-t3', text: 'Create a progress tracker graphic updated in real time' },
      { id: 'd29-t4', text: 'Personally thank every new user who joins today' },
    ],
    category: 'engagement',
    icon: 'HandHeart',
  },
  {
    day: 30,
    phase: 'Growth Push',
    title: 'Analyze & Double Down',
    description: 'Analyze results, identify top-performing channels, and double down. Data-driven iteration ensures your next 30 days are even more effective than the first.',
    tasks: [
      { id: 'd30-t1', text: 'Rank channels by downloads generated (referral, social, organic)' },
      { id: 'd30-t2', text: 'Identify top 3 content pieces by engagement rate' },
      { id: 'd30-t3', text: 'Document lessons learned and mistakes to avoid' },
      { id: 'd30-t4', text: 'Create next 30-day plan based on winning strategies' },
      { id: 'd30-t5', text: 'Celebrate the milestone with your community!' },
    ],
    category: 'analytics',
    icon: 'LineChart',
    tip: 'Schedule this analysis as a recurring monthly review to maintain momentum.',
  },
];

// ── Phase metadata ────────────────────────────────────────────────────────────────

export interface PhaseInfo {
  name: string;
  dayRange: [number, number];
  color: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export const phases: PhaseInfo[] = [
  { name: 'Foundation', dayRange: [1, 3], color: 'rgb(var(--info))', colorClass: 'text-info', bgClass: 'bg-info/10', borderClass: 'border-info/30' },
  { name: 'Content Launch', dayRange: [4, 7], color: 'rgb(var(--success))', colorClass: 'text-success', bgClass: 'bg-success/10', borderClass: 'border-success/30' },
  { name: 'Demo Series', dayRange: [8, 10], color: 'rgb(var(--accent))', colorClass: 'text-accent', bgClass: 'bg-accent/10', borderClass: 'border-accent/30' },
  { name: 'Education', dayRange: [11, 14], color: 'rgb(var(--warning))', colorClass: 'text-warning', bgClass: 'bg-warning/10', borderClass: 'border-warning/30' },
  { name: 'Lead Magnet', dayRange: [15, 17], color: 'rgb(var(--accent))', colorClass: 'text-accent', bgClass: 'bg-accent/10', borderClass: 'border-accent/30' },
  { name: 'Build in Public', dayRange: [18, 20], color: 'rgb(var(--cyan))', colorClass: 'text-cyan', bgClass: 'bg-cyan/10', borderClass: 'border-cyan/30' },
  { name: 'Community', dayRange: [21, 24], color: 'rgb(var(--warning))', colorClass: 'text-warning', bgClass: 'bg-warning/10', borderClass: 'border-warning/30' },
  { name: 'Growth Push', dayRange: [25, 30], color: 'rgb(var(--destructive))', colorClass: 'text-destructive', bgClass: 'bg-destructive/10', borderClass: 'border-destructive/30' },
];

/** Get phase info for a given phase name */
export function getPhaseInfo(phaseName: string): PhaseInfo {
  return phases.find((p) => p.name === phaseName) || phases[0];
}

/** Get total task count across all 30 days */
export function getTotalTasks(): number {
  return thirtyDayPlan.reduce((sum, day) => sum + day.tasks.length, 0);
}
