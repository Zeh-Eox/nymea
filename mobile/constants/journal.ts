export const MOODS = [
  { value: "happy", label: "Heureuse" },
  { value: "calm", label: "Calme" },
  { value: "energetic", label: "Énergique" },
  { value: "sad", label: "Triste" },
  { value: "anxious", label: "Anxieuse" },
  { value: "irritable", label: "Irritable" },
  { value: "neutral", label: "Neutre" },
] as const;

export type MoodValue = (typeof MOODS)[number]["value"];

export const SYMPTOM_TYPES = [
  { value: "cramps", label: "Crampes" },
  { value: "headache", label: "Maux de tête" },
  { value: "bloating", label: "Ballonnements" },
  { value: "fatigue", label: "Fatigue" },
  { value: "breast_tenderness", label: "Tensions seins" },
  { value: "acne", label: "Acné" },
  { value: "back_pain", label: "Dos" },
  { value: "nausea", label: "Nausées" },
] as const;

export type SymptomType = (typeof SYMPTOM_TYPES)[number]["value"];
