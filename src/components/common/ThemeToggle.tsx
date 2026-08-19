import { Monitor, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import type { ThemePreference } from '@/store/themeStore';
import { cn } from '@/utils/cn';

const options: Array<{ value: ThemePreference; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

/**
 * Theme switcher.
 *
 * Renders as a three-way segmented control on wider screens and as a single
 * cycling button on small screens, where header space is scarce.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);
  const cyclePreference = useThemeStore((state) => state.cyclePreference);

  const active = options.find((option) => option.value === preference) ?? options[2];
  const ActiveIcon = (active ?? options[2])!.icon;
  const nextLabel = options[(options.findIndex((o) => o.value === preference) + 1) % options.length]?.label ?? 'System';

  return (
    <>
      <button
        type="button"
        onClick={cyclePreference}
        className={cn(
          'inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted transition-colors hover:text-ink sm:hidden',
          className,
        )}
        aria-label={`Theme: ${active?.label ?? 'System'}. Switch to ${nextLabel}.`}
        title={`Theme: ${active?.label ?? 'System'}`}
      >
        <ActiveIcon className="h-5 w-5" aria-hidden="true" />
      </button>

      <div
        role="radiogroup"
        aria-label="Colour theme"
        className={cn('hidden items-center gap-0.5 rounded-lg border border-line bg-surface-muted p-0.5 sm:flex', className)}
      >
        {options.map((option) => {
          const Icon = option.icon;
          const selected = option.value === preference;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setPreference(option.value)}
              title={`${option.label} theme`}
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                selected ? 'bg-surface text-ink shadow-card' : 'text-ink-subtle hover:text-ink',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">{option.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
