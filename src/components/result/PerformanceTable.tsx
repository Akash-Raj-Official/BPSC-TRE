import { AlertTriangle } from 'lucide-react';
import { examConfig } from '@/config/examConfig';
import type { Language, SegmentPerformance } from '@/types/exam';
import { Badge } from '@/components/common/Badge';
import { Meter } from '@/components/common/Meter';
import { formatMarks, formatPercent, localized } from '@/utils/format';
import { cn } from '@/utils/cn';

const headings = {
  segment: { hindi: 'विषय', english: 'Subject' },
  topicSegment: { hindi: 'टॉपिक', english: 'Topic' },
  questions: { hindi: 'प्रश्न', english: 'Qs' },
  correct: { hindi: 'सही', english: 'Correct' },
  incorrect: { hindi: 'गलत', english: 'Wrong' },
  dontKnow: { hindi: 'E', english: 'E' },
  unanswered: { hindi: 'छोड़े', english: 'Skipped' },
  score: { hindi: 'स्कोर', english: 'Score' },
  accuracy: { hindi: 'सटीकता', english: 'Accuracy' },
  needsWork: { hindi: 'सुधार आवश्यक', english: 'Needs improvement' },
  empty: { hindi: 'कोई डेटा उपलब्ध नहीं', english: 'No data available' },
} as const;

/** A segment plus the derived flag used to render an em dash for "no data". */
type PerformanceRow = SegmentPerformance & { evaluatedIsZero: boolean };

function accuracyTone(segment: PerformanceRow): 'success' | 'warning' | 'danger' | 'brand' {
  if (segment.evaluatedIsZero) return 'brand';
  if (segment.accuracy >= examConfig.strongTopicThreshold) return 'success';
  if (segment.accuracy < examConfig.weakTopicThreshold) return 'danger';
  return 'warning';
}

export interface PerformanceTableProps {
  segments: SegmentPerformance[];
  language: Language;
  variant?: 'subject' | 'topic';
  /** Caps the number of rows; used for "weakest topics" summaries. */
  limit?: number;
}

/**
 * Subject-wise / topic-wise performance.
 *
 * Renders as a table on wide screens and as stacked cards on mobile, because a
 * nine-column table cannot be read on a phone without horizontal scrolling.
 */
export function PerformanceTable({ segments, language, variant = 'subject', limit }: PerformanceTableProps) {
  const rows: PerformanceRow[] = (limit ? segments.slice(0, limit) : segments).map((segment) => ({
    ...segment,
    evaluatedIsZero: segment.correct + segment.incorrect === 0,
  }));

  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-muted">{headings.empty[language]}</p>;
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">
            {variant === 'topic' ? 'Topic-wise performance' : 'Subject-wise performance'}
          </caption>
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-subtle">
              <th scope="col" className="py-2 pr-3 font-medium">
                {variant === 'topic' ? headings.topicSegment[language] : headings.segment[language]}
              </th>
              <th scope="col" className="px-2 py-2 text-right font-medium">{headings.questions[language]}</th>
              <th scope="col" className="px-2 py-2 text-right font-medium">{headings.correct[language]}</th>
              <th scope="col" className="px-2 py-2 text-right font-medium">{headings.incorrect[language]}</th>
              <th scope="col" className="px-2 py-2 text-right font-medium">{headings.dontKnow[language]}</th>
              <th scope="col" className="px-2 py-2 text-right font-medium">{headings.unanswered[language]}</th>
              <th scope="col" className="px-2 py-2 text-right font-medium">{headings.score[language]}</th>
              <th scope="col" className="py-2 pl-2 font-medium">{headings.accuracy[language]}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((segment) => (
              <tr key={segment.key}>
                <th scope="row" className="py-3 pr-3 text-left font-medium text-ink">
                  <span className="flex items-center gap-2">
                    {localized(segment.label, language)}
                    {segment.needsImprovement ? (
                      <Badge tone="danger" icon={<AlertTriangle className="h-3 w-3" />}>
                        {headings.needsWork[language]}
                      </Badge>
                    ) : null}
                  </span>
                </th>
                <td className="px-2 py-3 text-right tabular-nums text-ink-muted">{segment.total}</td>
                <td className="px-2 py-3 text-right tabular-nums font-semibold text-success">{segment.correct}</td>
                <td className="px-2 py-3 text-right tabular-nums text-danger">{segment.incorrect}</td>
                <td className="px-2 py-3 text-right tabular-nums text-info">{segment.dontKnow}</td>
                <td className="px-2 py-3 text-right tabular-nums text-warning">{segment.unanswered}</td>
                <td className="px-2 py-3 text-right tabular-nums font-semibold text-ink">
                  {formatMarks(segment.score)}
                  <span className="text-xs font-normal text-ink-subtle">/{formatMarks(segment.maxScore)}</span>
                </td>
                <td className="py-3 pl-2">
                  <div className="flex min-w-[7rem] items-center gap-2">
                    <Meter
                      value={segment.accuracy}
                      tone={accuracyTone(segment)}
                      size="sm"
                      label={`${localized(segment.label, language)} accuracy`}
                      valueText={formatPercent(segment.accuracy)}
                    />
                    <span className="w-12 shrink-0 text-right text-xs tabular-nums text-ink-muted">
                      {segment.evaluatedIsZero ? '—' : formatPercent(segment.accuracy, 0)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {rows.map((segment) => (
          <li key={segment.key} className="rounded-lg border border-line p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-ink">{localized(segment.label, language)}</p>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                {formatMarks(segment.score)}
                <span className="text-xs font-normal text-ink-subtle">/{formatMarks(segment.maxScore)}</span>
              </p>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <Meter
                value={segment.accuracy}
                tone={accuracyTone(segment)}
                size="sm"
                label={`${localized(segment.label, language)} accuracy`}
                valueText={formatPercent(segment.accuracy)}
              />
              <span className="w-12 shrink-0 text-right text-xs tabular-nums text-ink-muted">
                {segment.evaluatedIsZero ? '—' : formatPercent(segment.accuracy, 0)}
              </span>
            </div>

            <dl className="mt-2.5 grid grid-cols-4 gap-2 text-center text-xs">
              <Cell label={headings.correct[language]} value={segment.correct} className="text-success" />
              <Cell label={headings.incorrect[language]} value={segment.incorrect} className="text-danger" />
              <Cell label={headings.dontKnow[language]} value={segment.dontKnow} className="text-info" />
              <Cell label={headings.unanswered[language]} value={segment.unanswered} className="text-warning" />
            </dl>

            {segment.needsImprovement ? (
              <Badge tone="danger" className="mt-2.5" icon={<AlertTriangle className="h-3 w-3" />}>
                {headings.needsWork[language]}
              </Badge>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  );
}

function Cell({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className="rounded-md bg-surface-muted py-1.5">
      <dt className="text-[11px] text-ink-subtle">{label}</dt>
      <dd className={cn('font-bold tabular-nums', className)}>{value}</dd>
    </div>
  );
}
