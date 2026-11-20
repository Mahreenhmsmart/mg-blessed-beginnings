import { useState, useEffect } from 'react';
import { FileText, Save, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, Card, Field, Input, Alert, inputClass } from '@/components/ui';
import { cn } from '@/utils/cn';
import {
  getPageContents,
  savePageContents,
  getDefaultContents,
  type PageContents,
} from '@/services/pageContentService';

// ─── Page section definitions ──────────────────────────────────────────────────

type PageKey = keyof PageContents;

interface PageSectionDef {
  key: PageKey;
  label: string;
  description: string;
}

const PAGE_SECTIONS: PageSectionDef[] = [
  { key: 'pricing', label: 'Pricing', description: 'Pricing page content (currently disabled — everything is free)' },
  { key: 'portfolio', label: 'Portfolio', description: 'Portfolio hero text, case studies, and CTA section' },
  { key: 'about', label: 'About / Founder', description: 'Founder bio, journey, beliefs, expertise, and contact links' },
  { key: 'websiteCloner', label: 'Clone a Website', description: 'Website Cloner tool page hero and description' },
  { key: 'thirtyDayPlan', label: '30-Day Growth Plan', description: '30-Day plan hero text and badge' },
  { key: 'contact', label: 'Contact', description: 'Contact page hero, info cards, and WhatsApp details' },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function PagesEditor() {
  const [contents, setContents] = useState<PageContents>(getPageContents());
  const [expandedPage, setExpandedPage] = useState<PageKey | null>('portfolio');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  // Clear save status after 3 seconds
  useEffect(() => {
    if (saveStatus !== 'idle') {
      const timer = setTimeout(() => setSaveStatus('idle'), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const handleSave = () => {
    try {
      savePageContents(contents);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };

  const handleReset = () => {
    if (confirm('Reset all page content to defaults? This cannot be undone.')) {
      const defaults = getDefaultContents();
      setContents(defaults);
      savePageContents(defaults);
      setSaveStatus('saved');
    }
  };

  const updateField = <K extends PageKey>(page: K, field: keyof PageContents[K], value: unknown) => {
    setContents((prev) => ({
      ...prev,
      [page]: { ...prev[page], [field]: value },
    }));
  };

  const togglePage = (key: PageKey) => {
    setExpandedPage((prev) => (prev === key ? null : key));
  };

  return (
    <div className="flex flex-col gap-4" data-icod-id="admin_pages_root">
      {/* Header */}
      <div className="flex items-center justify-between" data-icod-id="admin_pages_header">
        <div data-icod-id="admin_pages_header_text">
          <h3 className="font-heading text-lg font-semibold text-foreground" data-icod-id="admin_pages_title">
            Page Content Editor ({PAGE_SECTIONS.length} pages)
          </h3>
          <p className="text-sm text-muted-foreground" data-icod-id="admin_pages_subtitle">
            Edit the text content displayed on each public page. Changes are saved locally.
          </p>
        </div>
        <div className="flex items-center gap-2" data-icod-id="admin_pages_actions">
          <Button variant="outline" size="sm" onClick={handleReset} data-icod-id="admin_pages_reset">
            <RotateCcw
              className="mr-2 h-4 w-4"
              data-icod-id="src_components_admin_pageseditor_tsx_07d7" />
            Reset Defaults
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} data-icod-id="admin_pages_save">
            <Save
              className="mr-2 h-4 w-4"
              data-icod-id="src_components_admin_pageseditor_tsx_06ce" />
            Save All
          </Button>
        </div>
      </div>
      {/* Save Status */}
      {saveStatus === 'saved' && (
        <Alert variant="success" data-icod-id="admin_pages_saved_alert">
          Page content saved successfully. Changes will appear on the live pages immediately.
        </Alert>
      )}
      {saveStatus === 'error' && (
        <Alert variant="error" data-icod-id="admin_pages_error_alert">
          Failed to save page content. Please try again.
        </Alert>
      )}
      {/* Page Accordions */}
      <div className="flex flex-col gap-3" data-icod-id="admin_pages_accordions">
        {PAGE_SECTIONS.map((section) => {
          const isExpanded = expandedPage === section.key;
          return (
            <Card key={section.key} className="overflow-hidden" data-icod-id={`admin_pages_card_${section.key}`}>
              {/* Accordion Header */}
              <button
                onClick={() => togglePage(section.key)}
                className={cn(
                  'flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted/30',
                  isExpanded && 'border-b border-border/50',
                )}
                data-icod-id={`admin_pages_toggle_${section.key}`}>
                <div className="flex items-center gap-3" data-icod-id={`admin_pages_toggle_left_${section.key}`}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary" data-icod-id={`admin_pages_icon_wrap_${section.key}`}>
                    <FileText
                      className="h-4 w-4"
                      data-icod-id={`src_components_admin_pageseditor_tsx_0ade_${section.key}`} />
                  </div>
                  <div data-icod-id={`admin_pages_toggle_text_${section.key}`}>
                    <span
                      className="font-semibold text-foreground"
                      data-icod-id={`src_components_admin_pageseditor_tsx_7745_${section.key}`}>{section.label}</span>
                    <p
                      className="text-xs text-muted-foreground"
                      data-icod-id={`src_components_admin_pageseditor_tsx_ef3b_${section.key}`}>{section.description}</p>
                  </div>
                </div>
                {isExpanded
                  ? <ChevronUp className="h-4 w-4 text-muted-foreground" data-icod-id={`admin_pages_chevron_up_${section.key}`} />
                  : <ChevronDown className="h-4 w-4 text-muted-foreground" data-icod-id={`admin_pages_chevron_down_${section.key}`} />}
              </button>
              {/* Accordion Body */}
              {isExpanded && (
                <div className="px-5 py-5" data-icod-id={`admin_pages_body_${section.key}`}>
                  {renderPageFields(section.key, contents, updateField)}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Per-page field renderers ──────────────────────────────────────────────────

function renderPageFields(
  page: PageKey,
  contents: PageContents,
  updateField: <K extends PageKey>(page: K, field: keyof PageContents[K], value: unknown) => void,
) {
  switch (page) {
    case 'pricing':
      return renderPricingFields(contents.pricing, updateField);
    case 'portfolio':
      return renderPortfolioFields(contents.portfolio, updateField);
    case 'about':
      return renderAboutFields(contents.about, updateField);
    case 'websiteCloner':
      return renderWebsiteClonerFields(contents.websiteCloner, updateField);
    case 'thirtyDayPlan':
      return renderThirtyDayPlanFields(contents.thirtyDayPlan, updateField);
    case 'contact':
      return renderContactFields(contents.contact, updateField);
    default:
      return null;
  }
}

// ─── Pricing ────────────────────────────────────────────────────────────────────

function renderPricingFields(
  data: PageContents['pricing'],
  update: <K extends PageKey>(page: K, field: keyof PageContents[K], value: unknown) => void,
) {
  return (
    <div className="flex flex-col gap-4" data-icod-id="admin_pages_pricing_fields">
      <Field label="Page Title" htmlFor="pricing-title" data-icod-id="admin_pages_pricing_title_field">
        <Input id="pricing-title" value={data.pageTitle} onChange={(e) => update('pricing', 'pageTitle', e.target.value)} data-icod-id="admin_pages_pricing_title_input" />
      </Field>
      <Field label="Page Description" htmlFor="pricing-desc" data-icod-id="admin_pages_pricing_desc_field">
        <textarea
          id="pricing-desc"
          value={data.pageDescription}
          onChange={(e) => update('pricing', 'pageDescription', e.target.value)}
          rows={3}
          className={inputClass('resize-none')}
          data-icod-id="admin_pages_pricing_desc_input" />
      </Field>
    </div>
  );
}

// ─── Portfolio ──────────────────────────────────────────────────────────────────

function renderPortfolioFields(
  data: PageContents['portfolio'],
  update: <K extends PageKey>(page: K, field: keyof PageContents[K], value: unknown) => void,
) {
  return (
    <div className="flex flex-col gap-4" data-icod-id="admin_pages_portfolio_fields">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-icod-id="admin_pages_portfolio_grid">
        <Field label="Hero Title" htmlFor="portfolio-hero-title" data-icod-id="admin_pages_portfolio_hero_title_field">
          <Input id="portfolio-hero-title" value={data.heroTitle} onChange={(e) => update('portfolio', 'heroTitle', e.target.value)} data-icod-id="admin_pages_portfolio_hero_title_input" />
        </Field>
        <Field label="Cases Section Title" htmlFor="portfolio-cases-title" data-icod-id="admin_pages_portfolio_cases_title_field">
          <Input id="portfolio-cases-title" value={data.casesTitle} onChange={(e) => update('portfolio', 'casesTitle', e.target.value)} data-icod-id="admin_pages_portfolio_cases_title_input" />
        </Field>
      </div>
      <Field label="Hero Description" htmlFor="portfolio-hero-desc" data-icod-id="admin_pages_portfolio_hero_desc_field">
        <textarea
          id="portfolio-hero-desc"
          value={data.heroDescription}
          onChange={(e) => update('portfolio', 'heroDescription', e.target.value)}
          rows={3}
          className={inputClass('resize-none')}
          data-icod-id="admin_pages_portfolio_hero_desc_input" />
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-icod-id="admin_pages_portfolio_cta_grid">
        <Field label="CTA Title" htmlFor="portfolio-cta-title" data-icod-id="admin_pages_portfolio_cta_title_field">
          <Input id="portfolio-cta-title" value={data.ctaTitle} onChange={(e) => update('portfolio', 'ctaTitle', e.target.value)} data-icod-id="admin_pages_portfolio_cta_title_input" />
        </Field>
        <Field label="CTA Description" htmlFor="portfolio-cta-desc" data-icod-id="admin_pages_portfolio_cta_desc_field">
          <Input id="portfolio-cta-desc" value={data.ctaDescription} onChange={(e) => update('portfolio', 'ctaDescription', e.target.value)} data-icod-id="admin_pages_portfolio_cta_desc_input" />
        </Field>
      </div>

      {/* Case Studies */}
      <div className="mt-2" data-icod-id="admin_pages_portfolio_cases_section">
        <h4 className="text-sm font-semibold text-foreground mb-3" data-icod-id="admin_pages_portfolio_cases_label">Case Studies</h4>
        <div className="flex flex-col gap-4" data-icod-id="admin_pages_portfolio_cases_list">
          {data.caseStudies.map((cs, idx) => (
            <div key={cs.id} className="rounded-xl border border-border/50 bg-muted/20 p-4" data-icod-id={`admin_pages_portfolio_case_${cs.id}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3" data-icod-id={`admin_pages_portfolio_case_grid_${cs.id}`}>
                <Field label={`Title (${idx + 1})`} htmlFor={`cs-title-${cs.id}`} data-icod-id={`admin_pages_portfolio_case_title_field_${cs.id}`}>
                  <Input
                    id={`cs-title-${cs.id}`}
                    value={cs.title}
                    onChange={(e) => {
                      const updated = [...data.caseStudies];
                      updated[idx] = { ...updated[idx], title: e.target.value };
                      update('portfolio', 'caseStudies', updated);
                    }}
                    data-icod-id={`admin_pages_portfolio_case_title_input_${cs.id}`} />
                </Field>
                <Field label="Category" htmlFor={`cs-cat-${cs.id}`} data-icod-id={`admin_pages_portfolio_case_cat_field_${cs.id}`}>
                  <Input
                    id={`cs-cat-${cs.id}`}
                    value={cs.category}
                    onChange={(e) => {
                      const updated = [...data.caseStudies];
                      updated[idx] = { ...updated[idx], category: e.target.value };
                      update('portfolio', 'caseStudies', updated);
                    }}
                    data-icod-id={`admin_pages_portfolio_case_cat_input_${cs.id}`} />
                </Field>
              </div>
              <Field label="Description" htmlFor={`cs-desc-${cs.id}`} data-icod-id={`admin_pages_portfolio_case_desc_field_${cs.id}`}>
                <textarea
                  id={`cs-desc-${cs.id}`}
                  value={cs.description}
                  onChange={(e) => {
                    const updated = [...data.caseStudies];
                    updated[idx] = { ...updated[idx], description: e.target.value };
                    update('portfolio', 'caseStudies', updated);
                  }}
                  rows={2}
                  className={inputClass('resize-none')}
                  data-icod-id={`admin_pages_portfolio_case_desc_input_${cs.id}`} />
              </Field>
              <Field label="Metrics (one per line)" htmlFor={`cs-metrics-${cs.id}`} data-icod-id={`admin_pages_portfolio_case_metrics_field_${cs.id}`}>
                <textarea
                  id={`cs-metrics-${cs.id}`}
                  value={cs.metrics.join('\n')}
                  onChange={(e) => {
                    const updated = [...data.caseStudies];
                    updated[idx] = { ...updated[idx], metrics: e.target.value.split('\n').filter(Boolean) };
                    update('portfolio', 'caseStudies', updated);
                  }}
                  rows={3}
                  className={inputClass('resize-none')}
                  data-icod-id={`admin_pages_portfolio_case_metrics_input_${cs.id}`} />
              </Field>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── About / Founder ────────────────────────────────────────────────────────────

function renderAboutFields(
  data: PageContents['about'],
  update: <K extends PageKey>(page: K, field: keyof PageContents[K], value: unknown) => void,
) {
  return (
    <div className="flex flex-col gap-4" data-icod-id="admin_pages_about_fields">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-icod-id="admin_pages_about_grid1">
        <Field label="Founder Name" htmlFor="about-name" data-icod-id="admin_pages_about_name_field">
          <Input id="about-name" value={data.founderName} onChange={(e) => update('about', 'founderName', e.target.value)} data-icod-id="admin_pages_about_name_input" />
        </Field>
        <Field label="Website URL" htmlFor="about-website" data-icod-id="admin_pages_about_website_field">
          <Input id="about-website" value={data.websiteUrl} onChange={(e) => update('about', 'websiteUrl', e.target.value)} data-icod-id="admin_pages_about_website_input" />
        </Field>
      </div>
      <Field label="Title / Subtitle" htmlFor="about-title" data-icod-id="admin_pages_about_title_field">
        <Input id="about-title" value={data.founderTitle} onChange={(e) => update('about', 'founderTitle', e.target.value)} data-icod-id="admin_pages_about_title_input" />
      </Field>
      <Field label="Hero Description" htmlFor="about-hero-desc" data-icod-id="admin_pages_about_hero_desc_field">
        <textarea
          id="about-hero-desc"
          value={data.heroDescription}
          onChange={(e) => update('about', 'heroDescription', e.target.value)}
          rows={2}
          className={inputClass('resize-none')}
          data-icod-id="admin_pages_about_hero_desc_input" />
      </Field>

      {/* Journey Paragraphs */}
      <Field label="Journey Paragraphs (one per line)" htmlFor="about-journey" data-icod-id="admin_pages_about_journey_field">
        <textarea
          id="about-journey"
          value={data.journeyParagraphs.join('\n\n')}
          onChange={(e) => update('about', 'journeyParagraphs', e.target.value.split('\n\n').filter(Boolean))}
          rows={6}
          className={inputClass('resize-none')}
          data-icod-id="admin_pages_about_journey_input" />
      </Field>

      {/* Beliefs */}
      <div data-icod-id="admin_pages_about_beliefs_section">
        <h4 className="text-sm font-semibold text-foreground mb-3" data-icod-id="admin_pages_about_beliefs_label">Beliefs</h4>
        <div className="flex flex-col gap-3" data-icod-id="admin_pages_about_beliefs_list">
          {data.beliefs.map((belief, idx) => (
            <div key={idx} className="rounded-xl border border-border/50 bg-muted/20 p-3 grid grid-cols-1 md:grid-cols-2 gap-3" data-icod-id={`admin_pages_about_belief_${idx}`}>
              <Field label={`Title ${idx + 1}`} htmlFor={`belief-title-${idx}`} data-icod-id={`admin_pages_about_belief_title_field_${idx}`}>
                <Input
                  id={`belief-title-${idx}`}
                  value={belief.title}
                  onChange={(e) => {
                    const updated = [...data.beliefs];
                    updated[idx] = { ...updated[idx], title: e.target.value };
                    update('about', 'beliefs', updated);
                  }}
                  data-icod-id={`admin_pages_about_belief_title_input_${idx}`} />
              </Field>
              <Field label="Description" htmlFor={`belief-desc-${idx}`} data-icod-id={`admin_pages_about_belief_desc_field_${idx}`}>
                <Input
                  id={`belief-desc-${idx}`}
                  value={belief.description}
                  onChange={(e) => {
                    const updated = [...data.beliefs];
                    updated[idx] = { ...updated[idx], description: e.target.value };
                    update('about', 'beliefs', updated);
                  }}
                  data-icod-id={`admin_pages_about_belief_desc_input_${idx}`} />
              </Field>
            </div>
          ))}
        </div>
      </div>

      {/* Expertise Items */}
      <Field label="Expertise Items (one per line)" htmlFor="about-expertise" data-icod-id="admin_pages_about_expertise_field">
        <textarea
          id="about-expertise"
          value={data.expertiseItems.join('\n')}
          onChange={(e) => update('about', 'expertiseItems', e.target.value.split('\n').filter(Boolean))}
          rows={5}
          className={inputClass('resize-none')}
          data-icod-id="admin_pages_about_expertise_input" />
      </Field>

      {/* Contact Links */}
      <div data-icod-id="admin_pages_about_contact_section">
        <h4 className="text-sm font-semibold text-foreground mb-3" data-icod-id="admin_pages_about_contact_label">Contact Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-icod-id="admin_pages_about_contact_grid">
          <Field label="Email" htmlFor="about-email" data-icod-id="admin_pages_about_email_field">
            <Input id="about-email" value={data.email} onChange={(e) => update('about', 'email', e.target.value)} data-icod-id="admin_pages_about_email_input" />
          </Field>
          <Field label="Location" htmlFor="about-location" data-icod-id="admin_pages_about_location_field">
            <Input id="about-location" value={data.location} onChange={(e) => update('about', 'location', e.target.value)} data-icod-id="admin_pages_about_location_input" />
          </Field>
          <Field label="WhatsApp Number" htmlFor="about-wa-num" data-icod-id="admin_pages_about_wa_num_field">
            <Input id="about-wa-num" value={data.whatsappNumber} onChange={(e) => update('about', 'whatsappNumber', e.target.value)} data-icod-id="admin_pages_about_wa_num_input" />
          </Field>
          <Field label="WhatsApp URL" htmlFor="about-wa-url" data-icod-id="admin_pages_about_wa_url_field">
            <Input id="about-wa-url" value={data.whatsappUrl} onChange={(e) => update('about', 'whatsappUrl', e.target.value)} data-icod-id="admin_pages_about_wa_url_input" />
          </Field>
          <Field label="LinkedIn URL" htmlFor="about-linkedin" data-icod-id="admin_pages_about_linkedin_field">
            <Input id="about-linkedin" value={data.linkedinUrl} onChange={(e) => update('about', 'linkedinUrl', e.target.value)} data-icod-id="admin_pages_about_linkedin_input" />
          </Field>
          <Field label="Instagram (Personal) URL" htmlFor="about-ig-personal" data-icod-id="admin_pages_about_ig_personal_field">
            <Input id="about-ig-personal" value={data.instagramPersonalUrl} onChange={(e) => update('about', 'instagramPersonalUrl', e.target.value)} data-icod-id="admin_pages_about_ig_personal_input" />
          </Field>
          <Field label="Instagram (Brand) URL" htmlFor="about-ig-brand" data-icod-id="admin_pages_about_ig_brand_field">
            <Input id="about-ig-brand" value={data.instagramBrandUrl} onChange={(e) => update('about', 'instagramBrandUrl', e.target.value)} data-icod-id="admin_pages_about_ig_brand_input" />
          </Field>
          <Field label="TikTok URL" htmlFor="about-tiktok" data-icod-id="admin_pages_about_tiktok_field">
            <Input id="about-tiktok" value={data.tiktokUrl} onChange={(e) => update('about', 'tiktokUrl', e.target.value)} data-icod-id="admin_pages_about_tiktok_input" />
          </Field>
          <Field label="YouTube URL" htmlFor="about-youtube" data-icod-id="admin_pages_about_youtube_field">
            <Input id="about-youtube" value={data.youtubeUrl} onChange={(e) => update('about', 'youtubeUrl', e.target.value)} data-icod-id="admin_pages_about_youtube_input" />
          </Field>
          <Field label="Figma URL" htmlFor="about-figma" data-icod-id="admin_pages_about_figma_field">
            <Input id="about-figma" value={data.figmaUrl} onChange={(e) => update('about', 'figmaUrl', e.target.value)} data-icod-id="admin_pages_about_figma_input" />
          </Field>
          <Field label="Behance URL" htmlFor="about-behance" data-icod-id="admin_pages_about_behance_field">
            <Input id="about-behance" value={data.behanceUrl} onChange={(e) => update('about', 'behanceUrl', e.target.value)} data-icod-id="admin_pages_about_behance_input" />
          </Field>
        </div>
      </div>
    </div>
  );
}

// ─── Website Cloner ─────────────────────────────────────────────────────────────

function renderWebsiteClonerFields(
  data: PageContents['websiteCloner'],
  update: <K extends PageKey>(page: K, field: keyof PageContents[K], value: unknown) => void,
) {
  return (
    <div className="flex flex-col gap-4" data-icod-id="admin_pages_cloner_fields">
      <Field label="Hero Title" htmlFor="cloner-hero-title" data-icod-id="admin_pages_cloner_hero_title_field">
        <Input id="cloner-hero-title" value={data.heroTitle} onChange={(e) => update('websiteCloner', 'heroTitle', e.target.value)} data-icod-id="admin_pages_cloner_hero_title_input" />
      </Field>
      <Field label="Hero Description" htmlFor="cloner-hero-desc" data-icod-id="admin_pages_cloner_hero_desc_field">
        <textarea
          id="cloner-hero-desc"
          value={data.heroDescription}
          onChange={(e) => update('websiteCloner', 'heroDescription', e.target.value)}
          rows={2}
          className={inputClass('resize-none')}
          data-icod-id="admin_pages_cloner_hero_desc_input" />
      </Field>
      <Field label="Hero Sub-description" htmlFor="cloner-hero-sub" data-icod-id="admin_pages_cloner_hero_sub_field">
        <textarea
          id="cloner-hero-sub"
          value={data.heroSubDescription}
          onChange={(e) => update('websiteCloner', 'heroSubDescription', e.target.value)}
          rows={2}
          className={inputClass('resize-none')}
          data-icod-id="admin_pages_cloner_hero_sub_input" />
      </Field>
      <Field label="AEO Section Title" htmlFor="cloner-aeo-title" data-icod-id="admin_pages_cloner_aeo_title_field">
        <Input id="cloner-aeo-title" value={data.aeoTitle} onChange={(e) => update('websiteCloner', 'aeoTitle', e.target.value)} data-icod-id="admin_pages_cloner_aeo_title_input" />
      </Field>
      <Field label="AEO Section Description" htmlFor="cloner-aeo-desc" data-icod-id="admin_pages_cloner_aeo_desc_field">
        <textarea
          id="cloner-aeo-desc"
          value={data.aeoDescription}
          onChange={(e) => update('websiteCloner', 'aeoDescription', e.target.value)}
          rows={3}
          className={inputClass('resize-none')}
          data-icod-id="admin_pages_cloner_aeo_desc_input" />
      </Field>
    </div>
  );
}

// ─── 30-Day Growth Plan ─────────────────────────────────────────────────────────

function renderThirtyDayPlanFields(
  data: PageContents['thirtyDayPlan'],
  update: <K extends PageKey>(page: K, field: keyof PageContents[K], value: unknown) => void,
) {
  return (
    <div className="flex flex-col gap-4" data-icod-id="admin_pages_plan_fields">
      <Field label="Badge Text" htmlFor="plan-badge" data-icod-id="admin_pages_plan_badge_field">
        <Input id="plan-badge" value={data.heroBadgeText} onChange={(e) => update('thirtyDayPlan', 'heroBadgeText', e.target.value)} data-icod-id="admin_pages_plan_badge_input" />
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-icod-id="admin_pages_plan_title_grid">
        <Field label="Title Prefix" htmlFor="plan-title-prefix" data-icod-id="admin_pages_plan_prefix_field">
          <Input id="plan-title-prefix" value={data.heroTitlePrefix} onChange={(e) => update('thirtyDayPlan', 'heroTitlePrefix', e.target.value)} data-icod-id="admin_pages_plan_prefix_input" />
        </Field>
        <Field label="Title Highlight" htmlFor="plan-title-highlight" data-icod-id="admin_pages_plan_highlight_field">
          <Input id="plan-title-highlight" value={data.heroTitleHighlight} onChange={(e) => update('thirtyDayPlan', 'heroTitleHighlight', e.target.value)} data-icod-id="admin_pages_plan_highlight_input" />
        </Field>
      </div>
      <Field label="Hero Description" htmlFor="plan-desc" data-icod-id="admin_pages_plan_desc_field">
        <textarea
          id="plan-desc"
          value={data.heroDescription}
          onChange={(e) => update('thirtyDayPlan', 'heroDescription', e.target.value)}
          rows={2}
          className={inputClass('resize-none')}
          data-icod-id="admin_pages_plan_desc_input" />
      </Field>
    </div>
  );
}

// ─── Contact ────────────────────────────────────────────────────────────────────

function renderContactFields(
  data: PageContents['contact'],
  update: <K extends PageKey>(page: K, field: keyof PageContents[K], value: unknown) => void,
) {
  return (
    <div className="flex flex-col gap-4" data-icod-id="admin_pages_contact_fields">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-icod-id="admin_pages_contact_grid1">
        <Field label="Hero Title" htmlFor="contact-hero-title" data-icod-id="admin_pages_contact_hero_title_field">
          <Input id="contact-hero-title" value={data.heroTitle} onChange={(e) => update('contact', 'heroTitle', e.target.value)} data-icod-id="admin_pages_contact_hero_title_input" />
        </Field>
        <Field label="Email Address" htmlFor="contact-email" data-icod-id="admin_pages_contact_email_field">
          <Input id="contact-email" value={data.emailAddress} onChange={(e) => update('contact', 'emailAddress', e.target.value)} data-icod-id="admin_pages_contact_email_input" />
        </Field>
      </div>
      <Field label="Hero Description" htmlFor="contact-hero-desc" data-icod-id="admin_pages_contact_hero_desc_field">
        <textarea
          id="contact-hero-desc"
          value={data.heroDescription}
          onChange={(e) => update('contact', 'heroDescription', e.target.value)}
          rows={2}
          className={inputClass('resize-none')}
          data-icod-id="admin_pages_contact_hero_desc_input" />
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-icod-id="admin_pages_contact_grid2">
        <Field label="Email Label" htmlFor="contact-email-label" data-icod-id="admin_pages_contact_email_label_field">
          <Input id="contact-email-label" value={data.emailLabel} onChange={(e) => update('contact', 'emailLabel', e.target.value)} data-icod-id="admin_pages_contact_email_label_input" />
        </Field>
        <Field label="Location Label" htmlFor="contact-loc-label" data-icod-id="admin_pages_contact_loc_label_field">
          <Input id="contact-loc-label" value={data.locationLabel} onChange={(e) => update('contact', 'locationLabel', e.target.value)} data-icod-id="admin_pages_contact_loc_label_input" />
        </Field>
        <Field label="Location Value" htmlFor="contact-loc-value" data-icod-id="admin_pages_contact_loc_value_field">
          <Input id="contact-loc-value" value={data.locationValue} onChange={(e) => update('contact', 'locationValue', e.target.value)} data-icod-id="admin_pages_contact_loc_value_input" />
        </Field>
        <Field label="Response Time Label" htmlFor="contact-rt-label" data-icod-id="admin_pages_contact_rt_label_field">
          <Input id="contact-rt-label" value={data.responseTimeLabel} onChange={(e) => update('contact', 'responseTimeLabel', e.target.value)} data-icod-id="admin_pages_contact_rt_label_input" />
        </Field>
        <Field label="Response Time Value" htmlFor="contact-rt-value" data-icod-id="admin_pages_contact_rt_value_field">
          <Input id="contact-rt-value" value={data.responseTimeValue} onChange={(e) => update('contact', 'responseTimeValue', e.target.value)} data-icod-id="admin_pages_contact_rt_value_input" />
        </Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-icod-id="admin_pages_contact_grid3">
        <Field label="WhatsApp Number" htmlFor="contact-wa-num" data-icod-id="admin_pages_contact_wa_num_field">
          <Input id="contact-wa-num" value={data.whatsappNumber} onChange={(e) => update('contact', 'whatsappNumber', e.target.value)} data-icod-id="admin_pages_contact_wa_num_input" />
        </Field>
        <Field label="WhatsApp URL" htmlFor="contact-wa-url" data-icod-id="admin_pages_contact_wa_url_field">
          <Input id="contact-wa-url" value={data.whatsappUrl} onChange={(e) => update('contact', 'whatsappUrl', e.target.value)} data-icod-id="admin_pages_contact_wa_url_input" />
        </Field>
      </div>
      <Field label="WhatsApp Description" htmlFor="contact-wa-desc" data-icod-id="admin_pages_contact_wa_desc_field">
        <textarea
          id="contact-wa-desc"
          value={data.whatsappDescription}
          onChange={(e) => update('contact', 'whatsappDescription', e.target.value)}
          rows={2}
          className={inputClass('resize-none')}
          data-icod-id="admin_pages_contact_wa_desc_input" />
      </Field>
    </div>
  );
}
