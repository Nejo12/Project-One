import { User } from '@prisma/client';

export type AuthUserRecord = Pick<
  User,
  'id' | 'email' | 'displayName' | 'status' | 'emailVerifiedAt'
>;

export interface VerificationTokenRecord {
  id: string;
  userId: string;
  expiresAt: Date;
  consumedAt: Date | null;
  user: AuthUserRecord & {
    passwordHash: string | null;
  };
}

export interface PasswordResetTokenRecord {
  id: string;
  userId: string;
  expiresAt: Date;
  consumedAt: Date | null;
  user: AuthUserRecord & {
    passwordHash: string | null;
  };
}

export interface CreateUserParams {
  email: string;
  passwordHash: string;
  displayName: string | null;
  verificationTokenHash: string;
  verificationExpiresAt: Date;
}

export interface CreatePasswordResetTokenParams {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface AuthSessionPayload {
  sub: string;
  email: string;
  status: 'ACTIVE';
  type: 'access';
  iss: string;
  iat: number;
  exp: number;
}
