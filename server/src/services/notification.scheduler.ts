import cron from 'node-cron';
import { prisma } from '@config/prisma';
import { env } from '@config/env';
import { predictionService } from '@services/prediction.service';
import { pushService } from '@services/push.service';
import { logger } from '@utils/logger';

async function runMorningReminders(): Promise<void> {
  const users = await prisma.user.findMany({
    where: {
      onboardedAt: { not: null },
      deviceTokens: { some: {} },
      OR: [{ remindPeriod: true }, { remindOvulation: true }],
    },
    select: { id: true, remindPeriod: true, remindOvulation: true },
  });

  for (const user of users) {
    try {
      const prediction = await predictionService.forUser(user.id);
      if (!prediction) continue;

      const days = prediction.daysUntilNextPeriod;
      const messages: { title: string; body: string }[] = [];

      if (user.remindPeriod && days === 2) {
        messages.push({
          title: 'Tes règles arrivent bientôt',
          body: 'Plus que 2 jours. Pense à préparer ton kit.',
        });
      }
      if (user.remindPeriod && days === 0) {
        messages.push({
          title: 'Jour J',
          body: 'Tes règles sont prévues aujourd’hui.',
        });
      }
      if (user.remindOvulation) {
        const todayMs = Date.now();
        const ovuMs = new Date(prediction.ovulation).getTime();
        const diff = Math.round((ovuMs - todayMs) / (1000 * 60 * 60 * 24));
        if (diff === 0) {
          messages.push({
            title: 'Ovulation aujourd’hui',
            body: 'Tu es probablement dans ta fenêtre fertile.',
          });
        }
      }

      for (const msg of messages) {
        await pushService.sendToUser(user.id, msg);
      }
    } catch (err) {
      logger.error({ err, userId: user.id }, 'Morning reminder failed');
    }
  }
}

async function runEveningJournalNudges(): Promise<void> {
  const users = await prisma.user.findMany({
    where: {
      onboardedAt: { not: null },
      remindJournal: true,
      deviceTokens: { some: {} },
    },
    select: { id: true },
  });

  for (const user of users) {
    try {
      await pushService.sendToUser(user.id, {
        title: 'Ton journal du jour',
        body: 'Une minute pour noter ton humeur et tes symptômes ?',
      });
    } catch (err) {
      logger.error({ err, userId: user.id }, 'Evening nudge failed');
    }
  }
}

export function startNotificationScheduler(): void {
  if (!env.ENABLE_PUSH_SCHEDULER) {
    logger.info('Push scheduler disabled (ENABLE_PUSH_SCHEDULER=false)');
    return;
  }

  cron.schedule(
    '0 8 * * *',
    () => {
      void runMorningReminders();
    },
    { timezone: env.PUSH_SCHEDULER_TZ },
  );

  cron.schedule(
    '0 21 * * *',
    () => {
      void runEveningJournalNudges();
    },
    { timezone: env.PUSH_SCHEDULER_TZ },
  );

  logger.info(
    `Push scheduler enabled (timezone=${env.PUSH_SCHEDULER_TZ}, morning=08:00, evening=21:00)`,
  );
}
