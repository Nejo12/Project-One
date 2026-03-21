import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  FulfillmentCandidateRecord,
  FulfillmentSubmissionResult,
  ProviderFulfillmentStatusValue,
  FulfillmentStatusSyncResult,
  FulfillmentSyncCandidateRecord,
} from './fulfillment.types';

type ProviderAddressSnapshot = {
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postalCode: string;
  countryCode: string;
};

@Injectable()
export class PrintProviderService {
  submitOrder(
    order: FulfillmentCandidateRecord,
  ): Promise<FulfillmentSubmissionResult> {
    const providerMode = process.env.PRINT_PROVIDER_MODE ?? 'sandbox';
    if (providerMode !== 'sandbox') {
      return Promise.resolve({
        ok: false,
        failure: {
          providerName: providerMode,
          requestPayload: {},
          responsePayload: {},
          errorMessage: `Unsupported print provider mode "${providerMode}".`,
          retryable: false,
        },
      });
    }

    if (!order.printableAssetObject) {
      return Promise.resolve({
        ok: false,
        failure: {
          providerName: 'sandbox-print-provider',
          requestPayload: {},
          responsePayload: {},
          errorMessage: 'Printable asset metadata is missing.',
          retryable: false,
        },
      });
    }

    const recipient = this.buildRecipientAddress(order);
    const sender = this.buildSenderAddress(order);
    if (!recipient || !sender) {
      return Promise.resolve({
        ok: false,
        failure: {
          providerName: 'sandbox-print-provider',
          requestPayload: {},
          responsePayload: {},
          errorMessage:
            'Order is missing the sender profile or the contact primary address required for provider submission.',
          retryable: false,
        },
      });
    }

    const providerOrderReference = `sandbox_ord_${randomUUID()}`;
    const providerAssetReference = `sandbox_asset_${randomUUID()}`;
    const requestPayload = {
      orderId: order.id,
      templateSlug: order.templateSlug,
      recipient: this.redactAddress(recipient),
      sender: this.redactAddress(sender),
      asset: {
        objectId: order.printableAssetObject.id,
        bucket: order.printableAssetObject.bucket,
        objectKey: order.printableAssetObject.objectKey,
        contentType: order.printableAssetObject.contentType,
        sizeBytes: order.printableAssetObject.sizeBytes,
      },
      shipping: {
        occasionDate: order.occurrenceDate.toISOString(),
        scheduledFor: order.scheduledFor.toISOString(),
      },
    } satisfies Record<string, unknown>;
    const responsePayload = {
      accepted: true,
      providerOrderReference,
      providerAssetReference,
      status: 'queued',
    } satisfies Record<string, unknown>;

    return Promise.resolve({
      ok: true,
      success: {
        providerName: 'sandbox-print-provider',
        providerOrderReference,
        providerAssetReference,
        requestPayload,
        responsePayload,
      },
    });
  }

  syncOrderStatus(
    order: FulfillmentSyncCandidateRecord,
  ): Promise<FulfillmentStatusSyncResult> {
    const providerMode = process.env.PRINT_PROVIDER_MODE ?? 'sandbox';
    if (providerMode !== 'sandbox') {
      return Promise.resolve({
        ok: false,
        failure: {
          providerName: providerMode,
          requestPayload: {},
          responsePayload: {},
          errorMessage: `Unsupported print provider mode "${providerMode}".`,
          retryable: false,
        },
      });
    }

    if (!order.providerOrderReference || !order.fulfillmentSubmittedAt) {
      return Promise.resolve({
        ok: false,
        failure: {
          providerName: order.providerName ?? 'sandbox-print-provider',
          requestPayload: {},
          responsePayload: {},
          errorMessage:
            'Submitted order is missing provider references required for fulfillment sync.',
          retryable: false,
        },
      });
    }

    const elapsedMs = Date.now() - order.fulfillmentSubmittedAt.getTime();
    const shipmentTrackingNumber =
      elapsedMs >= 30_000 ? `sandbox_track_${order.id}` : null;
    const shipmentTrackingUrl = shipmentTrackingNumber
      ? `https://tracking.sandbox.print/${shipmentTrackingNumber}`
      : null;
    const providerFulfillmentStatus = this.resolveSandboxStatus(elapsedMs);
    const requestPayload = {
      orderId: order.id,
      providerOrderReference: order.providerOrderReference,
      providerAssetReference: order.providerAssetReference,
    } satisfies Record<string, unknown>;
    const responsePayload = {
      providerOrderReference: order.providerOrderReference,
      status: providerFulfillmentStatus,
      shipmentTrackingNumber,
      shipmentTrackingUrl,
    } satisfies Record<string, unknown>;

    return Promise.resolve({
      ok: true,
      success: {
        providerName: order.providerName ?? 'sandbox-print-provider',
        providerFulfillmentStatus,
        requestPayload,
        responsePayload,
        shipmentTrackingNumber,
        shipmentTrackingUrl,
      },
    });
  }

  private buildRecipientAddress(
    order: FulfillmentCandidateRecord,
  ): ProviderAddressSnapshot | null {
    const primaryAddress = order.contact?.addressLinks[0]?.address;
    if (!primaryAddress) {
      return null;
    }

    return {
      fullName: `${order.contactFirstName} ${order.contactLastName}`.trim(),
      line1: primaryAddress.line1,
      line2: primaryAddress.line2,
      city: primaryAddress.city,
      region: primaryAddress.region,
      postalCode: primaryAddress.postalCode,
      countryCode: primaryAddress.countryCode,
    };
  }

  private buildSenderAddress(
    order: FulfillmentCandidateRecord,
  ): ProviderAddressSnapshot | null {
    const profile = order.user.profile;
    if (
      !profile?.fullName ||
      !profile.addressLine1 ||
      !profile.city ||
      !profile.postalCode ||
      !profile.countryCode
    ) {
      return null;
    }

    return {
      fullName: profile.fullName,
      line1: profile.addressLine1,
      line2: profile.addressLine2,
      city: profile.city,
      region: profile.region,
      postalCode: profile.postalCode,
      countryCode: profile.countryCode,
    };
  }

  private redactAddress(
    address: ProviderAddressSnapshot,
  ): Record<string, string> {
    return {
      fullName: address.fullName,
      city: address.city,
      region: address.region ?? '',
      postalCode: address.postalCode,
      countryCode: address.countryCode,
    };
  }

  private resolveSandboxStatus(
    elapsedMs: number,
  ): ProviderFulfillmentStatusValue {
    if (elapsedMs < 15_000) {
      return 'QUEUED';
    }

    if (elapsedMs < 30_000) {
      return 'IN_PRODUCTION';
    }

    if (elapsedMs < 45_000) {
      return 'SHIPPED';
    }

    return 'DELIVERED';
  }
}
