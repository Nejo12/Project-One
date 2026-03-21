import { EmailNotificationKind, EmailNotificationStatus } from '@prisma/client';

export interface BeginEmailNotificationParams {
  dedupeKey: string;
  kind: EmailNotificationKind;
  userId: string;
  resourceId: string;
  recipientEmail: string;
}

export interface EmailNotificationEventRecord {
  id: string;
  userId: string;
  kind: EmailNotificationKind;
  dedupeKey: string;
  resourceId: string;
  recipientEmail: string;
  deliveryStatus: EmailNotificationStatus;
  providerMessageId: string | null;
  lastError: string | null;
  attemptCount: number;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
