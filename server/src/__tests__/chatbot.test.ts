/**
 * Unit tests for chatbot endpoint and controller.
 * Tests cover validation, error handling, response contract, and sanitization.
 */

// Mock the aiService module
const mockGenerateCompletion = jest.fn();
jest.mock('../services/aiService', () => ({
  generateCompletion: mockGenerateCompletion,
  AIProviderError: class AIProviderError extends Error {
    category: string;
    provider?: string;
    httpStatus?: number;
    constructor(message: string, category: string, provider?: string, httpStatus?: number) {
      super(message);
      this.name = 'AIProviderError';
      this.category = category;
      this.provider = provider;
      this.httpStatus = httpStatus;
    }
  },
}));

// Import after mocking
import { chatbotController } from '../controllers/chatbotController';

// Helper to create mock req/res/next
function createMockRes() {
  const res: Record<string, unknown> = {
    statusCode: 200,
    body: null,
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockImplementation((data: unknown) => {
      res.body = data;
      return res;
    }),
  };
  return res as {
    statusCode: number;
    body: unknown;
    status: jest.Mock;
    json: jest.Mock;
  };
}

function createMockReq(body: Record<string, unknown> = {}) {
  return {
    body,
  } as { body: Record<string, unknown> };
}

function createMockNext() {
  return jest.fn();
}

