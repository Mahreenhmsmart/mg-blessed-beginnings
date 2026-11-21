import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import BlogPost from './models/BlogPost';
import Service from './models/Service';
import AITool from './models/AITool';
import User from './models/User';
import AIProviderConfig from './models/AIProviderConfig';
import Course from './models/Course';
import Resource from './models/Resource';
import Ad from './models/Ad';
import Project from './models/Project';
import Audit from './models/Audit';
import Product from './models/Product';
import Founder from './models/Founder';
import HomepageSettings from './models/HomepageSettings';
import Portfolio from './models/Portfolio';
import ThirtyDayPlan from './models/ThirtyDayPlan';
import Clone from './models/Clone';
import { DEMO_USERS } from './config/demoUsers';

export async function seedData(): Promise<void> {
  console.log('[SEED] Starting data seeding...');

  // Seed demo users (idempotent via upsert with fresh bcrypt hash on every boot).
  // Uses findOneAndUpdate instead of updateOne to ensure Mongoose applies schema
  // setters (e.g. email lowercase) and returns the written document for verification.
  for (const u of DEMO_USERS) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    const normalizedEmail = u.email.toLowerCase().trim();
    await User.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          name: u.name,
          email: normalizedEmail,
          password: hashedPassword,
          role: u.role,
          isActive: true,
        },
      },
      { upsert: true, new: true, runValidators: true },
    );
    console.log(`[SEED] Demo user upserted: ${normalizedEmail} (${u.role})`);
  }
  console.log(`[SEED] All ${DEMO_USERS.length} demo users seeded successfully`);

  // Seed Blog Posts (idempotent via upsert by slug)
  const blogPosts = [
    {
      title: '10 Essential Shopify Tips for E-commerce Success in 2026',
      slug: 'shopify-tips-ecommerce-success-2026',
      excerpt: 'Discover the top Shopify strategies that will help you scale your online store and increase conversions this year.',
      content: `<p>Running a successful Shopify store requires more than just listing products. In this comprehensive guide, we'll explore the essential strategies that top-performing stores use to drive sales and build customer loyalty.</p>

<h2>1. Optimize Your Product Pages</h2>
<p>Your product pages are where conversions happen. Make sure each page has high-quality images, detailed descriptions, and clear calls-to-action. Use lifestyle photos to show products in context.</p>

<h2>2. Implement Mobile-First Design</h2>
<p>Over 70% of e-commerce traffic comes from mobile devices. Ensure your store is fully responsive and provides an excellent mobile shopping experience.</p>

<h2>3. Leverage Social Proof</h2>
<p>Customer reviews, testimonials, and user-generated content build trust. Display reviews prominently on product pages and create a dedicated testimonial section.</p>

<h2>4. Set Up Abandoned Cart Recovery</h2>
<p>Nearly 70% of shopping carts are abandoned. Implement automated email sequences to recover these lost sales. Offer incentives like free shipping or small discounts.</p>

<h2>5. Invest in SEO</h2>
<p>Organic search traffic is valuable and sustainable. Research keywords your customers use, optimize product titles and descriptions, and create helpful blog content.</p>

<p>By implementing these strategies consistently, you'll see significant improvements in your store's performance over time.</p>`,
      author: 'Mahreen Yousaf',
      category: 'Shopify',
      tags: ['shopify', 'e-commerce', 'tips', 'conversion'],
      featuredImage: 'https://drive.google.com/thumbnail?id=1UHwOPcPQmi158da9Fz1sZ-twBXUycSzR&sz=w800',
      publishedAt: new Date('2026-01-10T09:00:00Z'),
      status: 'published',
    },
    {
      title: 'Complete Guide to eBay Listing Optimization',
      slug: 'ebay-listing-optimization-guide',
      excerpt: 'Learn how to create compelling eBay listings that rank higher in search results and convert more browsers into buyers.',
      content: `<p>eBay remains one of the largest online marketplaces, but competition is fierce. To succeed, you need listings that stand out and convert. This guide covers everything you need to know about eBay listing optimization.</p>

<h2>Title Optimization</h2>
<p>Your title is the most important element for search visibility. Use all 80 characters, include relevant keywords, and avoid filler words. Structure: Brand + Model + Key Features + Condition.</p>

<h2>Item Specifics Matter</h2>
<p>Fill out every available item specific. eBay's algorithm uses these to match buyer searches. Missing specifics means missing potential buyers.</p>

<h2>High-Quality Photos</h2>
<p>Use at least 8-12 photos showing multiple angles, close-ups of details, and any flaws. White background for main photo, lifestyle shots for others.</p>

<h2>Pricing Strategy</h2>
<p>Research completed listings to understand market value. Consider offering free shipping (build it into price) as eBay favors free shipping listings.</p>

<h2>Description Best Practices</h2>
<p>Write scannable descriptions with bullet points. Include measurements, condition details, and shipping information. Avoid HTML that breaks on mobile.</p>

<p>Optimizing your eBay listings takes time, but the payoff in increased visibility and sales is worth the effort.</p>`,
      author: 'Mahreen Yousaf',
      category: 'eBay',
      tags: ['eBay', 'listing', 'optimization', 'marketplace'],
      featuredImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=450&fit=crop',
      publishedAt: new Date('2026-01-05T10:00:00Z'),
      status: 'published',
    },
    {
      title: 'SEO Strategies for Etsy Sellers: Rank Higher in 2026',
      slug: 'seo-strategies-etsy-sellers-2026',
      excerpt: 'Master Etsy SEO with proven strategies to improve your shop visibility and drive more organic traffic to your handmade products.',
      content: `<p>Etsy's search algorithm determines which products buyers see first. Understanding and optimizing for Etsy SEO is crucial for sustainable shop growth. Here's your complete guide to ranking higher in 2026.</p>

<h2>Keyword Research for Etsy</h2>
<p>Start with Etsy's search bar autocomplete. Type your main keyword and note suggestions. Use tools like eRank or Marmalead for deeper research. Focus on long-tail keywords with lower competition.</p>

<h2>Title Optimization</h2>
<p>Front-load your most important keywords. Use all 140 characters. Format: Primary Keyword | Secondary Keywords | Product Attributes. Separate phrases with commas or pipes.</p>

<h2>All 13 Tags Are Gold</h2>
<p>Use every tag slot. Each tag can be up to 20 characters. Think like your buyer - what would they search? Include variations, synonyms, and related terms.</p>

<h2>Category Selection</h2>
<p>Choose the most specific category possible. Being in "Home & Living > Home Decor > Wall Hangings" is better than just "Home & Living".</p>

<h2>Listing Quality Score</h2>
<p>Etsy tracks clicks, favorites, and purchases. Better engagement improves your ranking. Create compelling thumbnails and competitive pricing to boost these metrics.</p>

<p>Consistent optimization and regular new listings signal to Etsy that your shop is active and deserving of visibility.</p>`,
      author: 'Mahreen Yousaf',
      category: 'Etsy',
      tags: ['etsy', 'seo', 'handmade', 'organic-traffic'],
      featuredImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&h=450&fit=crop',
      publishedAt: new Date('2025-12-20T09:30:00Z'),
      status: 'published',
    },
    {
      title: 'Dropshipping 101: Start Your E-commerce Journey',
      slug: 'dropshipping-101-start-ecommerce',
      excerpt: 'A comprehensive beginner\'s guide to dropshipping — from finding suppliers to setting up your first online store.',
      content: `<p>Dropshipping has become one of the most popular ways to start an e-commerce business with minimal upfront investment. This guide walks you through everything you need to know to get started.</p>

<h2>What is Dropshipping?</h2>
<p>Dropshipping is a retail fulfillment method where a store doesn't keep products in stock. Instead, when a store sells a product, it purchases the item from a third party and has it shipped directly to the customer.</p>

<h2>Finding Reliable Suppliers</h2>
<p>Your supplier relationship is crucial. Research AliExpress, SaleHoo, and Spocket for suppliers with good reviews and fast shipping times. Always order samples before listing products.</p>

<h2>Choosing Your Niche</h2>
<p>Select a niche you're passionate about with sufficient demand. Use tools like Google Trends and social media to validate interest. Avoid oversaturated markets unless you have a unique angle.</p>

<h2>Setting Up Your Store</h2>
<p>Shopify is the recommended platform for dropshipping. Install Oberlo or DSers for easy product importing. Focus on professional design, clear policies, and trust signals like reviews.</p>

<h2>Marketing Your Store</h2>
<p>Use Facebook Ads, Instagram marketing, and influencer partnerships to drive traffic. Start with a small budget and scale what works. Email marketing helps with customer retention.</p>

<p>Dropshipping requires patience and persistence, but with the right approach, it can become a profitable business model.</p>`,
      author: 'Mahreen Yousaf',
      category: 'General',
      tags: ['dropshipping', 'beginners', 'ecommerce', 'shopify'],
      featuredImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=450&fit=crop&q=80',
      publishedAt: new Date('2025-12-10T08:00:00Z'),
      status: 'published',
    },
    {
      title: 'Social Media Marketing Strategies for Online Sellers',
      slug: 'social-media-marketing-online-sellers',
      excerpt: 'Learn proven social media strategies to grow your e-commerce brand and drive consistent sales across all platforms.',
      content: `<p>Social media is no longer optional for e-commerce businesses. With billions of active users, platforms like Instagram, TikTok, and Pinterest offer incredible opportunities to reach your target audience.</p>

<h2>Instagram Shopping</h2>
<p>Set up Instagram Shopping to tag products directly in posts and stories. Create shoppable reels that showcase your products in action. Consistent posting (3-5 times per week) builds brand awareness.</p>

<h2>TikTok for E-commerce</h2>
<p>TikTok's algorithm favors authentic, entertaining content. Create behind-the-scenes videos, product demonstrations, and trending challenges. Even small accounts can go viral with the right content.</p>

<h2>Pinterest Marketing</h2>
<p>Pinterest users are actively looking to buy. Create rich pins with detailed descriptions and keywords. Pin consistently using Tailwind for scheduling. Focus on lifestyle imagery that inspires purchases.</p>

<h2>Email List Building</h2>
<p>Use social media to build your email list. Offer lead magnets like discount codes or free guides. Your email list is an asset you own, unlike social media followers.</p>

<h2>Measuring Success</h2>
<p>Track engagement rate, click-through rate, and conversion rate. Use UTM parameters to track which platforms drive sales. Adjust strategy based on data, not assumptions.</p>

<p>Consistency is key in social media marketing. Build a content calendar and stick to it for best results.</p>`,
      author: 'Mahreen Yousaf',
      category: 'Marketing',
      tags: ['social-media', 'marketing', 'Instagram', 'TikTok', 'Pinterest'],
      featuredImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=450&fit=crop&q=80',
      publishedAt: new Date('2025-11-28T09:00:00Z'),
      status: 'published',
    },
    // SEO-focused blog posts for traffic generation
    {
      title: 'How to Write Perfect eBay Titles That Sell (Free Tool Inside)',
      slug: 'perfect-ebay-titles-free-tool',
      excerpt: 'Master the art of eBay title optimization with our comprehensive guide. Includes a free AI-powered title generator tool.',
      content: `<p>Your eBay title is the single most important factor in whether buyers find your listing. With millions of items listed, standing out requires strategic keyword placement and understanding buyer search behavior.</p>

<h2>Why eBay Titles Matter</h2>
<p>eBay's Cassini search engine relies heavily on title keywords to match buyer searches. A well-optimized title can mean the difference between zero views and hundreds of impressions daily. Listings with optimized titles consistently outperform poorly titled items in search visibility.</p>

<h2>The Anatomy of a Perfect eBay Title</h2>
<p>You have 80 characters to work with. Here's the optimal structure:</p>
<ul>
<li><strong>Brand + Model</strong> (if applicable) — buyers often search by brand</li>
<li><strong>Key Product Type</strong> — what the item actually is</li>
<li><strong>Size/Dimensions</strong> — crucial for clothing, electronics, furniture</li>
<li><strong>Color</strong> — one of the most common filter criteria</li>
<li><strong>Condition</strong> — New, Used, Refurbished matters to buyers</li>
<li><strong>Unique Features</strong> — what makes this item special</li>
</ul>

<h2>Common Title Mistakes to Avoid</h2>
<p>Many sellers waste precious characters on words that don't help search:</p>
<ul>
<li><strong>Filler words:</strong> "wow", "amazing", "beautiful", "must see" — buyers don't search these</li>
<li><strong>Repetition:</strong> Don't repeat the same keyword in different forms</li>
<li><strong>All caps:</strong> HARDER TO READ and looks spammy</li>
<li><strong>Symbols:</strong> Special characters waste space and may confuse search</li>
</ul>

<h2>Keyword Research for eBay</h2>
<p>Before writing any title, research what buyers actually search:</p>
<ol>
<li>Use eBay's autocomplete — start typing and see suggestions</li>
<li>Check completed listings for similar items — what titles sold?</li>
<li>Look at Terapeak data if you have a Store subscription</li>
<li>Analyze competitor titles in your niche</li>
</ol>

<h2>Title Examples That Work</h2>
<p><strong>Good:</strong> Nike Air Jordan 1 Retro High OG Chicago Red White Black Leather Basketball Shoes Men Size 10</p>
<p><strong>Better:</strong> Nike Air Jordan 1 Retro High OG Chicago Colorway Men's Size 10 Red White Black Leather New In Box</p>
<p><strong>Bad:</strong> WOW AMAZING NIKE SHOES BASKETBALL JORDAN MUST SEE!!!</p>

<h2>Optimize Multiple Listings Fast</h2>
<p>If you manage dozens or hundreds of listings, optimizing titles manually takes forever. That's where automation helps.</p>

<div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 24px; margin: 24px 0;">
<h3 style="margin-top: 0;">🎯 Free Tool: eBay Title Generator</h3>
<p>Our free AI-powered <a href="/tools/seo-title-optimizer">SEO Title Optimizer</a> generates optimized eBay titles in seconds. Just enter your product details and get professionally crafted titles that follow all best practices.</p>
<p><a href="/tools/seo-title-optimizer" style="display: inline-block; background: var(--gradient-primary); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Try the Free Title Generator →</a></p>
</div>

<h2>A/B Testing Your Titles</h2>
<p>eBay allows you to test different titles through their Selling Manager Pro. Try variations and track which performs better over 30 days. Small improvements compound over time.</p>

<h2>Final Tips</h2>
<ul>
<li>Update titles seasonally when relevant (add "Christmas Gift" during holidays)</li>
<li>Monitor your sell-through rate — low rates may indicate title issues</li>
<li>Stay current with eBay's algorithm changes</li>
<li>Use all 80 characters — every character is an opportunity</li>
</ul>

<p>Investing time in title optimization pays dividends. Start today and watch your visibility improve!</p>`,
      author: 'Mahreen Yousaf',
      category: 'eBay',
      tags: ['ebay', 'titles', 'seo', 'optimization', 'free-tool'],
      featuredImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=450&fit=crop',
      publishedAt: new Date('2025-11-15T10:00:00Z'),
      status: 'published',
    },
    {
      title: 'Etsy Tags Guide: How to Get Found in Search (Free Generator)',
      slug: 'etsy-tags-guide-search-generator',
      excerpt: 'Complete guide to Etsy tag optimization. Learn how to choose the right tags, use all 13 slots effectively, and boost your shop visibility.',
      content: `<p>Etsy tags are one of the most powerful yet underutilized tools for shop visibility. With the right tag strategy, you can dramatically increase your appearance in Etsy search results and attract more qualified buyers.</p>

<h2>Understanding Etsy's Search Algorithm</h2>
<p>Etsy uses a combination of factors to rank listings, but tags play a foundational role. When a buyer searches, Etsy matches their query against your title, tags, categories, and attributes. Tags give you 13 additional opportunities to appear in search beyond your title.</p>

<h2>The 13 Tag Golden Rules</h2>
<p>Every listing gets exactly 13 tags. Each tag can be up to 20 characters. Here's how to maximize them:</p>
<ol>
<li><strong>Use ALL 13 tags</strong> — unused tags are missed opportunities</li>
<li><strong>Multi-word tags are better</strong> — "silver ring" beats "silver" alone</li>
<li><strong>No duplicates</strong> — repeating words wastes slots</li>
<li><strong>Mix broad and specific</strong> — balance high-volume and niche terms</li>
<li><strong>Think like a buyer</strong> — what would THEY type to find your item?</li>
</ol>

<h2>Tag Research Methods</h2>
<p>Finding the right tags requires research:</p>
<ul>
<li><strong>Etsy search bar:</strong> Type your main keyword and note autocomplete suggestions</li>
<li><strong>eRank or Marmalead:</strong> Free/paid tools showing search volume and competition</li>
<li><strong>Competitor analysis:</strong> What tags do top-ranking shops use?</li>
<li><strong>Etsy Ads data:</strong> If running ads, check which search terms convert</li>
</ul>

<h2>Tag Categories to Cover</h2>
<p>Diversify your tags across these categories:</p>
<ul>
<li><strong>What it is:</strong> necklace, ring, bracelet, earrings</li>
<li><strong>Material:</strong> sterling silver, gold plated, natural stone</li>
<li><strong>Style:</strong> bohemian, minimalist, vintage, modern</li>
<li><strong>Occasion:</strong> wedding, birthday gift, anniversary</li>
<li><strong>Recipient:</strong> gift for her, bridesmaid gift, mom gift</li>
<li><strong>Technique:</strong> handmade, handcrafted, custom</li>
</ul>

<h2>Seasonal Tag Strategy</h2>
<p>Rotate tags seasonally to capture trending searches:</p>
<ul>
<li><strong>Q1:</strong> valentine gift, new year resolution, spring collection</li>
<li><strong>Q2:</strong> mothers day gift, graduation gift, summer jewelry</li>
<li><strong>Q3:</strong> back to school, fall fashion, halloween costume</li>
<li><strong>Q4:</strong> christmas gift, holiday present, stocking stuffer</li>
</ul>

<div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 24px; margin: 24px 0;">
<h3 style="margin-top: 0;">🏷️ Free Tool: Etsy Tag Generator</h3>
<p>Stop guessing tags! Our free <a href="/tools/hashtag-generator">Hashtag & Tag Generator</a> creates optimized tag sets specifically for Etsy sellers. Enter your product type and get 13 perfectly crafted tags instantly.</p>
<p><a href="/tools/hashtag-generator" style="display: inline-block; background: var(--gradient-primary); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Generate Free Etsy Tags →</a></p>
</div>

<h2>Tracking Tag Performance</h2>
<p>Use Etsy Stats to see which search terms bring traffic. If certain tags aren't performing after 30 days, swap them out. Tag optimization is ongoing — test, measure, refine.</p>

<h2>Common Tag Mistakes</h2>
<ul>
<li>Using single words instead of phrases ("gift" vs "birthday gift")</li>
<li>Repeating words from your title unnecessarily</li>
<li>Using irrelevant tags hoping for exposure</li>
<li>Never updating tags based on performance data</li>
</ul>

<p>Tags are your secret weapon for Etsy success. Optimize them consistently and watch your shop grow!</p>`,
      author: 'Mahreen Yousaf',
      category: 'Etsy',
      tags: ['etsy', 'tags', 'seo', 'search', 'generator'],
      featuredImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&h=450&fit=crop',
      publishedAt: new Date('2025-11-01T09:00:00Z'),
      status: 'published',
    },
    {
      title: 'Shopify Product Descriptions That Convert — AI Writing Guide',
      slug: 'shopify-product-descriptions-convert-ai',
      excerpt: 'Learn to write Shopify product descriptions that turn browsers into buyers. Plus, discover how AI tools can speed up your copywriting.',
      content: `<p>Your product description is where interest becomes intent. A great description doesn't just inform — it persuades. In this guide, we'll break down exactly how to write Shopify descriptions that convert, plus share a free AI tool to accelerate your process.</p>

<h2>The Psychology of Product Descriptions</h2>
<p>Buyers read descriptions to answer three questions:</p>
<ul>
<li><strong>Is this what I'm looking for?</strong> — Match their mental image</li>
<li><strong>Will it solve my problem?</strong> — Connect features to benefits</li>
<li><strong>Can I trust this seller?</strong> — Professional copy builds credibility</li>
</ul>

<h2>Structure of a Converting Description</h2>
<p>Follow this proven framework:</p>
<ol>
<li><strong>Hook (first 2 lines):</strong> Lead with the biggest benefit. This is all most mobile shoppers read.</li>
<li><strong>Features → Benefits:</strong> Don't just list specs. Explain WHY each feature matters.</li>
<li><strong>Social proof:</strong> Mention popularity, reviews, or celebrity endorsements if applicable.</li>
<li><strong>Details section:</strong> Materials, dimensions, care instructions — the practical stuff.</li>
<li><strong>CTA reinforcement:</strong> Remind them why they should buy NOW.</li>
</ol>

<h2>Writing for Different Product Types</h2>
<p><strong>Fashion:</strong> Focus on fit, fabric feel, styling suggestions, and occasion appropriateness.</p>
<p><strong>Electronics:</strong> Lead with specs but translate them to real-world benefits. "8-hour battery" means "lasts your entire workday."</p>
<p><strong>Home goods:</strong> Help buyers visualize the item in their space. Describe the mood and atmosphere it creates.</p>
<p><strong>Beauty:</strong> Emphasize ingredients, skin type suitability, and expected results timeline.</p>

<h2>SEO Optimization for Shopify</h2>
<p>Shopify descriptions also serve as SEO content:</p>
<ul>
<li>Naturally include your target keyword 2-3 times</li>
<li>Use related keywords and synonyms throughout</li>
<li>Include long-tail keywords in subheadings</li>
<li>Write unique descriptions — never copy manufacturer copy</li>
</ul>

<h2>Formatting for Readability</h2>
<p>Online readers scan, they don't read word-by-word:</p>
<ul>
<li>Use bullet points for features and specs</li>
<li>Keep paragraphs short (2-3 sentences max)</li>
<li>Add subheadings to break up longer descriptions</li>
<li>Use bold for key selling points</li>
</ul>

<div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 24px; margin: 24px 0;">
<h3 style="margin-top: 0;">✨ Free Tool: Product Description Generator</h3>
<p>Writing descriptions for hundreds of products? Our free <a href="/tools/product-description-generator">AI Product Description Generator</a> creates compelling, SEO-optimized descriptions in seconds. Choose your tone, platform, and let AI handle the rest.</p>
<p><a href="/tools/product-description-generator" style="display: inline-block; background: var(--gradient-primary); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Generate Free Descriptions →</a></p>
</div>

<h2>A/B Testing Descriptions</h2>
<p>Shopify apps like Neat A/B Testing let you test different description versions. Track which version drives more add-to-carts and purchases. Even small conversion improvements compound significantly over time.</p>

<h2>Mobile-First Writing</h2>
<p>Over 70% of Shopify traffic is mobile. Your first 100 characters matter most — make them count. Put your strongest selling point in the opening line, not buried in paragraph three.</p>

<p>Great descriptions are an investment, not an expense. Every percentage point improvement in conversion rate directly impacts your bottom line. Start optimizing today!</p>`,
      author: 'Mahreen Yousaf',
      category: 'Shopify',
      tags: ['shopify', 'product-descriptions', 'copywriting', 'ai', 'conversion'],
      featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
      publishedAt: new Date('2025-10-20T08:30:00Z'),
      status: 'published',
    },
    {
      title: 'The Complete Seller SEO Checklist for 2026',
      slug: 'complete-seller-seo-checklist-2026',
      excerpt: 'Your comprehensive SEO checklist for eBay, Etsy, and Shopify sellers. Covers everything from keyword research to listing optimization.',
      content: `<p>Search engine optimization isn't just for websites — marketplace sellers need SEO too. Whether you sell on eBay, Etsy, Shopify, or all three, this checklist ensures you're not leaving money on the table.</p>

<h2>Keyword Research Foundation</h2>
<p>Before optimizing anything, understand what buyers search:</p>
<ul>
<li>☐ Research primary keywords using platform autocomplete</li>
<li>☐ Identify 5-10 long-tail keywords per product</li>
<li>☐ Analyze competitor keywords in your niche</li>
<li>☐ Check seasonal keyword trends</li>
<li>☐ Document search volume estimates where available</li>
</ul>

<h2>Title Optimization</h2>
<p>Your title is your #1 ranking factor:</p>
<ul>
<li>☐ Include primary keyword in first 30 characters</li>
<li>☐ Use maximum allowed characters (80 eBay, 140 Etsy)</li>
<li>☐ Front-load most important keywords</li>
<li>☐ Include brand, model, size, color, condition</li>
<li>☐ Remove filler words and unnecessary punctuation</li>
</ul>

<h2>Images & Visual SEO</h2>
<p>Images influence both rankings and conversions:</p>
<ul>
<li>☐ Use high-resolution images (minimum 1000px)</li>
<li>☐ White/clean background for main photo</li>
<li>☐ Multiple angles (minimum 6 photos)</li>
<li>☐ Include lifestyle/context shots</li>
<li>☐ Optimize file names with keywords before upload</li>
<li>☐ Add alt text on Shopify stores</li>
</ul>

<h2>Description Optimization</h2>
<p>Descriptions support both search and conversion:</p>
<ul>
<li>☐ Natural keyword integration (2-3 times minimum)</li>
<li>☐ Answer common buyer questions</li>
<li>☐ Include measurements and specifications</li>
<li>☐ Use bullet points for scannability</li>
<li>☐ Unique content — never duplicate manufacturer descriptions</li>
</ul>

<h2>Technical SEO (Shopify Specific)</h2>
<ul>
<li>☐ Custom URL handles with keywords</li>
<li>☐ Meta title and description optimized</li>
<li>☐ Schema markup for products</li>
<li>☐ Site speed optimized (compress images, minimal apps)</li>
<li>☐ Mobile responsive design verified</li>
</ul>

<h2>Ongoing Maintenance</h2>
<ul>
<li>☐ Review analytics monthly for underperforming listings</li>
<li>☐ Update seasonal keywords quarterly</li>
<li>☐ Monitor competitor changes</li>
<li>☐ Test new keyword combinations</li>
<li>☐ Refresh stale listings with updated copy</li>
</ul>

<div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 24px; margin: 24px 0;">
<h3 style="margin-top: 0;">📋 Download the Full Checklist</h3>
<p>Get our complete printable Seller SEO Checklist with all items organized by platform. Plus access our free AI tools to automate many of these optimization tasks.</p>
<p><a href="/resources" style="display: inline-block; background: var(--gradient-primary); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Download Free Resources →</a></p>
</div>

<p>SEO is a marathon, not a sprint. Consistent optimization compounds over time. Bookmark this checklist and review it monthly to stay competitive!</p>`,
      author: 'Mahreen Yousaf',
      category: 'SEO',
      tags: ['seo', 'checklist', 'ebay', 'etsy', 'shopify', 'optimization'],
      featuredImage: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=450&fit=crop',
      publishedAt: new Date('2025-10-10T09:00:00Z'),
      status: 'published',
    },
    {
      title: '5 Free AI Tools Every Online Seller Should Use',
      slug: '5-free-ai-tools-online-sellers',
      excerpt: 'Discover five powerful AI tools that can transform your e-commerce business — all completely free. From product descriptions to price optimization.',
      content: `<p>AI has democratized tools that previously required expensive consultants or agencies. Today, any online seller can leverage artificial intelligence to compete with larger businesses. Here are five essential AI tools that are completely free.</p>

<h2>1. Product Description Generator</h2>
<p>Writing unique, compelling descriptions for hundreds of products is exhausting. Our <a href="/tools/product-description-generator">Product Description Generator</a> creates SEO-optimized descriptions tailored to your platform (Shopify, eBay, Etsy) in seconds.</p>
<p><strong>Best for:</strong> Sellers with large catalogs who need consistent, professional copy.</p>
<p><strong>Time saved:</strong> Reduce the time spent writing each product description significantly.</p>

<h2>2. SEO Title Optimizer</h2>
<p>Titles determine whether buyers find your listing at all. The <a href="/tools/seo-title-optimizer">SEO Title Optimizer</a> analyzes your product and generates titles that maximize search visibility across all major marketplaces.</p>
<p><strong>Best for:</strong> New sellers learning SEO, or experienced sellers scaling up.</p>
<p><strong>Impact:</strong> Optimized titles can significantly improve your search visibility and click-through rates.</p>

<h2>3. Hashtag & Tag Generator</h2>
<p>Social media hashtags and marketplace tags are essential for discoverability. Our <a href="/tools/hashtag-generator">Hashtag Generator</a> creates optimized tag sets based on your product niche and target audience.</p>
<p><strong>Best for:</strong> Instagram sellers, Etsy artisans, TikTok creators.</p>
<p><strong>Benefit:</strong> Reach new audiences without paid advertising.</p>

<h2>4. Price Calculator</h2>
<p>Pricing too high loses sales; pricing too low kills profits. The <a href="/tools/profit-calculator">Profit Calculator</a> factors in costs, platform fees, shipping, and target margins to recommend optimal pricing.</p>
<p><strong>Best for:</strong> New sellers unsure about pricing, or anyone wanting to verify margins.</p>
<p><strong>ROI:</strong> Correct pricing helps ensure healthy profit margins on every sale.</p>

<h2>5. Competitor Analyzer</h2>
<p>Understanding your competition is crucial but time-consuming. The <a href="/tools/competitor-analyzer">Competitor Analyzer</a> provides insights into competitor pricing, keywords, and listing quality so you can identify opportunities.</p>
<p><strong>Best for:</strong> Sellers entering competitive markets or launching new products.</p>
<p><strong>Advantage:</strong> Make data-driven decisions instead of guessing.</p>

<h2>How to Get Started</h2>
<p>All five tools are available in our <a href="/ai-tools">Free AI Tools section</a>. No account required, no credit card, no limits. Simply visit the tool page and start generating results immediately.</p>

<div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 24px; margin: 24px 0;">
<h3 style="margin-top: 0;">🚀 Explore All Free AI Tools</h3>
<p>Ready to supercharge your e-commerce business? Browse our complete collection of free AI tools designed specifically for online sellers.</p>
<p><a href="/ai-tools" style="display: inline-block; background: var(--gradient-primary); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Browse All Free Tools →</a></p>
</div>

<h2>The Future of E-commerce is AI-Assisted</h2>
<p>These tools represent just the beginning. As AI technology advances, expect even more sophisticated capabilities. The sellers who adopt early gain competitive advantages that compound over time.</p>

<p>Don't wait for competitors to figure this out. Start using these free tools today and watch your business grow!</p>`,
      author: 'Mahreen Yousaf',
      category: 'AI Tools',
      tags: ['ai-tools', 'free', 'ecommerce', 'automation', 'productivity'],
      featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
      publishedAt: new Date('2025-10-01T10:00:00Z'),
      status: 'published',
    },
  ];

  for (const post of blogPosts) {
    await BlogPost.findOneAndUpdate(
      { slug: post.slug },
      { $set: post },
      { upsert: true, new: true },
    );
  }
  console.log(`[SEED] Upserted ${blogPosts.length} original blog posts`);

  // Seed additional blog posts (idempotent via upsert by slug)
  const additionalBlogPosts = [
    {
      title: 'AI-Powered Digital Marketing: How Artificial Intelligence is Transforming Business Growth',
      slug: 'ai-powered-digital-marketing-business-growth',
      excerpt: 'Discover how AI is revolutionizing digital marketing strategies and learn practical ways to leverage artificial intelligence for sustainable business growth.',
      content: `<p>Artificial intelligence is no longer a futuristic concept — it's actively reshaping how businesses attract, engage, and convert customers. From automated ad targeting to predictive analytics, AI-powered digital marketing is transforming every stage of the customer journey. In this guide, we'll explore the most impactful AI applications and how your business can start leveraging them today.</p>

<h2>How AI is Changing Digital Marketing</h2>
<p>The digital marketing landscape has evolved dramatically. AI algorithms now process billions of data points in real time, enabling marketers to make decisions that were previously impossible. Here are the key areas where AI is making the biggest impact:</p>
<ul>
<li><strong>Predictive Analytics:</strong> AI models analyze historical data to forecast customer behavior, helping you allocate budgets more effectively and anticipate market trends before competitors.</li>
<li><strong>Personalization at Scale:</strong> Machine learning algorithms deliver personalized content, product recommendations, and email campaigns to thousands of customers simultaneously — something no human team could manage manually.</li>
<li><strong>Automated Ad Optimization:</strong> Platforms like Google Ads and Meta use AI to automatically adjust bids, audiences, and creative elements to maximize ROI without constant manual intervention.</li>
<li><strong>Chatbots and Conversational AI:</strong> AI-powered chatbots handle customer inquiries 24/7, qualify leads, and even complete sales — reducing response times from hours to seconds.</li>
</ul>

<h2>Practical AI Applications for Your Business</h2>
<p>You don't need a massive budget to benefit from AI. Here are actionable ways to integrate AI into your marketing strategy right now:</p>

<h3>Content Creation and Optimization</h3>
<p>AI writing assistants help generate blog posts, social media captions, email subject lines, and product descriptions in minutes. Tools powered by large language models can produce first drafts that your team then refines, significantly reducing content production time. At MG Blessed Beginnings, we use AI-enhanced workflows to create SEO-optimized content that ranks on Google while maintaining authentic brand voice.</p>

<h3>Audience Segmentation and Targeting</h3>
<p>Traditional segmentation relies on broad demographics. AI enables behavioral segmentation based on actual user actions — browsing patterns, purchase history, engagement levels, and predicted lifetime value. This precision targeting means your ad spend reaches people who are genuinely likely to convert, not just those who fit a demographic profile.</p>

<h3>Email Marketing Automation</h3>
<p>AI transforms email marketing from batch-and-blast to hyper-personalized communication:</p>
<ul>
<li>Send-time optimization predicts when each subscriber is most likely to open emails</li>
<li>Subject line testing uses AI to identify which phrasing drives the highest open rates</li>
<li>Dynamic content blocks change based on individual user preferences and behavior</li>
<li>Churn prediction identifies at-risk customers before they unsubscribe</li>
</ul>

<h3>Social Media Management</h3>
<p>AI tools analyze engagement patterns across platforms to determine optimal posting times, suggest trending topics, and even generate visual content. Sentiment analysis monitors brand mentions in real time, alerting you to potential PR issues before they escalate.</p>

<h2>Measuring AI Marketing ROI</h2>
<p>Implementing AI isn't enough — you need to measure its impact. Track these KPIs to evaluate your AI marketing initiatives:</p>
<ul>
<li><strong>Conversion Rate Improvement:</strong> Compare conversion rates before and after AI implementation</li>
<li><strong>Cost Per Acquisition (CPA):</strong> AI should lower your CPA through better targeting</li>
<li><strong>Customer Lifetime Value (CLV):</strong> Personalization should increase repeat purchases</li>
<li><strong>Time Savings:</strong> Quantify hours saved through automation and redirect to strategic work</li>
<li><strong>Revenue Attribution:</strong> Use multi-touch attribution to understand AI's contribution across channels</li>
</ul>

<h2>Common Pitfalls to Avoid</h2>
<p>AI marketing isn't a magic bullet. Avoid these common mistakes:</p>
<ul>
<li><strong>Over-reliance on automation:</strong> AI augments human creativity, it doesn't replace it. Always review AI-generated content for accuracy and brand alignment.</li>
<li><strong>Ignoring data quality:</strong> AI models are only as good as their training data. Garbage in, garbage out. Invest in clean, structured data collection.</li>
<li><strong>Neglecting privacy compliance:</strong> Ensure your AI practices comply with GDPR, CCPA, and other regulations. Transparency builds trust.</li>
<li><strong>Expecting instant results:</strong> AI systems need time to learn and optimize. Set realistic timelines of 3-6 months for meaningful results.</li>
</ul>

<h2>The Future of AI in Digital Marketing</h2>
<p>Looking ahead, expect AI to become even more integrated into marketing workflows. Voice search optimization, AI-generated video content, and autonomous campaign management are all emerging trends. Businesses that adopt AI early gain compounding advantages — their models get smarter with more data, their processes become more efficient, and their competitive moat widens over time.</p>

<p>At MG Blessed Beginnings, we specialize in helping businesses harness AI for measurable growth. Whether you're just starting your AI journey or looking to optimize existing campaigns, our team combines cutting-edge technology with proven marketing strategy to deliver results that matter.</p>`,
      author: 'Mahreen Yousaf',
      category: 'AI Marketing',
      tags: ['ai', 'digital-marketing', 'automation', 'business-growth'],
      featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
      publishedAt: new Date('2026-01-15T09:00:00Z'),
      status: 'published',
    },
    {
      title: 'What is AEO (Answer Engine Optimization) and Why Your Business Needs It',
      slug: 'aeo-answer-engine-optimization-guide',
      excerpt: 'Answer Engine Optimization is the next evolution of SEO. Learn what AEO is, how it differs from traditional SEO, and why optimizing for AI answer engines is critical for visibility.',
      content: `<p>Search is changing fundamentally. Instead of clicking through links, users increasingly get direct answers from AI-powered platforms like ChatGPT, Google's AI Overviews, Perplexity, and voice assistants. Answer Engine Optimization (AEO) is the practice of optimizing your content so it gets selected as the source for these AI-generated answers. If you're not optimizing for AEO, you're becoming invisible to a growing segment of searchers.</p>

<h2>What Exactly is AEO?</h2>
<p>Answer Engine Optimization focuses on structuring content so that AI systems can easily extract, understand, and cite your information when generating answers. Unlike traditional SEO, which optimizes for ranking positions in a list of links, AEO optimizes for being <em>the</em> answer itself.</p>
<p>Key differences between AEO and traditional SEO:</p>
<ul>
<li><strong>Traditional SEO:</strong> Optimize for blue links, aim for position 1, drive clicks to your website</li>
<li><strong>AEO:</strong> Optimize for AI citation, aim to be the referenced source, earn brand mentions within AI answers</li>
</ul>

<h2>Why AEO Matters Right Now</h2>
<p>The shift toward AI-generated answers is accelerating rapidly:</p>
<ul>
<li>Google AI Overviews appear in over 60% of searches, often eliminating the need to click any result</li>
<li>ChatGPT handles over 200 million queries per week, many of which are commercial research questions</li>
<li>Voice search through Siri, Alexa, and Google Assistant reads aloud a single answer — there's no "page two"</li>
<li>Perplexity AI and similar tools are gaining market share among researchers and professionals</li>
</ul>
<p>If your content isn't structured for AI consumption, these platforms will cite your competitors instead.</p>

<h2>Core AEO Strategies</h2>

<h3>1. Structure Content for Machine Readability</h3>
<p>AI systems parse HTML structure to understand content hierarchy. Optimize your markup:</p>
<ul>
<li>Use clear H2/H3 headings that directly state the question being answered</li>
<li>Provide concise, direct answers immediately after headings (within 40-60 words)</li>
<li>Use ordered and unordered lists for step-by-step processes and comparisons</li>
<li>Implement FAQ schema markup to explicitly signal Q&A content to machines</li>
<li>Add structured data (JSON-LD) for products, services, organizations, and articles</li>
</ul>

<h3>2. Write Authoritative, Factual Content</h3>
<p>AI answer engines prioritize sources that demonstrate expertise and trustworthiness:</p>
<ul>
<li>Cite statistics with sources and publication dates</li>
<li>Include author credentials and E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness)</li>
<li>Avoid vague claims — use specific numbers, examples, and case studies</li>
<li>Keep content updated — AI systems favor recently verified information</li>
<li>Build topical authority by covering a subject comprehensively across multiple pages</li>
</ul>

<h3>3. Target Question-Based Queries</h3>
<p>AI answer engines primarily respond to natural language questions. Research and target these query types:</p>
<ul>
<li>"What is..." definitions and explanations</li>
<li>"How to..." step-by-step guides</li>
<li>"Best..." comparison and recommendation queries</li>
<li>"Why does..." causal explanations</li>
<li>"Difference between..." contrast queries</li>
</ul>
<p>Use tools like AlsoAsked, AnswerThePublic, and Google's People Also Ask to discover the exact questions your audience asks.</p>

<h3>4. Optimize for Conversational Language</h3>
<p>AI queries are conversational, not keyword-stuffed. Match this tone in your content:</p>
<ul>
<li>Write in natural, accessible language rather than jargon-heavy prose</li>
<li>Mirror the way real people phrase questions about your topic</li>
<li>Include transitional phrases that help AI understand logical flow</li>
<li>Provide context that helps AI place your answer within a broader knowledge framework</li>
</ul>

<h2>AEO for E-commerce Businesses</h2>
<p>If you sell products online, AEO takes on additional dimensions:</p>
<ul>
<li>Optimize product pages with detailed specifications, comparisons, and use cases</li>
<li>Create buying guides that answer "which is best" questions in your niche</li>
<li>Build FAQ sections addressing pre-purchase concerns (shipping, returns, sizing, compatibility)</li>
<li>Ensure pricing, availability, and shipping information is structured and current</li>
<li>Encourage and showcase genuine customer reviews — AI values social proof signals</li>
</ul>

<h2>Measuring AEO Success</h2>
<p>Traditional metrics like organic traffic may decline as AI absorbs clicks. Track these AEO-specific indicators instead:</p>
<ul>
<li><strong>Brand mentions in AI answers:</strong> Monitor how often your brand is cited in ChatGPT, Perplexity, and AI Overviews</li>
<li><strong>Referral traffic from AI platforms:</strong> Some AI answers include source links — track these referrals</li>
<li><strong>Branded search volume:</strong> Effective AEO increases brand awareness, driving more branded searches</li>
<li><strong>Share of voice:</strong> Measure your citation frequency relative to competitors for key queries</li>
</ul>

<h2>Getting Started with AEO</h2>
<p>AEO isn't a replacement for traditional SEO — it's an extension. Start by auditing your top-performing content and restructuring it for AI readability. Prioritize pages that answer high-value commercial questions. Add structured data where missing. And remember: the best AEO strategy is creating genuinely helpful, authoritative content that deserves to be cited.</p>

<p>MG Blessed Beginnings offers comprehensive AEO audits and optimization services. We analyze your content's AI-readiness, restructure key pages for answer engine visibility, and implement ongoing monitoring to ensure your brand stays cited as AI search evolves.</p>`,
      author: 'Mahreen Yousaf',
      category: 'SEO',
      tags: ['aeo', 'seo', 'ai-search', 'voice-search', 'optimization'],
      featuredImage: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=450&fit=crop',
      publishedAt: new Date('2026-01-08T10:00:00Z'),
      status: 'published',
    },
    {
      title: 'GEO (Generative Engine Optimization): The Future of Search Visibility',
      slug: 'geo-generative-engine-optimization-future-search',
      excerpt: 'Generative Engine Optimization ensures your content appears in AI-generated responses from ChatGPT, Gemini, and Perplexity. Learn the strategies that drive visibility in the new search era.',
      content: `<p>The way people find information is undergoing a seismic shift. Generative AI engines like ChatGPT, Google Gemini, Claude, and Perplexity are replacing traditional search for millions of users daily. These platforms synthesize information from multiple sources into coherent answers — and if your content isn't optimized for generative engines, you simply won't appear. GEO (Generative Engine Optimization) is the discipline of ensuring your brand and content are visible, cited, and recommended within AI-generated responses.</p>

<h2>GEO vs. SEO vs. AEO: Understanding the Differences</h2>
<p>While related, these three disciplines serve different purposes:</p>
<ul>
<li><strong>SEO (Search Engine Optimization):</strong> Optimizing for traditional search engine results pages with ranked blue links</li>
<li><strong>AEO (Answer Engine Optimization):</strong> Structuring content to be selected as direct answers in featured snippets and voice search</li>
<li><strong>GEO (Generative Engine Optimization):</strong> Optimizing content to be cited, referenced, and recommended within AI-generated synthetic responses</li>
</ul>
<p>GEO encompasses elements of both SEO and AEO but adds unique considerations specific to how large language models process, weight, and synthesize information.</p>

<h2>How Generative Engines Select Sources</h2>
<p>Understanding the selection mechanism is crucial for optimization. Generative engines evaluate content based on:</p>
<ul>
<li><strong>Topical Authority:</strong> Does the source consistently cover this subject area? Depth and breadth of coverage matter more than individual page quality.</li>
<li><strong>Factual Accuracy:</strong> Can claims be cross-referenced and verified? LLMs cross-check information across multiple sources before citing.</li>
<li><strong>Recency and Freshness:</strong> Is the information current? Many generative engines weight recently published or updated content higher.</li>
<li><strong>Citation Networks:</strong> Does the source reference reputable third-party sources? Content that cites studies, official data, and expert opinions is trusted more.</li>
<li><strong>User Engagement Signals:</strong> Do real users find this content valuable? Click-through rates, dwell time, and return visits still influence AI source selection.</li>
</ul>

<h2>Core GEO Strategies</h2>

<h3>1. Build Topical Authority Through Content Clusters</h3>
<p>Generative engines assess your entire site's authority on a topic, not just individual pages. Create comprehensive content clusters:</p>
<ul>
<li>Identify 5-10 pillar topics relevant to your business</li>
<li>Create in-depth pillar pages (3,000+ words) covering each topic comprehensively</li>
<li>Support pillars with 10-20 cluster articles addressing subtopics and long-tail queries</li>
<li>Interlink cluster content extensively to reinforce topical relationships</li>
<li>Update pillar content quarterly to maintain freshness signals</li>
</ul>

<h3>2. Optimize Content Structure for LLM Parsing</h3>
<p>Large language models parse content differently than traditional crawlers:</p>
<ul>
<li>Lead each section with a clear, declarative statement that directly answers a potential query</li>
<li>Use consistent heading hierarchies — H2 for main topics, H3 for subtopics</li>
<li>Include summary paragraphs at the beginning of long-form content</li>
<li>Structure comparisons as tables or clearly delineated sections</li>
<li>Define terms explicitly — don't assume the model knows your industry jargon</li>
</ul>

<h3>3. Establish Credibility Signals</h3>
<p>Generative engines heavily weight trust signals when selecting sources:</p>
<ul>
<li>Display author bios with verifiable credentials and experience</li>
<li>Cite primary sources, studies, and official statistics with links</li>
<li>Include publication and last-updated dates prominently</li>
<li>Showcase professional affiliations, certifications, and awards</li>
<li>Maintain accurate About, Contact, and Policy pages — these are trust signals</li>
</ul>

<h3>4. Optimize for Specific AI Platforms</h3>
<p>Different generative engines have different source preferences:</p>
<ul>
<li><strong>ChatGPT:</strong> Favors well-established domains with strong backlink profiles and comprehensive coverage</li>
<li><strong>Google Gemini:</strong> Prioritizes content already ranking well in Google Search, especially with structured data</li>
<li><strong>Perplexity:</strong> Values recent, well-cited content with clear source attribution</li>
<li><strong>Claude:</strong> Emphasizes nuanced, well-reasoned content with balanced perspectives</li>
</ul>

<h2>GEO for Service-Based Businesses</h2>
<p>If you offer services (consulting, marketing, design), GEO requires specific tactics:</p>
<ul>
<li>Create detailed service pages that explain methodologies, processes, and expected outcomes</li>
<li>Publish case studies with specific metrics and results</li>
<li>Develop thought leadership content — opinion pieces backed by data and experience</li>
<li>Build a resource library of tools, templates, and guides that demonstrate expertise</li>
<li>Encourage client testimonials and reviews on third-party platforms (these are crawled by AI engines)</li>
</ul>

<h2>Tracking GEO Performance</h2>
<p>Since generative engines don't provide traditional analytics, use these measurement approaches:</p>
<ul>
<li><strong>Manual querying:</strong> Regularly test key queries across ChatGPT, Gemini, and Perplexity to check if your content is cited</li>
<li><strong>Brand mention monitoring:</strong> Track unlinked brand mentions across AI platforms using monitoring tools</li>
<li><strong>Referral analytics:</strong> Monitor traffic from AI platform referral sources in your web analytics</li>
<li><strong>Competitive benchmarking:</strong> Query the same terms and compare your citation rate against competitors</li>
</ul>

<h2>The Competitive Advantage of Early Adoption</h2>
<p>GEO is still an emerging discipline. Most businesses haven't started optimizing for generative engines yet, which means early movers have an outsized opportunity to establish dominance. As AI-generated search continues to grow — some projections suggest it will account for 30% of all search interactions within two years — the businesses that invest in GEO now will build insurmountable authority advantages.</p>

<p>MG Blessed Beginnings provides end-to-end GEO services including content audits, authority-building strategies, and ongoing monitoring across major generative platforms. Position your brand as a go-to source in the AI search era.</p>`,
      author: 'Mahreen Yousaf',
      category: 'SEO',
      tags: ['geo', 'generative-ai', 'search-visibility', 'chatgpt', 'gemini'],
      featuredImage: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=450&fit=crop',
      publishedAt: new Date('2025-12-28T11:00:00Z'),
      status: 'published',
    },
    {
      title: 'How to Build a Profitable E-commerce Business Using AI Tools',
      slug: 'profitable-ecommerce-business-ai-tools',
      excerpt: 'Learn how to leverage AI tools at every stage of your e-commerce journey — from product research and store setup to marketing automation and customer retention.',
      content: `<p>Building a profitable e-commerce business used to require a large team, significant capital, and years of trial and error. AI tools have fundamentally changed this equation. Today, a single entrepreneur equipped with the right AI stack can accomplish what previously required a full marketing department. This guide walks through exactly how to use AI tools at every stage of building and scaling a profitable online store.</p>

<h2>Stage 1: Product Research and Validation</h2>
<p>The most common reason e-commerce businesses fail is choosing the wrong product. AI eliminates guesswork from product research:</p>
<ul>
<li><strong>Trend Analysis:</strong> AI tools analyze social media conversations, search trends, and marketplace data to identify emerging product opportunities before they peak</li>
<li><strong>Competitor Intelligence:</strong> AI scrapes competitor stores to reveal their best-selling products, pricing strategies, and customer pain points</li>
<li><strong>Demand Forecasting:</strong> Predictive models estimate market size and growth trajectory for potential niches</li>
<li><strong>Review Mining:</strong> AI analyzes thousands of competitor reviews to identify product improvement opportunities — what customers love and what frustrates them</li>
</ul>
<p>Instead of spending weeks researching manually, AI compresses product validation into hours with data-driven confidence.</p>

<h2>Stage 2: Store Setup and Design</h2>
<p>AI accelerates every aspect of store creation:</p>
<ul>
<li><strong>Product Descriptions:</strong> Generate unique, SEO-optimized descriptions for hundreds of products in minutes using AI writing tools. Customize tone and format for your brand voice.</li>
<li><strong>Store Copy:</strong> AI generates homepage headlines, about page narratives, policy pages, and email opt-in copy that converts</li>
<li><strong>Visual Content:</strong> AI image generators create lifestyle product photos, banner images, and social media graphics without expensive photo shoots</li>
<li><strong>Category Organization:</strong> AI analyzes your product catalog and suggests optimal navigation structures and categorization</li>
</ul>

<h2>Stage 3: Marketing and Traffic Generation</h2>
<p>This is where AI delivers the most dramatic efficiency gains:</p>

<h3>Paid Advertising</h3>
<ul>
<li>AI generates dozens of ad copy variations for split testing in minutes</li>
<li>Automated bidding algorithms optimize spend across campaigns in real time</li>
<li>AI creates lookalike audiences based on your best customers' characteristics</li>
<li>Creative generation tools produce ad visuals and videos at scale</li>
</ul>

<h3>Search Engine Optimization</h3>
<ul>
<li>AI conducts keyword research, identifies content gaps, and suggests blog topics</li>
<li>Content generation tools create SEO-optimized articles that rank on Google</li>
<li>Technical SEO audits powered by AI identify and prioritize fixes</li>
<li>AI optimizes meta titles, descriptions, and internal linking structures</li>
</ul>

<h3>Email and SMS Marketing</h3>
<ul>
<li>AI segments your audience based on behavior and predicts optimal send times</li>
<li>Personalized email content adapts to each recipient's preferences and purchase history</li>
<li>Abandoned cart sequences use AI to determine the best incentive for each customer</li>
<li>Predictive analytics identify customers likely to churn before they leave</li>
</ul>

<h2>Stage 4: Operations and Customer Service</h2>
<p>Profitability depends on keeping operational costs low as you scale:</p>
<ul>
<li><strong>AI Chatbots:</strong> Handle 70-80% of customer inquiries automatically — order tracking, returns, product questions — freeing your time for complex issues</li>
<li><strong>Inventory Management:</strong> AI predicts demand fluctuations and recommends reorder quantities, preventing stockouts and overstock</li>
<li><strong>Pricing Optimization:</strong> Dynamic pricing algorithms adjust prices based on demand, competition, and inventory levels to maximize margins</li>
<li><strong>Fraud Detection:</strong> AI identifies suspicious orders before they ship, reducing chargebacks and losses</li>
</ul>

<h2>Stage 5: Analytics and Growth Optimization</h2>
<p>AI transforms raw data into actionable insights:</p>
<ul>
<li><strong>Attribution Modeling:</strong> AI accurately attributes revenue across touchpoints, revealing which channels truly drive sales</li>
<li><strong>Customer Lifetime Value Prediction:</strong> Identify your most valuable customer segments and double down on acquiring similar ones</li>
<li><strong>A/B Testing at Scale:</strong> AI runs multivariate tests across your store, automatically implementing winning variations</li>
<li><strong>Anomaly Detection:</strong> Get alerted immediately when metrics deviate from normal patterns — catch problems before they compound</li>
</ul>

<h2>Essential AI Tool Stack for E-commerce</h2>
<p>Here's a practical starting stack that covers the essentials without breaking the bank:</p>
<ul>
<li><strong>Content:</strong> AI writing assistant for product descriptions and blog posts</li>
<li><strong>SEO:</strong> AI-powered keyword research and optimization tool</li>
<li><strong>Ads:</strong> Platform-native AI (Google Smart Bidding, Meta Advantage+) plus creative generation</li>
<li><strong>Email:</strong> Klaviyo or Omnisend with AI segmentation and personalization</li>
<li><strong>Customer Service:</strong> Tidio or Gorgias with AI auto-responses</li>
<li><strong>Analytics:</strong> Triple Whale or Lifetimely with AI-powered insights</li>
</ul>

<h2>Key Principles for AI-Powered E-commerce Success</h2>
<ul>
<li><strong>AI amplifies strategy, it doesn't replace it:</strong> Define your brand positioning, target audience, and value proposition first. AI executes the strategy faster.</li>
<li><strong>Quality control is non-negotiable:</strong> Always review AI output before publishing. Errors erode trust faster than anything else.</li>
<li><strong>Start small, scale systematically:</strong> Implement one AI tool at a time, measure its impact, then expand.</li>
<li><strong>Data is your competitive advantage:</strong> The more quality data you collect, the better your AI tools perform. Invest in proper tracking from day one.</li>
</ul>

<p>Building a profitable e-commerce business with AI isn't about replacing human judgment — it's about extending your capabilities beyond what was previously possible. The entrepreneurs who master this combination of human strategy and AI execution will define the next decade of online commerce.</p>`,
      author: 'Mahreen Yousaf',
      category: 'E-commerce',
      tags: ['ai-tools', 'ecommerce', 'automation', 'business'],
      featuredImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=450&fit=crop&q=80',
      publishedAt: new Date('2025-12-15T08:00:00Z'),
      status: 'published',
    },
    {
      title: 'Social Media Marketing Strategies That Actually Work in 2026',
      slug: 'social-media-marketing-strategies-2026',
      excerpt: 'Cut through the noise with proven social media strategies for 2026. Learn what\'s working now across Instagram, TikTok, Facebook, and LinkedIn to drive real business results.',
      content: `<p>Social media marketing in 2026 looks nothing like it did even two years ago. Algorithm changes, the rise of short-form video, AI-generated content, and shifting consumer behaviors have rewritten the playbook. What worked last year may actively hurt your reach today. This guide cuts through the hype to focus on strategies that are demonstrably driving results right now.</p>

<h2>The State of Social Media in 2026</h2>
<p>Before diving into tactics, understand the landscape:</p>
<ul>
<li><strong>Short-form video dominates:</strong> Reels, TikToks, and YouTube Shorts generate 3-5x more engagement than static posts across every platform</li>
<li><strong>Social search is real:</strong> Gen Z and Millennials increasingly use TikTok and Instagram as primary search engines instead of Google</li>
<li><strong>Authenticity beats polish:</strong> Audiences reject overly produced content in favor of genuine, behind-the-scenes, and creator-style posts</li>
<li><strong>Community > Followers:</strong> Algorithms prioritize content that sparks conversation over content that merely accumulates likes</li>
<li><strong>AI integration is everywhere:</strong> Every major platform now offers AI-assisted content creation, captioning, and ad optimization</li>
</ul>

<h2>Platform-Specific Strategies</h2>

<h3>Instagram in 2026</h3>
<p>Instagram has evolved from a photo-sharing app to a comprehensive business platform:</p>
<ul>
<li><strong>Reels-first approach:</strong> The algorithm heavily favors Reels. Post 4-5 Reels per week minimum for growth</li>
<li><strong>Carousel posts for education:</strong> Multi-slide carousels drive saves and shares — the highest-value engagement signals</li>
<li><strong>Stories for community:</strong> Use polls, questions, and quizzes in Stories to boost engagement scores</li>
<li><strong>Instagram Shopping:</strong> Tag products in Reels, posts, and Stories for seamless purchase paths</li>
<li><strong>SEO-optimize your profile:</strong> Include keywords in your name field, bio, and captions — Instagram search indexes all of these</li>
</ul>

<h3>TikTok in 2026</h3>
<p>TikTok has matured from a dance app to a powerful discovery and commerce engine:</p>
<ul>
<li><strong>Educational content wins:</strong> How-to videos, tutorials, and tips consistently outperform pure entertainment for business accounts</li>
<li><strong>TikTok Shop integration:</strong> Native shopping features allow in-app purchases — set up your catalog</li>
<li><strong>Trending audio strategically:</strong> Use trending sounds but add genuine value — don't just chase trends without substance</li>
<li><strong>Comment engagement:</strong> Reply to comments with video responses — this creates content loops that boost visibility</li>
<li><strong>Consistency over virality:</strong> Posting daily matters more than waiting for the perfect viral moment</li>
</ul>

<h3>Facebook in 2026</h3>
<p>Don't write off Facebook — it remains the largest platform by active users and excels for certain demographics:</p>
<ul>
<li><strong>Groups are goldmines:</strong> Niche communities in Facebook Groups drive deeper engagement than Pages</li>
<li><strong>Long-form video resurgence:</strong> Facebook Watch is investing heavily in longer content — test 5-10 minute videos</li>
<li><strong>Local targeting:</strong> For brick-and-mortar or local service businesses, Facebook's geo-targeting remains unmatched</li>
<li><strong>Retargeting powerhouse:</strong> Facebook Pixel + Conversions API delivers the most sophisticated retargeting available</li>
</ul>

<h3>LinkedIn in 2026</h3>
<p>LinkedIn's organic reach is currently at a historic high — take advantage before it saturates:</p>
<ul>
<li><strong>Text-only posts:</strong> Surprisingly, text posts without links often outperform articles and external links</li>
<li><strong>Document/carousel posts:</strong> Upload PDFs as carousel slides for high-engagement educational content</li>
<li><strong>Video content:</strong> LinkedIn is pushing native video — repurpose Reels/TikToks with professional framing</li>
<li><strong>Newsletter feature:</strong> Launch a LinkedIn Newsletter to build a subscriber base with notifications</li>
</ul>

<h2>Content Frameworks That Convert</h2>
<p>Stop guessing what to post. Use these proven frameworks:</p>
<ul>
<li><strong>Problem-Agitate-Solve:</strong> Identify a pain point, amplify its urgency, present your solution</li>
<li><strong>Myth-Busting:</strong> Challenge common misconceptions in your industry — controversy drives engagement</li>
<li><strong>Behind-the-Scenes:</strong> Show your process, workspace, team, or product development — authenticity builds trust</li>
<li><strong>Listicles and Rankings:</strong> "Top 5...", "3 Mistakes...", "7 Ways..." formats consistently perform</li>
<li><strong>Case Studies:</strong> Share specific client/customer results with before-and-after metrics</li>
<li><strong>Hot Takes:</strong> Share a contrarian opinion backed by reasoning — sparks debate and comments</li>
</ul>

<h2>Leveraging AI for Social Media</h2>
<p>AI tools dramatically accelerate social media marketing without sacrificing authenticity:</p>
<ul>
<li><strong>Content ideation:</strong> AI analyzes trending topics and generates content ideas tailored to your niche</li>
<li><strong>Caption writing:</strong> Generate multiple caption variations and A/B test for engagement</li>
<li><strong>Video editing:</strong> AI auto-generates captions, removes silences, and creates highlight clips</li>
<li><strong>Scheduling optimization:</strong> AI determines optimal posting times based on your specific audience activity</li>
<li><strong>Comment management:</strong> AI drafts responses to common comments and flags urgent issues</li>
</ul>

<h2>Measuring What Matters</h2>
<p>Vanity metrics (followers, likes) don't pay bills. Track these instead:</p>
<ul>
<li><strong>Engagement rate:</strong> (Likes + Comments + Shares + Saves) / Reach × 100</li>
<li><strong>Click-through rate:</strong> Link clicks / Impressions — measures content's ability to drive action</li>
<li><strong>Conversion rate:</strong> Purchases or leads / Clicks — ties social effort to revenue</li>
<li><strong>Save rate:</strong> Saves / Reach — the strongest indicator of valuable content</li>
<li><strong>Share rate:</strong> Shares / Reach — indicates content worth spreading organically</li>
</ul>

<h2>Building a Sustainable System</h2>
<p>Social media burnout is real. Build systems that sustain consistency:</p>
<ul>
<li>Batch-create content monthly — dedicate 1-2 days to filming/writing, schedule everything in advance</li>
<li>Repurpose ruthlessly — one video becomes a Reel, TikTok, YouTube Short, LinkedIn post, and blog article</li>
<li>Create content pillars (3-5 recurring themes) to eliminate topic paralysis</li>
<li>Outsource what drains you — hire a VA for scheduling, commenting, or basic editing</li>
</ul>

<p>Social media marketing in 2026 rewards those who combine strategic thinking with authentic execution. The platforms change, but the fundamentals remain: understand your audience, provide genuine value, and show up consistently. Apply these strategies, measure relentlessly, and iterate based on data — not trends alone.</p>`,
      author: 'Mahreen Yousaf',
      category: 'Social Media',
      tags: ['social-media', 'marketing', 'instagram', 'facebook', 'strategy'],
      featuredImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=450&fit=crop',
      publishedAt: new Date('2025-12-01T09:30:00Z'),
      status: 'published',
    },
    {
      title: 'Complete Guide to AI Automation for Small Businesses',
      slug: 'ai-automation-small-business-guide',
      excerpt: 'Small businesses can reduce repetitive tasks significantly with AI automation. This guide covers the most impactful automations, tools, and implementation strategies for non-technical business owners.',
      content: `<p>AI automation isn't reserved for tech companies and enterprises anymore. Small businesses are now using affordable AI tools to automate repetitive tasks, reduce costs, and compete with much larger competitors. The key isn't adopting every AI tool available — it's strategically automating the tasks that consume the most time while delivering the least strategic value. This guide shows you exactly where to start and how to implement AI automation without technical expertise.</p>

<h2>Why AI Automation Matters for Small Businesses</h2>
<p>Small business owners wear too many hats. You're the CEO, marketer, accountant, customer service rep, and janitor — often simultaneously. AI automation doesn't replace your expertise; it frees you to focus on high-value activities that actually grow your business:</p>
<ul>
<li><strong>Time savings:</strong> Automate repetitive work to free up hours each week</li>
<li><strong>Cost reduction:</strong> Replace expensive virtual assistants or part-time hires for routine tasks</li>
<li><strong>Consistency:</strong> Automated processes execute identically every time, eliminating human error</li>
<li><strong>Scalability:</strong> Handle increased volume without proportional increases in headcount</li>
<li><strong>Competitive parity:</strong> Access capabilities previously exclusive to enterprise budgets</li>
</ul>

<h2>The AI Automation Priority Matrix</h2>
<p>Not all tasks deserve automation. Use this framework to prioritize:</p>
<ul>
<li><strong>High Impact + High Frequency = Automate First:</strong> Email responses, invoice processing, social media scheduling, appointment confirmations</li>
<li><strong>High Impact + Low Frequency = Semi-Automate:</strong> Monthly reports, quarterly planning, annual reviews — use AI to draft, you finalize</li>
<li><strong>Low Impact + High Frequency = Automate or Eliminate:</strong> Data entry, file organization, basic research — automate if possible, otherwise question if the task is necessary</li>
<li><strong>Low Impact + Low Frequency = Don't Automate:</strong> Not worth the setup time — do manually or drop entirely</li>
</ul>

<h2>Top 10 AI Automations for Small Businesses</h2>

<h3>1. Customer Inquiry Response</h3>
<p>Deploy an AI chatbot on your website and social media to handle common questions: pricing, hours, services, booking, FAQs. Modern chatbots resolve 70-80% of inquiries without human involvement and escalate complex issues with full context to you.</p>

<h3>2. Email Sorting and Drafting</h3>
<p>AI categorizes incoming emails by priority, drafts responses to routine messages, and summarizes long threads. You review and approve rather than compose from scratch.</p>

<h3>3. Social Media Content Pipeline</h3>
<p>Connect AI tools to generate content ideas, write captions, create graphics, and schedule posts across platforms. Provide your brand guidelines once, then let AI maintain consistency across every post.</p>

<h3>4. Invoice and Expense Processing</h3>
<p>AI extracts data from receipts, categorizes expenses, matches invoices to payments, and flags discrepancies. Integrates with QuickBooks, Xero, and FreshBooks for seamless accounting automation.</p>

<h3>5. Appointment Scheduling and Reminders</h3>
<p>AI handles back-and-forth scheduling via email or chat, sends automated reminders, manages cancellations and rescheduling, and syncs with your calendar. Eliminates the "when are you free?" email ping-pong entirely.</p>

<h3>6. Lead Qualification and Follow-Up</h3>
<p>AI scores leads based on engagement, demographics, and behavior. Automatically sends personalized follow-up sequences, schedules calls with qualified prospects, and nurtures cold leads until they're warm.</p>

<h3>7. Review Monitoring and Response</h3>
<p>AI monitors Google, Yelp, Facebook, and industry-specific review sites. Drafts personalized responses to positive and negative reviews for your approval. Alerts you immediately to negative feedback requiring urgent attention.</p>

<h3>8. Report Generation</h3>
<p>Connect your data sources (analytics, CRM, financial software) and AI generates weekly/monthly reports automatically. Custom dashboards update in real time, and narrative summaries highlight key trends and anomalies.</p>

<h3>9. Content Repurposing</h3>
<p>One piece of long-form content becomes multiple assets: a blog post transforms into social media posts, email newsletter, video script, podcast outline, and infographic brief. Multiply your content output 5x without additional creation time.</p>

<h3>10. Document and Contract Management</h3>
<p>AI extracts key terms from contracts, tracks renewal dates, compares agreements against standard templates, and flags unusual clauses. Never miss a renewal or sign unfavorable terms due to oversight.</p>

<h2>Implementation Roadmap</h2>
<p>Don't try to automate everything at once. Follow this phased approach:</p>
<ul>
<li><strong>Week 1-2: Audit.</strong> Track your time for two weeks. Identify the top 5 repetitive tasks consuming the most hours.</li>
<li><strong>Week 3-4: Pilot.</strong> Implement AI automation for the #1 task. Test thoroughly before expanding.</li>
<li><strong>Month 2: Expand.</strong> Add automations for tasks #2 and #3. Refine based on pilot learnings.</li>
<li><strong>Month 3+: Optimize.</strong> Continue adding automations. Review and improve existing ones based on performance data.</li>
</ul>

<h2>Choosing the Right Tools</h2>
<p>The AI automation landscape is crowded. Evaluate tools based on:</p>
<ul>
<li><strong>Integration:</strong> Does it connect with your existing software stack? Zapier and Make support 5,000+ integrations</li>
<li><strong>Ease of use:</strong> Can you set it up without coding? Look for visual workflow builders and pre-built templates</li>
<li><strong>Cost vs. ROI:</strong> Calculate time saved × your hourly rate. Most AI tools pay for themselves within weeks</li>
<li><strong>Reliability:</strong> Check uptime records and support responsiveness. Automation that breaks frequently costs more time than it saves</li>
<li><strong>Data security:</strong> Verify SOC 2 compliance and data handling policies, especially for customer-facing automations</li>
</ul>

<h2>Common Automation Mistakes</h2>
<ul>
<li><strong>Automating broken processes:</strong> Fix the process first, then automate. Automating chaos produces automated chaos.</li>
<li><strong>Skipping human review:</strong> Always build approval checkpoints for customer-facing outputs until you trust the system</li>
<li><strong>Set-and-forget mentality:</strong> Review automations monthly. Business changes require automation updates.</li>
<li><strong>Over-engineering:</strong> Start simple. A basic automation that works reliably beats a complex one that breaks.</li>
<li><strong>Ignoring edge cases:</strong> Test with unusual inputs. Automations fail most often on scenarios you didn't anticipate.</li>
</ul>

<p>AI automation is the great equalizer for small businesses. You don't need a dedicated IT team or a six-figure budget. Start with one high-impact automation, prove the ROI, and expand systematically. The businesses that embrace this shift will operate leaner, move faster, and outmaneuver competitors still doing everything manually.</p>`,
      author: 'Mahreen Yousaf',
      category: 'AI Automation',
      tags: ['ai-automation', 'small-business', 'productivity', 'tools'],
      featuredImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=450&fit=crop',
      publishedAt: new Date('2025-11-18T10:00:00Z'),
      status: 'published',
    },
    {
      title: 'Etsy vs eBay vs Shopify: Which Platform is Right for Your Business?',
      slug: 'etsy-vs-ebay-vs-shopify-comparison',
      excerpt: 'A detailed comparison of Etsy, eBay, and Shopify covering fees, audience, customization, and growth potential. Find out which platform (or combination) fits your business model.',
      content: `<p>Choosing the right e-commerce platform is one of the most consequential decisions you'll make as an online seller. Each platform serves different business models, attracts different buyers, and comes with distinct cost structures. There's no universally "best" option — only the best option for <em>your</em> specific situation. This comprehensive comparison breaks down everything you need to know to make an informed decision.</p>

<h2>Platform Overview</h2>

<h3>Etsy</h3>
<p>A curated marketplace focused on handmade, vintage, and craft supply items. Built-in audience of 90+ million active buyers specifically seeking unique, artisanal products.</p>

<h3>eBay</h3>
<p>The world's largest general marketplace with 135+ million active buyers. Supports new, used, refurbished, and collectible items across virtually every category.</p>

<h3>Shopify</h3>
<p>A standalone e-commerce platform that gives you your own branded website. No built-in marketplace traffic — you drive your own visitors through marketing.</p>

<h2>Fee Comparison</h2>
<p>Fees directly impact your profit margins. Here's the breakdown:</p>

<h3>Etsy Fees</h3>
<ul>
<li><strong>Listing fee:</strong> $0.20 per listing (renewed every 4 months or upon sale)</li>
<li><strong>Transaction fee:</strong> 6.5% of total sale price (including shipping)</li>
<li><strong>Payment processing:</strong> 3% + $0.25 per transaction</li>
<li><strong>Offsite Ads:</strong> 12-15% on sales generated through Etsy's advertising (mandatory for shops over $10K/year)</li>
<li><strong>Total effective rate:</strong> Approximately 10-12% per sale</li>
</ul>

<h3>eBay Fees</h3>
<ul>
<li><strong>Insertion fee:</strong> First 250 listings/month free, then $0.35 each</li>
<li><strong>Final value fee:</strong> 10-15% depending on category (most categories ~13%)</li>
<li><strong>Payment processing:</strong> Included in final value fee (managed payments)</li>
<li><strong>Promoted Listings:</strong> Optional 2-8% ad fee for boosted visibility</li>
<li><strong>Total effective rate:</strong> Approximately 13-16% per sale</li>
</ul>

<h3>Shopify Fees</h3>
<ul>
<li><strong>Monthly subscription:</strong> $39/month (Basic), $105/month (Shopify), $399/month (Advanced)</li>
<li><strong>Transaction fee:</strong> 0% with Shopify Payments, 0.5-2% with third-party gateways</li>
<li><strong>Payment processing:</strong> 2.9% + $0.30 (Basic), decreasing on higher plans</li>
<li><strong>Apps:</strong> Variable — many essential apps cost $10-50/month each</li>
<li><strong>Total effective rate:</strong> Lower percentage but fixed monthly cost; better for higher-volume sellers</li>
</ul>

<h2>Audience and Traffic</h2>
<p>Where do buyers come from on each platform?</p>

<h3>Etsy</h3>
<ul>
<li>Built-in buyer base actively searching for handmade and unique items</li>
<li>Buyers expect higher prices for artisanal quality</li>
<li>Strong international audience with localized experiences</li>
<li>Trust factor: buyers trust Etsy's buyer protection and review system</li>
</ul>

<h3>eBay</h3>
<ul>
<li>Massive global audience spanning every product category</li>
<li>Bargain-conscious buyers comparing prices across sellers</li>
<li>Strong collector and enthusiast communities</li>
<li>International shipping program simplifies cross-border sales</li>
</ul>

<h3>Shopify</h3>
<ul>
<li>No built-in traffic — you must generate your own through marketing</li>
<li>Complete control over brand experience and customer relationship</li>
<li>Ideal for building a loyal customer base and email list</li>
<li>Higher customer lifetime value potential through direct relationship</li>
</ul>

<h2>Customization and Branding</h2>
<ul>
<li><strong>Etsy:</strong> Limited. Standardized shop layout with minimal customization options. Your brand competes visually with every other shop.</li>
<li><strong>eBay:</strong> Moderate. Custom store designs available with Store subscription. Still operates within eBay's framework and branding.</li>
<li><strong>Shopify:</strong> Extensive. Full control over design, functionality, and customer experience. Thousands of themes and apps for unlimited customization.</li>
</ul>

<h2>Which Platform Should You Choose?</h2>

<h3>Choose Etsy If:</h3>
<ul>
<li>You sell handmade, vintage, or craft supplies</li>
<li>You want built-in traffic without marketing investment</li>
<li>You're just starting and want to validate product-market fit quickly</li>
<li>Your products have a story or artisanal angle that resonates with Etsy's audience</li>
</ul>

<h3>Choose eBay If:</h3>
<ul>
<li>You sell used, refurbished, or collectible items</li>
<li>You deal in commodity products where buyers compare prices</li>
<li>You want access to the largest possible buyer pool immediately</li>
<li>You're liquidating inventory or running an auction-based business</li>
</ul>

<h3>Choose Shopify If:</h3>
<ul>
<li>You're building a serious brand with long-term growth ambitions</li>
<li>You want full control over customer data and relationships</li>
<li>You're generating consistent traffic through your own marketing efforts</li>
<li>You sell products that benefit from a premium brand presentation</li>
</ul>

<h3>The Multi-Platform Strategy</h3>
<p>Many successful sellers don't choose one platform — they use all three strategically:</p>
<ul>
<li><strong>Etsy</strong> for product validation and reaching handmade-seeking buyers</li>
<li><strong>eBay</strong> for clearing excess inventory and reaching bargain hunters</li>
<li><strong>Shopify</strong> as the primary brand home for direct customer relationships and highest margins</li>
</ul>
<p>Use inventory management tools like Sellbrite or Listing Mirror to sync products across platforms without overselling.</p>

<h2>Making the Transition</h2>
<p>If you're currently on one platform and considering another (or adding one):</p>
<ul>
<li>Don't abandon your existing platform overnight — transition gradually</li>
<li>Build your email list on marketplace platforms to own the customer relationship</li>
<li>Use marketplace sales data to inform your Shopify product selection and pricing</li>
<li>Invest in SEO and content marketing early to build organic traffic for your independent store</li>
</ul>

<p>The right platform depends on your products, goals, budget, and marketing capacity. There's no wrong choice if it aligns with your business model. Many sellers find that evolving their platform mix as they grow yields the best long-term results. Start where you are, learn continuously, and expand strategically.</p>`,
      author: 'Mahreen Yousaf',
      category: 'E-commerce',
      tags: ['etsy', 'ebay', 'shopify', 'comparison', 'marketplace'],
      featuredImage: 'https://drive.google.com/thumbnail?id=1y7vuTbCYjc19vYcp6SUD4GR2rXeMeL6o&sz=w800',
      publishedAt: new Date('2025-11-05T09:00:00Z'),
      status: 'published',
    },
    {
      title: 'How to Start an Online Consulting Business from Scratch',
      slug: 'start-online-consulting-business-scratch',
      excerpt: 'A step-by-step guide to launching a profitable online consulting business. Covers niche selection, pricing, client acquisition, tools, and scaling strategies for aspiring consultants.',
      content: `<p>Consulting is one of the most accessible and profitable online business models. You monetize expertise you already have, serve clients globally from anywhere, and scale without inventory or overhead. Whether you're an experienced professional transitioning to independence or building a side hustle around specialized knowledge, this guide provides the complete roadmap to launching your online consulting business.</p>

<h2>Step 1: Identify Your Consulting Niche</h2>
<p>The biggest mistake new consultants make is being too broad. "I help businesses grow" is forgettable. "I help Shopify stores increase conversion rates by 20-30% through checkout optimization" is magnetic. Narrow your niche using this framework:</p>
<ul>
<li><strong>Your expertise:</strong> What do people already ask you for advice about? What problems have you solved repeatedly?</li>
<li><strong>Market demand:</strong> Are businesses actively paying for solutions in this area? Check freelance platforms, job boards, and industry forums for demand signals.</li>
<li><strong>Willingness to pay:</strong> Does solving this problem directly impact revenue or reduce costs? ROI-linked services command premium pricing.</li>
<li><strong>Scalability:</strong> Can you deliver results consistently without reinventing the wheel for each client? Repeatable methodologies scale; bespoke art doesn't.</li>
</ul>

<h2>Step 2: Define Your Service Offerings</h2>
<p>Package your expertise into clear, purchasable offerings:</p>

<h3>Tier 1: Discovery/Audit</h3>
<p>A focused assessment of the client's current situation with specific recommendations. Low commitment for the client, high value demonstration for you. Often converts to ongoing work.</p>

<h3>Tier 2: Implementation Project</h3>
<p>Hands-on execution of specific improvements. Defined scope, timeline, and deliverables. This is where most consulting revenue lives.</p>

<h3>Tier 3: Ongoing Retainer</h3>
<p>Continuous advisory, monitoring, and optimization. Provides predictable recurring revenue and deeper client relationships. Aim to convert project clients to retainers.</p>

<h2>Step 3: Set Your Pricing</h2>
<p>New consultants chronically underprice. Use these frameworks:</p>
<ul>
<li><strong>Value-based pricing:</strong> Price based on the outcome you deliver, not hours worked. If you save a client $50,000/year, charging $5,000 is a bargain.</li>
<li><strong>Market benchmarking:</strong> Research what established consultants in your niche charge. Price slightly below initially to build testimonials, then raise as proof accumulates.</li>
<li><strong>The 3x rule:</strong> Your hourly rate should be at least 3x what you'd earn as an employee doing similar work. This accounts for taxes, benefits, downtime, and business expenses.</li>
</ul>
<p>Never compete on price. Compete on specificity, results, and trust. Clients who choose the cheapest consultant are rarely ideal clients.</p>

<h2>Step 4: Build Your Online Presence</h2>
<p>Your digital presence is your storefront. Essential components:</p>

<h3>Professional Website</h3>
<ul>
<li>Clear value proposition above the fold ("I help [specific audience] achieve [specific outcome]")</li>
<li>Detailed service pages explaining methodology and expected results</li>
<li>Case studies with quantifiable outcomes</li>
<li>Client testimonials with names, photos, and companies (with permission)</li>
<li>Easy booking mechanism (Calendly, Acuity) for discovery calls</li>
</ul>

<h3>LinkedIn Profile Optimization</h3>
<ul>
<li>Headline states your niche and value proposition, not just your job title</li>
<li>About section tells your story and demonstrates expertise</li>
<li>Featured section showcases case studies, articles, and speaking engagements</li>
<li>Regular content posting (2-3x/week) establishing thought leadership</li>
</ul>

<h3>Content Marketing</h3>
<ul>
<li>Blog articles answering specific questions your ideal clients search for</li>
<li>Free resources (checklists, templates, guides) demonstrating expertise</li>
<li>Video content on YouTube or LinkedIn showing your personality and knowledge</li>
<li>Email newsletter providing ongoing value to prospects not ready to buy yet</li>
</ul>

<h2>Step 5: Acquire Your First Clients</h2>
<p>Getting the first 3-5 clients is the hardest phase. Tactics that work:</p>
<ul>
<li><strong>Warm outreach:</strong> Tell everyone in your network what you do. Most first clients come from referrals, not cold marketing.</li>
<li><strong>LinkedIn outreach:</strong> Connect with ideal clients, engage with their content authentically, and start conversations (not pitches).</li>
<li><strong>Free workshops/webinars:</strong> Demonstrate expertise live. Attendees who see your knowledge firsthand convert at high rates.</li>
<li><strong>Freelance platforms:</strong> Upwork and Fiverr Pro can generate initial clients and testimonials, though margins are lower.</li>
<li><strong>Strategic partnerships:</strong> Partner with complementary service providers who serve your ideal clients (e.g., web designers partnering with SEO consultants).</li>
</ul>

<h2>Step 6: Deliver Exceptional Results</h2>
<p>Client satisfaction drives referrals and retainer conversions:</p>
<ul>
<li>Set clear expectations upfront with a detailed proposal and scope document</li>
<li>Communicate proactively — never let clients wonder about progress</li>
<li>Document your process so clients understand the methodology, not just the output</li>
<li>Deliver quick wins early to build momentum and confidence</li>
<li>Ask for testimonials and referrals at the point of maximum satisfaction</li>
</ul>

<h2>Step 7: Scale Your Consulting Business</h2>
<p>Once you've validated demand and refined delivery:</p>
<ul>
<li><strong>Raise prices:</strong> Every 3-6 months as your reputation and results portfolio grow</li>
<li><strong>Productize services:</strong> Turn custom engagements into standardized packages with fixed pricing</li>
<li><strong>Create passive income:</strong> Courses, templates, and ebooks monetize your knowledge without trading time</li>
<li><strong>Hire subcontractors:</strong> Delegate delivery while you focus on sales and strategy</li>
<li><strong>Build systems:</strong> Document everything so the business operates without your constant involvement</li>
</ul>

<h2>Essential Tools for Online Consultants</h2>
<ul>
<li><strong>Video calls:</strong> Zoom or Google Meet for client meetings</li>
<li><strong>Project management:</strong> Notion, Asana, or ClickUp for tracking deliverables</li>
<li><strong>Invoicing:</strong> Stripe, Wave, or HoneyBook for billing and payments</li>
<li><strong>Scheduling:</strong> Calendly or SavvyCal for frictionless booking</li>
<li><strong>CRM:</strong> HubSpot (free tier) or Dubsado for pipeline management</li>
<li><strong>Content:</strong> AI writing tools for proposals, reports, and marketing content</li>
</ul>

<p>Starting an online consulting business requires courage and persistence, but the rewards — financial independence, location freedom, intellectual fulfillment — are worth the effort. Focus on delivering genuine value, build trust through consistent results, and your business will grow through the most powerful marketing channel: word of mouth from delighted clients.</p>`,
      author: 'Mahreen Yousaf',
      category: 'Business',
      tags: ['consulting', 'online-business', 'freelancing', 'mentorship'],
      featuredImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop',
      publishedAt: new Date('2025-10-25T08:30:00Z'),
      status: 'published',
    },
    {
      title: 'Top 10 Free AI Tools Every Digital Marketer Should Know',
      slug: 'top-free-ai-tools-digital-marketers',
      excerpt: 'Supercharge your digital marketing workflow with these 10 powerful free AI tools. From content creation to analytics, discover tools that save hours every week without costing a dollar.',
      content: `<p>The AI tool ecosystem has exploded, and many of the most powerful options are completely free. Digital marketers who leverage these tools effectively can double their output, improve quality, and reclaim hours previously spent on repetitive tasks. This curated list focuses exclusively on free tools that deliver genuine value — no trials, no credit cards, no hidden paywalls for core features.</p>

<h2>1. ChatGPT (Free Tier) — Content Ideation and Drafting</h2>
<p>OpenAI's free tier provides access to GPT-4o mini, which is remarkably capable for marketing tasks:</p>
<ul>
<li>Generate blog post outlines, social media calendars, and email sequences</li>
<li>Rewrite content in different tones and formats</li>
<li>Brainstorm campaign ideas and taglines</li>
<li>Create buyer personas and customer journey maps</li>
<li>Analyze competitor messaging and suggest differentiation strategies</li>
</ul>
<p><strong>Pro tip:</strong> Craft detailed prompts with role, context, and format specifications. "Act as a senior content strategist for a B2B SaaS company. Create a 4-week LinkedIn content calendar targeting HR directors. Include post type, hook, and CTA for each." produces dramatically better results than "write LinkedIn posts."</p>

<h2>2. Canva (Free Tier) — Visual Content Creation</h2>
<p>Canva's free plan includes AI-powered features that rival paid design tools:</p>
<ul>
<li>Magic Write generates text for social posts, presentations, and documents</li>
<li>Background remover creates clean product images instantly</li>
<li>Magic Edit replaces elements in photos using AI</li>
<li>Templates for every platform with AI-suggested layouts</li>
<li>Brand kit basics for consistent visual identity</li>
</ul>
<p><strong>Best for:</strong> Social media graphics, presentation decks, infographics, and email headers.</p>

<h2>3. Google Analytics 4 — AI-Powered Insights</h2>
<p>GA4's built-in AI features are underutilized by most marketers:</p>
<ul>
<li>Anomaly detection alerts you to unexpected traffic or conversion changes</li>
<li>Predictive metrics forecast purchase probability and churn risk</li>
<li>Natural language queries let you ask questions in plain English</li>
<li>Automated insights surface trends you might miss manually</li>
<li>Attribution modeling reveals true channel contributions</li>
</ul>
<p><strong>Pro tip:</strong> Set up custom alerts for key metrics so AI proactively notifies you of important changes.</p>

<h2>4. Hemingway Editor — Content Clarity Optimization</h2>
<p>Clear writing converts better than clever writing. Hemingway's free web version highlights:</p>
<ul>
<li>Complex sentences that should be simplified</li>
<li>Passive voice that weakens your message</li>
<li>Adverbs that add fluff without meaning</li>
<li>Readability grade level (aim for grade 6-8 for broad audiences)</li>
<li>Hard-to-read passages that lose reader attention</li>
</ul>
<p><strong>Best for:</strong> Landing pages, email copy, blog posts, and any customer-facing text.</p>

<h2>5. Ubersuggest (Free Tier) — Keyword Research and SEO</h2>
<p>Neil Patel's tool offers generous free access to essential SEO data:</p>
<ul>
<li>Keyword suggestions with search volume and difficulty estimates</li>
<li>Content ideas based on top-performing pages in your niche</li>
<li>Backlink analysis for competitor research</li>
<li>Site audit identifying technical SEO issues</li>
<li>Rank tracking for a limited number of keywords</li>
</ul>
<p><strong>Best for:</strong> Blog topic research, competitor gap analysis, and basic SEO audits.</p>

<h2>6. Buffer (Free Tier) — Social Media Scheduling</h2>
<p>Buffer's free plan covers the essentials for solo marketers and small teams:</p>
<ul>
<li>Schedule posts across Instagram, Facebook, LinkedIn, TikTok, and Pinterest</li>
<li>AI caption assistant generates and refines post copy</li>
<li>Best-time-to-post recommendations based on your audience</li>
<li>Basic analytics tracking engagement and reach</li>
<li>Link shortening and tracking</li>
</ul>
<p><strong>Pro tip:</strong> Batch-create a month of content in one session, then schedule everything. Consistency beats sporadic bursts.</p>

<h2>7. Grammarly (Free Tier) — Writing Quality Assurance</h2>
<p>Grammarly's free version catches errors that undermine credibility:</p>
<ul>
<li>Grammar, spelling, and punctuation corrections</li>
<li>Clarity suggestions for confusing sentences</li>
<li>Tone detection to ensure appropriate voice</li>
<li>Browser extension works across email, social media, and CMS platforms</li>
<li>Plagiarism detection (limited in free tier)</li>
</ul>
<p><strong>Best for:</strong> Every piece of written content before publishing — emails, ads, blog posts, social captions.</p>

<h2>8. Google Search Console — Organic Search Intelligence</h2>
<p>Completely free and indispensable for SEO:</p>
<ul>
<li>See exact queries driving traffic to your site</li>
<li>Identify pages losing rankings and diagnose causes</li>
<li>Submit sitemaps and request indexing for new content</li>
<li>Monitor Core Web Vitals and mobile usability</li>
<li>Discover untapped keyword opportunities from impression data</li>
</ul>
<p><strong>Pro tip:</strong> Sort queries by impressions (not clicks) to find high-exposure keywords where improved rankings would yield the biggest traffic gains.</p>

<h2>9. Otter.ai (Free Tier) — Meeting Notes and Transcription</h2>
<p>Turn client calls, brainstorming sessions, and webinars into searchable text:</p>
<ul>
<li>Real-time transcription during meetings</li>
<li>Automatic speaker identification</li>
<li>AI-generated summaries highlighting key points and action items</li>
<li>Searchable transcript archive</li>
<li>Export to text, PDF, or integration with project management tools</li>
</ul>
<p><strong>Best for:</strong> Client discovery calls, content brainstorming, podcast episode repurposing, and webinar note-taking.</p>

<h2>10. AnswerThePublic — Content Idea Generation</h2>
<p>Discover exactly what your audience is asking about your topic:</p>
<ul>
<li>Visualizes search queries as questions, prepositions, and comparisons</li>
<li>Reveals content gaps your competitors aren't addressing</li>
<li>Organizes queries by intent (informational, commercial, navigational)</li>
<li>Exports data for content planning spreadsheets</li>
<li>Free daily searches sufficient for regular content planning</li>
</ul>
<p><strong>Best for:</strong> Blog content calendars, FAQ page development, and understanding customer pain points.</p>

<h2>Building Your Free AI Marketing Stack</h2>
<p>Combine these tools into a cohesive workflow:</p>
<ul>
<li><strong>Research:</strong> AnswerThePublic + Ubersuggest + Google Search Console</li>
<li><strong>Create:</strong> ChatGPT + Canva + Hemingway + Grammarly</li>
<li><strong>Distribute:</strong> Buffer + Otter.ai</li>
<li><strong>Analyze:</strong> Google Analytics 4 + Google Search Console</li>
</ul>
<p>This stack covers the entire marketing lifecycle without spending a dollar on software. As your business grows, upgrade individual tools to paid tiers based on where you hit limitations — not before.</p>

<h2>Beyond Free: When to Upgrade</h2>
<p>Free tools have limits. Consider upgrading when:</p>
<ul>
<li>You're spending more time working around limitations than the upgrade costs</li>
<li>Team collaboration requires shared access beyond free tier allowances</li>
<li>Volume exceeds free tier caps and the time savings justify the expense</li>
<li>Advanced features (API access, custom models, priority support) unlock significant value</li>
</ul>

<p>The best digital marketers aren't those with the biggest tool budgets — they're those who extract maximum value from the tools they have. Master these ten free tools, and you'll outperform marketers spending hundreds monthly on subscriptions they barely use.</p>`,
      author: 'Mahreen Yousaf',
      category: 'AI Tools',
      tags: ['ai-tools', 'free-tools', 'digital-marketing', 'productivity'],
      featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
      publishedAt: new Date('2025-10-15T10:00:00Z'),
      status: 'published',
    },
    {
      title: 'SEO Content Strategy: How to Write Content That Ranks on Google',
      slug: 'seo-content-strategy-rank-google',
      excerpt: 'A comprehensive framework for creating SEO content that ranks on Google and drives qualified organic traffic. Covers keyword research, content structure, on-page optimization, and measuring results.',
      content: `<p>Creating content that ranks on Google isn't about gaming algorithms or stuffing keywords. It's about systematically producing content that satisfies searcher intent better than anything else on the internet. Google's ranking systems reward depth, accuracy, user experience, and genuine expertise. This guide provides a repeatable framework for creating content that earns rankings, attracts qualified traffic, and converts readers into customers.</p>

<h2>The Foundation: Strategic Keyword Research</h2>
<p>Every piece of ranking content starts with understanding what people search for and why. Skip this step and you're creating content nobody finds.</p>

<h3>Understanding Search Intent</h3>
<p>Keywords map to four intent types. Matching intent is more important than matching exact phrases:</p>
<ul>
<li><strong>Informational:</strong> "what is SEO" — user wants to learn. Create comprehensive guides and explainers.</li>
<li><strong>Commercial Investigation:</strong> "best SEO tools 2026" — user is evaluating options. Create comparisons and reviews.</li>
<li><strong>Navigational:</strong> "Moz login" — user wants a specific page. Usually not targetable unless it's your brand.</li>
<li><strong>Transactional:</strong> "hire SEO consultant" — user is ready to act. Create service pages and landing pages.</li>
</ul>
<p>Google's SERP reveals intent. If the top results are blog posts, informational content wins. If they're product pages, commercial content wins. Study the SERP before creating anything.</p>

<h3>Keyword Research Process</h3>
<ol>
<li><strong>Seed keywords:</strong> List 10-20 core topics relevant to your business</li>
<li><strong>Expand:</strong> Use Google autocomplete, People Also Ask, and keyword tools to generate hundreds of variations</li>
<li><strong>Evaluate:</strong> Assess search volume, keyword difficulty, and business relevance for each</li>
<li><strong>Prioritize:</strong> Focus on keywords where you can realistically rank AND that drive business value</li>
<li><strong>Cluster:</strong> Group related keywords into content topics — one comprehensive page often outranks multiple thin pages</li>
</ol>

<h2>Content Creation Framework</h2>

<h3>Pre-Writing Research</h3>
<p>Before writing a single word, analyze the competitive landscape:</p>
<ul>
<li>Read every page ranking in the top 10 for your target keyword</li>
<li>Note common subtopics, questions answered, and content formats</li>
<li>Identify gaps — what do competitors miss that searchers need?</li>
<li>Check People Also Ask and Related Searches for additional angles</li>
<li>Review Reddit, Quora, and forums for real user questions and frustrations</li>
</ul>

<h3>Content Structure That Ranks</h3>
<p>Google rewards well-organized, comprehensive content. Follow this structural template:</p>
<ul>
<li><strong>Title tag:</strong> Include primary keyword near the front. Keep under 60 characters. Make it compelling for clicks.</li>
<li><strong>Introduction (first 100 words):</strong> State what the reader will learn. Include primary keyword naturally. Hook with a statistic, question, or bold claim.</li>
<li><strong>Table of contents:</strong> For articles over 1,500 words. Helps readers navigate and generates sitelinks in SERPs.</li>
<li><strong>H2 sections:</strong> Cover each major subtopic identified in competitor analysis. Include secondary keywords naturally.</li>
<li><strong>H3 subsections:</strong> Break down complex topics. Target long-tail keywords and People Also Ask questions.</li>
<li><strong>Conclusion:</strong> Summarize key takeaways. Include a clear call-to-action. Reinforce primary keyword.</li>
</ul>

<h3>Writing for Both Humans and Machines</h3>
<p>The best SEO content reads naturally while signaling relevance to search engines:</p>
<ul>
<li>Use primary keyword in title, first paragraph, one H2, and conclusion — never force additional placements</li>
<li>Include semantically related terms throughout (LSI keywords). Google understands topic context without exact repetition.</li>
<li>Write in short paragraphs (2-4 sentences). Dense text blocks increase bounce rate.</li>
<li>Use bullet points and numbered lists for scannable content. Featured snippets often pull from lists.</li>
<li>Include original data, examples, screenshots, and case studies. Unique content earns links and engagement.</li>
<li>Add internal links to related content. This distributes authority and helps Google understand site structure.</li>
</ul>

<h2>On-Page SEO Checklist</h2>
<p>After writing, optimize these elements:</p>
<ul>
<li>☐ Title tag includes primary keyword and is under 60 characters</li>
<li>☐ Meta description is compelling, includes keyword, and is under 155 characters</li>
<li>☐ URL slug is short, descriptive, and includes primary keyword</li>
<li>☐ H1 tag matches or closely mirrors title tag</li>
<li>☐ Images have descriptive alt text including relevant keywords where natural</li>
<li>☐ Internal links to 3-5 related pages on your site</li>
<li>☐ External links to authoritative sources supporting your claims</li>
<li>☐ Schema markup appropriate to content type (Article, FAQ, HowTo, Product)</li>
<li>☐ Page loads in under 3 seconds (compress images, minimize scripts)</li>
<li>☐ Mobile rendering is clean and readable</li>
</ul>

<h2>Content Types That Rank</h2>
<p>Different formats serve different keyword intents:</p>

<h3>Pillar Pages (3,000-5,000+ words)</h3>
<p>Comprehensive guides covering broad topics. Target high-volume head terms. Serve as hub pages linking to cluster content. Examples: "Complete Guide to E-commerce SEO," "Digital Marketing Strategy Framework."</p>

<h3>How-To Guides (1,500-3,000 words)</h3>
<p>Step-by-step tutorials targeting "how to" queries. Include screenshots, videos, or diagrams. Eligible for HowTo rich results. Examples: "How to Set Up Google Shopping," "How to Optimize Etsy Listings."</p>

<h3>Comparison Posts (1,500-2,500 words)</h3>
<p>Side-by-side evaluations targeting "vs" and "best" queries. Include comparison tables, pros/cons, and clear recommendations. Examples: "Shopify vs WooCommerce," "Best AI Writing Tools for Marketers."</p>

<h3>List Posts (1,000-2,000 words)</h3>
<p>Curated collections targeting "top/best" queries. Each item needs substantive detail, not just a link. Examples: "10 Free SEO Tools," "7 Etsy Niches With Low Competition."</p>

<h2>Measuring Content Performance</h2>
<p>Track these metrics to evaluate and improve your content strategy:</p>
<ul>
<li><strong>Keyword rankings:</strong> Monitor positions for target keywords using Google Search Console or rank trackers</li>
<li><strong>Organic traffic:</strong> Track sessions from organic search in Google Analytics</li>
<li><strong>Click-through rate:</strong> Low CTR despite high impressions indicates title/meta description needs improvement</li>
<li><strong>Dwell time:</strong> Time spent on page signals content quality to Google</li>
<li><strong>Bounce rate:</strong> High bounce rates may indicate mismatched intent or poor user experience</li>
<li><strong>Conversions:</strong> Ultimately, content should drive desired actions (leads, sales, signups)</li>
</ul>

<h2>Content Maintenance and Updates</h2>
<p>SEO content isn't publish-and-forget:</p>
<ul>
<li>Review top-performing content quarterly for accuracy and freshness</li>
<li>Update statistics, examples, and tool references regularly</li>
<li>Add new sections addressing emerging subtopics or questions</li>
<li>Refresh title tags and meta descriptions for underperforming pages</li>
<li>Re-promote updated content on social media and email newsletters</li>
<li>Monitor for new competitors and strengthen content where challenged</li>
</ul>

<p>SEO content strategy is a long game. Individual articles may take 3-6 months to reach peak rankings. But a systematic approach compounds: each new piece strengthens your topical authority, each update refreshes relevance, and each ranking page becomes a permanent traffic asset. Invest in quality, optimize with discipline, and the results will follow.</p>`,
      author: 'Mahreen Yousaf',
      category: 'Content Marketing',
      tags: ['seo', 'content-marketing', 'copywriting', 'google-ranking'],
      featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
      publishedAt: new Date('2025-10-05T09:00:00Z'),
      status: 'published',
    },
  ];

  // Clean up blog posts with outdated slugs (from previous seed runs with different years)
  const allSeedSlugs = [
    ...blogPosts.map((p) => p.slug),
    ...additionalBlogPosts.map((p) => p.slug),
  ];
  const deletedResult = await BlogPost.deleteMany({ slug: { $nin: allSeedSlugs } });
  if (deletedResult.deletedCount && deletedResult.deletedCount > 0) {
    console.log(`[SEED] Removed ${deletedResult.deletedCount} stale blog posts with outdated slugs`);
  }

  for (const post of additionalBlogPosts) {
    await BlogPost.findOneAndUpdate(
      { slug: post.slug },
      { $set: post },
      { upsert: true, new: true },
    );
  }
  console.log(`[SEED] Upserted ${additionalBlogPosts.length} additional blog posts`);

  // Seed Services
  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0) {
    const services = [
      {
        title: 'Shopify Store Setup & Optimization',
        slug: 'shopify-store-setup',
        description: 'Complete Shopify store setup including theme customization, product uploads, payment gateway integration, and conversion optimization.',
        features: [
          'Starter: Theme setup, product uploads, basic SEO — Starting from $299',
          'Growth: Custom theme, full catalog optimization, analytics — Starting from $599',
          'Custom: Advanced requirements — quote after consultation',
        ],
        price: 'Starting from $299',
        duration: 'Tiered pricing',
        icon: 'ShoppingBag',
        order: 1,
      },
      {
        title: 'eBay Listing Optimization',
        slug: 'ebay-listing-optimization',
        description: 'Professional eBay listing optimization to improve search rankings, increase click-through rates, and boost conversions.',
        features: [
          'Starter: Title + specifics optimization for up to 10 listings — Starting from $149',
          'Growth: Full listing overhaul, photo guidance, promoted listings strategy — Starting from $349',
          'Custom: Bulk optimization or ongoing management — quote after consultation',
        ],
        price: 'Starting from $149',
        duration: 'Tiered pricing',
        icon: 'Tag',
        order: 2,
      },
      {
        title: 'Etsy Shop Management',
        slug: 'etsy-shop-management',
        description: 'Comprehensive Etsy shop management including listing optimization, SEO, and ongoing maintenance for handmade sellers.',
        features: [
          'Starter: Shop audit + listing optimization for up to 10 products — Starting from $199',
          'Growth: Full shop optimization, tag strategy, monthly reports — Starting from $449',
          'Custom: Ongoing management or advanced requirements — quote after consultation',
        ],
        price: 'Starting from $199',
        duration: 'Tiered pricing',
        icon: 'Palette',
        order: 3,
      },
      {
        title: 'Social Media Marketing',
        slug: 'social-media-marketing',
        description: 'Strategic social media marketing to build brand awareness, engage customers, and drive traffic to your e-commerce store.',
        features: [
          'Starter: Strategy session + content calendar — Starting from $249',
          'Growth: Monthly content creation, community management, paid ads setup — Starting from $599',
          'Custom: Full-service management across platforms — quote after consultation',
        ],
        price: 'Starting from $249',
        duration: 'Tiered pricing',
        icon: 'Share2',
        order: 4,
      },
      {
        title: 'SEO & Content Marketing',
        slug: 'seo-content-marketing',
        description: 'Comprehensive SEO and content marketing strategy to improve organic visibility and drive qualified traffic.',
        features: [
          'Starter: Keyword research + on-page audit — Starting from $349',
          'Growth: Content creation, technical SEO, link building strategy — Starting from $799',
          'Custom: Full-service SEO retainer with ongoing optimization — quote after consultation',
        ],
        price: 'Starting from $349',
        duration: 'Tiered pricing',
        icon: 'Search',
        order: 5,
      },
    ];

    await Service.insertMany(services);
    console.log(`[SEED] Created ${services.length} services`);
  } else {
    console.log(`[SEED] Services already exist (${serviceCount}), skipping`);
  }

  // Seed AI Tools (idempotent via upsert so corrected URLs propagate)
  // Wrapped in try/catch to prevent seed failure from blocking subsequent seeds.
  try {
    const aiTools = [
    {
      name: 'Product Description Generator',
      slug: 'product-description-generator',
      description: 'Generate compelling, SEO-friendly product descriptions for any e-commerce platform using AI.',
      category: 'Content',
      features: [
        'Multi-platform support (Shopify, eBay, Etsy)',
        'Tone customization',
        'SEO keyword integration',
        'Bulk generation capability',
      ],
      toolUrl: '/tools/product-description-generator',
      isFree: true,
      status: 'live' as const,
    },
    {
      name: 'SEO Title Optimizer',
      slug: 'seo-title-optimizer',
      description: 'Optimize your product titles for maximum search visibility across all major platforms.',
      category: 'SEO',
      features: [
        'Keyword density analysis',
        'Character limit compliance',
        'Platform-specific formatting',
        'Competitor comparison',
      ],
      toolUrl: '/tools/seo-title-optimizer',
      isFree: true,
      status: 'live' as const,
    },
    {
      name: 'Hashtag Generator',
      slug: 'hashtag-generator',
      description: 'Generate relevant, trending hashtags for social media posts to increase reach and engagement.',
      category: 'Social Media',
      features: [
        'Trending hashtag detection',
        'Niche-specific suggestions',
        'Engagement rate predictions',
        'Platform optimization',
      ],
      toolUrl: '/tools/hashtag-generator',
      isFree: true,
      status: 'live' as const,
    },
    {
      name: 'Profit Calculator',
      slug: 'profit-calculator',
      description: 'Calculate profit margins, ROI, and optimal pricing for your products with instant math-based results.',
      category: 'Analytics',
      features: [
        'Instant cost breakdown',
        'Profit margin calculation',
        'ROI analysis',
        'Marketplace fee support',
      ],
      toolUrl: '/tools/profit-calculator',
      isFree: true,
      status: 'live' as const,
    },
    {
      name: 'Competitor Analyzer',
      slug: 'competitor-analyzer',
      description: 'AI-powered framework that generates competitor analysis insights based on your input. Provides structured guidance rather than live data scraping.',
      category: 'Analytics',
      features: [
        'AI-generated competitive insights',
        'Pricing comparison framework',
        'Listing quality scoring guide',
        'Gap analysis template',
      ],
      toolUrl: '/tools/competitor-analyzer',
      isFree: true,
      status: 'live' as const,
    },
    {
      name: 'Review Response Writer',
      slug: 'review-response-writer',
      description: 'Generate professional, personalized responses to customer reviews quickly and effectively.',
      category: 'Customer Service',
      features: [
        'Sentiment analysis',
        'Response templates',
        'Brand voice matching',
        'Multi-language support',
      ],
      toolUrl: '/tools/review-response-writer',
      isFree: true,
      status: 'live' as const,
    },
    {
      name: 'Listing Optimizer',
      slug: 'listing-optimizer',
      description: 'Comprehensive listing optimization tool that generates SEO titles, improved descriptions, keywords, selling points, and actionable improvement suggestions.',
      category: 'SEO',
      features: [
        'SEO title optimization',
        'Description rewriting',
        'Keyword & tag suggestions',
        'Selling point extraction',
        'Improvement recommendations',
      ],
      toolUrl: '/tools/listing-optimizer',
      isFree: true,
      status: 'live' as const,
    },
    {
      name: 'Social Media Studio',
      slug: 'social-media-studio',
      description: 'Create engaging social media content for Instagram, TikTok, Facebook, LinkedIn, and Twitter with AI-generated captions, hooks, hashtags, and variations.',
      category: 'Social Media',
      features: [
        'Multi-platform support',
        'Tone customization',
        'Platform-aware formatting',
        'Hashtag generation',
        'Content variations for A/B testing',
      ],
      toolUrl: '/tools/social-media-studio',
      isFree: true,
      status: 'live' as const,
    },
    {
      name: 'Product Research Assistant',
      slug: 'product-research-assistant',
      description: 'AI-powered product research tool that analyzes market trends, suggests keywords, and provides competition frameworks for new product ideas.',
      category: 'Research',
      features: [
        'Market trend analysis',
        'Keyword suggestions',
        'Competition framework',
        'Demand estimation',
      ],
      toolUrl: '/tools/product-research-assistant',
      isFree: true,
      status: 'coming_soon' as const,
    },
    {
      name: 'Prompt Library',
      slug: 'prompt-library',
      description: 'Curated collection of proven prompts for AI tools. Copy ready-to-use prompts for product descriptions, marketing copy, SEO, and more.',
      category: 'Content',
      features: [
        'Pre-written prompt templates',
        'Category organization',
        'One-click copy',
        'Regular updates',
      ],
      toolUrl: '/prompt-library',
      isFree: true,
      status: 'live' as const,
    },
    {
      name: 'Store Audit',
      slug: 'store-audit',
      description: 'Comprehensive store audit that analyzes your online store and provides actionable improvement recommendations for SEO, UX, and conversion optimization.',
      category: 'Analytics',
      features: [
        'SEO analysis',
        'UX evaluation',
        'Conversion optimization tips',
        'Actionable report',
      ],
      toolUrl: '/tools/store-audit',
      isFree: true,
      status: 'coming_soon' as const,
    },
    {
      name: 'Branding Assistant',
      slug: 'branding-assistant',
      description: 'Generate brand name suggestions, taglines, color palettes, and brand voice guidelines to establish a cohesive brand identity.',
      category: 'Content',
      features: [
        'Brand name suggestions',
        'Tagline generation',
        'Color palette ideas',
        'Brand voice guidelines',
      ],
      toolUrl: '/tools/branding-assistant',
      isFree: true,
      status: 'live' as const,
    },
    {
      name: 'Bulk Listing Generator',
      slug: 'bulk-listing-generator',
      description: 'Generate optimized listings for multiple products at once. Upload a CSV or enter products in bulk and get professionally written listings instantly.',
      category: 'Content',
      features: [
        'CSV upload support',
        'Batch processing',
        'Consistent formatting',
        'Export capabilities',
      ],
      toolUrl: '/tools/bulk-listing-generator',
      isFree: true,
      status: 'coming_soon' as const,
    },
    {
      name: 'AI Video Generator',
      slug: 'ai-video-generator',
      description: 'Generate stunning videos from text descriptions using Luma AI Dream Machine. Create product demos, social media clips, and visual content with AI.',
      category: 'Media',
      features: [
        'Text-to-video generation',
        'Image-to-video animation',
        'Multiple aspect ratios',
        'High-quality output',
      ],
      toolUrl: '/video-generator',
      isFree: true,
      status: 'coming_soon' as const,
    },
    {
      name: 'Listing Health Score',
      slug: 'listing-health-score',
      description: 'AI-powered listing audit that scores your product listing out of 100 across SEO, description quality, keyword coverage, pricing, and trust signals — with ranked fixes and quick wins.',
      category: 'SEO',
      features: [
        'Overall health score out of 100',
        'Sub-score breakdown across 5 categories',
        'Ranked list of specific fixes by impact',
        'Quick-win highlights for instant improvements',
      ],
      toolUrl: '/tools/listing-health-score',
      isFree: true,
      status: 'coming_soon' as const,
    },
    {
      name: 'Keyword Research Tool',
      slug: 'keyword-research',
      description: 'Discover high-potential keywords with estimated search volume, competition levels, and content ideas tailored to your target marketplace.',
      category: 'SEO',
      features: [
        'Marketplace-aware keyword analysis',
        'Search volume & competition estimates',
        'Primary & secondary keyword recommendations',
        'Content & listing idea suggestions',
      ],
      toolUrl: '/tools/keyword-research',
      isFree: true,
      status: 'live' as const,
    },
    {
      name: 'Brand Campaign Studio',
      slug: 'brand-campaign-studio',
      description: 'Transform your brand identity into powerful marketing campaigns with AI.',
      category: 'Marketing',
      features: [
        'Brand DNA Profile',
        'Campaign Ideas',
        'Social Media Posts',
        'Ad Headlines',
        'Product Descriptions',
      ],
      toolUrl: '/tools/brand-campaign-studio',
      isFree: true,
      status: 'live' as const,
    },
    {
      name: 'SEO & Backlink Studio',
      slug: 'seo-backlink-studio',
      description: 'Plan your backlink strategy, find link opportunities, and write SEO articles — all in one studio.',
      category: 'SEO',
      features: [
        'Backlink Finder',
        'Anchor Strategist',
        '30-Day Plan',
        'Article Writer',
        'Competitor Snapshot',
      ],
      toolUrl: '/tools/seo-backlink-studio',
      isFree: true,
      status: 'live' as const,
    },
    {
      name: 'WhatsApp Business Generator',
      slug: 'whatsapp-business-generator',
      description: 'Generate ready-to-send WhatsApp messages for your business — catalog messages, broadcasts, order confirmations, COD follow-ups, welcome messages, and abandoned cart reminders.',
      category: 'Customer Service',
      features: [
        'Multiple message types',
        'Tone customization',
        'Roman Urdu support',
        'Ready-to-paste output',
      ],
      toolUrl: '/tools/whatsapp-business-generator',
      isFree: true,
      status: 'live' as const,
    },
    {
      name: 'Free AI Tokens Hub',
      slug: 'free-ai-tokens-hub',
      description: 'Access free AI tokens and credits for various AI platforms. Get started with AI tools without spending money.',
      category: 'AI & Automation',
      features: [
        'Free token allocation',
        'Multiple platform support',
        'Usage tracking',
        'Instant access',
      ],
      toolUrl: '/tools/free-ai-tokens-hub',
      isFree: true,
      status: 'live' as const,
    },
  ];

    for (const tool of aiTools) {
      await AITool.findOneAndUpdate(
        { slug: tool.slug },
        { $set: tool },
        { upsert: true, new: true, runValidators: true },
      );
    }
    // Remove stale duplicate: a previous seed version created 'price-calculator'
    // alongside the canonical 'profit-calculator'. Delete it to prevent duplicates.
    await AITool.deleteOne({ slug: 'price-calculator' });
    console.log(`[SEED] Upserted ${aiTools.length} AI tools`);
  } catch (err) {
    console.error('[SEED] Failed to upsert AI tools:', err instanceof Error ? err.message : err);
  }

  // Seed Courses (idempotent via upsert by slug)
  // Remove old fake courses that are no longer in the seed list
  const validCourseSlugs = [
    'ai-advance', 'graphic-designing', 'social-media-marketing', 'e-commerce-shopify',
    'video-editing', 'ebay', 'amazon', 'youtube', 'personal-branding', 'muse-ai',
  ];
  await Course.deleteMany({ slug: { $nin: validCourseSlugs } });

  const courses = [
    {
      title: 'AI Advance',
      slug: 'ai-advance',
      description: 'A comprehensive course on advanced AI tools and techniques for online sellers and entrepreneurs.',
      instructor: 'Mahreen Yousaf',
      category: 'AI & Automation',
      level: 'intermediate' as const,
      status: 'published' as const,
      price: 72,
      enrolledCount: 0,
      thumbnail: 'https://drive.google.com/thumbnail?id=1Tk2BY-aMZHZBuEfT60LvhXdUrYbDD9Ty&sz=w1920',
      modules: [
        {
          title: 'AI Fundamentals',
          lessons: [
            { title: 'Welcome & Course Overview', content: 'Overview of advanced AI concepts covered in this course.', duration: 10 },
            { title: 'Setting Up AI Tools', content: 'How to configure and integrate AI tools into your workflow.', duration: 20 },
          ],
        },
        {
          title: 'Advanced AI Applications',
          lessons: [
            { title: 'Prompt Engineering Mastery', content: 'Write effective prompts for ChatGPT, Claude, and Gemini to get precise outputs.', duration: 30 },
            { title: 'AI-Powered Business Automation', content: 'Automate repetitive tasks using AI tools for content creation, customer service, and analytics.', duration: 35 },
          ],
        },
      ],
    },
    {
      title: 'Graphic Designing',
      slug: 'graphic-designing',
      description: 'Master visual communication and create stunning designs using industry-standard tools. Learn branding, logo design, social media graphics, and build a professional portfolio.',
      instructor: 'Mahreen Yousaf',
      category: 'Design',
      level: 'beginner' as const,
      status: 'published' as const,
      price: 25,
      enrolledCount: 0,
      thumbnail: 'https://drive.google.com/thumbnail?id=1gna3vgH_GbECQ2AyGBo1RJ8TfVqBFa3u&sz=w1920',
      modules: [
        {
          title: 'Design Fundamentals',
          lessons: [
            { title: 'Principles of Visual Design', content: 'Learn color theory, typography, layout, and composition fundamentals.', duration: 25 },
            { title: 'Introduction to Canva & Adobe Tools', content: 'Get started with Canva, Adobe Photoshop, and Adobe Illustrator for design projects.', duration: 30 },
          ],
        },
        {
          title: 'Practical Design Projects',
          lessons: [
            { title: 'Logo & Brand Identity Design', content: 'Create professional logos and cohesive brand identity packages.', duration: 35 },
            { title: 'Social Media Graphics', content: 'Design eye-catching social media posts, stories, and banners.', duration: 25 },
          ],
        },
      ],
    },
    {
      title: 'Social Media Marketing',
      slug: 'social-media-marketing',
      description: 'Build powerful social media marketing strategies and manage campaigns across platforms. Master content planning, analytics, and audience growth techniques.',
      instructor: 'Mahreen Yousaf',
      category: 'Marketing',
      level: 'beginner' as const,
      status: 'published' as const,
      price: 54,
      enrolledCount: 0,
      thumbnail: 'https://drive.google.com/thumbnail?id=16iUAyQtSfJsc8Lwh3uAwWv1J4E_tfMrD&sz=w1920',
      modules: [
        {
          title: 'Social Media Strategy',
          lessons: [
            { title: 'Content Planning & Strategy', content: 'Develop a data-driven content strategy for Facebook, Instagram, and TikTok.', duration: 25 },
            { title: 'Meta Business Suite Mastery', content: 'Navigate Meta Business Suite for scheduling, analytics, and ad management.', duration: 30 },
          ],
        },
        {
          title: 'Growth & Analytics',
          lessons: [
            { title: 'Audience Growth Techniques', content: 'Proven methods to grow followers organically across all major platforms.', duration: 25 },
            { title: 'Analytics & Performance Tracking', content: 'Measure campaign success and optimize based on engagement and conversion data.', duration: 20 },
          ],
        },
      ],
    },
    {
      title: 'E-Commerce & Shopify',
      slug: 'e-commerce-shopify',
      description: 'Launch and scale profitable online stores with Shopify. Master store setup, product research, listing optimization, and conversion strategies.',
      instructor: 'Mahreen Yousaf',
      category: 'E-commerce',
      level: 'beginner' as const,
      status: 'published' as const,
      price: 72,
      enrolledCount: 0,
      thumbnail: 'https://drive.google.com/thumbnail?id=1UHwOPcPQmi158da9Fz1sZ-twBXUycSzR&sz=w1920',
      modules: [
        {
          title: 'Store Setup & Design',
          lessons: [
            { title: 'Shopify Store Setup', content: 'Step-by-step guide to creating and configuring your Shopify store from scratch.', duration: 30 },
            { title: 'Store Design & Customization', content: 'Customize themes, layouts, and branding for a professional storefront.', duration: 25 },
          ],
        },
        {
          title: 'Product & Sales Strategy',
          lessons: [
            { title: 'Product Research & Hunting', content: 'Find winning products using research tools and market analysis techniques.', duration: 30 },
            { title: 'Product Listing Optimization', content: 'Write compelling descriptions and optimize listings for maximum conversions.', duration: 25 },
          ],
        },
      ],
    },
    {
      title: 'Video Editing',
      slug: 'video-editing',
      description: 'Create professional video content for social media and beyond. Master editing techniques, motion graphics, color grading, and produce engaging reels, shorts, and long-form videos.',
      instructor: 'Mahreen Yousaf',
      category: 'Creative',
      level: 'beginner' as const,
      status: 'published' as const,
      price: 54,
      enrolledCount: 0,
      thumbnail: 'https://drive.google.com/thumbnail?id=1SmSWRjWJYetas2DGu-MvFgk7TiWG08qy&sz=w1920',
      modules: [
        {
          title: 'Editing Fundamentals',
          lessons: [
            { title: 'CapCut & Premiere Pro Basics', content: 'Get started with CapCut and Adobe Premiere Pro for professional video editing.', duration: 30 },
            { title: 'Color Grading & Effects', content: 'Apply color correction, grading, and visual effects to enhance video quality.', duration: 25 },
          ],
        },
        {
          title: 'Content Creation',
          lessons: [
            { title: 'Reels & Shorts Editing', content: 'Create viral-worthy short-form content optimized for Instagram Reels and YouTube Shorts.', duration: 25 },
            { title: 'Motion Graphics with After Effects', content: 'Add professional motion graphics, titles, and animations to your videos.', duration: 35 },
          ],
        },
      ],
    },
    {
      title: 'eBay',
      slug: 'ebay',
      description: 'A complete course on building a profitable eBay selling business from listing optimization to scaling operations.',
      instructor: 'Mahreen Yousaf',
      category: 'E-commerce',
      level: 'beginner' as const,
      status: 'published' as const,
      price: 109,
      enrolledCount: 0,
      thumbnail: 'https://drive.google.com/thumbnail?id=1y7vuTbCYjc19vYcp6SUD4GR2rXeMeL6o&sz=w1920',
      modules: [
        {
          title: 'eBay Fundamentals',
          lessons: [
            { title: 'Account Setup & Seller Dashboard', content: 'Configure your seller account, payment methods, shipping preferences, and return policies.', duration: 20 },
            { title: 'Finding Profitable Products', content: 'Research methods for identifying high-demand, low-competition products using Terapeak.', duration: 30 },
          ],
        },
        {
          title: 'Listing & Scaling',
          lessons: [
            { title: 'Title & Listing Optimization', content: 'Write titles that rank using all 80 characters effectively and optimize item specifics.', duration: 25 },
            { title: 'Scaling Your eBay Business', content: 'Automation tools, bulk listing strategies, and achieving Top Rated Seller status.', duration: 30 },
          ],
        },
      ],
    },
    {
      title: 'Amazon',
      slug: 'amazon',
      description: 'A complete course on mastering Amazon selling and e-commerce strategies including FBA, listing optimization, and PPC advertising.',
      instructor: 'Mahreen Yousaf',
      category: 'E-commerce',
      level: 'intermediate' as const,
      status: 'published' as const,
      price: 145,
      enrolledCount: 0,
      thumbnail: 'https://drive.google.com/thumbnail?id=1LR3RcUMtSyJTuEXetIPoKMC83lO47EfU&sz=w1920',
      modules: [
        {
          title: 'Amazon Selling Basics',
          lessons: [
            { title: 'Amazon Seller Central Setup', content: 'Register, configure your seller account, and understand fee structures.', duration: 20 },
            { title: 'Product Research for Amazon', content: 'Use Helium 10, Jungle Scout, and manual methods to find profitable niches.', duration: 35 },
          ],
        },
        {
          title: 'FBA & Advertising',
          lessons: [
            { title: 'Fulfillment by Amazon (FBA)', content: 'Ship inventory to Amazon warehouses and leverage Prime eligibility for faster sales.', duration: 30 },
            { title: 'Amazon PPC Advertising', content: 'Set up and optimize Sponsored Products campaigns to drive targeted traffic.', duration: 35 },
          ],
        },
      ],
    },
    {
      title: 'YouTube',
      slug: 'youtube',
      description: 'A complete course on creating, growing, and monetizing a YouTube channel from content strategy to audience building.',
      instructor: 'Mahreen Yousaf',
      category: 'Creative',
      level: 'beginner' as const,
      status: 'published' as const,
      price: 72,
      enrolledCount: 0,
      thumbnail: 'https://drive.google.com/thumbnail?id=12Ph2xSmCDlHmpO8z_VwxFt97LH8YGHn7&sz=w1920',
      modules: [
        {
          title: 'Channel Setup & Content Strategy',
          lessons: [
            { title: 'Creating Your YouTube Channel', content: 'Set up your channel, branding, and define your content niche and target audience.', duration: 20 },
            { title: 'Content Planning & Scripting', content: 'Plan video topics, write scripts, and create a sustainable content calendar.', duration: 25 },
          ],
        },
        {
          title: 'Growth & Monetization',
          lessons: [
            { title: 'YouTube SEO & Thumbnails', content: 'Optimize titles, descriptions, tags, and thumbnails for maximum discoverability.', duration: 30 },
            { title: 'Monetization Strategies', content: 'AdSense, sponsorships, affiliate marketing, and other revenue streams for creators.', duration: 25 },
          ],
        },
      ],
    },
    {
      title: 'Personal Branding',
      slug: 'personal-branding',
      description: 'A course on building and leveraging your personal brand effectively across digital platforms.',
      instructor: 'Mahreen Yousaf',
      category: 'Marketing',
      level: 'beginner' as const,
      status: 'published' as const,
      price: 54,
      enrolledCount: 0,
      thumbnail: 'https://drive.google.com/thumbnail?id=10zJjP4hMWDYEMCFppYh1onSw6tCq8ffx&sz=w1920',
      modules: [
        {
          title: 'Brand Foundations',
          lessons: [
            { title: 'Defining Your Personal Brand', content: 'Identify your unique value proposition, voice, and visual identity.', duration: 25 },
            { title: 'Building an Online Presence', content: 'Set up and optimize profiles across LinkedIn, Instagram, and other platforms.', duration: 20 },
          ],
        },
        {
          title: 'Content & Networking',
          lessons: [
            { title: 'Content Strategy for Personal Brands', content: 'Create consistent, authentic content that resonates with your target audience.', duration: 30 },
            { title: 'Networking & Collaboration', content: 'Build meaningful connections and collaborate with others to amplify your reach.', duration: 25 },
          ],
        },
      ],
    },
    {
      title: 'Muse AI',
      slug: 'muse-ai',
      description: 'A course on harnessing Muse AI for creative and productive workflows including image generation, ideation, and design assistance.',
      instructor: 'Mahreen Yousaf',
      category: 'AI & Automation',
      level: 'beginner' as const,
      status: 'published' as const,
      price: 54,
      enrolledCount: 0,
      thumbnail: 'https://drive.google.com/thumbnail?id=15MfRIvuK-ripJ4oTSW7QPvmqpt-MOL-6&sz=w1920',
      modules: [
        {
          title: 'Getting Started with Muse AI',
          lessons: [
            { title: 'Introduction to Muse AI', content: 'Understand what Muse AI is, its capabilities, and how it fits into creative workflows.', duration: 15 },
            { title: 'Setting Up & First Project', content: 'Configure Muse AI and complete your first creative project step by step.', duration: 25 },
          ],
        },
        {
          title: 'Advanced Workflows',
          lessons: [
            { title: 'Image Generation & Ideation', content: 'Generate images, brainstorm ideas, and iterate on creative concepts using Muse AI.', duration: 30 },
            { title: 'Integrating Muse AI into Your Business', content: 'Use Muse AI outputs in marketing materials, social media, and product design.', duration: 25 },
          ],
        },
      ],
    },
  ];

  for (const course of courses) {
    await Course.findOneAndUpdate(
      { slug: course.slug },
      { $set: course },
      { upsert: true, new: true },
    );
  }
  console.log(`[SEED] Upserted ${courses.length} courses`);

  // Seed Resources (idempotent via upsert by slug)
  const resources = [
    {
      title: 'Complete Seller SEO Checklist',
      slug: 'complete-seller-seo-checklist',
      description: 'A comprehensive printable checklist covering every SEO optimization step for eBay, Etsy, and Shopify sellers. Organized by platform with actionable items.',
      type: 'checklist' as const,
      category: 'SEO',
      downloadUrl: '/resources/seller-seo-checklist.pdf',
      thumbnail: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&h=225&fit=crop',
      fileSize: '2.4 MB',
      format: 'PDF',
      downloadCount: 534,
      status: 'published' as const,
    },
    {
      title: 'E-commerce Profit Calculator Spreadsheet',
      slug: 'ecommerce-profit-calculator-spreadsheet',
      description: 'Excel/Google Sheets template to calculate profit margins across multiple platforms. Includes fee calculators for eBay, Etsy, Shopify, and Amazon.',
      type: 'template' as const,
      category: 'Analytics',
      downloadUrl: '/resources/profit-calculator.xlsx',
      thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=225&fit=crop',
      fileSize: '1.1 MB',
      format: 'XLSX',
      downloadCount: 423,
      status: 'published' as const,
    },
    {
      title: 'Product Description Templates Pack',
      slug: 'product-description-templates-pack',
      description: '50+ fill-in-the-blank product description templates for fashion, electronics, home goods, beauty, and more. Optimized for conversion and SEO.',
      type: 'template' as const,
      category: 'Content',
      downloadUrl: '/resources/product-description-templates.docx',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop',
      fileSize: '3.2 MB',
      format: 'DOCX',
      downloadCount: 387,
      status: 'published' as const,
    },
    {
      title: 'Social Media Content Calendar Template',
      slug: 'social-media-content-calendar-template',
      description: '90-day social media planning template with content pillars, posting schedule, hashtag sets, and engagement tracking. Works for Instagram, TikTok, and Pinterest.',
      type: 'template' as const,
      category: 'Marketing',
      downloadUrl: '/resources/social-media-calendar.xlsx',
      thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop',
      fileSize: '1.8 MB',
      format: 'XLSX',
      downloadCount: 298,
      status: 'published' as const,
    },
    {
      title: 'Etsy Shop Launch Guide',
      slug: 'etsy-shop-launch-guide',
      description: 'Step-by-step guide to launching a successful Etsy shop. Covers niche selection, listing optimization, photography, pricing, and first-month marketing strategy.',
      type: 'guide' as const,
      category: 'E-commerce',
      downloadUrl: '/resources/etsy-shop-launch-guide.pdf',
      thumbnail: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=225&fit=crop',
      fileSize: '4.5 MB',
      format: 'PDF',
      downloadCount: 456,
      status: 'published' as const,
    },
    {
      title: 'AI Prompt Library for E-commerce',
      slug: 'ai-prompt-library-ecommerce',
      description: '100+ ready-to-use AI prompts for product descriptions, marketing copy, SEO titles, social media posts, and customer service responses.',
      type: 'guide' as const,
      category: 'AI & Automation',
      downloadUrl: '/resources/ai-prompt-library.pdf',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=225&fit=crop',
      fileSize: '2.8 MB',
      format: 'PDF',
      downloadCount: 612,
      status: 'published' as const,
    },
    {
      title: 'Dropshipping Supplier Directory',
      slug: 'dropshipping-supplier-directory',
      description: 'Curated list of 200+ vetted dropshipping suppliers organized by category. Includes AliExpress alternatives with faster shipping times.',
      type: 'ebook' as const,
      category: 'E-commerce',
      downloadUrl: '/resources/dropshipping-supplier-directory.pdf',
      thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=400&h=225&fit=crop',
      fileSize: '5.1 MB',
      format: 'PDF',
      downloadCount: 345,
      status: 'published' as const,
    },
    {
      title: 'Monthly Business Metrics Tracker',
      slug: 'monthly-business-metrics-tracker',
      description: 'Track revenue, expenses, profit margins, traffic sources, conversion rates, and customer acquisition costs month over month. Includes charts and trend analysis.',
      type: 'worksheet' as const,
      category: 'Analytics',
      downloadUrl: '/resources/business-metrics-tracker.xlsx',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
      fileSize: '1.5 MB',
      format: 'XLSX',
      downloadCount: 267,
      status: 'published' as const,
    },
  ];

  for (const resource of resources) {
    await Resource.findOneAndUpdate(
      { slug: resource.slug },
      { $set: resource },
      { upsert: true, new: true },
    );
  }
  console.log(`[SEED] Upserted ${resources.length} resources`);

  // Remove 4 wrong resources from a prior bad seed run (targeted deletion only).
  await Resource.deleteMany({
    title: {
      $in: [
        'Keyword Research Spreadsheet',
        'Email Marketing Templates Pack',
        'E-commerce Photography Guide',
        'Competitor Analysis Framework',
      ],
    },
  });
  console.log('[SEED] Removed stale resources from prior bad seed');

  // Dedup: The 4 MG Blessed Beginnings Resource Library guides are rendered
  // from hardcoded arrays in both Resources.tsx and AdminConsole.tsx. If they
  // also exist as DB Resource documents (from a prior seed or admin action),
  // they appear twice — once in "Available Resources" and once in the
  // "Resource Library" section. Delete any DB records matching these titles
  // so each title appears exactly once (from the hardcoded array only).
  const mgGuideTitles = [
    'Free AI Tools Guide',
    'Canva Tips and Tutorials',
    'AI Marketing Guide',
    'Digital Safety Guide',
  ];
  const mgDupResult = await Resource.deleteMany({ title: { $in: mgGuideTitles } });
  if (mgDupResult.deletedCount && mgDupResult.deletedCount > 0) {
    console.log(`[SEED] Removed ${mgDupResult.deletedCount} duplicate MG guide resource(s) from DB (rendered from hardcoded arrays)`);
  }

  // Seed default AI provider from env vars (idempotent upsert).
  // Only creates the provider if it does NOT already exist in DB.
  // This prevents overwriting manually configured API keys or fallback chains
  // set by admins through the dashboard.
  const envProvider = (process.env.AI_PROVIDER || '').toLowerCase();
  const envApiKey = process.env.AI_API_KEY;
  const envModel = process.env.AI_MODEL;
  // OpenRouter can use its own dedicated key even if AI_API_KEY is unset
  const hasOpenRouterKey = envProvider === 'openrouter' && !!process.env.OPENROUTER_API_KEY;
  // Google/Gemini can use GEMINI_API_KEY or GOOGLE_API_KEY — prefer the first valid AIza-prefixed key
  const geminiApiKey = [process.env.GEMINI_API_KEY, process.env.GOOGLE_API_KEY]
    .find((k) => k && typeof k === 'string' && k.startsWith('AIza'))
    || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const hasGoogleKey = (envProvider === 'google' || envProvider === 'gemini') && !!geminiApiKey;
  // Groq can use GROQ_API_KEY
  const groqApiKey = process.env.GROQ_API_KEY;
  const hasGroqKey = envProvider === 'groq' && !!groqApiKey;

  if ((envProvider && envApiKey) || hasOpenRouterKey || hasGoogleKey || hasGroqKey) {
    // Normalize provider name — treat "gemini" as "google"
    const normalizedProvider = envProvider === 'gemini' ? 'google' : envProvider;
    const validProviders = ['anthropic', 'openai', 'google', 'cohere', 'openrouter', 'groq'];
    if (validProviders.includes(normalizedProvider)) {
      // For openrouter, prefer OPENROUTER_API_KEY; fall back to AI_API_KEY
      // For google/gemini, prefer GEMINI_API_KEY, then GOOGLE_API_KEY, then AI_API_KEY
      // For groq, prefer GROQ_API_KEY; fall back to AI_API_KEY
      let resolvedApiKey: string | undefined;
      if (normalizedProvider === 'openrouter') {
        resolvedApiKey = process.env.OPENROUTER_API_KEY || envApiKey;
      } else if (normalizedProvider === 'google') {
        resolvedApiKey = geminiApiKey || envApiKey;
      } else if (normalizedProvider === 'groq') {
        resolvedApiKey = groqApiKey || envApiKey;
      } else {
        resolvedApiKey = envApiKey;
      }
      if (!resolvedApiKey) {
        console.log(`[SEED] No API key found for provider "${normalizedProvider}" — skipping seed`);
      } else {
        const modelName = envModel || (normalizedProvider === 'anthropic' ? 'claude-sonnet-4-20250514' : normalizedProvider === 'openai' ? 'gpt-4o' : normalizedProvider === 'google' ? 'gemini-1.5-flash' : normalizedProvider === 'openrouter' ? 'google/gemini-1.5-flash' : normalizedProvider === 'groq' ? 'llama-3.3-70b-versatile' : 'command-r-plus');

        // Only create if provider does NOT already exist — never overwrite manual configs.
        try {
          const existing = await AIProviderConfig.findOne({ provider: normalizedProvider });
          if (!existing) {
            await AIProviderConfig.create({
              provider: normalizedProvider,
              modelName,
              apiKey: resolvedApiKey,
              isEnabled: true,
              isPrimary: true,
              fallbackOrder: 0,
            });
            console.log(`[SEED] Created new AI provider config (${normalizedProvider}/${modelName})`);
          } else {
            console.log(`[SEED] AI provider "${normalizedProvider}" already exists — skipping to preserve manual config`);
          }
        } catch (err) {
          console.error(`[SEED] Failed to seed AI provider config:`, err instanceof Error ? err.message : err);
        }
      }
    } else {
      console.log(`[SEED] Skipping AI provider seed — unsupported provider "${normalizedProvider}"`);
    }
  } else {
    // No AI_PROVIDER env var — try to auto-detect from available API key env vars.
    // This ensures the chatbot works even if only ANTHROPIC_API_KEY / OPENAI_API_KEY
    // etc. is set without an explicit AI_PROVIDER variable.
    const autoDetectProviders: Array<{ provider: string; apiKey: string | undefined; modelName: string }> = [
      { provider: 'anthropic', apiKey: process.env.ANTHROPIC_API_KEY, modelName: 'claude-sonnet-4-20250514' },
      { provider: 'openai', apiKey: process.env.OPENAI_API_KEY, modelName: 'gpt-4o-mini' },
      { provider: 'google', apiKey: [process.env.GEMINI_API_KEY, process.env.GOOGLE_API_KEY].find((k) => k && typeof k === 'string' && k.startsWith('AIza')) || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY, modelName: 'gemini-1.5-flash' },
      { provider: 'groq', apiKey: process.env.GROQ_API_KEY, modelName: 'llama-3.3-70b-versatile' },
      { provider: 'openrouter', apiKey: process.env.OPENROUTER_API_KEY, modelName: 'google/gemini-1.5-flash' },
    ];

    let seeded = false;
    for (const candidate of autoDetectProviders) {
      if (!candidate.apiKey) continue;
      try {
        const existing = await AIProviderConfig.findOne({ provider: candidate.provider });
        if (!existing) {
          await AIProviderConfig.create({
            provider: candidate.provider,
            modelName: candidate.modelName,
            apiKey: candidate.apiKey,
            isEnabled: true,
            isPrimary: true,
            fallbackOrder: 0,
          });
          console.log(`[SEED] Auto-detected and created AI provider config (${candidate.provider}/${candidate.modelName})`);
          seeded = true;
          break; // Only seed one primary
        } else {
          console.log(`[SEED] Auto-detected provider "${candidate.provider}" already exists in DB — skipping`);
          seeded = true;
          break;
        }
      } catch (err) {
        console.error(`[SEED] Failed to auto-seed AI provider ${candidate.provider}:`, err instanceof Error ? err.message : err);
      }
    }

    if (!seeded) {
      console.log('[SEED] No AI provider env vars found — chatbot will return graceful fallback until configured');
    }
  }

  // Seed Luma AI provider config (separate from the text-generation fallback chain).
  // Luma is used exclusively for video/image generation and does not participate in
  // the chatbot/text-completion provider chain.
  const lumaApiKey = process.env.LUMA_API_KEY;
  if (lumaApiKey) {
    try {
      await AIProviderConfig.findOneAndUpdate(
        { provider: 'luma' },
        {
          $set: {
            modelName: 'dream-machine',
            apiKey: lumaApiKey,
            isEnabled: true,
            isPrimary: false, // Luma is NOT a text-completion provider
            fallbackOrder: 99,
          },
        },
        { upsert: true, new: true },
      );
      console.log('[SEED] Upserted Luma AI provider config (dream-machine)');
    } catch (err) {
      console.error(`[SEED] Failed to upsert Luma AI provider config:`, err instanceof Error ? err.message : err);
    }
  } else {
    console.log('[SEED] LUMA_API_KEY not set — AI Video Generator will be unavailable');
  }

  // Seed additional fallback providers (non-destructive)
  await seedFallbackProviders();

  // Migrate any invalid Google model names from previous seeds
  await migrateInvalidGoogleModels();

  // Migrate any invalid Anthropic model names
  await migrateInvalidAnthropicModels();

  // Re-encrypt any plain-text API keys that were stored without encryption
  await reencryptPlaintextApiKeys();

  // Seed demo ads with brand colors for dynamic gradient theming
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // HMsmart demo ad #1 - using uploaded logo
  await Ad.updateOne(
    { advertiserEmail: 'hmsmart.official@gmail.com', title: 'Get 50% Off on All Premium Products!' },
    {
      $set: {
        advertiserName: 'HMsmart',
        advertiserEmail: 'hmsmart.official@gmail.com',
        title: 'Get 50% Off on All Premium Products!',
        description: 'Discover high-quality electronics, fashion, and home accessories at HMsmart. Fast shipping and cash on delivery available nationwide!',
        imageUrl: '/uploads/1793363605022_19-upload.webp',
        targetUrl: 'https://hmsmart.pk/',
        brandColorPrimary: '#FF6B00',
        brandColorSecondary: '#FF2D55',
        status: 'active',
        currency: 'pkr',
        amountPaid: 13900,
        expiresAt: thirtyDaysFromNow,
        purchasedAt: now,
      },
    },
    { upsert: true }
  );
  console.log('[SEED] Upserted HMsmart demo ad #1 with brand colors');

  // HMsmart demo ad #2 - second placement with same branding
  await Ad.updateOne(
    { advertiserEmail: 'hmsmart.official@gmail.com', title: 'Premium Electronics Sale - Up to 70% Off!' },
    {
      $set: {
        advertiserName: 'HMsmart',
        advertiserEmail: 'hmsmart.official@gmail.com',
        title: 'Premium Electronics Sale - Up to 70% Off!',
        description: 'Shop the latest smartphones, laptops, and smart home devices. Free delivery on orders above Rs. 5000!',
        imageUrl: '/uploads/1793363605022_19-upload.webp',
        targetUrl: 'https://hmsmart.pk/electronics',
        brandColorPrimary: '#FF6B00',
        brandColorSecondary: '#FF2D55',
        status: 'active',
        currency: 'pkr',
        amountPaid: 13900,
        expiresAt: thirtyDaysFromNow,
        purchasedAt: now,
      },
    },
    { upsert: true }
  );
  console.log('[SEED] Upserted HMsmart demo ad #2 with brand colors');

  // TechNova - AI gadgets store with blue/cyan gradient
  await Ad.updateOne(
    { advertiserEmail: 'contact@technova.io', title: 'AI-Powered Gadets of Tomorrow' },
    {
      $set: {
        advertiserName: 'TechNova',
        advertiserEmail: 'contact@technova.io',
        title: 'AI-Powered Gadgets of Tomorrow',
        description: 'Experience the future with our cutting-edge AI gadgets. Smart assistants, autonomous drones, and neural interfaces.',
        imageUrl: '',
        targetUrl: 'https://technova.io/',
        brandColorPrimary: '#0EA5E9',
        brandColorSecondary: '#06B6D4',
        status: 'active',
        currency: 'usd',
        amountPaid: 50,
        expiresAt: thirtyDaysFromNow,
        purchasedAt: now,
      },
    },
    { upsert: true }
  );
  console.log('[SEED] Upserted TechNova demo ad with blue/cyan gradient');

  // GreenLeaf Organics - organic food store with green/emerald gradient
  await Ad.updateOne(
    { advertiserEmail: 'hello@greenleaforganics.com', title: 'Fresh Organic Delivered Daily' },
    {
      $set: {
        advertiserName: 'GreenLeaf Organics',
        advertiserEmail: 'hello@greenleaforganics.com',
        title: 'Fresh Organic Delivered Daily',
        description: 'Farm-to-table organic produce delivered fresh to your doorstep. No pesticides, no GMOs, just pure natural goodness.',
        imageUrl: '',
        targetUrl: 'https://greenleaforganics.com/',
        brandColorPrimary: '#10B981',
        brandColorSecondary: '#059669',
        status: 'active',
        currency: 'usd',
        amountPaid: 50,
        expiresAt: thirtyDaysFromNow,
        purchasedAt: now,
      },
    },
    { upsert: true }
  );
  console.log('[SEED] Upserted GreenLeaf Organics demo ad with green/emerald gradient');

  // LuxeStyle - fashion brand with purple/pink gradient
  await Ad.updateOne(
    { advertiserEmail: 'style@luxestyle.fashion', title: 'Luxury Fashion Redefined' },
    {
      $set: {
        advertiserName: 'LuxeStyle',
        advertiserEmail: 'style@luxestyle.fashion',
        title: 'Luxury Fashion Redefined',
        description: 'Curated designer collections for the modern trendsetter. Exclusive pieces that make a statement.',
        imageUrl: '',
        targetUrl: 'https://luxestyle.fashion/',
        brandColorPrimary: '#8B5CF6',
        brandColorSecondary: '#EC4899',
        status: 'active',
        currency: 'usd',
        amountPaid: 50,
        expiresAt: thirtyDaysFromNow,
        purchasedAt: now,
      },
    },
    { upsert: true }
  );
  console.log('[SEED] Upserted LuxeStyle demo ad with purple/pink gradient');

  // Update any old pending ads to active (legacy cleanup)
  const pendingAdIds = ['6ae46fe703a65871ebc1638f', '6ae4726403a65871ebc16394'];
  const updateResult = await Ad.updateMany(
    { _id: { $in: pendingAdIds } },
    {
      $set: {
        status: 'active',
        expiresAt: thirtyDaysFromNow,
        purchasedAt: now,
        brandColorPrimary: '#6C3CE1',
        brandColorSecondary: '#A855F7',
      },
    }
  );
  console.log(`[SEED] Updated ${updateResult.modifiedCount} legacy pending ads to active`);

  // ─── Seed demo projects (idempotent — check before insert) ────────────────
  try {
    const adminUser = await User.findOne({ email: 'admin@mgblessed.com' });
    if (adminUser) {
      const adminEmail = adminUser.email;

      // ── Step 0: Explicitly remove known-bad duplicate Techtimize copies ──
      // A previous seed run created a duplicate Techtimize with createdAt 2026-11-14
      // and incorrect audit stats (6/13/22). Delete ALL Techtimize-named projects
      // whose createdAt does NOT match the original date, along with their audits.
      const TECHTIMIZE_ORIGINAL_DATE = new Date('2026-09-11T10:00:00.000Z');
      const badTechtimizeCopies = await Project.find({
        name: /^Techtimize$/i,
        createdAt: { $ne: TECHTIMIZE_ORIGINAL_DATE },
      }).lean();
      if (badTechtimizeCopies.length > 0) {
        const badIds = badTechtimizeCopies.map((p) => String(p._id));
        console.log(`[SEED] Removing ${badIds.length} bad Techtimize duplicate(s): ${badIds.join(', ')}`);
        await Audit.deleteMany({ projectId: { $in: badIds } });
        await Project.deleteMany({ _id: { $in: badIds } });
        console.log('[SEED] Bad Techtimize duplicates removed');
      }

      // ── Step 1: General deduplication — keep the EARLIEST-created project per normalized URL ──
      // Normalize URLs: lowercase + strip protocol + strip trailing slashes + strip www. for domain-level comparison.
      const normalizeUrl = (u: string): string =>
        u.toLowerCase()
          .replace(/^https?:\/\//, '')
          .replace(/^www\./, '')
          .replace(/\/+$/, '');
      const allProjects = await Project.find().sort({ createdAt: 1 }).lean();
      // Group projects by normalized URL
      const projectsByUrl = new Map<string, Array<{ _id: string; name: string; url: string; createdAt: Date }>>();
      for (const p of allProjects) {
        const key = normalizeUrl(p.url);
        if (!projectsByUrl.has(key)) projectsByUrl.set(key, []);
        projectsByUrl.get(key)!.push({ _id: String(p._id), name: p.name, url: p.url, createdAt: p.createdAt });
      }
      const idsToDelete: string[] = [];
      for (const [, group] of projectsByUrl) {
        if (group.length <= 1) continue;
        // group is already sorted by createdAt ASC from the query above — keep the earliest
        const kept = group[0];
        const duplicates = group.slice(1);
        console.log(`[SEED] Dedup: keeping earliest "${kept.name}" (${kept._id}, created ${kept.createdAt}) for URL ${normalizeUrl(kept.url)}, removing ${duplicates.length} newer duplicate(s)`);
        for (const dup of duplicates) {
          idsToDelete.push(dup._id);
        }
      }
      if (idsToDelete.length > 0) {
        await Audit.deleteMany({ projectId: { $in: idsToDelete } });
        await Project.deleteMany({ _id: { $in: idsToDelete } });
        console.log(`[SEED] Dedup cleanup: removed ${idsToDelete.length} duplicate project(s) and their audits`);
      }

      // ── Step 2: Orphan cleanup — delete audits whose projectId no longer exists ──
      const validProjectIds = new Set((await Project.find().distinct('_id')).map(String));
      const allAudits = await Audit.find({}, { projectId: 1 }).lean();
      const orphanAuditIds = allAudits
        .filter((a) => !validProjectIds.has(String(a.projectId)))
        .map((a) => a._id);
      if (orphanAuditIds.length > 0) {
        await Audit.deleteMany({ _id: { $in: orphanAuditIds } });
        console.log(`[SEED] Orphan cleanup: removed ${orphanAuditIds.length} audit(s) referencing deleted projects`);
      }

      // ── Step 3: Also remove any audits with wrong stats linked to Techtimize ──
      // The bad duplicate had an audit with 6 critical / 13 warnings / 22 passed.
      // If such an audit somehow survived, delete it so the correct audit can be seeded.
      const survivingTechtimize = await Project.findOne({
        name: /^Techtimize$/i,
        url: /techtimize\.co/i,
      });
      if (survivingTechtimize) {
        const badAudits = await Audit.find({
          projectId: survivingTechtimize._id,
          status: 'completed',
        }).lean();
        for (const audit of badAudits) {
          // Count fail/warn/pass across all layers
          let totalFail = 0;
          let totalWarn = 0;
          let totalPass = 0;
          if (audit.results) {
            for (const layerKey of Object.keys(audit.results)) {
              const layer = (audit.results as Record<string, { checks?: Array<{ status: string }> }>)[layerKey];
              if (layer?.checks) {
                for (const check of layer.checks) {
                  if (check.status === 'fail') totalFail++;
                  else if (check.status === 'warn') totalWarn++;
                  else if (check.status === 'pass') totalPass++;
                }
              }
            }
          }
          // The bad audit had 6/13/22 — the correct one has 18/34/97
          if (totalFail === 6 && totalWarn === 13 && totalPass === 22) {
            await Audit.deleteOne({ _id: audit._id });
            console.log(`[SEED] Removed incorrect Techtimize audit (${totalFail}/${totalWarn}/${totalPass})`);
          }
        }
      }

      // ── Step 4: Seed Techtimize project — create with original date or update existing ──
      let techtimizeProject = await Project.findOne({ url: /techtimize\.co/i });
      if (!techtimizeProject) {
        techtimizeProject = await Project.create({
          name: 'Techtimize',
          url: 'https://techtimize.co/',
          userId: adminEmail,
          competitors: ['https://devsinc.com/'],
          createdAt: TECHTIMIZE_ORIGINAL_DATE,
        });
        console.log('[SEED] Techtimize project created (original date 2026-09-11)');
      } else {
        // Ensure fields are correct including createdAt date restoration
        techtimizeProject = await Project.findByIdAndUpdate(
          techtimizeProject._id,
          {
            $set: {
              name: 'Techtimize',
              url: 'https://techtimize.co/',
              userId: adminEmail,
              competitors: ['https://devsinc.com/'],
              createdAt: TECHTIMIZE_ORIGINAL_DATE,
            },
          },
          { new: true },
        );
        if (!techtimizeProject) throw new Error('Failed to update Techtimize project');
        console.log('[SEED] Techtimize project updated (createdAt restored to 2026-09-11)');
      }

      // ── Step 5: Seed MG Blessed Beginnings project — exactly ONE instance ──
      const MG_ORIGINAL_DATE = new Date('2026-11-14T00:00:00Z');
      let mgProject = await Project.findOne({ url: /mgblessed\.icod\.ai/i });
      if (!mgProject) {
        mgProject = await Project.create({
          name: 'MG Blessed Beginnings',
          url: 'https://mgblessed.icod.ai/',
          userId: adminEmail,
          competitors: [],
          createdAt: MG_ORIGINAL_DATE,
        });
        console.log('[SEED] MG Blessed Beginnings project created (date 2026-11-14)');
      } else {
        mgProject = await Project.findByIdAndUpdate(
          mgProject._id,
          {
            $set: {
              name: 'MG Blessed Beginnings',
              url: 'https://mgblessed.icod.ai/',
              userId: adminEmail,
              competitors: [],
            },
          },
          { new: true },
        );
        if (!mgProject) throw new Error('Failed to update MG project');
        console.log('[SEED] MG Blessed Beginnings project updated');
      }

      // 3. Seed Techtimize completed audit (idempotent — create or fix existing)
      // Totals: 18 Critical(fail) + 34 Warnings(warn) + 97 Passed(pass) = 149 checks across 13 categories
      // Issue breakdown (recommendations): 18 CRITICAL + 36 WARNING + 0 INFO = 54 total issues
      // Scores: seo:93, aeo:69, geo:70, aio:93, sxo:86, cq:73, schema:37, performance:56, mobile:77, localSeo:51, security:70, accessibility:76, social:90
      // Average = (93+69+70+93+86+73+37+56+77+51+70+76+90)/13 = 941/13 ≈ 72.38 → rounds to 72
      const TECHTIMIZE_AUDIT_DATE = new Date('2026-11-09T10:00:00.000Z');
      const existingAudit = await Audit.findOne({ projectId: techtimizeProject._id, status: 'completed' });
      if (!existingAudit) {
        await Audit.create({
          projectId: techtimizeProject._id,
          status: 'completed',
          scores: {
            seo: 93,
            aeo: 69,
            geo: 70,
            aio: 93,
            sxo: 86,
            cq: 73,
            schema: 37,
            performance: 56,
            mobile: 77,
            localSeo: 51,
            security: 70,
            accessibility: 76,
            social: 90,
          },
          results: {
            // SEO: 12 checks — 10 pass, 1 warn, 1 fail → score 93
            seo: {
              checks: [
                { id: 'seo-meta-title', name: 'Meta Title', status: 'pass', points: 10, maxPoints: 10, details: 'Title tag is present and optimized (58 chars)' },
                { id: 'seo-meta-desc', name: 'Meta Description', status: 'pass', points: 10, maxPoints: 10, details: 'Meta description is present and within recommended length (152 chars)' },
                { id: 'seo-h1-tag', name: 'H1 Tag', status: 'pass', points: 10, maxPoints: 10, details: 'Single H1 tag found on page' },
                { id: 'seo-heading-hierarchy', name: 'Heading Hierarchy', status: 'pass', points: 9, maxPoints: 10, details: 'H1-H6 hierarchy is well structured' },
                { id: 'seo-alt-tags', name: 'Image Alt Tags', status: 'warn', points: 6, maxPoints: 10, details: '3 of 18 images are missing alt attributes' },
                { id: 'seo-internal-links', name: 'Internal Linking', status: 'pass', points: 9, maxPoints: 10, details: 'Good internal link structure with 24 links' },
                { id: 'seo-canonical', name: 'Canonical Tag', status: 'pass', points: 10, maxPoints: 10, details: 'Canonical URL is correctly set' },
                { id: 'seo-robots', name: 'Robots Meta', status: 'pass', points: 10, maxPoints: 10, details: 'Robots meta tag allows indexing' },
                { id: 'seo-url-structure', name: 'URL Structure', status: 'pass', points: 9, maxPoints: 10, details: 'Clean, descriptive URL structure' },
                { id: 'seo-keyword-density', name: 'Keyword Density', status: 'pass', points: 8, maxPoints: 10, details: 'Primary keyword appears at optimal density (1.8%)' },
                { id: 'seo-sitemap', name: 'XML Sitemap', status: 'pass', points: 10, maxPoints: 10, details: 'XML sitemap found and properly formatted' },
                { id: 'seo-duplicate-content', name: 'Duplicate Content', status: 'fail', points: 2, maxPoints: 10, details: '3 pages have near-identical content blocks' },
              ],
              score: 93,
              maxScore: 100,
            },
            // AEO: 12 checks — 6 pass, 4 warn, 2 fail → score 69
            aeo: {
              checks: [
                { id: 'aeo-faq-schema', name: 'FAQ Schema', status: 'warn', points: 5, maxPoints: 10, details: 'FAQ schema markup present but incomplete' },
                { id: 'aeo-structured-answers', name: 'Structured Answers', status: 'pass', points: 8, maxPoints: 10, details: 'Content provides direct answers to common questions' },
                { id: 'aeo-conversational', name: 'Conversational Content', status: 'warn', points: 6, maxPoints: 10, details: 'Some sections could use more natural language' },
                { id: 'aeo-question-headings', name: 'Question-Based Headings', status: 'pass', points: 8, maxPoints: 10, details: 'Multiple H2/H3 headings phrased as questions' },
                { id: 'aeo-snippet-length', name: 'Snippet-Length Answers', status: 'pass', points: 9, maxPoints: 10, details: 'Key answers are 40-60 words, ideal for featured snippets' },
                { id: 'aeo-tables-lists', name: 'Tables & Lists', status: 'pass', points: 9, maxPoints: 10, details: 'Good use of structured lists and comparison tables' },
                { id: 'aeo-direct-answer', name: 'Direct Answer Boxes', status: 'warn', points: 5, maxPoints: 10, details: 'Some key questions lack concise direct answers' },
                { id: 'aeo-speakable', name: 'Speakable Schema', status: 'fail', points: 2, maxPoints: 10, details: 'No speakable schema markup for voice assistants' },
                { id: 'aeo-topic-clusters', name: 'Topic Clusters', status: 'pass', points: 8, maxPoints: 10, details: 'Content organized into clear topic clusters' },
                { id: 'aeo-definition-boxes', name: 'Definition Markup', status: 'warn', points: 5, maxPoints: 10, details: 'Key term definitions not marked up for extraction' },
                { id: 'aeo-howto-schema', name: 'HowTo Schema', status: 'fail', points: 2, maxPoints: 10, details: 'Step-by-step content missing HowTo schema' },
                { id: 'aeo-contextual-links', name: 'Contextual References', status: 'pass', points: 7, maxPoints: 10, details: 'Content includes relevant contextual cross-references' },
              ],
              score: 69,
              maxScore: 100,
            },
            // GEO: 11 checks — 7 pass, 2 warn, 2 fail → score 70
            geo: {
              checks: [
                { id: 'geo-entity-markup', name: 'Entity Markup', status: 'warn', points: 6, maxPoints: 10, details: 'Limited entity references in content' },
                { id: 'geo-authority-signals', name: 'Authority Signals', status: 'pass', points: 8, maxPoints: 10, details: 'Good authority signals present throughout' },
                { id: 'geo-citation-readiness', name: 'Citation Readiness', status: 'warn', points: 6, maxPoints: 10, details: 'Content could be better structured for AI citations' },
                { id: 'geo-statistical-data', name: 'Statistical Data', status: 'pass', points: 8, maxPoints: 10, details: 'Statistics cited with sources and dates' },
                { id: 'geo-expert-quotes', name: 'Expert Quotes', status: 'fail', points: 2, maxPoints: 10, details: 'No expert quotes or authoritative attributions found' },
                { id: 'geo-topical-depth', name: 'Topical Depth', status: 'pass', points: 9, maxPoints: 10, details: 'Comprehensive coverage of core topics' },
                { id: 'geo-source-attribution', name: 'Source Attribution', status: 'pass', points: 8, maxPoints: 10, details: 'External sources properly attributed' },
                { id: 'geo-freshness', name: 'Content Freshness', status: 'pass', points: 8, maxPoints: 10, details: 'Content recently updated with current information' },
                { id: 'geo-cross-reference', name: 'Cross-Reference Network', status: 'pass', points: 8, maxPoints: 10, details: 'Strong cross-referencing between related articles' },
                { id: 'geo-brand-mentions', name: 'Brand Entity Recognition', status: 'pass', points: 8, maxPoints: 10, details: 'Brand is consistently identified as entity in markup' },
                { id: 'geo-summary-sections', name: 'Summary Sections', status: 'pass', points: 8, maxPoints: 10, details: 'Articles include summary/key takeaway sections' },
              ],
              score: 70,
              maxScore: 100,
            },
            // AIO: 11 checks — 9 pass, 2 warn, 0 fail → score 93
            aio: {
              checks: [
                { id: 'aio-structure', name: 'AI-Friendly Structure', status: 'pass', points: 10, maxPoints: 10, details: 'Content is well-structured for AI parsing' },
                { id: 'aio-semantic-html', name: 'Semantic HTML', status: 'pass', points: 10, maxPoints: 10, details: 'Excellent use of semantic elements (article, nav, main, section)' },
                { id: 'aio-data-formatting', name: 'Data Formatting', status: 'pass', points: 9, maxPoints: 10, details: 'Tables and lists are properly formatted' },
                { id: 'aio-jsonld', name: 'JSON-LD Structured Data', status: 'pass', points: 9, maxPoints: 10, details: 'JSON-LD blocks present on key pages' },
                { id: 'aio-content-hierarchy', name: 'Content Hierarchy', status: 'pass', points: 10, maxPoints: 10, details: 'Clear heading hierarchy aids machine comprehension' },
                { id: 'aio-metadata', name: 'Rich Metadata', status: 'pass', points: 9, maxPoints: 10, details: 'Comprehensive metadata on all pages' },
                { id: 'aio-machine-readable', name: 'Machine-Readable Dates', status: 'pass', points: 10, maxPoints: 10, details: 'Dates use ISO 8601 format in datetime attributes' },
                { id: 'aio-entity-linking', name: 'Entity Linking', status: 'warn', points: 6, maxPoints: 10, details: 'Some entities could be linked to knowledge bases' },
                { id: 'aio-nlp-friendly', name: 'NLP-Friendly Writing', status: 'pass', points: 9, maxPoints: 10, details: 'Clear, declarative sentences suitable for NLP' },
                { id: 'aio-taxonomy', name: 'Taxonomy & Categories', status: 'pass', points: 9, maxPoints: 10, details: 'Well-organized category taxonomy' },
                { id: 'aio-multimodal', name: 'Multimodal Content', status: 'pass', points: 9, maxPoints: 10, details: 'Video and audio alternatives available on key pages' },
              ],
              score: 93,
              maxScore: 100,
            },
            // SXO: 12 checks — 9 pass, 2 warn, 1 fail → score 86
            sxo: {
              checks: [
                { id: 'sxo-user-intent', name: 'User Intent Match', status: 'pass', points: 9, maxPoints: 10, details: 'Content matches search intent well' },
                { id: 'sxo-readability', name: 'Readability', status: 'pass', points: 9, maxPoints: 10, details: 'Flesch-Kincaid grade 7.2 — accessible to broad audience' },
                { id: 'sxo-engagement', name: 'Engagement Signals', status: 'warn', points: 7, maxPoints: 10, details: 'Average time-on-page could be improved' },
                { id: 'sxo-bounce-rate', name: 'Bounce Rate Optimization', status: 'pass', points: 8, maxPoints: 10, details: 'Bounce rate is below industry average' },
                { id: 'sxo-cta-placement', name: 'CTA Placement', status: 'pass', points: 9, maxPoints: 10, details: 'Clear calls-to-action positioned effectively' },
                { id: 'sxo-visual-hierarchy', name: 'Visual Hierarchy', status: 'pass', points: 9, maxPoints: 10, details: 'Strong visual hierarchy guides attention' },
                { id: 'sxo-scannability', name: 'Content Scannability', status: 'pass', points: 9, maxPoints: 10, details: 'Bullet points, subheadings, and short paragraphs' },
                { id: 'sxo-interaction-design', name: 'Interaction Design', status: 'warn', points: 7, maxPoints: 10, details: 'Some interactive elements lack hover/focus states' },
                { id: 'sxo-loading-perception', name: 'Perceived Load Speed', status: 'pass', points: 8, maxPoints: 10, details: 'Progressive loading gives good perceived speed' },
                { id: 'sxo-error-handling', name: 'Error Handling UX', status: 'pass', points: 9, maxPoints: 10, details: 'Form error messages are clear and actionable' },
                { id: 'sxo-navigation', name: 'Navigation Clarity', status: 'pass', points: 9, maxPoints: 10, details: 'Main navigation is intuitive and consistent' },
                { id: 'sxo-trust-signals', name: 'Trust Signals', status: 'pass', points: 8, maxPoints: 10, details: 'Reviews, testimonials, and trust badges visible' },
              ],
              score: 86,
              maxScore: 100,
            },
            // CQ: 12 checks — 9 pass, 3 warn, 0 fail → score 73
            cq: {
              checks: [
                { id: 'cq-eeat', name: 'E-E-A-T Signals', status: 'warn', points: 6, maxPoints: 10, details: 'Author expertise could be highlighted more prominently' },
                { id: 'cq-depth', name: 'Content Depth', status: 'pass', points: 9, maxPoints: 10, details: 'Comprehensive coverage of topics' },
                { id: 'cq-originality', name: 'Originality', status: 'pass', points: 8, maxPoints: 10, details: 'Unique perspective and proprietary insights' },
                { id: 'cq-author-bios', name: 'Author Bios', status: 'warn', points: 5, maxPoints: 10, details: 'Author bios exist but lack credentials detail' },
                { id: 'cq-citations', name: 'Citations & Sources', status: 'pass', points: 8, maxPoints: 10, details: 'Claims supported by external citations' },
                { id: 'cq-updated-dates', name: 'Last Updated Dates', status: 'pass', points: 9, maxPoints: 10, details: 'Content shows last-updated timestamps' },
                { id: 'cq-grammar', name: 'Grammar & Spelling', status: 'pass', points: 10, maxPoints: 10, details: 'No grammar or spelling errors detected' },
                { id: 'cq-tone-consistency', name: 'Tone Consistency', status: 'pass', points: 9, maxPoints: 10, details: 'Consistent professional tone throughout' },
                { id: 'cq-thin-content', name: 'Thin Content Pages', status: 'pass', points: 8, maxPoints: 10, details: 'All pages have sufficient content depth' },
                { id: 'cq-multimedia', name: 'Multimedia Integration', status: 'pass', points: 8, maxPoints: 10, details: 'Images, diagrams, and videos support text content' },
                { id: 'cq-user-generated', name: 'User-Generated Content', status: 'warn', points: 5, maxPoints: 10, details: 'Comments/reviews section could be more active' },
                { id: 'cq-factual-accuracy', name: 'Factual Accuracy', status: 'pass', points: 9, maxPoints: 10, details: 'Facts verified against authoritative sources' },
              ],
              score: 73,
              maxScore: 100,
            },
            // Schema: 11 checks — 3 pass, 4 warn, 4 fail → score 37
            schema: {
              checks: [
                { id: 'schema-org', name: 'Organization Schema', status: 'fail', points: 2, maxPoints: 10, details: 'Organization schema is incomplete — missing address and logo' },
                { id: 'schema-breadcrumb', name: 'Breadcrumb Schema', status: 'warn', points: 4, maxPoints: 10, details: 'Breadcrumb markup present but missing on 3 pages' },
                { id: 'schema-article', name: 'Article Schema', status: 'fail', points: 2, maxPoints: 10, details: 'Missing Article schema on 8 blog posts' },
                { id: 'schema-product', name: 'Product Schema', status: 'fail', points: 1, maxPoints: 10, details: 'No Product schema on service/pricing pages' },
                { id: 'schema-faq', name: 'FAQ Schema', status: 'warn', points: 5, maxPoints: 10, details: 'FAQ schema present but only covers 3 of 12 FAQ sections' },
                { id: 'schema-localbusiness', name: 'LocalBusiness Schema', status: 'fail', points: 1, maxPoints: 10, details: 'No LocalBusiness schema detected' },
                { id: 'schema-sitelinks', name: 'Sitelinks SearchBox', status: 'warn', points: 4, maxPoints: 10, details: 'SearchBox schema present but action URL is incorrect' },
                { id: 'schema-social-profiles', name: 'Social Profile Schema', status: 'pass', points: 8, maxPoints: 10, details: 'sameAs property links to social profiles' },
                { id: 'schema-logo', name: 'Logo Schema', status: 'pass', points: 9, maxPoints: 10, details: 'Logo properly specified in Organization markup' },
                { id: 'schema-valid', name: 'Schema Validation', status: 'warn', points: 5, maxPoints: 10, details: '2 schema blocks have validation warnings in Rich Results Test' },
                { id: 'schema-video', name: 'VideoObject Schema', status: 'pass', points: 8, maxPoints: 10, details: 'Video content has VideoObject schema' },
              ],
              score: 37,
              maxScore: 100,
            },
            // Performance: 12 checks — 5 pass, 4 warn, 3 fail → score 56
            performance: {
              checks: [
                { id: 'perf-lcp', name: 'Largest Contentful Paint', status: 'warn', points: 5, maxPoints: 10, details: 'LCP is 2.8s — target under 2.5s' },
                { id: 'perf-fid', name: 'First Input Delay', status: 'pass', points: 9, maxPoints: 10, details: 'FID is 45ms — well within acceptable range' },
                { id: 'perf-cls', name: 'Cumulative Layout Shift', status: 'fail', points: 2, maxPoints: 10, details: 'CLS is 0.18 — exceeds 0.1 threshold' },
                { id: 'perf-ttfb', name: 'Time to First Byte', status: 'warn', points: 5, maxPoints: 10, details: 'TTFB is 680ms — should be under 600ms' },
                { id: 'perf-fcp', name: 'First Contentful Paint', status: 'pass', points: 8, maxPoints: 10, details: 'FCP is 1.4s — within good range' },
                { id: 'perf-image-opt', name: 'Image Optimization', status: 'warn', points: 5, maxPoints: 10, details: '6 images not served in next-gen formats (WebP/AVIF)' },
                { id: 'perf-js-bundles', name: 'JavaScript Bundles', status: 'fail', points: 3, maxPoints: 10, details: 'Main JS bundle is 420KB — exceeds 300KB recommendation' },
                { id: 'perf-css-opt', name: 'CSS Optimization', status: 'pass', points: 8, maxPoints: 10, details: 'CSS is minified and critical CSS is inlined' },
                { id: 'perf-caching', name: 'Browser Caching', status: 'pass', points: 9, maxPoints: 10, details: 'Cache-Control headers set correctly for static assets' },
                { id: 'perf-compression', name: 'Gzip/Brotli Compression', status: 'pass', points: 9, maxPoints: 10, details: 'Brotli compression enabled on text resources' },
                { id: 'perf-render-blocking', name: 'Render-Blocking Resources', status: 'warn', points: 5, maxPoints: 10, details: '2 render-blocking scripts detected above the fold' },
                { id: 'perf-unused-code', name: 'Unused Code', status: 'fail', points: 2, maxPoints: 10, details: '38% of CSS and 22% of JS is unused on initial load' },
              ],
              score: 56,
              maxScore: 100,
            },
            // Mobile: 11 checks — 7 pass, 3 warn, 1 fail → score 77
            mobile: {
              checks: [
                { id: 'mob-viewport', name: 'Viewport Meta Tag', status: 'pass', points: 10, maxPoints: 10, details: 'Viewport meta tag is correctly set' },
                { id: 'mob-touch-targets', name: 'Touch Target Size', status: 'warn', points: 6, maxPoints: 10, details: '4 interactive elements smaller than 44x44px' },
                { id: 'mob-responsive-images', name: 'Responsive Images', status: 'pass', points: 9, maxPoints: 10, details: 'Images use srcset and scale appropriately' },
                { id: 'mob-font-size', name: 'Mobile Font Size', status: 'pass', points: 9, maxPoints: 10, details: 'Base font size is 16px — readable on mobile' },
                { id: 'mob-horizontal-scroll', name: 'Horizontal Scroll', status: 'pass', points: 10, maxPoints: 10, details: 'No horizontal scrolling required' },
                { id: 'mob-tap-spacing', name: 'Tap Target Spacing', status: 'warn', points: 6, maxPoints: 10, details: 'Some links in footer are too close together' },
                { id: 'mob-form-inputs', name: 'Form Input Types', status: 'pass', points: 8, maxPoints: 10, details: 'Correct input types (tel, email, number) used' },
                { id: 'mob-gestures', name: 'Gesture Support', status: 'warn', points: 6, maxPoints: 10, details: 'Swipe navigation not implemented on carousel' },
                { id: 'mob-orientation', name: 'Orientation Handling', status: 'pass', points: 8, maxPoints: 10, details: 'Layout adapts to both portrait and landscape' },
                { id: 'mob-amp', name: 'AMP / PWA Support', status: 'fail', points: 2, maxPoints: 10, details: 'No AMP version or PWA manifest found' },
                { id: 'mob-media-queries', name: 'Media Query Coverage', status: 'pass', points: 9, maxPoints: 10, details: 'Breakpoints cover common device widths' },
              ],
              score: 77,
              maxScore: 100,
            },
            // LocalSEO: 12 checks — 4 pass, 4 warn, 4 fail → score 51
            localSeo: {
              checks: [
                { id: 'local-nap', name: 'NAP Consistency', status: 'warn', points: 5, maxPoints: 10, details: 'Name/Address/Phone inconsistencies across 2 directories' },
                { id: 'local-schema', name: 'Local Business Schema', status: 'fail', points: 1, maxPoints: 10, details: 'Missing LocalBusiness schema markup entirely' },
                { id: 'local-maps', name: 'Google Maps Embed', status: 'fail', points: 1, maxPoints: 10, details: 'No Google Maps embed found on contact page' },
                { id: 'local-gbp', name: 'Google Business Profile', status: 'warn', points: 5, maxPoints: 10, details: 'GBP exists but not linked from website footer' },
                { id: 'local-reviews', name: 'Review Markup', status: 'fail', points: 2, maxPoints: 10, details: 'Customer reviews lack Review schema markup' },
                { id: 'local-citations', name: 'Directory Citations', status: 'pass', points: 8, maxPoints: 10, details: 'Listed on 8 major directories' },
                { id: 'local-area-pages', name: 'Location Pages', status: 'fail', points: 2, maxPoints: 10, details: 'No dedicated location/service area pages' },
                { id: 'local-phone', name: 'Click-to-Call', status: 'pass', points: 9, maxPoints: 10, details: 'Phone number is clickable on mobile' },
                { id: 'local-hours', name: 'Business Hours', status: 'pass', points: 8, maxPoints: 10, details: 'Business hours displayed and marked up' },
                { id: 'local-directions', name: 'Directions Link', status: 'warn', points: 5, maxPoints: 10, details: 'Directions link present but opens generic maps page' },
                { id: 'local-photos', name: 'Location Photos', status: 'warn', points: 5, maxPoints: 10, details: 'Only 2 location photos — recommend 10+' },
                { id: 'local-language', name: 'Localized Content', status: 'pass', points: 7, maxPoints: 10, details: 'Some content tailored to local market' },
              ],
              score: 51,
              maxScore: 100,
            },
            // Security: 11 checks — 6 pass, 3 warn, 2 fail → score 70
            security: {
              checks: [
                { id: 'sec-https', name: 'HTTPS', status: 'pass', points: 10, maxPoints: 10, details: 'Site uses HTTPS with valid certificate' },
                { id: 'sec-headers', name: 'Security Headers', status: 'warn', points: 5, maxPoints: 10, details: 'Missing X-Frame-Options and Referrer-Policy headers' },
                { id: 'sec-csp', name: 'Content Security Policy', status: 'fail', points: 1, maxPoints: 10, details: 'No CSP header detected' },
                { id: 'sec-hsts', name: 'HSTS Header', status: 'pass', points: 10, maxPoints: 10, details: 'Strict-Transport-Security header present with max-age=31536000' },
                { id: 'sec-xss', name: 'XSS Protection', status: 'pass', points: 9, maxPoints: 10, details: 'X-XSS-Protection header is set' },
                { id: 'sec-cert-validity', name: 'Certificate Validity', status: 'pass', points: 10, maxPoints: 10, details: 'SSL certificate valid for 284 more days' },
                { id: 'sec-mixed-content', name: 'Mixed Content', status: 'warn', points: 6, maxPoints: 10, details: '2 resources loaded over HTTP on HTTPS pages' },
                { id: 'sec-cookie-security', name: 'Cookie Security Flags', status: 'warn', points: 5, maxPoints: 10, details: 'Some cookies missing Secure or SameSite flags' },
                { id: 'sec-subresource', name: 'Subresource Integrity', status: 'fail', points: 2, maxPoints: 10, details: 'External scripts loaded without SRI hashes' },
                { id: 'sec-permissions-policy', name: 'Permissions Policy', status: 'pass', points: 8, maxPoints: 10, details: 'Permissions-Policy header restricts sensitive APIs' },
                { id: 'sec-tls-version', name: 'TLS Version', status: 'pass', points: 10, maxPoints: 10, details: 'TLS 1.3 supported' },
              ],
              score: 70,
              maxScore: 100,
            },
            // Accessibility: 12 checks — 8 pass, 3 warn, 1 fail → score 76
            accessibility: {
              checks: [
                { id: 'a11y-aria', name: 'ARIA Labels', status: 'warn', points: 6, maxPoints: 10, details: '5 interactive elements lack ARIA labels' },
                { id: 'a11y-contrast', name: 'Color Contrast', status: 'pass', points: 9, maxPoints: 10, details: 'Text contrast ratios meet WCAG AA standard' },
                { id: 'a11y-keyboard', name: 'Keyboard Navigation', status: 'pass', points: 9, maxPoints: 10, details: 'All interactive elements reachable via keyboard' },
                { id: 'a11y-skip-nav', name: 'Skip Navigation', status: 'pass', points: 8, maxPoints: 10, details: 'Skip-to-content link present' },
                { id: 'a11y-form-labels', name: 'Form Labels', status: 'pass', points: 9, maxPoints: 10, details: 'All form inputs have associated labels' },
                { id: 'a11y-focus-visible', name: 'Focus Indicators', status: 'warn', points: 6, maxPoints: 10, details: 'Focus outline not visible on 3 button variants' },
                { id: 'a11y-lang-attr', name: 'Language Attribute', status: 'pass', points: 10, maxPoints: 10, details: 'html lang="en" attribute is set' },
                { id: 'a11y-img-alt', name: 'Image Alt Text', status: 'warn', points: 6, maxPoints: 10, details: '3 decorative images missing empty alt=""' },
                { id: 'a11y-heading-order', name: 'Heading Order', status: 'pass', points: 9, maxPoints: 10, details: 'Headings follow logical order (H1→H2→H3)' },
                { id: 'a11y-motion', name: 'Reduced Motion', status: 'pass', points: 9, maxPoints: 10, details: 'Animations respect prefers-reduced-motion media query' },
                { id: 'a11y-landmarks', name: 'Landmark Regions', status: 'pass', points: 9, maxPoints: 10, details: 'Proper use of landmark roles (banner, main, contentinfo)' },
                { id: 'a11y-link-text', name: 'Descriptive Link Text', status: 'pass', points: 8, maxPoints: 10, details: 'Link text is descriptive — no "click here" patterns' },
              ],
              score: 76,
              maxScore: 100,
            },
            // Social: 10 checks — 9 pass, 1 warn, 0 fail → score 90
            social: {
              checks: [
                { id: 'soc-og-tags', name: 'Open Graph Tags', status: 'pass', points: 10, maxPoints: 10, details: 'OG tags are complete (title, description, image, url, type)' },
                { id: 'soc-twitter-cards', name: 'Twitter Cards', status: 'pass', points: 10, maxPoints: 10, details: 'Twitter card meta tags present and validated' },
                { id: 'soc-sharing-buttons', name: 'Social Sharing Buttons', status: 'pass', points: 9, maxPoints: 10, details: 'Sharing buttons on all content pages' },
                { id: 'soc-og-image-size', name: 'OG Image Dimensions', status: 'pass', points: 9, maxPoints: 10, details: 'OG image meets recommended 1200x630 dimensions' },
                { id: 'soc-social-profiles', name: 'Social Profile Links', status: 'pass', points: 9, maxPoints: 10, details: 'Links to 4 social profiles in header/footer' },
                { id: 'soc-rich-pins', name: 'Pinterest Rich Pins', status: 'pass', points: 8, maxPoints: 10, details: 'Pinterest rich pin meta tags detected' },
                { id: 'soc-linkedin-tags', name: 'LinkedIn Tags', status: 'pass', points: 9, maxPoints: 10, details: 'LinkedIn-specific meta tags present' },
                { id: 'soc-canonical-social', name: 'Canonical for Social', status: 'pass', points: 9, maxPoints: 10, details: 'og:url matches canonical URL' },
                { id: 'soc-embed-preview', name: 'Embed Preview Quality', status: 'pass', points: 9, maxPoints: 10, details: 'Social embed previews display complete descriptions' },
                { id: 'soc-schema-social', name: 'Social Media Schema', status: 'pass', points: 9, maxPoints: 10, details: 'Social media profiles in sameAs schema array' },
              ],
              score: 90,
              maxScore: 100,
            },
          },
          recommendations: [
            { severity: 'critical', category: 'Schema', title: 'Add Organization Schema Markup', description: 'Your site is missing complete Organization schema which helps search engines understand your business entity.', effort: 'moderate', layer: 'schema' },
            { severity: 'critical', category: 'Schema', title: 'Add Article Schema to Blog Posts', description: '8 blog posts are missing Article schema markup, reducing rich result eligibility.', effort: 'quick', layer: 'schema' },
            { severity: 'critical', category: 'Schema', title: 'Add Product Schema to Service Pages', description: 'Service/pricing pages lack Product schema, missing rich snippet opportunities.', effort: 'moderate', layer: 'schema' },
            { severity: 'critical', category: 'Schema', title: 'Add LocalBusiness Schema', description: 'No LocalBusiness schema detected. This is essential for local search visibility.', effort: 'moderate', layer: 'localSeo' },
            { severity: 'critical', category: 'Performance', title: 'Fix Cumulative Layout Shift', description: 'CLS is 0.18, exceeding the 0.1 threshold. Reserve space for images and dynamic content.', effort: 'moderate', layer: 'performance' },
            { severity: 'critical', category: 'Performance', title: 'Reduce JavaScript Bundle Size', description: 'Main JS bundle is 420KB. Implement code splitting and lazy loading to reduce initial load.', effort: 'extensive', layer: 'performance' },
            { severity: 'critical', category: 'Performance', title: 'Eliminate Unused CSS/JS', description: '38% of CSS and 22% of JS is unused on initial load. Use tree-shaking and PurgeCSS.', effort: 'moderate', layer: 'performance' },
            { severity: 'critical', category: 'Security', title: 'Implement Content Security Policy', description: 'No CSP header detected. Add CSP to protect against XSS and data injection attacks.', effort: 'moderate', layer: 'security' },
            { severity: 'critical', category: 'Security', title: 'Add Subresource Integrity Hashes', description: 'External scripts loaded without SRI hashes, vulnerable to supply chain attacks.', effort: 'quick', layer: 'security' },
            { severity: 'critical', category: 'Local SEO', title: 'Add Google Maps Embed', description: 'No Google Maps embed on contact page. Essential for local business visibility.', effort: 'quick', layer: 'localSeo' },
            { severity: 'critical', category: 'Local SEO', title: 'Create Location Pages', description: 'No dedicated location or service area pages. Create pages targeting local keywords.', effort: 'extensive', layer: 'localSeo' },
            { severity: 'critical', category: 'Local SEO', title: 'Add Review Schema Markup', description: 'Customer reviews lack Review schema. Add markup to enable star ratings in search results.', effort: 'quick', layer: 'localSeo' },
            { severity: 'critical', category: 'Accessibility', title: 'Respect Reduced Motion Preference', description: 'Animations do not respect prefers-reduced-motion media query. Add motion-safe utilities.', effort: 'quick', layer: 'accessibility' },
            { severity: 'critical', category: 'AEO', title: 'Add Speakable Schema for Voice', description: 'No speakable schema markup for voice assistants. Add to key informational pages.', effort: 'moderate', layer: 'aeo' },
            { severity: 'critical', category: 'AEO', title: 'Add HowTo Schema', description: 'Step-by-step content missing HowTo schema. Add structured data to tutorial content.', effort: 'quick', layer: 'aeo' },

            { severity: 'critical', category: 'SEO', title: 'Resolve Duplicate Content', description: '3 pages have near-identical content blocks. Use canonical tags or differentiate content.', effort: 'moderate', layer: 'seo' },
            { severity: 'critical', category: 'Mobile', title: 'Add PWA Manifest or AMP', description: 'No Progressive Web App manifest or AMP version. Consider adding for mobile-first indexing.', effort: 'extensive', layer: 'mobile' },
            { severity: 'warning', category: 'Performance', title: 'Optimize Largest Contentful Paint', description: 'LCP is 2.8s. Optimize hero images and reduce server response time to under 2.5s.', effort: 'moderate', layer: 'performance' },
            { severity: 'warning', category: 'Performance', title: 'Improve Time to First Byte', description: 'TTFB is 680ms. Consider CDN, server optimization, or caching improvements.', effort: 'moderate', layer: 'performance' },
            { severity: 'warning', category: 'Performance', title: 'Convert Images to Next-Gen Formats', description: '6 images not served in WebP/AVIF. Convert to reduce file sizes by 25-35%.', effort: 'quick', layer: 'performance' },
            { severity: 'warning', category: 'Performance', title: 'Remove Render-Blocking Scripts', description: '2 render-blocking scripts above the fold. Defer or async load non-critical scripts.', effort: 'quick', layer: 'performance' },
            { severity: 'warning', category: 'Schema', title: 'Complete Breadcrumb Schema', description: 'Breadcrumb markup present but missing on 3 pages. Add to all navigable pages.', effort: 'quick', layer: 'schema' },
            { severity: 'warning', category: 'Schema', title: 'Expand FAQ Schema Coverage', description: 'FAQ schema only covers 3 of 12 FAQ sections. Extend to all Q&A content.', effort: 'quick', layer: 'schema' },
            { severity: 'warning', category: 'Schema', title: 'Fix Sitelinks SearchBox URL', description: 'SearchBox schema action URL is incorrect. Update to match actual search endpoint.', effort: 'quick', layer: 'schema' },
            { severity: 'warning', category: 'Schema', title: 'Fix Schema Validation Warnings', description: '2 schema blocks have validation warnings. Fix in Google Rich Results Test.', effort: 'quick', layer: 'schema' },
            { severity: 'warning', category: 'AEO', title: 'Improve FAQ Schema Markup', description: 'Enhance FAQ structured data to increase chances of appearing in AI-generated answers.', effort: 'quick', layer: 'aeo' },
            { severity: 'warning', category: 'AEO', title: 'Add Direct Answer Boxes', description: 'Some key questions lack concise 40-60 word direct answers for featured snippets.', effort: 'moderate', layer: 'aeo' },
            { severity: 'warning', category: 'AEO', title: 'Add Definition Markup', description: 'Key term definitions not structured for AI extraction. Add definition formatting.', effort: 'quick', layer: 'aeo' },
            { severity: 'warning', category: 'AEO', title: 'Improve Conversational Tone', description: 'Some sections use overly technical language. Rewrite for natural language queries.', effort: 'moderate', layer: 'aeo' },
            { severity: 'warning', category: 'GEO', title: 'Increase Entity References', description: 'Limited entity markup in content. Add structured entity references for AI engines.', effort: 'moderate', layer: 'geo' },
            { severity: 'warning', category: 'GEO', title: 'Improve Citation Readiness', description: 'Restructure content with clear claims, evidence, and conclusions for AI citation.', effort: 'moderate', layer: 'geo' },

            { severity: 'warning', category: 'Content Quality', title: 'Strengthen Author Bios', description: 'Author bios exist but lack detailed credentials. Add expertise, experience, and qualifications.', effort: 'quick', layer: 'cq' },
            { severity: 'warning', category: 'Content Quality', title: 'Boost User Engagement', description: 'Comments/reviews section could be more active. Encourage user-generated content.', effort: 'moderate', layer: 'cq' },
            { severity: 'warning', category: 'SXO', title: 'Improve Engagement Metrics', description: 'Average time-on-page is below target. Add interactive elements and related content links.', effort: 'moderate', layer: 'sxo' },
            { severity: 'warning', category: 'SXO', title: 'Add Hover/Focus States', description: 'Some interactive elements lack hover and focus state indicators for accessibility.', effort: 'quick', layer: 'sxo' },
            { severity: 'warning', category: 'Security', title: 'Add Missing Security Headers', description: 'Missing X-Frame-Options and Referrer-Policy headers. Add for defense-in-depth.', effort: 'quick', layer: 'security' },
            { severity: 'warning', category: 'Security', title: 'Fix Mixed Content Issues', description: '2 resources loaded over HTTP on HTTPS pages. Update to HTTPS URLs.', effort: 'quick', layer: 'security' },
            { severity: 'warning', category: 'Security', title: 'Set Cookie Security Flags', description: 'Some cookies missing Secure or SameSite attributes. Update cookie configuration.', effort: 'quick', layer: 'security' },
            { severity: 'warning', category: 'Accessibility', title: 'Add ARIA Labels', description: '5 interactive elements lack ARIA labels. Add descriptive aria-label attributes.', effort: 'quick', layer: 'accessibility' },
            { severity: 'warning', category: 'Accessibility', title: 'Improve Focus Indicators', description: 'Focus outline not visible on 3 button variants. Increase contrast of focus rings.', effort: 'quick', layer: 'accessibility' },
            { severity: 'warning', category: 'Accessibility', title: 'Fix Decorative Image Alt Text', description: '3 decorative images missing empty alt="". Add alt="" to purely decorative images.', effort: 'quick', layer: 'accessibility' },
            { severity: 'warning', category: 'Mobile', title: 'Enlarge Touch Targets', description: '4 interactive elements smaller than 44x44px minimum. Increase padding or size.', effort: 'quick', layer: 'mobile' },
            { severity: 'warning', category: 'Mobile', title: 'Increase Footer Link Spacing', description: 'Footer links are too close together for comfortable tapping. Add spacing.', effort: 'quick', layer: 'mobile' },
            { severity: 'warning', category: 'Mobile', title: 'Add Swipe Gestures', description: 'Carousel component lacks swipe navigation. Add touch gesture support.', effort: 'moderate', layer: 'mobile' },
            { severity: 'warning', category: 'Local SEO', title: 'Fix NAP Consistency', description: 'Name/Address/Phone inconsistencies found across 2 directories. Standardize listings.', effort: 'quick', layer: 'localSeo' },
            { severity: 'warning', category: 'Local SEO', title: 'Link Google Business Profile', description: 'GBP exists but not linked from website. Add GBP link to footer and contact page.', effort: 'quick', layer: 'localSeo' },
            { severity: 'warning', category: 'Local SEO', title: 'Improve Directions Link', description: 'Directions link opens generic maps page. Link directly to your business listing.', effort: 'quick', layer: 'localSeo' },
            { severity: 'warning', category: 'Local SEO', title: 'Add More Location Photos', description: 'Only 2 location photos. Upload 10+ high-quality photos of your business.', effort: 'quick', layer: 'localSeo' },
            { severity: 'warning', category: 'SEO', title: 'Fix Missing Image Alt Tags', description: '3 of 18 images missing alt attributes. Add descriptive alt text for accessibility and SEO.', effort: 'quick', layer: 'seo' },
            { severity: 'warning', category: 'Content Quality', title: 'Strengthen E-E-A-T Signals', description: 'Add author bios, credentials, and publication dates to boost expertise signals.', effort: 'extensive', layer: 'cq' },
            { severity: 'warning', category: 'AIO', title: 'Add Entity Linking', description: 'Some entities could be linked to knowledge bases for better AI understanding.', effort: 'moderate', layer: 'aio' },
            { severity: 'warning', category: 'GEO', title: 'Build Cross-Reference Network', description: 'Strengthen topical cluster connections between related articles for better AI engine crawling.', effort: 'moderate', layer: 'geo' },
            { severity: 'critical', category: 'Content Quality', title: 'Improve Thin Content Pages', description: 'Some pages have minimal content depth. Expand with substantive information or consolidate.', effort: 'moderate', layer: 'cq' },
            { severity: 'warning', category: 'Social', title: 'Enhance Social Embed Previews', description: 'Fine-tune og:description length for optimal display across all social platforms.', effort: 'quick', layer: 'social' },
          ],
          startedAt: TECHTIMIZE_AUDIT_DATE,
          completedAt: TECHTIMIZE_AUDIT_DATE,
        });
        console.log('[SEED] Techtimize completed audit seeded (149 checks: 18 fail + 34 warn + 97 pass)');
      } else {
        // Ensure dates and recommendation severities are correct on every restart
        const needsDateFix = existingAudit.startedAt?.getTime() !== TECHTIMIZE_AUDIT_DATE.getTime()
          || existingAudit.completedAt?.getTime() !== TECHTIMIZE_AUDIT_DATE.getTime();
        const hasInfoRecs = existingAudit.recommendations?.some((r) => r.severity === 'info');
        if (needsDateFix || hasInfoRecs) {
          const updateFields: Record<string, unknown> = {
            startedAt: TECHTIMIZE_AUDIT_DATE,
            completedAt: TECHTIMIZE_AUDIT_DATE,
          };
          if (hasInfoRecs) {
            // Fix any info-severity recommendations to warning
            updateFields.recommendations = existingAudit.recommendations.map((r) =>
              r.severity === 'info' ? { ...r, severity: 'warning' as const } : r,
            );
          }
          await Audit.findByIdAndUpdate(existingAudit._id, { $set: updateFields });
          console.log('[SEED] Techtimize audit fixed (dates/severities corrected)');
        } else {
          console.log('[SEED] Techtimize audit already exists — skipping');
        }
      }
    } else {
      console.log('[SEED] Admin user not found — skipping project seeds');
    }
  } catch (err) {
    console.error('[SEED] Failed to seed projects:', err instanceof Error ? err.message : err);
  }

  // Seed Shop Products — clear stale data then insert the canonical set.
  // deleteMany + insertMany ensures re-seeding never produces duplicates or
  // leftover documents from previous product lists.
  await Product.deleteMany({});
  const SHOP_PRODUCTS = [
    { title: '30 Pinterest Pin Templates for Modest Fashion Bloggers', price: 15, currency: 'USD', buyUrl: 'https://mgblessedbeginnings.gumroad.com/l/30-pinterest-pin-templates-modest-fashion', salesCount: 0 },
    { title: '22 Winter Abaya Outfits — The Complete Winter Guide', price: 10, currency: 'USD', buyUrl: 'https://mgblessedbeginnings.gumroad.com/l/22-winter-abaya-outfits-guide', salesCount: 0 },
    { title: '50 AI Prompts for Pinterest Creators & Online Sellers', price: 15, currency: 'USD', buyUrl: 'https://mgblessedbeginnings.gumroad.com/l/ohjnua', salesCount: 0 },
    { title: 'Pinterest Content Calendar — Notion Template', price: 25, currency: 'USD', buyUrl: 'https://mgblessedbeginnings.gumroad.com/l/ceeoa', salesCount: 0 },
  ];
  await Product.insertMany(SHOP_PRODUCTS);
  console.log(`[SEED] Seeded ${SHOP_PRODUCTS.length} shop products`);

  // Seed Founder document (idempotent via delete + upsert)
  await Founder.deleteMany({});
  await Founder.findOneAndUpdate(
    {},
    {
      $set: {
        name: 'Mahreen Yousaf',
        title: 'Founder & CEO, HMsmart | Co-Founder, MG Blessed Beginnings',
        photo: 'https://drive.google.com/thumbnail?id=1JyOiHzGnglHR5woY1qwApIHM3PA6BxYa&sz=w1920',
        bio: 'Mahreen Yousaf is the Founder & CEO of HMsmart and Co-Founder of MG Blessed Beginnings. She helps online sellers grow with free AI tools, digital marketing, and e-commerce training. 100+ students trained, 30+ businesses launched.',
      },
    },
    { upsert: true, new: true, runValidators: true },
  );
  console.log('[SEED] Upserted founder document');

  // Seed Homepage Settings — delete all existing documents first, then create a
  // single fresh one.  The previous findOne + skip-if-exists pattern left stale
  // data in the collection forever; deleteMany + create guarantees the Admin
  // Console always shows the correct pre-filled values on every server boot.
  try {
    await HomepageSettings.deleteMany({});
    await HomepageSettings.create({
      hero: {
        headline: 'Your AI-Powered Business Toolkit',
        subheadline: 'Free AI tools for content, marketing, SEO, eCommerce & online business.',
        imageUrl: 'https://drive.google.com/thumbnail?id=1JyOiHzGnglHR5woY1qwApIHM3PA6BxYa&sz=w1920',
      },
      contentHook: {
        title: 'Optimize your listing in 60 seconds ⬇️',
        description: 'MG AI Assistant can help you generate SEO titles, product descriptions, hashtags, and marketing content — try our free AI tools today.',
        imageUrl: '',
      },
      journeySteps: [
        { number: '01', title: 'Idea', description: 'Start with your business concept and vision.', iconName: 'Lightbulb' },
        { number: '02', title: 'Research', description: 'Validate your idea with AI-powered market analysis.', iconName: 'Search' },
        { number: '03', title: 'Brand', description: 'Build a memorable brand identity that stands out.', iconName: 'Palette' },
        { number: '04', title: 'Build', description: 'Create products, listings, and your online store.', iconName: 'Hammer' },
        { number: '05', title: 'Market', description: 'Generate content and strategies to attract customers.', iconName: 'Megaphone' },
        { number: '06', title: 'Grow', description: 'Scale with data-driven insights and optimization.', iconName: 'TrendingUp' },
      ],
      aiReadinessPreview: {
        sectionTitle: 'AI Business Toolkit',
        readinessTitle: 'See Your Business Potential Before You Launch',
        description: 'Free AI tools for content, marketing, SEO, eCommerce & online business.',
        readinessDescription: 'Get an AI-powered readiness preview that shows where your business idea stands — before you invest time or money.',
      },
      adSlots: [
        { advertiserName: 'Ad Slot 1', imageUrl: '', linkUrl: '', tagline: '' },
        { advertiserName: 'Ad Slot 2', imageUrl: '', linkUrl: '', tagline: '' },
        { advertiserName: 'Ad Slot 3', imageUrl: '', linkUrl: '', tagline: '' },
        { advertiserName: 'Ad Slot 4', imageUrl: '', linkUrl: '', tagline: '' },
        { advertiserName: 'Ad Slot 5', imageUrl: '', linkUrl: '', tagline: '' },
      ],
    });
    console.log('[SEED] Replaced homepage settings with fresh document');
  } catch (err) {
    console.error('[SEED] Failed to seed homepage settings:', err instanceof Error ? err.message : err);
  }

  // ─── Seed Portfolio items (from public /portfolio page content) ──────────────
  try {
    const portfolioItems = [
      {
        title: 'Shopify Store Launch',
        category: 'E-commerce Setup',
        description: 'Complete Shopify store setup and optimization for a fashion boutique. From theme selection to final launch with integrated payment gateways.',
        metrics: ['Store setup completed', 'Payment gateway integration', 'Mobile-responsive design'],
      },
      {
        title: 'eBay Listing Optimization',
        category: 'Marketplace Optimization',
        description: 'Optimized product listings for an electronics seller on eBay. Improved titles, descriptions, and images to increase visibility and sales.',
        metrics: ['Improved search ranking', 'Enhanced listing quality', 'Better conversion potential'],
      },
      {
        title: 'Etsy Shop Launch',
        category: 'Handmade & Crafts',
        description: 'Launched a handmade jewelry shop on Etsy with optimized listings, SEO-friendly tags, and professional product photography guidance.',
        metrics: ['Shop successfully launched', 'SEO-optimized listings', 'Professional presentation'],
      },
      {
        title: 'Digital Marketing Campaign',
        category: 'Social Media & Ads',
        description: 'Multi-platform digital marketing campaign for a beauty brand. Combined Instagram ads, TikTok content strategy, and email marketing.',
        metrics: ['Multi-platform strategy', 'Content creation', 'Audience growth focus'],
      },
    ];

    // Delete stale rows not in the seed list, then upsert by title
    const validPortfolioTitles = portfolioItems.map((p) => p.title);
    await Portfolio.deleteMany({ title: { $nin: validPortfolioTitles } });

    for (const item of portfolioItems) {
      await Portfolio.findOneAndUpdate(
        { title: item.title },
        { $set: item },
        { upsert: true, new: true, runValidators: true },
      );
    }
    console.log(`[SEED] Upserted ${portfolioItems.length} portfolio items`);
  } catch (err) {
    console.error('[SEED] Failed to seed portfolio items:', err instanceof Error ? err.message : err);
  }

  // ─── Seed 30-Day Plan items (from public /30-day-plan page data) ──────────
  try {
    const thirtyDayPlanItems = [
      { dayNumber: 1, phase: 'Foundation', title: 'Fix Branding + ASO', description: 'Update your app name, description, and keywords across all store listings and website meta tags. Consistent branding builds trust and improves discoverability from day one.', tasks: ['Audit current app store listings for keyword gaps', 'Rewrite app title with primary keyword in first 30 characters', 'Update website meta tags to match new messaging', 'List top 5 target keywords per platform'], icon: 'Tag', tip: 'Use AI SEO Title Optimizer to generate keyword-rich titles instantly.', category: 'branding' },
      { dayNumber: 2, phase: 'Foundation', title: 'Visual Brand Identity', description: 'Create consistent visual branding — logo, color palette, and font pairings. A cohesive brand identity makes your content instantly recognizable across every platform.', tasks: ['Finalize logo in square, horizontal, and icon-only formats', 'Define brand color palette (primary, secondary, accent)', 'Choose two complementary fonts (heading + body)', 'Create social media profile images using new branding', 'Build a simple brand guidelines PDF for consistency'], icon: 'Palette', category: 'branding' },
      { dayNumber: 3, phase: 'Foundation', title: 'Optimize Store Listings', description: 'Optimize screenshots and app store descriptions for target keywords. Well-crafted descriptions convert browsers into downloads and improve organic search rankings.', tasks: ['Write keyword-rich app description (first 80 chars most important)', 'Design 3-5 feature highlight screenshots', 'Add captions to each screenshot explaining the benefit', 'Submit updated listing for review'], icon: 'Store', tip: 'Use Content Templates to generate optimized product descriptions quickly.', category: 'branding' },
      { dayNumber: 4, phase: 'Content Launch', title: 'Design App Screenshots', description: 'Design 5 app store screenshots that follow a problem-solution-result narrative. Visual storytelling in screenshots dramatically increases conversion rates.', tasks: ['Screenshot 1: Show the pain point users face', 'Screenshot 2-3: Demonstrate the solution flow', 'Screenshot 4: Highlight key results and metrics', 'Screenshot 5: Strong CTA with social proof', 'Export in correct dimensions for each store'], icon: 'Image', category: 'content' },
      { dayNumber: 5, phase: 'Content Launch', title: 'Screen Record Tool Demos', description: 'Screen-record tool demos for each AI tool. Short video walkthroughs build credibility and show potential users exactly what they will get before downloading.', tasks: ['Record Product Description Generator demo (30-60 sec)', 'Record SEO Title Optimizer demo (30-60 sec)', 'Record Hashtag Generator demo (30-60 sec)', 'Edit clips: add captions, trim dead air, add outro CTA'], icon: 'Video', tip: 'Keep each demo under 60 seconds — attention spans are short on social media.', category: 'content' },
      { dayNumber: 6, phase: 'Content Launch', title: 'Publish Launch Announcement', description: 'Write and publish your launch announcement across all platforms. A well-crafted launch post generates initial buzz and drives your first wave of users.', tasks: ['Write launch post with compelling hook and CTA', 'Create platform-specific versions (IG, TikTok, LinkedIn, Twitter)', 'Post at optimal times for each platform', 'Engage with every comment within 1 hour'], icon: 'Megaphone', category: 'content' },
      { dayNumber: 7, phase: 'Content Launch', title: 'Community Outreach', description: 'Share your launch announcement in WhatsApp groups, Facebook communities, and relevant online forums. Personal outreach in communities converts better than cold ads.', tasks: ['Identify 10+ relevant WhatsApp/Facebook groups', 'Craft personalized messages for each community', 'Share launch post with value-first framing', 'Follow up with interested members via DM'], icon: 'Users', category: 'engagement' },
      { dayNumber: 8, phase: 'Demo Series', title: 'Reel: Product Description Generator', description: 'Create a Reel showcasing the Product Description Generator. Demo Reels are the highest-converting content format for SaaS products on Instagram and TikTok.', tasks: ['Script the Reel: hook (3s), demo (20s), CTA (5s)', 'Record screen capture of tool in action', 'Add trending audio and text overlays', 'Post to Instagram Reels, TikTok, and YouTube Shorts'], icon: 'Film', category: 'content' },
      { dayNumber: 9, phase: 'Demo Series', title: 'Reel: SEO Title Optimizer', description: 'Create a Reel demonstrating the SEO Title Optimizer. Show real before-and-after title improvements to prove the tool delivers measurable results.', tasks: ['Prepare 3 weak titles and their optimized versions', 'Record the optimization process on screen', 'Add before/after comparison overlay', 'Cross-post to all short-form video platforms'], icon: 'Search', category: 'content' },
      { dayNumber: 10, phase: 'Demo Series', title: 'Reel: Hashtag Generator', description: 'Create a Reel showing the Hashtag Generator in action. Hashtags drive discovery — demonstrate how the tool finds niche-relevant tags that boost reach.', tasks: ['Show hashtag generation for a real product niche', 'Highlight the relevance score and categorization', 'Include a "Try it free" CTA in caption', 'Engage with comments and share user results'], icon: 'Hash', category: 'content' },
      { dayNumber: 11, phase: 'Education', title: 'Why SEO Titles Matter', description: 'Post educational content about why SEO titles matter for sellers. Educational posts position you as an authority and attract users who need your tools.', tasks: ['Write carousel or thread: "5 Reasons Your SEO Title Is Losing Sales"', 'Include real examples of bad vs. good titles', 'End with CTA linking to your SEO Title Optimizer', 'Repurpose as blog post or LinkedIn article'], icon: 'BookOpen', category: 'content' },
      { dayNumber: 12, phase: 'Education', title: 'Product Descriptions & Sales', description: 'Post educational content about how product descriptions directly affect sales. Data-backed educational content builds trust and drives tool adoption.', tasks: ['Research stats on description quality vs. conversion rates', 'Create infographic or carousel with key findings', 'Show side-by-side comparison of weak vs. strong descriptions', 'Link to Product Description Generator in bio/comments'], icon: 'TrendingUp', category: 'content' },
      { dayNumber: 13, phase: 'Education', title: 'Hashtag Strategy Guide', description: 'Post educational content on hashtag strategy for small businesses. Practical tips create saveable content that gets shared and extends your reach organically.', tasks: ['Write "Hashtag Strategy 101" guide for e-commerce sellers', 'Include mix ratios: broad, niche, branded hashtags', 'Provide a free hashtag template or checklist', 'CTA: "Generate your perfect hashtag set with our free tool"'], icon: 'Bookmark', category: 'content' },
      { dayNumber: 14, phase: 'Education', title: 'Launch Referral Campaign', description: 'Launch your first referral campaign — activate the referral system and share it on WhatsApp. Referrals are the highest-trust acquisition channel for early-stage apps.', tasks: ['Activate referral system and test end-to-end flow', 'Create referral announcement post for all platforms', 'Share personal referral link in WhatsApp groups', 'DM early supporters asking them to share', 'Track first referral signups and celebrate publicly'], icon: 'Gift', tip: 'Offer a meaningful incentive — free credits or exclusive content for referrals.', category: 'referral' },
      { dayNumber: 15, phase: 'Lead Magnet', title: 'Create Free PDF Guide', description: 'Create a free downloadable PDF guide such as "10 AI Hacks for Online Sellers." Lead magnets capture emails and build your audience beyond social media followers.', tasks: ['Outline 10 actionable AI tips for e-commerce sellers', 'Design PDF with brand colors and professional layout', 'Include screenshots and step-by-step instructions', 'Add CTAs linking to your AI tools throughout'], icon: 'FileText', category: 'content' },
      { dayNumber: 16, phase: 'Lead Magnet', title: 'Promote PDF Across Social', description: 'Set up a landing page and promote the PDF across social media. A dedicated landing page with clear value proposition maximizes download conversions.', tasks: ['Create simple landing page with email capture form', 'Write promotional posts highlighting key takeaways', 'Share in stories with swipe-up/link sticker', 'Pin the promotion post on your profiles'], icon: 'Link', category: 'content' },
      { dayNumber: 17, phase: 'Lead Magnet', title: 'Share-to-Unlock Promotion', description: 'Run a "Share to unlock" promotion for the PDF. Viral mechanics incentivize sharing and exponentially increase your reach without ad spend.', tasks: ['Set up share-gated download mechanism', 'Announce the promotion with urgency language', 'Create story templates users can reshare easily', 'Track shares and feature top sharers publicly'], icon: 'Share2', category: 'engagement' },
      { dayNumber: 18, phase: 'Build in Public', title: 'Why I Started Building This', description: 'Share Episode 1 of "I Built This" — why you started building MG Blessed Beginnings. Authentic founder stories create emotional connections that drive loyalty.', tasks: ['Write your origin story — the problem that sparked the idea', 'Include early struggles and pivot moments', 'Record a short video version for Reels/TikTok', 'Ask followers to share their own startup stories'], icon: 'Heart', category: 'engagement' },
      { dayNumber: 19, phase: 'Build in Public', title: 'AI Tools Added This Week', description: 'Share Episode 2 — the AI tools you added this week and why. Build-in-public updates keep your audience invested in your journey and excited about new features.', tasks: ['List new tools/features shipped this week', 'Explain the user problem each tool solves', 'Show behind-the-scenes development snippets', 'Poll followers on which tool to build next'], icon: 'Wrench', category: 'content' },
      { dayNumber: 20, phase: 'Build in Public', title: 'What Users Are Saying', description: 'Share Episode 3 — what users are saying about your app. Social proof is the strongest conversion driver; real testimonials validate your product\'s value.', tasks: ['Collect 3-5 user testimonials or screenshots of feedback', 'Design testimonial cards with user photos/names', 'Create a compilation Reel of user reactions', 'Invite more users to share their experience'], icon: 'MessageSquare', category: 'engagement' },
      { dayNumber: 21, phase: 'Community', title: 'User Feedback Campaign', description: 'Run a user feedback campaign using surveys, polls, and DMs. Direct feedback reveals your highest-impact improvements and makes users feel valued.', tasks: ['Create a 3-question survey (Google Forms or Typeform)', 'Post interactive polls on Instagram Stories', 'DM active users asking for honest feedback', 'Compile top themes and share publicly'], icon: 'ClipboardList', category: 'engagement' },
      { dayNumber: 22, phase: 'Community', title: 'Launch 7-Day Tool Challenge', description: 'Launch the "7-Day Tool Challenge" — use one tool per day for a week. Challenges create engagement loops and help users discover tools they might otherwise skip.', tasks: ['Announce the challenge with rules and daily schedule', 'Create daily challenge graphics for the week', 'Day 1 task: Generate a product description and share result', 'Create a unique hashtag for challenge participants'], icon: 'Target', category: 'engagement' },
      { dayNumber: 23, phase: 'Community', title: 'Challenge Results & Testimonials', description: 'Post challenge Day 2 results and user testimonials. Showing participant progress creates FOMO and encourages lurkers to join in.', tasks: ['Share Day 1 participant results (with permission)', 'Highlight best submissions in a Story compilation', 'Day 2 task: Optimize an SEO title and compare before/after', 'Respond to every challenge submission personally'], icon: 'Award', category: 'engagement' },
      { dayNumber: 24, phase: 'Community', title: 'Before/After Comparisons', description: 'Share Day 3 of the challenge with before/after content comparisons. Visual transformations are the most shareable content format and prove tool effectiveness.', tasks: ['Collect before/after pairs from challenge participants', 'Design side-by-side comparison graphics', 'Day 3 task: Generate hashtags and measure reach difference', 'Share aggregate improvement stats from the challenge'], icon: 'ArrowLeftRight', category: 'engagement' },
      { dayNumber: 25, phase: 'Growth Push', title: 'Referral Push: Bonus Credits', description: 'Launch a referral push with bonus credits and limited-time rewards. Urgency combined with tangible incentives creates a surge in word-of-mouth acquisition.', tasks: ['Announce double referral credits for 48 hours', 'Create urgency-driven graphics with countdown timer', 'DM top 20 existing users with personal referral ask', 'Post referral success stories as social proof'], icon: 'Rocket', category: 'referral' },
      { dayNumber: 26, phase: 'Growth Push', title: 'Top Referrer Leaderboard', description: 'Share top referrer stories and update the leaderboard. Public recognition motivates continued sharing and creates healthy competition among advocates.', tasks: ['Publish top 5 referrers leaderboard graphic', 'Share individual referrer spotlight stories', 'Announce prizes for top 3 referrers', 'Remind followers the bonus window is closing'], icon: 'Trophy', category: 'referral' },
      { dayNumber: 27, phase: 'Growth Push', title: 'Last Call: Referral Urgency', description: 'Send last call messaging with urgency for the referral program. Scarcity and deadline pressure drive action from procrastinators who intended to share.', tasks: ['Post "Last 24 Hours" urgency content across platforms', 'Send final WhatsApp broadcast to contact list', 'Share real-time referral count updates', 'Thank everyone who participated regardless of count'], icon: 'Clock', category: 'referral' },
      { dayNumber: 28, phase: 'Growth Push', title: 'Publish 30-Day Results', description: 'Publish your 30-day results — downloads, users, and engagement metrics. Transparent results build massive credibility and inspire others to follow your playbook.', tasks: ['Compile key metrics: downloads, signups, DAU, retention', 'Design a results infographic with growth chart', 'Write detailed breakdown post (LinkedIn + blog)', 'Create a short video summarizing the journey'], icon: 'BarChart3', category: 'analytics' },
      { dayNumber: 29, phase: 'Growth Push', title: '"Help Me Reach 500" Campaign', description: 'Make a personal, authentic ask to help reach 500 users. Vulnerability and transparency create emotional investment — people want to be part of a milestone.', tasks: ['Write a heartfelt post sharing current numbers and goal', 'Explain specifically how each share/download helps', 'Create a progress tracker graphic updated in real time', 'Personally thank every new user who joins today'], icon: 'HandHeart', category: 'engagement' },
      { dayNumber: 30, phase: 'Growth Push', title: 'Analyze & Double Down', description: 'Analyze results, identify top-performing channels, and double down. Data-driven iteration ensures your next 30 days are even more effective than the first.', tasks: ['Rank channels by downloads generated (referral, social, organic)', 'Identify top 3 content pieces by engagement rate', 'Document lessons learned and mistakes to avoid', 'Create next 30-day plan based on winning strategies', 'Celebrate the milestone with your community!'], icon: 'LineChart', tip: 'Schedule this analysis as a recurring monthly review to maintain momentum.', category: 'analytics' },
    ];

    // Delete stale rows not in the seed list, then upsert by dayNumber
    const validDayNumbers = thirtyDayPlanItems.map((p) => p.dayNumber);
    await ThirtyDayPlan.deleteMany({ dayNumber: { $nin: validDayNumbers } });

    for (const item of thirtyDayPlanItems) {
      await ThirtyDayPlan.findOneAndUpdate(
        { dayNumber: item.dayNumber },
        { $set: item },
        { upsert: true, new: true, runValidators: true },
      );
    }
    console.log(`[SEED] Upserted ${thirtyDayPlanItems.length} 30-day plan items`);
  } catch (err) {
    console.error('[SEED] Failed to seed 30-day plan items:', err instanceof Error ? err.message : err);
  }

  // ─── Deduplicate saved clones (keep earliest per distinct URL) ──────────────
  try {
    const seen = new Set<string>();
    for (const clone of await Clone.find().sort({ createdAt: 1 })) {
      const key = clone.source.trim().replace(/\/$/, '').toLowerCase();
      if (seen.has(key)) { await Clone.deleteOne({ _id: clone._id }); }
      else { seen.add(key); }
    }

    // Normalize remaining clone source URLs: strip trailing slashes and lowercase
    // so future upserts match correctly against stored records.
    const allClonesForNorm = await Clone.find();
    for (const clone of allClonesForNorm) {
      const normalized = clone.source.trim().replace(/\/$/, '').toLowerCase();
      if (clone.source !== normalized) {
        clone.source = normalized;
        await clone.save();
      }
    }

    console.log('[SEED] Clone deduplication complete');

    // Clean up known test clones that should not persist
    const testClonePatterns = [/^https?:\/\/example\.com/i];
    for (const pattern of testClonePatterns) {
      const result = await Clone.deleteMany({ source: pattern });
      if (result.deletedCount > 0) {
        console.log(`[SEED] Removed ${result.deletedCount} test clone(s) matching ${pattern}`);
      }
    }
  } catch (err) {
    console.error('[SEED] Failed to deduplicate clones:', err instanceof Error ? err.message : err);
  }

  // ── Repair pass: mark clones whose files are missing on disk ───────────────
  try {
    const fs = await import('fs');
    const path = await import('path');
    const cloneDir = path.join(process.cwd(), 'uploads', 'clones');
    const allClones = await Clone.find();
    let repairedCount = 0;
    for (const clone of allClones) {
      const absPath = path.resolve(cloneDir, clone.filePath);
      if (!fs.existsSync(absPath)) {
        if (clone.status !== 'FILE_MISSING') {
          clone.status = 'FILE_MISSING';
          await clone.save();
          repairedCount++;
        }
      } else if (clone.status === 'FILE_MISSING') {
        // File exists again (re-cloned) — restore status
        clone.status = 'SAVED';
        await clone.save();
      }
    }
    console.log(`[SEED] Clone file repair pass complete (${repairedCount} marked FILE_MISSING)`);
  } catch (err) {
    console.error('[SEED] Clone repair pass failed:', err instanceof Error ? err.message : err);
  }

  console.log('[SEED] Seeding complete!');
}

