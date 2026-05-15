import { Router } from 'express';
import { statsController } from '@controllers/stats.controller';
import { asyncHandler } from '@utils/async-handler';

export const statsRoutes = Router();
statsRoutes.get('/', asyncHandler(statsController.get));
