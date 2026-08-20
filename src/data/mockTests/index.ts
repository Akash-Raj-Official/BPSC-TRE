import { examConfig, resolveDurationSeconds } from '@/config/examConfig';
import type { MockTest, PaperId, Question } from '@/types/exam';
import { blueprintTotal } from './blueprint';
import { practiceSet01 } from './practiceSet01';
import { practiceSet02 } from './practiceSet02';
import { practiceSet03 } from './practiceSet03';
import { practiceSet04 } from './practiceSet04';
import { practiceSet05 } from './practiceSet05';
import { practiceSet06 } from './practiceSet06';
import { practiceSet07 } from './practiceSet07';

/**
 * Registry of every practice set.
 *
 * Adding a set: create `practiceSet0N.ts` (three lines — it just calls
 * `buildPracticeSet(id, N - 1)`), then add it to this array. Routing, the
 * listing page and the results history all read from here, so nothing else
 * needs to change.
 */
export const mockTests: MockTest[] = [
  practiceSet01,
  practiceSet02,
  practiceSet03,
  practiceSet04,
  practiceSet05,
  practiceSet06,
  practiceSet07,
];

const mockTestMap = new Map(mockTests.map((test) => [test.id, test]));

export function getMockTest(testId: string | undefined): MockTest | undefined {
  if (!testId) return undefined;
  return mockTestMap.get(testId);
}

export function mockTestExists(testId: string | undefined): boolean {
  return typeof testId === 'string' && mockTestMap.has(testId);
}

/** Aggregated facts about a test, derived once and reused across pages. */
export interface MockTestSummary {
  id: string;
  totalQuestions: number;
  paper1Questions: number;
  paper2Questions: number;
  durationMinutes: number;
  durationSeconds: number;
  maxMarks: number;
  subjects: string[];
  /** True when the set does not yet match the full 150-question blueprint. */
  isPartialBlueprint: boolean;
}

const countByPaper = (questions: Question[], paper: PaperId): number =>
  questions.reduce((total, question) => (question.paper === paper ? total + 1 : total), 0);

/**
 * Duration scales with the actual number of questions, so a set that is
 * temporarily short of the full blueprint still allows the same time per
 * question as the real paper (120 minutes for 150 questions).
 */
function durationForTest(test: MockTest): number {
  if (test.durationMinutes) return test.durationMinutes;
  if (test.questions.length >= blueprintTotal) return examConfig.durationMinutes;
  const scaled = Math.round((test.questions.length / blueprintTotal) * examConfig.durationMinutes);
  return Math.max(5, scaled);
}

export function summariseMockTest(test: MockTest): MockTestSummary {
  const durationMinutes = durationForTest(test);

  return {
    id: test.id,
    totalQuestions: test.questions.length,
    paper1Questions: countByPaper(test.questions, 'paper1'),
    paper2Questions: countByPaper(test.questions, 'paper2'),
    durationMinutes,
    durationSeconds: resolveDurationSeconds(durationMinutes),
    maxMarks: test.questions.length * examConfig.correctMarks,
    subjects: Array.from(new Set(test.questions.map((question) => question.subject))),
    isPartialBlueprint: test.questions.length !== blueprintTotal,
  };
}

export const mockTestSummaries: Record<string, MockTestSummary> = Object.fromEntries(
  mockTests.map((test) => [test.id, summariseMockTest(test)]),
);

export function getMockTestSummary(testId: string | undefined): MockTestSummary | undefined {
  if (!testId) return undefined;
  return mockTestSummaries[testId];
}

export {
  blueprintTotal,
  practiceSet01,
  practiceSet02,
  practiceSet03,
  practiceSet04,
  practiceSet05,
  practiceSet06,
  practiceSet07,
};
