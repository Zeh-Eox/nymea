import { api } from './api';
import type { DailyEntry } from '@/types/index';

export type SymptomInputPayload = {
  type: string;
  intensity: number;
};

export type UpsertEntryPayload = {
  date: string;
  mood?: string | null;
  sleep?: number | null;
  hydration?: number | null;
  libido?: number | null;
  weight?: number | null;
  symptoms?: SymptomInputPayload[];
};

export type ListEntriesParams = {
  from?: string;
  to?: string;
};

export const entryService = {
  list: async (params: ListEntriesParams = {}): Promise<DailyEntry[]> => {
    const { data } = await api.get<DailyEntry[]>('/entries', { params });
    return data;
  },
  upsert: async (payload: UpsertEntryPayload): Promise<DailyEntry> => {
    const { data } = await api.post<DailyEntry>('/entries', payload);
    return data;
  },
};
