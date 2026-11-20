import { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useInView } from '@/hooks/useInView';
import { getDriveThumbnail } from '@/utils/driveThumbnail';

interface VideoEmbedProps {
  videoId?: string;
  src?: string;
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Video embed component supporting both YouTube IDs and direct Google Drive iframe embeds.
 * When `src` is provided, renders a lazy-loaded Google Drive iframe that only mounts
 * when the user scrolls near it (intersection observer). This prevents loading dozens
 * of heavy iframes on initial page load.
 * When only `videoId` is provided (legacy), shows a "coming soon" placeholder.
 */
export default function VideoEmbed({ videoId, src, title, description, className }: VideoEmbedProps) {
  // Lazy-load: only mount the iframe when scrolled into view
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0, rootMargin: '200px', triggerOnce: true });
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Derive a poster thumbnail from the Google Drive preview URL
  const posterUrl = getDriveThumbnail(src);

  // Direct video streaming mode — uses Google Drive iframe embed
  if (src) {
    return (
      <div ref={ref} className={cn('w-full', className)} data-icod-id="src_components_videoembed_tsx_main">
        <div
          className="relative aspect-video rounded-xl overflow-hidden border border-border/60 shadow-lg bg-background"
          data-icod-id="src_components_videoembed_tsx_container">
          {isInView ? (
            <>
              {/* Poster image — visible immediately while iframe loads underneath */}
              {!iframeLoaded && posterUrl && (
                <img
                  src={posterUrl}
                  alt={title || 'Video thumbnail'}
                  className="absolute inset-0 w-full h-full object-cover"
                  data-icod-id="src_components_videoembed_tsx_poster" />
              )}
              <iframe
                src={src}
                title={title || 'Video'}
                allow="autoplay; encrypted-media"
                allowFullScreen
                frameBorder="0"
                loading="lazy"
                onLoad={() => setIframeLoaded(true)}
                className={cn('absolute inset-0 w-full h-full transition-opacity duration-300', iframeLoaded ? 'opacity-100' : 'opacity-0')}
                data-icod-id="src_components_videoembed_tsx_iframe" />
              {!iframeLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40" data-icod-id="src_components_videoembed_tsx_loading">
                  <Loader2 className="h-8 w-8 text-white animate-spin" data-icod-id="src_components_videoembed_tsx_loading_icon" />
                  <span className="text-sm font-medium text-white drop-shadow-md px-4 text-center" data-icod-id="src_components_videoembed_tsx_loading_text">
                    Video load ho rahi hai, thoda wait karein
                  </span>
                </div>
              )}
            </>
          ) : (
            /* Placeholder shown until element scrolls into view — now with poster */
            (<div className="absolute inset-0 flex flex-col items-center justify-center gap-3" data-icod-id="src_components_videoembed_tsx_lazy_placeholder">
              {posterUrl && (
                <img
                  src={posterUrl}
                  alt={title || 'Video thumbnail'}
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                  data-icod-id="src_components_videoembed_tsx_lazy_poster" />
              )}
              <div
                className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #7662C7, #29ADA4)' }}
                data-icod-id="src_components_videoembed_tsx_lazy_play_bg">
                <Play className="h-7 w-7 text-white ml-0.5" fill="currentColor" data-icod-id="src_components_videoembed_tsx_lazy_play_icon" />
              </div>
              <span className="relative z-10 text-xs font-medium tracking-wide text-white drop-shadow-md" data-icod-id="src_components_videoembed_tsx_lazy_text">
                Scroll to load video
              </span>
            </div>)
          )}
        </div>
        {(title || description) && (
          <div className="mt-4" data-icod-id="src_components_videoembed_tsx_meta">
            {title && (
              <h3
                className="text-lg font-semibold text-foreground mb-1"
                data-icod-id="src_components_videoembed_tsx_title">{title}</h3>
            )}
            {description && (
              <p
                className="text-sm text-muted-foreground"
                data-icod-id="src_components_videoembed_tsx_description">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Legacy placeholder mode (no src provided)
  return (
    <div className={cn('w-full', className)} data-icod-id="src_components_videoembed_tsx_main">
      <div
        className="relative aspect-video rounded-xl overflow-hidden border border-border/60 shadow-lg flex flex-col items-center justify-center gap-4"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
        data-icod-id="src_components_videoembed_tsx_container">
        {/* Branded play icon with gradient circle */}
        <div
          className="group relative flex items-center justify-center"
          data-icod-id="src_components_videoembed_tsx_play_icon_wrapper">
          {/* Gradient glow behind the icon */}
          <div
            className="absolute inset-0 rounded-full opacity-40 blur-md transition-opacity duration-300 group-hover:opacity-60"
            style={{ background: 'linear-gradient(135deg, #7662C7, #29ADA4)' }}
            data-icod-id="src_components_videoembed_tsx_2000" />
          {/* Icon circle */}
          <div
            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
            style={{ background: 'linear-gradient(135deg, #7662C7, #29ADA4)' }}
            data-icod-id="src_components_videoembed_tsx_ac8a">
            <Play
              className="h-8 w-8 sm:h-10 sm:w-10 text-white ml-1"
              fill="currentColor"
              data-icod-id="src_components_videoembed_tsx_play_icon" />
          </div>
        </div>

        <p
          className="text-sm sm:text-base font-medium tracking-wide"
          style={{ color: '#e2e8f0' }}
          data-icod-id="src_components_videoembed_tsx_coming_soon_text">
          Video tutorial coming soon
        </p>
      </div>
      {(title || description) && (
        <div className="mt-4" data-icod-id="src_components_videoembed_tsx_meta">
          {title && (
            <h3
              className="text-lg font-semibold text-foreground mb-1"
              data-icod-id="src_components_videoembed_tsx_title">{title}</h3>
          )}
          {description && (
            <p
              className="text-sm text-muted-foreground"
              data-icod-id="src_components_videoembed_tsx_description">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}
