import type { Request, Response } from 'express';
import { entryService } from '@services/entry.service';
import { HttpError } from '@utils/http-error';
import {
  listEntriesQuerySchema,
  type UpsertEntryInput,
} from '@validators/entry.schema';

function requireUser(req: Request): string {
  if (!req.user) throw HttpError.unauthorized();
  return req.user.userId;
}

export const entryController = {
  list: async (req: Request, res: Response) => {
    const userId = requireUser(req);
    const query = listEntriesQuerySchema.parse(req.query);
    const entries = await entryService.list(userId, query);
    res.json(entries);
  },

  upsert: async (req: Request, res: Response) => {
    const userId = requireUser(req);
    const entry = await entryService.upsert(userId, req.body as UpsertEntryInput);
    res.status(200).json(entry);
  },
};
