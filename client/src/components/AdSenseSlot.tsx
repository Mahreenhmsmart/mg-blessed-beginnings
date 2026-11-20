import { useState, useEffect, useRef, useCallback } from 'react';
import { ExternalLink, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getAssetUrl } from '@/utils/assetUrl';
import { getActiveAds, trackImpression, trackClick, type Ad } from '@/services/adService';

const MAX_CAROUSEL_ADS = 5;

/**
 * Resolve an ad's imageUrl to a fully-qualified URL.
 * - Paths starting with `/uploads/` are resolved through getAssetUrl().
 * - Absolute URLs (http/https) pointing to actual images pass through.
 * - Empty strings or non-image URLs return empty string.
 */
function resolveAdImageUrl(imageUrl: string | undefined): string {
  if (!imageUrl) return '';
  // Upload paths → resolve via asset URL helper
  if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('uploads/')) {
    try {
      return getAssetUrl(imageUrl);
    } catch {
      return '';
    }
  }
  // Only allow http(s) URLs that look like actual images (not website URLs)
  if (/^https?:\/\//i.test(imageUrl)) {
    const hasImageExt = /\.(webp|png|jpg|jpeg|gif|svg|ico)(\?.*)?$/i.test(imageUrl);
    const isUploadPath = /\/uploads\//i.test(imageUrl);
    if (hasImageExt || isUploadPath) return imageUrl;
    return ''; // Website URL, not an image
  }
  return '';
}

/** Extract first 2 uppercase chars of advertiser name for fallback initials */
function getBrandInitials(name: string): string {
  return (name || 'AD').replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'AD';
}

interface AdSenseSlotProps {
  slotId?: string;
  format?: 'horizontal' | 'vertical' | 'rectangle' | 'auto' | 'banner' | 'sidebar';
  responsive?: boolean;
  className?: string;
}

