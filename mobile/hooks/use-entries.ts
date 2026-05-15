import { useCallback, useEffect, useMemo } from 'react';
import { dateKey, useEntryStore } from '@/store/entry.store';
import {
  entryService,
  type ListEntriesParams,
  type UpsertEntryPayload,
} from '@/services/entry.service';
import type { DailyEntry } from '@/types/index';

export function useEntries(params?: ListEntriesParams, autoLoad = true) {
  const { entries, isLoading, setEntries, upsertEntry, setLoading } =
    useEntryStore();

  const stableParams = useMemo(
    () => ({ from: params?.from, to: params?.to }),
    [params?.from, params?.to],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await entryService.list(stableParams);
      setEntries(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [stableParams, setEntries, setLoading]);

  useEffect(() => {
    if (autoLoad) {
      void refresh();
    }
  }, [autoLoad, refresh]);

  const save = useCallback(
    async (payload: UpsertEntryPayload): Promise<DailyEntry> => {
      const saved = await entryService.upsert(payload);
      upsertEntry(saved);
      return saved;
    },
    [upsertEntry],
  );

  const getByDate = useCallback(
    (iso: string): DailyEntry | undefined => entries[dateKey(iso)],
    [entries],
  );

  return { entries, isLoading, refresh, save, getByDate };
}
