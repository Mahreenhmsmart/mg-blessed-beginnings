import { Component, type ErrorInfo, type ReactNode } from 'react';

// ── Chunk-error detection ────────────────────────────────────────────────────────
const CHUNK_ERROR_RE = /Loading chunk \d+ failed|Loading CSS chunk|Failed to fetch dynamically imported module/i;
const MAX_CHUNK_RELOADS = 3;
const RELOAD_COUNT_KEY = '__chunk_reload_count__';

function isChunkError(error: unknown): boolean {
  if (error instanceof Error) return CHUNK_ERROR_RE.test(error.message);
  if (typeof error === 'string') return CHUNK_ERROR_RE.test(error);
  return false;
}

function getReloadCount(): number {
  try {
    return Number(sessionStorage.getItem(RELOAD_COUNT_KEY)) || 0;
  } catch {
    return 0;
  }
}

function setReloadCount(n: number): void {
  try {
    sessionStorage.setItem(RELOAD_COUNT_KEY, String(n));
  } catch {
    // sessionStorage may be unavailable
  }
}

async function clearAllCaches(): Promise<void> {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
    }
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));
    }
  } catch {
    // Best-effort
  }
}

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isChunkError: boolean;
  recovering: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, isChunkError: false, recovering: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const chunkErr = isChunkError(error);
    return { hasError: true, error, isChunkError: chunkErr };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);

    // Auto-recover from stale-chunk errors
    if (isChunkError(error)) {
      const count = getReloadCount();
      if (count < MAX_CHUNK_RELOADS) {
        setReloadCount(count + 1);
        console.warn(
          `[ErrorBoundary] Stale chunk detected (reload ${count + 1}/${MAX_CHUNK_RELOADS}). Clearing caches and reloading…`,
        );
        this.setState({ recovering: true });
        clearAllCaches().then(() => {
          window.location.reload();
        });
        return;
      }
      console.error(
        '[ErrorBoundary] Max chunk reload attempts reached. Showing manual recovery UI.',
      );
    }

    // Reset reload counter on non-chunk errors so future chunk errors start fresh
    if (!isChunkError(error)) {
      setReloadCount(0);
    }
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    // When we transition from error → recovered, clear the retry counter
    // so future errors start with a clean slate.
    if (prevState.hasError && !this.state.hasError) {
      try { sessionStorage.removeItem('__eb_retry_count__'); } catch { /* ignore */ }
    }
  }

  /**
   * Reset the error boundary state to allow re-rendering of children.
   * This properly clears the error state so React will attempt to render
   * the children again instead of keeping the error UI.
   */
  handleRetry = () => {
    const retryKey = '__eb_retry_count__';
    let retries = 0;
    try {
      retries = Number(sessionStorage.getItem(retryKey)) || 0;
    } catch { /* ignore */ }

    if (retries >= 2) {
      // In-place reset hasn't worked after 2 attempts — do a full reload
      try { sessionStorage.removeItem(retryKey); } catch { /* ignore */ }
      this.handleHardRefresh();
      return;
    }

    try { sessionStorage.setItem(retryKey, String(retries + 1)); } catch { /* ignore */ }
    setReloadCount(0);
    
    // Reset error state - this will cause React to re-render children
    this.setState({ 
      hasError: false, 
      error: null, 
      isChunkError: false, 
      recovering: false 
    });
  };

  handleHardRefresh = async () => {
    setReloadCount(0);
    try { sessionStorage.removeItem('__eb_retry_count__'); } catch { /* ignore */ }
    await clearAllCaches();
    window.location.reload();
  };

  render() {
    if (this.state.recovering) {
      return (
        <div
          role="status"
          className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center font-body"
          data-icod-id="src_components_errorboundary_tsx_recovering">
          <div
            className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
            data-icod-id="src_components_errorboundary_tsx_f146" />
          <h2
            className="mb-2 text-lg font-semibold text-foreground"
            data-icod-id="src_components_errorboundary_tsx_813d">App update available</h2>
          <p
            className="text-sm text-muted-foreground"
            data-icod-id="src_components_errorboundary_tsx_84e6">Loading the latest version…</p>
        </div>
      );
    }

    if (this.state.hasError) {
      const isChunk = this.state.isChunkError;

      return (
        <div
          role="alert"
          className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center font-body"
          data-icod-id="src_components_errorboundary_tsx_289c">
          {/* Icon */}
          <div
            className="mb-6"
            data-icod-id="src_components_errorboundary_tsx_4806">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgb(var(--primary))"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              data-icod-id="src_components_errorboundary_tsx_9f28">
              <circle
                cx="12"
                cy="12"
                r="10"
                data-icod-id="src_components_errorboundary_tsx_94a7" />
              <line
                x1="12"
                y1="8"
                x2="12"
                y2="12"
                data-icod-id="src_components_errorboundary_tsx_04c3" />
              <line
                x1="12"
                y1="16"
                x2="12.01"
                y2="16"
                data-icod-id="src_components_errorboundary_tsx_9558" />
            </svg>
          </div>
          <h1
            className="mb-3 text-[1.75rem] font-bold text-foreground"
            data-icod-id="src_components_errorboundary_tsx_4720">
            {isChunk ? 'App update available' : 'Something went wrong'}
          </h1>
          <p
            className="mb-6 max-w-md leading-relaxed text-muted-foreground"
            data-icod-id="src_components_errorboundary_tsx_f6bc">
            {isChunk
              ? 'A new version of the app has been released. Please refresh to load the latest version.'
              : 'We encountered an unexpected error. This is usually temporary. Try refreshing or going back to the home page.'}
          </p>
          {this.state.error && !isChunk && (
            <pre
              className="mb-6 max-w-lg overflow-auto rounded-xl border border-border bg-card p-4 text-left text-xs text-destructive"
              data-icod-id="src_components_errorboundary_tsx_212b">
              {this.state.error.message}
            </pre>
          )}
          <div
            className="flex flex-wrap items-center justify-center gap-3"
            data-icod-id="src_components_errorboundary_tsx_e5bd">
            {isChunk ? (
              <>
                <button
                  onClick={this.handleHardRefresh}
                  className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                  data-icod-id="src_components_errorboundary_tsx_update_btn">
                  Load Latest Version
                </button>
                <a
                  href="/"
                  className="inline-flex items-center rounded-xl border-2 border-primary px-8 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                  data-icod-id="src_components_errorboundary_tsx_home_link">
                  Go Home
                </a>
              </>
            ) : (
              <>
                <button
                  onClick={this.handleRetry}
                  className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                  data-icod-id="src_components_errorboundary_tsx_retry">
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-xl border-2 border-primary bg-transparent px-8 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                  data-icod-id="src_components_errorboundary_tsx_e9ea">
                  Refresh Page
                </button>
                <a
                  href="/"
                  className="inline-flex items-center rounded-xl px-8 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  data-icod-id="src_components_errorboundary_tsx_9487">
                  Go Home
                </a>
              </>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
