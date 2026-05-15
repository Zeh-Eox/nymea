import type { Request, Response } from 'express';
import { statsService } from '@services/stats.service';
import { HttpError } from '@utils/http-error';

export const statsController = {
  get: async (req: Request, res: Response) => {
    if (!req.user) throw HttpError.unauthorized();
    const stats = await statsService.forUser(req.user.userId);
    res.json(stats);
  },
};
