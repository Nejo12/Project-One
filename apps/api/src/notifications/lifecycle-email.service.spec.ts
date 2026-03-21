import { LifecycleEmailService } from './lifecycle-email.service';
import { NotificationsRepository } from './notifications.repository';
import { EmailDeliveryService } from '../email/email-delivery.service';

class NotificationsRepositoryFake {
  beginResults = [true];
  markedSent: Array<{ dedupeKey: string; providerMessageId: string | null }> =
    [];
  markedFailed: Array<{ dedupeKey: string; errorMessage: string }> = [];

  beginEmailNotification() {
    return Promise.resolve(this.beginResults.shift() ?? true);
  }

  markEmailNotificationSent(params: {
    dedupeKey: string;
    providerMessageId: string | null;
  }) {
    this.markedSent.push(params);
    return Promise.resolve();
  }

  markEmailNotificationFailed(params: {
    dedupeKey: string;
    errorMessage: string;
  }) {
    this.markedFailed.push(params);
    return Promise.resolve();
  }
}

class EmailDeliveryServiceFake {
  sentMessages: Array<{ tag: string; to: string; subject: string }> = [];
  shouldFail = false;

  sendTransactionalEmail(params: {
    to: string;
    subject: string;
    html: string;
    text: string;
    tag: string;
  }) {
    if (this.shouldFail) {
      return Promise.reject(new Error('provider offline'));
    }

    this.sentMessages.push({
      tag: params.tag,
      to: params.to,
      subject: params.subject,
    });

    return Promise.resolve({
      delivered: true,
      providerMessageId: 'email_123',
    });
  }
}

describe('LifecycleEmailService', () => {
  let repository: NotificationsRepositoryFake;
  let emailDelivery: EmailDeliveryServiceFake;
  let service: LifecycleEmailService;

  beforeEach(() => {
    process.env.APP_BASE_URL = 'https://mailamoment.com';
    repository = new NotificationsRepositoryFake();
    emailDelivery = new EmailDeliveryServiceFake();
    service = new LifecycleEmailService(
      emailDelivery as unknown as EmailDeliveryService,
      repository as unknown as NotificationsRepository,
    );
  });

  it('sends a draft-ready lifecycle email once', async () => {
    await service.sendDraftReadyEmail({
      userId: 'user_1',
      draftId: 'draft_1',
      recipientEmail: 'user@example.com',
      recipientName: 'Olaniyi',
      contactFirstName: 'Mira',
      templateName: 'Birthday Bloom',
      occurrenceDate: new Date('2099-04-16T00:00:00.000Z'),
    });

    expect(emailDelivery.sentMessages).toHaveLength(1);
    expect(emailDelivery.sentMessages[0]?.tag).toBe('lifecycle_draft_ready');
    expect(repository.markedSent[0]?.dedupeKey).toBe('draft_ready:draft_1');
  });

  it('skips delivery when the dedupe key is already claimed', async () => {
    repository.beginResults = [false];

    await service.sendPaymentRequiredEmail({
      userId: 'user_1',
      orderId: 'order_1',
      recipientEmail: 'user@example.com',
      recipientName: 'Olaniyi',
      contactFirstName: 'Mira',
      templateName: 'Birthday Bloom',
      totalCents: 1299,
      currency: 'EUR',
    });

    expect(emailDelivery.sentMessages).toHaveLength(0);
    expect(repository.markedSent).toHaveLength(0);
  });

  it('records failure when the provider send fails', async () => {
    emailDelivery.shouldFail = true;

    await service.sendOrderShippedEmail({
      userId: 'user_1',
      orderId: 'order_1',
      recipientEmail: 'user@example.com',
      recipientName: 'Olaniyi',
      contactFirstName: 'Mira',
      trackingNumber: 'track_123',
      trackingUrl: 'https://tracking.example.com/track_123',
    });

    expect(repository.markedFailed[0]?.dedupeKey).toBe('order_shipped:order_1');
    expect(repository.markedFailed[0]?.errorMessage).toBe('provider offline');
  });
});
