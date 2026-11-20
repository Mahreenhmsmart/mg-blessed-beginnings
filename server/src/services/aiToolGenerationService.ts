/**
 * AI Tool Generation Service — Generates content for AI tools using the existing aiService.
 * Includes pure-math profit calculator (no AI) and platform-aware prompt construction.
 */

import { generateCompletion } from './aiService';
import { crawlUrl } from './crawlerService';

// ─── Product Description Generator ──────────────────────────────────────────

interface ProductDescriptionInput {
  product: string;
  tone?: 'professional' | 'casual' | 'luxury' | 'playful' | 'urgent';
  length?: 'short' | 'medium' | 'long';
  targetAudience?: string;
  keyFeatures?: string[];
}

export async function generateProductDescription(input: ProductDescriptionInput & { outputLanguage?: string }): Promise<string> {
  const { product, tone = 'professional', length = 'medium', targetAudience, keyFeatures, outputLanguage } = input;

  const lengthGuide = {
    short: '2-3 sentences (50-80 words)',
    medium: '1 paragraph (100-150 words)',
    long: '2-3 paragraphs (200-300 words)',
  };

  let prompt = `Generate a compelling product description for an e-commerce listing.

Product: ${product}
Tone: ${tone}
Length: ${lengthGuide[length]}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${keyFeatures && keyFeatures.length > 0 ? `Key Features to Highlight: ${keyFeatures.join(', ')}` : ''}

Requirements:
- Write in a ${tone} tone that appeals to buyers
- Include sensory details and benefits, not just features
- Make it scannable with natural paragraph breaks
- Include a subtle call-to-action
- Optimize for both marketplace search and readability

Output only the product description, no additional commentary.`;

  if (outputLanguage === 'roman-urdu') prompt += ROMAN_URDU_INSTRUCTION;
  return generateCompletion(prompt, { maxTokens: 800 });
}

// ─── SEO Title Optimizer ────────────────────────────────────────────────────

interface SEOTitleInput {
  topic: string;
  keywords?: string[];
  platform?: 'eBay' | 'Etsy' | 'Shopify' | 'Amazon' | 'general';
  maxLength?: number;
  outputLanguage?: string;
}

export async function generateSEOTitle(input: SEOTitleInput): Promise<string> {
  const { topic, keywords = [], platform = 'general', maxLength, outputLanguage } = input;

  const platformLimits: Record<string, number> = {
    eBay: 80,
    Etsy: 140,
    Shopify: 70,
    Amazon: 200,
    general: 60,
  };

  const charLimit = maxLength || platformLimits[platform];

  let prompt = `Generate an SEO-optimized product title for ${platform === 'general' ? 'e-commerce' : platform}.

Product/Topic: ${topic}
${keywords.length > 0 ? `Keywords to include: ${keywords.join(', ')}` : ''}
Maximum characters: ${charLimit}

Requirements:
- Front-load the most important keywords
- Include brand name if relevant
- Add specific attributes (size, color, material, condition)
- Follow ${platform === 'general' ? 'standard e-commerce' : platform} title conventions
- Stay within the character limit
- Be descriptive but concise

Provide 3 title variations, each on its own line, prefixed with "Option 1:", "Option 2:", "Option 3:".`;

  if (outputLanguage === 'roman-urdu') prompt += ROMAN_URDU_INSTRUCTION;
  return generateCompletion(prompt, { maxTokens: 400 });
}

// ─── Hashtag Generator ──────────────────────────────────────────────────────

interface HashtagInput {
  topic: string;
  platform?: 'Instagram' | 'TikTok' | 'Pinterest' | 'Twitter' | 'LinkedIn';
  count?: number;
  niche?: string;
  outputLanguage?: string;
}

export async function generateHashtags(input: HashtagInput): Promise<string> {
  const { topic, platform = 'Instagram', count = 30, niche, outputLanguage } = input;

  let prompt = `Generate ${count} relevant hashtags for ${platform} about "${topic}"${niche ? ` in the ${niche} niche` : ''}.

Requirements:
- Mix of popular (1M+ posts), moderate (100K-1M), and niche (<100K) hashtags
- All hashtags should be relevant and trending
- Include some community-specific tags
- Format as space-separated hashtags with # prefix
- No banned or spam-associated hashtags

Organize into these categories:
🔥 Popular (5-${Math.floor(count * 0.2)} tags): High volume, broad reach
📈 Moderate (${Math.floor(count * 0.4)} tags): Good engagement potential
🎯 Niche (${Math.floor(count * 0.4)} tags): Targeted audience

Output the hashtags grouped by category with the emoji headers above.`;

  if (outputLanguage === 'roman-urdu') prompt += ROMAN_URDU_INSTRUCTION;
  return generateCompletion(prompt, { maxTokens: 600 });
}

// ─── Profit Calculator (Pure Math — NO AI) ──────────────────────────────────

interface ProfitCalculatorInput {
  productCost: number;
  sellingPrice: number;
  shippingCost?: number;
  marketplaceFeePercent?: number;
  marketplaceFeeFlat?: number;
  paymentProcessingPercent?: number;
  advertisingCost?: number;
  otherExpenses?: number;
  profitMarketplace?: string;
  profitCountry?: string;
  profitCurrency?: string;
  commissionPercent?: number;
  deliveryFee?: number;
  // Legacy Daraz-specific fields (merged into commissionPercent/deliveryFee)
  darazCommissionPercent?: number;
  darazDeliveryFee?: number;
}

interface ProfitResult {
  productCost: number;
  sellingPrice: number;
  shippingCost: number;
  commissionFee: number;
  paymentProcessingFee: number;
  deliveryFee: number;
  advertisingCost: number;
  otherExpenses: number;
  totalCosts: number;
  profit: number;
  profitMargin: number;
  roi: number;
  summary: string;
}

export function calculateProfit(input: ProfitCalculatorInput): ProfitResult {
  const {
    productCost,
    sellingPrice,
    shippingCost = 0,
    marketplaceFeePercent = 0,
    marketplaceFeeFlat = 0,
    paymentProcessingPercent = 0,
    advertisingCost = 0,
    otherExpenses = 0,
    profitMarketplace = 'Other',
    profitCountry = '',
    profitCurrency = 'USD',
    commissionPercent = 0,
    deliveryFee = 0,
    darazCommissionPercent = 0,
    darazDeliveryFee = 0,
  } = input;

  // Validate inputs
  if (productCost < 0 || sellingPrice <= 0 || shippingCost < 0) {
    throw new Error('Invalid input: costs must be non-negative and selling price must be greater than zero.');
  }
  if (marketplaceFeePercent < 0 || marketplaceFeePercent > 100) {
    throw new Error('Commission fee percentage must be between 0 and 100.');
  }
  if (paymentProcessingPercent < 0 || paymentProcessingPercent > 100) {
    throw new Error('Payment processing fee percentage must be between 0 and 100.');
  }

  // Merge legacy Daraz fields into universal fields when Daraz is selected
  const effectiveCommissionPercent = profitMarketplace === 'Daraz' && darazCommissionPercent > 0
    ? darazCommissionPercent
    : commissionPercent > 0 ? commissionPercent : marketplaceFeePercent;
  const effectiveDeliveryFee = profitMarketplace === 'Daraz' && darazDeliveryFee > 0
    ? darazDeliveryFee
    : deliveryFee > 0 ? deliveryFee : marketplaceFeeFlat;

  const cs = profitCurrency || 'USD';

  const commissionFee = sellingPrice * effectiveCommissionPercent / 100;
  const paymentProcessingFee = sellingPrice * paymentProcessingPercent / 100;
  const totalCosts = productCost + shippingCost + commissionFee + paymentProcessingFee + effectiveDeliveryFee + advertisingCost + otherExpenses;
  const profit = sellingPrice - totalCosts;
  const profitMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
  const roi = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;

  // Round all values to 2 decimal places for consistent display
  const roundedCommissionFee = parseFloat(commissionFee.toFixed(2));
  const roundedPaymentProcessingFee = parseFloat(paymentProcessingFee.toFixed(2));
  const roundedDeliveryFee = parseFloat(effectiveDeliveryFee.toFixed(2));
  const roundedTotalCosts = parseFloat(totalCosts.toFixed(2));
  const roundedProfit = parseFloat(profit.toFixed(2));
  const roundedProfitMargin = parseFloat(profitMargin.toFixed(2));
  const roundedRoi = parseFloat(roi.toFixed(2));

  const summaryLines = [
    `💰 Profit Calculator Results`,
    `🏪 Marketplace: ${profitMarketplace}${profitCountry ? ` (${profitCountry})` : ''}`,
    `💱 Currency: ${cs}`,
    ``,
    `📊 Cost Breakdown:`,
    `   Product Cost: ${cs} ${productCost.toFixed(2)}`,
    `   Shipping Cost: ${cs} ${shippingCost.toFixed(2)}`,
    `   Commission/Referral Fee (${effectiveCommissionPercent.toFixed(2)}%): ${cs} ${roundedCommissionFee.toFixed(2)}`,
    `   Payment Processing Fee (${paymentProcessingPercent.toFixed(2)}%): ${cs} ${roundedPaymentProcessingFee.toFixed(2)}`,
    `   Delivery Fee: ${cs} ${roundedDeliveryFee.toFixed(2)}`,
    `   Advertising Cost: ${cs} ${advertisingCost.toFixed(2)}`,
    `   Other Costs: ${cs} ${otherExpenses.toFixed(2)}`,
    `   ─────────────────────`,
    `   Total Costs: ${cs} ${roundedTotalCosts.toFixed(2)}`,
    ``,
    `💵 Selling Price: ${cs} ${sellingPrice.toFixed(2)}`,
    `✅ Net Profit: ${cs} ${roundedProfit.toFixed(2)}`,
    `📈 Profit Margin: ${roundedProfitMargin.toFixed(2)}%`,
    `🔄 ROI: ${roundedRoi.toFixed(2)}%`,
    ``,
    roundedProfit > 0
      ? `✓ This pricing is profitable. You earn ${cs} ${roundedProfit.toFixed(2)} per sale.`
      : `⚠ Warning: You are losing ${cs} ${Math.abs(roundedProfit).toFixed(2)} per sale at this price. Consider increasing your selling price or reducing costs.`,
  ];

  const summary = summaryLines.join('\n');

  return {
    productCost,
    sellingPrice,
    shippingCost,
    commissionFee: roundedCommissionFee,
    paymentProcessingFee: roundedPaymentProcessingFee,
    deliveryFee: roundedDeliveryFee,
    advertisingCost,
    otherExpenses,
    totalCosts: roundedTotalCosts,
    profit: roundedProfit,
    profitMargin: roundedProfitMargin,
    roi: roundedRoi,
    summary,
  };
}

