import { useMemo } from 'react';
import { paperShortLabels } from '@/config/examConfig';
import type { Language, PaperId, Question } from '@/types/exam';
import type { BaseQuestionStatus } from '@/hooks/useExamSession';
import { localized } from '@/utils/format';
import { cn } from '@/utils/cn';

/* -------------------------------------------------------------------------- */
/*                                   Legend                                   */
/* -------------------------------------------------------------------------- */

export interface LegendEntry {
  key: string;
  swatch: string;
  label: { hindi: string; english: string };
  marker?: 'dot' | 'e';
}

export const legendEntries: LegendEntry[] = [
  {
    key: 'answered',
    swatch: 'bg-success text-white border-success',
    label: { hindi: 'उत्तर दिया गया', english: 'Answered' },
  },
  {
    key: 'not-answered',
    swatch: 'bg-surface text-ink border-line-strong',
    label: { hindi: 'उत्तर नहीं दिया', english: 'Not answered' },
  },
  {
    key: 'marked',
    swatch: 'bg-review text-white border-review',
    label: { hindi: 'समीक्षा हेतु चिह्नित', english: 'Marked for review' },
    marker: 'dot',
  },
  {
    key: 'dont-know',
    swatch: 'bg-info text-white border-info',
    label: { hindi: 'ज्ञात नहीं (E)', english: 'Not Known (E)' },
    marker: 'e',
  },
  {
    key: 'unvisited',
    swatch: 'bg-surface-muted text-ink-subtle border-line',
    label: { hindi: 'देखा नहीं गया', english: 'Not visited' },
  },
];

export function NavigatorLegend({ language, className }: { language: Language; className?: string }) {
  return (
    <ul className={cn('grid grid-cols-2 gap-x-3 gap-y-2 text-xs sm:grid-cols-1', className)}>
      {legendEntries.map((entry) => (
        <li key={entry.key} className="flex items-center gap-2">
          <span
            className={cn(
              'relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold',
              entry.swatch,
            )}
            aria-hidden="true"
          >
            {entry.marker === 'e' ? 'E' : null}
            {entry.marker === 'dot' ? (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-surface bg-success" />
            ) : null}
          </span>
          <span className="text-ink-muted">{localized(entry.label, language)}</span>
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Navigator                                 */
/* -------------------------------------------------------------------------- */

const statusStyles: Record<BaseQuestionStatus, string> = {
  answered: 'bg-success text-white border-success hover:bg-success/90',
  dontKnow: 'bg-info text-white border-info hover:bg-info/90',
  visited: 'bg-surface text-ink border-line-strong hover:bg-surface-muted',
  unvisited: 'bg-surface-muted text-ink-subtle border-line hover:bg-line',
};

const statusDescriptions: Record<BaseQuestionStatus, string> = {
  answered: 'answered',
  dontKnow: 'answered with Not Known',
  visited: 'visited but not answered',
  unvisited: 'not visited',
};

export interface QuestionNavigatorProps {
  questions: Question[];
  currentIndex: number;
  language: Language;
  baseStatusOf: (questionId: string) => BaseQuestionStatus;
  isMarked: (questionId: string) => boolean;
  onSelect: (index: number) => void;
  className?: string;
}

/**
 * Question palette.
 *
 * State is conveyed by colour *and* by a shape/marker plus an explicit
 * `aria-label`, so it never depends on colour alone.
 */
export function QuestionNavigator({
  questions,
  currentIndex,
  language,
  baseStatusOf,
  isMarked,
  onSelect,
  className,
}: QuestionNavigatorProps) {
  const groups = useMemo(() => groupByPaper(questions), [questions]);

  return (
    <div className={cn('space-y-5', className)}>
      {groups.map((group) => (
        <section key={group.paper} aria-label={localized(paperShortLabels[group.paper], language)}>
          <h3 className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink-subtle">
            <span>{localized(paperShortLabels[group.paper], language)}</span>
            <span className="font-mono text-[11px] normal-case">{group.items.length}</span>
          </h3>

          <div className="grid grid-cols-5 gap-1.5 xs:grid-cols-6 sm:grid-cols-8 lg:grid-cols-5">
            {group.items.map(({ question, index }) => {
              const status = baseStatusOf(question.id);
              const marked = isMarked(question.id);
              const isCurrent = index === currentIndex;

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => onSelect(index)}
                  aria-current={isCurrent ? 'true' : undefined}
                  aria-label={`Question ${index + 1}, ${statusDescriptions[status]}${
                    marked ? ', marked for review' : ''
                  }`}
                  className={cn(
                    'relative flex h-10 w-full items-center justify-center rounded-md border text-sm font-semibold transition-colors',
                    marked ? 'border-review bg-review text-white hover:bg-review/90' : statusStyles[status],
                    isCurrent && 'ring-2 ring-brand ring-offset-2 ring-offset-surface',
                  )}
                >
                  {index + 1}
                  {marked && (status === 'answered' || status === 'dontKnow') ? (
                    <span
                      className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-surface bg-success"
                      aria-hidden="true"
                    />
                  ) : null}
                  {status === 'dontKnow' && !marked ? (
                    <span className="absolute right-0.5 top-0 text-[9px] font-bold leading-tight" aria-hidden="true">
                      E
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function groupByPaper(questions: Question[]): Array<{ paper: PaperId; items: Array<{ question: Question; index: number }> }> {
  const groups = new Map<PaperId, Array<{ question: Question; index: number }>>();

  questions.forEach((question, index) => {
    const bucket = groups.get(question.paper);
    if (bucket) bucket.push({ question, index });
    else groups.set(question.paper, [{ question, index }]);
  });

  return Array.from(groups, ([paper, items]) => ({ paper, items }));
}
