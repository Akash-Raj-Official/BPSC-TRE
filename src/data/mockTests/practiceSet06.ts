import type { MockTest } from '@/types/exam';
import { buildPracticeSet } from './blueprint';

const TEST_ID = 'practice-set-06';

/**
 * Practice Set 6 — a complete paper covering every part of the syllabus:
 * Paper I (Hindi + English) and all seven Paper II subjects.
 *
 * Draws from offset 5 of each question bank, so it shares no question with
 * the other practice sets.
 */
export const practiceSet06: MockTest = {
  id: TEST_ID,
  title: {
    hindi: 'BPSC TRE प्रैक्टिस सेट 6',
    english: 'BPSC TRE Practice Set 6',
  },
  description: {
    hindi:
      'पूर्ण प्रश्नपत्र — पेपर I (हिन्दी एवं अंग्रेज़ी) तथा पेपर II के सभी सात विषय, वास्तविक परीक्षा जैसे ऋणात्मक अंकन के साथ।',
    english:
      'A complete paper — Paper I (Hindi and English) plus all seven Paper II subjects, with the same negative marking as the real examination.',
  },
  difficulty: 'hard',
  demo: true,
  questions: buildPracticeSet(TEST_ID, 5),
};
