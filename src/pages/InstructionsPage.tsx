import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, ClipboardList, Clock, HelpCircle, ListChecks, Play, RotateCcw, ShieldAlert } from 'lucide-react';
import { examConfig, paperLabels } from '@/config/examConfig';
import { routes } from '@/config/routes';
import { getMockTest, getMockTestSummary } from '@/data/mockTests';
import { useExamStore } from '@/store/examStore';
import { useUiLanguage } from '@/store/uiLanguageStore';
import type { Language } from '@/types/exam';
import { Alert } from '@/components/common/Alert';
import { Badge } from '@/components/common/Badge';
import { Button, ButtonLink } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { TestNotFound } from '@/components/common/TestNotFound';
import { Container, PageSection } from '@/components/layout/Page';
import { formatMarks, localized } from '@/utils/format';
import { formatClock, getRemainingSeconds } from '@/utils/timer';

const copy = {
  eyebrow: { hindi: 'परीक्षा निर्देश', english: 'Examination instructions' },
  duration: { hindi: 'अवधि', english: 'Duration' },
  minutes: { hindi: 'मिनट', english: 'minutes' },
  questions: { hindi: 'प्रश्न', english: 'Questions' },
  maxMarks: { hindi: 'अधिकतम अंक', english: 'Maximum marks' },
  marking: { hindi: 'अंकन योजना', english: 'Marking scheme' },
  correct: { hindi: 'सही उत्तर', english: 'Correct answer' },
  incorrect: { hindi: 'गलत उत्तर', english: 'Incorrect answer' },
  unanswered: { hindi: 'अनुत्तरित प्रश्न', english: 'Unanswered question' },
  dontKnow: { hindi: 'विकल्प E — ज्ञात नहीं', english: 'Option E — Not Known' },
  nameLabel: { hindi: 'आपका नाम', english: 'Your name' },
  namePlaceholder: { hindi: 'नाम दर्ज करें', english: 'Enter your name' },
  nameHelp: {
    hindi: 'यह नाम आपके स्कोर कार्ड पर दिखाया जाएगा। कोई लॉगिन आवश्यक नहीं है।',
    english: 'This name appears on your score card. No login or sign-up is required.',
  },
  agree: {
    hindi: 'मैंने सभी निर्देश पढ़ लिए हैं और समझ लिए हैं।',
    english: 'I have read and understood the instructions.',
  },
  start: { hindi: 'परीक्षा प्रारंभ करें', english: 'Start examination' },
  languageLabel: { hindi: 'प्रश्नपत्र की भाषा', english: 'Question paper language' },
  languageHelp: {
    hindi: 'यह केवल प्रश्नों की भाषा बदलती है। वेबसाइट की भाषा ऊपर हेडर से अलग से बदलें।',
    english: 'This changes the question paper only. The website language is a separate switch in the header.',
  },
} as const;

