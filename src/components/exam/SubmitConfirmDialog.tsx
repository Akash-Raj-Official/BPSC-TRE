import { examConfig } from '@/config/examConfig';
import type { Language } from '@/types/exam';
import type { AttemptCounters } from '@/utils/scoring';
import { Alert } from '@/components/common/Alert';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { formatMarks } from '@/utils/format';

const copy = {
  title: { hindi: 'क्या आप परीक्षा जमा करना चाहते हैं?', english: 'Submit your examination?' },
  description: {
    hindi: 'जमा करने के बाद आप अपने उत्तर नहीं बदल सकेंगे।',
    english: 'You will not be able to change your answers after submitting.',
  },
  answered: { hindi: 'उत्तर दिए गए', english: 'Answered' },
  dontKnow: { hindi: 'ज्ञात नहीं (E)', english: 'Not Known (E)' },
  unanswered: { hindi: 'अनुत्तरित', english: 'Unanswered' },
  marked: { hindi: 'समीक्षा हेतु चिह्नित', english: 'Marked for review' },
  cancel: { hindi: 'रद्द करें', english: 'Cancel' },
  submit: { hindi: 'परीक्षा जमा करें', english: 'Submit test' },
} as const;

export interface SubmitConfirmDialogProps {
  open: boolean;
  language: Language;
  counters: AttemptCounters;
  onCancel: () => void;
  onConfirm: () => void;
}

export function SubmitConfirmDialog({ open, language, counters, onCancel, onConfirm }: SubmitConfirmDialogProps) {
  const rows = [
    { key: 'answered', label: copy.answered[language], value: counters.answered, tone: 'text-success' },
    { key: 'dontKnow', label: copy.dontKnow[language], value: counters.dontKnow, tone: 'text-info' },
    { key: 'unanswered', label: copy.unanswered[language], value: counters.unanswered, tone: 'text-danger' },
    { key: 'marked', label: copy.marked[language], value: counters.markedForReview, tone: 'text-review' },
  ];

  const penalty = counters.unanswered * Math.abs(examConfig.unansweredMarks);

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={copy.title[language]}
      description={copy.description[language]}
      footer={
        <>
          <Button variant="outline" onClick={onCancel} className="sm:w-auto" fullWidth>
            {copy.cancel[language]}
          </Button>
          <Button variant="danger" onClick={onConfirm} className="sm:w-auto" fullWidth>
            {copy.submit[language]}
          </Button>
        </>
      }
    >
      <dl className="divide-y divide-line rounded-lg border border-line">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-4 px-3 py-2.5">
            <dt className="text-sm text-ink-muted">{row.label}</dt>
            <dd className={`text-base font-bold tabular-nums ${row.tone}`}>{row.value}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 bg-surface-muted px-3 py-2.5">
          <dt className="text-sm font-medium text-ink">
            {language === 'hindi' ? 'कुल प्रश्न' : 'Total questions'}
          </dt>
          <dd className="text-base font-bold tabular-nums text-ink">{counters.total}</dd>
        </div>
      </dl>

      {counters.unanswered > 0 ? (
        <Alert tone="warning" className="mt-4">
          {language === 'hindi' ? (
            <>
              {counters.unanswered} प्रश्न अनुत्तरित हैं। प्रत्येक अनुत्तरित प्रश्न पर{' '}
              <strong>{formatMarks(examConfig.unansweredMarks)}</strong> अंक कटेंगे (कुल −{formatMarks(penalty)})। यदि
              उत्तर नहीं पता है तो विकल्प E चुनने पर कोई अंक नहीं कटेगा।
            </>
          ) : (
            <>
              {counters.unanswered} question(s) are still unanswered. Each one carries{' '}
              <strong>{formatMarks(examConfig.unansweredMarks)}</strong> marks (−{formatMarks(penalty)} in total).
              Choosing option E instead costs you nothing.
            </>
          )}
        </Alert>
      ) : null}
    </Modal>
  );
}
