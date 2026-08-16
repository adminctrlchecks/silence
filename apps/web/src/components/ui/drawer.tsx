'use client';

import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useOverlayFocus } from './use-overlay-focus';

type DrawerSide = 'start' | 'end' | 'left' | 'right' | 'bottom';

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  side = 'end',
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  side?: DrawerSide;
  className?: string;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDir(document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr');
  }, []);

  useOverlayFocus({ open, onOpenChange, panelRef });

  if (!mounted || !open) return null;

  const resolvedSide = side === 'start' ? (dir === 'rtl' ? 'right' : 'left') : side === 'end' ? (dir === 'rtl' ? 'left' : 'right') : side;

  return createPortal(
    <div className="fixed inset-0 z-modal" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/45"
        aria-label="Close drawer"
        onClick={() => onOpenChange(false)}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'absolute flex flex-col border border-border bg-elevated p-5 shadow-popover outline-none',
          resolvedSide === 'left' && 'bottom-0 left-0 top-0 w-[calc(100vw-2rem)] max-w-sm rounded-r-lg',
          resolvedSide === 'right' && 'bottom-0 right-0 top-0 w-[calc(100vw-2rem)] max-w-sm rounded-l-lg',
          resolvedSide === 'bottom' && 'inset-x-0 bottom-0 max-h-[85svh] rounded-t-lg',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-foreground">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <Button type="button" variant="ghost" size="iconSm" aria-label="Close drawer" onClick={() => onOpenChange(false)}>
            <X aria-hidden />
          </Button>
        </div>
        {children ? <div className="mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div> : null}
        {footer ? <div className="mt-6 border-t border-border pt-4">{footer}</div> : null}
      </aside>
    </div>,
    document.body,
  );
}
