import type { Question } from '@/types/exam';
import { generalAwarenessQuestions } from './generalAwareness';
import { generalAwarenessPart2Questions } from './generalAwarenessPart2';
import { generalAwarenessPart3Questions } from './generalAwarenessPart3';
import { generalScienceQuestions } from './generalScience';
import { generalSciencePart2Questions } from './generalSciencePart2';
import { generalSciencePart3Questions } from './generalSciencePart3';
import { geographyEnvironmentQuestions } from './geographyEnvironment';
import { geographyEnvironmentPart2Questions } from './geographyEnvironmentPart2';
import { geographyEnvironmentPart3Questions } from './geographyEnvironmentPart3';
import { mathematicsQuestions } from './mathematics';
import { mathematicsPart2Questions } from './mathematicsPart2';
import { mathematicsPart3Questions } from './mathematicsPart3';
import { nationalMovementQuestions } from './nationalMovement';
import { nationalMovementPart2Questions } from './nationalMovementPart2';
import { nationalMovementPart3Questions } from './nationalMovementPart3';
import { paper1EnglishQuestions } from './paper1English';
import { paper1EnglishPart2Questions } from './paper1EnglishPart2';
import { paper1EnglishPart3Questions } from './paper1EnglishPart3';
import { paper1HindiQuestions } from './paper1Hindi';
import { paper1HindiPart2Questions } from './paper1HindiPart2';
import { paper1HindiPart3Questions } from './paper1HindiPart3';
import { reasoningQuestions } from './reasoning';
import { reasoningPart2Questions } from './reasoningPart2';
import { reasoningPart3Questions } from './reasoningPart3';
import { socialStudiesQuestions } from './socialStudies';
import { socialStudiesPart2Questions } from './socialStudiesPart2';
import { socialStudiesPart3Questions } from './socialStudiesPart3';

/**
 * The shared question bank.
 *
 * Each bank is the concatenation of its part files, kept in a fixed order.
 * Practice Set N draws its share of every bank starting at offset
 * `count x (N - 1)` (see `src/data/mockTests/blueprint.ts`), so growing a bank
 * simply means adding another part file here — no set definition changes.
 */
export const questionBank = {
  paper1Hindi: [...paper1HindiQuestions, ...paper1HindiPart2Questions, ...paper1HindiPart3Questions],
  paper1English: [...paper1EnglishQuestions, ...paper1EnglishPart2Questions, ...paper1EnglishPart3Questions],
  mathematics: [...mathematicsQuestions, ...mathematicsPart2Questions, ...mathematicsPart3Questions],
  reasoning: [...reasoningQuestions, ...reasoningPart2Questions, ...reasoningPart3Questions],
  generalAwareness: [...generalAwarenessQuestions, ...generalAwarenessPart2Questions, ...generalAwarenessPart3Questions],
  generalScience: [...generalScienceQuestions, ...generalSciencePart2Questions, ...generalSciencePart3Questions],
  socialStudies: [...socialStudiesQuestions, ...socialStudiesPart2Questions, ...socialStudiesPart3Questions],
  geographyEnvironment: [...geographyEnvironmentQuestions, ...geographyEnvironmentPart2Questions, ...geographyEnvironmentPart3Questions],
  nationalMovement: [...nationalMovementQuestions, ...nationalMovementPart2Questions, ...nationalMovementPart3Questions],
} as const;

export type QuestionBankKey = keyof typeof questionBank;

/** Every question in the project, in bank order. */
export const allQuestions: Question[] = Object.values(questionBank).flat();

/** Question counts per bank — used by the syllabus coverage page. */
export const questionBankSizes: Record<QuestionBankKey, number> = Object.fromEntries(
  Object.entries(questionBank).map(([key, questions]) => [key, questions.length]),
) as Record<QuestionBankKey, number>;
