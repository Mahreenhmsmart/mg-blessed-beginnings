import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import SEOHead from '@/components/SEOHead';
import FAQAccordion from '@/components/FAQAccordion';
import { ChevronLeft, LifeBuoy, Sparkles, LogIn, Search, FileText, PlayCircle, ShoppingCart, Mail, Clock } from 'lucide-react';

const helpMeta = {
  title: 'Help & Troubleshooting — MG Blessed Beginnings',
  description:
    'Quick answers to common issues with AI tools, login, payments, and more. Find solutions in plain language.',
  keywords:
    'help, troubleshooting, faq, common issues, support, how to fix, ai tools not working, login problems',
  canonical: '/help',
};

interface IssueItem {
  icon: React.ElementType;
  question: string;
  reason: string;
  solution: string;
}

const issues: IssueItem[] = [
  {
    icon: Sparkles,
    question: 'AI Tools are not generating results',
    reason:
      "Sometimes our AI partners' servers get very busy, or there may be a brief hiccup on their end. It's like calling a friend who's on another call — they're there, just temporarily tied up.",
    solution:
      'Give it about 30 seconds and try again. If it still doesn\'t work after a couple of tries, come back in a few minutes. The issue usually clears up quickly on its own.',
  },
  {
    icon: LogIn,
    question: 'I can\'t log in to my account',
    reason:
      "This usually happens when the email or password doesn't match what we have on file, or your account hasn't been fully set up yet.",
    solution:
      'Double-check that you\'re typing your email and password correctly (watch out for extra spaces). If you\'ve forgotten your password, click "Forgot Password" on the login page to reset it.',
  },
  {
    icon: Search,
    question: 'The website scanner / audit tool won\'t load',
    reason:
      "The website you're trying to scan might be offline, the web address might have a typo, or that site could be blocking outside scanners.",
    solution:
      'Make sure the URL is spelled correctly and starts with https://. Try opening the URL in your browser first to confirm the site is live. If it works in your browser but not here, that site may block automated scans.',
  },
  {
    icon: FileText,
    question: 'Blog posts aren\'t showing up',
    reason:
      'Our blog content loads from the server, and sometimes there can be a brief delay or a temporary connection blip between your browser and our site.',
    solution:
      'Try refreshing the page (press F5 or the refresh button in your browser). If the posts still don\'t appear, check your internet connection and try again.',
  },
  {
    icon: PlayCircle,
    question: 'Videos won\'t play',
    reason:
      "Some videos are hosted on Google Drive, and your browser might be blocking them due to privacy settings or cookie restrictions.",
    solution:
      'Allow third-party cookies in your browser settings, or try opening the page in a different browser (Chrome, Firefox, Safari, or Edge). You can also try disabling any ad-blocker extensions temporarily.',
  },
  {
    icon: ShoppingCart,
    question: 'Shop or payment isn\'t working',
    reason:
      'Payment processing requires all form fields to be filled in correctly, and sometimes the payment gateway needs a moment to connect.',
    solution:
      'Check that every field on the checkout form is filled out completely and accurately (card number, expiry date, CVV, billing address). Then try submitting again. If it still fails, wait a minute and retry.',
  },
  {
    icon: Mail,
    question: 'Contact form won\'t submit',
    reason:
      'The form requires all marked fields to be completed before sending. Occasionally, a slow connection can cause a timeout.',
    solution:
      'Make sure every required field has something in it, then hit send again. If it times out, check your internet connection and give it another go.',
  },
  {
    icon: Clock,
    question: 'Pages are loading slowly',
    reason:
      'Our site includes rich visuals and interactive features, which means larger files need to download. Slow internet or an older device can also contribute.',
    solution:
      'Clear your browser cache (usually found in Settings > Privacy > Clear browsing data). Make sure your internet connection is stable. If you\'re on mobile, try switching between Wi-Fi and cellular data.',
  },
];

