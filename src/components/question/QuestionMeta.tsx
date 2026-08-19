import { BookOpen, FlaskConical } from 'lucide-react';
import { paperShortLabels } from '@/config/examConfig';
import { getSubjectShortLabel, getTopicLabel } from '@/data/subjects';
import type { Language, Question } from '@/types/exam';
import { Badge } from '@/components/common/Badge';
import { localized } from '@/utils/format';

export interface QuestionMetaProps {
  question: Question;
  language: Language;
  /** Hides the paper badge where the paper is already obvious. */
  hidePaper?: boolean;
}

/** Subject, topic, paper and provenance badges shown above a question. */
export function QuestionMeta({ question, language, hidePaper }: QuestionMetaProps) {
  const sourceLabel = question.source
    ? [question.source.exam, question.source.year].filter(Boolean).join(' ')
    : null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {!hidePaper ? <Badge tone="neutral">{localized(paperShortLabels[question.paper], language)}</Badge> : null}

      <Badge tone="brand" icon={<BookOpen className="h-3 w-3" />}>
        {getSubjectShortLabel(question.subject, language)}
      </Badge>

      <Badge tone="neutral">{getTopicLabel(question.subject, question.topic, language)}</Badge>

      {sourceLabel ? (
        <Badge tone="info" title={`Modelled on the pattern of ${sourceLabel}`}>
          {language === 'hindi' ? `पैटर्न: ${sourceLabel}` : `Pattern: ${sourceLabel}`}
        </Badge>
      ) : null}

      {question.demo ? (
        <Badge tone="warning" icon={<FlaskConical className="h-3 w-3" />}>
          {language === 'hindi' ? 'अभ्यास प्रश्न' : 'PRACTICE QUESTION'}
        </Badge>
      ) : null}
    </div>
  );
}
