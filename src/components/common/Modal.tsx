import { useCallback, useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** Hides the close button for dialogs the user must answer. */
  hideCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

/**
 * Accessible dialog: labelled, focus-trapped, closes on Escape and restores
 * focus to whatever opened it.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  hideCloseButton,
  size = 'md',
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null,
      );
      if (focusable.length === 0) return;

      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    // Focus the panel itself so screen readers announce the dialog title.
    const focusTimer = window.setTimeout(() => {
      const target = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? panelRef.current;
      target?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, handleKeyDown]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'relative z-10 w-full animate-slide-up rounded-t-2xl border border-line bg-surface shadow-overlay',
          'max-h-[92vh] overflow-y-auto scrollbar-thin sm:rounded-2xl',
          sizes[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line p-4 sm:p-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-ink">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-sm text-ink-muted">
                {description}
              </p>
            ) : null}
          </div>
          {!hideCloseButton ? (
            <button
              type="button"
              onClick={onClose}
              className="-m-1 shrink-0 rounded-lg p-2 text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        {children ? <div className="p-4 sm:p-5">{children}</div> : null}

        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-line bg-surface-muted/60 p-4 sm:flex-row sm:justify-end sm:p-5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
