import { Bookmark, Check, CircleHelp, Lightbulb, Minus, X } from 'lucide-react';
import { DONT_KNOW_OPTION } from '@/types/exam';
import type { AnswerOption, Language, Question, QuestionResult, QuestionVerdict } from '@/types/exam';
import { Badge } from '@/components/common/Badge';
import { QuestionMeta } from '@/components/question/QuestionMeta';
import { formatSignedMarks, localized } from '@/utils/format';
import { cn } from '@/utils/cn';

const OPTION_KEYS: AnswerOption[] = ['A', 'B', 'C', 'D'];

const verdictCopy: Record<QuestionVerdict, { hindi: string; english: string }> = {
  correct: { hindi: 'सही उत्तर', english: 'Correct' },
  incorrect: { hindi: 'गलत उत्तर', english: 'Incorrect' },
  dontKnow: { hindi: '“ज्ञात नहीं” चुना गया', english: 'Answered Not Known' },
  unanswered: { hindi: 'अनुत्तरित', english: 'Unanswered' },
};

const verdictTone: Record<QuestionVerdict, 'success' | 'danger' | 'info' | 'warning'> = {
  correct: 'success',
  incorrect: 'danger',
  dontKnow: 'info',
  unanswered: 'warning',
};

const verdictIcon: Record<QuestionVerdict, typeof Check> = {
  correct: Check,
  incorrect: X,
  dontKnow: CircleHelp,
  unanswered: Minus,
};

export interface ReviewQuestionCardProps {
  question: Question;
  result: QuestionResult;
  questionNumber: number;
  /** Language of the verdict labels, badges and hints. */
  uiLanguage: Language;
  /** Medium of the question stem, options and explanation. */
  questionLanguage: Language;
}

/** Full post-submission review of a single question. */
export function ReviewQuestionCard({
  question,
  result,
  questionNumber,
  uiLanguage,
  questionLanguage,
}: ReviewQuestionCardProps) {
  const VerdictIcon = verdictIcon[result.verdict];
  const explanation = localized(question.explanation, questionLanguage);

  return (
    <article className="surface-card p-4 sm:p-5" aria-labelledby={`review-${question.id}`}>
      <header className="flex flex-wrap items-start justify-between gap-2">
        <h3 id={`review-${question.id}`} className="text-sm font-bold text-ink">
          {uiLanguage === 'hindi' ? 'प्रश्न' : 'Question'} {questionNumber}
        </h3>
        <div className="flex flex-wrap items-center gap-1.5">
          {result.markedForReview ? (
            <Badge tone="review" icon={<Bookmark className="h-3 w-3" />}>
              {uiLanguage === 'hindi' ? 'चिह्नित' : 'Marked'}
            </Badge>
          ) : null}
          <Badge tone={verdictTone[result.verdict]} icon={<VerdictIcon className="h-3 w-3" />}>
            {verdictCopy[result.verdict][uiLanguage]}
          </Badge>
          <Badge tone={result.marks > 0 ? 'success' : result.marks < 0 ? 'danger' : 'neutral'}>
            {formatSignedMarks(result.marks)}
          </Badge>
        </div>
      </header>

      <div className="mt-3">
        <QuestionMeta question={question} language={uiLanguage} />
      </div>

      <p lang={questionLanguage === 'hindi' ? 'hi' : 'en'} className="mt-3 text-base leading-relaxed text-ink">
        {localized(question.question, questionLanguage)}
      </p>

      <ul className="mt-4 space-y-2">
        {OPTION_KEYS.map((key) => {
          const isCorrect = key === result.correctOption;
          const isChosen = key === result.selected;

          return (
            <li
              key={key}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3',
                isCorrect
                  ? 'border-success bg-success-soft'
                  : isChosen
                    ? 'border-danger bg-danger-soft'
                    : 'border-line bg-surface',
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                  isCorrect
                    ? 'border-success bg-success text-white dark:text-ink-inverse'
                    : isChosen
                      ? 'border-danger bg-danger text-white dark:text-ink-inverse'
                      : 'border-line-strong bg-surface text-ink-muted',
                )}
                aria-hidden="true"
              >
                {key}
              </span>

              <span className="min-w-0 flex-1 text-sm text-ink" lang={questionLanguage === 'hindi' ? 'hi' : 'en'}>
                {localized(question.options[key], questionLanguage)}
              </span>

              <span className="flex shrink-0 flex-col items-end gap-1">
                {isCorrect ? (
                  <span className="text-xs font-semibold text-success">
                    {uiLanguage === 'hindi' ? 'सही उत्तर' : 'Correct answer'}
                  </span>
                ) : null}
                {isChosen ? (
                  <span className={cn('text-xs font-semibold', isCorrect ? 'text-success' : 'text-danger')}>
                    {uiLanguage === 'hindi' ? 'आपका उत्तर' : 'Your answer'}
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}

        <li
          className={cn(
            'flex items-start gap-3 rounded-lg border p-3',
            result.selected === DONT_KNOW_OPTION ? 'border-info bg-info-soft' : 'border-line bg-surface',
          )}
        >
          <span
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
              result.selected === DONT_KNOW_OPTION
                ? 'border-info bg-info text-white dark:text-ink-inverse'
                : 'border-line-strong bg-surface text-ink-muted',
            )}
            aria-hidden="true"
          >
            E
          </span>
          <span className="min-w-0 flex-1 text-sm text-ink">
            {questionLanguage === 'hindi' ? 'ज्ञात नहीं' : 'Not Known'}
          </span>
          {result.selected === DONT_KNOW_OPTION ? (
            <span className="shrink-0 text-xs font-semibold text-info">
              {uiLanguage === 'hindi' ? 'आपका उत्तर' : 'Your answer'}
            </span>
          ) : null}
        </li>
      </ul>

      {result.selected === null ? (
        <p className="mt-3 rounded-md bg-warning-soft px-3 py-2 text-xs text-warning">
          {uiLanguage === 'hindi'
            ? 'आपने इस प्रश्न का कोई उत्तर नहीं चुना, इसलिए ऋणात्मक अंकन लागू हुआ। विकल्प E चुनने पर अंक नहीं कटते।'
            : 'You left this question blank, so negative marking applied. Choosing option E would have cost nothing.'}
        </p>
      ) : null}

      {explanation ? (
        <div className="mt-4 rounded-lg border border-line bg-surface-muted p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
            {uiLanguage === 'hindi' ? 'व्याख्या' : 'Explanation'}
          </p>
          <p lang={questionLanguage === 'hindi' ? 'hi' : 'en'} className="mt-1.5 text-sm leading-relaxed text-ink">
            {explanation}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-xs italic text-ink-subtle">
          {uiLanguage === 'hindi'
            ? 'इस प्रश्न के लिए व्याख्या उपलब्ध नहीं है।'
            : 'No explanation is available for this question.'}
        </p>
      )}
    </article>
  );
}