// ─── Competitor Analyzer ────────────────────────────────────────────────────

interface CompetitorAnalyzerInput {
  url: string;
  focusAreas?: ('pricing' | 'seo' | 'content' | 'ux' | 'social')[];
  outputLanguage?: string;
}

export async function analyzeCompetitor(input: CompetitorAnalyzerInput): Promise<string> {
  const { url, focusAreas = ['pricing', 'seo', 'content'], outputLanguage } = input;

  let prompt = `Analyze this competitor website/store: ${url}

Focus Areas: ${focusAreas.join(', ')}

Since I cannot directly access the URL, provide a comprehensive competitor analysis framework based on typical patterns for e-commerce stores. Include:

1. **Likely Strengths** (based on common successful store patterns)
   - What they're probably doing well
   
2. **Potential Weaknesses/Gaps** 
   - Common opportunities to differentiate
   
3. **SEO Analysis Framework**
   - Keywords to investigate
   - Content gaps to explore
   
4. **Pricing Strategy Insights**
   - How to research their pricing
   - Positioning opportunities
   
5. **Actionable Recommendations**
   - Specific steps to outperform them

Note: This is a strategic framework. For actual data, use tools like SEMrush, Ahrefs, or SimilarWeb.

Format as a structured analysis report.`;

  if (outputLanguage === 'roman-urdu') prompt += ROMAN_URDU_INSTRUCTION;
  return generateCompletion(prompt, { maxTokens: 800 });
}

// ─── Review Response Writer ─────────────────────────────────────────────────

interface ReviewResponseInput {
  review: string;
  rating?: number;
  tone?: 'friendly' | 'professional' | 'apologetic' | 'grateful' | 'empathetic';
  businessName?: string;
  outputLanguage?: string;
}

export async function generateReviewResponse(input: ReviewResponseInput): Promise<string> {
  const { review, rating, tone = 'professional', businessName = 'our business', outputLanguage } = input;

  const isNegative = rating && rating <= 2;
  const isPositive = rating && rating >= 4;

  let toneGuidance = '';
  switch (tone) {
    case 'friendly':
      toneGuidance = 'Warm, casual, and personable. Use contractions and show genuine enthusiasm.';
      break;
    case 'professional':
      toneGuidance = 'Polite, formal, and solution-oriented. Maintain composure and professionalism.';
      break;
    case 'apologetic':
      toneGuidance = 'Sincere apology, acknowledge the issue, offer resolution. Take responsibility.';
      break;
    case 'grateful':
      toneGuidance = 'Express genuine appreciation, highlight their specific feedback, invite them back.';
      break;
    case 'empathetic':
      toneGuidance = 'Show understanding, validate their feelings, demonstrate you care about their experience.';
      break;
  }

  const prompt = `Write a response to this customer review for ${businessName}.

Review: "${review}"
${rating ? `Rating: ${rating}/5 stars` : ''}
Desired Tone: ${tone}

Tone Guidance: ${toneGuidance}

Requirements:
${isNegative ? '- Acknowledge the issue sincerely\n- Apologize without being defensive\n- Offer a specific resolution or next step\n- Invite them to contact directly for follow-up' : ''}
${isPositive ? '- Thank them specifically for their feedback\n- Reference something specific from their review\n- Reinforce your commitment to quality\n- Invite them to return/recommend' : ''}
${!isNegative && !isPositive ? '- Address their points thoughtfully\n- Show you value their feedback\n- Maintain appropriate tone throughout' : ''}
- Keep it concise (3-5 sentences)
- Personalize based on the review content
- End with a warm closing

Output only the review response, ready to post.`;

  return generateCompletion(prompt, { maxTokens: 400 });
}

// ─── Listing Optimizer (AI-powered) ──────────────────────────────────────────

interface ListingOptimizerInput {
  productTitle: string;
  description: string;
  category?: string;
  keywords?: string;
  platform?: 'eBay' | 'Etsy' | 'Shopify' | 'Amazon' | 'general';
  details?: string;
}

export async function generateListingOptimization(input: ListingOptimizerInput): Promise<string> {
  const { productTitle, description, category, keywords, platform = 'general', details } = input;

  const platformGuide: Record<string, string> = {
    eBay: 'eBay: max 80-char title, item specifics matter, Cassini search engine',
    Etsy: 'Etsy: max 140-char title, use all 13 tags, front-load keywords',
    Shopify: 'Shopify: SEO-friendly URL handle, meta description under 155 chars',
    Amazon: 'Amazon: follow style guide, bullet points for features, A+ content ready',
    general: 'General e-commerce best practices across platforms',
  };

  const prompt = `You are an expert e-commerce listing optimizer. Analyze and optimize this product listing for ${platform === 'general' ? 'general e-commerce' : platform}.

CURRENT LISTING:
Title: ${productTitle}
Description: ${description}
${category ? `Category: ${category}` : ''}
${keywords ? `Target Keywords: ${keywords}` : ''}
${details ? `Additional Details: ${details}` : ''}

Platform Guidelines: ${platformGuide[platform] || platformGuide.general}

Provide a comprehensive optimization report with these sections:

## 🏷️ Optimized SEO Title
Provide 2 optimized title options that front-load important keywords, include key attributes (brand, size, color, material, condition), and respect platform character limits.

## 📝 Optimized Description
Rewrite the description to be more compelling, scannable, and keyword-rich. Include sensory details, benefits over features, and a subtle call-to-action. Format with natural paragraph breaks.

## 🏷️ Recommended Keywords & Tags
List 10-15 relevant keywords/tags organized by priority (high/medium/low competition). Include long-tail variations.

## ⭐ Key Selling Points
Extract and enhance 3-5 key selling points as bullet points. Each should lead with a benefit.

## 💡 Improvement Suggestions
Provide 3-5 specific, actionable suggestions to improve conversion rate, search visibility, or buyer confidence.

Format the output clearly with section headers. Be specific and actionable — avoid generic advice.`;

  return generateCompletion(prompt, { maxTokens: 1200 });
}

// ─── Social Media Studio (AI-powered) ────────────────────────────────────────

interface SocialMediaInput {
  platform: 'Instagram' | 'TikTok' | 'Facebook' | 'LinkedIn' | 'Twitter';
  topic: string;
  targetAudience?: string;
  contentType?: 'post' | 'reel' | 'story' | 'carousel';
  tone?: 'professional' | 'casual' | 'inspirational' | 'humorous';
  keyMessage?: string;
  cta?: string;
}

export async function generateSocialMediaContent(input: SocialMediaInput): Promise<string> {
  const { platform, topic, targetAudience, contentType = 'post', tone = 'casual', keyMessage, cta } = input;

  const platformLimits: Record<string, { chars: number; hashtags: number; format: string }> = {
    Instagram: { chars: 2200, hashtags: 30, format: 'Caption + visual content' },
    TikTok: { chars: 2200, hashtags: 5, format: 'Short-form video caption' },
    Facebook: { chars: 63206, hashtags: 5, format: 'Post with optional link' },
    LinkedIn: { chars: 3000, hashtags: 5, format: 'Professional post or article' },
    Twitter: { chars: 280, hashtags: 3, format: 'Concise tweet or thread' },
  };

  const platInfo = platformLimits[platform];

  const prompt = `You are a social media content expert. Create engaging ${contentType} content for ${platform}.

TOPIC/PRODUCT: ${topic}
${targetAudience ? `TARGET AUDIENCE: ${targetAudience}` : ''}
CONTENT TYPE: ${contentType}
TONE: ${tone}
${keyMessage ? `KEY MESSAGE: ${keyMessage}` : ''}
${cta ? `DESIRED CTA: ${cta}` : ''}

PLATFORM CONSTRAINTS:
- Max characters: ~${platInfo.chars}
- Recommended hashtags: ${platInfo.hashtags}
- Format: ${platInfo.format}

Generate the following:

## 🎯 Hook / First Line
Write an attention-grabbing opening line that stops the scroll. Make it curiosity-driven, relatable, or bold.

## 📝 Caption
Write the full caption in a ${tone} tone. Use line breaks for readability. Include storytelling elements, value propositions, or educational content appropriate for ${platform}.

## 🔗 Call-to-Action
Provide a clear, compelling CTA that drives engagement (comment, share, click, purchase). If no CTA was specified, suggest one appropriate for the content type.

## #️⃣ Hashtags
Provide exactly ${platInfo.hashtags} relevant hashtags. Mix popular, moderate, and niche tags. Format them ready to copy-paste.

## 🔄 Content Variations
Provide 2 alternative short-form versions of this content (different hooks, angles, or formats) that could be used for A/B testing or repurposing.

Make the content authentic, engaging, and optimized for ${platform}'s algorithm. Avoid generic filler phrases.`;

  return generateCompletion(prompt, { maxTokens: 1000 });
}

// ─── Store Audit Generator ────────────────────────────────────────────────────

interface StoreAuditInput {
  storeUrl?: string;
  platformType?: 'Shopify' | 'WooCommerce' | 'Etsy' | 'eBay' | 'Wix' | 'Custom' | 'Other';
  businessNiche?: string;
  additionalInfo?: string;
}

