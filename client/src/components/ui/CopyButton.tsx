import { useState, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { Copy, Check } from 'lucide-react';
import Button from './Button';

export interface CopyButtonProps {
  text: string;
  className?: string;
  onCopy?: () => void;
  label?: string;
}

/**
 * Copies text to clipboard and shows checkmark feedback.
 * Useful for sharing links or copying code snippets.
 */
export default function CopyButton({
  text,
  className,
  onCopy,
  label = 'Copy',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [text, onCopy]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={cn('gap-1.5', className)}
      aria-label={copied ? 'Copied' : label}
      data-icod-id="src_components_ui_copybutton_tsx_64b1">
      {copied ? (
        <>
          <Check
            className="h-4 w-4 text-success"
            data-icod-id="src_components_ui_copybutton_tsx_eaf2" />
          <span
            className="text-success"
            data-icod-id="src_components_ui_copybutton_tsx_3a90">Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" data-icod-id="src_components_ui_copybutton_tsx_d5fb" />
          <span data-icod-id="src_components_ui_copybutton_tsx_7e43">{label}</span>
        </>
      )}
    </Button>
  );
}
