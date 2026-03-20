import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { AuthSessionView, AuthUserView } from './auth.contract';
import { AuthSessionPayload } from './auth.types';

const ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
const JWT_ISSUER = 'project-one-api';

@Injectable()
export class SessionTokenService {
  issueAccessToken(user: AuthUserView): AuthSessionView {
    const now = Math.floor(Date.now() / 1000);
    const expiresAtSeconds = now + ACCESS_TOKEN_TTL_SECONDS;
    const payload: AuthSessionPayload = {
      sub: user.id,
      email: user.email,
      status: UserStatus.ACTIVE,
      type: 'access',
      iss: JWT_ISSUER,
      iat: now,
      exp: expiresAtSeconds,
    };

    return {
      accessToken: this.sign(payload),
      tokenType: 'Bearer',
      expiresAt: new Date(expiresAtSeconds * 1000).toISOString(),
    };
  }

  verifyAccessToken(token: string): AuthSessionPayload {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !encodedSignature) {
      throw new UnauthorizedException('Invalid access token.');
    }

    const signedContent = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = this.signValue(signedContent);
    const providedSignature = Buffer.from(encodedSignature, 'base64url');

    if (
      expectedSignature.length !== providedSignature.length ||
      !timingSafeEqual(expectedSignature, providedSignature)
    ) {
      throw new UnauthorizedException('Invalid access token.');
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as Partial<AuthSessionPayload>;

    if (
      payload.type !== 'access' ||
      payload.iss !== JWT_ISSUER ||
      payload.status !== UserStatus.ACTIVE ||
      !payload.sub ||
      !payload.email ||
      typeof payload.exp !== 'number' ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      throw new UnauthorizedException('Invalid access token.');
    }

    return payload as AuthSessionPayload;
  }

  private sign(payload: AuthSessionPayload): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
      'base64url',
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );
    const signedContent = `${encodedHeader}.${encodedPayload}`;
    const signature = this.signValue(signedContent).toString('base64url');
    return `${signedContent}.${signature}`;
  }

  private signValue(value: string): Buffer {
    return createHmac('sha256', this.getSecret()).update(value).digest();
  }

  private getSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (secret) {
      return secret;
    }

    if (process.env.NODE_ENV === 'test') {
      return 'test-local-jwt-secret';
    }

    throw new InternalServerErrorException('JWT_SECRET is required.');
  }
}
