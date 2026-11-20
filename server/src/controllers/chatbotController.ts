import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { generateCompletion, AIProviderError, AIErrorCategory, getEnvProviderStatuses, getRecommendedProvider } from '../services/aiService';
import { getActiveProvider } from '../services/aiProviderService';

const CHATBOT_SYSTEM_PROMPT = `You are the MG AI Assistant for MG Blessed Beginnings, an integrated AI, SEO, E-commerce, Business Intelligence, Security, and Marketing platform. Your role is to help website visitors with questions about:

- AI marketing tools and automation
- SEO services and optimization
- Digital marketing strategies
- E-commerce solutions (Shopify, eBay, Etsy)
- Online courses and training
- Consultation bookings and pricing

Guidelines:
- Keep responses concise, professional, and friendly (2-4 sentences max unless asked for detail).
- If asked about pricing, mention that custom quotes are available and suggest booking a free consultation.
- If asked about booking, direct them to the /book-consultation page.
- Always maintain a helpful, knowledgeable tone that reflects the brand's premium positioning.
- Do not make up specific prices or statistics you don't know — suggest they contact the team instead.
- Use emojis sparingly and only when it adds warmth (e.g., in greetings).`;

/**
 * User-facing error messages per category. Never exposes internal details.
 * Each message is actionable, friendly, and helps users understand what to do next.
 * Messages are specific about the actual problem so users know what action to take.
 */
const ERROR_MESSAGES: Record<AIErrorCategory, string> = {
  auth_failed: 'API quota exceeded or authentication failed. Our team has been notified and is working on it. In the meantime, our free AI tools at /ai-tools work independently — try the Product Description Generator or SEO Title Optimizer!',
  rate_limited: 'Rate limit reached — please try again in a moment. The AI service is experiencing high demand. You can also use our free tools at /ai-tools which don\'t have rate limits.',
  timeout: 'The AI took too long to respond. This usually resolves on retry — please try again. If it persists, our instant tools at /ai-tools (Hashtag Generator, Profit Calculator) are always available.',
  network: 'Connection issue detected. Please check your internet connection and try again. You can also browse our free tools at /ai-tools while the connection stabilizes.',
  invalid_model: 'Provider temporarily unavailable — the AI model is being reconfigured. Please try again shortly. Our free AI tools at /ai-tools are fully operational right now.',
  not_configured: 'AI service is currently offline for maintenance. Our free AI tools at /ai-tools are ready for you — try the Product Description Generator, SEO Title Optimizer, or Hashtag Generator.',
  all_unavailable: 'All AI providers are currently busy. Please wait a few moments and try again. Meanwhile, our free tools at /ai-tools (Product Description Generator, SEO Title Optimizer, Hashtag Generator, Profit Calculator) work instantly, or contact our team at /contact.',
  unknown: 'Something unexpected happened. Please try again — most issues resolve on retry. If it keeps happening, our free tools at /ai-tools are always available.',
};

/**
 * Detailed error logging for debugging. Maps categories to internal descriptions.
 */
const ERROR_DETAILS: Record<AIErrorCategory, string> = {
  auth_failed: 'API key validation failed - check provider credentials',
  rate_limited: 'Rate limit exceeded - wait before retrying',
  timeout: 'Request exceeded timeout threshold',
  network: 'Network connectivity issue or DNS failure',
  invalid_model: 'Specified model not found on provider',
  not_configured: 'No AI provider configured in system',
  all_unavailable: 'All fallback providers exhausted',
  unknown: 'Unclassified error - check logs for details',
};

/**
 * Classify an error into a structured response with errorCategory.
 * Exhaustively maps all known error types before falling back to generic message.
 * Logs detailed error info for debugging while returning user-friendly messages.
 */
