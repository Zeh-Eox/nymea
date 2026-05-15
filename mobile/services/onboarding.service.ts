import { api } from './api';
import type { User } from '@/types/index';

export type OnboardingPayload = {
  name?: string;
  lastPeriodStart?: string;
  cycleLength?: number;
  periodLength?: number;
};

export const onboardingService = {
  complete: async (payload: OnboardingPayload): Promise<User> => {
    const { data } = await api.post<User>('/onboarding', payload);
    return data;
  },
};
