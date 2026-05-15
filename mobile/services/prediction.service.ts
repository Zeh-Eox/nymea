import { api } from './api';

export type PredictionConfidence = 'high' | 'medium' | 'low';

export type Prediction = {
  nextPeriodStart: string;
  nextPeriodEnd: string;
  ovulation: string;
  fertileStart: string;
  fertileEnd: string;
  cycleLength: number;
  periodLength: number;
  daysUntilNextPeriod: number;
  confidence: PredictionConfidence;
  basedOnCycles: number;
};

export const predictionService = {
  get: async (): Promise<Prediction | null> => {
    const { data, status } = await api.get<Prediction | ''>('/predictions');
    if (status === 204 || data === '' || data === null) return null;
    return data as Prediction;
  },
};
