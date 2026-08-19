import { examConfig } from '@/config/examConfig';
import type { ExamResult, StoredResultSummary } from '@/types/exam';

/**
 * Safe localStorage access.
 *
 * Every read is defensive: private-browsing modes, disabled storage, quota
 * errors and hand-edited/corrupt JSON must degrade to "no saved data" instead
 * of throwing an unhandled error into a React render.
 */

const NAMESPACE = 'bpsc-tre-mock';
const VERSION = 'v1';

export const STORAGE_KEYS = {
  examSession: `${NAMESPACE}:${VERSION}:exam-session`,
  results: `${NAMESPACE}:${VERSION}:results`,
  theme: `${NAMESPACE}:${VERSION}:theme`,
  /** Interface language — separate from the medium of the question paper. */
  uiLanguage: `${NAMESPACE}:${VERSION}:ui-language`,
} as const;

let storageAvailable: boolean | null = null;

export function isStorageAvailable(): boolean {
  if (storageAvailable !== null) return storageAvailable;
  try {
    const probe = `${NAMESPACE}:probe`;
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  return storageAvailable;
}

export function readRaw(key: string): string | null {
  if (!isStorageAvailable()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeRaw(key: string, value: string): boolean {
  if (!isStorageAvailable()) return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    // Quota exceeded or storage revoked mid-session — the app keeps working
    // in memory, it just cannot resume after a refresh.
    return false;
  }
}

export function removeKey(key: string): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* nothing sensible to do */
  }
}

/** Parses JSON, dropping the entry when it is corrupt rather than throwing. */
export function readJSON<T>(key: string, isValid?: (value: unknown) => value is T): T | null {
  const raw = readRaw(key);
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isValid && !isValid(parsed)) {
      removeKey(key);
      return null;
    }
    return parsed as T;
  } catch {
    removeKey(key);
    return null;
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  try {
    return writeRaw(key, JSON.stringify(value));
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*                              Results history                               */
/* -------------------------------------------------------------------------- */

export interface StoredResultRecord {
  summary: StoredResultSummary;
  result: ExamResult;
}

function isResultRecordArray(value: unknown): value is StoredResultRecord[] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        typeof entry === 'object' &&
        entry !== null &&
        'summary' in entry &&
        'result' in entry &&
        typeof (entry as StoredResultRecord).summary?.testId === 'string',
    )
  );
}

export function getAllResults(): StoredResultRecord[] {
  return readJSON<StoredResultRecord[]>(STORAGE_KEYS.results, isResultRecordArray) ?? [];
}

/** Newest first, capped at `examConfig.maxStoredResults`. */
export function saveResultRecord(record: StoredResultRecord): StoredResultRecord[] {
  const existing = getAllResults().filter(
    (entry) => !(entry.summary.testId === record.summary.testId && entry.summary.submittedAt === record.summary.submittedAt),
  );
  const next = [record, ...existing]
    .sort((a, b) => b.summary.submittedAt - a.summary.submittedAt)
    .slice(0, examConfig.maxStoredResults);
  writeJSON(STORAGE_KEYS.results, next);
  return next;
}

export function getLatestResultForTest(testId: string): StoredResultRecord | null {
  return getAllResults().find((entry) => entry.summary.testId === testId) ?? null;
}

export function deleteResult(testId: string, submittedAt: number): StoredResultRecord[] {
  const next = getAllResults().filter(
    (entry) => !(entry.summary.testId === testId && entry.summary.submittedAt === submittedAt),
  );
  writeJSON(STORAGE_KEYS.results, next);
  return next;
}

export function clearAllResults(): void {
  removeKey(STORAGE_KEYS.results);
}

/* -------------------------------------------------------------------------- */
/*                       Storage adapter for zustand/persist                   */
/* -------------------------------------------------------------------------- */

/**
 * `persist` expects a synchronous `getItem/setItem/removeItem` trio. Wrapping
 * the safe helpers here keeps every storage failure inside this module.
 */
export const safeStateStorage = {
  getItem: (name: string): string | null => readRaw(name),
  setItem: (name: string, value: string): void => {
    writeRaw(name, value);
  },
  removeItem: (name: string): void => removeKey(name),
};
