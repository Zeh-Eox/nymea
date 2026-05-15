import { create } from 'zustand';
import type { Cycle } from '@/types/index';

type CycleState = {
  cycles: Cycle[];
  isLoading: boolean;
  setCycles: (cycles: Cycle[]) => void;
  addCycle: (cycle: Cycle) => void;
  upsertCycle: (cycle: Cycle) => void;
  removeCycle: (id: string) => void;
  setLoading: (loading: boolean) => void;
};

export const useCycleStore = create<CycleState>((set) => ({
  cycles: [],
  isLoading: false,
  setCycles: (cycles) => set({ cycles }),
  addCycle: (cycle) =>
    set((state) => ({
      cycles: [cycle, ...state.cycles].sort((a, b) =>
        b.startDate.localeCompare(a.startDate),
      ),
    })),
  upsertCycle: (cycle) =>
    set((state) => {
      const next = state.cycles.some((c) => c.id === cycle.id)
        ? state.cycles.map((c) => (c.id === cycle.id ? cycle : c))
        : [cycle, ...state.cycles];
      return {
        cycles: next.sort((a, b) => b.startDate.localeCompare(a.startDate)),
      };
    }),
  removeCycle: (id) =>
    set((state) => ({ cycles: state.cycles.filter((c) => c.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
}));
