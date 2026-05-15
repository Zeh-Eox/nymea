import { prisma } from '@config/prisma';

const HISTORY_WINDOW = 12;
const SYMPTOMS_WINDOW_DAYS = 60;
const MOOD_WINDOW_DAYS = 30;

export type TopSymptom = { type: string; count: number };
export type MoodPoint = { date: string; mood: string };
export type CycleHistoryPoint = { startDate: string; length: number };

export type Stats = {
  avgCycleLength: number | null;
  avgPeriodLength: number | null;
  cycleLengthVariance: number | null;
  regularityScore: number | null;
  totalCycles: number;
  cycleHistory: CycleHistoryPoint[];
  topSymptoms: TopSymptom[];
  moodTrend: MoodPoint[];
};

function average(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function variance(values: number[], mean: number): number {
  return values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
}

function regularityFromStdDev(stdDev: number): number {
  return Math.max(0, Math.round(100 - stdDev * 10));
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

export const statsService = {
  async forUser(userId: string): Promise<Stats> {
    const cycles = await prisma.cycle.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
      take: HISTORY_WINDOW,
    });

    const cycleLengths = cycles
      .map((c) => c.cycleLength)
      .filter((v): v is number => typeof v === 'number');
    const periodLengths = cycles
      .map((c) => c.periodLength)
      .filter((v): v is number => typeof v === 'number');

    const avgCycleLength = cycleLengths.length
      ? Math.round(average(cycleLengths) * 10) / 10
      : null;
    const avgPeriodLength = periodLengths.length
      ? Math.round(average(periodLengths) * 10) / 10
      : null;

    const cycleVar =
      cycleLengths.length >= 2
        ? Math.round(variance(cycleLengths, average(cycleLengths)) * 10) / 10
        : null;

    const regularityScore =
      cycleVar !== null ? regularityFromStdDev(Math.sqrt(cycleVar)) : null;

    const cycleHistory: CycleHistoryPoint[] = cycles
      .filter((c) => typeof c.cycleLength === 'number')
      .map((c) => ({
        startDate: c.startDate.toISOString(),
        length: c.cycleLength as number,
      }))
      .reverse();

    const symptomsSince = daysAgo(SYMPTOMS_WINDOW_DAYS);
    const symptoms = await prisma.symptom.groupBy({
      by: ['type'],
      where: {
        date: { gte: symptomsSince },
        entry: { userId },
      },
      _count: { type: true },
      orderBy: { _count: { type: 'desc' } },
      take: 8,
    });

    const topSymptoms: TopSymptom[] = symptoms.map((s) => ({
      type: s.type,
      count: s._count.type,
    }));

    const moodSince = daysAgo(MOOD_WINDOW_DAYS);
    const moodEntries = await prisma.dailyEntry.findMany({
      where: {
        userId,
        date: { gte: moodSince },
        mood: { not: null },
      },
      select: { date: true, mood: true },
      orderBy: { date: 'asc' },
    });

    const moodTrend: MoodPoint[] = moodEntries.map((e) => ({
      date: e.date.toISOString(),
      mood: e.mood as string,
    }));

    return {
      avgCycleLength,
      avgPeriodLength,
      cycleLengthVariance: cycleVar,
      regularityScore,
      totalCycles: cycles.length,
      cycleHistory,
      topSymptoms,
      moodTrend,
    };
  },
};
