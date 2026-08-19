import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, LayoutList, Rows3 } from 'lucide-react';
import { routes } from '@/config/routes';
import { getMockTest } from '@/data/mockTests';
import { useStoredResult } from '@/hooks/useStoredResult';
import { useExamStore } from '@/store/examStore';
import { useUiLanguage } from '@/store/uiLanguageStore';
import type { Language, QuestionResult } from '@/types/exam';
import { ButtonLink } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/Feedback';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { Tabs } from '@/components/common/Tabs';
import { TestNotFound } from '@/components/common/TestNotFound';
import { Container, PageHeading, PageSection } from '@/components/layout/Page';
import { AnswerKeyList } from '@/components/result/AnswerKeyList';
import type { AnswerKeyRow } from '@/components/result/AnswerKeyList';
import { ReviewQuestionCard } from '@/components/result/ReviewQuestionCard';
import { localized } from '@/utils/format';
import { cn } from '@/utils/cn';

type ReviewFilter = 'all' | 'correct' | 'incorrect' | 'dontKnow' | 'unanswered' | 'marked';
type ReviewView = 'answer-key' | 'detailed';

const filterCopy: Record<ReviewFilter, { hindi: string; english: string }> = {
  all: { hindi: 'सभी', english: 'All' },
  correct: { hindi: 'सही', english: 'Correct' },
  incorrect: { hindi: 'गलत', english: 'Incorrect' },
  dontKnow: { hindi: 'ज्ञात नहीं', english: 'Not Known' },
  unanswered: { hindi: 'अनुत्तरित', english: 'Unanswered' },
  marked: { hindi: 'चिह्नित', english: 'Marked' },
};

function matchesFilter(result: QuestionResult, filter: ReviewFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'marked':
      return result.markedForReview;
    case 'correct':
      return result.verdict === 'correct';
    case 'incorrect':
      return result.verdict === 'incorrect';
    case 'dontKnow':
      return result.verdict === 'dontKnow';
    case 'unanswered':
      return result.verdict === 'unanswered';
  }
}

