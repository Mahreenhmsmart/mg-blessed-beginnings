/**
 * Safe Parser Utility — Handles JSON, plain text, Markdown, malformed provider output,
 * empty responses, and provider errors without using unsafe parsing methods.
 * 
 * This module provides defensive parsing for AI provider responses that may be:
 * - Valid JSON objects/arrays
 * - Plain text responses
 * - Markdown-formatted content
 * - Malformed or partial JSON
 * - Empty or whitespace-only strings
 * - Error messages from providers
 */

export interface ParsedResponse {
  /** The successfully parsed content (string, object, or array) */
  content: string | Record<string, unknown> | unknown[];
  /** Whether the content was parsed as JSON */
  isJson: boolean;
  /** Whether the content appears to be an error message */
  isError: boolean;
  /** Original raw response for debugging */
  raw: string;
}

/**
 * Safely parse a response from an AI provider.
 * Never throws — always returns a ParsedResponse with appropriate flags.
 */
export function safeParseResponse(raw: unknown): ParsedResponse {
  // Handle null/undefined
  if (raw === null || raw === undefined) {
    return {
      content: '',
      isJson: false,
      isError: false,
      raw: String(raw),
    };
  }

  // Convert to string if not already
  const rawStr = typeof raw === 'string' ? raw : JSON.stringify(raw);
  const trimmed = rawStr.trim();

  // Handle empty responses
  if (!trimmed) {
    return {
      content: '',
      isJson: false,
      isError: false,
      raw: rawStr,
    };
  }

  // Check for common error patterns from providers.
  // These must be VERY strict to avoid false positives on legitimate AI responses.
  // Only match patterns that are unambiguously API error messages, never prose.
  // 
  // Key principle: AI responses often contain words like "error", "fail", "unavailable"
  // in normal conversation (e.g., "Error handling is important..."). We must NOT flag
  // these as errors. Only match exact API error response formats.
  const errorPatterns = [
    // Exact provider error prefixes — must be at start AND have specific format
    /^Error:\s*(?:API|Authentication|Rate limit|Invalid|Unauthorized|Forbidden)/i,
    /^API Error\b/i,
    /^Request failed:\s/i,
    /^Authentication failed\b/i,
    /^Rate limit(?:ed)?:\s/i,
    /^Quota exceeded\b/i,
    /^Invalid API key\b/i,
    /^401 Unauthorized\b/i,
    /^403 Forbidden\b/i,
    /^429 Too Many Requests\b/i,
  ];

  const looksLikeError = errorPatterns.some((pattern) => pattern.test(trimmed));

  // Try to parse as JSON first
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      
      // Check if parsed JSON contains an error field.
      // ONLY flag as error if it matches known API error response structures.
      // Many legitimate AI responses contain "error" in code examples or discussions.
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const obj = parsed as Record<string, unknown>;
        
        // Pattern 1: Standard API error format { error: "message" } or { error: { message: "..." } }
        // But ONLY if there are no other content fields (which would indicate a normal response)
        const hasContentFields = 'content' in obj || 'text' in obj || 'choices' in obj || 
                                 'candidates' in obj || 'answer' in obj || 'response' in obj;
        
        if (!hasContentFields && typeof obj.error === 'string' && obj.error.length > 0) {
          return {
            content: parsed,
            isJson: true,
            isError: true,
            raw: rawStr,
          };
        }
        
        // Pattern 2: Nested error object { error: { message: "...", type: "..." } }
        // Again, only if no content fields present
        if (!hasContentFields && obj.error && typeof obj.error === 'object') {
          const errObj = obj.error as Record<string, unknown>;
          if (typeof errObj.message === 'string' && (errObj.type || errObj.code)) {
            return {
              content: parsed,
              isJson: true,
              isError: true,
              raw: rawStr,
            };
          }
        }
      }

      return {
        content: parsed,
        isJson: true,
        isError: false,
        raw: rawStr,
      };
    } catch {
      // JSON parsing failed — fall through to text handling
    }
  }

  // Try to extract JSON from markdown code blocks
  const jsonCodeBlockMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (jsonCodeBlockMatch) {
    const jsonContent = jsonCodeBlockMatch[1].trim();
    if (jsonContent.startsWith('{') || jsonContent.startsWith('[')) {
      try {
        const parsed = JSON.parse(jsonContent);
        return {
          content: parsed,
          isJson: true,
          isError: false,
          raw: rawStr,
        };
      } catch {
        // Failed to parse extracted JSON — continue with text
      }
    }
  }

  // Return as plain text/markdown
  return {
    content: trimmed,
    isJson: false,
    isError: looksLikeError,
    raw: rawStr,
  };
}

/**
 * Extract meaningful text content from a parsed response.
 * Useful for displaying AI responses in the UI regardless of format.
 */
export function extractTextContent(parsed: ParsedResponse): string {
  if (typeof parsed.content === 'string') {
    return parsed.content;
  }

  if (Array.isArray(parsed.content)) {
    // If it's an array of strings, join them
    if (parsed.content.every((item) => typeof item === 'string')) {
      return parsed.content.join('\n');
    }
    // Otherwise stringify
    return JSON.stringify(parsed.content, null, 2);
  }

  if (parsed.content && typeof parsed.content === 'object') {
    const obj = parsed.content as Record<string, unknown>;
    
    // Common response patterns from AI providers
    if (typeof obj.text === 'string') return obj.text;
    if (typeof obj.content === 'string') return obj.content;
    if (typeof obj.response === 'string') return obj.response;
    if (typeof obj.answer === 'string') return obj.answer;
    if (typeof obj.result === 'string') return obj.result;
    if (typeof obj.output === 'string') return obj.output;
    
    // Array of content blocks (Anthropic style)
    if (Array.isArray(obj.content)) {
      const textBlocks = obj.content
        .filter((block: unknown) => block && typeof block === 'object' && (block as { type?: string }).type === 'text')
        .map((block: unknown) => (block as { text?: string }).text)
        .filter(Boolean);
      if (textBlocks.length > 0) {
        return textBlocks.join('\n');
      }
    }

    // Choices array (OpenAI style)
    if (Array.isArray(obj.choices)) {
      const firstChoice = obj.choices[0] as { message?: { content?: string } } | undefined;
      if (firstChoice?.message?.content) {
        return firstChoice.message.content;
      }
    }

    // Fallback: stringify the object
    return JSON.stringify(parsed.content, null, 2);
  }

  return String(parsed.content);
}

/**
 * Validate that a response contains usable content.
 * Returns true if the response has meaningful content to display.
 */
export function hasValidContent(parsed: ParsedResponse): boolean {
  if (parsed.isError) return false;
  
  const text = extractTextContent(parsed);
  return text.trim().length > 0;
}

/**
 * Sanitize AI output for safe display.
 * Removes potential injection attempts and normalizes formatting.
 */
export function sanitizeOutput(text: string): string {
  if (!text) return '';

  let sanitized = text;

  // Remove null bytes and control characters (except newlines, tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Normalize line endings
  sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Collapse excessive blank lines (more than 2 consecutive)
  sanitized = sanitized.replace(/\n{4,}/g, '\n\n\n');

  // Trim leading/trailing whitespace
  sanitized = sanitized.trim();

  return sanitized;
}
