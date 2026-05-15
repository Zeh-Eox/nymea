import type { Request, Response } from 'express';
import { prisma } from '@config/prisma';
import { pushService } from '@services/push.service';
import { HttpError } from '@utils/http-error';
import type {
  RegisterPushInput,
  UpdatePushSettingsInput,
} from '@validators/push.schema';

function requireUser(req: Request): string {
  if (!req.user) throw HttpError.unauthorized();
  return req.user.userId;
}

export const pushController = {
  register: async (req: Request, res: Response) => {
    const userId = requireUser(req);
    const { token, platform } = req.body as RegisterPushInput;
    await pushService.registerToken(userId, token, platform);
    res.status(204).send();
  },

  unregister: async (req: Request, res: Response) => {
    requireUser(req);
    const { token } = req.body as { token: string };
    if (!token) throw HttpError.badRequest('Missing token');
    await pushService.unregisterToken(token);
    res.status(204).send();
  },

  getSettings: async (req: Request, res: Response) => {
    const userId = requireUser(req);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        remindPeriod: true,
        remindOvulation: true,
        remindJournal: true,
      },
    });
    if (!user) throw HttpError.notFound('User not found');
    res.json(user);
  },

  updateSettings: async (req: Request, res: Response) => {
    const userId = requireUser(req);
    const data = req.body as UpdatePushSettingsInput;
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        remindPeriod: true,
        remindOvulation: true,
        remindJournal: true,
      },
    });
    res.json(user);
  },
};
