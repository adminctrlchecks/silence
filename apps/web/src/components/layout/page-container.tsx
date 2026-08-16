import type { ElementType, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type PageContainerSize = 'narrow' | 'reading' | 'app' | 'wide' | 'full';
type PageContainerGutter = 'default' | 'admin';

const sizeClasses: Record<PageContainerSize, string> = {
  narrow: 'page-container-narrow',
  reading: 'page-container-reading',
  app: '',
  wide: 'page-container-wide',
  full: 'max-w-none',
};

export function PageContainer({
  as: Component = 'div',
  size = 'app',
  gutter = 'default',
  className,
  ...props
}: HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  size?: PageContainerSize;
  gutter?: PageContainerGutter;
}) {
  return (
    <Component
      className={cn(
        gutter === 'admin' ? 'page-container-admin' : 'page-container',
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
