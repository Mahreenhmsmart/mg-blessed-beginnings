import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/cn';

/**
 * The form-control look as a class string. Use it directly on <textarea> and
 * <select>; use <Input> for <input>.
 *   <textarea className={inputClass('min-h-24 resize-none')} />
 *   <select className={inputClass()} />
 */
export function inputClass(className?: string): string {
  return cn(
    'w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground',
    'placeholder:text-muted transition-all duration-[250ms] ease-in-out',
    'focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40 focus:shadow-[0_0_0_3px_rgba(199,154,255,0.2)]',
    'disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted disabled:opacity-60',
    'min-h-[44px]',
    className,
  );
}

export type InputProps = ComponentPropsWithoutRef<'input'>;

/** Every <input> in the app. Wrap it in <Field> to get a label and error text. */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={inputClass(className)}
      data-icod-id="src_components_ui_input_tsx_4e5d"
      {...rest} />
  );
});

export default Input;
