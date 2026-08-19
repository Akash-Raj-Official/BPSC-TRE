import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { examConfig, resolveDurationSeconds } from '@/config/examConfig';
import { DONT_KNOW_OPTION } from '@/types/exam';
import type { AnswerOption, ExamState, Language, MockTest, SelectableOption } from '@/types/exam';
import { DEFAULT_OPTION_ORDER, hashSeed, shuffle } from '@/utils/random';
import { safeStateStorage, STORAGE_KEYS } from '@/utils/storage';

/**
 * Central examination state.
 *
 * Only *identifiers* live here — never question objects. That keeps the
 * persisted payload small and means a correction to the question bank is
 * picked up by an in-progress session on the next render.
 */

export interface ExamActions {
  /** Begins a fresh attempt, discarding any previous session. */
  startExam: (
    test: MockTest,
    options?: {
      /** Medium of the question paper for this attempt. */
      questionLanguage?: Language;
      candidateName?: string;
      /** Overrides the test duration; the listing page supplies the scaled value. */
      durationSeconds?: number;
    },
  ) => void;
  setCandidateName: (candidateName: string) => void;
  /**
   * Sets the medium of the *question paper* only. The website's own language
   * is a separate preference held in `uiLanguageStore`.
   */
  setQuestionLanguage: (language: Language) => void;
  goToIndex: (index: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  markVisited: (questionId: string) => void;
  selectAnswer: (questionId: string, option: SelectableOption) => void;
  clearResponse: (questionId: string) => void;
  toggleMarkForReview: (questionId: string) => void;
  /** Freezes the attempt. Returns the submission timestamp. */
  submitExam: (options?: { auto?: boolean; now?: number }) => number;
  /** Clears the session entirely (used after the result has been stored). */
  resetExam: () => void;
}

export type ExamStore = ExamState & ExamActions;

const initialState: ExamState = {
  testId: null,
  candidateName: '',
  questionOrder: [],
  currentQuestionIndex: 0,
  selectedAnswers: {},
  markedForReview: {},
  visited: {},
  optionOrder: {},
  language: examConfig.defaultLanguage,
  examStartTime: null,
  examEndTime: null,
  submittedAt: null,
  status: 'idle',
  autoSubmitted: false,
};

/**
 * Builds the question and option order for a new attempt.
 * Both are stored, so a refresh can never reshuffle a running paper.
 */
function buildOrder(test: MockTest, startedAt: number) {
  const ids = test.questions.map((question) => question.id);
  const seed = hashSeed(`${test.id}:${startedAt}`);

  const questionOrder = examConfig.randomizeQuestions ? shuffle(ids, seed) : ids;

  const optionOrder: Record<string, AnswerOption[]> = {};
  if (examConfig.randomizeOptions) {
    for (const question of test.questions) {
      optionOrder[question.id] = shuffle(DEFAULT_OPTION_ORDER, hashSeed(`${question.id}:${seed}`));
    }
  }

  return { questionOrder, optionOrder };
}

export const useExamStore = create<ExamStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      startExam: (test, options) => {
        const now = Date.now();
        const { questionOrder, optionOrder } = buildOrder(test, now);

        set({
          testId: test.id,
          candidateName: (options?.candidateName ?? get().candidateName).trim(),
          questionOrder,
          optionOrder,
          currentQuestionIndex: 0,
          selectedAnswers: {},
          markedForReview: {},
          visited: questionOrder[0] ? { [questionOrder[0]]: true } : {},
          language: options?.questionLanguage ?? get().language ?? examConfig.defaultLanguage,
          examStartTime: now,
          examEndTime:
            now + (options?.durationSeconds ?? resolveDurationSeconds(test.durationMinutes)) * 1000,
          submittedAt: null,
          status: 'in-progress',
          autoSubmitted: false,
        });
      },

      setCandidateName: (candidateName) =>
        set({ candidateName: candidateName.slice(0, examConfig.maxCandidateNameLength) }),

      // Switching the paper medium must not touch answers, position or the
      // clock — and it must not touch the interface language either.
      setQuestionLanguage: (language) => set({ language }),

      goToIndex: (index) => {
        const { questionOrder } = get();
        if (index < 0 || index >= questionOrder.length) return;
        const questionId = questionOrder[index];
        set((state) => ({
          currentQuestionIndex: index,
          visited: questionId ? { ...state.visited, [questionId]: true } : state.visited,
        }));
      },

      goToNext: () => get().goToIndex(get().currentQuestionIndex + 1),
      goToPrevious: () => get().goToIndex(get().currentQuestionIndex - 1),

      markVisited: (questionId) =>
        set((state) => (state.visited[questionId] ? state : { visited: { ...state.visited, [questionId]: true } })),

      /**
       * Records a response. Selecting A–D after E (or vice versa) simply
       * replaces the previous value — only the latest selection counts.
       */
      selectAnswer: (questionId, option) =>
        set((state) => ({
          selectedAnswers: { ...state.selectedAnswers, [questionId]: option },
          visited: { ...state.visited, [questionId]: true },
        })),

