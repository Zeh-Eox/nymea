import { z } from 'zod';

export const createCycleSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  periodLength: z.number().int().min(1).max(15).optional(),
  cycleLength: z.number().int().min(15).max(60).optional(),
});

export const updateCycleSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().nullable().optional(),
  periodLength: z.number().int().min(1).max(15).optional(),
  cycleLength: z.number().int().min(15).max(60).optional(),
});

export type CreateCycleInput = z.infer<typeof createCycleSchema>;
export type UpdateCycleInput = z.infer<typeof updateCycleSchema>;
