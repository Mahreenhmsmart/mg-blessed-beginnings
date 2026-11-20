/**
 * Unit tests for chatbot service functions.
 * Tests cover success/error response shapes and error extraction.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock apiClient
const mockPost = vi.fn();
vi.mock('../services/apiClient', () => ({
  default: {
    post: mockPost,
  },
}));

import { sendChatbotMessage } from '../services/aiService';

describe('Chatbot Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendChatbotMessage', () => {
    it('should return success response with answer', async () => {
      mockPost.mockResolvedValue({
        data: { success: true, answer: 'Hello! How can I help?' },
      });

      const result = await sendChatbotMessage('Hi there');

      expect(result).toEqual({
        success: true,
        answer: 'Hello! How can I help?',
      });
      expect(mockPost).toHaveBeenCalledWith('/chatbot', { message: 'Hi there' });
    });

    it('should handle server error response', async () => {
      mockPost.mockRejectedValue({
        response: {
          data: { success: false, error: 'AI service temporarily unavailable.' },
        },
      });

      const result = await sendChatbotMessage('Test');

      expect(result).toEqual({
        success: false,
        error: 'AI service temporarily unavailable.',
      });
    });

    it('should handle network error', async () => {
      mockPost.mockRejectedValue(new Error('Network Error'));

      const result = await sendChatbotMessage('Test');

      expect(result).toEqual({
        success: false,
        error: 'Network Error',
      });
    });

    it('should handle unknown error type', async () => {
      mockPost.mockRejectedValue('unknown error');

      const result = await sendChatbotMessage('Test');

      expect(result).toEqual({
        success: false,
        error: 'Network error. Please check your connection.',
      });
    });

    it('should extract error from axios response.data.error', async () => {
      mockPost.mockRejectedValue({
        response: {
          data: {
            success: false,
            error: 'Message must be 2000 characters or less.',
          },
        },
      });

      const result = await sendChatbotMessage('a'.repeat(3000));

      expect(result.success).toBe(false);
      expect(result.error).toBe('Message must be 2000 characters or less.');
    });

    it('should preserve error field from successful HTTP response with error body', async () => {
      // Server returns HTTP 200 but with error in body (classified errors)
      mockPost.mockResolvedValue({
        data: {
          success: false,
          error: 'AI chat is temporarily unavailable because no AI provider has been configured.',
        },
      });

      const result = await sendChatbotMessage('Test');

      expect(result.success).toBe(false);
      expect(result.error).toContain('no AI provider has been configured');
    });
  });
});
