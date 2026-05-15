import type { Cycle } from '@prisma/client';
import { prisma } from '@config/prisma';
import { HttpError } from '@utils/http-error';
import type { CreateCycleInput, UpdateCycleInput } from '@validators/cycle.schema';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MAX_REASONABLE_CYCLE = 90;

function daysBetween(later: Date, earlier: Date): number {
  return Math.round((later.getTime() - earlier.getTime()) / MS_PER_DAY);
}

async function assertOwned(userId: string, cycleId: string): Promise<Cycle> {
  const cycle = await prisma.cycle.findUnique({ where: { id: cycleId } });
  if (!cycle || cycle.userId !== userId) {
    throw HttpError.notFound('Cycle not found');
  }
  return cycle;
}

export const cycleService = {
  async list(userId: string, limit = 12): Promise<Cycle[]> {
    return prisma.cycle.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
      take: limit,
    });
  },

  async getCurrent(userId: string): Promise<Cycle | null> {
    return prisma.cycle.findFirst({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });
  },

  async create(userId: string, input: CreateCycleInput): Promise<Cycle> {
    const startDate = new Date(input.startDate);
    const endDate = input.endDate ? new Date(input.endDate) : null;

    const previous = await prisma.cycle.findFirst({
      where: { userId, startDate: { lt: startDate } },
      orderBy: { startDate: 'desc' },
    });

    return prisma.$transaction(async (tx) => {
      const periodLength =
        input.periodLength ??
        (endDate ? daysBetween(endDate, startDate) + 1 : null);

      const created = await tx.cycle.create({
        data: {
          userId,
          startDate,
          endDate,
          periodLength,
          cycleLength: input.cycleLength ?? null,
        },
      });

      if (previous) {
        const length = daysBetween(startDate, previous.startDate);
        if (length > 0 && length < MAX_REASONABLE_CYCLE) {
          await tx.cycle.update({
            where: { id: previous.id },
            data: { cycleLength: length },
          });
        }
      }

      return created;
    });
  },

  async update(
    userId: string,
    cycleId: string,
    input: UpdateCycleInput,
  ): Promise<Cycle> {
    const existing = await assertOwned(userId, cycleId);

    const startDate = input.startDate ? new Date(input.startDate) : existing.startDate;
    const endDate =
      input.endDate === undefined
        ? existing.endDate
        : input.endDate === null
          ? null
          : new Date(input.endDate);

    let periodLength = input.periodLength ?? existing.periodLength;
    if (input.periodLength === undefined && endDate && !existing.periodLength) {
      periodLength = daysBetween(endDate, startDate) + 1;
    }

    return prisma.cycle.update({
      where: { id: cycleId },
      data: {
        startDate,
        endDate,
        periodLength,
        cycleLength: input.cycleLength ?? existing.cycleLength,
      },
    });
  },

  async remove(userId: string, cycleId: string): Promise<void> {
    await assertOwned(userId, cycleId);
    await prisma.cycle.delete({ where: { id: cycleId } });
  },
};
