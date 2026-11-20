import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Gift, Award, MessageCircle, Instagram, Sparkles, TrendingUp } from 'lucide-react';
import { Button, Card, Spinner, Alert } from '@/components/ui';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EmptyStatePanel from '@/components/dashboard/EmptyStatePanel';
import CopyButton from '@/components/ui/CopyButton';
import ShareButton from '@/components/ShareButton';
import SEOHead from '@/components/SEOHead';
import FAQAccordion from '@/components/FAQAccordion';
import Badge from '@/components/ui/Badge';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchReferralStats } from '@/store/slices/referralSlice';
import { cn } from '@/utils/cn';
import type { FAQItem } from '@/components/FAQAccordion';
import { SchemaInjector, PAGE_META } from '@/seo';

const referralMeta = PAGE_META['/referral'];

const REFERRAL_FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How does the referral program work?',
    answer: 'Share your unique referral link with friends. When they sign up using your link, you both earn +5 AI credits instantly. There is no limit to how many friends you can refer.',
  },
  {
    question: 'How many credits do I earn per referral?',
    answer: 'You earn +5 AI credits for each friend who signs up using your referral link. Your friend also receives +5 credits as a welcome bonus.',
  },
  {
    question: 'Do I need an account to use referrals?',
    answer: 'Yes, you need to create a free account to access your unique referral code, share your link, and track your earned credits.',
  },
  {
    question: 'Can I share my referral link on social media?',
    answer: 'Absolutely! You can share your referral link on WhatsApp, Instagram, LinkedIn, or any other platform. We provide easy copy and share buttons to make it simple.',
  },
  {
    question: 'Is there a limit to how many credits I can earn?',
    answer: 'No, there is no cap on referral credits. The more friends you invite, the more credits you earn. Each successful signup gives you +5 credits.',
  },
];

const referralStructuredData = [
  {
    '@type': 'WebPage',
    name: 'Referral Program — MG Blessed Beginnings',
    description: 'Earn rewards by referring friends and businesses to MG Blessed Beginnings AI tools and services.',
  },
  {
    '@type': 'FAQPage',
    mainEntity: REFERRAL_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  },
];

const REFERRAL_BASE_URL = 'https://mgblessed.icod.ai/?ref=';

function maskEmail(email: string): string {
  if (!email) return '***';
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const masked = local.length > 2 ? `${local.slice(0, 2)}***` : `${local[0]}***`;
  return `${masked}@${domain}`;
}

function getWhatsAppReferralMessage(referralLink: string): string {
  return `FREE AI TOOL 🎁

I'm using MG Blessed Beginnings — a free AI toolkit for content creators and online sellers. It generates product descriptions, SEO titles, hashtags and more!

Join with my referral link and we both get bonus credits 👇
${referralLink}`;
}

