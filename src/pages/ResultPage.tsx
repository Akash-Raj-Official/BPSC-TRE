import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart3, FileText, ListChecks, RotateCcw, Search } from 'lucide-react';
import { paperLabels } from '@/config/examConfig';
import { routes } from '@/config/routes';
import { getMockTest } from '@/data/mockTests';
import { useStoredResult } from '@/hooks/useStoredResult';
import { useUiLanguage } from '@/store/uiLanguageStore';
import type { Language } from '@/types/exam';
import { ButtonLink } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/Feedback';
import { SegmentedMeter } from '@/components/common/Meter';
import { Tabs } from '@/components/common/Tabs';
import { TestNotFound } from '@/components/common/TestNotFound';
import { Container, PageSection } from '@/components/layout/Page';
import { AnswerKeyList } from '@/components/result/AnswerKeyList';
import type { AnswerKeyRow } from '@/components/result/AnswerKeyList';
import { PerformanceTable } from '@/components/result/PerformanceTable';
import { ScoreCard } from '@/components/result/ScoreCard';
import { StatGrid } from '@/components/result/StatGrid';
import { formatMarks, formatPercent, localized } from '@/utils/format';

type ResultTab = 'summary' | 'answer-key' | 'subjects' | 'topics';

const tabCopy = {
  summary: { hindi: 'सारांश', english: 'Summary' },
  answerKey: { hindi: 'उत्तर कुंजी', english: 'Answer key' },
  subjects: { hindi: 'विषयवार', english: 'Subject-wise' },
  topics: { hindi: 'टॉपिकवार', english: 'Topic-wise' },
} as const;