function classifyError(err: unknown, requestId: string): { message: string; errorCategory: AIErrorCategory; status: number } {
  if (err instanceof AIProviderError) {
    // Use the specific category message — never fall through to generic
    const message = ERROR_MESSAGES[err.category];
    const detail = ERROR_DETAILS[err.category];
    
    // Log FULL error details for debugging — provider name, HTTP status, and full message
    console.error(`[chatbot:${requestId}] ═══ AI PROVIDER ERROR ═══`);
    console.error(`[chatbot:${requestId}] Category: ${err.category}`);
    console.error(`[chatbot:${requestId}] Provider: ${err.provider || 'unknown'}`);
    console.error(`[chatbot:${requestId}] HTTP Status: ${err.httpStatus || 'N/A'}`);
    console.error(`[chatbot:${requestId}] Message: ${err.message}`);
    console.error(`[chatbot:${requestId}] Detail: ${detail}`);
    console.error(`[chatbot:${requestId}] Stack: ${err.stack?.split('\n').slice(0, 3).join(' | ') || 'no stack'}`);
    console.error(`[chatbot:${requestId}] ════════════════════════`);
    
    if (message) {
      return { message, errorCategory: err.category, status: 200 };
    }
    // Unknown category on a typed error — still use the error's own category
    return {
      message: ERROR_MESSAGES.unknown,
      errorCategory: err.category,
      status: 200,
    };
  }

  if (!(err instanceof Error)) {
    console.error(`[chatbot:${requestId}] Non-Error thrown:`, err);
    return {
      message: ERROR_MESSAGES.unknown,
      errorCategory: 'unknown',
      status: 200,
    };
  }

  const msg = err.message.toLowerCase();

  // All providers exhausted
  if (msg.includes('all configured ai providers') || msg.includes('all providers')) {
    console.error(`[chatbot:${requestId}] All providers exhausted: ${err.message}`);
    return {
      message: ERROR_MESSAGES.all_unavailable,
      errorCategory: 'all_unavailable',
      status: 200,
    };
  }

  // No provider configured
  if (msg.includes('no ai provider configured') || msg.includes('no provider')) {
    console.error(`[chatbot:${requestId}] No provider configured: ${err.message}`);
    return {
      message: ERROR_MESSAGES.not_configured,
      errorCategory: 'not_configured',
      status: 200,
    };
  }

  // Authentication failures — only match explicit auth error messages, not numbers in prose
  if (msg.includes('authentication failed') || msg.includes('unauthorized') || msg.includes('forbidden') || msg.includes('invalid api key') || msg.includes('api key')) {
    console.error(`[chatbot:${requestId}] Auth failure: ${err.message}`);
    return {
      message: ERROR_MESSAGES.auth_failed,
      errorCategory: 'auth_failed',
      status: 200,
    };
  }

  // Rate limiting (429) — only match explicit rate limit messages, not numbers in prose
  if (msg.includes('rate limited') || msg.includes('rate limit') || msg.includes('quota exceeded') || msg.includes('too many requests')) {
    console.error(`[chatbot:${requestId}] Rate limited: ${err.message}`);
    return {
      message: ERROR_MESSAGES.rate_limited,
      errorCategory: 'rate_limited',
      status: 200,
    };
  }

  // Timeout / abort
  if (msg.includes('aborted') || msg.includes('timeout') || err.name === 'AbortError') {
    console.error(`[chatbot:${requestId}] Timeout: ${err.message}`);
    return {
      message: ERROR_MESSAGES.timeout,
      errorCategory: 'timeout',
      status: 200,
    };
  }

  // Invalid model — only match explicit model error messages, not numbers in prose
  if (msg.includes('model not found') || msg.includes('invalid model') || msg.includes('model does not exist')) {
    console.error(`[chatbot:${requestId}] Invalid model: ${err.message}`);
    return {
      message: ERROR_MESSAGES.invalid_model,
      errorCategory: 'invalid_model',
      status: 200,
    };
  }

  // Unsupported provider
  if (msg.includes('unsupported ai provider')) {
    console.error(`[chatbot:${requestId}] Unsupported provider: ${err.message}`);
    return {
      message: ERROR_MESSAGES.not_configured,
      errorCategory: 'not_configured',
      status: 200,
    };
  }

  // Network errors
  if (msg.includes('fetch failed') || msg.includes('network') || msg.includes('econnrefused') || msg.includes('enotfound') || msg.includes('dns')) {
    console.error(`[chatbot:${requestId}] Network error: ${err.message}`);
    return {
      message: ERROR_MESSAGES.network,
      errorCategory: 'network',
      status: 200,
    };
  }

  // Server errors (5xx) — only match explicit server error messages, not numbers in prose
  if (msg.includes('server error') || msg.includes('internal server error') || msg.includes('bad gateway') || msg.includes('service unavailable')) {
    console.error(`[chatbot:${requestId}] Server error: ${err.message}`);
    return {
      message: ERROR_MESSAGES.all_unavailable,
      errorCategory: 'all_unavailable',
      status: 200,
    };
  }

  // Catch-all — only reached after exhausting all specific patterns
  console.error(`[chatbot:${requestId}] Unclassified error: ${err.message}`);
  return {
    message: ERROR_MESSAGES.unknown,
    errorCategory: 'unknown',
    status: 200,
  };
}

