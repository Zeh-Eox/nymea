import { api } from './api';

export type TopSymptom = { type: string; count: number };
export type MoodPoint = { date: string; mood: string };
export type CycleHistoryPoint = { startDate: string; length: number };

export type Stats = {
  avgCycleLength: number | null;
  avgPeriodLength: number | null;
  cycleLengthVariance: number | null;
  regularityScore: number | null;
  totalCycles: number;
  cycleHistory: CycleHistoryPoint[];
  topSymptoms: TopSymptom[];
  moodTrend: MoodPoint[];
};

export const statsService = {
  get: async (): Promise<Stats> => {
    const { data } = await api.get<Stats>('/stats');
    return data;
  },
};
