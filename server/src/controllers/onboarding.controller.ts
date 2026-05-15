import type { Request, Response } from 'express';
import { authService } from '@services/auth.service';
import { onboardingService } from '@services/onboarding.service';
import { HttpError } from '@utils/http-error';
import type { OnboardingInput } from '@validators/onboarding.schema';

export const onboardingController = {
  complete: async (req: Request, res: Response) => {
    if (!req.user) {
      throw HttpError.unauthorized();
    }
    await onboardingService.complete(req.user.userId, req.body as OnboardingInput);
    const user = await authService.getMe(req.user.userId);
    res.json(user);
  },
};
