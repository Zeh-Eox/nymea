import { z } from 'zod';

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
  .or(z.string().datetime());

export const symptomInputSchema = z.object({
  type: z.string().min(1).max(32),
  intensity: z.number().int().min(1).max(5),
});

export const upsertEntrySchema = z.object({
  date: dateOnly,
  mood: z.string().min(1).max(32).nullable().optional(),
  sleep: z.number().min(0).max(24).nullable().optional(),
  hydration: z.number().min(0).max(10).nullable().optional(),
  libido: z.number().int().min(1).max(5).nullable().optional(),
  weight: z.number().positive().max(500).nullable().optional(),
  symptoms: z.array(symptomInputSchema).max(20).optional(),
});

export const listEntriesQuerySchema = z.object({
  from: dateOnly.optional(),
  to: dateOnly.optional(),
});

export type UpsertEntryInput = z.infer<typeof upsertEntrySchema>;
export type SymptomInput = z.infer<typeof symptomInputSchema>;
export type ListEntriesQuery = z.infer<typeof listEntriesQuerySchema>;
