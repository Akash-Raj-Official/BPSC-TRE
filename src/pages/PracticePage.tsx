import { useMemo, useState } from 'react';
import { BookOpen, Layers } from 'lucide-react';
import { routes } from '@/config/routes';
import { allQuestions } from '@/data/questions';
import { subjects } from '@/data/subjects';
import { useUiLanguage } from '@/store/uiLanguageStore';
import { Badge } from '@/components/common/Badge';
import { ButtonLink } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Meter } from '@/components/common/Meter';
import { Container, PageHeading, PageSection } from '@/components/layout/Page';
import { localized } from '@/utils/format';

/**
 * Syllabus coverage browser.
 *
 * Shows how many questions the bank currently holds for every subject and
 * topic, which doubles as a study checklist and as a transparency page for the
 * size of the bank.
 */
export function PracticePage() {
  const language = useUiLanguage();
  const [openSubject, setOpenSubject] = useState<string | null>(null);

  const counts = useMemo(() => {
    const bySubject = new Map<string, number>();
    const byTopic = new Map<string, number>();

    for (const question of allQuestions) {
      bySubject.set(question.subject, (bySubject.get(question.subject) ?? 0) + 1);
      const key = `${question.subject}/${question.topic}`;
      byTopic.set(key, (byTopic.get(key) ?? 0) + 1);
    }

    return { bySubject, byTopic };
  }, []);

  const maxSubjectCount = Math.max(1, ...counts.bySubject.values());

  return (
    <PageSection>
      <Container className="max-w-5xl">
        <PageHeading
          title={language === 'hindi' ? 'पाठ्यक्रम एवं प्रश्न बैंक' : 'Syllabus and question bank'}
          description={
            language === 'hindi'
              ? 'हर विषय और टॉपिक के लिए उपलब्ध प्रश्नों की संख्या। इसे अपनी तैयारी की चेकलिस्ट की तरह उपयोग करें।'
              : 'How many questions the bank holds for each subject and topic. Use it as a preparation checklist.'
          }
        />

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Card className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 shrink-0 text-brand" aria-hidden="true" />
            <div>
              <p className="text-xs text-ink-subtle">{language === 'hindi' ? 'कुल प्रश्न' : 'Total questions'}</p>
              <p className="text-xl font-bold text-ink">{allQuestions.length}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <Layers className="h-6 w-6 shrink-0 text-brand" aria-hidden="true" />
            <div>
              <p className="text-xs text-ink-subtle">{language === 'hindi' ? 'विषय' : 'Subjects'}</p>
              <p className="text-xl font-bold text-ink">{subjects.length}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <Layers className="h-6 w-6 shrink-0 text-brand" aria-hidden="true" />
            <div>
              <p className="text-xs text-ink-subtle">{language === 'hindi' ? 'टॉपिक' : 'Topics'}</p>
              <p className="text-xl font-bold text-ink">
                {subjects.reduce((total, subject) => total + subject.topics.length, 0)}
              </p>
            </div>
          </Card>
        </div>

        <ul className="mt-6 space-y-3">
          {subjects.map((subject) => {
            const total = counts.bySubject.get(subject.key) ?? 0;
            const expanded = openSubject === subject.key;

            return (
              <li key={subject.key}>
                <Card flush>
                  <button
                    type="button"
                    onClick={() => setOpenSubject(expanded ? null : subject.key)}
                    aria-expanded={expanded}
                    aria-controls={`subject-${subject.key}`}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-ink">{localized(subject.label, language)}</span>
                        <Badge tone={subject.paper === 'paper1' ? 'info' : 'brand'}>
                          {subject.paper === 'paper1' ? 'Paper I' : 'Paper II'}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <Meter
                          value={total}
                          max={maxSubjectCount}
                          label={`${localized(subject.label, language)} question count`}
                          valueText={`${total} questions`}
                          size="sm"
                        />
                        <span className="w-24 shrink-0 text-right text-xs tabular-nums text-ink-muted">
                          {total} / {subject.topics.length} {language === 'hindi' ? 'टॉपिक' : 'topics'}
                        </span>
                      </div>
                    </div>
                  </button>

                  {expanded ? (
                    <div id={`subject-${subject.key}`} className="border-t border-line p-4">
                      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {subject.topics.map((topic) => {
                          const topicCount = counts.byTopic.get(`${subject.key}/${topic.key}`) ?? 0;
                          return (
                            <li
                              key={topic.key}
                              className="flex items-center justify-between gap-2 rounded-md bg-surface-muted px-3 py-2 text-sm"
                            >
                              <span className="min-w-0 truncate text-ink">{localized(topic.label, language)}</span>
                              <span
                                className={`shrink-0 text-xs font-semibold tabular-nums ${
                                  topicCount > 0 ? 'text-success' : 'text-ink-subtle'
                                }`}
                              >
                                {topicCount}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ul>

        <div className="mt-6">
          <ButtonLink to={routes.mockTests} size="lg">
            {language === 'hindi' ? 'प्रैक्टिस सेट देखें' : 'Browse practice sets'}
          </ButtonLink>
        </div>
      </Container>
    </PageSection>
  );
}

export default PracticePage;
