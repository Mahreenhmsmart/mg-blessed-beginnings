import { useState } from 'react';
import { cn } from '@/utils/cn';
import { useInView } from '@/hooks/useInView';
import { Play, Loader2 } from 'lucide-react';
import { getDriveThumbnail } from '@/utils/driveThumbnail';

interface PromoVideoProps {
  className?: string;
}

const VIDEO_SRC = 'https://drive.google.com/file/d/1X9qR8Kpk_GZLjV5U_FG2Y0uLM6b8JlPJ/preview';
const POSTER_URL = getDriveThumbnail(VIDEO_SRC);

export default function PromoVideo({ className }: PromoVideoProps) {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0, rootMargin: '200px', triggerOnce: true });
  const [iframeLoaded, setIframeLoaded] = useState(false);

  return (
    <section
      className={cn('py-16 md:py-24', className)}
      data-icod-id="src_components_homepage_promovideo_tsx_section"
    >
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        data-icod-id="src_components_homepage_promovideo_tsx_container"
      >
        <h2
          className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center font-heading"
          data-icod-id="src_components_homepage_promovideo_tsx_heading"
        >
          Welcome to MG Blessed Beginnings
        </h2>

        <div
          ref={ref}
          className="relative aspect-video mx-auto rounded-xl overflow-hidden border border-border/60 shadow-lg bg-background"
          data-icod-id="src_components_homepage_promovideo_tsx_video_wrapper"
        >
          {isInView ? (
            <>
              {/* Poster image — visible immediately while iframe loads underneath */}
              {!iframeLoaded && POSTER_URL && (
                <img
                  src={POSTER_URL}
                  alt="MG Blessed Beginnings video thumbnail"
                  className="absolute inset-0 w-full h-full object-cover"
                  data-icod-id="src_components_homepage_promovideo_tsx_poster" />
              )}
              <iframe
                src={VIDEO_SRC}
                title="MG Blessed Beginnings promo video"
                allow="autoplay; encrypted-media"
                allowFullScreen
                frameBorder="0"
                loading="lazy"
                onLoad={() => setIframeLoaded(true)}
                className={cn('absolute inset-0 w-full h-full transition-opacity duration-300', iframeLoaded ? 'opacity-100' : 'opacity-0')}
                data-icod-id="src_components_homepage_promovideo_tsx_iframe" />
              {!iframeLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40" data-icod-id="src_components_homepage_promovideo_tsx_loading">
                  <Loader2 className="h-8 w-8 text-white animate-spin" data-icod-id="src_components_homepage_promovideo_tsx_loading_icon" />
                  <span className="text-sm font-medium text-white drop-shadow-md px-4 text-center" data-icod-id="src_components_homepage_promovideo_tsx_loading_text">
                    Video load ho rahi hai, thoda wait karein
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" data-icod-id="src_components_homepage_promovideo_tsx_lazy_placeholder">
              {POSTER_URL && (
                <img
                  src={POSTER_URL}
                  alt="MG Blessed Beginnings video thumbnail"
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                  data-icod-id="src_components_homepage_promovideo_tsx_lazy_poster" />
              )}
              <div
                className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
                style={{ background: 'linear-gradient(135deg, #7662C7, #29ADA4)' }}
                data-icod-id="src_components_homepage_promovideo_tsx_lazy_play_bg">
                <Play className="h-7 w-7 text-white ml-0.5" fill="currentColor" data-icod-id="src_components_homepage_promovideo_tsx_lazy_play_icon" />
              </div>
              <span className="relative z-10 text-xs font-medium tracking-wide text-white drop-shadow-md" data-icod-id="src_components_homepage_promovideo_tsx_lazy_text">
                Scroll to load video
              </span>
            </div>
          )}
        </div>

        <p
          className="mt-4 text-center text-sm sm:text-base text-muted-foreground"
          data-icod-id="src_components_homepage_promovideo_tsx_caption"
        >
          15 free AI tools. Free forever. No sign-up.
        </p>
      </div>
    </section>
  );
}
