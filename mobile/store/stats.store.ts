import { create } from 'zustand';
import type { Stats } from '@/services/stats.service';

type StatsState = {
  stats: Stats | null;
  isLoading: boolean;
  setStats: (s: Stats | null) => void;
  setLoading: (loading: boolean) => void;
};

export const useStatsStore = create<StatsState>((set) => ({
  stats: null,
  isLoading: false,
  setStats: (stats) => set({ stats }),
  setLoading: (isLoading) => set({ isLoading }),
}));
