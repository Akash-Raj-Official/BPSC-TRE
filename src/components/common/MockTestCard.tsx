import { CheckCircle2, Clock, FileText, Layers, Play } from 'lucide-react';
import { routes } from '@/config/routes';
import { getSubjectShortLabel } from '@/data/subjects';
import type { MockTestSummary } from '@/data/mockTests';
import type { Language, MockTest } from '@/types/exam';
import type { StoredResultSummary } from '@/types/exam';
import { Badge } from './Badge';
import { ButtonLink } from './Button';
import { Card } from './Card';
import { formatMarks, formatPercent, localized } from '@/utils/format';

const difficultyTone = {
  easy: 'success',
  moderate: 'brand',
  hard: 'danger',
} as const;

const difficultyLabel = {
  easy: { hindi: 'सरल', english: 'Easy' },
  moderate: { hindi: 'मध्यम', english: 'Moderate' },
  hard: { hindi: 'कठिन', english: 'Hard' },
} as const;

export interface MockTestCardProps {
  test: MockTest;
  summary: MockTestSummary;
  language: Language;
  /** Best/most recent attempt, when one exists. */
  lastResult?: StoredResultSummary;
}

export function MockTestCard({ test, summary, language, lastResult }: MockTestCardProps) {
  return (
    <Card interactive className="flex h-full flex-col">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-ink sm:text-lg">{localized(test.title, language)}</h3>
        <Badge tone={difficultyTone[test.difficulty]}>{localized(difficultyLabel[test.difficulty], language)}</Badge>
      </div>

      <p className="mt-2 flex-1 text-sm text-ink-muted">{localized(test.description, language)}</p>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat icon={<FileText className="h-4 w-4" />} label={language === 'hindi' ? 'प्रश्न' : 'Questions'} value={summary.totalQuestions} />
        <Stat icon={<Clock className="h-4 w-4" />} label={language === 'hindi' ? 'मिनट' : 'Minutes'} value={summary.durationMinutes} />
        <Stat
          icon={<CheckCircle2 className="h-4 w-4" />}
          label={language === 'hindi' ? 'अंक' : 'Marks'}
          value={formatMarks(summary.maxMarks)}
        />
      </dl>

      <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-ink-subtle">
        <Layers className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {summary.subjects.map((subject) => getSubjectShortLabel(subject, language)).join(' · ')}
      </p>

      {lastResult ? (
        <p className="mt-3 rounded-md bg-surface-muted px-3 py-2 text-xs text-ink-muted">
          {language === 'hindi' ? 'पिछला प्रयास' : 'Last attempt'}:{' '}
          <span className="font-semibold text-ink tabular-nums">
            {formatMarks(lastResult.finalScore)} / {formatMarks(lastResult.maxScore)}
          </span>{' '}
          · {formatPercent(lastResult.accuracy, 1)} {language === 'hindi' ? 'सटीकता' : 'accuracy'}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <ButtonLink to={routes.instructions(test.id)} icon={<Play className="h-4 w-4" />} className="sm:flex-1" fullWidth>
          {lastResult
            ? language === 'hindi'
              ? 'पुनः प्रयास करें'
              : 'Retake test'
            : language === 'hindi'
              ? 'टेस्ट शुरू करें'
              : 'Start test'}
        </ButtonLink>
        <ButtonLink to={routes.mockTest(test.id)} variant="outline" className="sm:w-auto" fullWidth>
          {language === 'hindi' ? 'विवरण' : 'Details'}
        </ButtonLink>
      </div>
    </Card>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-surface-muted px-2 py-2.5">
      <span className="mx-auto mb-1 flex h-4 w-4 items-center justify-center text-ink-subtle" aria-hidden="true">
        {icon}
      </span>
      <dt className="sr-only">{label}</dt>
      <dd className="text-base font-bold tabular-nums text-ink">{value}</dd>
      <p className="text-[11px] text-ink-subtle">{label}</p>
    </div>
  );
}
