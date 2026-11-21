import SEOHead from '@/components/SEOHead';
import FAQAccordion from '@/components/FAQAccordion';
import AdSenseSlot from '@/components/AdSenseSlot';
import { Card } from '@/components/ui';
import { Award, Target, Globe, Mail, MapPin, Linkedin, Instagram, MessageCircle, Heart, Lightbulb, BookOpen, Youtube, ExternalLink } from 'lucide-react';
import type { FAQItem } from '@/components/FAQAccordion';
import { SchemaInjector, PAGE_META } from '@/seo';
import { useSeo } from '@/components/Seo';
import { getAboutContent } from '@/services/pageContentService';

const aboutMeta = PAGE_META['/about'];

const ABOUT_FAQ_ITEMS: FAQItem[] = [
  {
    question: 'Who is Mahreen Yousaf?',
    answer: 'Mahreen Yousaf is the Founder and CEO of MG Blessed Beginnings. She is an e-commerce consultant, AI and digital marketing mentor, and specialist in Shopify, eBay, and Etsy business growth.',
  },
  {
    question: 'What services does MG Blessed Beginnings offer?',
    answer: 'We offer free AI tools for content creation, professional e-commerce consulting, website audits, SEO optimization, Shopify store setup, eBay listing optimization, and digital marketing strategies.',
  },
  {
    question: 'Is MG Blessed Beginnings available worldwide?',
    answer: 'Yes. While based in Pakistan, we work with entrepreneurs and businesses globally via online consultations, WhatsApp, email, and our digital platform.',
  },
  {
    question: 'How can I contact Mahreen Yousaf?',
    answer: 'You can reach out via email at hmsmart.official@gmail.com, WhatsApp at +92 335 8380233, or through our contact form. We typically respond within 24 hours.',
  },
  {
    question: 'Are the AI tools on MG Blessed Beginnings free?',
    answer: 'Yes, our core AI tools including product description generators, hashtag generators, and SEO optimizers are completely free to use. Premium features are available through subscription plans.',
  },
];

const aboutStructuredData = [
  {
    '@type': 'AboutPage',
    name: 'About MG Blessed Beginnings',
    description: 'Learn about Mahreen Yousaf, Founder & CEO of MG Blessed Beginnings, and the mission behind the platform.',
    mainEntity: {
      '@type': 'Person',
      name: 'Mahreen Yousaf',
      jobTitle: 'Founder & CEO',
      url: 'https://mgblessed.icod.ai/about',
    },
  },
  {
    '@type': 'FAQPage',
    mainEntity: ABOUT_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  },
];

