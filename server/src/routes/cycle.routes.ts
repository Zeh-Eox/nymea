import { Router } from 'express';
import { cycleController } from '@controllers/cycle.controller';
import { validate } from '@middlewares/validate.middleware';
import { asyncHandler } from '@utils/async-handler';
import { createCycleSchema, updateCycleSchema } from '@validators/cycle.schema';

export const cycleRoutes = Router();

cycleRoutes.get('/', asyncHandler(cycleController.list));
cycleRoutes.post('/', validate(createCycleSchema), asyncHandler(cycleController.create));
cycleRoutes.put('/:id', validate(updateCycleSchema), asyncHandler(cycleController.update));
cycleRoutes.delete('/:id', asyncHandler(cycleController.remove));
