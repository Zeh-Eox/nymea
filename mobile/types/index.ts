export type User = {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  onboardedAt: string | null;
  defaultCycleLength: number;
  defaultPeriodLength: number;
};

export type Cycle = {
  id: string;
  startDate: string;
  endDate: string | null;
  cycleLength: number | null;
  periodLength: number | null;
  userId: string;
};

export type Symptom = {
  id: string;
  type: string;
  intensity: number;
  date: string;
  entryId: string;
};

export type DailyEntry = {
  id: string;
  date: string;
  mood: string | null;
  sleep: number | null;
  hydration: number | null;
  libido: number | null;
  weight: number | null;
  userId: string;
  symptoms: Symptom[];
};

export type MoodEntry = {
  id: string;
  mood: string;
  note: string | null;
  date: string;
  userId: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};
