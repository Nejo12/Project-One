import { Injectable, Logger } from '@nestjs/common';
import { EmailDeliveryService } from '../email/email-delivery.service';
import { NotificationsRepository } from './notifications.repository';

interface DraftReadyEmailParams {
  userId: string;
  draftId: string;
  recipientEmail: string;
  recipientName: string | null;
  contactFirstName: string;
  templateName: string;
  occurrenceDate: Date;
}

interface PaymentRequiredEmailParams {
  userId: string;
  orderId: string;
  recipientEmail: string;
  recipientName: string | null;
  contactFirstName: string;
  templateName: string;
  totalCents: number | null;
  currency: string | null;
}

interface OrderShippedEmailParams {
  userId: string;
  orderId: string;
  recipientEmail: string;
  recipientName: string | null;
  contactFirstName: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
}

@Injectable()
export class LifecycleEmailService {
  private readonly logger = new Logger(LifecycleEmailService.name);

  constructor(
    private readonly emailDeliveryService: EmailDeliveryService,
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async sendDraftReadyEmail(params: DraftReadyEmailParams): Promise<void> {
    const reviewUrl = `${this.getAppBaseUrl()}/moments`;
    const occurrenceLabel = params.occurrenceDate.toISOString().slice(0, 10);

    await this.sendOnce({
      dedupeKey: `draft_ready:${params.draftId}`,
      kind: 'DRAFT_READY',
      userId: params.userId,
      resourceId: params.draftId,
      recipientEmail: params.recipientEmail,
      subject: `Your ${params.templateName} draft is ready for review`,
      text: [
        `Hi ${this.resolveGreeting(params.recipientName)},`,
        '',
        `Your draft for ${params.contactFirstName} is ready for review.`,
        `Occasion date: ${occurrenceLabel}`,
        `Review it here: ${reviewUrl}`,
      ].join('\n'),
      html: [
        `<p>Hi ${this.escapeHtml(this.resolveGreeting(params.recipientName))},</p>`,
        `<p>Your draft for ${this.escapeHtml(params.contactFirstName)} is ready for review.</p>`,
        `<p>Occasion date: ${this.escapeHtml(occurrenceLabel)}</p>`,
        `<p><a href="${this.escapeHtml(reviewUrl)}">Review your draft</a></p>`,
      ].join(''),
      tag: 'lifecycle_draft_ready',
    });
  }

  async sendPaymentRequiredEmail(
    params: PaymentRequiredEmailParams,
  ): Promise<void> {
    const orderUrl = `${this.getAppBaseUrl()}/moments?orderId=${encodeURIComponent(params.orderId)}`;
    const amountLabel = this.formatAmount(params.totalCents, params.currency);

    await this.sendOnce({
      dedupeKey: `payment_required:${params.orderId}`,
      kind: 'PAYMENT_REQUIRED',
      userId: params.userId,
      resourceId: params.orderId,
      recipientEmail: params.recipientEmail,
      subject: `Payment required for ${params.contactFirstName}'s order`,
      text: [
        `Hi ${this.resolveGreeting(params.recipientName)},`,
        '',
        `Your ${params.templateName} order for ${params.contactFirstName} is ready for checkout.`,
        amountLabel ? `Estimated total: ${amountLabel}` : null,
        `Complete payment here: ${orderUrl}`,
      ]
        .filter((line): line is string => Boolean(line))
        .join('\n'),
      html: [
        `<p>Hi ${this.escapeHtml(this.resolveGreeting(params.recipientName))},</p>`,
        `<p>Your ${this.escapeHtml(params.templateName)} order for ${this.escapeHtml(params.contactFirstName)} is ready for checkout.</p>`,
        amountLabel
          ? `<p>Estimated total: ${this.escapeHtml(amountLabel)}</p>`
          : '',
        `<p><a href="${this.escapeHtml(orderUrl)}">Complete payment</a></p>`,
      ].join(''),
      tag: 'lifecycle_payment_required',
    });
  }

  async sendOrderShippedEmail(params: OrderShippedEmailParams): Promise<void> {
    const ordersUrl = `${this.getAppBaseUrl()}/moments?orderId=${encodeURIComponent(params.orderId)}`;

    await this.sendOnce({
      dedupeKey: `order_shipped:${params.orderId}`,
      kind: 'ORDER_SHIPPED',
      userId: params.userId,
      resourceId: params.orderId,
      recipientEmail: params.recipientEmail,
      subject: `Your order for ${params.contactFirstName} has shipped`,
      text: [
        `Hi ${this.resolveGreeting(params.recipientName)},`,
        '',
        `Your order for ${params.contactFirstName} has shipped.`,
        params.trackingNumber
          ? `Tracking number: ${params.trackingNumber}`
          : null,
        params.trackingUrl ? `Track it here: ${params.trackingUrl}` : null,
        `Order details: ${ordersUrl}`,
      ]
        .filter((line): line is string => Boolean(line))
        .join('\n'),
      html: [
        `<p>Hi ${this.escapeHtml(this.resolveGreeting(params.recipientName))},</p>`,
        `<p>Your order for ${this.escapeHtml(params.contactFirstName)} has shipped.</p>`,
        params.trackingNumber
          ? `<p>Tracking number: ${this.escapeHtml(params.trackingNumber)}</p>`
          : '',
        params.trackingUrl
          ? `<p><a href="${this.escapeHtml(params.trackingUrl)}">Track your shipment</a></p>`
          : '',
        `<p><a href="${this.escapeHtml(ordersUrl)}">View order details</a></p>`,
      ].join(''),
      tag: 'lifecycle_order_shipped',
    });
  }

  private async sendOnce(params: {
    dedupeKey: string;
    kind: 'DRAFT_READY' | 'PAYMENT_REQUIRED' | 'ORDER_SHIPPED';
    userId: string;
    resourceId: string;
    recipientEmail: string;
    subject: string;
    html: string;
    text: string;
    tag: string;
  }): Promise<void> {
    const claimed = await this.notificationsRepository.beginEmailNotification({
      dedupeKey: params.dedupeKey,
      kind: params.kind,
      userId: params.userId,
      resourceId: params.resourceId,
      recipientEmail: params.recipientEmail,
    });

    if (!claimed) {
      return;
    }

    try {
      const result = await this.emailDeliveryService.sendTransactionalEmail({
        to: params.recipientEmail,
        subject: params.subject,
        html: params.html,
        text: params.text,
        tag: params.tag,
      });

      await this.notificationsRepository.markEmailNotificationSent({
        dedupeKey: params.dedupeKey,
        providerMessageId: result.providerMessageId,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Lifecycle email delivery failed.';

      await this.notificationsRepository.markEmailNotificationFailed({
        dedupeKey: params.dedupeKey,
        errorMessage: message,
      });
      this.logger.error(
        `Failed to deliver lifecycle email ${params.tag} for ${params.resourceId}: ${message}`,
      );
    }
  }

  private getAppBaseUrl(): string {
    const appBaseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3000';
    return appBaseUrl.replace(/\/$/, '');
  }

  private resolveGreeting(name: string | null): string {
    const normalized = name?.trim();
    if (normalized) {
      return normalized;
    }

    return 'there';
  }

  private formatAmount(
    totalCents: number | null,
    currency: string | null,
  ): string | null {
    if (totalCents === null || !currency) {
      return null;
    }

    return `${currency} ${(totalCents / 100).toFixed(2)}`;
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
