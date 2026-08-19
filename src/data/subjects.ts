import type { Language, LocalizedText, PaperId } from '@/types/exam';

/**
 * Syllabus taxonomy for the BPSC TRE Preliminary examination.
 *
 * A topic key is only unique *within* its subject, so every lookup takes the
 * subject key as well. Result analysis groups by `subject/topic`.
 */

export interface TopicDefinition {
  key: string;
  label: LocalizedText;
  /** Optional grouping inside a subject, e.g. Physics / Chemistry / Biology. */
  group?: LocalizedText;
}

export interface SubjectDefinition {
  key: string;
  paper: PaperId;
  label: LocalizedText;
  shortLabel: LocalizedText;
  topics: TopicDefinition[];
}

const t = (key: string, hindi: string, english: string, group?: LocalizedText): TopicDefinition =>
  group ? { key, label: { hindi, english }, group } : { key, label: { hindi, english } };

const physics: LocalizedText = { hindi: 'भौतिक विज्ञान', english: 'Physics' };
const chemistry: LocalizedText = { hindi: 'रसायन विज्ञान', english: 'Chemistry' };
const biology: LocalizedText = { hindi: 'जीव विज्ञान', english: 'Biology' };

/* -------------------------------------------------------------------------- */
/*                          Paper I — Language sections                       */
/* -------------------------------------------------------------------------- */

/**
 * Paper I language sections. Adding a third language later means adding an
 * entry here plus its questions — no UI change is required.
 */
export const paper1Sections = [
  { key: 'hindi', label: { hindi: 'हिन्दी', english: 'Hindi' } as LocalizedText, questionCount: 15 },
  { key: 'english', label: { hindi: 'अंग्रेज़ी', english: 'English' } as LocalizedText, questionCount: 15 },
] as const;

