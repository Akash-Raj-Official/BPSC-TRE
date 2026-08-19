import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/** Consistent horizontal gutters and max width for every page. */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}>{children}</div>;
}

export interface PageHeadingProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeading({ eyebrow, title, description, actions, className }: PageHeadingProps) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow ? <div className="mb-2 flex flex-wrap items-center gap-2">{eyebrow}</div> : null}
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-ink-muted sm:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

/** Vertical rhythm wrapper used by every non-exam page. */
export function PageSection({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn('py-8 sm:py-10', className)}>{children}</section>;
}