describe('Chatbot Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('chat handler', () => {
    it('should return success response with answer on valid request', async () => {
      mockGenerateCompletion.mockResolvedValue('This is a test response');

      const req = createMockReq({ message: 'Hello' });
      const res = createMockRes();
      const next = createMockNext();

      await chatbotController.chat(req as never, res as never, next);

      const body = res.json.mock.calls[0][0];
      expect(body.success).toBe(true);
      expect(body.answer).toBe('This is a test response');
      expect(body.requestId).toBeDefined();
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when message is missing', async () => {
      const req = createMockReq({});
      const res = createMockRes();
      const next = createMockNext();

      await chatbotController.chat(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const body = res.json.mock.calls[0][0];
      expect(body.success).toBe(false);
      expect(body.error).toBe('message is required.');
    });

    it('should return 400 when message is empty string', async () => {
      const req = createMockReq({ message: '   ' });
      const res = createMockRes();
      const next = createMockNext();

      await chatbotController.chat(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const body = res.json.mock.calls[0][0];
      expect(body.success).toBe(false);
      expect(body.error).toBe('message is required.');
    });

    it('should return 400 when message exceeds 2000 characters', async () => {
      const longMessage = 'a'.repeat(2001);
      const req = createMockReq({ message: longMessage });
      const res = createMockRes();
      const next = createMockNext();

      await chatbotController.chat(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const body = res.json.mock.calls[0][0];
      expect(body.success).toBe(false);
      expect(body.error).toBe('Message must be 2000 characters or less.');
    });

    it('should trim message before processing', async () => {
      mockGenerateCompletion.mockResolvedValue('Response');

      const req = createMockReq({ message: '  Hello World  ' });
      const res = createMockRes();
      const next = createMockNext();

      await chatbotController.chat(req as never, res as never, next);

      expect(mockGenerateCompletion).toHaveBeenCalledWith('Hello World', expect.any(Object));
    });

    it('should pass system prompt and maxTokens to generateCompletion', async () => {
      mockGenerateCompletion.mockResolvedValue('Response');

      const req = createMockReq({ message: 'Test' });
      const res = createMockRes();
      const next = createMockNext();

      await chatbotController.chat(req as never, res as never, next);

      expect(mockGenerateCompletion).toHaveBeenCalledWith(
        'Test',
        expect.objectContaining({
          system: expect.any(String),
          maxTokens: 512,
        })
      );
    });
  });

  describe('error handling and sanitization', () => {
    it('should sanitize "no provider configured" error with not_configured category', async () => {
      mockGenerateCompletion.mockRejectedValue(
        new Error('No AI provider configured. Add a provider in Settings or set AI_API_KEY.')
      );

      const req = createMockReq({ message: 'Hello' });
      const res = createMockRes();
      const next = createMockNext();

      await chatbotController.chat(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const body = res.json.mock.calls[0][0];
      expect(body.success).toBe(false);
      expect(body.errorCategory).toBe('not_configured');
      expect(body.error).toBe('AI assistant is being configured. Please try again later.');
    });

    it('should sanitize timeout/abort errors with timeout category', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      mockGenerateCompletion.mockRejectedValue(abortError);

      const req = createMockReq({ message: 'Hello' });
      const res = createMockRes();
      const next = createMockNext();

      await chatbotController.chat(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const body = res.json.mock.calls[0][0];
      expect(body.success).toBe(false);
      expect(body.errorCategory).toBe('timeout');
      expect(body.error).toBe('The AI took too long to respond. Please try again.');
    });

    it('should sanitize API errors without leaking credentials', async () => {
      // Simulate an error that might contain sensitive info
      mockGenerateCompletion.mockRejectedValue(
        new Error('Anthropic API error (401): {"error": {"message": "Invalid API key: sk-ant-xxx..."}}')
      );

      const req = createMockReq({ message: 'Hello' });
      const res = createMockRes();
      const next = createMockNext();

      await chatbotController.chat(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseBody = res.json.mock.calls[0][0];
      expect(responseBody.success).toBe(false);
      // Should NOT contain API key or internal details
      expect(responseBody.error).not.toContain('sk-ant');
      expect(responseBody.error).not.toContain('401');
      expect(responseBody.error).toBe('Unable to process your request. Please try again.');
    });

    it('should sanitize network errors with network category', async () => {
      mockGenerateCompletion.mockRejectedValue(
        new Error('fetch failed: ECONNREFUSED 127.0.0.1:443')
      );

      const req = createMockReq({ message: 'Hello' });
      const res = createMockRes();
      const next = createMockNext();

      await chatbotController.chat(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseBody = res.json.mock.calls[0][0];
      expect(responseBody.error).not.toContain('ECONNREFUSED');
      expect(responseBody.error).not.toContain('127.0.0.1');
      expect(responseBody.errorCategory).toBe('network');
      expect(responseBody.error).toBe('Unable to reach the AI service. Please check your connection.');
    });

    it('should handle unknown errors with generic message', async () => {
      mockGenerateCompletion.mockRejectedValue(new Error('Some internal stack trace at /var/app/server.js:123'));

      const req = createMockReq({ message: 'Hello' });
      const res = createMockRes();
      const next = createMockNext();

      await chatbotController.chat(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseBody = res.json.mock.calls[0][0];
      expect(responseBody.error).not.toContain('/var/app');
      expect(responseBody.error).not.toContain('stack trace');
      expect(responseBody.error).toBe('Unable to process your request. Please try again.');
    });

    it('should handle non-Error thrown values', async () => {
      mockGenerateCompletion.mockRejectedValue('string error');

      const req = createMockReq({ message: 'Hello' });
      const res = createMockRes();
      const next = createMockNext();

      await chatbotController.chat(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const body = res.json.mock.calls[0][0];
      expect(body.success).toBe(false);
      expect(body.error).toBe('Unable to process your request. Please try again.');
      expect(body.errorCategory).toBe('unknown');
    });

    it('should sanitize unsupported provider errors with not_configured category', async () => {
      mockGenerateCompletion.mockRejectedValue(
        new Error('Unsupported AI provider: "custom-provider"')
      );

      const req = createMockReq({ message: 'Hello' });
      const res = createMockRes();
      const next = createMockNext();

      await chatbotController.chat(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseBody = res.json.mock.calls[0][0];
      expect(responseBody.error).not.toContain('custom-provider');
      expect(responseBody.errorCategory).toBe('not_configured');
      expect(responseBody.error).toBe('AI assistant is being configured. Please try again later.');
    });
  });

  describe('response contract', () => {
    it('should always return { success: boolean } shape', async () => {
      mockGenerateCompletion.mockResolvedValue('OK');

      const req = createMockReq({ message: 'Test' });
      const res = createMockRes();
      const next = createMockNext();

      await chatbotController.chat(req as never, res as never, next);

      const body = res.json.mock.calls[0][0];
      expect(body).toHaveProperty('success');
      expect(typeof body.success).toBe('boolean');
    });

    it('should return answer field on success', async () => {
      mockGenerateCompletion.mockResolvedValue('Test answer');

      const req = createMockReq({ message: 'Test' });
      const res = createMockRes();
      const next = createMockNext();

      await chatbotController.chat(req as never, res as never, next);

      const body = res.json.mock.calls[0][0];
      expect(body.success).toBe(true);
      expect(body).toHaveProperty('answer');
      expect(body.answer).toBe('Test answer');
    });

    it('should return error and errorCategory fields on failure', async () => {
      mockGenerateCompletion.mockRejectedValue(new Error('No provider'));

      const req = createMockReq({ message: 'Test' });
      const res = createMockRes();
      const next = createMockNext();

      await chatbotController.chat(req as never, res as never, next);

      const body = res.json.mock.calls[0][0];
      expect(body.success).toBe(false);
      expect(body).toHaveProperty('error');
      expect(typeof body.error).toBe('string');
      expect(body).toHaveProperty('errorCategory');
    });

    it('should include requestId in all responses', async () => {
      mockGenerateCompletion.mockResolvedValue('OK');

      const req = createMockReq({ message: 'Test' });
      const res = createMockRes();
      const next = createMockNext();

      await chatbotController.chat(req as never, res as never, next);

      const body = res.json.mock.calls[0][0];
      expect(body).toHaveProperty('requestId');
      expect(typeof body.requestId).toBe('string');
    });
  });
});
