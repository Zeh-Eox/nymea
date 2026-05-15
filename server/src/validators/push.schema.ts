import { z } from 'zod';

export const registerPushSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['ios', 'android', 'web']),
});

export const updatePushSettingsSchema = z.object({
  remindPeriod: z.boolean().optional(),
  remindOvulation: z.boolean().optional(),
  remindJournal: z.boolean().optional(),
});

export type RegisterPushInput = z.infer<typeof registerPushSchema>;
export type UpdatePushSettingsInput = z.infer<typeof updatePushSettingsSchema>;
