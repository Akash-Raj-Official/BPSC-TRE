import { examConfig } from '@/config/examConfig';
import { getSubject, getTopic, topicKeyOf } from '@/data/subjects';
import { DONT_KNOW_OPTION } from '@/types/exam';
import type {
  ExamResult,
  Language,
  LocalizedText,
  PaperId,
  Question,
  QuestionResult,
  QuestionVerdict,
  ScoreBreakdown,
  SegmentPerformance,
  StoredAnswer,
} from '@/types/exam';

/**
 * Pure scoring engine. No React, no storage, no DOM — everything here is a
 * deterministic function of its inputs so it can be unit tested in isolation.
 *
 * The four-state marking rule (the core requirement of the project):
 *
 *   selected === 'A'|'B'|'C'|'D' && selected === correctOption -> correctMarks
 *   selected === 'A'|'B'|'C'|'D' && selected !== correctOption -> incorrectMarks
 *   selected === 'E'                                          -> dontKnowMarks
 *   selected === null / undefined                             -> unansweredMarks
 */

/** Guards against binary floating point noise such as 64.99999999999999. */
const PRECISION_FACTOR = 1e6;

export function roundMarks(value: number): number {
  return Math.round(value * PRECISION_FACTOR) / PRECISION_FACTOR;
}

/**
 * Classifies a single response.
 *
 * `undefined` and `null` are both treated as "never answered"; `'E'` is always
 * treated as an explicit "Not Known" and never as unanswered.
 */
export function evaluateAnswer(
  selected: StoredAnswer | undefined,
  correctOption: Question['correctOption'],
): QuestionVerdict {
  if (selected === DONT_KNOW_OPTION) return 'dontKnow';
  if (selected === null || selected === undefined) return 'unanswered';
  return selected === correctOption ? 'correct' : 'incorrect';
}

/** Marks awarded for a verdict, read straight from the central config. */
export function marksForVerdict(verdict: QuestionVerdict): number {
  switch (verdict) {
    case 'correct':
      return examConfig.correctMarks;
    case 'incorrect':
      return examConfig.incorrectMarks;
    case 'dontKnow':
      return examConfig.dontKnowMarks;
    case 'unanswered':
      return examConfig.unansweredMarks;
  }
}

export function buildQuestionResults(
  questions: Question[],
  selectedAnswers: Record<string, StoredAnswer>,
  markedForReview: Record<string, boolean>,
): QuestionResult[] {
  return questions.map((question) => {
    const selected = selectedAnswers[question.id] ?? null;
    const verdict = evaluateAnswer(selected, question.correctOption);
    return {
      questionId: question.id,
      paper: question.paper,
      subject: question.subject,
      topic: question.topic,
      selected,
      correctOption: question.correctOption,
      verdict,
      marks: marksForVerdict(verdict),
      markedForReview: Boolean(markedForReview[question.id]),
    };
  });
}

const emptyBreakdown = (): ScoreBreakdown => ({
  totalQuestions: 0,
  correct: 0,
  incorrect: 0,
  dontKnow: 0,
  unanswered: 0,
  attempted: 0,
  evaluated: 0,
  positiveMarks: 0,
  negativeMarks: 0,
  finalScore: 0,
  maxScore: 0,
  accuracy: 0,
  overallPercentage: 0,
});

/**
 * Aggregates a list of per-question results into a score breakdown.
 *
 *   positiveMarks = correct x correctMarks
 *   negativeMarks = |incorrect x incorrectMarks + unanswered x unansweredMarks|
 *   finalScore    = positiveMarks - negativeMarks
 *
 * "Not Known" contributes to neither side.
 */
export function summariseResults(results: QuestionResult[]): ScoreBreakdown {
  const breakdown = emptyBreakdown();
  breakdown.totalQuestions = results.length;

  for (const result of results) {
    switch (result.verdict) {
      case 'correct':
        breakdown.correct += 1;
        break;
      case 'incorrect':
        breakdown.incorrect += 1;
        break;
      case 'dontKnow':
        breakdown.dontKnow += 1;
        break;
      case 'unanswered':
        breakdown.unanswered += 1;
        break;
    }
  }

  breakdown.attempted = breakdown.correct + breakdown.incorrect + breakdown.dontKnow;
  breakdown.evaluated = breakdown.correct + breakdown.incorrect;

  breakdown.positiveMarks = roundMarks(breakdown.correct * examConfig.correctMarks);
  breakdown.negativeMarks = roundMarks(
    Math.abs(
      breakdown.incorrect * examConfig.incorrectMarks + breakdown.unanswered * examConfig.unansweredMarks,
    ),
  );
  breakdown.finalScore = roundMarks(breakdown.positiveMarks - breakdown.negativeMarks);
  breakdown.maxScore = roundMarks(breakdown.totalQuestions * examConfig.correctMarks);

  breakdown.accuracy =
    breakdown.evaluated === 0 ? 0 : roundMarks((breakdown.correct / breakdown.evaluated) * 100);
  breakdown.overallPercentage =
    breakdown.totalQuestions === 0 ? 0 : roundMarks((breakdown.correct / breakdown.totalQuestions) * 100);

  return breakdown;
}

