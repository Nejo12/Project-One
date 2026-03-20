import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import {
  AuthSessionView,
  AuthUserView,
  LoginRequestBody,
  PasswordResetConfirmRequestBody,
  PasswordResetRequestBody,
  PasswordResetRequestResponse,
  SignUpRequestBody,
  SignUpResponse,
  VerifyEmailRequestBody,
} from './auth.contract';
import { AuthRepository } from './auth.repository';
import { AuthTokenService } from './auth-token.service';
import { PasswordHasher } from './password-hasher';
import { SessionTokenService } from './session-token.service';
import { AuthSessionPayload, AuthUserRecord } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly authTokenService: AuthTokenService,
    private readonly sessionTokenService: SessionTokenService,
  ) {}

  async signUp(input: SignUpRequestBody): Promise<SignUpResponse> {
    const existingUser = await this.authRepository.findUserByEmail(input.email);
    if (existingUser) {
      throw new ConflictException('An account with this email already exists.');
    }

    const now = new Date();
    const passwordHash = await this.passwordHasher.hash(input.password);
    const verification =
      this.authTokenService.generateEmailVerificationToken(now);
    const user = await this.authRepository.createUserWithVerificationToken({
      email: input.email,
      passwordHash,
      displayName: input.displayName?.trim() ?? null,
      verificationTokenHash: verification.tokenHash,
      verificationExpiresAt: verification.expiresAt,
    });

    const response: SignUpResponse = {
      user: this.toAuthUserView(user),
      nextStep: 'verify_email',
    };

    if (this.shouldExposeTokenPreview()) {
      response.verification = {
        token: verification.token,
        expiresAt: verification.expiresAt.toISOString(),
      };
    }

    return response;
  }

  async verifyEmail(input: VerifyEmailRequestBody): Promise<{
    user: AuthUserView;
    session: AuthSessionView;
  }> {
    const token = await this.authRepository.findVerificationTokenByHash(
      this.authTokenService.hashToken(input.token),
    );
    const now = new Date();

    if (!token || token.consumedAt || token.expiresAt <= now) {
      throw new UnauthorizedException(
        'Verification token is invalid or expired.',
      );
    }

    const user =
      await this.authRepository.consumeVerificationTokenAndActivateUser(
        token.id,
        token.userId,
        now,
      );
    const userView = this.toAuthUserView(user);

    return {
      user: userView,
      session: this.sessionTokenService.issueAccessToken(userView),
    };
  }

  async login(input: LoginRequestBody): Promise<{
    user: AuthUserView;
    session: AuthSessionView;
  }> {
    const user = await this.authRepository.findUserByEmail(input.email);
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isValidPassword = await this.passwordHasher.verify(
      input.password,
      user.passwordHash,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.status !== UserStatus.ACTIVE || user.emailVerifiedAt === null) {
      throw new ForbiddenException(
        'Email verification is required before login.',
      );
    }

    const userView = this.toAuthUserView(user);
    return {
      user: userView,
      session: this.sessionTokenService.issueAccessToken(userView),
    };
  }

  async requestPasswordReset(
    input: PasswordResetRequestBody,
  ): Promise<PasswordResetRequestResponse> {
    const user = await this.authRepository.findUserByEmail(input.email);
    if (
      !user ||
      !user.passwordHash ||
      user.status !== UserStatus.ACTIVE ||
      user.emailVerifiedAt === null
    ) {
      return { accepted: true };
    }

    const now = new Date();
    const reset = this.authTokenService.generatePasswordResetToken(now);
    await this.authRepository.createPasswordResetToken({
      userId: user.id,
      tokenHash: reset.tokenHash,
      expiresAt: reset.expiresAt,
    });

    if (!this.shouldExposeTokenPreview()) {
      return { accepted: true };
    }

    return {
      accepted: true,
      reset: {
        token: reset.token,
        expiresAt: reset.expiresAt.toISOString(),
      },
    };
  }

  async confirmPasswordReset(input: PasswordResetConfirmRequestBody): Promise<{
    user: AuthUserView;
    session: AuthSessionView;
  }> {
    const token = await this.authRepository.findPasswordResetTokenByHash(
      this.authTokenService.hashToken(input.token),
    );
    const now = new Date();

    if (!token || token.consumedAt || token.expiresAt <= now) {
      throw new UnauthorizedException(
        'Password reset token is invalid or expired.',
      );
    }

    if (
      token.user.status !== UserStatus.ACTIVE ||
      token.user.emailVerifiedAt === null
    ) {
      throw new ForbiddenException(
        'Only active verified users can reset passwords.',
      );
    }

    const passwordHash = await this.passwordHasher.hash(input.newPassword);
    const user =
      await this.authRepository.consumePasswordResetTokenAndUpdatePassword(
        token.id,
        token.userId,
        passwordHash,
        now,
      );
    const userView = this.toAuthUserView(user);

    return {
      user: userView,
      session: this.sessionTokenService.issueAccessToken(userView),
    };
  }

  async getCurrentUser(session: AuthSessionPayload): Promise<AuthUserView> {
    const user = await this.authRepository.findUserById(session.sub);
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Session user is no longer available.');
    }

    return this.toAuthUserView(user);
  }

  private toAuthUserView(user: AuthUserRecord): AuthUserView {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
    };
  }

  private shouldExposeTokenPreview(): boolean {
    return process.env.NODE_ENV !== 'production';
  }
}
