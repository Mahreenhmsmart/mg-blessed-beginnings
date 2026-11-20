import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Badge, Spinner } from '@/components/ui';
import CopyButton from '@/components/ui/CopyButton';
import SEOHead from '@/components/SEOHead';
import FAQAccordion from '@/components/FAQAccordion';
import VideoEmbed from '@/components/VideoEmbed';
import { cn } from '@/utils/cn';
import { Sparkles, ChevronLeft, MessageCircle, Send, Copy, Check, Phone } from 'lucide-react';
import type { FAQItem } from '@/components/FAQAccordion';
import { SITE_NAME } from '@/seo';

// ─── Types ──────────────────────────────────────────────────────────────────────

type MessageType = 'catalog' | 'broadcast' | 'order-confirmation' | 'cod-followup' | 'welcome' | 'abandoned-cart';
type Tone = 'friendly' | 'professional';
type Language = 'english' | 'roman-urdu';

interface FormData {
  businessName: string;
  productService: string;
  messageType: MessageType;
  tone: Tone;
  language: Language;
}

// ─── Message Templates ──────────────────────────────────────────────────────────

const MESSAGE_LABELS: Record<MessageType, string> = {
  catalog: 'Catalog Message',
  broadcast: 'Broadcast Message',
  'order-confirmation': 'Order Confirmation',
  'cod-followup': 'COD Follow-up',
  welcome: 'Welcome Message',
  'abandoned-cart': 'Abandoned Cart Reminder',
};

/**
 * Generate 3 WhatsApp message variations based on form input.
 * Messages are short, warm, and ready to paste — no placeholders beyond user input.
 */
