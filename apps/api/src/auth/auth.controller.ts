import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  LoginResponse,
  MeResponse,
  PasswordResetConfirmResponse,
  PasswordResetRequestResponse,
  SignUpResponse,
  VerifyEmailResponse,
} from './auth.contract';
import { AuthService } from './auth.service';
import {
  parseLoginBody,
  parsePasswordResetConfirmBody,
  parsePasswordResetRequestBody,
  parseSignUpBody,
  parseVerifyEmailBody,
} from './payload-parsers';
import { SessionAuthGuard } from './session-auth.guard';
import type { AuthenticatedRequest } from './session-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() body: unknown): Promise<SignUpResponse> {
    return this.authService.signUp(parseSignUpBody(body));
  }

  @Post('verify-email')
  verifyEmail(@Body() body: unknown): Promise<VerifyEmailResponse> {
    return this.authService.verifyEmail(parseVerifyEmailBody(body));
  }

  @Post('login')
  login(@Body() body: unknown): Promise<LoginResponse> {
    return this.authService.login(parseLoginBody(body));
  }

  @Post('password-reset/request')
  requestPasswordReset(
    @Body() body: unknown,
  ): Promise<PasswordResetRequestResponse> {
    return this.authService.requestPasswordReset(
      parsePasswordResetRequestBody(body),
    );
  }

  @Post('password-reset/confirm')
  confirmPasswordReset(
    @Body() body: unknown,
  ): Promise<PasswordResetConfirmResponse> {
    return this.authService.confirmPasswordReset(
      parsePasswordResetConfirmBody(body),
    );
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  async me(@Req() request: AuthenticatedRequest): Promise<MeResponse> {
    return {
      user: await this.authService.getCurrentUser(request.authUser!),
    };
  }
}