export function ResultPage() {
  const { testId } = useParams<{ testId: string }>();
  const test = getMockTest(testId);
  const { record, loading } = useStoredResult(testId);

  // The result screen shows no question text, so it follows the interface
  // language throughout.
  const uiLanguage = useUiLanguage();
  const [tab, setTab] = useState<ResultTab>('summary');

  const questionsById = useMemo(() => new Map((test?.questions ?? []).map((q) => [q.id, q])), [test]);

  const answerKeyRows: AnswerKeyRow[] = useMemo(
    () =>
      (record?.result.questions ?? []).map((result, index) => ({
        result,
        question: questionsById.get(result.questionId),
        number: index + 1,
      })),
    [record, questionsById],
  );

  if (!test) return <TestNotFound testId={testId} />;

  const language: Language = uiLanguage;

  if (loading) {
    return (
      <PageSection>
        <Container className="max-w-5xl">
          <div className="h-64 animate-pulse rounded-xl bg-surface-muted" />
        </Container>
      </PageSection>
    );
  }

  if (!record) {
    return (
      <PageSection>
        <Container className="max-w-3xl">
          <EmptyState
            icon={<FileText className="h-10 w-10" aria-hidden="true" />}
            title={language === 'hindi' ? 'इस सेट का कोई परिणाम नहीं मिला' : 'No result found for this set'}
            description={
              language === 'hindi'
                ? 'ऐसा लगता है कि आपने अभी तक यह प्रैक्टिस सेट पूरा नहीं किया है। परीक्षा पूरी करने पर परिणाम यहाँ दिखाई देगा।'
                : 'It looks like you have not completed this practice set yet. Finish the paper and your result will appear here.'
            }
            action={<ButtonLink to={routes.instructions(test.id)}>Start this practice set</ButtonLink>}
          />
        </Container>
      </PageSection>
    );
  }

  const { result } = record;
  const { overall } = result;

  const tabs = [
    { id: 'summary' as const, label: tabCopy.summary[language], icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'answer-key' as const, label: tabCopy.answerKey[language], icon: <ListChecks className="h-4 w-4" /> },
    { id: 'subjects' as const, label: tabCopy.subjects[language], icon: <FileText className="h-4 w-4" /> },
    { id: 'topics' as const, label: tabCopy.topics[language], icon: <Search className="h-4 w-4" /> },
  ];

  return (
    <PageSection>
      <Container className="max-w-5xl space-y-5">
        <div className="flex flex-wrap items-center justify-end gap-2">
        </div>

        <ScoreCard result={result} testTitle={localized(test.title, language)} language={language} />

        <StatGrid result={result} language={language} />

        <Card>
          <h2 className="text-base font-semibold text-ink">
            {language === 'hindi' ? 'प्रश्नों का वितरण' : 'Question breakdown'}
          </h2>
          <SegmentedMeter
            className="mt-3"
            total={overall.totalQuestions}
            segments={[
              { value: overall.correct, tone: 'success', label: 'Correct' },
              { value: overall.incorrect, tone: 'danger', label: 'Incorrect' },
              { value: overall.dontKnow, tone: 'info', label: 'Not Known' },
              { value: overall.unanswered, tone: 'warning', label: 'Unanswered' },
            ]}
          />
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-muted">
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-success" aria-hidden="true" />
              {language === 'hindi' ? 'सही' : 'Correct'} ({overall.correct})
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-danger" aria-hidden="true" />
              {language === 'hindi' ? 'गलत' : 'Incorrect'} ({overall.incorrect})
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-info" aria-hidden="true" />
              {language === 'hindi' ? 'ज्ञात नहीं' : 'Not Known'} ({overall.dontKnow})
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-warning" aria-hidden="true" />
              {language === 'hindi' ? 'अनुत्तरित' : 'Unanswered'} ({overall.unanswered})
            </li>
          </ul>
        </Card>

        <Tabs items={tabs} value={tab} onChange={setTab} label="Result sections" />

        {tab === 'summary' ? (
          <div id="summary-panel" role="tabpanel" className="space-y-5">
            <Card>
              <h2 className="text-base font-semibold text-ink">
                {language === 'hindi' ? 'अंकों की गणना' : 'How your score was calculated'}
              </h2>
              <dl className="mt-3 divide-y divide-line text-sm">
                <Row
                  label={`${language === 'hindi' ? 'सही उत्तर' : 'Correct answers'} (${overall.correct} × 1)`}
                  value={`+${formatMarks(overall.positiveMarks)}`}
                  tone="text-success"
                />
                <Row
                  label={`${language === 'hindi' ? 'गलत उत्तर' : 'Incorrect answers'} (${overall.incorrect} × 1/3)`}
                  value={`-${formatMarks(overall.incorrect / 3)}`}
                  tone="text-danger"
                />
                <Row
                  label={`${language === 'hindi' ? 'अनुत्तरित' : 'Unanswered'} (${overall.unanswered} × 1/3)`}
                  value={`-${formatMarks(overall.unanswered / 3)}`}
                  tone="text-danger"
                />
                <Row
                  label={`${language === 'hindi' ? 'ज्ञात नहीं (E)' : 'Not Known (E)'} (${overall.dontKnow} × 0)`}
                  value={formatMarks(0)}
                  tone="text-ink-muted"
                />
                <Row
                  label={language === 'hindi' ? 'अंतिम स्कोर' : 'Final score'}
                  value={`${formatMarks(overall.finalScore)} / ${formatMarks(overall.maxScore)}`}
                  tone="text-ink"
                  strong
                />
              </dl>
            </Card>

            {result.byPaper.length > 1 ? (
              <Card>
                <h2 className="text-base font-semibold text-ink">
                  {language === 'hindi' ? 'पेपरवार प्रदर्शन' : 'Paper-wise performance'}
                </h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {result.byPaper.map((entry) => (
                    <div key={entry.paper} className="rounded-lg border border-line p-3">
                      <p className="text-sm font-medium text-ink">{localized(paperLabels[entry.paper], language)}</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums text-ink">
                        {formatMarks(entry.breakdown.finalScore)}
                        <span className="text-sm font-normal text-ink-subtle">
                          {' '}
                          / {formatMarks(entry.breakdown.maxScore)}
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {language === 'hindi' ? 'सही' : 'Correct'} {entry.breakdown.correct} ·{' '}
                        {language === 'hindi' ? 'सटीकता' : 'Accuracy'} {formatPercent(entry.breakdown.accuracy)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}

            <Card>
              <h2 className="text-base font-semibold text-ink">
                {language === 'hindi' ? 'सबसे कमजोर टॉपिक' : 'Weakest topics'}
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                {language === 'hindi'
                  ? 'सबसे कम सटीकता वाले पाँच टॉपिक — दोहराव यहीं से शुरू करें।'
                  : 'The five topics with the lowest accuracy — start your revision here.'}
              </p>
              <div className="mt-4">
                <PerformanceTable segments={result.byTopic} language={language} variant="topic" limit={5} />
              </div>
            </Card>
          </div>
        ) : null}

        {tab === 'answer-key' ? (
          <div id="answer-key-panel" role="tabpanel" className="space-y-4">
            <Card flush className="p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-ink">
                    {language === 'hindi' ? 'पूर्ण उत्तर कुंजी' : 'Complete answer key'}
                  </h2>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {language === 'hindi'
                      ? 'प्रत्येक प्रश्न एक पंक्ति में — आपका उत्तर, सही उत्तर और प्राप्त अंक।'
                      : 'One line per question — your answer, the correct answer and the marks awarded.'}
                  </p>
                </div>
                <ButtonLink to={routes.review(test.id)} variant="outline" size="sm">
                  {language === 'hindi' ? 'विस्तृत समीक्षा' : 'Detailed review'}
                </ButtonLink>
              </div>
              <AnswerKeyList rows={answerKeyRows} language={language} />
            </Card>
          </div>
        ) : null}

        {tab === 'subjects' ? (
          <Card id="subjects-panel" role="tabpanel">
            <h2 className="text-base font-semibold text-ink">
              {language === 'hindi' ? 'विषयवार प्रदर्शन' : 'Subject-wise performance'}
            </h2>
            <div className="mt-4">
              <PerformanceTable segments={result.bySubject} language={language} />
            </div>
          </Card>
        ) : null}

        {tab === 'topics' ? (
          <Card id="topics-panel" role="tabpanel">
            <h2 className="text-base font-semibold text-ink">
              {language === 'hindi' ? 'टॉपिकवार प्रदर्शन' : 'Topic-wise performance'}
            </h2>
            <div className="mt-4">
              <PerformanceTable segments={result.byTopic} language={language} variant="topic" />
            </div>
          </Card>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <ButtonLink to={routes.review(test.id)} icon={<Search className="h-4 w-4" />} className="sm:w-auto" fullWidth>
            {language === 'hindi' ? 'सभी प्रश्नों की समीक्षा करें' : 'Review all questions'}
          </ButtonLink>
          <ButtonLink
            to={routes.instructions(test.id)}
            variant="outline"
            icon={<RotateCcw className="h-4 w-4" />}
            className="sm:w-auto"
            fullWidth
          >
            {language === 'hindi' ? 'पुनः प्रयास करें' : 'Retake this set'}
          </ButtonLink>
          <ButtonLink to={routes.results} variant="ghost" className="sm:w-auto" fullWidth>
            {language === 'hindi' ? 'सभी परिणाम' : 'All results'}
          </ButtonLink>
        </div>
      </Container>
    </PageSection>
  );
}

function Row({ label, value, tone, strong }: { label: string; value: string; tone: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className={strong ? 'font-semibold text-ink' : 'text-ink-muted'}>{label}</dt>
      <dd className={`tabular-nums ${strong ? 'text-lg font-bold' : 'font-semibold'} ${tone}`}>{value}</dd>
    </div>
  );
}

export default ResultPage;
