import type { Cycle } from '@/types/index';
import type { CyclePhase } from '@/theme/tokens';
import type { Prediction } from '@/services/prediction.service';
import { diffDayKeys, toDateKey } from '@/utils/date';

export type PhaseInfo = {
  phase: CyclePhase;
  cycle: Cycle;
  dayOfCycle: number;
  cycleLength: number;
};

function effectiveLength(cycle: Cycle, fallback: number): number {
  return cycle.cycleLength ?? fallback;
}

function effectivePeriodLength(cycle: Cycle, fallback: number): number {
  return cycle.periodLength ?? fallback;
}

export function resolvePhase(
  cycles: Cycle[],
  dateKey: string,
  defaults: { cycleLength: number; periodLength: number },
): PhaseInfo | null {
  if (cycles.length === 0) return null;

  const target = cycles.find((c) => {
    const start = toDateKey(c.startDate);
    if (dateKey < start) return false;
    const len = effectiveLength(c, defaults.cycleLength);
    return diffDayKeys(dateKey, start) < len;
  });

  if (!target) return null;

  const start = toDateKey(target.startDate);
  const dayOfCycle = diffDayKeys(dateKey, start) + 1;
  const cycleLength = effectiveLength(target, defaults.cycleLength);
  const periodLength = effectivePeriodLength(target, defaults.periodLength);
  const ovulation = cycleLength - 14;

  let phase: CyclePhase;
  if (dayOfCycle <= periodLength) {
    phase = 'menstrual';
  } else if (dayOfCycle >= ovulation - 2 && dayOfCycle <= ovulation + 2) {
    phase = 'ovulation';
  } else if (dayOfCycle < ovulation - 2) {
    phase = 'follicular';
  } else {
    phase = 'luteal';
  }

  return { phase, cycle: target, dayOfCycle, cycleLength };
}

export type DayPhaseState = {
  phase: CyclePhase | null;
  predicted: boolean;
};

export function resolveDayState(
  cycles: Cycle[],
  prediction: Prediction | null,
  dateKey: string,
  defaults: { cycleLength: number; periodLength: number },
): DayPhaseState {
  const actual = resolvePhase(cycles, dateKey, defaults);
  if (actual) return { phase: actual.phase, predicted: false };

  if (!prediction) return { phase: null, predicted: false };

  const periodStart = toDateKey(prediction.nextPeriodStart);
  const periodEnd = toDateKey(prediction.nextPeriodEnd);
  const ovulation = toDateKey(prediction.ovulation);
  const fertileStart = toDateKey(prediction.fertileStart);
  const fertileEnd = toDateKey(prediction.fertileEnd);

  if (dateKey >= periodStart && dateKey <= periodEnd) {
    return { phase: 'menstrual', predicted: true };
  }
  if (dateKey === ovulation) {
    return { phase: 'ovulation', predicted: true };
  }
  if (dateKey >= fertileStart && dateKey <= fertileEnd) {
    return { phase: 'ovulation', predicted: true };
  }
  return { phase: null, predicted: false };
}

export const PHASE_LABEL: Record<CyclePhase, string> = {
  menstrual: 'Règles',
  follicular: 'Folliculaire',
  ovulation: 'Ovulation',
  luteal: 'Lutéale',
};
