import { Prisma, OrderStatus, RenderPhotoFit } from '@prisma/client';

export type FulfillmentSubmissionStatusValue =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUBMITTED'
  | 'FAILED';

export type ProviderFulfillmentStatusValue =
  | 'QUEUED'
  | 'IN_PRODUCTION'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'FAILED';

export interface FulfillmentCandidateRecord {
  id: string;
  userId: string;
  status: OrderStatus;
  fulfillmentSubmissionStatus: FulfillmentSubmissionStatusValue;
  fulfillmentAttemptCount: number;
  printableAssetStatus: 'READY' | 'FAILED' | 'PENDING' | 'PROCESSING';
  templateName: string;
  templateSlug: string;
  headline: string;
  message: string;
  contactFirstName: string;
  contactLastName: string;
  occurrenceDate: Date;
  scheduledFor: Date;
  photoFit: RenderPhotoFit | null;
  printableAssetObject: {
    id: string;
    bucket: string;
    objectKey: string;
    contentType: string;
    sizeBytes: number;
  } | null;
  contact: {
    addressLinks: Array<{
      address: {
        line1: string;
        line2: string | null;
        city: string;
        region: string | null;
        postalCode: string;
        countryCode: string;
      };
    }>;
  } | null;
  user: {
    email: string;
    profile: {
      fullName: string | null;
      addressLine1: string | null;
      addressLine2: string | null;
      city: string | null;
      region: string | null;
      postalCode: string | null;
      countryCode: string | null;
    } | null;
  };
}

export interface FulfillmentSyncCandidateRecord {
  id: string;
  userId: string;
  status: OrderStatus;
  providerName: string | null;
  providerOrderReference: string | null;
  providerAssetReference: string | null;
  fulfillmentSubmittedAt: Date | null;
  providerFulfillmentStatus: ProviderFulfillmentStatusValue | null;
  shipmentTrackingNumber: string | null;
  shipmentTrackingUrl: string | null;
}

export interface FulfillmentSubmissionSuccess {
  providerName: string;
  providerOrderReference: string;
  providerAssetReference: string;
  requestPayload: Prisma.InputJsonObject;
  responsePayload: Prisma.InputJsonObject;
}

export type FulfillmentSubmissionFailure = {
  providerName: string;
  requestPayload: Prisma.InputJsonObject;
  responsePayload: Prisma.InputJsonObject;
  errorMessage: string;
  retryable: boolean;
};

export type FulfillmentSubmissionResult =
  | {
      ok: true;
      success: FulfillmentSubmissionSuccess;
    }
  | {
      ok: false;
      failure: FulfillmentSubmissionFailure;
    };

export interface FulfillmentStatusSyncSuccess {
  providerName: string;
  providerFulfillmentStatus: ProviderFulfillmentStatusValue;
  requestPayload: Prisma.InputJsonObject;
  responsePayload: Prisma.InputJsonObject;
  shipmentTrackingNumber: string | null;
  shipmentTrackingUrl: string | null;
}

export type FulfillmentStatusSyncFailure = {
  providerName: string;
  requestPayload: Prisma.InputJsonObject;
  responsePayload: Prisma.InputJsonObject;
  errorMessage: string;
  retryable: boolean;
};

export type FulfillmentStatusSyncResult =
  | {
      ok: true;
      success: FulfillmentStatusSyncSuccess;
    }
  | {
      ok: false;
      failure: FulfillmentStatusSyncFailure;
    };

export interface FulfillmentProviderLogRecord {
  id: string;
  orderId: string;
  userId: string;
  providerName: string;
  requestPayload: Prisma.JsonValue;
  responsePayload: Prisma.JsonValue;
  succeeded: boolean;
  createdAt: Date;
}
