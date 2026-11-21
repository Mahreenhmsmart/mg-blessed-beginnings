import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { submitContactForm, resetContact } from '@/store/slices/contactSlice';
import { Button, Input, Field, Card, Alert, inputClass } from '@/components/ui';
import SEOHead from '@/components/SEOHead';
import FAQAccordion from '@/components/FAQAccordion';
import AdSenseSlot from '@/components/AdSenseSlot';
import { Send, Mail, MapPin, Phone, Linkedin, Instagram, Globe, MessageCircle, Youtube, ExternalLink } from 'lucide-react';
import type { FAQItem } from '@/components/FAQAccordion';
import { SchemaInjector, PAGE_META } from '@/seo';
import { useSeo } from '@/components/Seo';

const contactMeta = PAGE_META['/contact'];

const CONTACT_FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How quickly will I receive a response?',
    answer: 'We typically respond to all inquiries within 24 hours during business days. For urgent matters, reach out via WhatsApp for faster communication.',
  },
  {
    question: 'What services can I inquire about?',
    answer: 'You can contact us about Shopify store setup, eBay listing optimization, Etsy shop management, AI tool questions, digital marketing, SEO audits, or any e-commerce consulting needs.',
  },
  {
    question: 'Do you offer free consultations?',
    answer: 'Yes, we offer a free initial consultation to discuss your business goals and recommend the best approach. Book through our consultation page or message us directly.',
  },
  {
    question: 'Can I reach you on WhatsApp?',
    answer: 'Yes, you can chat with us on WhatsApp at +92 335 8380233 for quick questions and real-time support during business hours.',
  },
];

const contactStructuredData = [
  {
    '@type': 'ContactPage',
    name: 'Contact MG Blessed Beginnings',
    description: 'Get in touch with Mahreen Yousaf for e-commerce consulting, AI tool inquiries, and business growth strategies.',
  },
  {
    '@type': 'FAQPage',
    mainEntity: CONTACT_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  },
];