export default function Referral() {
  const dispatch = useAppDispatch();
  const { stats, status, error } = useAppSelector((s) => s.referral);
  const token = useAppSelector((s) => s.auth.token);

  useEffect(() => {
    if (token && status === 'idle') {
      dispatch(fetchReferralStats());
    }
  }, [token, status, dispatch]);

  const referralLink = stats ? `${REFERRAL_BASE_URL}${stats.code}` : '';
  const shareText = `Join me on MG Blessed Beginnings and get free AI credits! Use my referral link to sign up:`;
  const whatsappText = encodeURIComponent(getWhatsAppReferralMessage(referralLink));

  const isLoading = status === 'loading';
  const isLoggedIn = !!token;

  return (
    <>
      <SEOHead
        title={referralMeta.title}
        description={referralMeta.description}
        keywords={referralMeta.keywords}
        canonicalUrl={referralMeta.canonical}
        structuredData={referralStructuredData}
        data-icod-id="src_pages_referral_tsx_0c82" />
      <SchemaInjector
        schemaType="page"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Referral Program', url: '/referral' },
        ]}
        data-icod-id="src_pages_referral_tsx_eb0d" />
      <div className="w-full" data-icod-id="src_pages_referral_tsx_9b5e">
        {/* Hero Section */}
        <section
          className="relative overflow-hidden py-16 sm:py-24"
          style={{ background: 'linear-gradient(135deg, rgba(var(--primary), 0.15) 0%, rgba(var(--cyan), 0.08) 50%, rgba(var(--primary), 0.12) 100%)' }}
          data-icod-id="src_pages_referral_tsx_e7be">
          {/* Ambient glow orbs */}
          <div
            className="pointer-events-none absolute -top-32 -left-32 h-[400px] w-[400px] rounded-full opacity-[0.06] blur-3xl"
            style={{ background: 'radial-gradient(circle, rgb(var(--primary)) 0%, transparent 70%)' }}
            aria-hidden="true"
            data-icod-id="src_pages_referral_tsx_d7a6" />
          <div
            className="pointer-events-none absolute -bottom-32 -right-32 h-[350px] w-[350px] rounded-full opacity-[0.05] blur-3xl"
            style={{ background: 'radial-gradient(circle, rgb(var(--cyan)) 0%, transparent 70%)' }}
            aria-hidden="true"
            data-icod-id="src_pages_referral_tsx_a6bc" />

          <div
            className="relative max-w-[1200px] mx-auto px-4 text-center"
            data-icod-id="src_pages_referral_tsx_505c">
            <div
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-6"
              data-icod-id="src_pages_referral_tsx_3e8c">
              <Gift
                className="h-4 w-4 text-primary"
                data-icod-id="src_pages_referral_tsx_8151" />
              <span
                className="text-xs font-semibold uppercase tracking-widest text-primary"
                data-icod-id="src_pages_referral_tsx_fd1d">Referral Program</span>
            </div>
            <h1
              className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-4"
              data-icod-id="src_pages_referral_tsx_1104">
              Invite 3 Friends — Unlock{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--cyan)))' }}
                data-icod-id="src_pages_referral_tsx_576b">
                Premium AI Credits
              </span>
            </h1>
            <p
              className="max-w-xl mx-auto text-muted-foreground text-base sm:text-lg leading-relaxed"
              data-icod-id="src_pages_referral_tsx_3091">
              Share your unique referral link with friends. When they sign up, you both earn +5 AI credits instantly. The more you share, the more you earn.
            </p>
          </div>
        </section>

        {!isLoggedIn ? (
          /* Guest state — prompt login */
          (<div
            className="max-w-[1200px] mx-auto px-4 py-16 text-center"
            data-icod-id="src_pages_referral_tsx_57d9">
            <Card
              className="p-10 max-w-md mx-auto shadow-[var(--shadow-card)]"
              data-icod-id="src_pages_referral_tsx_5ced">
              <Sparkles
                className="h-10 w-10 text-primary mx-auto mb-4"
                data-icod-id="src_pages_referral_tsx_c0f8" />
              <h2
                className="font-heading text-xl font-bold text-foreground mb-3"
                data-icod-id="src_pages_referral_tsx_13e8">Sign in to Access Referrals</h2>
              <p
                className="text-sm text-muted-foreground mb-6"
                data-icod-id="src_pages_referral_tsx_c868">
                Create an account or sign in to view your referral code, share your link, and track your earned credits.
              </p>
              <Link to="/login" data-icod-id="src_pages_referral_tsx_8f75">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full shadow-[var(--shadow-glow-sm)] hover:shadow-[var(--shadow-glow)]"
                  data-icod-id="src_pages_referral_tsx_4f3c">
                  Sign In to Get Started
                </Button>
              </Link>
            </Card>
          </div>)
        ) : isLoading ? (
          /* Loading state */
          (<div
            className="flex min-h-[40vh] items-center justify-center"
            role="status"
            aria-label="Loading referral data"
            data-icod-id="src_pages_referral_tsx_3551">
            <Spinner size="lg" data-icod-id="src_pages_referral_tsx_8cff" />
          </div>)
        ) : error ? (
          /* Error state */
          (<div
            className="max-w-[1200px] mx-auto px-4 py-12"
            data-icod-id="src_pages_referral_tsx_4860">
            <Alert variant="error" data-icod-id="src_pages_referral_tsx_a589">{error}</Alert>
            <div className="mt-4 text-center" data-icod-id="src_pages_referral_tsx_9469">
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(fetchReferralStats())}
                data-icod-id="src_pages_referral_tsx_2bab">
                Retry
              </Button>
            </div>
          </div>)
        ) : stats ? (
          /* Authenticated dashboard */
          (<div
            className="max-w-[1200px] mx-auto px-4 py-10 space-y-8"
            data-icod-id="src_pages_referral_tsx_b6e3">
            {/* Stats Row */}
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              data-icod-id="src_pages_referral_tsx_aaef">
              <DashboardCard
                heading="Your Referrals"
                icon={<Users className="h-5 w-5" data-icod-id="src_pages_referral_tsx_7766" />}
                data-icod-id="src_pages_referral_tsx_ec4a">
                <div
                  className="flex items-end gap-2"
                  data-icod-id="src_pages_referral_tsx_2595">
                  <span
                    className="text-3xl font-bold text-foreground"
                    data-icod-id="src_pages_referral_tsx_c784">{stats.totalReferrals}</span>
                  <span
                    className="text-sm text-muted-foreground mb-1"
                    data-icod-id="src_pages_referral_tsx_120d">friends joined</span>
                </div>
              </DashboardCard>

              <DashboardCard
                heading="Credits Earned"
                icon={<Award className="h-5 w-5" data-icod-id="src_pages_referral_tsx_3777" />}
                data-icod-id="src_pages_referral_tsx_b4f7">
                <div
                  className="flex items-end gap-2"
                  data-icod-id="src_pages_referral_tsx_3c69">
                  <span
                    className="text-3xl font-bold text-foreground"
                    data-icod-id="src_pages_referral_tsx_fa6a">{stats.credits}</span>
                  <span
                    className="text-sm text-muted-foreground mb-1"
                    data-icod-id="src_pages_referral_tsx_e1a5">AI credits</span>
                </div>
              </DashboardCard>

              <DashboardCard
                heading="Your Referral Code"
                icon={<TrendingUp className="h-5 w-5" data-icod-id="src_pages_referral_tsx_0360" />}
                data-icod-id="src_pages_referral_tsx_5540">
                <div
                  className="flex items-center gap-3"
                  data-icod-id="src_pages_referral_tsx_1fb9">
                  <code
                    className="text-2xl font-mono font-bold tracking-wider text-primary"
                    data-icod-id="src_pages_referral_tsx_26d0">
                    {stats.code}
                  </code>
                  <CopyButton text={stats.code} label="Copy" data-icod-id="src_pages_referral_tsx_3026" />
                </div>
              </DashboardCard>
            </div>
            {/* Referral Link Box */}
            <DashboardCard
              heading="Your Referral Link"
              icon={<Gift className="h-5 w-5" data-icod-id="src_pages_referral_tsx_ee4f" />}
              data-icod-id="src_pages_referral_tsx_a86a">
              <div className="space-y-4" data-icod-id="src_pages_referral_tsx_1b4c">
                <div
                  className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
                  data-icod-id="src_pages_referral_tsx_7f99">
                  <div
                    className="flex-1 rounded-xl border border-border bg-muted/30 px-4 py-3 font-mono text-sm text-foreground break-all select-all"
                    data-icod-id="src_pages_referral_tsx_aefd">
                    {referralLink}
                  </div>
                  <div
                    className="flex gap-2 shrink-0"
                    data-icod-id="src_pages_referral_tsx_ad4e">
                    <CopyButton
                      text={referralLink}
                      label="Copy Link"
                      data-icod-id="src_pages_referral_tsx_24cb" />
                    <ShareButton
                      url={referralLink}
                      title="MG Blessed Beginnings Referral"
                      text={shareText}
                      hook={shareText}
                      data-icod-id="src_pages_referral_tsx_00d4" />
                  </div>
                </div>

                {/* Social share buttons */}
                <div
                  className="flex flex-col sm:flex-row gap-3 pt-2"
                  data-icod-id="src_pages_referral_tsx_9ca2">
                  <a
                    href={`https://wa.me/?text=${whatsappText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                    data-icod-id="src_pages_referral_tsx_c2b9">
                    <Button
                      className="w-full gap-2 bg-[#25D366] text-primary-foreground hover:bg-[#20BD5A] border-none shadow-[0_4px_16px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_24px_rgba(37,211,102,0.5)] py-3 text-base font-semibold"
                      size="lg"
                      data-icod-id="src_pages_referral_tsx_ac75">
                      <MessageCircle className="h-5 w-5" data-icod-id="src_pages_referral_tsx_c0b2" />
                      Share on WhatsApp
                    </Button>
                  </a>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(`${shareText}\n\n${referralLink}`);
                      } catch { /* ignore */ }
                    }}
                    className="flex-1"
                    data-icod-id="src_pages_referral_tsx_d2e9">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full gap-2 py-3"
                      data-icod-id="src_pages_referral_tsx_9133">
                      <Instagram className="h-5 w-5" data-icod-id="src_pages_referral_tsx_10d4" />
                      Copy for Instagram
                    </Button>
                  </button>
                </div>
              </div>
            </DashboardCard>
            {/* Referral History */}
            <DashboardCard
              heading="Referral History"
              icon={<Users className="h-5 w-5" data-icod-id="src_pages_referral_tsx_8fc2" />}
              data-icod-id="src_pages_referral_tsx_80a5">
              {stats.referrals.length === 0 ? (
                <EmptyStatePanel
                  icon={Users}
                  title="No referrals yet"
                  description="Share your referral link with friends and earn AI credits when they sign up. Every friend who joins gets you +5 credits!"
                  actionLabel="Copy Your Link"
                  onAction={async () => {
                    try {
                      await navigator.clipboard.writeText(referralLink);
                    } catch { /* ignore */ }
                  }}
                  data-icod-id="src_pages_referral_tsx_6446" />
              ) : (
                <div className="overflow-x-auto" data-icod-id="src_pages_referral_tsx_92f7">
                  <table
                    className="w-full text-left text-sm"
                    data-icod-id="src_pages_referral_tsx_7d3b">
                    <thead data-icod-id="src_pages_referral_tsx_4a67">
                      <tr
                        className="border-b border-border/40"
                        data-icod-id="src_pages_referral_tsx_4bd0">
                        <th
                          className="pb-3 pr-4 font-semibold text-muted-foreground"
                          data-icod-id="src_pages_referral_tsx_482b">Date</th>
                        <th
                          className="pb-3 pr-4 font-semibold text-muted-foreground"
                          data-icod-id="src_pages_referral_tsx_29a9">Referred User</th>
                        <th
                          className="pb-3 pr-4 font-semibold text-muted-foreground"
                          data-icod-id="src_pages_referral_tsx_0050">Status</th>
                        <th
                          className="pb-3 font-semibold text-muted-foreground text-right"
                          data-icod-id="src_pages_referral_tsx_c306">Credits</th>
                      </tr>
                    </thead>
                    <tbody
                      className="divide-y divide-border/20"
                      data-icod-id="src_pages_referral_tsx_5ded">
                      {stats.referrals.map((r) => (
                        <tr
                          key={r.id}
                          className="group"
                          data-icod-id={`src_pages_referral_tsx_cc12_${r.id}`}>
                          <td
                            className={cn('py-3 pr-4 text-muted-foreground whitespace-nowrap')}
                            data-icod-id={`src_pages_referral_tsx_beb8_${r.id}`}>
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                          <td
                            className="py-3 pr-4 text-foreground"
                            data-icod-id={`src_pages_referral_tsx_ed4c_${r.id}`}>
                            {maskEmail(r.referredEmail)}
                          </td>
                          <td
                            className="py-3 pr-4"
                            data-icod-id={`src_pages_referral_tsx_440c_${r.id}`}>
                            <Badge
                              variant={r.status === 'completed' ? 'ai' : 'default'}
                              data-icod-id={`src_pages_referral_tsx_033e_${r.id}`}>
                              {r.status}
                            </Badge>
                          </td>
                          <td
                            className="py-3 text-right font-medium text-primary"
                            data-icod-id={`src_pages_referral_tsx_9419_${r.id}`}>
                            +{r.creditsAwarded}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </DashboardCard>
          </div>)
        ) : null}
      </div>
      {/* FAQ Section */}
      <section className="py-20 bg-background" data-icod-id="src_pages_referral_tsx_faq_section">
        <div className="max-w-3xl mx-auto px-4" data-icod-id="src_pages_referral_tsx_faq_container">
          <h2
            className="text-2xl md:text-3xl font-bold text-foreground font-heading text-center mb-10"
            data-icod-id="src_pages_referral_tsx_faq_title">
            Frequently Asked Questions
          </h2>
          <FAQAccordion items={REFERRAL_FAQ_ITEMS} data-icod-id="src_pages_referral_tsx_faq_accordion" />
        </div>
      </section>
    </>
  );
}
