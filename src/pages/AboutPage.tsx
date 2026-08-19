import { examConfig } from '@/config/examConfig';
import { routes } from '@/config/routes';
import { useUiLanguage } from '@/store/uiLanguageStore';
import { Alert } from '@/components/common/Alert';
import { ButtonLink } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Container, PageHeading, PageSection } from '@/components/layout/Page';
import { formatMarks } from '@/utils/format';

export function AboutPage() {
  const language = useUiLanguage();
  const isHindi = language === 'hindi';

  return (
    <PageSection>
      <Container className="max-w-3xl space-y-5">
        <PageHeading
          title={isHindi ? 'इस प्लेटफ़ॉर्म के बारे में' : 'About this platform'}
          description={
            isHindi
              ? 'BPSC TRE प्रारंभिक परीक्षा की तैयारी के लिए एक निःशुल्क, ब्राउज़र-आधारित मॉक टेस्ट प्लेटफ़ॉर्म।'
              : 'A free, browser-based mock test platform for BPSC TRE Preliminary preparation.'
          }
        />

        <Alert tone="warning" title={isHindi ? 'प्रश्नों के स्रोत के बारे में' : 'About the question source'}>
          {isHindi
            ? 'इस प्लेटफ़ॉर्म के सभी प्रश्न अभ्यास के लिए तैयार किए गए हैं और पिछली BPSC परीक्षाओं (TRE 1/2/3 तथा 67वीं–70वीं संयुक्त परीक्षा) के प्रारूप, कठिनाई स्तर एवं टॉपिक वितरण पर आधारित हैं। ये किसी आधिकारिक प्रश्नपत्र की हूबहू प्रतिलिपि नहीं हैं और न ही इन्हें आधिकारिक प्रश्न बताया जा रहा है।'
            : 'Every question here is practice material written for this platform, modelled on the pattern, difficulty and topic distribution of previous BPSC examinations (TRE 1/2/3 and the 67th–70th CCE). They are not verbatim reproductions of any official paper and are not presented as official questions.'}
        </Alert>

        <Card>
          <h2 className="text-base font-semibold text-ink">{isHindi ? 'अंकन योजना' : 'Marking scheme'}</h2>
          <dl className="mt-3 divide-y divide-line text-sm">
            <Row label={isHindi ? 'सही उत्तर (A–D)' : 'Correct answer (A–D)'} value={`+${formatMarks(examConfig.correctMarks)}`} />
            <Row label={isHindi ? 'गलत उत्तर (A–D)' : 'Incorrect answer (A–D)'} value={formatMarks(examConfig.incorrectMarks)} />
            <Row label={isHindi ? 'अनुत्तरित प्रश्न' : 'Unanswered question'} value={formatMarks(examConfig.unansweredMarks)} />
            <Row label={isHindi ? 'विकल्प E — ज्ञात नहीं' : 'Option E — Not Known'} value={formatMarks(examConfig.dontKnowMarks)} />
          </dl>
          <p className="mt-3 text-sm text-ink-muted">
            {isHindi
              ? 'अनुत्तरित प्रश्न और विकल्प E दो अलग स्थितियाँ हैं। अनुत्तरित छोड़ने पर ऋणात्मक अंकन लगता है, जबकि E चुनने पर कोई अंक नहीं कटता।'
              : 'An unanswered question and option E are two different states. Leaving a question blank attracts negative marking, whereas choosing E costs nothing.'}
          </p>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-ink">{isHindi ? 'आपका डेटा' : 'Your data'}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-muted marker:text-ink-subtle">
            <li>
              {isHindi
                ? 'कोई खाता, लॉगिन या साइन-अप आवश्यक नहीं है।'
                : 'No account, login or sign-up is required.'}
            </li>
            <li>
              {isHindi
                ? 'आपका नाम, उत्तर, टाइमर और परिणाम केवल इसी ब्राउज़र के लोकल स्टोरेज में सुरक्षित रहते हैं।'
                : 'Your name, answers, timer and results are stored only in this browser’s local storage.'}
            </li>
            <li>
              {isHindi
                ? 'कोई डेटा किसी सर्वर पर नहीं भेजा जाता। ब्राउज़र डेटा हटाने पर सब कुछ मिट जाएगा।'
                : 'Nothing is sent to a server. Clearing your browser data removes everything.'}
            </li>
            <li>
              {isHindi
                ? 'स्कोर की गणना ब्राउज़र में होती है, इसलिए यह प्रतियोगी मूल्यांकन के लिए सुरक्षित नहीं है — यह केवल स्व-अभ्यास हेतु है।'
                : 'Scoring happens in the browser, so it is not tamper-proof — this is a self-practice tool, not a proctored assessment.'}
            </li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-ink">{isHindi ? 'परीक्षा प्रारूप' : 'Examination pattern'}</h2>
          <dl className="mt-3 divide-y divide-line text-sm">
            <Row label={isHindi ? 'पेपर I — भाषा' : 'Paper I — Language'} value={`${examConfig.paper1Questions}`} />
            <Row label={isHindi ? 'पेपर II — सामान्य अध्ययन' : 'Paper II — General Studies'} value={`${examConfig.paper2Questions}`} />
            <Row label={isHindi ? 'कुल प्रश्न' : 'Total questions'} value={`${examConfig.totalQuestions}`} />
            <Row label={isHindi ? 'कुल अवधि' : 'Total duration'} value={`${examConfig.durationMinutes} ${isHindi ? 'मिनट' : 'minutes'}`} />
          </dl>
          <p className="mt-3 text-xs text-ink-subtle">
            {isHindi
              ? 'आधिकारिक एवं नवीनतम परीक्षा प्रारूप के लिए सदैव BPSC की आधिकारिक अधिसूचना देखें।'
              : 'Always check the official BPSC notification for the authoritative and most recent examination pattern.'}
          </p>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-ink">{isHindi ? 'अस्वीकरण' : 'Disclaimer'}</h2>
          <p className="mt-2 text-sm text-ink-muted">
            {isHindi
              ? 'यह एक स्वतंत्र अभ्यास परियोजना है। इसका बिहार लोक सेवा आयोग (BPSC) से कोई संबंध, संबद्धता अथवा अनुमोदन नहीं है।'
              : 'This is an independent practice project. It is not affiliated with, endorsed by or connected to the Bihar Public Service Commission (BPSC).'}
          </p>
        </Card>

        <ButtonLink to={routes.mockTests} size="lg">
          {isHindi ? 'प्रैक्टिस सेट देखें' : 'Browse practice sets'}
        </ButtonLink>
      </Container>
    </PageSection>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-semibold tabular-nums text-ink">{value}</dd>
    </div>
  );
}

export default AboutPage;
