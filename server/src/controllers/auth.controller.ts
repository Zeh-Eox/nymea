import type { Request, Response } from 'express';
import { authService } from '@services/auth.service';
import { HttpError } from '@utils/http-error';
import type {
  ChangePasswordInput,
  LoginInput,
  RefreshInput,
  RegisterInput,
  UpdateMeInput,
} from '@validators/auth.schema';

export const authController = {
  register: async (req: Request, res: Response) => {
    const payload = req.body as RegisterInput;
    const result = await authService.register(payload);
    res.status(201).json(result);
  },

  login: async (req: Request, res: Response) => {
    const payload = req.body as LoginInput;
    const result = await authService.login(payload);
    res.json(result);
  },

  me: async (req: Request, res: Response) => {
    if (!req.user) {
      throw HttpError.unauthorized();
    }
    const user = await authService.getMe(req.user.userId);
    res.json(user);
  },

  refresh: async (req: Request, res: Response) => {
    const { refreshToken } = req.body as RefreshInput;
    const result = await authService.refresh(refreshToken);
    res.json(result);
  },

  logout: async (req: Request, res: Response) => {
    const { refreshToken } = req.body as RefreshInput;
    await authService.logout(refreshToken);
    res.status(204).send();
  },

  updateMe: async (req: Request, res: Response) => {
    if (!req.user) throw HttpError.unauthorized();
    const payload = req.body as UpdateMeInput;
    const user = await authService.updateMe(req.user.userId, payload);
    res.json(user);
  },

  changePassword: async (req: Request, res: Response) => {
    if (!req.user) throw HttpError.unauthorized();
    const { currentPassword, newPassword } = req.body as ChangePasswordInput;
    await authService.changePassword(req.user.userId, currentPassword, newPassword);
    res.status(204).send();
  },

  deleteMe: async (req: Request, res: Response) => {
    if (!req.user) throw HttpError.unauthorized();
    await authService.deleteMe(req.user.userId);
    res.status(204).send();
  },
};
