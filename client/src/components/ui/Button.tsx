import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/cn';
import Spinner from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'premium' | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const base =
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  'disabled:pointer-events-none disabled:opacity-50 ' +
  'active:scale-[0.98] hover:-translate-y-0.5 ' +
  'data-[loading=true]:cursor-wait data-[loading=true]:opacity-80 ' +
  'tracking-wide';

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'text-primary-foreground rounded-xl shadow-[0_6px_20px_rgba(157,106,255,0.6)] hover:shadow-[0_12px_32px_rgba(157,106,255,0.8),0_0_28px_rgba(0,212,245,0.4)] ' +
    'hover:brightness-110 font-bold text-base',
  secondary:
    'bg-secondary text-secondary-foreground border border-border rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_24px_rgba(157,106,255,0.4)] ' +
    'hover:bg-secondary-hover hover:border-primary/60 font-semibold',
  outline: 'border-2 border-primary/60 bg-transparent text-foreground hover:bg-primary/15 hover:border-primary/90 rounded-xl hover:shadow-[0_6px_24px_rgba(157,106,255,0.4)] font-bold',
  ghost: 'text-muted-foreground hover:bg-primary/15 hover:text-foreground rounded-xl font-medium',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl shadow-[0_4px_12px_rgba(255,85,85,0.5)] font-bold',
  premium:
    'text-white rounded-xl shadow-[0_6px_28px_rgba(157,106,255,0.7)] hover:shadow-[0_12px_40px_rgba(157,106,255,0.9),0_0_40px_rgba(0,212,245,0.5)] ' +
    'hover:brightness-110 font-extrabold tracking-wider text-base',
  glass: 
    'bg-surface/90 backdrop-blur-lg border border-border/80 text-foreground rounded-xl ' +
    'shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:bg-surface-elevated hover:shadow-[0_8px_24px_rgba(157,106,255,0.4)] hover:border-primary/50 font-semibold',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-6 text-base',
  lg: 'h-14 px-8 text-lg',
  icon: 'h-11 w-11 p-0',
};

/**
 * The Button look as a class string — for an element that must stay an <a> or a
 * react-router <Link>:
 *   <Link to="/signup" className={buttonClass({ size: 'sm' })}>Sign up</Link>
 */
export function buttonClass(
  opts: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {},
): string {
  const { variant = 'primary', size = 'md', className } = opts;
  return cn(base, variantClass[variant], sizeClass[size], className);
}

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and disables the button. */
  loading?: boolean;
}

/** Every clickable action in the app. An icon-only button is size="icon". */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, style, ...rest },
  ref,
) {
  // Apply gradient backgrounds via inline styles for primary, secondary, and premium variants
  const getGradientStyle = (): React.CSSProperties => {
    const baseStyle = style || {};
    if (variant === 'primary') {
      return {
        background: 'var(--gradient-signature)',
        textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        ...baseStyle,
      };
    }
    if (variant === 'secondary') {
      return {
        ...baseStyle,
      };
    }
    if (variant === 'premium') {
      return {
        background: 'var(--gradient-brand)',
        textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        ...baseStyle,
      };
    }
    return baseStyle;
  };

  return (
    <button
      ref={ref}
      className={buttonClass({ variant, size, className })}
      disabled={disabled || loading}
      data-loading={loading || undefined}
      style={getGradientStyle()}
      data-icod-id="src_components_ui_button_tsx_8c41"
      {...rest}>
      <span
        className={`inline-flex items-center gap-2 transition-all duration-300 ${
          loading ? 'opacity-0 scale-95 absolute' : 'opacity-100 scale-100 relative'
        }`}
        data-icod-id="src_components_ui_button_tsx_content">
        {children}
      </span>
      {loading && (
        <span
          className="inline-flex items-center gap-2 animate-fade-in-btn"
          data-icod-id="src_components_ui_button_tsx_loading_wrap">
          <Spinner
            size="sm"
            className="border-current border-t-transparent"
            data-icod-id="src_components_ui_button_tsx_56c6" />
          <span
            className="text-base font-semibold"
            data-icod-id="src_components_ui_button_tsx_f8d5">Loading...</span>
        </span>
      )}
      {/* Inline style for button fade-in animation */}
      {loading && (
        <style data-icod-id="src_components_ui_button_tsx_9490">{`
          @keyframes fade-in-btn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in-btn {
            animation: fade-in-btn 0.2s ease-out both;
          }
        `}</style>
      )}
    </button>
  );
});

export default Button;
