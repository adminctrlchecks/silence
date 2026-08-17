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
 *
 * Layout: fixed-width nodes with the connectors as the flex-growing element
 * between them (node → line → node → … → node). This distributes the steps
 * evenly across the full width with the last node anchored to the right end,
 * instead of the last step floating mid-row with a trailing gap. Connectors
 * are nudged to sit on the circles' vertical centre.
 */
export function JourneyTracker({ stages }: { stages: JourneyStage[] }) {
  const lastIndex = stages.length - 1;

  return (
    <ol className="flex items-start overflow-x-auto pb-1">
      {stages.map((stage, index) => {
        const isLast = index === lastIndex;
        return (
          <li key={stage.key} className={cn('flex items-start', isLast ? 'shrink-0' : 'shrink-0 sm:flex-1')}>
            <div className="flex w-20 shrink-0 flex-col items-center gap-1.5">
              <span
                aria-current={stage.status === 'current' ? 'step' : undefined}
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold',
                  stage.status === 'done' && 'border-primary bg-primary text-primary-foreground',
                  stage.status === 'current' && 'border-primary bg-primary/10 text-primary',
                  stage.status === 'upcoming' && 'border-border bg-background text-muted-foreground',
                )}
              >
                {stage.status === 'done' ? (
                  <Check className="size-4" aria-hidden />
                ) : (
                  <Circle className="size-2.5 fill-current" aria-hidden />
                )}
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
            {!isLast ? (
              <span
                aria-hidden
                // mt aligns the 2px line to the circle's vertical centre: the
                // circle is size-8 (32px), so its centre is 16px from the top.
                className={cn(
                  'mt-[15px] h-0.5 w-6 shrink-0 rounded-full sm:w-auto sm:flex-1',
                  stage.status === 'done' ? 'bg-primary' : 'bg-border',
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
