import { useCallback, useEffect, useState } from 'react';
import type { StoredResultRecord } from '@/utils/storage';
import { getAllResults, getLatestResultForTest } from '@/utils/storage';

/** Loads the most recent stored attempt for a test. */
export function useStoredResult(testId: string | undefined): {
  record: StoredResultRecord | null;
  loading: boolean;
  reload: () => void;
} {
  const [record, setRecord] = useState<StoredResultRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    if (!testId) {
      setRecord(null);
      setLoading(false);
      return;
    }
    setRecord(getLatestResultForTest(testId));
    setLoading(false);
  }, [testId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { record, loading, reload };
}

/** Loads the full attempt history, newest first. */
export function useResultHistory(): {
  records: StoredResultRecord[];
  reload: () => void;
} {
  const [records, setRecords] = useState<StoredResultRecord[]>([]);

  const reload = useCallback(() => {
    setRecords(getAllResults());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { records, reload };
}
