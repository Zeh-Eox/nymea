import type { NextFunction, Request, Response } from 'express';
import { tokenService, type AccessTokenPayload } from '@services/token.service';
import { HttpError } from '@utils/http-error';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(HttpError.unauthorized('Missing or malformed Authorization header'));
  }

  const token = header.slice('Bearer '.length);
  try {
    req.user = tokenService.verifyAccessToken(token);
    next();
  } catch (err) {
    next(err);
  }
}
