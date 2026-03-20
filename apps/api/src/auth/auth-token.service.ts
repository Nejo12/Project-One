import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';

interface GeneratedToken {
  token: string;
  tokenHash: string;
  expiresAt: Date;
}

@Injectable()
export class AuthTokenService {
  generateEmailVerificationToken(now: Date): GeneratedToken {
    return this.generateToken(now, 24 * 60 * 60 * 1000);
  }

  generatePasswordResetToken(now: Date): GeneratedToken {
    return this.generateToken(now, 2 * 60 * 60 * 1000);
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private generateToken(now: Date, ttlMs: number): GeneratedToken {
    const token = randomBytes(32).toString('base64url');

    return {
      token,
      tokenHash: this.hashToken(token),
      expiresAt: new Date(now.getTime() + ttlMs),
    };
  }
}
