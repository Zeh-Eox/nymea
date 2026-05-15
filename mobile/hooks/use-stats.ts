import { useCallback, useEffect } from 'react';
import { useStatsStore } from '@/store/stats.store';
import { statsService } from '@/services/stats.service';

export function useStats(autoLoad = true) {
  const { stats, isLoading, setStats, setLoading } = useStatsStore();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await statsService.get();
      setStats(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [setStats, setLoading]);

  useEffect(() => {
    if (autoLoad) void refresh();
  }, [autoLoad, refresh]);

  return { stats, isLoading, refresh };
}
