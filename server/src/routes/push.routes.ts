import { Router } from 'express';
import { pushController } from '@controllers/push.controller';
import { validate } from '@middlewares/validate.middleware';
import { asyncHandler } from '@utils/async-handler';
import {
  registerPushSchema,
  updatePushSettingsSchema,
} from '@validators/push.schema';

export const pushRoutes = Router();
pushRoutes.post(
  '/register',
  validate(registerPushSchema),
  asyncHandler(pushController.register),
);
pushRoutes.post('/unregister', asyncHandler(pushController.unregister));
pushRoutes.get('/settings', asyncHandler(pushController.getSettings));
pushRoutes.put(
  '/settings',
  validate(updatePushSettingsSchema),
  asyncHandler(pushController.updateSettings),
);
