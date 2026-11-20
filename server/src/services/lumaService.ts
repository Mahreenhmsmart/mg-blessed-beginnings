/**
 * Luma AI (Dream Machine) Service
 * Handles video and image generation via the Luma Dream Machine API.
 * API docs: https://docs.lumalabs.ai/docs/dream-machine-api
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface LumaGenerationRequest {
  prompt: string;
  aspect_ratio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9';
  loop?: boolean;
  extend_generation_id?: string;
  image_url?: string; // Optional reference image for image-to-video
}

export interface LumaGeneration {
  id: string;
  prompt: string;
  state: 'queued' | 'dreaming' | 'completed' | 'failed';
  created_at: string;
  video?: {
    url: string;
    width: number;
    height: number;
  } | null;
  failure?: {
    reason: string;
  } | null;
}

export interface GenerateVideoParams {
  prompt: string;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9';
  loop?: boolean;
  imageUrl?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

const LUMA_API_BASE = 'https://api.lumalabs.ai/dream-machine/v1';

/**
 * Custom error class for Luma configuration issues.
 * Carries a machine-readable `.code` so the controller can map it to a
 * structured response without parsing human-facing text.
 */
export class LumaConfigError extends Error {
  code = 'NOT_CONFIGURED' as const;
  constructor() {
    super('AI Video Generator requires an API key to be configured by the site administrator');
    this.name = 'LumaConfigError';
  }
}

/**
 * Read the API key lazily — ESM imports hoist above dotenv.config(), so
 * process.env may be empty at module load time.
 * Throws a LumaConfigError (with .code === 'NOT_CONFIGURED') when missing,
 * so the controller can return a clean 503 without exposing env var names.
 */
function getApiKey(): string {
  const key = process.env.LUMA_API_KEY;
  if (!key) {
    throw new LumaConfigError();
  }
  return key;
}

async function lumaFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const apiKey = getApiKey();
  const url = `${LUMA_API_BASE}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    let message = `Luma API error (${res.status})`;

    try {
      const json = JSON.parse(body);
      message = json.detail || json.error?.message || json.message || message;
    } catch {
      if (body) message = `${message}: ${body}`;
    }

    // Map known status codes to user-friendly messages
    if (res.status === 401) {
      throw new Error('Luma AI authentication failed. Please verify the API key.');
    }
    if (res.status === 429) {
      throw new Error('Luma AI rate limit exceeded. Please try again later.');
    }
    if (res.status === 402 || (body.toLowerCase().includes('quota') && res.status >= 400)) {
      throw new Error('Luma AI quota exceeded. Please upgrade your plan or try again later.');
    }

    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

/**
 * Start a new video generation.
 * Returns the generation object with an ID that can be polled for status.
 */
export async function generateVideo(params: GenerateVideoParams): Promise<LumaGeneration> {
  if (!params.prompt || !params.prompt.trim()) {
    throw new Error('A text prompt is required for video generation.');
  }

  const body: Record<string, unknown> = {
    prompt: params.prompt.trim(),
  };

  if (params.aspectRatio) {
    body.aspect_ratio = params.aspectRatio;
  }

  if (params.loop !== undefined) {
    body.loop = params.loop;
  }

  // Image-to-video: include the reference image URL
  if (params.imageUrl) {
    body.keyframes = {
      frame0: {
        type: 'image',
        url: params.imageUrl,
      },
    };
  }

  const result = await lumaFetch<LumaGeneration>('/generations', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return result;
}

/**
 * Poll the status of a generation by its ID.
 */
export async function getGenerationStatus(generationId: string): Promise<LumaGeneration> {
  if (!generationId || !generationId.trim()) {
    throw new Error('Generation ID is required.');
  }

  const result = await lumaFetch<LumaGeneration>(`/generations/${encodeURIComponent(generationId)}`, {
    method: 'GET',
  });

  return result;
}

/**
 * Check whether the Luma API key is configured and appears valid.
 * Does NOT make an API call — just checks env presence.
 */
export function isConfigured(): boolean {
  return !!process.env.LUMA_API_KEY;
}
