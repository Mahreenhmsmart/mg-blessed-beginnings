import { useEffect, useRef, useState, useCallback, Component, type ErrorInfo, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAIToolBySlug, clearCurrentTool, fetchAITools } from '@/store/slices/aiToolsSlice';
import { Spinner, Button, Badge, Card, buttonClass, MarkdownRenderer } from '@/components/ui';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';
import SEOHead from '@/components/SEOHead';
import FAQAccordion from '@/components/FAQAccordion';
import VideoEmbed from '@/components/VideoEmbed';
import AIToolCard from '@/components/AIToolCard';
import AIToolGenerator from '@/components/AIToolGenerator';
import VideoGeneratorCard from '@/components/VideoGeneratorCard';
import ChatGPTPromptCollection from '@/components/ChatGPTPromptCollection';
import { Sparkles, Users, Lightbulb, ExternalLink, ChevronLeft, Play, Video, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import type { FAQItem } from '@/components/FAQAccordion';
import { getNichesForTool } from '@/data/toolNiches';
import { SchemaInjector, SITE_NAME } from '@/seo';
import { FORCE_COMING_SOON_SLUGS, LIVE_OVERRIDE_SLUGS, getEffectiveStatus } from '@/utils/toolStatusOverrides';
import type { AITool } from '@/types';

const statusConfig: Record<string, { label: string; className: string }> = {
  live: { label: 'Live', className: 'bg-cyan/10 text-cyan border-cyan/20' },
  beta: { label: 'Beta', className: 'bg-warning/10 text-warning border-warning/20' },
  demo: { label: 'AI-Powered Insights', className: 'bg-accent/10 text-accent border-accent/20' },
  coming_soon: { label: 'Coming Soon', className: 'bg-muted/50 text-muted-foreground border-border' },
};

// Sample outputs per tool slug (static examples)
const sampleOutputs: Record<string, string[]> = {
  'product-description-generator': [
    'Transform your morning routine with our Premium Organic Coffee Beans. Sourced from high-altitude farms in Colombia, these medium-roast beans deliver rich chocolate notes with a smooth caramel finish. Perfect for espresso, pour-over, or French press brewing.',
    'Elevate your workspace with the Ergonomic Standing Desk Converter. Easily adjust height from sitting to standing position with smooth pneumatic lift. Spacious 32" surface fits dual monitors, keyboard, and accessories. Built-in cable management keeps your setup clean.',
    'Indulge in luxury with our Handcrafted Leather Weekend Bag. Made from full-grain vegetable-tanned leather that develops a beautiful patina over time. Brass hardware, cotton canvas lining, and detachable shoulder strap. Fits overhead compartments perfectly.',
  ],
  'seo-title-optimizer': [
    'Vintage Levi\'s 501 Jeans Women\'s Size 28 High Waisted Straight Leg Dark Wash Denim Made USA Excellent Condition',
    'Sony WH-1000XM5 Wireless Noise Canceling Headphones Bluetooth Over-Ear Black 30 Hour Battery Fast Charging Bundle',
    'KitchenAid Artisan Stand Mixer 5 Quart Tilt-Head Empire Red Stainless Steel Bowl Dough Hook Flat Beater Whisk New',
  ],
  'hashtag-generator': [
    '#handmadejewelry #silversmith #smallbusiness #etsyshop #jewelrymaking #metalsmith #customjewelry #shopsmall #handcrafted #supportsmallbiz',
    '#vintagefashion #thriftfinds #retrostyle #90sfashion #y2k #vintageshop #secondhand #sustainablefashion #ootd #streetstyle',
    '#plantmom #houseplants #indoorjungle #plantlover #succulents #monstera #urbanjungle #plantcare #greenthumb #botanical',
  ],
  'profit-calculator': [
    '💰 Profit Calculator Results\n\n📊 Cost Breakdown:\n   Product Cost: $12.00\n   Shipping: $4.50\n   Marketplace Fee (15.00%): $5.25\n   Payment Processing (2.90%): $1.02\n   Advertising: $2.00\n   Other Expenses: $0.50\n   ─────────────────────\n   Total Costs: $25.27\n\n💵 Selling Price: $35.00\n✅ Net Profit: $9.73\n📈 Profit Margin: 27.80%\n🔄 ROI: 38.50%',
    '💰 Profit Calculator Results\n\n📊 Cost Breakdown:\n   Product Cost: $8.00\n   Shipping: $0.00\n   Marketplace Fee (12.00% + $0.30): $3.30\n   Payment Processing (2.50%): $0.69\n   Advertising: $1.50\n   Other Expenses: $0.00\n   ─────────────────────\n   Total Costs: $13.49\n\n💵 Selling Price: $27.50\n✅ Net Profit: $14.01\n📈 Profit Margin: 50.95%\n🔄 ROI: 103.85%',
  ],
  'competitor-analyzer': [
    'Top Competitor Analysis: Average listing quality score 78/100. Gap identified: only 23% include video content. Opportunity: add product videos to stand out.',
    'Price Positioning: Your price ($29.99) is competitive within market range ($24-$35). Recommendation: bundle with accessory to justify premium positioning.',
    'Keyword Gap: Competitors rank for "eco-friendly", "sustainable", "plastic-free" — terms missing from your listings. Add to titles and descriptions.',
  ],
  'review-response-writer': [
    'Thank you so much for your wonderful review, Sarah! We\'re thrilled that the jacket exceeded your expectations. The vintage wash really does give it that perfect lived-in feel. We hope it becomes a staple in your wardrobe!',
    'We appreciate you taking the time to share your feedback. We\'re sorry to hear the sizing wasn\'t quite right. Please contact us at support@store.com and we\'ll arrange a free exchange for the correct size immediately.',
    'Your kind words made our day! As a small business, reviews like yours mean everything to us. We\'re so glad the packaging arrived safely and the earrings look even better in person. Happy styling!',
  ],
  'listing-optimizer': [
    '## 🏷️ Optimized SEO Title\nOption 1: Men\'s Blue Cotton Crew Neck T-Shirt Medium Casual Everyday Wear Pre-Shrunk Classic Fit\nOption 2: Classic Blue Cotton Tee Men\'s Medium Short Sleeve Casual T-Shirt Soft Comfortable Daily Wear\n\n## 📝 Optimized Description\nUpgrade your everyday wardrobe with this classic blue cotton t-shirt...',
    '## ⭐ Key Selling Points\n• Premium 100% organic cotton for breathable comfort\n• Pre-shrunk fabric maintains perfect fit after washing\n• Versatile crew neck design pairs with any casual outfit',
  ],
  'social-media-studio': [
    '## 🎯 Hook / First Line\nStop scrolling if you\'ve been looking for sustainable fashion that actually looks good 👀\n\n## 📝 Caption\nWe just dropped our summer collection and every piece is made from 100% recycled materials...\n\n## #️⃣ Hashtags\n#sustainablefashion #ecofriendly #summerstyle #slowfashion #consciousconsumer',
  ],
};

// Use case cards per category
const useCases: Record<string, { title: string; description: string }[]> = {
  Content: [
    { title: 'Shopify Store Owners', description: 'Create consistent, compelling product descriptions across your entire catalog in minutes.' },
    { title: 'eBay Sellers', description: 'Write detailed descriptions that answer buyer questions and reduce returns.' },
    { title: 'Etsy Artisans', description: 'Tell the story behind your handmade products with authentic, engaging copy.' },
    { title: 'Dropshippers', description: 'Transform supplier descriptions into unique, branded content that converts.' },
  ],
  SEO: [
    { title: 'Multi-Platform Sellers', description: 'Optimize titles and listings across eBay, Etsy, Shopify, and Amazon simultaneously.' },
    { title: 'New Sellers', description: 'Get expert-level SEO titles and listing optimization without years of marketplace experience.' },
    { title: 'High-Volume Sellers', description: 'Bulk optimize hundreds of listings and maintain consistent quality.' },
    { title: 'Niche Product Sellers', description: 'Find long-tail keywords specific to your niche that competitors miss.' },
  ],
  'Social Media': [
    { title: 'Instagram Sellers', description: 'Boost post reach with trending, relevant hashtags and engaging captions.' },
    { title: 'TikTok Creators', description: 'Discover viral hashtag combinations and create scroll-stopping hooks.' },
    { title: 'Pinterest Marketers', description: 'Generate keyword-rich hashtags that improve pin discoverability.' },
    { title: 'Brand Managers', description: 'Maintain consistent social media strategy across all platforms.' },
  ],
  Analytics: [
    { title: 'New Product Launchers', description: 'Set optimal launch prices based on cost analysis and market positioning.' },
    { title: 'Profit-Focused Sellers', description: 'Ensure every sale meets your minimum margin requirements.' },
    { title: 'Competitive Markets', description: 'Understand competitor strategies and find pricing opportunities.' },
    { title: 'Growing Businesses', description: 'Track competitor moves and adjust your strategy proactively.' },
  ],
  'Customer Service': [
    { title: 'Small Business Owners', description: 'Respond professionally to every review without spending hours writing.' },
    { title: 'Multi-Store Managers', description: 'Maintain consistent brand voice across multiple store accounts.' },
    { title: 'High-Volume Sellers', description: 'Handle review responses efficiently during peak seasons.' },
    { title: 'Reputation Builders', description: 'Turn negative experiences into opportunities to showcase excellent service.' },
  ],
  Research: [
    { title: 'New Entrepreneurs', description: 'Validate product ideas before investing in inventory.' },
    { title: 'Expanding Sellers', description: 'Identify untapped niches and emerging market trends.' },
    { title: 'Data-Driven Sellers', description: 'Make informed decisions backed by market research insights.' },
    { title: 'Seasonal Sellers', description: 'Plan ahead for seasonal demand shifts and trending products.' },
  ],
};

// Tool-specific audience overrides (for tools whose category-based use cases don't match)
const toolSpecificUseCases: Record<string, { title: string; description: string }[]> = {
  'ai-video-generator': [
    { title: 'Content Creators', description: 'Turn text ideas into engaging videos' },
    { title: 'Marketers', description: 'Create product demos and social clips' },
    { title: 'Sellers', description: 'Make videos that sell your products' },
  ],
  'branding-assistant': [
    { title: 'New Brands', description: 'Name and brand your business from scratch' },
    { title: 'Entrepreneurs', description: 'Build a memorable brand identity' },
    { title: 'Small Business Owners', description: 'Stand out with a professional brand look' },
  ],
  'store-audit': [
    { title: 'Store Owners', description: 'Audit your store for conversions and SEO' },
    { title: 'Marketers', description: 'Find growth opportunities in your store' },
    { title: 'Developers', description: 'Get actionable technical audit insights' },
  ],
  'whatsapp-business-generator': [
    { title: 'WhatsApp Sellers', description: 'Send catalogs, broadcast promotions, and take orders directly on WhatsApp.' },
    { title: 'COD Businesses', description: 'Follow up on cash-on-delivery orders with warm, automated reminders.' },
    { title: 'Online Boutiques', description: 'Welcome new customers and re-engage abandoned carts via WhatsApp messages.' },
    { title: 'E-commerce Stores', description: 'Generate ready-to-paste order confirmations and promotional broadcasts.' },
  ],
  'competitor-analyzer': [
    { title: 'Market Researchers', description: 'Analyze competitor strategies, keywords, and market positioning to find gaps.' },
    { title: 'Product Launchers', description: 'Study the competitive landscape before entering a new niche or category.' },
    { title: 'Pricing Strategists', description: 'Compare competitor pricing and identify opportunities for premium or value positioning.' },
    { title: 'SEO Specialists', description: 'Discover keyword gaps and listing weaknesses in competitor content.' },
  ],
  'brand-campaign-studio': [
    { title: 'Brand Managers', description: 'Plan and execute cohesive brand marketing campaigns across channels.' },
    { title: 'Marketing Teams', description: 'Generate campaign ideas, social posts, and ad headlines from a single brand brief.' },
    { title: 'Small Business Owners', description: 'Build a complete campaign toolkit without hiring an agency.' },
    { title: 'Content Creators', description: 'Produce on-brand social media content and advertising copy at scale.' },
  ],
  'profit-calculator': [
    { title: 'E-commerce Sellers', description: 'Calculate product profit margins and optimal pricing before listing items.' },
    { title: 'Dropshippers', description: 'Factor in marketplace fees, shipping, and ad costs to ensure every sale is profitable.' },
    { title: 'Resellers', description: 'Quickly evaluate whether a sourcing price leaves enough margin after fees.' },
    { title: 'Small Business Owners', description: 'Set prices confidently by understanding true costs and break-even points.' },
  ],
};

// FAQs per tool slug
const toolFAQs: Record<string, FAQItem[]> = {
  'product-description-generator': [
    { question: 'Is this product description generator really free?', answer: 'Yes! Our AI product description generator is completely free to use. No credit card required, no hidden fees. Generate unlimited descriptions for any e-commerce platform.' },
    { question: 'How many descriptions can I generate?', answer: 'There are no limits! Generate as many product descriptions as you need. Perfect for sellers with large catalogs or those testing different copy variations.' },
    { question: 'What platforms are supported?', answer: 'Our generator creates optimized descriptions for Shopify, eBay, Etsy, Amazon, WooCommerce, and any other e-commerce platform. Each output follows platform best practices.' },
    { question: 'Can I customize the tone and style?', answer: 'Absolutely! Choose from professional, casual, luxury, playful, and more tones. You can also specify target audience and key selling points to include.' },
    { question: 'Are the descriptions SEO-friendly?', answer: 'Yes! Every description includes naturally integrated keywords, proper formatting, and structure that helps search engines understand your product. This improves both marketplace and Google visibility.' },
    { question: 'Is the generated content unique?', answer: 'Every description is generated fresh by our AI. No templates, no duplicate content. Each output is original and passes plagiarism checks.' },
  ],
  'seo-title-optimizer': [
    { question: 'Is this eBay title generator really free?', answer: 'Yes, our SEO Title Optimizer is 100% free. Optimize unlimited titles for eBay, Etsy, Shopify, and Amazon without any subscription or payment.' },
    { question: 'How many titles can I optimize?', answer: 'Unlimited! Optimize as many product titles as you need. Ideal for sellers managing large inventories across multiple platforms.' },
    { question: 'Does it work for all marketplaces?', answer: 'Yes! Our optimizer understands the character limits, keyword preferences, and formatting rules for eBay (80 chars), Etsy (140 chars), Shopify, Amazon, and more.' },
    { question: 'Will this improve my search rankings?', answer: 'Optimized titles significantly improve search visibility. By including relevant keywords in the right order and format, your listings appear in more buyer searches.' },
    { question: 'Can I bulk optimize titles?', answer: 'Currently, our tool optimizes one title at a time for maximum quality. We\'re working on bulk features for high-volume sellers.' },
  ],
  'hashtag-generator': [
    { question: 'Is this hashtag generator free?', answer: 'Yes! Generate unlimited hashtags for Instagram, TikTok, Pinterest, and Twitter completely free. No sign-up required.' },
    { question: 'How do I choose the right hashtags?', answer: 'Our generator provides a mix of popular, moderate, and niche hashtags. Use a combination: 3-5 popular tags for reach, 5-10 moderate for discovery, and 5-10 niche for targeted engagement.' },
    { question: 'Do hashtags still matter in 2026?', answer: 'Absolutely! Hashtags remain one of the most effective ways to increase content discoverability. They help new audiences find your content and signal relevance to platform algorithms.' },
    { question: 'Can I save my favorite hashtag sets?', answer: 'Currently, each generation is independent. Copy your favorites to a notes app or spreadsheet for quick reuse. Save feature coming soon!' },
  ],
  'profit-calculator': [
    { question: 'Is the profit calculator really free?', answer: 'Yes! Our profit calculator is completely free to use with no limitations. No sign-up required, no hidden fees.' },
    { question: 'How accurate are the calculations?', answer: 'The calculator uses precise mathematical formulas — no AI approximation. Every number is computed exactly: net profit, profit margin, and ROI are all calculated from your inputs in real time.' },
    { question: 'What costs does it factor in?', answer: 'Product cost, shipping, marketplace fees (percentage + flat fee), payment processing fees, advertising costs, and other expenses. All are included in the total cost and profit calculation.' },
    { question: 'How is ROI calculated?', answer: 'ROI = (Net Profit / Total Costs) x 100. This tells you how much return you get for every dollar spent. A 100% ROI means you double your money.' },
    { question: 'Can I use this for any marketplace?', answer: 'Yes! The calculator works for eBay, Etsy, Shopify, Amazon, Poshmark, Mercari, or any selling platform. Just enter the marketplace fee percentage for your platform.' },
  ],
  'competitor-analyzer': [
    { question: 'How does competitor analysis work?', answer: 'Our tool analyzes public listing data to identify patterns in competitor pricing, keywords, and listing quality. All data is publicly available through marketplace APIs.' },
    { question: 'Is this legal and compliant?', answer: 'Yes! We only analyze publicly available information. No private data access, no account scraping. Fully compliant with marketplace terms of service.' },
    { question: 'How often should I analyze competitors?', answer: 'Monthly analysis is recommended for most sellers. Re-analyze when entering new markets, launching products, or noticing sales changes.' },
    { question: 'Can I track specific competitors?', answer: 'Enter competitor store names or listing URLs to get targeted insights. Compare up to 5 competitors simultaneously.' },
  ],
  'review-response-writer': [
    { question: 'Is this review response tool free?', answer: 'Yes! Generate unlimited professional review responses for any platform. Free forever, no account required.' },
    { question: 'Can I customize the tone?', answer: 'Choose from friendly, professional, apologetic, grateful, and other tones. Match your brand voice for consistent customer communication.' },
    { question: 'Does it handle negative reviews?', answer: 'Yes! Our AI generates empathetic, solution-oriented responses to negative reviews that demonstrate excellent customer service and invite resolution.' },
    { question: 'Can I use responses as-is?', answer: 'We recommend reviewing and personalizing each response before posting. Add specific details about the customer\'s purchase for authenticity.' },
  ],
  'listing-optimizer': [
    { question: 'What does the Listing Optimizer do?', answer: 'It analyzes your current listing and provides an optimized SEO title, rewritten description, keyword suggestions, key selling points, and actionable improvement recommendations.' },
    { question: 'Which platforms are supported?', answer: 'The optimizer supports eBay, Etsy, Shopify, Amazon, and general e-commerce. Each platform gets tailored advice based on its specific requirements and best practices.' },
    { question: 'How is this different from the individual tools?', answer: 'The Listing Optimizer combines title optimization, description rewriting, keyword research, and improvement suggestions into one comprehensive analysis — saving you time versus using multiple tools separately.' },
    { question: 'Is the output ready to use?', answer: 'The generated content is high-quality and ready to adapt. We recommend reviewing and customizing the output to match your exact product specifications and brand voice.' },
  ],
  'social-media-studio': [
    { question: 'Which social media platforms are supported?', answer: 'Instagram, TikTok, Facebook, LinkedIn, and Twitter/X. Each platform gets content formatted according to its character limits, hashtag conventions, and audience expectations.' },
    { question: 'Can I specify the tone?', answer: 'Yes! Choose from professional, casual, inspirational, or humorous tones. The AI adapts the writing style to match your brand voice.' },
    { question: 'Does it generate hashtags?', answer: 'Yes! Platform-appropriate hashtags are included with every generation. Instagram gets up to 30, while Twitter gets 3-5 focused tags.' },
    { question: 'What content types are available?', answer: 'Posts, reels, stories, and carousels. Each type gets appropriately structured content — hooks for reels, swipe-worthy slides for carousels, etc.' },
  ],
  'keyword-research': [
    { question: 'Is this keyword research tool really free?', answer: 'Yes! Our AI keyword research tool is completely free with no sign-up required. Generate unlimited keyword analyses for any marketplace.' },
    { question: 'Which marketplaces are supported?', answer: 'Google Search, Shopify, eBay, Etsy, and Amazon. Each marketplace gets tailored keyword suggestions based on its unique search algorithm and buyer behavior.' },
    { question: 'How accurate are the search volume estimates?', answer: 'Search volumes are AI-generated approximations based on general market knowledge — not verified data from keyword tools. Always validate with real tools like Google Keyword Planner, Helium 10, eRank, or Terapeak before making business decisions.' },
    { question: 'What does the competition level mean?', answer: 'Competition indicates how many other sellers or websites are targeting the same keyword. Low competition means easier ranking potential, while high competition requires stronger optimization and authority.' },
    { question: 'How do I use the recommended keywords?', answer: 'Use the primary keyword in your title, main heading, or product name. Sprinkle secondary keywords naturally throughout your description, bullet points, tags, and backend search terms for broader discoverability.' },
    { question: 'Can I use this for content marketing?', answer: 'Absolutely! Select Google as the target marketplace to get blog-focused keyword ideas, content topics, and SEO strategy recommendations for organic traffic growth.' },
  ],
  'whatsapp-business-generator': [
    { question: 'Is this WhatsApp message generator really free?', answer: 'Yes! Generate unlimited WhatsApp messages for your business completely free. No sign-up required, no hidden fees.' },
    { question: 'What message types are supported?', answer: 'Catalog messages, broadcast announcements, order confirmations, COD follow-ups, welcome messages, and abandoned cart reminders. Each type generates contextually appropriate messages.' },
    { question: 'Can I choose the language?', answer: 'Yes! Messages can be generated in English or Roman Urdu (Urdu written in English script). Both options produce natural, conversational messages ready to paste into WhatsApp.' },
    { question: 'Are the messages ready to send?', answer: 'Absolutely. Every generated message is short, warm, and formatted for WhatsApp. Just copy and paste directly into your WhatsApp Business chat.' },
    { question: 'How many variations do I get?', answer: 'Each generation produces 3 message variations so you can pick the one that best fits your style or A/B test different approaches with your customers.' },
  ],
};

// ─── Static fallback tool metadata ──────────────────────────────────────────────
// When the API is temporarily unavailable (MongoDB reconnecting, server restart,
// network blip), we use this static map so the page can still render its form.
// This prevents the "only chatbot visible" failure mode where the entire tool
// page content area is blank because the metadata fetch failed.
const STATIC_TOOL_FALLBACKS: Record<string, AITool> = {
  'product-description-generator': {
    _id: 'fallback', name: 'Product Description Generator', slug: 'product-description-generator',
    description: 'Generate compelling, SEO-friendly product descriptions for any e-commerce platform using AI.',
    category: 'Content', features: ['Multi-platform support (Shopify, eBay, Etsy)', 'Tone customization', 'SEO keyword integration', 'Bulk generation capability'],
    toolUrl: '/tools/product-description-generator', isFree: true, status: 'live',
  },
  'seo-title-optimizer': {
    _id: 'fallback', name: 'SEO Title Optimizer', slug: 'seo-title-optimizer',
    description: 'Optimize your product titles for maximum search visibility across all major platforms.',
    category: 'SEO', features: ['Keyword density analysis', 'Character limit compliance', 'Platform-specific formatting', 'Competitor comparison'],
    toolUrl: '/tools/seo-title-optimizer', isFree: true, status: 'live',
  },
  'hashtag-generator': {
    _id: 'fallback', name: 'Hashtag Generator', slug: 'hashtag-generator',
    description: 'Generate relevant, trending hashtags for social media posts to increase reach and engagement.',
    category: 'Social Media', features: ['Trending hashtag detection', 'Niche-specific suggestions', 'Engagement rate predictions', 'Platform optimization'],
    toolUrl: '/tools/hashtag-generator', isFree: true, status: 'live',
  },
  'profit-calculator': {
    _id: 'fallback', name: 'Profit Calculator', slug: 'profit-calculator',
    description: 'Calculate profit margins, ROI, and optimal pricing for your products with instant math-based results.',
    category: 'Analytics', features: ['Instant cost breakdown', 'Profit margin calculation', 'ROI analysis', 'Marketplace fee support'],
    toolUrl: '/tools/profit-calculator', isFree: true, status: 'live',
  },
  'competitor-analyzer': {
    _id: 'fallback', name: 'Competitor Analyzer', slug: 'competitor-analyzer',
    description: 'AI-powered framework that generates competitor analysis insights based on your input.',
    category: 'Analytics', features: ['AI-generated competitive insights', 'Pricing comparison framework', 'Listing quality scoring guide', 'Gap analysis template'],
    toolUrl: '/tools/competitor-analyzer', isFree: true, status: 'live',
  },
  'review-response-writer': {
    _id: 'fallback', name: 'Review Response Writer', slug: 'review-response-writer',
    description: 'Generate professional, personalized responses to customer reviews quickly and effectively.',
    category: 'Customer Service', features: ['Sentiment analysis', 'Response templates', 'Brand voice matching', 'Multi-language support'],
    toolUrl: '/tools/review-response-writer', isFree: true, status: 'live',
  },
  'listing-optimizer': {
    _id: 'fallback', name: 'Listing Optimizer', slug: 'listing-optimizer',
    description: 'Comprehensive listing analysis with optimized titles, descriptions, and actionable improvement suggestions.',
    category: 'SEO', features: ['Title optimization', 'Description rewriting', 'Keyword suggestions', 'Improvement recommendations'],
    toolUrl: '/tools/listing-optimizer', isFree: true, status: 'live',
  },
  'social-media-studio': {
    _id: 'fallback', name: 'Social Media Studio', slug: 'social-media-studio',
    description: 'Create engaging social media content for Instagram, TikTok, Facebook, LinkedIn, and Twitter.',
    category: 'Social Media', features: ['Multi-platform support', 'Content type variety', 'Hashtag generation', 'Tone customization'],
    toolUrl: '/tools/social-media-studio', isFree: true, status: 'live',
  },
  'store-audit': {
    _id: 'fallback', name: 'Store Audit', slug: 'store-audit',
    description: 'Comprehensive audit of your online store for conversions, SEO, and user experience.',
    category: 'Analytics', features: ['Conversion analysis', 'SEO evaluation', 'UX assessment', 'Performance review'],
    toolUrl: '/tools/store-audit', isFree: true, status: 'coming_soon',
  },
  'branding-assistant': {
    _id: 'fallback', name: 'Branding Assistant', slug: 'branding-assistant',
    description: 'Build a complete brand identity with AI-generated names, color palettes, and style guides.',
    category: 'Content', features: ['Brand name generation', 'Color palette creation', 'Style guide development', 'Audience profiling'],
    toolUrl: '/tools/branding-assistant', isFree: true, status: 'live',
  },
  'bulk-listing-generator': {
    _id: 'fallback', name: 'Bulk Listing Generator', slug: 'bulk-listing-generator',
    description: 'Generate multiple product listings at once from structured product data.',
    category: 'Content', features: ['Batch processing', 'Multi-marketplace support', 'Template-based generation', 'Data import'],
    toolUrl: '/tools/bulk-listing-generator', isFree: true, status: 'coming_soon',
  },
  'product-research-assistant': {
    _id: 'fallback', name: 'Product Research Assistant', slug: 'product-research-assistant',
    description: 'AI-powered product research to validate ideas and discover market opportunities.',
    category: 'Research', features: ['Market analysis', 'Trend identification', 'Competition assessment', 'Demand estimation'],
    toolUrl: '/tools/product-research-assistant', isFree: true, status: 'coming_soon',
  },
  'prompt-library': {
    _id: 'fallback', name: 'Prompt Library', slug: 'prompt-library',
    description: 'Generate custom AI prompts for various marketing and business tasks.',
    category: 'Content', features: ['Category-based prompts', 'Platform-specific formats', 'Tone customization', 'Batch generation'],
    toolUrl: '/tools/prompt-library', isFree: true, status: 'live',
  },
  'keyword-research': {
    _id: 'fallback', name: 'Keyword Research', slug: 'keyword-research',
    description: 'AI-powered keyword research for Google, Shopify, eBay, Etsy, and Amazon marketplaces.',
    category: 'SEO', features: ['Multi-marketplace support', 'Search volume estimates', 'Competition analysis', 'Long-tail keywords'],
    toolUrl: '/tools/keyword-research', isFree: true, status: 'live',
  },
  'brand-campaign-studio': {
    _id: 'fallback', name: 'Brand Campaign Studio', slug: 'brand-campaign-studio',
    description: 'Complete brand campaign toolkit with DNA analysis, campaign ideas, social posts, and ad headlines.',
    category: 'Content', features: ['Brand DNA analysis', 'Campaign ideation', 'Social media content', 'Ad headline generation'],
    toolUrl: '/tools/brand-campaign-studio', isFree: true, status: 'live',
  },
  'whatsapp-business-generator': {
    _id: 'fallback', name: 'WhatsApp Business Generator', slug: 'whatsapp-business-generator',
    description: 'Generate ready-to-paste WhatsApp messages for catalogs, broadcasts, order confirmations, COD follow-ups, and more.',
    category: 'Customer Service', features: ['Catalog messages', 'Broadcast announcements', 'Order confirmations', 'COD follow-ups', 'Welcome messages', 'Abandoned cart reminders'],
    toolUrl: '/tools/whatsapp-business-generator', isFree: true, status: 'live',
  },
};

// Tool-specific banner images (Google Drive thumbnails)
const TOOL_BANNER_URLS: Record<string, string> = {
  'brand-campaign-studio': 'https://drive.google.com/thumbnail?id=1M4AI8kNErFUaWKRopHMdyIpeyucBqECF&sz=w1920',
  'branding-assistant': 'https://drive.google.com/thumbnail?id=1vaSwflKH8WQRyKrZugLFQq4-z8pjCF6m&sz=w1920',
  'competitor-analyzer': 'https://drive.google.com/thumbnail?id=1DxjsDcsLMC9xSPvofV3xwF6dQFPqcNzy&sz=w1920',
  'hashtag-generator': 'https://drive.google.com/thumbnail?id=11iI09zB85vSWkkn6iLNO62i4cT4BRg_I&sz=w1920',
  'keyword-research': 'https://drive.google.com/thumbnail?id=16O6ZBQ6CUxicT25fkkCpjEmWV5JVUlzt&sz=w1920',
  'listing-optimizer': 'https://drive.google.com/thumbnail?id=1U6oSTlnRDCMHGbxaydYa-Dh2PW6ktVnv&sz=w1920',
  'product-description-generator': 'https://drive.google.com/thumbnail?id=1DMQ7-Pj4ZbAQEwCi8Vx8AslhEBFQTZZj&sz=w1920',
  'profit-calculator': 'https://drive.google.com/thumbnail?id=11TT8Qm33v_RWKVHxilUHjE6r8AhmIelP&sz=w1920',
  'prompt-library': 'https://drive.google.com/thumbnail?id=1iXBVDt_yYyjXvc7Mq7Bkbmr5tQEgO9bM&sz=w1920',
  'review-response-writer': 'https://drive.google.com/thumbnail?id=15crMqeLrlVYlzj49SM0hHPApg_7nRRUU&sz=w1920',
  'seo-backlink-studio': 'https://drive.google.com/thumbnail?id=1kW6Jk-Oq6OgHTldj2KbZ_IPdPOy-_60E&sz=w1920',
  'seo-title-optimizer': 'https://drive.google.com/thumbnail?id=1OnMtpFU_3CITJSQec8NhTOcohNtHddVg&sz=w1920',
  'social-media-studio': 'https://drive.google.com/thumbnail?id=1Xv4qMaHFkOOrAugf6WvAI8vUO1Wq_PHT&sz=w1920',
  'whatsapp-business-generator': 'https://drive.google.com/thumbnail?id=1bnZz2ozKQ249fXnj0gr0uq3ttk-rC7KK&sz=w1920',
};

// Tool-specific demo video URLs (Google Drive hosted)
const TOOL_VIDEO_URLS: Record<string, string> = {
  'brand-campaign-studio': 'https://drive.google.com/file/d/1LkchTZSOpiM3p2LF5epdPrW461FzVAGq/preview',
  'profit-calculator': 'https://drive.google.com/file/d/1QBGtIh-Fj-wf4FCph2Itl0lhDZlH_VQ8/preview',
  'product-description-generator': 'https://drive.google.com/file/d/1siMNHTRosnXsbpBs5SPn6kNGZiuIaQuM/preview',
  'seo-title-optimizer': 'https://drive.google.com/file/d/1eVuFrcwNuV4yNIUjVRTvhZrxO__vU8rK/preview',
  'hashtag-generator': 'https://drive.google.com/file/d/1_M7OriDfj5AEeDC_2ikWPFNHdCXVb1_M/preview',
  'social-media-studio': 'https://drive.google.com/file/d/1KFZMZM5ZJkjKj0EnilvLWuzQyr-gwTeJ/preview',
  'keyword-research': 'https://drive.google.com/file/d/13U_QOEsQzfvbr-rCrj22wdrNUpd1Y_3j/preview',
  'competitor-analyzer': 'https://drive.google.com/file/d/10vEevZRKcT-j2f2icT-_PgtieATpn4ow/preview',
  'listing-optimizer': 'https://drive.google.com/file/d/1o-oe4icTYh3kziNMVNzHLOZQVSH3z5j5/preview',
  'review-response-writer': 'https://drive.google.com/file/d/1f0aZhBEfKGwWCuBVPo455981D8qBOrhI/preview',
  'branding-assistant': 'https://drive.google.com/file/d/1Hx4lGFYyDinhNIYgtJ1Xe7fuccK05IlZ/preview',
  'prompt-library': 'https://drive.google.com/file/d/1SW4D4vQV9to6LgRBsgDIUmYOCuXmqq5M/preview',
  'seo-backlink-studio': 'https://drive.google.com/file/d/1OOjnNeUiDI_8iijLktsQnocE6WIvkcrX/preview',
};

// Maximum time (ms) to wait for the API before showing fallback content.
// Prevents infinite skeleton loading when the server is slow/unreachable.
const FETCH_TIMEOUT_MS = 12_000;

// Maximum number of automatic retries when the API call fails.
const MAX_AUTO_RETRIES = 2;

// Delay between retries in ms (index 0 = first retry, index 1 = second retry).
const RETRY_DELAYS = [2000, 5000];

// ─── Generator Error Boundary ────────────────────────────────────────────────────
// Isolates AIToolGenerator crashes so the rest of the tool page (hero, FAQ, etc.)
// still renders. Without this, an error inside the generator replaces the entire
// page with the top-level ErrorBoundary's full-screen error UI.
interface GeneratorErrorBoundaryProps {
  toolSlug: string;
  children: ReactNode;
}

interface GeneratorErrorBoundaryState {
  hasError: boolean;
}

class GeneratorErrorBoundary extends Component<GeneratorErrorBoundaryProps, GeneratorErrorBoundaryState> {
  constructor(props: GeneratorErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): GeneratorErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[GeneratorErrorBoundary] AIToolGenerator crashed for', this.props.toolSlug, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-8 text-center" data-icod-id="src_pages_tooldetail_tsx_gen_error">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" data-icod-id="src_pages_tooldetail_tsx_gen_error_icon" />
          <h3 className="text-lg font-semibold text-foreground mb-2" data-icod-id="src_pages_tooldetail_tsx_gen_error_title">
            Tool form encountered an error
          </h3>
          <p className="text-muted-foreground mb-4" data-icod-id="src_pages_tooldetail_tsx_gen_error_desc">
            The generator form failed to load. Please refresh the page to try again.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            data-icod-id="src_pages_tooldetail_tsx_gen_error_btn">
            <RefreshCw className="mr-2 h-4 w-4" data-icod-id="src_pages_tooldetail_tsx_df96" />
            Refresh Page
          </Button>
        </Card>
      );
    }
    return this.props.children;
  }
}

