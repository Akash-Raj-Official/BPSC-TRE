import { describe, expect, it } from 'vitest';
import { examConfig } from '@/config/examConfig';
import type { Question, StoredAnswer } from '@/types/exam';
import {
  buildQuestionResults,
  calculateResult,
  countAttempts,
  evaluateAnswer,
  marksForVerdict,
  summariseResults,
} from './scoring';

/**
 * Acceptance tests for the marking rules.
 *
 * These mirror the scenarios in the project brief: the four answer states must
 * score +1, −1/3, 0 and −1/3 respectively, and "E" must never be collapsed
 * into "unanswered".
 */

function makeQuestion(id: string, correctOption: Question['correctOption'], subject = 'mathematics', topic = 'percentage'): Question {
  return {
    id,
    paper: 'paper2',
    subject,
    topic,
    question: { english: `Question ${id}`, hindi: `प्रश्न ${id}` },
    options: {
      A: { english: 'A', hindi: 'A' },
      B: { english: 'B', hindi: 'B' },
      C: { english: 'C', hindi: 'C' },
      D: { english: 'D', hindi: 'D' },
    },
    correctOption,
  };
}

const ONE_THIRD = 1 / 3;

describe('evaluateAnswer', () => {
  it('marks a matching A–D selection as correct', () => {
    expect(evaluateAnswer('B', 'B')).toBe('correct');
  });

  it('marks a non-matching A–D selection as incorrect', () => {
    expect(evaluateAnswer('A', 'B')).toBe('incorrect');
  });

  it('treats E as an explicit "I do not know", never as unanswered', () => {
    expect(evaluateAnswer('E', 'B')).toBe('dontKnow');
  });

  it('treats null and undefined as unanswered', () => {
    expect(evaluateAnswer(null, 'B')).toBe('unanswered');
    expect(evaluateAnswer(undefined, 'B')).toBe('unanswered');
  });
});

describe('marksForVerdict', () => {
  it('scenario 1: a correct A–D answer scores +1', () => {
    expect(marksForVerdict('correct')).toBe(examConfig.correctMarks);
    expect(marksForVerdict('correct')).toBe(1);
  });

  it('scenario 2: an incorrect A–D answer scores -1/3', () => {
    expect(marksForVerdict('incorrect')).toBeCloseTo(-ONE_THIRD, 10);
  });

  it('scenario 3: selecting E scores 0', () => {
    expect(marksForVerdict('dontKnow')).toBe(0);
  });

  it('scenario 4: leaving a question unanswered scores -1/3', () => {
    expect(marksForVerdict('unanswered')).toBeCloseTo(-ONE_THIRD, 10);
  });
});

describe('summariseResults', () => {
  it('matches the worked example from the brief (80 / 20 / 10 / 10 -> 70.00)', () => {
    const questions: Question[] = [];
    const answers: Record<string, StoredAnswer> = {};

    // 80 correct, 20 incorrect, 10 "Not Known", 10 unanswered.
    for (let index = 0; index < 120; index += 1) {
      const id = `Q${index}`;
      questions.push(makeQuestion(id, 'A'));
      if (index < 80) answers[id] = 'A';
      else if (index < 100) answers[id] = 'B';
      else if (index < 110) answers[id] = 'E';
      else answers[id] = null;
    }

    const breakdown = summariseResults(buildQuestionResults(questions, answers, {}));

    expect(breakdown.correct).toBe(80);
    expect(breakdown.incorrect).toBe(20);
    expect(breakdown.dontKnow).toBe(10);
    expect(breakdown.unanswered).toBe(10);
    expect(breakdown.attempted).toBe(110);
    expect(breakdown.positiveMarks).toBe(80);
    expect(breakdown.negativeMarks).toBeCloseTo(10, 6);
    expect(breakdown.finalScore).toBeCloseTo(70, 6);
    expect(breakdown.maxScore).toBe(120);
  });

  it('computes accuracy over evaluated questions only', () => {
    const questions = [makeQuestion('a', 'A'), makeQuestion('b', 'A'), makeQuestion('c', 'A'), makeQuestion('d', 'A')];
    const answers: Record<string, StoredAnswer> = { a: 'A', b: 'B', c: 'E', d: null };

    const breakdown = summariseResults(buildQuestionResults(questions, answers, {}));

    // 1 correct out of 2 evaluated (E and unanswered are excluded).
    expect(breakdown.evaluated).toBe(2);
    expect(breakdown.accuracy).toBe(50);
    expect(breakdown.overallPercentage).toBe(25);
  });

  it('reports zero accuracy rather than NaN when nothing was evaluated', () => {
    const questions = [makeQuestion('a', 'A'), makeQuestion('b', 'A')];
    const breakdown = summariseResults(buildQuestionResults(questions, { a: 'E', b: null }, {}));

    expect(breakdown.accuracy).toBe(0);
    expect(breakdown.dontKnow).toBe(1);
    expect(breakdown.unanswered).toBe(1);
    expect(breakdown.finalScore).toBeCloseTo(-ONE_THIRD, 6);
  });

  it('scenario 5: a cleared response scores as unanswered, not as E', () => {
    const questions = [makeQuestion('a', 'A')];

    const cleared = summariseResults(buildQuestionResults(questions, { a: null }, {}));
    expect(cleared.unanswered).toBe(1);
    expect(cleared.dontKnow).toBe(0);
    expect(cleared.finalScore).toBeCloseTo(-ONE_THIRD, 6);
  });

  it('scenario 6: choosing A after E counts only the latest selection', () => {
    const questions = [makeQuestion('a', 'A')];

    const afterE = summariseResults(buildQuestionResults(questions, { a: 'A' }, {}));
    expect(afterE.correct).toBe(1);
    expect(afterE.dontKnow).toBe(0);
    expect(afterE.finalScore).toBe(1);
  });

  it('rounds away binary floating point noise', () => {
    const questions = Array.from({ length: 3 }, (_, index) => makeQuestion(`q${index}`, 'A'));
    const breakdown = summariseResults(buildQuestionResults(questions, { q0: 'B', q1: 'B', q2: 'B' }, {}));

    // 3 x (-1/3) must be exactly -1, not -0.9999999999999999.
    expect(breakdown.finalScore).toBe(-1);
    expect(breakdown.negativeMarks).toBe(1);
  });
});

