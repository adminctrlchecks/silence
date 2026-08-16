'use client';

import { AlertTriangle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ToastVariant = 'info' | 'success' | 'warning' | 'error';

type ToastInput = {
  title: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
  duration?: number;
  action?: ReactNode;
};

type ToastItem = ToastInput & {
  id: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastVariant, string> = {
  info: 'border-info/30 bg-info-background text-info',
  success: 'border-success/30 bg-success-background text-success',
  warning: 'border-warning/30 bg-warning-background text-warning',
  error: 'border-destructive/30 bg-destructive-background text-destructive',
};

const toastIcons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertTriangle,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutRefs = useRef(new Map<string, number>());

  const dismissToast = useCallback((id: string) => {
    const timeout = timeoutRefs.current.get(id);
    if (timeout) window.clearTimeout(timeout);
    timeoutRefs.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    ({ variant = 'info', duration = 5000, ...input }: ToastInput) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { ...input, id, variant, duration }]);

      if (duration > 0) {
        const timeout = window.setTimeout(() => dismissToast(id), duration);
        timeoutRefs.current.set(id, timeout);
      }

      return id;
    },
    [dismissToast],
  );

  const contextValue = useMemo(() => ({ toast, dismissToast }), [dismissToast, toast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ol
        className="fixed bottom-4 right-4 z-toast flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3 rtl:left-4 rtl:right-auto"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {toasts.map((item) => {
          const Icon = toastIcons[item.variant];
          return (
            <li
              key={item.id}
              role={item.variant === 'error' ? 'alert' : 'status'}
              className={cn('rounded-md border p-4 shadow-popover', toastStyles[item.variant])}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  {item.description ? (
                    <div className="mt-1 text-sm leading-6 text-foreground/85">{item.description}</div>
                  ) : null}
                  {item.action ? <div className="mt-3">{item.action}</div> : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="iconSm"
                  aria-label="Dismiss notification"
                  onClick={() => dismissToast(item.id)}
                >
                  <X aria-hidden />
                </Button>
              </div>
            </li>
          );
        })}
      </ol>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
