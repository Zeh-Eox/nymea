import { Expo, type ExpoPushMessage, type ExpoPushTicket } from 'expo-server-sdk';
import { prisma } from '@config/prisma';
import { logger } from '@utils/logger';

const expo = new Expo();

export type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

export const pushService = {
  async registerToken(
    userId: string,
    token: string,
    platform: string,
  ): Promise<void> {
    if (!Expo.isExpoPushToken(token)) {
      throw new Error('Invalid Expo push token');
    }
    await prisma.deviceToken.upsert({
      where: { token },
      update: { userId, platform },
      create: { userId, token, platform },
    });
  },

  async unregisterToken(token: string): Promise<void> {
    await prisma.deviceToken.deleteMany({ where: { token } });
  },

  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    const devices = await prisma.deviceToken.findMany({ where: { userId } });
    const messages: ExpoPushMessage[] = devices
      .filter((d) => Expo.isExpoPushToken(d.token))
      .map((d) => ({
        to: d.token,
        title: payload.title,
        body: payload.body,
        data: payload.data,
        sound: 'default',
      }));

    if (messages.length === 0) return;

    const chunks = expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];
    for (const chunk of chunks) {
      try {
        const chunkTickets = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...chunkTickets);
      } catch (err) {
        logger.error({ err }, 'Failed to send push chunk');
      }
    }

    await Promise.all(
      tickets.map(async (ticket, idx) => {
        if (ticket.status === 'error') {
          const code = ticket.details?.error;
          const token = messages[idx]?.to as string | undefined;
          if (token && code === 'DeviceNotRegistered') {
            await pushService.unregisterToken(token);
          }
          logger.warn({ code, token, message: ticket.message }, 'Push ticket error');
        }
      }),
    );
  },
};
