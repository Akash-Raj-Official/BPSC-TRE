import { Languages } from 'lucide-react';
import { examConfig } from '@/config/examConfig';
import type { Language } from '@/types/exam';
import { cn } from '@/utils/cn';

const languageLabels: Record<Language, string> = {
  hindi: 'हिन्दी',
  english: 'English',
};

export interface LanguageToggleProps {
  value: Language;
  onChange: (language: Language) => void;
  className?: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  /** Short visible caption, e.g. "Site" or "Paper". */
  label?: string;
  /** Accessible name for the radio group. Defaults to the visible label. */
  ariaLabel?: string;
}

/**
 * Two-way language switcher.
 *
 * Used for two *independent* settings — the website's interface language and
 * the medium of the question paper — so it never reads a store itself; the
 * caller supplies the value and the setter it means.
 */
export function LanguageToggle({
  value,
  onChange,
  className,
  size = 'md',
  showIcon = true,
  label,
  ariaLabel,
}: LanguageToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel ?? label ?? 'Language'}
      className={cn('inline-flex items-center gap-1 rounded-lg border border-line bg-surface-muted p-0.5', className)}
    >
      {showIcon ? (
        <Languages className="ml-1.5 h-4 w-4 shrink-0 text-ink-subtle" aria-hidden="true" />
      ) : null}
      {label ? (
        <span className="pl-1 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle" aria-hidden="true">
          {label}
        </span>
      ) : null}
      {examConfig.languages.map((language) => {
        const selected = language === value;
        return (
          <button
            key={language}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(language)}
            lang={language === 'hindi' ? 'hi' : 'en'}
            className={cn(
              'rounded-md font-medium transition-colors',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
              selected ? 'bg-surface text-ink shadow-card' : 'text-ink-muted hover:text-ink',
            )}
          >
            {languageLabels[language]}
          </button>
        );
      })}
    </div>
  );
}