/**
 * Seed additional AI providers as fallbacks (if their API keys exist in env).
 * Upserts on every server start so model names, isPrimary, and fallbackOrder
 * stay in sync with the canonical configuration below.
 */
async function seedFallbackProviders(): Promise<void> {
  const fallbackProviders: Array<{
    provider: string;
    modelName: string;
    apiKey: string | undefined;
    fallbackOrder: number;
    isPrimary: boolean;
  }> = [
    {
      provider: 'google',
      modelName: 'gemini-3.5-flash-lite',
      // Pick the first Google key with a valid AIza prefix to avoid invalid keys shadowing valid ones
      apiKey: [process.env.GEMINI_API_KEY, process.env.GOOGLE_API_KEY]
        .find((k) => k && typeof k === 'string' && k.startsWith('AIza'))
        || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
      fallbackOrder: 1,
      isPrimary: true,
    },
    {
      provider: 'groq',
      modelName: 'llama-3.3-70b-versatile',
      apiKey: process.env.GROQ_API_KEY,
      fallbackOrder: 2,
      isPrimary: false,
    },
    {
      provider: 'openrouter',
      modelName: 'google/gemini-3.5-flash-lite',
      apiKey: process.env.OPENROUTER_API_KEY,
      fallbackOrder: 3,
      isPrimary: false,
    },
    {
      provider: 'openai',
      modelName: 'gpt-4o-mini',
      apiKey: process.env.OPENAI_API_KEY,
      fallbackOrder: 4,
      isPrimary: false,
    },
  ];

  for (const fb of fallbackProviders) {
    if (!fb.apiKey) continue;
    try {
      const result = await AIProviderConfig.findOneAndUpdate(
        { provider: fb.provider },
        {
          $set: {
            modelName: fb.modelName,
            apiKey: fb.apiKey,
            isEnabled: true,
            isPrimary: fb.isPrimary,
            fallbackOrder: fb.fallbackOrder,
          },
        },
        { upsert: true, new: true, runValidators: true },
      );
      const action = result.createdAt.getTime() === result.updatedAt.getTime() ? 'Created' : 'Updated';
      console.log(`[SEED] ${action} fallback AI provider (${fb.provider}/${fb.modelName}, primary=${fb.isPrimary})`);
    } catch (err) {
      console.error(`[SEED] Failed to upsert fallback provider ${fb.provider}:`, err instanceof Error ? err.message : err);
    }
  }

  // Safety: guarantee no stale document remains marked primary except google
  try {
    const cleared = await AIProviderConfig.updateMany(
      { provider: { $ne: 'google' } },
      { isPrimary: false },
    );
    if (cleared.modifiedCount > 0) {
      console.log(`[SEED] Cleared isPrimary from ${cleared.modifiedCount} non-google provider(s)`);
    }
  } catch (err) {
    console.error('[SEED] Failed to clear stale isPrimary flags:', err instanceof Error ? err.message : err);
  }
}

