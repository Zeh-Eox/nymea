import { z } from 'zod';

export const onboardingSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  lastPeriodStart: z.string().datetime().optional(),
  cycleLength: z.number().int().min(15).max(60).optional(),
  periodLength: z.number().int().min(1).max(15).optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
