import { prisma } from '@config/prisma';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const HISTORY_WINDOW = 6;
const OVULATION_OFFSET = 14;
const FERTILE_HALF_WINDOW = 2;

export type PredictionConfidence = 'high' | 'medium' | 'low';

export type Prediction = {
  nextPeriodStart: string;
  nextPeriodEnd: string;
  ovulation: string;
  fertileStart: string;
  fertileEnd: string;
  cycleLength: number;
  periodLength: number;
  daysUntilNextPeriod: number;
  confidence: PredictionConfidence;
  basedOnCycles: number;
};

function weightedAverage(values: number[]): number {
  if (values.length === 0) return 0;
  let weightedSum = 0;
  let weightTotal = 0;
  values.forEach((value, idx) => {
    const weight = values.length - idx;
    weightedSum += value * weight;
    weightTotal += weight;
  });
  return weightedSum / weightTotal;
}

function stdDev(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const variance =
    values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

function toIsoDay(date: Date): string {
  const utc = new Date(date);
  utc.setUTCHours(0, 0, 0, 0);
  return utc.toISOString();
}

function daysBetween(later: Date, earlier: Date): number {
  return Math.round((later.getTime() - earlier.getTime()) / MS_PER_DAY);
}

export const predictionService = {
  async forUser(userId: string): Promise<Prediction | null> {
    const [user, cycles] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { defaultCycleLength: true, defaultPeriodLength: true },
      }),
      prisma.cycle.findMany({
        where: { userId },
        orderBy: { startDate: 'desc' },
        take: HISTORY_WINDOW + 1,
      }),
    ]);

    if (!user || cycles.length === 0) return null;

    const latest = cycles[0]!;
    const cycleLengths = cycles
      .map((c) => c.cycleLength)
      .filter((v): v is number => typeof v === 'number');
    const periodLengths = cycles
      .map((c) => c.periodLength)
      .filter((v): v is number => typeof v === 'number');

    const avgCycleLength = cycleLengths.length
      ? Math.round(weightedAverage(cycleLengths))
      : user.defaultCycleLength;
    const avgPeriodLength = periodLengths.length
      ? Math.round(weightedAverage(periodLengths))
      : user.defaultPeriodLength;

    const variance = stdDev(cycleLengths, avgCycleLength);
    const confidence: PredictionConfidence =
      cycleLengths.length >= 4 && variance < 3
        ? 'high'
        : cycleLengths.length >= 2
          ? 'medium'
          : 'low';

    const lastStart = new Date(latest.startDate);
    lastStart.setUTCHours(0, 0, 0, 0);
    const nextPeriodStart = addDays(lastStart, avgCycleLength);
    const nextPeriodEnd = addDays(nextPeriodStart, Math.max(0, avgPeriodLength - 1));
    const ovulation = addDays(nextPeriodStart, -OVULATION_OFFSET);
    const fertileStart = addDays(ovulation, -FERTILE_HALF_WINDOW);
    const fertileEnd = addDays(ovulation, FERTILE_HALF_WINDOW);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    return {
      nextPeriodStart: toIsoDay(nextPeriodStart),
      nextPeriodEnd: toIsoDay(nextPeriodEnd),
      ovulation: toIsoDay(ovulation),
      fertileStart: toIsoDay(fertileStart),
      fertileEnd: toIsoDay(fertileEnd),
      cycleLength: avgCycleLength,
      periodLength: avgPeriodLength,
      daysUntilNextPeriod: daysBetween(nextPeriodStart, today),
      confidence,
      basedOnCycles: cycleLengths.length,
    };
  },
};
