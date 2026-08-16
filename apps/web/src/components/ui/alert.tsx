import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

const alertStyles = {
  info: 'border-info/30 bg-info-background text-info',
  success: 'border-success/30 bg-success-background text-success',
  warning: 'border-warning/30 bg-warning-background text-warning',
  error: 'border-destructive/30 bg-destructive-background text-destructive',
};

const alertIcons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertTriangle,
};

export function Alert({
  variant = 'info',
  title,
  children,
  action,
  className,
}: {
  variant?: keyof typeof alertStyles;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const Icon = alertIcons[variant];

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn('rounded-md border p-4', alertStyles[variant], className)}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{title}</p>
          {children ? <div className="mt-1 text-sm leading-6 text-foreground/85">{children}</div> : null}
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
