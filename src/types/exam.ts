/**
 * Core domain types for the BPSC TRE mock test platform.
 *
 * The single most important modelling decision lives here: an answer of `'E'`
 * ("Not Known") and an answer of `null` (never answered) are *different*
 * values with *different* marks. Nothing in the application may collapse them.
 */

/** Languages a question can be authored in. Extend `examConfig.languages` too. */
export type Language = 'hindi' | 'english';

/** The four real answer options that can be marked correct. */
export type AnswerOption = 'A' | 'B' | 'C' | 'D';

/** The synthetic "Not Known" option. Never stored in the question bank. */
export const DONT_KNOW_OPTION = 'E' as const;
export type DontKnowOption = typeof DONT_KNOW_OPTION;

/** Everything the candidate can pick in the UI. */
export type SelectableOption = AnswerOption | DontKnowOption;

/**
 * A stored response.
 * `'A' | 'B' | 'C' | 'D'` -> evaluated against `correctOption`
 * `'E'`                   -> explicit "Not Known", zero marks
 * `null`                  -> not answered, negative marks
 */
export type StoredAnswer = SelectableOption | null;

export type PaperId = 'paper1' | 'paper2';

/** Text that may be authored in one or both languages. */
export type LocalizedText = Partial<Record<Language, string>>;

export interface QuestionOption {
  hindi?: string;
  english?: string;
}

/**
 * Provenance of a question.
 *
 * The bundled bank is *modelled on* the pattern of previous BPSC examinations —
 * it is not a verbatim reproduction of any official paper. `exam` / `year`
 * therefore describe the pattern the question follows, and the UI labels it as
 * a practice question rather than an official one.
 */
export interface QuestionSource {
  /** Examination whose pattern the question follows, e.g. "BPSC TRE-2". */
  exam?: string;
  /** Year of that examination. */
  year?: number;
  /** Free-form note shown on the review screen. */
  note?: string;
}

export interface Question {
  /** Stable, unique identifier. Answers are keyed by this, never by index. */
  id: string;
  paper: PaperId;
  /** Subject key, see `src/data/subjects.ts`. */
  subject: string;
  /** Topic key belonging to the subject. */
  topic: string;
  question: LocalizedText;
  options: {
    A: QuestionOption;
    B: QuestionOption;
    C: QuestionOption;
    D: QuestionOption;
  };
  correctOption: AnswerOption;
  explanation?: LocalizedText;
  /**
   * Paper I questions belong to a language section (e.g. Hindi / English).
   * Paper II questions leave this undefined.
   */
  section?: string;
  /**
   * Marks practice content authored for this project. These questions are NOT
   * verbatim official BPSC questions and are badged as such in the UI.
   */
  demo?: boolean;
  /** Which past examination pattern the question follows. */
  source?: QuestionSource;
}

/** A question paired with its position in the running exam. */
export interface IndexedQuestion {
  question: Question;
  index: number;
  /** 1-based number shown to the candidate within its paper. */
  numberInPaper: number;
}

export interface MockTest {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  /** Overrides `examConfig.durationMinutes` when present. */
  durationMinutes?: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  questions: Question[];
  /** True when the test ships with demonstration questions only. */
  demo?: boolean;
}

/** Runtime status of a question, derived — never stored. */
export type QuestionStatus =
  | 'unvisited'
  | 'visited'
  | 'answered'
  | 'dontKnow'
  | 'markedForReview'
  | 'answeredAndMarked';

/** Post-submission verdict for a question. */
export type QuestionVerdict = 'correct' | 'incorrect' | 'dontKnow' | 'unanswered';

export type ExamStatus = 'idle' | 'in-progress' | 'submitted';

export interface ExamState {
  testId: string | null;
  /** Name typed by the candidate before starting. Shown on the score card. */
  candidateName: string;
  /** Question ids in presentation order (honours randomisation when enabled). */
  questionOrder: string[];
  currentQuestionIndex: number;
  selectedAnswers: Record<string, StoredAnswer>;
  markedForReview: Record<string, boolean>;
  visited: Record<string, boolean>;
  /** Per-question option order when option randomisation is enabled. */
  optionOrder: Record<string, AnswerOption[]>;
  language: Language;
  examStartTime: number | null;
  examEndTime: number | null;
  /** Epoch ms at which the candidate submitted (or the timer expired). */
  submittedAt: number | null;
  status: ExamStatus;
  /** True when the exam ended because the timer ran out. */
  autoSubmitted: boolean;
}

export interface QuestionResult {
  questionId: string;
  paper: PaperId;
  subject: string;
  topic: string;
  selected: StoredAnswer;
  correctOption: AnswerOption;
  verdict: QuestionVerdict;
  marks: number;
  markedForReview: boolean;
}

export interface ScoreBreakdown {
  totalQuestions: number;
  correct: number;
  incorrect: number;
  dontKnow: number;
  unanswered: number;
  /** Questions with any explicit selection, including "Not Known". */
  attempted: number;
  /** Questions answered with A–D (the denominator for accuracy). */
  evaluated: number;
  positiveMarks: number;
  /** Always reported as a positive magnitude. */
  negativeMarks: number;
  finalScore: number;
  maxScore: number;
  /** correct / evaluated, as a percentage. 0 when nothing was evaluated. */
  accuracy: number;
  /** correct / totalQuestions, as a percentage. */
  overallPercentage: number;
}

export interface SegmentPerformance {
  key: string;
  label: LocalizedText;
  total: number;
  attempted: number;
  correct: number;
  incorrect: number;
  dontKnow: number;
  unanswered: number;
  score: number;
  maxScore: number;
  accuracy: number;
  /** True when accuracy sits below `examConfig.weakTopicThreshold`. */
  needsImprovement: boolean;
}

export interface ExamResult {
  testId: string;
  candidateName: string;
  submittedAt: number;
  autoSubmitted: boolean;
  language: Language;
  timeTakenSeconds: number;
  timeRemainingSeconds: number;
  durationSeconds: number;
  overall: ScoreBreakdown;
  byPaper: Array<{ paper: PaperId; breakdown: ScoreBreakdown }>;
  bySubject: SegmentPerformance[];
  byTopic: SegmentPerformance[];
  questions: QuestionResult[];
}

/** Compact record kept in the results history list. */
export interface StoredResultSummary {
  testId: string;
  testTitle: LocalizedText;
  candidateName: string;
  submittedAt: number;
  autoSubmitted: boolean;
  finalScore: number;
  maxScore: number;
  accuracy: number;
  correct: number;
  incorrect: number;
  dontKnow: number;
  unanswered: number;
  timeTakenSeconds: number;
}