export async function generateStoreAudit(input: StoreAuditInput): Promise<string> {
  const { storeUrl, platformType = 'other', businessNiche, additionalInfo } = input;

  let crawlContext = '';
  if (storeUrl) {
    try {
      const crawlResult = await crawlUrl(storeUrl);
      crawlContext = `
ACTUAL STORE DATA (crawled from ${storeUrl}):
- Title: ${crawlResult.title || 'Not found'}
- Meta Description: ${crawlResult.metaDescription || 'Not found'}
- Headings count: ${crawlResult.headings.length} (H1: ${crawlResult.headings.filter(h => h.level === 1).length})
- Images: ${crawlResult.images.length} (${crawlResult.images.filter(i => !i.hasAlt).length} missing alt text)
- Internal links: ${crawlResult.internalLinks.length}
- External links: ${crawlResult.externalLinks.length}
- Has sitemap: ${crawlResult.hasSitemap}
- Has robots.txt: ${crawlResult.hasRobotsTxt}
- Is HTTPS: ${crawlResult.isHttps}
- Load time: ${crawlResult.loadTimeMs}ms
- Content length: ${crawlResult.contentLength} chars
- Has FAQ schema: ${crawlResult.hasFaqSchema}
- Has Organization schema: ${crawlResult.hasOrganizationSchema}
- Has privacy policy link: ${crawlResult.hasPrivacyPolicyLink}
- Has contact link: ${crawlResult.hasContactLink}
- Has about link: ${crawlResult.hasAboutLink}
- Paragraphs: ${crawlResult.paragraphCount}, Lists: ${crawlResult.listCount}
`;
    } catch {
      crawlContext = `\nNote: Unable to crawl the provided URL. Analysis below is based on general best practices for ${platformType} stores.\n`;
    }
  }

  const prompt = `You are an expert e-commerce store auditor. Provide a comprehensive store audit report.

${crawlContext}

Platform: ${platformType}
${businessNiche ? `Business Niche: ${businessNiche}` : ''}
${additionalInfo ? `Additional Context: ${additionalInfo}` : ''}

Generate a structured markdown audit report with these sections:

## 🔍 SEO Issues
Identify specific SEO problems and opportunities. Include title tag analysis, meta description assessment, heading structure review, image optimization status, internal linking evaluation, and schema markup recommendations. Rate each issue as Critical/Important/Low.

## 📦 Product Page Quality
Assess product page effectiveness including description quality, image standards, pricing display, trust signals, social proof elements, and conversion-focused layout. Provide specific improvement suggestions.

## 🎨 Usability Recommendations
Evaluate navigation clarity, mobile responsiveness indicators, checkout flow considerations, search functionality, and overall user experience. Prioritize by impact on conversion rate.

## ⚡ Performance Checklist
Provide a checklist of performance optimizations including image compression, lazy loading, caching, code minification, CDN usage, and Core Web Vitals targets. Mark items as Done/Needs Work/Critical.

## 🎯 Prioritized Action Items
List the top 10 action items ranked by expected ROI. For each item include: the specific action, estimated effort (Low/Medium/High), expected impact (Low/Medium/High), and a brief rationale.

Format as clean markdown with clear section headers. Be specific and actionable — avoid generic advice.`;

  return generateCompletion(prompt, { maxTokens: 1500 });
}

// ─── Branding Assistant Generator ─────────────────────────────────────────────

interface BrandingAssistantInput {
  businessName: string;
  niche: string;
  targetAudience?: string;
  brandPersonality?: string[];
  existingColors?: string;
}

export async function generateBrandingAssistant(input: BrandingAssistantInput): Promise<string> {
  const { businessName, niche, targetAudience, brandPersonality, existingColors } = input;

  const prompt = `You are an expert brand strategist. Create a comprehensive brand identity guide.

Business Name: ${businessName}
Niche/Industry: ${niche}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${brandPersonality && brandPersonality.length > 0 ? `Brand Personality Traits: ${brandPersonality.join(', ')}` : ''}
${existingColors ? `Existing Colors (if any): ${existingColors}` : ''}

Generate a structured markdown branding guide with these sections:

## 🎯 Brand Positioning Statement
Write a clear, concise positioning statement following the format: "For [target audience], [business name] is the [category] that [key benefit] because [reason to believe]." Provide 2 variations.

## 🗣️ Brand Voice Guidelines
Define the brand voice across dimensions: tone (formal-casual spectrum), personality traits, language dos and don'ts, sample sentences showing the voice in action, and how the voice adapts across channels (social media vs. email vs. website).

## 🎨 Color Palette Suggestions
Suggest a primary color palette (3-5 colors) with hex codes. Include: primary brand color, secondary color, accent color, neutral/light background, and dark/text color. Explain the psychology behind each choice and how they work together. If existing colors were provided, build upon them.

## ✏️ Logo Direction
Describe 3 logo direction concepts including style (wordmark, icon+text, emblem), font style suggestions, symbol/icon ideas relevant to the niche, and color application guidelines. These should serve as creative briefs for a designer or AI image generator.

## 💬 Tagline Options
Generate 5 tagline options ranging from descriptive to aspirational. Each should be under 8 words, memorable, and communicate the core value proposition.

## 📱 Social Media Bio Suggestions
Write platform-specific bio copy for Instagram (150 chars), Twitter/X (160 chars), LinkedIn (headline + about opener), and TikTok (80 chars). Include relevant emoji usage and CTA suggestions.

## ✅ Brand Consistency Checklist
Create a 15-point checklist covering visual consistency, messaging alignment, tone adherence, logo usage rules, color application, typography standards, imagery style, and cross-platform coherence.

Be creative yet practical. All suggestions should be implementable by a small business owner without a design team.`;

  return generateCompletion(prompt, { maxTokens: 1500 });
}

// ─── Bulk Listing Generator ───────────────────────────────────────────────────

interface BulkListingProduct {
  name: string;
  category?: string;
  features?: string;
  marketplace?: string;
}

interface BulkListingInput {
  products: string; // JSON array or line-by-line text
  targetMarketplace?: 'eBay' | 'Etsy' | 'Shopify' | 'Amazon' | 'general';
  batchSize?: number;
}

interface BulkListingResult {
  productName: string;
  status: 'success' | 'failure';
  title?: string;
  description?: string;
  keywords?: string;
  tags?: string;
  error?: string;
}

