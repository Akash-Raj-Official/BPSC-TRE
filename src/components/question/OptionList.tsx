import { HelpCircle } from 'lucide-react';
import { DONT_KNOW_OPTION } from '@/types/exam';
import type { AnswerOption, Language, Question, SelectableOption, StoredAnswer } from '@/types/exam';
import { localized } from '@/utils/format';
import { cn } from '@/utils/cn';

const dontKnowLabel: Record<Language, string> = {
  hindi: 'ज्ञात नहीं',
  english: 'Not Known',
};

export interface OptionListProps {
  question: Question;
  /** Medium of the paper — options are part of the question, not the chrome. */
  questionLanguage: Language;
  selected: StoredAnswer;
  optionOrder: AnswerOption[];
  onSelect: (option: SelectableOption) => void;
  disabled?: boolean;
}

/**
 * The five choices for a question.
 *
 * Built on native radio inputs so arrow-key navigation, form semantics and
 * screen-reader announcements come for free. Option E is generated here — it
 * never exists in the question bank.
 */
export function OptionList({
  question,
  questionLanguage,
  selected,
  optionOrder,
  onSelect,
  disabled,
}: OptionListProps) {
  const groupName = `question-${question.id}`;

  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="sr-only">Choose one option</legend>

      <div className="space-y-2.5">
        {optionOrder.map((optionKey, position) => {
          const option = question.options[optionKey];
          const text = localized(option, questionLanguage);
          // The displayed letter follows the position on screen, which matters
          // when option randomisation is switched on.
          const displayLetter = String.fromCharCode(65 + position);
          const isSelected = selected === optionKey;

          return (
            <OptionRow
              key={optionKey}
              name={groupName}
              letter={displayLetter}
              text={text}
              language={questionLanguage}
              selected={isSelected}
              onSelect={() => onSelect(optionKey)}
              disabled={disabled}
            />
          );
        })}

        <div className="pt-1">
          <OptionRow
            name={groupName}
            letter="E"
            text={dontKnowLabel[questionLanguage]}
            language={questionLanguage}
            selected={selected === DONT_KNOW_OPTION}
            onSelect={() => onSelect(DONT_KNOW_OPTION)}
            disabled={disabled}
            tone="dontKnow"
            icon={<HelpCircle className="h-4 w-4" aria-hidden="true" />}
          />
        </div>
      </div>
    </fieldset>
  );
}

interface OptionRowProps {
  name: string;
  letter: string;
  text: string;
  language: Language;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  tone?: 'default' | 'dontKnow';
  icon?: React.ReactNode;
}

function OptionRow({
  name,
  letter,
  text,
  language,
  selected,
  onSelect,
  disabled,
  tone = 'default',
  icon,
}: OptionRowProps) {
  const accent = tone === 'dontKnow' ? 'info' : 'brand';

  return (
    <label
      className={cn(
        'flex w-full cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors sm:p-4',
        'focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2 focus-within:ring-offset-surface',
        disabled && 'cursor-not-allowed opacity-70',
        selected
          ? accent === 'info'
            ? 'border-info bg-info-soft'
            : 'border-brand bg-brand-soft'
          : 'border-line bg-surface hover:border-line-strong hover:bg-surface-muted',
      )}
    >
      <input
        type="radio"
        name={name}
        checked={selected}
        onChange={onSelect}
        disabled={disabled}
        className="sr-only"
      />

      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-colors',
          selected
            ? accent === 'info'
              ? 'border-info bg-info text-white dark:text-ink-inverse'
              : 'border-brand bg-brand text-white dark:text-ink-inverse'
            : 'border-line-strong bg-surface text-ink-muted',
        )}
      >
        {letter}
      </span>

      <span className="min-w-0 flex-1">
        <span
          lang={language === 'hindi' ? 'hi' : 'en'}
          className={cn('block text-sm leading-relaxed text-ink sm:text-base', selected && 'font-medium')}
        >
          {icon ? <span className="mr-1.5 inline-flex align-[-2px] text-info">{icon}</span> : null}
          {text}
        </span>
      </span>
    </label>
  );
}
