import { create } from 'zustand';
import type { DailyEntry } from '@/types/index';

type EntryState = {
  entries: Record<string, DailyEntry>;
  isLoading: boolean;
  setEntries: (entries: DailyEntry[]) => void;
  upsertEntry: (entry: DailyEntry) => void;
  setLoading: (loading: boolean) => void;
};

export function dateKey(iso: string): string {
  return iso.slice(0, 10);
}

export const useEntryStore = create<EntryState>((set) => ({
  entries: {},
  isLoading: false,
  setEntries: (entries) =>
    set(() => ({
      entries: Object.fromEntries(entries.map((e) => [dateKey(e.date), e])),
    })),
  upsertEntry: (entry) =>
    set((state) => ({
      entries: { ...state.entries, [dateKey(entry.date)]: entry },
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));
