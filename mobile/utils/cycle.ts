import type { Cycle } from '@/types/index';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function daysSince(isoDate: string, ref: Date = new Date()): number {
  const start = new Date(isoDate);
  const refUtc = Date.UTC(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  return Math.round((refUtc - startUtc) / MS_PER_DAY);
}

export type CurrentCycleState =
  | { kind: 'none' }
  | { kind: 'in-period'; cycle: Cycle; dayOfPeriod: number }
  | { kind: 'between'; cycle: Cycle; dayOfCycle: number };

export function getCurrentCycleState(cycles: Cycle[]): CurrentCycleState {
  if (cycles.length === 0) return { kind: 'none' };
  const latest = cycles[0]!;

  if (!latest.endDate) {
    return {
      kind: 'in-period',
      cycle: latest,
      dayOfPeriod: daysSince(latest.startDate) + 1,
    };
  }

  return {
    kind: 'between',
    cycle: latest,
    dayOfCycle: daysSince(latest.startDate) + 1,
  };
}

const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

export function formatLongDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]?.slice(0, 3) ?? ''}`;
}

export function todayIso(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}
