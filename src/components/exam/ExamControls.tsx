import { Bookmark, BookmarkX, ChevronLeft, ChevronRight, Eraser } from 'lucide-react';
import type { Language } from '@/types/exam';
import { Button } from '@/components/common/Button';

const labels = {
  previous: { hindi: 'पिछला', english: 'Previous' },
  clear: { hindi: 'उत्तर हटाएँ', english: 'Clear response' },
  mark: { hindi: 'समीक्षा हेतु चिह्नित करें', english: 'Mark for review' },
  unmark: { hindi: 'चिह्न हटाएँ', english: 'Unmark review' },
  saveNext: { hindi: 'सुरक्षित करें और आगे', english: 'Save & Next' },
  finish: { hindi: 'सुरक्षित करें', english: 'Save' },
} as const;

export interface ExamControlsProps {
  language: Language;
  isFirst: boolean;
  isLast: boolean;
  hasResponse: boolean;
  marked: boolean;
  onPrevious: () => void;
  onClear: () => void;
  onToggleMark: () => void;
  onSaveAndNext: () => void;
}

/**
 * The four navigation actions of a CBT paper.
 *
 * On mobile the primary action spans the full width and sits last, which keeps
 * it under the thumb; on desktop the row matches the familiar exam layout.
 */
export function ExamControls({
  language,
  isFirst,
  isLast,
  hasResponse,
  marked,
  onPrevious,
  onClear,
  onToggleMark,
  onSaveAndNext,
}: ExamControlsProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirst}
          icon={<ChevronLeft className="h-4 w-4" />}
        >
          {labels.previous[language]}
        </Button>

        <Button
          variant="ghost"
          onClick={onClear}
          disabled={!hasResponse}
          icon={<Eraser className="h-4 w-4" />}
          title={
            language === 'hindi'
              ? 'चयन हटाकर प्रश्न को अनुत्तरित अवस्था में लौटाएँ'
              : 'Removes the selection and returns the question to the unanswered state'
          }
        >
          {labels.clear[language]}
        </Button>

        <Button
          variant={marked ? 'review' : 'outline'}
          onClick={onToggleMark}
          icon={marked ? <BookmarkX className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        >
          {marked ? labels.unmark[language] : labels.mark[language]}
        </Button>
      </div>

      <Button
        onClick={onSaveAndNext}
        icon={isLast ? undefined : <ChevronRight className="h-4 w-4" />}
        iconPosition="right"
        className="w-full sm:w-auto"
      >
        {isLast ? labels.finish[language] : labels.saveNext[language]}
      </Button>
    </div>
  );
}
