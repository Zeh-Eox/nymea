import type { DailyEntry, Symptom } from '@prisma/client';
import { prisma } from '@config/prisma';
import type {
  ListEntriesQuery,
  UpsertEntryInput,
} from '@validators/entry.schema';

export type EntryWithSymptoms = DailyEntry & { symptoms: Symptom[] };

function parseDay(value: string): Date {
  const iso = value.length === 10 ? `${value}T00:00:00.000Z` : value;
  const date = new Date(iso);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function defaultRange(): { from: Date; to: Date } {
  const to = new Date();
  to.setUTCHours(0, 0, 0, 0);
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 29);
  return { from, to };
}

export const entryService = {
  async list(userId: string, query: ListEntriesQuery): Promise<EntryWithSymptoms[]> {
    const { from, to } = (() => {
      if (query.from && query.to) {
        return { from: parseDay(query.from), to: parseDay(query.to) };
      }
      const d = defaultRange();
      return {
        from: query.from ? parseDay(query.from) : d.from,
        to: query.to ? parseDay(query.to) : d.to,
      };
    })();

    return prisma.dailyEntry.findMany({
      where: { userId, date: { gte: from, lte: to } },
      orderBy: { date: 'desc' },
      include: { symptoms: true },
    });
  },

  async getByDate(userId: string, date: string): Promise<EntryWithSymptoms | null> {
    return prisma.dailyEntry.findUnique({
      where: { userId_date: { userId, date: parseDay(date) } },
      include: { symptoms: true },
    });
  },

  async upsert(userId: string, input: UpsertEntryInput): Promise<EntryWithSymptoms> {
    const date = parseDay(input.date);
    const symptoms = input.symptoms ?? [];

    const data = {
      mood: input.mood ?? null,
      sleep: input.sleep ?? null,
      hydration: input.hydration ?? null,
      libido: input.libido ?? null,
      weight: input.weight ?? null,
    };

    return prisma.$transaction(async (tx) => {
      const entry = await tx.dailyEntry.upsert({
        where: { userId_date: { userId, date } },
        create: { userId, date, ...data },
        update: data,
      });

      if (input.symptoms !== undefined) {
        await tx.symptom.deleteMany({ where: { entryId: entry.id } });
        if (symptoms.length > 0) {
          await tx.symptom.createMany({
            data: symptoms.map((s) => ({
              entryId: entry.id,
              type: s.type,
              intensity: s.intensity,
              date,
            })),
          });
        }
      }

      return tx.dailyEntry.findUniqueOrThrow({
        where: { id: entry.id },
        include: { symptoms: true },
      });
    });
  },
};
