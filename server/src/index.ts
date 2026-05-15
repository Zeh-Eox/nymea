import "dotenv/config";
import { createApp } from "./app";
import { env } from "@config/env";
import { prisma } from "@config/prisma";
import { startNotificationScheduler } from "@services/notification.scheduler";
import { logger } from "@utils/logger";

const app = createApp();
startNotificationScheduler();

const server = app.listen(env.PORT, "0.0.0.0", () => {
  logger.info(`Nymea API listening on port ${env.PORT} (${env.NODE_ENV})`);
});

const shutdown = (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info("HTTP server + Prisma closed");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
