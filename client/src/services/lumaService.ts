import apiClient from './apiClient';

// ─── Types ─────────────────────────────────────────────────────────────────────

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

// ─── Service Functions ──────────────────────────────────────────────────────────

export const lumaService = {
  /**
   * Start a new video generation.
   */
  async generateVideo(params: GenerateVideoParams): Promise<LumaGeneration> {
    const { data } = await apiClient.post<{ success: boolean; data: LumaGeneration }>(
      '/luma/generate',
      params,
    );
    return data.data;
  },

  /**
   * Poll the status of a generation by its ID.
   */
  async getStatus(generationId: string): Promise<LumaGeneration> {
    const { data } = await apiClient.get<{ success: boolean; data: LumaGeneration }>(
      `/luma/status/${encodeURIComponent(generationId)}`,
    );
    return data.data;
  },

  /**
   * Fetch the completed result for a generation.
   */
  async getResult(generationId: string): Promise<LumaGeneration> {
    const { data } = await apiClient.get<{ success: boolean; data: LumaGeneration }>(
      `/luma/result/${encodeURIComponent(generationId)}`,
    );
    return data.data;
  },

  /**
   * Check if Luma AI is configured on the backend.
   */
  async isConfigured(): Promise<boolean> {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: { configured: boolean } }>(
        '/luma/configured',
      );
      return data.data.configured;
    } catch {
      return false;
    }
  },
};
