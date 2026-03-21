import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { AuthService } from './auth.service';
import { AuthEmailService } from './auth-email.service';
import { AuthRepository } from './auth.repository';
import { AuthTokenService } from './auth-token.service';
import { PasswordHasher } from './password-hasher';
import { SessionTokenService } from './session-token.service';
import {
  AuthUserRecord,
  CreateUserParams,
  PasswordResetTokenRecord,
  VerificationTokenRecord,
} from './auth.types';

class AuthRepositoryFake {
  userByEmail = new Map<
    string,
    AuthUserRecord & { passwordHash: string | null }
  >();

  verificationToken: VerificationTokenRecord | null = null;
  passwordResetToken: PasswordResetTokenRecord | null = null;

  findUserByEmail(email: string) {
    return Promise.resolve(this.userByEmail.get(email) ?? null);
  }

  findUserById(id: string) {
    for (const user of this.userByEmail.values()) {
      if (user.id === id) {
        return Promise.resolve({
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          status: user.status,
          emailVerifiedAt: user.emailVerifiedAt,
        });
      }
    }

    return Promise.resolve(null);
  }

  createUserWithVerificationToken(
    _params: CreateUserParams,
  ): Promise<AuthUserRecord> {
    return Promise.reject(new Error('not implemented'));
  }

  findVerificationTokenByHash() {
    return Promise.resolve(this.verificationToken);
  }

  consumeVerificationTokenAndActivateUser() {
    const current = this.verificationToken;
    if (!current) {
      return Promise.reject(new Error('verification token missing'));
    }

    current.consumedAt = new Date();
    current.user.status = UserStatus.ACTIVE;
    current.user.emailVerifiedAt = new Date();

    return Promise.resolve({
      id: current.user.id,
      email: current.user.email,
      displayName: current.user.displayName,
      status: current.user.status,
      emailVerifiedAt: current.user.emailVerifiedAt,
    });
  }

  createPasswordResetToken() {
    return Promise.resolve();
  }

  findPasswordResetTokenByHash() {
    return Promise.resolve(this.passwordResetToken);
  }

  consumePasswordResetTokenAndUpdatePassword(
    _tokenId: string,
    userId: string,
    passwordHash: string,
  ) {
    const user = [...this.userByEmail.values()].find(
      (entry) => entry.id === userId,
    );
    if (!user) {
      return Promise.reject(new Error('user missing'));
    }

    user.passwordHash = passwordHash;

    return Promise.resolve({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
    });
  }
}

class AuthEmailServiceFake {
  verificationEmails: Array<{
    email: string;
    displayName: string | null;
    token: string;
  }> = [];

  passwordResetEmails: Array<{
    email: string;
    displayName: string | null;
    token: string;
  }> = [];

  sendVerificationEmail(params: {
    email: string;
    displayName: string | null;
    token: string;
  }) {
    this.verificationEmails.push(params);
    return Promise.resolve({
      delivered: false,
      providerMessageId: null,
    });
  }

  sendPasswordResetEmail(params: {
    email: string;
    displayName: string | null;
    token: string;
  }) {
    this.passwordResetEmails.push(params);
    return Promise.resolve({
      delivered: false,
      providerMessageId: null,
    });
  }
}