export function InstructionsPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const test = getMockTest(testId);
  const summary = getMockTestSummary(testId);

  const uiLanguage = useUiLanguage();

  const questionLanguage = useExamStore((state) => state.language);
  const storedName = useExamStore((state) => state.candidateName);
  const activeTestId = useExamStore((state) => state.testId);
  const activeStatus = useExamStore((state) => state.status);
  const activeEndTime = useExamStore((state) => state.examEndTime);
  const startExam = useExamStore((state) => state.startExam);
  const setQuestionLanguage = useExamStore((state) => state.setQuestionLanguage);
  const resetExam = useExamStore((state) => state.resetExam);

  const [name, setName] = useState(storedName);
  const [agreed, setAgreed] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    setName(storedName);
  }, [storedName]);

  const hasResumableSession = activeStatus === 'in-progress' && activeTestId === testId;
  const remainingSeconds = useMemo(
    () => (hasResumableSession ? getRemainingSeconds(activeEndTime) : 0),
    [hasResumableSession, activeEndTime],
  );

  if (!test || !summary) return <TestNotFound testId={testId} />;
  if (summary.totalQuestions === 0) return <TestNotFound testId={testId} reason="empty" />;

  // Every label on this page follows the interface language; only the paper
  // medium chosen below follows `questionLanguage`.
  const language: Language = uiLanguage;
  const trimmedName = name.trim();
  const nameValid = !examConfig.requireCandidateName || trimmedName.length >= examConfig.minCandidateNameLength;
  const canStart = nameValid && agreed;

  const handleStart = (): void => {
    if (!canStart) {
      setShowErrors(true);
      return;
    }
    startExam(test, {
      questionLanguage,
      candidateName: trimmedName,
      durationSeconds: summary.durationSeconds,
    });
    navigate(routes.exam(test.id));
  };

  const markingRows = [
    { label: copy.correct[language], value: `+${formatMarks(examConfig.correctMarks)}`, tone: 'success' as const },
    { label: copy.incorrect[language], value: formatMarks(examConfig.incorrectMarks), tone: 'danger' as const },
    { label: copy.unanswered[language], value: formatMarks(examConfig.unansweredMarks), tone: 'danger' as const },
    { label: copy.dontKnow[language], value: formatMarks(examConfig.dontKnowMarks), tone: 'info' as const },
  ];

  const generalInstructions =
    language === 'hindi'
      ? [
          'परीक्षा की कुल अवधि स्क्रीन के ऊपर दिख रही घड़ी में दिखाई जाती है। समय समाप्त होते ही परीक्षा स्वतः जमा हो जाएगी।',
          'प्रत्येक प्रश्न में पाँच विकल्प हैं — A, B, C, D तथा E (ज्ञात नहीं)।',
          'किसी भी प्रश्न पर जाने के लिए दाईं ओर दिए गए प्रश्न पैनल पर संख्या क्लिक करें।',
          '"उत्तर हटाएँ" दबाने पर प्रश्न पुनः अनुत्तरित हो जाएगा, जिस पर ऋणात्मक अंकन लागू होगा।',
          'पेपर II के प्रश्न हिन्दी अथवा अंग्रेज़ी में देखे जा सकते हैं; भाषा बदलने से आपका उत्तर या समय प्रभावित नहीं होता।',
          'ब्राउज़र रिफ्रेश करने पर भी आपकी परीक्षा उसी स्थिति में जारी रहेगी।',
        ]
      : [
          'The countdown at the top of the screen shows the time left. The paper is submitted automatically when it reaches zero.',
          'Every question has five choices — A, B, C, D and E (Not Known).',
          'Use the question palette on the right to jump directly to any question.',
          '"Clear response" returns a question to the unanswered state, which attracts negative marking.',
          'Paper II questions can be read in Hindi or English; switching the paper language never changes your answer or the clock.',
          'Refreshing the browser resumes the paper exactly where you left it.',
        ];

  return (
    <PageSection>
      <Container className="max-w-4xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge tone="brand" icon={<ClipboardList className="h-3 w-3" />}>
              {copy.eyebrow[language]}
            </Badge>
            <h1 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">{localized(test.title, language)}</h1>
            <p className="mt-2 max-w-2xl text-sm text-ink-muted">{localized(test.description, language)}</p>
          </div>
        </div>

        {hasResumableSession ? (
          <Card className="mb-6 border-warning/40 bg-warning-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-ink">
                  {language === 'hindi' ? 'आपकी एक परीक्षा अधूरी है' : 'You have an unfinished examination'}
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  {language === 'hindi' ? 'शेष समय' : 'Time remaining'}:{' '}
                  <span className="font-semibold tabular-clock text-ink">{formatClock(remainingSeconds)}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => navigate(routes.exam(test.id))} icon={<Play className="h-4 w-4" />}>
                  {language === 'hindi' ? 'परीक्षा जारी रखें' : 'Resume test'}
                </Button>
                <Button variant="outline" onClick={resetExam} icon={<RotateCcw className="h-4 w-4" />}>
                  {language === 'hindi' ? 'फिर से शुरू करें' : 'Restart test'}
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="flex items-center gap-3">
            <ListChecks className="h-6 w-6 shrink-0 text-brand" aria-hidden="true" />
            <div>
              <p className="text-xs text-ink-subtle">{copy.questions[language]}</p>
              <p className="text-xl font-bold text-ink">{summary.totalQuestions}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <Clock className="h-6 w-6 shrink-0 text-brand" aria-hidden="true" />
            <div>
              <p className="text-xs text-ink-subtle">{copy.duration[language]}</p>
              <p className="text-xl font-bold text-ink">
                {summary.durationMinutes} <span className="text-sm font-medium">{copy.minutes[language]}</span>
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-brand" aria-hidden="true" />
            <div>
              <p className="text-xs text-ink-subtle">{copy.maxMarks[language]}</p>
              <p className="text-xl font-bold text-ink">{formatMarks(summary.maxMarks)}</p>
            </div>
          </Card>
        </div>

        <Card className="mt-4">
          <h2 className="text-base font-semibold text-ink">
            {language === 'hindi' ? 'प्रश्नपत्र की संरचना' : 'Paper structure'}
          </h2>
          <dl className="mt-3 divide-y divide-line">
            <div className="flex items-center justify-between py-2">
              <dt className="text-sm text-ink-muted">{localized(paperLabels.paper1, language)}</dt>
              <dd className="text-sm font-semibold text-ink">
                {summary.paper1Questions} {copy.questions[language]}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-sm text-ink-muted">{localized(paperLabels.paper2, language)}</dt>
              <dd className="text-sm font-semibold text-ink">
                {summary.paper2Questions} {copy.questions[language]}
              </dd>
            </div>
          </dl>
          {summary.isPartialBlueprint ? (
            <p className="mt-3 text-xs text-ink-subtle">
              {language === 'hindi'
                ? `पूर्ण BPSC TRE प्रारूप ${examConfig.totalQuestions} प्रश्नों का है। इस सेट में वर्तमान में ${summary.totalQuestions} प्रश्न हैं और समय उसी अनुपात में रखा गया है।`
                : `The full BPSC TRE blueprint is ${examConfig.totalQuestions} questions. This set currently holds ${summary.totalQuestions}, and the time allowed is scaled to match.`}
            </p>
          ) : null}
        </Card>

        <Card className="mt-4">
          <h2 className="text-base font-semibold text-ink">{copy.marking[language]}</h2>
          <ul className="mt-3 divide-y divide-line">
            {markingRows.map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-4 py-2.5">
                <span className="text-sm text-ink-muted">{row.label}</span>
                <Badge tone={row.tone} size="md" className="tabular-nums">
                  {row.value}
                </Badge>
              </li>
            ))}
          </ul>

          <Alert tone="warning" className="mt-4" title={language === 'hindi' ? 'महत्वपूर्ण' : 'Important'}>
            {language === 'hindi' ? (
              <>
                यदि आपको उत्तर नहीं पता है तो <strong>विकल्प E — ज्ञात नहीं</strong> चुनें। प्रश्न को खाली छोड़ने पर{' '}
                <strong>{formatMarks(examConfig.unansweredMarks)}</strong> अंक काटे जाएँगे, जबकि विकल्प E पर कोई अंक नहीं
                कटेगा।
              </>
            ) : (
              <>
                If you do not know the answer, choose <strong>option E — Not Known</strong>. Leaving a question blank
                costs you <strong>{formatMarks(examConfig.unansweredMarks)}</strong> marks, whereas option E costs
                nothing.
              </>
            )}
          </Alert>
        </Card>

        <Card className="mt-4">
          <h2 className="text-base font-semibold text-ink">
            {language === 'hindi' ? 'सामान्य निर्देश' : 'General instructions'}
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink-muted marker:text-ink-subtle">
            {generalInstructions.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ol>
        </Card>

        <Card className="mt-4">
          <h2 className="text-base font-semibold text-ink">
            {language === 'hindi' ? 'परीक्षा प्रारंभ करें' : 'Begin your attempt'}
          </h2>

          <div className="mt-4 max-w-md">
            <label htmlFor="candidate-name" className="block text-sm font-medium text-ink">
              {copy.nameLabel[language]}
              <span className="ml-1 text-danger" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="candidate-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onBlur={() => setShowErrors(true)}
              maxLength={examConfig.maxCandidateNameLength}
              autoComplete="name"
              required
              aria-describedby="candidate-name-help"
              aria-invalid={showErrors && !nameValid}
              placeholder={copy.namePlaceholder[language]}
              className="mt-1.5 h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-base text-ink placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
            <p id="candidate-name-help" className="mt-1.5 text-xs text-ink-subtle">
              {copy.nameHelp[language]}
            </p>
            {showErrors && !nameValid ? (
              <p role="alert" className="mt-1.5 text-xs font-medium text-danger">
                {language === 'hindi'
                  ? `कृपया कम से कम ${examConfig.minCandidateNameLength} अक्षरों का नाम दर्ज करें।`
                  : `Please enter a name of at least ${examConfig.minCandidateNameLength} characters.`}
              </p>
            ) : null}
          </div>

          <div className="mt-5">
            <p className="mb-1 text-sm font-medium text-ink">{copy.languageLabel[language]}</p>
            <p className="mb-2 text-xs text-ink-subtle">{copy.languageHelp[language]}</p>
            <LanguageToggle
              value={questionLanguage}
              onChange={setQuestionLanguage}
              ariaLabel="Question paper language"
            />
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-surface-muted p-3">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-line-strong text-brand focus:ring-2 focus:ring-brand"
            />
            <span className="text-sm text-ink">{copy.agree[language]}</span>
          </label>

          {showErrors && !agreed ? (
            <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-danger">
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
              {language === 'hindi'
                ? 'प्रारंभ करने से पहले निर्देशों की पुष्टि करें।'
                : 'Please confirm that you have read the instructions.'}
            </p>
          ) : null}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button
              size="lg"
              onClick={handleStart}
              disabled={!canStart}
              icon={<Play className="h-4 w-4" />}
              className="sm:w-auto"
              fullWidth
            >
              {copy.start[language]}
            </Button>
            <ButtonLink to={routes.mockTest(test.id)} variant="outline" size="lg" className="sm:w-auto" fullWidth>
              {language === 'hindi' ? 'वापस जाएँ' : 'Back to details'}
            </ButtonLink>
          </div>

          <p className="mt-3 flex items-start gap-1.5 text-xs text-ink-subtle">
            <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {language === 'hindi'
              ? 'आपकी प्रगति इसी ब्राउज़र में सुरक्षित रहती है — कोई खाता बनाने की आवश्यकता नहीं है।'
              : 'Your progress is saved in this browser only — no account is needed.'}
          </p>
        </Card>
      </Container>
    </PageSection>
  );
}

export default InstructionsPage;
