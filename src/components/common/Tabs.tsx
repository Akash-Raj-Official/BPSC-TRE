import { useId } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface TabItem<T extends string> {
  id: T;
  label: ReactNode;
  count?: number;
  icon?: ReactNode;
}

export interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the tab list. */
  label: string;
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Roving-focus tab list.
 *
 * Arrow keys move between tabs as the WAI-ARIA pattern expects; the panel is
 * rendered by the caller and must reference `${id}-panel`.
 */
export function Tabs<T extends string>({ items, value, onChange, label, className, size = 'md' }: TabsProps<T>) {
  const baseId = useId();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    const currentIndex = items.findIndex((item) => item.id === value);
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % items.length;
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + items.length) % items.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = items.length - 1;

    if (nextIndex === null) return;
    event.preventDefault();
    const next = items[nextIndex];
    if (next) {
      onChange(next.id);
      document.getElementById(`${baseId}-${next.id}`)?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex gap-1 overflow-x-auto rounded-lg border border-line bg-surface-muted p-1 scrollbar-thin',
        className,
      )}
    >
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            id={`${baseId}-${item.id}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={`${item.id}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-md font-medium transition-colors',
              size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-3 py-2 text-sm',
              selected ? 'bg-surface text-ink shadow-card' : 'text-ink-muted hover:text-ink',
            )}
          >
            {item.icon ? <span aria-hidden="true">{item.icon}</span> : null}
            {item.label}
            {typeof item.count === 'number' ? (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
                  selected ? 'bg-brand-soft text-brand dark:text-brand-strong' : 'bg-surface text-ink-subtle',
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
