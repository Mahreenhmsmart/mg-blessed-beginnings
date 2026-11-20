import { MessageCircle } from 'lucide-react';

/**
 * Floating Action Buttons — two stacked circular chat widget buttons
 * positioned at the bottom-right corner of the viewport.
 *
 * Top button: bright green (#22C55E) with white chat bubble icon.
 * Bottom button: bright purple (#9333EA) with white chat bubble icon
 * and a small yellow (#FACC15) notification dot badge.
 */
export default function FloatingChatButtons() {
  return (
    <div
      className="fixed bottom-6 right-6 z-[90] flex flex-col gap-3"
      data-icod-id="src_components_floatingchatbuttons_tsx_root">
      {/* Green chat FAB */}
      <button
        type="button"
        aria-label="Open chat"
        className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background bg-success"
        style={{ boxShadow: 'var(--shadow-glow-sm)' }}
        data-icod-id="src_components_floatingchatbuttons_tsx_green">
        <MessageCircle className="h-6 w-6 text-primary-foreground" data-icod-id="src_components_floatingchatbuttons_tsx_green_icon" />
      </button>

      {/* Purple chat FAB with yellow notification dot */}
      <button
        type="button"
        aria-label="Open support chat"
        className="relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background bg-primary-hover"
        style={{ boxShadow: '0 4px 14px rgb(var(--primary-hover) / 0.4)' }}
        data-icod-id="src_components_floatingchatbuttons_tsx_purple">
        <MessageCircle className="h-6 w-6 text-primary-foreground" data-icod-id="src_components_floatingchatbuttons_tsx_purple_icon" />
        {/* Yellow notification dot badge */}
        <span
          className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-background bg-warning"
          aria-hidden="true"
          data-icod-id="src_components_floatingchatbuttons_tsx_badge" />
      </button>
    </div>
  );
}
