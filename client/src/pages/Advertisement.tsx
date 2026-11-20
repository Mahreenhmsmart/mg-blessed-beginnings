import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { Button, Card, Field, Input, Alert, Spinner } from '@/components/ui';
import { cn } from '@/utils/cn';
import { Megaphone, ArrowRight, DollarSign, Calendar, Globe, Image as ImageIcon, ChevronDown, User as UserIcon, RefreshCw, BarChart3, Palette, Monitor, Eye, LayoutGrid } from 'lucide-react';
import { createAdCheckout, getMyAds } from '@/services/adService';
import { useAppSelector } from '@/store/hooks';
import AdPreviewPanel from '@/components/AdPreviewPanel';
import { PAGE_META } from '@/seo';

const advertisementMeta = PAGE_META['/advertisement'];

// Preset brand color palettes for quick selection
const COLOR_PRESETS = [
  { name: 'Purple', primary: '#6C3CE1', secondary: '#A855F7' },
  { name: 'Orange', primary: '#FF6B00', secondary: '#FF2D55' },
  { name: 'Blue', primary: '#0EA5E9', secondary: '#06B6D4' },
  { name: 'Green', primary: '#10B981', secondary: '#059669' },
  { name: 'Pink', primary: '#EC4899', secondary: '#F43F5E' },
  { name: 'Indigo', primary: '#4F46E5', secondary: '#6366F1' },
] as const;

// Currency configuration with exchange rates relative to USD base of $50
const CURRENCIES = [
  { code: 'USD', rate: 1, symbol: '$', label: 'US Dollar' },
  { code: 'PKR', rate: 278, symbol: 'Rs', label: 'Pakistani Rupee' },
  { code: 'GBP', rate: 0.79, symbol: '£', label: 'British Pound' },
  { code: 'EUR', rate: 0.92, symbol: '€', label: 'Euro' },
  { code: 'AED', rate: 3.67, symbol: 'د.إ', label: 'UAE Dirham' },
  { code: 'SAR', rate: 3.75, symbol: '﷼', label: 'Saudi Riyal' },
  { code: 'INR', rate: 83, symbol: '₹', label: 'Indian Rupee' },
  { code: 'CAD', rate: 1.36, symbol: 'C$', label: 'Canadian Dollar' },
  { code: 'AUD', rate: 1.53, symbol: 'A$', label: 'Australian Dollar' },
] as const;

type CurrencyCode = (typeof CURRENCIES)[number]['code'];

const BASE_PRICE_USD = 50;

function formatPrice(amount: number, currency: typeof CURRENCIES[number]): string {
  const convertedAmount = amount * currency.rate;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: convertedAmount < 100 ? 2 : 0,
    maximumFractionDigits: convertedAmount < 100 ? 2 : 0,
  }).format(convertedAmount);
}

