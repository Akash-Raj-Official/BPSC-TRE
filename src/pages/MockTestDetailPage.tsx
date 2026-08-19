import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Clock, FileText, Play, Search } from 'lucide-react';
import { paperLabels } from '@/config/examConfig';
import { routes } from '@/config/routes';
import { getMockTest, getMockTestSummary } from '@/data/mockTests';
import { getSubjectLabel, getTopicLabel } from '@/data/subjects';
import { useStoredResult } from '@/hooks/useStoredResult';
import { useUiLanguage } from '@/store/uiLanguageStore';
import type { PaperId, Question } from '@/types/exam';
import { Badge } from '@/components/common/Badge';
import { ButtonLink } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { TestNotFound } from '@/components/common/TestNotFound';
import { Container, PageHeading, PageSection } from '@/components/layout/Page';
import { formatMarks, formatPercent, localized } from '@/utils/format';

interface SubjectBreakdown {
  subject: string;
  count: number;
  topics: Array<{ topic: string; count: number }>;
}

function breakdownByPaper(questions: Question[], paper: PaperId): SubjectBreakdown[] {
  const subjects = new Map<string, Map<string, number>>();

  for (const question of questions) {
    if (question.paper !== paper) continue;
    const topics = subjects.get(question.subject) ?? new Map<string, number>();
    topics.set(question.topic, (topics.get(question.topic) ?? 0) + 1);
    subjects.set(question.subject, topics);
  }

  return Array.from(subjects, ([subject, topics]) => ({
    subject,
    count: Array.from(topics.values()).reduce((total, value) => total + value, 0),
    topics: Array.from(topics, ([topic, count]) => ({ topic, count })).sort((a, b) => b.count - a.count),
  })).sort((a, b) => b.count - a.count);
}

export function MockTestDetailPage() {
  const { testId } = useParams<{ testId: string }>();
  const test = getMockTest(testId);
  const summary = getMockTestSummary(testId);
  const { record } = useStoredResult(testId);

  const language = useUiLanguage();

  const papers = useMemo(
    () =>
      test
        ? ([
            { paper: 'paper1' as const, breakdown: breakdownByPaper(test.questions, 'paper1') },
            { paper: 'paper2' as const, breakdown: breakdownByPaper(test.questions, 'paper2') },
          ].filter((entry) => entry.breakdown.length > 0))
        : [],
    [test],
  );

  if (!test || !summary) return <TestNotFound testId={testId} />;

  return (
    <PageSection>
      <Container className="max-w-5xl">
        <PageHeading
          eyebrow={
            <>
              <Badge tone="brand">{language === 'hindi' ? 'प्रैक्टिस सेट' : 'Practice set'}</Badge>
              {summary.isPartialBlueprint ? (
                <Badge tone="warning">
                  {language === 'hindi' ? 'आंशिक सेट' : 'Partial set'}
                </Badge>
              ) : null}
            </>
          }
          title={localized(test.title, language)}
          description={localized(test.description, language)}
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card className="flex items-center gap-3">
            <FileText className="h-6 w-6 shrink-0 text-brand" aria-hidden="true" />
            <div>
              <p className="text-xs text-ink-subtle">{language === 'hindi' ? 'कुल प्रश्न' : 'Total questions'}</p>
              <p className="text-xl font-bold text-ink">{summary.totalQuestions}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <Clock className="h-6 w-6 shrink-0 text-brand" aria-hidden="true" />
            <div>
              <p className="text-xs text-ink-subtle">{language === 'hindi' ? 'अवधि' : 'Duration'}</p>
              <p className="text-xl font-bold text-ink">
                {summary.durationMinutes} {language === 'hindi' ? 'मिनट' : 'min'}
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-brand" aria-hidden="true" />
            <div>
              <p className="text-xs text-ink-subtle">{language === 'hindi' ? 'अधिकतम अंक' : 'Maximum marks'}</p>
              <p className="text-xl font-bold text-ink">{formatMarks(summary.maxMarks)}</p>
            </div>
          </Card>
        </div>

        {record ? (
          <Card className="mt-4 border-brand/30 bg-brand-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">
                  {language === 'hindi' ? 'आपका पिछला प्रयास' : 'Your last attempt'}
                </p>
                <p className="mt-1 text-sm text-ink-muted tabular-nums">
                  {formatMarks(record.summary.finalScore)} / {formatMarks(record.summary.maxScore)} ·{' '}
                  {formatPercent(record.summary.accuracy, 1)} {language === 'hindi' ? 'सटीकता' : 'accuracy'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ButtonLink to={routes.result(test.id)} variant="outline" size="sm">
                  {language === 'hindi' ? 'परिणाम देखें' : 'View result'}
                </ButtonLink>
                <ButtonLink to={routes.review(test.id)} variant="ghost" size="sm" icon={<Search className="h-4 w-4" />}>
                  {language === 'hindi' ? 'समीक्षा' : 'Review'}
                </ButtonLink>
              </div>
            </div>
          </Card>
        ) : null}

        <div className="mt-6 space-y-4">
          {papers.map(({ paper, breakdown }) => (
            <Card key={paper}>
              <h2 className="text-base font-semibold text-ink">{localized(paperLabels[paper], language)}</h2>
              <ul className="mt-3 space-y-3">
                {breakdown.map((entry) => (
                  <li key={entry.subject} className="rounded-lg border border-line p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-ink">{getSubjectLabel(entry.subject, language)}</p>
                      <Badge tone="neutral">
                        {entry.count} {language === 'hindi' ? 'प्रश्न' : 'Qs'}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-ink-subtle">
                      {entry.topics
                        .map((topic) => `${getTopicLabel(entry.subject, topic.topic, language)} (${topic.count})`)
                        .join(' · ')}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <ButtonLink
            to={routes.instructions(test.id)}
            size="lg"
            icon={<Play className="h-4 w-4" />}
            className="sm:w-auto"
            fullWidth
          >
            {language === 'hindi' ? 'निर्देश पढ़ें और शुरू करें' : 'Read instructions and start'}
          </ButtonLink>
          <ButtonLink to={routes.mockTests} variant="outline" size="lg" className="sm:w-auto" fullWidth>
            {language === 'hindi' ? 'अन्य सेट' : 'Other sets'}
          </ButtonLink>
        </div>
      </Container>
    </PageSection>
  );
}

export default MockTestDetailPage;
