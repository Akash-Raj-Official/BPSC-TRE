import type { Language } from '@/types/exam';

/**
 * Single source of truth for every examination rule.
 *
 * Nothing in the UI may hard-code a mark value, a duration or a question
 * count — change the numbers here and the whole application follows.
 */
export const examConfig = {
  /** Blueprint of the real BPSC TRE Preliminary paper. */
  paper1Questions: 30,
  paper2Questions: 120,
  totalQuestions: 150,

  durationMinutes: 120,

  /* ----------------------------- Marking rules ---------------------------- */

  /** Marks for a correct A–D selection. */
  correctMarks: 1,
  /** Marks for an incorrect A–D selection. */
  incorrectMarks: -1 / 3,
  /** Marks for a question left without any selection. */
  unansweredMarks: -1 / 3,
  /** Marks for an explicit "E — Not Known" selection. */
  dontKnowMarks: 0,

  /* ------------------------------- Languages ------------------------------ */

  languages: ['hindi', 'english'] as Language[],
  /** Default medium of the question paper. */
  defaultLanguage: 'hindi' as Language,
  /**
   * Default language of the website itself (navigation, buttons, headings).
   * Independent of `defaultLanguage` — the interface and the paper are two
   * separate settings the candidate controls with two separate switches.
   */
  defaultUiLanguage: 'english' as Language,

  /* ----------------------------- Randomisation ---------------------------- */

  /** Shuffle the question order once, at exam start. */
  randomizeQuestions: false,
  /** Shuffle A–D option order once, at exam start. */
  randomizeOptions: false,

  /* --------------------------------- UI ----------------------------------- */

  /** Remaining seconds at which the timer turns amber. */
  timerWarningSeconds: 10 * 60,
  /** Remaining seconds at which the timer turns red and pulses. */
  timerDangerSeconds: 5 * 60,
  /** Accuracy (%) below which a subject/topic is flagged "Needs improvement". */
  weakTopicThreshold: 50,
  /** Accuracy (%) at or above which a subject/topic is flagged "Strong". */
  strongTopicThreshold: 75,
  /** Decimal places used when rendering marks. */
  scorePrecision: 2,
  /** Number of past results kept in local storage. */
  maxStoredResults: 25,

  /* ------------------------------- Candidate ------------------------------ */

  /** The candidate must type a name before the paper can be started. */
  requireCandidateName: true,
  minCandidateNameLength: 2,
  maxCandidateNameLength: 40,
} as const;

/**
 * Score benchmarks.
 *
 * Bands are evaluated against `finalScore / maxScore` expressed as a
 * percentage, and are checked from the top down, so the first band whose
 * `minPercentage` is met wins.
 *
 * These are *practice* benchmarks for self-assessment. The actual BPSC cut-off
 * changes with every cycle, category and subject, and is not published in
 * advance — `indicativeCutoffPercentage` is only a study target.
 */
export interface ScoreBenchmark {
  key: string;
  minPercentage: number;
  label: { hindi: string; english: string };
  message: { hindi: string; english: string };
  tone: 'success' | 'brand' | 'warning' | 'danger';
}

export const scoreBenchmarks: ScoreBenchmark[] = [
  {
    key: 'excellent',
    minPercentage: 75,
    label: { hindi: 'उत्कृष्ट', english: 'Excellent' },
    message: {
      hindi: 'शानदार प्रदर्शन! इसी निरंतरता के साथ अभ्यास जारी रखें।',
      english: 'Outstanding performance. Keep up this consistency in your practice.',
    },
    tone: 'success',
  },
  {
    key: 'good',
    minPercentage: 60,
    label: { hindi: 'अच्छा', english: 'Good' },
    message: {
      hindi: 'अच्छा प्रदर्शन। कमजोर विषयों पर थोड़ा और ध्यान देने से अंक और बढ़ेंगे।',
      english: 'A good score. A little more focus on the weaker subjects will push it higher.',
    },
    tone: 'brand',
  },
  {
    key: 'average',
    minPercentage: 45,
    label: { hindi: 'औसत', english: 'Average' },
    message: {
      hindi: 'आधार तैयार है। ऋणात्मक अंकन घटाने के लिए अनुमान लगाने से बचें।',
      english: 'The basics are in place. Guess less to cut down the negative marking.',
    },
    tone: 'warning',
  },
  {
    key: 'needs-improvement',
    minPercentage: 0,
    label: { hindi: 'सुधार आवश्यक', english: 'Needs improvement' },
    message: {
      hindi: 'चिंता न करें — विषयवार विश्लेषण देखें और कमजोर टॉपिक पहले दोहराएँ।',
      english: 'Do not worry — check the subject-wise analysis and revise the weak topics first.',
    },
    tone: 'danger',
  },
];

/** Indicative study target, not an official cut-off. */
export const indicativeCutoffPercentage = 40;

export function getBenchmark(percentage: number): ScoreBenchmark {
  const match = scoreBenchmarks.find((benchmark) => percentage >= benchmark.minPercentage);
  // The last band has minPercentage 0, so this fallback is only for safety.
  return match ?? (scoreBenchmarks[scoreBenchmarks.length - 1] as ScoreBenchmark);
}

export type ExamConfig = typeof examConfig;

/** Paper labels, kept beside the config so they stay translatable. */
export const paperLabels = {
  paper1: {
    hindi: 'पेपर I — भाषा',
    english: 'Paper I — Language',
  },
  paper2: {
    hindi: 'पेपर II — सामान्य अध्ययन',
    english: 'Paper II — General Studies',
  },
} as const;

export const paperShortLabels = {
  paper1: { hindi: 'पेपर I', english: 'Paper I' },
  paper2: { hindi: 'पेपर II', english: 'Paper II' },
} as const;

/** Duration in seconds, derived so no component recomputes it. */
export const examDurationSeconds = examConfig.durationMinutes * 60;

/** Resolves the duration for a specific test, honouring per-test overrides. */
export function resolveDurationSeconds(durationMinutes?: number): number {
  const minutes = durationMinutes && durationMinutes > 0 ? durationMinutes : examConfig.durationMinutes;
  return Math.round(minutes * 60);
}
