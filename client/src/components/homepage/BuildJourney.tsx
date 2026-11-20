import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import { ArrowRight, Clapperboard, Play, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInView } from '@/hooks/useInView';
import { buildSeriesEpisodes } from '@/data/buildSeries';
import { getDriveThumbnail } from '@/utils/driveThumbnail';

interface BuildJourneyProps {
  className?: string;
}

/** Lazy-loaded iframe that only mounts when scrolled into view. */
function LazyVideoIframe({ src, title }: { src: string; title: string }) {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0, rootMargin: '200px', triggerOnce: true });
  const [loaded, setLoaded] = useState(false);
  const posterUrl = getDriveThumbnail(src);

  return (
    <div
      ref={ref}
      className="relative aspect-video w-full bg-background"
      data-icod-id="build_journey_lazy_iframe_wrapper">
      {isInView ? (
        <>
          {/* Poster image — visible immediately while iframe loads underneath */}
          {!loaded && posterUrl && (
            <img
              src={posterUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              data-icod-id="build_journey_lazy_poster" />
          )}
          <iframe
            src={src}
            title={title}
            allow="autoplay; encrypted-media"
            allowFullScreen
            frameBorder="0"
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={cn('absolute inset-0 w-full h-full transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0')}
            data-icod-id="build_journey_lazy_iframe" />
          {!loaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40" data-icod-id="build_journey_lazy_loading">
              <Loader2 className="h-6 w-6 text-white animate-spin" data-icod-id="build_journey_lazy_loading_icon" />
              <span className="text-xs font-medium text-white drop-shadow-md px-3 text-center" data-icod-id="build_journey_lazy_loading_text">
                Video load ho rahi hai, thoda wait karein
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/50" data-icod-id="build_journey_lazy_placeholder">
          {posterUrl && (
            <img
              src={posterUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              data-icod-id="build_journey_lazy_poster_bg" />
          )}
          <div
            className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full shadow-md"
            style={{ background: 'linear-gradient(135deg, #7662C7, #29ADA4)' }}
            data-icod-id="build_journey_lazy_play_bg">
            <Play className="h-5 w-5 text-white ml-0.5" fill="currentColor" data-icod-id="build_journey_lazy_play_icon" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function BuildJourney({ className }: BuildJourneyProps) {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section
      className={cn('py-20 md:py-28 bg-background relative overflow-hidden', className)}
      data-icod-id="build_journey_section">
      {/* Background accent */}
      <div
        className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-[0.04] blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--primary-hover)) 0%, transparent 70%)' }}
        aria-hidden="true"
        data-icod-id="build_journey_bg_accent" />
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        data-icod-id="build_journey_container">
        {/* Section header */}
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          data-icod-id="build_journey_header">
          <div
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary mb-6 border border-primary/20"
            data-icod-id="build_journey_badge">
            <Clapperboard className="h-4 w-4" data-icod-id="build_journey_badge_icon" />
            I Built This Series
          </div>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-6 font-heading leading-tight"
            data-icod-id="build_journey_title">
            Watch the Journey of{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--primary-hover)) 50%, rgb(var(--accent)) 100%)' }}
              data-icod-id="build_journey_title_gradient">
              Building MG Blessed Beginnings
            </span>
          </h2>
          <p
            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            data-icod-id="build_journey_subtitle">
            A 7-episode content series documenting every step of building an AI toolkit for online sellers — from first prototype to launch day and beyond.
          </p>
        </div>

        {/* Episode cards grid */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-12 transition-all duration-1000 delay-200 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          data-icod-id="build_journey_grid">
          {buildSeriesEpisodes.map((episode) => (
            <Card
              key={episode.episode}
              hoverLift
              className="flex flex-col group relative overflow-hidden"
              data-icod-id={`build_journey_card_${episode.episode}`}>
              {/* Gradient top accent */}
              <div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-60 group-hover:opacity-100 transition-opacity z-10"
                data-icod-id={`build_journey_card_accent_${episode.episode}`} />
              {/* Video player */}
              {episode.videoUrl ? (
                <LazyVideoIframe
                  src={episode.videoUrl}
                  title={`${episode.title} — Episode ${episode.episode}`}
                  data-icod-id={`src_components_homepage_buildjourney_tsx_dff1_${episode.episode}`} />
              ) : (
                <div
                  className="relative aspect-video w-full flex items-center justify-center bg-muted"
                  data-icod-id={`build_journey_placeholder_${episode.episode}`}>
                  <span
                    className="text-sm text-muted-foreground"
                    data-icod-id={`src_components_homepage_buildjourney_tsx_2106_${episode.episode}`}>Video coming soon</span>
                </div>
              )}
              {/* Card content */}
              <div className="p-5 flex flex-col gap-3" data-icod-id={`build_journey_content_${episode.episode}`}>
                {/* Episode number badge */}
                <div className="flex items-center justify-between" data-icod-id={`build_journey_card_header_${episode.episode}`}>
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-xs shadow-md shadow-primary/20"
                    data-icod-id={`build_journey_ep_num_${episode.episode}`}>
                    {episode.episode}
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider" data-icod-id={`build_journey_ep_label_${episode.episode}`}>
                    Ep. {episode.episode}
                  </span>
                </div>
                {/* Title */}
                <h3
                  className="font-bold text-foreground text-sm leading-snug line-clamp-2 min-h-[2.5rem]"
                  data-icod-id={`build_journey_card_title_${episode.episode}`}>
                  {episode.title}
                </h3>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div
          className={`text-center transition-all duration-1000 delay-400 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          data-icod-id="build_journey_cta_wrap">
          <Link
            to="/episode-scripts"
            data-icod-id="build_journey_cta_link">
            <Button
              variant="primary"
              size="lg"
              className="gap-2 shadow-lg shadow-primary/25 min-w-[220px]"
              data-icod-id="build_journey_cta_btn">
              <Clapperboard className="h-4 w-4" data-icod-id="build_journey_cta_play_icon" />
              Explore Episode Scripts
              <ArrowRight className="h-4 w-4" data-icod-id="build_journey_cta_arrow" />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-4" data-icod-id="build_journey_cta_hint">
            Full scripts, captions, and hashtags included for every episode
          </p>
        </div>
      </div>
    </section>
  );
}