function generateMessages(data: FormData): string[] {
  const { businessName, productService, messageType, tone, language } = data;
  const biz = businessName.trim();
  const product = productService.trim();
  const isFriendly = tone === 'friendly';
  const isUrdu = language === 'roman-urdu';

  const templates: Record<MessageType, () => string[]> = {
    catalog: () => {
      if (isUrdu) {
        return [
          `Assalam-o-Alaikum! ${biz} ki taraf se aapke liye khaas collection dekhein:\n\n${product}\n\nAbhi reply karein aur apna order place karein! `,
          `Salam! Humari nayi range dekhna chahte hain?\n\n${product}\n\n${biz} par abhi available hai. Details ke liye message karein!`,
          `Hi! ${biz} mein ${product} ab stock mein hai.\n\nCatalog dekhne ke liye reply karein ya humein call karein. Limited stock hai jaldi order karein!`,
        ];
      }
      return [
        `Hey there! Check out our latest collection at ${biz}:\n\n${product}\n\nReply to this message to place your order or ask for more details!`,
        `Hi! We've got something special for you at ${biz}.\n\n${product}\n\nBrowse our full catalog — just reply "CATALOG" and we'll send it right over!`,
        `Welcome to ${biz}! Here's what's trending right now:\n\n${product}\n\nTap reply to grab yours before they're gone!`,
      ];
    },
    broadcast: () => {
      if (isUrdu) {
        return [
          `Salam! ${biz} ki taraf se zabardast offer:\n\n${product}\n\nYeh deal sirf limited time ke liye hai. Abhi order karein!`,
          `Assalam-o-Alaikum! ${biz} mein ${product} par special discount chal raha hai.\n\nJaldi fayda uthayein — offer jald khatam ho rahi hai!`,
          `Hi! ${biz} ka naya update:\n\n${product}\n\nApne doston ko bhi batayein aur mil kar enjoy karein!`,
        ];
      }
      return [
        `Big news from ${biz}!\n\n${product}\n\nThis offer won't last long — grab yours today! Reply to order now.`,
        `Hey! ${biz} here with an exclusive deal just for you:\n\n${product}\n\nDon't miss out — limited stock available. Message us to claim yours!`,
        `Quick update from ${biz}!\n\n${product}\n\nShare this with friends who'd love it too. Order by replying to this message!`,
      ];
    },
    'order-confirmation': () => {
      if (isUrdu) {
        return [
          `Shukriya! Aapka order ${biz} par confirm ho gaya hai.\n\nProduct: ${product}\n\nHum jald hi dispatch karenge. Koi sawaal ho toh poochein!`,
          `Assalam-o-Alaikum! Aapka ${product} ka order mil gaya hai.\n\n${biz} team aapki delivery jald prepare karegi. Update ke liye wait karein!`,
          `Hi! Order confirmed!\n\n${product}\n\n${biz} se aapko tracking info jaldi milegi. Shukriya hum se khareedne ke liye!`,
        ];
      }
      return [
        `Thank you for your order at ${biz}!\n\nYour ${product} has been confirmed and we're preparing it for shipment.\n\nWe'll send you tracking details soon!`,
        `Order confirmed! Your ${product} from ${biz} is being packed right now.\n\nYou'll receive a shipping update shortly. Thank you for choosing us!`,
        `Great news — your order is confirmed!\n\n${product}\n\nOur team at ${biz} will notify you once it ships. Thanks for shopping with us!`,
      ];
    },
    'cod-followup': () => {
      if (isUrdu) {
        return [
          `Salam! Aapka COD order ${biz} se raaste mein hai.\n\n${product}\n\nDelivery ke waqt cash ready rakhein. Koi masla ho toh humein batayein!`,
          `Hi! ${biz} ki taraf se reminder:\n\nAapka ${product} ka order jald deliver hoga. Braah-e-meherbani payment tayaar rakhein.`,
          `Assalam-o-Alaikum! Aapka order (${product}) dispatch ho chuka hai.\n\nCash on delivery ke liye tayyar rahein. ${biz} team shukriya kehti hai!`,
        ];
      }
      return [
        `Hi! Quick heads up — your COD order from ${biz} is on its way!\n\n${product}\n\nPlease keep the payment ready upon delivery. Reach out if you have any questions!`,
        `Reminder from ${biz}: Your ${product} order will arrive soon!\n\nPlease have the exact amount ready for cash on delivery. Thank you for your order!`,
        `Your order from ${biz} is almost there!\n\n${product}\n\nJust a friendly reminder to keep the COD payment ready. Can't wait for you to receive it!`,
      ];
    },
    welcome: () => {
      if (isUrdu) {
        return [
          `Assalam-o-Alaikum! ${biz} mein khushamdeed!\n\nHum ${product} offer karte hain. Koi bhi sawaal ho toh hum yahan hain!`,
          `Salam! ${biz} family mein shamil hone ka shukriya!\n\n${product} — humari khaas cheez. Aaj hi explore karein!`,
          `Hi! Welcome to ${biz}!\n\nHum ${product} mein specialize karte hain. Pehle order par special deal milegi!`,
        ];
      }
      return [
        `Welcome to ${biz}! So glad you're here!\n\nWe specialize in ${product}. Feel free to browse our catalog or ask us anything — we're happy to help!`,
        `Hey, welcome to the ${biz} family!\n\nWe're all about ${product}. Drop us a message anytime — we'd love to help you find exactly what you need!`,
        `Hi there! Thanks for connecting with ${biz}!\n\nWe offer ${product} and we're excited to serve you. Ask us anything to get started!`,
      ];
    },
    'abandoned-cart': () => {
      if (isUrdu) {
        return [
          `Salam! Aapne ${biz} par ${product} cart mein chhora tha.\n\nYeh abhi bhi available hai! Order complete karein?`,
          `Hi! Lagta hai aap ${product} bhool gaye ${biz} par.\n\nStock khatam hone wala hai — abhi order karein!`,
          `Assalam-o-Alaikum! Aapka ${product} ${biz} par aapka intezaar kar raha hai.\n\nKya hum aapki madad karein order complete karne mein?`,
        ];
      }
      return [
        `Hey! Noticed you left ${product} in your cart at ${biz}.\n\nIt's still waiting for you! Want to complete your order? Just reply and we'll help!`,
        `Hi from ${biz}! You were so close to getting ${product}!\n\nDon't let it slip away — stock is limited. Reply to finish your order!`,
        `Still thinking about ${product}? It's still available at ${biz}!\n\nWe'd hate for you to miss out. Tap reply and we'll complete your order together!`,
      ];
    },
  };

  const generator = templates[messageType];
  if (!generator) {
    // Fallback for unknown types
    return [
      `Hi from ${biz}! Here's what we have for you:\n\n${product}\n\nReply to learn more!`,
      `Welcome! ${biz} presents:\n\n${product}\n\nMessage us for details or to place an order.`,
      `Check this out from ${biz}:\n\n${product}\n\nDon't hesitate to reach out with any questions!`,
    ];
  }

  return generator();
}

