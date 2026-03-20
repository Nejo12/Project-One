import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  AuthUserRecord,
  CreatePasswordResetTokenParams,
  CreateUserParams,
  PasswordResetTokenRecord,
  VerificationTokenRecord,
} from './auth.types';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(
    email: string,
  ): Promise<(AuthUserRecord & { passwordHash: string | null }) | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        displayName: true,
        status: true,
        emailVerifiedAt: true,
        passwordHash: true,
      },
    });
  }

  async findUserById(id: string): Promise<AuthUserRecord | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        displayName: true,
        status: true,
        emailVerifiedAt: true,
      },
    });
  }

  async createUserWithVerificationToken(
    params: CreateUserParams,
  ): Promise<AuthUserRecord> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: params.email,
          passwordHash: params.passwordHash,
          displayName: params.displayName,
          verificationTokens: {
            create: {
              tokenHash: params.verificationTokenHash,
              expiresAt: params.verificationExpiresAt,
            },
          },
        },
        select: {
          id: true,
          email: true,
          displayName: true,
          status: true,
          emailVerifiedAt: true,
        },
      });

      return user;
    });
  }

  async findVerificationTokenByHash(
    tokenHash: string,
  ): Promise<VerificationTokenRecord | null> {
    return this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        consumedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            status: true,
            emailVerifiedAt: true,
            passwordHash: true,
          },
        },
      },
    });
  }

  async consumeVerificationTokenAndActivateUser(
    tokenId: string,
    userId: string,
    verifiedAt: Date,
  ): Promise<AuthUserRecord> {
    return this.prisma.$transaction(async (tx) => {
      await tx.emailVerificationToken.update({
        where: { id: tokenId },
        data: { consumedAt: verifiedAt },
      });

      const user = await tx.user.update({
        where: { id: userId },
        data: {
          status: 'ACTIVE',
          emailVerifiedAt: verifiedAt,
        },
        select: {
          id: true,
          email: true,
          displayName: true,
          status: true,
          emailVerifiedAt: true,
        },
      });

      return user;
    });
  }

  async createPasswordResetToken(
    params: CreatePasswordResetTokenParams,
  ): Promise<void> {
    await this.prisma.passwordResetToken.create({
      data: {
        userId: params.userId,
        tokenHash: params.tokenHash,
        expiresAt: params.expiresAt,
      },
    });
  }

  async findPasswordResetTokenByHash(
    tokenHash: string,
  ): Promise<PasswordResetTokenRecord | null> {
    return this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        consumedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            status: true,
            emailVerifiedAt: true,
            passwordHash: true,
          },
        },
      },
    });
  }

  async consumePasswordResetTokenAndUpdatePassword(
    tokenId: string,
    userId: string,
    passwordHash: string,
    updatedAt: Date,
  ): Promise<AuthUserRecord> {
    return this.prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.update({
        where: { id: tokenId },
        data: { consumedAt: updatedAt },
      });

      const user = await tx.user.update({
        where: { id: userId },
        data: { passwordHash },
        select: {
          id: true,
          email: true,
          displayName: true,
          status: true,
          emailVerifiedAt: true,
        },
      });

      return user;
    });
  }
}
