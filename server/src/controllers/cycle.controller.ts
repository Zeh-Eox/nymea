import type { Request, Response } from 'express';
import { cycleService } from '@services/cycle.service';
import { HttpError } from '@utils/http-error';
import type { CreateCycleInput, UpdateCycleInput } from '@validators/cycle.schema';

function requireUser(req: Request): string {
  if (!req.user) throw HttpError.unauthorized();
  return req.user.userId;
}

export const cycleController = {
  list: async (req: Request, res: Response) => {
    const userId = requireUser(req);
    const limit = Math.min(Number(req.query.limit ?? 12), 50);
    const cycles = await cycleService.list(userId, limit);
    res.json(cycles);
  },

  create: async (req: Request, res: Response) => {
    const userId = requireUser(req);
    const cycle = await cycleService.create(userId, req.body as CreateCycleInput);
    res.status(201).json(cycle);
  },

  update: async (req: Request, res: Response) => {
    const userId = requireUser(req);
    const cycleId = req.params.id as string | undefined;
    if (!cycleId) throw HttpError.badRequest('Missing cycle id');
    const cycle = await cycleService.update(userId, cycleId, req.body as UpdateCycleInput);
    res.json(cycle);
  },

  remove: async (req: Request, res: Response) => {
    const userId = requireUser(req);
    const cycleId = req.params.id as string | undefined;
    if (!cycleId) throw HttpError.badRequest('Missing cycle id');
    await cycleService.remove(userId, cycleId);
    res.status(204).send();
  },
};
