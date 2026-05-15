import { useCallback, useEffect } from 'react';
import { useCycleStore } from '@/store/cycle.store';
import {
  cycleService,
  type CreateCyclePayload,
  type UpdateCyclePayload,
} from '@/services/cycle.service';

export function useCycles(autoLoad = true) {
  const {
    cycles,
    isLoading,
    setCycles,
    upsertCycle,
    removeCycle,
    setLoading,
  } = useCycleStore();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cycleService.list();
      setCycles(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [setCycles, setLoading]);

  useEffect(() => {
    if (autoLoad && cycles.length === 0) {
      void refresh();
    }
  }, [autoLoad, cycles.length, refresh]);

  const create = useCallback(
    async (payload: CreateCyclePayload) => {
      const created = await cycleService.create(payload);
      upsertCycle(created);
      return created;
    },
    [upsertCycle],
  );

  const update = useCallback(
    async (id: string, payload: UpdateCyclePayload) => {
      const updated = await cycleService.update(id, payload);
      upsertCycle(updated);
      return updated;
    },
    [upsertCycle],
  );

  const remove = useCallback(
    async (id: string) => {
      await cycleService.remove(id);
      removeCycle(id);
    },
    [removeCycle],
  );

  return { cycles, isLoading, refresh, create, update, remove };
}
