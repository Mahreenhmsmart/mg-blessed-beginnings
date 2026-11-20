import { cn } from '@/utils/cn';

const MARQUEE_IMAGE = 'https://drive.google.com/thumbnail?id=17_eHHL7Lgz4XxCm2NlcyhqW4PLEFUTxr&sz=w1920';

interface MarqueeBannerProps {
  className?: string;
}

export default function MarqueeBanner({ className }: MarqueeBannerProps) {
  return (
    <div
      className={cn('relative w-full overflow-hidden bg-background', className)}
      aria-hidden="true"
      data-icod-id="src_components_homepage_marqueebanner_tsx_553a">
      <div
        className="flex w-max animate-marquee-scroll will-change-[transform]"
        data-icod-id="src_components_homepage_marqueebanner_tsx_8995">
        {/* First copy */}
        <img
          src={MARQUEE_IMAGE}
          alt=""
          className="h-[48px] sm:h-[60px] md:h-[72px] w-auto shrink-0 object-cover"
          loading="lazy"
          draggable={false}
          data-icod-id="src_components_homepage_marqueebanner_tsx_089a" />
        {/* Duplicate for seamless loop */}
        <img
          src={MARQUEE_IMAGE}
          alt=""
          className="h-[48px] sm:h-[60px] md:h-[72px] w-auto shrink-0 object-cover"
          loading="lazy"
          draggable={false}
          data-icod-id="src_components_homepage_marqueebanner_tsx_77fd" />
      </div>
    </div>
  );
}
