import type { ReactNode } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

const tones: Record<AlertTone, { wrapper: string; icon: ReactNode }> = {
  info: {
    wrapper: 'border-info/30 bg-info-soft text-info',
    icon: <Info className="h-5 w-5" aria-hidden="true" />,
  },
  success: {
    wrapper: 'border-success/30 bg-success-soft text-success',
    icon: <CheckCircle2 className="h-5 w-5" aria-hidden="true" />,
  },
  warning: {
    wrapper: 'border-warning/30 bg-warning-soft text-warning',
    icon: <AlertTriangle className="h-5 w-5" aria-hidden="true" />,
  },
  danger: {
    wrapper: 'border-danger/30 bg-danger-soft text-danger',
    icon: <AlertCircle className="h-5 w-5" aria-hidden="true" />,
  },
};

export interface AlertProps {
  tone?: AlertTone;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Announces the message to screen readers as it appears. */
  live?: boolean;
}

export function Alert({ tone = 'info', title, children, className, live }: AlertProps) {
  return (
    <div
      role={live ? 'status' : undefined}
      aria-live={live ? 'polite' : undefined}
      className={cn('flex gap-3 rounded-lg border p-3 sm:p-4', tones[tone].wrapper, className)}
    >
      <span className="mt-0.5 shrink-0">{tones[tone].icon}</span>
      <div className="min-w-0 text-sm">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={cn(title && 'mt-1', 'text-ink')}>{children}</div>
      </div>
    </div>
  );
}
