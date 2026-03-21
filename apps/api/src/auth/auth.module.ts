import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { AuthController } from './auth.controller';
import { AuthEmailService } from './auth-email.service';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { AuthTokenService } from './auth-token.service';
import { PasswordHasher } from './password-hasher';
import { SessionAuthGuard } from './session-auth.guard';
import { SessionTokenService } from './session-token.service';

@Module({
  imports: [EmailModule],
  controllers: [AuthController],
  providers: [
    AuthRepository,
    AuthEmailService,
    AuthService,
    AuthTokenService,
    PasswordHasher,
    SessionTokenService,
    SessionAuthGuard,
  ],
  exports: [SessionTokenService, SessionAuthGuard],
})
export class AuthModule {}
