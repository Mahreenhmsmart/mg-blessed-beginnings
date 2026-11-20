import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Alert, Spinner, Badge } from '@/components/ui';
import SEOHead from '@/components/SEOHead';
import { lumaService, type LumaGeneration } from '@/services/lumaService';
import { cn } from '@/utils/cn';
import { SchemaInjector, PAGE_META } from '@/seo';

const videoGeneratorMeta = PAGE_META['/video-generator'];
import { getEffectiveStatus } from '@/utils/toolStatusOverrides';
import {
  Video,
  Sparkles,
  Download,
  ChevronLeft,
  RefreshCw,
  Film,
  Image as ImageIcon,
  Play,
  AlertCircle,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────────

type GenerationState = 'idle' | 'submitting' | 'polling' | 'completed' | 'failed';

interface AspectRatioOption {
  value: '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9';
  label: string;
  description: string;
}

const ASPECT_RATIOS: AspectRatioOption[] = [
  { value: '16:9', label: '16:9', description: 'Landscape / YouTube' },
  { value: '9:16', label: '9:16', description: 'Portrait / Reels' },
  { value: '1:1', label: '1:1', description: 'Square / Social' },
  { value: '4:3', label: '4:3', description: 'Classic' },
  { value: '3:4', label: '3:4', description: 'Tall Portrait' },
  { value: '21:9', label: '21:9', description: 'Cinematic' },
];

/**
 * Extract a user-friendly error message from an API error.
 * Handles auth errors, network issues, and server errors gracefully.
 */
function getErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;

  // Check for enriched API error with status code
  const apiError = err as Error & { statusCode?: number; isApiError?: boolean };

  // Handle authentication errors — clear stale token and suggest login
  if (apiError.statusCode === 401 || err.message.toLowerCase().includes('not authenticated')) {
    localStorage.removeItem('token');
    return 'Your session has expired. Please refresh the page and try again.';
  }

  // Handle forbidden errors
  if (apiError.statusCode === 403) {
    return 'You do not have permission to perform this action.';
  }

  // Handle rate limiting
  if (apiError.statusCode === 429) {
    return 'Too many requests. Please wait a moment before trying again.';
  }

  // Handle server configuration errors
  if (apiError.statusCode === 503) {
    return 'The video generation service is temporarily unavailable. Please try again later.';
  }

  // Handle network errors
  if (err.message.includes('Cannot reach the server') || err.message.includes('Network Error')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  // Handle timeout errors
  if (err.message.includes('timed out')) {
    return 'The request took too long. Please try again.';
  }

  // Return the original error message if it's user-friendly, otherwise use fallback
  return err.message || fallback;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function VideoGenerator() {
  const navigate = useNavigate();

  // Form state
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption['value']>('16:9');
  const [imageUrl, setImageUrl] = useState('');
  const [loop, setLoop] = useState(false);

  // Generation state
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [generation, setGeneration] = useState<LumaGeneration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check if Luma is configured on mount
  useEffect(() => {
    lumaService.isConfigured().then(setIsConfigured).catch(() => setIsConfigured(false));
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const startPolling = useCallback((generationId: string) => {
    stopPolling();
    setGenerationState('polling');

    pollingRef.current = setInterval(async () => {
      try {
        const result = await lumaService.getStatus(generationId);
        setGeneration(result);

        if (result.state === 'completed') {
          stopPolling();
          setGenerationState('completed');
        } else if (result.state === 'failed') {
          stopPolling();
          setGenerationState('failed');
          setError(result.failure?.reason || 'Video generation failed. Please try again.');
        }
      } catch (err) {
        stopPolling();
        setGenerationState('failed');
        setError(getErrorMessage(err, 'Failed to check generation status.'));
      }
    }, 3000); // Poll every 3 seconds
  }, [stopPolling]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt describing the video you want to generate.');
      return;
    }

    setError(null);
    setGeneration(null);
    setGenerationState('submitting');

    try {
      const result = await lumaService.generateVideo({
        prompt: prompt.trim(),
        aspectRatio,
        loop,
        imageUrl: imageUrl.trim() || undefined,
      });

      setGeneration(result);

      if (result.state === 'completed') {
        setGenerationState('completed');
      } else if (result.state === 'failed') {
        setGenerationState('failed');
        setError(result.failure?.reason || 'Video generation failed.');
      } else {
        // Start polling for completion
        startPolling(result.id);
      }
    } catch (err) {
      setGenerationState('failed');
      setError(getErrorMessage(err, 'Failed to start video generation. Please try again.'));
    }
  };

  const handleReset = () => {
    stopPolling();
    setGenerationState('idle');
    setGeneration(null);
    setError(null);
  };

  const statusMessage = (): string => {
    if (generationState === 'submitting') return 'Submitting to Dream Machine...';
    if (generationState === 'polling') {
      const state = generation?.state;
      if (state === 'queued') return 'Queued — waiting in line...';
      if (state === 'dreaming') return 'Dreaming — AI is generating your video...';
      return 'Processing your video...';
    }
    return '';
  };

  return (
    <>
      <SEOHead
        title={videoGeneratorMeta.title}
        description={videoGeneratorMeta.description}
        keywords={videoGeneratorMeta.keywords}
        canonicalUrl={videoGeneratorMeta.canonical}
        data-icod-id="src_pages_videogenerator_tsx_seo"
      />
      <SchemaInjector
        schemaType="page"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Video Generator', url: '/video-generator' },
        ]}
        data-icod-id="src_pages_videogenerator_tsx_c1b4" />
      {/* Hero Section */}
      <section
        className="py-16 md:py-24"
        style={{ background: 'var(--section-lavender)' }}
        data-icod-id="src_pages_videogenerator_tsx_hero"
      >
        <div className="container mx-auto px-4" data-icod-id="src_pages_videogenerator_tsx_hero_container">
          <nav className="mb-8" data-icod-id="src_pages_videogenerator_tsx_breadcrumb">
            <Link
              to="/ai-tools"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
              data-icod-id="src_pages_videogenerator_tsx_backlink"
            >
              <ChevronLeft className="h-4 w-4 mr-1" data-icod-id="src_pages_videogenerator_tsx_backicon" />
              Back to AI Tools
            </Link>
          </nav>

          <div className="max-w-7xl mx-auto text-center" data-icod-id="src_pages_videogenerator_tsx_hero_content">
            <div className="flex items-center justify-center gap-2 mb-4" data-icod-id="src_pages_videogenerator_tsx_badges">
              <Badge variant="ai" data-icod-id="src_pages_videogenerator_tsx_badge">Media</Badge>
              {(() => {
                // Use shared override logic for consistent status display
                const effectiveStatus = getEffectiveStatus('ai-video-generator', 'live');
                if (effectiveStatus === 'coming_soon') {
                  return (
                    <span
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border bg-muted/50 text-muted-foreground border-border"
                      data-icod-id="src_pages_videogenerator_tsx_status"
                    >
                      Coming Soon
                    </span>
                  );
                }
                return (
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border bg-cyan/10 text-cyan border-cyan/20"
                    data-icod-id="src_pages_videogenerator_tsx_status"
                  >
                    Powered by Luma AI
                  </span>
                );
              })()}
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-heading"
              data-icod-id="src_pages_videogenerator_tsx_title"
            >
              AI Video Generator
            </h1>
            <p
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              data-icod-id="src_pages_videogenerator_tsx_desc"
            >
              Generate stunning videos from text descriptions using Luma AI Dream Machine.
              Create product demos, social media clips, and visual content with AI.
            </p>
          </div>
        </div>
      </section>
      {/* Main Generator Section */}
      <section className="py-12 bg-background" data-icod-id="src_pages_videogenerator_tsx_generator">
        <div className="container mx-auto px-4" data-icod-id="src_pages_videogenerator_tsx_gen_container">
          <div className="max-w-3xl mx-auto" data-icod-id="src_pages_videogenerator_tsx_gen_inner">
            {(() => {
              // Use shared override logic - if coming_soon, show placeholder instead of generator
              const effectiveStatus = getEffectiveStatus('ai-video-generator', 'live');
              if (effectiveStatus === 'coming_soon') {
                return (
                  <Card className="p-8 text-center" data-icod-id="src_pages_videogenerator_tsx_comingsoon">
                    <div
                      className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"
                      data-icod-id="src_pages_videogenerator_tsx_cs_icon_bg"
                    >
                      <Video
                        className="h-8 w-8 text-muted-foreground"
                        data-icod-id="src_pages_videogenerator_tsx_cs_icon"
                      />
                    </div>
                    <h2
                      className="text-xl font-semibold text-foreground mb-2"
                      data-icod-id="src_pages_videogenerator_tsx_cs_title"
                    >
                      Coming Soon
                    </h2>
                    <p
                      className="text-muted-foreground max-w-md mx-auto mb-6"
                      data-icod-id="src_pages_videogenerator_tsx_cs_desc"
                    >
                      Coming soon — video generation is not available yet. Check back later for updates.
                    </p>
                    <Button
                      variant="outline"
                      size="lg"
                      disabled
                      className="border-border text-muted-foreground cursor-not-allowed opacity-60"
                      data-icod-id="src_pages_videogenerator_tsx_cs_btn"
                    >
                      Generate (Coming Soon)
                    </Button>
                  </Card>
                );
              }
              return (
                <>
                  {/* Not configured warning */}
                  {isConfigured === false && (
                    <Alert variant="error" className="mb-6" data-icod-id="src_pages_videogenerator_tsx_notconfigured">
                      <AlertCircle className="h-5 w-5 mr-2" data-icod-id="src_pages_videogenerator_tsx_alerticon" />
                      Luma AI is not configured. An administrator needs to add the LUMA_API_KEY environment variable.
                    </Alert>
                  )}

                  <Card className="overflow-hidden" data-icod-id="src_pages_videogenerator_tsx_card">
              {/* Header */}
              <div
                className="bg-primary/5 p-6 border-b border-border/50"
                data-icod-id="src_pages_videogenerator_tsx_card_header"
              >
                <div className="flex items-center gap-3 mb-2" data-icod-id="src_pages_videogenerator_tsx_card_head_row">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
                    data-icod-id="src_pages_videogenerator_tsx_icon_wrap"
                  >
                    <Film className="h-5 w-5" data-icod-id="src_pages_videogenerator_tsx_film_icon" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground" data-icod-id="src_pages_videogenerator_tsx_card_title">
                    Generate Video
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground" data-icod-id="src_pages_videogenerator_tsx_card_subtitle">
                  Describe the video you want and let Dream Machine create it for you.
                </p>
              </div>

              {/* Form */}
              <div className="p-6 space-y-6" data-icod-id="src_pages_videogenerator_tsx_form">
                {/* Prompt Input */}
                <div data-icod-id="src_pages_videogenerator_tsx_prompt_field">
                  <label
                    htmlFor="video-prompt"
                    className="block text-sm font-medium text-foreground mb-1.5"
                    data-icod-id="src_pages_videogenerator_tsx_prompt_label"
                  >
                    Video Description <span
                    className="text-destructive"
                    data-icod-id="src_pages_videogenerator_tsx_d551">*</span>
                  </label>
                  <textarea
                    id="video-prompt"
                    rows={4}
                    placeholder="Describe the video you want to generate... e.g., A golden retriever running through a sunflower field at sunset, cinematic slow motion, warm lighting"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={generationState === 'submitting' || generationState === 'polling'}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    data-icod-id="src_pages_videogenerator_tsx_prompt_input"
                  />
                  <p className="mt-1 text-xs text-muted-foreground" data-icod-id="src_pages_videogenerator_tsx_prompt_hint">
                    Be descriptive! Include details about subject, action, setting, lighting, and camera movement.
                  </p>
                </div>

                {/* Aspect Ratio Selector */}
                <div data-icod-id="src_pages_videogenerator_tsx_ratio_field">
                  <label className="block text-sm font-medium text-foreground mb-2" data-icod-id="src_pages_videogenerator_tsx_ratio_label">
                    Aspect Ratio
                  </label>
                  <div
                    className="grid grid-cols-3 sm:grid-cols-6 gap-2"
                    data-icod-id="src_pages_videogenerator_tsx_ratio_grid"
                  >
                    {ASPECT_RATIOS.map((ar) => (
                      <button
                        key={ar.value}
                        type="button"
                        onClick={() => setAspectRatio(ar.value)}
                        disabled={generationState === 'submitting' || generationState === 'polling'}
                        className={cn(
                          'rounded-lg border px-2 py-2 text-center transition-all',
                          aspectRatio === ar.value
                            ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30'
                            : 'border-border bg-background text-foreground hover:border-primary/50',
                        )}
                        data-icod-id={`src_pages_videogenerator_tsx_ratio_${ar.value}`}
                      >
                        <span
                          className="block text-sm font-semibold"
                          data-icod-id={`src_pages_videogenerator_tsx_751f_${ar.value}`}>{ar.label}</span>
                        <span
                          className="block text-[10px] text-muted-foreground mt-0.5"
                          data-icod-id={`src_pages_videogenerator_tsx_c262_${ar.value}`}>{ar.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Reference Image URL */}
                <div data-icod-id="src_pages_videogenerator_tsx_image_field">
                  <label
                    htmlFor="image-url"
                    className="block text-sm font-medium text-foreground mb-1.5"
                    data-icod-id="src_pages_videogenerator_tsx_image_label"
                  >
                    <span
                      className="flex items-center gap-1.5"
                      data-icod-id="src_pages_videogenerator_tsx_4679">
                      <ImageIcon className="h-4 w-4" data-icod-id="src_pages_videogenerator_tsx_img_icon" />
                      Reference Image URL (optional)
                    </span>
                  </label>
                  <input
                    id="image-url"
                    type="url"
                    placeholder="https://example.com/reference-image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={generationState === 'submitting' || generationState === 'polling'}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    data-icod-id="src_pages_videogenerator_tsx_image_input"
                  />
                  <p className="mt-1 text-xs text-muted-foreground" data-icod-id="src_pages_videogenerator_tsx_image_hint">
                    Provide an image URL to use as a starting frame for image-to-video generation.
                  </p>
                </div>

                {/* Loop Toggle */}
                <div className="flex items-center gap-3" data-icod-id="src_pages_videogenerator_tsx_loop_field">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={loop}
                    onClick={() => setLoop(!loop)}
                    disabled={generationState === 'submitting' || generationState === 'polling'}
                    className={cn(
                      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/30',
                      loop ? 'bg-primary' : 'bg-muted',
                    )}
                    data-icod-id="src_pages_videogenerator_tsx_loop_toggle"
                  >
                    <span
                      className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-primary-foreground shadow ring-0 transition duration-200 ease-in-out',
                        loop ? 'translate-x-5' : 'translate-x-0',
                      )}
                      data-icod-id="src_pages_videogenerator_tsx_1850" />
                  </button>
                  <label className="text-sm font-medium text-foreground cursor-pointer" data-icod-id="src_pages_videogenerator_tsx_loop_label">
                    Loop video
                  </label>
                </div>

                {/* Error Message */}
                {error && (
                  <Alert variant="error" data-icod-id="src_pages_videogenerator_tsx_error">
                    {error}
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3" data-icod-id="src_pages_videogenerator_tsx_actions">
                  <Button
                    onClick={handleGenerate}
                    loading={generationState === 'submitting'}
                    disabled={
                      !prompt.trim() ||
                      isConfigured === false ||
                      generationState === 'submitting' ||
                      generationState === 'polling'
                    }
                    className="flex-1"
                    data-icod-id="src_pages_videogenerator_tsx_generate_btn"
                  >
                    <Sparkles className="mr-2 h-4 w-4" data-icod-id="src_pages_videogenerator_tsx_sparkle_icon" />
                    {generationState === 'submitting'
                      ? 'Submitting...'
                      : generationState === 'polling'
                        ? 'Generating...'
                        : 'Generate Video'}
                  </Button>
                  {(generationState !== 'idle') && (
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={generationState === 'submitting'}
                      data-icod-id="src_pages_videogenerator_tsx_reset_btn"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" data-icod-id="src_pages_videogenerator_tsx_reset_icon" />
                      Reset
                    </Button>
                  )}
                </div>

                {/* Loading / Status Display */}
                {(generationState === 'submitting' || generationState === 'polling') && (
                  <div
                    className="flex flex-col items-center justify-center py-10 text-center"
                    data-icod-id="src_pages_videogenerator_tsx_loading"
                  >
                    <Spinner size="lg" data-icod-id="src_pages_videogenerator_tsx_spinner" />
                    <p className="mt-4 text-sm font-medium text-foreground" data-icod-id="src_pages_videogenerator_tsx_status_text">
                      {statusMessage()}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground" data-icod-id="src_pages_videogenerator_tsx_status_hint">
                      Video generation typically takes 30-120 seconds.
                    </p>
                  </div>
                )}

                {/* Completed Result */}
                {generationState === 'completed' && generation?.video && (
                  <div
                    className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4"
                    data-icod-id="src_pages_videogenerator_tsx_result"
                  >
                    <div className="flex items-center justify-between" data-icod-id="src_pages_videogenerator_tsx_result_header">
                      <h4 className="font-semibold text-foreground flex items-center gap-2" data-icod-id="src_pages_videogenerator_tsx_result_title">
                        <Video className="h-5 w-5 text-primary" data-icod-id="src_pages_videogenerator_tsx_video_icon" />
                        Generated Video
                      </h4>
                      <a
                        href={generation.video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                        data-icod-id="src_pages_videogenerator_tsx_download_link"
                      >
                        <Download className="h-4 w-4" data-icod-id="src_pages_videogenerator_tsx_dl_icon" />
                        Download
                      </a>
                    </div>

                    {/* Video Player */}
                    <div
                      className="relative overflow-hidden rounded-lg bg-background aspect-video"
                      data-icod-id="src_pages_videogenerator_tsx_player_wrap"
                    >
                      <video
                        src={generation.video.url}
                        controls
                        autoPlay
                        loop={loop}
                        className="w-full h-full object-contain"
                        data-icod-id="src_pages_videogenerator_tsx_video_player"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground" data-icod-id="src_pages_videogenerator_tsx_meta">
                      {generation.video.width && generation.video.height && (
                        <span data-icod-id="src_pages_videogenerator_tsx_dimensions">
                          {generation.video.width} x {generation.video.height}
                        </span>
                      )}
                      <span data-icod-id="src_pages_videogenerator_tsx_prompt_echo">
                        Prompt: &quot;{generation.prompt.length > 80 ? generation.prompt.slice(0, 80) + '...' : generation.prompt}&quot;
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
                </>
              );
            })()}
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section className="py-16 md:py-20 bg-background" data-icod-id="src_pages_videogenerator_tsx_howitworks">
        <div className="container mx-auto px-4" data-icod-id="src_pages_videogenerator_tsx_hiw_container">
          <div className="max-w-4xl mx-auto" data-icod-id="src_pages_videogenerator_tsx_hiw_inner">
            <h2
              className="text-3xl font-bold text-foreground mb-12 text-center font-heading"
              data-icod-id="src_pages_videogenerator_tsx_hiw_title"
            >
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-icod-id="src_pages_videogenerator_tsx_hiw_grid">
              {[
                { step: 1, title: 'Describe Your Video', desc: 'Write a detailed text prompt describing the video scene you want to create.' },
                { step: 2, title: 'AI Generates Video', desc: 'Luma Dream Machine creates your video using advanced AI video generation.' },
                { step: 3, title: 'Download & Use', desc: 'Preview your generated video, then download it for any platform.' },
              ].map((item) => (
                <div key={item.step} className="text-center" data-icod-id={`src_pages_videogenerator_tsx_step_${item.step}`}>
                  <div
                    className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                    data-icod-id={`src_pages_videogenerator_tsx_stepnum_${item.step}`}
                  >
                    <span className="text-primary font-bold text-lg" data-icod-id={`src_pages_videogenerator_tsx_stepn_${item.step}`}>
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2" data-icod-id={`src_pages_videogenerator_tsx_steptitle_${item.step}`}>
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm" data-icod-id={`src_pages_videogenerator_tsx_stepdesc_${item.step}`}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Use Cases Section */}
      <section
        className="py-16 md:py-20"
        style={{ background: 'var(--section-blush)' }}
        data-icod-id="src_pages_videogenerator_tsx_usecases"
      >
        <div className="container mx-auto px-4" data-icod-id="src_pages_videogenerator_tsx_uc_container">
          <div className="max-w-5xl mx-auto" data-icod-id="src_pages_videogenerator_tsx_uc_inner">
            <h2
              className="text-3xl font-bold text-foreground mb-8 font-heading"
              data-icod-id="src_pages_videogenerator_tsx_uc_title"
            >
              Perfect For
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-icod-id="src_pages_videogenerator_tsx_uc_grid">
              {[
                { title: 'Product Demo Videos', description: 'Create compelling product demonstration videos without expensive filming equipment.' },
                { title: 'Social Media Content', description: 'Generate scroll-stopping video content for Instagram Reels, TikTok, and YouTube Shorts.' },
                { title: 'Ad Creatives', description: 'Produce unique video ad variations quickly for A/B testing campaigns.' },
                { title: 'Concept Visualization', description: 'Bring ideas to life visually before investing in full production.' },
              ].map((useCase, index) => (
                <Card key={index} className="p-6" data-icod-id={`src_pages_videogenerator_tsx_uc_${index}`}>
                  <h3 className="font-semibold text-foreground mb-2" data-icod-id={`src_pages_videogenerator_tsx_uctitle_${index}`}>
                    {useCase.title}
                  </h3>
                  <p className="text-muted-foreground text-sm" data-icod-id={`src_pages_videogenerator_tsx_ucdesc_${index}`}>
                    {useCase.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section
        className="py-16 md:py-20"
        style={{ background: 'var(--gradient-signature)' }}
        data-icod-id="src_pages_videogenerator_tsx_cta"
      >
        <div className="container mx-auto px-4 text-center" data-icod-id="src_pages_videogenerator_tsx_cta_container">
          <h2
            className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6 font-heading"
            data-icod-id="src_pages_videogenerator_tsx_cta_title"
          >
            Ready to Create AI Videos?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto" data-icod-id="src_pages_videogenerator_tsx_cta_desc">
            Use our free AI tools to streamline your content creation workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center" data-icod-id="src_pages_videogenerator_tsx_cta_buttons">
            <Link
              to="/video-generator"
              className="inline-flex items-center justify-center rounded-lg bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary hover:bg-primary-foreground/90 transition-colors"
              data-icod-id="src_pages_videogenerator_tsx_cta_start"
            >
              <Play className="h-4 w-4 mr-2" data-icod-id="src_pages_videogenerator_tsx_play_icon" />
              Start Generating
            </Link>
            <Link
              to="/ai-tools"
              className="inline-flex items-center justify-center rounded-lg border border-primary-foreground/30 px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
              data-icod-id="src_pages_videogenerator_tsx_cta_browse"
            >
              Browse All Tools
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