export default function Contact() {
  useSeo(
    'Contact | MG Blessed Beginnings',
    'Contact MG Blessed Beginnings — we reply within 24 hours.',
  );
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.contact);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    subject: false,
    message: false,
  });

  const validateField = (field: string, value: string) => {
    if (!value.trim()) return `${field} is required`;
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }
    if (field === 'message' && value.length < 10) {
      return 'Message must be at least 10 characters';
    }
    return '';
  };

  const errors = {
    name: touched.name ? validateField('name', formData.name) : '',
    email: touched.email ? validateField('email', formData.email) : '',
    subject: touched.subject ? validateField('subject', formData.subject) : '',
    message: touched.message ? validateField('message', formData.message) : '',
  };

  const isValid = Object.values(errors).every((e) => !e) &&
    Object.values(formData).every((v) => v.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const result = await dispatch(submitContactForm(formData));
    if (result.meta.requestStatus === 'fulfilled') {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTouched({ name: false, email: false, subject: false, message: false });
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Reset success state after 5 seconds
  useEffect(() => {
    if (status === 'succeeded') {
      const timer = setTimeout(() => {
        dispatch(resetContact());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, dispatch]);

  return (
    <>
      <SEOHead
        title={contactMeta.title}
        description={contactMeta.description}
        keywords={contactMeta.keywords}
        canonicalUrl={contactMeta.canonical}
        structuredData={contactStructuredData}
        data-icod-id="src_pages_contact_tsx_a893" />
      <SchemaInjector
        schemaType="page"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Contact', url: '/contact' },
        ]}
        data-icod-id="src_pages_contact_tsx_569b" />
      {/* Hero */}
      <section
        className="bg-gradient-to-br from-primary/5 via-background to-accent/10 py-20"
        data-icod-id="src_pages_contact_tsx_8bb7">
        <div
          className="container mx-auto px-4 text-center"
          data-icod-id="src_pages_contact_tsx_cca5">
          <h1
            className="text-4xl md:text-5xl font-bold text-foreground mb-6"
            data-icod-id="src_pages_contact_tsx_83b9">Contact Us</h1>
          <p
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            data-icod-id="src_pages_contact_tsx_ec9c">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>
      {/* Ad Banner after Hero */}
      <div
        className="container mx-auto px-4 py-6"
        data-icod-id="src_pages_contact_tsx_1503">
        <AdSenseSlot format="banner" data-icod-id="src_pages_contact_tsx_5eff" />
      </div>
      <section className="py-20 bg-background" data-icod-id="src_pages_contact_tsx_6014">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_contact_tsx_d71b">
          <div
            className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8"
            data-icod-id="src_pages_contact_tsx_5d92">
            {/* Contact Info */}
            <div className="space-y-6" data-icod-id="src_pages_contact_tsx_2719">
              <Card className="p-6" data-icod-id="src_pages_contact_tsx_e379">
                <div
                  className="flex items-start gap-4"
                  data-icod-id="src_pages_contact_tsx_9364">
                  <div
                    className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"
                    data-icod-id="src_pages_contact_tsx_3f6d">
                    <Mail
                      className="h-5 w-5 text-primary"
                      data-icod-id="src_pages_contact_tsx_25ab" />
                  </div>
                  <div data-icod-id="src_pages_contact_tsx_d8d7">
                    <h2
                      className="font-semibold text-foreground mb-1"
                      data-icod-id="src_pages_contact_tsx_d0a5">Email</h2>
                    <a
                      href="mailto:hmsmart.official@gmail.com"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      data-icod-id="src_pages_contact_tsx_e485">hmsmart.official@gmail.com</a>
                  </div>
                </div>
              </Card>

              <Card className="p-6" data-icod-id="src_pages_contact_tsx_f0d1">
                <div
                  className="flex items-start gap-4"
                  data-icod-id="src_pages_contact_tsx_4820">
                  <div
                    className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"
                    data-icod-id="src_pages_contact_tsx_c1ea">
                    <MapPin
                      className="h-5 w-5 text-primary"
                      data-icod-id="src_pages_contact_tsx_ae83" />
                  </div>
                  <div data-icod-id="src_pages_contact_tsx_daab">
                    <h2
                      className="font-semibold text-foreground mb-1"
                      data-icod-id="src_pages_contact_tsx_e572">Location</h2>
                    <p
                      className="text-sm text-muted-foreground"
                      data-icod-id="src_pages_contact_tsx_b38f">Pakistan (Available Worldwide)</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6" data-icod-id="src_pages_contact_tsx_9ae4">
                <div
                  className="flex items-start gap-4"
                  data-icod-id="src_pages_contact_tsx_d3c2">
                  <div
                    className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"
                    data-icod-id="src_pages_contact_tsx_dd38">
                    <Phone
                      className="h-5 w-5 text-primary"
                      data-icod-id="src_pages_contact_tsx_35c8" />
                  </div>
                  <div data-icod-id="src_pages_contact_tsx_7db9">
                    <h2
                      className="font-semibold text-foreground mb-1"
                      data-icod-id="src_pages_contact_tsx_0514">Response Time</h2>
                    <p
                      className="text-sm text-muted-foreground"
                      data-icod-id="src_pages_contact_tsx_e3d9">Usually within 24 hours</p>
                  </div>
                </div>
              </Card>

              {/* WhatsApp CTA Card */}
              <a
                href="https://wa.me/923358380233"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                data-icod-id="src_pages_contact_tsx_wa_card_link">
                <Card className="p-6 border-[#25D366]/30 hover:border-[#25D366]/60 transition-colors cursor-pointer group" data-icod-id="src_pages_contact_tsx_wa_card">
                  <div
                    className="flex items-start gap-4"
                    data-icod-id="src_pages_contact_tsx_c07e">
                    <div
                      className="w-10 h-10 rounded-lg bg-[#25D366]/10 flex items-center justify-center shrink-0"
                      data-icod-id="src_pages_contact_tsx_e64e">
                      <MessageCircle
                        className="h-5 w-5 text-[#25D366]"
                        data-icod-id="src_pages_contact_tsx_60d7" />
                    </div>
                    <div data-icod-id="src_pages_contact_tsx_4cd1">
                      <h2
                        className="font-semibold text-foreground mb-1 group-hover:text-[#25D366] transition-colors"
                        data-icod-id="src_pages_contact_tsx_7a11">Chat on WhatsApp</h2>
                      <p
                        className="text-sm font-medium text-foreground mb-1"
                        data-icod-id="src_pages_contact_tsx_wa_number">+92 335 8380233</p>
                      <p
                        className="text-sm text-muted-foreground"
                        data-icod-id="src_pages_contact_tsx_5b6a">Prefer instant messaging? Reach out directly on WhatsApp for a quick conversation.</p>
                    </div>
                  </div>
                </Card>
              </a>

              <Card className="p-6" data-icod-id="src_pages_contact_tsx_fc0f">
                <h2
                  className="font-semibold text-foreground mb-4"
                  data-icod-id="src_pages_contact_tsx_2c48">Follow Us</h2>
                <div className="space-y-3" data-icod-id="src_pages_contact_tsx_1404">
                  <a
                    href="https://www.linkedin.com/in/mahreenyousafdigital/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                    data-icod-id="src_pages_contact_tsx_dad0">
                    <Linkedin
                      className="h-5 w-5 text-primary"
                      data-icod-id="src_pages_contact_tsx_ffd5" />
                    <span data-icod-id="src_pages_contact_tsx_ded8">LinkedIn</span>
                  </a>
                  <a
                    href="https://www.instagram.com/mahreenyousafdigi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                    data-icod-id="src_pages_contact_tsx_ig_personal">
                    <Instagram
                      className="h-5 w-5 text-primary"
                      data-icod-id="src_pages_contact_tsx_ig_personal_icon" />
                    <span data-icod-id="src_pages_contact_tsx_ig_personal_label">@mahreenyousafdigi on Instagram (Personal)</span>
                  </a>
                  <a
                    href="https://www.instagram.com/mgblessedbeginnings/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                    data-icod-id="src_pages_contact_tsx_184c">
                    <Instagram
                      className="h-5 w-5 text-primary"
                      data-icod-id="src_pages_contact_tsx_881b" />
                    <span data-icod-id="src_pages_contact_tsx_9b8e">@mgblessedbeginnings on Instagram (Brand)</span>
                  </a>
                  <a
                    href="https://www.tiktok.com/@hmsmart.ceo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                    data-icod-id="src_pages_contact_tsx_5de1">
                    <Globe
                      className="h-5 w-5 text-primary"
                      data-icod-id="src_pages_contact_tsx_eea3" />
                    <span data-icod-id="src_pages_contact_tsx_28d2">@hmsmart.ceo on TikTok</span>
                  </a>
                  <a
                    href="https://www.youtube.com/@blessedbeginnings8003"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                    data-icod-id="src_pages_contact_tsx_youtube">
                    <Youtube
                      className="h-5 w-5 text-primary"
                      data-icod-id="src_pages_contact_tsx_youtube_icon" />
                    <span data-icod-id="src_pages_contact_tsx_youtube_label">@blessedbeginnings8003 on YouTube</span>
                  </a>
                  <a
                    href="https://www.figma.com/make/Xg8GjmaWh0jQAsQg3Uoabo/mahreen-yousaf--Community-?p=f&fullscreen=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                    data-icod-id="src_pages_contact_tsx_figma">
                    <ExternalLink
                      className="h-5 w-5 text-primary"
                      data-icod-id="src_pages_contact_tsx_figma_icon" />
                    <span data-icod-id="src_pages_contact_tsx_figma_label">Figma Portfolio</span>
                  </a>
                  <a
                    href="https://www.behance.net/gallery/241251221/Portfolio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                    data-icod-id="src_pages_contact_tsx_behance">
                    <ExternalLink
                      className="h-5 w-5 text-primary"
                      data-icod-id="src_pages_contact_tsx_behance_icon" />
                    <span data-icod-id="src_pages_contact_tsx_behance_label">Behance Portfolio</span>
                  </a>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2" data-icod-id="src_pages_contact_tsx_9592">
              <Card className="p-8 shadow-[var(--shadow-md)]" data-icod-id="src_pages_contact_tsx_a352">
                {status === 'succeeded' ? (
                  <Alert variant="success" data-icod-id="src_pages_contact_tsx_01e0">
                    Message sent — we'll reply within 24 hours
                  </Alert>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-7"
                    data-icod-id="src_pages_contact_tsx_cb27">
                    <div
                      className="grid grid-cols-1 md:grid-cols-2 gap-7"
                      data-icod-id="src_pages_contact_tsx_9584">
                      <Field
                        label="Name"
                        htmlFor="name"
                        error={errors.name}
                        required
                        data-icod-id="src_pages_contact_tsx_ff1e">
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          onBlur={() => handleBlur('name')}
                          placeholder="Your name"
                          data-icod-id="src_pages_contact_tsx_8bb9" />
                      </Field>

                      <Field
                        label="Email"
                        htmlFor="email"
                        error={errors.email}
                        required
                        data-icod-id="src_pages_contact_tsx_fb2e">
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          onBlur={() => handleBlur('email')}
                          placeholder="your@email.com"
                          data-icod-id="src_pages_contact_tsx_b694" />
                      </Field>
                    </div>

                    <Field
                      label="Subject"
                      htmlFor="subject"
                      error={errors.subject}
                      required
                      data-icod-id="src_pages_contact_tsx_cd9c">
                      <Input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                        onBlur={() => handleBlur('subject')}
                        placeholder="How can we help?"
                        data-icod-id="src_pages_contact_tsx_86d7" />
                    </Field>

                    <Field
                      label="Message"
                      htmlFor="message"
                      error={errors.message}
                      required
                      data-icod-id="src_pages_contact_tsx_73fa">
                      <textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        onBlur={() => handleBlur('message')}
                        placeholder="Tell us about your project or question..."
                        rows={6}
                        className={inputClass('min-h-[140px] resize-none')}
                        data-icod-id="src_pages_contact_tsx_8c25" />
                    </Field>

                    {error && (
                      <Alert variant="error" data-icod-id="src_pages_contact_tsx_e677">{error}</Alert>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      loading={status === 'loading'}
                      disabled={!isValid || status === 'loading'}
                      className="w-full md:w-auto"
                      data-icod-id="src_pages_contact_tsx_576a">
                      <Send className="h-4 w-4 mr-2" data-icod-id="src_pages_contact_tsx_6849" />
                      Send Message
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-20" style={{ background: 'var(--section-lavender)' }} data-icod-id="src_pages_contact_tsx_faq_section">
        <div className="max-w-3xl mx-auto px-4" data-icod-id="src_pages_contact_tsx_faq_container">
          <h2
            className="text-2xl md:text-3xl font-bold text-foreground font-heading text-center mb-10"
            data-icod-id="src_pages_contact_tsx_faq_title">
            Frequently Asked Questions
          </h2>
          <FAQAccordion items={CONTACT_FAQ_ITEMS} data-icod-id="src_pages_contact_tsx_faq_accordion" />
        </div>
      </section>
    </>
  );
}