export function ReviewPage() {
  const { testId } = useParams<{ testId: string }>();
  const test = getMockTest(testId);
  const { record, loading } = useStoredResult(testId);

  // Chrome follows the interface language; the question text follows the
  // paper medium, which the candidate can flip independently below.
  const uiLanguage = useUiLanguage();
  const questionLanguage = useExamStore((state) => state.language);
  const setQuestionLanguage = useExamStore((state) => state.setQuestionLanguage);

  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [view, setView] = useState<ReviewView>('answer-key');

  const questionsById = useMemo(() => new Map((test?.questions ?? []).map((q) => [q.id, q])), [test]);

  const allRows: AnswerKeyRow[] = useMemo(
    () =>
      (record?.result.questions ?? []).map((result, index) => ({
        result,
        question: questionsById.get(result.questionId),
        number: index + 1,
      })),
    [record, questionsById],
  );

  const counts = useMemo(() => {
    const base: Record<ReviewFilter, number> = {
      all: allRows.length,
      correct: 0,
      incorrect: 0,
      dontKnow: 0,
      unanswered: 0,
      marked: 0,
    };
    for (const row of allRows) {
      if (row.result.verdict === 'correct') base.correct += 1;
      if (row.result.verdict === 'incorrect') base.incorrect += 1;
      if (row.result.verdict === 'dontKnow') base.dontKnow += 1;
      if (row.result.verdict === 'unanswered') base.unanswered += 1;
      if (row.result.markedForReview) base.marked += 1;
    }
    return base;
  }, [allRows]);

  const visibleRows = useMemo(() => allRows.filter((row) => matchesFilter(row.result, filter)), [allRows, filter]);

  if (!test) return <TestNotFound testId={testId} />;

  const language: Language = uiLanguage;

  if (loading) {
    return (
      <PageSection>
        <Container className="max-w-4xl">
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
            icon={<LayoutList className="h-10 w-10" aria-hidden="true" />}
            title={language === 'hindi' ? 'समीक्षा के लिए कोई प्रयास नहीं मिला' : 'No attempt available to review'}
            description={
              language === 'hindi'
                ? 'समीक्षा तभी उपलब्ध होती है जब आप यह प्रैक्टिस सेट पूरा कर लेते हैं।'
                : 'A review becomes available once you have completed this practice set.'
            }
            action={<ButtonLink to={routes.instructions(test.id)}>Start this practice set</ButtonLink>}
          />
        </Container>
      </PageSection>
    );
  }

  const filterItems = (Object.keys(filterCopy) as ReviewFilter[]).map((key) => ({
    id: key,
    label: filterCopy[key][language],
    count: counts[key],
  }));

  return (
    <PageSection>
      <Container className="max-w-4xl space-y-5">
        <PageHeading
          title={language === 'hindi' ? 'प्रश्न समीक्षा' : 'Question review'}
          description={localized(test.title, language)}
          actions={
            <>
              <LanguageToggle
                value={questionLanguage}
                onChange={setQuestionLanguage}
                size="sm"
                label={language === 'hindi' ? 'प्रश्न' : 'Paper'}
                ariaLabel="Question paper language"
              />
              <ButtonLink
                to={routes.result(test.id)}
                variant="outline"
                size="sm"
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                {language === 'hindi' ? 'परिणाम' : 'Result'}
              </ButtonLink>
            </>
          }
        />

        <div className="flex flex-col gap-3">
          <Tabs items={filterItems} value={filter} onChange={setFilter} label="Filter questions" size="sm" />

          <div
            role="radiogroup"
            aria-label={language === 'hindi' ? 'दृश्य' : 'View mode'}
            className="inline-flex self-start rounded-lg border border-line bg-surface-muted p-0.5"
          >
            <ViewButton
              active={view === 'answer-key'}
              onClick={() => setView('answer-key')}
              icon={<Rows3 className="h-4 w-4" />}
              label={language === 'hindi' ? 'एक पंक्ति में' : 'One-line answer key'}
            />
            <ViewButton
              active={view === 'detailed'}
              onClick={() => setView('detailed')}
              icon={<LayoutList className="h-4 w-4" />}
              label={language === 'hindi' ? 'विस्तृत' : 'Detailed'}
            />
          </div>
        </div>

        {/* Only the selected filter's panel is rendered, so its id always
            matches the `aria-controls` of the active tab. */}
        <div id={`${filter}-panel`} role="tabpanel">
          {view === 'answer-key' ? (
            <Card flush className="p-3 sm:p-4">
              <AnswerKeyList rows={visibleRows} language={language} />
            </Card>
          ) : visibleRows.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-muted">
              {language === 'hindi' ? 'इस फ़िल्टर के लिए कोई प्रश्न नहीं मिला।' : 'No questions match this filter.'}
            </p>
          ) : (
            <div className="space-y-4">
              {visibleRows.map((row) =>
                row.question ? (
                  <ReviewQuestionCard
                    key={row.result.questionId}
                    question={row.question}
                    result={row.result}
                    questionNumber={row.number}
                    uiLanguage={language}
                    questionLanguage={questionLanguage}
                  />
                ) : (
                  <Card key={row.result.questionId}>
                    <p className="text-sm text-ink-muted">
                      {language === 'hindi'
                        ? `प्रश्न ${row.number} अब प्रश्न बैंक में उपलब्ध नहीं है।`
                        : `Question ${row.number} is no longer available in the question bank.`}
                    </p>
                  </Card>
                ),
              )}
            </div>
          )}
        </div>
      </Container>
    </PageSection>
  );
}

function ViewButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        active ? 'bg-surface text-ink shadow-card' : 'text-ink-muted hover:text-ink',
      )}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </button>
  );
}

export default ReviewPage;
