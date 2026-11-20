export interface NicheData {
  slug: string;
  nicheName: string;
  description: string;
  sampleKeywords: string[];
  exampleOutputs: string[];
  tips: string[];
}

export interface ToolNicheMap {
  [toolSlug: string]: NicheData[];
}

export const toolNiches: ToolNicheMap = {
  'product-description-generator': [
    {
      slug: 'fashion',
      nicheName: 'Fashion & Apparel',
      description: `<p>Create compelling product descriptions for fashion items that highlight style, fit, and quality. Our AI understands fashion terminology and creates descriptions that resonate with style-conscious buyers.</p>
<p>Whether you're selling vintage clothing, streetwear, or luxury fashion, our generator crafts descriptions that emphasize fabric quality, design details, and styling suggestions that help customers visualize wearing your pieces.</p>`,
      sampleKeywords: ['vintage denim jacket', 'silk evening dress', 'leather boots', 'casual summer dress'],
      exampleOutputs: [
        'Elevate your wardrobe with this stunning Vintage Denim Jacket. Crafted from premium washed denim in a classic medium blue wash, this timeless piece features authentic distressing, brass button closures, and adjustable waist tabs. Perfect for layering over dresses or pairing with high-waisted jeans for that effortlessly cool vintage aesthetic.',
        'Make a statement in this Luxurious Silk Evening Dress. The flowing silk charmeuse fabric drapes beautifully, featuring an elegant cowl neckline and subtle side slit. Ideal for galas, weddings, or any special occasion where you want to look absolutely breathtaking.',
      ],
      tips: [
        'Include fabric composition and care instructions for fashion items',
        'Mention sizing recommendations and fit notes (runs true to size, oversized fit, etc.)',
        'Suggest styling pairings to help customers visualize complete outfits',
        'Highlight unique design details like buttons, stitching, or patterns',
      ],
    },
    {
      slug: 'supplements',
      nicheName: 'Health Supplements',
      description: `<p>Generate compliant, informative product descriptions for health supplements and wellness products. Our AI creates descriptions that highlight benefits, ingredients, and usage while staying within regulatory guidelines.</p>
<p>Perfect for vitamins, protein powders, herbal supplements, and other health products where clear, trustworthy descriptions build customer confidence.</p>`,
      sampleKeywords: ['whey protein powder', 'multivitamin gummies', 'omega-3 fish oil', 'probiotic capsules'],
      exampleOutputs: [
        'Fuel your fitness journey with Premium Whey Protein Powder. Each serving delivers 25g of high-quality whey protein isolate to support muscle recovery and growth. Mixes smoothly with water or milk, available in delicious chocolate and vanilla flavors. Third-party tested for purity and potency.',
        'Support your daily wellness with Complete Multivitamin Gummies. Packed with 13 essential vitamins and minerals in a delicious berry flavor. Easy-to-chew formula makes daily nutrition simple and enjoyable. No artificial colors, flavors, or preservatives.',
      ],
      tips: [
        'Avoid making medical claims - focus on general wellness benefits',
        'Include serving size and key nutritional information',
        'Mention third-party testing or certifications when applicable',
        'Note allergen information and dietary restrictions (vegan, gluten-free)',
      ],
    },
    {
      slug: 'gadgets',
      nicheName: 'Electronics & Gadgets',
      description: `<p>Craft technical yet accessible product descriptions for electronics and gadgets. Our AI balances specifications with user benefits, helping customers understand both what the product does and why they need it.</p>
<p>From smartphones to smart home devices, our descriptions translate technical specs into real-world value propositions.</p>`,
      sampleKeywords: ['wireless earbuds', 'smart watch', 'portable charger', 'bluetooth speaker'],
      exampleOutputs: [
        'Experience crystal-clear audio with Pro Wireless Earbuds. Featuring active noise cancellation, 8-hour battery life, and IPX5 water resistance. The ergonomic design ensures comfortable all-day wear, while touch controls let you manage music and calls without reaching for your phone.',
        'Stay connected and organized with Smart Watch Pro. Track your fitness goals with heart rate monitoring, GPS, and 50+ workout modes. Receive notifications, make calls, and control your smart home right from your wrist. 7-day battery life keeps up with your active lifestyle.',
      ],
      tips: [
        'Lead with the primary benefit, then support with technical specs',
        'Compare to previous models or competitors when relevant',
        'Include compatibility information (iOS, Android, Windows)',
        'Mention warranty and return policy for expensive electronics',
      ],
    },
    {
      slug: 'beauty',
      nicheName: 'Beauty & Skincare',
      description: `<p>Create alluring product descriptions for beauty and skincare products that highlight ingredients, benefits, and results. Our AI understands beauty industry language and creates descriptions that appeal to skincare enthusiasts.</p>
<p>From serums to makeup, craft descriptions that build trust and communicate product efficacy.</p>`,
      sampleKeywords: ['hyaluronic acid serum', 'matte lipstick', 'face moisturizer', 'eye cream'],
      exampleOutputs: [
        'Transform your skin with Hydrating Hyaluronic Acid Serum. This lightweight, fast-absorbing formula delivers intense moisture deep into skin layers, plumping fine lines and creating a dewy, youthful glow. Suitable for all skin types, including sensitive skin.',
        'Achieve flawless color that lasts all day with Velvet Matte Lipstick. The creamy formula glides on smoothly, drying to a comfortable matte finish that won\'t crack or fade. Enriched with vitamin E and jojoba oil to keep lips soft and hydrated.',
      ],
      tips: [
        'List key active ingredients and their benefits',
        'Specify skin type suitability (oily, dry, combination, sensitive)',
        'Include usage instructions and frequency recommendations',
        'Mention if products are cruelty-free, vegan, or clean beauty certified',
      ],
    },
    {
      slug: 'food',
      nicheName: 'Food & Gourmet',
      description: `<p>Write appetizing product descriptions for food products that engage the senses and highlight quality ingredients. Our AI creates mouth-watering copy that emphasizes taste, origin, and culinary uses.</p>
<p>Perfect for artisanal foods, specialty ingredients, snacks, and gourmet products.</p>`,
      sampleKeywords: ['organic honey', 'artisan chocolate', 'gourmet coffee beans', 'truffle oil'],
      exampleOutputs: [
        'Indulge in Pure Wildflower Honey, harvested from pristine mountain meadows. This raw, unfiltered honey boasts complex floral notes with hints of clover and lavender. Perfect for sweetening tea, drizzling over yogurt, or adding natural sweetness to baked goods.',
        'Awaken your senses with Single-Origin Ethiopian Coffee Beans. Medium-roasted to perfection, these beans reveal bright citrus notes with a smooth chocolate finish. Ethically sourced from small family farms, each batch is roasted fresh for maximum flavor.',
      ],
      tips: [
        'Use sensory language that evokes taste, smell, and texture',
        'Highlight sourcing story and quality indicators (organic, fair-trade)',
        'Suggest serving ideas and recipe pairings',
        'Include storage instructions and shelf life information',
      ],
    },
    {
      slug: 'fitness',
      nicheName: 'Fitness Equipment',
      description: `<p>Generate motivating product descriptions for fitness equipment and accessories. Our AI creates copy that inspires action while clearly communicating specifications and benefits.</p>
<p>From home gym equipment to yoga accessories, help customers find the right gear for their fitness journey.</p>`,
      sampleKeywords: ['resistance bands', 'yoga mat', 'adjustable dumbbells', 'foam roller'],
      exampleOutputs: [
        'Level up your workouts with Premium Resistance Bands Set. Includes 5 resistance levels from light to extra heavy, perfect for strength training, physical therapy, and stretching. Made from durable natural latex with comfortable handles and door anchor.',
        'Find your center on Extra Thick Yoga Mat. The 6mm cushioning protects joints during floor work, while the non-slip texture provides stability in every pose. Eco-friendly TPE material is free from PVC and harmful chemicals. Includes carrying strap.',
      ],
      tips: [
        'Specify dimensions, weight capacity, and material composition',
        'Describe suitable fitness levels and exercise types',
        'Include setup instructions or assembly requirements',
        'Mention safety features and proper usage guidelines',
      ],
    },
    {
      slug: 'accessories',
      nicheName: 'Fashion Accessories',
      description: `<p>Craft stylish product descriptions for fashion accessories that complement any outfit. Our AI highlights craftsmanship, materials, and versatility to help customers see how each piece enhances their personal style.</p>
<p>From jewelry to bags and watches, create descriptions that showcase accessory appeal.</p>`,
      sampleKeywords: ['leather wallet', 'gold necklace', 'sunglasses', 'silk scarf'],
      exampleOutputs: [
        'Complete your look with Classic Leather Bifold Wallet. Handcrafted from full-grain Italian leather that develops a beautiful patina over time. Features 8 card slots, 2 bill compartments, and RFID blocking technology. Slim profile fits comfortably in front or back pocket.',
        'Add timeless elegance with Delicate Gold Chain Necklace. Made from 14k gold-plated sterling silver, this versatile piece transitions seamlessly from day to night. Adjustable length lets you layer or wear solo. Hypoallergenic and tarnish-resistant.',
      ],
      tips: [
        'Emphasize material quality and craftsmanship details',
        'Suggest outfit pairings and occasion appropriateness',
        'Include size/dimension information for proper fit expectations',
        'Note care instructions to maintain appearance',
      ],
    },
    {
      slug: 'furniture',
      nicheName: 'Home Furniture',
      description: `<p>Write inviting product descriptions for furniture that help customers envision pieces in their homes. Our AI balances style descriptions with practical details about dimensions, materials, and functionality.</p>
<p>From sofas to storage solutions, create descriptions that sell the lifestyle along with the furniture.</p>`,
      sampleKeywords: ['sectional sofa', 'dining table', 'bookshelf', 'office chair'],
      exampleOutputs: [
        'Transform your living room with Modern Sectional Sofa. Upholstered in stain-resistant performance fabric in versatile charcoal gray. Modular design allows custom configuration for any space. Deep cushions and plush back pillows invite relaxation after long days.',
        'Gather around Solid Wood Dining Table, crafted from sustainably sourced oak with a warm walnut finish. Seats 6 comfortably, extending to 8 with included leaf. Sturdy trestle base provides legroom and stability. Timeless design complements any decor style.',
      ],
      tips: [
        'Always include exact dimensions and weight capacity',
        'Describe assembly requirements and estimated time',
        'Mention delivery options and room-of-entry considerations',
        'Suggest complementary pieces or room styling ideas',
      ],
    },
  ],
  'seo-title-optimizer': [
    {
      slug: 'kitchen-products',
      nicheName: 'Kitchen Products',
      description: `<p>Optimize your eBay titles for kitchen products to maximize visibility and sales. Our AI understands what kitchen shoppers search for and creates titles that hit all the right keywords.</p>
<p>From cookware to appliances, get titles that rank higher and convert better.</p>`,
      sampleKeywords: ['non-stick frying pan', 'stand mixer', 'knife set', 'air fryer'],
      exampleOutputs: [
        'Professional Non-Stick Frying Pan 12 Inch Ceramic Coated Cookware Oven Safe Dishwasher Compatible Induction Ready Kitchen Skillet',
        'Stand Mixer 5 Quart Stainless Steel Bowl 10 Speed Kitchen Aid Compatible Dough Hook Flat Beater Whisk Attachment Set Red',
      ],
      tips: [
        'Include brand name first if it\'s well-known',
        'Add size/capacity measurements early in the title',
        'Mention compatibility (induction, dishwasher safe)',
        'Include material (stainless steel, ceramic, cast iron)',
      ],
    },
    {
      slug: 'electronics',
      nicheName: 'Electronics',
      description: `<p>Create optimized eBay titles for electronics that capture buyer searches. Our AI knows the technical terms and model numbers that electronics buyers use.</p>
<p>Get more visibility for phones, laptops, cameras, and all tech products.</p>`,
      sampleKeywords: ['wireless headphones', 'laptop', 'smartphone case', 'tablet'],
      exampleOutputs: [
        'Sony WH-1000XM5 Wireless Noise Canceling Headphones Bluetooth Over-Ear Black 30 Hour Battery Fast Charging Carrying Case',
        'iPhone 15 Pro Max Case Clear MagSafe Compatible Shockproof Drop Protection Slim Wireless Charging Transparent Cover',
      ],
      tips: [
        'Include exact model numbers when applicable',
        'Mention condition prominently (New, Refurbished, Used)',
        'List key specs (storage, color, generation)',
        'Include compatible accessories or bundled items',
      ],
    },
    {
      slug: 'clothing',
      nicheName: 'Clothing',
      description: `<p>Optimize clothing listings with titles that match how fashion shoppers search. Include size, brand, style, and condition to capture qualified buyers.</p>
<p>Our AI creates titles that balance keyword density with readability.</p>`,
      sampleKeywords: ['vintage band tee', 'designer handbag', 'running shoes', 'winter coat'],
      exampleOutputs: [
        'Nike Air Jordan 1 Retro High OG Chicago Red White Black Leather Basketball Shoes Men Size 10 New In Box Authentic',
        'Vintage Levi\'s 501 Jeans Women\'s Size 28 High Waisted Straight Leg Dark Wash Denim Made USA Excellent Condition',
      ],
      tips: [
        'Always include size using standard sizing charts',
        'Mention brand early for branded items',
        'Include color and material',
        'Note condition accurately (NWT, NWOT, EUC, VGUC)',
      ],
    },
    {
      slug: 'jewelry',
      nicheName: 'Jewelry',
      description: `<p>Create compelling eBay titles for jewelry that highlight materials, style, and value. Our AI helps you include the details jewelry buyers search for most.</p>
<p>From costume jewelry to fine pieces, optimize your listings effectively.</p>`,
      sampleKeywords: ['gold ring', 'pearl necklace', 'diamond earrings', 'vintage brooch'],
      exampleOutputs: [
        '14K Yellow Gold Diamond Engagement Ring 1.5 Carat Round Brilliant Cut Solitaire Size 6 GIA Certified VS1 Clarity F Color',
        'Vintage Art Deco Sterling Silver Pearl Necklace 18 Inch Strand Freshwater Cultured Pearls Antique Jewelry Gift For Her',
      ],
      tips: [
        'Specify metal type and purity (14K, 925 Sterling, Platinum)',
        'Include gemstone details (cut, carat, clarity for diamonds)',
        'Mention era or style for vintage pieces (Art Deco, Victorian)',
        'Note any certifications or appraisals included',
      ],
    },
    {
      slug: 'toys',
      nicheName: 'Toys & Games',
      description: `<p>Optimize toy and game listings with titles that parents and collectors search for. Our AI includes age ranges, brands, and condition details that matter to buyers.</p>
<p>From LEGO sets to board games, get titles that drive sales.</p>`,
      sampleKeywords: ['lego set', 'board game', 'action figure', 'dollhouse'],
      exampleOutputs: [
        'LEGO Star Wars Millennium Falcon 75192 Ultimate Collector Series 7541 Pieces New Sealed Retired Set Adult Display',
        'Hasbro Monopoly Classic Edition Board Game Family Strategy Complete All Pieces Ages 8+ Excellent Condition Vintage',
      ],
      tips: [
        'Include brand and specific set/model name',
        'Note completeness (all pieces, box included, instructions)',
        'Mention age range or recommended age',
        'For collectibles, note edition and rarity',
      ],
    },
    {
      slug: 'auto-parts',
      nicheName: 'Auto Parts',
      description: `<p>Create precise eBay titles for auto parts that mechanics and DIYers can find easily. Include year/make/model compatibility and part numbers.</p>
<p>Our AI helps you format titles that match automotive search patterns.</p>`,
      sampleKeywords: ['brake pads', 'alternator', 'spark plugs', 'oil filter'],
      exampleOutputs: [
        'Front Brake Pads Ceramic Fits Honda Civic 2016-2021 Accord 2018-2022 CR-V 2017-2022 Quiet Low Dust OE Quality Set',
        'Alternator Fits Toyota Camry 2018-2023 RAV4 2019-2023 2.5L L4 150 Amp New OEM Replacement 27060-0V040 Warranty',
      ],
      tips: [
        'Always include year/make/model compatibility',
        'List OEM part numbers when available',
        'Specify position (front, rear, left, right)',
        'Note condition (new, remanufactured, used)',
      ],
    },
    {
      slug: 'home-decor',
      nicheName: 'Home Decor',
      description: `<p>Optimize home decor listings with titles that capture style and function searches. Our AI includes dimensions, materials, and style descriptors.</p>
<p>From wall art to lighting, create titles that decorators search for.</p>`,
      sampleKeywords: ['wall art', 'table lamp', 'throw pillow', 'area rug'],
      exampleOutputs: [
        'Modern Abstract Wall Art Canvas Print Set Of 3 Large 24x36 Inch Blue Gold Geometric Living Room Decor Framed Ready Hang',
        'Mid Century Modern Table Lamp Brass Base Linen Shade 24 Inch Tall Bedroom Living Room Ambient Lighting E26 Bulb Included',
      ],
      tips: [
        'Include dimensions prominently',
        'Describe style (modern, farmhouse, bohemian, industrial)',
        'Mention room placement suggestions',
        'Note installation requirements or included hardware',
      ],
    },
    {
      slug: 'sports',
      nicheName: 'Sports Equipment',
      description: `<p>Create optimized titles for sports equipment and gear. Our AI includes sport-specific terminology and specifications athletes search for.</p>
<p>From fitness gear to team sports equipment, maximize your listing visibility.</p>`,
      sampleKeywords: ['basketball shoes', 'tennis racket', 'yoga mat', 'cycling helmet'],
      exampleOutputs: [
        'Nike LeBron 20 Basketball Shoes Men Size 12 White Red Zoom Air Cushion Ankle Support Indoor Outdoor Court New In Box',
        'Wilson Pro Staff Tennis Racket 97 V14 315g Grip Size 4 3/8 Professional Advanced Player Control Spin String Pattern 16x19',
      ],
      tips: [
        'Include sport/activity context',
        'Specify size, weight, and skill level appropriateness',
        'Mention brand reputation for performance gear',
        'Note league compliance if relevant',
      ],
    },
  ],
  'hashtag-generator': [
    {
      slug: 'jewelry',
      nicheName: 'Jewelry Makers',
      description: `<p>Generate trending hashtags specifically for jewelry makers and sellers on Instagram, TikTok, and Pinterest. Our AI finds tags that reach jewelry enthusiasts and buyers.</p>
<p>Boost visibility for handmade jewelry, custom designs, and jewelry business content.</p>`,
      sampleKeywords: ['handmade jewelry', 'silver rings', 'gemstone necklace', 'custom engagement ring'],
      exampleOutputs: [
        '#handmadejewelry #silversmith #jewelrymaking #metalsmith #customjewelry #jewelrydesigner #smallbusiness #etsyshop #jewelrylover #supportsmallbusiness #handcrafted #jewelrygram #silverjewelry #jewelrymaker #madewithlove',
        '#gemstonenecklace #crystalhealing #naturalstones #jewelryaddict #necklaceoftheday #bohojewelry #statementjewelry #jewelryinspiration #accessoriesaddict #ootd #fashionjewelry #jewelryphotography #giftideas #shopsmall',
      ],
      tips: [
        'Mix popular tags (1M+ posts) with niche tags (10K-100K) for best reach',
        'Include location-based tags if selling locally',
        'Use process tags (#jewelrymaking, #benchjeweler) for behind-the-scenes content',
        'Add seasonal tags for holiday promotions',
      ],
    },
    {
      slug: 'art-prints',
      nicheName: 'Artists & Print Sellers',
      description: `<p>Find the perfect hashtags for artists selling prints and artwork online. Reach art collectors, interior designers, and fellow artists.</p>
<p>Our AI generates tags for various art styles and mediums.</p>`,
      sampleKeywords: ['watercolor painting', 'digital art print', 'abstract canvas', 'portrait commission'],
      exampleOutputs: [
        '#watercolorpainting #watercolorart #fineartprint #artforsale #artistsoninstagram #paintingoftheday #watercolorartist #artcollector #walldecor #originalart #artprint #galleryquality #supportartists #artlovers #creativeprocess',
        '#digitalart #digitalillustration #artprintshop #homedecor #wallart #interiordesign #artistsofinstagram #printshop #artcommunity #illustrationart #graphicdesign #visualart #artoftheday #buyart #emergingartist',
      ],
      tips: [
        'Tag your medium specifically (#watercolor, #acrylicpainting, #digitalart)',
        'Include style descriptors (#abstractart, #realism, #minimalist)',
        'Use community tags (#artistsoninstagram, #artcommunity) for engagement',
        'Add room/decor tags for home styling content',
      ],
    },
    {
      slug: 'candles',
      nicheName: 'Candle Makers',
      description: `<p>Generate cozy, atmospheric hashtags for candle businesses. Our AI finds tags that reach home decor enthusiasts, gift shoppers, and self-care communities.</p>
<p>Perfect for soy candles, wax melts, and aromatherapy products.</p>`,
      sampleKeywords: ['soy candle', 'scented candle', 'wax melts', 'aromatherapy candle'],
      exampleOutputs: [
        '#soycandle #handpouredcandle #candlemaker #smallbatch #cozyvibes #homedecor #selfcare #candlelover #naturalcandle #ecofriendly #giftideas #candlebusiness #shopsmall #aromatherapy #wellness',
        '#waxmelts #scentedwax #candleaddict #fragrance #homedecorideas #cozyhome #makersmovement #handmade #candlesofinstagram #smellsgood #relaxation #stressrelief #candlemaking #smallbusinesslove',
      ],
      tips: [
        'Use sensory tags (#smellsgood, #cozyvibes) for lifestyle content',
        'Include eco-friendly tags if using sustainable materials',
        'Tag seasons and occasions (#fallvibes, #christmasgifts)',
        'Show process with creation tags (#candlemaking, #handpoured)',
      ],
    },
    {
      slug: 'clothing',
      nicheName: 'Clothing Brands',
      description: `<p>Discover trending fashion hashtags for clothing brands and boutiques. Our AI generates tags that reach style-conscious shoppers and fashion communities.</p>
<p>From streetwear to sustainable fashion, find your audience.</p>`,
      sampleKeywords: ['streetwear brand', 'sustainable fashion', 'vintage clothing', 'athleisure'],
      exampleOutputs: [
        '#streetwear #urbanfashion #streetstyle #fashionbrand #clothingbrand #ootd #outfitinspiration #fashionista #styleinspo #newdrop #limitededition #shopsmall #independentbrand #fashiondesigner #wearitloud',
        '#sustainablefashion #ecofashion #slowfashion #ethicalclothing #consciousfashion #greenfashion #sustainablestyle #circulareconomy #fashionrevolution #whomademyclothes #ecofriendly #shopconscious #sustainableliving #fashionforchange',
      ],
      tips: [
        'Create and promote a unique brand hashtag',
        'Use style-specific tags (#streetwear, #bohochic, #minimaliststyle)',
        'Include shopping intent tags (#shopnow, #linkinbio, #newarrival)',
        'Engage with fashion challenge tags for viral potential',
      ],
    },
    {
      slug: 'stickers',
      nicheName: 'Sticker Artists',
      description: `<p>Find the best hashtags for sticker shops and artists. Our AI generates tags that reach planner enthusiasts, journalers, and sticker collectors.</p>
<p>Boost visibility for vinyl stickers, planner stickers, and die-cut designs.</p>`,
      sampleKeywords: ['vinyl stickers', 'planner stickers', 'die-cut stickers', 'cute stickers'],
      exampleOutputs: [
        '#stickershop #vinylsticker #stickers #stickerart #stickerdesign #plannercommunity #journaling #bujo #bulletjournal #smallbusiness #stickeraddict #cute #kawaii #stationery #decals',
        '#diecutsticker #stickerpack #plannerstickers #happyplanner #filofax #scrapbooking #craftsupplies #stickerlove #handmadestickers #artiststickers #laptopstickers #waterbottlestickles #stickerbomb #stickergame',
      ],
      tips: [
        'Target planner and journal communities (#bujo, #plannercommunity)',
        'Use application tags (#laptopsticker, #waterbottlesticker)',
        'Include style tags (#kawaii, #minimalist, #retro)',
        'Show packaging and shipping for customer confidence',
      ],
    },
    {
      slug: 'wedding',
      nicheName: 'Wedding Industry',
      description: `<p>Generate wedding-focused hashtags for vendors, planners, and bridal businesses. Our AI finds tags that engaged couples actively follow.</p>
<p>Perfect for photographers, florists, venues, and wedding service providers.</p>`,
      sampleKeywords: ['wedding photography', 'bridal bouquet', 'wedding venue', 'engagement ring'],
      exampleOutputs: [
        '#weddingphotography #weddingphotographer #brideandgroom #weddingday #bridetobe #engaged #weddingplanning #realweddings #weddinginspiration #marriage #love #instawedding #weddingvendor #bridalportrait #capturingmoments',
        '#bridalbouquet #weddingflowers #floralarrangement #bride #weddingdecor #flowergirl #bouquet #weddingseason #bridalparty #dreamwedding #luxurywedding #destinationwedding #weddingdetails #floralDesign',
      ],
      tips: [
        'Use bride/groom focused tags for emotional connection',
        'Include location tags for local vendor discovery',
        'Tag wedding planning stages (#justengaged, #countdown, #oneMonthToGo)',
        'Feature real weddings with couple permission for social proof',
      ],
    },
    {
      slug: 'digital-downloads',
      nicheName: 'Digital Product Sellers',
      description: `<p>Find effective hashtags for digital product sellers on Etsy and beyond. Our AI targets buyers looking for instant downloads and printable products.</p>
<p>From planners to wall art, reach your digital audience.</p>`,
      sampleKeywords: ['printable planner', 'digital wall art', 'SVG files', 'Canva templates'],
      exampleOutputs: [
        '#digitaldownload #printable #instantdownload #digitalplanner #printableplanner #organization #productivity #goalsetting #bulletjournal #planneraddict #digitalproducts #etsyseller #smallbiz #templatedesign #paperless',
        '#digitalwallart #printableart #homedecor #walldecor #instantart #affordableart #modernart #minimalistart #scandinaviandesign #interiorstyling #renterfriendly #gallerywall #artprint #digitalartist #homedesign',
      ],
      tips: [
        'Emphasize instant gratification (#instantdownload, #printtoday)',
        'Show product in use/mockup for visual appeal',
        'Target specific niches (#teacherplanner, #budgetplanner)',
        'Use platform tags (#etsyfinds, #etsydigital)',
      ],
    },
    {
      slug: 'pet-supplies',
      nicheName: 'Pet Product Businesses',
      description: `<p>Generate paw-some hashtags for pet product businesses! Our AI finds tags that reach pet parents, animal lovers, and the pet community.</p>
<p>From treats to toys, connect with passionate pet owners.</p>`,
      sampleKeywords: ['dog treats', 'cat toys', 'pet accessories', 'custom pet portrait'],
      exampleOutputs: [
        '#dogtreats #homemadedogtreats #dogmom #puppylove #dogsofinstagram #petbusiness #smallbusiness #doglover #healthydogtreats #naturaldogtreats #furbaby #doglife #petstagram #treattime #spoileddog',
        '#cattoys #catmom #catsofinstagram #kitten #meow #catlover #petproducts #interactivecatoys #catplaytime #felinefriends #catlife #adoptdontshop #rescuecats #catowner #petparent',
      ],
      tips: [
        'Use breed-specific tags when relevant (#goldenretriever, #mainecoon)',
        'Include pet parent identity tags (#dogmom, #catdad)',
        'Show pets enjoying products for authenticity',
        'Join pet community challenges and weekly themes',
      ],
    },
  ],
};

/**
 * Get niches for a specific tool slug.
 */
export function getNichesForTool(toolSlug: string): NicheData[] {
  return toolNiches[toolSlug] || [];
}

/**
 * Find a specific niche within a tool's niches.
 */
export function getNicheBySlug(toolSlug: string, nicheSlug: string): NicheData | undefined {
  const niches = getNichesForTool(toolSlug);
  return niches.find((n) => n.slug === nicheSlug);
}

/**
 * Get all tool slugs that have niches defined.
 */
export function getToolsWithNiches(): string[] {
  return Object.keys(toolNiches);
}
