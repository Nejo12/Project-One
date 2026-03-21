import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import {
  FulfillmentCandidateRecord,
  FulfillmentProviderLogRecord,
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
        lastFulfillmentError: params.errorMessage,
      },
    });
  }
}
