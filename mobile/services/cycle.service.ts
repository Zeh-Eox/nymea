import { api } from './api';
import type { Cycle } from '@/types/index';

export type CreateCyclePayload = {
  startDate: string;
  endDate?: string | null;
  periodLength?: number;
  cycleLength?: number;
};

export type UpdateCyclePayload = Partial<CreateCyclePayload>;

export const cycleService = {
  list: async (limit = 12): Promise<Cycle[]> => {
    const { data } = await api.get<Cycle[]>('/cycles', { params: { limit } });
    return data;
  },
  create: async (payload: CreateCyclePayload): Promise<Cycle> => {
    const { data } = await api.post<Cycle>('/cycles', payload);
    return data;
  },
  update: async (id: string, payload: UpdateCyclePayload): Promise<Cycle> => {
    const { data } = await api.put<Cycle>(`/cycles/${id}`, payload);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/cycles/${id}`);
  },
};
