import { Router } from 'express';
import { onboardingController } from '@controllers/onboarding.controller';
import { validate } from '@middlewares/validate.middleware';
import { asyncHandler } from '@utils/async-handler';
import { onboardingSchema } from '@validators/onboarding.schema';

export const onboardingRoutes = Router();

onboardingRoutes.post(
  '/',
  validate(onboardingSchema),
  asyncHandler(onboardingController.complete),
);
