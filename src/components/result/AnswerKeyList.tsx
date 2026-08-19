import { DONT_KNOW_OPTION } from '@/types/exam';
import type { Language, Question, QuestionResult, QuestionVerdict } from '@/types/exam';
import { getSubjectShortLabel } from '@/data/subjects';
import { formatSignedMarks } from '@/utils/format';
import { cn } from '@/utils/cn';

const verdictCopy: Record<QuestionVerdict, { hindi: string; english: string }> = {
  correct: { hindi: 'सही', english: 'Correct' },
  incorrect: { hindi: 'गलत', english: 'Incorrect' },
  dontKnow: { hindi: 'ज्ञात नहीं', english: 'Not Known' },
  unanswered: { hindi: 'अनुत्तरित', english: 'Unanswered' },
};

const verdictStyles: Record<QuestionVerdict, string> = {
  correct: 'bg-success-soft text-success border-success/30',
  incorrect: 'bg-danger-soft text-danger border-danger/30',
  dontKnow: 'bg-info-soft text-info border-info/30',
  unanswered: 'bg-warning-soft text-warning border-warning/30',
};

const headings = {
  question: { hindi: 'प्र.', english: 'Q' },
  yourAnswer: { hindi: 'आपका उत्तर', english: 'Your answer' },
  correctAnswer: { hindi: 'सही उत्तर', english: 'Correct answer' },
  status: { hindi: 'स्थिति', english: 'Status' },
  marks: { hindi: 'अंक', english: 'Marks' },
  subject: { hindi: 'विषय', english: 'Subject' },
} as const;

export interface AnswerKeyRow {
  result: QuestionResult;
  question: Question | undefined;
  /** 1-based position in the paper. */
  number: number;
}

export interface AnswerKeyListProps {
  rows: AnswerKeyRow[];
  language: Language;
  className?: string;
}

/**
 * One-line-per-question answer key.
 *
 * Shown after submission so the whole paper can be scanned at a glance:
 * question number, the option chosen, the correct option, the verdict and the
 * marks awarded — no scrolling through full question text.
 */
export function AnswerKeyList({ rows, language, className }: AnswerKeyListProps) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-ink-muted">
        {language === 'hindi' ? 'इस फ़िल्टर के लिए कोई प्रश्न नहीं मिला।' : 'No questions match this filter.'}
      </p>
    );
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-line', className)}>
      {/* Column headings, hidden on the narrowest screens where the rows wrap. */}
      <div className="hidden bg-surface-muted px-3 py-2 text-xs font-medium uppercase tracking-wide text-ink-subtle sm:grid sm:grid-cols-[3rem_1fr_6rem_6rem_7rem_4.5rem] sm:gap-3">
        <span>{headings.question[language]}</span>
        <span>{headings.subject[language]}</span>
        <span className="text-center">{headings.yourAnswer[language]}</span>
        <span className="text-center">{headings.correctAnswer[language]}</span>
        <span>{headings.status[language]}</span>
        <span className="text-right">{headings.marks[language]}</span>
      </div>

      <ul className="divide-y divide-line">
        {rows.map(({ result, number }) => (
          <li
            key={result.questionId}
            className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-3 gap-y-1.5 px-3 py-2.5 text-sm sm:grid-cols-[3rem_1fr_6rem_6rem_7rem_4.5rem]"
          >
            <span className="font-semibold tabular-nums text-ink">{number}</span>

            <span className="min-w-0 truncate text-xs text-ink-muted sm:text-sm">
              {getSubjectShortLabel(result.subject, language)}
            </span>

            <span className="justify-self-end sm:justify-self-center">
              <AnswerChip value={result.selected} verdict={result.verdict} />
            </span>

            <span className="col-start-2 sm:col-start-auto sm:justify-self-center">
              <span className="mr-1.5 text-xs text-ink-subtle sm:hidden">{headings.correctAnswer[language]}:</span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-success/30 bg-success-soft text-sm font-bold text-success">
                {result.correctOption}
              </span>
            </span>

            <span className="col-start-3 row-start-1 justify-self-end sm:col-start-auto sm:row-start-auto sm:justify-self-start">
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                  verdictStyles[result.verdict],
                )}
              >
                {verdictCopy[result.verdict][language]}
              </span>
            </span>

            <span
              className={cn(
                'col-start-3 justify-self-end text-sm font-semibold tabular-nums sm:text-right',
                result.marks > 0 ? 'text-success' : result.marks < 0 ? 'text-danger' : 'text-ink-muted',
              )}
            >
              {formatSignedMarks(result.marks)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AnswerChip({ value, verdict }: { value: QuestionResult['selected']; verdict: QuestionVerdict }) {
  if (value === null) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line-strong bg-surface-muted text-sm font-bold text-ink-subtle">
        —
      </span>
    );
  }

  const isDontKnow = value === DONT_KNOW_OPTION;

  return (
    <span
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center rounded-md border text-sm font-bold',
        isDontKnow
          ? 'border-info/30 bg-info-soft text-info'
          : verdict === 'correct'
            ? 'border-success/30 bg-success-soft text-success'
            : 'border-danger/30 bg-danger-soft text-danger',
      )}
    >
      {value}
    </span>
  );
}