/**
 * Smart local fallback response system. When AI providers are unavailable,
 * this detects common question patterns and returns helpful branded responses
 * about MG Blessed Beginnings tools and features.
 */

interface FallbackResponse {
  answer: string;
  suggestions?: string[];
}

const FALLBACK_PATTERNS: Array<{
  patterns: RegExp[];
  response: FallbackResponse;
}> = [
  // Greetings
  {
    patterns: [/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening))/i],
    response: {
      answer: "Hello! Welcome to MG Blessed Beginnings. I'm here to help you explore our AI-powered business tools, SEO services, and digital marketing solutions. What would you like to know about?",
      suggestions: ['Browse AI Tools', 'Our Services', 'Book Consultation'],
    },
  },
  // AI tools questions
  {
    patterns: [/ai\s*tool/i, /artificial\s*intelligence/i, /automation/i, /generat(e|ion)/i, /content\s*creat/i, /product\s*description/i, /title\s*optim/i],
    response: {
      answer: "We offer a suite of **free AI-powered tools** to boost your business:\n\n- **AI Product Description Generator** — create compelling product listings\n- **Title Optimizer** — improve click-through rates with AI-crafted titles\n- **Content Creator** — generate blog posts, social media content, and more\n- **SEO Keyword Analyzer** — find high-value keywords for your niche\n\nAll tools are available at [/ai-tools](/ai-tools) — no signup required!",
      suggestions: ['Try AI Tools', 'Pricing Info', 'Contact Support'],
    },
  },
  // SEO services
  {
    patterns: [/seo/i, /search\s*engine/i, /keyword/i, /backlink/i, /ranking/i, /google\s*rank/i, /organic\s*traffic/i],
    response: {
      answer: "Our **SEO services** help businesses rank higher on search engines:\n\n- Comprehensive site audits and technical SEO fixes\n- Keyword research and gap analysis\n- Backlink building and competitor analysis\n- Content optimization and strategy\n- Local SEO for brick-and-mortar businesses\n\nCheck out our detailed guides on the [blog](/blog) or [book a free consultation](/book-consultation) for a custom SEO strategy.",
      suggestions: ['Free SEO Audit', 'Read Blog', 'Book Consultation'],
    },
  },
  // Pricing
  {
    patterns: [/pric(e|ing)/i, /cost/i, /how\s*much/i, /fee/i, /rate/i, /charge/i, /afford/i, /budget/i],
    response: {
      answer: "We offer flexible pricing tailored to your business needs:\n\n- **Free AI tools** — available to everyone at [/ai-tools](/ai-tools)\n- **Custom service packages** — based on your specific requirements\n- **Consultation-based quotes** — we analyze your needs first\n\nFor an accurate quote, I recommend [booking a free consultation](/book-consultation) where our team can assess your goals and provide a personalized proposal.",
      suggestions: ['Book Free Consultation', 'Browse Free Tools', 'Contact Us'],
    },
  },
  // Booking / consultation
  {
    patterns: [/book/i, /consultation/i, /appointment/i, /schedule/i, /meeting/i, /call/i, /talk\s*to/i, /speak\s*with/i],
    response: {
      answer: "You can **book a free consultation** with our team to discuss your business goals. During the consultation, we'll:\n\n- Understand your current challenges\n- Recommend the best tools and strategies\n- Provide a custom roadmap for growth\n\nVisit our [booking page](/book-consultation) to schedule a time that works for you. We look forward to helping your business grow!",
      suggestions: ['Book Now', 'Our Services', 'FAQ'],
    },
  },
  // E-commerce
  {
    patterns: [/shopify/i, /ebay/i, /etsy/i, /e-?commerce/i, /online\s*store/i, /product\s*list/i, /dropship/i, /sell\s*online/i],
    response: {
      answer: "We specialize in **e-commerce solutions** across multiple platforms:\n\n- **Shopify** — store setup, theme customization, app integration\n- **eBay** — listing optimization, seller account management\n- **Etsy** — handmade/vintage product optimization\n- **Amazon** — FBA guidance and listing optimization\n\nOur AI tools can also auto-generate optimized product descriptions and titles. Explore them at [/ai-tools](/ai-tools).",
      suggestions: ['AI Product Tools', 'E-commerce Services', 'Book Consultation'],
    },
  },
  // Courses / training
  {
    patterns: [/course/i, /training/i, /learn/i, /tutorial/i, /education/i, /class/i, /lesson/i, /skill/i],
    response: {
      answer: "We offer **online courses and training** to help you master digital business skills:\n\n- SEO fundamentals and advanced strategies\n- E-commerce platform mastery (Shopify, eBay, Etsy)\n- AI tool usage for content creation\n- Digital marketing and social media\n\nVisit our [blog](/blog) for free guides and tutorials, or [contact us](/contact) for information about upcoming courses.",
      suggestions: ['Read Blog', 'Contact Us', 'AI Tools'],
    },
  },
  // Contact info
  {
    patterns: [/contact/i, /reach/i, /email/i, /phone/i, /support/i, /help\s*desk/i, /get\s*in\s*touch/i],
    response: {
      answer: "You can reach our team through several channels:\n\n- **[Contact page](/contact)** — send us a message directly\n- **[Book a consultation](/book-consultation)** — schedule a call with our experts\n- **WhatsApp** — use the floating button on any page for quick questions\n\nWe typically respond within 24 hours. For urgent matters, booking a consultation is the fastest option.",
      suggestions: ['Contact Page', 'Book Consultation', 'WhatsApp Chat'],
    },
  },
  // Services overview
  {
    patterns: [/service/i, /offer/i, /what\s*do\s*you/i, /provide/i, /solution/i, /help\s*with/i, /can\s*you/i],
    response: {
      answer: "MG Blessed Beginnings offers a comprehensive suite of **digital business solutions**:\n\n- **AI Marketing Tools** — free automated content generation\n- **SEO Services** — audits, keyword research, backlinks\n- **E-commerce Solutions** — Shopify, eBay, Etsy optimization\n- **Digital Marketing** — social media, email campaigns\n- **Business Intelligence** — data-driven growth strategies\n- **Online Courses** — skill-building for entrepreneurs\n\nExplore our [AI tools](/ai-tools) for free, or [book a consultation](/book-consultation) for personalized services.",
      suggestions: ['Browse AI Tools', 'View Services', 'Book Consultation'],
    },
  },
  // Security / trust
  {
    patterns: [/secur(e|ity)/i, /trust/i, /safe/i, /privacy/i, /data\s*protect/i, /legit/i, /reliable/i, /review/i],
    response: {
      answer: "Trust and security are core to what we do at MG Blessed Beginnings:\n\n- All data is processed securely with industry-standard encryption\n- We never share your business data with third parties\n- Our AI tools run locally — your content stays private\n- Transparent pricing with no hidden fees\n\nRead testimonials from our satisfied clients or [contact us](/contact) if you have specific security concerns.",
      suggestions: ['Read Testimonials', 'Contact Us', 'Privacy Policy'],
    },
  },
  // Thank you / appreciation
  {
    patterns: [/thank/i, /appreciate/i, /great\s*job/i, /awesome/i, /helpful/i, /nice/i],
    response: {
      answer: "You're welcome! I'm glad I could help. If you have any more questions about our AI tools, SEO services, or anything else, feel free to ask anytime. You can also browse our [AI tools](/ai-tools) or check out our [blog](/blog) for more resources.",
      suggestions: ['Browse AI Tools', 'Read Blog', 'Book Consultation'],
    },
  },
  // General help / how to
  {
    patterns: [/how\s*to/i, /guide/i, /step/i, /process/i, /start/i, /begin/i, /getting\s*started/i],
    response: {
      answer: "Getting started with MG Blessed Beginnings is easy:\n\n1. **Try our free AI tools** at [/ai-tools](/ai-tools) — no account needed\n2. **Read our blog** at [/blog](/blog) for step-by-step guides\n3. **Book a free consultation** at [/book-consultation](/book-consultation) for personalized advice\n\nWhat specific area would you like help with? I can point you to the right resources.",
      suggestions: ['AI Tools', 'Blog Guides', 'Book Consultation'],
    },
  },
];

