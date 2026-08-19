import { LayoutGrid, Send, UserRound } from 'lucide-react';
import type { Language } from '@/types/exam';
import type { TimerSeverity } from '@/utils/timer';
import { Button } from '@/components/common/Button';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { ExamTimer } from './ExamTimer';

export interface ExamHeaderProps {
  title: string;
  candidateName: string;
  /** Language of the header's own labels. */
  uiLanguage: Language;
  onUiLanguageChange: (language: Language) => void;
  /** Medium of the question paper. */
  questionLanguage: Language;
  onQuestionLanguageChange: (language: Language) => void;
  remainingSeconds: number;
  severity: TimerSeverity;
  answeredCount: number;
  totalQuestions: number;
  onOpenNavigator: () => void;
  onSubmit: () => void;
}

/**
 * Fixed examination header.
 *
 * Deliberately does not use the site header: during an attempt the candidate
 * should not have navigation links tempting them away from the paper. It does
 * carry both language switches, because the site header is not on screen — the
 * "Site" one restyles the interface, the "Paper" one swaps the question text.
 */
export function ExamHeader({
  title,
  candidateName,
  uiLanguage,
  onUiLanguageChange,
  questionLanguage,
  onQuestionLanguageChange,
  remainingSeconds,
  severity,
  answeredCount,
  totalQuestions,
  onOpenNavigator,
  onSubmit,
}: ExamHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 py-2.5 sm:px-4 lg:h-14 lg:flex-nowrap lg:px-6 lg:py-0">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-ink sm:text-base">{title}</h1>
            <p className="flex items-center gap-1.5 truncate text-xs text-ink-subtle">
              {candidateName ? (
                <>
                  <UserRound className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{candidateName}</span>
                  <span aria-hidden="true">·</span>
                </>
              ) : null}
              <span className="tabular-nums">
                {answeredCount}/{totalQuestions} {uiLanguage === 'hindi' ? 'उत्तरित' : 'answered'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <ExamTimer remainingSeconds={remainingSeconds} severity={severity} compact className="shrink-0" />

          <div className="hidden items-center gap-2 lg:flex">
            <LanguageToggle
              value={uiLanguage}
              onChange={onUiLanguageChange}
              size="sm"
              showIcon={false}
              label={uiLanguage === 'hindi' ? 'साइट' : 'Site'}
              ariaLabel="Website language"
            />
            <LanguageToggle
              value={questionLanguage}
              onChange={onQuestionLanguageChange}
              size="sm"
              showIcon={false}
              label={uiLanguage === 'hindi' ? 'प्रश्न' : 'Paper'}
              ariaLabel="Question paper language"
            />
          </div>

          <ThemeToggle />

          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={onOpenNavigator}
            icon={<LayoutGrid className="h-4 w-4" />}
          >
            <span className="sr-only sm:not-sr-only">{uiLanguage === 'hindi' ? 'प्रश्न' : 'Questions'}</span>
          </Button>

          <Button variant="danger" size="sm" onClick={onSubmit} icon={<Send className="h-4 w-4" />}>
            <span className="hidden xs:inline">{uiLanguage === 'hindi' ? 'जमा करें' : 'Submit'}</span>
          </Button>
        </div>

        {/* Both switches share their own row below the `lg` breakpoint. */}
        <div className="grid w-full grid-cols-2 gap-2 lg:hidden">
          <LanguageToggle
            value={uiLanguage}
            onChange={onUiLanguageChange}
            size="sm"
            showIcon={false}
            className="w-full justify-center"
            label={uiLanguage === 'hindi' ? 'साइट' : 'Site'}
            ariaLabel="Website language"
          />
          <LanguageToggle
            value={questionLanguage}
            onChange={onQuestionLanguageChange}
            size="sm"
            showIcon={false}
            className="w-full justify-center"
            label={uiLanguage === 'hindi' ? 'प्रश्न' : 'Paper'}
            ariaLabel="Question paper language"
          />
        </div>
      </div>
    </header>
  );
}
