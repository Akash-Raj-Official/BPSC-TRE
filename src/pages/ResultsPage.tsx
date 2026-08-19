import { useState } from 'react';
import { Link } from 'react-router-dom';
import { History, Trash2 } from 'lucide-react';
import { getBenchmark } from '@/config/examConfig';
import { routes } from '@/config/routes';
import { useResultHistory } from '@/hooks/useStoredResult';
import { useUiLanguage } from '@/store/uiLanguageStore';
import { Badge } from '@/components/common/Badge';
import { Button, ButtonLink } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/Feedback';
import { Modal } from '@/components/common/Modal';
import { Container, PageHeading, PageSection } from '@/components/layout/Page';
import { clearAllResults } from '@/utils/storage';
import { formatDateTime, formatMarks, formatPercent, localized } from '@/utils/format';
import { formatDurationLabel } from '@/utils/timer';

export function ResultsPage() {
  const language = useUiLanguage();
  const { records, reload } = useResultHistory();
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClear = (): void => {
    clearAllResults();
    setConfirmClear(false);
    reload();
  };

  return (
    <PageSection>
      <Container className="max-w-4xl">
        <PageHeading
          title={language === 'hindi' ? 'मेरे परिणाम' : 'My results'}
          description={
            language === 'hindi'
              ? 'आपके सभी प्रयास इसी ब्राउज़र में सुरक्षित रहते हैं। ब्राउज़र डेटा हटाने पर ये मिट जाएँगे।'
              : 'Every attempt is stored in this browser only. Clearing your browser data removes them.'
          }
          actions={
            records.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmClear(true)}
                icon={<Trash2 className="h-4 w-4" />}
              >
                {language === 'hindi' ? 'सभी हटाएँ' : 'Clear all'}
              </Button>
            ) : null
          }
        />

        {records.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<History className="h-10 w-10" aria-hidden="true" />}
              title={language === 'hindi' ? 'अभी कोई परिणाम नहीं' : 'No results yet'}
              description={
                language === 'hindi'
                  ? 'कोई प्रैक्टिस सेट पूरा करते ही आपका स्कोर कार्ड यहाँ दिखाई देगा।'
                  : 'Finish a practice set and your score card will appear here.'
              }
              action={<ButtonLink to={routes.mockTests}>Browse practice sets</ButtonLink>}
            />
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {records.map((record) => {
              const { summary } = record;
              const percentage = summary.maxScore > 0 ? (summary.finalScore / summary.maxScore) * 100 : 0;
              const benchmark = getBenchmark(percentage);

              return (
                <li key={`${summary.testId}-${summary.submittedAt}`}>
                  <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={routes.result(summary.testId)}
                          className="text-base font-semibold text-ink hover:text-brand"
                        >
                          {localized(summary.testTitle, language)}
                        </Link>
                        <Badge tone={benchmark.tone}>{localized(benchmark.label, language)}</Badge>
                        {summary.autoSubmitted ? (
                          <Badge tone="warning">
                            {language === 'hindi' ? 'स्वतः जमा' : 'Auto-submitted'}
                          </Badge>
                        ) : null}
                      </div>

                      <p className="mt-1 text-sm text-ink-muted">
                        {summary.candidateName ? `${summary.candidateName} · ` : ''}
                        {formatDateTime(summary.submittedAt, language)}
                      </p>

                      <p className="mt-1.5 text-xs text-ink-subtle tabular-nums">
                        {language === 'hindi' ? 'सही' : 'Correct'} {summary.correct} ·{' '}
                        {language === 'hindi' ? 'गलत' : 'Wrong'} {summary.incorrect} · E {summary.dontKnow} ·{' '}
                        {language === 'hindi' ? 'छोड़े' : 'Skipped'} {summary.unanswered} ·{' '}
                        {formatDurationLabel(summary.timeTakenSeconds)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <div className="text-right">
                        <p className="text-2xl font-bold tabular-nums text-ink">
                          {formatMarks(summary.finalScore)}
                          <span className="text-sm font-normal text-ink-subtle"> / {formatMarks(summary.maxScore)}</span>
                        </p>
                        <p className="text-xs text-ink-subtle tabular-nums">
                          {formatPercent(summary.accuracy, 1)} {language === 'hindi' ? 'सटीकता' : 'accuracy'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <ButtonLink to={routes.result(summary.testId)} size="sm" variant="outline">
                          {language === 'hindi' ? 'विवरण' : 'Details'}
                        </ButtonLink>
                        <ButtonLink to={routes.review(summary.testId)} size="sm" variant="ghost">
                          {language === 'hindi' ? 'समीक्षा' : 'Review'}
                        </ButtonLink>
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </Container>

      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title={language === 'hindi' ? 'सभी परिणाम हटाएँ?' : 'Clear all results?'}
        description={
          language === 'hindi'
            ? 'यह क्रिया पूर्ववत नहीं की जा सकती। सभी संग्रहीत प्रयास स्थायी रूप से हट जाएँगे।'
            : 'This cannot be undone. Every stored attempt will be permanently removed.'
        }
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmClear(false)} fullWidth className="sm:w-auto">
              {language === 'hindi' ? 'रद्द करें' : 'Cancel'}
            </Button>
            <Button variant="danger" onClick={handleClear} fullWidth className="sm:w-auto">
              {language === 'hindi' ? 'हटाएँ' : 'Clear all'}
            </Button>
          </>
        }
      />
    </PageSection>
  );
}

export default ResultsPage;