/** Default fallback when no pattern matches — provides actionable alternatives */
const DEFAULT_FALLBACK: FallbackResponse = {
  answer: "I'm having trouble connecting to my AI brain right now, but I don't want to leave you empty-handed! Here's what you can do:\n\n- Try our **free AI tools** at [/ai-tools](/ai-tools) — Product Description Generator, SEO Title Optimizer, Hashtag Generator, and Profit Calculator all work instantly\n- Check out our **[blog](/blog)** for guides on SEO, e-commerce, and marketing\n- **[Book a free consultation](/book-consultation)** to speak with our team directly\n- Visit our **[contact page](/contact)** for support\n\nPlease try asking again in a moment — I'll be happy to provide a detailed AI-powered answer!",
  suggestions: ['Try AI Tools', 'Read Blog', 'Book Consultation', 'Contact Support'],
};

/**
 * Match user message against known patterns and return a helpful local response.
 * Returns null if the error is not a provider-unavailability issue (e.g., timeout/network
 * errors should still show the error UI so users can retry).
 */
function getLocalFallback(message: string, errorCategory: AIErrorCategory): FallbackResponse | null {
  // Provide smart fallbacks for all provider-related issues, including transient ones.
  // This ensures users always get a helpful response rather than a generic error card.
  const fallbackCategories: AIErrorCategory[] = [
    'not_configured', 'all_unavailable', 'auth_failed',
    'rate_limited', 'invalid_model', 'timeout',
  ];
  if (!fallbackCategories.includes(errorCategory)) {
    return null;
  }

  const normalizedMsg = message.trim().toLowerCase();

  for (const entry of FALLBACK_PATTERNS) {
    for (const pattern of entry.patterns) {
      if (pattern.test(normalizedMsg)) {
        return entry.response;
      }
    }
  }

  return DEFAULT_FALLBACK;
}

