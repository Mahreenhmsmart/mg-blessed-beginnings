import { useEffect, useRef } from 'react';

const TOOLS = [
  { name: 'AI Ad Campaigns', dot: 'mg-dot-purple' },
  { name: 'Review Replies', dot: 'mg-dot-cyan' },
  { name: 'Product Descriptions', dot: 'mg-dot-pink' },
  { name: 'SEO Titles', dot: 'mg-dot-gold' },
  { name: 'Keyword Research', dot: 'mg-dot-purple' },
  { name: 'Profit Calculator', dot: 'mg-dot-cyan' },
  { name: 'WhatsApp Messages', dot: 'mg-dot-pink' },
  { name: 'Hashtag Generator', dot: 'mg-dot-gold' },
  { name: 'Email Campaigns', dot: 'mg-dot-purple' },
  { name: 'Listing Optimizer', dot: 'mg-dot-cyan' },
  { name: 'Competitor Analysis', dot: 'mg-dot-pink' },
  { name: 'Branding Assistant', dot: 'mg-dot-gold' },
  { name: 'Prompt Library', dot: 'mg-dot-purple' },
  { name: 'SEO & Backlinks', dot: 'mg-dot-cyan' },
];

function renderItems() {
  return TOOLS.map((tool, i) => (
    <span
      key={i}
      className="mg-tools-item"
      data-icod-id={`src_components_homepage_toolsmarquee_tsx_3a47_${i}`}>
      {tool.name}{' '}
      <span
        className={`mg-tools-dot ${tool.dot}`}
        data-icod-id={`src_components_homepage_toolsmarquee_tsx_f5ae_${i}`} />
    </span>
  ));
}

export default function ToolsMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Duplicate the track content once after mount so the CSS translateX(-50%)
    // animation loops seamlessly without a visible gap or jump.
    const track = trackRef.current;
    if (!track || track.dataset.duplicated === 'true') return;
    const clone = track.innerHTML;
    track.innerHTML = clone + clone;
    track.dataset.duplicated = 'true';
  }, []);

  return (
    <div
      className="mg-tools-marquee"
      aria-label="Free AI tools"
      data-icod-id="src_components_homepage_toolsmarquee_tsx_7b15">
      <div
        className="mg-tools-track"
        ref={trackRef}
        data-icod-id="src_components_homepage_toolsmarquee_tsx_f9a9">
        {renderItems()}
      </div>
    </div>
  );
}
