import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type JourneyStageStatus = 'done' | 'current' | 'upcoming';

export interface JourneyStage {
  key: string;
  label: string;
  status: JourneyStageStatus;
}

/**
 * The Profile -> Questions -> Chart -> Remedy -> Complete tracker from
 * docs/product-redesign/16-dashboard-specification.md §6.3/§10. Status is
 * conveyed by icon + text label together (never color alone) per §15.
 * Horizontally scrollable on narrow viewports per §14 rather than wrapping
 * or shrinking illegibly.
 */
export function JourneyTracker({ stages }: { stages: JourneyStage[] }) {
  return (
    <ol className="flex items-center gap-1 overflow-x-auto pb-1 sm:gap-2">
      {stages.map((stage, index) => (
        <li key={stage.key} className="flex shrink-0 items-center gap-1 sm:flex-1 sm:gap-2">
          <div className="flex shrink-0 flex-col items-center gap-1.5 sm:min-w-20">
            <span
              aria-current={stage.status === 'current' ? 'step' : undefined}
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold',
                stage.status === 'done' && 'border-primary bg-primary text-primary-foreground',
                stage.status === 'current' && 'border-primary bg-primary/10 text-primary',
                stage.status === 'upcoming' && 'border-border bg-background text-muted-foreground',
              )}
            >
              {stage.status === 'done' ? <Check className="size-4" aria-hidden /> : <Circle className="size-2.5 fill-current" aria-hidden />}
            </span>
            <span
              className={cn(
                'whitespace-nowrap text-xs font-medium',
                stage.status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground',
              )}
            >
              {stage.label}
            </span>
          </div>
          {index < stages.length - 1 ? (
            <span
              aria-hidden
              className={cn('h-0.5 w-6 shrink-0 rounded-full sm:w-full', stage.status === 'done' ? 'bg-primary' : 'bg-border')}
            />
          ) : null}
        </li>
      ))}
    </ol>
  );
}
