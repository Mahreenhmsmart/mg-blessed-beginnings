import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, AlertCircle, RefreshCw, Sparkles, Trash2, Server, Wifi, WifiOff, Activity } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { sendChatbotMessage, getChatbotStatus, type ChatbotErrorCategory, type ChatbotStatusResponse } from '@/services/aiService';
import { cn } from '@/utils/cn';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  isFallback?: boolean;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi! 👋 I'm the MG AI Assistant. How can I help you today? Ask me about our AI tools, SEO services, courses, or consultations.",
};

const SUGGESTED_REPLIES = [
  'What services do you offer?',
  'Tell me about AI tools',
  'How to book a consultation?',
  'What courses are available?',
];

const MAX_MESSAGE_LENGTH = 2000;
const STORAGE_KEY = 'mg-chatbot-history';

// ─── Brand Colors (Dark Neon Purple Theme) ──────────────────────────────────────
// Using CSS custom properties for theme consistency
const BRAND_COLORS = {
  purple: 'rgb(var(--primary))',
  teal: 'rgb(var(--success))',
  pink: 'rgb(var(--accent))',
  gold: 'rgb(var(--warning))',
  white: 'rgb(var(--primary-foreground))',
  darkPurple: 'rgb(var(--card))',
  lightPurple: 'rgb(var(--surface))',
  textDark: 'rgb(var(--foreground))',
  textMuted: 'rgb(var(--muted-foreground))',
  border: 'rgb(var(--border))',
};

