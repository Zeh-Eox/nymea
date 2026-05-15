import { create } from 'zustand';

type OnboardingState = {
  name: string;
  lastPeriodDaysAgo: number | null;
  cycleLength: number;
  periodLength: number;
  setName: (name: string) => void;
  setLastPeriodDaysAgo: (days: number | null) => void;
  setCycleLength: (n: number) => void;
  setPeriodLength: (n: number) => void;
  reset: () => void;
};

const INITIAL = {
  name: '',
  lastPeriodDaysAgo: null,
  cycleLength: 28,
  periodLength: 5,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...INITIAL,
  setName: (name) => set({ name }),
  setLastPeriodDaysAgo: (lastPeriodDaysAgo) => set({ lastPeriodDaysAgo }),
  setCycleLength: (cycleLength) => set({ cycleLength }),
  setPeriodLength: (periodLength) => set({ periodLength }),
  reset: () => set(INITIAL),
}));