export default function ToolDetail() {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const { currentTool, items: allTools, detailStatus, error } = useAppSelector((state) => state.aiTools);

  // ── Auto-retry & timeout state ──────────────────────────────────────────────
  const retryCountRef = useRef(0);
  const fetchStartTimeRef = useRef<number>(0);
  const [timedOut, setTimedOut] = useState(false);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up any pending timeout timer on unmount or slug change
  useEffect(() => {
    return () => {
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
        timeoutTimerRef.current = null;
      }
    };
  }, []);

  // Primary fetch effect with auto-retry on failure
  useEffect(() => {
    if (!slug) return;

    // Reset retry/timeout state for new slug
    retryCountRef.current = 0;
    setTimedOut(false);
    fetchStartTimeRef.current = Date.now();

    dispatch(fetchAIToolBySlug(slug));

    // Start a timeout timer — if the API hasn't responded within FETCH_TIMEOUT_MS,
    // mark as timed out so we can show fallback content instead of infinite skeleton.
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    timeoutTimerRef.current = setTimeout(() => {
      setTimedOut(true);
    }, FETCH_TIMEOUT_MS);

    return () => {
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
        timeoutTimerRef.current = null;
      }
      dispatch(clearCurrentTool());
    };
  }, [dispatch, slug]);

  // Auto-retry when fetch fails (up to MAX_AUTO_RETRIES times)
  useEffect(() => {
    if (detailStatus !== 'failed' || !slug) return;

    // Clear the timeout timer since we got a definitive response
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }

    if (retryCountRef.current < MAX_AUTO_RETRIES) {
      const delay = RETRY_DELAYS[retryCountRef.current] ?? RETRY_DELAYS[RETRY_DELAYS.length - 1];
      retryCountRef.current += 1;
      console.warn(`[ToolDetail] Fetch failed for "${slug}", retrying (${retryCountRef.current}/${MAX_AUTO_RETRIES}) in ${delay}ms…`);
      const timer = setTimeout(() => {
        dispatch(fetchAIToolBySlug(slug));
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [detailStatus, dispatch, slug]);

  // Clear timeout timer once fetch succeeds
  useEffect(() => {
    if (detailStatus === 'succeeded' && timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
      setTimedOut(false);
    }
  }, [detailStatus]);

  // ── Determine effective tool data (API or static fallback) ──────────────────
  // If the API succeeded, use the fetched tool. If it failed or timed out but
  // we have a static fallback for this slug, use the fallback so the page can
  // still render its form. This prevents the "only chatbot visible" failure mode.
  const effectiveTool: AITool | null = currentTool
    ?? ((detailStatus === 'failed' && retryCountRef.current >= MAX_AUTO_RETRIES && slug && STATIC_TOOL_FALLBACKS[slug])
      ? STATIC_TOOL_FALLBACKS[slug]
      : (timedOut && slug && STATIC_TOOL_FALLBACKS[slug])
        ? STATIC_TOOL_FALLBACKS[slug]
        : null);

  // Whether we're using fallback data (for subtle UI indication)
  const isUsingFallback = !!effectiveTool && !currentTool;

  // Fetch related tools (same category) when current tool loads
  useEffect(() => {
    if (effectiveTool?.category && allTools.length === 0) {
      dispatch(fetchAITools());
    }
  }, [dispatch, effectiveTool, allTools.length]);

  // Manual retry handler — resets retry counter and re-fetches
  const handleManualRetry = useCallback(() => {
    if (!slug) return;
    retryCountRef.current = 0;
    setTimedOut(false);
    fetchStartTimeRef.current = Date.now();
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    timeoutTimerRef.current = setTimeout(() => setTimedOut(true), FETCH_TIMEOUT_MS);
    dispatch(fetchAIToolBySlug(slug));
  }, [dispatch, slug]);

  if ((detailStatus === 'loading' || detailStatus === 'idle') && !effectiveTool) {
    return (
      <div data-icod-id="src_pages_tooldetail_tsx_skeleton">
        {/* Hero Section Skeleton */}
        <section
          className="py-16 md:py-24"
          style={{ background: 'var(--section-lavender)' }}
          data-icod-id="src_pages_tooldetail_tsx_d401">
          <div
            className="container mx-auto px-4"
            data-icod-id="src_pages_tooldetail_tsx_a44c">
            <nav className="mb-8" data-icod-id="src_pages_tooldetail_tsx_a3ef">
              <Skeleton
                variant="text"
                width={140}
                height={20}
                data-icod-id="src_pages_tooldetail_tsx_70af" />
            </nav>
            <div
              className="max-w-4xl mx-auto text-center"
              data-icod-id="src_pages_tooldetail_tsx_4738">
              <div
                className="flex items-center justify-center gap-2 mb-4"
                data-icod-id="src_pages_tooldetail_tsx_dc97">
                <Skeleton
                  variant="rect"
                  width={80}
                  height={28}
                  className="rounded-full"
                  data-icod-id="src_pages_tooldetail_tsx_3b03" />
                <Skeleton
                  variant="rect"
                  width={100}
                  height={28}
                  className="rounded-full"
                  data-icod-id="src_pages_tooldetail_tsx_8bb0" />
              </div>
              <Skeleton
                variant="text"
                className="mx-auto mb-6"
                width="60%"
                height={48}
                data-icod-id="src_pages_tooldetail_tsx_9c8b" />
              <Skeleton
                variant="text"
                className="mx-auto mb-4"
                width="80%"
                height={20}
                data-icod-id="src_pages_tooldetail_tsx_4115" />
              <Skeleton
                variant="text"
                className="mx-auto mb-8"
                width="70%"
                height={20}
                data-icod-id="src_pages_tooldetail_tsx_20c1" />
              <div
                className="flex justify-center"
                data-icod-id="src_pages_tooldetail_tsx_cabf">
                <Skeleton
                  variant="rect"
                  width={180}
                  height={48}
                  className="rounded-lg"
                  data-icod-id="src_pages_tooldetail_tsx_958c" />
              </div>
            </div>
          </div>
        </section>
        {/* Generator Section Skeleton */}
        <section
          className="py-12 bg-background"
          data-icod-id="src_pages_tooldetail_tsx_bdbb">
          <div
            className="container mx-auto px-4"
            data-icod-id="src_pages_tooldetail_tsx_f252">
            <div
              className="max-w-3xl mx-auto"
              data-icod-id="src_pages_tooldetail_tsx_7467">
              <Skeleton variant="card" height={320} data-icod-id="src_pages_tooldetail_tsx_c7df" />
            </div>
          </div>
        </section>
        {/* How It Works Skeleton */}
        <section
          className="py-16 md:py-20 bg-background"
          data-icod-id="src_pages_tooldetail_tsx_86e4">
          <div
            className="container mx-auto px-4"
            data-icod-id="src_pages_tooldetail_tsx_86d0">
            <div
              className="max-w-4xl mx-auto"
              data-icod-id="src_pages_tooldetail_tsx_0511">
              <Skeleton
                variant="text"
                className="mx-auto mb-12"
                width={200}
                height={36}
                data-icod-id="src_pages_tooldetail_tsx_d66a" />
              <div
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
                data-icod-id="src_pages_tooldetail_tsx_4879">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="text-center"
                    data-icod-id={`src_pages_tooldetail_tsx_e43c_${i}`}>
                    <Skeleton
                      variant="circle"
                      className="mx-auto mb-4"
                      data-icod-id={`src_pages_tooldetail_tsx_0bd8_${i}`} />
                    <Skeleton
                      variant="text"
                      className="mx-auto mb-2"
                      width="60%"
                      height={20}
                      data-icod-id={`src_pages_tooldetail_tsx_bcb0_${i}`} />
                    <Skeleton
                      variant="text"
                      className="mx-auto"
                      width="80%"
                      height={16}
                      data-icod-id={`src_pages_tooldetail_tsx_87e1_${i}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* FAQ Section Skeleton */}
        <section
          className="py-16 md:py-20"
          style={{ background: 'var(--section-lavender)' }}
          data-icod-id="src_pages_tooldetail_tsx_a19d">
          <div
            className="container mx-auto px-4"
            data-icod-id="src_pages_tooldetail_tsx_0d8a">
            <div
              className="max-w-3xl mx-auto"
              data-icod-id="src_pages_tooldetail_tsx_da35">
              <Skeleton
                variant="text"
                className="mx-auto mb-8"
                width={280}
                height={36}
                data-icod-id="src_pages_tooldetail_tsx_6415" />
              <div className="space-y-4" data-icod-id="src_pages_tooldetail_tsx_d156">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rect"
                    height={56}
                    data-icod-id={`src_pages_tooldetail_tsx_8b50_${i}`} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (detailStatus === 'failed' && !effectiveTool) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4" data-icod-id="src_pages_tooldetail_tsx_error">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" data-icod-id="src_pages_tooldetail_tsx_error_icon" />
        <h2 className="text-2xl font-bold text-foreground mb-4" data-icod-id="src_pages_tooldetail_tsx_error_title">Something Went Wrong</h2>
        <p className="text-muted-foreground mb-6" data-icod-id="src_pages_tooldetail_tsx_error_desc">
          {error || 'We couldn\'t load this tool. Please try again.'}
        </p>
        <div className="flex gap-3" data-icod-id="src_pages_tooldetail_tsx_error_actions">
          <Button variant="primary" onClick={handleManualRetry} data-icod-id="src_pages_tooldetail_tsx_error_retry">
            <RefreshCw className="mr-2 h-4 w-4" data-icod-id="src_pages_tooldetail_tsx_d143" />
            Try Again
          </Button>
          <Link to="/ai-tools" className={buttonClass({ variant: 'outline' })} data-icod-id="src_pages_tooldetail_tsx_error_link">
            <ChevronLeft className="h-4 w-4 mr-1" data-icod-id="src_pages_tooldetail_tsx_error_backicon" />
            Back to AI Tools
          </Link>
        </div>
      </div>
    );
  }

  if (!effectiveTool) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4" data-icod-id="src_pages_tooldetail_tsx_notfound">
        <h2 className="text-2xl font-bold text-foreground mb-4" data-icod-id="src_pages_tooldetail_tsx_nf_title">Tool Not Found</h2>
        <p className="text-muted-foreground mb-6" data-icod-id="src_pages_tooldetail_tsx_nf_desc">The tool you're looking for doesn't exist or has been removed.</p>
        <Link to="/ai-tools" className="inline-flex items-center text-primary hover:underline" data-icod-id="src_pages_tooldetail_tsx_nf_link">
          <ChevronLeft className="h-4 w-4 mr-1" data-icod-id="src_pages_tooldetail_tsx_nf_icon" />
          Back to AI Tools
        </Link>
      </div>
    );
  }

  const relatedTools = allTools
    .filter((t) => t.category === effectiveTool.category && t._id !== effectiveTool._id)
    .slice(0, 3);

  // Use shared override logic for consistent status across all views
  const effectiveStatus = getEffectiveStatus(effectiveTool.slug, effectiveTool.status);
  const isEffectivelyLive = effectiveStatus === 'live';

  const niches = getNichesForTool(effectiveTool.slug);
  const faqs = toolFAQs[effectiveTool.slug] || [
    { question: `Is the ${effectiveTool.name} free?`, answer: 'Yes! This tool is completely free to use with no limitations.' },
    { question: 'How does this tool work?', answer: 'Simply enter your requirements and our AI generates optimized results instantly.' },
    { question: 'Can I use the outputs commercially?', answer: 'Yes! All generated content is yours to use for any commercial purpose.' },
    { question: 'Is there a limit to how many times I can use it?', answer: 'No limits! Use the tool as many times as you need, completely free.' },
  ];
  const outputs = sampleOutputs[effectiveTool.slug] || [];
  const cases = toolSpecificUseCases[effectiveTool.slug] || useCases[effectiveTool.category] || useCases.Content;

  return (
    <>
      <SEOHead
        title={`${effectiveTool.name} — Free AI Tool | ${SITE_NAME}`}
        description={effectiveTool.description}
        keywords={`${effectiveTool.name}, ${effectiveTool.category}, free ai tool, ecommerce tool`}
        canonicalUrl={`/tools/${slug}`}
        data-icod-id="src_pages_tooldetail_tsx_seo" />
      <SchemaInjector
        schemaType="tool"
        tool={{
          name: effectiveTool.name,
          slug: effectiveTool.slug,
          description: effectiveTool.description,
          category: effectiveTool.category,
          features: effectiveTool.features,
        }}
        faqItems={faqs}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'AI Tools', url: '/ai-tools' },
          { name: effectiveTool.name, url: `/tools/${slug}` },
        ]}
        data-icod-id="src_pages_tooldetail_tsx_4573" />
      {/* Hero Section */}
      <section className="py-16 md:py-24" style={{ background: 'var(--section-lavender)' }} data-icod-id="src_pages_tooldetail_tsx_hero">
        <div className="container mx-auto px-4" data-icod-id="src_pages_tooldetail_tsx_hero_container">
          <nav className="mb-8" data-icod-id="src_pages_tooldetail_tsx_breadcrumb">
            <Link to="/ai-tools" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors" data-icod-id="src_pages_tooldetail_tsx_backlink">
              <ChevronLeft className="h-4 w-4 mr-1" data-icod-id="src_pages_tooldetail_tsx_backicon" />
              Back to AI Tools
            </Link>
          </nav>

          <div className="max-w-4xl mx-auto text-center" data-icod-id="src_pages_tooldetail_tsx_hero_content">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4" data-icod-id="src_pages_tooldetail_tsx_badges">
              {effectiveTool.isFree && (
                <Badge variant="free" data-icod-id="src_pages_tooldetail_tsx_free_badge">
                  Free Forever
                </Badge>
              )}
              <Badge variant="ai" data-icod-id="src_pages_tooldetail_tsx_badge">
                {effectiveTool.category}
              </Badge>
              {effectiveTool.status && (() => {
                // Use shared override logic for consistent status display
                const displayStatus = getEffectiveStatus(effectiveTool.slug, effectiveTool.status);
                const displayStatusInfo = statusConfig[displayStatus] || statusConfig.live;
                return (
                  <span
                    className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border whitespace-nowrap shrink-0', displayStatusInfo.className)}
                    data-icod-id="src_pages_tooldetail_tsx_8c6c">
                    {displayStatusInfo.label}
                  </span>
                );
              })()}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-heading" data-icod-id="src_pages_tooldetail_tsx_title">
              {effectiveTool.name}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-icod-id="src_pages_tooldetail_tsx_desc">
              {effectiveTool.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center" data-icod-id="src_pages_tooldetail_tsx_cta">
              {isEffectivelyLive && (
                <Link to={`/tools/${effectiveTool.slug}`} data-icod-id="src_pages_tooldetail_tsx_trylink">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto" data-icod-id="src_pages_tooldetail_tsx_trybtn">
                    <Sparkles className="h-5 w-5 mr-2" data-icod-id="src_pages_tooldetail_tsx_tryicon" />
                    Try Free Now
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Tool Banner Image */}
      {slug && TOOL_BANNER_URLS[slug] && (
        <div className="w-full" data-icod-id="src_pages_tooldetail_tsx_banner">
          <img
            src={TOOL_BANNER_URLS[slug]}
            alt={`${effectiveTool.name} Banner`}
            className="w-full h-auto object-cover"
            loading="eager"
            data-icod-id="src_pages_tooldetail_tsx_banner_img"
          />
        </div>
      )}
      {/* AI Generator Section */}
      <section className="py-12 bg-background" data-icod-id="src_pages_tooldetail_tsx_generator">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_tooldetail_tsx_841b">
          <div
            className="max-w-3xl mx-auto"
            data-icod-id="src_pages_tooldetail_tsx_0c45">
            {!isEffectivelyLive ? (
              <Card className="p-8 text-center" data-icod-id="src_pages_tooldetail_tsx_comingsoon">
                <div
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"
                  data-icod-id="src_pages_tooldetail_tsx_8444">
                  <Sparkles
                    className="h-8 w-8 text-muted-foreground"
                    data-icod-id="src_pages_tooldetail_tsx_a085" />
                </div>
                <h2
                  className="text-xl font-semibold text-foreground mb-2"
                  data-icod-id="src_pages_tooldetail_tsx_1aaa">Coming Soon</h2>
                <p
                  className="text-muted-foreground max-w-md mx-auto"
                  data-icod-id="src_pages_tooldetail_tsx_15a4">
                  {effectiveTool.slug === 'ai-video-generator'
                    ? 'Coming soon — video generation is not available yet. Check back later for updates.'
                    : effectiveTool.slug === 'listing-health-score'
                      ? 'Coming soon — this tool is not available yet. Check back later for updates.'
                      : 'This tool is currently under development. Check back soon for updates, or explore our other free AI tools while you wait.'}
                </p>
              </Card>
            ) : effectiveTool.slug === 'ai-video-generator' ? (
              <Card className="p-8 text-center" data-icod-id="src_pages_tooldetail_tsx_video_coming_soon">
                <div
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"
                  data-icod-id="src_pages_tooldetail_tsx_video_cs_icon_bg">
                  <Video
                    className="h-8 w-8 text-muted-foreground"
                    data-icod-id="src_pages_tooldetail_tsx_video_cs_icon" />
                </div>
                <h2
                  className="text-xl font-semibold text-foreground mb-2"
                  data-icod-id="src_pages_tooldetail_tsx_video_cs_title">Coming Soon</h2>
                <p
                  className="text-muted-foreground max-w-md mx-auto mb-6"
                  data-icod-id="src_pages_tooldetail_tsx_video_cs_desc">
                  Coming soon — video generation is not available yet. Check back later for updates.
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  disabled
                  className="border-border text-muted-foreground cursor-not-allowed opacity-60"
                  data-icod-id="src_pages_tooldetail_tsx_video_cs_btn">
                  Generate (Coming Soon)
                </Button>
              </Card>
            ) : (
              <GeneratorErrorBoundary
                toolSlug={effectiveTool.slug}
                data-icod-id="src_pages_tooldetail_tsx_5220">
                <AIToolGenerator toolSlug={effectiveTool.slug} data-icod-id="src_pages_tooldetail_tsx_0519" />
              </GeneratorErrorBoundary>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-20 bg-background" data-icod-id="src_pages_tooldetail_tsx_howitworks">
        <div className="container mx-auto px-4" data-icod-id="src_pages_tooldetail_tsx_hiw_container">
          <div className="max-w-4xl mx-auto" data-icod-id="src_pages_tooldetail_tsx_hiw_inner">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center font-heading" data-icod-id="src_pages_tooldetail_tsx_hiw_title">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-icod-id="src_pages_tooldetail_tsx_hiw_grid">
              {effectiveTool.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="text-center" data-icod-id={`src_pages_tooldetail_tsx_step_${index}`}>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4" data-icod-id={`src_pages_tooldetail_tsx_stepnum_${index}`}>
                    <span className="text-primary font-bold text-lg" data-icod-id={`src_pages_tooldetail_tsx_stepn_${index}`}>{index + 1}</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2" data-icod-id={`src_pages_tooldetail_tsx_steptitle_${index}`}>
                    {index === 0 ? 'Input Your Details' : index === 1 ? 'AI Generates Results' : 'Copy & Use'}
                  </h3>
                  <p className="text-muted-foreground text-sm" data-icod-id={`src_pages_tooldetail_tsx_stepdesc_${index}`}>{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Who Is This For Section */}
      <section className="py-16 md:py-20" style={{ background: 'var(--section-blush)' }} data-icod-id="src_pages_tooldetail_tsx_whoisitfor">
        <div className="container mx-auto px-4" data-icod-id="src_pages_tooldetail_tsx_wisf_container">
          <div className="max-w-5xl mx-auto" data-icod-id="src_pages_tooldetail_tsx_wisf_inner">
            <div className="flex items-center gap-3 mb-8" data-icod-id="src_pages_tooldetail_tsx_wisf_header">
              <Users className="h-8 w-8 text-primary" data-icod-id="src_pages_tooldetail_tsx_wisf_icon" />
              <h2 className="text-3xl font-bold text-foreground font-heading" data-icod-id="src_pages_tooldetail_tsx_wisf_title">Who Is This For?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-icod-id="src_pages_tooldetail_tsx_wisf_grid">
              {cases.map((useCase, index) => (
                <Card key={index} className="p-6" data-icod-id={`src_pages_tooldetail_tsx_case_${index}`}>
                  <h3 className="font-semibold text-foreground mb-2" data-icod-id={`src_pages_tooldetail_tsx_casetitle_${index}`}>{useCase.title}</h3>
                  <p className="text-muted-foreground text-sm" data-icod-id={`src_pages_tooldetail_tsx_casedesc_${index}`}>{useCase.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Sample Outputs Section */}
      {outputs.length > 0 && (
        <section className="py-16 md:py-20 bg-background" data-icod-id="src_pages_tooldetail_tsx_samples">
          <div className="container mx-auto px-4" data-icod-id="src_pages_tooldetail_tsx_samples_container">
            <div className="max-w-4xl mx-auto" data-icod-id="src_pages_tooldetail_tsx_samples_inner">
              <div className="flex items-center gap-3 mb-8" data-icod-id="src_pages_tooldetail_tsx_samples_header">
                <Lightbulb className="h-8 w-8 text-primary" data-icod-id="src_pages_tooldetail_tsx_samples_icon" />
                <h2 className="text-3xl font-bold text-foreground font-heading" data-icod-id="src_pages_tooldetail_tsx_samples_title">Sample Outputs</h2>
              </div>
              <div className="space-y-4" data-icod-id="src_pages_tooldetail_tsx_samples_list">
                {outputs.map((output, index) => (
                  <Card key={index} className="p-6" data-icod-id={`src_pages_tooldetail_tsx_output_${index}`}>
                    <MarkdownRenderer content={output} data-icod-id={`src_pages_tooldetail_tsx_outputtext_${index}`} />
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      {/* Video Tutorial Section */}
      <section className="py-16 md:py-20" style={{ background: 'var(--section-aqua)' }} data-icod-id="src_pages_tooldetail_tsx_video">
        <div className="container mx-auto px-4" data-icod-id="src_pages_tooldetail_tsx_video_container">
          <div className="max-w-3xl mx-auto" data-icod-id="src_pages_tooldetail_tsx_video_inner">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center font-heading" data-icod-id="src_pages_tooldetail_tsx_video_title">
              See It In Action
            </h2>
            <VideoEmbed
              src={slug ? TOOL_VIDEO_URLS[slug] : undefined}
              title={`${effectiveTool.name} Tutorial`}
              description="Watch how easy it is to use this tool and get amazing results."
              data-icod-id="src_pages_tooldetail_tsx_video_embed" />
          </div>
        </div>
      </section>
      {/* Browse by Niche Section */}
      {niches.length > 0 && (
        <section className="py-16 md:py-20 bg-background" data-icod-id="src_pages_tooldetail_tsx_niches">
          <div className="container mx-auto px-4" data-icod-id="src_pages_tooldetail_tsx_niches_container">
            <div className="max-w-5xl mx-auto" data-icod-id="src_pages_tooldetail_tsx_niches_inner">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center font-heading" data-icod-id="src_pages_tooldetail_tsx_niches_title">
                Browse by Category
              </h2>
              <div className="flex flex-wrap gap-3 justify-center" data-icod-id="src_pages_tooldetail_tsx_niches_grid">
                {niches.map((niche) => (
                  <Link
                    key={niche.slug}
                    to={`/tools/${effectiveTool.slug}/${niche.slug}`}
                    className="px-4 py-2 rounded-full border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all text-sm font-medium text-foreground"
                    data-icod-id={`src_pages_tooldetail_tsx_niche_${niche.slug}`}>
                    {niche.nicheName}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      {/* FAQ Section */}
      <section className="py-16 md:py-20" style={{ background: 'var(--section-lavender)' }} data-icod-id="src_pages_tooldetail_tsx_faq">
        <div className="container mx-auto px-4" data-icod-id="src_pages_tooldetail_tsx_faq_container">
          <div className="max-w-3xl mx-auto" data-icod-id="src_pages_tooldetail_tsx_faq_inner">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center font-heading" data-icod-id="src_pages_tooldetail_tsx_faq_title">
              Frequently Asked Questions
            </h2>
            <FAQAccordion items={faqs} data-icod-id="src_pages_tooldetail_tsx_faq_accordion" />
          </div>
        </div>
      </section>
      {/* Related Tools Section */}
      {relatedTools.length > 0 && (
        <section className="py-16 md:py-20 bg-background" data-icod-id="src_pages_tooldetail_tsx_related">
          <div className="container mx-auto px-4" data-icod-id="src_pages_tooldetail_tsx_related_container">
            <div className="max-w-5xl mx-auto" data-icod-id="src_pages_tooldetail_tsx_related_inner">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center font-heading" data-icod-id="src_pages_tooldetail_tsx_related_title">
                Related Tools
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-icod-id="src_pages_tooldetail_tsx_related_grid">
                {relatedTools.map((tool) => (
                  <AIToolCard key={tool._id} tool={tool} data-icod-id={`src_pages_tooldetail_tsx_relcard_${tool._id}`} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      {/* ChatGPT Prompt Collection — shown only on prompt-library tool page */}
      {effectiveTool.slug === 'prompt-library' && (
        <ChatGPTPromptCollection data-icod-id="src_pages_tooldetail_tsx_1eeb" />
      )}
      {/* CTA Section */}
      <section className="py-16 md:py-20" style={{ background: 'var(--gradient-signature)' }} data-icod-id="src_pages_tooldetail_tsx_cta_section">
        <div className="container mx-auto px-4 text-center" data-icod-id="src_pages_tooldetail_tsx_cta_container">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6 font-heading" data-icod-id="src_pages_tooldetail_tsx_cta_title">
            {!isEffectivelyLive ? `${effectiveTool.name} is Coming Soon` : `Ready to Try ${effectiveTool.name}?`}
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto" data-icod-id="src_pages_tooldetail_tsx_cta_desc">
            {!isEffectivelyLive
              ? 'This tool is under active development. Explore our other free AI tools while you wait.'
              : 'Use our free AI tools to streamline your e-commerce workflow.'}
          </p>
          {isEffectivelyLive && (
            <Link to={`/tools/${effectiveTool.slug}`} className={buttonClass({ size: 'lg', className: 'shadow-lg' })} data-icod-id="src_pages_tooldetail_tsx_cta_link">
                Start Using Free
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
