import { useCallback, useEffect } from 'react';
import { usePredictionStore } from '@/store/prediction.store';
import { predictionService } from '@/services/prediction.service';
import { useCycleStore } from '@/store/cycle.store';

export function usePrediction(autoLoad = true) {
  const { prediction, isLoading, setPrediction, setLoading } =
    usePredictionStore();
  const cycles = useCycleStore((s) => s.cycles);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await predictionService.get();
      setPrediction(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [setPrediction, setLoading]);

  useEffect(() => {
    if (autoLoad) void refresh();
  }, [autoLoad, refresh, cycles.length]);

  return { prediction, isLoading, refresh };
}