// ─── Simple Markdown Renderer ──────────────────────────────────────────────────
// Renders basic markdown without external dependencies
function renderMarkdown(text: string): React.ReactNode {
  // Split by double newlines for paragraphs
  const paragraphs = text.split(/\n\n+/);

  return paragraphs.map((paragraph, pIndex) => {
    // Handle code blocks
    if (paragraph.startsWith('```')) {
      const codeContent = paragraph.replace(/^```\w*\n?/, '').replace(/```$/, '');
      return (
        <pre
          key={pIndex}
          className="my-2 overflow-x-auto rounded-lg bg-secondary p-3 text-xs text-foreground"
          data-icod-id={`src_components_chatbot_tsx_11e2_${pIndex}`}>
          <code data-icod-id={`src_components_chatbot_tsx_3752_${pIndex}`}>{codeContent}</code>
        </pre>
      );
    }

    // Process inline formatting
    const processInline = (line: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      let remaining = line;
      let keyIndex = 0;

      while (remaining.length > 0) {
        // Bold **text** or __text__
        const boldMatch = remaining.match(/\*\*(.+?)\*\*|__(.+?)__/);
        if (boldMatch) {
          const before = remaining.slice(0, boldMatch.index);
          if (before) parts.push(<span
            key={keyIndex++}
            data-icod-id={`src_components_chatbot_tsx_ac11_${pIndex}`}>{before}</span>);
          parts.push(<strong
            key={keyIndex++}
            data-icod-id={`src_components_chatbot_tsx_a29d_${pIndex}`}>{boldMatch[1] || boldMatch[2]}</strong>);
          remaining = remaining.slice((boldMatch.index || 0) + boldMatch[0].length);
          continue;
        }

        // Italic *text* or _text_
        const italicMatch = remaining.match(/\*(.+?)\*|_(.+?)_/);
        if (italicMatch) {
          const before = remaining.slice(0, italicMatch.index);
          if (before) parts.push(<span
            key={keyIndex++}
            data-icod-id={`src_components_chatbot_tsx_3b0c_${pIndex}`}>{before}</span>);
          parts.push(<em
            key={keyIndex++}
            data-icod-id={`src_components_chatbot_tsx_5502_${pIndex}`}>{italicMatch[1] || italicMatch[2]}</em>);
          remaining = remaining.slice((italicMatch.index || 0) + italicMatch[0].length);
          continue;
        }

        // Inline code `text`
        const codeMatch = remaining.match(/`(.+?)`/);
        if (codeMatch) {
          const before = remaining.slice(0, codeMatch.index);
          if (before) parts.push(<span
            key={keyIndex++}
            data-icod-id={`src_components_chatbot_tsx_c1f0_${pIndex}`}>{before}</span>);
          parts.push(
            <code
              key={keyIndex++}
              className="rounded bg-secondary/50 px-1 py-0.5 text-xs font-mono text-primary-hover"
              data-icod-id={`src_components_chatbot_tsx_d73b_${pIndex}`}>
              {codeMatch[1]}
            </code>
          );
          remaining = remaining.slice((codeMatch.index || 0) + codeMatch[0].length);
          continue;
        }

        // Links [text](url)
        const linkMatch = remaining.match(/\[(.+?)\]\((.+?)\)/);
        if (linkMatch) {
          const before = remaining.slice(0, linkMatch.index);
          if (before) parts.push(<span
            key={keyIndex++}
            data-icod-id={`src_components_chatbot_tsx_f6bd_${pIndex}`}>{before}</span>);
          // Security fix: Only allow safe URL protocols to prevent javascript: XSS
          const href = linkMatch[2];
          const isSafeUrl = /^(https?:|mailto:|tel:)/i.test(href);
          parts.push(
            <a
              key={keyIndex++}
              href={isSafeUrl ? href : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary-hover text-primary"
              data-icod-id={`src_components_chatbot_tsx_a04d_${pIndex}`}>
              {linkMatch[1]}
            </a>
          );
          remaining = remaining.slice((linkMatch.index || 0) + linkMatch[0].length);
          continue;
        }

        // No more matches, add remaining text
        parts.push(<span
          key={keyIndex++}
          data-icod-id={`src_components_chatbot_tsx_a78d_${pIndex}`}>{remaining}</span>);
        break;
      }

      return parts;
    };

    // Handle lists
    const lines = paragraph.split('\n');
    const isList = lines.every((line) => /^[-*]\s/.test(line.trim()) || /^\d+\.\s/.test(line.trim()));

    if (isList) {
      const isOrdered = /^\d+\./.test(lines[0]?.trim() || '');
      const ListTag = isOrdered ? 'ol' : 'ul';
      return (
        <ListTag
          key={pIndex}
          className={`my-2 list-inside ${isOrdered ? 'list-decimal' : 'list-disc'} space-y-1`}
          data-icod-id={`src_components_chatbot_tsx_aaf4_${pIndex}`}>
          {lines.map((line, i) => (
            <li
              key={i}
              className="text-sm"
              data-icod-id={`src_components_chatbot_tsx_6d2f_${pIndex}_${i}`}>
              {processInline(line.replace(/^[-*]\s+|^\d+\.\s+/, ''))}
            </li>
          ))}
        </ListTag>
      );
    }

    // Regular paragraph with single newlines as <br />
    return (
      <p
        key={pIndex}
        className="mb-2 last:mb-0"
        data-icod-id={`src_components_chatbot_tsx_dd39_${pIndex}`}>
        {lines.map((line, i) => (
          <span key={i} data-icod-id={`src_components_chatbot_tsx_ecaa_${pIndex}_${i}`}>
            {processInline(line)}
            {i < lines.length - 1 && <br data-icod-id={`src_components_chatbot_tsx_de75_${pIndex}_${i}`} />}
          </span>
        ))}
      </p>
    );
  });
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Load from session storage on mount
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore parse errors
    }
    return [WELCOME_MESSAGE];
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCategory, setErrorCategory] = useState<ChatbotErrorCategory | null>(null);
  const [providerStatus, setProviderStatus] = useState<ChatbotStatusResponse | null>(null);
  const [connectionState, setConnectionState] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch provider status when chat opens
  useEffect(() => {
    if (isOpen && !providerStatus) {
      getChatbotStatus().then((status) => {
        setProviderStatus(status);
        setConnectionState(status.provider ? 'connected' : 'disconnected');
      }).catch(() => {
        setConnectionState('disconnected');
      });
    }
  }, [isOpen, providerStatus]);

  // Save messages to session storage when they change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Ignore storage errors (quota exceeded, etc.)
    }
  }, [messages]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    // Validate message length
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      setError(`Message must be ${MAX_MESSAGE_LENGTH} characters or less.`);
      setErrorCategory(null);
      return;
    }

    // Abort any in-flight request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    setErrorCategory(null);

    try {
      const response = await sendChatbotMessage(trimmed);

      // Check if request was aborted
      if (controller.signal.aborted) return;

      if (response.success && response.answer) {
        // Update connection state on successful response
        setConnectionState('connected');
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.answer,
          suggestions: response.suggestions,
          isFallback: response.isFallback,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        // Handle error from API with specific category-based messages
        const errorMessage = response.error || 'Unable to get a response. Please try again.';
        const category = response.errorCategory || 'unknown';

        // For all provider-related errors, show a softer inline assistant message
        // instead of the prominent red error card. The server returns these as
        // success:true with a fallback answer when possible.
        const softFallbackCategories: ChatbotErrorCategory[] = [
          'not_configured', 'all_unavailable', 'auth_failed',
          'rate_limited', 'invalid_model', 'timeout',
        ];
        if (softFallbackCategories.includes(category)) {
          setConnectionState('disconnected');
          const softMsg: ChatMessage = {
            id: `assistant-fallback-${Date.now()}`,
            role: 'assistant',
            content: errorMessage,
            isFallback: true,
          };
          setMessages((prev) => [...prev, softMsg]);
        } else {
          setConnectionState('disconnected');
          setError(errorMessage);
          setErrorCategory(category);
        }
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (controller.signal.aborted) return;

      setConnectionState('disconnected');
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      setErrorCategory('unknown');
    } finally {
      // Only update loading state if not aborted
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const retryLastMessage = () => {
    if (isLoading) return; // Prevent duplicate simultaneous requests
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      setError(null);
      setErrorCategory(null);
      sendMessage(lastUserMsg.content);
    }
  };

  const clearError = () => {
    setError(null);
    setErrorCategory(null);
  };

  const testConnection = useCallback(async () => {
    setConnectionState('checking');
    try {
      const status = await getChatbotStatus();
      setProviderStatus(status);
      setConnectionState(status.provider ? 'connected' : 'disconnected');
      if (status.provider) {
        // Send a quick test message to verify end-to-end connectivity
        const response = await sendChatbotMessage('hello');
        if (response.success) {
          setConnectionState('connected');
        } else {
          setConnectionState('disconnected');
        }
      }
    } catch {
      setConnectionState('disconnected');
    }
  }, []);

  const clearChat = () => {
    // Abort any in-flight request
    abortControllerRef.current?.abort();
    setMessages([WELCOME_MESSAGE]);
    setError(null);
    setErrorCategory(null);
    setIsLoading(false);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        className={cn(
          'fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full',
          'shadow-[0_4px_20px_rgba(109,0,217,0.35)]',
          'transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
          'hover:scale-110 hover:shadow-[0_6px_28px_rgba(109,0,217,0.45)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2',
          isOpen ? 'bg-accent rotate-90' : 'bg-primary',
        )}
        data-icod-id="src_components_chatbot_tsx_c352">
        {isOpen ? (
          <X className="h-6 w-6 text-primary-foreground" data-icod-id="src_components_chatbot_tsx_550e" />
        ) : (
          <span className="relative" data-icod-id="src_components_chatbot_tsx_f5cf">
            <MessageCircle className="h-6 w-6 text-primary-foreground" data-icod-id="src_components_chatbot_tsx_d464" />
            <span
              className="absolute -right-1 -top-1 flex h-3 w-3"
              data-icod-id="src_components_chatbot_tsx_80bd">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"
                data-icod-id="src_components_chatbot_tsx_540b" />
              <span
                className="relative inline-flex rounded-full h-3 w-3 bg-warning"
                data-icod-id="src_components_chatbot_tsx_254c" />
            </span>
          </span>
        )}
      </button>
      {/* ── Chat Panel ── */}
      <div
        className={cn(
          'fixed bottom-24 right-6 z-[60] flex flex-col overflow-hidden rounded-xl bg-card',
          'border border-border shadow-[0_12px_40px_rgba(109,0,217,0.15)]',
          'transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right',
          'w-[calc(100vw-2rem)] max-w-[380px] h-[500px]',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none',
        )}
        data-icod-id="src_components_chatbot_tsx_b2cb">
        {/* ── Header ── */}
        <div
          className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-primary to-accent px-4 py-3.5"
          data-icod-id="src_components_chatbot_tsx_46ca">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/20 text-primary-foreground shadow-[0_2px_8px_rgba(0,0,0,0.1)] backdrop-blur-sm"
            data-icod-id="src_components_chatbot_tsx_5949">
            <Sparkles className="h-5 w-5" data-icod-id="src_components_chatbot_tsx_fc19" />
          </div>
          <div className="flex-1" data-icod-id="src_components_chatbot_tsx_8b9d">
            <h3
              className="text-base font-semibold text-primary-foreground leading-tight"
              data-icod-id="src_components_chatbot_tsx_e0b2">MG AI Assistant</h3>
            <p
              className="text-xs text-primary-foreground/80"
              data-icod-id="src_components_chatbot_tsx_3eb9">Ask anything about our services</p>
          </div>
          {messages.length > 1 && (
            <button
              onClick={clearChat}
              className="rounded-lg p-1.5 text-primary-foreground/80 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
              aria-label="Clear chat"
              title="Clear conversation"
              data-icod-id="src_components_chatbot_tsx_clear">
              <Trash2 className="h-4 w-4" data-icod-id="src_components_chatbot_tsx_trash" />
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-primary-foreground/80 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
            aria-label="Close chat"
            data-icod-id="src_components_chatbot_tsx_5d5e">
            <X className="h-4 w-4" data-icod-id="src_components_chatbot_tsx_ca60" />
          </button>
        </div>

        {/* ── Provider Status Banner ── */}
        {providerStatus && (
          <div
            className={cn(
              'flex items-center justify-between border-b border-border px-4 py-1.5 text-[10px]',
              connectionState === 'connected' ? 'bg-success/5 text-muted-foreground' :
              connectionState === 'checking' ? 'bg-warning/10 text-warning' :
              'bg-destructive/5 text-destructive',
            )}
            data-icod-id="src_components_chatbot_tsx_provider_banner">
            <div className="flex items-center gap-2" data-icod-id="src_components_chatbot_tsx_status_left">
              {connectionState === 'connected' ? (
                <Wifi className="h-3 w-3 shrink-0 text-success" data-icod-id="src_components_chatbot_tsx_wifi_on" />
              ) : connectionState === 'checking' ? (
                <Activity className="h-3 w-3 shrink-0 animate-pulse text-warning" data-icod-id="src_components_chatbot_tsx_wifi_check" />
              ) : (
                <WifiOff className="h-3 w-3 shrink-0 text-destructive" data-icod-id="src_components_chatbot_tsx_wifi_off" />
              )}
              {providerStatus.provider ? (
                <span data-icod-id="src_components_chatbot_tsx_f65c">
                  AI:{' '}
                  <strong
                    className="text-foreground"
                    data-icod-id="src_components_chatbot_tsx_78ae">{providerStatus.provider}</strong>
                  {' / '}
                  <code
                    className="font-mono text-foreground"
                    data-icod-id="src_components_chatbot_tsx_8b50">{providerStatus.model}</code>
                </span>
              ) : (
                <span data-icod-id="src_components_chatbot_tsx_a01e">No AI provider configured</span>
              )}
            </div>
            <button
              onClick={testConnection}
              disabled={connectionState === 'checking'}
              className={cn(
                'text-[10px] underline-offset-2 hover:underline transition-colors',
                connectionState === 'checking' ? 'opacity-50 cursor-wait' : 'cursor-pointer',
              )}
              data-icod-id="src_components_chatbot_tsx_test_conn">
              {connectionState === 'checking' ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        )}

        {/* ── Messages Area ── */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-background"
          data-icod-id="src_components_chatbot_tsx_5007">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex w-full animate-fade-in-up',
                msg.role === 'user' ? 'justify-end' : 'justify-start',
              )}
              data-icod-id={`src_components_chatbot_tsx_e434_${msg.id}`}>
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md shadow-[0_2px_8px_rgba(109,0,217,0.25)]'
                    : 'bg-secondary text-foreground rounded-bl-md border border-border shadow-[0_1px_3px_rgba(0,0,0,0.2)]',
                )}
                data-icod-id={`src_components_chatbot_tsx_270c_${msg.id}`}>
                {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div
              className="flex justify-start animate-fade-in-up"
              data-icod-id="src_components_chatbot_tsx_5314">
              <div
                className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-secondary border border-border px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
                data-icod-id="src_components_chatbot_tsx_07cb">
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-primary/50"
                  style={{ animationDelay: '0ms' }}
                  data-icod-id="src_components_chatbot_tsx_7640" />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-accent/50"
                  style={{ animationDelay: '150ms' }}
                  data-icod-id="src_components_chatbot_tsx_c808" />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-warning/50"
                  style={{ animationDelay: '300ms' }}
                  data-icod-id="src_components_chatbot_tsx_70da" />
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div
              className="flex flex-col items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-center animate-fade-in-up"
              data-icod-id="src_components_chatbot_tsx_a2cb">
              <AlertCircle
                className={cn(
                  'h-6 w-6',
                  errorCategory === 'rate_limited' ? 'text-warning' :
                  errorCategory === 'timeout' ? 'text-warning' :
                  'text-destructive',
                )}
                data-icod-id="src_components_chatbot_tsx_5f6b" />
              <p
                className="text-sm text-destructive font-medium"
                data-icod-id="src_components_chatbot_tsx_8d55">{error}</p>
              <div
                className="flex gap-2 mt-1"
                data-icod-id="src_components_chatbot_tsx_532c">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={retryLastMessage}
                  disabled={isLoading}
                  className="text-xs text-destructive hover:bg-destructive/20 hover:text-destructive"
                  data-icod-id="src_components_chatbot_tsx_c6bd">
                  {isLoading ? (
                    <span
                      className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-destructive/30 border-t-destructive"
                      data-icod-id="src_components_chatbot_tsx_98f9" />
                  ) : (
                    <RefreshCw className="mr-1 h-3 w-3" data-icod-id="src_components_chatbot_tsx_1fea" />
                  )}
                  Retry
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { clearError(); testConnection(); }}
                  className="text-xs text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                  data-icod-id="src_components_chatbot_tsx_test_err">
                  <Wifi className="mr-1 h-3 w-3" data-icod-id="src_components_chatbot_tsx_wifi_test" />
                  Test Connection
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="text-xs text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                  data-icod-id="src_components_chatbot_tsx_dismiss">
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} data-icod-id="src_components_chatbot_tsx_07f2" />
        </div>

        {/* ── Suggested Replies (only show when welcome is the only message) ── */}
        {messages.length === 1 && !isLoading && !error && (
          <div
            className="flex flex-wrap gap-2 px-4 pb-2 animate-fade-in-up bg-background"
            data-icod-id="src_components_chatbot_tsx_ca53">
            {SUGGESTED_REPLIES.map((suggestion, index) => {
              const colors = [BRAND_COLORS.purple, BRAND_COLORS.teal, BRAND_COLORS.pink, BRAND_COLORS.gold];
              const color = colors[index % colors.length];
              return (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all duration-[300ms] hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  style={{
                    borderColor: `${color.replace('rgb(', 'rgba(').replace(')', ', 0.19)')}`,
                    backgroundColor: 'rgb(var(--surface))',
                    color: color,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${color.replace('rgb(', 'rgba(').replace(')', ', 0.13)')}`;
                    e.currentTarget.style.borderColor = color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgb(var(--surface))';
                    e.currentTarget.style.borderColor = `${color.replace('rgb(', 'rgba(').replace(')', ', 0.19)')}`;
                  }}
                  data-icod-id={`src_components_chatbot_tsx_9cbb_${suggestion}`}>
                  {suggestion}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Character Count ── */}
        {inputValue.length > 0 && (
          <div
            className="px-4 py-1 text-right text-xs text-muted-foreground/60 bg-background"
            data-icod-id="src_components_chatbot_tsx_cc03">
            {inputValue.length}/{MAX_MESSAGE_LENGTH}
          </div>
        )}

        {/* ── Input Area ── */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-border bg-card px-4 py-3"
          data-icod-id="src_components_chatbot_tsx_1520">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                setInputValue(e.target.value);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            maxLength={MAX_MESSAGE_LENGTH}
            className="h-10 rounded-full border-border text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary/20 bg-secondary text-foreground"
            data-icod-id="src_components_chatbot_tsx_d2b0" />
          <Button
            type="submit"
            variant="primary"
            size="icon"
            disabled={!inputValue.trim() || isLoading}
            className="shrink-0 rounded-full bg-primary hover:bg-primary-hover shadow-[0_2px_8px_rgba(109,0,217,0.3)]"
            data-icod-id="src_components_chatbot_tsx_bfa4">
            {isLoading ? (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
                data-icod-id="src_components_chatbot_tsx_42bf" />
            ) : (
              <Send className="h-4 w-4" data-icod-id="src_components_chatbot_tsx_26c5" />
            )}
          </Button>
        </form>
      </div>
    </>
  );
}
