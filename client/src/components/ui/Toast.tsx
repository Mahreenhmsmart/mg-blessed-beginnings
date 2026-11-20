import { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: (id: string) => void;
}

const variantStyles: Record<ToastVariant, { bg: string; icon: React.ElementType }> = {
  success: { bg: 'bg-success', icon: CheckCircle },
  error: { bg: 'bg-destructive', icon: AlertCircle },
  info: { bg: 'bg-primary', icon: Info },
};

/**
 * Fixed top-right notification with auto-dismiss.
 * Use with toast state management for form submission feedback.
 */
export default function Toast({
  id,
  message,
  variant = 'info',
  duration = 4000,
  onClose,
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  const { bg, icon: Icon } = variantStyles[variant];

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg backdrop-blur-md',
        'bg-background/95 border border-border/50',
        isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right',
      )}
      data-icod-id="src_components_ui_toast_tsx_2f16">
      <div
        className={cn('flex h-6 w-6 items-center justify-center rounded-full text-white', bg)}
        data-icod-id="src_components_ui_toast_tsx_863e">
        <Icon className="h-4 w-4" data-icod-id="src_components_ui_toast_tsx_04e8" />
      </div>
      <p
        className="text-sm font-medium text-foreground"
        data-icod-id="src_components_ui_toast_tsx_50a2">{message}</p>
      <button
        onClick={handleClose}
        className="ml-auto p-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
        data-icod-id="src_components_ui_toast_tsx_fa1e">
        <X className="h-4 w-4" data-icod-id="src_components_ui_toast_tsx_6ec6" />
      </button>
    </div>
  );
}
