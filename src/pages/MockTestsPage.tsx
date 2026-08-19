import { useMemo } from 'react';
import { examConfig } from '@/config/examConfig';
import { mockTests, mockTestSummaries } from '@/data/mockTests';
import { useResultHistory } from '@/hooks/useStoredResult';
import { useUiLanguage } from '@/store/uiLanguageStore';
import { Alert } from '@/components/common/Alert';
import { MockTestCard } from '@/components/common/MockTestCard';
import { Container, PageHeading, PageSection } from '@/components/layout/Page';

export function MockTestsPage() {
  const language = useUiLanguage();
  const { records } = useResultHistory();

  const latestByTest = useMemo(() => {
    const map = new Map<string, (typeof records)[number]['summary']>();
    for (const record of records) {
      if (!map.has(record.summary.testId)) map.set(record.summary.testId, record.summary);
    }
    return map;
  }, [records]);

  return (
    <PageSection>
      <Container>
        <PageHeading
          title={language === 'hindi' ? 'प्रैक्टिस सेट' : 'Practice sets'}
          description={
            language === 'hindi'
              ? `प्रत्येक सेट में पेपर I (भाषा) और पेपर II (सामान्य अध्ययन) के सभी भाग हैं। अंकन योजना सभी सेट में समान है: सही +${examConfig.correctMarks}, गलत −1/3, अनुत्तरित −1/3, विकल्प E पर 0।`
              : `Every set covers all parts of Paper I (Language) and Paper II (General Studies). The marking is the same throughout: correct +${examConfig.correctMarks}, incorrect −1/3, unanswered −1/3 and option E 0.`
          }
        />

        <Alert tone="info" className="mt-6">
          {language === 'hindi'
            ? 'सभी प्रश्न इस प्लेटफ़ॉर्म के लिए तैयार किए गए अभ्यास प्रश्न हैं, जो पिछली BPSC परीक्षाओं के प्रारूप पर आधारित हैं। ये किसी आधिकारिक प्रश्नपत्र की हूबहू प्रतिलिपि नहीं हैं।'
            : 'All questions are practice questions written for this platform, modelled on the pattern of previous BPSC examinations. They are not verbatim copies of any official paper.'}
        </Alert>

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
  );
}

export default MockTestsPage;
