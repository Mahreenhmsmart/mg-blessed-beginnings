import { Spinner } from '@/components/ui';

interface PageShellProps {
  /** Optional page heading shown immediately while the chunk loads. */
  title?: string;
}

/**
 * Lightweight Suspense fallback that renders inside the existing Layout.
 * Shows the real header/nav (already rendered by Layout) plus a centered
 * spinner in the main content area — never a full-screen dark skeleton.
 */
export default function PageShell({ title }: PageShellProps) {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
      role="status"
      aria-label={title ? `Loading ${title}` : 'Loading page'}
      data-icod-id="src_components_pageshell_tsx_root"
    >
      <Spinner size="lg" data-icod-id="src_components_pageshell_tsx_spinner" />
      {title && (
        <p
          className="text-sm font-medium text-muted-foreground animate-pulse"
          data-icod-id="src_components_pageshell_tsx_title"
        >
          Loading {title}…
        </p>
      )}
    </div>
  );
}
