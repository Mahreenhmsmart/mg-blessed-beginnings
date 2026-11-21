import React from 'react';

const MARQUEE_LINES = [
  '14 FREE AI TOOLS',
  'NO SIGN-UP',
  'NO CREDIT CARD',
  'UNLIMITED USE',
  'FREE FOREVER',
  'GROW YOUR ONLINE BUSINESS WITH AI',
  'SELL SMARTER WITH AI',
  '500+ HAPPY SELLERS',
];

export default function MarqueeBanner() {
  // The list is written TWICE so the scroll loops seamlessly with no gap.
  const items = [...MARQUEE_LINES, ...MARQUEE_LINES];
  return (
    <div
      className="mg-marquee"
      aria-label="MG Blessed Beginnings highlights"
      data-icod-id="src_components_homepage_marqueebanner_tsx_8bce">
      <div
        className="mg-marquee-track"
        data-icod-id="src_components_homepage_marqueebanner_tsx_1fad">
        {items.map((line, i) => (
          <span
            key={i}
            className="mg-marquee-item"
            data-icod-id={`src_components_homepage_marqueebanner_tsx_545a_${i}`}>
            {line}
            <span
              className="mg-marquee-star"
              data-icod-id={`src_components_homepage_marqueebanner_tsx_cc01_${i}`}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
