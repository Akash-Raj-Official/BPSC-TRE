import { mockTests } from '@/data/mockTests';
import { formatReport, validateMockTests } from './validation';

/**
 * Development-time question-bank check.
 *
 * Runs once on start-up in `npm run dev` and prints a grouped console report.
 * Errors are loud (a malformed question would break scoring); warnings such as
 * a missing translation are informational.
 */
export function runDevValidation(): void {
  const report = validateMockTests(mockTests);

  if (report.errors.length === 0 && report.warnings.length === 0) {
    console.info(`[question-bank] ${report.checked} question(s) validated with no issues.`);
    return;
  }

  const groupLabel = `[question-bank] ${report.errors.length} error(s), ${report.warnings.length} warning(s)`;

  console.groupCollapsed(groupLabel);
  console.log(formatReport(report));
  console.groupEnd();

  if (report.errors.length > 0) {
    console.error(
      `[question-bank] ${report.errors.length} question(s) are invalid and will not be scored correctly. ` +
        'Expand the group above for details.',
    );
  }
}
