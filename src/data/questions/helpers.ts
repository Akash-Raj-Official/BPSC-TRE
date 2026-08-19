import type { AnswerOption, PaperId, Question, QuestionSource } from '@/types/exam';

/**
 * Compact authoring format for the question bank.
 *
 * Writing the full `Question` shape by hand is noisy and easy to get wrong, so
 * every bank file declares seeds and `buildQuestions` expands them into the
 * validated domain object. Option order is always [A, B, C, D] and each option
 * is a `[hindi, english]` pair.
 */
export interface QuestionSeed {
  id: string;
  topic: string;
  /** Question text in Hindi. */
  hi: string;
  /** Question text in English. */
  en: string;
  options: [
    [string, string],
    [string, string],
    [string, string],
    [string, string],
  ];
  answer: AnswerOption;
  /** Explanation in Hindi. */
  exHi: string;
  /** Explanation in English. */
  exEn: string;
  /** Past-paper pattern this question follows. */
  source?: QuestionSource;
  /** Paper I language section, e.g. 'hindi' | 'english'. */
  section?: string;
}

export interface BankContext {
  paper: PaperId;
  subject: string;
  /** Applied to every seed that does not declare its own section. */
  section?: string;
}

const OPTION_KEYS: AnswerOption[] = ['A', 'B', 'C', 'D'];

export function buildQuestions(context: BankContext, seeds: QuestionSeed[]): Question[] {
  return seeds.map((seed) => {
    const options = {} as Question['options'];
    OPTION_KEYS.forEach((key, index) => {
      const pair = seed.options[index] as [string, string];
      options[key] = { hindi: pair[0], english: pair[1] };
    });

    const section = seed.section ?? context.section;

    const question: Question = {
      id: seed.id,
      paper: context.paper,
      subject: context.subject,
      topic: seed.topic,
      question: { hindi: seed.hi, english: seed.en },
      options,
      correctOption: seed.answer,
      explanation: { hindi: seed.exHi, english: seed.exEn },
      // Everything shipped with the project is practice content authored for
      // this platform — never a verbatim reproduction of an official paper.
      demo: true,
    };

    if (section) question.section = section;
    if (seed.source) question.source = seed.source;

    return question;
  });
}
