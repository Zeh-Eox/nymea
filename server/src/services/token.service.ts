import crypto from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '@config/env';
import { prisma } from '@config/prisma';
import { HttpError } from '@utils/http-error';

export type AccessTokenPayload = {
  userId: string;
  email: string;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

const REFRESH_TOKEN_BYTES = 48;
const REFRESH_TOKEN_DAYS = 30;

function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

function generateOpaqueRefreshToken(): string {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
}

function refreshTokenExpiry(): Date {
  const now = new Date();
  now.setDate(now.getDate() + REFRESH_TOKEN_DAYS);
  return now;
}

export const tokenService = {
  async issueTokenPair(payload: AccessTokenPayload): Promise<TokenPair> {
    const accessToken = signAccessToken(payload);
    const refreshToken = generateOpaqueRefreshToken();

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: payload.userId,
        expiresAt: refreshTokenExpiry(),
      },
    });

    return { accessToken, refreshToken };
  },

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
      return { userId: decoded.userId, email: decoded.email };
    } catch {
      throw HttpError.unauthorized('Invalid or expired access token');
    }
  },

  async rotateRefreshToken(refreshToken: string): Promise<TokenPair & { userId: string }> {
    const existing = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!existing || existing.expiresAt < new Date()) {
      if (existing) {
        await prisma.refreshToken.delete({ where: { id: existing.id } });
      }
      throw HttpError.unauthorized('Invalid or expired refresh token');
    }

    await prisma.refreshToken.delete({ where: { id: existing.id } });

    const pair = await this.issueTokenPair({
      userId: existing.user.id,
      email: existing.user.email,
    });

    return { ...pair, userId: existing.user.id };
  },

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  },

  async revokeAllForUser(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  },
};
