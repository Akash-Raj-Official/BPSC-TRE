import { AlarmClock, Timer as TimerIcon } from 'lucide-react';
import { formatClock, formatClockForScreenReader } from '@/utils/timer';
import type { TimerSeverity } from '@/utils/timer';
import { cn } from '@/utils/cn';

const severityStyles: Record<TimerSeverity, string> = {
  normal: 'border-line bg-surface-muted text-ink',
  warning: 'border-warning/40 bg-warning-soft text-warning',
  danger: 'border-danger/50 bg-danger-soft text-danger animate-pulse',
  expired: 'border-danger/50 bg-danger-soft text-danger',
};

export interface ExamTimerProps {
  remainingSeconds: number;
  severity: TimerSeverity;
  className?: string;
  compact?: boolean;
}

/**
 * Countdown display.
 *
 * The visible clock updates every second but is `aria-hidden`; a separate live
 * region announces the remaining time in whole minutes, so screen-reader users
 * are informed without being interrupted 7200 times.
 */
export function ExamTimer({ remainingSeconds, severity, className, compact }: ExamTimerProps) {
  const Icon = severity === 'normal' ? TimerIcon : AlarmClock;
  const minutesRemaining = Math.floor(remainingSeconds / 60);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border font-semibold tabular-clock',
        compact ? 'px-2.5 py-1.5 text-sm' : 'px-3 py-2 text-base',
        severityStyles[severity],
        className,
      )}
    >
      <Icon className={cn(compact ? 'h-4 w-4' : 'h-5 w-5')} aria-hidden="true" />
      <span aria-hidden="true">{formatClock(remainingSeconds)}</span>

      {/* Announced roughly once a minute as the value changes. */}
      <span key={minutesRemaining} className="sr-only" role="timer" aria-live="polite">
        {formatClockForScreenReader(remainingSeconds)}
      </span>
    </div>
  );
}