describe('AuthService', () => {
  let authService: AuthService;
  let authRepository: AuthRepositoryFake;
  let authEmailService: AuthEmailServiceFake;
  let passwordHasher: PasswordHasher;
  let authTokenService: AuthTokenService;
  let sessionTokenService: SessionTokenService;

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret';

    authRepository = new AuthRepositoryFake();
    authEmailService = new AuthEmailServiceFake();
    passwordHasher = new PasswordHasher();
    authTokenService = new AuthTokenService();
    sessionTokenService = new SessionTokenService();
    authService = new AuthService(
      authRepository as unknown as AuthRepository,
      passwordHasher,
      authTokenService,
      sessionTokenService,
      authEmailService as unknown as AuthEmailService,
    );

    const passwordHash = await passwordHasher.hash('correct horse battery');
    const pendingUser = {
      id: 'user_1',
      email: 'user@example.com',
      displayName: 'Pending User',
      status: UserStatus.PENDING_VERIFICATION,
      emailVerifiedAt: null,
      passwordHash,
    };

    authRepository.userByEmail.set(pendingUser.email, pendingUser);
    authRepository.verificationToken = {
      id: 'verify_1',
      userId: pendingUser.id,
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: null,
      user: pendingUser,
    };
    authRepository.passwordResetToken = {
      id: 'reset_1',
      userId: pendingUser.id,
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: null,
      user: pendingUser,
    };
  });

  it('blocks login before email verification', async () => {
    await expect(
      authService.login({
        email: 'user@example.com',
        password: 'correct horse battery',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('sends a verification email after signup', async () => {
    const createdUsers = authRepository.userByEmail;
    authRepository.createUserWithVerificationToken = ({
      email,
      passwordHash,
      verificationExpiresAt,
      displayName,
    }: CreateUserParams) => {
      const newUser = {
        id: 'user_signup',
        email,
        displayName,
        status: UserStatus.PENDING_VERIFICATION,
        emailVerifiedAt: null,
        passwordHash,
      };

      createdUsers.set(email, newUser);
      authRepository.verificationToken = {
        id: 'verify_signup',
        userId: newUser.id,
        expiresAt: verificationExpiresAt,
        consumedAt: null,
        user: newUser,
      };

      return Promise.resolve({
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        status: newUser.status,
        emailVerifiedAt: newUser.emailVerifiedAt,
      });
    };

    const response = await authService.signUp({
      email: 'signup@example.com',
      password: 'strong password 123',
      displayName: 'Signup User',
    });

    expect(response.user.email).toBe('signup@example.com');
    expect(authEmailService.verificationEmails).toHaveLength(1);
    expect(authEmailService.verificationEmails[0]?.email).toBe(
      'signup@example.com',
    );
    expect(authEmailService.verificationEmails[0]?.token).toHaveLength(43);
  });

  it('activates the user during email verification and returns a session', async () => {
    const response = await authService.verifyEmail({
      token: 'dev-token-preview',
    });

    expect(response.user.status).toBe(UserStatus.ACTIVE);
    expect(response.user.emailVerifiedAt).not.toBeNull();
    expect(response.session.tokenType).toBe('Bearer');
  });

  it('logs in an active verified user', async () => {
    const currentUser = authRepository.userByEmail.get('user@example.com');
    if (!currentUser) {
      throw new Error('expected test user');
    }

    currentUser.status = UserStatus.ACTIVE;
    currentUser.emailVerifiedAt = new Date();

    const response = await authService.login({
      email: 'user@example.com',
      password: 'correct horse battery',
    });

    expect(response.user.email).toBe('user@example.com');
    expect(response.session.accessToken).toContain('.');
  });

  it('rejects invalid password reset tokens', async () => {
    authRepository.passwordResetToken = null;

    await expect(
      authService.confirmPasswordReset({
        token: 'missing-token',
        newPassword: 'updated horse battery',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('sends a password reset email for active verified users', async () => {
    const currentUser = authRepository.userByEmail.get('user@example.com');
    if (!currentUser) {
      throw new Error('expected test user');
    }

    currentUser.status = UserStatus.ACTIVE;
    currentUser.emailVerifiedAt = new Date();

    const response = await authService.requestPasswordReset({
      email: 'user@example.com',
    });

    expect(response.accepted).toBe(true);
    expect(authEmailService.passwordResetEmails).toHaveLength(1);
    expect(authEmailService.passwordResetEmails[0]?.email).toBe(
      'user@example.com',
    );
    expect(authEmailService.passwordResetEmails[0]?.token).toHaveLength(43);
  });
});