export async function generateBulkListings(input: BulkListingInput): Promise<string> {
  const { products: rawProducts, targetMarketplace = 'general', batchSize } = input;

  // Parse products from JSON or line-by-line format
  let productList: BulkListingProduct[] = [];
  try {
    productList = JSON.parse(rawProducts);
  } catch {
    // Try line-by-line parsing: each line is "name | category | features"
    productList = rawProducts
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split('|').map((p) => p.trim());
        return {
          name: parts[0] || line,
          category: parts[1] || undefined,
          features: parts[2] || undefined,
        };
      });
  }

  // Enforce max batch size of 20
  const maxBatch = Math.min(batchSize || 20, 20);
  const limitedProducts = productList.slice(0, maxBatch);

  if (limitedProducts.length === 0) {
    return 'No valid products found. Please provide product data as JSON array or line-by-line format (name | category | features).';
  }

  const results: BulkListingResult[] = [];

  for (const product of limitedProducts) {
    try {
      const mp = product.marketplace || targetMarketplace;
      const prompt = `Generate an optimized e-commerce listing for ${mp === 'general' ? 'general e-commerce' : mp}.

Product: ${product.name}
${product.category ? `Category: ${product.category}` : ''}
${product.features ? `Key Features: ${product.features}` : ''}

Provide exactly this format (use --- as separators):
TITLE: [optimized title within platform limits]
---
DESCRIPTION: [compelling 100-150 word description with benefits and CTA]
---
KEYWORDS: [comma-separated SEO keywords, 10-15 terms]
---
TAGS: [comma-separated marketplace tags, 5-10 terms]`;

      const response = await generateCompletion(prompt, { maxTokens: 600 });

      // Parse the structured response
      const sections = response.split('---').map((s) => s.trim());
      const titleSection = sections.find((s) => s.startsWith('TITLE:'));
      const descSection = sections.find((s) => s.startsWith('DESCRIPTION:'));
      const kwSection = sections.find((s) => s.startsWith('KEYWORDS:'));
      const tagSection = sections.find((s) => s.startsWith('TAGS:'));

      results.push({
        productName: product.name,
        status: 'success',
        title: titleSection?.replace(/^TITLE:\s*/i, '').trim(),
        description: descSection?.replace(/^DESCRIPTION:\s*/i, '').trim(),
        keywords: kwSection?.replace(/^KEYWORDS:\s*/i, '').trim(),
        tags: tagSection?.replace(/^TAGS:\s*/i, '').trim(),
      });
    } catch (err) {
      results.push({
        productName: product.name,
        status: 'failure',
        error: err instanceof Error ? err.message : 'Generation failed',
      });
    }

    // Rate-limit-friendly delay between AI calls (3 seconds)
    if (limitedProducts.indexOf(product) < limitedProducts.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  // Format results as readable output
  const successCount = results.filter((r) => r.status === 'success').length;
  const failCount = results.filter((r) => r.status === 'failure').length;

  let output = `# Bulk Listing Generation Results\n\n`;
  output += `**Processed:** ${results.length} products | **Success:** ${successCount} | **Failed:** ${failCount}\n`;
  output += `**Marketplace:** ${targetMarketplace}\n\n`;

  for (const result of results) {
    output += `---\n\n`;
    if (result.status === 'success') {
      output += `### ✅ ${result.productName}\n\n`;
      output += `**Title:** ${result.title}\n\n`;
      output += `**Description:**\n${result.description}\n\n`;
      output += `**Keywords:** ${result.keywords}\n\n`;
      output += `**Tags:** ${result.tags}\n\n`;
    } else {
      output += `### ❌ ${result.productName}\n\n`;
      output += `**Error:** ${result.error}\n\n`;
    }
  }

  return output;
}

// ─── Product Research Generator ───────────────────────────────────────────────

interface ProductResearchInput {
  productNiche: string;
  keywords?: string;
  targetMarket?: string;
  competitorUrls?: string;
}

export async function generateProductResearch(input: ProductResearchInput): Promise<string> {
  const { productNiche, keywords, targetMarket, competitorUrls } = input;

  const prompt = `You are an expert e-commerce product researcher. Provide a comprehensive product research analysis.

IMPORTANT DISCLAIMER: This is an AI-generated analysis based on general market knowledge and patterns. All estimates, scores, and projections are AI-generated approximations — NOT verified market data. Always validate findings with real market research tools (Jungle Scout, Helium 10, Google Trends, etc.) before making business decisions.

Product Niche: ${productNiche}
${keywords ? `Related Keywords: ${keywords}` : ''}
${targetMarket ? `Target Market: ${targetMarket}` : ''}
${competitorUrls ? `Competitor References: ${competitorUrls}` : ''}

Generate a structured markdown research report with these sections:

## 📊 Opportunity Assessment
Analyze the overall opportunity including market size estimation (clearly labeled as AI estimate), growth trajectory indicators, seasonality patterns, entry barriers, and capital requirements. Rate the opportunity as High/Medium/Low with reasoning.

## 📈 Demand Indicators
Identify demand signals including search trend direction, social media interest indicators, seasonal demand patterns, related trending topics, and buyer intent signals. Clearly distinguish between observed patterns and AI-generated estimates.

## ⚔️ Competition Analysis Framework
Provide a framework for analyzing competition including: number of established players (estimated range), typical price points, differentiation opportunities, common weaknesses in existing offerings, review sentiment patterns, and market saturation indicators.

## 💰 Pricing Strategy Suggestions
Suggest pricing approaches including: recommended price range (AI estimate based on niche norms), premium vs. budget positioning analysis, psychological pricing tactics, bundle/upsell opportunities, and margin target recommendations.

## 📐 Margin Estimation Approach
Outline how to calculate realistic margins including: typical COGS ranges for this niche (AI estimate), platform fee breakdowns by marketplace, shipping cost considerations, marketing cost allocation, and break-even analysis framework.

## 🏆 Opportunity Score
Provide an overall opportunity score out of 100, broken down into weighted sub-scores: Demand (25%), Competition (25%), Margins (20%), Entry Barriers (15%), Growth Potential (15%). Explain the scoring rationale.

## ⚠️ Disclaimer
Reiterate that all data points are AI-generated estimates. List specific tools and methods the user should use to validate each section of this analysis. Emphasize that this report is a starting framework, not a substitute for real market research.

Format as clean markdown. Every numerical estimate must be prefixed with "Est." or labeled as "AI-generated". Never present estimates as verified facts.`;

  return generateCompletion(prompt, { maxTokens: 1500 });
}

// ─── Prompt Library Generator ────────────────────────────────────────────────

interface PromptLibraryInput {
  category: string;
  topic: string;
  platform?: string;
  tone?: string;
  count?: number;
}

export async function generatePromptLibrary(input: PromptLibraryInput): Promise<string> {
  const { category, topic, platform = 'General', tone = 'Professional', count = 10 } = input;

  const prompt = `You are an expert content strategist and copywriter. Generate a library of ${count} ready-to-use prompts/templates for the "${category}" category.

Topic/Subject: ${topic}
Platform: ${platform}
Tone: ${tone}

Requirements:
- Generate exactly ${count} numbered prompts organized into logical subcategories
- Each prompt should be a complete, fill-in-the-blank template that users can immediately use
- Include placeholder markers like [product name], [benefit], [target audience] where users customize
- Prompts should cover different angles: engagement, sales, storytelling, education, community-building
- Match the ${tone} tone throughout
- Optimize for ${platform} conventions and best practices
- Make each prompt actionable and specific — avoid generic filler

Format the output as:

## 📚 Prompt Library: ${category} — ${topic}

### [Subcategory Name]
1. **[Prompt Title]**
   [The actual prompt/template with placeholders]

2. **[Prompt Title]**
   [The actual prompt/template with placeholders]

(repeat for all subcategories until ${count} prompts are reached)

Organize prompts under 3-5 relevant subcategories (e.g., "Engagement Posts", "Sales & Promotions", "Storytelling", "Educational Content", "Community Building"). Number prompts sequentially across all subcategories.`;

  return generateCompletion(prompt, { maxTokens: 1500 });
}

// ─── Listing Health Score ──────────────────────────────────────────────────────

interface ListingHealthScoreInput {
  listingTitle: string;
  description: string;
  price: number;
  marketplace: 'Shopify' | 'eBay' | 'Etsy' | 'Amazon';
}

export async function generateListingHealthScore(input: ListingHealthScoreInput): Promise<string> {
  const { listingTitle, description, price, marketplace } = input;

  const prompt = `You are an expert e-commerce listing auditor. Analyze this product listing for ${marketplace} and return a structured health score report.

LISTING DETAILS:
Title: ${listingTitle}
Description: ${description}
Price: $${price}
Marketplace: ${marketplace}

You MUST respond in the following EXACT markdown format. Do not deviate from this structure. Each score must be an integer between 0 and 100.

## SCORES

Overall Score: [number 0-100]
Title SEO: [number 0-100]
Description Quality: [number 0-100]
Keyword Coverage: [number 0-100]
Pricing Competitiveness: [number 0-100]
Trust & Conversion Signals: [number 0-100]

## RANKED FIXES

For each fix, provide exactly these three lines per fix, ordered from highest to lowest impact:

Fix #1: [What is wrong — specific issue identified]
Why It Matters: [Why this matters for visibility/conversion on ${marketplace}]
Suggested Correction: [The exact suggested correction or improvement]

Fix #2: [What is wrong]
Why It Matters: [Why this matters]
Suggested Correction: [The exact suggested correction]

Fix #3: [What is wrong]
Why It Matters: [Why this matters]
Suggested Correction: [The exact suggested correction]

Fix #4: [What is wrong]
Why It Matters: [Why this matters]
Suggested Correction: [The exact suggested correction]

Fix #5: [What is wrong]
Why It Matters: [Why this matters]
Suggested Correction: [The exact suggested correction]

## QUICK WINS

- [Quick win 1 — something that can be fixed in under 2 minutes with high impact]
- [Quick win 2]
- [Quick win 3]

Scoring guidelines:
- Title SEO: Evaluate keyword placement, length vs ${marketplace} limits, front-loading of important terms, inclusion of brand/model/attributes
- Description Quality: Evaluate readability, benefit-focused language, scannability, completeness, call-to-action presence
- Keyword Coverage: Evaluate diversity of relevant keywords, long-tail coverage, absence of keyword stuffing, alignment with buyer search intent
- Pricing Competitiveness: Evaluate whether the price seems competitive for the product type, psychological pricing usage, value perception
- Trust & Conversion Signals: Evaluate presence of trust indicators (guarantees, reviews mentions, shipping info, return policy), urgency/scarcity signals, clear CTAs

Be specific and actionable. Reference the actual listing content in your fixes. Every fix must include a concrete suggested correction, not generic advice.`;

  return generateCompletion(prompt, { maxTokens: 1200 });
}

// ─── Keyword Research Tool ──────────────────────────────────────────────────

interface KeywordResearchInput {
  seedKeyword: string;
  target: 'Google' | 'Shopify' | 'eBay' | 'Etsy' | 'Amazon';
}

export async function generateKeywordResearch(input: KeywordResearchInput): Promise<string> {
  const { seedKeyword, target } = input;

  const platformContext: Record<string, string> = {
    Google: 'Google Search SEO — focus on informational, commercial, and transactional search intent. Consider blog content, landing pages, and product pages.',
    Shopify: 'Shopify store SEO — focus on product keywords, collection page terms, and buyer-intent phrases that drive e-commerce conversions.',
    eBay: 'eBay marketplace search (Cassini) — focus on product-specific attributes, brand names, model numbers, condition descriptors, and buyer search behavior on eBay.',
    Etsy: 'Etsy marketplace search — focus on handmade/vintage/craft-supply keywords, gift-related terms, occasion-based searches, and long-tail phrases buyers use on Etsy.',
    Amazon: 'Amazon A9 search algorithm — focus on high-conversion product keywords, backend search terms, brand + feature combinations, and purchase-intent phrases.',
  };

  const prompt = `You are an expert keyword researcher specializing in ${target} keyword strategy. Perform comprehensive keyword research for the seed keyword: "${seedKeyword}".

Target Platform: ${target}
Platform Context: ${platformContext[target] || platformContext.Google}

IMPORTANT DISCLAIMER: All search volume estimates and competition levels are AI-generated approximations based on general market knowledge — NOT verified data from any keyword tool. Always validate with real tools (Google Keyword Planner, Helium 10, eRank, Terapeak, etc.) before making business decisions.

You MUST respond in the following EXACT markdown format. Do not deviate from this structure.

## KEYWORD TABLE

| Keyword | Search Volume | Competition |
|---------|--------------|-------------|
| [keyword 1] | [High/Medium/Low] (~[numeric estimate]/mo) | [Low/Medium/High] — [one-line explanation] |
| [keyword 2] | [High/Medium/Low] (~[numeric estimate]/mo) | [Low/Medium/High] — [one-line explanation] |

(Provide exactly 10 keywords in the table above. Mix short-tail and long-tail keywords relevant to ${target}.)

## KEYWORD DIFFICULTY

Overall Difficulty: [Easy/Medium/Hard]
Explanation: [2-3 sentences explaining the overall keyword difficulty for "${seedKeyword}" on ${target}, considering competition density, established players, and ranking barriers.]

## RECOMMENDED KEYWORDS

Primary Keyword: [the single best keyword to target]
Secondary Keywords:
- [supporting keyword 1]
- [supporting keyword 2]
- [supporting keyword 3]
- [supporting keyword 4]
- [supporting keyword 5]

Strategy Note: [1-2 sentences on how to use these keywords together in a ${target} listing or content piece.]

## CONTENT IDEAS

1. [Content/listing idea that naturally uses these keywords — specific and actionable for ${target}]
2. [Content/listing idea 2]
3. [Content/listing idea 3]
4. [Content/listing idea 4]
5. [Content/listing idea 5]

Tailor all suggestions specifically for ${target}. ${target === 'Google' ? 'Focus on content marketing and organic search strategy.' : target === 'Amazon' ? 'Focus on Amazon product listing optimization, bullet points, and backend keywords.' : target === 'eBay' ? 'Focus on eBay title optimization, item specifics, and completed-listing keyword patterns.' : target === 'Etsy' ? 'Focus on Etsy tags, title front-loading, and seasonal keyword rotation.' : 'Focus on Shopify product page SEO, collection keywords, and blog content strategy.'}`;

  return generateCompletion(prompt, { maxTokens: 1500 });
}

// ─── Brand Campaign Studio ────────────────────────────────────────────────────

interface BrandCampaignStudioInput {
  brandName?: string;
  websiteUrl?: string;
  description?: string;
  targetAudience?: string;
  // For content generation step
  type?: 'brand-dna' | 'brand-content';
  contentType?: 'campaign-ideas' | 'social-posts' | 'ad-headlines' | 'product-descriptions';
  brandDNA?: string;
}

export async function generateBrandCampaignStudio(input: BrandCampaignStudioInput): Promise<string> {
  const { type = 'brand-dna' } = input;

  // Handle brand DNA generation
  if (type === 'brand-dna') {
    return generateBrandDNA(input);
  }

  // Handle content generation using existing DNA
  if (type === 'brand-content') {
    return generateBrandContent(input);
  }

  throw new Error(`Unknown brand-campaign-studio type: ${type}`);
}

async function generateBrandDNA(input: BrandCampaignStudioInput): Promise<string> {
  const { brandName, websiteUrl, description, targetAudience } = input;

  if (!brandName || !description || !targetAudience) {
    throw new Error('Brand name, description, and target audience are required for Business DNA generation.');
  }

  const dnaPrompt = `You are an expert brand strategist. Analyze this brand and generate a complete, structured Business DNA Profile.

Brand Name: ${brandName}
${websiteUrl ? `Website: ${websiteUrl}` : ''}
Description: ${description}
Target Audience: ${targetAudience}

Generate EXACTLY this structured format with ALL sections complete (use the section headers as shown). Do NOT truncate or omit any section:

## BUSINESS DNA PROFILE

### Brand Tone
[2-4 adjectives describing the brand voice, e.g. "warm, artisanal, authentic"]

### Color Palette
Provide exactly 5 colors. Each on its own line in this exact format:
1. #HEXCODE - Color Name
2. #HEXCODE - Color Name
3. #HEXCODE - Color Name
4. #HEXCODE - Color Name
5. #HEXCODE - Color Name

Example:
1. #D4A574 - Warm Amber
2. #8B6F47 - Rich Mahogany
3. #F5E6D3 - Cream Linen
4. #2C3E50 - Midnight Navy
5. #C0392B - Bold Crimson

### Style Keywords
[5-7 single-word style descriptors, comma-separated]

### Audience Profile
[2-3 sentence summary of who this brand serves, their values, and what resonates with them]

IMPORTANT: You MUST complete ALL four sections above. Do not stop mid-section. Derive colors from the brand personality — do not use generic palettes.`;

  // Let errors propagate to the route handler so they produce proper HTTP error
  // responses instead of returning an error string disguised as valid output.
  return await generateCompletion(dnaPrompt, { maxTokens: 1200 });
}

async function generateBrandContent(input: BrandCampaignStudioInput): Promise<string> {
  const { brandDNA, contentType, brandName: inputBrandName, description: inputDescription, targetAudience: inputTargetAudience } = input;

  if (!brandDNA || !contentType) {
    throw new Error('Brand DNA and content type are required for content generation.');
  }

  // Extract brand name, description context, and audience from the DNA string
  // so we can inject them explicitly into every sub-prompt.
  const brandNameMatch = brandDNA.match(/Brand Name:\s*(.+)/i);
  const extractedBrandName = inputBrandName || (brandNameMatch ? brandNameMatch[1].trim() : 'this brand');

  // Use input-provided values when available; fall back to DNA-extracted values
  const productDescription = inputDescription || '';
  const targetAudience = inputTargetAudience || '';

  // Try to pull tone and style keywords for reinforcement
  const toneMatch = brandDNA.match(/###\s*Brand Tone\s*\n([\s\S]*?)(?=###|$)/i);
  const brandTone = toneMatch ? toneMatch[1].trim().replace(/^[-*•]\s*/gm, '').trim() : '';

  const styleMatch = brandDNA.match(/###\s*Style Keywords\s*\n([\s\S]*?)(?=###|$)/i);
  const styleKeywords = styleMatch ? styleMatch[1].trim().replace(/^[-*•]\s*/gm, '').trim() : '';

  const audienceMatch = brandDNA.match(/###\s*Audience Profile\s*\n([\s\S]*?)(?=###|$)/i);
  const audienceProfile = audienceMatch ? audienceMatch[1].trim().replace(/^[-*•]\s*/gm, '').trim() : '';

  const brandContextBlock = `
BRAND CONTEXT (use this in EVERY output item):
- Brand Name: ${extractedBrandName}
${productDescription ? `- Product/Service Description: ${productDescription}` : ''}
${targetAudience ? `- Target Audience: ${targetAudience}` : ''}
${brandTone ? `- Brand Tone: ${brandTone}` : ''}
${styleKeywords ? `- Style Keywords: ${styleKeywords}` : ''}
${audienceProfile ? `- Audience Profile: ${audienceProfile}` : ''}

CRITICAL RULES:
1. Every single output item MUST specifically mention "${extractedBrandName}" BY NAME — never say "this brand", "the brand", "our brand", or "this business".
2. All content must reference the ACTUAL products/services described: ${productDescription || '(see DNA profile above)'}.
3. Do NOT produce generic content that could apply to any business.`;

  let promptSuffix = '';

  switch (contentType) {
    case 'campaign-ideas':
      promptSuffix = `Generate exactly 5 campaign ideas for ${extractedBrandName}. Each should have a bold title on one line, followed by a 2-3 line description explaining the concept, target audience appeal, and key messaging. Separate each idea with "---" on its own line.

Format each idea EXACTLY as:
**[Campaign Title]**
Description text here about the campaign concept.

---

**[Next Campaign Title]**
Description text here.

You MUST generate all 5 ideas — do not stop at 2 or 3. Every campaign idea MUST explicitly name "${extractedBrandName}" and relate to their specific products (${productDescription || 'see DNA above'}). Do NOT produce generic handmade/artisan content — every idea must reference the brand by name and relate to what they actually sell.`;
      break;

    case 'social-posts':
      promptSuffix = `Generate EXACTLY 5 social media posts for ${extractedBrandName}. Each post should be platform-specific (rotate between Instagram, LinkedIn, Twitter/X, Facebook, TikTok). Write in the brand's voice from the DNA profile. Include relevant emojis and 3-5 platform-appropriate hashtags per post. Separate each post with "---".

Each post MUST contain at least 2 full sentences of real, substantive copy about ${extractedBrandName}'s products (${productDescription || 'see DNA above'}) BEFORE any hashtags. Posts must NEVER be hashtags alone or hashtag-heavy with minimal text. Each post should be 50-100 words of genuine copy, engaging, and include a clear call-to-action. Format each post starting with the platform name in brackets, e.g., "[Instagram]" or "[LinkedIn]".

You MUST generate all 5 posts — do not stop at 2 or 3. Every post MUST explicitly name "${extractedBrandName}" by name in the copy itself. Do NOT produce generic social media content.`;
      break;

    case 'ad-headlines':
      promptSuffix = `Generate exactly 5 short, punchy ad headlines for ${extractedBrandName}. They must be on-brand, attention-grabbing, and under 10 words each. Focus on benefits and emotional triggers.

IMPORTANT: Return your response as a JSON array of exactly 5 strings — nothing else. No markdown, no explanation, no preamble, no code fences. Just the raw JSON array.

Example format:
["Headline one here", "Headline two here", "Headline three here", "Headline four here", "Headline five here"]

Every headline MUST explicitly include "${extractedBrandName}" by name and relate to their specific products (${productDescription || 'see DNA above'}). Do NOT produce generic ad copy.`;
      break;

    case 'product-descriptions':
      promptSuffix = `Generate exactly 3 compelling product descriptions for ${extractedBrandName}'s products. Each should be 2-3 sentences (40-60 words), written in the brand voice. Focus on benefits, sensory details, and emotional appeal. Separate each with "---".

CRITICAL: You MUST use ONLY the product details provided below. Do NOT substitute, invent, or assume different materials, ingredients, or product types. If the brand sells "${productDescription || '(see DNA above)'}", then every description MUST reference that exact product type and material — do NOT change the material (e.g., do NOT write "beeswax" if the product is "soy wax candles"). Every description MUST explicitly name "${extractedBrandName}" and describe their actual products. Do NOT produce generic product descriptions.`;
      break;

    default:
      throw new Error(`Unknown content type: ${contentType}`);
  }

  const contentPrompt = `You are an expert marketing copywriter. Using the Business DNA Profile below, generate ${contentType.replace('-', ' ')} for ${extractedBrandName}.

BUSINESS DNA PROFILE:
${brandDNA}

${brandContextBlock}

${promptSuffix}

All content MUST match the brand tone, style keywords, and overall sensibility from the DNA profile. Be creative, specific, and on-brand throughout. Do not include any preamble or explanation — just the content.`;

  // Let errors propagate to the route handler so they produce proper HTTP error
  // responses instead of returning an error string disguised as valid output.
  return await generateCompletion(contentPrompt, { maxTokens: 1200 });
}

// ─── Backlink Opportunity Finder ──────────────────────────────────────────────

interface BacklinkFinderInput {
  niche: string;
  country?: string;
}

export async function generateBacklinkOpportunities(input: BacklinkFinderInput): Promise<string> {
  const { niche, country = 'USA' } = input;

  if (!niche || !niche.trim()) {
    throw new Error('Please enter a competitor URL or niche to find backlink opportunities.');
  }

  const prompt = `You are an experienced SEO strategist specializing in link building. Generate AI-suggested backlink opportunities for the following niche/topic: "${niche}" in the ${country} market.

IMPORTANT: These are AI-generated suggestions based on general knowledge of link building strategies. They are NOT verified data from any backlink database (Ahrefs, Moz, SEMrush, etc.). Always verify each opportunity before pursuing it.

Generate a structured JSON response with exactly this format — no markdown, no code fences, just raw JSON:

{
  "directories": [
    { "platform": "Platform name", "anchorText": "Suggested anchor text", "difficulty": "Easy|Medium|Hard", "steps": ["Step 1", "Step 2", "Step 3"] }
  ],
  "profiles": [
    { "platform": "Platform name", "anchorText": "Suggested anchor text", "difficulty": "Easy|Medium|Hard", "steps": ["Step 1", "Step 2", "Step 3"] }
  ],
  "guest_posts": [
    { "platform": "Platform name", "anchorText": "Suggested anchor text", "difficulty": "Easy|Medium|Hard", "steps": ["Step 1", "Step 2", "Step 3", "Step 4"] }
  ],
  "forums": [
    { "platform": "Platform name", "anchorText": "Suggested anchor text", "difficulty": "Easy|Medium|Hard", "steps": ["Step 1", "Step 2", "Step 3"] }
  ],
  "web20": [
    { "platform": "Platform name", "anchorText": "Suggested anchor text", "difficulty": "Easy|Medium|Hard", "steps": ["Step 1", "Step 2", "Step 3"] }
  ]
}

Rules for generating opportunities:
1. Each category MUST contain between 4 and 6 opportunities (aim for 5 each).
2. All suggestions must be relevant to the "${niche}" niche in the ${country} market.
3. Difficulty labels:
   - "Easy" = free signup, quick process, anyone can do it
   - "Medium" = requires some effort, content creation, or approval process
   - "Hard" = competitive, requires established reputation or high-quality content
4. Anchor text should be natural, varied, and relevant to the niche. Mix branded, exact-match, partial-match, and generic anchors.
5. Steps should be 2-4 concrete, actionable bullet points explaining how to get the backlink.
6. NEVER include DA, DR, domain authority, traffic numbers, backlink counts, or any fabricated metrics.
7. Focus on realistic, well-known platforms and strategies that are appropriate for the niche.
8. Directories: niche directories, local business listings, industry-specific directories.
9. Profiles: author profiles, community profiles, professional network profiles.
10. Guest posts: blogs/sites that commonly accept guest content in this niche.
11. Forums: forums, Q&A sites, discussion communities relevant to the niche.
12. Web 2.0: blogging platforms, content sites where users can publish content.

Return ONLY valid JSON — no explanation, no preamble, no markdown formatting.`;

  return generateCompletion(prompt, { maxTokens: 2000 });
}

// ─── Anchor Text Strategist ──────────────────────────────────────────────────

interface AnchorTextStrategistInput {
  websiteUrl: string;
  keywords: string; // comma-separated
}

export async function generateAnchorTextStrategy(input: AnchorTextStrategistInput): Promise<string> {
  const { websiteUrl, keywords } = input;

  if (!websiteUrl || !websiteUrl.trim()) {
    throw new Error('Please enter a website URL.');
  }
  if (!keywords || !keywords.trim()) {
    throw new Error('Please enter at least one target keyword.');
  }

  const prompt = `You are an experienced SEO strategist specializing in anchor text optimization. Generate an AI-suggested anchor text distribution strategy for the website "${websiteUrl}" targeting these keywords: "${keywords}".

IMPORTANT: These are AI-generated suggestions based on general SEO best practices. They are NOT based on any live backlink data, domain authority analysis, or external SEO tool data. Always verify and adjust your anchor text strategy based on your own research.

Generate a structured JSON response with exactly this format — no markdown, no code fences, just raw JSON:

{
  "categories": [
    {
      "name": "Exact Match",
      "percentage": <number between 5-15>,
      "examples": ["<example 1>", "<example 2>", "<example 3>"]
    },
    {
      "name": "Partial Match",
      "percentage": <number between 20-30>,
      "examples": ["<example 1>", "<example 2>", "<example 3>"]
    },
    {
      "name": "Branded",
      "percentage": <number between 25-35>,
      "examples": ["<example 1>", "<example 2>", "<example 3>"]
    },
    {
      "name": "Generic",
      "percentage": <number between 10-20>,
      "examples": ["<example 1>", "<example 2>", "<example 3>"]
    },
    {
      "name": "Naked URL",
      "percentage": <number between 5-15>,
      "examples": ["<example 1>", "<example 2>", "<example 3>"]
    },
    {
      "name": "LSI / Synonyms",
      "percentage": <number between 10-20>,
      "examples": ["<example 1>", "<example 2>", "<example 3>"]
    }
  ]
}

Rules for generating the anchor text strategy:
1. There MUST be exactly 6 categories in the "categories" array, in this order: Exact Match, Partial Match, Branded, Generic, Naked URL, LSI / Synonyms.
2. The percentage values across ALL 6 categories MUST add up to exactly 100.
3. Exact Match (5-15%): Use the exact target keyword phrases as submitted. Keep this low to avoid over-optimization.
4. Partial Match (20-30%): Combine the target keywords with related terms, modifiers, or partial phrases. These should feel natural in context.
5. Branded (25-35%): Use the brand name extracted from the URL or domain. Include variations like brand name alone, brand + generic word.
6. Generic (10-20%): Common non-keyword phrases like "click here", "learn more", "this website", "read more", "visit site".
7. Naked URL (5-15%): Raw URLs and domain references like the bare domain, https://domain.com, www.domain.com.
8. LSI / Synonyms (10-20%): Latent semantic indexing terms — synonyms, related concepts, and semantically connected phrases relevant to the keywords.
9. Each category MUST contain exactly 3 specific anchor text examples tailored to the submitted website and keywords.
10. All anchor text examples must be contextual and relevant to "${keywords}" and "${websiteUrl}".
11. NEVER include DA scores, DR scores, traffic numbers, backlink counts, or any fabricated metrics.
12. NEVER mention Ahrefs, Moz, SEMrush, Google Search Console, or any external SEO tool by name.
13. Focus on creating a natural-looking anchor text profile that avoids over-optimization penalties.

Return ONLY valid JSON — no explanation, no preamble, no markdown formatting.`;

  return generateCompletion(prompt, { maxTokens: 1500 });
}

// ─── 30-Day SEO Growth Plan Generator ────────────────────────────────────────

interface SEOGrowthPlanInput {
  niche: string;
  keywords: string; // comma-separated
  country?: string;
}

export async function generateSEOGrowthPlan(input: SEOGrowthPlanInput): Promise<string> {
  const { niche, keywords, country = 'USA' } = input;

  if (!niche || !niche.trim()) {
    throw new Error('Please enter a niche or industry.');
  }
  if (!keywords || !keywords.trim()) {
    throw new Error('Please enter at least one keyword.');
  }

  const prompt = `You are an experienced SEO strategist. Generate a detailed 30-day SEO growth plan for a business in the "${niche}" niche targeting these keywords: "${keywords}", focused on the ${country} market.

IMPORTANT: These are AI-generated suggestions based on general SEO best practices. They are NOT based on any live data, domain authority analysis, or external SEO tool data. No metrics, scores, or traffic numbers should be included.

Generate a structured JSON response with exactly this format — no markdown, no code fences, just raw JSON:

{
  "weeks": [
    {
      "weekNumber": 1,
      "title": "Week title/theme here",
      "tasks": [
        { "day": "Day 1", "description": "Specific actionable task description", "category": "Keyword Research|Content Creation|On-Page SEO|Link Building|Technical SEO|Analytics" },
        { "day": "Day 2", "description": "Specific actionable task description", "category": "Keyword Research|Content Creation|On-Page SEO|Link Building|Technical SEO|Analytics" }
      ],
      "milestones": ["Milestone 1 for this week", "Milestone 2 for this week"]
    },
    {
      "weekNumber": 2,
      "title": "Week title/theme here",
      "tasks": [
        { "day": "Day 8", "description": "Specific actionable task description", "category": "Keyword Research|Content Creation|On-Page SEO|Link Building|Technical SEO|Analytics" }
      ],
      "milestones": ["Milestone 1 for this week", "Milestone 2 for this week"]
    },
    {
      "weekNumber": 3,
      "title": "Week title/theme here",
      "tasks": [
        { "day": "Day 15", "description": "Specific actionable task description", "category": "Keyword Research|Content Creation|On-Page SEO|Link Building|Technical SEO|Analytics" }
      ],
      "milestones": ["Milestone 1 for this week", "Milestone 2 for this week"]
    },
    {
      "weekNumber": 4,
      "title": "Week title/theme here",
      "tasks": [
        { "day": "Day 22", "description": "Specific actionable task description", "category": "Keyword Research|Content Creation|On-Page SEO|Link Building|Technical SEO|Analytics" }
      ],
      "milestones": ["Milestone 1 for this week", "Milestone 2 for this week"]
    }
  ]
}

Rules for generating the 30-day SEO growth plan:
1. There MUST be exactly 4 weeks in the "weeks" array (Week 1 through Week 4).
2. Each week MUST have a unique, descriptive title/theme that reflects the focus of that week (e.g., "Foundation & Keyword Research", "Content Creation Sprint", "On-Page Optimization Push", "Link Building & Authority").
3. Each week MUST contain between 5 and 7 daily tasks (aim for 7 each — cover every day of the week).
4. Day numbering is cumulative across weeks: Week 1 starts at Day 1, Week 2 at Day 8, Week 3 at Day 15, Week 4 at Day 22.
5. Each week MUST have exactly 2 milestones/goals that are achievable within that week.
6. Tasks must be practical, specific SEO actions tailored to the "${niche}" niche and "${keywords}" keywords. Categories include:
   - Keyword Research: finding keywords, analyzing search intent, mapping keywords to pages
   - Content Creation: writing blog posts, creating landing pages, updating existing content
   - On-Page SEO: optimizing titles, meta descriptions, headings, internal links, images
   - Link Building: outreach, guest posting, directory submissions, broken link building
   - Technical SEO: site speed, mobile optimization, schema markup, crawl errors, sitemaps
   - Analytics: setting up tracking, reviewing performance, adjusting strategy
7. The plan should progress logically from foundation/research (Week 1) through implementation (Weeks 2-3) to refinement and authority building (Week 4).
8. NEVER include DA scores, DR scores, traffic numbers, backlink counts, search volume numbers, or any fabricated metrics.
9. NEVER mention Ahrefs, Moz, SEMrush, Google Search Console, or any external SEO tool by name.
10. All tasks must be actionable without requiring paid tools — focus on strategies anyone can implement.
11. Tasks should reference the specific niche ("${niche}") and keywords ("${keywords}") where relevant to make them feel personalized.

Return ONLY valid JSON — no explanation, no preamble, no markdown formatting.`;

  return generateCompletion(prompt, { maxTokens: 2500 });
}

// ─── SEO Blog Article Writer ──────────────────────────────────────────────────

interface BlogArticleInput {
  topic: string;
  keywords: string; // comma-separated
}

export async function generateBlogArticle(input: BlogArticleInput): Promise<string> {
  const { topic, keywords } = input;

  if (!topic || !topic.trim()) {
    throw new Error('Please enter a topic for the blog article.');
  }
  if (!keywords || !keywords.trim()) {
    throw new Error('Please enter at least one keyword.');
  }

  const prompt = `You are an expert SEO content writer. Write a complete, SEO-optimized blog article on the topic: "${topic}".

Target Keywords: ${keywords}

Generate a structured JSON response with exactly this format — no markdown, no code fences, just raw JSON:

{
  "metaTitle": "An SEO-optimized title tag (50-60 characters, includes primary keyword)",
  "metaDescription": "A concise meta description (140-160 characters, includes primary keyword, has a call-to-action)",
  "articleBody": "The full article body in markdown format with headings (##), paragraphs, naturally integrated keywords, and a closing CTA paragraph. Must be 400+ words."
}

Rules for generating the blog article:
1. The metaTitle MUST be between 50 and 60 characters, include the primary keyword from "${keywords}", and be compelling for search engine results.
2. The metaDescription MUST be between 140 and 160 characters, include the primary keyword, summarize the article value, and end with a subtle call-to-action.
3. The articleBody MUST be at least 400 words of substantive, well-written content.
4. The articleBody MUST use markdown formatting: ## for section headings, plain text for paragraphs. Include at least 4 section headings (## level).
5. Naturally integrate ALL provided keywords ("${keywords}") throughout the article — do not stuff them; weave them into sentences naturally.
6. The article MUST open with an engaging introduction paragraph that hooks the reader.
7. Each section should provide genuine value — tips, insights, examples, or actionable advice related to "${topic}".
8. The article MUST end with a clear closing CTA (call-to-action) paragraph encouraging the reader to take a specific next step.
9. NEVER include DA scores, DR scores, traffic numbers, backlink counts, search volume numbers, or any fabricated metrics.
10. NEVER mention Ahrefs, Moz, SEMrush, Google Search Console, Claude, or any external tool/service by name.
11. Write in a professional yet accessible tone suitable for a general audience interested in "${topic}".
12. Do NOT include any preamble, explanation, or commentary outside the JSON structure.

Return ONLY valid JSON — no explanation, no preamble, no markdown formatting.`;

  return generateCompletion(prompt, { maxTokens: 2500 });
}

// ─── Competitor Snapshot Generator ────────────────────────────────────────────

interface CompetitorSnapshotInput {
  competitorUrls: string[]; // 2-3 competitor URLs
  userWebsiteUrl?: string;  // optional user website for comparison context
}

export async function generateCompetitorSnapshot(input: CompetitorSnapshotInput): Promise<string> {
  const { competitorUrls, userWebsiteUrl } = input;

  if (!competitorUrls || competitorUrls.length < 2) {
    throw new Error('Please enter at least 2 competitor URLs.');
  }
  if (competitorUrls.length > 3) {
    throw new Error('Maximum of 3 competitor URLs allowed.');
  }

  // Build a unified list of ALL URLs to assess — user's site first, then competitors.
  // Every URL gets a full assessment on all 7 dimensions.
  const allUrls: string[] = [];
  if (userWebsiteUrl) {
    allUrls.push(userWebsiteUrl);
  }
  allUrls.push(...competitorUrls);

  const urlsList = allUrls.map((url, i) => {
    const label = (userWebsiteUrl && i === 0) ? 'Your Site' : `Competitor ${userWebsiteUrl ? i : i + 1}`;
    return `- ${label}: ${url}`;
  }).join('\n');

  const totalUrls = allUrls.length;

  const prompt = `You are an experienced SEO strategist specializing in competitive analysis. Generate an AI-suggested competitor snapshot comparing ALL of the following websites. Assess EVERY URL listed below equally on all 7 dimensions — including the user's own site.

${urlsList}

IMPORTANT: These are AI-generated suggestions based on general SEO knowledge and best practices. They are NOT live data from Ahrefs, Moz, SEMrush, or any backlink tool. No actual domain authority, traffic, or backlink counts are shown. All observations are qualitative text-based assessments only.

Generate a structured JSON response with exactly this format — no markdown, no code fences, just raw JSON:

{
  "comparison": [
    {
      "dimension": "Content Strategy",
      "observations": {
        "${allUrls[0]}": { "text": "AI-suggested observation about this site's content strategy", "indicator": "Strong|Moderate|Gap Identified" },
        "${allUrls[1]}": { "text": "AI-suggested observation about this site's content strategy", "indicator": "Strong|Moderate|Gap Identified" }${totalUrls > 2 ? `,\n        "${allUrls[2]}": { "text": "...", "indicator": "..." }` : ''}${totalUrls > 3 ? `,\n        "${allUrls[3]}": { "text": "...", "indicator": "..." }` : ''}
      }
    },
    {
      "dimension": "Keyword Focus Areas",
      "observations": { /* same structure — one entry per URL */ }
    },
    {
      "dimension": "On-Page SEO Strengths",
      "observations": { /* same structure — one entry per URL */ }
    },
    {
      "dimension": "Link Building Approach",
      "observations": { /* same structure — one entry per URL */ }
    },
    {
      "dimension": "Content Gaps",
      "observations": { /* same structure — one entry per URL */ }
    },
    {
      "dimension": "Social Presence Signals",
      "observations": { /* same structure — one entry per URL */ }
    },
    {
      "dimension": "Technical SEO Notes",
      "observations": { /* same structure — one entry per URL */ }
    }
  ],
  "gaps": {
    "contentGaps": ["Specific content gap identified in the user's site relative to competitors", "..."],
    "keywordOpportunities": ["Specific keyword opportunity for the user's site based on competitor weaknesses", "..."],
    "differentiationIdeas": ["Specific idea for how the user's site can differentiate from the competitors analyzed", "..."]
  }
}

Rules for generating the competitor snapshot:
1. The "comparison" array MUST contain exactly 7 dimensions in this order: Content Strategy, Keyword Focus Areas, On-Page SEO Strengths, Link Building Approach, Content Gaps, Social Presence Signals, Technical SEO Notes.
2. CRITICAL: Each dimension's "observations" object MUST have exactly ${totalUrls} entries — one for EVERY URL listed above, INCLUDING the user's own site (${userWebsiteUrl || 'first URL'}). Do NOT skip any URL. Do NOT leave any URL without an observation.
3. The keys in each "observations" object MUST be the EXACT URLs as provided above — character-for-character identical. Use the full URL string as the key.
4. Each observation MUST have a "text" field (qualitative text description, 1-2 sentences specific to THAT site) and an "indicator" field (one of: "Strong", "Moderate", "Gap Identified").
5. The "text" field must contain ONLY qualitative observations — NEVER include numeric scores, DA, DR, traffic numbers, backlink counts, search volume, or any fabricated metrics.
6. The "gaps" section MUST contain all three arrays: "contentGaps" (3-5 items), "keywordOpportunities" (3-5 items), "differentiationIdeas" (3-5 items).
7. CRITICAL: Gap/opportunity suggestions MUST be comparative and site-specific. Identify concrete gaps in the USER'S OWN SITE (${userWebsiteUrl || 'the first URL'}) relative to what competitors are doing. Do NOT give generic advice — reference specific differences observed between the user's site and competitors in the comparison table.
8. NEVER mention Ahrefs, Moz, SEMrush, Google Search Console, Claude, or any external tool/service by name.
9. NEVER claim connection to any external data source or API.
10. Label all output implicitly as AI-suggested through the qualitative nature of observations.
11. Return ONLY valid JSON — no explanation, no preamble, no markdown formatting.`;

  return generateCompletion(prompt, { maxTokens: 3000 });
}

// ─── Meta Ads Campaign Planner ──────────────────────────────────────────────

interface MetaAdsCampaignPlanInput {
  brandName: string;
  campaignGoal: 'Sales' | 'Leads' | 'Traffic' | 'Awareness';
  monthlyBudget: number;
  ageRange?: string;
  location?: string;
  interests?: string;
  productDetails?: string;
}

export async function generateMetaAdsCampaignPlan(input: MetaAdsCampaignPlanInput): Promise<string> {
  const { brandName, campaignGoal, monthlyBudget, ageRange, location, interests, productDetails } = input;

  if (!brandName || !brandName.trim()) {
    throw new Error('Brand or product name is required.');
  }
  if (!monthlyBudget || monthlyBudget <= 0) {
    throw new Error('A valid monthly budget is required.');
  }

  const objectiveMap: Record<string, string> = {
    Sales: 'Conversions',
    Leads: 'Lead Generation',
    Traffic: 'Traffic',
    Awareness: 'Awareness / Reach',
  };

  const metaObjective = objectiveMap[campaignGoal] || campaignGoal;

  const prompt = `You are an expert Meta (Facebook & Instagram) advertising strategist. Generate a complete Meta Ads campaign plan for the following brand/product.

IMPORTANT: This is an AI-generated PLANNER only. It is NOT connected to any Meta ad account, Meta API, or live ad data. The output provides strategic guidance based on Meta advertising best practices — not real-time performance data. NEVER include impressions, CPM, CPC, ROAS, CTR, reach estimates, or any fabricated metrics.

Brand/Product: ${brandName}
Campaign Goal: ${campaignGoal} (Meta Objective: ${metaObjective})
Monthly Budget: $${monthlyBudget}
${ageRange ? `Target Age Range: ${ageRange}` : ''}
${location ? `Target Location: ${location}` : ''}
${interests ? `Target Interests: ${interests}` : ''}
${productDetails ? `Product Details / USP: ${productDetails}` : ''}

Generate a structured JSON response with exactly this format — no markdown, no code fences, just raw JSON:

{
  "campaign": {
    "metaObjective": "${metaObjective}",
    "campaignName": "Suggested campaign naming convention for ${brandName}",
    "campaignGoal": "${campaignGoal}",
    "namingConvention": "Brief explanation of recommended naming pattern"
  },
  "adSets": [
    {
      "name": "Ad Set 1 name",
      "targetingType": "Broad Targeting",
      "audienceDescription": "Description of who this ad set targets and why",
      "placements": ["Placement 1", "Placement 2", "Placement 3"],
      "budgetPercentage": <number between 30-50>,
      "budgetAmount": <dollar amount based on percentage of $${monthlyBudget}>,
      "schedule": {
        "recommendation": "Schedule recommendation text",
        "dayparting": "Dayparting advice if relevant, or 'Run continuously'"
      },
      "adVariants": [
        {
          "headline": "Short punchy headline (max 40 characters)",
          "primaryText": "1-3 sentences of ad body copy tailored to this ad set's audience",
          "cta": "Call-to-action label like Shop Now, Learn More, Get Offer"
        },
        {
          "headline": "Another headline variant with a different angle",
          "primaryText": "Different benefit emphasis in the body copy for this audience segment",
          "cta": "A different CTA option"
        },
        {
          "headline": "Third headline variant",
          "primaryText": "Yet another creative approach targeting this ad set's specific audience",
          "cta": "Another CTA option"
        }
      ]
    },
    {
      "name": "Ad Set 2 name",
      "targetingType": "Advantage+ Audience",
      "audienceDescription": "Description of who this ad set targets and why",
      "placements": ["Placement 1", "Placement 2", "Placement 3"],
      "budgetPercentage": <number between 25-40>,
      "budgetAmount": <dollar amount based on percentage of $${monthlyBudget}>,
      "schedule": {
        "recommendation": "Schedule recommendation text",
        "dayparting": "Dayparting advice if relevant, or 'Run continuously'"
      },
      "adVariants": [
        {
          "headline": "Headline variant for Advantage+ audience",
          "primaryText": "Ad body copy tailored to this broader AI-optimized audience",
          "cta": "CTA label"
        },
        {
          "headline": "Second headline variant",
          "primaryText": "Alternative body copy angle for this ad set",
          "cta": "CTA label"
        },
        {
          "headline": "Third headline variant",
          "primaryText": "Another creative approach for this ad set's audience",
          "cta": "CTA label"
        }
      ]
    },
    {
      "name": "Ad Set 3 name (optional)",
      "targetingType": "Interest-Based or Retargeting",
      "audienceDescription": "Description of who this ad set targets and why",
      "placements": ["Placement 1", "Placement 2"],
      "budgetPercentage": <number such that all percentages sum to ~100>,
      "budgetAmount": <dollar amount>,
      "schedule": {
        "recommendation": "Schedule recommendation text",
        "dayparting": "Dayparting advice if relevant, or 'Run continuously'"
      },
      "adVariants": [
        {
          "headline": "Headline variant for this retargeting/interest audience",
          "primaryText": "Ad body copy tailored to re-engage or interest-target this audience",
          "cta": "CTA label"
        },
        {
          "headline": "Second headline variant",
          "primaryText": "Alternative body copy angle for this ad set",
          "cta": "CTA label"
        },
        {
          "headline": "Third headline variant",
          "primaryText": "Another creative approach for this ad set's audience",
          "cta": "CTA label"
        }
      ]
    }
  ]
}

Rules:
1. Generate EXACTLY 2 or 3 ad sets. The budget percentages MUST sum to approximately 100%.
2. Each ad set MUST have a distinct targeting approach (e.g., Broad, Advantage+, Interest-based, Lookalike, Retargeting).
3. Placements should reference real Meta placement options: Facebook Feed, Instagram Feed, Instagram Stories, Instagram Reels, Facebook Stories, Facebook Reels, Audience Network, Messenger, etc.
4. Schedule recommendations should be practical (e.g., "Start Monday, run for 4 weeks minimum", "Test for 7 days before scaling").
5. Budget amounts must be calculated from the monthly budget of $${monthlyBudget}. Round to whole dollars.
6. NEVER include fake metrics: no impressions, CPM, CPC, ROAS, CTR, reach, frequency, or conversion estimates.
7. NEVER claim connection to Meta API, Meta OAuth, or any Meta ad account.
8. All recommendations must be specific to "${brandName}" and the ${campaignGoal} goal — not generic advice.
9. The campaign name should follow a clear naming convention like "[Brand] - [Goal] - [Month/Year]".
10. Each ad set MUST include an "adVariants" array with EXACTLY 3-5 ad variants. Each variant must have:
     - "headline": A short, punchy headline of 40 characters or fewer that grabs attention and relates to "${brandName}" and this specific ad set's audience.
     - "primaryText": 1-3 sentences of compelling ad body copy tailored to the ${campaignGoal} goal, specific to "${brandName}" products/services, and relevant to this ad set's targeting approach.
     - "cta": A call-to-action label appropriate for the ${campaignGoal} goal (e.g., "Shop Now", "Learn More", "Get Offer", "Sign Up", "Book Now", "Download").
     Each variant within an ad set should take a different creative angle (e.g., urgency, social proof, benefit-focused, emotional appeal, problem-solution). Variants across different ad sets should be tailored to each ad set's specific audience segment.
11. Return ONLY valid JSON — no explanation, no preamble, no markdown formatting.`;

  return generateCompletion(prompt, { maxTokens: 2000 });
}

// ─── WhatsApp Business Generator ─────────────────────────────────────────────

interface WhatsAppBusinessInput {
  businessName: string;
  productService: string;
  messageType: 'catalog' | 'broadcast' | 'order-confirmation' | 'cod-followup' | 'welcome' | 'abandoned-cart';
  tone: 'friendly' | 'professional';
  language: 'english' | 'roman-urdu';
}

export async function generateWhatsAppMessages(input: WhatsAppBusinessInput): Promise<string> {
  const { businessName, productService, messageType, tone, language } = input;

  const messageTypeLabels: Record<string, string> = {
    'catalog': 'Catalog message showcasing products',
    'broadcast': 'Broadcast announcement to customers',
    'order-confirmation': 'Order confirmation after purchase',
    'cod-followup': 'Cash on Delivery follow-up reminder',
    'welcome': 'Welcome message for new customers',
    'abandoned-cart': 'Abandoned cart reminder',
  };

  const prompt = `You are a WhatsApp Business messaging expert. Generate exactly 3 short, warm, ready-to-paste WhatsApp messages for a business.

Business Name: ${businessName}
Product/Service: ${productService}
Message Type: ${messageTypeLabels[messageType] || messageType}
Tone: ${tone}
Language: ${language === 'roman-urdu' ? 'Roman Urdu (Urdu written in English script, natural conversational style)' : 'English'}

Requirements:
- Each message should be concise (under 300 characters) and ready to paste directly into WhatsApp
- Use appropriate emojis sparingly (1-2 per message max)
- No placeholders beyond what the user provided — use "${businessName}" and "${productService}" where relevant
- Messages should feel personal and authentic, not robotic
- Format as:

**Option 1:**
<message text>

**Option 2:**
<message text>

**Option 3:**
<message text>

Do NOT include any additional commentary, tips, or explanations. Output ONLY the three messages.`;

  return generateCompletion(prompt, { maxTokens: 800 });
}

// ─── Unified Generation Handler ─────────────────────────────────────────────

export type ToolSlug =
  | 'product-description-generator'
  | 'seo-title-optimizer'
  | 'hashtag-generator'
  | 'profit-calculator'
  | 'competitor-analyzer'
  | 'review-response-writer'
  | 'listing-optimizer'
  | 'social-media-studio'
  | 'store-audit'
  | 'branding-assistant'
  | 'bulk-listing-generator'
  | 'product-research-assistant'
  | 'prompt-library'
  | 'listing-health-score'
  | 'keyword-research'
  | 'brand-campaign-studio'
  | 'seo-backlink-studio'
  | 'anchor-text-strategist'
  | 'seo-growth-plan'
  | 'seo-blog-article'
  | 'seo-competitor-snapshot'
  | 'meta-ads-campaign-plan'
  | 'whatsapp-business-generator';

export interface GenerationRequest {
  toolSlug: ToolSlug;
  input: Record<string, unknown>;
}

/**
 * When the user selects "roman-urdu" as the output language, this suffix is
 * appended to every AI prompt so the model writes its response in natural
 * Roman Urdu (Urdu written in English script). English requests are unaffected.
 */
const ROMAN_URDU_INSTRUCTION = `\n\nIMPORTANT LANGUAGE INSTRUCTION: Write ALL of your output in Roman Urdu — use natural Roman Urdu wording (Urdu written in English script). Keep the same meaning, structure, and formatting. Do NOT write in English. Do NOT mix English sentences into the output. Only proper nouns, brand names, and technical terms may remain in English.`;

export async function generateToolContent(request: GenerationRequest): Promise<string> {
  try {
    // Extract outputLanguage from input — passed through to generators that support it.
    const outputLanguage = typeof request.input?.outputLanguage === 'string' ? request.input.outputLanguage : undefined;

    switch (request.toolSlug) {
      case 'product-description-generator':
        return await generateProductDescription({ ...(request.input as unknown as ProductDescriptionInput), outputLanguage });
      
      case 'seo-title-optimizer':
        return await generateSEOTitle({ ...(request.input as unknown as SEOTitleInput), outputLanguage });
      
      case 'hashtag-generator':
        return await generateHashtags({ ...(request.input as unknown as HashtagInput), outputLanguage });
      
      case 'profit-calculator': {
        // Pure math — no AI provider call.
        // Parse and validate numeric inputs explicitly to prevent NaN propagation.
        const raw = request.input as Record<string, unknown>;
        const toNum = (val: unknown, fallback = 0): number => {
          if (val === undefined || val === null || val === '') return fallback;
          const n = parseFloat(String(val));
          return isNaN(n) ? fallback : n;
        };

        const productCost = toNum(raw.productCost);
        const sellingPrice = toNum(raw.sellingPrice);

        if (sellingPrice <= 0) {
          throw new Error('Invalid input: selling price must be greater than zero.');
        }

        const parsedInput: ProfitCalculatorInput = {
          productCost,
          sellingPrice,
          shippingCost: toNum(raw.shippingCost),
          marketplaceFeePercent: toNum(raw.marketplaceFeePercent),
          marketplaceFeeFlat: toNum(raw.marketplaceFeeFlat),
          paymentProcessingPercent: toNum(raw.paymentProcessingPercent),
          advertisingCost: toNum(raw.advertisingCost),
          otherExpenses: toNum(raw.otherExpenses),
          profitMarketplace: String(raw.profitMarketplace || 'Other'),
          profitCountry: String(raw.profitCountry || ''),
          profitCurrency: String(raw.profitCurrency || 'USD'),
          commissionPercent: toNum(raw.commissionPercent),
          deliveryFee: toNum(raw.deliveryFee),
          darazCommissionPercent: toNum(raw.darazCommissionPercent),
          darazDeliveryFee: toNum(raw.darazDeliveryFee),
        };

        const result = calculateProfit(parsedInput);
        return result.summary;
      }
      
      case 'competitor-analyzer':
        return await analyzeCompetitor(request.input as unknown as CompetitorAnalyzerInput);
      
      case 'review-response-writer':
        return await generateReviewResponse(request.input as unknown as ReviewResponseInput);

      case 'listing-optimizer':
        return await generateListingOptimization(request.input as unknown as ListingOptimizerInput);

      case 'social-media-studio':
        return await generateSocialMediaContent(request.input as unknown as SocialMediaInput);

      case 'store-audit':
        return await generateStoreAudit(request.input as unknown as StoreAuditInput);

      case 'branding-assistant':
        return await generateBrandingAssistant(request.input as unknown as BrandingAssistantInput);

      case 'bulk-listing-generator':
        return await generateBulkListings(request.input as unknown as BulkListingInput);

      case 'product-research-assistant':
        return await generateProductResearch(request.input as unknown as ProductResearchInput);

      case 'prompt-library':
        return await generatePromptLibrary(request.input as unknown as PromptLibraryInput);

      case 'listing-health-score':
        return await generateListingHealthScore(request.input as unknown as ListingHealthScoreInput);

      case 'keyword-research':
        return await generateKeywordResearch(request.input as unknown as KeywordResearchInput);

      case 'brand-campaign-studio':
        return await generateBrandCampaignStudio(request.input as unknown as BrandCampaignStudioInput);

      case 'seo-backlink-studio':
        return await generateBacklinkOpportunities(request.input as unknown as BacklinkFinderInput);

      case 'anchor-text-strategist':
        return await generateAnchorTextStrategy(request.input as unknown as AnchorTextStrategistInput);

      case 'seo-growth-plan':
        return await generateSEOGrowthPlan(request.input as unknown as SEOGrowthPlanInput);

      case 'seo-blog-article':
        return await generateBlogArticle(request.input as unknown as BlogArticleInput);

      case 'seo-competitor-snapshot':
        return await generateCompetitorSnapshot(request.input as unknown as CompetitorSnapshotInput);

      case 'meta-ads-campaign-plan':
        return await generateMetaAdsCampaignPlan(request.input as unknown as MetaAdsCampaignPlanInput);

      case 'whatsapp-business-generator':
        return await generateWhatsAppMessages(request.input as unknown as WhatsAppBusinessInput);
      
      default:
        throw new Error(`Unknown tool: ${request.toolSlug}`);
    }
  } catch (err) {
    // Re-throw AIProviderError and validation errors as-is — they already have
    // meaningful messages. Wrap unexpected errors so the route handler always
    // receives an Error object with a descriptive message.
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(`Generation failed for tool "${request.toolSlug}": ${String(err)}`);
  }
}