export default function About() {
  useSeo(
    'About | MG Blessed Beginnings',
    'About MG Blessed Beginnings and founder Mahreen Yousaf.',
  );
  const content = getAboutContent();
  const BELIEF_ICONS = [Heart, Lightbulb, BookOpen];

  return (
    <>
      <SEOHead
        title={aboutMeta.title}
        description={aboutMeta.description}
        keywords={aboutMeta.keywords}
        canonicalUrl={aboutMeta.canonical}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'About', url: '/about' },
        ]}
        structuredData={aboutStructuredData}
        data-icod-id="src_pages_about_tsx_1bbd" />
      <SchemaInjector
        schemaType="page"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'About', url: '/about' },
        ]}
        data-icod-id="src_pages_about_tsx_0bc5" />
      {/* Profile Hero */}
      <section
        className="py-24"
        style={{ background: 'var(--section-lavender)' }}
        data-icod-id="src_pages_about_tsx_5794">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_about_tsx_bbdf">
          <div
            className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10"
            data-icod-id="src_pages_about_tsx_223f">
            {/* Profile Photo */}
            <div className="shrink-0" data-icod-id="src_pages_about_tsx_photo_wrap">
              <img
                src="https://drive.google.com/thumbnail?id=1JyOiHzGnglHR5woY1qwApIHM3PA6BxYa&sz=w1920"
                alt="Mahreen Yousaf, founder of MG Blessed Beginnings"
                className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-border shadow-[0_8px_32px_rgba(109,0,217,0.2)] object-cover object-top"
                loading="lazy"
                decoding="async"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                data-icod-id="src_pages_about_tsx_photo_img"
              />
            </div>
            <div className="text-center md:text-left" data-icod-id="src_pages_about_tsx_hero_text">
              <img
                className="mg-logo"
                src="/assets/1795177902729_mg-logo-new-transparent-upload.webp"
                alt="MG Blessed Beginnings"
                data-icod-id="src_pages_about_tsx_logo_img" />
              <h1
                className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight"
                data-icod-id="src_pages_about_tsx_6893">{content.founderName}</h1>
              <p
                className="text-lg text-primary font-medium mb-4"
                data-icod-id="src_pages_about_tsx_subtitle">
                {content.founderTitle}
              </p>
              <p
                className="text-muted-foreground leading-relaxed max-w-xl"
                data-icod-id="src_pages_about_tsx_b2c4">
                {content.heroDescription}
              </p>
              <a
                href={content.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline underline-offset-4 mt-4"
                data-icod-id="src_pages_about_tsx_website_link">
                <Globe className="h-4 w-4" data-icod-id="src_pages_about_tsx_b49f" />
                {content.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* Ad Banner after Hero */}
      <div
        className="container mx-auto px-4 py-6"
        data-icod-id="src_pages_about_tsx_1582">
        <AdSenseSlot format="banner" data-icod-id="src_pages_about_tsx_2c76" />
      </div>
      {/* My Journey */}
      <section className="py-24 bg-background" data-icod-id="src_pages_about_tsx_journey">
        <div className="container mx-auto px-4" data-icod-id="src_pages_about_tsx_8bdf">
          <div className="max-w-7xl mx-auto" data-icod-id="src_pages_about_tsx_9335">
            <h2
              className="text-3xl font-bold text-foreground mb-8"
              data-icod-id="src_pages_about_tsx_journey_title">My Journey</h2>
            <div className="prose prose-lg text-muted-foreground space-y-5" data-icod-id="src_pages_about_tsx_90ac">
              {content.journeyParagraphs.map((paragraph, idx) => (
                <p key={idx} data-icod-id={`src_pages_about_tsx_p${idx + 1}`}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* What I Believe */}
      <section className="py-24" style={{ background: 'var(--section-blush)' }} data-icod-id="src_pages_about_tsx_beliefs">
        <div className="container mx-auto px-4" data-icod-id="src_pages_about_tsx_beliefs_container">
          <div className="max-w-7xl mx-auto" data-icod-id="src_pages_about_tsx_a6c7">
            <h2
              className="text-3xl font-bold text-foreground mb-10 text-center"
              data-icod-id="src_pages_about_tsx_beliefs_title">What I Believe</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-icod-id="src_pages_about_tsx_beliefs_grid">
              {content.beliefs.map((belief, idx) => {
                const BeliefIcon = BELIEF_ICONS[idx % BELIEF_ICONS.length];
                return (
                  <Card
                    key={belief.title}
                    className="p-6 rounded-2xl border border-border/40 shadow-[var(--shadow-card)]"
                    data-icod-id={`src_pages_about_tsx_belief_${belief.title}`}>
                    <div
                      className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4"
                      data-icod-id={`src_pages_about_tsx_ec8f_${belief.title}`}>
                      <BeliefIcon
                        className="h-6 w-6"
                        data-icod-id={`src_pages_about_tsx_4c28_${belief.title}`} />
                    </div>
                    <h3
                      className="font-semibold text-foreground mb-2"
                      data-icod-id={`src_pages_about_tsx_0890_${belief.title}`}>{belief.title}</h3>
                    <p
                      className="text-sm text-muted-foreground leading-relaxed"
                      data-icod-id={`src_pages_about_tsx_c22e_${belief.title}`}>{belief.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      {/* Areas of Expertise */}
      <section className="py-24 bg-background" data-icod-id="src_pages_about_tsx_d5e2">
        <div className="container mx-auto px-4" data-icod-id="src_pages_about_tsx_expertise_container">
          <div className="max-w-7xl mx-auto" data-icod-id="src_pages_about_tsx_8a23">
            <h2
              className="text-3xl font-bold text-foreground mb-8"
              data-icod-id="src_pages_about_tsx_55a4">Areas of Expertise</h2>
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              data-icod-id="src_pages_about_tsx_f7bd">
              {content.expertiseItems.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border/30 transition-colors duration-[250ms] hover:bg-muted/60"
                  data-icod-id={`src_pages_about_tsx_664c_${item}`}>
                  <div
                    className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"
                    data-icod-id={`src_pages_about_tsx_6727_${item}`} />
                  <span
                    className="text-sm text-foreground leading-relaxed"
                    data-icod-id={`src_pages_about_tsx_e8d5_${item}`}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Contact Info */}
      <section className="py-24" style={{ background: 'var(--section-aqua)' }} data-icod-id="src_pages_about_tsx_contact_section">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_about_tsx_0834">
          <div className="max-w-7xl mx-auto" data-icod-id="src_pages_about_tsx_e044">
            <Card className="p-8 rounded-2xl border border-border/40 shadow-[var(--shadow-md)]" data-icod-id="src_pages_about_tsx_c403">
              <h2
                className="text-2xl font-bold text-foreground mb-6"
                data-icod-id="src_pages_about_tsx_9395">Get in Touch</h2>
              <div className="space-y-4" data-icod-id="src_pages_about_tsx_2f44">
                <div className="flex items-center gap-4 text-muted-foreground" data-icod-id="src_pages_about_tsx_e750">
                  <Mail className="h-5 w-5 text-primary" data-icod-id="src_pages_about_tsx_308f" />
                  <a
                    href={`mailto:${content.email}`}
                    className="hover:text-primary transition-colors"
                    data-icod-id="src_pages_about_tsx_960e">{content.email}</a>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground" data-icod-id="src_pages_about_tsx_fdbb">
                  <MapPin className="h-5 w-5 text-primary" data-icod-id="src_pages_about_tsx_a89d" />
                  <span data-icod-id="src_pages_about_tsx_ebd2">{content.location}</span>
                </div>
                <a
                  href={content.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-muted-foreground hover:text-[#25D366] transition-colors"
                  data-icod-id="src_pages_about_tsx_wa_link">
                  <MessageCircle className="h-5 w-5 text-[#25D366]" data-icod-id="src_pages_about_tsx_wa_icon" />
                  <span data-icod-id="src_pages_about_tsx_4e1a">{content.whatsappNumber}</span>
                </a>
                <div className="flex items-center gap-4 text-muted-foreground" data-icod-id="src_pages_about_tsx_3052">
                  <a
                    href={content.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 hover:text-primary transition-colors"
                    data-icod-id="src_pages_about_tsx_fb43">
                    <Linkedin className="h-5 w-5 text-primary" data-icod-id="src_pages_about_tsx_3d52" />
                    <span data-icod-id="src_pages_about_tsx_0e9a">{content.linkedinUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                  </a>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground" data-icod-id="src_pages_about_tsx_fe42">
                  <a
                    href={content.instagramPersonalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 hover:text-primary transition-colors"
                    data-icod-id="src_pages_about_tsx_9810">
                    <Instagram className="h-5 w-5 text-primary" data-icod-id="src_pages_about_tsx_fd8f" />
                    <span data-icod-id="src_pages_about_tsx_becf">@mahreenyousafdigi (Personal)</span>
                  </a>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground" data-icod-id="src_pages_about_tsx_ig_brand">
                  <a
                    href={content.instagramBrandUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 hover:text-primary transition-colors"
                    data-icod-id="src_pages_about_tsx_ig_brand_link">
                    <Instagram className="h-5 w-5 text-primary" data-icod-id="src_pages_about_tsx_ig_brand_icon" />
                    <span data-icod-id="src_pages_about_tsx_ig_brand_label">@mgblessedbeginnings (Brand)</span>
                  </a>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground" data-icod-id="src_pages_about_tsx_3439">
                  <a
                    href={content.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 hover:text-primary transition-colors"
                    data-icod-id="src_pages_about_tsx_c09a">
                    <Globe className="h-5 w-5 text-primary" data-icod-id="src_pages_about_tsx_4b08" />
                    <span data-icod-id="src_pages_about_tsx_ce98">TikTok @hmsmart.ceo</span>
                  </a>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground" data-icod-id="src_pages_about_tsx_youtube_row">
                  <a
                    href={content.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 hover:text-primary transition-colors"
                    data-icod-id="src_pages_about_tsx_youtube_link">
                    <Youtube className="h-5 w-5 text-primary" data-icod-id="src_pages_about_tsx_youtube_icon" />
                    <span data-icod-id="src_pages_about_tsx_youtube_label">YouTube @blessedbeginnings8003</span>
                  </a>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground" data-icod-id="src_pages_about_tsx_figma_row">
                  <a
                    href={content.figmaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 hover:text-primary transition-colors"
                    data-icod-id="src_pages_about_tsx_figma_link">
                    <ExternalLink className="h-5 w-5 text-primary" data-icod-id="src_pages_about_tsx_figma_icon" />
                    <span data-icod-id="src_pages_about_tsx_figma_label">Figma Portfolio</span>
                  </a>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground" data-icod-id="src_pages_about_tsx_behance_row">
                  <a
                    href={content.behanceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 hover:text-primary transition-colors"
                    data-icod-id="src_pages_about_tsx_behance_link">
                    <ExternalLink className="h-5 w-5 text-primary" data-icod-id="src_pages_about_tsx_behance_icon" />
                    <span data-icod-id="src_pages_about_tsx_behance_label">Behance Portfolio</span>
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-20 bg-background" data-icod-id="src_pages_about_tsx_faq_section">
        <div className="max-w-3xl mx-auto px-4" data-icod-id="src_pages_about_tsx_faq_container">
          <h2
            className="text-2xl md:text-3xl font-bold text-foreground font-heading text-center mb-10"
            data-icod-id="src_pages_about_tsx_faq_title">
            Frequently Asked Questions
          </h2>
          <FAQAccordion items={ABOUT_FAQ_ITEMS} data-icod-id="src_pages_about_tsx_faq_accordion" />
        </div>
      </section>
    </>
  );
}
