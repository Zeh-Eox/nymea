import { Router } from 'express';
import { prisma } from '@config/prisma';
import { authMiddleware } from '@middlewares/auth.middleware';
import { asyncHandler } from '@utils/async-handler';
import { authRoutes } from './auth.routes';
import { cycleRoutes } from './cycle.routes';
import { entryRoutes } from './entry.routes';
import { onboardingRoutes } from './onboarding.routes';
import { predictionRoutes } from './prediction.routes';
import { pushRoutes } from './push.routes';
import { statsRoutes } from './stats.routes';

export const apiRouter = Router();

apiRouter.get(
  '/health',
  asyncHandler(async (_req, res) => {
    let db: 'up' | 'down' = 'down';
    try {
      await prisma.$queryRaw`SELECT 1`;
      db = 'up';
    } catch {
      db = 'down';
    }
    res.status(db === 'up' ? 200 : 503).json({
      status: db === 'up' ? 'ok' : 'degraded',
      db,
      timestamp: new Date().toISOString(),
    });
  }),
);

apiRouter.use('/auth', authRoutes);
apiRouter.use('/onboarding', authMiddleware, onboardingRoutes);
apiRouter.use('/cycles', authMiddleware, cycleRoutes);
apiRouter.use('/entries', authMiddleware, entryRoutes);
apiRouter.use('/predictions', authMiddleware, predictionRoutes);
apiRouter.use('/stats', authMiddleware, statsRoutes);
apiRouter.use('/push', authMiddleware, pushRoutes);
