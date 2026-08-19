import type { ReactNode } from 'react';
import { CheckCircle2, CircleHelp, CircleSlash, MinusCircle, Percent, Target, TimerReset, XCircle } from 'lucide-react';
import type { ExamResult, Language } from '@/types/exam';
import { formatMarks, formatPercent } from '@/utils/format';
import { formatDurationLabel } from '@/utils/timer';
import { cn } from '@/utils/cn';

export interface StatTileProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: 'neutral' | 'success' | 'danger' | 'info' | 'warning' | 'brand';
  className?: string;
}

const toneText = {
  neutral: 'text-ink',
  success: 'text-success',
  danger: 'text-danger',
  info: 'text-info',
  warning: 'text-warning',
  brand: 'text-brand',
};

export function StatTile({ label, value, hint, icon, tone = 'neutral', className }: StatTileProps) {
  return (
    <div className={cn('surface-card p-4', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-ink-muted">{label}</p>
        {icon ? <span className={cn('shrink-0', toneText[tone])}>{icon}</span> : null}
      </div>
      <p className={cn('mt-2 text-2xl font-bold tabular-nums', toneText[tone])}>{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-ink-subtle">{hint}</p> : null}
    </div>
  );
}

const labels = {
  correct: { hindi: 'सही', english: 'Correct' },
  incorrect: { hindi: 'गलत', english: 'Incorrect' },
  dontKnow: { hindi: 'ज्ञात नहीं (E)', english: 'Not Known (E)' },
  unanswered: { hindi: 'अनुत्तरित', english: 'Unanswered' },
  attempted: { hindi: 'प्रयास किए गए', english: 'Attempted' },
  accuracy: { hindi: 'सटीकता', english: 'Accuracy' },
  positive: { hindi: 'धनात्मक अंक', english: 'Positive marks' },
  negative: { hindi: 'ऋणात्मक अंक', english: 'Negative marks' },
  timeTaken: { hindi: 'लिया गया समय', english: 'Time taken' },
  timeLeft: { hindi: 'शेष समय', english: 'Time remaining' },
  ofTotal: { hindi: 'कुल में से', english: 'of' },
} as const;

export function StatGrid({ result, language }: { result: ExamResult; language: Language }) {
  const { overall } = result;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <StatTile
        label={labels.correct[language]}
        value={overall.correct}
        tone="success"
        icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
        hint={`${labels.ofTotal[language]} ${overall.totalQuestions}`}
      />
      <StatTile
        label={labels.incorrect[language]}
        value={overall.incorrect}
        tone="danger"
        icon={<XCircle className="h-4 w-4" aria-hidden="true" />}
      />
      <StatTile
        label={labels.dontKnow[language]}
        value={overall.dontKnow}
        tone="info"
        icon={<CircleHelp className="h-4 w-4" aria-hidden="true" />}
        hint={language === 'hindi' ? 'कोई अंक नहीं कटा' : 'No marks deducted'}
      />
      <StatTile
        label={labels.unanswered[language]}
        value={overall.unanswered}
        tone="warning"
        icon={<CircleSlash className="h-4 w-4" aria-hidden="true" />}
        hint={language === 'hindi' ? 'ऋणात्मक अंकन लागू' : 'Negative marking applied'}
      />
      <StatTile
        label={labels.attempted[language]}
        value={overall.attempted}
        icon={<Target className="h-4 w-4" aria-hidden="true" />}
        hint={language === 'hindi' ? 'E सहित' : 'including option E'}
      />
      <StatTile
        label={labels.accuracy[language]}
        value={formatPercent(overall.accuracy)}
        tone="brand"
        icon={<Percent className="h-4 w-4" aria-hidden="true" />}
        hint={language === 'hindi' ? 'सही ÷ (सही + गलत)' : 'correct ÷ (correct + incorrect)'}
      />
      <StatTile
        label={labels.positive[language]}
        value={`+${formatMarks(overall.positiveMarks)}`}
        tone="success"
      />
      <StatTile
        label={labels.negative[language]}
        value={`-${formatMarks(overall.negativeMarks)}`}
        tone="danger"
        icon={<MinusCircle className="h-4 w-4" aria-hidden="true" />}
        hint={language === 'hindi' ? 'गलत + अनुत्तरित' : 'incorrect + unanswered'}
      />
      <StatTile
        label={labels.timeTaken[language]}
        value={formatDurationLabel(result.timeTakenSeconds)}
        icon={<TimerReset className="h-4 w-4" aria-hidden="true" />}
        className="col-span-2 sm:col-span-1"
      />
      <StatTile label={labels.timeLeft[language]} value={formatDurationLabel(result.timeRemainingSeconds)} />
    </div>
  );
}