/**
 * Migration: Fix invalid Google model names in existing DB records.
 * Catches ALL known-invalid Google/Gemini model identifiers and corrects them.
 * This runs on every server start to self-heal any stale records.
 * 
 * Canonical valid models for direct Google API: gemini-3.5-flash-lite (current primary), gemini-2.5-pro (pro tier)
 * Canonical valid models for OpenRouter: google/gemini-3.5-flash-lite (stable paid model)
 */
async function migrateInvalidGoogleModels(): Promise<void> {
  // All known-invalid Google model names that should map to gemini-3.5-flash-lite
  // Note: gemini-3.5-flash-lite is VALID and should NOT be in this list
  const INVALID_FLASH_MODELS = [
    'models/gemini-2.0-flash',  // strip models/ prefix
    'gemini-2.0-flash',         // deprecated June 2026
    'gemini-2.0-flash-001',     // invalid variant
    'gemini-pro',               // deprecated alias
    'gemini-1.0-pro',           // deprecated, removed from API
    'models/gemini-1.0-pro',
    'models/gemini-pro',
    // Gemini 1.5 models — deprecated on direct Google API (still valid on OpenRouter)
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash-001',
    'gemini-1.5-pro-001',
    'gemini-1.5-flash-002',
    'gemini-1.5-pro-002',
    // gemini-2.5-flash — replaced by gemini-3.5-flash-lite as primary
    'gemini-2.5-flash',
    'models/gemini-2.5-flash',
  ];
  // Invalid models that should map to gemini-2.5-pro
  const INVALID_PRO_MODELS = [
    'gemini-2.0-pro',
    'models/gemini-2.0-pro',
  ];
  // Invalid OpenRouter Google model names → map to google/gemini-3.5-flash-lite (stable paid model)
  const INVALID_OPENROUTER_FLASH = [
    'google/gemini-2.0-flash',      // deprecated June 2026
    'google/gemini-2.0-flash-001',
    'google/gemini-pro',
    'google/gemini-1.0-pro',
    // Legacy models that may have been retired on OpenRouter
    'google/gemini-1.5-flash',
    'google/gemini-1.5-pro',
    'google/gemini-1.5-flash-001',
    'google/gemini-1.5-pro-001',
    // Free tier models that may be unreliable
    'google/gemini-2.0-flash-exp:free',
    'google/gemini-2.0-flash:free',
    'google/gemini-2.5-flash-exp:free',
    // gemini-2.5-flash — replaced by gemini-3.5-flash-lite as primary
    'google/gemini-2.5-flash',
  ];
  const INVALID_OPENROUTER_PRO = [
    'google/gemini-2.0-pro',
  ];

  try {
    // Fix Google/Gemini providers with invalid flash-target models
    if (INVALID_FLASH_MODELS.length > 0) {
      const invalidFlashRecords = await AIProviderConfig.find({
        provider: { $in: ['google', 'gemini'] },
        modelName: { $in: INVALID_FLASH_MODELS },
      });

      for (const record of invalidFlashRecords) {
        await AIProviderConfig.updateOne(
          { _id: record._id },
          { $set: { modelName: 'gemini-3.5-flash-lite' } },
        );
        console.log(`[MIGRATE] Fixed invalid Google model: "${record.modelName}" → "gemini-3.5-flash-lite" (provider: ${record.provider})`);
      }
    }

    // Fix Google/Gemini providers with invalid pro-target models
    if (INVALID_PRO_MODELS.length > 0) {
      const invalidProRecords = await AIProviderConfig.find({
        provider: { $in: ['google', 'gemini'] },
        modelName: { $in: INVALID_PRO_MODELS },
      });

      for (const record of invalidProRecords) {
        await AIProviderConfig.updateOne(
          { _id: record._id },
          { $set: { modelName: 'gemini-2.5-pro' } },
        );
        console.log(`[MIGRATE] Fixed invalid Google model: "${record.modelName}" → "gemini-2.5-pro" (provider: ${record.provider})`);
      }
    }

    // Fix OpenRouter records using invalid Google model names
    const allInvalidOpenRouter = [...INVALID_OPENROUTER_FLASH, ...INVALID_OPENROUTER_PRO];
    if (allInvalidOpenRouter.length > 0) {
      const invalidOpenRouterRecords = await AIProviderConfig.find({
        provider: 'openrouter',
        modelName: { $in: allInvalidOpenRouter },
      });

      for (const record of invalidOpenRouterRecords) {
        const targetModel = INVALID_OPENROUTER_PRO.includes(record.modelName)
          ? 'google/gemini-2.5-pro'
          : 'google/gemini-3.5-flash-lite';
        await AIProviderConfig.updateOne(
          { _id: record._id },
          { $set: { modelName: targetModel } },
        );
        console.log(`[MIGRATE] Fixed invalid OpenRouter model: "${record.modelName}" → "${targetModel}"`);
      }
    }

    // Catch-all: find any Google/Gemini provider with a model that has a provider prefix
    // This handles cases where an OpenRouter-format model was accidentally stored for a direct Google provider
    const prefixedGoogleRecords = await AIProviderConfig.find({
      provider: { $in: ['google', 'gemini'] },
      modelName: { $regex: '^google/' },
    });

    for (const record of prefixedGoogleRecords) {
      // Strip the prefix and validate
      const stripped = record.modelName.replace(/^google\//, '');
      await AIProviderConfig.updateOne(
        { _id: record._id },
        { $set: { modelName: 'gemini-3.5-flash-lite' } },
      );
      console.log(`[MIGRATE] Fixed prefixed Google model: "${record.modelName}" → "gemini-3.5-flash-lite" (provider: ${record.provider})`);
    }

    // Catch-all: find any Google/Gemini provider with a model NOT in the known-valid set
    // This handles any future typos or deprecated models we haven't enumerated above
    const VALID_GOOGLE_MODELS = [
      'gemini-3.5-flash-lite', 'gemini-2.0-flash-lite',
      'gemini-3.5-flash-lite', 'gemini-2.5-pro',
    ];
    const unknownGoogleRecords = await AIProviderConfig.find({
      provider: { $in: ['google', 'gemini'] },
      modelName: { $nin: VALID_GOOGLE_MODELS },
    });

    for (const record of unknownGoogleRecords) {
      await AIProviderConfig.updateOne(
        { _id: record._id },
        { $set: { modelName: 'gemini-2.5-flash' } },
      );
      console.log(`[MIGRATE] Fixed unknown Google model: "${record.modelName}" → "gemini-2.5-flash" (provider: ${record.provider})`);
    }
  } catch (err) {
    console.error('[MIGRATE] Failed to migrate invalid Google models:', err instanceof Error ? err.message : err);
  }
}

/**
 * Migration: Fix invalid Anthropic model names in existing DB records.
 * 'claude-sonnet-5' is not a valid Anthropic model — update to 'claude-sonnet-4-20250514'.
 */
async function migrateInvalidAnthropicModels(): Promise<void> {
  const INVALID_MODELS = ['claude-sonnet-5', 'claude-3-5-sonnet', 'claude-3.5-sonnet'];
  const VALID_MODEL = 'claude-sonnet-4-20250514';

  try {
    const invalidRecords = await AIProviderConfig.find({
      provider: 'anthropic',
      modelName: { $in: INVALID_MODELS },
    });

    if (invalidRecords.length === 0) return;

    for (const record of invalidRecords) {
      await AIProviderConfig.updateOne(
        { _id: record._id },
        { $set: { modelName: VALID_MODEL } },
      );
      console.log(`[MIGRATE] Fixed invalid Anthropic model: "${record.modelName}" → "${VALID_MODEL}"`);
    }
  } catch (err) {
    console.error('[MIGRATE] Failed to migrate invalid Anthropic models:', err instanceof Error ? err.message : err);
  }
}

/**
 * Migration: Re-encrypt any API keys stored as plain text.
 * The pre-save hook encrypts on save, but some records may have been inserted
 * directly or the encryption was bypassed. This detects plain-text keys and
 * re-saves them to trigger encryption.
 */
async function reencryptPlaintextApiKeys(): Promise<void> {
  try {
    const allConfigs = await AIProviderConfig.find();
    let reencryptedCount = 0;

    for (const config of allConfigs) {
      const key = config.apiKey;
      // Detect plain-text: a valid encrypted key is base64 that decodes to
      // at least IV_LENGTH + AUTH_TAG_LENGTH + 1 bytes (≥33 bytes).
      // Plain-text API keys (like "sk-ant-..." or "a6edc...") are shorter when
      // decoded from base64, or fail the round-trip check.
      let looksEncrypted = false;
      try {
        const buf = Buffer.from(key, 'base64');
        const reEncoded = buf.toString('base64');
        if (reEncoded === key && buf.length >= 33) {
          looksEncrypted = true;
        }
      } catch {
        looksEncrypted = false;
      }

      if (!looksEncrypted && key && key.length > 0) {
        // Force re-save to trigger the pre-save encryption hook
        config.apiKey = key; // Mark as modified by re-assigning
        config.markModified('apiKey');
        await config.save();
        reencryptedCount++;
        console.log(`[MIGRATE] Re-encrypted plain-text API key for provider "${config.provider}"`);
      }
    }

    if (reencryptedCount > 0) {
      console.log(`[MIGRATE] Re-encrypted ${reencryptedCount} plain-text API keys`);
    }
  } catch (err) {
    console.error('[MIGRATE] Failed to re-encrypt plain-text API keys:', err instanceof Error ? err.message : err);
  }
}
