import { questionBank } from '@/data/questions';
import type { QuestionBankKey } from '@/data/questions';
import type { Question } from '@/types/exam';
import { compose } from './composer';

/**
 * The BPSC TRE Preliminary blueprint.
 *
 * Every practice set contains *all* parts of the paper in exactly these
 * proportions — Paper I language plus all seven Paper II subjects — so each set
 * is a complete rehearsal rather than a sectional test.
 *
 * Set N takes its questions from offset `count x N` in each bank, which means
 * no question is ever repeated across sets. Raising a `count` here (or adding
 * questions to a bank) automatically flows through to every set.
 */
export interface BlueprintRow {
  label: string;
  bank: QuestionBankKey;
  count: number;
}

export const paperBlueprint: BlueprintRow[] = [
  // ------------------------------ Paper I (30) ------------------------------
  { label: 'Paper I — Hindi', bank: 'paper1Hindi', count: 15 },
  { label: 'Paper I — English', bank: 'paper1English', count: 15 },

  // ----------------------------- Paper II (120) -----------------------------
  { label: 'Elementary Mathematics', bank: 'mathematics', count: 20 },
  { label: 'Mental Ability and Reasoning', bank: 'reasoning', count: 20 },
  { label: 'General Awareness and Current Affairs', bank: 'generalAwareness', count: 20 },
  { label: 'General Science', bank: 'generalScience', count: 20 },
  { label: 'Social Studies', bank: 'socialStudies', count: 13 },
  { label: 'Geography and Environment', bank: 'geographyEnvironment', count: 14 },
  { label: 'Indian National Movement', bank: 'nationalMovement', count: 13 },
];

/** Total questions a complete set aims for (30 + 120 = 150). */
export const blueprintTotal = paperBlueprint.reduce((total, row) => total + row.count, 0);

/**
 * Builds practice set number `setIndex` (0-based).
 * A bank that cannot supply its full share contributes what it has and logs a
 * development warning, so the set is short rather than broken.
 */
export function buildPracticeSet(testId: string, setIndex: number): Question[] {
  return compose(
    testId,
    paperBlueprint.map((row) => ({
      label: row.label,
      bank: questionBank[row.bank],
      count: row.count,
      offset: row.count * setIndex,
    })),
  );
}
