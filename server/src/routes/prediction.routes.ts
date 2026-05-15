import { Router } from 'express';
import { predictionController } from '@controllers/prediction.controller';
import { asyncHandler } from '@utils/async-handler';

export const predictionRoutes = Router();
predictionRoutes.get('/', asyncHandler(predictionController.get));
