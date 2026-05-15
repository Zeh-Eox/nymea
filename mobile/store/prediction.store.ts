import { create } from 'zustand';
import type { Prediction } from '@/services/prediction.service';

type PredictionState = {
  prediction: Prediction | null;
  isLoading: boolean;
  setPrediction: (p: Prediction | null) => void;
  setLoading: (loading: boolean) => void;
};

export const usePredictionStore = create<PredictionState>((set) => ({
  prediction: null,
  isLoading: false,
  setPrediction: (prediction) => set({ prediction }),
  setLoading: (isLoading) => set({ isLoading }),
}));
