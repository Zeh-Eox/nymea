import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 10);

function daysAgo(days: number): Date {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('Password123!', BCRYPT_ROUNDS);

  const user = await prisma.user.upsert({
    where: { email: 'demo@nymea.app' },
    update: { onboardedAt: new Date() },
    create: {
      email: 'demo@nymea.app',
      password: passwordHash,
      name: 'Demo',
      onboardedAt: new Date(),
      defaultCycleLength: 28,
      defaultPeriodLength: 5,
    },
  });

  await prisma.cycle.deleteMany({ where: { userId: user.id } });

  const cycleOffsets = [84, 56, 28, 0];
  for (const offset of cycleOffsets) {
    await prisma.cycle.create({
      data: {
        userId: user.id,
        startDate: daysAgo(offset),
        endDate: daysAgo(offset - 5),
        cycleLength: 28,
        periodLength: 5,
      },
    });
  }

  const entry = await prisma.dailyEntry.upsert({
    where: { userId_date: { userId: user.id, date: daysAgo(0) } },
    update: {},
    create: {
      userId: user.id,
      date: daysAgo(0),
      mood: 'calm',
      sleep: 7.5,
      hydration: 2.0,
      libido: 3,
      weight: 60,
    },
  });

  await prisma.symptom.createMany({
    data: [
      { entryId: entry.id, type: 'cramps', intensity: 3, date: daysAgo(0) },
      { entryId: entry.id, type: 'headache', intensity: 2, date: daysAgo(0) },
    ],
  });

  await prisma.mood.create({
    data: {
      userId: user.id,
      date: daysAgo(0),
      mood: 'calm',
      note: 'Première journée tranquille',
    },
  });

  console.log(`Seeded user ${user.email} with ${cycleOffsets.length} cycles + journal entry.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