export default function Advertisement() {
  const user = useAppSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({
    advertiserName: '',
    advertiserEmail: '',
    title: '',
    description: '',
    imageUrl: '',
    targetUrl: '',
    brandColorPrimary: '#6C3CE1',
    brandColorSecondary: '#A855F7',
  });
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoFillSource, setAutoFillSource] = useState<{
    profile: boolean;
    previousAd: boolean;
  }>({ profile: false, previousAd: false });

  const currentCurrency = CURRENCIES.find((c) => c.code === selectedCurrency) || CURRENCIES[0];
  const formattedPrice = formatPrice(BASE_PRICE_USD, currentCurrency);

  // Auto-fill form on mount from user profile and previous ads
  useEffect(() => {
    let mounted = true;

    async function autoFill() {
      const updates: Partial<typeof formData> = {};
      let hasProfileData = false;
      let hasPreviousAdData = false;

      if (user) {
        if (user.name) {
          updates.advertiserName = user.name;
          hasProfileData = true;
        }
        if (user.email) {
          updates.advertiserEmail = user.email;
          hasProfileData = true;
        }
      }

      try {
        const myAds = await getMyAds();
        if (mounted && myAds.length > 0) {
          const latestAd = myAds[0];
          if (latestAd.title) updates.title = latestAd.title;
          if (latestAd.description) updates.description = latestAd.description;
          if (latestAd.imageUrl) updates.imageUrl = latestAd.imageUrl;
          if (latestAd.targetUrl) updates.targetUrl = latestAd.targetUrl;
          if (latestAd.brandColorPrimary) updates.brandColorPrimary = latestAd.brandColorPrimary;
          if (latestAd.brandColorSecondary) updates.brandColorSecondary = latestAd.brandColorSecondary;
          if (!updates.advertiserName && latestAd.advertiserName) {
            updates.advertiserName = latestAd.advertiserName;
          }
          hasPreviousAdData = true;
        }
      } catch {
        // Silently fail - user can still fill in manually
      }

      if (mounted) {
        setFormData((prev) => ({ ...prev, ...updates }));
        setAutoFillSource({
          profile: hasProfileData,
          previousAd: hasPreviousAdData,
        });
      }
    }

    autoFill();

    return () => {
      mounted = false;
    };
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.advertiserName.trim() || !formData.advertiserEmail.trim() || !formData.title.trim()) {
      setError('Business name, email, and ad title are required.');
      return;
    }

    setLoading(true);
    try {
      const { url } = await createAdCheckout({
        ...formData,
        currency: selectedCurrency.toLowerCase(),
      });
      window.location.href = url;
    } catch (err: any) {
      setError(err?.message || 'Failed to create checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title={advertisementMeta.title}
        description={advertisementMeta.description}
        keywords={advertisementMeta.keywords}
        canonicalUrl={advertisementMeta.canonical}
        data-icod-id="src_pages_advertisement_tsx_seo" />
      <div className="max-w-[1200px] mx-auto px-4 py-16" data-icod-id="src_pages_advertisement_tsx_root">
        {/* ── Hero Header ── */}
        <div className="text-center mb-12" data-icod-id="src_pages_advertisement_tsx_hero">
          {/* Glowing purple squircle icon badge */}
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-[0_0_40px_rgba(108,60,225,0.4)]"
            style={{ background: 'linear-gradient(135deg, #6C3CE1 0%, #9333EA 100%)' }}
            data-icod-id="src_pages_advertisement_tsx_icon_badge">
            <Megaphone className="h-8 w-8 text-primary-foreground" data-icod-id="src_pages_advertisement_tsx_megaphone" />
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold text-foreground font-heading mb-4"
            data-icod-id="src_pages_advertisement_tsx_title">
            Advertise With Us
          </h1>
          <p
            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            data-icod-id="src_pages_advertisement_tsx_subtitle">
            Reach thousands of e-commerce entrepreneurs and digital business owners.
            Get your brand in front of an engaged audience with a premium ad placement.
          </p>
          {user && (
            <div className="mt-4" data-icod-id="src_pages_advertisement_tsx_dashboard_link">
              <Link
                to="/ad-dashboard"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                data-icod-id="src_pages_advertisement_tsx_dash_link">
                <BarChart3 className="h-4 w-4" data-icod-id="src_pages_advertisement_tsx_chart_icon" />
                View My Ad Dashboard
                <ArrowRight className="h-3 w-3" data-icod-id="src_pages_advertisement_tsx_arrow" />
              </Link>
            </div>
          )}
        </div>

        {/* ── Campaign Details Card ── */}
        <div className="max-w-5xl mx-auto mb-10" data-icod-id="src_pages_advertisement_tsx_campaign_wrap">
          <Card className="p-6 border-border/60" data-icod-id="src_pages_advertisement_tsx_campaign_card">
            {/* Header row */}
            <div className="flex items-center gap-3 mb-5" data-icod-id="src_pages_advertisement_tsx_campaign_header">
              <DollarSign className="h-5 w-5 text-primary" data-icod-id="src_pages_advertisement_tsx_dollar_icon" />
              <h3 className="font-semibold text-foreground font-heading text-lg" data-icod-id="src_pages_advertisement_tsx_campaign_title">
                Campaign Details
              </h3>
              <span
                className="ml-auto rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary border border-primary/20"
                data-icod-id="src_pages_advertisement_tsx_price_badge">
                ${formattedPrice} USD
              </span>
            </div>

            {/* Metric Cards Grid — 4 columns */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" data-icod-id="src_pages_advertisement_tsx_metrics_grid">
              {[
                { icon: Calendar, label: 'DURATION', value: '30 Days', desc: 'Active placement period' },
                { icon: RefreshCw, label: 'ROTATION', value: 'Every 8s', desc: 'Rotates with other ads' },
                { icon: LayoutGrid, label: 'FORMAT', value: 'Banner + Sidebar', desc: 'Dual placement types' },
                { icon: Eye, label: 'VISIBILITY', value: 'All Visitors', desc: 'Across all site pages' },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl bg-surface-elevated p-4 flex flex-col gap-1.5"
                  data-icod-id={`src_pages_advertisement_tsx_metric_${metric.label.toLowerCase()}`}>
                  <div className="flex items-center gap-2" data-icod-id={`src_pages_advertisement_tsx_metric_header_${metric.label.toLowerCase()}`}>
                    <metric.icon className="h-4 w-4 text-primary" data-icod-id={`src_pages_advertisement_tsx_metric_icon_${metric.label.toLowerCase()}`} />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground" data-icod-id={`src_pages_advertisement_tsx_metric_label_${metric.label.toLowerCase()}`}>
                      {metric.label}
                    </span>
                  </div>
                  <p className="text-base font-bold text-foreground" data-icod-id={`src_pages_advertisement_tsx_metric_value_${metric.label.toLowerCase()}`}>
                    {metric.value}
                  </p>
                  <p className="text-xs text-muted-foreground" data-icod-id={`src_pages_advertisement_tsx_metric_desc_${metric.label.toLowerCase()}`}>
                    {metric.desc}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Bottom Cards Grid — 3 columns ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto" data-icod-id="src_pages_advertisement_tsx_bottom_grid">
          
          {/* Column 1: One-Time Payment Card */}
          <Card className="p-6 flex flex-col border-border/60" data-icod-id="src_pages_advertisement_tsx_payment_card">
            <div className="flex items-center gap-3 mb-4" data-icod-id="src_pages_advertisement_tsx_payment_header">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10" data-icod-id="src_pages_advertisement_tsx_payment_icon_bg">
                <DollarSign className="h-5 w-5 text-primary" data-icod-id="src_pages_advertisement_tsx_payment_icon" />
              </div>
              <div data-icod-id="src_pages_advertisement_tsx_payment_info">
                <h3 className="font-semibold text-foreground font-heading" data-icod-id="src_pages_advertisement_tsx_payment_title">One-Time Payment</h3>
                <p className="text-2xl font-bold text-primary" data-icod-id="src_pages_advertisement_tsx_payment_amount">
                  ${formattedPrice} USD
                </p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground flex-1" data-icod-id="src_pages_advertisement_tsx_payment_features">
              {[
                '30-day active placement',
                'Displayed across site pages',
                'Clickable link to your website',
                'Image + headline + description',
                'Professional ad rendering',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2" data-icod-id={`src_pages_advertisement_tsx_feature_${item.replace(/\s+/g, '_')}`}>
                  <span
                    className="mt-1 h-1.5 w-1.5 rounded-full bg-success shrink-0"
                    aria-hidden="true"
                    data-icod-id={`src_pages_advertisement_tsx_914b_${item}`} />
                  {item}
                </li>
              ))}
            </ul>
            {/* Currency selector */}
            <div className="mt-5 pt-4 border-t border-border/40" data-icod-id="src_pages_advertisement_tsx_currency_section">
              <label htmlFor="currency" className="block text-xs font-medium text-muted-foreground mb-2" data-icod-id="src_pages_advertisement_tsx_currency_label">
                Select Currency
              </label>
              <div className="relative" data-icod-id="src_pages_advertisement_tsx_currency_select_wrap">
                <select
                  id="currency"
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
                  className={cn(
                    'w-full appearance-none rounded-lg border border-border bg-background px-4 py-2.5 pr-10 text-sm text-foreground',
                    'focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20',
                    'transition-all duration-200 cursor-pointer',
                  )}
                  data-icod-id="src_pages_advertisement_tsx_currency_select">
                  {CURRENCIES.map((curr) => (
                    <option
                      key={curr.code}
                      value={curr.code}
                      data-icod-id={`src_pages_advertisement_tsx_b5ca_${curr.code}`}>
                      {curr.symbol} {curr.code} — {curr.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                  data-icod-id="src_pages_advertisement_tsx_3b3e" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground" data-icod-id="src_pages_advertisement_tsx_currency_display">
                {currentCurrency.symbol} {selectedCurrency} — {currentCurrency.label}
              </p>
            </div>
          </Card>

          {/* Column 2: Create Your Ad Form */}
          <Card className="p-6 flex flex-col border-border/60" data-icod-id="src_pages_advertisement_tsx_form_card">
            <h2 className="text-xl font-bold text-foreground font-heading mb-5" data-icod-id="src_pages_advertisement_tsx_form_title">
              Create Your Ad
            </h2>

            {error && (
              <Alert variant="error" className="mb-5" data-icod-id="src_pages_advertisement_tsx_error">
                {error}
              </Alert>
            )}

            {autoFillSource.previousAd && !error && (
              <div className="mb-5 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground" data-icod-id="src_pages_advertisement_tsx_autofill">
                <RefreshCw
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  data-icod-id="src_pages_advertisement_tsx_0767" />
                <p data-icod-id="src_pages_advertisement_tsx_a564">Pre-filled with details from your last ad. Edit any field below.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 flex-1" data-icod-id="src_pages_advertisement_tsx_form">
              <Field label="Business / Advertiser Name" htmlFor="advertiserName" required data-icod-id="src_pages_advertisement_tsx_field_name">
                <div className="relative" data-icod-id="src_pages_advertisement_tsx_name_wrap">
                  <Input
                    id="advertiserName"
                    name="advertiserName"
                    placeholder="Your business or personal name"
                    value={formData.advertiserName}
                    onChange={handleChange}
                    required
                    data-icod-id="src_pages_advertisement_tsx_input_name" />
                  {autoFillSource.profile && formData.advertiserName && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success" data-icod-id="src_pages_advertisement_tsx_profile_badge">
                      <UserIcon className="h-3 w-3" data-icod-id="src_pages_advertisement_tsx_6fcf" />
                      Profile
                    </span>
                  )}
                </div>
              </Field>

              <Field label="Contact Email" htmlFor="advertiserEmail" required data-icod-id="src_pages_advertisement_tsx_field_email">
                <Input
                  id="advertiserEmail"
                  name="advertiserEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.advertiserEmail}
                  onChange={handleChange}
                  required
                  data-icod-id="src_pages_advertisement_tsx_input_email" />
              </Field>

              <Field label="Ad Headline" htmlFor="title" required data-icod-id="src_pages_advertisement_tsx_field_title">
                <Input
                  id="title"
                  name="title"
                  placeholder="Catchy headline for your ad"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength={80}
                  required
                  data-icod-id="src_pages_advertisement_tsx_input_title" />
              </Field>

              <Field label="Description" htmlFor="description" hint="Optional (max 200 characters)" data-icod-id="src_pages_advertisement_tsx_field_desc">
                <textarea
                  id="description"
                  name="description"
                  className={cn(
                    'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground',
                    'placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20',
                    'transition-all duration-200 resize-none',
                  )}
                  rows={3}
                  placeholder="Brief description of your product or service..."
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={200}
                  data-icod-id="src_pages_advertisement_tsx_input_desc" />
              </Field>

              <Field label="Image URL" htmlFor="imageUrl" hint="Direct link to your ad image (optional)" data-icod-id="src_pages_advertisement_tsx_field_image">
                <div className="relative" data-icod-id="src_pages_advertisement_tsx_image_wrap">
                  <ImageIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                    data-icod-id="src_pages_advertisement_tsx_0f6a" />
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    className="pl-10"
                    placeholder="https://example.com/ad-banner.jpg"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    data-icod-id="src_pages_advertisement_tsx_input_image" />
                </div>
              </Field>

              <Field label="Target URL" htmlFor="targetUrl" hint="Where users go when they click your ad (optional)" data-icod-id="src_pages_advertisement_tsx_field_url">
                <div className="relative" data-icod-id="src_pages_advertisement_tsx_url_wrap">
                  <Globe
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                    data-icod-id="src_pages_advertisement_tsx_94a8" />
                  <Input
                    id="targetUrl"
                    name="targetUrl"
                    type="url"
                    className="pl-10"
                    placeholder="https://yourwebsite.com"
                    value={formData.targetUrl}
                    onChange={handleChange}
                    data-icod-id="src_pages_advertisement_tsx_input_url" />
                </div>
              </Field>

              {/* Brand Color Picker */}
              <div className="pt-1" data-icod-id="src_pages_advertisement_tsx_colors">
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2" data-icod-id="src_pages_advertisement_tsx_color_label">
                  <Palette
                    className="h-4 w-4 text-primary"
                    data-icod-id="src_pages_advertisement_tsx_3848" />
                  Brand Colors
                </label>
                <div className="flex flex-wrap gap-2 mb-3" data-icod-id="src_pages_advertisement_tsx_color_presets">
                  {COLOR_PRESETS.map((preset) => {
                    const isSelected = formData.brandColorPrimary === preset.primary && formData.brandColorSecondary === preset.secondary;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setFormData((prev) => ({
                          ...prev,
                          brandColorPrimary: preset.primary,
                          brandColorSecondary: preset.secondary,
                        }))}
                        className={cn(
                          'h-7 w-7 rounded-full border-2 transition-all duration-200 hover:scale-110',
                          isSelected ? 'border-foreground scale-110 ring-2 ring-ring/30' : 'border-transparent',
                        )}
                        style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})` }}
                        title={preset.name}
                        aria-label={`Select ${preset.name} color scheme`}
                        data-icod-id={`src_pages_advertisement_tsx_preset_${preset.name}`}
                      />
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-3" data-icod-id="src_pages_advertisement_tsx_custom_colors">
                  <div data-icod-id="src_pages_advertisement_tsx_primary_color">
                    <label
                      htmlFor="brandColorPrimary"
                      className="block text-xs text-muted-foreground mb-1"
                      data-icod-id="src_pages_advertisement_tsx_44c4">Primary</label>
                    <div
                      className="flex items-center gap-2"
                      data-icod-id="src_pages_advertisement_tsx_6018">
                      <input
                        type="color"
                        id="brandColorPrimary"
                        value={formData.brandColorPrimary}
                        onChange={(e) => setFormData((prev) => ({ ...prev, brandColorPrimary: e.target.value }))}
                        className="h-8 w-8 cursor-pointer rounded border border-border bg-background p-0.5"
                        data-icod-id="src_pages_advertisement_tsx_primary_picker"
                      />
                      <span
                        className="text-xs font-mono text-muted-foreground uppercase"
                        data-icod-id="src_pages_advertisement_tsx_d536">{formData.brandColorPrimary}</span>
                    </div>
                  </div>
                  <div data-icod-id="src_pages_advertisement_tsx_secondary_color">
                    <label
                      htmlFor="brandColorSecondary"
                      className="block text-xs text-muted-foreground mb-1"
                      data-icod-id="src_pages_advertisement_tsx_1ccd">Secondary</label>
                    <div
                      className="flex items-center gap-2"
                      data-icod-id="src_pages_advertisement_tsx_f5d7">
                      <input
                        type="color"
                        id="brandColorSecondary"
                        value={formData.brandColorSecondary}
                        onChange={(e) => setFormData((prev) => ({ ...prev, brandColorSecondary: e.target.value }))}
                        className="h-8 w-8 cursor-pointer rounded border border-border bg-background p-0.5"
                        data-icod-id="src_pages_advertisement_tsx_secondary_picker"
                      />
                      <span
                        className="text-xs font-mono text-muted-foreground uppercase"
                        data-icod-id="src_pages_advertisement_tsx_d494">{formData.brandColorSecondary}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2 shadow-[0_2px_8px_rgba(108,60,225,0.3)] hover:shadow-[0_4px_16px_rgba(108,60,225,0.5)]"
                loading={loading}
                data-icod-id="src_pages_advertisement_tsx_submit">
                {!loading && (
                  <>
                    Purchase Ad Placement &mdash; ${formattedPrice} USD
                    <ArrowRight className="h-4 w-4 ml-2" data-icod-id="src_pages_advertisement_tsx_10ae" />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground" data-icod-id="src_pages_advertisement_tsx_payment_note">
                Payment processing is currently unavailable. Please contact support.
              </p>
            </form>
          </Card>

          {/* Column 3: Live Preview Card */}
          <div className="flex flex-col" data-icod-id="src_pages_advertisement_tsx_preview_column">
            <AdPreviewPanel
              data={formData}
              className="flex-1 border-border/60"
              data-icod-id="src_pages_advertisement_tsx_preview_panel"
            />
          </div>
        </div>
      </div>
    </>
  );
}
