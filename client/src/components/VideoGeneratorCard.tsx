import { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Card, Alert, Spinner } from '@/components/ui';
import { lumaService, type LumaGeneration } from '@/services/lumaService';
import { cn } from '@/utils/cn';
import {
  Video,
  Sparkles,
  Download,
  RefreshCw,
  Film,
  Image as ImageIcon,
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
 * NOTE: This component is PUBLIC (no auth required) — a 401/403 from the
 * server almost certainly means a Luma API key problem, NOT a user session
 * issue. We must NOT clear localStorage or tell users their session expired
 * for errors they cannot fix by logging in again.
 */
function getErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;

  // Check for enriched API error with status code
  const apiError = err as Error & { statusCode?: number; isApiError?: boolean };

  // Handle Luma-specific service errors — these are server-side config issues,
  // not user session problems. Match common Luma error patterns.
  const msg = err.message || '';
  const lowerMsg = msg.toLowerCase();

  if (lowerMsg.includes('luma') || lowerMsg.includes('dream machine')) {
    if (lowerMsg.includes('not configured') || lowerMsg.includes('api_key')) {
      return 'The video generation service is not configured. Please contact the site administrator.';
    }
    if (lowerMsg.includes('authentication failed') || lowerMsg.includes('unauthorized')) {
      return 'The video generation service encountered an authentication error. Please contact the site administrator.';
    }
    if (lowerMsg.includes('quota') || lowerMsg.includes('exceeded')) {
      return 'Video generation quota has been exceeded. Please try again later.';
    }
    if (lowerMsg.includes('rate limit')) {
      return 'Too many video generation requests. Please wait a moment and try again.';
    }
    // Any other Luma error — pass through the server message
    return msg;
  }

  // Handle rate limiting from our own server
  if (apiError.statusCode === 429) {
    return 'Too many requests. Please wait a moment before trying again.';
  }

  // Handle server configuration errors
  if (apiError.statusCode === 503) {
    return 'The video generation service is temporarily unavailable. Please try again later.';
  }

  // Handle forbidden errors
  if (apiError.statusCode === 403) {
    return 'You do not have permission to perform this action.';
  }

  // Handle network errors
  if (msg.includes('Cannot reach the server') || msg.includes('Network Error')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  // Handle timeout errors
  if (msg.includes('timed out')) {
    return 'The request took too long. Please try again.';
  }

  // Return the original error message if it's user-friendly, otherwise use fallback
  return msg || fallback;
}

// ─── Component ──────────────────────────────────────────────────────────────────

interface VideoGeneratorCardProps {
  className?: string;
}

export default function VideoGeneratorCard({ className }: VideoGeneratorCardProps) {
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
    }, 3000);
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
    <Card className={cn('overflow-hidden', className)} data-icod-id="src_components_videogeneratorcard_tsx_card">
      {/* Header */}
      <div
        className="bg-primary/5 p-6 border-b border-border/50"
        data-icod-id="src_components_videogeneratorcard_tsx_header"
      >
        <div className="flex items-center gap-3 mb-2" data-icod-id="src_components_videogeneratorcard_tsx_head_row">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
            data-icod-id="src_components_videogeneratorcard_tsx_icon_wrap"
          >
            <Film className="h-5 w-5" data-icod-id="src_components_videogeneratorcard_tsx_film_icon" />
          </div>
          <h3 className="text-lg font-semibold text-foreground" data-icod-id="src_components_videogeneratorcard_tsx_title">
            Generate Video
          </h3>
        </div>
        <p className="text-sm text-muted-foreground" data-icod-id="src_components_videogeneratorcard_tsx_subtitle">
          Describe the video you want and let Dream Machine create it for you.
        </p>
      </div>

      {/* Not configured warning */}
      {isConfigured === false && (
        <div className="px-6 pt-6" data-icod-id="src_components_videogeneratorcard_tsx_notconfigured">
          <Alert variant="error" data-icod-id="src_components_videogeneratorcard_tsx_alert">
            <AlertCircle className="h-5 w-5 mr-2" data-icod-id="src_components_videogeneratorcard_tsx_alerticon" />
            Luma AI is not configured. An administrator needs to add the LUMA_API_KEY environment variable.
          </Alert>
        </div>
      )}

      {/* Form */}
      <div className="p-6 space-y-6" data-icod-id="src_components_videogeneratorcard_tsx_form">
        {/* Prompt Input */}
        <div data-icod-id="src_components_videogeneratorcard_tsx_prompt_field">
          <label
            htmlFor="video-prompt-card"
            className="block text-sm font-medium text-foreground mb-1.5"
            data-icod-id="src_components_videogeneratorcard_tsx_prompt_label"
          >
            Video Description <span className="text-destructive" data-icod-id="src_components_videogeneratorcard_tsx_required">*</span>
          </label>
          <textarea
            id="video-prompt-card"
            rows={4}
            placeholder="Describe the video you want to generate... e.g., A golden retriever running through a sunflower field at sunset, cinematic slow motion, warm lighting"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={generationState === 'submitting' || generationState === 'polling'}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            data-icod-id="src_components_videogeneratorcard_tsx_prompt_input"
          />
          <p className="mt-1 text-xs text-muted-foreground" data-icod-id="src_components_videogeneratorcard_tsx_prompt_hint">
            Be descriptive! Include details about subject, action, setting, lighting, and camera movement.
          </p>
        </div>

        {/* Aspect Ratio Selector */}
        <div data-icod-id="src_components_videogeneratorcard_tsx_ratio_field">
          <label className="block text-sm font-medium text-foreground mb-2" data-icod-id="src_components_videogeneratorcard_tsx_ratio_label">
            Aspect Ratio
          </label>
          <div
            className="grid grid-cols-3 sm:grid-cols-6 gap-2"
            data-icod-id="src_components_videogeneratorcard_tsx_ratio_grid"
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
                data-icod-id={`src_components_videogeneratorcard_tsx_ratio_${ar.value}`}
              >
                <span className="block text-sm font-semibold" data-icod-id={`src_components_videogeneratorcard_tsx_rlabel_${ar.value}`}>
                  {ar.label}
                </span>
                <span className="block text-[10px] text-muted-foreground mt-0.5" data-icod-id={`src_components_videogeneratorcard_tsx_rdesc_${ar.value}`}>
                  {ar.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Optional Reference Image URL */}
        <div data-icod-id="src_components_videogeneratorcard_tsx_image_field">
          <label
            htmlFor="image-url-card"
            className="block text-sm font-medium text-foreground mb-1.5"
            data-icod-id="src_components_videogeneratorcard_tsx_image_label"
          >
            <span className="flex items-center gap-1.5" data-icod-id="src_components_videogeneratorcard_tsx_image_label_inner">
              <ImageIcon className="h-4 w-4" data-icod-id="src_components_videogeneratorcard_tsx_img_icon" />
              Reference Image URL (optional)
            </span>
          </label>
          <input
            id="image-url-card"
            type="url"
            placeholder="https://example.com/reference-image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={generationState === 'submitting' || generationState === 'polling'}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            data-icod-id="src_components_videogeneratorcard_tsx_image_input"
          />
          <p className="mt-1 text-xs text-muted-foreground" data-icod-id="src_components_videogeneratorcard_tsx_image_hint">
            Provide an image URL to use as a starting frame for image-to-video generation.
          </p>
        </div>

        {/* Loop Toggle */}
        <div className="flex items-center gap-3" data-icod-id="src_components_videogeneratorcard_tsx_loop_field">
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
            data-icod-id="src_components_videogeneratorcard_tsx_loop_toggle"
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-primary-foreground shadow ring-0 transition duration-200 ease-in-out',
                loop ? 'translate-x-5' : 'translate-x-0',
              )}
              data-icod-id="src_components_videogeneratorcard_tsx_loop_knob"
            />
          </button>
          <label className="text-sm font-medium text-foreground cursor-pointer" data-icod-id="src_components_videogeneratorcard_tsx_loop_label">
            Loop video
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="error" data-icod-id="src_components_videogeneratorcard_tsx_error">
            {error}
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3" data-icod-id="src_components_videogeneratorcard_tsx_actions">
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
            data-icod-id="src_components_videogeneratorcard_tsx_generate_btn"
          >
            <Sparkles className="mr-2 h-4 w-4" data-icod-id="src_components_videogeneratorcard_tsx_sparkle_icon" />
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
              data-icod-id="src_components_videogeneratorcard_tsx_reset_btn"
            >
              <RefreshCw className="mr-2 h-4 w-4" data-icod-id="src_components_videogeneratorcard_tsx_reset_icon" />
              Reset
            </Button>
          )}
        </div>

        {/* Loading / Status Display */}
        {(generationState === 'submitting' || generationState === 'polling') && (
          <div
            className="flex flex-col items-center justify-center py-10 text-center"
            data-icod-id="src_components_videogeneratorcard_tsx_loading"
          >
            <Spinner size="lg" data-icod-id="src_components_videogeneratorcard_tsx_spinner" />
            <p className="mt-4 text-sm font-medium text-foreground" data-icod-id="src_components_videogeneratorcard_tsx_status_text">
              {statusMessage()}
            </p>
            <p className="mt-1 text-xs text-muted-foreground" data-icod-id="src_components_videogeneratorcard_tsx_status_hint">
              Video generation typically takes 30-120 seconds.
            </p>
          </div>
        )}

        {/* Completed Result */}
        {generationState === 'completed' && generation?.video && (
          <div
            className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4"
            data-icod-id="src_components_videogeneratorcard_tsx_result"
          >
            <div className="flex items-center justify-between" data-icod-id="src_components_videogeneratorcard_tsx_result_header">
              <h4 className="font-semibold text-foreground flex items-center gap-2" data-icod-id="src_components_videogeneratorcard_tsx_result_title">
                <Video className="h-5 w-5 text-primary" data-icod-id="src_components_videogeneratorcard_tsx_video_icon" />
                Generated Video
              </h4>
              <a
                href={generation.video.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                data-icod-id="src_components_videogeneratorcard_tsx_download_link"
              >
                <Download className="h-4 w-4" data-icod-id="src_components_videogeneratorcard_tsx_dl_icon" />
                Download
              </a>
            </div>

            {/* Video Player */}
            <div
              className="relative overflow-hidden rounded-lg bg-background aspect-video"
              data-icod-id="src_components_videogeneratorcard_tsx_player_wrap"
            >
              <video
                src={generation.video.url}
                controls
                autoPlay
                loop={loop}
                className="w-full h-full object-contain"
                data-icod-id="src_components_videogeneratorcard_tsx_video_player"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground" data-icod-id="src_components_videogeneratorcard_tsx_meta">
              {generation.video.width && generation.video.height && (
                <span data-icod-id="src_components_videogeneratorcard_tsx_dimensions">
                  {generation.video.width} x {generation.video.height}
                </span>
              )}
              <span data-icod-id="src_components_videogeneratorcard_tsx_prompt_echo">
                Prompt: &quot;{generation.prompt.length > 80 ? generation.prompt.slice(0, 80) + '...' : generation.prompt}&quot;
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
