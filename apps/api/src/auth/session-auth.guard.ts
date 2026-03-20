import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SessionTokenService } from './session-token.service';
import { AuthSessionPayload } from './auth.types';

export type AuthenticatedRequest = Request & {
  authUser?: AuthSessionPayload;
};

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly sessionTokenService: SessionTokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Authorization header is required.');
    }

    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Authorization header must use Bearer.');
    }

    request.authUser = this.sessionTokenService.verifyAccessToken(token);
    return true;
  }
}
