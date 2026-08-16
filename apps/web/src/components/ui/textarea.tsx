import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const textareaVariants = cva(
  'flex min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground disabled:opacity-80',
  {
    variants: {
      state: {
        default: 'border-border focus-visible:ring-ring',
        invalid: 'border-destructive focus-visible:ring-destructive',
        success: 'border-success focus-visible:ring-success',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  },
);

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
  VariantProps<typeof textareaVariants>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, state, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={state === 'invalid' || props['aria-invalid'] ? true : undefined}
      className={cn(textareaVariants({ state, className }))}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export { textareaVariants };
