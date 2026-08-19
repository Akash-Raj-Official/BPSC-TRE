import { useMemo } from 'react';
import {
  BarChart3,
  BookOpenCheck,
  Clock,
  Languages,
  ListChecks,
  Play,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { examConfig } from '@/config/examConfig';
import { routes } from '@/config/routes';
import { mockTests, mockTestSummaries } from '@/data/mockTests';
import { subjectsByPaper } from '@/data/subjects';
import { useResultHistory } from '@/hooks/useStoredResult';
import { useUiLanguage } from '@/store/uiLanguageStore';
import { Badge } from '@/components/common/Badge';
import { ButtonLink } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { MockTestCard } from '@/components/common/MockTestCard';
import { Container, PageSection } from '@/components/layout/Page';
import { formatMarks, localized } from '@/utils/format';

const features = [
  {
    icon: ShieldCheck,
    title: { hindi: 'वास्तविक अंकन योजना', english: 'Real marking scheme' },
    body: {
      hindi: 'सही उत्तर +1, गलत उत्तर −1/3 और अनुत्तरित प्रश्न पर भी −1/3 — ठीक वैसे ही जैसे वास्तविक परीक्षा में।',
      english: 'Correct +1, incorrect −1/3 and unanswered −1/3 as well — exactly like the real paper.',
    },
  },
  {
    icon: ListChecks,
    title: { hindi: 'विकल्प E — ज्ञात नहीं', english: 'Option E — Not Known' },
    body: {
      hindi: 'जब उत्तर न पता हो तो E चुनें और ऋणात्मक अंकन से बचें। खाली छोड़ना और E चुनना अलग-अलग स्थितियाँ हैं।',
      english: 'Pick E when you are unsure and avoid the penalty. Leaving blank and choosing E are treated differently.',
    },
  },
  {
    icon: Languages,
    title: { hindi: 'द्विभाषी प्रश्नपत्र', english: 'Bilingual paper' },
    body: {
      hindi: 'परीक्षा के बीच में ही हिन्दी और अंग्रेज़ी के बीच स्विच करें — उत्तर या टाइमर पर कोई असर नहीं।',
      english: 'Switch between Hindi and English mid-paper — your answers and the clock are untouched.',
    },
  },
  {
    icon: BarChart3,
    title: { hindi: 'विषय एवं टॉपिकवार विश्लेषण', english: 'Subject and topic analysis' },
    body: {
      hindi: 'हर प्रयास के बाद जानें कि कौन-से टॉपिक कमजोर हैं और कहाँ से दोहराव शुरू करना है।',
      english: 'After every attempt, see which topics are weak and where your revision should start.',
    },
  },
  {
    icon: Clock,
    title: { hindi: 'रिफ्रेश-सुरक्षित टाइमर', english: 'Refresh-safe timer' },
    body: {
      hindi: 'ब्राउज़र रिफ्रेश करने पर भी घड़ी और आपके उत्तर सुरक्षित रहते हैं; प्रश्नों का क्रम भी नहीं बदलता।',
      english: 'Refreshing keeps the clock and your answers intact, and the question order never changes.',
    },
  },
  {
    icon: BookOpenCheck,
    title: { hindi: 'तुरंत उत्तर कुंजी', english: 'Instant answer key' },
    body: {
      hindi: 'जमा करते ही एक-पंक्ति उत्तर कुंजी, व्याख्या सहित विस्तृत समीक्षा और स्कोर कार्ड उपलब्ध।',
      english: 'A one-line answer key, a detailed review with explanations and your score card, right after you submit.',
    },
  },
];

export function HomePage() {
  const language = useUiLanguage();
  const { records } = useResultHistory();

  const latestByTest = useMemo(() => {
    const map = new Map<string, (typeof records)[number]['summary']>();
    for (const record of records) {
      if (!map.has(record.summary.testId)) map.set(record.summary.testId, record.summary);
    }
    return map;
  }, [records]);

  const paper2Subjects = subjectsByPaper('paper2');

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-surface">
        <Container className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-3xl">
            <Badge tone="brand" icon={<Sparkles className="h-3 w-3" />}>
              {language === 'hindi' ? 'निःशुल्क · लॉगिन आवश्यक नहीं' : 'Free · No login required'}
            </Badge>

            <h1 className="mt-4 text-3xl font-bold leading-tight text-ink sm:text-4xl lg:text-5xl">
              {language === 'hindi'
                ? 'BPSC TRE प्रारंभिक परीक्षा मॉक टेस्ट'
                : 'BPSC TRE Preliminary Mock Tests'}
            </h1>

            <p className="mt-4 text-base text-ink-muted sm:text-lg">
              {language === 'hindi'
                ? 'वास्तविक परीक्षा जैसा इंटरफ़ेस, ऋणात्मक अंकन और विस्तृत प्रदर्शन विश्लेषण के साथ अभ्यास कीजिए।'
                : 'Practise with a realistic examination interface, negative marking and detailed performance analysis.'}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to={routes.mockTests} size="lg" icon={<Play className="h-4 w-4" />} className="sm:w-auto" fullWidth>
                {language === 'hindi' ? 'मॉक टेस्ट शुरू करें' : 'Start mock test'}
              </ButtonLink>
              <ButtonLink to={routes.about} size="lg" variant="outline" className="sm:w-auto" fullWidth>
                {language === 'hindi' ? 'और जानें' : 'Learn more'}
              </ButtonLink>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              <HeroStat value={examConfig.totalQuestions} label={language === 'hindi' ? 'प्रश्न' : 'Questions'} />
              <HeroStat value={examConfig.durationMinutes} label={language === 'hindi' ? 'मिनट' : 'Minutes'} />
              <HeroStat
                value={formatMarks(examConfig.correctMarks * examConfig.totalQuestions)}
                label={language === 'hindi' ? 'अधिकतम अंक' : 'Max marks'}
              />
            </dl>
          </div>
        </Container>
      </section>

      {/* Practice sets */}
      <PageSection>
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-ink sm:text-2xl">
                {language === 'hindi' ? 'प्रैक्टिस सेट' : 'Practice sets'}
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                {language === 'hindi'
                  ? 'प्रत्येक सेट में पेपर I और पेपर II के सभी भाग सम्मिलित हैं।'
                  : 'Every set covers all parts of Paper I and Paper II.'}
              </p>
            </div>
            <ButtonLink to={routes.mockTests} variant="outline" size="sm">
              {language === 'hindi' ? 'सभी देखें' : 'View all'}
            </ButtonLink>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {mockTests.map((test) => {
              const summary = mockTestSummaries[test.id];
              if (!summary) return null;
              const lastResult = latestByTest.get(test.id);
              return (
                <MockTestCard
                  key={test.id}
                  test={test}
                  summary={summary}
                  language={language}
                  {...(lastResult ? { lastResult } : {})}
                />
              );
            })}
          </div>
        </Container>
      </PageSection>

      {/* Features */}
      <PageSection className="bg-surface">
        <Container>
          <h2 className="text-xl font-bold text-ink sm:text-2xl">
            {language === 'hindi' ? 'इस प्लेटफ़ॉर्म की विशेषताएँ' : 'What this platform gives you'}
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title.english} className="bg-canvas">
                  <Icon className="h-6 w-6 text-brand" aria-hidden="true" />
                  <h3 className="mt-3 text-base font-semibold text-ink">{localized(feature.title, language)}</h3>
                  <p className="mt-1.5 text-sm text-ink-muted">{localized(feature.body, language)}</p>
                </Card>
              );
            })}
          </div>
        </Container>
      </PageSection>

      {/* Syllabus coverage */}
      <PageSection>
        <Container>
          <h2 className="text-xl font-bold text-ink sm:text-2xl">
            {language === 'hindi' ? 'पेपर II — विषय' : 'Paper II subjects'}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            {language === 'hindi'
              ? 'सातों विषय पूरे पाठ्यक्रम के टॉपिक सहित।'
              : 'All seven subjects, with the full topic list behind each one.'}
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {paper2Subjects.map((subject) => (
              <li key={subject.key} className="surface-card p-4">
                <p className="font-semibold text-ink">{localized(subject.label, language)}</p>
                <p className="mt-1 text-xs text-ink-subtle">
                  {subject.topics.length} {language === 'hindi' ? 'टॉपिक' : 'topics'}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </PageSection>
    </>
  );
}

function HeroStat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="text-2xl font-bold tabular-nums text-ink sm:text-3xl">{value}</dd>
      <p className="text-xs text-ink-subtle sm:text-sm">{label}</p>
    </div>
  );
}

export default HomePage;