export default function AdSenseSlot({
  format = 'auto',
  className = '',
}: AdSenseSlotProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackedRef = useRef<Set<string>>(new Set());

  // Normalize format aliases
  const resolvedFormat = format === 'banner' ? 'horizontal' : format === 'sidebar' ? 'vertical' : format;

  useEffect(() => {
    let cancelled = false;
    getActiveAds()
      .then((data) => {
        if (!cancelled) {
          setAds(data.slice(0, MAX_CAROUSEL_ADS));
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => { cancelled = true; };
  }, []);

  // Rotate through ads every 8 seconds with transition
  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
        setImgFailed(false);
        setIsTransitioning(false);
      }, 350); // Half of transition duration for smooth crossfade
    }, 8000);
    return () => clearInterval(interval);
  }, [ads.length]);

  // Track impression when ad becomes visible using IntersectionObserver
  useEffect(() => {
    if (!containerRef.current || ads.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const ad = ads[currentIndex];
            if (ad && !trackedRef.current.has(ad._id)) {
              trackedRef.current.add(ad._id);
              trackImpression(ad._id, window.location.pathname).catch(() => {});
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [ads, currentIndex]);

  // Handle click tracking
  const handleAdClick = useCallback((ad: Ad) => {
    if (ad._id) {
      trackClick(ad._id).catch(() => {});
    }
  }, []);

  const goToPrev = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
      setImgFailed(false);
      setIsTransitioning(false);
    }, 350);
  }, [ads.length]);

  const goToNext = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
      setImgFailed(false);
      setIsTransitioning(false);
    }, 350);
  }, [ads.length]);

  const goToSlide = useCallback((idx: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(idx);
      setImgFailed(false);
      setIsTransitioning(false);
    }, 350);
  }, []);

  // No ads loaded yet — show nothing to avoid flash
  if (!loaded) {
    return (
      <div
        ref={containerRef}
        className={cn('w-full', className)}
        data-icod-id="src_components_adsenseslot_tsx_a15e"
      />
    );
  }

  // No active ads — render nothing to avoid empty placeholder boxes
  if (ads.length === 0) {
    return null;
  }

  // Render active ad with gradient theming
  const ad = ads[currentIndex];
  const primaryColor = ad.brandColorPrimary || 'rgb(var(--primary))';
  const secondaryColor = ad.brandColorSecondary || 'rgb(var(--accent))';
  const isHorizontal = resolvedFormat === 'horizontal' || resolvedFormat === 'auto';
  const resolvedImage = resolveAdImageUrl(ad.imageUrl);
  const brandInitials = getBrandInitials(ad.advertiserName);

  // Build gradient style
  const gradientStyle = {
    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
  };

  // Reusable logo block for horizontal layout (~64x64px)
  const renderHorizontalLogo = (containerId: string, imgId: string) => (
    <div
      className="h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-xl bg-card flex items-center justify-center shadow-lg overflow-hidden"
      data-icod-id={containerId}>
      {resolvedImage && !imgFailed ? (
        <img
          src={resolvedImage}
          alt={ad.advertiserName}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImgFailed(true)}
          data-icod-id={imgId} />
      ) : (
        <div
          className="h-full w-full flex items-center justify-center text-primary-foreground font-bold text-xl md:text-2xl"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
          data-icod-id={`${imgId}_fallback`}>
          {brandInitials}
        </div>
      )}
    </div>
  );

  // Reusable logo block for vertical layout (~80x80px centered)
  const renderVerticalLogo = (containerId: string, imgId: string) => (
    <div
      className="h-20 w-20 mx-auto mb-4 rounded-xl bg-card flex items-center justify-center shadow-lg shrink-0 overflow-hidden"
      data-icod-id={containerId}>
      {resolvedImage && !imgFailed ? (
        <img
          src={resolvedImage}
          alt={ad.advertiserName}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImgFailed(true)}
          data-icod-id={imgId} />
      ) : (
        <div
          className="h-full w-full flex items-center justify-center text-primary-foreground font-bold text-2xl"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
          data-icod-id={`${imgId}_fallback`}>
          {brandInitials}
        </div>
      )}
    </div>
  );

  if (isHorizontal) {
    return (
      <div
        ref={containerRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Sponsored advertisements"
        className={cn('w-full', className)}
        data-icod-id="src_components_adsenseslot_tsx_93eb">
        <div
          role="group"
          aria-roledescription="slide"
          aria-label={`Advertisement ${currentIndex + 1} of ${ads.length}`}
          className={cn(
            'h-32 w-full rounded-2xl overflow-hidden relative group transition-all duration-700 ease-in-out hover:scale-[1.01] hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]',
            isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100',
          )}
          style={gradientStyle}
          data-icod-id="src_components_adsenseslot_tsx_61bd">
          {/* Inner glow overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at top left, rgb(var(--primary-foreground) / 0.15) 0%, transparent 50%)',
            }}
            aria-hidden="true"
            data-icod-id="src_components_adsenseslot_tsx_ac43" />

          {ad.targetUrl ? (
            <a
              href={ad.targetUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() => handleAdClick(ad)}
              className="h-full w-full flex items-center gap-5 px-5 md:px-6"
              data-icod-id="src_components_adsenseslot_tsx_link">
              {/* Logo/Image in white container */}
              {renderHorizontalLogo('src_components_adsenseslot_tsx_img_container', 'src_components_adsenseslot_tsx_6969')}

              {/* Text content */}
              <div
                className="flex-1 min-w-0"
                data-icod-id="src_components_adsenseslot_tsx_6f7d">
                <p
                  className="text-xl md:text-2xl font-bold text-primary-foreground drop-shadow-lg truncate"
                  data-icod-id="src_components_adsenseslot_tsx_fcd0">
                  {ad.title}
                </p>
                {ad.description && (
                  <p
                    className="text-sm md:text-base text-primary-foreground/90 line-clamp-2 mt-1 drop-shadow-sm"
                    data-icod-id="src_components_adsenseslot_tsx_31d2">
                    {ad.description}
                  </p>
                )}
              </div>

              {/* CTA Button */}
              <div
                className="shrink-0 hidden md:flex items-center gap-2 bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors px-5 py-2.5 rounded-full backdrop-blur-sm border border-primary-foreground/20"
                data-icod-id="src_components_adsenseslot_tsx_cta">
                <span
                  className="text-sm font-semibold text-primary-foreground"
                  data-icod-id="src_components_adsenseslot_tsx_450e">Visit Store</span>
                <ArrowRight
                  className="h-4 w-4 text-primary-foreground"
                  data-icod-id="src_components_adsenseslot_tsx_91fe" />
              </div>
            </a>
          ) : (
            <div
              className="h-full w-full flex items-center gap-5 px-5 md:px-6"
              data-icod-id="src_components_adsenseslot_tsx_static">
              {renderHorizontalLogo('src_components_adsenseslot_tsx_img_container_static', 'src_components_adsenseslot_tsx_c5a6')}
              <div
                className="flex-1 min-w-0"
                data-icod-id="src_components_adsenseslot_tsx_18ee">
                <p
                  className="text-xl md:text-2xl font-bold text-primary-foreground drop-shadow-lg truncate"
                  data-icod-id="src_components_adsenseslot_tsx_7b53">
                  {ad.title}
                </p>
                {ad.description && (
                  <p
                    className="text-sm md:text-base text-primary-foreground/90 line-clamp-2 mt-1 drop-shadow-sm"
                    data-icod-id="src_components_adsenseslot_tsx_6826">
                    {ad.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Sponsored label */}
          <div
            className="absolute top-3 right-3 flex items-center gap-1 bg-muted/20 backdrop-blur-sm px-2 py-1 rounded-md"
            data-icod-id="src_components_adsenseslot_tsx_sponsored">
            <span
              className="text-[10px] font-medium text-primary-foreground uppercase tracking-wider"
              data-icod-id="src_components_adsenseslot_tsx_a762">Sponsored</span>
            <ExternalLink
              className="h-3 w-3 text-primary-foreground"
              data-icod-id="src_components_adsenseslot_tsx_9c00" />
          </div>
        </div>
        {/* Carousel controls: Previous / Dots / Next */}
        {ads.length > 1 && (
          <div className="flex items-center justify-center gap-3 mt-3" role="group" aria-label="Carousel navigation" data-icod-id="src_components_adsenseslot_tsx_controls">
            <button
              onClick={goToPrev}
              className="h-7 w-7 rounded-full bg-muted/20 hover:bg-primary/20 flex items-center justify-center transition-colors text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Previous ad"
              data-icod-id="src_components_adsenseslot_tsx_prev_btn">
              <ChevronLeft className="h-4 w-4" data-icod-id="src_components_adsenseslot_tsx_55ed" />
            </button>
            <div className="flex gap-1.5" role="tablist" aria-label="Advertisement slides" data-icod-id="src_components_adsenseslot_tsx_dots">
              {ads.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  role="tab"
                  aria-selected={idx === currentIndex}
                  aria-label={`Go to ad ${idx + 1}`}
                  {...(idx === currentIndex ? { 'aria-current': 'true' } : {})}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    idx === currentIndex ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50',
                  )}
                  data-icod-id={`src_components_adsenseslot_tsx_dot_${idx}`}
                />
              ))}
            </div>
            <button
              onClick={goToNext}
              className="h-7 w-7 rounded-full bg-muted/20 hover:bg-primary/20 flex items-center justify-center transition-colors text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Next ad"
              data-icod-id="src_components_adsenseslot_tsx_next_btn">
              <ChevronRight className="h-4 w-4" data-icod-id="src_components_adsenseslot_tsx_6943" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Vertical / Rectangle format
  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Sponsored advertisements"
      className={cn('w-full', className)}
      data-icod-id="src_components_adsenseslot_tsx_84bf">
      <div
        role="group"
        aria-roledescription="slide"
        aria-label={`Advertisement ${currentIndex + 1} of ${ads.length}`}
        className={cn(
          'h-80 w-full rounded-2xl overflow-hidden relative group transition-all duration-700 ease-in-out hover:scale-[1.01] hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]',
          isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100',
        )}
        style={gradientStyle}
        data-icod-id="src_components_adsenseslot_tsx_72be">
        {/* Inner glow overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at top left, rgb(var(--primary-foreground) / 0.15) 0%, transparent 50%)',
          }}
          aria-hidden="true"
          data-icod-id="src_components_adsenseslot_tsx_dc09" />

        {ad.targetUrl ? (
          <a
            href={ad.targetUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => handleAdClick(ad)}
            className="h-full w-full flex flex-col p-5 md:p-6"
            data-icod-id="src_components_adsenseslot_tsx_vertical_link">
            {/* Logo/Image in white container */}
            {renderVerticalLogo('src_components_adsenseslot_tsx_vertical_img_container', 'src_components_adsenseslot_tsx_72c9')}

            <div
              className="flex-1 flex flex-col justify-center text-center"
              data-icod-id="src_components_adsenseslot_tsx_2d91">
              <p
                className="text-xl md:text-2xl font-bold text-primary-foreground drop-shadow-lg line-clamp-2"
                data-icod-id="src_components_adsenseslot_tsx_e9d1">
                {ad.title}
              </p>
              {ad.description && (
                <p
                  className="text-sm md:text-base text-primary-foreground/90 line-clamp-3 mt-2 drop-shadow-sm"
                  data-icod-id="src_components_adsenseslot_tsx_fbe0">
                  {ad.description}
                </p>
              )}
              <div
                className="mt-4 inline-flex items-center justify-center gap-2 bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors px-5 py-2.5 rounded-full backdrop-blur-sm border border-primary-foreground/20 mx-auto w-fit"
                data-icod-id="src_components_adsenseslot_tsx_vertical_cta">
                <span
                  className="text-sm font-semibold text-primary-foreground"
                  data-icod-id="src_components_adsenseslot_tsx_f882">Visit Store</span>
                <ArrowRight
                  className="h-4 w-4 text-primary-foreground"
                  data-icod-id="src_components_adsenseslot_tsx_fb16" />
              </div>
            </div>
          </a>
        ) : (
          <div
            className="h-full w-full flex flex-col p-5 md:p-6"
            data-icod-id="src_components_adsenseslot_tsx_vertical_static">
            {renderVerticalLogo('src_components_adsenseslot_tsx_vertical_img_container_static', 'src_components_adsenseslot_tsx_a7de')}
            <div
              className="flex-1 flex flex-col justify-center text-center"
              data-icod-id="src_components_adsenseslot_tsx_b81e">
              <p
                className="text-xl md:text-2xl font-bold text-primary-foreground drop-shadow-lg line-clamp-2"
                data-icod-id="src_components_adsenseslot_tsx_de03">
                {ad.title}
              </p>
              {ad.description && (
                <p
                  className="text-sm md:text-base text-primary-foreground/90 line-clamp-3 mt-2 drop-shadow-sm"
                  data-icod-id="src_components_adsenseslot_tsx_531d">
                  {ad.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Sponsored label */}
        <div
          className="absolute top-3 right-3 flex items-center gap-1 bg-muted/20 backdrop-blur-sm px-2 py-1 rounded-md"
          data-icod-id="src_components_adsenseslot_tsx_vertical_sponsored">
          <span
            className="text-[10px] font-medium text-primary-foreground uppercase tracking-wider"
            data-icod-id="src_components_adsenseslot_tsx_9773">Sponsored</span>
          <ExternalLink
            className="h-3 w-3 text-primary-foreground"
            data-icod-id="src_components_adsenseslot_tsx_aeb6" />
        </div>
      </div>
      {/* Carousel controls: Previous / Dots / Next */}
      {ads.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-3" role="group" aria-label="Carousel navigation" data-icod-id="src_components_adsenseslot_tsx_vertical_controls">
          <button
            onClick={goToPrev}
            className="h-7 w-7 rounded-full bg-muted/20 hover:bg-primary/20 flex items-center justify-center transition-colors text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Previous ad"
            data-icod-id="src_components_adsenseslot_tsx_vertical_prev_btn">
            <ChevronLeft className="h-4 w-4" data-icod-id="src_components_adsenseslot_tsx_2310" />
          </button>
          <div className="flex gap-1.5" role="tablist" aria-label="Advertisement slides" data-icod-id="src_components_adsenseslot_tsx_vertical_dots">
            {ads.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                role="tab"
                aria-selected={idx === currentIndex}
                aria-label={`Go to ad ${idx + 1}`}
                {...(idx === currentIndex ? { 'aria-current': 'true' } : {})}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  idx === currentIndex ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50',
                )}
                data-icod-id={`src_components_adsenseslot_tsx_vertical_dot_${idx}`}
              />
            ))}
          </div>
          <button
            onClick={goToNext}
            className="h-7 w-7 rounded-full bg-muted/20 hover:bg-primary/20 flex items-center justify-center transition-colors text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Next ad"
            data-icod-id="src_components_adsenseslot_tsx_vertical_next_btn">
            <ChevronRight className="h-4 w-4" data-icod-id="src_components_adsenseslot_tsx_fb6e" />
          </button>
        </div>
      )}
    </div>
  );
}
