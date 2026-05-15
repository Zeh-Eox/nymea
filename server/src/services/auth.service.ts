import bcrypt from 'bcrypt';
import type { User } from '@prisma/client';
import { env } from '@config/env';
import { prisma } from '@config/prisma';
import { HttpError } from '@utils/http-error';
import { tokenService, type TokenPair } from './token.service';

export type PublicUser = {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  onboardedAt: string | null;
  defaultCycleLength: number;
  defaultPeriodLength: number;
};

type RegisterArgs = { email: string; password: string; name?: string };
type LoginArgs = { email: string; password: string };
type AuthResult = { user: PublicUser; tokens: TokenPair };

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    onboardedAt: user.onboardedAt?.toISOString() ?? null,
    defaultCycleLength: user.defaultCycleLength,
    defaultPeriodLength: user.defaultPeriodLength,
  };
}

export const authService = {
  async register({ email, password, name }: RegisterArgs): Promise<AuthResult> {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw HttpError.conflict('Email already registered');
    }

    const hashed = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
    const user = await prisma.user.create({
      data: { email, password: hashed, name: name ?? null },
    });

    const tokens = await tokenService.issueTokenPair({ userId: user.id, email: user.email });
    return { user: toPublicUser(user), tokens };
  },

  async login({ email, password }: LoginArgs): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw HttpError.unauthorized('Invalid credentials');
    }

    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      throw HttpError.unauthorized('Invalid credentials');
    }

    const tokens = await tokenService.issueTokenPair({ userId: user.id, email: user.email });
    return { user: toPublicUser(user), tokens };
  },

  async getMe(userId: string): Promise<PublicUser> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw HttpError.unauthorized('User no longer exists');
    }
    return toPublicUser(user);
  },

  async refresh(refreshToken: string): Promise<AuthResult> {
    const { accessToken, refreshToken: nextRefresh, userId } =
      await tokenService.rotateRefreshToken(refreshToken);
    const user = await this.getMe(userId);
    return { user, tokens: { accessToken, refreshToken: nextRefresh } };
  },

  async logout(refreshToken: string): Promise<void> {
    await tokenService.revokeRefreshToken(refreshToken);
  },

  async updateMe(
    userId: string,
    input: {
      name?: string | null;
      defaultCycleLength?: number;
      defaultPeriodLength?: number;
    },
  ): Promise<PublicUser> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: input,
    });
    return toPublicUser(user);
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw HttpError.unauthorized('User no longer exists');

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) throw HttpError.badRequest('Mot de passe actuel incorrect');

    const hashed = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
    await prisma.refreshToken.deleteMany({ where: { userId } });
  },

  async deleteMe(userId: string): Promise<void> {
    await prisma.user.delete({ where: { id: userId } });
  },
};
