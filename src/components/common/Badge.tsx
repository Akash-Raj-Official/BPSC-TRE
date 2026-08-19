import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'danger' | 'warning' | 'review' | 'info';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted text-ink-muted border-line',
  brand: 'bg-brand-soft text-brand border-brand/30 dark:text-brand-strong',
  success: 'bg-success-soft text-success border-success/30',
  danger: 'bg-danger-soft text-danger border-danger/30',
  warning: 'bg-warning-soft text-warning border-warning/30',
  review: 'bg-review-soft text-review border-review/30',
  info: 'bg-info-soft text-info border-info/30',
};

export interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Renders a slightly larger badge for use as a page-level label. */
  size?: 'sm' | 'md';
  /** Native tooltip, useful for abbreviated labels. */
  title?: string;
}

export function Badge({ tone = 'neutral', icon, children, className, size = 'sm', title }: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        tones[tone],
        className,
      )}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  );
}
