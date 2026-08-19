import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-live="polite" className={cn('inline-flex items-center gap-2 text-ink-muted', className)}>
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Suspense fallback for lazily loaded routes. */
export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner label="Loading page" />
    </div>
  );
}

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center',
        className,
      )}
    >
      {icon ? <div className="mb-3 text-ink-subtle">{icon}</div> : null}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-1 max-w-md text-sm text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
