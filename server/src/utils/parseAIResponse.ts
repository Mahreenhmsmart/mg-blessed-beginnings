/**
 * Safely parse an AI response that may be JSON or plain text.
 * Never throws — always returns a usable answer string.
 */
export function parseAIResponse(raw: string): { answer: string; structured: boolean } {
  if (!raw || typeof raw !== 'string') {
    return { answer: '', structured: false };
  }

  const trimmed = raw.trim();

  // Quick check: does it look like JSON?
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      // If the parsed object has an "answer" field, use it
      if (parsed && typeof parsed.answer === 'string') {
        return { answer: parsed.answer, structured: true };
      }
      // If it has a "response" field, use it
      if (parsed && typeof parsed.response === 'string') {
        return { answer: parsed.response, structured: true };
      }
      // If it has a "text" field, use it
      if (parsed && typeof parsed.text === 'string') {
        return { answer: parsed.text, structured: true };
      }
      // Otherwise return the raw text — don't stringify objects
      return { answer: raw, structured: false };
    } catch {
      // Not valid JSON — treat as plain text
      return { answer: raw, structured: false };
    }
  }

  return { answer: raw, structured: false };
}
