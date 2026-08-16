import * as React from 'react';
import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const linkVariants = cva(
  'outline-none transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  {
    variants: {
      variant: {
        default: 'font-medium text-primary underline-offset-4 hover:underline',
        subdued: 'text-muted-foreground hover:text-foreground',
        nav: 'text-sm font-semibold text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type LinkProps = NextLinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps> &
  VariantProps<typeof linkVariants>;

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, ...props }, ref) => (
    <NextLink ref={ref} className={cn(linkVariants({ variant, className }))} {...props} />
  ),
);
Link.displayName = 'Link';

export { linkVariants };
