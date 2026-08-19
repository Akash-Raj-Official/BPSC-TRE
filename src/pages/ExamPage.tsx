import { useCallback, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { examConfig } from '@/config/examConfig';
import { routes } from '@/config/routes';
import { getMockTest } from '@/data/mockTests';
import { useExamStore } from '@/store/examStore';
import { useSetUiLanguage, useUiLanguage } from '@/store/uiLanguageStore';
import type { Language, SelectableOption } from '@/types/exam';
import { useExamSession, useFinishExam } from '@/hooks/useExamSession';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { useExamTimer } from '@/hooks/useExamTimer';
import { Alert } from '@/components/common/Alert';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ExamControls } from '@/components/exam/ExamControls';
import { ExamHeader } from '@/components/exam/ExamHeader';
import { NavigatorDrawer, NavigatorSidebar } from '@/components/exam/NavigatorPanel';
import { SubmitConfirmDialog } from '@/components/exam/SubmitConfirmDialog';
import { QuestionCard } from '@/components/question/QuestionCard';
import { TestNotFound } from '@/components/common/TestNotFound';
import { localized } from '@/utils/format';

/**
 * The examination screen.
 *
 * Guards its own preconditions: without a live session for this test the
 * candidate is sent back to the instructions page instead of seeing a blank
 * paper.
 */
export function ExamPage() {
  const { testId } = useParams<{ testId: string }>();
  const test = getMockTest(testId);

  const status = useExamStore((state) => state.status);
  const activeTestId = useExamStore((state) => state.testId);
  const examEndTime = useExamStore((state) => state.examEndTime);
  const questionLanguage = useExamStore((state) => state.language);
  const candidateName = useExamStore((state) => state.candidateName);

  // Two independent settings: the interface language and the paper medium.
  const uiLanguage = useUiLanguage();
  const setUiLanguage = useSetUiLanguage();
  const setQuestionLanguage = useExamStore((state) => state.setQuestionLanguage);
  const goToIndex = useExamStore((state) => state.goToIndex);
  const goToNext = useExamStore((state) => state.goToNext);
  const goToPrevious = useExamStore((state) => state.goToPrevious);
  const selectAnswer = useExamStore((state) => state.selectAnswer);
  const clearResponse = useExamStore((state) => state.clearResponse);
  const toggleMarkForReview = useExamStore((state) => state.toggleMarkForReview);

  const session = useExamSession(testId);
  const finishExam = useFinishExam(test);

  const [submitOpen, setSubmitOpen] = useState(false);
  const [navigatorOpen, setNavigatorOpen] = useState(false);

  const isLive = status === 'in-progress' && activeTestId === testId;

  const handleExpire = useCallback(() => {
    finishExam({ auto: true });
  }, [finishExam]);

  const { remainingSeconds, severity } = useExamTimer({
    examEndTime,
    active: isLive,
    onExpire: handleExpire,
  });

  useBeforeUnload(isLive);

  // Scroll back to the question when moving between questions on mobile.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [session.currentIndex]);

  if (!test) return <TestNotFound testId={testId} />;
  if (!isLive) return <Navigate to={routes.instructions(test.id)} replace />;

  const { currentQuestion, currentIndex, questions, counters } = session;
  if (!currentQuestion) return <TestNotFound testId={testId} reason="empty" />;

  const selected = session.answerOf(currentQuestion.id);
  const marked = session.isMarked(currentQuestion.id);

  const handleSelect = (option: SelectableOption): void => selectAnswer(currentQuestion.id, option);
  const handleQuestionLanguageChange = (next: Language): void => setQuestionLanguage(next);

  const handleNavigate = (index: number): void => {
    goToIndex(index);
    setNavigatorOpen(false);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <ExamHeader
        title={localized(test.title, uiLanguage)}
        candidateName={candidateName}
        uiLanguage={uiLanguage}
        onUiLanguageChange={setUiLanguage}
        questionLanguage={questionLanguage}
        onQuestionLanguageChange={handleQuestionLanguageChange}
        remainingSeconds={remainingSeconds}
        severity={severity}
        answeredCount={counters.answered + counters.dontKnow}
        totalQuestions={counters.total}
        onOpenNavigator={() => setNavigatorOpen(true)}
        onSubmit={() => setSubmitOpen(true)}
      />

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 items-start">
        <main className="min-w-0 flex-1 px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
          {severity === 'danger' ? (
            <Alert tone="danger" className="mb-4" live>
              {uiLanguage === 'hindi'
                ? 'पाँच मिनट से कम समय शेष है। कृपया अपने उत्तर पूर्ण करें।'
                : 'Less than five minutes remaining. Please finish your answers.'}
            </Alert>
          ) : severity === 'warning' ? (
            <Alert tone="warning" className="mb-4" live>
              {uiLanguage === 'hindi'
                ? 'दस मिनट से कम समय शेष है।'
                : 'Less than ten minutes remaining.'}
            </Alert>
          ) : null}

          <div className="surface-card p-4 sm:p-6">
            <ErrorBoundary area="question">
              <QuestionCard
                question={currentQuestion}
                questionNumber={currentIndex + 1}
                totalQuestions={questions.length}
                uiLanguage={uiLanguage}
                questionLanguage={questionLanguage}
                selected={selected}
                optionOrder={session.optionOrderOf(currentQuestion.id)}
                marked={marked}
                onSelect={handleSelect}
              />
            </ErrorBoundary>

            <hr className="my-5 border-line" />

            <ExamControls
              language={uiLanguage}
              isFirst={currentIndex === 0}
              isLast={currentIndex === questions.length - 1}
              hasResponse={selected !== null}
              marked={marked}
              onPrevious={goToPrevious}
              onClear={() => clearResponse(currentQuestion.id)}
              onToggleMark={() => toggleMarkForReview(currentQuestion.id)}
              onSaveAndNext={() => {
                if (currentIndex < questions.length - 1) goToNext();
              }}
            />
          </div>

          <p className="mt-4 text-xs text-ink-subtle">
            {uiLanguage === 'hindi'
              ? `सही उत्तर +${examConfig.correctMarks} · गलत उत्तर ${examConfig.incorrectMarks.toFixed(2)} · अनुत्तरित ${examConfig.unansweredMarks.toFixed(2)} · विकल्प E पर ${examConfig.dontKnowMarks}`
              : `Correct +${examConfig.correctMarks} · Incorrect ${examConfig.incorrectMarks.toFixed(2)} · Unanswered ${examConfig.unansweredMarks.toFixed(2)} · Option E ${examConfig.dontKnowMarks}`}
          </p>
        </main>

        <NavigatorSidebar
          questions={questions}
          currentIndex={currentIndex}
          language={uiLanguage}
          counters={counters}
          baseStatusOf={session.baseStatusOf}
          isMarked={session.isMarked}
          onSelect={handleNavigate}
          onSubmit={() => setSubmitOpen(true)}
        />
      </div>

      <NavigatorDrawer
        open={navigatorOpen}
        onClose={() => setNavigatorOpen(false)}
        questions={questions}
        currentIndex={currentIndex}
        language={uiLanguage}
        counters={counters}
        baseStatusOf={session.baseStatusOf}
        isMarked={session.isMarked}
        onSelect={handleNavigate}
        onSubmit={() => {
          setNavigatorOpen(false);
          setSubmitOpen(true);
        }}
      />

      <SubmitConfirmDialog
        open={submitOpen}
        language={uiLanguage}
        counters={counters}
        onCancel={() => setSubmitOpen(false)}
        onConfirm={() => {
          setSubmitOpen(false);
          finishExam();
        }}
      />
    </div>
  );
}

export default ExamPage;
