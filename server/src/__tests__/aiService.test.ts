/**
 * Unit tests for AI service provider resolution and generation.
 * Tests cover DB vs env fallback, provider adapters, decryption failure handling,
 * timeout errors, and response normalization.
 */

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

// Mock the aiProviderService module
const mockGetActiveProvider = jest.fn();
const mockGetFallbackChain = jest.fn();

jest.mock('../services/aiProviderService', () => ({
  getActiveProvider: mockGetActiveProvider,
  getFallbackChain: mockGetFallbackChain,
}));

import { generateCompletion } from '../services/aiService';

describe('AI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.AI_PROVIDER;
    delete process.env.AI_MODEL;
    delete process.env.AI_API_KEY;
  });

  describe('resolveProvider', () => {
    it('should use DB provider when available', async () => {
      mockGetActiveProvider.mockResolvedValue({
        provider: 'openai',
        model: 'gpt-4',
        apiKey: 'test-key',
      });
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: 'response' } }] }),
      });

      await generateCompletion('test prompt');

      expect(mockGetActiveProvider).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.any(Object)
      );
    });

    it('should fall back to env vars when DB returns null', async () => {
      mockGetActiveProvider.mockResolvedValue(null);
      mockGetFallbackChain.mockResolvedValue([]);

      process.env.AI_PROVIDER = 'anthropic';
      process.env.AI_MODEL = 'claude-3';
      process.env.AI_API_KEY = 'env-key';

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ content: [{ type: 'text', text: 'response' }] }),
      });

      await generateCompletion('test prompt');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-api-key': 'env-key',
          }),
        })
      );
    });

    it('should throw when no provider is configured', async () => {
      mockGetActiveProvider.mockResolvedValue(null);
      mockGetFallbackChain.mockResolvedValue([]);

      // No env vars set
      await expect(generateCompletion('test')).rejects.toThrow(
        /No AI provider configured/
      );
    });

    it('should handle DB query failure gracefully', async () => {
      mockGetActiveProvider.mockRejectedValue(new Error('DB connection failed'));
      mockGetFallbackChain.mockResolvedValue([]);

      process.env.AI_PROVIDER = 'openai';
      process.env.AI_API_KEY = 'fallback-key';

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: 'ok' } }] }),
      });

      // Should not throw - should fall back to env
      await expect(generateCompletion('test')).resolves.toBe('ok');
    });
  });

  describe('generateWithProvider - Anthropic', () => {
    beforeEach(() => {
      mockGetActiveProvider.mockResolvedValue({
        provider: 'anthropic',
        model: 'claude-3-sonnet',
        apiKey: 'sk-ant-test',
      });
    });

    it('should normalize Anthropic response to plain text', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          content: [{ type: 'text', text: 'Hello from Claude' }],
        }),
      });

      const result = await generateCompletion('Hi');

      expect(result).toBe('Hello from Claude');
    });

    it('should handle empty Anthropic response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ content: [] }),
      });

      const result = await generateCompletion('Hi');

      expect(result).toBe('');
    });

    it('should include system prompt in Anthropic request', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ content: [{ type: 'text', text: 'ok' }] }),
      });

      await generateCompletion('test', { system: 'You are helpful' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          body: expect.stringContaining('"system":"You are helpful"'),
        })
      );
    });
  });

  describe('generateWithProvider - OpenAI', () => {
    beforeEach(() => {
      mockGetActiveProvider.mockResolvedValue({
        provider: 'openai',
        model: 'gpt-4o',
        apiKey: 'sk-openai-test',
      });
    });

    it('should normalize OpenAI response to plain text', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Hello from GPT' } }],
        }),
      });

      const result = await generateCompletion('Hi');

      expect(result).toBe('Hello from GPT');
    });

    it('should handle empty OpenAI response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ choices: [] }),
      });

      const result = await generateCompletion('Hi');

      expect(result).toBe('');
    });

    it('should include system message in OpenAI request', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: 'ok' } }] }),
      });

      await generateCompletion('test', { system: 'You are helpful' });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.messages[0]).toEqual({ role: 'system', content: 'You are helpful' });
    });
  });

  describe('generateWithProvider - Google', () => {
    beforeEach(() => {
      mockGetActiveProvider.mockResolvedValue({
        provider: 'google',
        model: 'gemini-pro',
        apiKey: 'google-api-key',
      });
    });

    it('should normalize Google response to plain text', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{ content: { parts: [{ text: 'Hello from Gemini' }] } }],
        }),
      });

      const result = await generateCompletion('Hi');

      expect(result).toBe('Hello from Gemini');
    });

    it('should handle empty Google response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ candidates: [] }),
      });

      const result = await generateCompletion('Hi');

      expect(result).toBe('');
    });

    it('should include API key in URL for Google', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] }),
      });

      await generateCompletion('test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('key=google-api-key'),
        expect.any(Object)
      );
    });
  });

  describe('generateWithProvider - Cohere', () => {
    beforeEach(() => {
      mockGetActiveProvider.mockResolvedValue({
        provider: 'cohere',
        model: 'command-r',
        apiKey: 'cohere-api-key',
      });
    });

    it('should normalize Cohere response to plain text', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ text: 'Hello from Cohere' }),
      });

      const result = await generateCompletion('Hi');

      expect(result).toBe('Hello from Cohere');
    });

    it('should handle empty Cohere response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const result = await generateCompletion('Hi');

      expect(result).toBe('');
    });

    it('should include preamble for system prompt in Cohere', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ text: 'ok' }),
      });

      await generateCompletion('test', { system: 'You are helpful' });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.preamble).toBe('You are helpful');
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      mockGetActiveProvider.mockResolvedValue({
        provider: 'openai',
        model: 'gpt-4',
        apiKey: 'test-key',
      });
    });

    it('should throw on API error with status code', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      });

      await expect(generateCompletion('test')).rejects.toThrow(/OpenAI API error \(401\)/);
    });

    it('should throw on unsupported provider', async () => {
      mockGetActiveProvider.mockResolvedValue({
        provider: 'unsupported',
        model: 'model',
        apiKey: 'key',
      });

      await expect(generateCompletion('test')).rejects.toThrow(/Unsupported AI provider/);
    });

    it('should handle AbortError (timeout)', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValue(abortError);

      await expect(generateCompletion('test')).rejects.toThrow(/aborted/i);
    });

    it('should try fallback chain when primary fails', async () => {
      // Primary fails
      mockFetch.mockRejectedValueOnce(new Error('Primary failed'));

      // Fallback succeeds
      mockGetFallbackChain.mockResolvedValue([
        { provider: 'anthropic', model: 'claude-3', apiKey: 'fallback-key' },
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: [{ type: 'text', text: 'fallback response' }] }),
      });

      const result = await generateCompletion('test');

      expect(result).toBe('fallback response');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('response normalization', () => {
    it('should always return a string regardless of provider', async () => {
      const providers = [
        { provider: 'anthropic', response: { content: [{ type: 'text', text: 'test' }] } },
        { provider: 'openai', response: { choices: [{ message: { content: 'test' } }] } },
        { provider: 'google', response: { candidates: [{ content: { parts: [{ text: 'test' }] } }] } },
        { provider: 'cohere', response: { text: 'test' } },
      ];

      for (const { provider, response } of providers) {
        mockGetActiveProvider.mockResolvedValue({
          provider,
          model: 'test-model',
          apiKey: 'test-key',
        });

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(response),
        });

        const result = await generateCompletion('test');

        expect(typeof result).toBe('string');
      }
    });
  });
});
