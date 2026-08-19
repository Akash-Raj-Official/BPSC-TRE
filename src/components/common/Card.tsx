import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Removes the default padding when the card owns its own layout. */
  flush?: boolean;
  interactive?: boolean;
}

export function Card({ flush, interactive, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'surface-card',
        !flush && 'p-4 sm:p-6',
        interactive && 'transition-shadow hover:shadow-raised',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, description, icon, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon ? <span className="mt-0.5 shrink-0 text-brand">{icon}</span> : null}
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink sm:text-lg">{title}</h2>
          {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
