import type { Question } from '@/types/exam';

/**
 * Helpers for assembling a mock test out of the shared question bank.
 *
 * Keeping composition declarative means the blueprint of a paper (how many
 * questions come from each subject) is visible at a glance and can be adjusted
 * without touching any question text.
 */

export interface BlueprintSlice {
  /** Human-readable name used in warnings. */
  label: string;
  bank: readonly Question[];
  count: number;
  /** How many questions to skip, so different tests use different questions. */
  offset?: number;
}

const warned = new Set<string>();

function warnOnce(key: string, message: string): void {
  // Optional chaining keeps this safe when the module is loaded by the Node
  // validation script, where `import.meta.env` does not exist.
  if (!import.meta.env?.DEV || warned.has(key)) return;
  warned.add(key);
  // Surfaces an under-filled blueprint during development without breaking the
  // app for the candidate — the test simply contains fewer questions.
  console.warn(`[mock-test] ${message}`);
}

/**
 * Takes `count` questions from each slice, starting at `offset`.
 * A slice that cannot supply enough questions contributes everything it has.
 */
export function compose(testId: string, slices: BlueprintSlice[]): Question[] {
  const questions: Question[] = [];

  for (const slice of slices) {
    const offset = slice.offset ?? 0;
    const selected = slice.bank.slice(offset, offset + slice.count);
    if (selected.length < slice.count) {
      warnOnce(
        `${testId}:${slice.label}`,
        `"${testId}" asked for ${slice.count} question(s) from ${slice.label} at offset ${offset}, ` +
          `but only ${selected.length} were available. Add more questions to that bank.`,
      );
    }
    questions.push(...selected);
  }

  return dedupe(testId, questions);
}

/** Selects every question whose `subject/topic` pair appears in the list. */
export function selectByTopics(
  testId: string,
  bank: readonly Question[],
  topics: ReadonlyArray<{ subject: string; topic?: string }>,
): Question[] {
  const matches = bank.filter((question) =>
    topics.some(
      (filter) =>
        filter.subject === question.subject && (filter.topic === undefined || filter.topic === question.topic),
    ),
  );

  if (matches.length === 0) {
    warnOnce(`${testId}:topics`, `"${testId}" matched no questions for its topic filter.`);
  }

  return dedupe(testId, matches);
}

/** Guards against the same question appearing twice in one paper. */
function dedupe(testId: string, questions: Question[]): Question[] {
  const seen = new Set<string>();
  const unique: Question[] = [];

  for (const question of questions) {
    if (seen.has(question.id)) {
      warnOnce(`${testId}:dup:${question.id}`, `"${testId}" selected question "${question.id}" more than once.`);
      continue;
    }
    seen.add(question.id);
    unique.push(question);
  }

  return unique;
}

/** Paper I first, then Paper II — the order a candidate expects. */
export function orderByPaper(questions: Question[]): Question[] {
  return [
    ...questions.filter((question) => question.paper === 'paper1'),
    ...questions.filter((question) => question.paper === 'paper2'),
  ];
}