function toSegment(key: string, label: LocalizedText, results: QuestionResult[]): SegmentPerformance {
  const breakdown = summariseResults(results);
  return {
    key,
    label,
    total: breakdown.totalQuestions,
    attempted: breakdown.attempted,
    correct: breakdown.correct,
    incorrect: breakdown.incorrect,
    dontKnow: breakdown.dontKnow,
    unanswered: breakdown.unanswered,
    score: breakdown.finalScore,
    maxScore: breakdown.maxScore,
    accuracy: breakdown.accuracy,
    needsImprovement: breakdown.evaluated > 0 && breakdown.accuracy < examConfig.weakTopicThreshold,
  };
}

function groupBy<T>(items: T[], keyOf: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const bucket = groups.get(key);
    if (bucket) bucket.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

export function analyseBySubject(results: QuestionResult[]): SegmentPerformance[] {
  return Array.from(groupBy(results, (result) => result.subject), ([subjectKey, group]) => {
    const subject = getSubject(subjectKey);
    return toSegment(subjectKey, subject?.label ?? { english: subjectKey, hindi: subjectKey }, group);
  }).sort((a, b) => a.accuracy - b.accuracy);
}

export function analyseByTopic(results: QuestionResult[]): SegmentPerformance[] {
  return Array.from(
    groupBy(results, (result) => topicKeyOf(result.subject, result.topic)),
    ([compositeKey, group]) => {
      const first = group[0];
      const topic = first ? getTopic(first.subject, first.topic) : undefined;
      const fallback: LocalizedText = { english: first?.topic ?? compositeKey, hindi: first?.topic ?? compositeKey };
      return toSegment(compositeKey, topic?.label ?? fallback, group);
    },
  ).sort((a, b) => a.accuracy - b.accuracy);
}

export function analyseByPaper(results: QuestionResult[]): Array<{ paper: PaperId; breakdown: ScoreBreakdown }> {
  const papers: PaperId[] = ['paper1', 'paper2'];
  return papers
    .map((paper) => ({ paper, breakdown: summariseResults(results.filter((r) => r.paper === paper)) }))
    .filter((entry) => entry.breakdown.totalQuestions > 0);
}

export interface CalculateResultInput {
  testId: string;
  candidateName: string;
  questions: Question[];
  selectedAnswers: Record<string, StoredAnswer>;
  markedForReview: Record<string, boolean>;
  language: Language;
  examStartTime: number;
  examEndTime: number;
  submittedAt: number;
  autoSubmitted: boolean;
}

/**
 * Builds the complete result object consumed by the result, analysis and
 * review screens.
 */
export function calculateResult(input: CalculateResultInput): ExamResult {
  const questionResults = buildQuestionResults(input.questions, input.selectedAnswers, input.markedForReview);

  const durationSeconds = Math.max(0, Math.round((input.examEndTime - input.examStartTime) / 1000));
  const elapsedSeconds = Math.max(0, Math.round((input.submittedAt - input.examStartTime) / 1000));
  const timeTakenSeconds = Math.min(elapsedSeconds, durationSeconds);
  const timeRemainingSeconds = Math.max(0, durationSeconds - timeTakenSeconds);

  return {
    testId: input.testId,
    candidateName: input.candidateName,
    submittedAt: input.submittedAt,
    autoSubmitted: input.autoSubmitted,
    language: input.language,
    timeTakenSeconds,
    timeRemainingSeconds,
    durationSeconds,
    overall: summariseResults(questionResults),
    byPaper: analyseByPaper(questionResults),
    bySubject: analyseBySubject(questionResults),
    byTopic: analyseByTopic(questionResults),
    questions: questionResults,
  };
}

/** Live counters used by the submit-confirmation modal. */
export interface AttemptCounters {
  answered: number;
  dontKnow: number;
  unanswered: number;
  markedForReview: number;
  visited: number;
  total: number;
}

export function countAttempts(
  questions: Question[],
  selectedAnswers: Record<string, StoredAnswer>,
  markedForReview: Record<string, boolean>,
  visited: Record<string, boolean>,
): AttemptCounters {
  const counters: AttemptCounters = {
    answered: 0,
    dontKnow: 0,
    unanswered: 0,
    markedForReview: 0,
    visited: 0,
    total: questions.length,
  };

  for (const question of questions) {
    const selected = selectedAnswers[question.id] ?? null;
    if (selected === DONT_KNOW_OPTION) counters.dontKnow += 1;
    else if (selected === null) counters.unanswered += 1;
    else counters.answered += 1;

    if (markedForReview[question.id]) counters.markedForReview += 1;
    if (visited[question.id]) counters.visited += 1;
  }

  return counters;
}