export const chatbotController = {
  /**
   * GET /api/chatbot/status — returns the currently active provider and model.
   * Public endpoint so the chatbot widget can show which AI is responding.
   */
  async status(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Try DB primary first
      const dbProvider = await getActiveProvider();
      if (dbProvider) {
        res.json({
          success: true,
          data: {
            provider: dbProvider.provider,
            model: dbProvider.model,
            source: 'database',
          },
        });
        return;
      }

      // Fall back to env config
      const envProviders = getEnvProviderStatuses();
      const available = envProviders.filter((p) => p.hasKey);
      const recommendation = getRecommendedProvider();

      if (recommendation) {
        res.json({
          success: true,
          data: {
            provider: recommendation.provider,
            model: recommendation.model,
            source: 'environment',
          },
        });
        return;
      }

      // No provider available
      res.json({
        success: true,
        data: {
          provider: null,
          model: null,
          source: 'none',
          configuredKeys: available.map((p) => p.provider),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    const requestId = crypto.randomUUID().slice(0, 8);
    let trimmedMessage = '';

    try {
      const { message } = req.body;

      if (!message || typeof message !== 'string' || !message.trim()) {
        res.status(400).json({ success: false, error: 'message is required.', errorCategory: 'unknown', requestId });
        return;
      }

      trimmedMessage = message.trim();
      console.log(`[chatbot:${requestId}] Received message (${trimmedMessage.length} chars): "${trimmedMessage.slice(0, 80)}${trimmedMessage.length > 80 ? '...' : ''}"`);

      if (trimmedMessage.length > 2000) {
        res.status(400).json({ success: false, error: 'Message must be 2000 characters or less.', errorCategory: 'unknown', requestId });
        return;
      }

      const answer = await generateCompletion(trimmedMessage, {
        system: CHATBOT_SYSTEM_PROMPT,
        maxTokens: 512,
      });

      console.log(`[chatbot:${requestId}] AI responded successfully (${answer.length} chars)`);

      res.json({ success: true, answer, requestId });
    } catch (err) {
      console.error(`[chatbot:${requestId}] Error generating response:`, err instanceof Error ? err.message : err);

      const classified = classifyError(err, requestId);
      console.log(`[chatbot:${requestId}] Classified error: ${classified.errorCategory} — ${classified.message}`);

      // For configuration/unavailability/transient errors, return a helpful fallback
      // response as a successful reply instead of an error. This keeps the
      // chatbot UX friendly and avoids the alarming red error card.
      const fallbackCategories = ['not_configured', 'all_unavailable', 'auth_failed', 'rate_limited', 'invalid_model', 'timeout'];
      if (fallbackCategories.includes(classified.errorCategory)) {
        console.log(`[chatbot:${requestId}] Returning fallback response for category: ${classified.errorCategory}`);

        // Try smart local fallback that matches question patterns
        const localFallback = getLocalFallback(trimmedMessage, classified.errorCategory);
        if (localFallback) {
          res.json({
            success: true,
            answer: localFallback.answer,
            suggestions: localFallback.suggestions || [],
            isFallback: true,
            errorCategory: classified.errorCategory,
            requestId,
          });
          return;
        }

        // Should not reach here since getLocalFallback always returns something
        // for these categories, but defensive fallback just in case
        res.json({
          success: true,
          answer: DEFAULT_FALLBACK.answer,
          suggestions: DEFAULT_FALLBACK.suggestions,
          isFallback: true,
          errorCategory: classified.errorCategory,
          requestId,
        });
        return;
      }

      res.status(classified.status).json({
        success: false,
        error: classified.message,
        errorCategory: classified.errorCategory,
        requestId,
      });
    }
  },
};
