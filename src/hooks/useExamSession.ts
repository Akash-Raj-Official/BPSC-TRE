import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/config/routes';
import { getMockTest } from '@/data/mockTests';
import { DONT_KNOW_OPTION } from '@/types/exam';
import type {
  AnswerOption,
  MockTest,
  Question,
  QuestionStatus,
  StoredAnswer,
  StoredResultSummary,
} from '@/types/exam';
import { useExamStore } from '@/store/examStore';
import { calculateResult, countAttempts } from '@/utils/scoring';
import type { AttemptCounters } from '@/utils/scoring';
import { DEFAULT_OPTION_ORDER } from '@/utils/random';
import { saveResultRecord } from '@/utils/storage';

/** Base state of a question, before the "marked for review" flag is applied. */
export type BaseQuestionStatus = Extract<QuestionStatus, 'unvisited' | 'visited' | 'answered' | 'dontKnow'>;

export interface ExamSession {
  test: MockTest | undefined;
  /** Questions in presentation order (honours stored randomisation). */
  questions: Question[];
  currentQuestion: Question | undefined;
  currentIndex: number;
  counters: AttemptCounters;
  answerOf: (questionId: string) => StoredAnswer;
  isMarked: (questionId: string) => boolean;
  baseStatusOf: (questionId: string) => BaseQuestionStatus;
  optionOrderOf: (questionId: string) => AnswerOption[];
}

/**
 * Derives everything the exam UI needs from the store plus the question bank.
 * The store holds ids only, so this hook is where ids become questions.
 */
export function useExamSession(testId: string | undefined): ExamSession {
  const questionOrder = useExamStore((state) => state.questionOrder);
  const currentIndex = useExamStore((state) => state.currentQuestionIndex);
  const selectedAnswers = useExamStore((state) => state.selectedAnswers);
  const markedForReview = useExamStore((state) => state.markedForReview);
  const visited = useExamStore((state) => state.visited);
  const optionOrder = useExamStore((state) => state.optionOrder);

  const test = useMemo(() => getMockTest(testId), [testId]);

  const questions = useMemo(() => {
    if (!test) return [];
    if (questionOrder.length === 0) return test.questions;

    const byId = new Map(test.questions.map((question) => [question.id, question]));
    const ordered = questionOrder
      .map((id) => byId.get(id))
      .filter((question): question is Question => Boolean(question));

    // A stored order that no longer matches the bank (question added/removed)
    // falls back to the authored order rather than dropping questions.
    return ordered.length === test.questions.length ? ordered : test.questions;
  }, [test, questionOrder]);

  const counters = useMemo(
    () => countAttempts(questions, selectedAnswers, markedForReview, visited),
    [questions, selectedAnswers, markedForReview, visited],
  );

  const answerOf = useCallback(
    (questionId: string): StoredAnswer => selectedAnswers[questionId] ?? null,
    [selectedAnswers],
  );

  const isMarked = useCallback(
    (questionId: string): boolean => Boolean(markedForReview[questionId]),
    [markedForReview],
  );

  const baseStatusOf = useCallback(
    (questionId: string): BaseQuestionStatus => {
      const selected = selectedAnswers[questionId] ?? null;
      if (selected === DONT_KNOW_OPTION) return 'dontKnow';
      if (selected !== null) return 'answered';
      return visited[questionId] ? 'visited' : 'unvisited';
    },
    [selectedAnswers, visited],
  );

  const optionOrderOf = useCallback(
    (questionId: string): AnswerOption[] => optionOrder[questionId] ?? DEFAULT_OPTION_ORDER,
    [optionOrder],
  );

  const boundedIndex = Math.min(Math.max(currentIndex, 0), Math.max(questions.length - 1, 0));

  return {
    test,
    questions,
    currentQuestion: questions[boundedIndex],
    currentIndex: boundedIndex,
    counters,
    answerOf,
    isMarked,
    baseStatusOf,
    optionOrderOf,
  };
}

/** Combines the base state with the review flag for the navigator palette. */
export function toPaletteState(base: BaseQuestionStatus, marked: boolean): QuestionStatus {
  if (!marked) return base;
  return base === 'answered' || base === 'dontKnow' ? 'answeredAndMarked' : 'markedForReview';
}

/**
 * Ends the attempt: scores it, stores the result, clears the live session and
 * routes to the result page. Used by both the submit button and the timer.
 */
export function useFinishExam(test: MockTest | undefined): (options?: { auto?: boolean }) => void {
  const navigate = useNavigate();

  return useCallback(
    (options) => {
      if (!test) return;

      const state = useExamStore.getState();
      if (state.status === 'submitted') return;

      const submittedAt = state.submitExam({ auto: options?.auto });
      const examStartTime = state.examStartTime ?? submittedAt;
      const examEndTime = state.examEndTime ?? submittedAt;

      const candidateName = state.candidateName.trim();

      const result = calculateResult({
        testId: test.id,
        candidateName,
        questions: state.questionOrder.length
          ? orderQuestions(test, state.questionOrder)
          : test.questions,
        selectedAnswers: state.selectedAnswers,
        markedForReview: state.markedForReview,
        language: state.language,
        examStartTime,
        examEndTime,
        submittedAt,
        autoSubmitted: Boolean(options?.auto),
      });

      const summary: StoredResultSummary = {
        testId: test.id,
        testTitle: test.title,
        candidateName,
        submittedAt,
        autoSubmitted: Boolean(options?.auto),
        finalScore: result.overall.finalScore,
        maxScore: result.overall.maxScore,
        accuracy: result.overall.accuracy,
        correct: result.overall.correct,
        incorrect: result.overall.incorrect,
        dontKnow: result.overall.dontKnow,
        unanswered: result.overall.unanswered,
        timeTakenSeconds: result.timeTakenSeconds,
      };

      saveResultRecord({ summary, result });
      // Route away first, then clear the session: the exam screen must never
      // render a frame in which the attempt has vanished but the route has not
      // yet changed.
      navigate(routes.result(test.id), { replace: true });
      useExamStore.getState().resetExam();
    },
    [navigate, test],
  );
}

function orderQuestions(test: MockTest, order: string[]): Question[] {
  const byId = new Map(test.questions.map((question) => [question.id, question]));
  const ordered = order.map((id) => byId.get(id)).filter((question): question is Question => Boolean(question));
  return ordered.length === test.questions.length ? ordered : test.questions;
}
