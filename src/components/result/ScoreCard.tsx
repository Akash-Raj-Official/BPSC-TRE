import { Award, Clock3, TimerReset } from 'lucide-react';
import { getBenchmark, indicativeCutoffPercentage, scoreBenchmarks } from '@/config/examConfig';
import type { ExamResult, Language } from '@/types/exam';
import { Badge } from '@/components/common/Badge';
import { localized } from '@/utils/format';
import { formatMarks, formatPercent } from '@/utils/format';
import { formatDurationLabel } from '@/utils/timer';
import { cn } from '@/utils/cn';

const toneClasses = {
  success: { text: 'text-success', bg: 'bg-success', soft: 'bg-success-soft' },
  brand: { text: 'text-brand', bg: 'bg-brand', soft: 'bg-brand-soft' },
  warning: { text: 'text-warning', bg: 'bg-warning', soft: 'bg-warning-soft' },
  danger: { text: 'text-danger', bg: 'bg-danger', soft: 'bg-danger-soft' },
} as const;

export interface ScoreCardProps {
  result: ExamResult;
  testTitle: string;
  language: Language;
}

/**
 * The headline score card.
 *
 * Shows the candidate's name, the final score against the configured
 * benchmarks, and where the score sits on the benchmark scale.
 */
export function ScoreCard({ result, testTitle, language }: ScoreCardProps) {
  const { overall } = result;
  const scorePercentage = overall.maxScore > 0 ? (overall.finalScore / overall.maxScore) * 100 : 0;
  const benchmark = getBenchmark(scorePercentage);
  const tone = toneClasses[benchmark.tone];

  const greeting =
    language === 'hindi'
      ? result.candidateName
        ? `${result.candidateName}, आपका परिणाम`
        : 'आपका परिणाम'
      : result.candidateName
        ? `${result.candidateName}, here is your result`
        : 'Your result';

  return (
    <section className={cn('surface-card overflow-hidden', 'p-0')} aria-labelledby="score-card-heading">
      <div className={cn('px-5 py-6 sm:px-8 sm:py-8', tone.soft)}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{testTitle}</p>
            <h1 id="score-card-heading" className="mt-1 text-xl font-bold text-ink sm:text-2xl">
              {greeting}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge tone={benchmark.tone} size="md" icon={<Award className="h-3.5 w-3.5" />}>
                {localized(benchmark.label, language)}
              </Badge>
              {result.autoSubmitted ? (
                <Badge tone="warning" icon={<TimerReset className="h-3.5 w-3.5" />}>
                  {language === 'hindi' ? 'समय समाप्त होने पर स्वतः जमा' : 'Auto-submitted on time-up'}
                </Badge>
              ) : null}
            </div>

            <p className="mt-3 max-w-lg text-sm text-ink-muted">{localized(benchmark.message, language)}</p>
          </div>

          <div className="shrink-0 text-center sm:text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              {language === 'hindi' ? 'आपका स्कोर' : 'Your score'}
            </p>
            <p className={cn('mt-1 text-4xl font-bold tabular-nums sm:text-5xl', tone.text)}>
              {formatMarks(overall.finalScore)}
              <span className="text-xl font-semibold text-ink-subtle sm:text-2xl"> / {formatMarks(overall.maxScore)}</span>
            </p>
            <p className="mt-1 text-sm text-ink-muted tabular-nums">
              {formatPercent(scorePercentage)} · {language === 'hindi' ? 'सटीकता' : 'Accuracy'}{' '}
              {formatPercent(overall.accuracy)}
            </p>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-ink-subtle sm:justify-end">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              {language === 'hindi' ? 'लिया गया समय' : 'Time taken'}: {formatDurationLabel(result.timeTakenSeconds)}
            </p>
          </div>
        </div>
      </div>

      <BenchmarkScale scorePercentage={scorePercentage} language={language} />
    </section>
  );
}

function BenchmarkScale({ scorePercentage, language }: { scorePercentage: number; language: Language }) {
  // Ordered low → high for a left-to-right scale.
  const bands = [...scoreBenchmarks].reverse();
  const clamped = Math.min(Math.max(scorePercentage, 0), 100);

  return (
    <div className="border-t border-line px-5 py-5 sm:px-8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">
          {language === 'hindi' ? 'स्कोर बेंचमार्क' : 'Score benchmarks'}
        </h2>
        <span className="text-xs text-ink-subtle">
          {language === 'hindi' ? 'लक्ष्य' : 'Target'}: {indicativeCutoffPercentage}%+
        </span>
      </div>

      <div className="relative mt-6">
        <div className="flex h-3 overflow-hidden rounded-full">
          {bands.map((band, index) => {
            const next = bands[index + 1];
            const width = (next ? next.minPercentage : 100) - band.minPercentage;
            return (
              <div
                key={band.key}
                className={cn(toneClasses[band.tone].bg, 'h-full opacity-80')}
                style={{ width: `${width}%` }}
                title={`${localized(band.label, language)} (${band.minPercentage}%+)`}
              />
            );
          })}
        </div>

        {/* Candidate marker */}
        <div
          className="absolute -top-1.5 h-6 w-1 -translate-x-1/2 rounded-full bg-ink ring-2 ring-surface"
          style={{ left: `${clamped}%` }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-6 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-ink tabular-nums"
          style={{ left: `${clamped}%` }}
        >
          {formatPercent(clamped, 1)}
        </div>
      </div>

      <ul className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-xs">
        {bands.map((band) => (
          <li key={band.key} className="flex items-center gap-1.5">
            <span className={cn('h-2.5 w-2.5 rounded-full', toneClasses[band.tone].bg)} aria-hidden="true" />
            <span className="text-ink-muted">
              {localized(band.label, language)} · {band.minPercentage}%+
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-ink-subtle">
        {language === 'hindi'
          ? 'ये बेंचमार्क केवल स्व-मूल्यांकन के लिए हैं। वास्तविक BPSC कट-ऑफ प्रत्येक चक्र, विषय एवं श्रेणी के अनुसार बदलती रहती है।'
          : 'These benchmarks are for self-assessment only. The actual BPSC cut-off varies with every cycle, subject and category.'}
      </p>
    </div>
  );
}