// ─── FAQs ───────────────────────────────────────────────────────────────────────

const WHATSAPP_FAQS: FAQItem[] = [
  { question: 'Is this WhatsApp message generator really free?', answer: 'Yes! Generate unlimited WhatsApp messages for your business completely free. No sign-up required, no hidden fees.' },
  { question: 'What message types are supported?', answer: 'Catalog messages, broadcast announcements, order confirmations, COD follow-ups, welcome messages, and abandoned cart reminders. Each type generates contextually appropriate messages.' },
  { question: 'Can I choose the language?', answer: 'Yes! Messages can be generated in English or Roman Urdu (Urdu written in English script). Both options produce natural, conversational messages ready to paste into WhatsApp.' },
  { question: 'Are the messages ready to send?', answer: 'Absolutely. Every generated message is short, warm, and formatted for WhatsApp. Just copy and paste directly into your WhatsApp Business chat.' },
  { question: 'How many variations do I get?', answer: 'Each generation produces 3 message variations so you can pick the one that best fits your style or A/B test different approaches with your customers.' },
];

// ─── Component ──────────────────────────────────────────────────────────────────

export default function WhatsAppBusinessGenerator() {
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    productService: '',
    messageType: 'catalog',
    tone: 'friendly',
    language: 'english',
  });
  const [messages, setMessages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = () => {
    if (!formData.businessName.trim() || !formData.productService.trim()) return;
    setIsGenerating(true);
    // Small delay for UX feel
    setTimeout(() => {
      setMessages(generateMessages(formData));
      setIsGenerating(false);
    }, 600);
  };

  const isValid = formData.businessName.trim().length > 0 && formData.productService.trim().length > 0;

  return (
    <>
      <SEOHead
        title={`WhatsApp Business Generator — Free AI Tool | ${SITE_NAME}`}
        description="Generate ready-to-paste WhatsApp messages for catalogs, broadcasts, order confirmations, COD follow-ups, and more. Free forever."
        keywords="whatsapp business generator, whatsapp messages, catalog message, broadcast message, COD follow-up, Pakistani sellers, ecommerce whatsapp"
        canonicalUrl="/tools/whatsapp-business-generator"
        data-icod-id="src_pages_whatsappbusinessgenerator_tsx_seo" />
      {/* Hero Section */}
      <section className="py-16 md:py-24" style={{ background: 'var(--section-lavender)' }} data-icod-id="src_pages_whatsappbusinessgenerator_tsx_hero">
        <div className="container mx-auto px-4" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_hero_container">
          <nav className="mb-8" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_breadcrumb">
            <Link to="/ai-tools" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_backlink">
              <ChevronLeft className="h-4 w-4 mr-1" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_backicon" />
              Back to AI Tools
            </Link>
          </nav>

          <div className="max-w-7xl mx-auto text-center" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_hero_content">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_badges">
              <Badge variant="free" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_free_badge">Free Forever</Badge>
              <Badge variant="ai" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_category_badge">Customer Service</Badge>
              <span
                className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border whitespace-nowrap shrink-0 bg-cyan/10 text-cyan border-cyan/20')}
                data-icod-id="src_pages_whatsappbusinessgenerator_tsx_live_badge">
                Live
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-heading" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_title">
              WhatsApp Business Generator
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_desc">
              AI-powered WhatsApp messages for Pakistani sellers. Generate ready-to-send catalog messages, broadcasts, order confirmations, and more in seconds.
            </p>
          </div>
        </div>
      </section>
      {/* Tool Banner Image */}
      <div className="w-full" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_banner">
        <img
          src="https://drive.google.com/thumbnail?id=1bnZz2ozKQ249fXnj0gr0uq3ttk-rC7KK&sz=w1920"
          alt="WhatsApp Business Generator Banner"
          className="w-full h-auto object-cover"
          loading="eager"
          data-icod-id="src_pages_whatsappbusinessgenerator_tsx_banner_img"
        />
      </div>
      {/* Generator Form */}
      <section className="py-12 bg-background" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_generator">
        <div className="container mx-auto px-4" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_gen_container">
          <div className="max-w-3xl mx-auto" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_gen_inner">
            <Card className="p-6 md:p-8 space-y-6" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_form_card">
              <div className="flex items-center gap-3 mb-2" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_form_header">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366]/10" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_form_icon_bg">
                  <MessageCircle className="h-5 w-5 text-[#25D366]" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_form_icon" />
                </div>
                <h2 className="text-xl font-bold text-foreground font-heading" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_form_title">
                  Create Your Message
                </h2>
              </div>

              {/* Business Name */}
              <div data-icod-id="src_pages_whatsappbusinessgenerator_tsx_field_bizname">
                <label htmlFor="businessName" className="block text-sm font-medium text-foreground mb-1.5" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_label_bizname">
                  Business Name <span
                  className="text-destructive"
                  data-icod-id="src_pages_whatsappbusinessgenerator_tsx_fbcb">*</span>
                </label>
                <input
                  id="businessName"
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  placeholder="e.g., MG Blessed Beginnings"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  data-icod-id="src_pages_whatsappbusinessgenerator_tsx_input_bizname" />
              </div>

              {/* Product / Service */}
              <div data-icod-id="src_pages_whatsappbusinessgenerator_tsx_field_product">
                <label htmlFor="productService" className="block text-sm font-medium text-foreground mb-1.5" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_label_product">
                  Product / Service <span
                  className="text-destructive"
                  data-icod-id="src_pages_whatsappbusinessgenerator_tsx_60f1">*</span>
                </label>
                <input
                  id="productService"
                  type="text"
                  value={formData.productService}
                  onChange={(e) => handleChange('productService', e.target.value)}
                  placeholder="e.g., Handmade leather bags, organic skincare"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  data-icod-id="src_pages_whatsappbusinessgenerator_tsx_input_product" />
              </div>

              {/* Message Type */}
              <div data-icod-id="src_pages_whatsappbusinessgenerator_tsx_field_msgtype">
                <label htmlFor="messageType" className="block text-sm font-medium text-foreground mb-1.5" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_label_msgtype">
                  Message Type
                </label>
                <select
                  id="messageType"
                  value={formData.messageType}
                  onChange={(e) => handleChange('messageType', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  data-icod-id="src_pages_whatsappbusinessgenerator_tsx_select_msgtype">
                  {(Object.entries(MESSAGE_LABELS) as [MessageType, string][]).map(([value, label]) => (
                    <option
                      key={value}
                      value={value}
                      data-icod-id={`src_pages_whatsappbusinessgenerator_tsx_c655_${value}`}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Tone + Language row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_row_tone_lang">
                <div data-icod-id="src_pages_whatsappbusinessgenerator_tsx_field_tone">
                  <label htmlFor="tone" className="block text-sm font-medium text-foreground mb-1.5" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_label_tone">
                    Tone
                  </label>
                  <select
                    id="tone"
                    value={formData.tone}
                    onChange={(e) => handleChange('tone', e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    data-icod-id="src_pages_whatsappbusinessgenerator_tsx_select_tone">
                    <option
                      value="friendly"
                      data-icod-id="src_pages_whatsappbusinessgenerator_tsx_94e1">Friendly</option>
                    <option
                      value="professional"
                      data-icod-id="src_pages_whatsappbusinessgenerator_tsx_fa9c">Professional</option>
                  </select>
                </div>
                <div data-icod-id="src_pages_whatsappbusinessgenerator_tsx_field_language">
                  <label htmlFor="language" className="block text-sm font-medium text-foreground mb-1.5" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_label_language">
                    Language
                  </label>
                  <select
                    id="language"
                    value={formData.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    data-icod-id="src_pages_whatsappbusinessgenerator_tsx_select_language">
                    <option
                      value="english"
                      data-icod-id="src_pages_whatsappbusinessgenerator_tsx_1a9c">English</option>
                    <option
                      value="roman-urdu"
                      data-icod-id="src_pages_whatsappbusinessgenerator_tsx_a16e">Roman Urdu</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!isValid || isGenerating}
                onClick={handleGenerate}
                data-icod-id="src_pages_whatsappbusinessgenerator_tsx_generate_btn">
                {isGenerating ? (
                  <>
                    <Spinner size="sm" className="mr-2" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_spinner" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_gen_icon" />
                    Generate Messages
                  </>
                )}
              </Button>
            </Card>

            {/* Results */}
            {messages.length > 0 && (
              <div className="mt-8 space-y-4" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_results">
                <h3 className="text-lg font-bold text-foreground font-heading flex items-center gap-2" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_results_title">
                  <Send className="h-5 w-5 text-primary" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_results_icon" />
                  Your Messages
                </h3>
                {messages.map((msg, idx) => (
                  <Card
                    key={idx}
                    className="relative p-5 border-border/60 bg-card"
                    data-icod-id={`src_pages_whatsappbusinessgenerator_tsx_msg_${idx}`}>
                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4" data-icod-id={`src_pages_whatsappbusinessgenerator_tsx_msg_inner_${idx}`}>
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-primary-foreground text-sm font-bold"
                        data-icod-id={`src_pages_whatsappbusinessgenerator_tsx_msg_num_${idx}`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0" data-icod-id={`src_pages_whatsappbusinessgenerator_tsx_msg_content_${idx}`}>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap" data-icod-id={`src_pages_whatsappbusinessgenerator_tsx_msg_text_${idx}`}>
                          {msg}
                        </p>
                      </div>
                      <CopyButton
                        text={msg}
                        label="Copy"
                        className="shrink-0 self-end sm:self-auto"
                        data-icod-id={`src_pages_whatsappbusinessgenerator_tsx_msg_copy_${idx}`} />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      {/* How It Works */}
      <section className="py-16 md:py-20 bg-background" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_hiw">
        <div className="container mx-auto px-4" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_hiw_container">
          <div className="max-w-4xl mx-auto" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_hiw_inner">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center font-heading" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_hiw_title">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_hiw_grid">
              {[
                { step: 1, title: 'Enter Your Details', desc: 'Add your business name, product/service, and choose a message type.' },
                { step: 2, title: 'AI Generates Messages', desc: 'Get 3 unique, ready-to-send WhatsApp message variations instantly.' },
                { step: 3, title: 'Copy & Send', desc: 'Pick your favorite, copy it, and paste directly into WhatsApp Business.' },
              ].map((item) => (
                <div key={item.step} className="text-center" data-icod-id={`src_pages_whatsappbusinessgenerator_tsx_step_${item.step}`}>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4" data-icod-id={`src_pages_whatsappbusinessgenerator_tsx_stepnum_${item.step}`}>
                    <span className="text-primary font-bold text-lg" data-icod-id={`src_pages_whatsappbusinessgenerator_tsx_stepn_${item.step}`}>{item.step}</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2" data-icod-id={`src_pages_whatsappbusinessgenerator_tsx_steptitle_${item.step}`}>
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm" data-icod-id={`src_pages_whatsappbusinessgenerator_tsx_stepdesc_${item.step}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* See It In Action */}
      <section className="py-16 md:py-20" style={{ background: 'var(--section-aqua)' }} data-icod-id="src_pages_whatsappbusinessgenerator_tsx_video_section">
        <div className="container mx-auto px-4" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_video_container">
          <div className="max-w-3xl mx-auto" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_video_inner">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center font-heading" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_video_title">
              See It In Action
            </h2>
            <VideoEmbed
              src="https://drive.google.com/file/d/1SRJ4tZKZUGKrT0TBI1ceLQ6djobuCo7L/preview"
              title="WhatsApp Business Generator Tutorial"
              description="Watch how easy it is to generate professional WhatsApp messages for your business."
              data-icod-id="src_pages_whatsappbusinessgenerator_tsx_video_embed" />
          </div>
        </div>
      </section>
      {/* FAQ */}
      <section className="py-16 md:py-20" style={{ background: 'var(--section-lavender)' }} data-icod-id="src_pages_whatsappbusinessgenerator_tsx_faq_section">
        <div className="max-w-3xl mx-auto px-4" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_faq_container">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground font-heading text-center mb-10" data-icod-id="src_pages_whatsappbusinessgenerator_tsx_faq_title">
            Frequently Asked Questions
          </h2>
          <FAQAccordion items={WHATSAPP_FAQS} data-icod-id="src_pages_whatsappbusinessgenerator_tsx_faq_accordion" />
        </div>
      </section>
    </>
  );
}
