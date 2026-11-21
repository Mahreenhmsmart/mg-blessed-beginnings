import { useNavigate } from 'react-router-dom';
import { useHomepageSettings } from '@/hooks/useHomepageSettings';

const OPTIONS = [
  { label: 'I want to start a Shopify store', to: '/courses' },
  { label: 'I want to sell on eBay', to: '/courses' },
  { label: 'I want to create digital products', to: '/shop' },
  { label: 'I have a product idea', to: '/tools/product-description-generator' },
];

export default function ContentHookSection() {
  const navigate = useNavigate();
  const { settings } = useHomepageSettings();
  return (
    <section
      className="content-hook"
      data-icod-id="src_components_homepage_contenthooksection_tsx_511f">
      <p
        className="content-hook-eyebrow"
        data-icod-id="src_components_homepage_contenthooksection_tsx_f24c">Content Hook of the Moment</p>
      <h2
        className="content-hook-title"
        data-icod-id="src_components_homepage_contenthooksection_tsx_6f21">{settings.contentHook.title || 'Optimize your listing in 60 seconds ⬇️'}</h2>
      <button
        type="button"
        className="content-hook-tool"
        onClick={() => navigate('/tools/listing-optimizer')}
        data-icod-id="src_components_homepage_contenthooksection_tsx_ed73">
        <span
          className="content-hook-tool-name"
          data-icod-id="src_components_homepage_contenthooksection_tsx_84c3">Listing Optimizer</span>
        <span
          className="content-hook-tool-watch"
          data-icod-id="src_components_homepage_contenthooksection_tsx_2b0e">▶ Watch how it works</span>
      </button>
      <h3
        className="content-hook-question"
        data-icod-id="src_components_homepage_contenthooksection_tsx_c973">What do you want to build?</h3>
      <div
        className="content-hook-options"
        data-icod-id="src_components_homepage_contenthooksection_tsx_edf4">
        {OPTIONS.map((o) => (
          <button
            key={o.label}
            type="button"
            className="content-hook-option"
            onClick={() => navigate(o.to)}
            data-icod-id={`src_components_homepage_contenthooksection_tsx_35a6_${o.label}`}>
            {o.label}
          </button>
        ))}
      </div>
      <p
        className="content-hook-assistant"
        data-icod-id="src_components_homepage_contenthooksection_tsx_619f">{settings.contentHook.description || 'MG AI Assistant can help you generate SEO titles, product descriptions, hashtags, and marketing content — try our free AI tools today.'}</p>
    </section>
  );
}
