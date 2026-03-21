import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EmailDeliveryService } from '../email/email-delivery.service';

@Injectable()
export class AuthEmailService {
  constructor(private readonly emailDeliveryService: EmailDeliveryService) {}

  sendVerificationEmail(params: {
    email: string;
    displayName: string | null;
    token: string;
  }) {
    const appBaseUrl = this.getAppBaseUrl();
    const verificationUrl = `${appBaseUrl}/auth/verify-email?token=${encodeURIComponent(params.token)}`;
    const greeting = params.displayName?.trim() || 'there';

    return this.emailDeliveryService.sendTransactionalEmail({
      to: params.email,
      subject: 'Verify your Mail a Moment account',
      text: [
        `Hi ${greeting},`,
        '',
        'Verify your email to activate your account.',
        verificationUrl,
        '',
        'If you did not create this account, you can ignore this email.',
      ].join('\n'),
      html: [
        `<p>Hi ${this.escapeHtml(greeting)},</p>`,
        '<p>Verify your email to activate your account.</p>',
        `<p><a href="${this.escapeHtml(verificationUrl)}">Verify email</a></p>`,
        '<p>If you did not create this account, you can ignore this email.</p>',
      ].join(''),
      tag: 'auth_verify_email',
    });
  }

  sendPasswordResetEmail(params: {
    email: string;
    displayName: string | null;
    token: string;
  }) {
    const appBaseUrl = this.getAppBaseUrl();
    const resetUrl = `${appBaseUrl}/auth/reset-password?token=${encodeURIComponent(params.token)}`;
    const greeting = params.displayName?.trim() || 'there';

    return this.emailDeliveryService.sendTransactionalEmail({
      to: params.email,
      subject: 'Reset your Mail a Moment password',
      text: [
        `Hi ${greeting},`,
        '',
        'Use the link below to reset your password.',
        resetUrl,
        '',
        'If you did not request a password reset, you can ignore this email.',
      ].join('\n'),
      html: [
        `<p>Hi ${this.escapeHtml(greeting)},</p>`,
        '<p>Use the link below to reset your password.</p>',
        `<p><a href="${this.escapeHtml(resetUrl)}">Reset password</a></p>`,
        '<p>If you did not request a password reset, you can ignore this email.</p>',
      ].join(''),
      tag: 'auth_password_reset',
    });
  }

  private getAppBaseUrl(): string {
    const appBaseUrl = process.env.APP_BASE_URL;
    if (!appBaseUrl) {
      throw new InternalServerErrorException('APP_BASE_URL is required.');
    }

    return appBaseUrl.replace(/\/$/, '');
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}
