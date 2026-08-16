import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground disabled:opacity-80',
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

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputVariants>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, state, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    aria-invalid={state === 'invalid' || props['aria-invalid'] ? true : undefined}
    className={cn(inputVariants({ state, className }))}
    {...props}
  />
));
Input.displayName = 'Input';

export { inputVariants };
