import { Router } from 'express';
import { entryController } from '@controllers/entry.controller';
import { validate } from '@middlewares/validate.middleware';
import { asyncHandler } from '@utils/async-handler';
import { upsertEntrySchema } from '@validators/entry.schema';

export const entryRoutes = Router();
entryRoutes.get('/', asyncHandler(entryController.list));
entryRoutes.post('/', validate(upsertEntrySchema), asyncHandler(entryController.upsert));
