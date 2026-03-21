import { Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../database/prisma.service';
import { BeginEmailNotificationParams } from './notifications.types';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async beginEmailNotification(
    params: BeginEmailNotificationParams,
  ): Promise<boolean> {
    const existing = await this.prisma.emailNotificationEvent.findUnique({
      where: {
        dedupeKey: params.dedupeKey,
      },
      select: {
        deliveryStatus: true,
      },
    });

    if (!existing) {
      try {
        await this.prisma.emailNotificationEvent.create({
          data: {
            dedupeKey: params.dedupeKey,
            kind: params.kind,
            userId: params.userId,
            resourceId: params.resourceId,
            recipientEmail: params.recipientEmail,
          },
        });

        return true;
      } catch (error) {
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          return false;
        }

        throw error;
      }
    }

    if (existing.deliveryStatus !== 'FAILED') {
      return false;
    }

    const result = await this.prisma.emailNotificationEvent.updateMany({
      where: {
        dedupeKey: params.dedupeKey,
        deliveryStatus: 'FAILED',
      },
      data: {
        deliveryStatus: 'PROCESSING',
        lastError: null,
        attemptCount: {
          increment: 1,
        },
      },
    });

    return result.count === 1;
  }

  async markEmailNotificationSent(params: {
    dedupeKey: string;
    providerMessageId: string | null;
  }): Promise<void> {
    await this.prisma.emailNotificationEvent.updateMany({
      where: {
        dedupeKey: params.dedupeKey,
        deliveryStatus: 'PROCESSING',
      },
      data: {
        deliveryStatus: 'SENT',
        providerMessageId: params.providerMessageId,
        lastError: null,
        sentAt: new Date(),
      },
    });
  }

  async markEmailNotificationFailed(params: {
    dedupeKey: string;
    errorMessage: string;
  }): Promise<void> {
    await this.prisma.emailNotificationEvent.updateMany({
      where: {
        dedupeKey: params.dedupeKey,
        deliveryStatus: 'PROCESSING',
      },
      data: {
        deliveryStatus: 'FAILED',
        lastError: params.errorMessage,
      },
    });
  }
}
