import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface FieldProps {
  label: string;
  /** id of the control inside — set the same value as the control's `id`. */
  htmlFor?: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

/** Label + control + validation message. Wrap every form control in one. */
export default function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: FieldProps) {
  return (
    <div
      className={cn('flex flex-col gap-2', className)}
      data-icod-id="src_components_ui_field_tsx_8877">
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        data-icod-id="src_components_ui_field_tsx_047a">
        {label}
        {required && <span
          className="ml-0.5 text-destructive"
          data-icod-id="src_components_ui_field_tsx_d20e">*</span>}
      </label>
      {children}
      {hint && !error && <p
        className="text-xs text-muted-foreground"
        data-icod-id="src_components_ui_field_tsx_4cb4">{hint}</p>}
      {error && (
        <p
          className="flex items-center gap-1 text-xs font-medium text-destructive"
          data-icod-id="src_components_ui_field_tsx_c042">
          <span
            className="inline-block h-1 w-1 rounded-full bg-destructive"
            data-icod-id="src_components_ui_field_tsx_b976" />
          {error}
        </p>
      )}
    </div>
  );
}