export default function Help() {
  const faqItems = issues.map((issue) => ({
    question: issue.question,
    answer: `${issue.reason}\n\nSolution: ${issue.solution}`,
  }));

  return (
    <>
      <SEOHead
        title={helpMeta.title}
        description={helpMeta.description}
        keywords={helpMeta.keywords}
        canonicalUrl={helpMeta.canonical}
        data-icod-id="src_pages_help_tsx_seo" />
      <div className="py-12 md:py-16" data-icod-id="src_pages_help_tsx_container">
        <div className="max-w-4xl mx-auto px-4 sm:px-6" data-icod-id="src_pages_help_tsx_inner">
          {/* Back link */}
          <nav className="mb-8" data-icod-id="src_pages_help_tsx_nav">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
              data-icod-id="src_pages_help_tsx_back_link">
              <ChevronLeft className="h-4 w-4 mr-1" data-icod-id="src_pages_help_tsx_chevron" />
              Back to Home
            </Link>
          </nav>

          {/* Page header */}
          <div className="flex items-center gap-3 mb-4" data-icod-id="src_pages_help_tsx_header">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"
              data-icod-id="src_pages_help_tsx_icon_wrap">
              <LifeBuoy className="h-6 w-6" data-icod-id="src_pages_help_tsx_icon" />
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold text-foreground font-heading"
              data-icod-id="src_pages_help_tsx_title">
              Common Issues &amp; Solutions
            </h1>
          </div>

          <p
            className="text-muted-foreground mb-10 max-w-2xl leading-relaxed"
            data-icod-id="src_pages_help_tsx_intro">
            Running into trouble? No worries — most things have a quick fix.
            Browse the list below to find your issue, tap it to see what's going on
            and how to sort it out. Everything here is written in plain language,
            no tech jargon.
          </p>

          {/* Quick-scan icon grid */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10"
            data-icod-id="src_pages_help_tsx_icon_grid">
            {issues.map((issue) => {
              const Icon = issue.icon;
              return (
                <Card
                  key={issue.question}
                  className="flex flex-col items-center gap-2 p-4 text-center"
                  data-icod-id={`src_pages_help_tsx_icon_card_${issue.question}`}>
                  <Icon
                    className="h-6 w-6 text-primary"
                    aria-hidden="true"
                    data-icod-id={`src_pages_help_tsx_icon_${issue.question}`} />
                  <span
                    className="text-xs font-medium text-foreground leading-tight"
                    data-icod-id={`src_pages_help_tsx_icon_label_${issue.question}`}>
                    {issue.question.split(' ')[0]}{issue.question.includes("'") ? '' : ''}…
                  </span>
                </Card>
              );
            })}
          </div>

          {/* Accordion section */}
          <Card className="p-2 sm:p-6" data-icod-id="src_pages_help_tsx_accordion_card">
            <h2
              className="text-xl font-semibold text-foreground mb-6 font-heading px-2"
              data-icod-id="src_pages_help_tsx_accordion_heading">
              Tap an issue below for details
            </h2>
            <FAQAccordion
              items={faqItems}
              className="w-full"
              data-icod-id="src_pages_help_tsx_faq" />
          </Card>

          {/* Still need help CTA */}
          <Card className="mt-10 p-6 text-center" data-icod-id="src_pages_help_tsx_cta_card">
            <h3
              className="text-lg font-semibold text-foreground mb-2 font-heading"
              data-icod-id="src_pages_help_tsx_cta_heading">
              Still stuck?
            </h3>
            <p
              className="text-muted-foreground mb-4 max-w-md mx-auto"
              data-icod-id="src_pages_help_tsx_cta_body">
              We're always happy to help. Reach out and we'll get back to you as soon as we can.
            </p>
            <div
              className="flex flex-wrap justify-center gap-3"
              data-icod-id="src_pages_help_tsx_cta_links">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-primary-foreground transition-all duration-300 ease-out shadow-[0_4px_15px_rgba(157,106,255,0.3)] hover:shadow-[0_6px_25px_rgba(157,106,255,0.5)] hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #9D6AFF 0%, #00D4F5 100%)' }}
                data-icod-id="src_pages_help_tsx_contact_btn">
                <Mail className="h-4 w-4" data-icod-id="src_pages_help_tsx_contact_icon" />
                Contact Us
              </Link>
              <a
                href="https://wa.me/923358380233"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border border-border text-foreground hover:bg-muted/50 transition-all duration-200"
                data-icod-id="src_pages_help_tsx_whatsapp_btn">
                Chat on WhatsApp
              </a>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
