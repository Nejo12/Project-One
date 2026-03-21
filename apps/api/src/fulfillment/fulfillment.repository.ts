import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import {
  FulfillmentCandidateRecord,
  FulfillmentProviderLogRecord,
  FulfillmentSyncCandidateRecord,
  ProviderFulfillmentStatusValue,
} from './fulfillment.types';

const fulfillmentCandidateSelect = {
  id: true,
  userId: true,
  status: true,
  fulfillmentSubmissionStatus: true,
  fulfillmentAttemptCount: true,
  printableAssetStatus: true,
  templateName: true,
  templateSlug: true,
  headline: true,
  message: true,
  contactFirstName: true,
  contactLastName: true,
  occurrenceDate: true,
  scheduledFor: true,
  photoFit: true,
  printableAssetObject: {
    select: {
      id: true,
      bucket: true,
      objectKey: true,
      contentType: true,
      sizeBytes: true,
    },
  },
  contact: {
    select: {
      addressLinks: {
        where: {
          kind: 'PRIMARY',
        },
        take: 1,
        select: {
          address: {
            select: {
              line1: true,
              line2: true,
              city: true,
              region: true,
              postalCode: true,
              countryCode: true,
            },
          },
        },
      },
    },
  },
  user: {
    select: {
      email: true,
      profile: {
        select: {
          fullName: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          region: true,
          postalCode: true,
          countryCode: true,
        },
      },
    },
  },
} satisfies Prisma.OrderSelect;

const fulfillmentSyncSelect = {
  id: true,
  userId: true,
  status: true,
  providerName: true,
  providerOrderReference: true,
  providerAssetReference: true,
  fulfillmentSubmittedAt: true,
  providerFulfillmentStatus: true,
  shipmentTrackingNumber: true,
  shipmentTrackingUrl: true,
  contactFirstName: true,
  user: {
    select: {
      email: true,
      displayName: true,
      profile: {
        select: {
          fullName: true,
        },
      },
    },
  },
} satisfies Prisma.OrderSelect;

