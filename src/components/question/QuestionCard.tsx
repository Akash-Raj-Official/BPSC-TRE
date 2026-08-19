import { Bookmark } from 'lucide-react';
import type { AnswerOption, Language, Question, SelectableOption, StoredAnswer } from '@/types/exam';
import { Badge } from '@/components/common/Badge';
import { OptionList } from './OptionList';
import { QuestionMeta } from './QuestionMeta';
import { isTranslationMissing, localized } from '@/utils/format';

export interface QuestionCardProps {
  question: Question;
  /** 1-based number shown to the candidate. */
  questionNumber: number;
  totalQuestions: number;
  /** Language of the labels this card owns (heading, badges, warnings). */
  uiLanguage: Language;
  /** Medium of the question stem and its options. */
  questionLanguage: Language;
  selected: StoredAnswer;
  optionOrder: AnswerOption[];
  marked: boolean;
  onSelect: (option: SelectableOption) => void;
}

/**
 * The question currently being attempted.
 *
 * Presentation only — every state change is delegated upward, which keeps the
 * component trivially reusable by the review screen.
 */
export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  uiLanguage,
  questionLanguage,
  selected,
  optionOrder,
  marked,
  onSelect,
}: QuestionCardProps) {
  const questionText = localized(question.question, questionLanguage);
  const missingTranslation = isTranslationMissing(question.question, questionLanguage);

  return (
    <article className="flex min-w-0 flex-col gap-4" aria-labelledby={`question-heading-${question.id}`}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={`question-heading-${question.id}`} className="text-sm font-bold text-brand sm:text-base">
            {uiLanguage === 'hindi' ? 'प्रश्न' : 'Question'} {questionNumber}
            <span className="ml-1 font-normal text-ink-subtle">/ {totalQuestions}</span>
          </h2>
        </div>

        {marked ? (
          <Badge tone="review" icon={<Bookmark className="h-3 w-3" />}>
            {uiLanguage === 'hindi' ? 'समीक्षा हेतु चिह्नित' : 'Marked for review'}
          </Badge>
        ) : null}
      </header>

      <QuestionMeta question={question} language={uiLanguage} />

      {missingTranslation ? (
        <p className="rounded-md bg-warning-soft px-3 py-2 text-xs text-warning">
          {uiLanguage === 'hindi'
            ? 'इस प्रश्न का हिन्दी अनुवाद उपलब्ध नहीं है; अंग्रेज़ी पाठ दिखाया जा रहा है।'
            : 'An English translation is not available for this question; the Hindi text is shown instead.'}
        </p>
      ) : null}

      <p
        lang={questionLanguage === 'hindi' ? 'hi' : 'en'}
        className="text-base leading-relaxed text-ink sm:text-lg"
      >
        {questionText}
      </p>

      <OptionList
        question={question}
        questionLanguage={questionLanguage}
        selected={selected}
        optionOrder={optionOrder}
        onSelect={onSelect}
      />
    </article>
  );
}