describe('calculateResult', () => {
  const questions = [
    makeQuestion('m1', 'A', 'mathematics', 'percentage'),
    makeQuestion('m2', 'B', 'mathematics', 'percentage'),
    { ...makeQuestion('r1', 'C', 'reasoning', 'analogy'), paper: 'paper2' as const },
    { ...makeQuestion('p1', 'D', 'hindi-language', 'grammar'), paper: 'paper1' as const },
  ];

  const start = 1_700_000_000_000;
  const durationMs = 120 * 60 * 1000;

  it('scenario 10: produces an accurate, fully populated result', () => {
    const result = calculateResult({
      testId: 'practice-set-01',
      candidateName: 'Test Candidate',
      questions,
      selectedAnswers: { m1: 'A', m2: 'C', r1: 'E', p1: null },
      markedForReview: { r1: true },
      language: 'english',
      examStartTime: start,
      examEndTime: start + durationMs,
      submittedAt: start + 30 * 60 * 1000,
      autoSubmitted: false,
    });

    expect(result.candidateName).toBe('Test Candidate');
    expect(result.overall.correct).toBe(1);
    expect(result.overall.incorrect).toBe(1);
    expect(result.overall.dontKnow).toBe(1);
    expect(result.overall.unanswered).toBe(1);
    expect(result.overall.finalScore).toBeCloseTo(1 - 2 * ONE_THIRD, 6);

    expect(result.timeTakenSeconds).toBe(30 * 60);
    expect(result.timeRemainingSeconds).toBe(90 * 60);

    // Both papers are represented, and the marked question is preserved.
    expect(result.byPaper.map((entry) => entry.paper)).toEqual(['paper1', 'paper2']);
    expect(result.questions.find((entry) => entry.questionId === 'r1')?.markedForReview).toBe(true);

    // Subject and topic analysis cover every subject present in the paper.
    expect(result.bySubject.map((segment) => segment.key).sort()).toEqual([
      'hindi-language',
      'mathematics',
      'reasoning',
    ]);
    expect(result.byTopic.some((segment) => segment.key === 'mathematics/percentage')).toBe(true);
  });

  it('never reports more time taken than the paper allowed', () => {
    const result = calculateResult({
      testId: 'practice-set-01',
      candidateName: '',
      questions,
      selectedAnswers: {},
      markedForReview: {},
      language: 'english',
      examStartTime: start,
      examEndTime: start + durationMs,
      // Submitted "late" — e.g. the tab was suspended past the deadline.
      submittedAt: start + durationMs + 60_000,
      autoSubmitted: true,
    });

    expect(result.timeTakenSeconds).toBe(120 * 60);
    expect(result.timeRemainingSeconds).toBe(0);
  });
});

describe('countAttempts', () => {
  it('counts E and unanswered separately', () => {
    const questions = [makeQuestion('a', 'A'), makeQuestion('b', 'A'), makeQuestion('c', 'A'), makeQuestion('d', 'A')];

    const counters = countAttempts(
      questions,
      { a: 'A', b: 'E', c: null },
      { a: true },
      { a: true, b: true, c: true },
    );

    expect(counters.answered).toBe(1);
    expect(counters.dontKnow).toBe(1);
    // 'c' is explicitly null and 'd' was never touched — both are unanswered.
    expect(counters.unanswered).toBe(2);
    expect(counters.markedForReview).toBe(1);
    expect(counters.visited).toBe(3);
    expect(counters.total).toBe(4);
  });
});