@Injectable()
export class FulfillmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  listOrdersPendingSubmission(
    limit: number,
  ): Promise<FulfillmentCandidateRecord[]> {
    return this.prisma.order.findMany({
      where: {
        status: 'PAID',
        printableAssetStatus: 'READY',
        fulfillmentSubmissionStatus: {
          in: ['PENDING', 'FAILED'],
        },
      },
      orderBy: [{ paidAt: 'asc' }, { createdAt: 'asc' }],
      take: limit,
      select: fulfillmentCandidateSelect,
    }) as Promise<FulfillmentCandidateRecord[]>;
  }

  async claimOrderForSubmission(orderId: string): Promise<boolean> {
    const result = await this.prisma.order.updateMany({
      where: {
        id: orderId,
        status: 'PAID',
        printableAssetStatus: 'READY',
        fulfillmentSubmissionStatus: {
          in: ['PENDING', 'FAILED'],
        },
      },
      data: {
        fulfillmentSubmissionStatus: 'PROCESSING',
        fulfillmentAttemptCount: {
          increment: 1,
        },
        lastFulfillmentError: null,
      },
    });

    return result.count === 1;
  }

  async recordProviderLog(params: {
    orderId: string;
    userId: string;
    providerName: string;
    requestPayload: Prisma.InputJsonObject;
    responsePayload: Prisma.InputJsonObject;
    succeeded: boolean;
  }): Promise<FulfillmentProviderLogRecord> {
    const prismaClient: PrismaClient = this.prisma;

    return await prismaClient.fulfillmentProviderLog.create({
      data: params,
      select: {
        id: true,
        orderId: true,
        userId: true,
        providerName: true,
        requestPayload: true,
        responsePayload: true,
        succeeded: true,
        createdAt: true,
      },
    });
  }

  async markSubmitted(params: {
    orderId: string;
    providerName: string;
    providerOrderReference: string;
    providerAssetReference: string;
  }): Promise<void> {
    await this.prisma.order.updateMany({
      where: {
        id: params.orderId,
        fulfillmentSubmissionStatus: 'PROCESSING',
      },
      data: {
        status: 'FULFILLMENT_PENDING',
        fulfillmentSubmissionStatus: 'SUBMITTED',
        fulfillmentSubmittedAt: new Date(),
        providerFulfillmentStatus: 'QUEUED',
        fulfillmentStatusSyncedAt: new Date(),
        providerName: params.providerName,
        providerOrderReference: params.providerOrderReference,
        providerAssetReference: params.providerAssetReference,
        lastFulfillmentError: null,
      },
    });
  }

  async markFailed(params: {
    orderId: string;
    errorMessage: string;
  }): Promise<void> {
    await this.prisma.order.updateMany({
      where: {
        id: params.orderId,
        fulfillmentSubmissionStatus: 'PROCESSING',
      },
      data: {
        fulfillmentSubmissionStatus: 'FAILED',
        providerFulfillmentStatus: 'FAILED',
        fulfillmentStatusSyncedAt: new Date(),
        lastFulfillmentError: params.errorMessage,
      },
    });
  }

  listOrdersPendingSync(
    limit: number,
  ): Promise<FulfillmentSyncCandidateRecord[]> {
    return this.prisma.order.findMany({
      where: {
        status: 'FULFILLMENT_PENDING',
        fulfillmentSubmissionStatus: 'SUBMITTED',
      },
      orderBy: [{ fulfillmentSubmittedAt: 'asc' }, { createdAt: 'asc' }],
      take: limit,
      select: fulfillmentSyncSelect,
    }) as Promise<FulfillmentSyncCandidateRecord[]>;
  }

  async applyProviderStatus(params: {
    orderId: string;
    providerFulfillmentStatus: ProviderFulfillmentStatusValue;
    shipmentTrackingNumber: string | null;
    shipmentTrackingUrl: string | null;
    errorMessage?: string | null;
  }): Promise<void> {
    const baseData = {
      providerFulfillmentStatus: params.providerFulfillmentStatus,
      fulfillmentStatusSyncedAt: new Date(),
      shipmentTrackingNumber: params.shipmentTrackingNumber,
      shipmentTrackingUrl: params.shipmentTrackingUrl,
    };

    if (params.providerFulfillmentStatus === 'DELIVERED') {
      await this.prisma.order.updateMany({
        where: {
          id: params.orderId,
          fulfillmentSubmissionStatus: 'SUBMITTED',
        },
        data: {
          ...baseData,
          status: 'FULFILLED',
          deliveredAt: new Date(),
          lastFulfillmentError: null,
        },
      });
      return;
    }

    if (params.providerFulfillmentStatus === 'FAILED') {
      await this.prisma.order.updateMany({
        where: {
          id: params.orderId,
          fulfillmentSubmissionStatus: 'SUBMITTED',
        },
        data: {
          ...baseData,
          status: 'FULFILLMENT_FAILED',
          fulfillmentSubmissionStatus: 'FAILED',
          lastFulfillmentError:
            params.errorMessage ??
            'Print provider reported a fulfillment failure.',
        },
      });
      return;
    }

    await this.prisma.order.updateMany({
      where: {
        id: params.orderId,
        fulfillmentSubmissionStatus: 'SUBMITTED',
      },
      data: {
        ...baseData,
        status: 'FULFILLMENT_PENDING',
        lastFulfillmentError: null,
      },
    });
  }

  async markSyncError(params: {
    orderId: string;
    errorMessage: string;
  }): Promise<void> {
    await this.prisma.order.updateMany({
      where: {
        id: params.orderId,
        fulfillmentSubmissionStatus: 'SUBMITTED',
      },
      data: {
        fulfillmentStatusSyncedAt: new Date(),
        lastFulfillmentError: params.errorMessage,
      },
    });
  }
}
