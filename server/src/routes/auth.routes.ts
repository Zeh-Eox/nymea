import { Router } from 'express';
import { authController } from '@controllers/auth.controller';
import { authMiddleware } from '@middlewares/auth.middleware';
import { validate } from '@middlewares/validate.middleware';
import { asyncHandler } from '@utils/async-handler';
import {
  changePasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  updateMeSchema,
} from '@validators/auth.schema';

export const authRoutes = Router();

authRoutes.post('/register', validate(registerSchema), asyncHandler(authController.register));
authRoutes.post('/login', validate(loginSchema), asyncHandler(authController.login));
authRoutes.post('/refresh', validate(refreshSchema), asyncHandler(authController.refresh));
authRoutes.post('/logout', validate(refreshSchema), asyncHandler(authController.logout));
authRoutes.get('/me', authMiddleware, asyncHandler(authController.me));
authRoutes.put(
  '/me',
  authMiddleware,
  validate(updateMeSchema),
  asyncHandler(authController.updateMe),
);
authRoutes.put(
  '/me/password',
  authMiddleware,
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword),
);
authRoutes.delete('/me', authMiddleware, asyncHandler(authController.deleteMe));
