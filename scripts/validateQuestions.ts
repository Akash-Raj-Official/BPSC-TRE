import { mockTests } from '../src/data/mockTests';
import { formatReport, validateMockTests } from '../src/utils/validation';

/**
 * CI-friendly question-bank check.
 *
 *   npm run validate:questions
 *
 * Exits non-zero when any question is invalid, so a malformed bank cannot be
 * merged or deployed.
 */
const report = validateMockTests(mockTests);

console.log(formatReport(report));

if (!report.valid) {
  throw new Error(`Question bank validation failed with ${report.errors.length} error(s).`);
}

console.log('Question bank validation passed.');