const paper1Subjects: SubjectDefinition[] = [
  {
    key: 'hindi-language',
    paper: 'paper1',
    label: { hindi: 'हिन्दी भाषा', english: 'Hindi Language' },
    shortLabel: { hindi: 'हिन्दी', english: 'Hindi' },
    topics: [
      t('grammar', 'व्याकरण', 'Grammar'),
      t('vocabulary', 'शब्द ज्ञान', 'Vocabulary'),
      t('comprehension', 'अपठित गद्यांश', 'Comprehension'),
      t('sandhi-samas', 'संधि एवं समास', 'Sandhi and Samas'),
      t('idioms-proverbs', 'मुहावरे एवं लोकोक्तियाँ', 'Idioms and Proverbs'),
      t('spelling-correction', 'वर्तनी एवं वाक्य शुद्धि', 'Spelling and Sentence Correction'),
      t('sentence-structure', 'वाक्य संरचना', 'Sentence Structure'),
    ],
  },
  {
    key: 'english-language',
    paper: 'paper1',
    label: { hindi: 'अंग्रेज़ी भाषा', english: 'English Language' },
    shortLabel: { hindi: 'अंग्रेज़ी', english: 'English' },
    topics: [
      t('grammar', 'व्याकरण', 'Grammar'),
      t('vocabulary', 'शब्दावली', 'Vocabulary'),
      t('comprehension', 'गद्यांश बोध', 'Comprehension'),
      t('synonyms-antonyms', 'पर्यायवाची एवं विलोम', 'Synonyms and Antonyms'),
      t('idioms-phrases', 'मुहावरे एवं वाक्यांश', 'Idioms and Phrases'),
      t('sentence-correction', 'वाक्य शुद्धिकरण', 'Sentence Correction'),
      t('voice-narration', 'वाच्य एवं कथन', 'Voice and Narration'),
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*                        Paper II — General Studies                          */
/* -------------------------------------------------------------------------- */

const paper2Subjects: SubjectDefinition[] = [
  {
    key: 'mathematics',
    paper: 'paper2',
    label: { hindi: 'प्रारंभिक गणित', english: 'Elementary Mathematics' },
    shortLabel: { hindi: 'गणित', english: 'Mathematics' },
    topics: [
      t('number-system', 'संख्या पद्धति', 'Number System'),
      t('simplification', 'सरलीकरण', 'Simplification'),
      t('fractions-decimals', 'भिन्न एवं दशमलव', 'Fractions and Decimals'),
      t('percentage', 'प्रतिशत', 'Percentage'),
      t('profit-loss', 'लाभ एवं हानि', 'Profit and Loss'),
      t('simple-interest', 'साधारण ब्याज', 'Simple Interest'),
      t('compound-interest', 'चक्रवृद्धि ब्याज', 'Compound Interest'),
      t('ratio-proportion', 'अनुपात एवं समानुपात', 'Ratio and Proportion'),
      t('average', 'औसत', 'Average'),
      t('partnership', 'साझेदारी', 'Partnership'),
      t('time-work', 'समय एवं कार्य', 'Time and Work'),
      t('speed-time-distance', 'चाल, समय एवं दूरी', 'Speed, Time and Distance'),
      t('ages', 'आयु संबंधी प्रश्न', 'Problems Based on Ages'),
      t('mixture-allegation', 'मिश्रण एवं सम्मिश्रण', 'Mixture and Allegation'),
      t('algebra', 'प्रारंभिक बीजगणित', 'Basic Algebra'),
      t('geometry', 'ज्यामिति', 'Geometry'),
      t('mensuration', 'क्षेत्रमिति', 'Mensuration'),
    ],
  },
  {
    key: 'reasoning',
    paper: 'paper2',
    label: { hindi: 'मानसिक क्षमता एवं तर्कशक्ति', english: 'Mental Ability and Reasoning' },
    shortLabel: { hindi: 'तर्कशक्ति', english: 'Reasoning' },
    topics: [
      t('analogy', 'सादृश्यता', 'Analogy'),
      t('classification', 'वर्गीकरण', 'Classification'),
      t('number-series', 'संख्या श्रृंखला', 'Number Series'),
      t('alphabet-series', 'अक्षर श्रृंखला', 'Alphabet Series'),
      t('coding-decoding', 'कूटलेखन एवं कूटवाचन', 'Coding-Decoding'),
      t('blood-relations', 'रक्त संबंध', 'Blood Relations'),
      t('direction-sense', 'दिशा ज्ञान', 'Direction Sense'),
      t('ranking-order', 'क्रम एवं व्यवस्था', 'Ranking and Order'),
      t('syllogism', 'न्याय निगमन', 'Syllogism'),
      t('statement-conclusion', 'कथन एवं निष्कर्ष', 'Statement and Conclusion'),
      t('statement-assumption', 'कथन एवं पूर्वधारणा', 'Statement and Assumption'),
      t('venn-diagram', 'वेन आरेख', 'Venn Diagrams'),
      t('sitting-arrangement', 'बैठक व्यवस्था', 'Sitting Arrangement'),
      t('verbal-classification', 'शाब्दिक वर्गीकरण', 'Verbal Classification'),
      t('puzzles', 'प्रारंभिक पहेलियाँ', 'Basic Puzzles'),
    ],
  },
  {
    key: 'general-awareness',
    paper: 'paper2',
    label: { hindi: 'सामान्य जागरूकता एवं समसामयिकी', english: 'General Awareness and Current Affairs' },
    shortLabel: { hindi: 'सामान्य ज्ञान', english: 'General Awareness' },
    topics: [
      t('current-national', 'राष्ट्रीय समसामयिक घटनाएँ', 'Current National Events'),
      t('current-international', 'अंतर्राष्ट्रीय समसामयिक घटनाएँ', 'Current International Events'),
      t('bihar-current-affairs', 'बिहार समसामयिकी', 'Bihar Current Affairs'),
      t('indian-history', 'भारतीय इतिहास', 'Indian History'),
      t('indian-culture', 'भारतीय संस्कृति', 'Indian Culture'),
      t('geography-india', 'भारत का भूगोल', 'Geography of India'),
      t('geography-bihar', 'बिहार का भूगोल', 'Geography of Bihar'),
      t('indian-economy', 'भारतीय अर्थव्यवस्था', 'Indian Economy'),
      t('indian-polity', 'भारतीय राजव्यवस्था', 'Indian Polity'),
      t('indian-constitution', 'भारतीय संविधान', 'Indian Constitution'),
      t('government-schemes', 'सरकारी योजनाएँ', 'Government Schemes'),
      t('sports', 'खेलकूद', 'Sports'),
      t('important-days', 'महत्वपूर्ण दिवस', 'Important Days'),
      t('books-authors', 'पुस्तकें एवं लेखक', 'Books and Authors'),
      t('awards-honours', 'पुरस्कार एवं सम्मान', 'Awards and Honours'),
      t('india-neighbours', 'भारत एवं पड़ोसी देश', 'India and Neighbouring Countries'),
    ],
  },
  {
    key: 'general-science',
    paper: 'paper2',
    label: { hindi: 'सामान्य विज्ञान', english: 'General Science' },
    shortLabel: { hindi: 'विज्ञान', english: 'Science' },
    topics: [
      t('work-energy-power', 'कार्य, ऊर्जा एवं शक्ति', 'Work, Energy and Power', physics),
      t('force-laws-of-motion', 'बल एवं गति के नियम', 'Force and Laws of Motion', physics),
      t('gravitation', 'गुरुत्वाकर्षण', 'Gravitation', physics),
      t('heat-thermodynamics', 'ऊष्मा एवं ऊष्मागतिकी', 'Heat and Thermodynamics', physics),
      t('light-optics', 'प्रकाश एवं प्रकाशिकी', 'Light and Optics', physics),
      t('electricity-current', 'विद्युत एवं विद्युत धारा', 'Electricity and Current', physics),
      t('electromagnetic-waves', 'विद्युत चुम्बकीय तरंगें', 'Electromagnetic Waves', physics),
      t('atoms-nuclei', 'परमाणु एवं नाभिक', 'Atoms and Nuclei', physics),
      t('units-measurements', 'मात्रक एवं मापन', 'Units and Measurements', physics),

      t('structure-of-atom', 'परमाणु की संरचना', 'Structure of Atom', chemistry),
      t('periodic-classification', 'तत्वों का आवर्त वर्गीकरण', 'Periodic Classification of Elements', chemistry),
      t('states-of-matter', 'पदार्थ की अवस्थाएँ', 'States of Matter', chemistry),
      t('acids-bases-salts', 'अम्ल, क्षार एवं लवण', 'Acids, Bases and Salts', chemistry),
      t('metals-non-metals', 'धातु एवं अधातु', 'Metals and Non-Metals', chemistry),
      t('chemical-reactions', 'प्रारंभिक रासायनिक अभिक्रियाएँ', 'Basic Chemical Reactions', chemistry),

      t('plants-animals', 'पादप एवं जंतु', 'Plants and Animals', biology),
      t('skeletal-system', 'मानव कंकाल तंत्र', 'Human Skeletal System', biology),
      t('nervous-system', 'तंत्रिका तंत्र', 'Nervous System', biology),
      t('digestive-system', 'पाचन तंत्र', 'Digestive System', biology),
      t('vitamins-minerals', 'विटामिन एवं खनिज', 'Vitamins and Minerals', biology),
      t('human-health', 'मानव स्वास्थ्य', 'Basic Human Health', biology),
      t('diseases', 'सामान्य रोग', 'Basic Diseases', biology),
    ],
  },
  {
    key: 'social-studies',
    paper: 'paper2',
    label: { hindi: 'सामाजिक अध्ययन', english: 'Social Studies' },
    shortLabel: { hindi: 'सामाजिक अध्ययन', english: 'Social Studies' },
    topics: [
      t('contemporary-world', 'भारत एवं समकालीन विश्व', 'India and the Contemporary World'),
      t('indian-society', 'भारतीय समाज', 'Indian Society'),
      t('indian-culture', 'भारतीय संस्कृति', 'Indian Culture'),
      t('democratic-politics', 'लोकतांत्रिक राजनीति', 'Democratic Politics'),
      t('indian-constitution', 'भारतीय संविधान', 'Indian Constitution'),
      t('economic-development', 'आर्थिक विकास के मूल तत्व', 'Basic Economic Development'),
      t('history-of-india', 'भारत का इतिहास', 'History of India'),
      t('bihar-history', 'बिहार का इतिहास', 'Bihar History'),
      t('bihar-society', 'बिहार का समाज', 'Bihar Society'),
    ],
  },
  {
    key: 'geography-environment',
    paper: 'paper2',
    label: { hindi: 'भूगोल एवं पर्यावरण', english: 'Geography and Environment' },
    shortLabel: { hindi: 'भूगोल', english: 'Geography' },
    topics: [
      t('solar-system', 'सौर मंडल', 'Solar System'),
      t('planets', 'ग्रह', 'Planets'),
      t('earth', 'पृथ्वी', 'Earth'),
      t('continents', 'महाद्वीप', 'Continents'),
      t('mountains', 'पर्वत', 'Mountains'),
      t('plateaus', 'पठार', 'Plateaus'),
      t('rivers', 'नदियाँ', 'Rivers'),
      t('lakes', 'झीलें', 'Lakes'),
      t('indian-physical-geography', 'भारत का भौतिक भूगोल', 'Indian Physical Geography'),
      t('bihar-geography', 'बिहार का भूगोल', 'Bihar Geography'),
      t('climate', 'जलवायु', 'Climate'),
      t('indian-monsoon', 'भारतीय मानसून', 'Indian Monsoon'),
      t('soil', 'मृदा', 'Soil'),
      t('natural-resources', 'प्राकृतिक संसाधन', 'Natural Resources'),
      t('human-geography', 'मानव भूगोल', 'Human Geography'),
      t('population', 'जनसंख्या', 'Population'),
      t('human-activities', 'मानवीय क्रियाकलाप', 'Human Activities'),
      t('environment', 'पर्यावरण', 'Environment'),
      t('pollution', 'प्रदूषण', 'Pollution'),
      t('conservation', 'प्राकृतिक संसाधनों का संरक्षण', 'Conservation of Natural Resources'),
      t('ecology', 'प्रारंभिक पारिस्थितिकी', 'Basic Ecology'),
    ],
  },
  {
    key: 'national-movement',
    paper: 'paper2',
    label: { hindi: 'भारतीय राष्ट्रीय आंदोलन', english: 'Indian National Movement' },
    shortLabel: { hindi: 'राष्ट्रीय आंदोलन', english: 'National Movement' },
    topics: [
      t('pre-british-india', 'ब्रिटिश शासन से पूर्व भारत', 'India Before British Rule'),
      t('conquest-of-bengal', 'बंगाल पर ब्रिटिश विजय', 'British Conquest of Bengal'),
      t('expansion-of-british-power', 'ब्रिटिश सत्ता का विस्तार', 'Expansion of British Power'),
      t('revolt-1857', '1857 का विद्रोह', 'Revolt of 1857'),
      t('reform-movements', 'सामाजिक एवं धार्मिक सुधार आंदोलन', 'Social and Religious Reform Movements'),
      t('rise-of-nationalism', 'भारतीय राष्ट्रवाद का उदय', 'Emergence of Indian Nationalism'),
      t('formation-of-congress', 'भारतीय राष्ट्रीय कांग्रेस की स्थापना', 'Formation of Indian National Congress'),
      t('swadeshi-movement', 'स्वदेशी आंदोलन', 'Swadeshi Movement'),
      t('home-rule-movement', 'होमरूल आंदोलन', 'Home Rule Movement'),
      t('gandhian-era', 'गांधी युग', 'Gandhian Era'),
      t('non-cooperation', 'असहयोग आंदोलन', 'Non-Cooperation Movement'),
      t('civil-disobedience', 'सविनय अवज्ञा आंदोलन', 'Civil Disobedience Movement'),
      t('quit-india', 'भारत छोड़ो आंदोलन', 'Quit India Movement'),
      t('independence', 'स्वतंत्रता', 'Independence'),
      t('partition', 'विभाजन', 'Partition'),
      t('bihar-freedom-movement', 'स्वतंत्रता आंदोलन में बिहार की भूमिका', 'Role of Bihar in the Freedom Movement'),
    ],
  },
];

export const subjects: SubjectDefinition[] = [...paper1Subjects, ...paper2Subjects];

export const subjectMap: Readonly<Record<string, SubjectDefinition>> = Object.freeze(
  Object.fromEntries(subjects.map((subject) => [subject.key, subject])),
);

export function getSubject(subjectKey: string): SubjectDefinition | undefined {
  return subjectMap[subjectKey];
}

export function getTopic(subjectKey: string, topicKey: string): TopicDefinition | undefined {
  return getSubject(subjectKey)?.topics.find((topic) => topic.key === topicKey);
}

/** Composite key used to aggregate topic-wise performance. */
export function topicKeyOf(subjectKey: string, topicKey: string): string {
  return `${subjectKey}/${topicKey}`;
}

/** Falls back to the raw key so unknown data still renders something readable. */
export function getSubjectLabel(subjectKey: string, language: Language): string {
  const subject = getSubject(subjectKey);
  if (!subject) return subjectKey;
  return subject.label[language] ?? subject.label.english ?? subjectKey;
}

export function getSubjectShortLabel(subjectKey: string, language: Language): string {
  const subject = getSubject(subjectKey);
  if (!subject) return subjectKey;
  return subject.shortLabel[language] ?? subject.shortLabel.english ?? subjectKey;
}

export function getTopicLabel(subjectKey: string, topicKey: string, language: Language): string {
  const topic = getTopic(subjectKey, topicKey);
  if (!topic) return topicKey;
  return topic.label[language] ?? topic.label.english ?? topicKey;
}

export function subjectsByPaper(paper: PaperId): SubjectDefinition[] {
  return subjects.filter((subject) => subject.paper === paper);
}
