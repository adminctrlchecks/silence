import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const selectVariants = cva(
  'h-10 w-full appearance-none rounded-md border bg-background px-3 pe-9 text-sm outline-none transition-colors focus-visible:ring-2 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground disabled:opacity-80',
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

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> &
  VariantProps<typeof selectVariants>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, state, ...props }, ref) => (
    <span className="relative block">
      <select
        ref={ref}
        aria-invalid={state === 'invalid' || props['aria-invalid'] ? true : undefined}
        className={cn(selectVariants({ state, className }))}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </span>
  ),
);
Select.displayName = 'Select';

export { selectVariants };
