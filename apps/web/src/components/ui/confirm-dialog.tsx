'use client';

import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

/**
 * Confirmation dialog replacing `window.confirm()` for destructive admin
 * actions (docs/product-redesign/14-page-specifications.md §11 "Delete").
 * Native confirm() can't be styled, doesn't match the app's focus-trap/RTL
 * behavior, and is disabled/auto-dismissed by some browsers.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  pending,
  variant = 'destructive',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  pending?: boolean;
  variant?: ButtonProps['variant'];
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={variant} onClick={onConfirm} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : null}
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
