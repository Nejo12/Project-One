import { LifecycleEmailService } from '../notifications/lifecycle-email.service';
import { FulfillmentService } from './fulfillment.service';
import { FulfillmentRepository } from './fulfillment.repository';
import { PrintProviderService } from './print-provider.service';

class FulfillmentRepositoryFake {
  appliedStatuses: string[] = [];

  listOrdersPendingSync() {
    return Promise.resolve([
      {
        id: 'order_1',
        userId: 'user_1',
        status: 'FULFILLMENT_PENDING' as const,
        providerName: 'sandbox-print-provider',
        providerOrderReference: 'provider_order_1',
        providerAssetReference: 'provider_asset_1',
        fulfillmentSubmittedAt: new Date('2026-03-21T00:00:00.000Z'),
        providerFulfillmentStatus: 'IN_PRODUCTION' as const,
        shipmentTrackingNumber: null,
        shipmentTrackingUrl: null,
        contactFirstName: 'Mira',
        user: {
          email: 'user@example.com',
          displayName: 'Olaniyi',
          profile: {
            fullName: 'Olaniyi A.',
          },
        },
      },
    ]);
  }

  recordProviderLog() {
    return Promise.resolve();
  }

  applyProviderStatus(params: { providerFulfillmentStatus: string }) {
    this.appliedStatuses.push(params.providerFulfillmentStatus);
    return Promise.resolve();
  }

  markSyncError() {
    return Promise.resolve();
  }
}

class PrintProviderServiceFake {
  syncOrderStatus() {
    return Promise.resolve({
      ok: true as const,
      success: {
        providerName: 'sandbox-print-provider',
        providerFulfillmentStatus: 'SHIPPED' as const,
        requestPayload: {
          orderId: 'order_1',
        },
        responsePayload: {
          status: 'shipped',
        },
        shipmentTrackingNumber: 'track_123',
        shipmentTrackingUrl: 'https://tracking.example.com/track_123',
      },
    });
  }
}

class LifecycleEmailServiceFake {
  shippedCalls: Array<{ orderId: string; recipientEmail: string }> = [];

  sendOrderShippedEmail(params: { orderId: string; recipientEmail: string }) {
    this.shippedCalls.push(params);
    return Promise.resolve();
  }
}

describe('FulfillmentService', () => {
  it('sends an order-shipped lifecycle email when provider status reaches shipped', async () => {
    const repository = new FulfillmentRepositoryFake();
    const lifecycleEmailService = new LifecycleEmailServiceFake();
    const service = new FulfillmentService(
      repository as unknown as FulfillmentRepository,
      new PrintProviderServiceFake() as unknown as PrintProviderService,
      lifecycleEmailService as unknown as LifecycleEmailService,
    );

    const response = await service.syncSubmittedOrders();

    expect(response.updatedOrders).toBe(1);
    expect(repository.appliedStatuses).toContain('SHIPPED');
    expect(lifecycleEmailService.shippedCalls[0]?.orderId).toBe('order_1');
  });
});
