import { cn } from '@/utils/cn';

export type MeterTone = 'brand' | 'success' | 'danger' | 'warning' | 'review' | 'info';

const fills: Record<MeterTone, string> = {
  brand: 'bg-brand',
  success: 'bg-success',
  danger: 'bg-danger',
  warning: 'bg-warning',
  review: 'bg-review',
  info: 'bg-info',
};

export interface MeterProps {
  /** Current value, clamped to [0, max]. */
  value: number;
  max?: number;
  tone?: MeterTone;
  /** Accessible description, e.g. "Mathematics accuracy". */
  label: string;
  /** Text rendered inside the accessible name, e.g. "62%". */
  valueText?: string;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * A horizontal progress meter.
 *
 * Uses the `progressbar` role rather than colour alone, so the value is
 * available to assistive technology as well as sighted users.
 */
export function Meter({ value, max = 100, tone = 'brand', label, valueText, size = 'md', className }: MeterProps) {
  const safeMax = max > 0 ? max : 1;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const percentage = (clamped / safeMax) * 100;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamped * 100) / 100}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuetext={valueText}
      className={cn(
        'w-full overflow-hidden rounded-full bg-surface-muted',
        size === 'sm' ? 'h-1.5' : 'h-2.5',
        className,
      )}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500', fills[tone])}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export interface SegmentedMeterSegment {
  value: number;
  tone: MeterTone;
  label: string;
}

/** Stacked meter used to show correct / incorrect / skipped in one bar. */
export function SegmentedMeter({
  segments,
  total,
  className,
}: {
  segments: SegmentedMeterSegment[];
  total: number;
  className?: string;
}) {
  const safeTotal = total > 0 ? total : 1;

  return (
    <div className={cn('flex h-2.5 w-full overflow-hidden rounded-full bg-surface-muted', className)}>
      {segments.map((segment) =>
        segment.value > 0 ? (
          <div
            key={segment.label}
            className={cn('h-full transition-[width] duration-500', fills[segment.tone])}
            style={{ width: `${(segment.value / safeTotal) * 100}%` }}
            title={`${segment.label}: ${segment.value}`}
          />
        ) : null,
      )}
    </div>
  );
}
