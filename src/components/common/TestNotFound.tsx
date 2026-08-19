import { FileQuestion } from 'lucide-react';
import { routes } from '@/config/routes';
import { ButtonLink } from './Button';
import { EmptyState } from './Feedback';

export interface TestNotFoundProps {
  testId?: string;
  /** `missing` = unknown id, `empty` = the set has no questions. */
  reason?: 'missing' | 'empty';
}

/** Friendly fallback for an invalid test id or an empty question bank. */
export function TestNotFound({ testId, reason = 'missing' }: TestNotFoundProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16">
      <EmptyState
        icon={<FileQuestion className="h-10 w-10" aria-hidden="true" />}
        title={reason === 'empty' ? 'This practice set has no questions yet' : 'Practice set not found'}
        description={
          reason === 'empty'
            ? 'The set exists but its question bank is empty, so it cannot be started. Please pick another set.'
            : `We could not find a practice set${testId ? ` with the id "${testId}"` : ''}. It may have been renamed or removed.`
        }
        action={<ButtonLink to={routes.mockTests}>Browse practice sets</ButtonLink>}
      />
    </div>
  );
}
