import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { Language, Question } from '@/types/exam';
import type { BaseQuestionStatus } from '@/hooks/useExamSession';
import type { AttemptCounters } from '@/utils/scoring';
import { Button } from '@/components/common/Button';
import { NavigatorLegend, QuestionNavigator } from './QuestionNavigator';

export interface NavigatorPanelProps {
  questions: Question[];
  currentIndex: number;
  language: Language;
  counters: AttemptCounters;
  baseStatusOf: (questionId: string) => BaseQuestionStatus;
  isMarked: (questionId: string) => boolean;
  onSelect: (index: number) => void;
  onSubmit: () => void;
}

const copy = {
  heading: { hindi: 'प्रश्न पैनल', english: 'Question palette' },
  submit: { hindi: 'परीक्षा जमा करें', english: 'Submit test' },
  close: { hindi: 'बंद करें', english: 'Close' },
} as const;

/** Shared body used by both the desktop sidebar and the mobile drawer. */
function PanelBody({
  questions,
  currentIndex,
  language,
  counters,
  baseStatusOf,
  isMarked,
  onSelect,
  onSubmit,
}: NavigatorPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line p-4">
        <NavigatorLegend language={language} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin p-4">
        <QuestionNavigator
          questions={questions}
          currentIndex={currentIndex}
          language={language}
          baseStatusOf={baseStatusOf}
          isMarked={isMarked}
          onSelect={onSelect}
        />
      </div>

      <div className="border-t border-line p-4">
        <dl className="mb-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md bg-success-soft px-2 py-1.5">
            <dt className="text-ink-muted">{language === 'hindi' ? 'उत्तरित' : 'Answered'}</dt>
            <dd className="text-base font-bold tabular-nums text-success">{counters.answered}</dd>
          </div>
          <div className="rounded-md bg-danger-soft px-2 py-1.5">
            <dt className="text-ink-muted">{language === 'hindi' ? 'अनुत्तरित' : 'Unanswered'}</dt>
            <dd className="text-base font-bold tabular-nums text-danger">{counters.unanswered}</dd>
          </div>
        </dl>
        <Button variant="danger" fullWidth onClick={onSubmit}>
          {copy.submit[language]}
        </Button>
      </div>
    </div>
  );
}

/** Always-visible sidebar on large screens. */
export function NavigatorSidebar(props: NavigatorPanelProps) {
  return (
    <aside
      aria-label={copy.heading[props.language]}
      className="hidden w-80 shrink-0 border-l border-line bg-surface lg:sticky lg:top-14 lg:block lg:h-[calc(100dvh-3.5rem)]"
    >
      <PanelBody {...props} />
    </aside>
  );
}

export interface NavigatorDrawerProps extends NavigatorPanelProps {
  open: boolean;
  onClose: () => void;
}

/** Slide-in drawer used below the `lg` breakpoint. */
export function NavigatorDrawer({ open, onClose, ...props }: NavigatorDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 animate-fade-in bg-slate-950/60" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={copy.heading[props.language]}
        className="absolute right-0 top-0 flex h-dvh w-[min(22rem,88vw)] animate-slide-in-right flex-col border-l border-line bg-surface shadow-overlay"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-sm font-semibold text-ink">{copy.heading[props.language]}</h2>
          <button
            type="button"
            onClick={onClose}
            className="-m-1 rounded-lg p-2 text-ink-subtle hover:bg-surface-muted hover:text-ink"
            aria-label={copy.close[props.language]}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <PanelBody {...props} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