      /**
       * Returns the question to the *unanswered* state (null), which attracts
       * negative marking — deliberately different from selecting E.
       */
      clearResponse: (questionId) =>
        set((state) => ({
          selectedAnswers: { ...state.selectedAnswers, [questionId]: null },
        })),

      toggleMarkForReview: (questionId) =>
        set((state) => ({
          markedForReview: { ...state.markedForReview, [questionId]: !state.markedForReview[questionId] },
          visited: { ...state.visited, [questionId]: true },
        })),

      submitExam: (options) => {
        const now = options?.now ?? Date.now();
        const { status } = get();
        if (status === 'submitted') return get().submittedAt ?? now;

        set({ status: 'submitted', submittedAt: now, autoSubmitted: Boolean(options?.auto) });
        return now;
      },

      // Keeps the candidate name and paper medium so the next attempt does not
      // ask for them again.
      resetExam: () => set({ ...initialState, language: get().language, candidateName: get().candidateName }),
    }),
    {
      name: STORAGE_KEYS.examSession,
      version: 1,
      storage: createJSONStorage(() => safeStateStorage),
      partialize: (state): ExamState => ({
        testId: state.testId,
        candidateName: state.candidateName,
        questionOrder: state.questionOrder,
        currentQuestionIndex: state.currentQuestionIndex,
        selectedAnswers: state.selectedAnswers,
        markedForReview: state.markedForReview,
        visited: state.visited,
        optionOrder: state.optionOrder,
        language: state.language,
        examStartTime: state.examStartTime,
        examEndTime: state.examEndTime,
        submittedAt: state.submittedAt,
        status: state.status,
        autoSubmitted: state.autoSubmitted,
      }),
      /**
       * Hand-edited or partially written localStorage must not crash the app;
       * anything that fails the shape check falls back to a clean session.
       */
      merge: (persisted, current) => {
        const restored = sanitisePersistedState(persisted);
        return { ...current, ...restored };
      },
    },
  ),
);

const isRecordOf = (value: unknown, predicate: (entry: unknown) => boolean): boolean =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && Object.values(value).every(predicate);

const isSelectable = (value: unknown): boolean =>
  value === null || (typeof value === 'string' && ['A', 'B', 'C', 'D', DONT_KNOW_OPTION].includes(value));

function sanitisePersistedState(persisted: unknown): Partial<ExamState> {
  if (typeof persisted !== 'object' || persisted === null) return {};
  const candidate = persisted as Partial<ExamState>;

  const validTestId = typeof candidate.testId === 'string' && candidate.testId.length > 0;
  const validOrder = Array.isArray(candidate.questionOrder) && candidate.questionOrder.every((id) => typeof id === 'string');
  const validAnswers = isRecordOf(candidate.selectedAnswers, isSelectable);
  const validTimes =
    (candidate.examStartTime === null || typeof candidate.examStartTime === 'number') &&
    (candidate.examEndTime === null || typeof candidate.examEndTime === 'number');
  const validStatus =
    candidate.status === 'idle' || candidate.status === 'in-progress' || candidate.status === 'submitted';

  if (!validTestId || !validOrder || !validAnswers || !validTimes || !validStatus) {
    // Keep only the harmless preferences worth retaining.
    const language = candidate.language === 'hindi' || candidate.language === 'english' ? candidate.language : undefined;
    const candidateName = typeof candidate.candidateName === 'string' ? candidate.candidateName : undefined;
    const kept: Partial<ExamState> = {};
    if (language) kept.language = language;
    if (candidateName) kept.candidateName = candidateName;
    return kept;
  }

  return {
    testId: candidate.testId,
    candidateName: typeof candidate.candidateName === 'string' ? candidate.candidateName : '',
    questionOrder: candidate.questionOrder,
    currentQuestionIndex:
      typeof candidate.currentQuestionIndex === 'number' && candidate.currentQuestionIndex >= 0
        ? candidate.currentQuestionIndex
        : 0,
    selectedAnswers: candidate.selectedAnswers ?? {},
    markedForReview: isRecordOf(candidate.markedForReview, (entry) => typeof entry === 'boolean')
      ? candidate.markedForReview
      : {},
    visited: isRecordOf(candidate.visited, (entry) => typeof entry === 'boolean') ? candidate.visited : {},
    optionOrder: isRecordOf(candidate.optionOrder, (entry) => Array.isArray(entry)) ? candidate.optionOrder : {},
    language: candidate.language === 'hindi' || candidate.language === 'english' ? candidate.language : examConfig.defaultLanguage,
    examStartTime: candidate.examStartTime ?? null,
    examEndTime: candidate.examEndTime ?? null,
    submittedAt: typeof candidate.submittedAt === 'number' ? candidate.submittedAt : null,
    status: candidate.status,
    autoSubmitted: Boolean(candidate.autoSubmitted),
  };
}

/** True when a resumable attempt is sitting in storage. */
export function hasResumableSession(state: ExamState): boolean {
  return state.status === 'in-progress' && Boolean(state.testId) && Boolean(state.examEndTime);
}
