import { prisma } from '@config/prisma';
import { HttpError } from '@utils/http-error';
import type { OnboardingInput } from '@validators/onboarding.schema';

export const onboardingService = {
  async complete(userId: string, input: OnboardingInput): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw HttpError.unauthorized('User no longer exists');
    }
    if (user.onboardedAt) {
      throw HttpError.conflict('Onboarding already completed');
    }

    await prisma.$transaction(async (tx) => {
      if (input.lastPeriodStart) {
        await tx.cycle.create({
          data: {
            userId,
            startDate: new Date(input.lastPeriodStart),
            cycleLength: input.cycleLength ?? user.defaultCycleLength,
            periodLength: input.periodLength ?? user.defaultPeriodLength,
          },
        });
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          onboardedAt: new Date(),
          name: input.name ?? user.name,
          defaultCycleLength: input.cycleLength ?? user.defaultCycleLength,
          defaultPeriodLength: input.periodLength ?? user.defaultPeriodLength,
        },
      });
    });
  },
};
