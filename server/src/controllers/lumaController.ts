import type { Request, Response, NextFunction } from 'express';
import * as lumaService from '../services/lumaService';
import { LumaConfigError } from '../services/lumaService';

/**
 * Map Luma service errors to appropriate HTTP status codes and user-friendly messages.
 * These are PUBLIC endpoints — errors here are server/API config issues, not user auth issues.
 */
function handleLumaError(err: unknown, res: Response): void {
  // Check for the typed config error first — most reliable signal
  if (err instanceof LumaConfigError || (err as any)?.code === 'NOT_CONFIGURED') {
    res.status(503).json({
      success: false,
      error: 'not_configured',
      message: 'AI Video Generator is not yet available. The site administrator needs to configure the integration.',
    });
    return;
  }

  const message = err instanceof Error ? err.message : 'Unknown error';
  const lowerMsg = message.toLowerCase();

  // Fallback: catch config-missing errors that slipped through without the typed class
  if (lowerMsg.includes('not configured') && !lowerMsg.includes('api_key')) {
    res.status(503).json({
      success: false,
      error: 'not_configured',
      message: 'AI Video Generator is not yet available. The site administrator needs to configure the integration.',
    });
    return;
  }

  // Luma API authentication failure (invalid/expired API key)
  if (lowerMsg.includes('authentication failed') || lowerMsg.includes('unauthorized')) {
    console.error('[Luma] API authentication failed — check LUMA_API_KEY');
    res.status(503).json({
      success: false,
      error: 'The video generation service encountered an authentication error. Please contact the site administrator.',
    });
    return;
  }

  // Luma quota exceeded
  if (lowerMsg.includes('quota') || lowerMsg.includes('exceeded')) {
    res.status(503).json({
      success: false,
      error: 'Video generation quota has been exceeded. Please try again later.',
    });
    return;
  }

  // Luma rate limit
  if (lowerMsg.includes('rate limit')) {
    res.status(429).json({
      success: false,
      error: 'Too many video generation requests. Please wait a moment and try again.',
    });
    return;
  }

  // Any other Luma error — log details server-side, return generic message
  console.error('[Luma] Unexpected error:', message);
  res.status(503).json({
    success: false,
    error: 'The video generation service is temporarily unavailable. Please try again later.',
  });
}

export const lumaController = {
  /**
   * POST /api/luma/generate — Start a new video generation.
   */
  async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!lumaService.isConfigured()) {
        res.status(503).json({
          success: false,
          error: 'not_configured',
          message: 'AI Video Generator is not yet available. The site administrator needs to configure the integration.',
        });
        return;
      }

      const { prompt, aspectRatio, loop, imageUrl } = req.body;

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        res.status(400).json({
          success: false,
          error: 'A text prompt is required for video generation.',
        });
        return;
      }

      // Validate aspect ratio if provided
      const validAspectRatios = ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'];
      if (aspectRatio && !validAspectRatios.includes(aspectRatio)) {
        res.status(400).json({
          success: false,
          error: `Invalid aspect ratio. Must be one of: ${validAspectRatios.join(', ')}`,
        });
        return;
      }

      const generation = await lumaService.generateVideo({
        prompt,
        aspectRatio,
        loop,
        imageUrl,
      });

      res.json({ success: true, data: generation });
    } catch (err) {
      // Handle Luma-specific errors with proper status codes instead of
      // passing to the generic error handler (which would return 500).
      handleLumaError(err, res);
    }
  },

  /**
   * GET /api/luma/status/:generationId — Poll generation status.
   */
  async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!lumaService.isConfigured()) {
        res.status(503).json({
          success: false,
          error: 'not_configured',
          message: 'AI Video Generator is not yet available. The site administrator needs to configure the integration.',
        });
        return;
      }

      const { generationId } = req.params;

      if (!generationId) {
        res.status(400).json({
          success: false,
          error: 'Generation ID is required.',
        });
        return;
      }

      const generation = await lumaService.getGenerationStatus(generationId);
      res.json({ success: true, data: generation });
    } catch (err) {
      handleLumaError(err, res);
    }
  },

  /**
   * GET /api/luma/result/:generationId — Fetch completed result.
   * Same endpoint as status but semantically used when the client knows
   * the generation is complete and wants the final video URL.
   */
  async getResult(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!lumaService.isConfigured()) {
        res.status(503).json({
          success: false,
          error: 'not_configured',
          message: 'AI Video Generator is not yet available. The site administrator needs to configure the integration.',
        });
        return;
      }

      const { generationId } = req.params;

      if (!generationId) {
        res.status(400).json({
          success: false,
          error: 'Generation ID is required.',
        });
        return;
      }

      const generation = await lumaService.getGenerationStatus(generationId);

      if (generation.state === 'failed') {
        res.status(422).json({
          success: false,
          error: generation.failure?.reason || 'Video generation failed.',
        });
        return;
      }

      if (generation.state !== 'completed') {
        res.json({
          success: true,
          data: {
            state: generation.state,
            message: `Generation is still ${generation.state}. Poll again later.`,
          },
        });
        return;
      }

      res.json({ success: true, data: generation });
    } catch (err) {
      handleLumaError(err, res);
    }
  },

  /**
   * GET /api/luma/configured — Check if Luma AI is available.
   */
  async checkConfigured(_req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: { configured: lumaService.isConfigured() },
    });
  },
};
