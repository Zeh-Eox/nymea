import type { Request, Response } from 'express';
import { predictionService } from '@services/prediction.service';
import { HttpError } from '@utils/http-error';

export const predictionController = {
  get: async (req: Request, res: Response) => {
    if (!req.user) throw HttpError.unauthorized();
    const prediction = await predictionService.forUser(req.user.userId);
    if (!prediction) {
      res.status(204).send();
      return;
    }
    res.json(prediction);
  },
};
